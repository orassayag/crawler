const settings = require('../settings/settings');
const { CountLimitData, ApplicationData, LogData, MongoDatabaseData, PathData, SearchData } = require('../core/models/application');
const { logUtils, timeUtils, systemUtils, fileUtils, validationUtils } = require('../utils');
const globalUtils = require('../utils/files/global.utils');
const { Color, DomainsCounterSourceType, GoalType, Plan, Status } = require('../core/enums');
const { domainsCounterService, crawlEmailAddressService, crawlLinkService,
    logService, mongoDatabaseService, searchService, sourceService } = require('../services');
const { activeSearchEngineNames } = require('../configurations/searchEngines.configuration');
const puppeteerService = require('../services/files/puppeteer.service');

class CrawlLogic {

    constructor() {
        // ===LOG=== //
        this.logData = null;
        // ==SEARCH DATA=== //
        this.searchData = null;
        // ===COUNT & LIMIT DATA=== //
        this.countLimitData = null;
        // ===PATH DATA=== //
        this.pathData = null;
        // ===MONGO DATABASE DATA=== //
        this.mongoDatabaseData = null;
        // ===APPLICATION DATA=== //
        this.applicationData = null;
        // ===SEARCH PROCESS DATA=== //
        this.searchProcessData = null;
        // ===LINKS LIST DATA (SESSION TEST)=== //
        this.linksList = null;
        this.isSessionTestPlan = false;
        this.planName = Plan.STANDARD;
        // ===MONITOR DATA=== //
        this.lastUpdateTime = new Date();
    }

