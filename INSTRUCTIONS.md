======
INDEX:
======
1. FAST & BASIC START.
2. ADVANCE OPTIONS & SETTINGS.
3. DIFFERENT SCRIPTS.
4. TESTS.
5. IMPORTANT MESSAGES.

======================
1. FAST & BASIC START.
======================
1. Open the project in IDE (Current to 03/16/2020 I'm using VSCode).
2. Open the following file in the src/settings/settings.js file.
3. Search for the first setting - 'IS_PRODUCTION_MODE' - Make sure it is true.
4. Next - Time to install the NPM packages. In the terminal run 'npm run preload'.
   It will install automatically all the required NPM packages according to the
   production mode (With NPM puppeteer.js package).
   (Note: Don't worry if you see errors on screen - It does 2 times NPM i,
   since there are a few packages that cause errors -
   Just validate that the second 'npm i' goes without errors. If you see errors -
   Run 'npm i' manually. If still got errors - Need to check what's wrong).
5. Once finished with the node_modules installation, it's time to set up your goal.
6. Open once again the Open the following file in the src/settings/settings.js file.
7. Go to the 'GOAL_TYPE' setting and select the desired one from the following
   options: EMAIL_ADDRESSES / MINUTES / LINKS.
8. After that, go to the 'GOAL_VALUE, and declare in numbers the maximum value
   to reach and when the application will stop to run.
9. You are ready to start to crawl.
10. In the terminal run 'npm start'. If everything goes well, you will start to see
    the console status line appears.
11. If you see any error - Need to check what's changed. Current to 03/16/2020,
    It works fine.
12. If you see the console status line but the 'Save' or 'Total' not progressing
    - Need to check what's wrong.
    Maybe on the active search engines - The URL parameters has been changed?
    Maybe the crawling puppeteer has been changed?
13. If no errors and the progress works OK, make sure to check on
    dist/production/date of today (Example: 1_20200316_222124)/ That all TXT
    files created successfully.
14. Index about each parameter in the console status line can be found in
    misc/documents/complete_tasks.txt

==============================
2. ADVANCE OPTIONS & SETTINGS.
==============================
Settings:
All the settings are located in the settings.js file.
On the src/settings/settings.js file there is description about each setting and what
it does, we will go thought the important ones:

IS_PRODUCTION_MODE:
If true, will work with real links and use real search engines with the help of the
NPM puppeteer.js package. If it is false, the crawling will act as fake, crawling
randomly from fake search engines page and fake links, all from the sources directory,
located on the root (/sources/engine + /sources/page).

IS_DROP_COLLECTION:
If true, before each start of the crawling process, the Mongo database will be dropped
(deleted) automatically. If false, no action will be taken related to the Mongo database in
the beginning.

GOAL_TYPE:
The options are EMAIL_ADDRESSES / MINUTES / LINKS. EMAIL_ADDRESSES - Saved email addresses
in the Mongo database, not total or filtered or other categories. MINUTES - Total minutes from the
start of the application. LINKS - Total crawl links, not total links, or filtered links.

GOAL_VALUE:
The value of the goal in numbers. For example, of the goal type is email addresses, and the
goal value is 1,000, when the saved email addresses will reach to 1,000 the application will
stop to run. NOTE: if the MAXIMUM_SEARCH_PROCESSES_COUNT parameter will reach the maximum
value, no matter if the goal reached the end or not - The application will stop.

SEARCH_KEY:
If you don't want to use the random search key and to use a static search key, you can write
the desired search key in this value, and in all the process this will be the search key.

IS_LINKS_METHOD_ACTIVE:
If true, the method of fetching links within a search engine search by query string will take place.
This method does not include other logic. If it is false, it will not do any logic, and an error will be thrown.

IS_CRAWL_METHOD_ACTIVE:
If true, and the links method is also true, a full crawl operation will take place, include fetch links
from search engine search, and for each link fetched - Perform a crawling action to fetch all the email
addresses from each link. If this method is marked as false, no crawling email addresses will take place.

MAXIMUM_SEARCH_PROCESSES_COUNT:
This parameter determines the number of processes to run in the entire application lifetime. If the process
reach this number, the application will stop, regardless the goal status. If the goal reaches the target
deadline, it will stop, regardless of the process count.

MAXIMUM_SEARCH_ENGINE_PAGES_PER_PROCESS_COUNT:
This parameter determines the number of pages to page in the search engine during each process.
For example, if this number is 2, the process will contain 2 rounds, with '&page=1' and '&page=2'
in the query string for the search engine.

ALL PATHS (APPLICATION_NAME, OUTER_APPLICATION_PATH, INNER_APPLICATION_PATH,
APPLICATION_PATH, BACKUPS_PATH, DIST_PATH, SOURCES_PATH, NODE_MODULES_PATH,
PACKAGE_JSON_PATH, PACKAGE_LOCK_JSON_PATH):
All these parameters of path required for a couple of reasons: for the secondary backup directory,
for the backups directory to perform automatic backup, to log all the collected data to
TXT files, to refresh the node_modules directory, and much more.

NPM_PUPPETEER_VERSION:
When running the 'npm run preload' script and it's on IS_PRODUCTION_MODE = true in the settings.js file,
the script will add dynamically the puppeteer package to the package.json file, and refresh the node_modules
directory and the package-lock.json file. Don't forget to update the version of this parameter if this package
has been updated.

VALIDATION_CONNECTION_LINK:
If its production mode, there will be validation on the internet connection that needed to exist in order
to function correctly. This parameter determines the link to get a response and by that to verify that the internet
connection is on. The default is google.com, what are the chances that this domain will be down?

Configurations:
All the configurations located on the src/configurations directory.

emailAddressDomainsList.configuration.js:
emailAddressDomainsList - All the common email addresses domain. Uses when
an email address needs
to be checked, and if matched for one of the typos - It will be fixed by the 'domain'
automatically. Note about the 'isCommonDomain' field - If it's true, it will
be listed on runtime to the 'commonEmailAddressDomainsList' array in the
emailAddressConfigurations.configuration.js file. This array validates these common domains
with different logic from rest of the domains that are not common.

emailAddressConfigurations.configuration.js:
removeAtCharactersList - All the common typos that the email address will check
if contained and will be replaced if needed.
validDomainEndsList - All the common end domain parts to check if the domain end is valid.
validOneWordDomainEndsList - All the common single word end domain parts to check if the domain end is valid.
emailAddressEndFixTypos - All the common domain end typos that the email address will
be checked if it contains and will be replaced if needed.
commonEmailAddressDomainsList - Already detailed above.

emailAddressesLists.configuration.js:
validEmailAddresses - An array that contain mostly valid email addresses, uses in couple of
places in the application, such as tests cases test for the validation function of the email
address, and to generate randomly email addresses for the generator test.
invalidEmailAddresses - An array that contain mostly invalid email addresses, uses in couple of
places in the application, such as the validation function to check if the invalid email address
already exists in the list, and maybe has a tryRecover fix, or to random invalid email addresses
in some of the tests.

filterEmailAddress.configuration.js:
filterEmailAddressDomains - A list of domain parts of email addresses which once matched when
fetched from the source - Will be counted as filtered and will not be saved in the Mongo database and
will not be logged to any TXT file.
unfixEmailAddressDomains - A list of domain parts of email addresses which once they will be fixed,
for example, from '.co' to '.co.il' the fix will cause the email address to be invalid, so from this
list, if the domain match - There will be unfix logic to recover the email address to the original state.
filterEmailAddresses - A list of full email addresses to filter. If don't want to save specific
email address - Add it to this list.

filterFileExtensions.configuration.js:
filterLinkFileExtensions - A list of file extensions that if the search engine crawl links which ends
with on of theses file extensions - The link will be automatically filtered, since the crawling
operation is only performed on HTML pages.
filterEmailAddressFileExtensions - A list of file extensions that if the local part or the domain part
of the email address start or ends with any of them - The email address will automatically be marked
as invalid, since 'image00023.png@349789' is not really an email address.

filterLinkDomains.configuration.js:
globalFilterLinkDomains - A list of global domains that if located on any of the search engines source
will be automatically filtered, regardless the specific search engine that has been used to fetch the links.
filterLinkDomains - A list of search engines that for each has a specific domain list that if the search
engine is being used - The specific domains will be filtered for the specific search engine search,
not for all the search engines.

linksTestCases.configuration.js:
timeoutLinks - A list of real URLs that it is known that they will throw a timeout exception. Use for tests.

searchEngines.configuration.js:
searchEngineStatuses - A list of all the available search engines that do use URL query string parameters
to search, and can crawl with them. Once a search engine will be marked as active, it will randomize
(if more than 1 active) each process. Also, it will be validated if active in the crawl logic file.
searchEngines - In this array will be a full declaration of the search engines, and how to build for each
one of them a URL with search keys and pager.
Currently only Bing and Google have been tested. You can see the real tests for each one of them
in misc/search_engines.txt file.

searchKeys.configuration.js:
advanceSearchKeys - A list of all search keys with advance logic of randomize, to random a valid Hebrew
sentence for the search engines.
basicSearchKeys - A list of all static search keys sentences that will be used as random from each group.
You can switch between basic and advance by 'IS_ADVANCE_SEARCH_KEYS' - true/false in the settings.js file.

Services:
confirmation.service.js:
This service popups a confirmation message in the console with the important settings and
configurations before any crawling takes place. Active only in production mode.

crawlEmailAddress.service.js:
This service performs the crawling logic of all the email addresses from the source of an
HTML page by a given link, and returns all the email addresses back to the crawling main logic.

crawlLink.service:
This service perform the crawling logic of all the links from a search engine HTML source page by
a given built link, and return all the links to continue the logic to crawl from each one of them
all the email addresses by the crawlEmailAddress.service.

mongoDatabase.service:
This service controls on all the things related to the Mongo database, all CRUD operations,
test the Mongo database before start crawling, configure the connection, and so on.

domainsCounter.service.js:
This service contains all the logic of the domain counter script,
that counts the domains of all sources by specific file path, directory or Mongo database.

emailAddressesGenerator.service.js:
This service contains all the logic to generate random email addresses for the test cases tests.
It contains manually and NPM packages logic to create random local, domain, and full email
addresses to validate in the emailAddressValidation.service.

emailAddressValidation.service.js:
This service is the heart of the application. It gets an email address and validate if it's valid
or not, but not only that simple task, it also suggests a fix in case it recognizes that the email
address contains typo or invalid characters, or override the rules listed in misc/email_address_rules.txt.
It is being used on a regular basis on the crawling logic, and in almost all of the tests.

initiate.service.js:
This service takes place before any logic starts, and it appears in all the independent start
files (the root of the logic). It validates all the parameters in the settings/settings.js file
that the type of value that is expected is that expected to be. For example, in a boolean field
not inserted string or number.

log.service.js:
This service controls all the print and log all over the application. It main two uses are,
first, to keep logging the console status line as long as it is active, and the second propose is to
log the email addresses / links / all different data to appropriate TXT files during the
crawling operation. It also logs some of the different scripts and logics strings.

puppeteerService.js:
This service contains all the logic of the Puppeteer NPM package which takes a link and pulls
out it's HTML page source. This allows users to crawl the HTML source and search for links / email
addresses, and used both in crawlEmailAddress.service and incrawlLink.service. Also used in
linkCrawl.test.

search.service.js:
This service used in the crawl logic file and it's role is to generate search keys randomly
to place in the search engine query string to pull out links to crawl from the email addresses.
In each process during the application runtime, the search key will be randomized differently.

source.service.js:
This service is the cross roads to get the HTML sources of the pages. If it's development mode -
It pulls out random sources from the sources directory, and if it's production mode - It calls
the puppeteer service to fetch real data by a given link.

typosGenerator.service.js:
This service generates typos for the typos test, according to randomly common domains from the
common domains list, or by specific given domain name. It is used in the typos test cases.

uuidGenerator.service.js:
This service generates uuid for the emailAddressesGenerator.service, kind of local part randomly.

=====================
3. DIFFERENT SCRIPTS.
=====================
backup.script.js:
This script performs two kinds of backups. The first one is local backup, to the backups
directory, with the date of today and a running index. The second backup is a secondary backup,
to a different path. You can control which backup to perform (or both of them) in the settings.js
file. Can be run in the terminal: 'npm run backup'.

crawl.script.js:
This script is the main script of the application, it runs the crawling logic. Fetch links by building
dynamic links to search engines, and for each link - Crawl the email address and save them to the Mongo
database and log them to a TXT file.
Can be run in the terminal: 'npm start'.

delay.script.js:
This script cannot run by itself, and it's only goal is to delay between first npm i script to a second one.
This happen due to the preload script that, in the first run, gets error due to some invalid package used,
and need to perform a second npm i installation. The delay between them is a must, since without it, the
errors continue to appear.

domains.script.js:
This script activates the domainsCounter.service, which logs to TXT file a list of email addresses, domain part
and the count of each domain.
Can be run in the terminal: 'npm run domains'.

preload.script.js:
This
Can be run in the terminal: 'npm run preload'.

=========
4. TESTS.
=========
emailAddressGenerator.test.js:

emailAddressSandBox.test.js:

emailAddressTestCases.test.js:

emailAddressTypos.test.js:

freeStyle.test.js:

linkCrawl.test.js:

======================
5. IMPORTANT MESSAGES.
======================
1. Each time you change the logic / update NPM package version, do the following steps:
a. Perform a backup before any change has been made, by running in the terminal 'npm run backup'
   or manually to the backups directory.
b. After the change, check that everything works OK.
c. Keep the maintenance - Every change you do - Make sure to update in this document if needed.
d. Keep the backup update - Every change you do - Update in GitHub.
2. When switching from development mode to production mode using the 'IS_PRODUCTION_MODE' setting
   in the settings.js file - YOU MUST - run the preload script again to refresh the node_modules
   and the package.json again.
3. After new add of invalid email / valid email / new domain typos - Always remove
   duplicates by external online service.
4. The selected engine for production is Bing / Google. Test Bing for 100 times,
   to filter all irrelevant links.
5. Development mode off: with puppeteer.js test each search domain for his filtered
   links, and implement them, BEFORE starting to run the script.
6. When running on production - Use only one active search engine with large chances.
7. Successful running application on production should look like this:

/* cSpell:disable */
===IMPORTANT SETTINGS===
SEARCH ENGINES: bing, google
DATABASE: test_production
IS_PRODUCTION_MODE: true
IS_DROP_COLLECTION: false
IS_STATUS_MODE: false
IS_EMPTY_DIST_DIRECTORY: false
IS_RUN_DOMAINS_COUNTER: false
IS_LONG_RUN: true
IS_GIBBERISH_VALIDATION_ACTIVE: true
GOAL_TYPE: MINUTES
GOAL_VALUE: 700
SEARCH_KEY: null
IS_LINKS_METHOD_ACTIVE: true
IS_CRAWL_METHOD_ACTIVE: true
IS_SKIP_LOGIC: true
MAXIMUM_MINUTES_WITHOUT_UPDATE: 20
IS_LOG_VALID_EMAIL_ADDRESSES: true
IS_LOG_FIX_EMAIL_ADDRESSES: true
IS_LOG_INVALID_EMAIL_ADDRESSES: true
IS_LOG_UNSAVE_EMAIL_ADDRESSES: true
IS_LOG_GIBBERISH_EMAIL_ADDRESSES: true
IS_LOG_CRAWL_LINKS: true
IS_LOG_CRAWL_ERROR_LINKS: true
========================
OK to run? (y = yes)
y
===INITIATE THE SERVICES===
===[SETTINGS] Mode: PRODUCTION | Plan: STANDARD | Database: test_production | Drop: false | Long: true | Active Methods: LINKS,CRAWL===
===[GENERAL] Time: 00.00:00:12 [\] | Goal: MINUTES | Progress: 0/700 (00.00%) | Status: CRAWL | Restarts: 0===
===[PROCESS] Process: 1/10,000 | Page: 1/1 | Engine: Bing | Key: ל"אוד הננערב םיטקייורפ שיא שורד===
===[LINK] Crawl: ✅  13 | Total: 40 | Filter: 27 | Error: 0 | Error In A Row: 0 | Current: 2/13===
===[EMAIL ADDRESS] Save: ✅  0 | Total: 2 | Database: 15,915 | Exists: 1 | Invalid: ❌  0 | Valid Fix: 0 | Invalid Fix: 0 | Unsave: 0 | Filter: 0 | Skip: 0 | Gibberish: 0===
===[PAGE (2/13)] https://legit.co.il/jobs/job===
===[USER AGENT] Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2869.0 Safari/537.36===
===[SEARCH (1/1)] https://www.bing.com/search?q=דרוש+איש+פרוייקטים+ברעננה+דוא"ל&sp=-1&pq=&sc=0-0&qs=n&sk=&cvid=F6A9A51C2A884A459B4C65332D7506E5&firs===
===[TRENDING] ===
===[STATISTICS] Bing: 0 | Google: 0===
Terminate batch job (Y/N)? y

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverFlow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://il.linkedin.com/in/orassayag