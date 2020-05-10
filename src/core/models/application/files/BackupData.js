const BackupDirectory = require('./BackupDirectory');

class BackupData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { APPLICATION_NAME, SECONDARY_BACKUP_PATH, BACKUPS_PATH, APPLICATION_PATH, IS_CREATE_STANDARD_BACKUP, IS_CREATE_SECONDARY_BACKUP,
			MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT, BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT } = settings;
		this.isCreateStandardBackup = IS_CREATE_STANDARD_BACKUP;
		this.isCreateSecondaryBackup = IS_CREATE_SECONDARY_BACKUP;
		this.millisecondsDelayVerifyBackupCount = MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT;
		this.backupMaximumDirectoryVersionsCount = BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT;
		this.secondaryBackupPath = SECONDARY_BACKUP_PATH;
		this.backupsPath = BACKUPS_PATH;
		this.applicationName = APPLICATION_NAME;
		this.sourceFullPath = APPLICATION_PATH;
		this.targetFullPath = null;
		this.targetBackupName = null;
		this.backupDirectory = new BackupDirectory(settings);
	}
}

module.exports = BackupData;