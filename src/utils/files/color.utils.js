const { ColorCode } = require('../../core/enums/files/text.enum');

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

const colorUtils = new ColorUtils();
module.exports = colorUtils;