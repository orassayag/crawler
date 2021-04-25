const { SourceTypeEnum } = require('../../core/enums');
let puppeteerService = null;
const searchService = require('./search.service');
const { fileUtils, pathUtils, textUtils, validationUtils } = require('../../utils');

class SourceService {

    constructor() {
        this.isProductionMode = null;
        this.sourcePath = null;
        this.distPath = null;
        this.countLimitDataModel = null;
        this.searchEngineSourcesList = null;
        this.pageSourcesList = null;
    }

    async initiate(data) {
        const { applicationDataModel, pathDataModel, countLimitDataModel } = data;
        this.isProductionMode = applicationDataModel.isProductionMode;
        this.sourcePath = pathDataModel.sourcePath;
        this.distPath = pathDataModel.distPath;
        this.countLimitDataModel = countLimitDataModel;

        if (this.isProductionMode) {
            // On production, load puppeteer service and initiate it.
            puppeteerService = require('./puppeteer.service');
            await puppeteerService.initiate(this.countLimitDataModel, false);
        }
        else {
            this.searchEngineSourcesList = [];
            this.pageSourcesList = [];
            await this.loadAllDevelopmentModeSources();
        }
    }

    async loadAllDevelopmentModeSources() {
        const searchEngines = searchService.getAllActiveSearchEngines();
        for (let i = 0, length = searchEngines.length; i < length; i++) {
            await this.loadDevelopmentModeSourcesByType({
                sourceType: SourceTypeEnum.ENGINE,
                searchEngineName: searchEngines[i].name
            });
        }
        await this.loadDevelopmentModeSourcesByType({
            sourceType: SourceTypeEnum.PAGE
        });
    }

    async loadDevelopmentModeSourcesByType(data) {
        const { sourceType, searchEngineName } = data;
        let sourcePath = sourceType;
        if (searchEngineName) {
            sourcePath = pathUtils.getJoinPath({
                targetPath: this.sourcesPath,
                targetName: sourceType
            });
            sourcePath = pathUtils.getJoinPath({
                targetPath: sourcePath,
                targetName: searchEngineName
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
            throw new Error(`No any files exists in ${sourcePath} (1000027)`);
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
            throw new Error(`No TXT files exists in ${sourcePath} (1000028)`);
        }
        for (let i = 0, length = files.length; i < length; i++) {
            const pageSource = await fileUtils.readFile(pathUtils.getJoinPath({
                targetPath: sourcePath,
                targetName: files[i]
            }));
            switch (sourceType) {
                case SourceTypeEnum.ENGINE: {
                    this.searchEngineSourcesList.push({
                        name: searchEngineName,
                        pageSource: pageSource
                    });
                    break;
                }
                case SourceTypeEnum.PAGE: {
                    this.pageSourcesList.push(pageSource);
                    break;
                }
            }
        }
    }

    async getPageSource(data) {
        return this.isProductionMode ? await this.getPageSourceProduction(data) : this.getPageSourceDevelopment(data);
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
        const { sourceType, searchEngineName } = data;
        const crawlResults = { isValidPage: textUtils.getRandomBoolean(), pageSource: null };
        switch (sourceType) {
            case SourceTypeEnum.ENGINE: {
                crawlResults.pageSource = textUtils.getRandomKeyFromArray(this.searchEngineSourcesList.filter(se => se.name === searchEngineName)).pageSource;
                break;
            }
            case SourceTypeEnum.PAGE: {
                crawlResults.pageSource = textUtils.getRandomKeyFromArray(this.pageSourcesList);
                break;
            }
        }
        return crawlResults;
    }

    async close() {
        if (this.isProductionMode && puppeteerService) {
            await puppeteerService.close();
        }
    }
}

module.exports = new SourceService();