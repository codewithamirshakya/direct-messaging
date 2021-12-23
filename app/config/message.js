module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml",
            userList: "ul",
            seenStatus:"ss",
            deleteMessages: "dam",
            search: "dsh"
        },
        emotes: {
            list: "el"
        },
        user: {
            ban: "ub"
        }
    },
    response: {
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml",
            userlist: "ul",
            seenStatus:"ss",
            deleteMessages: "dam",
            search: "dsh"
        },
        emotes: {
            list: "el"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            restricted:     "DIRECT_MESSAGING_RESTRICTION",
            validation:     "DIRECT_MESSAGING_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE",
            history:        "DIRECT_MESSAGING_HISTORY",
            messageList:    "DIRECT_MESSAGING_LIST",
            seenStatus:     "DIRECT_MESSAGING_SEEN_STATUS",
            banned:         "DIRECT_MESSAGING_BANNED",
            deleteMessages: "DIRECT_MESSAGING_DELETE_MESSAGES",
            search:         "DIRECT_MESSAGING_SEARCH_HISTORY"
        },
        emojis: {
            list:           "EMOTES_LIST"
        },
        userlist: {
            list:   "USERLIST"
        },
        banUser: {
            validation: "BAN_USER_VALIDATION",
            exist:      "BAN_USER_EXIST",
            error:      "BAN_USER_ERROR"
        }
    },
    successCode : {
        banUser: {
            success:    "USER_BANNED"
        }
    },
    system: {
        SLOW_DOWN:      "Woah there! Slow down!",
    }
};