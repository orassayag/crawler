const { applicationUtils, timeUtils } = require('../../../../utils');
const CrawlEmailAddressesData = require('./CrawlEmailAddressesData');
const CrawlLinksData = require('./CrawlLinksData');

class ApplicationData {

	constructor(data) {
		// Set the parameters from the settings file.
		const { settings, activeSearchEngineNames, status, method, restartsCount } = data;
		const { IS_PRODUCTION_MODE, IS_STATUS_MODE, IS_RUN_DOMAINS_COUNTER, IS_LONG_RUN, GOAL_VALUE,
			GOAL_TYPE, IS_LINKS_STEP, IS_CRAWL_STEP, IS_SKIP_LOGIC, MAXIMUM_MINUTES_WITHOUT_UPDATE,
			VALIDATION_CONNECTION_LINK } = settings;
		this.isProductionMode = IS_PRODUCTION_MODE;
		this.validationConnectionLink = VALIDATION_CONNECTION_LINK;
		this.isStatusMode = IS_STATUS_MODE;
		this.isRunDomainsCounter = IS_RUN_DOMAINS_COUNTER;
		this.isLongRun = IS_LONG_RUN;
		this.mode = applicationUtils.getApplicationMode(this.isProductionMode);
		this.restartsCount = restartsCount || 0;
		this.goalType = GOAL_TYPE;
		this.goalValue = GOAL_VALUE;
		this.isLinksStep = IS_LINKS_STEP;
		this.isCrawlStep = IS_CRAWL_STEP;
		this.isSkipLogic = IS_SKIP_LOGIC;
		this.maximumMinutesWithoutUpdate = MAXIMUM_MINUTES_WITHOUT_UPDATE;
		this.status = status;
		this.method = method;
		this.startDateTime = null;
		this.time = null;
		this.minutesCount = 0;
		this.logDateTime = timeUtils.getFullDateNoSpaces();
		this.processIndex = 0;
		this.pageIndex = 0;
		this.pageLinksIndex = 0;
		this.pageLinksCount = 0;
		this.progressValue = 0;
		this.crawlLinksData = new CrawlLinksData();
		this.crawlEmailAddressesData = new CrawlEmailAddressesData(activeSearchEngineNames);
		this.trendingSaveList = [];
	}

	setCrawlStart() {
		this.startDateTime = new Date();
	}
}

module.exports = ApplicationData;