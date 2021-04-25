const { SearchProcessDataModel } = require('../../core/models/application');
const { SearchKeyGenderEnum, SearchPlaceHolderEnum } = require('../../core/enums');
const { advanceSearchKeys, basicSearchKeys, searchEngineStatuses, searchEngines } = require('../../configurations');
const { regexUtils, textUtils, validationUtils } = require('../../utils');

class SearchService {

    constructor() {
        this.searchDataModel = null;
        this.countLimitDataModel = null;
    }

    initiate(data) {
        const { searchDataModel, countLimitDataModel } = data;
        this.searchDataModel = searchDataModel;
        this.countLimitDataModel = countLimitDataModel;
    }

    getAllActiveSearchEngines() {
        return searchEngines.filter(engine => {
            return searchEngineStatuses.findIndex(status => engine.name === status.name && status.isActive) > -1;
        });
    }

    getSearchEngine() {
        return textUtils.getRandomKeyFromArray(this.getAllActiveSearchEngines());
    }

    updateSearchEngineData(data) {
        if (!data) {
            return;
        }
        const { name, domainAddress, isActive } = data;
        searchEngines[searchEngines.findIndex(engine => engine.name === name)].domainAddress = domainAddress;
        searchEngineStatuses[searchEngineStatuses.findIndex(engine => engine.name === name)].isActive = isActive;
    }

    generateBasicKey() {
        let searchKey = '';
        basicSearchKeys.map(l => {
            searchKey += `${textUtils.getRandomKeyFromArray(l)} `;
        });
        searchKey = searchKey.trim();
        if (searchKey.length > this.countLimitDataModel.maximumSearchKeyCharactersCount || searchKey.length < this.countLimitDataModel.minimumSearchKeyCharactersCount) {
            searchKey = '';
        }
        return searchKey;
    }

    generateAdvanceKey() {
        let searchKey = '';
        const randomGander = Object.values(SearchKeyGenderEnum)[textUtils.getRandomNumber(0, 2)];
        advanceSearchKeys.map(l => {
            const item = validationUtils.isExists(l) ? textUtils.getRandomKeyFromArray(l) : l[0];
            let word = item[`${randomGander}Key`];
            if (word) {
                if (item.isMultiFemaleKey) {
                    word = word.split(',')[textUtils.getRandomNumber(0, 1)];
                }
                if (item.isMiddleReplace) {
                    word = textUtils.getRandomBoolean() ? word.replace(' ', '_') : word;
                }
            }
            else {
                word = item.globalKey;
            }
            searchKey += `${word}${item.isNoSpaceAfter ? '' : ' '}`;
        });
        searchKey = searchKey.trim();
        return searchKey;
    }

    generateDisplaySearchKey(searchKey) {
        let displaySearchKey = '';
        const englishKeys = [];
        const hebrewKeys = [];
        searchKey.split(' ').map(key => {
            if (textUtils.isEnglishKey(key)) {
                englishKeys.push(key);
            } else {
                hebrewKeys.push(textUtils.reverseText(key));
            }
        });
        displaySearchKey = `${validationUtils.isExists(englishKeys) ? `${englishKeys.join(' ')}` : ''} ${hebrewKeys.reverse().join(' ')}`.trim();
        if (displaySearchKey.length > this.countLimitDataModel.maximumDisplaySearchKeyCharactersCount) {
            displaySearchKey = displaySearchKey.substring(0, this.countLimitDataModel.maximumDisplaySearchKeyCharactersCount);
        }
        return displaySearchKey;
    }

    generateSearchKey() {
        // Generate the search key.
        let resultSearchKey = null;
        if (this.searchDataModel.searchKey) {
            resultSearchKey = this.searchDataModel.searchKey;
        }
        else {
            for (let i = 0; i < this.countLimitDataModel.maximumRetriesGenerateSearchKeyCount; i++) {
                resultSearchKey = this.searchDataModel.isAdvanceSearchKeys ? this.generateAdvanceKey() : this.generateBasicKey();
                if (resultSearchKey) {
                    break;
                }
            }
        }
        if (!resultSearchKey) {
            throw new Error('No valid resultSearchKey was created (1000026)');
        }
        // Generate the search key for display by reverse only the UTF-8 keys.
        const resultDisplaySearchKey = this.generateDisplaySearchKey(resultSearchKey);
        return {
            searchKey: resultSearchKey.replace(regexUtils.cleanSpacesRegex, '+'),
            displaySearchKey: resultDisplaySearchKey
        };
    }

    createSearchEngineLinkTemplate(data) {
        const { searchKey, searchEngineModel, pageIndex } = data;
        const { baseURL, startIndex, advanceBy, templatesList } = searchEngineModel;
        let templateAddress = templatesList.length > 1 ? textUtils.getRandomKeyFromArray(templatesList) : templatesList[0];
        const newIndex = (pageIndex === 0 ? startIndex : pageIndex) + advanceBy;
        templateAddress = templateAddress.split(SearchPlaceHolderEnum.QUERY).join(searchKey);
        templateAddress = templateAddress.split(SearchPlaceHolderEnum.PAGER).join(newIndex);
        return `${baseURL}${templateAddress}`;
    }

    getSearchProcessData(searchProcessDataModel, pageIndex) {
        let searchKey = null;
        let displaySearchKey = null;
        let searchEngineModel = null;
        let searchEngineLinkTemplate = null;
        if (searchProcessDataModel) { // Process already exists - Need to update only the searchEngineLinkTemplate parameter.
            searchKey = searchProcessDataModel.searchKey;
            displaySearchKey = searchProcessDataModel.displaySearchKey;
            searchEngineModel = searchProcessDataModel.searchEngineModel;
            searchEngineLinkTemplate = this.createSearchEngineLinkTemplate({
                searchKey: searchKey,
                searchEngineModel: searchEngineModel,
                pageIndex: pageIndex
            });
            searchProcessDataModel.pageIndex = pageIndex;
            searchProcessDataModel.searchEngineLinkTemplate = searchEngineLinkTemplate;
        }
        else { // Generate the data for the process for the first time.
            const searchKeyResult = this.generateSearchKey();
            searchKey = searchKeyResult.searchKey;
            displaySearchKey = searchKeyResult.displaySearchKey;
            searchEngineModel = this.getSearchEngine();
            searchEngineLinkTemplate = this.createSearchEngineLinkTemplate({
                searchKey: searchKey,
                searchEngineModel: searchEngineModel,
                pageIndex: pageIndex
            });
            searchProcessDataModel = new SearchProcessDataModel({
                pageIndex: pageIndex,
                searchKey: searchKey,
                displaySearchKey: displaySearchKey,
                searchEngineModel: searchEngineModel,
                searchEngineLinkTemplate: searchEngineLinkTemplate
            });
        }
        return searchProcessDataModel;
    }
}

module.exports = new SearchService();