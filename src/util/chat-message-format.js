const ptc = {
    CTRL: {
        str: 'CTRL',
        code: 0x0
    },
    TXT: {
        str: 'TXT',
        code: 0x1
    }, 
    GEO: {
        str: 'GEO',
        code: 0x2
    }
}

exports.ptc = ptc;

/**
 * @param {number} code 
 * @returns {string}
 */
exports.ptcCodeToStr = (code) => {
    for (let k in ptc) {
        if (code == ptc[k]['code']) {
            return ptc[k]['str'];
        }
    }

    return '';
}

/**
 * @param {string} str 
 * @returns {number}
 */
exports.ptcStrToCode = (str) => {
    for (let k in ptc) {
        if (str == ptc[k]['str']) {
            return ptc[k]['code'];
        }
    }

    return -1;
}

const secondsRightNow = () => {
    return Math.floor(Date.now() / 1000);
}

/**
 * 
 * @param {string} participantId 
 * @param {string} command 
 * @param {number} [time] - epoch time of message in seconds 
 */
exports.createControlMessage = (participantId, command, time) => {
    return `${ptc.CTRL.code},${participantId},${time||secondsRightNow()},${command}`;
}
/**
 * @param {string} participantId 
 * @param {string} message 
 * @param {number} [time] - epoch time of message in seconds 
 */
exports.createTextualMessage = (participantId, message, time) => {
    return `${ptc.TXT.code},${participantId},${time||secondsRightNow()},${message}`;
}
/**
 * @param {string} participantId 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} [time] - epoch time of message in seconds 
 */
exports.createGeoMessage = (participantId, latitude, longitude, time) => {
    return `${ptc.GEO.code},${participantId},${time||secondsRightNow()},${latitude},${longitude}`;
}


/**
 * Parses a CSV-style message string into a message object.
 * @param {string} message - message string
 * @returns {Object} corresponding message object
 * @throws Parsing errors
 */
exports.parseMessage = (message) => {
    const splitMessage = message.split(',');

    const m_ptc = parseInt(splitMessage[0]);
    const id = splitMessage[1];
    const time = splitMessage[2];

    const out = {
        p: id,
    };

    out.type = exports.ptcCodeToStr(m_ptc);

    if (time != '') {
        out.time = parseInt(time);
    } else {
        out.time = 0;
    }

    if (m_ptc == ptc.GEO.code) {

        if (splitMessage.length != 5) 
            throw Error(`invalid number of arguments for GEO message! (expected 5, saw ${splitMessage.length})`);

        const ll = {
            lat: parseFloat(splitMessage[3]),
            lng: parseFloat(splitMessage[4])
        }

        out.body = ll;
    } else {
        out.body = splitMessage.slice(3).join(',');
    }

    return out;
}
