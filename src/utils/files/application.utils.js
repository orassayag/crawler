const { Mode } = require('../../core/enums/files/system.enum');

class ApplicationUtils {

    constructor() { }

    getApplicationMode(isProductionMode) {
        return isProductionMode ? Mode.PRODUCTION : Mode.DEVELOPMENT;
    }
}

const applicationUtils = new ApplicationUtils();
module.exports = applicationUtils;