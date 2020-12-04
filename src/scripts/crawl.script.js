const CrawlLogic = require('../logics/crawl.logic');

(async () => {
    await new CrawlLogic().run();
})();