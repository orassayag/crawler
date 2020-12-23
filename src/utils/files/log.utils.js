const logUpdate = require('../../log-update');
const colorUtils = require('./color.utils');
const textUtils = require('./text.utils');
const validationUtils = require('./validation.utils');
const { Color } = require('../../core/enums');

class LogUtils {

    constructor() { }

    log(message) {
        console.log(message);
    }

    logColor(message, color) {
        return colorUtils.createColorMessage({
            message: message,
            color: color
        });
    }

    logStatus(status, object) {
        if (!status) {
            return;
        }
        this.log(textUtils.setLogStatus(status));
        if (object) {
            this.log(object);
        }
    }

    logColorStatus(data) {
        const { status, color } = data;
        if (!status || !color) {
            return '';
        }
        this.log(colorUtils.createColorMessage({
            message: textUtils.setLogStatus(status),
            color: color
        }));
    }

    logMagentaStatus(text) {
        if (!text) {
            return '';
        }
        return this.logColorStatus({
            status: text,
            color: Color.MAGENTA
        });
    }

    logProgress(data) {
        const { titlesList, colorsTitlesList, keysLists, colorsLists, statusColor } = data;
        let results = '';
        for (let i = 0, lengthX = keysLists.length; i < lengthX; i++) {
            let result = '';
            // Group title.
            const title = `[${titlesList[i]}] `;
            const keyTitle = colorUtils.createColorMessage({
                message: title,
                color: colorsTitlesList[i]
            });
            result += keyTitle;
            // Group keys.
            const keysList = keysLists[i];
            const colorsList = colorsLists[i];
            const keys = Object.keys(keysList);
            for (let y = 0, lengthY = keys.length; y < lengthY; y++) {
                const color = colorsList ? colorsList[y] : null;
                let keyParameter = keys[y];
                if (color) {
                    keyParameter = colorUtils.createColorMessage({
                        message: keys[y],
                        color: color
                    });
                }
                const value = keysList[keys[y]];
                const displayValue = value && validationUtils.isValidNumber(value) ? textUtils.getNumberWithCommas(value) : value;
                const message = `${keyParameter === '#' ? '' : `${keyParameter}: `}${displayValue} | `;
                result += message;
            }
            result = textUtils.removeLastCharacters({
                value: result,
                charactersCount: 3
            });
            results += textUtils.setLogStatusColored(result, statusColor);
            if (i < (lengthX - 1)) {
                results += '\n';
            }
        }
        logUpdate(results);
    }

    logSchedule(text) {
        text = textUtils.setLogStatus(text);
        text = this.logColor(text, Color.MAGENTA);
        logUpdate(text);
    }
}

module.exports = new LogUtils();