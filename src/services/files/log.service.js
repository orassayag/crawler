const { databaseUtils, fileUtils, pathUtils, logUtils, textUtils, timeUtils, validationUtils } = require('../../utils');
const { Color } = require('../../core/enums/files/text.enum');
const { LogStatus } = require('../../core/enums/files/emailAddress.enum');
const { StatusIcon } = require('../../core/enums/files/text.enum');
const { Placeholder } = require('../../core/enums/files/placeholder.enum');
const { Step } = require('../../core/enums/files/system.enum');
const searchService = require('./search.service');
const emailAddressValidationService = require('./emailAddressValidation.service');
const { invalidEmailAddresses } = require('../../configurations/emailAddressesLists.configuration');

class LogService {

	constructor() {
		this.logsData = null;
		this.applicationData = null;
		this.databaseData = null;
		this.searchProcessData = null;
		this.countsLimitsData = null;
		this.pathsData = null;
		// ===PATHS=== //
		this.baseSessionPath = null;
		this.sessionDirectoryPath = null;
		this.emailAddressesPath = null;
		this.fixedEmailAddressesPath = null;
		this.invalidEmailAddressesPath = null;
		this.unsaveEmailAddressesPath = null;
		this.crawlLinksPath = null;
		this.crawlErrorLinksPath = null;
		this.frames = ['-', '\\', '|', '/'];
		this.i = 0;
	}

	async initiate(data) {
		const { logsData, applicationData, databaseData, countsLimitsData, pathsData } = data;
		this.logsData = logsData;
		this.applicationData = applicationData;
		this.databaseData = databaseData;
		this.countsLimitsData = countsLimitsData;
		this.pathsData = pathsData;
		await this.initiateDirectories();
	}

	async initiateDirectories() {
		// ===PATHS=== //
		await this.createModeDirectory();
		await this.clearLogFiles();
		await this.createSessionDirectory();
		this.emailAddressesPath = this.createFilePath(`email_addresses_${Placeholder.DATE}`);
		this.fixedEmailAddressesPath = this.createFilePath(`fixed_email_addresses_${Placeholder.DATE}`);
		this.invalidEmailAddressesPath = this.createFilePath(`invalid_email_addresses_${Placeholder.DATE}`);
		this.unsaveEmailAddressesPath = this.createFilePath(`unsave_email_addresses_${Placeholder.DATE}`);
		this.crawlLinksPath = this.createFilePath(`crawl_links_${Placeholder.DATE}`);
		this.crawlErrorLinksPath = this.createFilePath(`crawl_error_links_${Placeholder.DATE}`);
	}

	getNextDirectoryIndex() {
		const directories = fileUtils.getAllDirectories(this.baseSessionPath);
		if (!validationUtils.isExists(directories)) {
			return 1;
		}
		return Math.max(...directories.map(name => textUtils.getSplitNumber(name))) + 1;
	}

	async createModeDirectory() {
		this.baseSessionPath = pathUtils.getJoinPath({ targetPath: this.pathsData.distPath, targetName: textUtils.toLowerCase(this.applicationData.mode) });
		await fileUtils.createDirectory(this.baseSessionPath);
	}

	async createSessionDirectory() {
		this.sessionDirectoryPath = pathUtils.getJoinPath({
			targetPath: this.baseSessionPath,
			targetName: `${this.getNextDirectoryIndex()}_${this.applicationData.logDateTime}`
		});
		await fileUtils.createDirectory(this.sessionDirectoryPath);
	}

	createFilePath(fileName) {
		const isDate = fileName.indexOf(Placeholder.DATE) > -1;
		return pathUtils.getJoinPath({
			targetPath: this.sessionDirectoryPath ? this.sessionDirectoryPath : this.pathsData.distPath,
			targetName: `${isDate ? fileName.replace(Placeholder.DATE, this.applicationData.logDateTime) : fileName}.txt`
		});
	}

