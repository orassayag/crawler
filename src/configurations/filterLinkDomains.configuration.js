/* cSpell:disable */
const { FilterLinkDomain } = require('../core/models/application');
const { SearchEngineType } = require('../core/enums');

const filterLinkDomains = [
	// Ask.com
	new FilterLinkDomain({
		name: SearchEngineType.ASK,
		domains: [
		]
	}),

	// Baidu.com
	new FilterLinkDomain({
		name: SearchEngineType.BAIDU,
		domains: [
			'baiducontent.com',
			'bdstatic.com'
		]
	}),

	// Bing.com
	new FilterLinkDomain({
		name: SearchEngineType.BING,
		domains: [
			'bing.com',
			'business.bing.com',
			'cc.bingj.com',
			'chrome.google.com',
			'go.microsoft.com',
			'login.live.com',
			'login.microsoftonline.com',
			'microsofttranslator.com',
			'storage.live.com'
		]
	}),

	// Dogpile.com
	new FilterLinkDomain({
		name: SearchEngineType.DOGPILE,
		domains: [
		]
	}),

	// Ecosia.com
	new FilterLinkDomain({
		name: SearchEngineType.ECOSIA,
		domains: [
		]
	}),

	// Exalead.com
	new FilterLinkDomain({
		name: SearchEngineType.EXALEAD,
		domains: [
		]
	}),

	// Google.com
	new FilterLinkDomain({
		name: SearchEngineType.GOOGLE,
		domains: [
			'google.co.il',
			'googleadservices.com',
			'gstatic.com',
			'webcache.googleusercontent.com'
		]
	}),

	// Info.com
	new FilterLinkDomain({
		name: SearchEngineType.INFO,
		domains: [
		]
	}),

	// InfoSpace.com
	new FilterLinkDomain({
		name: SearchEngineType.INFOSPACE,
		domains: [
		]
	}),

	// MetaCrawler.com
	new FilterLinkDomain({
		name: SearchEngineType.METACRAWLER,
		domains: [
		]
	}),

	// Naver.com
	new FilterLinkDomain({
		name: SearchEngineType.NAVER,
		domains: [
		]
	}),

	// StartPage.com
	new FilterLinkDomain({
		name: SearchEngineType.STARTPAGE,
		domains: [
		]
	}),

	// Yandex.com
	new FilterLinkDomain({
		name: SearchEngineType.YANDEX,
		domains: [
		]
	})
];

const globalFilterLinkDomains = [
	'calameo.com',
	'doresh-tzion.co.il',
	'g-t.org.il',
	'hof-hasharon.co.il',
	'hotjob.co.il',
	'l-b.connvisor.com',
	'leumi.co.il',
	'lh3.googleusercontent.com',
	'makingmoneyfromeverything.com',
	'pills-xxl-24.eu',
	'rgc.co.il',
	'runner.co.il',
	'schema.org',
	'schemas.live.com',
	'w3.org',
	'wapforum.org',
	'sentrylabs.indeed.com',
	'app.getsentry.com'
];

module.exports = { filterLinkDomains, globalFilterLinkDomains };