class EmailAddressesResult {

    constructor() {
        this.isGoalComplete = false;
        this.saveCount = 0;
        this.totalCount = 0;
        this.existsCount = 0;
        this.invalidCount = 0;
        this.validFixCount = 0;
        this.invalidFixCount = 0;
        this.unsaveCount = 0;
        this.filterCount = 0;
        this.skipCount = 0;
        this.trendingSaveList = [];
        this.isValidPage = true;
    }
}

module.exports = EmailAddressesResult;