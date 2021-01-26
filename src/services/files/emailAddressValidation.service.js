/*
Credit to:
https://medium.com/hackernoon/how-to-reduce-incorrect-email-addresses-df3b70cb15a9
https://flaviocopes.com/how-to-validate-email-address-javascript/
Made some cosmetic changers to fit modern javascript.
*/
const micromatch = require('micromatch');
const validator = require('validator');
const settings = require('../../settings/settings');
const { EmailAddressData, ValidationResult } = require('../../core/models/application');
const { MicromatchAction, PartType } = require('../../core/enums');
const { removeAtCharectersList, removeStartKeysList, invalidDomains } = require('../../configurations/emailAddressConfigurations.configuration');
const { commonDomainEndsList, commonEmailAddressDomainsList, domainEndsCommaList, domainEndsDotsList, domainEndsHyphenList,
	domainEndsList, emailAddressDomainEndsList, emailAddressEndFixTypos, endsWithDotIgnore, validOneWordDomainEndsList } = require('../../configurations/emailAddressDomainEndsList.configuration');
const emailAddressDomainsList = require('../../configurations/emailAddressDomainsList.configuration');
const { invalidEmailAddresses } = require('../../configurations/emailAddressesLists.configuration');
const { unfixEmailAddressDomains } = require('../../configurations/filterEmailAddress.configuration');
const { filterEmailAddressFileExtensions } = require('../../configurations/filterFileExtensions.configuration');
const shortEmailAddressDomainsList = require('../../configurations/shortEmailAddressDomainsList.configuration');
const emailGibberishValidationService = require('./emailGibberishValidation.service');
const { characterUtils, emailAddressUtils, regexUtils, textUtils, validationUtils } = require('../../utils');

class EmailAddressValidationService {

	constructor() {
		this.validationFunctionIdsMap = {
			validateExistence: -1,
			validateAtCharacterExistence: -2,
			validateDotCharacterExistence: -3,
			validateVersionDomainPart: -4,
			validateFileNameLocalPart: -5,
			validateFileNameDomainPart: -6,
			validateMaximumCommonDomainLocalPartLength: -7,
			validateDomainAsDomainEnd: -8,
			validateMinimumTotalLength: -9,
			validateMinimumLocalPartLength: -10,
			validateMinimumDomainPartLength: -11,
			validateMaximumTotalLength: -12,
			validateMaximumLocalPartLength: -13,
			validateMaximumDomainPartLength: -14,
			validateByRegex: -15,
			validateByNPMValidator: -16,
			validateContainDomainPart: -17,
			validateRepeatCharacters: -18
		};
		this.fixFunctionIdsMap = {
			fixRemoveWhiteSpaces: 1,
			fixMultiAtCharacters: 2,
			fixDomainLowercase: 3,
			fixDots: 4,
			removeCharectersAfterAtSign: 5,
			replaceUnderscoreWithHyphen: 6,
			replaceDotHyphen: 7,
			replaceHyphenDot: 8,
			replaceLeadingCharacterDomainEndHyphan: 9,
			replaceLeadingCharacterDomainEndComma: 10,
			fixCommonInvalidCharacters: 11,
			fixCommonDomain: 12,
			fixLocalPartStartWithCommonDomain: 13,
			fixEqualDomainEnd: 14,
			fixCleanDomainEnd: 15,
			fixCleanDomainInvalidCharacters: 16,
			fixCleanLocalInvalidCharacters: 17,
			renameEmailAddressAutoTypo: 18,
			fixMicromatchTyposNormal: 19,
			fixMicromatchTyposFirst: 20,
			fixMicromatchTyposLast: 21,
			fixMicromatchTyposSpecial: 22,
			finalRenameEmailAddressManuallyTypo: 23,
			fixOverallCleanDomainEnd: 24,
			tryRecover: 25,
			fixLocalPartStartWithKey: 26,
			fixEndsNotWithALetter: 27,
			fixEqualCommonDomainEnd: 28,
			fixFlipDomain: 29,
			fixAtFirstCharacter: 30,
			fixDefaultDomainEnd: 31,
			fixTypoFileName: 32
		};
		this.defaultDonainEnd = 'com';
		this.ignoreFunctionIds = [1, 3, 11];
		this.logFunctionIds = [...Object.values(this.validationFunctionIdsMap), ...Object.values(this.fixFunctionIdsMap)].filter(id => this.ignoreFunctionIds.indexOf(id) == -1);
		this.emailAddressEndFixTyposKeys = Object.keys(emailAddressEndFixTypos);
		this.singleTypoCommonDomains = emailAddressDomainsList.filter(d => d.typosList.length === 1).map(d => d.typosList[0]);
		// ===EMAIL ADDRESS DATA=== //
		this.emailAddressData = new EmailAddressData(settings);
	}

	validateEmailAddress(emailAddress) {
		return new Promise(resolve => {
			let validationResult = new ValidationResult(emailAddress);
			// First Step - First validations.
			if (!this.firstValidations(validationResult, resolve)) { return; }
			// Second Step - Try to fix the email address.
			validationResult = this.tryToFix(validationResult);
			// Third Step - More validation, after try to fix the email address (second validations).
			if (!this.secondValidations(validationResult, resolve)) { return; }
			// Fourth Step - The final validations.
			if (!this.finalValidations(validationResult, resolve)) { return; }
			// Validate that the email address is not gibberish.
			validationResult = this.validateGibberish(validationResult);
			// If all good and the email address is valid - Resolve.
			resolve(validationResult);
		}).catch();
	}

