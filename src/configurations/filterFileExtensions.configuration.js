/* cSpell:disable */
const filterLinkFileExtensions = [
	// ===IMAGE=== //
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
	// ===DOCUMNET=== //
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