var mysql       = require('mysql');

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function get(connection, channelId) {
    return new Promise(function (resolve, reject) {
        try {
            var sql = mysql.format('SELECT cs.*, c.name, c.avatar, c.enable_tip, c.minimum_tip, multistream, left(account_type, 1) as account_type, if(r.name = "chat", true, false) as admin from chat_settings cs inner join channels c on c.id = cs.channel_id left join model_has_roles mr on mr.model_id = c.id left join roles r on r.id = mr.role_id WHERE channel_id = ? order by admin desc', [channelId]);
            connection.getConnection((err, conn) => {
                if(err) {
                    console.log(err);
                }

                conn.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }

                    conn.release();

                    if(typeof results !== "undefined") {
                        resolve(results[0]);
                    } else {
                        resolve();
                    }
                });
            });
        } catch(e) {
            console.log(e);
            resolve();
        }
    });
}

async function getDMSettings(connection, channelIds){
    return new Promise(function (resolve, reject) {
        try {
            connection
                .collection('channels')
                .find({
                    channel_id: {
                        $in: channelIds
                    }
                })
                .toArray(function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    
                    resolve(result);
                });
        } catch(e) {
            reject(e);
        }
        
    });

}

module.exports = {
    get,
    getDMSettings
}