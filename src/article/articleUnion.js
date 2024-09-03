const userPager = require('../user/userPager')
const articlePager = require('./articlePager')
const { oldArticle } = require('./articleValidator')
const { debug_logs } = require('../../config.js')

module.exports = async (url, isHistorical) => {
  const article = await articlePager(url)
  if (article && article.type === 'ok' && article.data && article.data.article_username) {
    if (!isHistorical && oldArticle(article.data.article_date)) {
      console.log(`[ARTICLE][KO] msg="descarted article date: (${article.data.article_date})"`)
      return {type: 'old', article: {}}
    }
    var user = {}
    try {
      user = await userPager(article.data.article_username)
    } catch (error) {
      console.error(`[USER PAGER][ERROR] level=error msg="user page error: (${article.data.article_username}) error="${error}"`)
    }
    if (user && user.type === 'ok' && user.data) {
      const response = { ...article.data, ...user.data }
      if (debug_logs) console.log(`[ARTICLE & USER][END] URL: ${url}`)
      return {type: 'ok', article: response}
    } else if (user && user.type === 'ko') {
      return user
    } else return {type: '', article: {}}
  } else return {type: '', article: {}}
}
