class ErrorScript {

    constructor() { }

    handleScriptError(error, code) {
        console.log(error);
        process.exit(code);
    }
}

module.exports = new ErrorScript();