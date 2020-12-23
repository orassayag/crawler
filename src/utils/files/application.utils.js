const { Mode } = require('../../core/enums');

class ApplicationUtils {

    constructor() { }

    getApplicationMode(isProductionMode) {
        return isProductionMode ? Mode.PRODUCTION : Mode.DEVELOPMENT;
    }
}

module.exports = new ApplicationUtils();