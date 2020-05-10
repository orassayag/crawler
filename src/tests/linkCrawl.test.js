require('../services/files/initiate.service').initiate();
const settings = require('../settings/settings');
const puppeteerService = require('../services/files/puppeteerService');
const { logUtils } = require('../utils');
const { CountsLimitsData } = require('../core/models/application');

(async () => {
	// ===COUNTS & LIMITS DATA=== //
	const countsLimitsData = new CountsLimitsData(settings);
	await puppeteerService.initiate(countsLimitsData, true);
	const pageSource = await puppeteerService.crawl('http://www.jobcrawler.co.il/jobs?ts=go&amp');
	logUtils.log(pageSource);
})();