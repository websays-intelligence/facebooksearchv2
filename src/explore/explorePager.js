const exploreControl = require('./exploreControl')
const browserManager = require('../proxy/browserManager')
const dayjs = require('dayjs')
const { timeout_scroll, number_scrolls, debug_logs, historical_scrolls } = require('../../config')
const { wait, urlMake } = require('../tools')

module.exports = async (search, sinceDate) => {
  if (search) {
    const browserPack = browserManager.getCurrentBrowserPack()
    if (browserPack.browser) {
      const url = urlMake(search)
      if (debug_logs) console.log(`SEARCH: ${url}`)
      const page = await browserPack.browser.newPage()
      if (debug_logs) console.log(`[EXPLORE][START][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] SEARCH: "${search}"`)
      var response = { type: 'ko', msg: 'Parsing problems', data: [] }
      try {
        if(url.includes('www.facebook.com/p')){ //manual index
          response = { type: 'ok', msg: 'Results', data: [url] }
        }else{
          await page.goto(url)
          await wait(5, 2, 'wait to load search page')
          response = await page.evaluate(exploreControl, { number_scrolls, timeout_scroll, sinceDate, historical_scrolls })
        }
        
        if (response && response.type === 'ok' && response.data) {
          response.is_profile = search.includes('@')
          console.log(
            `[EXPLORE][END][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] SEARCH: "${search}" -> RESULTS: ${response.data.length}`
          )
        } else if (response && response.type === 'logout') {
          return { type: 'ko', msg: 'Logout', data: [] }
        } else {
          console.warn(
            `[EXPLORE][PROBLEM][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] msg="search: ${search}" problem="${JSON.stringify(response)}"`
          )
        }
      } catch (error) {
        console.error(
          `[EXPLORE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error
          msg="search: ${search} -> parsing crash or web not found" error="${JSON.stringify(error)}"`
        )
      }
      await page.close()
      return response
    } else {
      console.error(`[EXPLORE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="exit process, no browser"`)
      process.exit(1)
    }
  } else {
    console.error(`[EXPLORE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="exit process, no search params"`)
    process.exit(1)
  }
}
