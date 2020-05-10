class EmailAddressStatus {

    constructor(validationResult) {
        this.validationResult = validationResult;
        this.logStatus = null;
        this.isSave = false;
        this.isExists = false;
        this.isInvalid = false;
        this.isValidFix = false;
        this.isInvalidFix = false;
        this.isFilter = false;
        this.isUnsave = false;
    }
}

module.exports = EmailAddressStatus;