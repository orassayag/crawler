const enumUtils = require('../enum.utils');

const SearchEngineTypeEnum = enumUtils.createEnum([
    ['ASK', 'ask'],
    ['BAIDU', 'baidu'],
    ['BING', 'bing'],
    ['DOGPILE', 'dogpile'],
    ['ECOSIA', 'ecosia'],
    ['EXALEAD', 'exalead'],
    ['GOOGLE', 'google'],
    ['INFO', 'info'],
    ['INFOSPACE', 'infospace'],
    ['METACRAWLER', 'metacrawler'],
    ['NAVER', 'naver'],
    ['STARTPAGE', 'startpage'],
    ['YANDEX', 'yandex']
]);

const SearchKeyGenderEnum = enumUtils.createEnum([
    ['MALE', 'male'],
    ['FEMALE', 'female'],
    ['BOTH', 'both']
]);

const SearchKeyTypeEnum = enumUtils.createEnum([
    ['NEED', 'need'],
    ['PERSON', 'preson'],
    ['PROFESSION', 'PROFESSION'],
    ['RELATION', 'PERSON'],
    ['CITY', 'both'],
    ['EMAIL_ADDRESS', 'EMAIL_ADDRESS']
]);

const SearchPlaceHolderEnum = enumUtils.createEnum([
    ['QUERY', '#QUERY#'],
    ['PAGER', '#PAGER#']
]);

const SourceTypeEnum = enumUtils.createEnum([
    ['ENGINE', 'engine'],
    ['PAGE', 'page']
]);

module.exports = { SearchEngineTypeEnum, SearchKeyGenderEnum, SearchKeyTypeEnum, SearchPlaceHolderEnum, SourceTypeEnum };