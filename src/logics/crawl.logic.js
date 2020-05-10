const settings = require('../settings/settings');
const { CountsLimitsData, ApplicationData, DatabaseData, LogsData, PathsData, SearchData } = require('../core/models/application');
const { logUtils, timeUtils, systemUtils } = require('../utils');
const globalUtils = require('../utils/files/global.utils');
const { confirmationService, databaseService, domainsCounterService, crawlEmailAddressService, crawlLinkService,
    logService, searchService, sourceService } = require('../services');
const { Color } = require('../core/enums/files/text.enum');
const { Status, GoalType } = require('../core/enums/files/system.enum');
const { DomainsCounterSourceType } = require('../core/enums/files/script.enum');

class CrawlLogic {

    constructor() {
        // ===LOGS=== //
        this.logsData = null;
        // ==SEARCH DATA=== //
        this.searchData = null;
        // ===COUNTS & LIMITS DATA=== //
        this.countsLimitsData = null;
        // ===PATHS DATA=== //
        this.pathsData = null;
        // ===DATABASE DATA=== //
        this.databaseData = null;
        // ===APPLICATION DATA=== //
        this.applicationData = null;
        // ===SEARCH PROCESS DATA=== //
        this.searchProcessData = null;
    }

    async run() {
        // Let the user confirm all the IMPORTANT settings before you start.
        await this.confirm();
        // Initiate all the settings, configurations, services, ect.
        await this.initiate();
        // Validate internet connection.
        await this.validateInternetConnection();
        // Validate active steps.
        this.validateActiveSteps();
        // Start the crawling processes.
        await this.startCrawl();
    }

    async confirm() {
        if (!await confirmationService.confirm(settings)) {
            systemUtils.exit('ABORTED BY THE USER', Color.RED);
        }
    }

    async initiate() {
        // Initiate the settings.
        this.initiateSettings();
        // Initiate all the services.
        logUtils.logMagentaStatus('INITIATE THE SERVICES');
        // Initiate the database service.
        await this.initiateDatabaseService();
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
        this.applicationData = new ApplicationData({ settings: settings, status: Status.INITIATE });
        // ===LOGS=== //
        this.logsData = new LogsData(settings);
        // ==SEARCH DATA=== //
        this.searchData = new SearchData(settings);
        // ===COUNTS & LIMITS DATA=== //
        this.countsLimitsData = new CountsLimitsData(settings);
        // ===PATHS DATA=== //
        this.pathsData = new PathsData(settings);
        // ===DATABASE DATA=== //
        this.databaseData = new DatabaseData(settings);
        // ===SEARCH PROCESS DATA=== //
        this.searchProcessData = null;
    }

    async initiateDatabaseService() {
        // Initiate the database service.
        await databaseService.initiate({ applicationData: this.applicationData, countsLimitsData: this.countsLimitsData, databaseData: this.databaseData });
        // Load all the previous existing email addresses from the database.
        this.applicationData.crawlEmailAddressesData.databaseCount = await databaseService.getEmailAddressesCount();
    }

    async initiateSourceService() {
        // Initiate the source service.
        await sourceService.initiate({ applicationData: this.applicationData, pathsData: this.pathsData, countsLimitsData: this.countsLimitsData });
    }

    initiateSearchService() {
        // Initiate the search service.
        searchService.initiate({ searchData: this.searchData, countsLimitsData: this.countsLimitsData });
    }

    async initiateCrawlLinkService() {
        // Initiate the crawl link service.
        await crawlLinkService.initiate(this.applicationData);
    }

    initiateCrawlEmailAddressService() {
        // Initiate the crawl email address service.
        crawlEmailAddressService.initiate({ applicationData: this.applicationData, countsLimitsData: this.countsLimitsData });
    }

    async initiateLogService() {
        // Initiate the log service.
        await logService.initiate({
            logsData: this.logsData,
            applicationData: this.applicationData,
            databaseData: this.databaseData,
            countsLimitsData: this.countsLimitsData,
            pathsData: this.pathsData
        });
    }

