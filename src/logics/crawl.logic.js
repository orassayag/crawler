const settings = require('../settings/settings');
const { ApplicationDataModel, CountLimitDataModel, LogDataModel, MongoDatabaseDataModel, PathDataModel, SearchDataModel } = require('../core/models/application');
const { ColorEnum, DomainsCounterSourceTypeEnum, GoalTypeEnum, PlanEnum, StatusEnum } = require('../core/enums');
const { activeSearchEngineNames } = require('../configurations');
const puppeteerService = require('../services/files/puppeteer.service');
const { crawlEmailAddressService, crawlLinkService, domainsCounterService,
    logService, mongoDatabaseService, searchService, sourceService } = require('../services');
const globalUtils = require('../utils/files/global.utils');
const { logUtils, fileUtils, systemUtils, timeUtils, validationUtils } = require('../utils');

class CrawlLogic {

    constructor() {
        // ===LOG=== //
        this.logDataModel = null;
        // ===SEARCH=== //
        this.searchDataModel = null;
        // ===COUNT & LIMIT=== //
        this.countLimitDataModel = null;
        // ===PATH=== //
        this.pathDataModel = null;
        // ===MONGO DATABASE=== //
        this.mongoDatabaseDataModel = null;
        // ===APPLICATION=== //
        this.applicationDataModel = null;
        // ===SEARCH PROCESS=== //
        this.searchProcessDataModel = null;
        // ===LINKS LIST (SESSION TEST)=== //
        this.linksList = null;
        this.isSessionTestPlan = false;
        this.planName = PlanEnum.STANDARD;
        // ===MONITOR=== //
        this.lastUpdateTime = timeUtils.getCurrentDate();
    }

    async run(linksList) {
        this.validateSessionTest(linksList);
        // Initiate all the settings, configurations, services, etc...
        await this.initiate();
        // Validate internet connection.
        await this.validateInternetConnection();
        // Validate active methods.
        this.validateActiveMethods();
        // Start the crawling processes.
        this.startCrawl();
    }

    validateSessionTest(linksList) {
        // In case of session test - Assign the session links list.
        if (validationUtils.isExists(linksList)) {
            this.linksList = linksList;
            this.isSessionTestPlan = true;
            this.planName = PlanEnum.SESSION_TEST;
        }
    }

    async initiate() {
        // Initiate the settings.
        this.initiateSettings();
        // Initiate all the services.
        this.updateStatus('INITIATE THE SERVICES', StatusEnum.INITIATE);
        // Initiate the Mongo database service.
        await this.initiateMongoDatabaseService();
        // Initiate the sources service.
        await this.initiateSourceService();
        // Initiate the search service.
        this.initiateSearchService();
        // Initiate the crawl link service.
        await this.initiateCrawlLinkService();
        // Initiate the crawl email address service.
        this.initiateCrawlEmailAddressService();
        // Initiate the log service.
        await this.initiateLogService();
    }

    initiateSettings() {
        this.updateStatus('INITIATE THE SETTINGS', StatusEnum.SETTINGS);
        // ===APPLICATION=== //
        this.applicationDataModel = new ApplicationDataModel({
            settings: settings,
            activeSearchEngineNames: activeSearchEngineNames,
            status: StatusEnum.INITIATE,
            plan: this.planName,
            restartsCount: process.argv[2]
        });
        // ===LOG=== //
        this.logDataModel = new LogDataModel(settings);
        // ===SEARCH=== //
        this.searchDataModel = new SearchDataModel(settings);
        // ===COUNT & LIMIT=== //
        this.countLimitDataModel = new CountLimitDataModel(settings);
        // ===PATH=== //
        this.pathDataModel = new PathDataModel(settings);
        // ===MONGO DATABASE=== //
        this.mongoDatabaseDataModel = new MongoDatabaseDataModel(settings);
        // ===SEARCH PROCESS=== //
        this.searchProcessDataModel = null;
        // ===SESSION TEST=== //
        if (this.isSessionTestPlan) {
            this.countLimitDataModel.maximumSearchProcessesCount = 2;
            this.countLimitDataModel.maximumSearchEnginePagesPerProcessCount = 1;
        }
    }

