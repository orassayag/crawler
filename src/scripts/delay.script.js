const errorScript = require('./error.script');
const settings = require('../settings/settings');
const globalUtils = require('../utils/files/global.utils');

(async () => {
    await globalUtils.sleep(settings.MAXIMUM_DELAY_NPM_SCRIPT);
})().catch(e => errorScript.handleScriptError(e, 1));