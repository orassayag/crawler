const ApplicationData = require('./files/ApplicationData');
const BackupData = require('./files/BackupData');
const BackupDirectory = require('./files/BackupDirectory');
const CommonEmailAddressDomain = require('./files/CommonEmailAddressDomain');
const CommonEmailAddressDomainEnd = require('./files/CommonEmailAddressDomainEnd');
const CountsLimitsData = require('./files/CountsLimitsData');
const CrawlEmailAddressesData = require('./files/CrawlEmailAddressesData');
const CrawlLinksData = require('./files/CrawlLinksData');
const DomainCounter = require('./files/DomainCounter');
const EmailAddressData = require('./files/EmailAddressData');
const EmailAddressDomain = require('./files/EmailAddressDomain');
const EmailAddressDomainEnd = require('./files/EmailAddressDomainEnd');
const EmailAddressesResult = require('./files/EmailAddressesResult');
const EmailAddressStatus = require('./files/EmailAddressStatus');
const FilterLinkDomain = require('./files/FilterLinkDomain');
const InvalidEmailAddress = require('./files/InvalidEmailAddress');
const LinksResult = require('./files/LinksResult');
const LogsData = require('./files/LogsData');
const MongoDatabaseData = require('./files/MongoDatabaseData');
const PathsData = require('./files/PathsData');
const SearchData = require('./files/SearchData');
const SearchEngine = require('./files/SearchEngine');
const SearchEngineStatus = require('./files/SearchEngineStatus');
const SearchKey = require('./files/SearchKey');
const SearchProcessData = require('./files/SearchProcessData');
const TestsData = require('./files/TestsData');
const ValidationResult = require('./files/ValidationResult');
const ValidEmailAddress = require('./files/ValidEmailAddress');

module.exports = {
    ApplicationData, BackupData, BackupDirectory, CommonEmailAddressDomain, CommonEmailAddressDomainEnd, CountsLimitsData,
    CrawlEmailAddressesData, CrawlLinksData, DomainCounter, EmailAddressData, EmailAddressDomain, EmailAddressDomainEnd,
    EmailAddressesResult, EmailAddressStatus, FilterLinkDomain, InvalidEmailAddress, LinksResult, LogsData, MongoDatabaseData,
    PathsData, SearchData, SearchEngine, SearchEngineStatus, SearchKey, SearchProcessData, TestsData, ValidationResult,
    ValidEmailAddress
};