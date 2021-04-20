const Chance = require('chance');
const chance = new Chance();
const faker = require('faker');
const LoremIpsum = require('lorem-ipsum').LoremIpsum;
const randomEmail = require('random-email');
const randomWords = require('random-words');
const settings = require('../../settings/settings');
const { ApplicationData, CountLimitData, EmailAddressData, MongoDatabaseData, TestData } = require('../../core/models/application');
const { PartType } = require('../../core/enums');
const { activeSearchEngineNames, commonEmailAddressDomainsList, emailAddressDomainsList, emailAddressEndFixTypos, invalidEmailAddresses,
    removeAtCharactersList, updatesEmailAddresses, validEmailAddresses } = require('../../configurations');
const crawlEmailAddressService = require('./crawlEmailAddress.service');
const mongoDatabaseService = require('./mongoDatabase.service');
const typosGeneratorService = require('./typosGenerator.service');
const uuidGeneratorService = require('./uuidGenerator.service');
const { characterUtils, emailAddressUtils, textUtils, validationUtils } = require('../../utils');

class EmailAddressesGeneratorService {

    constructor() {
        this.formatter1 = textUtils.toUpperCase;
        this.formatter2 = textUtils.upperCaseFirstLetter;
        this.validEmailAddresses = validEmailAddresses.map(e => e.emailAddress);
        this.invalidEmailAddresses = invalidEmailAddresses.map(e => e.emailAddress);
        this.updatesEmailAddresses = updatesEmailAddresses.map(e => e.emailAddress);
        this.emailAddressesList = this.validEmailAddresses.concat(this.invalidEmailAddresses);
        this.commonDomains = emailAddressDomainsList.filter(c => c.isCommonDomain);
        this.noneCommonDomains = emailAddressDomainsList.filter(c => !c.isCommonDomain);
        this.emailAddressEndFixTyposKeys = Object.keys(emailAddressEndFixTypos);
        // ===APPLICATION=== //
        this.applicationData = null;
        // ===COUNT & LIMIT=== //
        this.countLimitData = null;
        // ===MONGO DATABASE=== //
        this.mongoDatabaseData = null;
        // ===EMAIL ADDRESS=== //
        this.emailAddressData = null;
        // ===TEST=== //
        this.testData = null;
    }

    async initiate() {
        // ===APPLICATION=== //
        this.applicationData = new ApplicationData({
            settings: settings,
            activeSearchEngineNames: activeSearchEngineNames,
            status: null,
            method: null,
            restartsCount: 0
        });
        // ===COUNT & LIMIT=== //
        this.countLimitData = new CountLimitData(settings);
        // ===MONGO DATABASE=== //
        this.mongoDatabaseData = new MongoDatabaseData(settings);
        // ===EMAIL ADDRESS=== //
        this.emailAddressData = new EmailAddressData(settings);
        // ===TEST=== //
        this.testData = new TestData(settings);
        // Initiate the email address domain details lists.
        crawlEmailAddressService.initiateCommonEmailAddressDomains();
        // Initiate the Mongo database service.
        await mongoDatabaseService.initiate({
            countLimitData: this.countLimitData,
            mongoDatabaseData: this.mongoDatabaseData
        });
    }

    async done() {
        // Close the Mongo database.
        await mongoDatabaseService.closeConnection();
    }

    async getRandomEmailAddresses() {
        const count = textUtils.getRandomNumber(this.testData.minimumCreateRandomEmailAddressesCount, this.testData.maximumCreateRandomEmailAddressesCount);
        const emailAddresses = [];
        for (let i = 0; i < count; i++) {
            const emailAddress = await this.createEmailAddress();
            if (emailAddress) {
                emailAddresses.push(emailAddress);
            }
        }
        return emailAddresses;
    }

    getValidEmailAddress() {
        return this.validEmailAddresses;
    }

    getInvalidEmailAddresses() {
        return this.invalidEmailAddresses;
    }

    getUpdateEmailAddress() {
        return this.updatesEmailAddresses;
    }

    async getTypos(data) {
        let { localPart, domainPart } = data;
        if (!validationUtils.isExists(domainPart)) {
            const { domain } = textUtils.getRandomKeyFromArray(commonEmailAddressDomainsList);
            domainPart = domain;
        }
        // Get random typos and test them.
        const typos = await typosGeneratorService.generateTyposAsync(domainPart);
        if (!validationUtils.isExists(typos)) {
            throw new Error('No typos generated (1000009)');
        }
        if (!localPart) {
            localPart = 'test';
        }
        const emailAddresses = [];
        for (let i = 0, length = typos.length; i < length; i++) {
            emailAddresses.push(emailAddressUtils.getEmailAddressFromParts(localPart, typos[i]));
        }
        return { emailAddresses: emailAddresses, domainPart: domainPart };
    }

