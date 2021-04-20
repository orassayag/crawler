class EnumUtils {

    constructor() { }

    // This method takes a map of elements and converts them to freeze objects (an enum-like object).
    createEnum(mapItems) {
        if (!mapItems || mapItems.length <= 0) {
            throw new Error(`No array received: ${mapItems} (1000000)`);
        }
        const mapList = new Map([...mapItems]);
        const symbolMap = {};
        mapList.forEach((value, key) => { symbolMap[key] = value; });
        return Object.freeze(symbolMap);
    }
}

module.exports = new EnumUtils();