const axios = require('axios')
const { server_winput, debug_logs, debug_query } = require('../../config')
const dayjs = require('dayjs')
const { jsonToWebsays } = require('../tools')
const { changeProvider } = require('../tools')

var currentQuery

const setCurrentQuery = query => {
  currentQuery = query
}

const getCurrentQuery = () => {
  return currentQuery
}

const getWinputQuery = async () => {
  var query
  try {
    // first check if there are some queries in priority list by forcing the IG scrape. If yes then
    const urlNextQueryWithPriority = `${server_winput}winput/ig/queries/next?fields=priority`
    const response = await axios.get(urlNextQueryWithPriority)
    var resultWithPriority = response.status === 200 ? 'OK' : `HTTP ERROR ${response.status}`
    console.log(`GET NEXT QUERY FROM PRIORITY LIST: ${urlNextQueryWithPriority} RESULT -> ${resultWithPriority}`)
    if (response.status === 200){
      query = response.data
      setCurrentQuery(query)
    }
    else {
      const urlNextQuery = `${server_winput}winput/ig/queries/next`
      const res = await axios.get(urlNextQuery)
      var result = res.status === 200 ? 'OK' : `HTTP ERROR ${res.status}`
      console.log(`GET NEXT QUERY FROM: ${urlNextQuery} RESULT -> ${result}`)
      if (res.status === 200){
        query = res.data
        setCurrentQuery(query)
      }
    }
  } catch (error) {
    var error_message = JSON.stringify(error.message)
    if (error_message.includes('404')) {
      console.warn(`[GET QUERY][WARNING] HTTP ERROR: ${error_message}`)
      
      try {
        const urlNextQuery = `${server_winput}winput/ig/queries/next`
        const res = await axios.get(urlNextQuery)
        var result = res.status === 200 ? 'OK' : `HTTP ERROR ${res.status}`
        console.log(`GET NEXT QUERY FROM NORMAL LIST: ${urlNextQuery} RESULT -> ${result}`)
        if (res.status === 200){
          query = res.data
          setCurrentQuery(query)
        }
      } catch (error) {
        var error_message = JSON.stringify(error.message)
        console.error(`[GET QUERY][ERROR] level=error HTTP ERROR: ${error_message}`)
      }
    } else {
      console.error(`[GET QUERY][ERROR] level=error HTTP ERROR: ${error_message}`)
    }
  }

  return query
}

const finishQuery = () => {
  setCurrentQuery(null)
}

const queryManager = {
  async getQuery() {
    queryPack = getCurrentQuery()
    if (!queryPack) {
      queryPack = await getWinputQuery()
    }
    return queryPack
  },
  async postQueryResults(queryPack, userPack, results) {
    var articles = results.map(jsonToWebsays)
    if(queryPack.search.includes('www.facebook.com/p')){
      changeProvider(articles);
    }

    var clippings = [ ...new Set(articles) ]
    if (clippings) {
      const profileIDs = queryPack.profileIDs
      const historicalID = queryPack.historicalID
      const sinceDate = queryPack.sinceDate
      const userID = userPack.id
      // const lastClippingDate = '';

      var tosend = JSON.stringify({ userID, historicalID, sinceDate, profileIDs, clippings })
      if (debug_logs) console.log(tosend)
      try {
        await axios.post(`${server_winput}winput/ig/queries/${queryPack.id}/results`, tosend)
        console.info(`[POST TO WINPUT][OK] PROFILE: ${profileIDs} SEARCH: ${queryPack.search} -> ${clippings.length}`)
      } catch (error) {
        console.error(
          `[POST TO WINPUT][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error error="${JSON.stringify(error.message)}"`
        )
      }
      


      try {
        await axios.put(`${server_winput}winput/ig/queries/historical/${queryPack.id}/complete`)
        console.info(`[HISTORICAL COMPLETE][OK] PROFILE: ${profileIDs} SEARCH: ${queryPack.search} -> ${clippings.length}`)
      } catch (error) {
        console.error(
          `[HISTORICAL COMPLETE][ERROR][${dayjs().format('YYYY-MM-DD HH:mm:ss')}] level=error error="${JSON.stringify(error.message)}"`
        )
      }
      finishQuery()
    }
  }
}

module.exports = queryManager
