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

module.exports = {
    get
}