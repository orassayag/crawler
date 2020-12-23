const mongoose = require('mongoose');
const EmailAddressModel = require('../../core/models/database/EmailAddressModel');
const globalUtils = require('../../utils/files/global.utils');
const { systemUtils } = require('../../utils');
const { SaveStatus } = require('../../core/enums');

class MongoDatabaseService {

    constructor() {
        this.client = null;
        this.mongoDatabaseData = null;
        this.countLimitData = null;
        this.mongoDatabaseConnectionString = null;
        this.mongoDatabaseConnectionOptions = null;
    }

    async initiate(data) {
        const { countLimitData, mongoDatabaseData } = data;
        this.mongoDatabaseData = mongoDatabaseData;
        this.countLimitData = countLimitData;
        this.mongoDatabaseConnectionString = `${this.mongoDatabaseData.mongoDatabaseConnectionString}${this.mongoDatabaseData.mongoDatabaseModeName}`;
        this.mongoDatabaseConnectionOptions = {
            useUnifiedTopology: this.mongoDatabaseData.isMongoDatabaseUseUnifiledTopology,
            useNewUrlParser: this.mongoDatabaseData.isMongoDatabaseUseNewURLParser,
            useCreateIndex: this.mongoDatabaseData.isMongoDatabaseUseCreateIndex,
            poolSize: this.mongoDatabaseData.mongoDatabasePoolSizeCount,
            socketTimeoutMS: this.mongoDatabaseData.mongoDatabaseSocketTimeoutMillisecondsCount,
            keepAlive: this.mongoDatabaseData.mongoDatabaseKeepAliveMillisecondsCount,
            ssl: this.mongoDatabaseData.isMongoDatabaseSSL,
            sslValidate: this.mongoDatabaseData.isMongoDatabaseSSLValidate
        };
        await this.validateProcess();
        await this.createConnection();
        await this.testMongoDatabase();
        if (this.mongoDatabaseData.isDropCollection) {
            await this.dropCollection();
        }
    }

    async validateProcess() {
        if (!await systemUtils.isProcessRunning('mongod.exe')) {
            throw new Error('The process mongod.exe no running (1000022)');
        }
    }

    async closeConnection() {
        await mongoose.connection.close();
    }

    async createConnection() {
        // Connect to the Mongo database.
        this.client = await mongoose.connect(this.mongoDatabaseConnectionString, this.mongoDatabaseConnectionOptions)
            .catch(error => { throw new Error(`Failed to connect to MongoDB: ${error} (1000023)`); });
        if (!this.client) {
            throw new Error('Failed to connect to MongoDB: Client is null or empty (1000024)');
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
        for (let i = 0; i < this.mongoDatabaseData.maximumDropCollectionRetriesCount; i++) {
            try {
                await this.client.connection.collection(this.mongoDatabaseData.mongoDatabaseCollectionName).drop();
                break;
            }
            catch (error) { }
        }
    }

    async getEmailAddressesCount() {
        return await mongoose.connection.collection(this.mongoDatabaseData.mongoDatabaseCollectionName).countDocuments();
    }

    async saveEmailAddress(emailAddress) {
        const insertEmailAddress = emailAddress.trim();
        // Check if the email address exists in the Mongo database.
        const emailAddressModel = await EmailAddressModel.findOne({ 'emailAddress': insertEmailAddress });
        if (emailAddressModel) {
            return SaveStatus.EXISTS;
        }
        let status = null;
        for (let i = 0; i < this.countLimitData.maximumSaveEmailAddressesRetriesCount; i++) {
            try {
                await new EmailAddressModel({ emailAddress: insertEmailAddress }).save();
                status = SaveStatus.SAVE;
                break;
            }
            catch (error) {
                status = SaveStatus.ERROR;
            }
            finally {
                await globalUtils.sleep(this.countLimitData.millisecondsDelayMongoDatabaseSyncCount);
            }
        }
        return status;
    }
}

module.exports = new MongoDatabaseService();