const DM_COLLECTION = 'conversation';

async function save(connection, params, query, options) {
    return new Promise(function (resolve, reject) {
        try {
            const result = connection.collection(DM_COLLECTION).updateOne(query, params, options);
            resolve();
        } catch(e) {
            resolve();
        }
    });
}

async function exist(connection, query) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION).findOne(query,function(err, result) {
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

module.exports = {
    save,
    exist
}