module.exports = async () => {
  const wait = (initRange, endRange) => {
    const ms =  Math.floor(Math.random() * endRange) + initRange
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // console.log('login check running...')
  // await wait(5000, 2000)

  const warningPs = document.getElementsByClassName('GusmU SVI5E');

  let warningLockAccount;
  const imgs = document.getElementsByTagName('img');

  for (img of imgs) {
    if (img.src.includes('illo_lock2.png')) {
      warningLockAccount = true;
      break;
    }
  }

  const searchIcon = document.querySelector('svg[aria-label="Search"]')
  const accountLinks = document.getElementsByClassName('ENC4C')
  const loginLink = accountLinks && accountLinks.length ? accountLinks[0].href.includes('login') : false;
  const logged = !!(searchIcon && !loginLink)

  if (warningLockAccount) {
    return { type: 'lockAccount' }
  } else if (warningPs.length > 0) {
    for (let i = 0; i < warningPs.length; i++) {
      if (warningPs[i].innerText.includes('phishing')) {
        return { type: 'phishing' }
      }
    }
  }
  return logged
}