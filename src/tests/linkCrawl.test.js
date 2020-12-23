require('../services/files/initiate.service').initiate('test');
const settings = require('../settings/settings');
const puppeteerService = require('../services/files/puppeteer.service');
const { logUtils } = require('../utils');
const { CountLimitData } = require('../core/models/application');

(async () => {
	// ===COUNT & LIMIT DATA=== //
	const countLimitData = new CountLimitData(settings);
	await puppeteerService.initiate(countLimitData, true);
	const pageSource = await puppeteerService.crawl('');
	logUtils.log(pageSource);
})();