const enumUtils = require('../enum.utils');

const DomainsCounterSourceType = enumUtils.createEnum([
    ['FILE', 'file'],
    ['DIRECTORY', 'directory'],
    ['DATABASE', 'database']
]);

module.exports = { DomainsCounterSourceType };