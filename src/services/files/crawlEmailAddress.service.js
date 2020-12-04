const { emailAddressUtils, validationUtils, textUtils } = require('../../utils');
const { SourceType } = require('../../core/enums/files/search.enum');
let { commonEmailAddressDomainsList } = require('../../configurations/emailAddressDomainEndsList.configuration');
const emailAddressDomainsList = require('../../configurations/emailAddressDomainsList.configuration');
const { filterEmailAddressDomains, filterEmailAddresses } = require('../../configurations/filterEmailAddress.configuration');
const { CommonEmailAddressDomain, EmailAddressesResult, EmailAddressStatus } = require('../../core/models/application');
const mongoDatabaseService = require('./mongoDatabase.service');
const emailAddressValidationService = require('./emailAddressValidation.service');
const logService = require('./log.service');
const sourceService = require('./source.service');
const { LogStatus, SaveStatus } = require('../../core/enums/files/emailAddress.enum');
const { GoalType } = require('../../core/enums/files/system.enum');

class CrawlEmailAddressService {

	constructor() {
		this.totalSaveCount = 0;
		this.goalValue = 0;
		this.isSkipLogic = null;
		this.countsLimitsData = null;
	}

	initiate(data) {
		const { applicationData, countsLimitsData } = data;
		this.goalValue = applicationData.goalType === GoalType.EMAIL_ADDRESSES ? applicationData.goalValue : null;
		this.isSkipLogic = applicationData.isSkipLogic;
		this.countsLimitsData = countsLimitsData;
		// Initiate the common email address domains lists.
		this.initiateCommonEmailAddressDomains();
	}

