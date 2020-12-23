require('../services/files/initiate.service').initiate('test');
const { crawlEmailAddressService, emailAddressValidationService } = require('../services');
const { logUtils } = require('../utils');

(async () => {
	// Initiate the common email address domains list.
	crawlEmailAddressService.initiateCommonEmailAddressDomains();
	const validationResult = await emailAddressValidationService.validateEmailAddress('');
	logUtils.log(validationResult);
})();