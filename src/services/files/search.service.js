const { regexUtils, textUtils, validationUtils } = require('../../utils');
const { basicSearchKeys, advanceSearchKeys } = require('../../configurations/searchKeys.configuration');
const { searchEngineStatuses, searchEngines } = require('../../configurations/searchEngines.configuration');
const { SearchPlaceHolder } = require('../../core/enums/files/search.enum');
const { SearchProcessData } = require('../../core/models/application');
const { SearchKeyGender } = require('../../core/enums/files/search.enum');

class SearchService {

    constructor() {
        this.searchData = null;
        this.countsLimitsData = null;
    }

    initiate(data) {
        const { searchData, countsLimitsData } = data;
        this.searchData = searchData;
        this.countsLimitsData = countsLimitsData;
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
        if (this.searchData.searchKey) {
            searchKey = this.searchData.searchKey;
        }
        else {
            basicSearchKeys.map(l => {
                searchKey += `${textUtils.getRandomKeyFromArray(l)} `;
            });
            searchKey = searchKey.trim();
        }
        if (searchKey.length > this.countsLimitsData.maximumSearchKeyCharactersCount || searchKey.length < this.countsLimitsData.minimumSearchKeyCharactersCount) {
            searchKey = '';
        }
        return searchKey;
    }

    /*     const SearchKeyGender = enumUtils.createEnum([
            ['MALE', 'male'],
            ['FEMALE', 'female'],
            ['BOTH', 'both']
        ]); */

    //		const { keyType, isMiddleReplace, isNoSpaceAfter, isMultiFemaleKey, globalKey, maleKey, femaleKey, bothKey } = data;

    generateAdvanceKey() {
        let searchKey = '';
        const randomGander = Object.values(SearchKeyGender)[textUtils.getRandomNumber(0, 2)];
        advanceSearchKeys.map(l => {
            const item = l.length > 0 ? textUtils.getRandomKeyFromArray(l) : l[0];
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
        if (displaySearchKey.length > this.countsLimitsData.maximumDisplaySearchKeyCharactersCount) {
            displaySearchKey = displaySearchKey.substring(0, this.countsLimitsData.maximumDisplaySearchKeyCharactersCount);
        }
        return displaySearchKey;
    }

    generateSearchKey() {
        // Generate the search key.
        let resultSearchKey = null;
        let currentRetries = 0;
        while (!resultSearchKey && currentRetries < this.countsLimitsData.maximumRetriesGenerateSearchKeyCount) {
            resultSearchKey = this.searchData.isAdvanceSearchKeys ? this.generateAdvanceKey() : this.generateBasicKey();
            currentRetries++;
        }
        if (!resultSearchKey) {
            throw new Error('No valid resultSearchKey was created (1000021)');
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
        const { startIndex, advanceBy } = searchEngine;
        let { templateAddress } = searchEngine;
        const newIndex = (pageIndex === 0 ? startIndex : pageIndex) + advanceBy;
        templateAddress = templateAddress.split(SearchPlaceHolder.QUERY).join(searchKey);
        templateAddress = templateAddress.split(SearchPlaceHolder.PAGER).join(newIndex);
        return templateAddress;
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
            searchEngineLinkTemplate = this.createSearchEngineLinkTemplate({ searchKey: searchKey, searchEngine: searchEngine, pageIndex: pageIndex });
            searchProcessData.pageIndex = pageIndex;
            searchProcessData.searchEngineLinkTemplate = searchEngineLinkTemplate;
        }
        else { // Generate the data for the process for the first time.
            const searchKeyResult = this.generateSearchKey();
            searchKey = searchKeyResult.searchKey;
            displaySearchKey = searchKeyResult.displaySearchKey;
            searchEngine = this.getSearchEngine();
            searchEngineLinkTemplate = this.createSearchEngineLinkTemplate({ searchKey: searchKey, searchEngine: searchEngine, pageIndex: pageIndex });
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

const searchService = new SearchService();
module.exports = searchService;