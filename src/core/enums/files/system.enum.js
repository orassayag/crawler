const enumUtils = require('../enum.utils');

const Mode = enumUtils.createEnum([
    ['PRODUCTION', 'PRODUCTION'],
    ['DEVELOPMENT', 'DEVELOPMENT']
]);

const Method = enumUtils.createEnum([
    ['STANDARD', 'STANDARD'],
    ['SESSION_TEST', 'SESSION_TEST']
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
    ['CRAWL', 'CRAWL']
]);

module.exports = { Mode, Method, Status, GoalType, Step };