	async clearLogFiles() {
		if (this.logsData.isEmptyDistDirectory) {
			await fileUtils.emptyDirectory(this.baseSessionPath);
		}
	}

	getSteps() {
		return [this.applicationData.isLinksStep ? Step.LINKS : '',
		this.applicationData.isCrawlStep ? Step.CRAWL : '',
		this.applicationData.isSendStep ? Step.SEND : ''].join(',');
	}

	logStatus(applicationData) {
		const time = `Time: ${applicationData.time}`;
		const processIndex = `processIndex: ${applicationData.processIndex}/${this.countsLimitsData.maximumSearchProcessesCount - 1}`;
		const pageIndex = `pageIndex: ${applicationData.pageIndex}/${this.countsLimitsData.maximumSearchEnginePagesPerProcessCount - 1}`;
		const pageLinksIndex = `pageLinksIndex: ${applicationData.pageLinksIndex}/${applicationData.pageLinksCount - 1}`;
		logUtils.log(`${time} | ${processIndex} | ${pageIndex} | ${pageLinksIndex}`);
	}

	logProgress(logData) {
		const { applicationData, searchProcessData } = logData;
		if (!applicationData || !searchProcessData) {
			return;
		}
		this.applicationData = applicationData;
		this.searchProcessData = searchProcessData;
		const time = `${this.applicationData.time} [${this.frames[this.i = ++this.i % this.frames.length]}]`;
		const steps = textUtils.removeLastCharacterLoop({ text: this.getSteps(), character: ',' });
		const goal = textUtils.replaceCharacter(this.applicationData.goalType, '_', ' ');
		const progress = textUtils.getNumberOfNumber({ number1: this.applicationData.progressValue, number2: this.applicationData.goalValue });
		const percentage = textUtils.calculatePercentageDisplay({ partialValue: this.applicationData.progressValue, totalValue: this.applicationData.goalValue });
		const process = textUtils.getNumberOfNumber({ number1: this.applicationData.processIndex + 1, number2: this.countsLimitsData.maximumSearchProcessesCount });
		const crawlLinks = `${StatusIcon.V}  ${this.applicationData.crawlLinksData.crawlCount}`;
		const saveEmailAddress = `${StatusIcon.V}  ${textUtils.getNumberWithCommas(this.applicationData.crawlEmailAddressesData.saveCount)}`;
		const invalidEmailAddress = `${StatusIcon.X}  ${this.applicationData.crawlEmailAddressesData.invalidCount}`;
		const pageIndex = textUtils.getNumberOfNumber({ number1: this.applicationData.pageIndex + 1, number2: this.countsLimitsData.maximumSearchEnginePagesPerProcessCount });
		const link = this.applicationData.pageLinksCount ?
			textUtils.getNumberOfNumber({ number1: this.applicationData.pageLinksIndex + 1, number2: this.applicationData.pageLinksCount }) : '(-)';
		const trending = textUtils.cutText({ text: this.applicationData.trendingSaveList.join(' | '), count: this.countsLimitsData.maximumConsoleLineCharacters });
		const page = textUtils.cutText({ text: this.searchProcessData.pageLink, count: this.countsLimitsData.maximumConsoleLineCharacters });
		const search = textUtils.cutText({ text: this.searchProcessData.searchEngineLinkTemplate, count: this.countsLimitsData.maximumConsoleLineCharacters });
		logUtils.logProgress({
			titlesList: ['SETTINGS', 'GENERAL', 'PROCESS', 'LINK', 'EMAIL ADDRESS', 'TRENDING', `PAGE (${link})`, `SEARCH (${pageIndex})`],
			colorsTitlesList: [Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE],
			keysLists: [{
				'Mode': this.applicationData.mode,
				'Database': this.databaseData.mongoDatabaseModeName,
				'Drop': this.databaseData.isDropCollection,
				'Steps': steps
			}, {
				'Time': time,
				'Goal': goal,
				'Progress': `${progress} (${percentage})`,
				'Status': this.applicationData.status
			}, {
				'Process': process,
				'Page': pageIndex,
				'Engine': this.searchProcessData.searchEngine.name,
				'Key': this.searchProcessData.displaySearchKey
			}, {
				'Crawl': crawlLinks,
				'Total': this.applicationData.crawlLinksData.totalCount,
				'Filter': this.applicationData.crawlLinksData.filterCount,
				'Error': this.applicationData.crawlLinksData.errorCount,
				'Error In A Row': this.applicationData.errorPageInARowCounter,
				'Current': link
			}, {
				'Save': saveEmailAddress,
				'Total': this.applicationData.crawlEmailAddressesData.totalCount,
				'Database': this.applicationData.crawlEmailAddressesData.databaseCount,
				'Exists': this.applicationData.crawlEmailAddressesData.existsCount,
				'Invalid': invalidEmailAddress,
				'Valid Fix': this.applicationData.crawlEmailAddressesData.validFixCount,
				'Invalid Fix': this.applicationData.crawlEmailAddressesData.invalidFixCount,
				'Unsave': this.applicationData.crawlEmailAddressesData.unsaveCount,
				'Filter': this.applicationData.crawlEmailAddressesData.filterCount
			}, {
				'#': trending
			}, {
				'#': page
			}, {
				'#': search
			}],
			colorsLists: [
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.CYAN, Color.CYAN, Color.CYAN, Color.MAGENTA],
				[Color.GREEN, Color.CYAN, Color.CYAN, Color.RED, Color.RED, Color.CYAN],
				[Color.GREEN, Color.CYAN, Color.CYAN, Color.CYAN, Color.RED, Color.GREEN, Color.RED, Color.RED, Color.MAGENTA]
			],
			statusColor: Color.CYAN
		});
	}

	createWrapTemplate(isPathExists, original) {
		return isPathExists ? `, ${original}` : original;
	}

	async logScript(data) {
		const { applicationData, pathsData, scriptData, scriptType } = data;
		this.applicationData = applicationData;
		this.pathsData = pathsData;
		await this.createModeDirectory();
		const scriptPath = pathUtils.getJoinPath({ targetPath: this.baseSessionPath, targetName: `${textUtils.toLowerCase(scriptType)}.txt` });
		await fileUtils.removeFileIfExists(scriptPath);
		await fileUtils.appendFile({ targetPath: scriptPath, message: scriptData });
	}

	isLogInvalidEmailAddress(validationResult) {
		return invalidEmailAddresses.findIndex(e => e.emailAddress === validationResult.original) === -1;
	}

	// Check if to log the fixed email address according to the function id.
	isLogFixEmailAddress(validationResult) {
		const { functionIds } = validationResult;
		return emailAddressValidationService.logFunctionIds.filter(element => functionIds.includes(element)).length > 0;
	}

	async logEmailAddress(emailAddressStatus) {
		const { validationResult, logStatus } = emailAddressStatus;
		const { original, fix } = validationResult;
		let path, message = '';
		switch (logStatus) {
			case LogStatus.VALID:
				if (this.logsData.isLogValidEmailAddresses) {
					path = this.emailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), fix ? fix : original);
				}
				break;
			case LogStatus.FIX:
				if (this.logsData.isLogFixEmailAddresses && this.isLogFixEmailAddress(validationResult)) {
					path = this.fixedEmailAddressesPath;
					message = textUtils.addBreakLine(this.createFixResultTemplate(validationResult));
				}
				break;
			case LogStatus.INVALID:
				if (this.logsData.isLogInvalidEmailAddresses && this.isLogInvalidEmailAddress(validationResult)) {
					path = this.invalidEmailAddressesPath;
					message = textUtils.addBreakLine(this.createInvalidResultTemplate(validationResult));
				}
				break;
			case LogStatus.UNSAVE:
				if (this.logsData.isLogUnsaveEmailAddresses) {
					path = this.unsaveEmailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), original);
				}
				break;
		}
		// In case no log status is relevant to log, don't log anything.
		if (path && message) {
			await fileUtils.appendFile({ targetPath: path, message: message });
		}
	}

	async logLinks(links) {
		if (links && this.logsData.isLogCrawlLinks) {
			await fileUtils.appendFile({ targetPath: this.crawlLinksPath, message: links });
		}
	}

	async logErrorLink(link) {
		if (link && this.logsData.isLogCrawlErrorLinks) {
			await fileUtils.appendFile({ targetPath: this.crawlErrorLinksPath, message: textUtils.addBreakLine(link) });
		}
	}

	createFixResultTemplate(validationResult, icon) {
		const { original, fix, isValid, functionIds } = validationResult;
		return `${icon ? `${icon} | ` : ''}Time: ${timeUtils.getFullTime()} | isValid: ${isValid} | original: ${original} | fix: ${fix} | functionIds: ${functionIds}`;
	}

	createInvalidResultTemplate(validationResult) {
		const { original, functionIds } = validationResult;
		return `${original} | functionIds: ${functionIds}`;
	}

	createDomainCounterTemplate(domainCounter) {
		const { domainPart, counter } = domainCounter;
		const fixedDomainPart = domainPart + new Array(Math.abs(domainPart.length - this.logsData.maximumFixLogSpacesCharactersCount)).join(' ');
		return `${fixedDomainPart} | ${textUtils.getNumberWithCommas(counter)}`;
	}

	createLineTemplate(title, value) {
		return textUtils.addBreakLine(`${logUtils.logColor(`${title}:`, Color.MAGENTA)} ${value}`);
	}

	createConfirmSettingsTemplate(settings) {
		const searchEngines = searchService.getAllActiveSearchEngines().map(engine => engine.name).join(', ');
		const parameters = ['IS_PRODUCTION_MODE', 'IS_DROP_COLLECTION', 'IS_STATUS_MODE', 'IS_EMPTY_DIST_DIRECTORY',
			'IS_RUN_DOMAINS_COUNTER', 'GOAL_TYPE', 'GOAL_VALUE', 'SEARCH_KEY', 'IS_LINKS_STEP', 'IS_CRAWL_STEP',
			'IS_SEND_STEP', 'IS_LOG_VALID_EMAIL_ADDRESSES', 'IS_LOG_FIX_EMAIL_ADDRESSES', 'IS_LOG_INVALID_EMAIL_ADDRESSES',
			'IS_LOG_UNSAVE_EMAIL_ADDRESSES', 'IS_LOG_CRAWL_LINKS', 'IS_LOG_CRAWL_ERROR_LINKS'];
		let settingsText = this.createLineTemplate('SEARCH ENGINES', searchEngines);
		settingsText += this.createLineTemplate('DATABASE', databaseUtils.getDatabaseModeName(settings));
		settingsText += Object.keys(settings).filter(s => parameters.indexOf(s) > -1)
			.map(k => this.createLineTemplate(k, settings[k])).join('');
		settingsText = textUtils.removeLastCharacter(settingsText);
		return `${textUtils.setLogStatus('IMPORTANT SETTINGS')}
${settingsText}
========================
OK to run? y/n`;
	}

	logScore(emailAddressesList, score, domain) {
		// Calculate parentage.
		const parentage = textUtils.calculatePercentageDisplay({ partialValue: score, totalValue: emailAddressesList.length });
		logUtils.log('===========================================================');
		logUtils.log(`${domain ? `Domain: ${domain} | ` : ''}Score: ${score}/${emailAddressesList.length} (${parentage})`);
	}

	logGeneratorResult(result) {
		logUtils.log(`${result.name} ---> ${result.result}`);
	}
}

const logService = new LogService();
module.exports = logService;