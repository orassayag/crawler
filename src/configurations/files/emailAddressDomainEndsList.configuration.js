/* cSpell:disable */
const { CommonEmailAddressDomainEndModel, EmailAddressDomainEndModel } = require('../../core/models/application');
const { emailAddressUtils } = require('../../utils');

const extraCultureEndsList = [
    'ae', 'al', 'ar', 'au', 'ay', 'az', 'ba', 'bb', 'bd', 'bh',
    'bn', 'bo', 'br', 'bs', 'ch', 'cm', 'cn', 'co', 'cu', 'cy',
    'de', 'do', 'dr', 'dz', 'ec', 'eg', 'es', 'et', 'fj', 'fr',
    'ge', 'gh', 'gr', 'gt', 'hk', 'hn', 'hp', 'hr', 'id', 'ie',
    'in', 'it', 'jo', 'jp', 'kh', 'ki', 'kw', 'kz', 'lb', 'ly',
    'mk', 'mm', 'mo', 'mt', 'mv', 'mx', 'my', 'na', 'ng', 'ni',
    'no', 'np', 'nz', 'oh', 'om', 'pa', 'pc', 'pe', 'pg', 'ph',
    'pk', 'pl', 'ps', 'pt', 'py', 'qa', 'ro', 'ru', 'sa', 'sg',
    'sv', 'sy', 'tn', 'tr', 'tt', 'tv', 'tw', 'ua', 'uk', 'ul',
    'uy', 've', 'vn'
];

