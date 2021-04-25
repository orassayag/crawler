const { DomainsCounterSourceTypeEnum } = require('../core/enums');
const { domainsCounterService } = require('../services');
const { pathUtils } = require('../utils');

class DomainsLogic {

	constructor() { }

	async run() {
		const sourceType = DomainsCounterSourceTypeEnum.FILE; // Options: FILE / DIRECTORY / DATABASE.
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