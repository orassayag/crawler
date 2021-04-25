class CommonEmailAddressDomainModel {

	constructor(data) {
		const { domain, flipDomain, domainName, firstDotSplit, micromatchName, ignoreList } = data;
		this.domain = domain;
		this.flipDomain = flipDomain;
		this.domainName = domainName;
		this.firstDotSplit = firstDotSplit;
		this.micromatchName = micromatchName;
		this.ignoreList = ignoreList;
	}
}

module.exports = CommonEmailAddressDomainModel;