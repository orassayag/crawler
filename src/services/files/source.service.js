const { SourceType } = require('../../core/enums');
const { fileUtils, pathUtils, textUtils, validationUtils } = require('../../utils');
let puppeteerService = null;
const searchService = require('./search.service');

class SourceService {

    constructor() {
        this.isProductionMode = null;
        this.sourcePath = null;
        this.distPath = null;
        this.countLimitData = null;
        this.searchEngineSourcesList = null;
        this.pageSourcesList = null;
    }

    async initiate(data) {
        const { applicationData, pathData, countLimitData } = data;
        this.isProductionMode = applicationData.isProductionMode;
        this.sourcePath = pathData.sourcePath;
        this.distPath = pathData.distPath;
        this.countLimitData = countLimitData;

        if (this.isProductionMode) {
            // On production, load puppeteer service and initiate it.
            puppeteerService = require('./puppeteer.service');
            await puppeteerService.initiate(this.countLimitData, false);
        }
        else {
            this.searchEngineSourcesList = [];
            this.pageSourcesList = [];
            this.loadAllDevelopmentModeSources();
        }
    }

    async loadAllDevelopmentModeSources() {
        const searchEngines = searchService.getAllActiveSearchEngines();
        for (let i = 0, length = searchEngines.length; i < length; i++) {
            await this.loadDevelopmentModeSourcesByType({
                sourceType: SourceType.ENGINE,
                searchEngine: searchEngines[i].name
            });
        }
        await this.loadDevelopmentModeSourcesByType({
            sourceType: SourceType.PAGE
        });
    }

    async loadDevelopmentModeSourcesByType(data) {
        const { sourceType, searchEngine } = data;
        let sourcePath = sourceType;
        if (searchEngine) {
            sourcePath = pathUtils.getJoinPath({
                targetPath: this.sourcesPath,
                targetName: sourceType
            });
            sourcePath = pathUtils.getJoinPath({
                targetPath: sourcePath,
                targetName: searchEngine
            });
        }
        else {
            sourcePath = pathUtils.getJoinPath({
                targetPath: this.sourcesPath,
                targetName: sourceType
            });
        }
        // Get all the files.
        let files = await fileUtils.getDirectoryFiles(sourcePath);
        // Validate that there is at least 1 file in the source directory.
        if (!validationUtils.isExists(files)) {
            throw new Error(`No any files exists in ${sourcePath} (1000026)`);
        }
        // Filter only the TXT files.
        files = files.filter(f => {
            return pathUtils.isTypeFile({
                fileName: f,
                fileExtension: 'txt'
            });
        });
        // Validate that there is at least 1 TXT file in the source directory.
        if (!validationUtils.isExists(files)) {
            throw new Error(`No TXT files exists in ${sourcePath} (1000027)`);
        }
        for (let i = 0, length = files.length; i < length; i++) {
            const pageSource = await fileUtils.readFile(pathUtils.getJoinPath({
                targetPath: sourcePath,
                targetName: files[i]
            }));
            switch (sourceType) {
                case SourceType.ENGINE:
                    this.searchEngineSourcesList.push({
                        name: searchEngine,
                        pageSource: pageSource
                    });
                    break;
                case SourceType.PAGE:
                    this.pageSourcesList.push(pageSource);
                    break;
            }
        }
    }

    getPageSource(data) {
        return this.isProductionMode ? this.getPageSourceProduction(data) : this.getPageSourceDevelopment(data);
    }

    async getPageSourceProduction(data) {
        const { linkData } = data;
        const { link, userAgent } = linkData;
        if (!link) {
            return '';
        }
        return await puppeteerService.crawl(link, userAgent);
    }

    getPageSourceDevelopment(data) {
        const { sourceType, searchEngine } = data;
        const crawlResults = { isValidPage: textUtils.getRandomBoolean(), pageSource: null };
        switch (sourceType) {
            case SourceType.ENGINE:
                crawlResults.pageSource = textUtils.getRandomKeyFromArray(this.searchEngineSourcesList.filter(se => se.name === searchEngine)).pageSource;
                break;
            case SourceType.PAGE:
                crawlResults.pageSource = textUtils.getRandomKeyFromArray(this.pageSourcesList);
                break;
        }
        return crawlResults;
    }

    close() {
        if (this.isProductionMode && puppeteerService) {
            puppeteerService.close();
        }
    }
}

module.exports = new SourceService();