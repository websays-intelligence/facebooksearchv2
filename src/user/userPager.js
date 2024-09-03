const userControl = require('./userControl')
const browserManager = require('../proxy/browserManager')
const dayjs = require('dayjs')
const { wait } = require('../tools')
const { getChacheUser, setProcessedAuthorToCache } = require('./userValidator')
const { timeout_navigation, debug_logs } = require('../../config.js')

module.exports = async (username) => {
  if (username) {
    const browserPack = browserManager.getCurrentBrowserPack()
    if (browserPack.browser) {
      var cacheAuthorResponse
      try {
        cacheAuthorResponse = await getChacheUser(username)
        console.log(`[GET CACHE USER] msg="get user result ${username} from cache"`)
      } catch (error) {
        console.error(`[GET CACHE USER][ERROR] level=error msg="error connecting cache" error="${error}"`)
      }

      if (cacheAuthorResponse) {
        const userResponse = JSON.parse(cacheAuthorResponse)
        console.log(`[GET CACHE USER][OK] msg="user ${username} is in cache"`)
        return userResponse;
      } else {
        const url = `https://www.facebook.com/${username}/`
        try {
          var page = await browserPack.browser.newPage()
          var response = await tryPageEvaluation(page, url)
          await page.close()

          if (response && response.type === 'ko') {
            console.warn(`[USER][PROBLEM] msg="url: ${url}, possibly banned or DOM changed" error="${JSON.stringify(response)}"`)
          } 
          
          if (response) {           
            try {
              const authorResponse =  JSON.stringify(response)
              const expireSeconds = response.type === 'ok' ? (60 * 60 * 12) : (60 * 60 * 6)
              setProcessedAuthorToCache(username, authorResponse, expireSeconds)
              console.log(`[SET CACHE USER] msg="set user result ${username} in cache"`)
            } catch (error) {
              console.error(`[SET CACHE USER][ERROR] level=error msg="error connecting cache" error="${error}"`)
            }
          }
          
          return response
        } catch (error) {
          if (page) {
            await page.close()
          }
          console.error(
            `[USER][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="url: ${url}" error="${error}"`
          )
          return {}
        }
      }
    } else {
      console.error(`[USER][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="no browser"`)
      return {}
    }
  } else {
    console.error(`[USER][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="no user: ${username}"`)
    return {}
  }
}

async function tryPageEvaluation(page, url) {
  if (debug_logs) console.log(`[USER][START][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] PARSING: ${url}`)
  try {
    await page.goto(url)
    await wait(timeout_navigation[0], timeout_navigation[1], 'natural navigation')
    const response = await page.evaluate(userControl)
    if (debug_logs) console.log(`[USER][END][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] PARSING: ${url}`)
    return response
  } catch (error) {
    console.log(`[USER PAGER][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error parsing:"${url}" error="${error}"`)
    return { type: 'ko', msg: `parser problem ${error}` }
  }
}
