class SearchData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { SEARCH_KEY, IS_ADVANCE_SEARCH_KEYS } = settings;
		this.searchKey = SEARCH_KEY;
		this.isAdvanceSearchKeys = IS_ADVANCE_SEARCH_KEYS;
	}
}

module.exports = SearchData;