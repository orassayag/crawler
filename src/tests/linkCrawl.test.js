require('../services/files/initiate.service').initiate('test');
const settings = require('../settings/settings');
const { CountLimitData } = require('../core/models/application');
const puppeteerService = require('../services/files/puppeteer.service');
const { logUtils } = require('../utils');

(async () => {
	// ===COUNT & LIMIT=== //
	const countLimitData = new CountLimitData(settings);
	await puppeteerService.initiate(countLimitData, true);
	const pageSource = await puppeteerService.crawl('');
	logUtils.log(pageSource);
})();