	firstValidations(validationResult, resolve) {
		// Basic validation - Validate existence.
		validationResult = this.basicValidations(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// First advance validation it to validate that the domain part is not something like 'angular.js@1.3.9'.
		validationResult = this.validateVersionDomainPart(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Validate contain invalid domains.
		validationResult = this.validateContainDomainPart(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Second advance validation is to check if the email address is a file name,
		// like 'image0002.gif@gmail.com' or 'dave@image.jpg'.
		validationResult = this.validateFileName(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		return true;
	}

	tryToFix(validationResult) {
		// Try to detect typo with the email address and fix it.
		// Try manually fix - For future cases (manually remove one or more invalid characters).
		validationResult = this.fixEmailAddressTypo(validationResult);
		// Fix email address if not ends with a letter (like test@test.com038722).
		validationResult = this.fixEndsNotWithALetter(validationResult);
		// Try auto typo fix - Maybe multi typo.
		validationResult = this.renameEmailAddressAutoTypo(validationResult);
		// Try fix typo with 'micromatch' NPM package.
		validationResult = this.fixMicromatchTypos(validationResult);
		// Try final manually typo fix - Maybe multi typo.
		validationResult = this.finalRenameEmailAddressManuallyTypo(validationResult);
		// Clean rest of the domain end (like test@gmail.comword).
		validationResult = this.fixOverallCleanDomainEnd(validationResult);
		// Try fix cases of @ as first characters (like @test.some-domain.co.il).
		validationResult = this.fixAtFirstCharacter(validationResult);
		// Try add last dot if not exists any dot in the domain part (like test@test-is).
		validationResult = this.fixDefaultDomainEnd(validationResult);
		return validationResult;
	}

	secondValidations(validationResult, resolve) {
		// Validate common domain local part length.
		validationResult = this.validateMaximumCommonDomainLocalPartLength(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Validate that the domain part not equal only to '.com' and others.
		validationResult = this.validateDomainAsDomainEnd(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Validate cases like xxxxxxx@zzzzzz.com.
		validationResult = this.validateRepeatCharacters(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Validate length after try fixes.
		validationResult = this.lengthValidations(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		return true;
	}

	validateContainDomainPart(validationResult) {
		const { domainPart } = this.getEmailAddressData(validationResult);
		for (let i = 0; i < invalidDomains.length; i++) {
			if (domainPart.indexOf(invalidDomains[i]) > -1) {
				validationResult.isValid = false;
				validationResult.functionIds.push(this.validationFunctionIdsMap['validateContainDomainPart']);
				return validationResult;
			}
		}
		return validationResult;
	}

	finalValidations(validationResult, resolve) {
		// Validate by a regex.
		validationResult = this.validateByRegex(validationResult);
		if (!validationResult.isValid) {
			// Try to recover.
			resolve(this.tryRecover(validationResult));
			return false;
		}
		// Validate by 'validator' NPM package.
		validationResult = this.validateByNPMValidator(validationResult);
		if (!validationResult.isValid) {
			// Try to recover.
			resolve(this.tryRecover(validationResult));
			return false;
		}
		return true;
	}

	validateResults(validationResult, resolve) {
		if (!validationResult.isValid) {
			resolve(validationResult);
			return false;
		}
		return true;
	}

	// Basic validation - Validate basic existence.
	// The mark of isValid here is true and will cancel all the rest of the validations.
	basicValidations(validationResult) {
		const { fixed } = this.getEmailAddressData(validationResult);
		// Check the existence.
		if (!this.validateExistence(fixed)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateExistence']);
			return validationResult;
		}
		// Check for '@' existence.
		if (!this.validateAtCharacterExistence(fixed)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateAtCharacterExistence']);
			return validationResult;
		}
		// Check for '.' existence.
		if (!this.validateDotCharacterExistence(fixed)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateDotCharacterExistence']);
			return validationResult;
		}
		return validationResult;
	}

	// Length validation - Valid lengths in all parts of the email address.
	// The mark of isValid here is true and will cancel all the rest of the validations.
	lengthValidations(validationResult) {
		const { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		// Total minimum length of 5 characters.
		if (!this.validateMinimumTotalLength(fixed)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMinimumTotalLength']);
			return validationResult;
		}
		// The 'local part' (before the '@') total minimum of 1 characters.
		if (!this.validateMinimumLocalPartLength(localPart)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMinimumLocalPartLength']);
			return validationResult;
		}
		// The 'domain part' (after the '@') total maximum of 5 characters.
		if (!this.validateMinimumDomainPartLength(domainPart)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMinimumDomainPartLength']);
			return validationResult;
		}
		// Total maximum length of 320 characters.
		if (!this.validateMaximumTotalLength(fixed)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMaximumTotalLength']);
			return validationResult;
		}
		// The 'local part' (before the '@') total maximum of 64 characters.
		if (!this.validateMaximumLocalPartLength(localPart)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMaximumLocalPartLength']);
			return validationResult;
		}
		// The 'domain part' (after the '@') total maximum of 255 characters.
		if (!this.validateMaximumDomainPartLength(domainPart)) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMaximumDomainPartLength']);
			return validationResult;
		}
		return validationResult;
	}

	validatePartFileName(part) {
		part = textUtils.toLowerCase(part);
		const result = filterEmailAddressFileExtensions.filter(file => part.startsWith(file) || part.endsWith(file));
		return result.length === 0;
	}

	// Validate that the email address is not a file name.
	validateFileName(validationResult) {
		const { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		let invalidPart = null;
		let isValid = true;
		if (!this.validatePartFileName(localPart)) {
			invalidPart = PartType.LOCAL;
		}
		if (!this.validatePartFileName(domainPart)) {
			invalidPart = PartType.DOMAIN;
		}
		if (invalidPart) {
			isValid = false;
			const domainEndsDots = domainEndsDotsList.filter(d => domainPart.indexOf(d) > -1);
			if (validationUtils.isExists(domainEndsDots)) {
				isValid = invalidPart === PartType.DOMAIN;
				validationResult = this.fixTypoFileName({
					fixed: fixed,
					localPart: localPart,
					domainPart: domainPart,
					domainEnd: domainEndsDots[domainEndsDots.length - 1],
					invalidPart: invalidPart,
					validationResult: validationResult
				});
			}
		}
		if (!isValid) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap[`validateFileName${textUtils.upperCaseFirstLetter(invalidPart, 0)}Part`]);
		}
		return validationResult;
	}

	fixTypoFileName(data) {
		let { fixed, localPart, domainPart, domainEnd, validationResult } = data;
		domainPart = domainPart.slice(0, domainPart.indexOf(domainEnd) + domainEnd.length);
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixTypoFileName'
		});
		return validationResult;
	}

	// Remove any whitespace if exists.
	fixRemoveWhiteSpaces(validationResult) {
		const { original } = validationResult;
		const emailAddress = textUtils.removeEmptySpaces(original);
		validationResult = this.shortCheckEmailAddressUpdate({
			validationResult: validationResult,
			fixed: original,
			emailAddress: emailAddress,
			functionName: 'fixRemoveWhiteSpaces'
		});
		return validationResult;
	}

	fixMultiAtCharacters(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		const emailAddressParts = emailAddressUtils.getEmailAddressParts(fixed);
		const firstLocalPart = emailAddressParts[0];
		emailAddressParts.shift();
		localPart = firstLocalPart;
		domainPart = emailAddressParts.join('').replace(regexUtils.cleanAtRegex, '');
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixMultiAtCharacters'
		});
		return validationResult;
	}

	// Clean all special characters from the domain part.
	fixCleanDomainInvalidCharacters(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		domainPart = domainPart.replace(regexUtils.cleanDomainPartRegex, '');
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCleanDomainInvalidCharacters'
		});
		return validationResult;
	}

	// Lowercase the domain part.
	fixDomainLowercase(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		domainPart = textUtils.toLowerCase(domainPart);
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixDomainLowercase'
		});
		return validationResult;
	}

	// Remove any repeated dots in both local and domain parts.
	fixDots(validationResult) {
		const fixed = this.getFixedOrOriginal(validationResult);
		let emailAddress = fixed;
		emailAddress = emailAddress.replace(regexUtils.cleanMultiDots, '');
		validationResult = this.shortCheckEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			emailAddress: emailAddress,
			functionName: 'fixDots'
		});
		return validationResult;
	}

	fixCommonInvalidPartCharacters(part, checkIgnore) {
		const originalPart = part;
		if (checkIgnore && endsWithDotIgnore.find(e => part.endsWith(e))) {
			return originalPart;
		}
		for (let i = 0, length = characterUtils.commonInvalidCharacters.length; i < length; i++) {
			const character = characterUtils.commonInvalidCharacters[i];
			part = textUtils.removeFirstCharacterLoop({
				text: part,
				character: character
			});
			part = textUtils.removeLastCharacterLoop({
				text: part,
				character: character
			});
			if (part !== originalPart) {
				return this.fixCommonInvalidPartCharacters(part);
			}
		}
		return part;
	}

	fixEndsNotWithALetter(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		const character = domainPart.substr(domainPart.length - 1);
		if (!textUtils.isCharacterALetter(character)) {
			domainPart = textUtils.removeLastCharacterNotALetterLoop(domainPart);
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixEndsNotWithALetter'
		});
		return validationResult;
	}

	// Remove from the local & domain parts invalid characters from the start and the end.
	fixCommonInvalidCharacters(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		localPart = this.fixCommonInvalidPartCharacters(localPart, false);
		domainPart = this.fixCommonInvalidPartCharacters(domainPart, true);
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCommonInvalidCharacters'
		});
		return validationResult;
	}

	fixEdgeCases(validationResult) {
		validationResult = this.removeCharectersAfterAtSign(validationResult);
		validationResult = this.replaceUnderscoreWithHyphen(validationResult);
		validationResult = this.replaceDotHyphen(validationResult);
		validationResult = this.replaceHyphenDot(validationResult);
		validationResult = this.replaceLeadingCharacterDomainEnd(validationResult, '-');
		validationResult = this.replaceLeadingCharacterDomainEnd(validationResult, ',');
		return validationResult;
	}

	removeCharectersAfterAtSign(validationResult) {
		const fixed = this.getFixedOrOriginal(validationResult);
		let emailAddress = fixed;
		for (let i = 0, length = removeAtCharectersList.length; i < length; i++) {
			const key = removeAtCharectersList[i];
			if (emailAddress.indexOf(key) > -1) {
				emailAddress = emailAddress.replace(key, '@');
			}
		}
		validationResult = this.shortCheckEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			emailAddress: emailAddress,
			functionName: 'removeCharectersAfterAtSign'
		});
		return validationResult;
	}

	replaceUnderscoreWithHyphen(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		domainPart = textUtils.replaceCharacter(domainPart, '_', '-');
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'replaceUnderscoreWithHyphen'
		});
		return validationResult;
	}

	replaceDotHyphen(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		// Check if this fix relevant.
		if (domainPart.indexOf('.-') === -1) {
			return validationResult;
		}
		const splitHyphen = domainPart.split('-');
		domainPart = domainPart.replace('.-', splitHyphen[splitHyphen.length - 1].indexOf('.') === -1 ? '.' : '-');
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'replaceDotHyphen'
		});
		return validationResult;
	}

	replaceHyphenDot(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		// Check if this fix relevant.
		if (domainPart.indexOf('-.') === -1) {
			return validationResult;
		}
		const splitHyphen = domainPart.split('-');
		const charecterReplace = domainEndsDotsList.includes(splitHyphen[splitHyphen.length - 1]) ? '.' : '-';
		domainPart = domainPart.replace('-.', charecterReplace);
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'replaceHyphenDot'
		});
		return validationResult;
	}

	replaceLeadingCharacterDomainEnd(validationResult, character) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		// Check if this fix relevant.
		if (domainPart.indexOf(character) === -1) {
			return validationResult;
		}
		let list, type = null;
		switch (character) {
			case '-': list = domainEndsHyphenList; type = 'Hyphen'; break;
			case ',': list = domainEndsCommaList; type = 'Comma'; break;
		}
		const splitHyphen = domainPart.split(character);
		const domainEnd = splitHyphen[splitHyphen.length - 1];
		if (!domainEnd.startsWith('.') && list.includes(`${character}${domainEnd}`)) {
			domainPart = textUtils.replaceLast(domainPart, character, '.');
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: `replaceLeadingCharacterDomainEnd${type}`
		});
		return validationResult;
	}

	// Clean invalid characters from the local part.
	fixCleanLocalInvalidCharacters(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		localPart = localPart.replace(regexUtils.cleanLocalPartRegex, '');
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCleanLocalInvalidCharacters'
		});
		return validationResult;
	}

	// Replace by domain end common typos - Manually.
	fixEqualDomainEnd(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		// Check if not already found in the singles typo domains, where will be fixed later.
		if (this.singleTypoCommonDomains.includes(domainPart)) {
			return validationResult;
		}
		const originalDomainPart = domainPart;
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		const isLongEnd = domainSplits.length > 2;
		let number = null;
		let compareSplitLong = null;
		let longDomainEnd = null;
		if (isLongEnd) {
			number = domainSplits.length - 2;
			compareSplitLong = `.${domainSplits[domainSplits.length - 1]}`;
			longDomainEnd = textUtils.addStartDot(textUtils.sliceJoinDots(domainSplits, 1));
		}
		else {
			number = 1;
		}
		let isEqualToDomainEnd = false;
		// Check if domain end exists.
		if (domainSplits.length < 1) {
			return validationResult;
		}
		let domainEnd = textUtils.addStartDot(textUtils.sliceJoinDots(domainSplits, number));
		// In case that the domain is equal to one character, such as '.', it will destroy the domain.
		if (domainEnd.length === 1) {
			return validationResult;
		}
		for (let i = 0, length = this.emailAddressEndFixTyposKeys.length; i < length; i++) {
			const key = this.emailAddressEndFixTyposKeys[i];
			if (domainEnd === key) {
				domainEnd = emailAddressEndFixTypos[key];
				if (isLongEnd) {
					domainSplits.splice(-2, 2);
					domainPart = `${domainSplits.join('.')}${domainEnd}`;
				}
				break;
			}
			if (isLongEnd && longDomainEnd === key) {
				domainPart = `${domainSplits[0]}${emailAddressEndFixTypos[key]}`;
				break;
			}
			if (isLongEnd && compareSplitLong === key) {
				domainSplits.splice(domainSplits.length - 1, 1);
				domainPart = `${domainSplits.join('.')}${emailAddressEndFixTypos[key]}`;
				break;
			}
			if (domainPart === key) {
				domainPart = emailAddressEndFixTypos[key];
				isEqualToDomainEnd = true;
				break;
			}
		}
		if (!isLongEnd && !isEqualToDomainEnd) {
			domainPart = `${domainSplits[0]}${domainEnd}`;
			if (originalDomainPart !== domainPart) {
				if (unfixEmailAddressDomains.includes(domainSplits[0])) {
					domainPart = originalDomainPart;
				}
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixEqualDomainEnd'
		});
		return validationResult;
	}

	// Fix emails like test@test.comhttps, test@test.co.il.html
	fixEqualCommonDomainEnd(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		// Check if domain end exists.
		if (domainSplits.length < 1) {
			return validationResult;
		}
		const lastDomainEndPart = textUtils.addStartDot(textUtils.sliceJoinDots(domainSplits, 1));
		for (let i = 0; i < commonDomainEndsList.length; i++) {
			const { commonDomainEnd, isAllowDotAfter, excludeWords } = commonDomainEndsList[i];
			const index = lastDomainEndPart.indexOf(commonDomainEnd);
			if (index === 0 && lastDomainEndPart.length > commonDomainEnd.length) {
				const isExcluded = validationUtils.isExists(excludeWords) &&
					excludeWords.findIndex(w => domainSplits[domainSplits.length - 1] === w) > -1;
				if (isExcluded) {
					break;
				}
				if (!isAllowDotAfter) {
					domainPart = `${domainSplits[0]}${commonDomainEnd}`;
					break;
				}
				else if (lastDomainEndPart[commonDomainEnd.length] !== '.') {
					domainPart = `${domainSplits[0]}${commonDomainEnd}`;
					break;
				}
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixEqualCommonDomainEnd'
		});
		return validationResult;
	}

	// Replace by domain end clear extra unneeded charecters - Manually.
	fixCleanDomainEnd(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		const isLongEnd = domainSplits.length > 2;
		const number = isLongEnd ? domainSplits.length : 1;
		if (domainSplits.length <= 1) {
			return validationResult;
		}
		const domainEnd = textUtils.sliceJoinDots(domainSplits, number);
		for (let i = 0, length = validOneWordDomainEndsList.length; i < length; i++) {
			const key = validOneWordDomainEndsList[i];
			const index = domainEnd.indexOf(key);
			if (index > -1 && domainEnd.length > key.length) {
				const fixedDomainEnd = key.slice(domainEnd.indexOf(key), key.length);
				domainSplits.pop();
				domainPart = textUtils.addMiddleDot(domainSplits.join('.'), fixedDomainEnd);
			}
		}
		if (!isLongEnd) {
			domainPart = textUtils.addMiddleDot(domainSplits[0], domainEnd);
		}
		if (domainSplits.length <= 1) {
			return validationResult;
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCleanDomainEnd'
		});
		return validationResult;
	}

	// Replace by domain end - Overall manually.
	fixOverallCleanDomainEnd(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		const originalDomainPart = domainPart;
		for (let i = 0, length = emailAddressDomainEndsList.length; i < length; i++) {
			const { fullDomainEnd, charsAfterDot, compareMode } = emailAddressDomainEndsList[i];
			const compareItem = compareMode ? compareMode : fullDomainEnd;
			const index = originalDomainPart.indexOf(compareItem);
			if (index > -1) {
				domainPart = domainPart.substring(0, index + compareItem.length + charsAfterDot);
				break;
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixOverallCleanDomainEnd'
		});
		return validationResult;
	}

	// Fix @ as first character (like @test.some-domain.co.il).
	fixAtFirstCharacter(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		if (localPart.length) {
			return validationResult;
		}
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		if (domainSplits.length < 2) {
			return validationResult;
		}
		localPart = domainSplits[0];
		domainSplits.splice(0, 1);
		domainPart = domainSplits.join('.');
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixAtFirstCharacter'
		});
		return validationResult;
	}

	// Try add last dot if not exists any dot in the domain part (like test@test-is).
	fixDefaultDomainEnd(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		if (domainPart.indexOf('.') === -1) {
			domainPart = textUtils.addMiddleDot(domainPart, this.defaultDonainEnd);
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixDefaultDomainEnd'
		});
		return validationResult;
	}

	fixEmailAddressTypo(validationResult) {
		validationResult = this.fixRemoveWhiteSpaces(validationResult);
		// Fix cases like: test@test.007@gmail.com => test@gmail.com.
		validationResult = this.fixMultiAtCharacters(validationResult);
		validationResult = this.fixDomainLowercase(validationResult);
		validationResult = this.fixDots(validationResult);
		validationResult = this.fixEdgeCases(validationResult);
		validationResult = this.fixCommonInvalidCharacters(validationResult);
		validationResult = this.fixCommonDomain(validationResult);
		validationResult = this.fixFlipDomain(validationResult);
		validationResult = this.fixLocalPartStartWithCommonDomain(validationResult);
		validationResult = this.fixLocalPartStartWithKey(validationResult);
		validationResult = this.fixEqualDomainEnd(validationResult);
		validationResult = this.fixEqualCommonDomainEnd(validationResult);
		validationResult = this.fixCleanDomainEnd(validationResult);
		validationResult = this.fixCleanDomainInvalidCharacters(validationResult);
		validationResult = this.fixCleanLocalInvalidCharacters(validationResult);
		return validationResult;
	}

	renameEmailAddressAutoTypo(validationResult) {
		const fixed = this.getFixedOrOriginal(validationResult);
		const emailAddress = this.checkForTypo(fixed);
		validationResult = this.shortCheckEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			emailAddress: emailAddress,
			functionName: 'renameEmailAddressAutoTypo'
		});
		return validationResult;
	}

	// Replace it in all places in the application.
	checkForCloseMatch(longString, shortString) {
		// Too many false positives with very short strings.
		if (shortString.length < this.emailAddressData.minimumShortStringCharactersCount) {
			return '';
		}
		// Test if the shortString is in the string (so everything is fine).
		if (longString.includes(shortString)) {
			return '';
		}
		// Split the shortString string into two at each position e.g. g|mail gm|ail gma|il gmai|l
		// and test that each half exists with one gap.
		for (let i = 1; i < shortString.length; i++) {
			const firstPart = shortString.substring(0, i);
			const secondPart = shortString.substring(i);
			// Test for wrong letter.
			const wrongLetterRegEx = regexUtils.createRegex(`${firstPart}.${secondPart.substring(1)}`);
			if (wrongLetterRegEx.test(longString)) {
				return longString.replace(wrongLetterRegEx, shortString);
			}
			// Test for extra letter.
			const extraLetterRegEx = regexUtils.createRegex(`${firstPart}.${secondPart}`);
			if (extraLetterRegEx.test(longString)) {
				return longString.replace(extraLetterRegEx, shortString);
			}
			// Test for missing letter.
			if (secondPart !== 'mail') {
				const missingLetterRegEx = regexUtils.createRegex(`${firstPart}{0}${secondPart}`);
				if (missingLetterRegEx.test(longString)) {
					return longString.replace(missingLetterRegEx, shortString);
				}
			}
			// Test for switched letters.
			const switchedLetters = [shortString.substring(0, i - 1), shortString.charAt(i), shortString.charAt(i - 1), shortString.substring(i + 1)].join('');
			if (longString.includes(switchedLetters)) {
				return longString.replace(switchedLetters, shortString);
			}
		}
		// If nothing was close, then there wasn't a typo.
		return '';
	}

	checkForDomainTypo(emailAddress) {
		const [localPart, domainPart] = emailAddressUtils.getEmailAddressParts(emailAddress);
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { firstDotSplit } = commonEmailAddressDomainsList[i];
			const result = this.checkForCloseMatch(domainPart, firstDotSplit);
			if (result) {
				return emailAddressUtils.getEmailAddressFromParts(localPart, domainPart);
			}
		}
		return '';
	}

	checkForCommonTypos(emailAddress) {
		const typo = regexUtils.commonTypos.find(t => t.pattern.test(emailAddress));
		return typo ? typo.fix(emailAddress) : '';
	}

	checkForTypo(emailAddress) {
		return this.checkForCommonTypos(emailAddress) || this.checkForDomainTypo(emailAddress);
	}

	fixMicromatchTypos(validationResult) {
		// Try original Micromatch.
		validationResult = this.fixMicromatch(validationResult, MicromatchAction.NORMAL, 'fixMicromatchTyposNormal');
		// Check if Micromatch already took place.
		if (validationResult.functionIds.includes(this.fixFunctionIdsMap['fixMicromatchTyposNormal'])) {
			return validationResult;
		}
		// Try to remove first character and then Micromatch.
		validationResult = this.fixMicromatch(validationResult, MicromatchAction.FIRST, 'fixMicromatchTyposFirst');
		// Check if Micromatch already took place.
		if (validationResult.functionIds.includes(this.fixFunctionIdsMap['fixMicromatchTyposFirst'])) {
			return validationResult;
		}
		// Try to remove last character and then Micromatch.
		validationResult = this.fixMicromatch(validationResult, MicromatchAction.LAST, 'fixMicromatchTyposLast');
		// Check if Micromatch already took place.
		if (validationResult.functionIds.includes(this.fixFunctionIdsMap['fixMicromatchTyposLast'])) {
			return validationResult;
		}
		// Try to special characters and then Micromatch.
		validationResult = this.fixMicromatch(validationResult, MicromatchAction.SPECIAL, 'fixMicromatchTyposSpecial');
		return validationResult;
	}

	fixMicromatch(validationResult, type, functionName) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		let testDomainPart = '';
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { ignoreList } = commonEmailAddressDomainsList[i];
			if (validationUtils.isExists(ignoreList) && ignoreList.findIndex(d => d === domainPart) > -1) {
				return validationResult;
			}
		}
		switch (type) {
			case MicromatchAction.NORMAL: testDomainPart = domainPart; break;
			case MicromatchAction.FIRST: testDomainPart = textUtils.removeFirstCharacter(domainPart); break;
			case MicromatchAction.LAST: testDomainPart = textUtils.removeLastCharacter(domainPart); break;
			case MicromatchAction.SPECIAL: testDomainPart = domainPart.replace(regexUtils.cleanAllNoneAlphaNumericRegex, ''); break;
		}
		const { isMatch, fixDomainPart } = this.findMicromatch([testDomainPart]);
		if (isMatch) {
			domainPart = fixDomainPart;
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: functionName
		});
		return validationResult;
	}

	findMicromatch(domainPart) {
		let isMatch = false;
		let fixDomainPart = '';
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { domain, micromatchName } = commonEmailAddressDomainsList[i];
			const result = micromatch(domainPart, [micromatchName]);
			if (validationUtils.isExists(result)) {
				fixDomainPart = domain;
				isMatch = true;
				break;
			}
		}
		return {
			isMatch: isMatch,
			fixDomainPart: fixDomainPart
		};
	}

	fixCommonDomain(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { domain, domainName } = commonEmailAddressDomainsList[i];
			if (domainPart !== domain && (domainPart.includes(domain) || domainPart.includes(`.${domainName}`))) {
				domainPart = domain;
				break;
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCommonDomain'
		});
		return validationResult;
	}

	fixFlipDomain(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { flipDomain } = commonEmailAddressDomainsList[i];
			if (localPart === flipDomain) {
				const updatedLocalPart = textUtils.flipDotParts(localPart);
				const updatedDomainPart = textUtils.flipDotParts(domainPart);
				localPart = updatedDomainPart;
				domainPart = updatedLocalPart;
				break;
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixFlipDomain'
		});
		return validationResult;
	}

	fixLocalPartStartWithCommonDomain(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { domain } = commonEmailAddressDomainsList[i];
			for (let y = 0; y < 20; y++) {
				if (localPart.indexOf(domain) === 0 && localPart.length > domain.length) {
					localPart = localPart.replace(domain, '');
				}
				else {
					break;
				}
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixLocalPartStartWithCommonDomain'
		});
		return validationResult;
	}

	fixLocalPartStartWithKey(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = removeStartKeysList.length; i < length; i++) {
			const key = removeStartKeysList[i];
			if (localPart.indexOf(key) === 0) {
				localPart = localPart.replace(key, '');
				break;
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixLocalPartStartWithKey'
		});
		return validationResult;
	}

	finalRenameEmailAddressManuallyTypo(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		let isRename = false;
		for (let i = 0, lengthX = emailAddressDomainsList.length; i < lengthX; i++) {
			const { domain, typosList } = emailAddressDomainsList[i];
			for (let y = 0, lengthY = typosList.length; y < lengthY; y++) {
				if (domainPart === typosList[y]) {
					isRename = true;
					domainPart = domain;
					break;
				}
			}
			if (isRename) {
				break;
			}
		}
		validationResult = this.checkEmailAddressUpdate({
			validationResult: validationResult,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'finalRenameEmailAddressManuallyTypo'
		});
		return validationResult;
	}

	getFixedOrOriginal(validationResult) {
		const { original, fix } = validationResult;
		return fix ? fix : original;
	}

	getEmailAddressData(validationResult) {
		const fixed = this.getFixedOrOriginal(validationResult);
		const [localPart, domainPart] = emailAddressUtils.getEmailAddressParts(fixed);
		return { localPart: localPart, domainPart: domainPart, fixed: fixed };
	}

	checkEmailAddressUpdate(data) {
		const { validationResult, fixed, localPart, domainPart, functionName } = data;
		const emailAddress = emailAddressUtils.getEmailAddressFromParts(localPart, domainPart);
		if (emailAddress !== fixed) {
			validationResult.fix = emailAddress;
			validationResult.functionIds.push(this.fixFunctionIdsMap[functionName]);
		}
		return validationResult;
	}

	shortCheckEmailAddressUpdate(data) {
		const { validationResult, fixed, emailAddress, functionName } = data;
		if (emailAddress && emailAddress !== fixed) {
			validationResult.fix = emailAddress;
			validationResult.functionIds.push(this.fixFunctionIdsMap[functionName]);
		}
		return validationResult;
	}

	validateDomainAsDomainEnd(validationResult) {
		const { domainPart } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = domainEndsList.length; i < length; i++) {
			if (domainPart === domainEndsList[i]) {
				validationResult.isValid = false;
				validationResult.functionIds.push(this.validationFunctionIdsMap['validateDomainAsDomainEnd']);
				return validationResult;
			}
		}
		return validationResult;
	}

	validatePartRepeat(partSplits) {
		let isRepeat = null;
		for (let i = 0; i < partSplits.length; i++) {
			const isCharactersEqual = textUtils.isCharactersEqual(partSplits[i]);
			if (isRepeat === null && isCharactersEqual) {
				isRepeat = isCharactersEqual;
			}
			else if (!isCharactersEqual) {
				isRepeat = isCharactersEqual;
			}
		}
		return isRepeat;
	}

	// Validate cases like yyyyyyyy@gggg.ggg.ggg | 222@333.com | s@s.com.
	validateRepeatCharacters(validationResult) {
		const { localPart, domainPart } = this.getEmailAddressData(validationResult);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		// Check if domain end exists.
		if (domainSplits.length < 1) {
			return validationResult;
		}
		domainSplits.splice(-1, 1);
		const localSplits = textUtils.getSplitDotParts(localPart);
		const isLocalRepeat = this.validatePartRepeat(localSplits);
		const isDomainRepeat = this.validatePartRepeat(domainSplits);
		if (isLocalRepeat && isDomainRepeat) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateRepeatCharacters']);
			return validationResult;
		}
		return validationResult;
	}

	validateExistence(fixed) {
		return fixed !== null && fixed !== undefined;
	}

	validateAtCharacterExistence(fixed) {
		return fixed.indexOf('@') !== -1;
	}

	validateDotCharacterExistence(fixed) {
		return fixed.indexOf('.') !== -1;
	}

	validateMinimumTotalLength(fixed) {
		return fixed.length > this.emailAddressData.minimumEmailAddressCharactersCount;
	}

	validateMinimumLocalPartLength(localPart) {
		if (localPart.length < this.emailAddressData.minimumLocalPartCharactersCount) {
			return false;
		}
		return true;
	}

	validateMinimumDomainPartLength(domainPart) {
		if (domainPart.length < this.emailAddressData.minimumDomainPartCharactersCount) {
			if (!shortEmailAddressDomainsList.includes(domainPart)) {
				return false;
			}
		}
		return true;
	}

	validateMaximumTotalLength(fixed) {
		if (fixed.length > this.emailAddressData.maximumEmailAddressCharactersCount) {
			return false;
		}
		return true;
	}

	validateMaximumLocalPartLength(localPart) {
		if (localPart.length > this.emailAddressData.maximumLocalPartCharactersCount) {
			return false;
		}
		return true;
	}

	validateMaximumDomainPartLength(domainPart) {
		if (domainPart.length > this.emailAddressData.maximumDomainPartCharactersCount) {
			return false;
		}
		return true;
	}

	validateMaximumCommonDomainLocalPartLength(validationResult) {
		const { localPart, domainPart } = this.getEmailAddressData(validationResult);
		const isCommonDomain = commonEmailAddressDomainsList.findIndex(domain => domain.domain === domainPart) > -1;
		if (!isCommonDomain) {
			return validationResult;
		}
		if (localPart.length <= this.emailAddressData.maximumCommonDomainLocalPartCharactersCount) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateMaximumCommonDomainLocalPartLength']);
		}
		return validationResult;
	}

	// Remove all the not allowed characters from any part of the email address.
	// The mark of isRegexValid here is false and will cancel all the rest of the validations.
	validateByRegex(validationResult) {
		const fixed = this.getFixedOrOriginal(validationResult);
		const isRegexValid = regexUtils.validateEmailAddressRegex.test(textUtils.toLowerCase(fixed));
		if (!isRegexValid) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateByRegex']);
		}
		return validationResult;
	}

	validateByNPMValidator(validationResult) {
		const fixed = this.getFixedOrOriginal(validationResult);
		try {
			validationResult.isValid = validator.isEmail(fixed);
		} catch (error) {
			validationResult.isValid = false;
		}
		if (!validationResult.isValid) {
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateByNPMValidator']);
		}
		return validationResult;
	}

	tryRecover(validationResult) {
		const { original } = validationResult;
		let recoverFixEmailAddress = null;
		for (let i = 0, length = invalidEmailAddresses.length; i < length; i++) {
			const invalidEmailAddress = invalidEmailAddresses[i];
			if (original === invalidEmailAddress.emailAddress && invalidEmailAddress.recoverFix) {
				recoverFixEmailAddress = invalidEmailAddress.recoverFix;
				break;
			}
		}
		if (recoverFixEmailAddress && recoverFixEmailAddress !== original) {
			validationResult.isValid = true;
			validationResult.fix = recoverFixEmailAddress;
			validationResult.functionIds.push(this.fixFunctionIdsMap['tryRecover']);
		}
		return validationResult;
	}

	validateVersionDomainPart(validationResult) {
		const { domainPart } = this.getEmailAddressData(validationResult);
		const isPackageName = regexUtils.createRegex(regexUtils.findPackageNameRegex).test(domainPart);
		if (isPackageName) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateVersionDomainPart']);
		}
		return validationResult;
	}

	// Detect gibberish email addresses like a60a26eba1e642519b43545f6be1d2b0@domain.com.
	validateGibberish(validationResult) {
		if (!this.emailAddressData.isGibberishValidationActive) {
			return validationResult;
		}
		const { localPart, domainPart } = this.getEmailAddressData(validationResult);
		if (validationResult.isValid && localPart.length >= this.emailAddressData.minimumGibberishCharactersCount) {
			const isCommonDomain = commonEmailAddressDomainsList.findIndex(domain => domain.domain === domainPart) > -1;
			if (!isCommonDomain) {
				validationResult.isGibberish = emailGibberishValidationService.isGibberish(localPart);
			}
		}
		return validationResult;
	}

	// Not related to the validation process.
	skipDomains(data) {
		const { emailAddressesList, maximumUniqueDomainCount } = data;
		if (!maximumUniqueDomainCount || emailAddressesList.length <= maximumUniqueDomainCount) {
			return {
				skipCount: 0,
				emailAddressesList: emailAddressesList
			};
		}
		let skipCount = 0;
		const emailAddressesGroupsList = [];
		const updatedEmailAddressesList = [];
		for (let i = 0; i < emailAddressesList.length; i++) {
			const emailAddress = emailAddressesList[i];
			const splitResult = emailAddressUtils.getEmailAddressParts(emailAddress);
			if (!splitResult || splitResult.length < 2) {
				continue;
			}
			const domainPart = textUtils.toLowerCaseTrim(splitResult[1]);
			if (!domainPart) {
				continue;
			}
			// Check if the domain is common domain. Not relevant is true.
			const isCommonDomain = commonEmailAddressDomainsList.findIndex(domain => domain.domain === domainPart) > -1;
			if (isCommonDomain) {
				updatedEmailAddressesList.push(emailAddress);
				continue;
			}
			const groupIndex = emailAddressesGroupsList.findIndex(d => d.domainPart === domainPart);
			// Insert / update the list.
			if (groupIndex > -1) {
				emailAddressesGroupsList[groupIndex].emailAddressesList.push(emailAddress);
			}
			else {
				emailAddressesGroupsList.push({
					domainPart: domainPart,
					emailAddressesList: [emailAddress]
				});
			}
		}
		for (let i = 0; i < emailAddressesGroupsList.length; i++) {
			const group = emailAddressesGroupsList[i];
			let emailAddressesGroup = group.emailAddressesList;
			if (emailAddressesGroup.length >= maximumUniqueDomainCount) {
				skipCount += emailAddressesGroup.length - maximumUniqueDomainCount;
				emailAddressesGroup = textUtils.getRandomUniqueKeysFromArray(group.emailAddressesList, maximumUniqueDomainCount);
			}
			updatedEmailAddressesList.push(...emailAddressesGroup);
		}
		return {
			skipCount: skipCount,
			emailAddressesList: updatedEmailAddressesList
		};
	}
}

module.exports = new EmailAddressValidationService();