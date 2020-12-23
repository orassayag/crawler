require('../services/files/initiate.service').initiate('backup');
const BackupLogic = require('../logics/backup.logic');

(async () => {
    await new BackupLogic().run();
})();