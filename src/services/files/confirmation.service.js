const readline = require('readline');
const { logUtils } = require('../../utils');
const logService = require('./log.service');

class ConfirmationService {

    constructor() { }

    async confirm(settings) {
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
                        case 'n': resolve(false); break;
                        default: resolve(false); break;
                    }
                    readLine.close();
                }).on('close', () => { resolve(false); });
            }
            catch (error) { reject(false); }
        });
    }
}

const confirmationService = new ConfirmationService();
module.exports = confirmationService;