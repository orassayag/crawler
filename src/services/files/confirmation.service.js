const readline = require('readline');
const logService = require('./log.service');
const { logUtils } = require('../../utils');

class ConfirmationService {

    constructor() { }

    confirm(settings) {
        if (!settings.IS_PRODUCTION_MODE) {
            return true;
        }
        const readLine = readline.createInterface(process.stdin, process.stdout);
        logUtils.log(logService.createConfirmSettingsTemplate(settings));
        return new Promise((resolve, reject) => {
            try {
                readLine.on('line', (line) => {
                    switch (line) {
                        case 'y': resolve(true); break;
                        default: resolve(false); break;
                    }
                    readLine.close();
                }).on('close', () => { resolve(false); });
            }
            catch (error) { reject(false); }
        }).catch();
    }
}

module.exports = new ConfirmationService();