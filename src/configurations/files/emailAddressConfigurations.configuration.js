/* cSpell:disable */
const invalidDomains = [
    'ingest.sentry.io',
    'sentry.indeed.com',
    'sentrylabs.indeed.com',
    'app.getsentry.com',
    'sentry.io',
    'sentry.issuu.com',
    '1000xbetslots.xyz',
    'group.calendar.google.com',
    'template.index',
    'template.product',
    'template.account.plans',
    'sentry.wixpress.com',
    'posting.google.com'
];

const removeAtCharectersList = [
    '@.',
    '@_'
];

// Don't change the order.
const removeStartKeysList = [
    'u00a0',
    'u002F',
    'u003e',
    'u003E',
    'u003'
];

module.exports = {
    invalidDomains, removeAtCharectersList, removeStartKeysList
};