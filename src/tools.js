const dayjs = require('dayjs')
const crypto = require('crypto');
const { debug_logs } = require('../config')

module.exports = {
  urlMake(search) {
    const type = search.includes('#')
    const manual_index_type = search.includes('www.instagram.com/p')
    const parse_search = search.replace(/ /g, '_').replace('#', '').replace('@', '')
    if (type) {
      return `https://www.instagram.com/explore/tags/${parse_search}/`
    } if (manual_index_type){
      return search;
    } else {
      return `https://www.instagram.com/${parse_search}/`
    }
  },
  wait(initRange, endRange, reason) {
    const time =  Math.floor(Math.random() * endRange) + initRange
    if (debug_logs) console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}][WAIT] msg="wait ${time} seconds: ${reason} "`)
    return new Promise(resolve => setTimeout(resolve, time * 1000))
  },
  queryToInstagram(queries) {
    const newq = queries
      .map(x => {
        if (x.includes('#') || x.includes('@')) return [ x ]
        else {
          var d = x.replace(/ /g, '_')
          return [ `#${d}`, `@${d}` ]
        }
      })
      .reduce((x, y) => [ ...x, ...y ])
    return [ ...new Set(newq) ]
  },
  profileMentionURL(profileID, url) {
    url = url.trim()
    url = url.replace('http://', '')
    url = url.replace('https://', '')
    url = url.replace('www.', '')
    return `url:clipping:${profileID}:${hash(url)}`
  },
  cacheAuthorKey(usename) {
    return `author:ig:${usename}`
  },
  jsonToWebsays(article) {
    try {
      const serialized = {
        ID: article.article_id,
        domain: 'instagram.com',
        url: article.article_url,
        mediaURLs: [ article.article_media_url ],
        snippet: article.article_whole_text,
        text: article.article_whole_text,
        threadId: article.article_id,
        threadEntryType: 'post',
        channelID: article.user_name,
        screenName: article.user_name,
        authorName: article.screen_name || article.user_name,
        followersCount: article.user_followers,
        commentsCount: article.article_comments && article.article_comments.length,
        likesCount: article.article_likes,
        sharesCount: 0,
        provider: 'ig-spider',
        createdAt: dayjs(article.article_date).valueOf()
      }
      return serialized
    } catch (error) {
      console.ERROR(`[CLIPPING JSON][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="article: ${article}" error="${error}"`)
      return {}
    }
  },changeProvider(articles) {
    console.log(articles)
    for (const key in articles) {
      articles[key].provider = 'ig-spider-d';
    }
  }
}

function hash(url) {
  // Joana: h = sha256.New()
  const hash = crypto.createHash('sha256');
  // Joana: h.Write([]byte(data))
  hash.update(url);
  // Joana: return base64.StdEncoding.EncodeToString(h.Sum(nil))
  const urlHash = hash.digest('base64')
  return urlHash;
}
