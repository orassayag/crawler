class PathDataModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { SOURCES_PATH, DIST_PATH, DOWNLOADS_PATH } = settings;
		this.sourcesPath = SOURCES_PATH;
		this.distPath = DIST_PATH;
		this.downloadsPath = DOWNLOADS_PATH;
	}
}

module.exports = PathDataModel;