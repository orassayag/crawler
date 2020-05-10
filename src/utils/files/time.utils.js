const textUtils = require('./text.utils');
const validationUtils = require('./validation.utils');

class TimeUtils {

    constructor() { }

    getFullTime() {
        const date = new Date();
        return `${textUtils.addLeadingZero(date.getHours())}:${textUtils.addLeadingZero(date.getMinutes())}:${textUtils.addLeadingZero(date.getSeconds())}`;
    }

    getFullDateNoSpaces() {
        const date = new Date();
        return `${[date.getFullYear(), (textUtils.addLeadingZero(date.getMonth() + 1)), textUtils.addLeadingZero(date.getDate())].join('')}_${[textUtils.addLeadingZero(date.getHours()), textUtils.addLeadingZero(date.getMinutes()), textUtils.addLeadingZero(date.getSeconds())].join('')}`;
    }

    getDateNoSpaces() {
        const date = new Date();
        return [textUtils.addLeadingZero(date.getDate()), (textUtils.addLeadingZero(date.getMonth() + 1)), date.getFullYear()].join('');
    }

    getDifferenceTimeBetweenDates(data) {
        const { startDateTime, endDateTime } = data;
        if (!validationUtils.isValidDate(startDateTime) || !validationUtils.isValidDate(endDateTime)) {
            return null;
        }
        // Get the total time.
        const totalTime = textUtils.getPositiveNumber(endDateTime - startDateTime);
        // Get total seconds between the times.
        let delta = totalTime / 1000;
        // Calculate (and subtract) whole days.
        const days = textUtils.getFloorPositiveNumber(delta / 86400);
        delta -= days * 86400;
        // Calculate (and subtract) whole hours.
        const hours = textUtils.getFloorPositiveNumber((delta / 3600) % 24);
        delta -= hours * 3600;
        // Calculate (and subtract) whole minutes.
        const minutes = textUtils.getFloorPositiveNumber((delta / 60) % 60);
        delta -= minutes * 60;
        // What's left is seconds.
        // In theory the modulus is not required.
        const seconds = textUtils.getFloorPositiveNumber(delta % 60);
        return { time: `${days}.${hours}:${minutes}:${seconds}`, minutes: parseInt(totalTime / 60000) };
    }
}

const timeUtils = new TimeUtils();
module.exports = timeUtils;