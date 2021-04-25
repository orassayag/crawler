const url = require('url');
const isReachable = require('is-reachable');
const { LinksResultModel } = require('../../core/models/application');
const { GoalTypeEnum, SourceTypeEnum } = require('../../core/enums');
const { filterLinkDomains, filterLinkFileExtensions, globalFilterLinkDomains } = require('../../configurations');
const logService = require('./log.service');
const searchService = require('./search.service');
const sourceService = require('./source.service');
const globalUtils = require('../../utils/files/global.utils');
const { crawlUtils, regexUtils, textUtils, validationUtils } = require('../../utils');

class CrawlLinkService {

	constructor() {
		this.totalCrawlCount = 0;
		this.goalValue = 0;
		this.replaceGoogleweblight = 'googleweblight.com/fp%3Fu%3D';
		this.timeout = null;
		this.maximumURLValidationCount = null;
		this.millisecondsTimeoutURLValidation = null;
	}

	async initiate(data) {
		const { applicationDataModel, countLimitDataModel } = data;
		this.timeout = countLimitDataModel.millisecondsTimeoutSourceRequestCount;
		this.goalValue = applicationDataModel.goalType === GoalTypeEnum.LINKS ? applicationDataModel.goalValue : null;
		this.maximumURLValidationCount = countLimitDataModel.maximumURLValidationCount;
		this.millisecondsTimeoutURLValidation = countLimitDataModel.millisecondsTimeoutURLValidation;
		// Initiate the search engines.
		await this.initiateSearchEngines(applicationDataModel);
		// Initiate filter link domains.
		this.initiateFilterLinkDomains();
		// Validate active search engines.
		this.validateActiveSearchEngines();
	}

	async initiateSearchEngines(applicationDataModel) {
		const searchEngines = searchService.getAllActiveSearchEngines();
		for (let i = 0, length = searchEngines.length; i < length; i++) {
			const { name, baseURL } = searchEngines[i];
			// Set the domains in the search engines.
			let isActive = true;
			const domainAddress = this.getDomainFromLink({
				link: baseURL,
				isRemovePrefix: true
			});
			if (applicationDataModel.isProductionMode) {
				// Validate the search engine activity.
				isActive = await this.validateSearchEngineActive(domainAddress);
			}
			searchService.updateSearchEngineData({
				name: name,
				domainAddress: domainAddress,
				isActive: isActive
			});
		}
	}

	initiateFilterLinkDomains() {
		for (let i = 0, length = filterLinkDomains.length; i < length; i++) {
			filterLinkDomains[i].domains = textUtils.removeDuplicates(filterLinkDomains[i].domains.concat(globalFilterLinkDomains));
		}
	}

	validateActiveSearchEngines() {
		const searchEngines = searchService.getAllActiveSearchEngines();
		if (!validationUtils.isExists(searchEngines)) {
			throw new Error('No active search engine was found (1000004)');
		}
	}

	async validateSearchEngineActive(searchEngineLink) {
		let isConnected = true;
		for (let i = 0; i < this.maximumURLValidationCount; i++) {
			try {
				isConnected = await isReachable(searchEngineLink);
			} catch (error) {
				isConnected = false;
			}
			if (isConnected) {
				break;
			}
			else {
				await globalUtils.sleep(this.millisecondsTimeoutURLValidation);
			}
		}
		return isConnected;
	}

	getLinks(data) {
		if (!validationUtils.isExists(data)) {
			return [];
		}
		return data.toString().match(regexUtils.findLinkRegex);
	}

	removeDomainPrefix(domain) {
		// Remove the 'www' prefix if it exists.
		if (domain && domain.startsWith('www')) {
			domain = textUtils.getSplitDotParts(domain).slice(1).join('.');
		}
		return domain;
	}

	getDomainFromLink(data) {
		const { link, isRemovePrefix } = data;
		if (!validationUtils.isExists(link)) {
			return '';
		}
		let domain = '';
		try {
			domain = url.parse(textUtils.toLowerCaseTrim(link)).hostname;
		} catch (error) { }
		if (isRemovePrefix) {
			domain = this.removeDomainPrefix(domain);
		}
		return domain;
	}

	fixLinks(linksList) {
		linksList = linksList.map(link => {
			let fixedLink = link;
			if (link) {
				if (link.endsWith('/')) {
					fixedLink = textUtils.removeLastCharacters({
						value: link,
						charactersCount: 1
					});
				}
				const googleweblightIndex = fixedLink.indexOf(this.replaceGoogleweblight);
				if (googleweblightIndex > -1) {
					fixedLink = fixedLink.substring(googleweblightIndex + this.replaceGoogleweblight.length);
				}
			}
			return fixedLink;
		});
		linksList = textUtils.removeDuplicates(linksList);
		return linksList;
	}

