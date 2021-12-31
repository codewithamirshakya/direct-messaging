var mysql           = require('mysql');
const DM_COLLECTION = 'channels';

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function getFollowers(connection, userChannelId, q, limit, offset) {
    return new Promise(function (resolve, reject) {
        try {
            var params  = [parseInt(userChannelId)];
            var query   = `
            SELECT c.id, c.name, c.avatar, account_type, ds.online, ds.last_online, 
                allow_message_every_one,
                allow_message_subscriber,
                show_read_receipts,
                show_online_status,
                show_last_online 
  
                from followers f 
                inner join channels c on c.id = f.follower_id 
                inner join dm_settings ds ON ds.channel_id = c.id
                inner join users u on u.id = c.user_id `;

            query += `WHERE f.channel_id = ? `;    

            if(typeof q !== 'undefined' && q != '' && q.length > 0) {
                query += ` AND c.name LIKE ? `;
                params.push('%'+q+'%');
            }

            query += 
            `
            AND u.deactivate = false 
            AND u.banned = false 
            AND u.deleted_at IS NULL 
            AND c.deleted_at IS NULL 
            order by ds.online desc, last_online desc 
            LIMIT ? OFFSET ? 
            `;

            params.push(limit); 
            params.push(offset);

            var sql = mysql.format(query, params);
                
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
            console.log(e);
            resolve();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} userChannelId 
 * @param {*} channelId 
 * @returns 
 */
async function isFollower(connection, userChannelId, channelId) {
    return new Promise(function (resolve, reject) {
        try {
            var params  = [parseInt(userChannelId), parseInt(channelId)];
            var query   = `SELECT * FROM followers where channel_id = ? and follower_id = ? LIMIT 1 `;  
            var sql     = mysql.format(query, params);
                
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
                    } 
                    
                    reject();
                });
            });
        } catch(e) {

        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 */
async function getChannel(connection, channelId) {
    return new Promise(function (resolve, reject) {
        try {
            connection
                .collection(DM_COLLECTION)
                .findOne({channel_id: channelId})
                .then(function(result) {
                    resolve(result);
                });
        } catch(e) {
            reject(e);
        }
        
    });
}

module.exports = {
    getFollowers,
    getChannel,
    isFollower
}