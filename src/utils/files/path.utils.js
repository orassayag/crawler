const path = require('path');
const textUtils = require('./text.utils');

class PathUtils {

    constructor() { }

    // This method validates if a given file is in a given extension.
    isTypeFile(data) {
        const { fileName, fileExtension } = data;
        // Check if the fileName parameter was received.
        if (!fileName) {
            throw new Error(`fileName not received: ${fileName} (1000038)`);
        }
        // Check if the fileExtension parameter was received.
        if (!fileExtension) {
            throw new Error(`fileExtension not received: ${fileExtension} (1000039)`);
        }
        const extension = path.extname(fileName);
        // Check if the extension parameter was received.
        if (!extension) {
            throw new Error(`extension not received: ${extension} (1000040)`);
        }
        return textUtils.toLowerCase(extension) === textUtils.addStartDot(textUtils.toLowerCase(fileExtension));
    }

    getJoinPath(data) {
        const { targetPath, targetName } = data;
        // Check if the targetPath parameter was received.
        if (!targetPath) {
            throw new Error(`targetPath not received: ${targetPath} (1000041)`);
        }
        // Check if the fileName parameter was received.
        if (!targetName) {
            throw new Error(`targetName not received: ${targetName} (1000042)`);
        }
        return path.join(targetPath, targetName);
    }

    resolve(directory, direntName) {
        return path.resolve(directory, direntName);
    }

    getBasename(source) {
        return path.basename(source);
    }

    getDirName(targetPath) {
        return path.dirname(targetPath);
    }
}

module.exports = new PathUtils();