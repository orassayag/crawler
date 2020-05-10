class PathsData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { SOURCES_PATH, DIST_PATH } = settings;
		this.sourcesPath = SOURCES_PATH;
		this.distPath = DIST_PATH;
	}
}

module.exports = PathsData;