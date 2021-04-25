require('../services/files/initiate.service').initiate('test');
const settings = require('../settings/settings');
const { CountLimitDataModel } = require('../core/models/application');
const puppeteerService = require('../services/files/puppeteer.service');
const { logUtils } = require('../utils');

(async () => {
	// ===COUNT & LIMIT=== //
	const countLimitDataModel = new CountLimitDataModel(settings);
	await puppeteerService.initiate(countLimitDataModel, true);
	const pageSource = await puppeteerService.crawl('');
	logUtils.log(pageSource);
})();