	isFilterLink(data) {
		const { link, searchEngineModel, filterLinkDomainsList } = data;
		// Filter the link if it contains it's own self domain address.
		if (link.indexOf(searchEngineModel.domainAddress) > -1) {
			return true;
		}
		// Filter the link if it contains invalid file from a list.
		if (textUtils.checkExistence(filterLinkFileExtensions, link)) {
			return true;
		}
		// Filter the link if it's found in the filter domains list of the specific search engine.
		if (textUtils.checkExistence(filterLinkDomainsList, link)) {
			return true;
		}
		return false;
	}

	filterLinks(data) {
		const { linksList, searchEngineModel } = data;
		const filterLinkDomainsList = filterLinkDomains.find(se => se.name === searchEngineModel.name).domains;
		const updatedLinksList = [];
		for (let i = 0, length = linksList.length; i < length; i++) {
			const originalLink = linksList[i];
			const link = textUtils.toLowerCase(originalLink);
			const isFilter = this.isFilterLink({
				link: link,
				searchEngineModel: searchEngineModel,
				filterLinkDomainsList: filterLinkDomainsList
			});
			if (isFilter) {
				continue;
			}
			// Check if the goal isn't complete already. If so, stop the loop and return.
			if (this.checkGoalComplete()) {
				break;
			}
			this.totalCrawlCount++;
			updatedLinksList.push(originalLink);
		}
		return updatedLinksList;
	}

	async logLinks(linksList) {
		// Log all the links to a TXT file.
		let logLinks = '';
		for (let i = 0, length = linksList.length; i < length; i++) {
			logLinks += textUtils.addBreakLine(linksList[i]);
		}
		await logService.logLinks(logLinks);
	}

	checkGoalComplete() {
		return this.goalValue ? this.goalValue === this.totalCrawlCount : false;
	}

	getSessionTestPageLinks(linksList) {
		const linksResultModel = new LinksResultModel();
		linksResultModel.isValidPage = true;
		linksResultModel.totalCount = linksList.length;
		linksResultModel.crawlCount = linksList.length;
		linksResultModel.filterCount = linksResultModel.totalCount - linksList.length;
		linksResultModel.crawlLinksList = linksList.map(l => {
			const { link, userAgent } = l;
			return {
				link: link,
				userAgent: userAgent ? userAgent : crawlUtils.getRandomUserAgent()
			};
		});
		return linksResultModel;
	}

	getSearchEnginePageLinks(data) {
		return new Promise(async (resolve, reject) => {
			// Limit the runtime of this function in case of a stuck URL crawling process.
			const abortTimeout = setTimeout(() => {
				reject(null);
				return;
			}, this.timeout);
			const { searchProcessDataModel, totalCrawlCount } = data;
			const linksResultModel = new LinksResultModel();
			this.totalCrawlCount = totalCrawlCount;
			if (this.checkGoalComplete()) {
				clearTimeout(abortTimeout);
				resolve(linksResultModel);
				return;
			}
			// Get the engine page source by the search key and the links list within the source.
			const pageResults = await sourceService.getPageSource({
				sourceType: SourceTypeEnum.ENGINE,
				searchEngineName: searchProcessDataModel.searchEngineModel.name,
				linkData: {
					link: searchProcessDataModel.searchEngineLinkTemplate,
					userAgent: null
				}
			});
			if (!pageResults) {
				clearTimeout(abortTimeout);
				resolve(linksResultModel);
				return;
			}
			const { isValidPage, pageSource } = pageResults;
			if (!isValidPage) {
				await logService.logErrorLink(searchProcessDataModel.searchEngineLinkTemplate);
			}
			linksResultModel.isValidPage = isValidPage;
			// Get all the links from the search engine source.
			let linksList = this.getLinks(pageSource);
			if (!validationUtils.isExists(linksList)) {
				clearTimeout(abortTimeout);
				resolve(linksResultModel);
				return;
			}
			linksResultModel.totalCount = linksList.length;
			// Remove duplicate links.
			linksList = textUtils.removeDuplicates(linksList);
			// Remove last '/' if exists and remove duplicates again.
			linksList = this.fixLinks(linksList);
			// Filter links.
			linksList = this.filterLinks({
				linksList: linksList,
				searchEngineModel: searchProcessDataModel.searchEngineModel
			});
			// Log the links to TXT file.
			await this.logLinks(linksList);
			linksResultModel.crawlCount = linksList.length;
			linksResultModel.filterCount = linksResultModel.totalCount - linksList.length;
			linksResultModel.crawlLinksList = linksList.map(l => {
				return {
					link: l,
					userAgent: crawlUtils.getRandomUserAgent()
				};
			});
			clearTimeout(abortTimeout);
			resolve(linksResultModel);
		}).catch();
	}
}

module.exports = new CrawlLinkService();