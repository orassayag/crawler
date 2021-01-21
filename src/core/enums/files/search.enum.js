const enumUtils = require('../enum.utils');

const SearchEngineType = enumUtils.createEnum([
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

const SearchKeyGender = enumUtils.createEnum([
    ['MALE', 'male'],
    ['FEMALE', 'female'],
    ['BOTH', 'both']
]);

const SearchKeyType = enumUtils.createEnum([
    ['NEED', 'need'],
    ['PERSON', 'preson'],
    ['PROFESSION', 'PROFESSION'],
    ['RELATION', 'PERSON'],
    ['CITY', 'both'],
    ['EMAIL_ADDRESS', 'EMAIL_ADDRESS']
]);

const SearchPlaceHolder = enumUtils.createEnum([
    ['QUERY', '#QUERY#'],
    ['PAGER', '#PAGER#']
]);

const SourceType = enumUtils.createEnum([
    ['ENGINE', 'engine'],
    ['PAGE', 'page']
]);

module.exports = { SearchEngineType, SearchKeyGender, SearchKeyType, SearchPlaceHolder, SourceType };