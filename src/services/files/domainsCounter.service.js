const settings = require('../../settings/settings');
const { ApplicationData, CountLimitData, DomainCounter, MongoDatabaseData, PathData } = require('../../core/models/application');
const { Color, DomainsCounterSourceType, ScriptType } = require('../../core/enums');
const { activeSearchEngineNames } = require('../../configurations');
const logService = require('./log.service');
const mongoDatabaseService = require('./mongoDatabase.service');
const { emailAddressUtils, fileUtils, logUtils, textUtils, validationUtils } = require('../../utils');

class DomainsCounterService {

	constructor() {
		// ===COUNT & LIMIT=== //
		this.countLimitData = null;
		// ===MONGO DATABASE=== //
		this.mongoDatabaseData = null;
		// ===PATH=== //
		this.pathData = null;
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
		this.log('INITIATE THE SERVICES', Color.MAGENTA);
		// ===APPLICATION=== //
		this.applicationData = new ApplicationData({
			settings: settings,
			activeSearchEngineNames: activeSearchEngineNames,
			status: null,
			method: null,
			restartsCount: 0
		});
		// ===COUNT & LIMIT=== //
		this.countLimitData = new CountLimitData(settings);
		// ===MONGO DATABASE=== //
		this.mongoDatabaseData = new MongoDatabaseData(settings);
		// ===PATH=== //
		this.pathData = new PathData(settings);
		// Initiate the Mongo database service.
		await mongoDatabaseService.initiate({
			countLimitData: this.countLimitData,
			mongoDatabaseData: this.mongoDatabaseData
		});
	}

	validation() {
		if (!validationUtils.isValidEnum({
			enum: DomainsCounterSourceType,
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
			case DomainsCounterSourceType.FILE: {
				if (!this.sourcePath) {
					throw new Error('No sourcePath was provided (1000006)');
				}
				if (await fileUtils.isPathExists(this.sourcePath)) {
					this.sourceContent = await fileUtils.readFile(this.sourcePath);
				}
				break;
			}
			case DomainsCounterSourceType.DIRECTORY: {
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
			case DomainsCounterSourceType.DATABASE: {
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
			case DomainsCounterSourceType.FILE:
			case DomainsCounterSourceType.DIRECTORY: {
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
			this.domainsList.push(new DomainCounter(domainPart));
		}
	}

	countDomains() {
		this.log('COUNT THE DOMAINS', Color.MAGENTA);
		if (!validationUtils.isExists(this.emailAddressesList)) {
			return;
		}
		for (let i = 0, length = this.emailAddressesList.length; i < length; i++) {
			this.countDomain(this.emailAddressesList[i]);
		}
	}

	sortDomains() {
		// Sort by count and then by alphabetic.
		this.log('SORT THE DOMAINS', Color.MAGENTA);
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
			applicationData: this.applicationData,
			pathData: this.pathData,
			scriptData: domainsCounterData,
			scriptType: ScriptType.DOMAINS
		});
		this.log('ALL DONE', Color.GREEN);
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