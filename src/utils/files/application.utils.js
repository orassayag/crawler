const { Mode } = require('../../core/enums/files/system.enum');

class ApplicationUtils {

    constructor() { }

    getApplicationMode(isProductionMode) {
        return isProductionMode ? Mode.PRODUCTION : Mode.DEVELOPMENT;
    }
}

module.exports = new ApplicationUtils();