    async createEmailAddress() {
        let emailAddress = '';
        if (textUtils.getRandomBoolean()) {
            switch (textUtils.getRandomNumber(1, 7)) {
                case 1: { emailAddress = await this.createMongoDatabaseEmailAddress(); break; }
                case 2: { emailAddress = this.createSimpleValidEmailAddress(); break; }
                case 3: { emailAddress = this.createEmailAddressNPMFaker(); break; }
                case 4: { emailAddress = this.createEmailAddressNPMRandomEmail(); break; }
                case 5: { emailAddress = this.createEmailAddressNPMChance(); break; }
                case 6: { emailAddress = this.createEmailAddressMispelledPartsListEnds(); break; }
            }
        }
        else {
            const localPart = await this.createLocalPart();
            const domainPart = await this.createDomainPart();
            emailAddress = emailAddressUtils.getEmailAddressFromParts(localPart, domainPart);
        }
        return emailAddress;
    }

    async createLocalPart() {
        let localPart = '';
        switch (textUtils.getRandomNumber(1, 15)) {
            case 1: { localPart = emailAddressUtils.getEmailAddressParts(this.createSimpleValidEmailAddress())[0]; break; }
            case 2: { localPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressNPMFaker())[0]; break; }
            case 3: { localPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressNPMRandomEmail())[0]; break; }
            case 4: { localPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressNPMChance())[0]; break; }
            case 5: { localPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressMispelledPartsListEnds())[0]; break; }
            case 6: { localPart = this.createRandomPartLists(PartType.LOCAL); break; }
            case 7: { localPart = this.createRandomPartNPM(PartType.LOCAL); break; }
            case 8: { localPart = this.createRandomPartNPMLoremIpsum(); break; }
            case 9: { localPart = this.createRandomPartNPMChance(); break; }
            case 10: { localPart = this.createRandomPartNPMFaker(); break; }
            case 11: { localPart = await this.createRandomPartTypo(); break; }
            case 12: { localPart = this.createRandomPartUUID(); break; }
            case 13: { localPart = this.createRandomPartManually(PartType.LOCAL); break; }
            case 14: { localPart = this.createRandomPartNPMRandomWords(PartType.LOCAL); break; }
        }
        return localPart;
    }

    async createDomainPart() {
        let domainPart = '';
        switch (textUtils.getRandomNumber(1, 19)) {
            case 1: { domainPart = emailAddressUtils.getEmailAddressParts(this.createSimpleValidEmailAddress())[1]; break; }
            case 2: { domainPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressNPMFaker())[1]; break; }
            case 3: { domainPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressNPMRandomEmail())[1]; break; }
            case 4: { domainPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressNPMChance())[1]; break; }
            case 5: { domainPart = emailAddressUtils.getEmailAddressParts(this.createEmailAddressMispelledPartsListEnds())[1]; break; }
            case 6: { domainPart = this.createDomainPartLists(); break; }
            case 7: { domainPart = this.createDomainPartDomainsDetails(); break; }
            case 8: { domainPart = this.createDomainPartNPMFaker(); break; }
            case 9: { domainPart = this.createDomainPartNPMChance(); break; }
            case 10: { domainPart = this.createRandomPartLists(PartType.DOMAIN); break; }
            case 11: { domainPart = this.createRandomPartNPM(PartType.DOMAIN); break; }
            case 12: { domainPart = this.createRandomPartNPMLoremIpsum(); break; }
            case 13: { domainPart = this.createRandomPartNPMChance(); break; }
            case 14: { domainPart = this.createRandomPartNPMFaker(); break; }
            case 15: { domainPart = await this.createRandomPartTypo(); break; }
            case 16: { domainPart = this.createRandomPartUUID(); break; }
            case 17: { domainPart = this.createRandomPartManually(PartType.DOMAIN); break; }
            case 18: { domainPart = this.createRandomPartNPMRandomWords(PartType.DOMAIN); break; }
        }
        return domainPart;
    }

    async createMongoDatabaseEmailAddress() {
        let emailAddress = '';
        const emailAddressesList = await mongoDatabaseService.getAllEmailAddresses();
        if (validationUtils.isExists(emailAddressesList)) {
            emailAddress = textUtils.getRandomKeyFromArray(emailAddressesList).emailAddress;
        }
        return emailAddress;
    }

    createSimpleValidEmailAddress() {
        let emailAddress = '';
        emailAddress = this.getRandomString(emailAddress, this.testData.maximumLocalTestSimpleCharactersCount);
        emailAddress = `${emailAddress}@`;
        emailAddress = this.getRandomString(emailAddress, this.testData.maximumDomainTestSimpleCharactersCount);
        emailAddress = `${emailAddress}.com`;
        return this.mayMisspellEmailAddress(emailAddress);
    }

    getRandomString(emailAddress, count) {
        let temporaryString = '';
        for (let i = 0; i < count; i++) {
            temporaryString = textUtils.getRandomKeyFromArray(characterUtils.simpleCharacters);
            emailAddress = emailAddress + temporaryString;
        }
        return emailAddress;
    }

    createEmailAddressNPMFaker() {
        return this.mayMisspellEmailAddress(faker.internet.email());
    }

    createEmailAddressNPMRandomEmail() {
        return this.mayMisspellEmailAddress(randomEmail());
    }

    createEmailAddressNPMChance() {
        return this.mayMisspellEmailAddress(chance.email());
    }

    createEmailAddressMispelledPartsListEnds() {
        const localPart = this.createRandomPartNPM(PartType.LOCAL);
        const domainPart = this.createRandomPartNPM(PartType.DOMAIN);
        if (!localPart || !domainPart) {
            return '';
        }
        const end = textUtils.getRandomKeyFromArray(this.emailAddressEndFixTyposKeys);
        return emailAddressUtils.getEmailAddressFromParts(localPart, emailAddressUtils.replaceDomainPartEnd(domainPart, end));
    }

    createDomainPartLists() {
        const isCommonDomain = textUtils.getRandomBoolean();
        const isTypo = textUtils.getRandomBoolean();
        const list = isCommonDomain ? this.commonDomains : this.noneCommonDomains;
        const commonTypo = textUtils.getRandomKeyFromArray(list);
        return isTypo ? textUtils.getRandomKeyFromArray(commonTypo.list) : commonTypo.domain;
    }

    createDomainPartDomainsDetails() {
        return textUtils.getRandomKeyFromArray(commonEmailAddressDomainsList).domain;
    }

    createDomainPartNPMFaker() {
        return this.mayMisspellEmailAddress(faker.internet.domainName());
    }

    createDomainPartNPMChance() {
        return chance.domain();
    }

    createRandomPartLists(partType) {
        const emailAddress = textUtils.getRandomKeyFromArray(this.emailAddressesList);
        return this.getRelevantEmailAddressPart(emailAddress, partType);
    }

    createRandomPartNPM(partType) {
        let emailAddress = '';
        switch (textUtils.getRandomNumber(1, 5)) {
            case 1: { emailAddress = this.createSimpleValidEmailAddress(); break; }
            case 2: { emailAddress = this.createEmailAddressNPMFaker(); break; }
            case 3: { emailAddress = this.createEmailAddressNPMRandomEmail(); break; }
            case 4: { emailAddress = this.createEmailAddressNPMChance(); break; }
        }
        return this.getRelevantEmailAddressPart(emailAddress, partType);
    }

    createRandomPartNPMLoremIpsum() {
        const lorem = new LoremIpsum();
        return lorem.generateWords(1);
    }

    createRandomPartNPMChance() {
        let part = '';
        switch (textUtils.getRandomNumber(1, 12)) {
            case 1: { part = chance.word(); break; }
            case 2: { part = chance.animal(); break; }
            case 3: { part = chance.string(); break; }
            case 4: { part = chance.name(); break; }
            case 5: { part = chance.city(); break; }
            case 6: { part = chance.syllable(); break; }
            case 7: { part = chance.profession(); break; }
            case 8: { part = chance.company(); break; }
            case 9: { part = chance.last(); break; }
            case 10: { part = chance.first(); break; }
            case 11: { part = chance.suffix({ full: true }); break; }
        }
        return textUtils.removeEmptySpaces(part);
    }

    createRandomPartNPMFaker() {
        let part = '';
        switch (textUtils.getRandomNumber(1, 13)) {
            case 1: { part = faker.commerce.productName(); break; }
            case 2: { part = faker.finance.accountName(); break; }
            case 3: { part = faker.internet.userName(); break; }
            case 4: { part = faker.internet.domainWord(); break; }
            case 5: { part = faker.internet.password(); break; }
            case 6: { part = faker.lorem.word(); break; }
            case 7: { part = faker.name.firstName(); break; }
            case 8: { part = faker.name.lastName(); break; }
            case 9: { part = faker.name.findName(); break; }
            case 10: { part = faker.name.jobTitle(); break; }
            case 11: { part = faker.random.word(); break; }
            case 12: { part = faker.system.fileName(); break; }
        }
        return textUtils.removeEmptySpaces(part);
    }

    async createRandomPartTypo() {
        const typos = await typosGeneratorService.generateTyposAsync(this.getSingleWord());
        return textUtils.getRandomKeyFromArray(typos);
    }

    createRandomPartUUID() {
        return uuidGeneratorService.getUUID(textUtils.getRandomNumber(1, 6), this.getSingleWord());
    }

    createRandomPartManually(partType) {
        let part = '';
        const maximumLength = this.getMaximumLengthByType(partType);
        const length = textUtils.getRandomNumber(this.testsData.minimumRandomPartCharactersCount, maximumLength);
        for (let i = 0; i < length; i++) {
            part += textUtils.getRandomKeyFromArray(characterUtils.allCharacters);
        }
        return part;
    }

    createRandomPartNPMRandomWords(partType) {
        let part = '';
        const maximumLength = this.getMaximumLengthByType(partType);
        const isOverLength = textUtils.getRandomBoolean();
        const isSeparator = textUtils.getRandomBoolean();
        const isFormatter = textUtils.getRandomBoolean();
        const isAddRandomLetters = textUtils.getRandomBoolean();
        const isAddRandomNumbers = textUtils.getRandomBoolean();
        const isSpecialCharacters = textUtils.getRandomBoolean();
        const isVerySpecialCharacters = textUtils.getRandomBoolean();
        const randomWordsSettings = {
            exactly: 1,
            wordsPerString: textUtils.getRandomNumber(this.testData.minimumTestRandomWordsCount, this.testData.maximumTestRandomWordsCount),
            separator: isSeparator ? textUtils.getRandomKeyFromArray(characterUtils.separatorsCharacters) : '',
            formatter: isFormatter ? textUtils.getRandomBoolean() ? this.formatter1 : this.formatter2 : null
        };
        part = randomWords(randomWordsSettings)[0];
        if (isOverLength) {
            for (let i = 0; i < 20; i++) {
                if (part.length < maximumLength) {
                    part += randomWords(randomWordsSettings)[0];
                }
                else {
                    break;
                }
            }
        }
        part = isAddRandomNumbers ? this.replaceRandomPositions(part, characterUtils.numbersCharacters) : part;
        part = isAddRandomLetters ? this.replaceRandomPositions(part, characterUtils.alphaCharacters) : part;
        part = isSpecialCharacters ? this.replaceRandomPositions(part, characterUtils.specialCharacters) : part;
        part = isVerySpecialCharacters ? this.replaceRandomPositions(part, characterUtils.verySpecialCharacters) : part;
        return part;
    }

    getSingleWord() {
        return randomWords({
            exactly: 1
        })[0];
    }

    getRelevantEmailAddressPart(emailAddress, partType) {
        const [localPart, domainPart] = emailAddressUtils.getEmailAddressParts(emailAddress);
        if (!localPart || !domainPart) {
            return '';
        }
        return partType === PartType.LOCAL ? localPart : partType === PartType.DOMAIN ? domainPart : '';
    }

    mayMisspellEmailAddress(emailAddress) {
        if (!textUtils.getRandomBoolean()) {
            return emailAddress;
        }
        const isAddTypos = textUtils.getRandomBoolean();
        const isAddEndTypo = textUtils.getRandomBoolean();
        if (isAddTypos) {
            const bug = removeAtCharactersList[textUtils.getRandomNumber(0, removeAtCharactersList.length)];
            const fix = removeAtCharactersList[bug];
            emailAddress = emailAddress.replace(fix, bug);
        }
        if (isAddEndTypo) {
            const end = textUtils.getRandomKeyFromArray(this.emailAddressEndFixTyposKeys);
            emailAddress = emailAddressUtils.replaceDomainPartEnd(emailAddress, end);
        }
        return emailAddress;
    }

    getMaximumLengthByType(partType) {
        return partType === PartType.LOCAL ? this.emailAddressData.maximumLocalPartCharactersCount :
            partType === PartType.DOMAIN ? this.emailAddressData.maximumDomainPartCharactersCount : 0;
    }

    replaceRandomPositions(part, list) {
        const count = textUtils.getRandomNumber(this.testData.minimumReplaceRandomPositionsCount, this.testData.maximumReplaceRandomPositionsCount);
        for (let i = 0; i < count; i++) {
            const character = textUtils.getRandomKeyFromArray(list);
            const index = textUtils.getRandomNumber(0, part.length);
            part = textUtils.replaceAt({
                text: part,
                position: index,
                newText: character
            });
        }
        return part;
    }
}

module.exports = new EmailAddressesGeneratorService();