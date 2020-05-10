const { validationUtils } = require('../../../../utils');

class SearchKey {

	constructor(data) {
		const { keyType, isMiddleReplace, isNoSpaceAfter, isMultiFemaleKey, globalKey, maleKey, femaleKey, bothKey } = data;
		this.keyType = keyType;
		this.isMiddleReplace = validationUtils.isDefined(isMiddleReplace) ? isMiddleReplace : false;
		this.isNoSpaceAfter = validationUtils.isDefined(isNoSpaceAfter) ? isNoSpaceAfter : false;
		this.isMultiFemaleKey = validationUtils.isDefined(isMultiFemaleKey) ? isMultiFemaleKey : false;
		this.globalKey = globalKey;
		this.maleKey = maleKey;
		this.femaleKey = femaleKey;
		this.bothKey = bothKey;
	}
}

module.exports = SearchKey;