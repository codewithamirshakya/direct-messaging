const config    = require('../config/default.js');

/**
 * 
 * @param {*} level 
 * @param {*} message 
 */
async function log(level, call, message) {
    var enabledLevel = config.log.level;

    if(enabledLevel == level || enabledLevel == 'ALL') {
        console.log(new Date().toISOString(), level, call, message);
    } else {
        switch(enabledLevel) {
            case 'LEVEL_1':
                if(level == 'DEBUG' || level == 'ERROR') {
                    console.log(new Date().toISOString(), level, call, message);
                }
                break;
                case 'LEVEL_2':
                    if(level == 'DEBUG' || level == 'ERROR' || level == 'INFO') {
                        console.log(new Date().toISOString(), level, call, message);
                    }
                    break;
                    case 'LEVEL_3':
                        console.log(new Date().toISOString(), level, call, message);
                        break;
        }
    }
}

module.exports = {
    log
}