class CommonEmailAddressDomain {

	constructor(data) {
		const { domain, domainName, micromatchName } = data;
		this.domain = domain;
		this.domainName = domainName;
		this.micromatchName = micromatchName;
	}
}

module.exports = CommonEmailAddressDomain;