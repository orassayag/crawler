const settings = require('../../settings/settings');
const { GoalType } = require('../../core/enums/files/system.enum');
const globalUtils = require('../../utils/files/global.utils');
const pathUtils = require('../../utils/files/path.utils');
const validationUtils = require('../../utils/files/validation.utils');

class InitiateService {

	constructor() { }

	initiate() {
		// First, setup handle errors and promises.
		this.setup();
		// The second important thing to to it to validate all the parameters of the settings.js file.
		this.validateSettings();
		// The next thing is to calculate paths and inject back to the settings.js file.
		this.calculateSettings();
		// Make sure that the dist directory exists. If not, create it.
		this.validateDirectories();
		// Validate that certain directories exists, and if not, create them.
		this.createDirectories();
	}

	setup() {
		// Handle any uncaughtException error.
		process.on('uncaughtException', (error) => {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			console.log(error);
		});
		// Handle any unhandledRejection promise error.
		process.on('unhandledRejection', (reason, promise) => {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			console.log(reason);
			console.log(promise);
		});
	}

	validateSettings() {
		// Validate the settings object existence.
		if (!settings) {
			throw new Error('Invalid or no settings object was found (1000013)');
		}
		this.validateNumbers();
		this.validatePositiveNumbers();
		this.validateStrings();
		this.validateBooleans();
		this.validateArrays();
		this.validateEnums();
		this.validateSpecial();
	}

