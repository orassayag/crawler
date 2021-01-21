const { LogStatus, MicromatchAction, PartType, SaveStatus, TestType } = require('./files/emailAddress.enum');
const { Placeholder } = require('./files/placeholder.enum');
const { DomainsCounterSourceType } = require('./files/script.enum');
const { SearchEngineType, SearchKeyGender, SearchKeyType, SearchPlaceHolder, SourceType } = require('./files/search.enum');
const { GoalType, Method, Mode, Plan, ScriptType, Status } = require('./files/system.enum');
const { Color, ColorCode, StatusIcon } = require('./files/text.enum');

module.exports = {
    Color, ColorCode, DomainsCounterSourceType, GoalType, LogStatus, Method, MicromatchAction, Mode, PartType,
    Placeholder, Plan, SaveStatus, ScriptType, SearchEngineType, SearchKeyGender, SearchKeyType,
    SearchPlaceHolder, SourceType, Status, StatusIcon, TestType
};