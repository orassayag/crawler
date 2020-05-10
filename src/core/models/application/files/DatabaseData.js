const { databaseUtils } = require('../../../../utils');

class DatabaseData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { IS_DROP_COLLECTION, MONGO_DATABASE_CONNECTION_STRING, MONGO_DATABASE_NAME, MONGO_COLLECTION_NAME,
			MAXIMUM_DROP_COLLECTION_RETRIES_COUNT, IS_DATABASE_USE_UNIFILED_TOPOLOGY, IS_DATABASE_USE_NEW_URL_PARSER,
			IS_DATABASE_USE_CREATE_INDEX, DATABASE_POOL_SIZE_COUNT, DATABASE_SOCKET_TIMEOUT_MILLISECONDS_COUNT,
			DATABASE_KEEP_ALIVE_MILLISECONDS_COUNT, IS_DATABASE_SSL, IS_DATABASE_SSL_VALIDATE } = settings;
		this.isDropCollection = IS_DROP_COLLECTION;
		this.mongoDatabaseConnectionString = MONGO_DATABASE_CONNECTION_STRING;
		this.mongoDatabaseName = MONGO_DATABASE_NAME;
		this.mongoCollectionName = MONGO_COLLECTION_NAME;
		this.mongoDatabaseModeName = databaseUtils.getDatabaseModeName(settings);
		this.maximumDropCollectionRetriesCount = MAXIMUM_DROP_COLLECTION_RETRIES_COUNT;
		this.isDatabaseUseUnifiledTopology = IS_DATABASE_USE_UNIFILED_TOPOLOGY;
		this.isDatabaseUseNewURLParser = IS_DATABASE_USE_NEW_URL_PARSER;
		this.isDatabaseUseCreateIndex = IS_DATABASE_USE_CREATE_INDEX;
		this.databasePoolSizeCount = DATABASE_POOL_SIZE_COUNT;
		this.databaseSocketTimeoutMillisecondsCount = DATABASE_SOCKET_TIMEOUT_MILLISECONDS_COUNT;
		this.databaseKeepAliveMillisecondsCount = DATABASE_KEEP_ALIVE_MILLISECONDS_COUNT;
		this.isDatabaseSSL = IS_DATABASE_SSL;
		this.isDatabaseSSLValidate = IS_DATABASE_SSL_VALIDATE;
	}
}

module.exports = DatabaseData;