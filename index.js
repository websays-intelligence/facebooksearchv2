process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
const dayjs = require('dayjs')
const { noUsersQueryWaitSeconds, restTimeWaitSeconds, queryWaitSeconds }  = require('./config')
const multiproxyjobs = require('./src/multiproxyjobs')
const browserManager = require('./src/proxy/browserManager')
const userManager = require('./src/proxy/userManager')
const queryManager = require('./src/query/queryManager')
const { wait } = require('./src/tools')

async function main() {
  const DATE_START = dayjs().format('YYYY-MM-DD HH:mm:ss')
  console.info(`[igsearch][START][${DATE_START}]`)

  var browserPack
  var queryPack

  browserPack = await browserManager.newBrowser()

  if (browserPack) {
    queryPack = await queryManager.getQuery()
  }

  if (browserPack && queryPack) {
    var searchResponse
    console.log(`[START QUERY] ID: ${queryPack.id} SEARCH: ${queryPack.search} PROFILE: ${queryPack.profileIDs[0]}`)
      try {
        searchResponse = await multiproxyjobs(queryPack, browserPack)
      } catch (error) {
        if (error === 'no_users') {
          console.warn(`[MULTIPROXYJOBS][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=warning msg="no users, exit process"`)
          process.exit(1)
        } else {
          console.warn(`[MULTIPROXYJOBS][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=warning error="${error}"`)
        }
      }

      if (searchResponse && searchResponse.result === 'ok') {
        await queryManager.postQueryResults(queryPack, browserPack.user, searchResponse.queryResults)
        console.log(`[END QUERY] ID: ${queryPack.id} SEARCH: ${queryPack.search} PROFILE: ${queryPack.profileIDs[0]}`)
        console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] waiting for next query`)
        if (userManager.isRestTime()) {
          await wait(restTimeWaitSeconds[0], restTimeWaitSeconds[1], 'user rest time')
        } else {
          await wait(queryWaitSeconds[0], queryWaitSeconds[1], 'wait until next query')
        }
      }

  } else {
    if (browserPack && !queryPack) {
      await browserManager.setBrowserToWait()
    }
    console.warn(`[START QUERY][WARNING][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] msg="no user or query availables"`)
    await wait(noUsersQueryWaitSeconds[0], noUsersQueryWaitSeconds[1] , 'no users or query wait')
  }
}

const loop = async () => {
  for (;;) await main()
}

loop()
