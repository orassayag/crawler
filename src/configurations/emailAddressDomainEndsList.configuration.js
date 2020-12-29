/* cSpell:disable */
const { CommonEmailAddressDomainEnd, EmailAddressDomainEnd } = require('../core/models/application');
const { emailAddressUtils } = require('../utils');

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
    new EmailAddressDomainEnd({ domainEnd: 'co', domainEndGroupName: 'co', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({
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
    new EmailAddressDomainEnd({
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
    new EmailAddressDomainEnd({
        domainEnd: 'net',
        domainEndGroupName: 'net',
        isSingleWord: false,
        typosList: [
            '.met',
            '.netl',
            '.njet'
        ]
    }),
    new EmailAddressDomainEnd({
        domainEnd: 'net.il',
        domainEndGroupName: 'net',
        isSingleWord: false,
        typosList: [
            '.net.i',
            '.net.iil',
            '.net.l'
        ]
    }),
    new EmailAddressDomainEnd({ domainEnd: 'net.net', domainEndGroupName: 'net', isSingleWord: false, typosList: [] }),

    // Group: gov
    new EmailAddressDomainEnd({ domainEnd: 'gov', domainEndGroupName: 'gov', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({
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
    new EmailAddressDomainEnd({ domainEnd: 'gov.uk', domainEndGroupName: 'gov', isSingleWord: false, typosList: [] }),

    // Group: org
    new EmailAddressDomainEnd({ domainEnd: 'org', domainEndGroupName: 'org', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({
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
    new EmailAddressDomainEnd({ domainEnd: 'org.ps', domainEndGroupName: 'org', isSingleWord: false, typosList: [] }),

    // Group: muni
    new EmailAddressDomainEnd({ domainEnd: 'muni', domainEndGroupName: 'muni', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({
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
    new EmailAddressDomainEnd({ domainEnd: 'edu', domainEndGroupName: 'edu', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'edu.il', domainEndGroupName: 'edu', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'edu.ps', domainEndGroupName: 'edu', isSingleWord: false, typosList: [] }),

    // Singles
    new EmailAddressDomainEnd({
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
    new EmailAddressDomainEnd({ domainEnd: 'ai', domainEndGroupName: 'ai', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'at', domainEndGroupName: 'at', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'biz', domainEndGroupName: 'biz', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'br', domainEndGroupName: 'br', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'ch', domainEndGroupName: 'ch', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'cz', domainEndGroupName: 'cz', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'de', domainEndGroupName: 'de', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'email', domainEndGroupName: 'ai', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'es', domainEndGroupName: 'es', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'ey.com', domainEndGroupName: 'ey.com', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'fr', domainEndGroupName: 'fr', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'fund', domainEndGroupName: 'fund', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'hr', domainEndGroupName: 'hr', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'info', domainEndGroupName: 'info', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'io', domainEndGroupName: 'io', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({
        domainEnd: 'il',
        domainEndGroupName: 'il',
        isSingleWord: true,
        typosList: [
            '.ill',
            '.ilm',
            '.oil'
        ]
    }),
    new EmailAddressDomainEnd({ domainEnd: 'it', domainEndGroupName: 'it', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'ly', domainEndGroupName: 'ly', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'mail', domainEndGroupName: 'ai', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'mail.it', domainEndGroupName: 'ai', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'me', domainEndGroupName: 'm', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'my', domainEndGroupName: 'm', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'mil', domainEndGroupName: 'm', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'ps', domainEndGroupName: 'ps', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'ru', domainEndGroupName: 'ru', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'uk', domainEndGroupName: 'uk', isSingleWord: true, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'us', domainEndGroupName: 'us', isSingleWord: false, typosList: [] }),
    new EmailAddressDomainEnd({ domainEnd: 'usmc.mil', domainEndGroupName: 'us', isSingleWord: false, typosList: [] })
];

['com', 'co'].map(domainEnd =>
    emailAddressDomainEndsList = emailAddressDomainEndsList.concat(extraCultureEndsList.map(cultureKey => {
        return new EmailAddressDomainEnd({ domainEnd: `${domainEnd}.${cultureKey}`, domainEndGroupName: 'co', isSingleWord: false, typosList: [] });
    })));

const domainEndsList = emailAddressDomainEndsList.map(d => d.domainEnd);
const domainEndsDotsList = emailAddressDomainEndsList.map(d => `.${d.domainEnd}`);
const domainEndsHyphenList = emailAddressDomainEndsList.map(d => `-${d.domainEnd}`);
const domainEndsCommaList = emailAddressDomainEndsList.map(d => `,${d.domainEnd}`);
const validDomainEndsList = emailAddressUtils.getDomainEndsGroups(emailAddressDomainEndsList, 'domainEndGroupName');
const validOneWordDomainEndsList = emailAddressDomainEndsList.filter(domain => domain.isSingleWord).map(domain => domain.domainEnd);
const emailAddressEndFixTypos = emailAddressUtils.getDomainsFixTyposList(emailAddressDomainEndsList);
const commonDomainEndsList = [
    new CommonEmailAddressDomainEnd({ commonDomainEnd: '.com', isAllowDotAfter: true, excludeWords: ['community', 'company'] }),
    new CommonEmailAddressDomainEnd({ commonDomainEnd: '.co.il', isAllowDotAfter: false, excludeWords: null }),
    new CommonEmailAddressDomainEnd({ commonDomainEnd: '.org.il', isAllowDotAfter: false, excludeWords: null }),
    new CommonEmailAddressDomainEnd({ commonDomainEnd: '.ac.il', isAllowDotAfter: false, excludeWords: null })
];
const endsWithDotIgnore = emailAddressDomainEndsList.filter(d => d.typosList.length).map(t => t.typosList.find(e => e.endsWith('.'))).filter(t => t);
// Don't delete this array or change it to const, will auto filled dynamically.
let commonEmailAddressDomainsList = [];

module.exports = {
    domainEndsList, domainEndsDotsList, domainEndsHyphenList, domainEndsCommaList,
    validDomainEndsList, validOneWordDomainEndsList, emailAddressEndFixTypos, emailAddressDomainEndsList,
    commonDomainEndsList, endsWithDotIgnore, commonEmailAddressDomainsList
};