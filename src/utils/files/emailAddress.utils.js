const regexUtils = require('./regex.utils');
const validationUtils = require('./validation.utils');

class EmailAddressUtils {

	constructor() { }

	// This method fetch for all email addresses within given string.
	getEmailAddresses(data) {
		if (!validationUtils.isExists(data)) {
			return [];
		}
		return data.toString().match(regexUtils.findEmailAddressesRegex);
	}

	getEmailAddressParts(emailAddress) {
		if (!emailAddress) {
			return '';
		}
		return emailAddress.split('@');
	}

	getEmailAddressFromParts(localPart, domainPart) {
		return `${localPart}@${domainPart}`;
	}

	replaceDomainPartEnd(domainPart, end) {
		return `${domainPart.substring(0, domainPart.indexOf('.'))}${end}`;
	}

	getDomainEndsGroups(array, key) {
		const group = array.reduce((result, currentValue) => {
			(result[currentValue[key]] = result[currentValue[key]] || []).push(
				currentValue.domainEnd
			);
			return result;
		}, {});
		return Array.from(Object.values(group));
	}

	getDomainsFixTyposList(emailAddressDomainEndsList) {
		return emailAddressDomainEndsList.filter(domain => domain.typosList.length)
			.map(domain => { return { domainEnd: domain.domainEnd, typosList: domain.typosList }; }).reduce((obj, item) => {
				item.typosList.map(typo => {
					obj[typo] = typo.startsWith('.') ? `.${item.domainEnd}` : item.domainEnd;
				}); return obj;
			}, {});
	}
}

module.exports = new EmailAddressUtils();