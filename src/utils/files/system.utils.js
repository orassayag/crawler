const logUtils = require('./log.utils');

class SystemUtils {

    constructor() { }

    exit(exitReason, color) {
        logUtils.logColorStatus({ status: `EXIT: ${exitReason}`, color: color });
        process.exit(0);
    }
}

const systemUtils = new SystemUtils();
module.exports = systemUtils;