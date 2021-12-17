const fs        = require('fs');
const mime      = require('mime-types');
const config    = require('../config/default.js');
var mimeType;

/**
 * 
 * @param {*} filename 
 */
function readfile(filename) {
    var filepath    = 'public/' + filename;
    mimeType        = mime.lookup(filepath) || 'application/octet-stream';

    // Read file from file system.
    let file = fs.readFileSync(filepath, function(err, data) {});

    return file;
}

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

function pubSubKey(channelId)
{
    return config.exchange.messaging + "_" + channelId;  
}

module.exports = {
    mimeType,
    readfile,
    readJson,
    queryParamValue,
    sortByProp,
    pubSubKey
};