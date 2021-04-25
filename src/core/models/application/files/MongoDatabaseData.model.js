const { mongoDatabaseUtils } = require('../../../../utils');

class MongoDatabaseDataModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { IS_DROP_COLLECTION, MONGO_DATABASE_CONNECTION_STRING, MONGO_DATABASE_NAME, MONGO_DATABASE_COLLECTION_NAME,
			MAXIMUM_DROP_COLLECTION_RETRIES_COUNT, IS_MONGO_DATABASE_USE_UNIFILED_TOPOLOGY, IS_MONGO_DATABASE_USE_NEW_URL_PARSER,
			IS_MONGO_DATABASE_USE_CREATE_INDEX, MONGO_DATABASE_POOL_SIZE_COUNT, MONGO_DATABASE_SOCKET_TIMEOUT_MILLISECONDS_COUNT,
			MONGO_DATABASE_KEEP_ALIVE_MILLISECONDS_COUNT, IS_MONGO_DATABASE_SSL, IS_MONGO_DATABASE_SSL_VALIDATE } = settings;
		this.isDropCollection = IS_DROP_COLLECTION;
		this.mongoDatabaseConnectionString = MONGO_DATABASE_CONNECTION_STRING;
		this.mongoDatabaseName = MONGO_DATABASE_NAME;
		this.mongoDatabaseCollectionName = MONGO_DATABASE_COLLECTION_NAME;
		this.mongoDatabaseModeName = mongoDatabaseUtils.getMongoDatabaseModeName(settings);
		this.maximumDropCollectionRetriesCount = MAXIMUM_DROP_COLLECTION_RETRIES_COUNT;
		this.isMongoDatabaseUseUnifiledTopology = IS_MONGO_DATABASE_USE_UNIFILED_TOPOLOGY;
		this.isMongoDatabaseUseNewURLParser = IS_MONGO_DATABASE_USE_NEW_URL_PARSER;
		this.isMongoDatabaseUseCreateIndex = IS_MONGO_DATABASE_USE_CREATE_INDEX;
		this.mongoDatabasePoolSizeCount = MONGO_DATABASE_POOL_SIZE_COUNT;
		this.mongoDatabaseSocketTimeoutMillisecondsCount = MONGO_DATABASE_SOCKET_TIMEOUT_MILLISECONDS_COUNT;
		this.mongoDatabaseKeepAliveMillisecondsCount = MONGO_DATABASE_KEEP_ALIVE_MILLISECONDS_COUNT;
		this.isMongoDatabaseSSL = IS_MONGO_DATABASE_SSL;
		this.isMongoDatabaseSSLValidate = IS_MONGO_DATABASE_SSL_VALIDATE;
	}
}

module.exports = MongoDatabaseDataModel;