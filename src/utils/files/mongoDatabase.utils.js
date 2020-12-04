const applicationUtils = require('./application.utils');
const textUtils = require('./text.utils');

class MongoDatabaseUtils {

    constructor() { }

    getMongoDatabaseModeName(settings) {
        const { IS_PRODUCTION_MODE, MONGO_DATABASE_NAME } = settings;
        return `${MONGO_DATABASE_NAME}_${textUtils.toLowerCase(applicationUtils.getApplicationMode(IS_PRODUCTION_MODE))}`;
    }
}

module.exports = new MongoDatabaseUtils();