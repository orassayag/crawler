class BackupDirectoryModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { IGNORE_DIRECTORIES, IGNORE_FILES, INCLUDE_FILES } = settings;
		this.ignoreDirectories = IGNORE_DIRECTORIES;
		this.ignoreFiles = IGNORE_FILES;
		this.includeFiles = INCLUDE_FILES;
	}
}

module.exports = BackupDirectoryModel;