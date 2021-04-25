const CrawlEmailAddressDataModel = require('./CrawlEmailAddressData.model');
const CrawlLinkDataModel = require('./CrawlLinkData.model');
const { applicationUtils, timeUtils } = require('../../../../utils');

class ApplicationDataModel {

	constructor(data) {
		// Set the parameters from the settings file.
		const { settings, activeSearchEngineNames, status, plan, restartsCount } = data;
		const { IS_PRODUCTION_MODE, IS_STATUS_MODE, IS_RUN_DOMAINS_COUNTER, IS_LONG_RUN, GOAL_VALUE,
			GOAL_TYPE, IS_LINKS_METHOD_ACTIVE, IS_CRAWL_METHOD_ACTIVE, IS_SKIP_LOGIC, MAXIMUM_MINUTES_WITHOUT_UPDATE,
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
		this.isLinksMethodActive = IS_LINKS_METHOD_ACTIVE;
		this.isCrawlMethodActive = IS_CRAWL_METHOD_ACTIVE;
		this.isSkipLogic = IS_SKIP_LOGIC;
		this.maximumMinutesWithoutUpdate = MAXIMUM_MINUTES_WITHOUT_UPDATE;
		this.status = status;
		this.plan = plan;
		this.startDateTime = null;
		this.time = null;
		this.minutesCount = 0;
		this.logDateTime = timeUtils.getFullDateNoSpaces();
		this.processIndex = 0;
		this.pageIndex = 0;
		this.pageLinksIndex = 0;
		this.pageLinksCount = 0;
		this.progressValue = 0;
		this.crawlLinkDataModel = new CrawlLinkDataModel();
		this.crawlEmailAddressDataModel = new CrawlEmailAddressDataModel(activeSearchEngineNames);
		this.trendingSaveList = [];
	}
}

module.exports = ApplicationDataModel;