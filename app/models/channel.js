var mysql       = require('mysql');
const DM_COLLECTION = 'channels';
/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function getFollowings(connection, userChannelId, q) {
    return new Promise(function (resolve, reject) {
        try {
            var params  = [parseInt(userChannelId)];
            var query   = `SELECT c.id, c.name, c.avatar, account_type, last_live, online 
                from followers f 
                inner join channels c on c.id = f.channel_id 
                inner join users u on u.id = c.user_id `;

            query += `WHERE follower_id = ? `;    

            if(typeof q !== 'undefined' && q != '') {
                query += ` AND c.name LIKE ? `;
                params.push('%'+q+'%');
            }   

            query += 
            `AND u.deactivate = false 
            AND u.banned = false 
            AND u.deleted_at IS NULL 
            AND c.deleted_at IS NULL 
            order by online, last_live desc 
            LIMIT 10
            `;

            var sql = mysql.format(query, 
                params
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
            console.log(e);
            resolve();
        }
    });
}

async function isFollowing(connection, userChannelId, channelId) {
    return new Promise(function (resolve, reject) {
        try {
            params = [userChannelId, channelId];
            var query = `SELECT * FROM followers where channel_id = ? and follower_id = ? LIMIT 1 `;  

            var sql = mysql.format(query, 
                params
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
    getFollowings,
    getChannel,
    isFollowing
}