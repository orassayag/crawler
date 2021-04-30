const mongoose = require('mongoose');
const { EmailAddressModel } = require('../../core/models/database');
const { SaveStatusEnum } = require('../../core/enums');
const globalUtils = require('../../utils/files/global.utils');
const { systemUtils } = require('../../utils');

class MongoDatabaseService {

    constructor() {
        this.client = null;
        this.mongoDatabaseDataModel = null;
        this.countLimitDataModel = null;
        this.mongoDatabaseConnectionString = null;
        this.mongoDatabaseConnectionOptions = null;
    }

    async initiate(data) {
        const { countLimitDataModel, mongoDatabaseDataModel } = data;
        this.mongoDatabaseDataModel = mongoDatabaseDataModel;
        this.countLimitDataModel = countLimitDataModel;
        this.mongoDatabaseConnectionString = `${this.mongoDatabaseDataModel.mongoDatabaseConnectionString}${this.mongoDatabaseDataModel.mongoDatabaseModeName}`;
        this.mongoDatabaseConnectionOptions = {
            useUnifiedTopology: this.mongoDatabaseDataModel.isMongoDatabaseUseUnifiledTopology,
            useNewUrlParser: this.mongoDatabaseDataModel.isMongoDatabaseUseNewURLParser,
            useCreateIndex: this.mongoDatabaseDataModel.isMongoDatabaseUseCreateIndex,
            poolSize: this.mongoDatabaseDataModel.mongoDatabasePoolSizeCount,
            socketTimeoutMS: this.mongoDatabaseDataModel.mongoDatabaseSocketTimeoutMillisecondsCount,
            keepAlive: this.mongoDatabaseDataModel.mongoDatabaseKeepAliveMillisecondsCount,
            ssl: this.mongoDatabaseDataModel.isMongoDatabaseSSL,
            sslValidate: this.mongoDatabaseDataModel.isMongoDatabaseSSLValidate
        };
        await this.validateProcess();
        await this.createConnection();
        await this.testMongoDatabase();
        if (this.mongoDatabaseDataModel.isDropCollection) {
            await this.dropCollection();
        }
    }

    async validateProcess() {
        if (!await systemUtils.isProcessRunning('mongod.exe')) {
            throw new Error('The process mongod.exe not running (1000023)');
        }
    }

    async closeConnection() {
        await mongoose.connection.close();
    }

    async createConnection() {
        // Connect to the Mongo database.
        this.client = await mongoose.connect(this.mongoDatabaseConnectionString, this.mongoDatabaseConnectionOptions)
            .catch(error => { throw new Error(`Failed to connect to MongoDB: ${error} (1000024)`); });
        if (!this.client) {
            throw new Error('Failed to connect to MongoDB: Client is null or empty (1000025)');
        }
    }

    // Test CRUD operations to check that the Mongo database is working OK.
    async testMongoDatabase() {
        // Delete.
        await this.testMongoDatabaseDelete();
        // Create.
        const result = await this.testMongoDatabaseCreate();
        // Read.
        await this.testMongoDatabaseRead();
        // Update.
        await this.testMongoDatabaseUpdate(result);
        // Delete.
        await this.testMongoDatabaseDelete();
    }

    async testMongoDatabaseCreate() {
        return await new EmailAddressModel({ emailAddress: 'XXX' }).save();
    }

    async testMongoDatabaseRead() {
        await EmailAddressModel.findOne({ 'emailAddress': 'XXX' });
    }

    async testMongoDatabaseUpdate(result) {
        await EmailAddressModel.updateOne({ id: result._id, 'emailAddress': 'XXX' }, new EmailAddressModel({ emailAddress: 'XXY' }));
    }

    async testMongoDatabaseDelete() {
        await EmailAddressModel.deleteOne({ 'emailAddress': 'XXX' });
        await EmailAddressModel.deleteOne({ 'emailAddress': 'XXY' });
    }

    async getAllEmailAddresses() {
        return await EmailAddressModel.find();
    }

    async dropCollection() {
        for (let i = 0; i < this.mongoDatabaseDataModel.maximumDropCollectionRetriesCount; i++) {
            try {
                await this.client.connection.collection(this.mongoDatabaseDataModel.mongoDatabaseCollectionName).drop();
                break;
            }
            catch (error) { }
        }
    }

    async getEmailAddressesCount() {
        return await mongoose.connection.collection(this.mongoDatabaseDataModel.mongoDatabaseCollectionName).countDocuments();
    }

    async saveEmailAddress(emailAddress) {
        const insertEmailAddress = emailAddress.trim();
        // Check if the email address exists in the Mongo database.
        const emailAddressModel = await EmailAddressModel.findOne({ 'emailAddress': insertEmailAddress });
        if (emailAddressModel) {
            return SaveStatusEnum.EXISTS;
        }
        let status = null;
        for (let i = 0; i < this.countLimitDataModel.maximumSaveEmailAddressesRetriesCount; i++) {
            try {
                await new EmailAddressModel({ emailAddress: insertEmailAddress }).save();
                status = SaveStatusEnum.SAVE;
                break;
            }
            catch (error) {
                status = SaveStatusEnum.ERROR;
            }
            finally {
                await globalUtils.sleep(this.countLimitDataModel.millisecondsDelayMongoDatabaseSyncCount);
            }
        }
        return status;
    }
}

module.exports = new MongoDatabaseService();