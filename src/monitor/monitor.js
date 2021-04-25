require('../services/files/initiate.service').initiate('crawl');
const forever = require('forever-monitor');
const settings = require('../settings/settings');
const { ColorEnum, StatusEnum } = require('../core/enums');
const { confirmationService, logService } = require('../services');
const { logUtils, pathUtils, systemUtils, timeUtils } = require('../utils');

class NodeMonitor {

    constructor() {
        this.restartsCount = 0;
    }

    // Let the user confirm all the IMPORTANT settings before you start.
    async confirm() {
        if (!await confirmationService.confirm(settings)) {
            logUtils.logColorStatus({
                status: systemUtils.getExitReason(StatusEnum.ABORT_BY_THE_USER),
                color: ColorEnum.RED
            });
            return false;
        }
        return true;
    }

    async checkSchedule(scheduleMinutesCount) {
        if (scheduleMinutesCount <= 0) {
            return;
        }
        const endDateTime = timeUtils.getCurrentDatePlusMilliseconds((scheduleMinutesCount * 60000) + 2000); // Additional 2000 to margin process.
        await new Promise((resolve) => {
            const timeInterval = setInterval(() => {
                // Update the current time left to start the process.
                const { timeleft, time } = timeUtils.getRemainingTime(endDateTime);
                if (timeleft <= 0) {
                    clearInterval(timeInterval);
                    resolve();
                    return;
                }
                else {
                    logService.logSchedule(time);
                }
            }, 1000);
        }).catch();
    }

    async initiate() {
        if (!await this.confirm()) {
            return;
        }
        const { MAXIMUM_RESTARTS_COUNT, SCHEDULE_MINUTES_COUNT } = settings;
        await this.checkSchedule(SCHEDULE_MINUTES_COUNT);
        const path = pathUtils.getJoinPath({
            targetPath: __dirname,
            targetName: '../scripts/crawl.script.js'
        });
        const child = new (forever.Monitor)(path, {
            max: MAXIMUM_RESTARTS_COUNT,
            silent: false,
            args: [this.restartsCount]
        });
        child.on('exit:code', (code) => {
            if (code === 66) {
                child.stop();
            }
            else {
                this.restartsCount++;
                child.args[1] = this.restartsCount;
            }
        });
        child.start();
        // On ctrl+c destroy the child.
        process.on('SIGINT', () => {
            child.kill();
            child.stop();
            systemUtils.killProcess(child.childData.pid);
        });
    }
}

(async () => {
    await new NodeMonitor().initiate();
})();