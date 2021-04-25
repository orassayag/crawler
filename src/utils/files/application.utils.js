const { ModeEnum } = require('../../core/enums');

class ApplicationUtils {

    constructor() { }

    getApplicationMode(isProductionMode) {
        return isProductionMode ? ModeEnum.PRODUCTION : ModeEnum.DEVELOPMENT;
    }
}

module.exports = new ApplicationUtils();