class CrawlLinksData {

	constructor() {
		this.crawlCount = 0;
		this.totalCount = 0;
		this.filterCount = 0;
		this.errorCount = 0;
	}

	updateLinksData(searchEngineResults) {
		// Update all the data.
		const { isValidPage, crawlCount, totalCount, filterCount } = searchEngineResults;
		this.crawlCount += crawlCount;
		this.totalCount += totalCount;
		this.filterCount += filterCount;
		this.updateErrorLink(isValidPage);
	}

	updateErrorLink(isValidPage) {
		this.errorCount = isValidPage ? this.errorCount : this.errorCount + 1;
	}
}

module.exports = CrawlLinksData;