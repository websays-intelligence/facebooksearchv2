module.exports = async ({ number_scrolls, timeout_scroll, sinceDate, historical_scrolls }) => {
  try {
    const wait = (initRange, endRange) => {
      const secs =  Math.floor(Math.random() * endRange) + initRange
      return new Promise(resolve => setTimeout(() => resolve(), secs * 1000))
    }
    const getData = articles => {
      var data = []
      for (let i = 0; i < articles.length; i++) {
        data.push(articles[i].href)
      }
      return data
    }

    const getLastArticleDate = article => {
      const altText = article.querySelector('img').alt
      const onIndex = altText.indexOf('on ') + 3
      const endIndex = altText.indexOf('.')
      const dateString = altText.substring(onIndex, endIndex)
      const date = new Date(dateString)
      return date
    }

    var data = []
    const buttons = document.getElementsByTagName('button')
    if (buttons.length) {
      Array.from(buttons).forEach((button) => {
        if (button.textContent === 'See Posts Anyway' || button.innerText === 'See Posts Anyway'
        || button.textContent === 'see posts anyway' || button.innerText === 'see posts anyway'
        || button.textContent === 'See Posts' || button.innerText === 'See Posts'
        || button.textContent === 'see posts' || button.innerText === 'see posts') {
          button.click()
        }
      })
      await wait(5, 2)
    } 

    if (document.getElementsByTagName('article').length > 0) {
      const scrolls = sinceDate ? historical_scrolls : number_scrolls
      const articles = document.getElementsByTagName('article')[0].getElementsByTagName('a')
      // var lasArticlesLength = 0;
      if (articles.length > 1) {
        // console.log('In explorer found articles...')
        // if (holeHistoric) {
        //   while (lasArticlesLength !== articles.length) {
        //     var predata = [ ...data, ...getData(articles) ]
        //     data = [ ...new Set(predata) ]
        //     lasArticlesLength = articles.length
        //     window.scrollTo(0, document.body.scrollHeight)
        //     await wait(timeout_scroll[0], timeout_scroll[1])
        //   }
        // } else {
          for (let i = 0; i < scrolls; i++) {
            if (articles.length > 0) {
              var predata = [ ...data, ...getData(articles) ]
              data = [ ...new Set(predata) ]
  
              if (sinceDate) {
                const lastArticleDate = getLastArticleDate(articles[articles.length - 1])
                const sencondLastArticleDate = getLastArticleDate(articles[articles.length - 2])
                const thirdLastArticleDate = getLastArticleDate(articles[articles.length - 2])
                const stopDate = new Date(sinceDate * 1000)
                
                if ((lastArticleDate < stopDate) || (sencondLastArticleDate < stopDate) || (thirdLastArticleDate < stopDate)) {
                  // console.log('historical date achived');
                  return { type: 'ok', msg: 'Results', data }
                }
              }

              window.scrollTo(0, document.body.scrollHeight)
              await wait(timeout_scroll[0], timeout_scroll[1])
            } else return { type: 'ok', msg: 'Results', data }
          }
        // }
        return { type: 'ok', msg: 'Results', data }
      }

      return { type: 'ko', msg: 'No articles' }
    }

    return { type: 'ko', msg: 'No articles' }
  } catch (error) {
    console.error(`[EXPLORE PARSER][ERROR] level=error error="${error}"`)
    return { type: 'ko', msg: `parser problem ${error}` }
  }
}
