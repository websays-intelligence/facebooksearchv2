const dayjs = require('dayjs')
const { debug_logs } = require('../../config')
const loginControl = require('./loginControl')
const loginCheck = require('./loginCheck')
const { wait } = require('../tools')

module.exports = async (browserPack) => {
  if (browserPack.browser) {
    var response = { type: 'ko', msg: 'Parsing problems' }
    try {
      const page = (await browserPack.browser.pages())[0]
      if (debug_logs) console.log(`[LOGIN][START][${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)
      await page.goto('https://www.facebook.com/accounts/login/?source=auth_switcher')
      const user = browserPack.user
      await wait(5, 2, 'wait to load login')
      try {
        evaluateweb = await page.evaluate(loginControl)
        if (evaluateweb && evaluateweb.type === 'lockAccount') {
          console.error(`[LOGIN][LOCK ACCOUNT] level=error error="${user.login} account lock until recover in IG app"`)
          return false
        }
        if (evaluateweb && evaluateweb.type === 'phishing') {
          console.error(`[LOGIN][PHISHING] level=error error="${user.login} account temporarily blocked due to phishing"`)
          return false
        }
        if (evaluateweb && evaluateweb.type === 'ok') {
          return true
        }
      } catch (error) {
        console.error(`[LOGIN][NO LOGGED?][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error error="${JSON.stringify(error)}"`)
      }

      if (debug_logs) console.log(`Identificando con usuario: ${user.login}`)
      try {
//         await page.waitFor(1500);
//         await page.waitForSelector('input', {timeout: 60000});
        await page.focus('input');
        // await page.focus('input')
      } catch (error) {
        console.error(`[LOGIN][ERROR] level=error msg="focus input" error="${error}"`)
      }

      await page.keyboard.sendCharacter(user.login)
      await page.keyboard.press('Tab')
      await page.keyboard.sendCharacter(user.password)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')

      await wait(5, 2, 'wait after enter login')

      if (debug_logs) console.log(`[LOGIN][END][${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)
      evaluatelogin = await page.evaluate(loginCheck)
      if (evaluatelogin && evaluatelogin.type === 'lockAccount') {
        console.error(`[LOGIN][LOCK ACCOUNT] level=error error="${user.login} account lock until recover in IG app"`)
        return false
      }
      if (evaluatelogin && evaluatelogin.type === 'phishing') {
        console.error(`[LOGIN][PHISHING] level=error error="${user.login} account temporarily blocked due to phishing"`)
        return false
      }
      return evaluatelogin
    } catch (error) {
      console.error(`[LOGIN][END][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="parsing crash" error="${JSON.stringify(error)}"`)
    }
    return response
  } else {
    console.error(`[LOGIN][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error msg="exit process, no he recibido instancia del browser"`)
    process.exit(1)
  }
}
