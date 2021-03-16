const { Color, LogStatus, Method, Placeholder, StatusIcon } = require('../../core/enums');
const { invalidEmailAddresses } = require('../../configurations');
const emailAddressValidationService = require('./emailAddressValidation.service');
const puppeteerService = require('./puppeteer.service');
const searchService = require('./search.service');
const { fileUtils, logUtils, mongoDatabaseUtils, pathUtils, textUtils, timeUtils, validationUtils } = require('../../utils');

class LogService {

	constructor() {
		this.logData = null;
		this.applicationData = null;
		this.mongoDatabaseData = null;
		this.searchProcessData = null;
		this.countLimitData = null;
		this.pathData = null;
		// ===PATH=== //
		this.baseSessionPath = null;
		this.sessionDirectoryPath = null;
		this.emailAddressesPath = null;
		this.fixedEmailAddressesPath = null;
		this.invalidEmailAddressesPath = null;
		this.unsaveEmailAddressesPath = null;
		this.gibberishEmailAddressesPath = null;
		this.crawlLinksPath = null;
		this.crawlErrorLinksPath = null;
		this.frames = ['-', '\\', '|', '/'];
		this.i = 0;
		this.y = 0;
		this.isLog = true;
	}

	async initiate(data) {
		const { logData, applicationData, mongoDatabaseData, countLimitData, pathData } = data;
		this.logData = logData;
		this.applicationData = applicationData;
		this.mongoDatabaseData = mongoDatabaseData;
		this.countLimitData = countLimitData;
		this.pathData = pathData;
		this.isLogs = (this.logData.isLogValidEmailAddresses || this.logData.isLogFixEmailAddresses ||
			this.logData.isLogInvalidEmailAddresses || this.logData.isLogUnsaveEmailAddresses ||
			this.logData.isLogGibberishEmailAddresses || this.logData.isLogCrawlLinks ||
			this.logData.isLogCrawlErrorLinks);
		await this.initiateDirectories();
	}

	async initiateDirectories() {
		if (!this.isLogs) {
			return;
		}
		// ===PATH=== //
		this.createModeDirectory();
		await this.clearLogFiles();
		this.createSessionDirectory();
		// If you change the "email_addresses_" file name, change it also in the 'sender' project.
		if (this.logData.isLogValidEmailAddresses) {
			this.emailAddressesPath = this.createFilePath(`email_addresses_${Placeholder.DATE}`);
		}
		if (this.logData.isLogFixEmailAddresses) {
			this.fixedEmailAddressesPath = this.createFilePath(`fixed_email_addresses_${Placeholder.DATE}`);
		}
		if (this.logData.isLogInvalidEmailAddresses) {
			this.invalidEmailAddressesPath = this.createFilePath(`invalid_email_addresses_${Placeholder.DATE}`);
		}
		if (this.logData.isLogUnsaveEmailAddresses) {
			this.unsaveEmailAddressesPath = this.createFilePath(`unsave_email_addresses_${Placeholder.DATE}`);
		}
		if (this.logData.isLogGibberishEmailAddresses) {
			this.gibberishEmailAddressesPath = this.createFilePath(`gibberish_email_addresses_${Placeholder.DATE}`);
		}
		if (this.logData.isLogCrawlLinks) {
			this.crawlLinksPath = this.createFilePath(`crawl_links_${Placeholder.DATE}`);
		}
		if (this.logData.isLogCrawlErrorLinks) {
			this.crawlErrorLinksPath = this.createFilePath(`crawl_error_links_${Placeholder.DATE}`);
		}
	}

	getNextDirectoryIndex() {
		const directories = fileUtils.getAllDirectories(this.baseSessionPath);
		if (!validationUtils.isExists(directories)) {
			return 1;
		}
		return Math.max(...directories.map(name => textUtils.getSplitNumber(name))) + 1;
	}

	createModeDirectory() {
		this.baseSessionPath = pathUtils.getJoinPath({
			targetPath: this.pathData.distPath,
			targetName: textUtils.toLowerCase(this.applicationData.mode)
		});
		fileUtils.createDirectory(this.baseSessionPath);
	}

