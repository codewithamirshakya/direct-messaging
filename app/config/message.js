module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm",
            history: "dh"
        }
    },
    response: {
        messaging: {
            send: "dm",
            history: "dh"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            validation:     "DIRECT_MESSAGING_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE",
            history:        "DIRECT_MESSAGING_HISTORY"
        }
    },
    successCode : {

    },
};