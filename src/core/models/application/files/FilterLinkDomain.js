class FilterLinkDomain {

    constructor(data) {
        const { name, domains } = data;
        this.name = name;
        this.domains = domains;
    }
}

module.exports = FilterLinkDomain;