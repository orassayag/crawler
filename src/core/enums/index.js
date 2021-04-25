const { LogStatusEnum, MicromatchActionEnum, PartTypeEnum, SaveStatusEnum, TestTypeEnum } = require('./files/emailAddress.enum');
const { PlaceholderEnum } = require('./files/placeholder.enum');
const { DomainsCounterSourceTypeEnum } = require('./files/script.enum');
const { SearchEngineTypeEnum, SearchKeyGenderEnum, SearchKeyTypeEnum, SearchPlaceHolderEnum, SourceTypeEnum } = require('./files/search.enum');
const { GoalTypeEnum, MethodEnum, ModeEnum, PlanEnum, ScriptTypeEnum, StatusEnum } = require('./files/system.enum');
const { ColorEnum, ColorCodeEnum, StatusIconEnum } = require('./files/text.enum');

module.exports = {
    ColorEnum, ColorCodeEnum, DomainsCounterSourceTypeEnum, GoalTypeEnum, LogStatusEnum, MethodEnum,
    MicromatchActionEnum, ModeEnum, PartTypeEnum, PlaceholderEnum, PlanEnum, SaveStatusEnum,
    ScriptTypeEnum, SearchEngineTypeEnum, SearchKeyGenderEnum, SearchKeyTypeEnum,
    SearchPlaceHolderEnum, SourceTypeEnum, StatusEnum, StatusIconEnum, TestTypeEnum
};