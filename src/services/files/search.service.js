const { SearchProcessData } = require('../../core/models/application');
const { SearchKeyGender, SearchPlaceHolder } = require('../../core/enums');
const { searchEngines, searchEngineStatuses } = require('../../configurations/searchEngines.configuration');
const { advanceSearchKeys, basicSearchKeys } = require('../../configurations/searchKeys.configuration');
const { regexUtils, textUtils, validationUtils } = require('../../utils');

class SearchService {

    constructor() {
        this.searchData = null;
        this.countLimitData = null;
    }

    initiate(data) {
        const { searchData, countLimitData } = data;
        this.searchData = searchData;
        this.countLimitData = countLimitData;
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
        if (searchKey.length > this.countLimitData.maximumSearchKeyCharactersCount || searchKey.length < this.countLimitData.minimumSearchKeyCharactersCount) {
            searchKey = '';
        }
        return searchKey;
    }

    generateAdvanceKey() {
        let searchKey = '';
        const randomGander = Object.values(SearchKeyGender)[textUtils.getRandomNumber(0, 2)];
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
        if (displaySearchKey.length > this.countLimitData.maximumDisplaySearchKeyCharactersCount) {
            displaySearchKey = displaySearchKey.substring(0, this.countLimitData.maximumDisplaySearchKeyCharactersCount);
        }
        return displaySearchKey;
    }

    generateSearchKey() {
        // Generate the search key.
        let resultSearchKey = null;
        if (this.searchData.searchKey) {
            resultSearchKey = this.searchData.searchKey;
        }
        else {
            for (let i = 0; i < this.countLimitData.maximumRetriesGenerateSearchKeyCount; i++) {
                resultSearchKey = this.searchData.isAdvanceSearchKeys ? this.generateAdvanceKey() : this.generateBasicKey();
                if (resultSearchKey) {
                    break;
                }
            }
        }
        if (!resultSearchKey) {
            throw new Error('No valid resultSearchKey was created (1000025)');
        }
        // Generate the search key for display by reverse only the UTF-8 keys.
        const resultDisplaySearchKey = this.generateDisplaySearchKey(resultSearchKey);
        return {
            searchKey: resultSearchKey.replace(regexUtils.cleanSpacesRegex, '+'),
            displaySearchKey: resultDisplaySearchKey
        };
    }

    createSearchEngineLinkTemplate(data) {
        const { searchKey, searchEngine, pageIndex } = data;
        const { baseURL, startIndex, advanceBy, templatesList } = searchEngine;
        let templateAddress = templatesList.length > 1 ? textUtils.getRandomKeyFromArray(templatesList) : templatesList[0];
        const newIndex = (pageIndex === 0 ? startIndex : pageIndex) + advanceBy;
        templateAddress = templateAddress.split(SearchPlaceHolder.QUERY).join(searchKey);
        templateAddress = templateAddress.split(SearchPlaceHolder.PAGER).join(newIndex);
        return `${baseURL}${templateAddress}`;
    }

    getSearchProcessData(searchProcessData, pageIndex) {
        let searchKey = null;
        let displaySearchKey = null;
        let searchEngine = null;
        let searchEngineLinkTemplate = null;
        if (searchProcessData) { // Process already exists - Need to update only the searchEngineLinkTemplate parameter.
            searchKey = searchProcessData.searchKey;
            displaySearchKey = searchProcessData.displaySearchKey;
            searchEngine = searchProcessData.searchEngine;
            searchEngineLinkTemplate = this.createSearchEngineLinkTemplate({
                searchKey: searchKey,
                searchEngine: searchEngine,
                pageIndex: pageIndex
            });
            searchProcessData.pageIndex = pageIndex;
            searchProcessData.searchEngineLinkTemplate = searchEngineLinkTemplate;
        }
        else { // Generate the data for the process for the first time.
            const searchKeyResult = this.generateSearchKey();
            searchKey = searchKeyResult.searchKey;
            displaySearchKey = searchKeyResult.displaySearchKey;
            searchEngine = this.getSearchEngine();
            searchEngineLinkTemplate = this.createSearchEngineLinkTemplate({
                searchKey: searchKey,
                searchEngine: searchEngine,
                pageIndex: pageIndex
            });
            searchProcessData = new SearchProcessData({
                pageIndex: pageIndex,
                searchKey: searchKey,
                displaySearchKey: displaySearchKey,
                searchEngine: searchEngine,
                searchEngineLinkTemplate: searchEngineLinkTemplate
            });
        }
        return searchProcessData;
    }
}

module.exports = new SearchService();