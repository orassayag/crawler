const errorScript = require('./error.script');
require('../services/files/initiate.service').initiate('backup');
const BackupLogic = require('../logics/backup.logic');

(async () => {
    await new BackupLogic().run();
})().catch(e => errorScript.handleScriptError(e, 1));