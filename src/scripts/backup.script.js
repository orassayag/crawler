require('../services/files/initiate.service').initiate();
const BackupLogic = require('../logics/backup.logic');

(async () => {
    await new BackupLogic().run();
})();