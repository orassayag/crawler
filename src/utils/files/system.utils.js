const kill = require('tree-kill');
const logUtils = require('./log.utils');

class SystemUtils {

    constructor() { }

    exit(exitReason, color, code) {
        logUtils.logColorStatus({
            status: `EXIT: ${exitReason}`,
            color: color
        });
        process.exit(code);
    }

    killProcess(pid) {
        if (pid) {
            kill(pid);
        }
    }
}

module.exports = new SystemUtils();