# Instructions

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Setup and Usage Instructions](#setup-and-usage-instructions)
4. [Available Commands](#available-commands)
5. [Configuration Guide](#configuration)
6. [Extending the Application](#extending-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Documentation](#documentation)
10. [External Resources](#external-resources)
11. [Version](#version)
12. [Last Updated](#last-updated)

## Setup Instructions

1. Open the project in your IDE (VSCode recommended)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MongoDB is installed and running locally on `mongodb://localhost:27017/`

## Prerequisites

### System Requirements

- **Node.js**: v14 or higher (v16+ recommended)
- **MongoDB**: v4 or higher
- **Memory**: 4GB RAM minimum for Puppeteer stability
- **OS**: Windows, macOS, or Linux
- **Internet**: Required for production crawling mode

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Internet connection (for production mode)

## Initial Setup

### Install Dependencies

1. Clone the repository to your local machine.
2. Navigate to the project root directory.
3. Run the installation command:
   ```bash
   npm install
   ```
4. Verify MongoDB is installed and running on `localhost:27017`.

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

## Setup and Usage Instructions

The crawler is designed to be highly configurable. Follow these steps to set up and run your first crawl:

1. **Prepare Environment**: Ensure Node.js and MongoDB are running.
2. **Configure Goals**: Set your target in `src/settings/settings.js`.
3. **Select Mode**: Choose between Development (local files) and Production (Puppeteer).
4. **Execute**: Run `npm start` and monitor the progress via the console.

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

## Available Commands

The following commands are available in the project:

### Main Commands

- `npm start`: Launches the monitor and starts the crawler.
- `npm run backup`: Backs up the project and MongoDB data.
- `npm run domains`: Processes and counts email domains.
- `npm run preload`: Installs/removes Puppeteer based on settings.

### Development Commands

- `npm run val`: Validate a single email address manually.
- `npm run valmany`: Batch validate multiple email addresses.
- `npm run valdebug`: Debug the validation logic.
- `npm run typos`: Test the typo correction engine.
- `npm run link`: Test link extraction from a specific URL.
- `npm run cases`: Run comprehensive validation test cases.
- `npm run sand`: Use the testing sandbox.

## Extending the Application

### Adding Search Engines

To add a new search engine:

1. Open `src/configurations/files/searchEngines.configuration.js`.
2. Define a new configuration object with `name`, `url`, and `queryParam`.
3. Add the engine name to the active search engines list in settings.

### Custom Validation Rules

To add new email validation rules:

1. Modify `src/services/files/emailAddressValidation.service.js`.
2. Add your logic to the `validate` method or create a new validation service.

### New Search Key Generators

To create custom search key logic:

1. Update `src/configurations/files/searchKeys.configuration.js`.
2. Add your generator function to the `advanceSearchKeys` section.

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

## Best Practices

- **Configuration Isolation**: Keep production and development settings distinct in `settings.js`.
- **Database Backups**: Always run `npm run backup` before clearing collections.
- **Rate Limiting**: Use the `MINUTES` goal to prevent search engine blocks during long runs.
- **Log Review**: Regularly check `invalid_email_addresses.txt` to refine your filter rules.
- **Test First**: Use the specialized test scripts (e.g., `npm run link`) to verify new configurations.

## Documentation

- **README.md**: High-level overview and architecture description.
- **CONTRIBUTING.md**: Guidelines for code contributions.
- **CHANGELOG.md**: History of project updates and versions.
- **Source Comments**: Detailed JSDoc comments within the `src/` directory.

## External Resources

- [Puppeteer API Reference](https://pptr.dev/api)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)

## Version

1.0.0

## Last Updated

2026-05-18

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag
