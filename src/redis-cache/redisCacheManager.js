const redis = require("redis");
const { promisify } = require("util");
const { redis_host } = require('../../config');
let redisClient;

const redisCacheManager = {
    async getCacheProfileMention(mentionUrl) {   
        const getAsync = promisify(redisClient.get).bind(redisClient);

        let result;
        await getAsync(mentionUrl).then((reply) => {
                result = reply;
            }).catch((err) => {
                throw err;
            });
        return result;
    },
    async getCacheAuthor(authorKey) {
        const getAsync = promisify(redisClient.get).bind(redisClient);

        let result;
        await getAsync(authorKey).then((reply) => {
                result = reply;
            }).catch((err) => {
                throw err;
            });
        return result;
    },
    setAuthorToCache(authorKey, author, expireSeconds) {
        redisClient.set(authorKey, author, 'EX', expireSeconds, function(err) {
            if (err) {
                throw err;
            }
        });
    },
    redisClientOn() {
        const hostname = redis_host.substring(0, redis_host.indexOf(':'));
        const port = redis_host.substring(redis_host.indexOf(':') + 1, redis_host.length);
        redisClient = redis.createClient({ port: port, host: hostname })
        redisClient.on("error", function (err) {
            if (err) {
                throw err;
            }
        });
    },
    redisClientQuit() {
        redisClient.quit();
    }
}

module.exports = redisCacheManager