    async run(linksList) {
        this.validateSessionTest(linksList);
        // Initiate all the settings, configurations, services, ect.
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
            this.planName = Plan.SESSION_TEST;
        }
    }

    async initiate() {
        // Initiate the settings.
        this.initiateSettings();
        // Initiate all the services.
        logUtils.logMagentaStatus('INITIATE THE SERVICES');
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
        logUtils.logMagentaStatus('INITIATE THE SETTINGS');
        // ===APPLICATION DATA=== //
        this.applicationData = new ApplicationData({
            settings: settings,
            activeSearchEngineNames: activeSearchEngineNames,
            status: Status.INITIATE,
            plan: this.planName,
            restartsCount: process.argv[2]
        });
        // ===LOG=== //
        this.logData = new LogData(settings);
        // ==SEARCH DATA=== //
        this.searchData = new SearchData(settings);
        // ===COUNT & LIMIT DATA=== //
        this.countLimitData = new CountLimitData(settings);
        // ===PATH DATA=== //
        this.pathData = new PathData(settings);
        // ===MONGO DATABASE DATA=== //
        this.mongoDatabaseData = new MongoDatabaseData(settings);
        // ===SEARCH PROCESS DATA=== //
        this.searchProcessData = null;
        // ===SESSION TEST=== //
        if (this.isSessionTestPlan) {
            this.countLimitData.maximumSearchProcessesCount = 2;
            this.countLimitData.maximumSearchEnginePagesPerProcessCount = 1;
        }
    }

    async initiateMongoDatabaseService() {
        // Initiate the Mongo database service.
        await mongoDatabaseService.initiate({
            countLimitData: this.countLimitData,
            mongoDatabaseData: this.mongoDatabaseData
        });
        // Load all the previous existing email addresses from the Mongo database.
        this.applicationData.crawlEmailAddressData.databaseCount = await mongoDatabaseService.getEmailAddressesCount();
    }

    async initiateSourceService() {
        // Initiate the source service.
        await sourceService.initiate({
            applicationData: this.applicationData,
            pathData: this.pathData,
            countLimitData: this.countLimitData
        });
    }

    initiateSearchService() {
        // Initiate the search service.
        searchService.initiate({
            searchData: this.searchData,
            countLimitData: this.countLimitData
        });
    }

    async initiateCrawlLinkService() {
        // Initiate the crawl link service.
        await crawlLinkService.initiate({
            applicationData: this.applicationData,
            countLimitData: this.countLimitData
        });
    }

    initiateCrawlEmailAddressService() {
        // Initiate the crawl email address service.
        crawlEmailAddressService.initiate({
            applicationData: this.applicationData,
            countLimitData: this.countLimitData
        });
    }

    async initiateLogService() {
        // Initiate the log service.
        await logService.initiate({
            logData: this.logData,
            applicationData: this.applicationData,
            mongoDatabaseData: this.mongoDatabaseData,
            countLimitData: this.countLimitData,
            pathData: this.pathData
        });
    }

    validateActiveMethods() {
        const isNoActiveMethods = !this.applicationData.isLinksMethodActive && !this.applicationData.isCrawlMethodActive;
        if (isNoActiveMethods) {
            systemUtils.exit(Status.NO_ACTIVE_METHODS, Color.RED);
        }
        const isNoLinksNoCrawl = !this.applicationData.isLinksMethodActive && !this.applicationData.isCrawlMethodActive;
        const isNoLinks = !this.applicationData.isLinksMethodActive;
        if (isNoLinksNoCrawl || isNoLinks) {
            systemUtils.exit(Status.LINKS_METHOD_IS_NOT_ACTIVE, Color.RED);
        }
    }

    startCrawl() {
        const crawlInterval = setInterval(async () => {
            // Start the process for the first interval round.
            if (!this.applicationData.startDateTime) {
                this.applicationData.startDateTime = new Date();
                await this.startProcesses();
            }
            // Update the current time of the process.
            const { time, minutes } = timeUtils.getDifferenceTimeBetweenDates({
                startDateTime: this.applicationData.startDateTime,
                endDateTime: new Date()
            });
            this.applicationData.time = time;
            this.applicationData.minutesCount = minutes;
            if (this.applicationData.isStatusMode) {
                // Log the status process each interval round.
                logService.logStatus(this.applicationData);
            }
            else {
                // Log the status console each interval round.
                logService.logProgress({
                    applicationData: this.applicationData,
                    searchProcessData: this.searchProcessData
                });
            }
            // Check if need to exit the interval.
            await this.checkStatus(crawlInterval);
        }, this.countLimitData.millisecondsIntervalCount);
    }

    async pause(milliseconds) {
        this.applicationData.status = Status.PAUSE;
        await globalUtils.sleep(milliseconds);
    }

    async startProcesses() {
        for (let i = 0; i < this.countLimitData.maximumSearchProcessesCount; i++) {
            this.searchProcessData = null;
            this.applicationData.processIndex = i;
            await this.runProcess();
            await fileUtils.emptyDirectory(this.pathData.downloadsPath);
            await this.pause(this.countLimitData.millisecondsDelayBetweenProcessCount);
        }
    }

    async getSearchEngineResults() {
        let isError = false;
        let searchEngineResults = null;
        try {
            searchEngineResults = await crawlLinkService.getSearchEnginePageLinks({
                searchProcessData: this.searchProcessData,
                totalCrawlCount: this.applicationData.crawlLinkData.crawlCount
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
        for (let i = 0; i < this.countLimitData.maximumSearchEnginePagesPerProcessCount; i++) {
            if (!this.applicationData.isLinksMethodActive) {
                break;
            }
            this.searchProcessData = searchService.getSearchProcessData(this.searchProcessData, i);
            // Update the crawl data.
            this.applicationData.pageIndex = i;
            this.applicationData.pageLinksCount = 0;
            this.applicationData.status = Status.FETCH;
            // Get all valid links from the search engine source page.
            const { isError, searchEngineResults } = this.isSessionTestPlan ? this.getSessionTestSearchEngineResults() : await this.getSearchEngineResults();
            if (isError) {
                break;
            }
            // Update the crawl data.
            const crawlLinksList = searchEngineResults.crawlLinksList;
            this.applicationData.crawlLinkData.updateLinksData(searchEngineResults);
            this.applicationData.pageLinksCount = crawlLinksList.length;
            if (this.applicationData.pageLinksCount > 0) {
                await this.crawlLinks(crawlLinksList);
            }
            else {
                this.applicationData.pageLinksIndex = -1;
            }
            this.pause(this.countLimitData.millisecondsDelayBetweenSearchPagesCount);
        }
    }

    async crawlLinks(crawlLinksList) {
        // Loop on each page and crawl all email addresses from the page's source.
        for (let i = 0, length = crawlLinksList.length; i < length; i++) {
            this.searchProcessData.pageLink = null;
            try {
                await this.scanEmailAddresses(i, crawlLinksList[i]);
            }
            catch (error) {
                continue;
            }
            await this.pause(this.countLimitData.millisecondsDelayBetweenCrawlPagesCount);
        }
    }

    async scanEmailAddresses(i, data) {
        // If goal has complete to end - Don't continue.
        if (this.checkGoalComplete()) {
            return;
        }
        const { link, userAgent } = data;
        this.applicationData.pageLinksIndex = i;
        this.applicationData.status = Status.CRAWL;
        this.searchProcessData.pageLink = link;
        this.searchProcessData.pageUserAgent = userAgent;
        if (!this.applicationData.isCrawlMethodActive) {
            return;
        }
        // Handle all the email addresses from the page's source.
        const emailAddressesResult = await crawlEmailAddressService.getEmailAddressesFromPage({
            linkData: data,
            totalSaveCount: this.applicationData.crawlEmailAddressData.saveCount
        });
        if (!emailAddressesResult) {
            throw new Error('page timeout');
        }
        this.applicationData.crawlEmailAddressData.updateEmailAddressData(emailAddressesResult, this.searchProcessData.searchEngine.name);
        this.applicationData.trendingSaveList = emailAddressesResult.trendingSaveList;
        this.applicationData.crawlLinkData.updateErrorLink(emailAddressesResult.isValidPage);
        // Update monitor data.
        if (emailAddressesResult.saveCount || emailAddressesResult.totalCount) {
            this.lastUpdateTime = new Date();
        }
    }

    checkGoalComplete() {
        // Update the progress data.
        switch (this.applicationData.goalType) {
            case GoalType.EMAIL_ADDRESSES:
                this.applicationData.progressValue = this.applicationData.crawlEmailAddressData.saveCount;
                break;
            case GoalType.MINUTES:
                this.applicationData.progressValue = this.applicationData.minutesCount;
                break;
            case GoalType.LINKS:
                this.applicationData.progressValue = this.applicationData.crawlLinkData.crawlCount;
                break;
        }
        // Check if complete the goal value - Exit the interval.
        return this.applicationData.goalValue <= this.applicationData.progressValue;
    }

    checkMonitor() {
        // Check if there is any change in a period ot time. If not -
        // Exit (probably the puppeteer service stuck. The application will restart again automatically).
        const diffLastUpdateResult = timeUtils.getDifferenceTimeBetweenDates({
            startDateTime: new Date(),
            endDateTime: this.lastUpdateTime
        });
        return this.applicationData.maximumMinutesWithoutUpdate <= diffLastUpdateResult.minutes;
    }

    async checkStatus(crawlInterval) {
        // Check if the application stuck and need to restart.
        if (this.checkMonitor()) {
            await this.endProcesses({
                crawlInterval: crawlInterval,
                exitReason: Status.APPLICATION_STUCK,
                color: Color.YELLOW,
                code: 1
            });
        }
        // Check if complete the goal value - Exit the interval.
        if (this.checkGoalComplete()) {
            await this.endProcesses({
                crawlInterval: crawlInterval,
                exitReason: Status.GOAL_COMPLETE,
                color: Color.GREEN,
                code: 66
            });
        }
        // If it's the last process, last page, and last link - Exit the interval.
        if (this.applicationData.processIndex === (this.countLimitData.maximumSearchProcessesCount - 1) &&
            this.applicationData.pageIndex === (this.countLimitData.maximumSearchEnginePagesPerProcessCount - 1) &&
            this.applicationData.pageLinksIndex === (this.applicationData.pageLinksCount - 1)) {
            await this.exitError(crawlInterval, Status.PROCESSES_LIMIT, 66);
        }
        // Check if error pages in a row exceeded the limit.
        if (puppeteerService.errorInARowCounter >= this.countLimitData.maximumErrorPageInARowCount) {
            await this.exitError(crawlInterval, Status.ERROR_PAGE_IN_A_ROW, 1);
        }
        // Check if unsave email addresses exceeded the limit.
        if (this.applicationData.crawlEmailAddressData.unsaveCount >= this.countLimitData.maximumUnsaveEmailAddressesCount) {
            await this.exitError(crawlInterval, Status.ERROR_UNSAVE_EMAIL_ADDRESSES, 66);
        }
    }

    async exitError(crawlInterval, error, code) {
        await this.endProcesses({
            crawlInterval: crawlInterval,
            exitReason: error,
            color: Color.RED,
            code: code
        });
    }

    async validateInternetConnection() {
        if (!this.applicationData.isProductionMode) {
            return;
        }
        logUtils.logMagentaStatus('VALIDATE INTERNET CONNECTION');
        const isConnected = await crawlLinkService.validateSearchEngineActive(this.applicationData.validationConnectionLink);
        if (!isConnected) {
            throw new Error('Internet connections is not available (1000004)');
        }
    }

    async logDomainsCounter() {
        if (this.applicationData.isRunDomainsCounter) {
            await domainsCounterService.run({
                sourceType: DomainsCounterSourceType.FILE,
                sourcePath: logService.emailAddressesPath,
                isLogs: false,
                isPartOfCrawLogic: true
            });
        }
    }

    async endProcesses(data) {
        const { crawlInterval, exitReason, color, code } = data;
        if (crawlInterval) {
            clearInterval(crawlInterval);
        }
        this.applicationData.status = Status.FINISH;
        logService.logProgress({
            applicationData: this.applicationData,
            searchProcessData: this.searchProcessData
        });
        await this.logDomainsCounter();
        sourceService.close();
        await puppeteerService.close();
        systemUtils.exit(exitReason, color, code);
    }
}

module.exports = CrawlLogic;