const mongoose = require('mongoose');
const EmailAddressModel = require('../../core/models/database/EmailAddressModel');
const globalUtils = require('../../utils/files/global.utils');
const { SaveStatus } = require('../../core/enums/files/emailAddress.enum');

class DatabaseService {

    constructor() {
        this.client = null;
        this.applicationData = null;
        this.databaseData = null;
        this.countsLimitsData = null;
        this.mongoConnectionString = null;
        this.mongoConnectionOptions = null;
    }

    async initiate(data) {
        const { applicationData, countsLimitsData, databaseData } = data;
        this.applicationData = applicationData;
        this.databaseData = databaseData;
        this.countsLimitsData = countsLimitsData;
        this.mongoConnectionString = `${this.databaseData.mongoDatabaseConnectionString}${this.databaseData.mongoDatabaseModeName}`;
        this.mongoConnectionOptions = {
            useUnifiedTopology: this.databaseData.isDatabaseUseUnifiledTopology,
            useNewUrlParser: this.databaseData.isDatabaseUseNewURLParser,
            useCreateIndex: this.databaseData.isDatabaseUseCreateIndex,
            poolSize: this.databaseData.databasePoolSizeCount,
            socketTimeoutMS: this.databaseData.databaseSocketTimeoutMillisecondsCount,
            keepAlive: this.databaseData.databaseKeepAliveMillisecondsCount,
            ssl: this.databaseData.isDatabaseSSL,
            sslValidate: this.databaseData.isDatabaseSSLValidate
        };
        await this.createConnection();
        await this.testDatabase();
        if (this.databaseData.isDropCollection) {
            await this.dropCollection();
        }
    }

    async closeConnection() {
        await mongoose.connection.close();
    }

    async createConnection() {
        // Connect to the Mongo database.
        this.client = await mongoose.connect(this.mongoConnectionString, this.mongoConnectionOptions)
            .catch(error => { throw new Error(`Failed to connect to MongoDB: ${error} (1000006)`); });
        if (!this.client) {
            throw new Error('Failed to connect to MongoDB: Client is null or empty (1000007)');
        }
    }

    // Test CRUD operations to check that the database is working OK.
    async testDatabase() {
        // Delete.
        await this.testDatabaseDelete();
        // Create.
        const result = await this.testDatabaseCreate();
        // Read.
        await this.testDatabaseRead();
        // Update.
        await this.testDatabaseUpdate(result);
        // Delete.
        await this.testDatabaseDelete();
    }

    async testDatabaseCreate() {
        return await new EmailAddressModel({ emailAddress: 'XXX' }).save();
    }

    async testDatabaseRead() {
        await EmailAddressModel.findOne({ 'emailAddress': 'XXX' });
    }

    async testDatabaseUpdate(result) {
        await EmailAddressModel.updateOne({ id: result._id, 'emailAddress': 'XXX' }, new EmailAddressModel({ emailAddress: 'XXY' }));
    }

    async testDatabaseDelete() {
        await EmailAddressModel.deleteOne({ 'emailAddress': 'XXX' });
        await EmailAddressModel.deleteOne({ 'emailAddress': 'XXY' });
    }

    async getAllEmailAddresses() {
        return await EmailAddressModel.find();
    }

    async dropCollection() {
        let isDropSuccess = false;
        let currentRetries = 0;
        while (!isDropSuccess && currentRetries < this.databaseData.maximumDropCollectionRetriesCount) {
            try {
                await this.client.connection.collection(this.databaseData.mongoCollectionName).drop();
                isDropSuccess = true;
            }
            catch (error) {
                isDropSuccess = false;
                currentRetries++;
            }
        }
    }

    async getEmailAddressesCount() {
        return await mongoose.connection.collection(this.databaseData.mongoCollectionName).countDocuments();
    }

    async saveEmailAddress(emailAddress) {
        const insertEmailAddress = emailAddress.trim();
        // Check if the email address exists in the database.
        const emailAddressModel = await EmailAddressModel.findOne({ 'emailAddress': insertEmailAddress });
        if (emailAddressModel) {
            return SaveStatus.EXISTS;
        }
        let status = null;
        let currentRetries = 0;
        while (status !== SaveStatus.SAVE && currentRetries < this.countsLimitsData.maximumSaveEmailAddressesRetriesCount) {
            try {
                await new EmailAddressModel({ emailAddress: insertEmailAddress }).save();
                status = SaveStatus.SAVE;
            }
            catch (error) {
                status = SaveStatus.ERROR;
                currentRetries++;
            }
            finally {
                await globalUtils.sleep(this.countsLimitsData.millisecondsDelayDatabaseSyncCount);
            }
        }
        return status;
    }
}

const databaseService = new DatabaseService();
module.exports = databaseService;