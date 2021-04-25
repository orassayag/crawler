const { CommonEmailAddressDomainModel, EmailAddressesResultModel, EmailAddressStatusModel } = require('../../core/models/application');
const { GoalTypeEnum, LogStatusEnum, SaveStatusEnum, SourceTypeEnum } = require('../../core/enums');
const { emailAddressDomainsList, filterEmailAddressDomains, filterEmailAddresses } = require('../../configurations');
let { commonEmailAddressDomainsList } = require('../../configurations');
const emailAddressValidationService = require('./emailAddressValidation.service');
const logService = require('./log.service');
const mongoDatabaseService = require('./mongoDatabase.service');
const sourceService = require('./source.service');
const { emailAddressUtils, textUtils, validationUtils } = require('../../utils');

class CrawlEmailAddressService {

	constructor() {
		this.totalSaveCount = 0;
		this.goalValue = 0;
		this.isSkipLogic = null;
		this.countLimitDataModel = null;
	}

	initiate(data) {
		const { applicationDataModel, countLimitDataModel } = data;
		this.goalValue = applicationDataModel.goalType === GoalTypeEnum.EMAIL_ADDRESSES ? applicationDataModel.goalValue : null;
		this.isSkipLogic = applicationDataModel.isSkipLogic;
		this.countLimitDataModel = countLimitDataModel;
		// Initiate the common email address domains lists.
		this.initiateCommonEmailAddressDomains();
	}

	initiateCommonEmailAddressDomains() {
		// Set the commonEmailAddressDomains list.
		for (let i = 0, length = emailAddressDomainsList.length; i < length; i++) {
			const { domain, domainName, micromatchName, ignoreList, isCommonDomain } = emailAddressDomainsList[i];
			if (isCommonDomain) {
				commonEmailAddressDomainsList.push(new CommonEmailAddressDomainModel({
					domain: domain,
					flipDomain: textUtils.flipDotParts(domain),
					domainName: domainName,
					firstDotSplit: textUtils.getSplitDotParts(domain)[0],
					micromatchName: micromatchName,
					ignoreList: ignoreList
				}));
			}
		}
		commonEmailAddressDomainsList = textUtils.removeDuplicates(commonEmailAddressDomainsList);
	}

	checkGoalComplete() {
		return this.goalValue ? this.goalValue === this.totalSaveCount : false;
	}

	getEmailAddressesFromPage(data) {
		return new Promise(async (resolve, reject) => {
			if (reject) { }
			// Limit the runtime of this function in case of a stuck URL crawling process.
			const abortTimeout = setTimeout(() => {
				resolve(null);
				return;
			}, this.countLimitDataModel.millisecondsTimeoutSourceRequestCount);
			const { linkData, totalSaveCount } = data;
			this.totalSaveCount = totalSaveCount;
			let emailAddressesResultModel = new EmailAddressesResultModel();
			if (this.checkGoalComplete()) {
				clearTimeout(abortTimeout);
				resolve(emailAddressesResultModel);
				return;
			}
			// Get the source of the specific link to fetch from it's email addresses.
			const pageResults = await sourceService.getPageSource({
				sourceType: SourceTypeEnum.PAGE,
				searchEngineName: null,
				linkData: linkData
			});
			if (!pageResults) {
				clearTimeout(abortTimeout);
				resolve(emailAddressesResultModel);
				return;
			}
			const { isValidPage, pageSource } = pageResults;
			if (!isValidPage) {
				await logService.logErrorLink(linkData.link);
			}
			emailAddressesResultModel.isValidPage = isValidPage;
			// Get all the email addresses from the page source.
			let emailAddressesList = emailAddressUtils.getEmailAddresses(pageSource);
			if (!validationUtils.isExists(emailAddressesList)) {
				clearTimeout(abortTimeout);
				resolve(emailAddressesResultModel);
				return;
			}
			emailAddressesResultModel.totalCount = emailAddressesList.length;
			// Remove duplicate email addresses.
			emailAddressesList = textUtils.removeDuplicates(emailAddressesList);
			if (this.isSkipLogic) {
				// Skip email addresses with a domain that repeats itself too many times.
				const skipResults = emailAddressValidationService.skipDomains({
					emailAddressesList: emailAddressesList,
					maximumUniqueDomainCount: this.countLimitDataModel.maximumUniqueDomainCount
				});
				emailAddressesResultModel.skipCount = skipResults.skipCount;
				emailAddressesList = skipResults.emailAddressesList;
			}
			// Scan all the email addresses.
			emailAddressesResultModel = await this.validateEmailAddresses(emailAddressesList, emailAddressesResultModel);
			clearTimeout(abortTimeout);
			resolve(emailAddressesResultModel);
		}).catch();
	}

	async saveEmailAddressToMongoDatabase(emailAddressStatusModel, emailAddress) {
		const saveStatus = await mongoDatabaseService.saveEmailAddress(emailAddress);
		switch (saveStatus) {
			case SaveStatusEnum.SAVE: { emailAddressStatusModel.isSave = true; emailAddressStatusModel.logStatus = LogStatusEnum.VALID; break; }
			case SaveStatusEnum.EXISTS: { emailAddressStatusModel.isExists = true; break; }
			case SaveStatusEnum.ERROR: { emailAddressStatusModel.isUnsave = true; emailAddressStatusModel.logStatus = LogStatusEnum.UNSAVE; break; }
		}
		return emailAddressStatusModel;
	}

