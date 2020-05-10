const colorUtils = require('./color.utils');
const regexUtils = require('./regex.utils');
const validationUtils = require('./validation.utils');

class TextUtils {

    constructor() {
        this.b = '===';
    }

    cutText(data) {
        const { text, count } = data;
        if (!text) {
            return '';
        }
        return text.substring(0, count);
    }

    reverseText(text) {
        return text.split('').reverse().join('');
    }

    getSplitNumber(text) {
        if (!text) {
            return -1;
        }
        return Number(text.split('_')[0]);
    }

    // This method convert a given number to display comma number.
    getNumberWithCommas(number) {
        if (number <= -1 || !validationUtils.isValidNumber(number)) {
            return '';
        }
        return number.toString().replace(regexUtils.numberCommasRegex, ',');
    }

    upperCaseFirstLetter(text, index) {
        return index === 0 ? textUtils.toUpperCase(text.slice(0, 1)).concat(text.slice(1)) : text;
    }

    // This method creates a file name.
    createFileName(data) {
        const { fileName, fileKeyName, fileTXTName, isMBOX } = data;
        if (!fileName) {
            return '';
        }
        return `${fileName}${fileKeyName ? `_${fileKeyName}` : ''}${fileTXTName !== null ? `_${fileTXTName}` : ''}${isMBOX ? '' : '.txt'}`;
    }

    removeLastCharacters(data) {
        const { value, charactersCount } = data;
        if (!value || !validationUtils.isValidNumber(charactersCount)) {
            return '';
        }
        return value.substring(0, value.length - charactersCount);
    }

    // This method add leading 0 if needed.
    addLeadingZero(number) {
        if (!validationUtils.isValidNumber(number)) {
            return '';
        }
        return number < 10 ? `0${number}` : number;
    }

    verifyCharactersLength(data) {
        const { value, maximumCharactersLength } = data;
        if (!value || !validationUtils.isValidNumber(maximumCharactersLength)) {
            return '';
        }
        return value.length > maximumCharactersLength ? value.substring(0, maximumCharactersLength) : value;
    }

    setLogStatusColored(status, color) {
        if (!status || !color) {
            return '';
        }
        const delimiter = colorUtils.createColorMessage({ message: this.b, color: color });
        return `${delimiter}${status}${delimiter}`;
    }

    setLogStatus(status) {
        if (!status) {
            return '';
        }
        return `${this.b}${status}${this.b}`;
    }

    countDuplicateStrings(list) {
        if (!validationUtils.isExists(list)) {
            return 0;
        }
        return list.filter((item, index) => list.indexOf(item) != index).length;
    }

    calculatePercentageDisplay(data) {
        const { partialValue, totalValue } = data;
        if (!validationUtils.isValidNumber(partialValue) || !validationUtils.isValidNumber(totalValue)) {
            return '';
        }
        return `${this.addLeadingZero(((100 * partialValue) / totalValue).toFixed(2))}%`;
    }

    getPositiveNumber(number) {
        if (!validationUtils.isValidNumber(number)) {
            return -1;
        }
        return Math.abs(number);
    }

    getFloorNumber(number) {
        if (!validationUtils.isValidNumber(number)) {
            return -1;
        }
        return Math.floor(number);
    }

    getFloorPositiveNumber(number) {
        return this.addLeadingZero(this.getFloorNumber(number));
    }

    getRandomKeyFromArray(list) {
        if (!validationUtils.isExists(list)) {
            return '';
        }
        return list[Math.floor(Math.random() * list.length)];
    }

    getRandomNumber(min, max) {
        return min + Math.floor((max - min) * Math.random());
    }

    getRandomBoolean() {
        return Math.random() >= 0.5;
    }

    isEnglishKey(key) {
        return regexUtils.englishCharactersRegex.test(key);
    }

    getNumberOfNumber(data) {
        const { number1, number2 } = data;
        if (!validationUtils.isValidNumber(number1) || !validationUtils.isValidNumber(number2)) {
            return '';
        }
        return `${textUtils.getNumberWithCommas(number1)}/${textUtils.getNumberWithCommas(number2)}`;
    }

    addBreakLine(text) {
        return `${text}\r\n`;
    }

    checkExistence(list, target) {
        if (!validationUtils.isExists(list)) {
            return false;
        }
        return list.filter(t => target.indexOf(t) > -1).length > 0;
    }

    removeDuplicates(list) {
        if (!validationUtils.isExists(list)) {
            return [];
        }
        return Array.from(new Set(list));
    }

    removeString(data) {
        const { removeText } = data;
        let { text } = data;
        if (!validationUtils.isExists(text) || !validationUtils.isExists(removeText)) {
            return '';
        }
        if (text.indexOf(removeText) > -1) {
            text = text.split(removeText).join('');
        }
        return text;
    }

    replaceContainString(data) {
        const { targetText, replaceText } = data;
        let { text } = data;
        if (!validationUtils.isExists(text) || !validationUtils.isExists(targetText) || !validationUtils.isExists(replaceText)) {
            return '';
        }
        if (text.indexOf(targetText) > -1) {
            text = text.split(targetText).join(replaceText);
        }
        return text;
    }

    replaceAt(data) {
        const { text, position, newText } = data;
        if (!text) {
            return '';
        }
        return [text.substr(0, position), newText, text.substr(position + 1)].join('');
    }

    removeEmptySpaces(text) {
        if (!text) {
            return '';
        }
        return text.replace(regexUtils.cleanSpacesRegex, '');
    }

    removeFirstCharacter(text) {
        if (!text) {
            return '';
        }
        return text.substr(1);
    }

    removeLastCharacter(text) {
        if (!text) {
            return '';
        }
        return text.substring(0, text.length - 1);
    }

    removeLastCharacterLoop(data) {
        let { text, character } = data;
        if (!text) {
            return '';
        }
        while (text.charAt(text.length - 1) === character) {
            text = this.removeLastCharacter(text);
        }
        return text;
    }

    removeFirstCharacterLoop(data) {
        let { text, character } = data;
        if (!text) {
            return '';
        }
        while (text.charAt(0) === character) {
            text = this.removeFirstCharacter(text);
        }
        return text;
    }

    getSplitDotParts(text) {
        if (!text) {
            return '';
        }
        return text.split('.');
    }

    replaceCharacter(text, origin, target) {
        if (!text) {
            return '';
        }
        return text.replace(regexUtils.createRegex(origin), target);
    }

    toLowerCase(text) {
        if (!text) {
            return '';
        }
        return text.toLowerCase();
    }

    toLowerCaseTrim(text) {
        if (!text) {
            return '';
        }
        return text.toLowerCase().trim();
    }

    toUpperCase(text) {
        if (!text) {
            return '';
        }
        return text.toUpperCase();
    }

    addBackslash(text) {
        if (!text) {
            return '';
        }
        return `${text}/`;
    }

    getBackupName(data) {
        const { applicationName, date, title, index } = data;
        return `${applicationName}${title ? `_${title}` : ''}_${date}-${(index + 1)}`;
    }

    sliceJoinDots(array, number) {
        return array.slice(number).join('.');
    }

    addStartDot(text) {
        return `.${text}`;
    }

    addMiddleDot(text1, text2) {
        return `${text1}.${text2}`;
    }

    replaceLast(text, charecter, replace) {
        const a = text.split('');
        a[text.lastIndexOf(charecter)] = replace;
        return a.join('');
    }
}

const textUtils = new TextUtils();
module.exports = textUtils;