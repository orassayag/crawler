const enumUtils = require('../enum.utils');

const PlaceholderEnum = enumUtils.createEnum([
    ['DATE', '#DATE#']
]);

module.exports = { PlaceholderEnum };