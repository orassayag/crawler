class SearchProcessDataModel {

	constructor(data) {
		this.pageIndex = null;
		this.searchKey = null;
		this.displaySearchKey = null;
		this.searchEngineModel = null;
		this.searchEngineLinkTemplate = null;
		this.pageLink = null;
		this.pageUserAgent = null;
		if (data) {
			const { pageIndex, searchKey, displaySearchKey, searchEngineModel, searchEngineLinkTemplate } = data;
			this.pageIndex = pageIndex;
			this.searchKey = searchKey;
			this.displaySearchKey = displaySearchKey;
			this.searchEngineModel = searchEngineModel;
			this.searchEngineLinkTemplate = searchEngineLinkTemplate;
		}
	}
}

module.exports = SearchProcessDataModel;