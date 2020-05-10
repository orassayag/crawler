const puppeteer = require('puppeteer');

class PuppeteerService {

    constructor() {
        this.browser = null;
        this.page = null;
        this.pageOptions = null;
        this.waitForFunction = null;
        this.isLinkCrawlTest = null;
    }

    async initiate(countsLimitsData, isLinkCrawlTest) {
        this.pageOptions = {
            waitUntil: 'networkidle2',
            timeout: countsLimitsData.millisecondsTimeoutSourceRequestCount
        };
        this.waitForFunction = 'document.querySelector("body")';
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        this.isLinkCrawlTest = isLinkCrawlTest;
    }

    async crawl(link) {
        const crawlResults = { isValidPage: true, pageSource: null };
        try {
            await this.page.goto(link, this.pageOptions);
            await this.page.waitForFunction(this.waitForFunction);
            crawlResults.pageSource = await this.page.content();
        }
        catch (error) {
            crawlResults.isValidPage = false;
        }
        if (this.isLinkCrawlTest) {
            this.close();
        }
        return crawlResults;
    }

    close() {
        if (!this.browser) {
            this.browser.close();
        }
    }
}

const puppeteerService = new PuppeteerService();
module.exports = puppeteerService;