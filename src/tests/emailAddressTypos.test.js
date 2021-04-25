require('../services/files/initiate.service').initiate('test');
const { StatusIconEnum } = require('../core/enums');
const { crawlEmailAddressService, emailAddressesGeneratorService, emailAddressValidationService, logService } = require('../services');
const { emailAddressUtils, logUtils } = require('../utils');

// If NULL or empty - Will be filled randomly.
const localPart = '';
let domainPart = '';
// ======================== //

const logValidationTestResult = (validationResultModel) => {
    const { isValid } = validationResultModel;
    const icon = `${isValid ? StatusIconEnum.V : StatusIconEnum.X} `;
    logUtils.log(logService.createFixResultTemplate(validationResultModel, icon));
};

const setValidationTestResult = (validationResultModel, score) => {
    const { original, fix } = validationResultModel;
    let { isValid } = validationResultModel;
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