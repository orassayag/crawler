const { pathUtils } = require('../utils');
const { domainsCounterService } = require('../services');
const { DomainsCounterSourceType } = require('../core/enums');

class DomainsLogic {

	constructor() { }

	async run() {
		const sourceType = DomainsCounterSourceType.FILE; // FILE / DIRECTORY / DATABASE.
		const sourcePath = pathUtils.getJoinPath({
			targetPath: __dirname,
			targetName: ''
		});
		await domainsCounterService.run({
			sourceType: sourceType,
			sourcePath: sourcePath,
			isLogs: true,
			isPartOfCrawLogic: false
		});
	}
}

module.exports = DomainsLogic;