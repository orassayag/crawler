class ValidationResult {

	constructor(emailAddress) {
		this.original = emailAddress;
		this.fix = null;
		this.isValid = true;
		this.functionIds = [];
		this.isGibberish = false;
	}
}

module.exports = ValidationResult;