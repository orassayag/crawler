const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const { crawlUtils } = require('../../utils');
const systemUtils = require('../../utils/files/system.utils');
const { Color } = require('../../core/enums/files/text.enum');

class PuppeteerService {

    constructor() {
        this.browser = null;
        this.page = null;
        this.pageOptions = null;
        this.waitForFunction = null;
        this.isLinkCrawlTest = null;
        this.timeout = null;
        this.pid = null;
        this.errorInARowCounter = null;
    }

    async initiate(countsLimitsData, isLinkCrawlTest) {
        this.errorInARowCounter = 0;
        this.timeout = countsLimitsData.millisecondsTimeoutSourceRequestCount;
        this.pageOptions = {
            waitUntil: 'networkidle2',
            timeout: this.timeout
        };
        this.waitForFunction = 'document.querySelector("body")';
        puppeteerExtra.use(pluginStealth());
        this.browser = await puppeteerExtra.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--single-process',
                '--no-zygote',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        this.pid = this.browser.process().pid;
        this.browser.on('disconnected', () => {
            systemUtils.killProcess(this.pid);
            systemUtils.exit('EXCEEDED THE LIMIT', Color.RED, 1);
        });
        this.page = await this.browser.newPage();
        await this.page.setRequestInterception(true);
        await this.page.setJavaScriptEnabled(false);
        await this.page.setDefaultNavigationTimeout(this.timeout);
        this.page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        this.page.on('dialog', async dialog => {
            await dialog.dismiss();
        });
        this.isLinkCrawlTest = isLinkCrawlTest;
    }

    async crawl(link, userAgent) {
        return await new Promise(async (resolve, reject) => {
            if (reject) { }
            // Limit the runtime of this function in case of stuck URL crawling process.
            const abortTimeout = setTimeout(async () => {
                try {
                    await this.page.reload(link, this.pageOptions);
                }
                catch (error) {
                    this.errorInARowCounter += 1;
                }
                resolve(null);
                return;
            }, this.timeout);
            if (!userAgent) {
                userAgent = crawlUtils.getRandomUserAgent();
            }
            const crawlResults = {
                isValidPage: true,
                pageSource: null
            };
            try {
                await this.page.setUserAgent(userAgent);
                await this.page.goto(link, this.pageOptions);
                await this.page.waitForFunction(this.waitForFunction, { timeout: this.timeout });
                crawlResults.pageSource = await this.page.content();
                this.errorInARowCounter = 0;
            }
            catch (error) {
                this.errorInARowCounter += 1;
                crawlResults.isValidPage = false;
            }
            if (this.isLinkCrawlTest) {
                await this.close();
            }
            clearTimeout(abortTimeout);
            resolve(crawlResults);
        }).catch();
    }

    async close() {
        if (this.browser) {
            try {
                await this.page.close();
                await this.browser.disconnect();
                await this.browser.close();
            }
            catch (error) {
                this.errorInARowCounter += 1;
            }
        }
    }
}

module.exports = new PuppeteerService();