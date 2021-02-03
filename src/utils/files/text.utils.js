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
        if (text.length > count) {
            return text.substring(0, count);
        }
        return text;
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
        return index === 0 ? this.toUpperCase(text.slice(0, 1)).concat(text.slice(1)) : text;
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

    setLogStatusColored(status, color) {
        if (!status || !color) {
            return '';
        }
        const delimiter = colorUtils.createColorMessage({
            message: this.b,
            color: color
        });
        return `${delimiter}${status}${delimiter}`;
    }

    setLogStatus(status) {
        if (!status) {
            return '';
        }
        return `${this.b}${status}${this.b}`;
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

    getRandomUniqueKeysFromArray(list, itemsCount) {
        if (list.length === itemsCount) {
            return list;
        }
        const numbersList = [];
        const resultList = [];
        for (let i = 0; i < 20; i++) {
            const number = this.getRandomNumber(0, list.length);
            if (numbersList.indexOf(number) === -1) {
                numbersList.push(number);
                resultList.push(list[number]);
                if (resultList.length >= itemsCount) {
                    break;
                }
            }
        }
        return resultList;
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

    isCharacterALetter(character) {
        return regexUtils.detectLetter.test(character);
    }

    getNumberOfNumber(data) {
        const { number1, number2 } = data;
        if (!validationUtils.isValidNumber(number1) || !validationUtils.isValidNumber(number2)) {
            return '';
        }
        return `${this.getNumberWithCommas(number1)}/${this.getNumberWithCommas(number2)}`;
    }

    addBreakLine(text) {
        return `${text}\r\n`;
    }

    checkExistence(list, target) {
        if (!validationUtils.isExists(list)) {
            return false;
        }
        return validationUtils.isExists(list.filter(t => target.indexOf(t) > -1));
    }

    removeDuplicates(list) {
        if (!validationUtils.isExists(list)) {
            return list;
        }
        return Array.from(new Set(list));
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
        for (let i = 0; i < 10; i++) {
            if (text.charAt(text.length - 1) === character) {
                text = this.removeLastCharacter(text);
            }
            else {
                break;
            }
        }
        return text;
    }

    removeLastCharacterNotALetterLoop(text) {
        if (!text) {
            return '';
        }
        for (let i = 0; i < 20; i++) {
            if (!this.isCharacterALetter(text.charAt(text.length - 1))) {
                text = this.removeLastCharacter(text);
            }
            else {
                break;
            }
        }
        return text;
    }

    removeFirstCharacterLoop(data) {
        let { text, character } = data;
        if (!text) {
            return '';
        }
        for (let i = 0; i < 10; i++) {
            if (text.charAt(0) === character) {
                text = this.removeFirstCharacter(text);
            }
            else {
                break;
            }
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
        return text.replace(regexUtils.createRegex(origin, 'g'), target);
    }

    removeAllCharacters(text, target) {
        if (!text) {
            return '';
        }
        return text.split(target).join('');
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
        return `${applicationName}_${date}-${(index + 1)}${title ? `-${title}` : ''}`;
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

    getObjectKeyValues(obj) {
        let result = '';
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = obj[key];
            result += `${this.upperCaseFirstLetter(key, 0)}: ${value} | `;
        }
        result = this.removeLastCharacters({
            value: result,
            charactersCount: 3
        });
        return result;
    }

    flipDotParts(text) {
        return text.split('.').reverse().join('.');
    }

    isCharactersEqual(text) {
        if (text.length === 1) {
            return true;
        }
        for (let i = 1; i < text.length; i++) {
            if (text[i] !== text[0]) {
                return false;
            }
        }
        return true;
    }
}

module.exports = new TextUtils();