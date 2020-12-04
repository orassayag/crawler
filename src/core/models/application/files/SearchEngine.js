class SearchEngine {

    constructor(data) {
        const { name, baseURL, startIndex, advanceBy, templatesList } = data;
        this.name = name;
        this.baseURL = baseURL;
        this.startIndex = startIndex;
        this.advanceBy = advanceBy;
        this.domainAddress = null;
        this.templatesList = templatesList;
    }
}

module.exports = SearchEngine;