    validateActiveSteps() {
        const isNoActiveSteps = !this.applicationData.isLinksStep && !this.applicationData.isCrawlStep && !this.applicationData.isSendStep;
        if (isNoActiveSteps) {
            systemUtils.exit('NO ACTIVE STEPS', Color.RED);
        }
        const isNoLinksNoSend = !this.applicationData.isLinksStep && this.applicationData.isCrawlStep && !this.applicationData.isSendStep;
        const isNoLinksNoCrawl = !this.applicationData.isLinksStep && !this.applicationData.isCrawlStep && this.applicationData.isSendStep;
        const isNoLinks = !this.applicationData.isLinksStep;
        if (isNoLinksNoSend || isNoLinksNoCrawl || isNoLinks) {
            systemUtils.exit('LINKS STEP IS NOT ACTIVE', Color.RED);
        }
    }

    async startCrawl() {
        const crawlInterval = setInterval(async () => {
            // Start the process for the first interval round.
            if (!this.applicationData.startDateTime) {
                this.applicationData.setCrawlStart();
                await this.startProcesses();
            }
            // Update the current time of the process.
            const { time, minutes } = timeUtils.getDifferenceTimeBetweenDates({ startDateTime: this.applicationData.startDateTime, endDateTime: new Date() });
            this.applicationData.time = time;
            this.applicationData.minutesCount = minutes;
            if (this.applicationData.isStatusMode) {
                // Log the status process each interval round.
                logService.logStatus(this.applicationData);
            }
            else {
                // Log the status console each interval round.
                logService.logProgress({ applicationData: this.applicationData, searchProcessData: this.searchProcessData });
            }
            // Check if need to exit the interval.
            await this.checkStatus(crawlInterval);
        }, this.countsLimitsData.millisecondsIntervalCount);
    }

    async pause(milliseconds) {
        this.applicationData.status = Status.PAUSE;
        await globalUtils.sleep(milliseconds);
    }

    async startProcesses() {
        for (let i = 0; i < this.countsLimitsData.maximumSearchProcessesCount; i++) {
            this.searchProcessData = null;
            this.applicationData.processIndex = i;
            await this.runProcess();
            await this.pause(this.countsLimitsData.millisecondsDelayBetweenProcessCount);
        }
    }

    async runProcess() {
        for (let i = 0; i < this.countsLimitsData.maximumSearchEnginePagesPerProcessCount; i++) {
            if (!this.applicationData.isLinksStep) {
                break;
            }
            this.searchProcessData = searchService.getSearchProcessData(this.searchProcessData, i);
            // Update the crawl data.
            this.applicationData.pageIndex = i;
            this.applicationData.pageLinksCount = 0;
            this.applicationData.status = Status.FETCH;
            // Get all valid links from the search engine source page.
            const searchEngineResults = await crawlLinkService.getSearchEnginePageLinks({ searchProcessData: this.searchProcessData, totalCrawlCount: this.applicationData.crawlLinksData.crawlCount });
            if (!searchEngineResults) {
                break;
            }
            // Update the crawl data.
            const crawlLinksList = searchEngineResults.crawlLinksList;
            this.applicationData.crawlLinksData.updateLinksData(searchEngineResults);
            this.applicationData.updateErrorPageInARow(searchEngineResults.isValidPage);
            this.applicationData.pageLinksCount = crawlLinksList.length;
            if (this.applicationData.pageLinksCount > 0) {
                await this.crawlLinks(crawlLinksList);
            }
            else {
                this.applicationData.pageLinksIndex = -1;
            }
            this.pause(this.countsLimitsData.millisecondsDelayBetweenSearchPagesCount);
        }
    }

    async crawlLinks(crawlLinksList) {
        // Loop on each page and crawl all email addresses from the page's source.
        for (let i = 0, length = crawlLinksList.length; i < length; i++) {
            this.searchProcessData.pageLink = null;
            await this.scanEmailAddresses(i, crawlLinksList[i]);
            await this.pause(this.countsLimitsData.millisecondsDelayBetweenCrawlPagesCount);
        }
    }

