const ApplicationDataModel = require('./files/ApplicationData.model');
const BackupDataModel = require('./files/BackupData.model');
const BackupDirectoryModel = require('./files/BackupDirectory.model');
const CommonEmailAddressDomainModel = require('./files/CommonEmailAddressDomain.model');
const CommonEmailAddressDomainEndModel = require('./files/CommonEmailAddressDomainEnd.model');
const CountLimitDataModel = require('./files/CountLimitData.model');
const CrawlEmailAddressDataModel = require('./files/CrawlEmailAddressData.model');
const CrawlLinkDataModel = require('./files/CrawlLinkData.model');
const DomainCounterModel = require('./files/DomainCounter.model');
const EmailAddressDataModel = require('./files/EmailAddressData.model');
const EmailAddressDomainModel = require('./files/EmailAddressDomain.model');
const EmailAddressDomainEndModel = require('./files/EmailAddressDomainEnd.model');
const EmailAddressesResultModel = require('./files/EmailAddressesResult.model');
const EmailAddressStatusModel = require('./files/EmailAddressStatus.model');
const FilterLinkDomainModel = require('./files/FilterLinkDomain.model');
const InvalidEmailAddressModel = require('./files/InvalidEmailAddress.model');
const LinksResultModel = require('./files/LinksResult.model');
const LogDataModel = require('./files/LogData.model');
const MongoDatabaseDataModel = require('./files/MongoDatabaseData.model');
const PathDataModel = require('./files/PathData.model');
const SearchDataModel = require('./files/SearchData.model');
const SearchEngineModel = require('./files/SearchEngine.model');
const SearchEngineStatusModel = require('./files/SearchEngineStatus.model');
const SearchKeyModel = require('./files/SearchKey.model');
const SearchProcessDataModel = require('./files/SearchProcessData.model');
const TestDataModel = require('./files/TestData.model');
const ValidationResultModel = require('./files/ValidationResult.model');
const ValidEmailAddressModel = require('./files/ValidEmailAddress.model');

module.exports = {
    ApplicationDataModel, BackupDataModel, BackupDirectoryModel, CommonEmailAddressDomainModel,
    CommonEmailAddressDomainEndModel, CountLimitDataModel, CrawlEmailAddressDataModel,
    CrawlLinkDataModel, DomainCounterModel, EmailAddressDataModel, EmailAddressDomainModel,
    EmailAddressDomainEndModel, EmailAddressesResultModel, EmailAddressStatusModel,
    FilterLinkDomainModel, InvalidEmailAddressModel, LinksResultModel, LogDataModel,
    MongoDatabaseDataModel, PathDataModel, SearchDataModel, SearchEngineModel,
    SearchEngineStatusModel, SearchKeyModel, SearchProcessDataModel, TestDataModel,
    ValidationResultModel, ValidEmailAddressModel
};