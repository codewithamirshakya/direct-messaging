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

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 */

async function getDMSettings(connection, channelIds){
    return new Promise(function (resolve, reject) {
        try {
            var sql = mysql.format(
                `
                SELECT 
                allow_message_every_one,
                allow_message_subscriber,
                show_read_receipts,
                show_online_status,
                show_last_online

                FROM dm_settings 
                WHERE channel_id IN (?)
                `, 
                [channelIds.join()]
                );
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
                        resolve(results);
                    } else {
                        resolve();
                    }
                });
            });
        } catch(e) {
            resolve();
        }
    });

}

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 * @param {*} online
 * @param {*} lastOnline  
 */
async function updateOnlineDmSetting(connection, channelId, online) {
    return new Promise(function (resolve, reject) {
        try {
            var param = [ channelId, online, (new Date()), online, (new Date())];
            var query = `
            INSERT INTO dm_settings 
                (channel_id, online, last_online)
            VALUES
                (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                online = ?,
                last_online = ? 
            `;
            
            var sql = mysql.format(query, param);

            connection.getConnection((err, conn) => {
                if(err) {
                    console.log(err);
                }

                conn.query(sql, function (error, results) {
                    if (error) {
                        console.log(error);
                    }

                    conn.release();

                    if(typeof results !== "undefined") {
                        resolve(results.affectedRows);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            resolve();
        }
    });
}

module.exports = {
    get,
    getDMSettings,
    updateOnlineDmSetting
}