class CommonEmailAddressDomain {

	constructor(data) {
		const { domain, flipDomain, domainName, micromatchName } = data;
		this.domain = domain;
		this.flipDomain = flipDomain;
		this.domainName = domainName;
		this.micromatchName = micromatchName;
	}
}

module.exports = CommonEmailAddressDomain;