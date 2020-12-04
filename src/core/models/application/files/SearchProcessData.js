class SearchProcessData {

	constructor(data) {
		this.pageIndex = null;
		this.searchKey = null;
		this.displaySearchKey = null;
		this.searchEngine = null;
		this.searchEngineLinkTemplate = null;
		this.pageLink = null;
		this.pageUserAgent = null;
		if (data) {
			const { pageIndex, searchKey, displaySearchKey, searchEngine, searchEngineLinkTemplate } = data;
			this.pageIndex = pageIndex;
			this.searchKey = searchKey;
			this.displaySearchKey = displaySearchKey;
			this.searchEngine = searchEngine;
			this.searchEngineLinkTemplate = searchEngineLinkTemplate;
		}
	}
}

module.exports = SearchProcessData;