	initiateCommonEmailAddressDomains() {
		// Set the commonEmailAddressDomains list.
		for (let i = 0, length = emailAddressDomainsList.length; i < length; i++) {
			const { domain, domainName, micromatchName, isCommonDomain } = emailAddressDomainsList[i];
			if (isCommonDomain) {
				commonEmailAddressDomainsList.push(new CommonEmailAddressDomain({
					domain: domain,
					flipDomain: textUtils.flipDotParts(domain),
					domainName: domainName,
					micromatchName: micromatchName
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
			// Limit the runtime of this function in case of stuck URL crawling process.
			const abortTimeout = setTimeout(() => {
				resolve(null);
				return;
			}, this.countsLimitsData.millisecondsTimeoutSourceRequestCount);
			const { linkData, totalSaveCount } = data;
			this.totalSaveCount = totalSaveCount;
			let emailAddressesResult = new EmailAddressesResult();
			if (this.checkGoalComplete()) {
				clearTimeout(abortTimeout);
				resolve(emailAddressesResult);
				return;
			}
			// Get the source of the specific link to fetch from it's email addresses.
			const pageResults = await sourceService.getPageSource({
				sourceType: SourceType.PAGE,
				searchEngine: null,
				linkData: linkData
			});
			if (!pageResults) {
				clearTimeout(abortTimeout);
				resolve(emailAddressesResult);
				return;
			}
			const { isValidPage, pageSource } = pageResults;
			if (!isValidPage) {
				await logService.logErrorLink(linkData.link);
			}
			emailAddressesResult.isValidPage = isValidPage;
			// Get all the email addresses from the page source.
			let emailAddressesList = emailAddressUtils.getEmailAddresses(pageSource);
			if (!validationUtils.isExists(emailAddressesList)) {
				clearTimeout(abortTimeout);
				resolve(emailAddressesResult);
				return;
			}
			emailAddressesResult.totalCount = emailAddressesList.length;
			// Remove duplicate email addresses.
			emailAddressesList = textUtils.removeDuplicates(emailAddressesList);
			if (this.isSkipLogic) {
				// Skip email addresses with domain that repeats itself too many times.
				const skipResults = emailAddressValidationService.skipDomains({
					emailAddressesList: emailAddressesList,
					maximumUniqueDomainCount: this.countsLimitsData.maximumUniqueDomainCount
				});
				emailAddressesResult.skipCount = skipResults.skipCount;
				emailAddressesList = skipResults.emailAddressesList;
			}
			// Scan all the email addresses.
			emailAddressesResult = await this.validateEmailAddresses(emailAddressesList, emailAddressesResult);
			clearTimeout(abortTimeout);
			resolve(emailAddressesResult);
		}).catch();
	}

	async saveEmailAddressToMongoDatabase(emailAddressStatus, emailAddress) {
		const saveStatus = await mongoDatabaseService.saveEmailAddress(emailAddress);
		switch (saveStatus) {
			case SaveStatus.SAVE: emailAddressStatus.isSave = true; emailAddressStatus.logStatus = LogStatus.VALID; break;
			case SaveStatus.EXISTS: emailAddressStatus.isExists = true; break;
			case SaveStatus.ERROR: emailAddressStatus.isUnsave = true; emailAddressStatus.logStatus = LogStatus.UNSAVE; break;
		}
		return emailAddressStatus;
	}

	filterEmailAddress(emailAddress, emailAddressStatus) {
		const domainPart = emailAddressUtils.getEmailAddressParts(emailAddress)[1];
		if (filterEmailAddressDomains.includes(domainPart)) {
			emailAddressStatus.isFilter = true;
		}
		const emailAddressIndex = filterEmailAddresses.findIndex(emailAddressItem =>
			textUtils.toLowerCaseTrim(emailAddressItem) === textUtils.toLowerCaseTrim(emailAddress));
		if (emailAddressIndex > -1) {
			emailAddressStatus.isFilter = true;
		}
		return emailAddressStatus;
	}

	async saveEmailAddress(emailAddress, emailAddressStatus) {
		let isSave = false;
		let isGoalComplete = false;
		// Check if the email address is filtered.
		emailAddressStatus = this.filterEmailAddress(emailAddress, emailAddressStatus);
		if (!emailAddressStatus.isFilter) {
			// Save to Mongo database.
			emailAddressStatus = await this.saveEmailAddressToMongoDatabase(emailAddressStatus, emailAddress);
			isSave = emailAddressStatus.isSave;
		}
		// Check if goal is complete.
		if (isSave) {
			this.totalSaveCount++;
			isGoalComplete = this.checkGoalComplete();
		}
		return { isSave: isSave, isGoalComplete: isGoalComplete };
	}

	async handleEmailAddress(emailAddress, emailAddressesResult) {
		// Get the status of the email address.
		const validationResult = await emailAddressValidationService.validateEmailAddress(emailAddress);
		const emailAddressStatus = new EmailAddressStatus(validationResult);
		const { original, fix, isValid } = validationResult;
		let trendingSaveEmailAddress = null;
		if (fix) {
			emailAddressStatus.logStatus = LogStatus.FIX;
			// Log the email address to the relevant TXT file in case of fix.
			await logService.logEmailAddress(emailAddressStatus);
			if (isValid) {
				const { isSave, isGoalComplete } = await this.saveEmailAddress(fix, emailAddressStatus);
				if (isSave) {
					emailAddressesResult.isGoalComplete = isGoalComplete;
					emailAddressStatus.isValidFix = true;
					trendingSaveEmailAddress = fix;
				}
			}
			else {
				emailAddressStatus.isInvalidFix = true;
			}
		}
		else {
			if (isValid) {
				const { isSave, isGoalComplete } = await this.saveEmailAddress(original, emailAddressStatus);
				if (isSave) {
					emailAddressesResult.isGoalComplete = isGoalComplete;
					trendingSaveEmailAddress = original;
				}
			}
			else {
				emailAddressStatus.logStatus = LogStatus.INVALID;
				emailAddressStatus.isInvalid = true;
			}
		}
		if (trendingSaveEmailAddress) {
			// Add the email address to the trending save list if not exists already.
			emailAddressesResult = this.addTrendingSave(trendingSaveEmailAddress, emailAddressesResult, emailAddressStatus.isValidFix);
		}
		// Log the email address to the relevant TXT file.
		await logService.logEmailAddress(emailAddressStatus);
		return {
			emailAddressesResult: emailAddressesResult,
			emailAddressStatus: emailAddressStatus
		};
	}

	addTrendingSave(emailAddress, emailAddressesResult, isValidFix) {
		if (emailAddressesResult.trendingSaveList.includes(emailAddress)) {
			return emailAddressesResult;
		}
		if (emailAddressesResult.trendingSaveList.length < this.countsLimitsData.maximumTrendingSaveCount) {
			emailAddressesResult.trendingSaveList.push(isValidFix ? `Fix: ${emailAddress}` : emailAddress);
		}
		return emailAddressesResult;
	}

	updateCounters(emailAddressStatus, emailAddressesResult) {
		if (emailAddressStatus.isSave) {
			emailAddressesResult.saveCount++;
		}
		if (emailAddressStatus.isExists) {
			emailAddressesResult.existsCount++;
		}
		if (emailAddressStatus.isInvalid) {
			emailAddressesResult.invalidCount++;
		}
		if (emailAddressStatus.isValidFix) {
			emailAddressesResult.validFixCount++;
		}
		if (emailAddressStatus.isInvalidFix) {
			emailAddressesResult.invalidFixCount++;
		}
		if (emailAddressStatus.isFilter) {
			emailAddressesResult.filterCount++;
		}
		if (emailAddressStatus.isUnsave) {
			emailAddressesResult.unsaveCount++;
		}
		return emailAddressesResult;
	}

	async validateEmailAddresses(emailAddressesList, emailAddressesResult) {
		for (let i = 0, length = emailAddressesList.length; i < length; i++) {
			const handleResult = await this.handleEmailAddress(emailAddressesList[i], emailAddressesResult);
			emailAddressesResult = this.updateCounters(handleResult.emailAddressStatus, handleResult.emailAddressesResult);
			// Check if the goal isn't complete already. If so, stop the loop and return.
			if (emailAddressesResult.isGoalComplete) {
				break;
			}
		}
		return emailAddressesResult;
	}
}

module.exports = new CrawlEmailAddressService();