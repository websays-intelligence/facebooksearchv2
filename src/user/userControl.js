module.exports = async () => {
  try {
    // let pre_user_followers
    let user_followers
    // const pre_user_followers_aEl = document.querySelector('a > span[title]')
    // const pre_user_followers_spanEl = document.querySelector('span > span[title]')
    // if (pre_user_followers_aEl) {
    //   pre_user_followers = pre_user_followers_aEl.getAttribute('title')
    // } else if (pre_user_followers_spanEl) {
    //   pre_user_followers = pre_user_followers_spanEl.getAttribute('title')
    // }
    // if (pre_user_followers) {
    //   const pre2_user_followers = pre_user_followers.replace(/,/g, '')
    //   user_followers = parseInt(pre2_user_followers, 0)
    // }

    user_followers =  parseInt(document.getElementsByClassName('_ac2a')[1].getAttribute('title').replace(',',''));

    const h1Elements = document.getElementsByTagName('h1')
    let screen_name
    let user_name
    if (h1Elements.length === 2) {
      user_name = h1Elements[0].innerText
      screen_name = h1Elements[1].innerText
    } else {
      if (h1Elements.length) {
        screen_name = h1Elements[0].innerText
      }
      const h2Elements = document.getElementsByTagName('h2')
      if (h2Elements.length) {
        user_name = h2Elements[0].innerText
      }
    }

    const data = {
      user_followers,
      user_name,
      screen_name
    }
    return { type: 'ok', msg: 'Results', data }
  } catch (error) {
    console.error(`[USER PARSER][ERROR] level=error error="${error}"`)
    return { type: 'ko', msg: `parser problem ${error}` }
  }
}
