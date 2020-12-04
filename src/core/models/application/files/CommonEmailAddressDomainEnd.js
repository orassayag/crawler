class CommonEmailAddressDomainEnd {

	constructor(data) {
		const { commonDomainEnd, isAllowDotAfter } = data;
		this.commonDomainEnd = commonDomainEnd;
		this.isAllowDotAfter = isAllowDotAfter;
	}
}

module.exports = CommonEmailAddressDomainEnd;