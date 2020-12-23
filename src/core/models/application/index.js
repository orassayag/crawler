const ApplicationData = require('./files/ApplicationData');
const BackupData = require('./files/BackupData');
const BackupDirectory = require('./files/BackupDirectory');
const CommonEmailAddressDomain = require('./files/CommonEmailAddressDomain');
const CommonEmailAddressDomainEnd = require('./files/CommonEmailAddressDomainEnd');
const CountLimitData = require('./files/CountLimitData');
const CrawlEmailAddressData = require('./files/CrawlEmailAddressData');
const CrawlLinkData = require('./files/CrawlLinkData');
const DomainCounter = require('./files/DomainCounter');
const EmailAddressData = require('./files/EmailAddressData');
const EmailAddressDomain = require('./files/EmailAddressDomain');
const EmailAddressDomainEnd = require('./files/EmailAddressDomainEnd');
const EmailAddressesResult = require('./files/EmailAddressesResult');
const EmailAddressStatus = require('./files/EmailAddressStatus');
const FilterLinkDomain = require('./files/FilterLinkDomain');
const InvalidEmailAddress = require('./files/InvalidEmailAddress');
const LinksResult = require('./files/LinksResult');
const LogData = require('./files/LogData');
const MongoDatabaseData = require('./files/MongoDatabaseData');
const PathData = require('./files/PathData');
const SearchData = require('./files/SearchData');
const SearchEngine = require('./files/SearchEngine');
const SearchEngineStatus = require('./files/SearchEngineStatus');
const SearchKey = require('./files/SearchKey');
const SearchProcessData = require('./files/SearchProcessData');
const TestData = require('./files/TestData');
const ValidationResult = require('./files/ValidationResult');
const ValidEmailAddress = require('./files/ValidEmailAddress');

module.exports = {
    ApplicationData, BackupData, BackupDirectory, CommonEmailAddressDomain, CommonEmailAddressDomainEnd, CountLimitData,
    CrawlEmailAddressData, CrawlLinkData, DomainCounter, EmailAddressData, EmailAddressDomain, EmailAddressDomainEnd,
    EmailAddressesResult, EmailAddressStatus, FilterLinkDomain, InvalidEmailAddress, LinksResult, LogData, MongoDatabaseData,
    PathData, SearchData, SearchEngine, SearchEngineStatus, SearchKey, SearchProcessData, TestData, ValidationResult,
    ValidEmailAddress
};