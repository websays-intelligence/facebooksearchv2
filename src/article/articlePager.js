const articleControl = require('./articleControl')
const browserManager = require('../proxy/browserManager')
const dayjs = require('dayjs')
const { wait } = require('../tools')
const { timeout_navigation, debug_logs } = require('../../config.js')

module.exports = async (url) => {
  if (url) {
    const browserPack = browserManager.getCurrentBrowserPack()
    if (browserPack.browser) {
      const page = await browserPack.browser.newPage()
      if (debug_logs) console.log(`[ARTICLE][START][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] PARSING: ${url}`)
      try {
        await page.goto(url)// It will take url of instragram indexer
        await wait(timeout_navigation[0], timeout_navigation[1], 'natural navigation')
        const response = await page.evaluate(articleControl, url)// This will create the clipping
        if (response && response.data) {
          console.log(`[ARTICLE][DATE] msg="Article date: (${response.data.article_date})"`)
        } else {
          console.warn(`[ARTICLE][PROBLEM] msg="No article data: (${JSON.stringify(response)})"  URL: ${url}`)
        }
        await page.close()
        if (debug_logs) console.log(`[ARTICLE][END][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] PARSING: ${url}`)
        return response
      } catch (error) {
        console.warn(`[ARTICLE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=warning msg="parsing ${url}" error="${error}"`)
        if (page) {
          await page.close()
        }
        return {}
      }
    } else {
      console.warn(`[ARTICLE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=warning msg="no browser"`)
      return {}
    }
  } else {
    console.warn(`[ARTICLE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=warning msg="no url (${url})"`)
    return {}
  }
}
