const kill = require('tree-kill');
const exec = require('child_process').exec;
const logUtils = require('./log.utils');

class SystemUtils {

    constructor() { }

    exit(exitReason, color, code) {
        logUtils.logColorStatus({
            status: this.getExitReason(exitReason),
            color: color
        });
        process.exit(code);
    }

    killProcess(pid) {
        if (pid) {
            kill(pid);
        }
    }

    getExitReason(exitReason) {
        if (!exitReason) {
            return '';
        }
        return `EXIT: ${exitReason}`;
    }

    isProcessRunning = (processName) => {
        return new Promise((resolve, reject) => {
            if (reject) { }
            const platform = process.platform;
            let cmd = '';
            switch (platform) {
                case 'win32': cmd = `tasklist`; break;
                case 'darwin': cmd = `ps -ax | grep ${processName}`; break;
                case 'linux': cmd = `ps -A`; break;
                default: break;
            }
            exec(cmd, (err, stdout, stderr) => {
                if (err || stderr) { }
                resolve(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1);
            });
        });
    }
}

module.exports = new SystemUtils();