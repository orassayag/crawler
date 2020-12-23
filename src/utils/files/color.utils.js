const { ColorCode } = require('../../core/enums');

class ColorUtils {

    constructor() { }

    createColorMessage(data) {
        const { message, color } = data;
        if (!message) {
            return '';
        }
        return `${ColorCode[`Fg${color}`]}${message}${ColorCode.Reset}`;
    }
}

module.exports = new ColorUtils();