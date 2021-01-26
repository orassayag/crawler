const errorScript = require('./error.script');
const CrawlLogic = require('../logics/crawl.logic');

(async () => {
    await new CrawlLogic().run();
})().catch(e => errorScript.handleScriptError(e, 66));