const settings = require('../settings/settings');
const { Color } = require('../core/enums/files/text.enum');
const { BackupType } = require('../core/enums/files/system.enum');
const { pathUtils, fileUtils, logUtils, textUtils, timeUtils } = require('../utils');
const { BackupData } = require('../core/models/application');
const globalUtils = require('../utils/files/global.utils');

class BackupLogic {

    constructor() {
        this.backupData = null;
        this.backupTitle = null;
    }

    async initiate() {
        // Get the backup title from the console.
        this.backupTitle = process.argv[2];
        logUtils.logMagentaStatus('INITIATE THE BASE PARAMETERS');
        this.backupData = new BackupData(settings);
    }

    async run() {
        // Initiate the base parameters.
        this.initiate();
        // Create the backup directory.
        if (this.backupData.isCreateStandardBackup) {
            await this.create(BackupType.STANDARD);
        }
        if (this.backupData.isCreateSecondaryBackup) {
            await this.create(BackupType.SECONDARY);
        }
    }

    async create(backupType) {
        logUtils.logMagentaStatus(`START ${backupType} BACKUP`);
        // Set the parameters to all names and directories for the backup.
        await this.setParameters(backupType);
        // Create the backup.
        await this.runBackup(backupType);
    }

    async setParameters(backupType) {
        logUtils.logMagentaStatus(`SET THE ${backupType} PARAMETERS`);
        let backupTemporaryPath = null;
        switch (backupType) {
            case BackupType.STANDARD:
                for (let i = 0; i < this.backupData.backupMaximumDirectoryVersionsCount; i++) {
                    const backupName = textUtils.getBackupName({ applicationName: this.backupData.applicationName, date: timeUtils.getDateNoSpaces(), title: this.backupTitle, index: i });
                    backupTemporaryPath = pathUtils.getJoinPath({ targetPath: this.backupData.backupsPath, targetName: textUtils.addBackslash(backupName) });
                    if (!await fileUtils.isPathExists(backupTemporaryPath)) {
                        this.backupData.targetBackupName = backupName;
                        this.backupData.targetFullPath = backupTemporaryPath;
                        break;
                    }
                }
                break;
            case BackupType.SECONDARY:
                this.backupData.targetBackupName = this.backupData.applicationName;
                this.backupData.targetFullPath = this.backupData.secondaryBackupPath;
                break;
        }
    }

    async runBackup(backupType) {
        logUtils.logMagentaStatus(`RUN ${backupType} BACKUP`);
        // Validate the backup name.
        if (!this.backupData.targetBackupName) {
            throw new Error('No backup name was provided (1000001)');
        }
        if (this.backupData.targetBackupName.length <= 0) {
            throw new Error('Invalid backup name length was provided (1000002)');
        }
        // Reset the backup directory.
        await fileUtils.removeDirectoryIfExists(this.backupData.targetFullPath);
        await fileUtils.createDirectoryIfNotExists(this.backupData.targetFullPath);
        // Create the standard backup.
        await fileUtils.copyDirectory(this.backupData.sourceFullPath, this.backupData.targetFullPath, this.filterDirectories.bind(this));
        // Verify the backup directory existence.
        await this.verifyBackup(backupType);
    }

    filterDirectories(source, destination) {
        if (destination) { }
        let isIncluded = true;
        let { ignoreDirectories, ignoreFiles, includeFiles } = this.backupData.backupDirectory;
        for (let i = 0, length = ignoreDirectories.length; i < length; i++) {
            const currentPath = ignoreDirectories[i];
            isIncluded = !(source.indexOf(currentPath) > -1);
            const fileName = pathUtils.getBasename(source);
            if (includeFiles.includes(fileName)) {
                isIncluded = true;
            }
            if (ignoreFiles.includes(fileName)) {
                isIncluded = false;
            }
            if (!isIncluded) {
                break;
            }
        }
        return isIncluded;
    }

    async verifyBackup(backupType) {
        globalUtils.sleep(this.backupData.millisecondsDelayVerifyBackupCount);
        if (!await fileUtils.isPathExists(this.backupData.targetFullPath)) {
            throw new Error('No backup was provided (1000003)');
        }
        logUtils.logColorStatus({ status: `FINISH TO CREATE ${backupType} BACKUP: ${this.backupData.targetBackupName}`, color: Color.GREEN });
    }
}

module.exports = BackupLogic;