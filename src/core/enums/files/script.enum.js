const enumUtils = require('../enum.utils');

const ScriptType = enumUtils.createEnum([
    ['DOMAINS_COUNTER', 'domains_counter']
]);

const DomainsCounterSourceType = enumUtils.createEnum([
    ['FILE', 'file'],
    ['DIRECTORY', 'directory'],
    ['DATABASE', 'database']
]);

module.exports = { ScriptType, DomainsCounterSourceType };