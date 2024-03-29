module.exports = {
    server: {
        port: parseInt(process.env.PORT) || 9001
    },
    socket: {
        compression: process.env.SOCKET_COMPPRESSION || 0,
        maxPayloadLength: process.env.SOCKET_MAX_PAYLOAD_LENGTH || 64 * 1024, // 2KB
        idleTimeout: process.env.SOCKET_IDLE_TIMEOUT || 0, // 100s
        maxBackpressure: process.env.SOCKET_MAX_BACKPRESSURE || 104448,
        prefix: process.env.SOCKET_PREFIX || 'dm_'
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || "6379",
        prefix: process.env.REDIS_PREFIX || "ptv_",
        dm: process.env.REDIS_DM || "dm_",
    },
    redisSub: {
        host: process.env.REDIS_SUB_HOST || "localhost",
        port: process.env.REDIS_SUB_PORT || "6379",
        prefix: process.env.REDIS_SUB_PREFIX || "ptv_"
    },
    redisPub: {
        host: process.env.REDIS_PUB_HOST || "localhost",
        port: process.env.REDIS_PUB_PORT || "6379",
        prefix: process.env.REDIS_PUB_PREFIX || "ptv_"
    },
    mongo: {
        host: process.env.MONGO_DB_HOST || "localhost",
        port: process.env.MONGO_PORT || "27017",
        user: process.env.MONGO_DB_USERNAME || "root",
        pass: process.env.MONGO_DB_PASSWORD || "root",
        db:  process.env.MONGO_DB_DATABASE || "picarto",
        connection: process.env.MONGO_CONNECTION_LIMIT || 1
    },
    mysql: {
        host: process.env.MYSQL_HOST || "localhost",
        port: process.env.MYSQL_PORT || "3306",
        user: process.env.MYSQL_USER || "root",
        pass: process.env.MYSQL_PASS || "root",
        db:  process.env.MYSQL_DB || "picarto",
        connection: process.env.MYSQL_CONNECTION_LIMIT || 1
    },
    jwt: {
        key: process.env.JWT_KEY || "DiaG0N12OhKTdglPqS",
        algorithm: process.env.JWT_ALGORITHM || "HS256"
    },
    log: {
        level: process.env.LOG_LEVEL || "LEVEL_1", // ALL, WARNINGS, INFO, DEBUG, ERROR, LEVEL_1, LEVEL_2, LEVEL_3
    },
    chat: {
        limit: 25, // number of message to be fetched at once
        rateLimit: process.env.RATE_LIMIT || 10, // Rate Limit
        defaultMessageLength: 255,
        premiumMessageLength: 4000,
        conversation: 50
    },
    rkeys: {
        emojis:             'emojis_',
        settings:           'settings_',
        banned:             'banned_',
        moderators:         'moderators_',
        online:             'dm_online',
        lastOnline:         'dm_last_online',
        allow:              'dm_allow_',
        active:             'dm_active'
    },
    expire: {
        settings: 3600,
        emojis: 3600,
        active: 3600
    },
    minio: {
        bucket      : process.env.MINIO_BUCKET || 'ptvimages',
        emojiAlias  : process.env.MINIO_EMOJI_ALIAS || 'emoticons',
        avatarAlias : process.env.MINIO_AVATAR_ALIAS || 'avatars',
    },
    hlimit: {
        banned:     process.env.BANNED_LIMIT || 5000
    },
    accountType: {
        premium: 'P'
    }
};