const { textUtils } = require('../../../../utils');

class EmailAddressDomain {

	constructor(data) {
		const { domain, domainName, micromatchName, isCommonDomain, typosList } = data;
		this.domain = domain;
		this.domainName = domainName;
		this.micromatchName = micromatchName;
		this.isCommonDomain = isCommonDomain;
		this.typosList = textUtils.removeDuplicates(typosList);
	}
}

module.exports = EmailAddressDomain;