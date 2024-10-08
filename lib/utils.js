/**
 * Converts a bulb level of range [0...254] to an adapter level of range [0...100]
 */
function bulbLevelToAdapterLevel(bulbLevel) {
    // Convert from bulb levels [0...254] to adapter levels [0...100]:
    // - Bulb level 0 is a forbidden value according to the ZigBee spec "ZigBee Cluster Library
    //   (for ZigBee 3.0) User Guide", but some bulbs (HUE) accept this value and interpret this
    //   value as "switch the bulb off".
    // - A bulb level of "1" is the "minimum possible level" which should mean "bulb off",
    //   but there are bulbs that do not switch off (they need "0", some IKEA bulbs are affected).
    // - No visible difference was seen between bulb level 1 and 2 on HUE LCT012 bulbs.
    //
    // Conclusion:
    // - We map adapter level "0" to the (forbidden) bulb level "0" that seems to switch all
    //   known bulbs.
    // - Bulb level "1" is not used, but if received nevertheless, it is converted to
    //   adapter level "0" (off).
    // - Bulb level range [2...254] is linearly mapped to adapter level range [1...100].
    if (bulbLevel >= 2) {
        // Perform linear mapping of range [2...254] to [1...100]
        return Math.round(((bulbLevel - 2) * 99) / 252) + 1;
    } else {
        // The bulb is considered off. Even a bulb level of "1" is considered as off.
        return 0;
    } // else
}

/**
 * Converts an adapter level of range [0...100] to a bulb level of range [0...254]
 */
function adapterLevelToBulbLevel(adapterLevel) {
    // Convert from adapter levels [0...100] to bulb levels [0...254].
    // This is the inverse of function bulbLevelToAdapterLevel().
    // Please read the comments there regarding the rules applied here for mapping the values.
    if (adapterLevel) {
        // Perform linear mapping of range [1...100] to [2...254]
        return Math.round(((adapterLevel - 1) * 252) / 99) + 2;
    } else {
        // Switch the bulb off. Some bulbs need "0" (IKEA), others "1" (HUE), and according to the
        // ZigBee docs "1" is the "minimum possible level"... we choose "0" here which seems to work.
        return 0;
    } // else
}

function bytesArrayToWordArray(ba) {
    const wa = [];
    for (let i = 0; i < ba.length; i++) {
        wa[(i / 2) | 0] |= ba[i] << (8 * (i % 2));
    }
    return wa;
}

// If the value is greater than 1000, kelvin is assumed.
// If smaller, it is assumed to be mired.
function toMired(t) {
    let miredValue = t;
    if (t > 1000) {
        miredValue = miredKelvinConversion(t);
    }
    return miredValue;
}

function miredKelvinConversion(t) {
    return Math.round(1000000 / t);
}

/**
 * Converts a decimal number to a hex string with zero-padding
 */
function decimalToHex(decimal, padding) {
    let hex = Number(decimal).toString(16);
    padding = typeof padding === 'undefined' || padding === null ? (padding = 2) : padding;

    while (hex.length < padding) {
        hex = `0${hex}`;
    }

    return hex;
}

function getZbId(adapterDevId) {
    const idx = adapterDevId.indexOf('group');
    if (idx > 0) return adapterDevId.substr(idx + 6);
    return '0x' + adapterDevId.split('.')[2];
}

function getAdId(adapter, id) {
    return adapter.namespace + '.' + id.split('.')[2]; // iobroker device id
}

function clearArray(array) {
    while (array.length > 0) {
        array.pop();
    }
}

function moveArray(source, target) {
    while (source.length > 0) {
        target.push(source.shift());
    }
}

function isObject(item) {
    return typeof item === 'object' && !Array.isArray(item) && item !== null;
}

function isJson(item) {
    let value = typeof item !== 'string' ? JSON.stringify(item) : item;
    try {
        value = JSON.parse(value);
    } catch (e) {
        return false;
    }

    return typeof value === 'object' && value !== null;
}

module.exports = {
    bulbLevelToAdapterLevel,
    adapterLevelToBulbLevel,
    bytesArrayToWordArray,
    toMired,
    miredKelvinConversion,
    decimalToHex,
    getZbId,
    getAdId,
    clearArray,
    moveArray,
    isObject,
    isJson,
};
