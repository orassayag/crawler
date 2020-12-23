const confirmationService = require('./files/confirmation.service');
const crawlEmailAddressService = require('./files/crawlEmailAddress.service');
const crawlLinkService = require('./files/crawlLink.service');
const domainsCounterService = require('./files/domainsCounter.service');
const emailAddressesGeneratorService = require('./files/emailAddressesGenerator.service');
const emailAddressValidationService = require('./files/emailAddressValidation.service');
const logService = require('./files/log.service');
const mongoDatabaseService = require('./files/mongoDatabase.service');
const searchService = require('./files/search.service');
const sourceService = require('./files/source.service');
const typosGeneratorService = require('./files/typosGenerator.service');
const uuidGeneratorService = require('./files/uuidGenerator.service');

module.exports = {
    confirmationService, crawlEmailAddressService, crawlLinkService, domainsCounterService,
    emailAddressesGeneratorService, emailAddressValidationService, logService,
    mongoDatabaseService, searchService, sourceService, uuidGeneratorService, typosGeneratorService
};