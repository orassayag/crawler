const globalUtils = require('../utils/files/global.utils');
const settings = require('../settings/settings');

(async () => {
    await globalUtils.sleep(settings.MAXIMUM_DELAY_NPM_SCRIPT);
})();
