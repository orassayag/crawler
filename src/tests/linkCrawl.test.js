require('../services/files/initiate.service').initiate();
const settings = require('../settings/settings');
const puppeteerService = require('../services/files/puppeteer.service');
const { logUtils } = require('../utils');
const { CountsLimitsData } = require('../core/models/application');

(async () => {
	// ===COUNTS & LIMITS DATA=== //
	const countsLimitsData = new CountsLimitsData(settings);
	await puppeteerService.initiate(countsLimitsData, true);
	const pageSource = await puppeteerService.crawl('');
	logUtils.log(pageSource);
})();