	filterEmailAddress(emailAddress, emailAddressStatusModel) {
		const domainPart = emailAddressUtils.getEmailAddressParts(emailAddress)[1];
		if (filterEmailAddressDomains.includes(domainPart)) {
			emailAddressStatusModel.isFilter = true;
		}
		const emailAddressIndex = filterEmailAddresses.findIndex(emailAddressItem =>
			textUtils.toLowerCaseTrim(emailAddressItem) === textUtils.toLowerCaseTrim(emailAddress));
		if (emailAddressIndex > -1) {
			emailAddressStatusModel.isFilter = true;
		}
		return emailAddressStatusModel;
	}

	async saveEmailAddress(emailAddress, emailAddressStatusModel) {
		let isSave = false;
		let isGoalComplete = false;
		// Check if the email address is filtered.
		emailAddressStatusModel = this.filterEmailAddress(emailAddress, emailAddressStatusModel);
		if (!emailAddressStatusModel.isFilter) {
			// Save to Mongo database.
			emailAddressStatusModel = await this.saveEmailAddressToMongoDatabase(emailAddressStatusModel, emailAddress);
			isSave = emailAddressStatusModel.isSave;
		}
		// Check if goal is complete.
		if (isSave) {
			this.totalSaveCount++;
			isGoalComplete = this.checkGoalComplete();
		}
		return { isSave: isSave, isGoalComplete: isGoalComplete };
	}

	async handleEmailAddress(emailAddress, emailAddressesResultModel) {
		// Get the status of the email address.
		const validationResultModel = await emailAddressValidationService.validateEmailAddress(emailAddress);
		const emailAddressStatusModel = new EmailAddressStatusModel(validationResultModel);
		const { original, fix, isValid, isGibberish } = validationResultModel;
		let trendingSaveEmailAddress = null;
		if (fix) {
			emailAddressStatusModel.logStatus = LogStatusEnum.FIX;
			// Log the email address to the relevant TXT file in case of fix.
			await logService.logEmailAddress(emailAddressStatusModel);
			if (isValid) {
				const { isSave, isGoalComplete } = await this.saveEmailAddress(fix, emailAddressStatusModel);
				if (isSave) {
					emailAddressesResultModel.isGoalComplete = isGoalComplete;
					emailAddressStatusModel.isValidFix = true;
					trendingSaveEmailAddress = fix;
				}
			}
			else {
				emailAddressStatusModel.isInvalidFix = true;
			}
		}
		else {
			if (isValid) {
				const { isSave, isGoalComplete } = await this.saveEmailAddress(original, emailAddressStatusModel);
				if (isSave) {
					emailAddressesResultModel.isGoalComplete = isGoalComplete;
					trendingSaveEmailAddress = original;
				}
			}
			else {
				emailAddressStatusModel.logStatus = LogStatusEnum.INVALID;
				emailAddressStatusModel.isInvalid = true;
			}
		}
		if (trendingSaveEmailAddress) {
			// Add the email address to the trending save list if not exists already.
			emailAddressesResultModel = this.addTrendingSave(trendingSaveEmailAddress, emailAddressesResultModel, emailAddressStatusModel.isValidFix);
		}
		// Log the email address to a specific TXT file if it's gibberish.
		if (isGibberish) {
			const originalStatus = emailAddressStatusModel.logStatus;
			emailAddressStatusModel.logStatus = LogStatusEnum.GIBBERISH;
			await logService.logEmailAddress(emailAddressStatusModel);
			emailAddressStatusModel.logStatus = originalStatus;
		}
		// Log the email address to the relevant TXT file.
		await logService.logEmailAddress(emailAddressStatusModel);
		return {
			emailAddressesResultModel: emailAddressesResultModel,
			emailAddressStatusModel: emailAddressStatusModel
		};
	}

	addTrendingSave(emailAddress, emailAddressesResultModel, isValidFix) {
		if (emailAddressesResultModel.trendingSaveList.includes(emailAddress)) {
			return emailAddressesResultModel;
		}
		if (emailAddressesResultModel.trendingSaveList.length < this.countLimitDataModel.maximumTrendingSaveCount) {
			emailAddressesResultModel.trendingSaveList.push(isValidFix ? `Fix: ${emailAddress}` : emailAddress);
		}
		return emailAddressesResultModel;
	}

	updateCounters(emailAddressStatusModel, emailAddressesResultModel) {
		if (emailAddressStatusModel.isSave) {
			emailAddressesResultModel.saveCount++;
		}
		if (emailAddressStatusModel.isExists) {
			emailAddressesResultModel.existsCount++;
		}
		if (emailAddressStatusModel.isInvalid) {
			emailAddressesResultModel.invalidCount++;
		}
		if (emailAddressStatusModel.isValidFix) {
			emailAddressesResultModel.validFixCount++;
		}
		if (emailAddressStatusModel.isInvalidFix) {
			emailAddressesResultModel.invalidFixCount++;
		}
		if (emailAddressStatusModel.isFilter) {
			emailAddressesResultModel.filterCount++;
		}
		if (emailAddressStatusModel.isUnsave) {
			emailAddressesResultModel.unsaveCount++;
		}
		if (emailAddressStatusModel.isGibberish) {
			emailAddressesResultModel.gibberishCount++;
		}
		return emailAddressesResultModel;
	}

	async validateEmailAddresses(emailAddressesList, emailAddressesResultModel) {
		for (let i = 0, length = emailAddressesList.length; i < length; i++) {
			const handleResult = await this.handleEmailAddress(emailAddressesList[i], emailAddressesResultModel);
			emailAddressesResultModel = this.updateCounters(handleResult.emailAddressStatusModel, handleResult.emailAddressesResultModel);
			// Check if the goal isn't complete already. If so, stop the loop and return.
			if (emailAddressesResultModel.isGoalComplete) {
				break;
			}
		}
		return emailAddressesResultModel;
	}
}

module.exports = new CrawlEmailAddressService();