const settings = require('../../settings/settings');
const { ApplicationDataModel, CountLimitDataModel, DomainCounterModel, MongoDatabaseDataModel, PathDataModel } = require('../../core/models/application');
const { ColorEnum, DomainsCounterSourceTypeEnum, ScriptTypeEnum } = require('../../core/enums');
const { activeSearchEngineNames } = require('../../configurations');
const logService = require('./log.service');
const mongoDatabaseService = require('./mongoDatabase.service');
const { emailAddressUtils, fileUtils, logUtils, textUtils, validationUtils } = require('../../utils');

class DomainsCounterService {

	constructor() {
		// ===COUNT & LIMIT=== //
		this.countLimitDataModel = null;
		// ===MONGO DATABASE=== //
		this.mongoDatabaseDataModel = null;
		// ===PATH=== //
		this.pathDataModel = null;
		this.isLogs = null;
		this.sourceType = null;
		this.sourcePath = null;
		this.sourceContent = null;
		this.emailAddressesList = [];
		this.domainsList = [];
		this.isPartOfCrawLogic = null;
	}

	async run(data) {
		// Initiate the logs service.
		await this.initiate(data);
		// Validate selected parameters.
		this.validation();
		// Start the domains counter process.
		await this.startCountDomains();
		// Close Mongo database.
		await mongoDatabaseService.closeConnection();
	}

	async initiate(data) {
		const { sourceType, sourcePath, isLogs, isPartOfCrawLogic } = data;
		this.isLogs = isLogs;
		this.isPartOfCrawLogic = isPartOfCrawLogic;
		this.sourceType = sourceType;
		this.sourcePath = sourcePath;
		this.log('INITIATE THE SERVICES', ColorEnum.MAGENTA);
		// ===APPLICATION=== //
		this.applicationDataModel = new ApplicationDataModel({
			settings: settings,
			activeSearchEngineNames: activeSearchEngineNames,
			status: null,
			method: null,
			restartsCount: 0
		});
		// ===COUNT & LIMIT=== //
		this.countLimitDataModel = new CountLimitDataModel(settings);
		// ===MONGO DATABASE=== //
		this.mongoDatabaseDataModel = new MongoDatabaseDataModel(settings);
		// ===PATH=== //
		this.pathDataModel = new PathDataModel(settings);
		// Initiate the Mongo database service.
		await mongoDatabaseService.initiate({
			countLimitDataModel: this.countLimitDataModel,
			mongoDatabaseDataModel: this.mongoDatabaseDataModel
		});
	}

	validation() {
		if (!validationUtils.isValidEnum({
			enum: DomainsCounterSourceTypeEnum,
			value: this.sourceType
		})) {
			throw new Error('Invalid sourceType selected (1000005)');
		}
	}

	async startCountDomains() {
		// Get the source content of the email addresses.
		await this.getSourceContent();
		// Crawl and fetch the email addresses.
		this.getEmailAddresses();
		// Count the domains.
		this.countDomains();
		// Sort the data.
		await this.sortDomains();
		// Log to a TXT file.
		await this.logDomainsCounter();
	}

	async getSourceContent() {
		let filePaths = [];
		switch (this.sourceType) {
			case DomainsCounterSourceTypeEnum.FILE: {
				if (!this.sourcePath) {
					throw new Error('No sourcePath was provided (1000006)');
				}
				if (await fileUtils.isPathExists(this.sourcePath)) {
					this.sourceContent = await fileUtils.readFile(this.sourcePath);
				}
				break;
			}
			case DomainsCounterSourceTypeEnum.DIRECTORY: {
				if (!this.sourcePath) {
					throw new Error('No sourcePath was provided (1000007)');
				}
				if (await fileUtils.isPathExists(this.sourcePath)) {
					filePaths = await fileUtils.getFilesRecursive(this.sourcePath);
				}
				for (let i = 0, length = filePaths.length; i < length; i++) {
					this.sourceContent += await fileUtils.readFile(filePaths[i]);
				}
				break;
			}
			case DomainsCounterSourceTypeEnum.DATABASE: {
				this.emailAddressesList = await mongoDatabaseService.getAllEmailAddresses();
				if (validationUtils.isExists(this.emailAddressesList)) {
					this.emailAddressesList = this.emailAddressesList.map(e => e.emailAddress);
				}
				break;
			}
		}
	}

	getEmailAddresses() {
		switch (this.sourceType) {
			case DomainsCounterSourceTypeEnum.FILE:
			case DomainsCounterSourceTypeEnum.DIRECTORY: {
				if (!this.isPartOfCrawLogic && !this.sourceContent) {
					throw new Error('Empty sourceContent was provided (1000008)');
				}
				this.emailAddressesList = emailAddressUtils.getEmailAddresses(this.sourceContent);
				break;
			}
		}
		// Remove duplicates.
		this.emailAddressesList = textUtils.removeDuplicates(this.emailAddressesList);
	}

	countDomain(emailAddress) {
		let domainPart = null;
		try {
			domainPart = emailAddressUtils.getEmailAddressParts(emailAddress)[1];
		}
		catch (error) { }
		if (!domainPart) {
			return;
		}
		domainPart = textUtils.toLowerCaseTrim(domainPart);
		const domainCounterIndex = this.domainsList.findIndex(d => d.domainPart === domainPart);
		// Insert / update the list.
		if (domainCounterIndex > -1) {
			this.domainsList[domainCounterIndex].counter++;
		}
		else {
			this.domainsList.push(new DomainCounterModel(domainPart));
		}
	}

	countDomains() {
		this.log('COUNT THE DOMAINS', ColorEnum.MAGENTA);
		if (!validationUtils.isExists(this.emailAddressesList)) {
			return;
		}
		for (let i = 0, length = this.emailAddressesList.length; i < length; i++) {
			this.countDomain(this.emailAddressesList[i]);
		}
	}

	sortDomains() {
		// Sort by count and then by alphabetic.
		this.log('SORT THE DOMAINS', ColorEnum.MAGENTA);
		return new Promise((resolve) => {
			this.domainsList.sort((ob1, ob2) => {
				if (ob1.counter > ob2.counter) {
					return 1;
				} else if (ob1.counter < ob2.counter) {
					return -1;
				}
				// Else go to the second item.
				if (ob1.domainPart < ob2.domainPart) {
					return -1;
				} else if (ob1.domainPart > ob2.domainPart) {
					return 1;
				} else { // Nothing to split them.
					return 0;
				}
			});
			resolve(this.domainsList);
		}).catch();
	}

	async logDomainsCounter() {
		if (!validationUtils.isExists(this.domainsList)) {
			return;
		}
		let domainsCounterData = '';
		for (let i = 0, length = this.domainsList.length; i < length; i++) {
			domainsCounterData += textUtils.addBreakLine(logService.createDomainCounterTemplate(this.domainsList[i]));
		}
		await logService.logScript({
			applicationDataModel: this.applicationDataModel,
			pathDataModel: this.pathDataModel,
			scriptData: domainsCounterData,
			scriptType: ScriptTypeEnum.DOMAINS
		});
		this.log('ALL DONE', ColorEnum.GREEN);
	}

	log(message, color) {
		if (this.isLogs) {
			logUtils.logColorStatus({
				status: message,
				color: color
			});
		}
	}
}

module.exports = new DomainsCounterService();