const applicationUtils = require('./files/application.utils');
const characterUtils = require('./files/character.utils');
const databaseUtils = require('./files/database.utils');
const colorUtils = require('./files/color.utils');
const emailAddressUtils = require('./files/emailAddress.utils');
const fileUtils = require('./files/file.utils');
const logUtils = require('./files/log.utils');
const pathUtils = require('./files/path.utils');
const regexUtils = require('./files/regex.utils');
const systemUtils = require('./files/system.utils');
const textUtils = require('./files/text.utils');
const timeUtils = require('./files/time.utils');
const validationUtils = require('./files/validation.utils');

module.exports = {
    applicationUtils, characterUtils, databaseUtils, colorUtils, emailAddressUtils,
    fileUtils, logUtils, pathUtils, regexUtils, systemUtils, textUtils, timeUtils,
    validationUtils
};