const enumUtils = require('../enum.utils');

const LogStatus = enumUtils.createEnum([
    ['FIX', 'fix'],
    ['VALID', 'valid'],
    ['INVALID', 'invalid'],
    ['UNSAVE', 'unsave']
]);

const SaveStatus = enumUtils.createEnum([
    ['SAVE', 'save'],
    ['EXISTS', 'exists'],
    ['ERROR', 'error']
]);

const PartType = enumUtils.createEnum([
    ['LOCAL', 'local'],
    ['DOMAIN', 'domain']
]);

const TestType = enumUtils.createEnum([
    ['VALID', 'valid'],
    ['INVALID', 'invalid'],
    ['RANDOM', 'random'],
    ['UPDATES', 'updates']
]);

const MicromatchAction = enumUtils.createEnum([
    ['NORMAL', 'normal'],
    ['FIRST', 'first'],
    ['LAST', 'last'],
    ['SPECIAL', 'special']
]);

module.exports = { LogStatus, SaveStatus, PartType, TestType, MicromatchAction };