let emailAddressDomainEndsList = [
    // Group: co
    new EmailAddressDomainEndModel({ domainEnd: 'co', domainEndGroupName: 'co', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({
        domainEnd: 'co.il',
        domainEndGroupName: 'co',
        isSingleWord: false,
        typosList: [
            '.c.coo..iill',
            '.c.coo.iill',
            '.co.i.l',
            '.c.il',
            '.c.ill',
            '.c.l',
            '.oil.',
            '.c.oil',
            '.co',
            '.co.',
            '.ci.il',
            '.co.ail',
            '.co.cil',
            '.co.dil',
            '.ov.il',
            '.co.i',
            '.co.iil',
            '.co.il1',
            '.co.il.il',
            '.co.il.l',
            '.co.ili',
            '.co.ill',
            '.co.io',
            '.co.iol',
            '.co.kil',
            '.co.l',
            '.co.lil',
            '.co.oil',
            '.co.ol',
            '.co.olil',
            '.co.uil',
            '.coil',
            '.com.il',
            '.comil',
            'com.il'
        ]
    }),
    new EmailAddressDomainEndModel({
        domainEnd: 'com',
        domainEndGroupName: 'co',
        isSingleWord: true,
        typosList: [
            '.bcom',
            '.cmo',
            '.co.ilcom',
            '.coim',
            '.colm',
            '.com2',
            '.com,',
            '.comcom',
            '.comj',
            '.comm',
            '.comn',
            '.conm',
            '.coom',
            '.copm',
            '.cpm',
            '.ocm',
            '.om',
            '.vom',
            '.xom',
            'con'
        ]
    }),

    // Group: net
    new EmailAddressDomainEndModel({
        domainEnd: 'net',
        domainEndGroupName: 'net',
        isSingleWord: false,
        typosList: [
            '.met',
            '.netl',
            '.njet'
        ]
    }),
    new EmailAddressDomainEndModel({
        domainEnd: 'net.il',
        domainEndGroupName: 'net',
        isSingleWord: false,
        typosList: [
            '.net.i',
            '.net.iil',
            '.net.l'
        ]
    }),
    new EmailAddressDomainEndModel({ domainEnd: 'net.net', domainEndGroupName: 'net', isSingleWord: false, typosList: [] }),

    // Group: gov
    new EmailAddressDomainEndModel({ domainEnd: 'gov', domainEndGroupName: 'gov', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({
        domainEnd: 'gov.il',
        domainEndGroupName: 'gov',
        isSingleWord: false,
        typosList: [
            '.go.l',
            '.go.vil',
            '.gov.i',
            '.gov.io',
            '.govil',
            '.gov-il',
            '.gov_.il'
        ]
    }),
    new EmailAddressDomainEndModel({ domainEnd: 'gov.uk', domainEndGroupName: 'gov', isSingleWord: false, typosList: [] }),

    // Group: org
    new EmailAddressDomainEndModel({ domainEnd: 'org', domainEndGroupName: 'org', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({
        domainEnd: 'org.il',
        domainEndGroupName: 'org',
        isSingleWord: false,
        typosList: [
            '.org.i1',
            '.or.gil',
            '.or.l',
            '.org.i',
            '.oirg.il',
            '.org.ill',
            '.org.io',
            '.org.iol',
            '.org.l',
            '.otg.il',
            '.org.oil',
            'org.i',
            '.orgl',
            '.il.org'
        ]
    }),
    new EmailAddressDomainEndModel({ domainEnd: 'org.ps', domainEndGroupName: 'org', isSingleWord: false, typosList: [] }),

    // Group: muni
    new EmailAddressDomainEndModel({ domainEnd: 'muni', domainEndGroupName: 'muni', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({
        domainEnd: 'muni.il',
        domainEndGroupName: 'muni',
        isSingleWord: false,
        typosList: [
            '.ni.il',
            '.muni.i',
            '.muni.l',
            '.muni.io',
            '.muni.iol'
        ]
    }),

    // Group: edu
    new EmailAddressDomainEndModel({ domainEnd: 'edu', domainEndGroupName: 'edu', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'edu.il', domainEndGroupName: 'edu', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'edu.ps', domainEndGroupName: 'edu', isSingleWord: false, typosList: [] }),

    // Singles.
    new EmailAddressDomainEndModel({
        domainEnd: 'ac.il',
        domainEndGroupName: 'ac.il',
        isSingleWord: false,
        typosList: [
            '.a.cil',
            '.a.l',
            '.ac.ail',
            '.ac.i',
            '.ac.io',
            '.ac.iol',
            '.ac.l',
            '.acil',
            '.agil',
            '.ax.cil'
        ]
    }),
    new EmailAddressDomainEndModel({ domainEnd: 'ai', domainEndGroupName: 'ai', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'at', domainEndGroupName: 'at', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'biz', domainEndGroupName: 'biz', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'br', domainEndGroupName: 'br', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'ch', domainEndGroupName: 'ch', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'cz', domainEndGroupName: 'cz', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'de', domainEndGroupName: 'de', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'email', domainEndGroupName: 'ai', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'es', domainEndGroupName: 'es', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'ey.com', domainEndGroupName: 'ey.com', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'fr', domainEndGroupName: 'fr', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'fund', domainEndGroupName: 'fund', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'hr', domainEndGroupName: 'hr', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'info', domainEndGroupName: 'info', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'io', domainEndGroupName: 'io', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({
        domainEnd: 'il',
        domainEndGroupName: 'il',
        isSingleWord: true,
        typosList: [
            '.ill',
            '.ilm',
            '.oil'
        ]
    }),
    new EmailAddressDomainEndModel({ domainEnd: 'it', domainEndGroupName: 'it', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'ly', domainEndGroupName: 'ly', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'mail', domainEndGroupName: 'ai', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'mail.it', domainEndGroupName: 'ai', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'me', domainEndGroupName: 'm', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'my', domainEndGroupName: 'm', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'mil', domainEndGroupName: 'm', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'ps', domainEndGroupName: 'ps', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'ru', domainEndGroupName: 'ru', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'uk', domainEndGroupName: 'uk', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'us', domainEndGroupName: 'us', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEndModel({ domainEnd: 'usmc.mil', domainEndGroupName: 'us', isSingleWord: false, typosList: [] })
];
['com', 'co'].map(domainEnd =>
    emailAddressDomainEndsList = emailAddressDomainEndsList.concat(extraCultureEndsList.map(cultureKey => {
        return new EmailAddressDomainEndModel({ domainEnd: `${domainEnd}.${cultureKey}`, domainEndGroupName: 'co', isSingleWord: false, typosList: [] });
    })));

const domainEndsList = emailAddressDomainEndsList.map(d => d.domainEnd);
const domainEndsDotsList = emailAddressDomainEndsList.map(d => `.${d.domainEnd}`);
const domainEndsHyphenList = emailAddressDomainEndsList.map(d => `-${d.domainEnd}`);
const domainEndsCommaList = emailAddressDomainEndsList.map(d => `,${d.domainEnd}`);
const validDomainEndsList = emailAddressUtils.getDomainEndsGroups(emailAddressDomainEndsList, 'domainEndGroupName');
const validOneWordDomainEndsList = emailAddressDomainEndsList.filter(domain => domain.isSingleWord).map(domain => domain.domainEnd);
const emailAddressEndFixTypos = emailAddressUtils.getDomainsFixTyposList(emailAddressDomainEndsList);
const commonDomainEndsList = [
    new CommonEmailAddressDomainEndModel({ commonDomainEnd: '.com', isAllowDotAfter: true, excludeWords: ['community', 'company'] }),
    new CommonEmailAddressDomainEndModel({ commonDomainEnd: '.co.il', isAllowDotAfter: false, excludeWords: null }),
    new CommonEmailAddressDomainEndModel({ commonDomainEnd: '.org.il', isAllowDotAfter: false, excludeWords: null }),
    new CommonEmailAddressDomainEndModel({ commonDomainEnd: '.ac.il', isAllowDotAfter: false, excludeWords: null })
];
const endsWithDotIgnore = emailAddressDomainEndsList.filter(d => d.typosList.length).map(t => t.typosList.find(e => e.endsWith('.'))).filter(t => t);
// Don't delete this array or change it to const, will auto filled dynamically.
let commonEmailAddressDomainsList = [];

module.exports = {
    commonDomainEndsList, commonEmailAddressDomainsList, domainEndsCommaList, domainEndsDotsList, domainEndsHyphenList,
    domainEndsList, emailAddressDomainEndsList, emailAddressEndFixTypos, endsWithDotIgnore, validDomainEndsList,
    validOneWordDomainEndsList
};