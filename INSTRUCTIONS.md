# Instructions

## Setup Instructions

1. Open the project in your IDE (VSCode recommended)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MongoDB is installed and running locally on `mongodb://localhost:27017/`

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Internet connection (for production mode)

## Configuration

### Main Settings

Open `src/settings/settings.js` and configure according to your needs:

#### Production vs Development Mode
- `IS_PRODUCTION_MODE`: Set to `true` for real crawling with Puppeteer, `false` for testing with local sources
- **Important**: Run `npm run preload` after changing this setting to install/remove Puppeteer package

#### Goal Settings
- `GOAL_TYPE`: Choose from `EMAIL_ADDRESSES`, `MINUTES`, or `LINKS`
- `GOAL_VALUE`: Set the target value (e.g., 1000 email addresses, 700 minutes, 500 links)

#### Method Settings
- `IS_LINKS_METHOD_ACTIVE`: Enable/disable link crawling from search engines
- `IS_CRAWL_METHOD_ACTIVE`: Enable/disable email address extraction from pages

#### MongoDB Settings
- `IS_DROP_COLLECTION`: Set to `true` to clear the database before starting (use for testing)
- `MONGO_DATABASE_NAME`: Database name (default: `crawl`)
- `MONGO_DATABASE_COLLECTION_NAME`: Collection name (default: `emailaddresses`)

#### Search Settings
- `SEARCH_KEY`: Set a static search term, or leave as `null` for random search keys
- `IS_ADVANCE_SEARCH_KEYS`: Use advanced Hebrew search keys (`true`) or basic static keys (`false`)

#### Process Limits
- `MAXIMUM_SEARCH_PROCESSES_COUNT`: Number of processes to run (default: 10000 for long runs)
- `MAXIMUM_SEARCH_ENGINE_PAGES_PER_PROCESS_COUNT`: Pages to crawl per process (default: 1)
- `MAXIMUM_MINUTES_WITHOUT_UPDATE`: Restart if no progress for X minutes (default: 20)

#### Logging Options
- `IS_LOG_VALID_EMAIL_ADDRESSES`: Log valid emails to TXT file
- `IS_LOG_FIX_EMAIL_ADDRESSES`: Log fixed emails to TXT file
- `IS_LOG_INVALID_EMAIL_ADDRESSES`: Log invalid emails to TXT file
- `IS_LOG_CRAWL_LINKS`: Log crawled links to TXT file

### Search Engines Configuration

Edit `src/configurations/files/searchEngines.configuration.js`:
- Configure active search engines (Bing, Google)
- Set URL patterns and query parameters
- Enable/disable specific engines

### Search Keys Configuration

Edit `src/configurations/files/searchKeys.configuration.js`:
- `basicSearchKeys`: Static search terms
- `advanceSearchKeys`: Dynamic Hebrew search key generation rules

### Filter Configurations

#### Email Address Filters
Edit `src/configurations/files/filterEmailAddress.configuration.js`:
- `filterEmailAddressDomains`: Domain parts to filter out
- `filterEmailAddresses`: Specific email addresses to exclude

#### Link Filters
Edit `src/configurations/files/filterLinkDomains.configuration.js`:
- `globalFilterLinkDomains`: Domains to filter from all search engines
- `filterLinkDomains`: Search engine-specific domain filters

#### File Extension Filters
Edit `src/configurations/files/filterFileExtensions.configuration.js`:
- `filterLinkFileExtensions`: File extensions to skip when crawling (e.g., `.pdf`, `.jpg`)

### Email Domain Configurations

Edit `src/configurations/files/emailAddressDomainsList.configuration.js`:
- List of common email domains (Gmail, Hotmail, etc.)
- Typo correction mappings
- Domain validation rules

## Running Scripts

### Main Crawler (with Monitor)
Starts the crawler with automatic restart on failure:
```bash
npm start
```

This launches the monitor which:
- Shows confirmation screen with current settings
- Automatically restarts on errors/timeout
- Tracks progress and statistics
- Logs all data to `dist/production/` or `dist/development/`

### Backup
Creates a backup of the project:
```bash
npm run backup
```

### Domain Counter
Counts email address domains from files or MongoDB:
```bash
npm run domains
```

### Tests

#### Validate Single Email
Tests email validation logic:
```bash
npm run val
```

#### Validate Multiple Emails
Validates a batch of email addresses:
```bash
npm run valmany
```

#### Debug Email Validation
Runs validation with Node.js inspector:
```bash
npm run valdebug
```

#### Test Typos
Tests email typo detection and correction:
```bash
npm run typos
```

