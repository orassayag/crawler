const { textUtils } = require('../../../../utils');

class EmailAddressDomain {

	constructor(data) {
		const { domain, domainName, micromatchName, ignoreList, isCommonDomain, typosList } = data;
		this.domain = domain;
		this.domainName = domainName;
		this.micromatchName = micromatchName;
		this.ignoreList = textUtils.removeDuplicates(ignoreList);
		this.isCommonDomain = isCommonDomain;
		this.typosList = textUtils.removeDuplicates(typosList);
	}
}

module.exports = EmailAddressDomain;