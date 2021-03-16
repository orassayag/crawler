const { invalidDomains, removeAtCharactersList, removeStartKeysList } = require('./files/emailAddressConfigurations.configuration');
const { commonDomainEndsList, commonEmailAddressDomainsList, domainEndsCommaList, domainEndsDotsList, domainEndsHyphenList,
    domainEndsList, emailAddressDomainEndsList, emailAddressEndFixTypos, endsWithDotIgnore, validDomainEndsList,
    validOneWordDomainEndsList } = require('./files/emailAddressDomainEndsList.configuration');
const emailAddressDomainsList = require('./files/emailAddressDomainsList.configuration');
const { invalidEmailAddresses, updatesEmailAddresses, validEmailAddresses } = require('./files/emailAddressesLists.configuration');
const { filterEmailAddresses, filterEmailAddressDomains, unfixEmailAddressDomains } = require('./files/filterEmailAddress.configuration');
const { filterEmailAddressFileExtensions, filterLinkFileExtensions } = require('./files/filterFileExtensions.configuration');
const { filterLinkDomains, globalFilterLinkDomains } = require('./files/filterLinkDomains.configuration');
const { timeoutLinks } = require('./files/linksTestCases.configuration');
const { searchEngines, activeSearchEngineNames, searchEngineStatuses } = require('./files/searchEngines.configuration');
const { advanceSearchKeys, basicSearchKeys } = require('./files/searchKeys.configuration');
const { shortEmailAddressDomainsList } = require('./files/shortEmailAddressDomainsList.configuration');

module.exports = {
    activeSearchEngineNames, advanceSearchKeys, basicSearchKeys, commonDomainEndsList, commonEmailAddressDomainsList, domainEndsCommaList,
    domainEndsDotsList, domainEndsHyphenList, domainEndsList, emailAddressDomainEndsList, emailAddressDomainsList, emailAddressEndFixTypos,
    endsWithDotIgnore, filterEmailAddressDomains, filterEmailAddressFileExtensions, filterEmailAddresses, filterLinkDomains,
    filterLinkFileExtensions, globalFilterLinkDomains, invalidDomains, invalidEmailAddresses, removeAtCharactersList, removeStartKeysList,
    searchEngineStatuses, searchEngines, shortEmailAddressDomainsList, timeoutLinks, unfixEmailAddressDomains, updatesEmailAddresses,
    validDomainEndsList, validEmailAddresses, validOneWordDomainEndsList
};