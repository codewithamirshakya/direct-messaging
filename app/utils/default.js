const config    = require('../config/default.js');

/**
 * 
 * @param {*} query 
 * @param {*} param 
 */
function queryParamValue(query, param) {
    var paramValue;
    var querySplit = query.split("&");
    querySplit.forEach(element => {
        var paramSplit = element.split("=");

        switch(paramSplit[0]) {
            case param:
                paramValue = paramSplit[1];
                break;
        }
    });

    return paramValue;
}

/**
 * 
 * @param {*} res 
 * @param {*} cb 
 * @param {*} err 
 * @description Helper function for reading a posted JSON body
 */
function readJson(res, cb, err) {
    let buffer;
    /* Register data cb */
    res.onData((ab, isLast) => {
      let chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]));
          } catch (e) {
            /* res.close calls onAborted */
            res.close();
            return;
          }
          cb(json);
        } else {
          try {
            json = JSON.parse(chunk);
          } catch (e) {
            /* res.close calls onAborted */
            res.close();
            return;
          }
          cb(json);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });
  
    /* Register error cb */
    res.onAborted(err);
}

/**
 * 
 * @param {*} prop 
 */
function sortByProp(prop) {  
  return function(a, b) {  
      if (a[prop] > b[prop]) {  
          return 1;  
      } else if (a[prop] < b[prop]) {  
          return -1;  
      }  
      return 0;  
  }  
}

/**
 * 
 * @param {*} channelId 
 * @returns 
 */
function pubSubKey(channelId) {
    return config.socket.prefix + channelId;  
}

/**
 * 
 * @param {*} date 
 * @returns 
 */
function dateToUnixTimeStamp(date) {
    return new Date(date).getTime() / 1000;
}

/**
 * 
 * @returns 
 */
function now()
{
    const timeElapsed = Date.now();
    const today       = new Date(timeElapsed);

    return today.toISOString().split('T')[0];
}

module.exports = {
    readJson,
    queryParamValue,
    sortByProp,
    pubSubKey,
    dateToUnixTimeStamp,
    now
};