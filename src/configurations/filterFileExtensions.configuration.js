/* cSpell:disable */
const filterLinkFileExtensions = [
	// ===IMAGES=== //
	'.ai',
	'.bmp',
	'.fav',
	'.gif',
	'.ico',
	'.jpeg',
	'.jpg',
	'.png',
	'.ps',
	'.psd',
	'.svg',
	'.tif',
	'.tiff',
	// ===DOCUMNETS=== //
	'.doc',
	'.docx',
	'.log',
	'.ods',
	'.odt',
	'.pdf',
	'.ppt',
	'.pptx',
	'.txt',
	'.xls',
	'.xlsx',
	// ===WEB=== //
	'.css',
	'.js',
	'.jsp',
	'.less',
	'.scss'
];

const filterEmailAddressFileExtensions = [
	...filterLinkFileExtensions,
	// ===WEB=== //
	'.html',
	'.webp'
];

module.exports = { filterLinkFileExtensions, filterEmailAddressFileExtensions };