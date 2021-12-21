const config        = require('../config/default.js');

const DM_COLLECTION = 'counters';

/**
 * 
 * @param {*} connection 
 * @param {*} q 
 * @returns 
 */
async function getLatestCounterByType(connection, q) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .findOne(q,function(err, result) {
                            if (err) {
                                resolve(err);
                            } else {
                                resolve(result);
                            }                           
                            
                        });
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} q 
 * @param {*} params
 * @returns 
 */

async function updateLatestCounterByType(connection, q, params) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .updateOne(q, params, function(err, res) {
                            if (err) {
                                console.log(err);
                            };
                            resolve(res);
                        })
                        
        } catch(e) {
            resolve();
        }
    });
}

module.exports = {
    getLatestCounterByType,
    updateLatestCounterByType
}