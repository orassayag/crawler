const fs = require('fs-extra');
const globalUtils = require('../../utils/files/global.utils');
const pathUtils = require('./path.utils');

class FileUtils {

    constructor() { }

    async read(targetPath) {
        return await fs.readFile(targetPath, 'utf-8');
    }

    async isPathExists(targetPath) {
        // Check if the path parameter was received.
        if (!targetPath) {
            throw new Error(`targetPath not received: ${targetPath} (1000030)`);
        }
        // Check if the path parameter exists.
        try {
            return await fs.stat(targetPath);
        }
        catch (error) {
            return false;
        }
    }

    // This method remove all files from a given target path.
    async emptyDirectory(targetPath) {
        // Verify that the path exists.
        globalUtils.isPathExistsError(targetPath);
        // Empty the directory.
        await fs.emptyDir(targetPath);
    }

    getAllDirectories(targetPath) {
        return fs.readdirSync(targetPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    }

    // This method return all the files in a given target path.
    async getDirectoryFiles(targetPath) {
        // Verify that the path exists.
        globalUtils.isPathExistsError(targetPath);
        // Get all the files.
        return await fs.readdir(targetPath);
    }

    async readFile(targetPath) {
        // Verify that the path exists.
        globalUtils.isPathExistsError(targetPath);
        // Return the file content.
        return await this.read(targetPath);
    }

    async createDirectory(targetPath) {
        if (!targetPath) {
            return;
        }
        if (!await this.isPathExists(targetPath)) {
            await fs.mkdir(targetPath, { recursive: true });
        }
    }

    async appendFile(data) {
        const { targetPath, message } = data;
        if (!targetPath) {
            throw new Error(`targetPath not found: ${targetPath} (1000031)`);
        }
        if (!message) {
            throw new Error(`message not found: ${message} (1000032)`);
        }
        if (!await this.isPathExists(targetPath)) {
            await fs.promises.mkdir(pathUtils.getDirName(targetPath), { recursive: true }).catch();
        }
        // Append the message to the file.
        await fs.appendFile(targetPath, message);
    }

    async removeFile(targetPath) {
        // Verify that the path exists.
        globalUtils.isPathExistsError(targetPath);
        // Remove the file.
        await fs.unlink(targetPath);
    }

    async removeFileIfExists(targetPath) {
        // Check if the file exists.
        if (await this.isPathExists(targetPath)) {
            // Remove it.
            await fs.unlink(targetPath);
        }
    }

    async getFilesRecursive(directory) {
        const dirents = await fs.readdir(directory, { withFileTypes: true });
        const files = await Promise.all(dirents.map(dirent => {
            const result = pathUtils.resolve(directory, dirent.name);
            return dirent.isDirectory() ? this.getFilesRecursive(result) : result;
        }));
        return Array.prototype.concat(...files);
    }

    async removeDirectoryIfExists(targetPath) {
        if (!await this.isPathExists(targetPath)) {
            await fs.remove(targetPath);
        }
    }

    async createDirectoryIfNotExists(targetPath) {
        if (!await this.isPathExists(targetPath)) {
            await fs.mkdir(targetPath);
        }
    }

    async copyDirectory(sourcePath, targetPath, filterFunction) {
        await fs.copy(sourcePath, targetPath, { filter: filterFunction });
    }

    isDirectoryPath(path) {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    }
}

module.exports = new FileUtils();