    async initiateMongoDatabaseService() {
        // Initiate the Mongo database service.
        await mongoDatabaseService.initiate({
            countLimitDataModel: this.countLimitDataModel,
            mongoDatabaseDataModel: this.mongoDatabaseDataModel
        });
        // Load all the previous existing email addresses from the Mongo database.
        this.applicationDataModel.crawlEmailAddressDataModel.databaseCount = await mongoDatabaseService.getEmailAddressesCount();
    }

    async initiateSourceService() {
        // Initiate the source service.
        await sourceService.initiate({
            applicationDataModel: this.applicationDataModel,
            pathDataModel: this.pathDataModel,
            countLimitDataModel: this.countLimitDataModel
        });
    }

    initiateSearchService() {
        // Initiate the search service.
        searchService.initiate({
            searchDataModel: this.searchDataModel,
            countLimitDataModel: this.countLimitDataModel
        });
    }

    async initiateCrawlLinkService() {
        // Initiate the crawl link service.
        await crawlLinkService.initiate({
            applicationDataModel: this.applicationDataModel,
            countLimitDataModel: this.countLimitDataModel
        });
    }

    initiateCrawlEmailAddressService() {
        // Initiate the crawl email address service.
        crawlEmailAddressService.initiate({
            applicationDataModel: this.applicationDataModel,
            countLimitDataModel: this.countLimitDataModel
        });
    }

    async initiateLogService() {
        // Initiate the log service.
        await logService.initiate({
            logDataModel: this.logDataModel,
            applicationDataModel: this.applicationDataModel,
            mongoDatabaseDataModel: this.mongoDatabaseDataModel,
            countLimitDataModel: this.countLimitDataModel,
            pathDataModel: this.pathDataModel
        });
    }

    validateActiveMethods() {
        const isNoActiveMethods = !this.applicationDataModel.isLinksMethodActive && !this.applicationDataModel.isCrawlMethodActive;
        if (isNoActiveMethods) {
            systemUtils.exit(StatusEnum.NO_ACTIVE_METHODS, ColorEnum.RED);
        }
        const isNoLinksNoCrawl = !this.applicationDataModel.isLinksMethodActive && !this.applicationDataModel.isCrawlMethodActive;
        const isNoLinks = !this.applicationDataModel.isLinksMethodActive;
        if (isNoLinksNoCrawl || isNoLinks) {
            systemUtils.exit(StatusEnum.LINKS_METHOD_IS_NOT_ACTIVE, ColorEnum.RED);
        }
    }

    startCrawl() {
        const crawlInterval = setInterval(async () => {
            // Start the process for the first interval round.
            if (!this.applicationDataModel.startDateTime) {
                this.applicationDataModel.startDateTime = timeUtils.getCurrentDate();
                await this.startProcesses();
            }
            // Update the current time of the process.
            const { time, minutes } = timeUtils.getDifferenceTimeBetweenDates({
                startDateTime: this.applicationDataModel.startDateTime,
                endDateTime: timeUtils.getCurrentDate()
            });
            this.applicationDataModel.time = time;
            this.applicationDataModel.minutesCount = minutes;
            if (this.applicationDataModel.isStatusMode) {
                // Log the status process each interval round.
                logService.logStatus(this.applicationDataModel);
            }
            else {
                // Log the status console each interval round.
                logService.logProgress({
                    applicationDataModel: this.applicationDataModel,
                    searchProcessDataModel: this.searchProcessDataModel
                });
            }
            // Check if it needs to exit the interval.
            await this.checkStatus(crawlInterval);
        }, this.countLimitDataModel.millisecondsIntervalCount);
    }

    async pause(milliseconds) {
        this.applicationDataModel.status = StatusEnum.PAUSE;
        await globalUtils.sleep(milliseconds);
    }

    async startProcesses() {
        for (let i = 0; i < this.countLimitDataModel.maximumSearchProcessesCount; i++) {
            this.searchProcessDataModel = null;
            this.applicationDataModel.processIndex = i;
            await this.runProcess();
            await fileUtils.emptyDirectory(this.pathDataModel.downloadsPath);
            await this.pause(this.countLimitDataModel.millisecondsDelayBetweenProcessCount);
        }
    }

