const { applicationUtils, timeUtils } = require('../../../../utils');
const CrawlEmailAddressesData = require('./CrawlEmailAddressesData');
const CrawlLinksData = require('./CrawlLinksData');

class ApplicationData {

	constructor(data) {
		// Set the parameters from the settings file.
		const { settings, status } = data;
		const { IS_PRODUCTION_MODE, IS_STATUS_MODE, IS_RUN_DOMAINS_COUNTER, GOAL_VALUE, GOAL_TYPE, IS_LINKS_STEP,
			IS_CRAWL_STEP, IS_SEND_STEP, VALIDATION_CONNECTION_LINK } = settings;
		this.isProductionMode = IS_PRODUCTION_MODE;
		this.validationConnectionLink = VALIDATION_CONNECTION_LINK;
		this.isStatusMode = IS_STATUS_MODE;
		this.isRunDomainsCounter = IS_RUN_DOMAINS_COUNTER;
		this.mode = applicationUtils.getApplicationMode(this.isProductionMode);
		this.goalType = GOAL_TYPE;
		this.goalValue = GOAL_VALUE;
		this.isLinksStep = IS_LINKS_STEP;
		this.isCrawlStep = IS_CRAWL_STEP;
		this.isSendStep = IS_SEND_STEP;
		this.status = status;
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
		this.crawlEmailAddressesData = new CrawlEmailAddressesData();
		this.trendingSaveList = [];
		this.errorPageInARowCounter = 0;
	}

	setCrawlStart() {
		this.startDateTime = new Date();
	}

	updateErrorPageInARow(isValidPage) {
		this.errorPageInARowCounter = isValidPage ? 0 : this.errorPageInARowCounter + 1;
	}
}

module.exports = ApplicationData;