const util          = require('../config/default.js');

const DM_COLLECTION = 'dm';

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @returns 
 */
async function save(connection, params) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION).insertOne(params, function(err, res) {
                if (err) {
                    console.log(err);
                }
                
                resolve();
            });
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
async function history(connection, initialJSON, inputJSON) {

    params = {
        $or: [{
            c: inputJSON.channelId,
            u: initialJSON.userChannelId.toString()
        }, {
            u: initialJSON.userChannelId.toString(),
            c: inputJSON.channelId
        }]
    };

    limit = inputJSON.page * util.chat.limit;
    skip = (inputJSON.page - 1) * limit;     

    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION).find(params).sort({_id: -1}).skip(skip).limit(limit).toArray(function(err, result) {
                if (err) throw err;
                resolve(result);
            });
        } catch(e) {
            resolve();
        }
    });
}

module.exports = {
    save,
    history
}