    async getSearchEngineResults() {
        let isError = false;
        let searchEngineResults = null;
        try {
            searchEngineResults = await crawlLinkService.getSearchEnginePageLinks({
                searchProcessDataModel: this.searchProcessDataModel,
                totalCrawlCount: this.applicationDataModel.crawlLinkDataModel.crawlCount
            });
        }
        catch (error) {
            isError = true;
        }
        if (!searchEngineResults) {
            isError = true;
        }
        return {
            isError: isError,
            searchEngineResults: searchEngineResults
        };
    }

    getSessionTestSearchEngineResults() {
        return {
            isError: false,
            searchEngineResults: crawlLinkService.getSessionTestPageLinks(this.linksList)
        };
    }

    async runProcess() {
        for (let i = 0; i < this.countLimitDataModel.maximumSearchEnginePagesPerProcessCount; i++) {
            if (!this.applicationDataModel.isLinksMethodActive) {
                break;
            }
            this.searchProcessDataModel = searchService.getSearchProcessData(this.searchProcessDataModel, i);
            // Update the crawl data.
            this.applicationDataModel.pageIndex = i;
            this.applicationDataModel.pageLinksCount = 0;
            this.applicationDataModel.status = StatusEnum.FETCH;
            // Get all valid links from the search engine source page.
            const { isError, searchEngineResults } = this.isSessionTestPlan ? this.getSessionTestSearchEngineResults() : await this.getSearchEngineResults();
            if (isError) {
                break;
            }
            // Update the crawl data.
            const crawlLinksList = searchEngineResults.crawlLinksList;
            this.applicationDataModel.crawlLinkDataModel.updateLinksData(searchEngineResults);
            this.applicationDataModel.pageLinksCount = crawlLinksList.length;
            if (this.applicationDataModel.pageLinksCount > 0) {
                await this.crawlLinks(crawlLinksList);
            }
            else {
                this.applicationDataModel.pageLinksIndex = -1;
            }
            await this.pause(this.countLimitDataModel.millisecondsDelayBetweenSearchPagesCount);
        }
    }

    async crawlLinks(crawlLinksList) {
        // Loop on each page and crawl all email addresses from the page's source.
        for (let i = 0, length = crawlLinksList.length; i < length; i++) {
            this.searchProcessDataModel.pageLink = null;
            try {
                await this.scanEmailAddresses(i, crawlLinksList[i]);
            }
            catch (error) {
                continue;
            }
            await this.pause(this.countLimitDataModel.millisecondsDelayBetweenCrawlPagesCount);
        }
    }

    async scanEmailAddresses(i, data) {
        // If goal has complete to end - Don't continue.
        if (this.checkGoalComplete()) {
            return;
        }
        const { link, userAgent } = data;
        this.applicationDataModel.pageLinksIndex = i;
        this.applicationDataModel.status = StatusEnum.CRAWL;
        this.searchProcessDataModel.pageLink = link;
        this.searchProcessDataModel.pageUserAgent = userAgent;
        if (!this.applicationDataModel.isCrawlMethodActive) {
            return;
        }
        // Handle all the email addresses from the page's source.
        const emailAddressesResultModel = await crawlEmailAddressService.getEmailAddressesFromPage({
            linkData: data,
            totalSaveCount: this.applicationDataModel.crawlEmailAddressDataModel.saveCount
        });
        if (!emailAddressesResultModel) {
            throw new Error('page timeout');
        }
        this.applicationDataModel.crawlEmailAddressDataModel.updateEmailAddressData(emailAddressesResultModel, this.searchProcessDataModel.searchEngineModel.name);
        this.applicationDataModel.trendingSaveList = emailAddressesResultModel.trendingSaveList;
        this.applicationDataModel.crawlLinkDataModel.updateErrorLink(emailAddressesResultModel.isValidPage);
        // Update monitor data.
        if (emailAddressesResultModel.saveCount || emailAddressesResultModel.totalCount) {
            this.lastUpdateTime = timeUtils.getCurrentDate();
        }
    }

    checkGoalComplete() {
        // Update the progress data.
        switch (this.applicationDataModel.goalType) {
            case GoalTypeEnum.EMAIL_ADDRESSES: {
                this.applicationDataModel.progressValue = this.applicationDataModel.crawlEmailAddressDataModel.saveCount;
                break;
            }
            case GoalTypeEnum.MINUTES: {
                this.applicationDataModel.progressValue = this.applicationDataModel.minutesCount;
                break;
            }
            case GoalTypeEnum.LINKS: {
                this.applicationDataModel.progressValue = this.applicationDataModel.crawlLinkDataModel.crawlCount;
                break;
            }
        }
        // Check if complete the goal value - Exit the interval.
        return this.applicationDataModel.goalValue <= this.applicationDataModel.progressValue;
    }

