const readline = require('readline');
const logService = require('./log.service');
const { logUtils } = require('../../utils');

class ConfirmationService {

    constructor() { }

    confirm(settings) {
        if (!settings.IS_PRODUCTION_MODE) {
            return true;
        }
        logUtils.log(logService.createConfirmSettingsTemplate(settings));
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        return new Promise((resolve, reject) => {
            try {
                process.stdin.on('keypress', (chunk, key) => {
                    if (chunk) { }
                    resolve(key && key.name === 'y');
                });
            }
            catch (error) { reject(false); }
        }).catch();
    }
}

module.exports = new ConfirmationService();