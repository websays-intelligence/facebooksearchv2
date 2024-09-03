module.exports = async article_url => {
  const numberPattern = /\d/g

  // const wait = (initRange, endRange) => {
  //   const secs =  Math.floor(Math.random() * endRange) + initRange
  //   return new Promise(resolve => setTimeout(() => resolve(), secs * 1000))
  // }

  const shortcodeToInstaID = Shortcode => {
    var char
    var id = 0
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    for (var i = 0; i < Shortcode.length; i++) {
      char = Shortcode[i]
      var mul = id * 64
      id = mul + alphabet.indexOf(char)
    }
    return id
  }


  const getComments = comments => {
    // console.log(comments.length)
    var data = []
    for (let i = 0; i < comments.length; i++) {
      try {
        if (comments[i].getElementsByTagName('h3')[0] && comments[i].getElementsByTagName('span')[0]) {
          var user = comments[i].getElementsByTagName('h3')[0].innerText
          var message = comments[i].getElementsByTagName('span')[0].innerText
          data.push({
            user,
            message
          })
        }
      } catch (error) {
        console.error(`[ARTICLE PARSER] level=error msg="get comment" error="${error}"`)
      }
    }
    return data
  }

  const getArticleTexts = (textsArray, articleAuthor)  => {
    if (!textsArray || !textsArray.length ||
      textsArray[0] !== articleAuthor) {
      return ''
    }
    textsArray.splice(0, 1)
    if (textsArray.length) {
      textsArray.splice(textsArray.length - 1, 1)
    }
    textsArray.forEach((text, index) => {
      if (text === 'Verified') {
        textsArray.splice(index, 1)
      }
    })

    return textsArray.length ? textsArray.join(' ') : ''
  }

  try {
    var is_logged_in_structure = false;
    if(document.getElementsByClassName('x6s0dn4 x1dqoszc xu3j5b3 xm81vs4 x78zum5 x1iyjqo2 x1tjbqro').length === 1){
      is_logged_in_structure = true;
    }

    if (document.getElementsByTagName('article').length === 1 || document.getElementsByClassName('xh8yej3 x78zum5 x1q0g3np xtuw4uo xeud2gj x18oi6gw x13ehr01').length === 1  || 
      is_logged_in_structure
    ) {
      try {

        
        const article_type = document.querySelector('video') ? 'video' : 'photo';
        // console.log(article_type)
        const comments = document.querySelectorAll('ul > ul > div > li')
        const article_comments = getComments(comments)
        // const article_media_url = document.querySelector(article_type === 'photo' ? 'img[decoding=auto]' : 'video')
        //   .getAttribute(article_type === 'photo' ? 'src' : 'src')

        let article_media_url = '';
        if(article_type === 'photo') {
          article_media_url = document.getElementsByClassName('x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3')[0].src;
        }
        else if (article_type === 'video') {
          article_media_url = 'https://www.shutterstock.com/shutterstock/videos/1063352476/thumb/1.jpg?ip=x480'
        }

        var article_username = "";
        if(is_logged_in_structure){
          
          article_username = document.getElementsByClassName('_aacl _aaco _aacw _aacx _aad7 _aade')[0].innerText;
        }else{

          const headerLink0 = document.getElementsByTagName('header')[0].getElementsByTagName('a')[0]
          const avatarLink = headerLink0.getElementsByTagName('img')
          const headerLink1 = document.getElementsByTagName('header')[0].getElementsByTagName('a')[1]
          // If headerLink0 has not img is username else username is headerLink1
          const usernameEl = !avatarLink.length ? headerLink0 : headerLink1
          article_username = usernameEl.innerText
        }

        var article_likes = 0;
        if(document.getElementsByClassName('x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs xt0psk2 x1i0vuye xvs91rp x1s688f x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj').length >= 0){
          var likesElement = document.getElementsByClassName('x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs xt0psk2 x1i0vuye xvs91rp x1s688f x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj')[0];
          var innerHTML = likesElement.innerHTML;
          article_likes = parseInt(innerHTML.match(/\d+/)[0]);
        }

        var article_whole_text = ""
        if(is_logged_in_structure){

          if(document.getElementsByClassName('x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs xt0psk2 x1i0vuye xvs91rp xo1l8bm x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj').length === 1){

            article_whole_text = document.getElementsByClassName('x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs xt0psk2 x1i0vuye xvs91rp xo1l8bm x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj')[0].innerText;
          }else if(document.getElementsByClassName('x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs xt0psk2 x1i0vuye xvs91rp xo1l8bm x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj').length > 1){

              article_whole_text = document.getElementsByClassName('x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs xt0psk2 x1i0vuye xvs91rp xo1l8bm x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj')[1].innerText;
          }

        }else{
          article_whole_text = document.getElementsByClassName('_a9zs')[0].innerText
        }
        
        /*
        // const article_views_els = document.getElementsByClassName('vcOH2')
        const article_likes_els = document.getElementsByClassName('_aacl _aaco _aacw _aacx _aada _aade').length > 0 ?
          document.getElementsByClassName('_aacl _aaco _aacw _aacx _aada _aade')[0] : document.getElementsByClassName('_aacl _aaco _aacw _aacx _aad6 _aade')[1]
        // const article_likes_el = article_likes_els.length > 0  ? article_likes_els[0] : ''
        const article_likes_spans = article_likes_els ? article_likes_els.getElementsByTagName('span') : []
        const article_likes_pre = article_likes_spans.length ? article_likes_spans[0].innerText : ''
        const article_likes_pre2 = article_likes_pre.replace(/,/g, '').match(numberPattern)
        const article_likes_pre3 = (article_likes_pre2 && article_likes_pre2.length) ? article_likes_pre2.join('') : '0'
        const article_likes = parseInt(article_likes_pre3, 0)
        */
        /*const menuitemItem = document.getElementsByClassName('_a9zs')[0].innerText
        // const menuitemInnerTexts = menuitemItem ? menuitemItem.innerText.split('\n') : null
        // const cleanArticleTexts = getArticleTexts(menuitemInnerTexts, article_username)
        const article_hole_text = menuitemItem
        */
        const article_date = document.querySelector('time[datetime]').getAttribute('datetime')
        const article_id = shortcodeToInstaID(article_url.split('/')[4]).toString()
        // console.log('arriba al final?')
        const data = {
          article_id,
          article_type,
          article_url,
          article_media_url,
          article_username,
          article_likes,
          article_whole_text,
          article_comments,
          article_date
        }
        return { type: 'ok', msg: 'Results', data }
      } catch (error) {
        console.error(`[ARTICLE PARSER] level=error error="${error}"`)
        return { type: 'ko', msg: 'No article', error: JSON.stringify(error) }
      }
    } else return { type: 'ko', msg: 'No articles found' }
  } catch (error) {
    console.error(`[ARTICLE PARSER] level=error error="${error}"`)
    return { type: 'ko', msg: `Parser problem`, error: JSON.stringify(error) }
  }
}

