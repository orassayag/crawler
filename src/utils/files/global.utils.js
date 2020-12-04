const fs = require('fs');
const path = require('path');

class GlobalUtils {

    constructor() { }

    sleep(millisecondsCount) {
        if (!millisecondsCount) {
            return;
        }
        return new Promise(resolve => setTimeout(resolve, millisecondsCount)).catch();
    }

    // This method check if a receive target path is exist.
    isPathExistsError(targetPath) {
        // Check if the path parameter was received.
        if (!targetPath) {
            throw new Error(`targetPath not received: ${targetPath} (1000028)`);
        }
        // Check if the path parameter exists.
        if (!fs.existsSync(targetPath)) {
            throw new Error(`targetPath not exists: ${targetPath} (1000029)`);
        }
    }

    // This method check if a receive target path is accessible.
    isPathAccessible(targetPath) {
        // Verify that the path exists.
        this.isPathExistsError(targetPath);
        // Check if the path is readable.
        const errorRead = fs.accessSync(targetPath, fs.constants.R_OK);
        if (errorRead) {
            throw new Error(`targetPath not readable: ${targetPath} (1000030)`);
        }
        // Check if the path is writable.
        const errorWrite = fs.accessSync(targetPath, fs.constants.W_OK);
        if (errorWrite) {
            throw new Error(`targetPath not writable: ${targetPath} (1000031)`);
        }
    }

    deleteDirectoryRecursive(directoryPath) {
        if (fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach(file => {
                const curPath = path.join(directoryPath, file);
                if (fs.lstatSync(curPath).isDirectory()) { // Recursive.
                    this.deleteDirectoryRecursive(curPath);
                } else { // Delete file.
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directoryPath);
        }
    }

    updateFile(targetPath, file) {
        fs.writeFileSync(targetPath, JSON.stringify(file, null, 2));
    }

    deleteFile(targetPath) {
        fs.unlinkSync(targetPath);
    }

    createDirectory(targetPath) {
        if (!targetPath) {
            return;
        }
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
    }
}
module.exports = new GlobalUtils();