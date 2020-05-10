class EmailAddressData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { MINIMUM_LOCAL_PART_CHARACTERS_COUNT, MINIMUM_DOMAIN_PART_CHARACTERS_COUNT, MINIMUM_EMAIL_ADDRESS_CHARACTERS_COUNT,
			MAXIMUM_COMMON_DOMAIN_LOCAL_PART_CHARACTERS_COUNT, MAXIMUM_LOCAL_PART_CHARACTERS_COUNT, MAXIMUM_DOMAIN_PART_CHARACTERS_COUNT,
			MAXIMUM_EMAIL_ADDRESS_CHARACTERS_COUNT, MINIMUM_SHORT_STRING_CHARACTERS_COUNT
		} = settings;
		this.minimumLocalPartCharactersCount = MINIMUM_LOCAL_PART_CHARACTERS_COUNT;
		this.minimumDomainPartCharactersCount = MINIMUM_DOMAIN_PART_CHARACTERS_COUNT;
		this.minimumEmailAddressCharactersCount = MINIMUM_EMAIL_ADDRESS_CHARACTERS_COUNT;
		this.maximumCommonDomainLocalPartCharactersCount = MAXIMUM_COMMON_DOMAIN_LOCAL_PART_CHARACTERS_COUNT;
		this.maximumLocalPartCharactersCount = MAXIMUM_LOCAL_PART_CHARACTERS_COUNT;
		this.maximumDomainPartCharactersCount = MAXIMUM_DOMAIN_PART_CHARACTERS_COUNT;
		this.maximumEmailAddressCharactersCount = MAXIMUM_EMAIL_ADDRESS_CHARACTERS_COUNT;
		this.minimumShortStringCharactersCount = MINIMUM_SHORT_STRING_CHARACTERS_COUNT;
	}
}

module.exports = EmailAddressData;