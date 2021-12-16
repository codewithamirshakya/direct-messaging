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

module.exports = {
    save
}