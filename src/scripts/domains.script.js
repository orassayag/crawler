require('../services/files/initiate.service').initiate();
const DomainsLogic = require('../logics/domains.logic');

(async () => {
    await new DomainsLogic().run();
})();