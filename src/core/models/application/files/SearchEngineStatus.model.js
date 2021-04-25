class SearchEngineStatusModel {

    constructor(data) {
        const { isActive, name } = data;
        this.isActive = isActive;
        this.name = name;
    }
}

module.exports = SearchEngineStatusModel;