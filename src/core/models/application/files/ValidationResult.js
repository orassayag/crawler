class ValidationResult {

	constructor(emailAddress) {
		this.original = emailAddress;
		this.fix = null;
		this.isValid = true;
		this.functionIds = [];
	}
}

module.exports = ValidationResult;