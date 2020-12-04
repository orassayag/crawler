require('../services/files/initiate.service').initiate();
const CrawlLogic = require('../logics/crawl.logic');

(async () => {
	const linksList =
		[
			'https://www.example1.com',
			'https://www.example2.com'
		]
			.map(link => {
				return {
					link: link,
					userAgent: null
				};
			});
	await new CrawlLogic().run(linksList);
})();