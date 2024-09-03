const { debug_logs, parallel_jobs, old_articles_break } = require('../config')
const explorePager = require('./explore/explorePager')
const { discardCacheExistingArticles } = require('./article/articleValidator')
const articleUnion = require('./article/articleUnion')
const articlePager = require('./article/articlePager')
const browserManager = require('./proxy/browserManager')
const userPager = require('./user/userPager')
const pLimit = require('promise-limit')
const limit = pLimit(parallel_jobs)

module.exports =  async (queryPack) => {
  if (debug_logs) console.log(`QUERY: ${queryPack.search}`)
  try {
    var exploreResult = await explorePager(queryPack.search, queryPack.sinceDate)
  } catch (error) {
    console.error(`[EXPLORE PAGER][ERROR] level=error error="${error}"`)
  }
  if (exploreResult && exploreResult.type === 'ok' && Array.isArray(exploreResult.data)) {
    try {
      console.log(`[JOBS][DISCARD ARTICLES] msg="initial articles: ${exploreResult.data.length}"`)
      exploreResult.data = await discardCacheExistingArticles(queryPack.profileIDs[0], exploreResult.data)
      console.log(`[JOBS][DISCARD ARTICLES] msg="final articles to process: ${exploreResult.data.length}"`)
    } catch (error) {
      console.error(`[JOBS][DISCARD ARTICLES][ERROR] level=error msg="error connecting cache" error="${error}"`)
    }

    if (exploreResult.is_profile) {
      var username = queryPack.search.replace('@', '')
      var user = {}
      user = await userPager(username)
      if (user && user.type === 'ok' && user.data) {
        var all_results = await Promise.all(
          exploreResult.data.map(article => limit(() => articlePager(article)))
        )
        return all_results
          .filter(x => x.data)
          .map(x => x.data)
          .map(x => ({ ...x, ...user.data }))
          .filter(x => Object.keys(x).length > 0)
      } else return []
    } else {     
      var all_results = await getAllArticleUnionResults(exploreResult.data, !!queryPack.sinceDate)
      var results = all_results.filter(x => Object.keys(x).length > 0)
      return results
    }
  } else return []
}

async function getAllArticleUnionResults(exploreResults, isHistorical) {
  var old_article_count = 0
  var results = []
  var result
  for (const article of exploreResults) {
      result = await articleUnion(article, isHistorical)

      if (result && result.type === 'ko') {
        await bannedCountManagement(true)   
      } else {
        if (result && result.type === 'old') {
          old_article_count++
        }
        results.push(result.article)
        await bannedCountManagement(false) 
      }   
      if (old_article_count > old_articles_break) {
        break
      }
  }

  return results;
}

async function bannedCountManagement(banned) {
  // si ha hanido banneo comprobar el ban_count del browser
  if (banned) {
    if (browserManager.getCurrentUserBanCount() >= 3) {
      // si es 3 resetear a 0 el ban_count y matar el browser
      console.log(`[CONTINUE BANNED COUNT] msg="3 or more. Kill browser"`)
      browserManager.resetCurrentUserBanCount()
      await browserManager.killBrowser()
      await browserManager.newBrowser()
    } else {
      console.log(`[CONTINUE BANNED COUNT] msg="sum banned to user banned count"`)
      browserManager.sumCurrentUserBanCount()
    }
  } else {
    // si ha tenido un resultado ok sin banneo resetear a 0 el ban_count
    if (browserManager.getCurrentUserBanCount() > 0) { 
      console.log(`[CONTINUE BANNED COUNT] msg="Success result. Reset browser ban_count"`)
      browserManager.resetCurrentUserBanCount()
    } 
  }
}