//const article_media_url = document
//           .querySelector(article_type === 'photo' ? 'img[decoding=auto]' : 'video')
//           .getAttribute(article_type === 'photo' ? 'src' : 'poster')



//previous way to get the text
// const menuitemItem = document.querySelector('li[role="menuitem"]')
// const menuitemInnerTexts = menuitemItem ? menuitemItem.innerText.split('\n') : null

//
// let article_media_url = document
//   .querySelector(article_type === 'photo' ? 'img' : 'video')
//
// const src = article_media_url.getAttribute(article_type === 'photo' ? 'srcset' : 'poster')
// if (!src) {
//   article_media_url = article_media_url.getAttribute(article_type === 'photo' ? 'src' : 'poster')
// } else {
//   article_media_url= article_media_url.getAttribute('srcset').split(',').reduce(
//     (acc, item) => {
//       let [url, width] = item.trim().split(" ");
//       width = parseInt(width);
//       if (width > acc.width) return { width, url };
//       return acc;
//     },
//     { width: 0, url: "" }
//   ).url;
// }


// previous way of getting the likes
// const article_likes_els = document.getElementsByClassName('zV_Nj')
// const article_likes_el = article_likes_els.length === 2 ? article_likes_els[1] : article_likes_els[0]
// const article_likes_spans = article_likes_el ? article_likes_el.getElementsByTagName('span') : []
// const article_likes_pre = article_likes_spans.length ? article_likes_spans[0].innerText : ''
// const article_likes_pre2 = article_likes_pre.replace(/,/g, '').match(numberPattern)
// const article_likes_pre3 = (article_likes_pre2 && article_likes_pre2.length) ? article_likes_pre2.join('') : '0'
// const article_likes = parseInt(article_likes_pre3, 0)
