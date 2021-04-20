const fs = require('fs-extra');
const path = require('path');
const errorScript = require('./error.script');
require('../services/files/initiate.service').initiate('initiate');

(async () => {
    // Since the log-update NPM package doesn't have the option to change the number of columns dynamically, and the default value is 80,
    // in order to view the console status line in full view, there is a need to change the columns width from 80px to 220px.
    // This is a single operation that runs each time after the 'npm i' command in the terminal.
    const logUpdateIndexPath = path.join('node_modules/log-update/index.js');
    let logUpdate = await fs.readFile(logUpdateIndexPath, 'utf8');
    logUpdate = logUpdate.replace(/80/g, '220');
    await fs.writeFile(logUpdateIndexPath, logUpdate, 'utf8');
})().catch(e => errorScript.handleScriptError(e, 1));