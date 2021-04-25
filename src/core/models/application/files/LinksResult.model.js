class LinksResultModel {

    constructor() {
        this.isValidPage = true;
        this.crawlCount = 0;
        this.totalCount = 0;
        this.filterCount = 0;
        this.crawlLinksList = [];
    }
}

module.exports = LinksResultModel;