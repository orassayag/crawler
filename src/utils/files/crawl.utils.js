const randomUseragent = require('random-useragent');

class CrawlUtils {

    constructor() { }

    getRandomUserAgent() {
        return randomUseragent.getRandom();
    }
}

module.exports = new CrawlUtils();