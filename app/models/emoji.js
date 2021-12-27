var mysql       = require('mysql');

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function get(connection, channelId) {
    return new Promise(function (resolve, reject) {
        try {
            var sql = mysql.format('SELECT * from emojis WHERE deleted_at is null and channel_id = ?', [channelId]);
            connection.getConnection((err, conn) => {
                if(err) {
                    console.log(err);
                }
                
                conn.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }

                    conn.release();

                    resolve(results);
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
 * @param {*} alias 
 * @returns 
 */
 async function getEmojiByCode(connection, channelName, alias) {
    return new Promise(function (resolve, reject) {
        try {
            var sql = mysql.format('select e.* from emojis e inner join channels c on c.id = e.channel_id where c.name = ? and e.alias = ? and e.deleted_at is null', [channelName, alias]);
            connection.getConnection((err, conn) => {
                if(err) {
                    console.log(err);
                }

                conn.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }

                    conn.release();

                    if(typeof results !== "undefined" && results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve();
                    }
                });
            });
        } catch(e) {
            reject();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 * @param {*} subscriberId 
 */
 async function isSubscriber(connection, channelId, subscriberId) {
    return new Promise(function (resolve, reject) {
        try {
            var sql = mysql.format('select * from subscribers where channel_id = ? and subscriber_id = ? and deleted_at is null', [channelId, subscriberId]);
            connection.getConnection((err, conn) => {
                if(err) {
                    console.log(err);
                }

                conn.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }

                    conn.release();

                    if(typeof results !== "undefined" && results.length > 0) {
                        resolve(true);
                    } else {
                        reject();
                    }
                });
            });
        } catch(e) {
            reject();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 * @param {*} subscriberId 
 * @returns 
 */
 async function subscribed(connection, channelId, subscriberId) {
    return new Promise(function (resolve, reject) {
        try {
            var sql = mysql.format('SELECT e.channel_id, e.alias, c.name from emojis e inner join channels c on c.id = e.channel_id WHERE e.deleted_at is null and e.channel_id in (select channel_id from subscribers where channel_id = ? and subscriber_id = ? and deleted_at is null)', [channelId, subscriberId]);
            
            connection.getConnection((err, conn) => {
                if(err) {
                    console.log(err);
                }

                conn.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }

                    conn.release();
                    
                    resolve(results);
                });
            });
        } catch(e) {
            resolve();
        }
    });
}

module.exports = {
    get,
    getEmojiByCode,
    isSubscriber,
    subscribed
}