const { ColorEnum, LogStatusEnum, MethodEnum, PlaceholderEnum, StatusIconEnum } = require('../../core/enums');
const { invalidEmailAddresses } = require('../../configurations');
const emailAddressValidationService = require('./emailAddressValidation.service');
const puppeteerService = require('./puppeteer.service');
const searchService = require('./search.service');
const { fileUtils, logUtils, mongoDatabaseUtils, pathUtils, textUtils, timeUtils, validationUtils } = require('../../utils');

class LogService {

	constructor() {
		this.logDataModel = null;
		this.applicationDataModel = null;
		this.mongoDatabaseDataModel = null;
		this.searchProcessDataModel = null;
		this.countLimitDataModel = null;
		this.pathDataModel = null;
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
		const { logDataModel, applicationDataModel, mongoDatabaseDataModel, countLimitDataModel, pathDataModel } = data;
		this.logDataModel = logDataModel;
		this.applicationDataModel = applicationDataModel;
		this.mongoDatabaseDataModel = mongoDatabaseDataModel;
		this.countLimitDataModel = countLimitDataModel;
		this.pathDataModel = pathDataModel;
		this.isLogs = (this.logDataModel.isLogValidEmailAddresses || this.logDataModel.isLogFixEmailAddresses ||
			this.logDataModel.isLogInvalidEmailAddresses || this.logDataModel.isLogUnsaveEmailAddresses ||
			this.logDataModel.isLogGibberishEmailAddresses || this.logDataModel.isLogCrawlLinks ||
			this.logDataModel.isLogCrawlErrorLinks);
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
		// If you change the 'email_addresses_' file name, change it also in the 'sender' project.
		if (this.logDataModel.isLogValidEmailAddresses) {
			this.emailAddressesPath = this.createFilePath(`email_addresses_${PlaceholderEnum.DATE}`);
		}
		if (this.logDataModel.isLogFixEmailAddresses) {
			this.fixedEmailAddressesPath = this.createFilePath(`fixed_email_addresses_${PlaceholderEnum.DATE}`);
		}
		if (this.logDataModel.isLogInvalidEmailAddresses) {
			this.invalidEmailAddressesPath = this.createFilePath(`invalid_email_addresses_${PlaceholderEnum.DATE}`);
		}
		if (this.logDataModel.isLogUnsaveEmailAddresses) {
			this.unsaveEmailAddressesPath = this.createFilePath(`unsave_email_addresses_${PlaceholderEnum.DATE}`);
		}
		if (this.logDataModel.isLogGibberishEmailAddresses) {
			this.gibberishEmailAddressesPath = this.createFilePath(`gibberish_email_addresses_${PlaceholderEnum.DATE}`);
		}
		if (this.logDataModel.isLogCrawlLinks) {
			this.crawlLinksPath = this.createFilePath(`crawl_links_${PlaceholderEnum.DATE}`);
		}
		if (this.logDataModel.isLogCrawlErrorLinks) {
			this.crawlErrorLinksPath = this.createFilePath(`crawl_error_links_${PlaceholderEnum.DATE}`);
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
			targetPath: this.pathDataModel.distPath,
			targetName: textUtils.toLowerCase(this.applicationDataModel.mode)
		});
		fileUtils.createDirectory(this.baseSessionPath);
	}

	createSessionDirectory() {
		this.sessionDirectoryPath = pathUtils.getJoinPath({
			targetPath: this.baseSessionPath,
			targetName: `${this.getNextDirectoryIndex()}_${this.applicationDataModel.logDateTime}`
		});
		fileUtils.createDirectory(this.sessionDirectoryPath);
	}

	createFilePath(fileName) {
		const isDate = fileName.indexOf(PlaceholderEnum.DATE) > -1;
		return pathUtils.getJoinPath({
			targetPath: this.sessionDirectoryPath ? this.sessionDirectoryPath : this.pathDataModel.distPath,
			targetName: `${isDate ? fileName.replace(PlaceholderEnum.DATE, this.applicationDataModel.logDateTime) : fileName}.txt`
		});
	}

	async clearLogFiles() {
		if (this.logDataModel.isEmptyDistDirectory) {
			await fileUtils.emptyDirectory(this.baseSessionPath);
		}
	}

	getMethods() {
		return [this.applicationDataModel.isLinksMethodActive ? MethodEnum.LINKS : '',
		this.applicationDataModel.isCrawlMethodActive ? MethodEnum.CRAWL : ''].join(',');
	}

	logStatus(applicationDataModel) {
		const time = `Time: ${applicationDataModel.time}`;
		const processIndex = `processIndex: ${applicationDataModel.processIndex}/${this.countLimitDataModel.maximumSearchProcessesCount - 1}`;
		const pageIndex = `pageIndex: ${applicationDataModel.pageIndex}/${this.countLimitDataModel.maximumSearchEnginePagesPerProcessCount - 1}`;
		const pageLinksIndex = `pageLinksIndex: ${applicationDataModel.pageLinksIndex}/${applicationDataModel.pageLinksCount - 1}`;
		logUtils.log(`${time} | ${processIndex} | ${pageIndex} | ${pageLinksIndex}`);
	}

	logProgress(logDataModel) {
		const { applicationDataModel, searchProcessDataModel } = logDataModel;
		if (!applicationDataModel || !searchProcessDataModel) {
			return;
		}
		this.applicationDataModel = applicationDataModel;
		this.searchProcessDataModel = searchProcessDataModel;
		const time = `${this.applicationDataModel.time} [${this.frames[this.i = ++this.i % this.frames.length]}]`;
		const methods = textUtils.removeLastCharacterLoop({ text: this.getMethods(), character: ',' });
		const goal = textUtils.replaceCharacter(this.applicationDataModel.goalType, '_', ' ');
		const progress = textUtils.getNumberOfNumber({ number1: this.applicationDataModel.progressValue, number2: this.applicationDataModel.goalValue });
		const percentage = textUtils.calculatePercentageDisplay({ partialValue: this.applicationDataModel.progressValue, totalValue: this.applicationDataModel.goalValue });
		const process = textUtils.getNumberOfNumber({ number1: this.applicationDataModel.processIndex + 1, number2: this.countLimitDataModel.maximumSearchProcessesCount });
		const crawlLinks = `${StatusIconEnum.V}  ${this.applicationDataModel.crawlLinkDataModel.crawlCount}`;
		const saveEmailAddress = `${StatusIconEnum.V}  ${textUtils.getNumberWithCommas(this.applicationDataModel.crawlEmailAddressDataModel.saveCount)}`;
		const invalidEmailAddress = `${StatusIconEnum.X}  ${this.applicationDataModel.crawlEmailAddressDataModel.invalidCount}`;
		const pageIndex = textUtils.getNumberOfNumber({ number1: this.applicationDataModel.pageIndex + 1, number2: this.countLimitDataModel.maximumSearchEnginePagesPerProcessCount });
		const link = this.applicationDataModel.pageLinksCount ?
			textUtils.getNumberOfNumber({ number1: this.applicationDataModel.pageLinksIndex + 1, number2: this.applicationDataModel.pageLinksCount }) : '(-)';
		const trending = textUtils.cutText({ text: this.applicationDataModel.trendingSaveList.join(' | '), count: this.countLimitDataModel.maximumConsoleLineCharacters });
		const page = textUtils.cutText({ text: this.searchProcessDataModel.pageLink, count: this.countLimitDataModel.maximumConsoleLineCharacters });
		const engine = textUtils.upperCaseFirstLetter(this.searchProcessDataModel.searchEngineModel.name, 0);
		const userAgent = this.searchProcessDataModel.pageUserAgent ? textUtils.cutText({ text: this.searchProcessDataModel.pageUserAgent, count: this.countLimitDataModel.maximumConsoleLineCharacters }) : '';
		const search = textUtils.cutText({ text: this.searchProcessDataModel.searchEngineLinkTemplate, count: this.countLimitDataModel.maximumConsoleLineCharacters });
		const statistics = textUtils.getObjectKeyValues(this.applicationDataModel.crawlEmailAddressDataModel.statistics);
		logUtils.logProgress({
			titlesList: ['SETTINGS', 'GENERAL', 'PROCESS', 'LINK', 'EMAIL ADDRESS', `PAGE (${link})`,
				'USER AGENT', `SEARCH (${pageIndex})`, 'TRENDING', 'STATISTICS'],
			colorsTitlesList: [ColorEnum.BLUE, ColorEnum.BLUE, ColorEnum.BLUE, ColorEnum.BLUE, ColorEnum.BLUE,
			ColorEnum.BLUE, ColorEnum.BLUE, ColorEnum.BLUE, ColorEnum.BLUE, ColorEnum.BLUE],
			keysLists: [{
				'Mode': this.applicationDataModel.mode,
				'Plan': this.applicationDataModel.plan,
				'Database': this.mongoDatabaseDataModel.mongoDatabaseModeName,
				'Drop': this.mongoDatabaseDataModel.isDropCollection,
				'Long': this.applicationDataModel.isLongRun,
				'Active Methods': methods
			}, {
				'Time': time,
				'Goal': goal,
				'Progress': `${progress} (${percentage})`,
				'Status': this.applicationDataModel.status,
				'Restarts': this.applicationDataModel.restartsCount
			}, {
				'Process': process,
				'Page': pageIndex,
				'Engine': engine,
				'Key': this.searchProcessDataModel.displaySearchKey
			}, {
				'Crawl': crawlLinks,
				'Total': this.applicationDataModel.crawlLinkDataModel.totalCount,
				'Filter': this.applicationDataModel.crawlLinkDataModel.filterCount,
				'Error': this.applicationDataModel.crawlLinkDataModel.errorCount,
				'Error In A Row': puppeteerService.errorInARowCounter,
				'Current': link
			}, {
				'Save': saveEmailAddress,
				'Total': this.applicationDataModel.crawlEmailAddressDataModel.totalCount,
				'Database': this.applicationDataModel.crawlEmailAddressDataModel.databaseCount,
				'Exists': this.applicationDataModel.crawlEmailAddressDataModel.existsCount,
				'Invalid': invalidEmailAddress,
				'Valid Fix': this.applicationDataModel.crawlEmailAddressDataModel.validFixCount,
				'Invalid Fix': this.applicationDataModel.crawlEmailAddressDataModel.invalidFixCount,
				'Unsave': this.applicationDataModel.crawlEmailAddressDataModel.unsaveCount,
				'Filter': this.applicationDataModel.crawlEmailAddressDataModel.filterCount,
				'Skip': this.applicationDataModel.crawlEmailAddressDataModel.skipCount,
				'Gibberish': this.applicationDataModel.crawlEmailAddressDataModel.gibberishCount
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
				[ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW],
				[ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW, ColorEnum.YELLOW],
				[ColorEnum.CYAN, ColorEnum.CYAN, ColorEnum.CYAN, ColorEnum.MAGENTA],
				[ColorEnum.GREEN, ColorEnum.CYAN, ColorEnum.CYAN, ColorEnum.RED, ColorEnum.RED, ColorEnum.CYAN],
				[ColorEnum.GREEN, ColorEnum.CYAN, ColorEnum.CYAN, ColorEnum.CYAN, ColorEnum.RED, ColorEnum.GREEN,
				ColorEnum.RED, ColorEnum.RED, ColorEnum.MAGENTA, ColorEnum.YELLOW, ColorEnum.YELLOW]
			],
			nonNumericKeys: {},
			statusColor: ColorEnum.CYAN
		});
	}

	logSchedule(time) {
		logUtils.logSchedule(`STARTS IN ${time} [${this.frames[this.y = ++this.y % this.frames.length]}]`);
	}

	createWrapTemplate(isPathExists, original) {
		return isPathExists ? `, ${original}` : original;
	}

	async logScript(data) {
		const { applicationDataModel, pathDataModel, scriptData, scriptType } = data;
		this.applicationDataModel = applicationDataModel;
		this.pathDataModel = pathDataModel;
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

	isLogInvalidEmailAddress(validationResultModel) {
		return invalidEmailAddresses.findIndex(e => e.emailAddress === validationResultModel.original) === -1;
	}

	// Check if to log the fixed email address according to the function id.
	isLogFixEmailAddress(validationResultModel) {
		const { functionIds } = validationResultModel;
		return validationUtils.isExists(emailAddressValidationService.logFunctionIds.filter(element => functionIds.includes(element)));
	}

	async logEmailAddress(emailAddressStatusModel) {
		if (!this.isLogs) {
			return;
		}
		const { validationResultModel, logStatus } = emailAddressStatusModel;
		const { original, fix } = validationResultModel;
		let path, message = '';
		switch (logStatus) {
			case LogStatusEnum.VALID: {
				if (this.logDataModel.isLogValidEmailAddresses) {
					path = this.emailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), fix ? fix : original);
				}
				break;
			}
			case LogStatusEnum.FIX: {
				if (this.logDataModel.isLogFixEmailAddresses && this.isLogFixEmailAddress(validationResultModel)) {
					path = this.fixedEmailAddressesPath;
					message = textUtils.addBreakLine(this.createFixResultTemplate(validationResultModel));
				}
				break;
			}
			case LogStatusEnum.INVALID: {
				if (this.logDataModel.isLogInvalidEmailAddresses && this.isLogInvalidEmailAddress(validationResultModel)) {
					path = this.invalidEmailAddressesPath;
					message = textUtils.addBreakLine(this.createInvalidResultTemplate(validationResultModel));
				}
				break;
			}
			case LogStatusEnum.UNSAVE: {
				if (this.logDataModel.isLogUnsaveEmailAddresses) {
					path = this.unsaveEmailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), original);
				}
				break;
			}
			case LogStatusEnum.GIBBERISH: {
				if (this.logDataModel.isLogGibberishEmailAddresses) {
					path = this.gibberishEmailAddressesPath;
					message = this.createWrapTemplate(await fileUtils.isPathExists(path), fix ? fix : original);
				}
				break;
			}
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
		if (links && this.logDataModel.isLogCrawlLinks) {
			await fileUtils.appendFile({
				targetPath: this.crawlLinksPath,
				message: links
			});
		}
	}

	async logErrorLink(link) {
		if (link && this.logDataModel.isLogCrawlErrorLinks) {
			await fileUtils.appendFile({
				targetPath: this.crawlErrorLinksPath,
				message: textUtils.addBreakLine(link)
			});
		}
	}

	createFixResultTemplate(validationResultModel, icon) {
		const { original, fix, isValid, functionIds } = validationResultModel;
		return `${icon ? `${icon} | ` : ''}Time: ${timeUtils.getFullTime()} | isValid: ${isValid} | original: ${original} | fix: ${fix} | functionIds: ${functionIds}`;
	}

	createInvalidResultTemplate(validationResultModel) {
		const { original, functionIds } = validationResultModel;
		return `${original} | functionIds: ${functionIds}`;
	}

	createDomainCounterTemplate(domainCounter) {
		const { domainPart, counter } = domainCounter;
		const fixedDomainPart = domainPart + new Array(Math.abs(domainPart.length - this.logDataModel.maximumFixLogSpacesCharactersCount)).join(' ');
		return `${fixedDomainPart} | ${textUtils.getNumberWithCommas(counter)}`;
	}

	createLineTemplate(title, value) {
		return textUtils.addBreakLine(`${logUtils.logColor(`${title}:`, ColorEnum.MAGENTA)} ${value}`);
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
		settingsText = textUtils.removeLastCharacters({
			value: settingsText,
			charactersCount: 1
		});
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