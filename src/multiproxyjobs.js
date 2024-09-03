const browserManager = require('./proxy/browserManager')
const loginPager = require('./login/loginPager')
const jobs = require('./jobs')
const dayjs = require('dayjs')

module.exports = async (queryPack, browserPack) => {
  for (;;) {     
    if (browserPack.browser) {
      try {
        var login = await loginPager(browserPack)
      } catch (error) {
        console.error(`[LOGIN][ERROR] level=error error="${error}"`)
      }
      if (login) {
        var queryResults = []
        try {
          queryResults = await jobs(queryPack) 
        } catch (error) {
          const currentBrowserPack = browserManager.getCurrentBrowserPack()
          console.error(`[JOBS ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] 
          level=error msg="user: ${JSON.stringify(currentBrowserPack.user.login)}, profile: ${queryPack.profileIDs}"
          error="${error}"`)
        } 

        if (queryResults.length === 0) {
          var searchResponse = {}
          // NO HAY RESULTADOS. VERIFICAR SI EL BROWSER AUN FUNCIONA
          const res_alive = await browserManager.checkAlive()
          if (res_alive) {
            // EL BROWSER SIGUE VIVO, LOS RESULTADOS SON CORRECTOS. PONEMOS AL BROWSER A DESCANSAR
            console.log(`[USER JOBS][END] msg="No results. Browser alive"`)
            browserManager.closeCurrentBrowser()
            searchResponse = {result: 'ok', queryResults: queryResults}
            return searchResponse
          } else {
            // EL USUARIO ESTA MUERTO, VOLVEMOS A INTENTAR CON EL SIGUIENTE
            console.log(`[USER JOBS][END] msg="No results. Browser not alive"`)
            await browserManager.killBrowser()
            searchResponse = {result: 'ko', queryResults: queryResults}
            return searchResponse
          }
        } else {
          // FINALIZAMOS NAVEGADOR Y PONEMOS AL USUARIO A DESCANSAR
          console.log(`[USER JOBS][END] msg="With results"`)
          browserManager.closeCurrentBrowser()
          searchResponse = {result: 'ok', queryResults: queryResults}
          return searchResponse
        }  
      } else  {
        // PROBLEMA CON EL USER, PROBAR SIGUIENTE USER
        const lastBrowserPack = browserManager.getCurrentBrowserPack()
        console.error(`[LOGIN][ERROR] level=error msg="Login error. Kill browser: ${JSON.stringify(lastBrowserPack.user)}"`)
        await browserManager.killBrowser()
        searchResponse = {result: 'ko', queryResults: queryResults}
        return searchResponse
      }             
    } else {
      // PROBLEMA CON EL BROWSER, PROBAR SIGUIENTE PROXY
      const lastBrowserPack = browserManager.getCurrentBrowserPack()
      console.error(`[BROWSER][ERROR] level=error msg="get browser error: ${JSON.stringify(lastBrowserPack.user)}"`)
      searchResponse = {result: 'ko', queryResults: queryResults}
      return searchResponse
    }
  }
}

