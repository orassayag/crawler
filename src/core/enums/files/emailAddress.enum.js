const enumUtils = require('../enum.utils');

const LogStatusEnum = enumUtils.createEnum([
    ['FIX', 'fix'],
    ['VALID', 'valid'],
    ['INVALID', 'invalid'],
    ['UNSAVE', 'unsave'],
    ['GIBBERISH', 'gibberish']
]);

const MicromatchActionEnum = enumUtils.createEnum([
    ['NORMAL', 'normal'],
    ['FIRST', 'first'],
    ['LAST', 'last'],
    ['SPECIAL', 'special']
]);

const PartTypeEnum = enumUtils.createEnum([
    ['LOCAL', 'local'],
    ['DOMAIN', 'domain']
]);

const SaveStatusEnum = enumUtils.createEnum([
    ['SAVE', 'save'],
    ['EXISTS', 'exists'],
    ['ERROR', 'error']
]);

const TestTypeEnum = enumUtils.createEnum([
    ['VALID', 'valid'],
    ['INVALID', 'invalid'],
    ['RANDOM', 'random'],
    ['UPDATES', 'updates']
]);

module.exports = { LogStatusEnum, MicromatchActionEnum, PartTypeEnum, SaveStatusEnum, TestTypeEnum };