const enumUtils = require('../enum.utils');

const DomainsCounterSourceTypeEnum = enumUtils.createEnum([
    ['FILE', 'file'],
    ['DIRECTORY', 'directory'],
    ['DATABASE', 'database']
]);

module.exports = { DomainsCounterSourceTypeEnum };