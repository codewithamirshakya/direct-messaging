/**
 * 
 * @param {*} ws 
 */
 async function scoreLimit(ws) {
    return new Promise(async function (resolve, reject) {
        var now             = new Date().getTime();

        if(typeof ws['lastScoreTime'] !== "undefined" && typeof ws['score'] !== "undefined") {
            var score           = ws['score'];
            var lastScoreTime   = ws['lastScoreTime'];
            var timespan        = new Date(now - lastScoreTime).getTime();
            var scoreReduction  = parseInt(timespan / 60000);

            if(scoreReduction > score) {
                ws['score'] = 0;
            } else {
                ws['score'] = ws['score'] - scoreReduction;
            }
        } else {
            ws['lastScoreTime'] = now;
            ws['score']         = 0;
        }

        resolve();
    });
}

/**
 * 
 * @param {*} ws 
 */
async function messageLimit(ws) {
    return new Promise(async function (resolve, reject) {
        var now             = new Date().getTime();

        if(typeof ws['lastTime'] !== "undefined" && typeof ws['recentCount'] !== "undefined" && typeof ws['recentCountBannable'] !== "undefined") {
            var lastTime            = ws['lastTime'];
            var recentCount         = ws['recentCount'];
            var recentCountBannable = ws['recentCountBannable'];
            var timestamp           = new Date(now - lastTime).getTime();
            timestamp               = timestamp / 1000;
            
            if(timestamp >= 2) {
                if(recentCount > timestamp * 3 / 2) {
                    recentCount = recentCount - timestamp * 3 / 2;
                } else {
                    recentCount = 0;
                }

                if(recentCountBannable > timestamp * 3 / 2) {
                    recentCountBannable = recentCountBannable - timestamp * 3 / 2;
                } else {
                    recentCountBannable = 0;
                }

                ws['lastTime']              = now;
            }

            ws['recentCount']           = recentCount + 1;
            ws['recentCountBannable']   = recentCountBannable + 1;

            if(recentCountBannable >= 3) {
                recentCountBannable = recentCountBannable - 3;
                ws['score']         = ws['score'] + 1;
            }
        } else {
            ws['lastTime']              = now;
            ws['recentCount']           = 1;
            ws['recentCountBannable']   = 1;
        }

        resolve();
    });
}

/**
 * 
 * @param {*} ws 
 */
 async function checkSpamming(ws) {
    return new Promise(async function (resolve, reject) {
        if(typeof ws['recentCount'] !== "undefined" && ws['recentCount'] >= 3) {
            reject();
        } else {
            resolve();
        }
    });
}

module.exports = {
    scoreLimit,
    messageLimit,
    checkSpamming
}