const settings = require('../settings/settings');
const { BackupDataModel } = require('../core/models/application');
const { ColorEnum } = require('../core/enums');
const globalUtils = require('../utils/files/global.utils');
const { fileUtils, logUtils, pathUtils, textUtils, timeUtils } = require('../utils');

class BackupLogic {

    constructor() {
        this.backupDataModel = null;
        this.backupTitle = null;
    }

    initiate() {
        // Get the backup title from the console.
        this.backupTitle = textUtils.removeAllCharacters(textUtils.toLowerCase(process.argv[2]), '.');
        this.backupDataModel = new BackupDataModel(settings);
        logUtils.logMagentaStatus('INITIATE THE BASE PARAMETERS');
    }

    async run() {
        // Initiate the base parameters.
        this.initiate();
        // Create the backup directory.
        await this.create();
    }

    async create() {
        logUtils.logMagentaStatus('START BACKUP');
        // Set the parameters to all names and directories for the backup.
        await this.setParameters();
        // Create the backup.
        await this.runBackup();
    }

    async setParameters() {
        logUtils.logMagentaStatus('SET THE PARAMETERS');
        let backupTemporaryPath = null;
        for (let i = 0; i < this.backupDataModel.backupMaximumDirectoryVersionsCount; i++) {
            const backupName = textUtils.getBackupName({
                applicationName: this.backupDataModel.applicationName,
                date: timeUtils.getDateNoSpaces(),
                title: this.backupTitle,
                index: i
            });
            backupTemporaryPath = pathUtils.getJoinPath({
                targetPath: this.backupDataModel.backupsPath,
                targetName: textUtils.addBackslash(backupName)
            });
            if (!await fileUtils.isPathExists(backupTemporaryPath)) {
                this.backupDataModel.targetBackupName = backupName;
                this.backupDataModel.targetFullPath = backupTemporaryPath;
                break;
            }
        }
    }

    async runBackup() {
        logUtils.logMagentaStatus('RUN BACKUP');
        // Validate the backup name.
        if (!this.backupDataModel.targetBackupName) {
            throw new Error('No backup name was provided (1000001)');
        }
        // Reset the backup directory.
        await fileUtils.removeDirectoryIfExists(this.backupDataModel.targetFullPath);
        await fileUtils.createDirectoryIfNotExists(this.backupDataModel.targetFullPath);
        // Create the standard backup.
        await fileUtils.copyDirectory(this.backupDataModel.sourceFullPath, this.backupDataModel.targetFullPath, this.filterDirectories.bind(this));
        // Verify the backup directory existence.
        await this.verifyBackup();
    }

    filterDirectories(source) {
        let isIncluded = true;
        const { ignoreDirectories, ignoreFiles, includeFiles } = this.backupDataModel.backupDirectoryModel;
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

    async verifyBackup() {
        await globalUtils.sleep(this.backupDataModel.millisecondsDelayVerifyBackupCount);
        if (!await fileUtils.isPathExists(this.backupDataModel.targetFullPath)) {
            throw new Error('No backup was provided (1000002)');
        }
        logUtils.logColorStatus({
            status: `FINISH TO CREATE A BACKUP: ${this.backupDataModel.targetBackupName}`,
            color: ColorEnum.GREEN
        });
    }
}

module.exports = BackupLogic;