const dayjs = require('dayjs');
const { profileMentionURL } = require('../tools');
const { debug_logs } = require('../../config.js')
const { getCacheProfileMention, redisClientOn, redisClientQuit } = require('../redis-cache/redisCacheManager');

const articleValidator  = {
    async discardCacheExistingArticles(profileID, articleUrls) {
        return existingArticles(profileID, articleUrls);
    },
    oldArticle(articleDate) {
        const oldLimitDate = dayjs().subtract(120, 'day');
        const articleDayJs = dayjs(articleDate);
        const isOlder = !!(articleDayJs < oldLimitDate);
        return isOlder;
    }
}

async function existingArticles(profileID, articleUrls) {
    // Iterate articleUrls array to discard exitingArticles
    try {
        redisClientOn();
    } catch(error) {
        throw err;
    }  
    
    for (let i = articleUrls.length - 1; i >= 0; i--) {
        let cacheMentionUrl;
        // With the mentionUrl connect to caché and check if mention is already processed
        const mentionUrl = profileMentionURL(profileID, articleUrls[i]);
        try {
            cacheMentionUrl = await getCacheProfileMention(mentionUrl);
            if (!!cacheMentionUrl) {
                console.log(`[ARTICLE DESCARTED] msg="article in cache" article="${articleUrls[i]}"`)
                articleUrls.splice(i, 1)
            }
        } catch(error) {
            console.error(`[ARTICLE VALIDATOR] level=error msg="error checking mention in cache" error="${error}"`)
        }  
    }
    redisClientQuit();
    return articleUrls;
}

module.exports = articleValidator;
