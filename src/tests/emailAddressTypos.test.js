require('../services/files/initiate.service').initiate();
const { crawlEmailAddressService, logService, emailAddressesGeneratorService, emailAddressValidationService } = require('../services');
const { logUtils, emailAddressUtils } = require('../utils');
const { StatusIcon } = require('../core/enums/files/text.enum');

// If NULL or empty - Will be filled randomly.
const localPart = '';
let domainPart = '';
// ========================

const logValidationTestResult = (validationResult) => {
    const { isValid } = validationResult;
    const icon = `${isValid ? StatusIcon.V : StatusIcon.X} `;
    logUtils.log(logService.createFixResultTemplate(validationResult, icon));
};

const setValidationTestResult = (validationResult, score) => {
    const { original, fix } = validationResult;
    let { isValid } = validationResult;
    const fixed = fix ? fix : original;
    const fixedDomainPart = emailAddressUtils.getEmailAddressParts(fixed)[1];
    const isMatch = fixedDomainPart === domainPart;
    if (fix) {
        isValid = isValid && isMatch;
    }
    if (isValid) {
        score++;
    }
    return {
        score: score,
        isValid: isValid
    };
};

// Sort the results.
const sortResults = (validationResults) => {
    validationResults.sort((x, y) => {
        return (x.isValid === y.isValid) ? 0 : x.isValid ? -1 : 1;
    });
    return validationResults;
};

(async () => {
    // Email Address Fix Typo //
    // ====================== //
    let score = 0;

    // Initiate the common email address domains lists.
    crawlEmailAddressService.initiateCommonEmailAddressDomains();
    // Get random typos and test them.
    const emailAddressesResults = await emailAddressesGeneratorService.getTypos({
        localPart: localPart,
        domainPart: domainPart
    });
    let validationResults = [];
    domainPart = emailAddressesResults.domainPart;
    for (let i = 0, length = emailAddressesResults.emailAddresses.length; i < length; i++) {
        validationResults.push(await emailAddressValidationService.validateEmailAddress(emailAddressesResults.emailAddresses[i]));
    }
    for (let i = 0, length = validationResults.length; i < length; i++) {
        const result = setValidationTestResult(validationResults[i], score);
        score = result.score;
        validationResults[i].isValid = result.isValid;
    }
    validationResults = sortResults(validationResults);
    for (let i = 0, length = validationResults.length; i < length; i++) {
        logValidationTestResult(validationResults[i]);
    }
    logService.logScore(emailAddressesResults.emailAddresses, score, domainPart);
})();