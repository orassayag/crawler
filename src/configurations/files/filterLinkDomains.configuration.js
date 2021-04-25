/* cSpell:disable */
const { FilterLinkDomainModel } = require('../../core/models/application');
const { SearchEngineTypeEnum } = require('../../core/enums');

const filterLinkDomains = [
	// Ask.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.ASK,
		domains: [
		]
	}),

	// Baidu.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.BAIDU,
		domains: [
			'baiducontent.com',
			'bdstatic.com'
		]
	}),

	// Bing.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.BING,
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
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.DOGPILE,
		domains: [
		]
	}),

	// Ecosia.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.ECOSIA,
		domains: [
		]
	}),

	// Exalead.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.EXALEAD,
		domains: [
		]
	}),

	// Google.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.GOOGLE,
		domains: [
			'google.co.il',
			'googleadservices.com',
			'gstatic.com',
			'webcache.googleusercontent.com'
		]
	}),

	// Info.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.INFO,
		domains: [
		]
	}),

	// InfoSpace.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.INFOSPACE,
		domains: [
		]
	}),

	// MetaCrawler.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.METACRAWLER,
		domains: [
		]
	}),

	// Naver.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.NAVER,
		domains: [
		]
	}),

	// StartPage.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.STARTPAGE,
		domains: [
		]
	}),

	// Yandex.com
	new FilterLinkDomainModel({
		name: SearchEngineTypeEnum.YANDEX,
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