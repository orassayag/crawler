require('../services/files/initiate.service').initiate();
const { crawlEmailAddressService, emailAddressValidationService } = require('../services');
const { logUtils } = require('../utils');

(async () => {
	// Initiate the common email address domains list.
	crawlEmailAddressService.initiateCommonEmailAddressDomains();
	const validationResult = await emailAddressValidationService.validateEmailAddress('---@newsletters.haaretz.co.il');
	logUtils.log(validationResult);
})();
//Validate cases like yyyyyyyy@gggg.ggg.ggg | 222@333.com | s@s.com
//imagesloaded@4.1, flickity@2.0, webflow-util@1.0
//'font-awesome@5.11.2', 'react-dom@16.13.1', 'bootstrap@4.5.2', 'moment-duration-format@2.3.2'