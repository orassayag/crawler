const applicationUtils = require('./application.utils');
const textUtils = require('./text.utils');

class DatabaseUtils {

    constructor() { }

    getDatabaseModeName(settings) {
        const { IS_PRODUCTION_MODE, MONGO_DATABASE_NAME } = settings;
        return `${MONGO_DATABASE_NAME}_${textUtils.toLowerCase(applicationUtils.getApplicationMode(IS_PRODUCTION_MODE))}`;
    }
}

const databaseUtils = new DatabaseUtils();
module.exports = databaseUtils;