	createSessionDirectory() {
		this.sessionDirectoryPath = pathUtils.getJoinPath({
			targetPath: this.baseSessionPath,
			targetName: `${this.getNextDirectoryIndex()}_${this.applicationData.logDateTime}`
		});
		fileUtils.createDirectory(this.sessionDirectoryPath);
	}

	createFilePath(fileName) {
		const isDate = fileName.indexOf(Placeholder.DATE) > -1;
		return pathUtils.getJoinPath({
			targetPath: this.sessionDirectoryPath ? this.sessionDirectoryPath : this.pathData.distPath,
			targetName: `${isDate ? fileName.replace(Placeholder.DATE, this.applicationData.logDateTime) : fileName}.txt`
		});
	}

	async clearLogFiles() {
		if (this.logData.isEmptyDistDirectory) {
			await fileUtils.emptyDirectory(this.baseSessionPath);
		}
	}

	getMethods() {
		return [this.applicationData.isLinksMethodActive ? Method.LINKS : '',
		this.applicationData.isCrawlMethodActive ? Method.CRAWL : ''].join(',');
	}

	logStatus(applicationData) {
		const time = `Time: ${applicationData.time}`;
		const processIndex = `processIndex: ${applicationData.processIndex}/${this.countLimitData.maximumSearchProcessesCount - 1}`;
		const pageIndex = `pageIndex: ${applicationData.pageIndex}/${this.countLimitData.maximumSearchEnginePagesPerProcessCount - 1}`;
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
		const methods = textUtils.removeLastCharacterLoop({ text: this.getMethods(), character: ',' });
		const goal = textUtils.replaceCharacter(this.applicationData.goalType, '_', ' ');
		const progress = textUtils.getNumberOfNumber({ number1: this.applicationData.progressValue, number2: this.applicationData.goalValue });
		const percentage = textUtils.calculatePercentageDisplay({ partialValue: this.applicationData.progressValue, totalValue: this.applicationData.goalValue });
		const process = textUtils.getNumberOfNumber({ number1: this.applicationData.processIndex + 1, number2: this.countLimitData.maximumSearchProcessesCount });
		const crawlLinks = `${StatusIcon.V}  ${this.applicationData.crawlLinkData.crawlCount}`;
		const saveEmailAddress = `${StatusIcon.V}  ${textUtils.getNumberWithCommas(this.applicationData.crawlEmailAddressData.saveCount)}`;
		const invalidEmailAddress = `${StatusIcon.X}  ${this.applicationData.crawlEmailAddressData.invalidCount}`;
		const pageIndex = textUtils.getNumberOfNumber({ number1: this.applicationData.pageIndex + 1, number2: this.countLimitData.maximumSearchEnginePagesPerProcessCount });
		const link = this.applicationData.pageLinksCount ?
			textUtils.getNumberOfNumber({ number1: this.applicationData.pageLinksIndex + 1, number2: this.applicationData.pageLinksCount }) : '(-)';
		const trending = textUtils.cutText({ text: this.applicationData.trendingSaveList.join(' | '), count: this.countLimitData.maximumConsoleLineCharacters });
		const page = textUtils.cutText({ text: this.searchProcessData.pageLink, count: this.countLimitData.maximumConsoleLineCharacters });
		const engine = textUtils.upperCaseFirstLetter(this.searchProcessData.searchEngine.name, 0);
		const userAgent = this.searchProcessData.pageUserAgent ? textUtils.cutText({ text: this.searchProcessData.pageUserAgent, count: this.countLimitData.maximumConsoleLineCharacters }) : '';
		const search = textUtils.cutText({ text: this.searchProcessData.searchEngineLinkTemplate, count: this.countLimitData.maximumConsoleLineCharacters });
		const statistics = textUtils.getObjectKeyValues(this.applicationData.crawlEmailAddressData.statistics);
		logUtils.logProgress({
			titlesList: ['SETTINGS', 'GENERAL', 'PROCESS', 'LINK', 'EMAIL ADDRESS', `PAGE (${link})`,
				'USER AGENT', `SEARCH (${pageIndex})`, 'TRENDING', 'STATISTICS'],
			colorsTitlesList: [Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE,
			Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE],
			keysLists: [{
				'Mode': this.applicationData.mode,
				'Plan': this.applicationData.plan,
				'Database': this.mongoDatabaseData.mongoDatabaseModeName,
				'Drop': this.mongoDatabaseData.isDropCollection,
				'Long': this.applicationData.isLongRun,
				'Active Methods': methods
			}, {
				'Time': time,
				'Goal': goal,
				'Progress': `${progress} (${percentage})`,
				'Status': this.applicationData.status,
				'Restarts': this.applicationData.restartsCount
			}, {
				'Process': process,
				'Page': pageIndex,
				'Engine': engine,
				'Key': this.searchProcessData.displaySearchKey
			}, {
				'Crawl': crawlLinks,
				'Total': this.applicationData.crawlLinkData.totalCount,
				'Filter': this.applicationData.crawlLinkData.filterCount,
				'Error': this.applicationData.crawlLinkData.errorCount,
				'Error In A Row': puppeteerService.errorInARowCounter,
				'Current': link
			}, {
				'Save': saveEmailAddress,
				'Total': this.applicationData.crawlEmailAddressData.totalCount,
				'Database': this.applicationData.crawlEmailAddressData.databaseCount,
				'Exists': this.applicationData.crawlEmailAddressData.existsCount,
				'Invalid': invalidEmailAddress,
				'Valid Fix': this.applicationData.crawlEmailAddressData.validFixCount,
				'Invalid Fix': this.applicationData.crawlEmailAddressData.invalidFixCount,
				'Unsave': this.applicationData.crawlEmailAddressData.unsaveCount,
				'Filter': this.applicationData.crawlEmailAddressData.filterCount,
				'Skip': this.applicationData.crawlEmailAddressData.skipCount,
				'Gibberish': this.applicationData.crawlEmailAddressData.gibberishCount
			}, {
				'#': page
			}, {
				'#': userAgent
			}, {
				'#': search
			}, {
				'#': trending
			}, {
				'#': statistics
			}],
			colorsLists: [
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.CYAN, Color.CYAN, Color.CYAN, Color.MAGENTA],
				[Color.GREEN, Color.CYAN, Color.CYAN, Color.RED, Color.RED, Color.CYAN],
				[Color.GREEN, Color.CYAN, Color.CYAN, Color.CYAN, Color.RED, Color.GREEN,
				Color.RED, Color.RED, Color.MAGENTA, Color.YELLOW, Color.YELLOW]
			],
			nonNumericKeys: {},
			statusColor: Color.CYAN
		});
	}

	logSchedule(time) {
		logUtils.logSchedule(`STARTS IN ${time} [${this.frames[this.y = ++this.y % this.frames.length]}]`);
	}

	createWrapTemplate(isPathExists, original) {
		return isPathExists ? `, ${original}` : original;
	}

	async logScript(data) {
		const { applicationData, pathData, scriptData, scriptType } = data;
		this.applicationData = applicationData;
		this.pathData = pathData;
		await this.createModeDirectory();
		const scriptPath = pathUtils.getJoinPath({
			targetPath: this.baseSessionPath,
			targetName: `${textUtils.toLowerCase(scriptType)}.txt`
		});
		await fileUtils.removeFileIfExists(scriptPath);
		await fileUtils.appendFile({
			targetPath: scriptPath,
			message: scriptData
		});
	}

	isLogInvalidEmailAddress(validationResult) {
		return invalidEmailAddresses.findIndex(e => e.emailAddress === validationResult.original) === -1;
	}

	// Check if to log the fixed email address according to the function id.
	isLogFixEmailAddress(validationResult) {
		const { functionIds } = validationResult;
		return validationUtils.isExists(emailAddressValidationService.logFunctionIds.filter(element => functionIds.includes(element)));
	}

	async logEmailAddress(emailAddressStatus) {
		if (!this.isLogs) {
			return;
		}
		const { validationResult, logStatus } = emailAddressStatus;
		const { original, fix } = validationResult;
		let path, message = '';
		switch (logStatus) {
			case LogStatus.VALID:
				if (this.logData.isLogValidEmailAddresses) {
					path = this.emailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), fix ? fix : original);
				}
				break;
			case LogStatus.FIX:
				if (this.logData.isLogFixEmailAddresses && this.isLogFixEmailAddress(validationResult)) {
					path = this.fixedEmailAddressesPath;
					message = textUtils.addBreakLine(this.createFixResultTemplate(validationResult));
				}
				break;
			case LogStatus.INVALID:
				if (this.logData.isLogInvalidEmailAddresses && this.isLogInvalidEmailAddress(validationResult)) {
					path = this.invalidEmailAddressesPath;
					message = textUtils.addBreakLine(this.createInvalidResultTemplate(validationResult));
				}
				break;
			case LogStatus.UNSAVE:
				if (this.logData.isLogUnsaveEmailAddresses) {
					path = this.unsaveEmailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), original);
				}
				break;
			case LogStatus.GIBBERISH:
				if (this.logData.isLogGibberishEmailAddresses) {
					path = this.gibberishEmailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), fix ? fix : original);
				}
				break;
		}
		// In case no log status is relevant to log, don't log anything.
		if (path && message) {
			await fileUtils.appendFile({
				targetPath: path,
				message: message
			});
		}
	}

	async logLinks(links) {
		if (links && this.logData.isLogCrawlLinks) {
			await fileUtils.appendFile({
				targetPath: this.crawlLinksPath,
				message: links
			});
		}
	}

	async logErrorLink(link) {
		if (link && this.logData.isLogCrawlErrorLinks) {
			await fileUtils.appendFile({
				targetPath: this.crawlErrorLinksPath,
				message: textUtils.addBreakLine(link)
			});
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
		const fixedDomainPart = domainPart + new Array(Math.abs(domainPart.length - this.logData.maximumFixLogSpacesCharactersCount)).join(' ');
		return `${fixedDomainPart} | ${textUtils.getNumberWithCommas(counter)}`;
	}

	createLineTemplate(title, value) {
		return textUtils.addBreakLine(`${logUtils.logColor(`${title}:`, Color.MAGENTA)} ${value}`);
	}

	createConfirmSettingsTemplate(settings) {
		const searchEngines = searchService.getAllActiveSearchEngines().map(engine => engine.name).join(', ');
		const parameters = ['IS_PRODUCTION_MODE', 'IS_DROP_COLLECTION', 'IS_STATUS_MODE', 'IS_EMPTY_DIST_DIRECTORY',
			'IS_RUN_DOMAINS_COUNTER', 'IS_LONG_RUN', 'IS_GIBBERISH_VALIDATION_ACTIVE', 'GOAL_TYPE', 'GOAL_VALUE', 'SEARCH_KEY',
			'IS_LINKS_METHOD_ACTIVE', 'IS_CRAWL_METHOD_ACTIVE', 'IS_SKIP_LOGIC', 'MAXIMUM_MINUTES_WITHOUT_UPDATE',
			'IS_LOG_VALID_EMAIL_ADDRESSES', 'IS_LOG_FIX_EMAIL_ADDRESSES', 'IS_LOG_INVALID_EMAIL_ADDRESSES', 'IS_LOG_GIBBERISH_EMAIL_ADDRESSES',
			'IS_LOG_UNSAVE_EMAIL_ADDRESSES', 'IS_LOG_CRAWL_LINKS', 'IS_LOG_CRAWL_ERROR_LINKS'];
		let settingsText = this.createLineTemplate('SEARCH ENGINES', searchEngines);
		settingsText += this.createLineTemplate('DATABASE', mongoDatabaseUtils.getMongoDatabaseModeName(settings));
		settingsText += Object.keys(settings).filter(s => parameters.indexOf(s) > -1)
			.map(k => this.createLineTemplate(k, settings[k])).join('');
		settingsText = textUtils.removeLastCharacter(settingsText);
		return `${textUtils.setLogStatus('IMPORTANT SETTINGS')}
${settingsText}
========================
OK to run? (y = yes)`;
	}

	logScore(emailAddressesList, score, domain) {
		// Calculate parentage.
		const parentage = textUtils.calculatePercentageDisplay({
			partialValue: score,
			totalValue: emailAddressesList.length
		});
		logUtils.log('===========================================================');
		logUtils.log(`${domain ? `Domain: ${domain} | ` : ''}Score: ${score}/${emailAddressesList.length} (${parentage})`);
	}

	logGeneratorResult(result) {
		logUtils.log(`${result.name} ---> ${result.result}`);
	}
}

module.exports = new LogService();