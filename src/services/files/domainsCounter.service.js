const settings = require('../../settings/settings');
const { emailAddressUtils, fileUtils, textUtils, logUtils, validationUtils } = require('../../utils');
const logService = require('./log.service');
const databaseService = require('./database.service');
const { ApplicationData, DatabaseData, DomainCounter, CountsLimitsData, PathsData } = require('../../core/models/application');
const { ScriptType, DomainsCounterSourceType } = require('../../core/enums/files/script.enum');
const { Color } = require('../../core/enums/files/text.enum');

class DomainsCounterService {

	constructor() {
		// ===COUNTS & LIMITS DATA=== //
		this.countsLimitsData = null;
		// ===DATABASE DATA=== //
		this.databaseData = null;
		// ===PATHS DATA=== //
		this.pathsData = null;
		this.isLogs = null;
		this.sourceType = null;
		this.sourcePath = null;
		this.sourceContent = null;
		this.emailAddressesList = [];
		this.domainsList = [];
	}

	async run(data) {
		// Initiate the logs service.
		await this.initiate(data);
		// Validate selected parameters.
		this.validation();
		// Start the domains counter process.
		await this.startCountDomains();
		// Close database.
		await databaseService.closeConnection();
	}

	async initiate(data) {
		const { sourceType, sourcePath, isLogs } = data;
		this.isLogs = isLogs;
		this.sourceType = sourceType;
		this.sourcePath = sourcePath;
		this.log('INITIATE THE SERVICES', Color.MAGENTA);
		// ===APPLICATION DATA=== //
		this.applicationData = new ApplicationData({ settings: settings, status: null });
		// ===COUNTS & LIMITS DATA=== //
		this.countsLimitsData = new CountsLimitsData(settings);
		// ===DATABASE DATA=== //
		this.databaseData = new DatabaseData(settings);
		// ===PATHS DATA=== //
		this.pathsData = new PathsData(settings);
		// Initiate the database service.
		await databaseService.initiate({ applicationData: this.applicationData, countsLimitsData: this.countsLimitsData, databaseData: this.databaseData });
	}

	validation() {
		if (!validationUtils.isValidEnum({ enum: DomainsCounterSourceType, value: this.sourceType })) {
			throw new Error('Invalid sourceType selected (1000008)');
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
			case DomainsCounterSourceType.FILE:
				if (!this.sourcePath) {
					throw new Error('No sourcePath was provided (1000009)');
				}
				this.sourceContent = await fileUtils.readFile(this.sourcePath);
				break;
			case DomainsCounterSourceType.DIRECTORY:
				if (!this.sourcePath) {
					throw new Error('No sourcePath was provided (1000010)');
				}
				filePaths = await fileUtils.getFilesRecursive(this.sourcePath);
				for (let i = 0, length = filePaths.length; i < length; i++) {
					this.sourceContent += await fileUtils.readFile(filePaths[i]);
				}
				break;
			case DomainsCounterSourceType.DATABASE:
				this.emailAddressesList = await databaseService.getAllEmailAddresses();
				if (validationUtils.isExists(this.emailAddressesList)) {
					this.emailAddressesList = this.emailAddressesList.map(e => e.emailAddress);
				}
				break;
		}
	}

	getEmailAddresses() {
		switch (this.sourceType) {
			case DomainsCounterSourceType.FILE:
			case DomainsCounterSourceType.DIRECTORY:
				if (!this.sourceContent) {
					throw new Error('Empty sourceContent was provided (1000011)');
				}
				this.emailAddressesList = emailAddressUtils.getEmailAddresses(this.sourceContent);
				break;
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
		let domainCounterIndex = this.domainsList.findIndex(d => d.domainPart === domainPart);
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

	async sortDomains() {
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
		});
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
			pathsData: this.pathsData,
			scriptData: domainsCounterData,
			scriptType: ScriptType.DOMAINS_COUNTER
		});
		this.log('ALL DONE', Color.GREEN);
	}

	log(message, color) {
		if (this.isLogs) {
			logUtils.logColorStatus({ status: message, color: color });
		}
	}
}

const domainsCounterService = new DomainsCounterService();
module.exports = domainsCounterService;