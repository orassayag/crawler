const errorScript = require('./error.script');
require('../services/files/initiate.service').initiate('domains');
const DomainsLogic = require('../logics/domains.logic');

(async () => {
    await new DomainsLogic().run();
})().catch(e => errorScript.handleScriptError(e, 1));