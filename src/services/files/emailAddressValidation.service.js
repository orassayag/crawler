/*
Credit to:
https://medium.com/hackernoon/how-to-reduce-incorrect-email-addresses-df3b70cb15a9
https://flaviocopes.com/how-to-validate-email-address-javascript/
Made some cosmetic changers to fit modern javascript.
*/
const micromatch = require('micromatch');
const validator = require('validator');
const settings = require('../../settings/settings');
const { EmailAddressDataModel, ValidationResultModel } = require('../../core/models/application');
const { MicromatchActionEnum, PartTypeEnum } = require('../../core/enums');
const { commonDomainEndsList, commonEmailAddressDomainsList, domainEndsCommaList, domainEndsDotsList, domainEndsHyphenList,
	domainEndsList, emailAddressDomainEndsList, emailAddressDomainsList, emailAddressEndFixTypos, endsWithDotIgnore,
	filterEmailAddressFileExtensions, invalidDomains, invalidEmailAddresses, removeAtCharactersList, removeStartKeysList,
	shortEmailAddressDomainsList, unfixEmailAddressDomains, validOneWordDomainEndsList } = require('../../configurations');
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
			removeCharactersAfterAtSign: 5,
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
		// ===EMAIL ADDRESS=== //
		this.emailAddressDataModel = new EmailAddressDataModel(settings);
	}

	validateEmailAddress(emailAddress) {
		return new Promise(resolve => {
			let validationResultModel = new ValidationResultModel(emailAddress);
			// First Step - First validations.
			if (!this.firstValidations(validationResultModel, resolve)) { return; }
			// Second Step - Try to fix the email address.
			validationResultModel = this.tryToFix(validationResultModel);
			// Third Step - More validation, after trying to fix the email address (second validations).
			if (!this.secondValidations(validationResultModel, resolve)) { return; }
			// Fourth Step - The final validations.
			if (!this.finalValidations(validationResultModel, resolve)) { return; }
			// Validate that the email address is not gibberish.
			validationResultModel = this.validateGibberish(validationResultModel);
			// If all good and the email address is valid - Resolve.
			resolve(validationResultModel);
		}).catch();
	}

	firstValidations(validationResultModel, resolve) {
		// Basic validation - Validate existence.
		validationResultModel = this.basicValidations(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		// First advance validation to validate that the domain part is not something like 'angular.js@1.3.9'.
		validationResultModel = this.validateVersionDomainPart(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		// Validate contains invalid domains.
		validationResultModel = this.validateContainDomainPart(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		// Second advance validation is to check if the email address is a file name,
		// like 'image0002.gif@gmail.com' or 'dave@image.jpg'.
		validationResultModel = this.validateFileName(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		return true;
	}

	tryToFix(validationResultModel) {
		// Try to detect typo with the email address and fix it.
		// Try manually fix - For future cases (manually remove one or more invalid characters).
		validationResultModel = this.fixEmailAddressTypo(validationResultModel);
		// Fix email address if not ends with a letter (like test@test.com038722).
		validationResultModel = this.fixEndsNotWithALetter(validationResultModel);
		// Try auto typo fix - Maybe multi typo.
		validationResultModel = this.renameEmailAddressAutoTypo(validationResultModel);
		// Try fix typo with 'micromatch' NPM package.
		validationResultModel = this.fixMicromatchTypos(validationResultModel);
		// Try final manually typo fix - Maybe multi typo.
		validationResultModel = this.finalRenameEmailAddressManuallyTypo(validationResultModel);
		// Clean rest of the domain end (like test@gmail.comword).
		validationResultModel = this.fixOverallCleanDomainEnd(validationResultModel);
		// Try fix cases of @ as first characters (like @test.some-domain.co.il).
		validationResultModel = this.fixAtFirstCharacter(validationResultModel);
		// Try add last dot if not exists any dot in the domain part (like test@test-is).
		validationResultModel = this.fixDefaultDomainEnd(validationResultModel);
		return validationResultModel;
	}

	secondValidations(validationResultModel, resolve) {
		// Validate common domain local part length.
		validationResultModel = this.validateMaximumCommonDomainLocalPartLength(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		// Validate that the domain part is not equal only to '.com' and others.
		validationResultModel = this.validateDomainAsDomainEnd(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		// Validate cases like xxxxxxx@zzzzzz.com.
		validationResultModel = this.validateRepeatCharacters(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		// Validate length after try fixes.
		validationResultModel = this.lengthValidations(validationResultModel);
		if (!this.validateResults(validationResultModel, resolve)) { return false; }
		return true;
	}

	validateContainDomainPart(validationResultModel) {
		const { domainPart } = this.getEmailAddressData(validationResultModel);
		for (let i = 0; i < invalidDomains.length; i++) {
			if (domainPart.indexOf(invalidDomains[i]) > -1) {
				validationResultModel.isValid = false;
				validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateContainDomainPart']);
				return validationResultModel;
			}
		}
		return validationResultModel;
	}

	finalValidations(validationResultModel, resolve) {
		// Validate by a regex.
		validationResultModel = this.validateByRegex(validationResultModel);
		if (!validationResultModel.isValid) {
			// Try to recover.
			resolve(this.tryRecover(validationResultModel));
			return false;
		}
		// Validate by 'validator' NPM package.
		validationResultModel = this.validateByNPMValidator(validationResultModel);
		if (!validationResultModel.isValid) {
			// Try to recover.
			resolve(this.tryRecover(validationResultModel));
			return false;
		}
		return true;
	}

	validateResults(validationResultModel, resolve) {
		if (!validationResultModel.isValid) {
			resolve(validationResultModel);
			return false;
		}
		return true;
	}

	// Basic validation - Validate basic existence.
	// The mark of isValid here is true and will cancel all the rest of the validations.
	basicValidations(validationResultModel) {
		const { fixed } = this.getEmailAddressData(validationResultModel);
		// Check the existence.
		if (!this.validateExistence(fixed)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateExistence']);
			return validationResultModel;
		}
		// Check for '@' existence.
		if (!this.validateAtCharacterExistence(fixed)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateAtCharacterExistence']);
			return validationResultModel;
		}
		// Check for '.' existence.
		if (!this.validateDotCharacterExistence(fixed)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateDotCharacterExistence']);
			return validationResultModel;
		}
		return validationResultModel;
	}

	// Length validation - Valid lengths in all parts of the email address.
	// The mark of isValid here is true and will cancel all the rest of the validations.
	lengthValidations(validationResultModel) {
		const { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		// Total minimum length of 5 characters.
		if (!this.validateMinimumTotalLength(fixed)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMinimumTotalLength']);
			return validationResultModel;
		}
		// The 'local part' (before the '@') total minimum of 1 characters.
		if (!this.validateMinimumLocalPartLength(localPart)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMinimumLocalPartLength']);
			return validationResultModel;
		}
		// The 'domain part' (after the '@') total maximum of 5 characters.
		if (!this.validateMinimumDomainPartLength(domainPart)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMinimumDomainPartLength']);
			return validationResultModel;
		}
		// Total maximum length of 320 characters.
		if (!this.validateMaximumTotalLength(fixed)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMaximumTotalLength']);
			return validationResultModel;
		}
		// The 'local part' (before the '@') total maximum of 64 characters.
		if (!this.validateMaximumLocalPartLength(localPart)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMaximumLocalPartLength']);
			return validationResultModel;
		}
		// The 'domain part' (after the '@') total maximum of 255 characters.
		if (!this.validateMaximumDomainPartLength(domainPart)) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMaximumDomainPartLength']);
			return validationResultModel;
		}
		return validationResultModel;
	}

	validatePartFileName(part) {
		part = textUtils.toLowerCase(part);
		const result = filterEmailAddressFileExtensions.filter(file => part.startsWith(file) || part.endsWith(file));
		return result.length === 0;
	}

	// Validate that the email address is not a file name.
	validateFileName(validationResultModel) {
		const { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		let invalidPart = null;
		let isValid = true;
		if (!this.validatePartFileName(localPart)) {
			invalidPart = PartTypeEnum.LOCAL;
		}
		if (!this.validatePartFileName(domainPart)) {
			invalidPart = PartTypeEnum.DOMAIN;
		}
		if (invalidPart) {
			isValid = false;
			const domainEndsDots = domainEndsDotsList.filter(d => domainPart.indexOf(d) > -1);
			if (validationUtils.isExists(domainEndsDots)) {
				isValid = invalidPart === PartTypeEnum.DOMAIN;
				validationResultModel = this.fixTypoFileName({
					fixed: fixed,
					localPart: localPart,
					domainPart: domainPart,
					domainEnd: domainEndsDots[domainEndsDots.length - 1],
					invalidPart: invalidPart,
					validationResultModel: validationResultModel
				});
			}
		}
		if (!isValid) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap[`validateFileName${textUtils.upperCaseFirstLetter(invalidPart, 0)}Part`]);
		}
		return validationResultModel;
	}

	fixTypoFileName(data) {
		let { fixed, localPart, domainPart, domainEnd, validationResultModel: validationResultModel } = data;
		domainPart = domainPart.slice(0, domainPart.indexOf(domainEnd) + domainEnd.length);
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixTypoFileName'
		});
		return validationResultModel;
	}

	// Remove any whitespace if it exists.
	fixRemoveWhiteSpaces(validationResultModel) {
		const { original } = validationResultModel;
		const emailAddress = textUtils.removeEmptySpaces(original);
		validationResultModel = this.shortCheckEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: original,
			emailAddress: emailAddress,
			functionName: 'fixRemoveWhiteSpaces'
		});
		return validationResultModel;
	}

	fixMultiAtCharacters(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		const emailAddressParts = emailAddressUtils.getEmailAddressParts(fixed);
		const firstLocalPart = emailAddressParts[0];
		emailAddressParts.shift();
		localPart = firstLocalPart;
		domainPart = emailAddressParts.join('').replace(regexUtils.cleanAtRegex, '');
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixMultiAtCharacters'
		});
		return validationResultModel;
	}

	// Clean all special characters from the domain part.
	fixCleanDomainInvalidCharacters(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		domainPart = domainPart.replace(regexUtils.cleanDomainPartRegex, '');
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCleanDomainInvalidCharacters'
		});
		return validationResultModel;
	}

	// Lowercase the domain part.
	fixDomainLowercase(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		domainPart = textUtils.toLowerCase(domainPart);
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixDomainLowercase'
		});
		return validationResultModel;
	}

	// Remove any repeated dots in both local and domain parts.
	fixDots(validationResultModel) {
		const fixed = this.getFixedOrOriginal(validationResultModel);
		let emailAddress = fixed;
		emailAddress = emailAddress.replace(regexUtils.cleanMultiDots, '');
		validationResultModel = this.shortCheckEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			emailAddress: emailAddress,
			functionName: 'fixDots'
		});
		return validationResultModel;
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

	fixEndsNotWithALetter(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		const character = domainPart.substr(domainPart.length - 1);
		if (!textUtils.isCharacterALetter(character)) {
			domainPart = textUtils.removeLastCharacterNotALetterLoop(domainPart);
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixEndsNotWithALetter'
		});
		return validationResultModel;
	}

	// Remove from the local & domain parts invalid characters from the start and the end.
	fixCommonInvalidCharacters(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		localPart = this.fixCommonInvalidPartCharacters(localPart, false);
		domainPart = this.fixCommonInvalidPartCharacters(domainPart, true);
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCommonInvalidCharacters'
		});
		return validationResultModel;
	}

	fixEdgeCases(validationResultModel) {
		validationResultModel = this.removeCharactersAfterAtSign(validationResultModel);
		validationResultModel = this.replaceUnderscoreWithHyphen(validationResultModel);
		validationResultModel = this.replaceDotHyphen(validationResultModel);
		validationResultModel = this.replaceHyphenDot(validationResultModel);
		validationResultModel = this.replaceLeadingCharacterDomainEnd(validationResultModel, '-');
		validationResultModel = this.replaceLeadingCharacterDomainEnd(validationResultModel, ',');
		return validationResultModel;
	}

	removeCharactersAfterAtSign(validationResultModel) {
		const fixed = this.getFixedOrOriginal(validationResultModel);
		let emailAddress = fixed;
		for (let i = 0, length = removeAtCharactersList.length; i < length; i++) {
			const key = removeAtCharactersList[i];
			if (emailAddress.indexOf(key) > -1) {
				emailAddress = emailAddress.replace(key, '@');
			}
		}
		validationResultModel = this.shortCheckEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			emailAddress: emailAddress,
			functionName: 'removeCharactersAfterAtSign'
		});
		return validationResultModel;
	}

	replaceUnderscoreWithHyphen(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		domainPart = textUtils.replaceCharacter(domainPart, '_', '-');
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'replaceUnderscoreWithHyphen'
		});
		return validationResultModel;
	}

	replaceDotHyphen(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		// Check if this fix is relevant.
		if (domainPart.indexOf('.-') === -1) {
			return validationResultModel;
		}
		const splitHyphen = domainPart.split('-');
		domainPart = domainPart.replace('.-', splitHyphen[splitHyphen.length - 1].indexOf('.') === -1 ? '.' : '-');
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'replaceDotHyphen'
		});
		return validationResultModel;
	}

	replaceHyphenDot(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		// Check if this fix is relevant.
		if (domainPart.indexOf('-.') === -1) {
			return validationResultModel;
		}
		const splitHyphen = domainPart.split('-');
		const characterReplace = domainEndsDotsList.includes(splitHyphen[splitHyphen.length - 1]) ? '.' : '-';
		domainPart = domainPart.replace('-.', characterReplace);
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'replaceHyphenDot'
		});
		return validationResultModel;
	}

	replaceLeadingCharacterDomainEnd(validationResultModel, character) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		// Check if this fix is relevant.
		if (domainPart.indexOf(character) === -1) {
			return validationResultModel;
		}
		let list, type = null;
		switch (character) {
			case '-': { list = domainEndsHyphenList; type = 'Hyphen'; break; }
			case ',': { list = domainEndsCommaList; type = 'Comma'; break; }
		}
		const splitHyphen = domainPart.split(character);
		const domainEnd = splitHyphen[splitHyphen.length - 1];
		if (!domainEnd.startsWith('.') && list.includes(`${character}${domainEnd}`)) {
			domainPart = textUtils.replaceLast(domainPart, character, '.');
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: `replaceLeadingCharacterDomainEnd${type}`
		});
		return validationResultModel;
	}

	// Clean invalid characters from the local part.
	fixCleanLocalInvalidCharacters(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		localPart = localPart.replace(regexUtils.cleanLocalPartRegex, '');
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCleanLocalInvalidCharacters'
		});
		return validationResultModel;
	}

	// Replace by domain end common typos - Manually.
	fixEqualDomainEnd(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		// Check if not already found in the singles typo domains, where will be fixed later.
		if (this.singleTypoCommonDomains.includes(domainPart)) {
			return validationResultModel;
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
		// Check if the domain end exists.
		if (domainSplits.length < 1) {
			return validationResultModel;
		}
		let domainEnd = textUtils.addStartDot(textUtils.sliceJoinDots(domainSplits, number));
		// In case that the domain is equal to one character, such as '.', it will destroy the domain.
		if (domainEnd.length === 1) {
			return validationResultModel;
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
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixEqualDomainEnd'
		});
		return validationResultModel;
	}

	// Fix emails like test@test.comhttps, test@test.co.il.html
	fixEqualCommonDomainEnd(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		// Check if domain end exists.
		if (domainSplits.length < 1) {
			return validationResultModel;
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
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixEqualCommonDomainEnd'
		});
		return validationResultModel;
	}

	// Replace by domain end clear extra unneeded characters - Manually.
	fixCleanDomainEnd(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		const isLongEnd = domainSplits.length > 2;
		const number = isLongEnd ? domainSplits.length : 1;
		if (domainSplits.length <= 1) {
			return validationResultModel;
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
			return validationResultModel;
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCleanDomainEnd'
		});
		return validationResultModel;
	}

	// Replace by domain end - Overall manually.
	fixOverallCleanDomainEnd(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
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
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixOverallCleanDomainEnd'
		});
		return validationResultModel;
	}

	// Fix @ as first character (like @test.some-domain.co.il).
	fixAtFirstCharacter(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		if (localPart.length) {
			return validationResultModel;
		}
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		if (domainSplits.length < 2) {
			return validationResultModel;
		}
		localPart = domainSplits[0];
		domainSplits.splice(0, 1);
		domainPart = domainSplits.join('.');
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixAtFirstCharacter'
		});
		return validationResultModel;
	}

	// Try to add the last dot if there is any dot in the domain part (like test@test-is).
	fixDefaultDomainEnd(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		if (domainPart.indexOf('.') === -1) {
			domainPart = textUtils.addMiddleDot(domainPart, this.defaultDonainEnd);
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixDefaultDomainEnd'
		});
		return validationResultModel;
	}

	fixEmailAddressTypo(validationResultModel) {
		validationResultModel = this.fixRemoveWhiteSpaces(validationResultModel);
		// Fix cases like: test@test.007@gmail.com => test@gmail.com.
		validationResultModel = this.fixMultiAtCharacters(validationResultModel);
		validationResultModel = this.fixDomainLowercase(validationResultModel);
		validationResultModel = this.fixDots(validationResultModel);
		validationResultModel = this.fixEdgeCases(validationResultModel);
		validationResultModel = this.fixCommonInvalidCharacters(validationResultModel);
		validationResultModel = this.fixCommonDomain(validationResultModel);
		validationResultModel = this.fixFlipDomain(validationResultModel);
		validationResultModel = this.fixLocalPartStartWithCommonDomain(validationResultModel);
		validationResultModel = this.fixLocalPartStartWithKey(validationResultModel);
		validationResultModel = this.fixEqualDomainEnd(validationResultModel);
		validationResultModel = this.fixEqualCommonDomainEnd(validationResultModel);
		validationResultModel = this.fixCleanDomainEnd(validationResultModel);
		validationResultModel = this.fixCleanDomainInvalidCharacters(validationResultModel);
		validationResultModel = this.fixCleanLocalInvalidCharacters(validationResultModel);
		return validationResultModel;
	}

	renameEmailAddressAutoTypo(validationResultModel) {
		const fixed = this.getFixedOrOriginal(validationResultModel);
		const emailAddress = this.checkForTypo(fixed);
		validationResultModel = this.shortCheckEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			emailAddress: emailAddress,
			functionName: 'renameEmailAddressAutoTypo'
		});
		return validationResultModel;
	}

	// Replace it in all places in the application.
	checkForCloseMatch(longString, shortString) {
		// Too many false positives with very short strings.
		if (shortString.length < this.emailAddressDataModel.minimumShortStringCharactersCount) {
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
			const wrongLetterRegEx = regexUtils.createRegex(`${firstPart}.${secondPart.substring(1)}`, '');
			if (wrongLetterRegEx.test(longString)) {
				return longString.replace(wrongLetterRegEx, shortString);
			}
			// Test for extra letter.
			const extraLetterRegEx = regexUtils.createRegex(`${firstPart}.${secondPart}`, '');
			if (extraLetterRegEx.test(longString)) {
				return longString.replace(extraLetterRegEx, shortString);
			}
			// Test for missing letter.
			if (secondPart !== 'mail') {
				const missingLetterRegEx = regexUtils.createRegex(`${firstPart}{0}${secondPart}`, '');
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

	fixMicromatchTypos(validationResultModel) {
		// Try original Micromatch.
		validationResultModel = this.fixMicromatch(validationResultModel, MicromatchActionEnum.NORMAL, 'fixMicromatchTyposNormal');
		// Check if Micromatch already took place.
		if (validationResultModel.functionIds.includes(this.fixFunctionIdsMap['fixMicromatchTyposNormal'])) {
			return validationResultModel;
		}
		// Try to remove the first character and then Micromatch.
		validationResultModel = this.fixMicromatch(validationResultModel, MicromatchActionEnum.FIRST, 'fixMicromatchTyposFirst');
		// Check if Micromatch already took place.
		if (validationResultModel.functionIds.includes(this.fixFunctionIdsMap['fixMicromatchTyposFirst'])) {
			return validationResultModel;
		}
		// Try to remove the last character and then Micromatch.
		validationResultModel = this.fixMicromatch(validationResultModel, MicromatchActionEnum.LAST, 'fixMicromatchTyposLast');
		// Check if Micromatch already took place.
		if (validationResultModel.functionIds.includes(this.fixFunctionIdsMap['fixMicromatchTyposLast'])) {
			return validationResultModel;
		}
		// Try to special characters and then Micromatch.
		validationResultModel = this.fixMicromatch(validationResultModel, MicromatchActionEnum.SPECIAL, 'fixMicromatchTyposSpecial');
		return validationResultModel;
	}

	fixMicromatch(validationResultModel, type, functionName) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		let testDomainPart = '';
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { ignoreList } = commonEmailAddressDomainsList[i];
			if (validationUtils.isExists(ignoreList) && ignoreList.findIndex(d => d === domainPart) > -1) {
				return validationResultModel;
			}
		}
		switch (type) {
			case MicromatchActionEnum.NORMAL: { testDomainPart = domainPart; break; }
			case MicromatchActionEnum.FIRST: { testDomainPart = textUtils.removeFirstCharacter(domainPart); break; }
			case MicromatchActionEnum.LAST: { testDomainPart = textUtils.removeLastCharacters({ value: domainPart, charactersCount: 1 }); break; }
			case MicromatchActionEnum.SPECIAL: { testDomainPart = domainPart.replace(regexUtils.cleanAllNoneAlphaNumericRegex, ''); break; }
		}
		const { isMatch, fixDomainPart } = this.findMicromatch([testDomainPart]);
		if (isMatch) {
			domainPart = fixDomainPart;
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: functionName
		});
		return validationResultModel;
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

	fixCommonDomain(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		for (let i = 0, length = commonEmailAddressDomainsList.length; i < length; i++) {
			const { domain, domainName } = commonEmailAddressDomainsList[i];
			if (domainPart !== domain && (domainPart.includes(domain) || domainPart.includes(`.${domainName}`))) {
				domainPart = domain;
				break;
			}
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixCommonDomain'
		});
		return validationResultModel;
	}

	fixFlipDomain(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
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
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixFlipDomain'
		});
		return validationResultModel;
	}

	fixLocalPartStartWithCommonDomain(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
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
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixLocalPartStartWithCommonDomain'
		});
		return validationResultModel;
	}

	fixLocalPartStartWithKey(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
		for (let i = 0, length = removeStartKeysList.length; i < length; i++) {
			const key = removeStartKeysList[i];
			if (localPart.indexOf(key) === 0) {
				localPart = localPart.replace(key, '');
				break;
			}
		}
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'fixLocalPartStartWithKey'
		});
		return validationResultModel;
	}

	finalRenameEmailAddressManuallyTypo(validationResultModel) {
		let { localPart, domainPart, fixed } = this.getEmailAddressData(validationResultModel);
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
		validationResultModel = this.checkEmailAddressUpdate({
			validationResultModel: validationResultModel,
			fixed: fixed,
			localPart: localPart,
			domainPart: domainPart,
			functionName: 'finalRenameEmailAddressManuallyTypo'
		});
		return validationResultModel;
	}

	getFixedOrOriginal(validationResultModel) {
		const { original, fix } = validationResultModel;
		return fix ? fix : original;
	}

	getEmailAddressData(validationResultModel) {
		const fixed = this.getFixedOrOriginal(validationResultModel);
		const [localPart, domainPart] = emailAddressUtils.getEmailAddressParts(fixed);
		return { localPart: localPart, domainPart: domainPart, fixed: fixed };
	}

	checkEmailAddressUpdate(data) {
		const { validationResultModel, fixed, localPart, domainPart, functionName } = data;
		const emailAddress = emailAddressUtils.getEmailAddressFromParts(localPart, domainPart);
		if (emailAddress !== fixed) {
			validationResultModel.fix = emailAddress;
			validationResultModel.functionIds.push(this.fixFunctionIdsMap[functionName]);
		}
		return validationResultModel;
	}

	shortCheckEmailAddressUpdate(data) {
		const { validationResultModel, fixed, emailAddress, functionName } = data;
		if (emailAddress && emailAddress !== fixed) {
			validationResultModel.fix = emailAddress;
			validationResultModel.functionIds.push(this.fixFunctionIdsMap[functionName]);
		}
		return validationResultModel;
	}

	validateDomainAsDomainEnd(validationResultModel) {
		const { domainPart } = this.getEmailAddressData(validationResultModel);
		for (let i = 0, length = domainEndsList.length; i < length; i++) {
			if (domainPart === domainEndsList[i]) {
				validationResultModel.isValid = false;
				validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateDomainAsDomainEnd']);
				return validationResultModel;
			}
		}
		return validationResultModel;
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
	validateRepeatCharacters(validationResultModel) {
		const { localPart, domainPart } = this.getEmailAddressData(validationResultModel);
		const domainSplits = textUtils.getSplitDotParts(domainPart);
		// Check if domain end exists.
		if (domainSplits.length < 1) {
			return validationResultModel;
		}
		domainSplits.splice(-1, 1);
		const localSplits = textUtils.getSplitDotParts(localPart);
		const isLocalRepeat = this.validatePartRepeat(localSplits);
		const isDomainRepeat = this.validatePartRepeat(domainSplits);
		if (isLocalRepeat && isDomainRepeat) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateRepeatCharacters']);
			return validationResultModel;
		}
		return validationResultModel;
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
		return fixed.length > this.emailAddressDataModel.minimumEmailAddressCharactersCount;
	}

	validateMinimumLocalPartLength(localPart) {
		if (localPart.length < this.emailAddressDataModel.minimumLocalPartCharactersCount) {
			return false;
		}
		return true;
	}

	validateMinimumDomainPartLength(domainPart) {
		if (domainPart.length < this.emailAddressDataModel.minimumDomainPartCharactersCount) {
			if (!shortEmailAddressDomainsList.includes(domainPart)) {
				return false;
			}
		}
		return true;
	}

	validateMaximumTotalLength(fixed) {
		if (fixed.length > this.emailAddressDataModel.maximumEmailAddressCharactersCount) {
			return false;
		}
		return true;
	}

	validateMaximumLocalPartLength(localPart) {
		if (localPart.length > this.emailAddressDataModel.maximumLocalPartCharactersCount) {
			return false;
		}
		return true;
	}

	validateMaximumDomainPartLength(domainPart) {
		if (domainPart.length > this.emailAddressDataModel.maximumDomainPartCharactersCount) {
			return false;
		}
		return true;
	}

	validateMaximumCommonDomainLocalPartLength(validationResultModel) {
		const { localPart, domainPart } = this.getEmailAddressData(validationResultModel);
		const isCommonDomain = commonEmailAddressDomainsList.findIndex(domain => domain.domain === domainPart) > -1;
		if (!isCommonDomain) {
			return validationResultModel;
		}
		if (localPart.length <= this.emailAddressDataModel.maximumCommonDomainLocalPartCharactersCount) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateMaximumCommonDomainLocalPartLength']);
		}
		return validationResultModel;
	}

	// Remove all the not allowed characters from any part of the email address.
	// The mark of isRegexValid here is false and will cancel all the rest of the validations.
	validateByRegex(validationResultModel) {
		const fixed = this.getFixedOrOriginal(validationResultModel);
		const isRegexValid = regexUtils.validateEmailAddressRegex.test(textUtils.toLowerCase(fixed));
		if (!isRegexValid) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateByRegex']);
		}
		return validationResultModel;
	}

	validateByNPMValidator(validationResultModel) {
		const fixed = this.getFixedOrOriginal(validationResultModel);
		try {
			validationResultModel.isValid = validator.isEmail(fixed);
		} catch (error) {
			validationResultModel.isValid = false;
		}
		if (!validationResultModel.isValid) {
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateByNPMValidator']);
		}
		return validationResultModel;
	}

	tryRecover(validationResultModel) {
		const { original } = validationResultModel;
		let recoverFixEmailAddress = null;
		for (let i = 0, length = invalidEmailAddresses.length; i < length; i++) {
			const invalidEmailAddress = invalidEmailAddresses[i];
			if (original === invalidEmailAddress.emailAddress && invalidEmailAddress.recoverFix) {
				recoverFixEmailAddress = invalidEmailAddress.recoverFix;
				break;
			}
		}
		if (recoverFixEmailAddress && recoverFixEmailAddress !== original) {
			validationResultModel.isValid = true;
			validationResultModel.fix = recoverFixEmailAddress;
			validationResultModel.functionIds.push(this.fixFunctionIdsMap['tryRecover']);
		}
		return validationResultModel;
	}

	validateVersionDomainPart(validationResultModel) {
		const { domainPart } = this.getEmailAddressData(validationResultModel);
		const isPackageName = regexUtils.createRegex(regexUtils.findPackageNameRegex, '').test(domainPart);
		if (isPackageName) {
			validationResultModel.isValid = false;
			validationResultModel.functionIds.push(this.validationFunctionIdsMap['validateVersionDomainPart']);
		}
		return validationResultModel;
	}

	// Detect gibberish email addresses like a60a26eba1e642519b43545f6be1d2b0@domain.com.
	validateGibberish(validationResultModel) {
		if (!this.emailAddressDataModel.isGibberishValidationActive) {
			return validationResultModel;
		}
		const { localPart, domainPart } = this.getEmailAddressData(validationResultModel);
		if (validationResultModel.isValid && localPart.length >= this.emailAddressDataModel.minimumGibberishCharactersCount) {
			const isCommonDomain = commonEmailAddressDomainsList.findIndex(domain => domain.domain === domainPart) > -1;
			if (!isCommonDomain) {
				validationResultModel.isGibberish = emailGibberishValidationService.isGibberish(localPart);
			}
		}
		return validationResultModel;
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