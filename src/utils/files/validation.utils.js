const regexUtils = require('./regex.utils');

class ValidationUtils {

    constructor() { }

    // This method checks if a given value is a valid number and return the result.
    isValidNumber(number) {
        number = Number(number);
        return !isNaN(number) && typeof number == 'number';
    }

    isValidArray(variable) {
        return Object.prototype.toString.call(variable) === '[object Array]';
    }

    isDefined(variable) {
        return typeof variable !== 'undefined';
    }

    isPositiveNumber(number) {
        if (!this.isValidNumber(number)) {
            return false;
        }
        return Number(number) > 0;
    }

    // This method checks if a given variable is a valid boolean and return the result.
    isValidBoolean(boolean) {
        return typeof boolean == typeof true;
    }

    isValidDate(dateTime) {
        return dateTime instanceof Date;
    }

    isValidLink(link) {
        return regexUtils.validateLinkRegex.test(link);
    }

    isValidMongoConnectionString(mongoConnectionString) {
        return regexUtils.mongoConnectionStringRegex.test(mongoConnectionString);
    }

    isExists(list) {
        return list && list.length > 0;
    }

    // This method validates that a given string exists in array list of specific types.
    isValidEnum(data) {
        // Validate the existence and validity of the validateEnumData parameters. If not exists, return false.
        if (!data || !data.enum || !data.value) {
            return false;
        }
        // Check if the value exists within a given array. Return false if not.
        return Object.values(data.enum).indexOf(data.value) > -1;
    }

    isValidVersion(text) {
        if (!text) {
            return false;
        }
        return regexUtils.findPackageNameRegex.test(text);
    }
}

module.exports = new ValidationUtils();