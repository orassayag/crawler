class FilterLinkDomainModel {

    constructor(data) {
        const { name, domains } = data;
        this.name = name;
        this.domains = domains;
    }
}

module.exports = FilterLinkDomainModel;