    async scanEmailAddresses(i, link) {
        // If goal has complete to end - Don't continue.
        if (this.checkGoalComplete()) {
            return;
        }
        this.applicationData.pageLinksIndex = i;
        this.applicationData.status = Status.CRAWL;
        this.searchProcessData.pageLink = link;
        if (!this.applicationData.isCrawlStep) {
            return;
        }
        // Handle all the email addresses from the page's source.
        const emailAddressesResult = await crawlEmailAddressService.getEmailAddressesFromPage({ link: link, totalSaveCount: this.applicationData.crawlEmailAddressesData.saveCount });
        if (!emailAddressesResult) {
            return;
        }
        this.applicationData.crawlEmailAddressesData.updateEmailAddressData(emailAddressesResult);
        this.applicationData.trendingSaveList = emailAddressesResult.trendingSaveList;
        this.applicationData.crawlLinksData.updateErrorLink(emailAddressesResult.isValidPage);
        this.applicationData.updateErrorPageInARow(emailAddressesResult.isValidPage);
    }

    checkGoalComplete() {
        // Update the progress data.
        switch (this.applicationData.goalType) {
            case GoalType.EMAIL_ADDRESSES:
                this.applicationData.progressValue = this.applicationData.crawlEmailAddressesData.saveCount;
                break;
            case GoalType.MINUTES:
                this.applicationData.progressValue = this.applicationData.minutesCount;
                break;
            case GoalType.LINKS:
                this.applicationData.progressValue = this.applicationData.crawlLinksData.crawlCount;
                break;
        }

        // Check if complete the goal value - Exit the interval.
        return this.applicationData.goalValue <= this.applicationData.progressValue;
    }

    async checkStatus(crawlInterval) {
        // Check if complete the goal value - Exit the interval.
        if (this.checkGoalComplete()) {
            await this.endProcesses({ crawlInterval: crawlInterval, exitReason: 'GOAL COMPLETE', color: Color.GREEN });
        }

        // If it's the last process, last page, and last link - Exit the interval.
        if (this.applicationData.processIndex === (this.countsLimitsData.maximumSearchProcessesCount - 1) &&
            this.applicationData.pageIndex === (this.countsLimitsData.maximumSearchEnginePagesPerProcessCount - 1) &&
            this.applicationData.pageLinksIndex === (this.applicationData.pageLinksCount - 1)) {
            await this.exitError(crawlInterval, 'PROCESSES LIMIT');
        }

        // Check if error pages in a row exceeded the limit.
        if (this.applicationData.errorPageInARowCounter >= this.countsLimitsData.maximumErrorPageInARowCount) {
            await this.exitError(crawlInterval, 'ERROR PAGE IN A ROW');
        }

        // Check if unsave email addresses exceeded the limit.
        if (this.applicationData.crawlEmailAddressesData.unsaveCount >= this.countsLimitsData.maximumUnsaveEmailAddressesCount) {
            await this.exitError(crawlInterval, 'ERROR UNSAVE EMAIL ADDRESSES');
        }
    }

    async exitError(crawlInterval, error) {
        await this.endProcesses({ crawlInterval: crawlInterval, exitReason: `${error} EXCEEDED THE LIMIT`, color: Color.RED });
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
            await domainsCounterService.run({ sourceType: DomainsCounterSourceType.FILE, sourcePath: logService.emailAddressesPath, isLogs: false });
        }
    }

    async endProcesses(data) {
        const { crawlInterval, exitReason, color } = data;
        clearInterval(crawlInterval);
        this.applicationData.status = Status.FINISH;
        logService.logProgress({ applicationData: this.applicationData, searchProcessData: this.searchProcessData });
        await this.logDomainsCounter();
        sourceService.close();
        systemUtils.exit(exitReason, color);
    }
}

module.exports = CrawlLogic;