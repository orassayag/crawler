const enumUtils = require('../enum.utils');

const PartType = enumUtils.createEnum([
    ['LOCAL', 'local'],
    ['DOMAIN', 'domain']
]);

const LogStatus = enumUtils.createEnum([
    ['FIX', 'fix'],
    ['VALID', 'valid'],
    ['INVALID', 'invalid'],
    ['UNSAVE', 'unsave']
]);

const MicromatchAction = enumUtils.createEnum([
    ['NORMAL', 'normal'],
    ['FIRST', 'first'],
    ['LAST', 'last'],
    ['SPECIAL', 'special']
]);

const SaveStatus = enumUtils.createEnum([
    ['SAVE', 'save'],
    ['EXISTS', 'exists'],
    ['ERROR', 'error']
]);

const TestType = enumUtils.createEnum([
    ['VALID', 'valid'],
    ['INVALID', 'invalid'],
    ['RANDOM', 'random'],
    ['UPDATES', 'updates']
]);

module.exports = { PartType, LogStatus, MicromatchAction, SaveStatus, TestType };