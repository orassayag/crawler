/*
Credit to:
https://medium.com/hackernoon/how-to-reduce-incorrect-email-addresses-df3b70cb15a9
https://flaviocopes.com/how-to-validate-email-address-javascript/
Made some cosmetic changers to fit modern javascript.
*/

const validator = require('validator');
const micromatch = require('micromatch');
const settings = require('../../settings/settings');
const { removeAtCharectersList } = require('../../configurations/emailAddressConfigurations.configuration');
const { characterUtils, emailAddressUtils, regexUtils, textUtils } = require('../../utils');
const { domainEndsList, domainEndsDotsList, domainEndsHyphenList, domainEndsCommaList, emailAddressDomainEndsList, validOneWordDomainEndsList,
	emailAddressEndFixTypos, commonEmailAddressDomainsList } = require('../../configurations/emailAddressDomainEndsList.configuration');
const emailAddressDomainsList = require('../../configurations/emailAddressDomainsList.configuration');
const { filterEmailAddressFileExtensions } = require('../../configurations/filterFileExtensions.configuration');
const { unfixEmailAddressDomains } = require('../../configurations/filterEmailAddress.configuration');
const shortEmailAddressDomainsList = require('../../configurations/shortEmailAddressDomainsList.configuration');
const { invalidEmailAddresses } = require('../../configurations/emailAddressesLists.configuration');
const { EmailAddressData, ValidationResult } = require('../../core/models/application');
const { MicromatchAction } = require('../../core/enums/files/emailAddress.enum');

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
			validateByNPMValidator: -16
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
			tryRecover: 25
		};
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

			// If all good and the email address is valid - Resolve.
			resolve(validationResult);
		});
	}

	firstValidations(validationResult, resolve) {
		// Basic validation - Validate existence.
		validationResult = this.basicValidations(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// First advance validation it to validate that the domain part is not something like 'angular.js@1.3.9'.
		validationResult = this.validateVersionDomainPart(validationResult);
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
		// Try auto typo fix - Maybe multi typo.
		validationResult = this.renameEmailAddressAutoTypo(validationResult);
		// Try fix typo with 'micromatch' NPM package.
		validationResult = this.fixMicromatchTypos(validationResult);
		// Try final manually typo fix - Maybe multi typo.
		validationResult = this.finalRenameEmailAddressManuallyTypo(validationResult);
		// Clean rest of the domain end (like test@gmail.comword).
		validationResult = this.fixOverallCleanDomainEnd(validationResult);
		return validationResult;
	}

	secondValidations(validationResult, resolve) {
		// Validate common domain local part length.
		validationResult = this.validateMaximumCommonDomainLocalPartLength(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Validate that the domain part not equal only to '.com' and others.
		validationResult = this.validateDomainAsDomainEnd(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		// Validate length after try fixes.
		validationResult = this.lengthValidations(validationResult);
		if (!this.validateResults(validationResult, resolve)) { return false; }
		return true;
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
		const result = filterEmailAddressFileExtensions.filter(file => part.startsWith(file) || part.endsWith(file));
		return result.length === 0;
	}

	// Validate that the email address is not a file name.
	validateFileName(validationResult) {
		const { localPart, domainPart } = this.getEmailAddressData(validationResult);
		let invalidPart = null;
		if (!this.validatePartFileName(localPart)) {
			invalidPart = 'Local';
		}
		if (!this.validatePartFileName(domainPart)) {
			invalidPart = 'Domain';
		}
		if (invalidPart) {
			const isValid = domainEndsDotsList.filter(d => domainPart.indexOf(d) > -1).length > 0;
			if (!isValid) {
				validationResult.isValid = false;
				validationResult.functionIds.push(this.validationFunctionIdsMap[`validateFileName${invalidPart}Part`]);
			}
		}
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

	fixCommonInvalidPartCharacters(part) {
		const originalPart = part;
		for (let i = 0, length = characterUtils.commonInvalidCharacters.length; i < length; i++) {
			const character = characterUtils.commonInvalidCharacters[i];
			part = textUtils.removeFirstCharacterLoop({ text: part, character: character });
			part = textUtils.removeLastCharacterLoop({ text: part, character: character });
			if (part !== originalPart) {
				return this.fixCommonInvalidPartCharacters(part);
			}
		}
		return part;
	}

	// Remove from the local & domain parts invalid characters from the start and the end.
	fixCommonInvalidCharacters(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		localPart = this.fixCommonInvalidPartCharacters(localPart);
		domainPart = this.fixCommonInvalidPartCharacters(domainPart);
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
		const number = isLongEnd ? domainSplits.length - 2 : 1;
		const compareSplitLong = isLongEnd ? `.${domainSplits[domainSplits.length - 1]}` : null;
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

	// Replace by domain end clear extra unneeded charecters - Manually.
	fixCleanDomainEnd(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		const isLongEnd = domainSplits.length > 2;
		const number = isLongEnd ? domainSplits.length : 1;
		if (domainSplits.length <= 1) {
			return validationResult;
		}
		let domainEnd = textUtils.sliceJoinDots(domainSplits, number);
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
			let index = -1;
			const compareItem = compareMode ? compareMode : fullDomainEnd;
			index = originalDomainPart.indexOf(compareItem);
			if (index > -1) {
				/* 				console.log(index);
								console.log(compareItem);
								console.log(domainPart.length);
								console.log('---'); */
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

	/* 	// Replace by domain end - Overall manually.
		fixOverallCleanDomainEnd(validationResult) {
			let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
			const originalDomainPart = domainPart;
			let domainSplits = textUtils.getSplitDotParts(domainPart);
			const originalDomainSplit = domainSplits;
			if (domainSplits.length <= 1) {
				return validationResult;
			}
			const isLongEnd = domainSplits.length > 2;
			const number = isLongEnd ? domainSplits.length - 1 : 1;
			let longDomainIndex = -1;
			const domainEnd = textUtils.sliceJoinDots(domainSplits, number);
			const splitOneDomainEnd = isLongEnd ? textUtils.sliceJoinDots(domainSplits, 1) : null;
			let matchKey = null;
			let matchIndex = -1;
			for (let i = 0, length = validDomainEndsList.length; i < length; i++) {
				const keys = validDomainEndsList[i];
				let pointer = 0;
				let index = -1;
				while (pointer < keys.length) {
					const key = keys[pointer];
					index = domainEnd.indexOf(key);
					if (index > -1) {
						matchIndex = index;
						matchKey = key;
						if (isLongEnd) {
							longDomainIndex = domainSplits.findIndex(s => s.includes(key));
						}
					}
					if (isLongEnd) {
						index = splitOneDomainEnd.indexOf(key);
						if (index > -1) {
							matchIndex = index;
							matchKey = key;
						}
					}
					pointer++;
				}
				if (matchIndex === 0) {
					break;
				}
			}
			if (matchKey && matchIndex + matchKey.length + 1 <= domainEnd.length) {
				domainPart = textUtils.addMiddleDot(longDomainIndex > -1 ? domainSplits.slice(0, longDomainIndex).join('.') : domainSplits[0], matchKey);
			}
			else if (splitOneDomainEnd && matchKey && matchIndex + matchKey.length + 1 <= splitOneDomainEnd.length) {
				domainPart = textUtils.addMiddleDot(domainSplits[0], matchKey);
			}
			// Validate the fix.
			domainSplits = textUtils.getSplitDotParts(domainPart);
			if (originalDomainSplit.length > domainSplits.length) {
				if (domainEndsDotsList.includes(`.${originalDomainSplit[originalDomainSplit.length - 1]}`)) {
					// Cancel the fix.
					domainPart = originalDomainPart;
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
		} */

	/* 	// Replace by domain end - Overall manually.
		fixOverallCleanDomainEnd(validationResult) {
			let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
			const originalDomainPart = domainPart;
			let domainSplits = textUtils.getSplitDotParts(domainPart);
			const originalDomainSplit = domainSplits;
			if (domainSplits.length <= 1) {
				return validationResult;
			}
			const isLongEnd = domainSplits.length > 2;
			const number = isLongEnd ? domainSplits.length - 1 : 1;
			let longDomainIndex = -1;
			const domainEnd = textUtils.sliceJoinDots(domainSplits, number);
			const splitOneDomainEnd = isLongEnd ? textUtils.sliceJoinDots(domainSplits, 1) : null;
			let matchKey = null;
			let matchIndex = -1;
			for (let i = 0, length = validDomainEndsList.length; i < length; i++) {
				const keys = validDomainEndsList[i];
				let pointer = 0;
				let index = -1;
				while (pointer < keys.length) {
					const key = keys[pointer];
					index = domainEnd.indexOf(key);
					if (index > -1) {
						matchIndex = index;
						matchKey = key;
						if (isLongEnd) {
							longDomainIndex = domainSplits.findIndex(s => s.includes(key));
						}
					}
					if (isLongEnd) {
						index = splitOneDomainEnd.indexOf(key);
						if (index > -1) {
							matchIndex = index;
							matchKey = key;
						}
					}
					pointer++;
				}
				if (matchIndex === 0) {
					break;
				}
			}
			if (matchKey && matchIndex + matchKey.length + 1 <= domainEnd.length) {
				domainPart = textUtils.addMiddleDot(longDomainIndex > -1 ? domainSplits.slice(0, longDomainIndex).join('.') : domainSplits[0], matchKey);
			}
			else if (splitOneDomainEnd && matchKey && matchIndex + matchKey.length + 1 <= splitOneDomainEnd.length) {
				domainPart = textUtils.addMiddleDot(domainSplits[0], matchKey);
			}
			// Validate the fix.
			domainSplits = textUtils.getSplitDotParts(domainPart);
			if (originalDomainSplit.length > domainSplits.length) {
				if (domainEndsDotsList.includes(`.${originalDomainSplit[originalDomainSplit.length - 1]}`)) {
					// Cancel the fix.
					domainPart = originalDomainPart;
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
		} */

	fixEmailAddressTypo(validationResult) {
		validationResult = this.fixRemoveWhiteSpaces(validationResult);
		validationResult = this.fixMultiAtCharacters(validationResult);
		validationResult = this.fixDomainLowercase(validationResult);
		validationResult = this.fixDots(validationResult);
		validationResult = this.fixEdgeCases(validationResult);
		validationResult = this.fixCommonInvalidCharacters(validationResult);
		validationResult = this.fixCommonDomain(validationResult);
		validationResult = this.fixLocalPartStartWithCommonDomain(validationResult);
		validationResult = this.fixEqualDomainEnd(validationResult);
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
			const domain = textUtils.getSplitDotParts(commonEmailAddressDomainsList[i].domain)[0];
			const result = this.checkForCloseMatch(domainPart, domain);
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
			if (result.length > 0) {
				fixDomainPart = domain;
				isMatch = true;
				break;
			}
		}
		return { isMatch: isMatch, fixDomainPart: fixDomainPart };
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

	fixLocalPartStartWithCommonDomain(validationResult) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { domain } = commonEmailAddressDomainsList[i];
			while (localPart.indexOf(domain) === 0 && localPart.length > domain.length) {
				localPart = localPart.replace(domain, '');
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
		let { domainPart } = this.getEmailAddressData(validationResult);
		for (let i = 0, length = domainEndsList.length; i < length; i++) {
			if (domainPart === domainEndsList[i]) {
				validationResult.isValid = false;
				validationResult.functionIds.push(this.validationFunctionIdsMap['validateDomainAsDomainEnd']);
				return validationResult;
			}
		}
		return validationResult;
	}

	validateExistence(fixed) {
		if (!fixed) {
			return false;
		}
		return true;
	}

	validateAtCharacterExistence(fixed) {
		if (fixed.indexOf('@') === -1) {
			return false;
		}
		return true;
	}

	validateDotCharacterExistence(fixed) {
		if (fixed.indexOf('.') === -1) {
			return false;
		}
		return true;
	}

	validateMinimumTotalLength(fixed) {
		if (fixed.length < this.emailAddressData.minimumEmailAddressCharactersCount) {
			return false;
		}
		return true;
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
		let { localPart, domainPart } = this.getEmailAddressData(validationResult);
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
		let { domainPart } = this.getEmailAddressData(validationResult);
		domainPart = domainPart.replace(regexUtils.cleanAllAlphaRegex, '');
		const isScriptVersion = regexUtils.findVersionRegex.test(domainPart);
		if (isScriptVersion) {
			validationResult.isValid = false;
			validationResult.functionIds.push(this.validationFunctionIdsMap['validateVersionDomainPart']);
		}
		return validationResult;
	}
}

const emailAddressValidationService = new EmailAddressValidationService();
module.exports = emailAddressValidationService;