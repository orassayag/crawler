const url = require('url');
const dns = require('dns');
const { validationUtils, regexUtils, textUtils } = require('../../utils');
const sourceService = require('./source.service');
const searchService = require('./search.service');
const logService = require('./log.service');
const { SourceType } = require('../../core/enums/files/search.enum');
const { filterLinkFileExtensions } = require('../../configurations/filterFileExtensions.configuration');
const { globalFilterLinkDomains, filterLinkDomains } = require('../../configurations/filterLinkDomains.configuration');
const { LinksResult } = require('../../core/models/application');
const { GoalType } = require('../../core/enums/files/system.enum');

class CrawlLinkService {

	constructor() {
		this.totalCrawlCount = 0;
		this.goalValue = 0;
	}

	async initiate(applicationData) {
		this.goalValue = applicationData.goalType === GoalType.LINKS ? applicationData.goalValue : null;
		// Initiate the search engines.
		await this.initiateSearchEngines(applicationData);
		// Initiate filter link domains.
		this.initiateFilterLinkDomains();
		// Validate active search engines.
		this.validateActiveSearchEngines();
	}

	async initiateSearchEngines(applicationData) {
		const searchEngines = searchService.getAllActiveSearchEngines();
		for (let i = 0, length = searchEngines.length; i < length; i++) {
			const { name, templateAddress } = searchEngines[i];
			// Set the domains in the search engines.
			let isActive = true;
			const domainAddress = this.getDomainFromLink({ link: templateAddress, isRemovePrefix: true });
			if (applicationData.isProductionMode) {
				// Validate the search engine activity.
				isActive = await this.validateSearchEngineActive(domainAddress);
			}
			searchService.updateSearchEngineData({ name: name, domainAddress: domainAddress, isActive: isActive });
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
			throw new Error('No active search engine was found (1000005)');
		}
	}

	isSearchEngineActive(searchEngineLink) {
		return new Promise(resolve => {
			dns.lookup(searchEngineLink, (error) => {
				resolve(error ? false : true);
			});
		});
	}

	async validateSearchEngineActive(searchEngineLink) {
		let isActive = true;
		try {
			isActive = await this.isSearchEngineActive(searchEngineLink);
		} catch (error) { isActive = false; }
		return isActive;
	}

	getLinks(data) {
		if (!validationUtils.isExists(data)) {
			return [];
		}
		return data.toString().match(regexUtils.findLinkRegex);
	}

	removeDomainPrefix(domain) {
		// Remove the 'www' prefix if exists.
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
			if (link && link.endsWith('/')) {
				return textUtils.removeLastCharacters({ value: link, charactersCount: 1 });
			}
			return link;
		});
		linksList = textUtils.removeDuplicates(linksList);
		return linksList;
	}

	isFilterLink(data) {
		const { link, searchEngine, filterLinkDomainsList } = data;
		// Filter the link if the it's contains it's own self domain address.
		if (link.indexOf(searchEngine.domainAddress) > -1) {
			return true;
		}
		// Filter the link if it's contains invalid file from a list.
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
		const { linksList, searchEngine } = data;
		const filterLinkDomainsList = filterLinkDomains.find(se => se.name === searchEngine.name).domains;
		const updatedLinksList = [];
		for (let i = 0, length = linksList.length; i < length; i++) {
			const originalLink = linksList[i];
			const link = textUtils.toLowerCase(originalLink);
			const isFilter = this.isFilterLink({ link: link, searchEngine: searchEngine, filterLinkDomainsList: filterLinkDomainsList });
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

	async getSearchEnginePageLinks(data) {
		const { searchProcessData, totalCrawlCount } = data;
		const linksResult = new LinksResult();
		this.totalCrawlCount = totalCrawlCount;
		if (this.checkGoalComplete()) {
			return linksResult;
		}
		// Get the engine page source by the search key and the links list within the source.
		const { isValidPage, pageSource } = await sourceService.getPageSource({
			sourceType: SourceType.ENGINE,
			searchEngine: searchProcessData.searchEngine.name,
			link: searchProcessData.searchEngineLinkTemplate
		});
		if (!isValidPage) {
			await logService.logErrorLink(searchProcessData.searchEngineLinkTemplate);
		}
		linksResult.isValidPage = isValidPage;
		// Get all the links from the search engine source.
		let linksList = this.getLinks(pageSource);
		if (!validationUtils.isExists(linksList)) {
			return linksResult;
		}
		linksResult.totalCount = linksList.length;
		// Remove duplicate links.
		linksList = textUtils.removeDuplicates(linksList);
		// Remove last '/' if exists and remove duplicates again.
		linksList = this.fixLinks(linksList);
		// Filter links.
		linksList = this.filterLinks({ linksList: linksList, searchEngine: searchProcessData.searchEngine });
		// Log the links to TXT file.
		await this.logLinks(linksList);
		linksResult.crawlCount = linksList.length;
		linksResult.filterCount = linksResult.totalCount - linksList.length;
		linksResult.crawlLinksList = linksList;
		return linksResult;
	}
}

const crawlLinkService = new CrawlLinkService();
module.exports = crawlLinkService;