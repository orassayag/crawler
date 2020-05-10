const enumUtils = require('../enum.utils');

const Mode = enumUtils.createEnum([
    ['PRODUCTION', 'PRODUCTION'],
    ['DEVELOPMENT', 'DEVELOPMENT']
]);

const Status = enumUtils.createEnum([
    ['INITIATE', 'INITIATE'],
    ['FETCH', 'FETCH'],
    ['PAUSE', 'PAUSE'],
    ['CRAWL', 'CRAWL'],
    ['FINISH', 'FINISH']
]);

const GoalType = enumUtils.createEnum([
    ['EMAIL_ADDRESSES', 'EMAIL_ADDRESSES'],
    ['MINUTES', 'MINUTES'],
    ['LINKS', 'LINKS']
]);

const Step = enumUtils.createEnum([
    ['LINKS', 'LINKS'],
    ['CRAWL', 'CRAWL'],
    ['SEND', 'SEND']
]);

const BackupType = enumUtils.createEnum([
    ['STANDARD', 'STANDARD'],
    ['SECONDARY', 'Secondary']
]);

module.exports = { Mode, Status, GoalType, Step, BackupType };