	calculateSettings() {
		const { APPLICATION_NAME, SECONDARY_BACKUP_PATH, OUTER_APPLICATION_PATH, INNER_APPLICATION_PATH, APPLICATION_PATH,
			BACKUPS_PATH, DIST_PATH, SOURCES_PATH, NODE_MODULES_PATH, PACKAGE_JSON_PATH,
			PACKAGE_LOCK_JSON_PATH } = settings;
		// ===ROOT PATHS=== //
		settings.SECONDARY_BACKUP_PATH = pathUtils.getJoinPath({ targetPath: SECONDARY_BACKUP_PATH, targetName: APPLICATION_NAME });
		// ===DYNAMIC PATHS=== //
		settings.APPLICATION_PATH = pathUtils.getJoinPath({ targetPath: OUTER_APPLICATION_PATH, targetName: APPLICATION_PATH });
		settings.BACKUPS_PATH = pathUtils.getJoinPath({ targetPath: OUTER_APPLICATION_PATH, targetName: BACKUPS_PATH });
		settings.DIST_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: DIST_PATH });
		settings.SOURCES_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: SOURCES_PATH });
		settings.NODE_MODULES_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: NODE_MODULES_PATH });
		settings.PACKAGE_JSON_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: PACKAGE_JSON_PATH });
		settings.PACKAGE_LOCK_JSON_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: PACKAGE_LOCK_JSON_PATH });
	}

	validateNumbers() {
		// ===COUNTS & LIMITS=== //
		['SCHEDULE_MINUTES_COUNT'].map(key => {
			const value = settings[key];
			if (!validationUtils.isValidNumber(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Excpected a number but received: ${value} (1000040)`);
			}
		});
	}

	validatePositiveNumbers() {
		[
			// ===GOAL=== //
			'GOAL_VALUE',
			// ===MONITOR=== //
			'MAXIMUM_MINUTES_WITHOUT_UPDATE',
			'MAXIMUM_RESTARTS_COUNT',
			// ===LOGS=== //
			'MAXIMUM_FIX_LOG_SPACES_CHARECTERS_COUNT',
			// ===COUNTS & LIMITS=== //
			'MAXIMUM_SEARCH_PROCESSES_COUNT', 'MAXIMUM_SEARCH_ENGINE_PAGES_PER_PROCESS_COUNT',
			'MAXIMUM_DISPLAY_SEARCH_KEY_CHARACTERS_COUNT', 'MINIMUM_SEARCH_KEY_CHARACTERS_COUNT', 'MAXIMUM_RETRIES_GENERATE_SEARCH_KEY_COUNT',
			'MILLISECONDS_INTERVAL_COUNT', 'MILLISECONDS_DELAY_BETWEEN_PROCESS_COUNT', 'MILLISECONDS_DELAY_BETWEEN_SEARCH_PAGES_COUNT',
			'MILLISECONDS_DELAY_BETWEEN_CRAWL_PAGES_COUNT', 'MILLISECONDS_DELAY_MONGO_DATABASE_SYNC_COUNT', 'MILLISECONDS_TIMEOUT_SOURCE_REQUEST_COUNT',
			'MAXIMUM_CONSOLE_LINE_CHARACTERS', 'MAXIMUM_TRENDING_SAVE_COUNT', 'MAXIMUM_DELAY_NPM_SCRIPT', 'MAXIMUM_SAVE_EMAIL_ADDRESS_RETRIES_COUNT',
			'MAXIMUM_ERROR_PAGE_IN_A_ROW_COUNT', 'MAXIMUM_UNSAVE_EMAIL_ADDRESSES_COUNT', 'MAXIMUM_UNIQUE_DOMAIN_COUNT',
			// ===BACKUP=== //
			'MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT', 'BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT',
			// ===MONGO DATABASE=== //
			'MAXIMUM_DROP_COLLECTION_RETRIES_COUNT', 'MONGO_DATABASE_POOL_SIZE_COUNT', 'MONGO_DATABASE_SOCKET_TIMEOUT_MILLISECONDS_COUNT',
			'MONGO_DATABASE_KEEP_ALIVE_MILLISECONDS_COUNT',
			// ===TESTS=== //
			'MINIMUM_CREATE_RANDOM_EMAIL_ADDRESSES_COUNT', 'MAXIMUM_CREATE_RANDOM_EMAIL_ADDRESSES_COUNT', 'MINIMUM_SPECIAL_CHARECTERS_TYPOS_EMAIL_ADDRESSES_COUNT',
			'MAXIMUM_SPECIAL_CHARECTERS_TYPOS_EMAIL_ADDRESSES_COUNT', 'MINIMUM_SPECIAL_CHARECTERS_COUNT', 'MAXIMUM_SPECIAL_CHARECTERS_COUNT',
			'MAXIMUM_LOCAL_TEST_SIMPLE_CHARACTERS_COUNT', 'MAXIMUM_DOMAIN_TEST_SIMPLE_CHARACTERS_COUNT', 'MINIMUM_REPLACE_RANDOM_POSITIONS_COUNT',
			'MAXIMUM_REPLACE_RANDOM_POSITIONS_COUNT', 'MINIMUM_TEST_RANDOM_WORDS_COUNT', 'MAXIMUM_TEST_RANDOM_WORDS_COUNT', 'MINIMUM_RANDOM_PART_CHARACTERS_COUNT',
			// ===EMAIL ADDRESS=== //
			'MINIMUM_LOCAL_PART_CHARACTERS_COUNT', 'MINIMUM_DOMAIN_PART_CHARACTERS_COUNT', 'MINIMUM_EMAIL_ADDRESS_CHARACTERS_COUNT',
			'MAXIMUM_COMMON_DOMAIN_LOCAL_PART_CHARACTERS_COUNT', 'MINIMUM_SHORT_STRING_CHARACTERS_COUNT',
			// ===UNCHANGED SETTINGS=== //
			'MAXIMUM_LOCAL_PART_CHARACTERS_COUNT', 'MAXIMUM_DOMAIN_PART_CHARACTERS_COUNT', 'MAXIMUM_EMAIL_ADDRESS_CHARACTERS_COUNT'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isPositiveNumber(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Excpected a number but received: ${value} (1000014)`);
			}
		});
	}

	validateStrings() {
		[
			// ===GOAL=== //
			'GOAL_TYPE',
			// ===ROOT PATHS=== //
			'APPLICATION_NAME', 'SECONDARY_BACKUP_PATH', 'OUTER_APPLICATION_PATH', 'INNER_APPLICATION_PATH',
			// ===DYNAMIC PATHS=== //
			'APPLICATION_PATH', 'BACKUPS_PATH', 'DIST_PATH', 'SOURCES_PATH', 'NODE_MODULES_PATH', 'PACKAGE_JSON_PATH',
			'PACKAGE_LOCK_JSON_PATH',
			// ===MONGO DATABASE=== //
			'MONGO_DATABASE_CONNECTION_STRING', 'MONGO_DATABASE_NAME', 'MONGO_DATABASE_COLLECTION_NAME',
			// ===PACKAGES=== //
			'NPM_PUPPETEER_VERSION',
			// ===VALIDATION=== //
			'VALIDATION_CONNECTION_LINK'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isExists(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Excpected a string but received: ${value} (1000038)`);
			}
		});
	}

	validateBooleans() {
		[
			// ===FLAGS=== //
			'IS_PRODUCTION_MODE', 'IS_DROP_COLLECTION', 'IS_STATUS_MODE', 'IS_EMPTY_DIST_DIRECTORY', 'IS_RUN_DOMAINS_COUNTER', 'IS_LONG_RUN',
			// ===SEARCH=== //
			'IS_ADVANCE_SEARCH_KEYS',
			// ===STEPS=== //
			'IS_LINKS_STEP', 'IS_CRAWL_STEP', 'IS_SKIP_LOGIC',
			// ===LOGS=== //
			'IS_LOG_VALID_EMAIL_ADDRESSES', 'IS_LOG_FIX_EMAIL_ADDRESSES', 'IS_LOG_INVALID_EMAIL_ADDRESSES',
			'IS_LOG_UNSAVE_EMAIL_ADDRESSES', 'IS_LOG_CRAWL_LINKS', 'IS_LOG_CRAWL_ERROR_LINKS',
			// ===MONGO DATABASE=== //
			'IS_MONGO_DATABASE_USE_UNIFILED_TOPOLOGY', 'IS_MONGO_DATABASE_USE_NEW_URL_PARSER', 'IS_MONGO_DATABASE_USE_CREATE_INDEX', 'IS_MONGO_DATABASE_SSL',
			'IS_MONGO_DATABASE_SSL_VALIDATE'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isValidBoolean(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Excpected a boolean but received: ${value} (1000015)`);
			}
		});
	}

	validateArrays() {
		[
			// ===BACKUP=== //
			'IGNORE_DIRECTORIES', 'IGNORE_FILES', 'INCLUDE_FILES'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isValidArray(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Excpected a array but received: ${value} (1000016)`);
			}
		});
	}

	validateEnums() {
		const { GOAL_TYPE } = settings;
		// ===GOAL=== //
		if (!validationUtils.isValidEnum({
			enum: GoalType,
			value: GOAL_TYPE
		})) {
			throw new Error('Invalid or no GOAL_TYPE parameter was found (1000017)');
		}
	}

	validateSpecial() {
		const { MONGO_DATABASE_CONNECTION_STRING, VALIDATION_CONNECTION_LINK, NPM_PUPPETEER_VERSION } = settings;
		// ===MONGO DATABASE=== //
		if (!validationUtils.isValidMongoConnectionString(MONGO_DATABASE_CONNECTION_STRING)) {
			throw new Error('Invalid or no MONGO_DATABASE_CONNECTION_STRING parameter was found (1000018)');
		}
		// ===VALIDATION=== //
		if (!validationUtils.isValidLink(VALIDATION_CONNECTION_LINK)) {
			throw new Error('No VALIDATION_CONNECTION_LINK parameter was found (1000019)');
		}
		// ===PACKAGES=== //
		if (!validationUtils.isValidVersion(NPM_PUPPETEER_VERSION)) {
			throw new Error('Invalid or no NPM_PUPPETEER_VERSION parameter was found (1000020)');
		}
	}

	validateDirectories() {
		[
			// ===ROOT PATHS=== //
			'SECONDARY_BACKUP_PATH', 'OUTER_APPLICATION_PATH', 'INNER_APPLICATION_PATH',
			// ===DYNAMIC PATHS===
			'APPLICATION_PATH', 'BACKUPS_PATH', 'SOURCES_PATH', 'PACKAGE_JSON_PATH', 'DOWNLOADS_PATH'
		].map(key => {
			const value = settings[key];
			// Verify that the dist and the sources paths exists.
			globalUtils.isPathExistsError(value);
			// Verify that the dist and the sources paths accessible.
			globalUtils.isPathAccessible(value);
		});
	}

	createDirectories() {
		[
			// ===DYNAMIC PATHS===
			'DIST_PATH', 'NODE_MODULES_PATH'
		].map(key => {
			const value = settings[key];
			// Make sure that the dist directory exists, if not, create it.
			globalUtils.createDirectory(value);
		});
	}
}

module.exports = new InitiateService();