module.exports = {
    type: {
        system          : "system",
        messaging: {
            send:           "dm",
            history:        "dch",
            messageList:    "dml",
            userList:       "ul",
            delete:         "dmd",
            remove:         "dmr",
            search:         "dms",
            active:         "dma",
            typing:         "dmt",
            accept:         "dmra",
            mrList:         "drl",
            mrDeleteAll:    "dar",
            mrDelete:       "dr",
        },
        emotes: {
            list: "el",
            subscribed: "es"
        },
        user: {
            ban: "ub"
        },
    },
    response: {
        messaging: {
            send:           "dm",
            history:        "dch",
            messageList:    "dml",
            userlist:       "ul",
            seenStatus:     "dmss",
            readStatus:     "dmrs",
            delete:         "dmd",
            remove:         "dmr",
            search:         "dms",
            updatelist:     "dmu",
            typing:         "dmt",
            request:        "dmmr",
            requestlist:    "drl",
            requesthistory: "drh",
            requestAccept:  "dmra",
            deleteRequest:  "dr",
            daRequest:      "dar"
        },
        emotes: {
            list: "el",
            subscribed: "es"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            restricted:     "DIRECT_MESSAGING_RESTRICTION",
            validation:     "DIRECT_MESSAGING_VALIDATION",
            follower:       "DIRECT_MESSAGING_FOLLOWER_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE",
            history:        "DIRECT_MESSAGING_HISTORY",
            messageList:    "DIRECT_MESSAGING_LIST",
            seenStatus:     "DIRECT_MESSAGING_SEEN_STATUS",
            banned:         "DIRECT_MESSAGING_BANNED",
            delete:         "DIRECT_MESSAGING_DELETE_MESSAGES",
            search:         "DIRECT_MESSAGING_SEARCH_HISTORY",
            remove:         "DIRECT_MESSAGING_REMOVE_MESSAGE",
            requestList:    "DIRECT_REQUEST_LIST",
            requestAccept:  "DIRECT_REQUEST_ACCEPT",
            deleteRequest:  "DIRECT_REQUEST_DELETE"
        },
        emojis: {
            list:           "EMOTES_LIST",
            subscribed:     "EMOTES_SUBSCRIBED"
        },
        userlist: {
            list:   "USERLIST",
            validation: "USERLIST_VALIDATION"
        },
        banUser: {
            validation: "BAN_USER_VALIDATION",
            exist:      "BAN_USER_EXIST",
            error:      "BAN_USER_ERROR"
        },
        dma: {
            validation: "DIRECT_MESSAGING_ACTIVE_VALIDATION",
            error:      "DIRECT_MESSAGING_ACTIVE_ERROR"
        },
        dmt: {
            validation:     "DIRECT_MESSSAGING_TYPING"
        }
    },
    successCode : {
        banUser: {
            success:    "USER_BANNED"
        },
        dma: {
            success:    "ACTIVE_CONVERSATION"
        },
        dmt: {
            sucess:     "TYPING_SUCCESS"
        }
    },
    system: {
        SLOW_DOWN:      "Woah there! Slow down!",
        SELF_MESSAGE:   "You cannot send message to yourself"
    }
};