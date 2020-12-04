require('../services/files/initiate.service').initiate();
const { crawlEmailAddressService, emailAddressValidationService } = require('../services');
const { logUtils } = require('../utils');

(async () => {
	// Initiate the common email address domains list.
	crawlEmailAddressService.initiateCommonEmailAddressDomains();
	let emailAddresses = [];
	for (let i = 0; i < emailAddresses.length; i++) {
		const validationResult = await emailAddressValidationService.validateEmailAddress(emailAddresses[i]);
		logUtils.log(validationResult);
	}
})();