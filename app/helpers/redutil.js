/**
 * 
 * @param {*} client 
 * @param {*} key 
 * @param {*} start 
 * @param {*} stop 
 */
 async function lrange(client, key, start, stop) {
    return new Promise(async function (resolve, reject) {
        client.lrange(key, start, stop, (err, items) => {
            if (err) {
                console.log(err);
            }

            resolve(items);
        });
    });
}

/**
 * 
 * @param {*} larray 
 * @param {*} client 
 * @param {*} key 
 * @param {*} start 
 * @param {*} stop 
 */
 async function multirange(client, larray, keyalias, start, stop) {
    var marray = [];

    for(i in larray) {
        await lrange(client, keyalias + larray[i], start, stop).then(function(items) {
            marray = marray.concat(items);
        });
    }

    marray = marray.filter((val,i) => marray.indexOf(val) === i);

    return marray;
}

module.exports = {
    multirange
}