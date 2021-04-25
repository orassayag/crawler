const { textUtils } = require('../../../../utils');

class EmailAddressDomainEndModel {

	constructor(data) {
		const { domainEnd, domainEndGroupName, isSingleWord, typosList } = data;
		this.domainEnd = domainEnd;
		this.domainEndGroupName = domainEndGroupName;
		this.isSingleWord = isSingleWord;
		this.typosList = textUtils.removeDuplicates(typosList);
	}
}

module.exports = EmailAddressDomainEndModel;