const { getCacheAuthor, setAuthorToCache, redisClientOn, redisClientQuit } = require('../redis-cache/redisCacheManager');
const { cacheAuthorKey } = require('../tools');

const userValidator  = {
    async getChacheUser(username) {
        var cacheAuthor
        try {
            redisClientOn();
        } catch(error) {
            throw err;
        }  

        const authorKey = cacheAuthorKey(username)
        try {
            cacheAuthor = await getCacheAuthor(authorKey);
        } catch(error) {
            console.error(`[USER VALIDATOR] level=error msg="error getting author from cache" error="${error}"`)
        }  

        redisClientQuit();
        return cacheAuthor;
    },
    setProcessedAuthorToCache(username, author, expireSeconds) {
        try {
            redisClientOn();
        } catch(error) {
            throw err;
        } 
        const authorKey = cacheAuthorKey(username)
        try {
            setAuthorToCache(authorKey, author, expireSeconds);
        } catch(error) {
            console.error(`[USER VALIDATOR] level=error msg="error setting author in cache" error="${error}"`)
        }  

        redisClientQuit();
    }
}

module.exports = userValidator;
