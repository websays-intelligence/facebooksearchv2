const { proxyBrowser } = require('../../config')
const puppeteer = require('puppeteer')
const proxyChain = require('proxy-chain')
const userManager = require('./userManager')

var currentBrowserPack

const setCurrentBrowserPack = browserPack => {
  currentBrowserPack = browserPack
}

const getCurrentBrowserPack = () => {
  return currentBrowserPack
}

const closeBrowser = async (browserPack) => {
  try {
    await browserPack.browser.close()
  } catch (error){
    console.error(`[CLOSE BROWSER][ERROR] level=error msg="Error closing browser" error="${error}"`)
  }
  await proxyChain.closeAnonymizedProxy(browserPack.newproxy)
}

const browserManager = {
  async newBrowser() {
    var newBrowserPack
    const userPack = await userManager.getSearchUser()
    if (userPack) {
      try {
        const newproxy = await proxyChain.anonymizeProxy(userPack.proxy)
        const browser = await puppeteer.launch(proxyBrowser(userPack, newproxy))
        console.info(`[BROWSER][NEW] msg="new user: ${userPack.login}, proxy: ${userPack.proxy}"`)
        newBrowserPack = {
          user: userPack,
          newproxy: newproxy,
          browser: browser
        }
      } catch (error) {
        console.error(`[BROWSER][NEW][ERROR] level=error msg="Error getting new browser" error="${error}"`)
      }
    }
    setCurrentBrowserPack(newBrowserPack)
    return newBrowserPack
  },
  async closeCurrentBrowser() {
    const browserPack = getCurrentBrowserPack()
    if (browserPack) {
      await closeBrowser(browserPack)
    }
  },
  async setBrowserToWait() {
    const browserPack = getCurrentBrowserPack()
    if (browserPack) {
      await closeBrowser(browserPack)
      console.warn(`[BROWSER][PROBLEM] msg="wait browser: ${browserPack.user.login}, proxy: ${browserPack.user.proxy}"`)
      userManager.setUserToWait(browserPack.user.id)
    }
    setCurrentBrowserPack(undefined)
    return {}; 
  },
  async killBrowser() {
    const browserPack = getCurrentBrowserPack()
    if (browserPack) {
      await closeBrowser(browserPack)
      console.warn(`[BROWSER][PROBLEM] msg="kill browser: ${browserPack.user.login}, proxy: ${browserPack.user.proxy}"`)
      userManager.setUserInQuarantine(browserPack.user.id)
    }
    setCurrentBrowserPack(undefined)
    return {}; 
  },
  async checkAlive() {
    const browserPack = getCurrentBrowserPack()
    if (browserPack && browserPack.browser) {
        const page = await browserPack.browser.newPage()
        try {
          await page.goto('https://www.instagram.com')
          await page.close()
          return true
        } catch (error) {
          console.error(`[BROWSER][PROBLEM] level=error msg="checkalive connection problem" error="${error}"`)
          await page.close()
          return false
        }
    } else {
      return false
    }
  },
  getCurrentBrowserPack() {
    return getCurrentBrowserPack()
  },
  getCurrentUserBanCount() {
    const browserPack = getCurrentBrowserPack()
    return browserPack.user.ban_count
  },
  sumCurrentUserBanCount() {
    const browserPack = getCurrentBrowserPack()
    browserPack.user.ban_count++
  },
  resetCurrentUserBanCount() {
    const browserPack = getCurrentBrowserPack()
    browserPack.user.ban_count = 0
  }
}

module.exports = browserManager

