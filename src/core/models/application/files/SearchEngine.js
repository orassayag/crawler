class SearchEngine {

    constructor(data) {
        const { name, startIndex, advanceBy, templateAddress } = data;
        this.name = name;
        this.startIndex = startIndex;
        this.advanceBy = advanceBy;
        this.templateAddress = templateAddress;
        this.domainAddress = null;
    }
}

module.exports = SearchEngine;