    checkMonitor() {
        // Check if there is any change in a period of time. If not -
        // Exit (probably the puppeteer service stuck. The application will restart again automatically).
        const diffLastUpdateResult = timeUtils.getDifferenceTimeBetweenDates({
            startDateTime: timeUtils.getCurrentDate(),
            endDateTime: this.lastUpdateTime
        });
        return this.applicationDataModel.maximumMinutesWithoutUpdate <= diffLastUpdateResult.minutes;
    }

    async checkStatus(crawlInterval) {
        // Check if the application is stuck and need to restart.
        if (this.checkMonitor()) {
            await this.endProcesses({
                crawlInterval: crawlInterval,
                exitReason: StatusEnum.APPLICATION_STUCK,
                color: ColorEnum.YELLOW,
                code: 1
            });
        }
        // Check if complete the goal value - Exit the interval.
        if (this.checkGoalComplete()) {
            await this.endProcesses({
                crawlInterval: crawlInterval,
                exitReason: StatusEnum.GOAL_COMPLETE,
                color: ColorEnum.GREEN,
                code: 66
            });
        }
        // If it's the last process, last page, and last link - Exit the interval.
        if (this.applicationDataModel.processIndex === (this.countLimitDataModel.maximumSearchProcessesCount - 1) &&
            this.applicationDataModel.pageIndex === (this.countLimitDataModel.maximumSearchEnginePagesPerProcessCount - 1) &&
            this.applicationDataModel.pageLinksIndex === (this.applicationDataModel.pageLinksCount - 1)) {
            await this.exitError(crawlInterval, StatusEnum.PROCESSES_LIMIT, 66);
        }
        // Check if error pages in a row exceeded the limit.
        if (puppeteerService.errorInARowCounter >= this.countLimitDataModel.maximumErrorPageInARowCount) {
            await this.exitError(crawlInterval, StatusEnum.ERROR_PAGE_IN_A_ROW, 1);
        }
        // Check if unsave email addresses exceeded the limit.
        if (this.applicationDataModel.crawlEmailAddressDataModel.unsaveCount >= this.countLimitDataModel.maximumUnsaveEmailAddressesCount) {
            await this.exitError(crawlInterval, StatusEnum.ERROR_UNSAVE_EMAIL_ADDRESSES, 66);
        }
    }

    async exitError(crawlInterval, error, code) {
        await this.endProcesses({
            crawlInterval: crawlInterval,
            exitReason: error,
            color: ColorEnum.RED,
            code: code
        });
    }

    async validateInternetConnection() {
        if (!this.applicationDataModel.isProductionMode) {
            return;
        }
        this.updateStatus('VALIDATE INTERNET CONNECTION', StatusEnum.VALIDATE);
        const isConnected = await crawlLinkService.validateSearchEngineActive(this.applicationDataModel.validationConnectionLink);
        if (!isConnected) {
            await this.exitError(null, StatusEnum.NO_INTERNET_CONNECTION, 66);
        }
    }

    async logDomainsCounter() {
        if (this.applicationDataModel.isRunDomainsCounter) {
            await domainsCounterService.run({
                sourceType: DomainsCounterSourceTypeEnum.FILE,
                sourcePath: logService.emailAddressesPath,
                isLogs: false,
                isPartOfCrawLogic: true
            });
        }
    }

    updateStatus(text, status) {
        logUtils.logMagentaStatus(text);
        if (this.applicationDataModel) {
            this.applicationDataModel.status = status;
        }
    }

    async endProcesses(data) {
        const { crawlInterval, exitReason, color, code } = data;
        if (crawlInterval) {
            clearInterval(crawlInterval);
        }
        this.applicationDataModel.status = StatusEnum.FINISH;
        logService.logProgress({
            applicationDataModel: this.applicationDataModel,
            searchProcessDataModel: this.searchProcessDataModel
        });
        await this.logDomainsCounter();
        await puppeteerService.close();
        systemUtils.exit(exitReason, color, code);
    }
}

module.exports = CrawlLogic;