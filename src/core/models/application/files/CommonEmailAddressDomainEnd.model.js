class CommonEmailAddressDomainEndModel {

	constructor(data) {
		const { commonDomainEnd, isAllowDotAfter, excludeWords } = data;
		this.commonDomainEnd = commonDomainEnd;
		this.isAllowDotAfter = isAllowDotAfter;
		this.excludeWords = excludeWords;
	}
}

module.exports = CommonEmailAddressDomainEndModel;