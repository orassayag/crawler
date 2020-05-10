class LogsData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { IS_EMPTY_DIST_DIRECTORY, IS_LOG_VALID_EMAIL_ADDRESSES, IS_LOG_FIX_EMAIL_ADDRESSES, IS_LOG_INVALID_EMAIL_ADDRESSES,
			IS_LOG_UNSAVE_EMAIL_ADDRESSES, IS_LOG_CRAWL_LINKS, IS_LOG_CRAWL_ERROR_LINKS, MAXIMUM_FIX_LOG_SPACES_CHARECTERS_COUNT } = settings;
		this.isEmptyDistDirectory = IS_EMPTY_DIST_DIRECTORY;
		this.isLogValidEmailAddresses = IS_LOG_VALID_EMAIL_ADDRESSES;
		this.isLogFixEmailAddresses = IS_LOG_FIX_EMAIL_ADDRESSES;
		this.isLogInvalidEmailAddresses = IS_LOG_INVALID_EMAIL_ADDRESSES;
		this.isLogUnsaveEmailAddresses = IS_LOG_UNSAVE_EMAIL_ADDRESSES;
		this.isLogCrawlLinks = IS_LOG_CRAWL_LINKS;
		this.isLogCrawlErrorLinks = IS_LOG_CRAWL_ERROR_LINKS;
		this.maximumFixLogSpacesCharactersCount = MAXIMUM_FIX_LOG_SPACES_CHARECTERS_COUNT;
	}
}

module.exports = LogsData;