#### Test Link Crawling
Tests crawling links from a specific page:
```bash
npm run link
```

#### Test Session Links
Tests crawling multiple predefined links:
```bash
npm run session
```

#### Email Generator Test
Tests random email address generation:
```bash
npm run generator
```

#### Test Cases
Runs comprehensive email validation test cases:
```bash
npm run cases
```

#### Sandbox
General testing sandbox:
```bash
npm run sand
```

## Quick Start Guide

### For Testing (Development Mode)
1. Open `src/settings/settings.js`
2. Set `IS_PRODUCTION_MODE: false`
3. Set `GOAL_TYPE: GoalTypeEnum.EMAIL_ADDRESSES`
4. Set `GOAL_VALUE: 10`
5. Set `IS_LONG_RUN: false`
6. Run: `npm start`

### For Production Crawling
1. Open `src/settings/settings.js`
2. Set `IS_PRODUCTION_MODE: true`
3. Run: `npm run preload` (installs Puppeteer)
4. Configure search engines in `searchEngines.configuration.js`
5. Configure search keys in `searchKeys.configuration.js`
6. Configure filters as needed
7. Ensure MongoDB is running
8. Run: `npm start`
9. Confirm settings when prompted (type `y`)

## File Structure

### Source Files (`src/`)
- `monitor/monitor.js` - Main entry point with restart monitoring
- `scripts/crawl.script.js` - Crawling script logic
- `logics/crawl.logic.js` - Core crawling orchestration
- `services/` - Business logic services
- `configurations/` - Configuration files
- `settings/settings.js` - Main settings file
- `utils/` - Utility functions
- `core/` - Models and enums

### Output Files (`dist/`)
Generated files are placed in `dist/production/` or `dist/development/` with date-based subdirectories:
- `valid_email_addresses.txt` - Valid emails found
- `fix_email_addresses.txt` - Emails that were corrected
- `invalid_email_addresses.txt` - Invalid emails
- `crawl_links.txt` - Links crawled
- `crawl_error_links.txt` - Links that failed

## Understanding the Console Status Line

When running, you'll see a real-time status line with:

```
===[SETTINGS] Mode: PRODUCTION | Plan: STANDARD | Database: crawl | Drop: false | Long: true | Active Methods: LINKS,CRAWL===
===[GENERAL] Time: 00.00:00:12 [\] | Goal: MINUTES | Progress: 0/700 (00.00%) | Status: CRAWL | Restarts: 0===
===[PROCESS] Process: 1/10,000 | Page: 1/1 | Engine: Bing | Key: search term===
===[LINK] Crawl: ✅  13 | Total: 40 | Filter: 27 | Error: 0 | Error In A Row: 0 | Current: 2/13===
===[EMAIL ADDRESS] Save: ✅  0 | Total: 2 | Database: 15,915 | Exists: 1 | Invalid: ❌  0 | Valid Fix: 0 | Invalid Fix: 0 | Unsave: 0 | Filter: 0 | Skip: 0 | Gibberish: 0===
```

- **SETTINGS**: Current mode and configuration
- **GENERAL**: Runtime, goal progress, current status
- **PROCESS**: Process number, page number, search engine, search key
- **LINK**: Link crawling statistics
- **EMAIL ADDRESS**: Email collection statistics

## Troubleshooting

### Application Won't Start
- Ensure MongoDB is running: `mongod`
- Check Node version: `node --version` (should be v14+)
- Delete `node_modules` and run `npm install` again

### No Email Addresses Being Found
- Check if search engines changed their HTML structure
- Verify internet connection
- Check filter configurations (might be too aggressive)
- Examine `dist/.../crawl_error_links.txt` for errors

### Puppeteer Errors
- Ensure Chromium dependencies are installed (Linux)
- Try running with `IS_PRODUCTION_MODE: false` first
- Check for antivirus interference

### MongoDB Connection Errors
- Verify MongoDB is running: `mongo` command should work
- Check connection string in settings
- Ensure MongoDB port 27017 is not blocked

### Application Keeps Restarting
- Check `MAXIMUM_MINUTES_WITHOUT_UPDATE` setting
- Increase timeout values if network is slow
- Review error logs in dist directory

## Important Notes

- Always run `npm run preload` when switching between production and development modes
- The application automatically restarts on errors (up to 50 times)
- All email addresses are validated and can be auto-corrected for common typos
- Gibberish detection is enabled by default to filter out invalid data
- Links are filtered to avoid duplicates and unwanted domains
- Downloads folder is automatically cleaned between processes

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag
