const enumUtils = require('../enum.utils');

const GoalType = enumUtils.createEnum([
    ['EMAIL_ADDRESSES', 'EMAIL_ADDRESSES'],
    ['MINUTES', 'MINUTES'],
    ['LINKS', 'LINKS']
]);

const Method = enumUtils.createEnum([
    ['LINKS', 'LINKS'],
    ['CRAWL', 'CRAWL']
]);

const Mode = enumUtils.createEnum([
    ['PRODUCTION', 'PRODUCTION'],
    ['DEVELOPMENT', 'DEVELOPMENT']
]);

const Plan = enumUtils.createEnum([
    ['STANDARD', 'STANDARD'],
    ['SESSION_TEST', 'SESSION_TEST']
]);

const ScriptType = enumUtils.createEnum([
    ['BACKUP', 'backup'],
    ['CRAWL', 'crawl'],
    ['DOMAINS', 'domains'],
    ['PRELOAD', 'preload'],
    ['TEST', 'test']
]);

const Status = enumUtils.createEnum([
    ['INITIATE', 'INITIATE'],
    ['FETCH', 'FETCH'],
    ['PAUSE', 'PAUSE'],
    ['CRAWL', 'CRAWL'],
    ['NO_ACTIVE_METHODS', 'NO ACTIVE METHODS'],
    ['LINKS_METHOD_IS_NOT_ACTIVE', 'LINKS METHOD IS NOT ACTIVE'],
    ['EXCEEDED_THE_LIMIT', 'EXCEEDED THE LIMIT'],
    ['GOAL_COMPLETE', 'GOAL COMPLETE'],
    ['APPLICATION_STUCK', 'APPLICATION STUCK'],
    ['PROCESSES_LIMIT', 'PROCESSES LIMIT'],
    ['ERROR_PAGE_IN_A_ROW', 'ERROR PAGE IN A ROW'],
    ['ERROR_UNSAVE_EMAIL_ADDRESSES', 'ERROR UNSAVE EMAIL ADDRESSES'],
    ['ABORT_BY_THE_USER', 'ABORT BY THE USER'],
    ['FINISH', 'FINISH']
]);

module.exports = { GoalType, Method, Mode, Plan, ScriptType, Status };