module.exports = async () => {
  const wait = (initRange, endRange) => {
    const secs =  Math.floor(Math.random() * endRange) + initRange
    return new Promise(resolve => setTimeout(() => resolve(), secs * 1000))
  }

  // console.log('login control running...')
  // await wait(5, 2)

  const cookiesAcceptButtons = document.getElementsByClassName('_a9-- _a9_0');
  const warningPs = document.getElementsByClassName('GusmU SVI5E');
  let warningLockAccount;
  const imgs = document.getElementsByTagName('img');

  //handle save login information section after login
  // 1. get the section with login information saving option
  const saveLoginInformationModal = document.getElementsByClassName("_ab8j  _ab8s _ab8w  _ab94 _ab99 _ab9f _ab9m _ab9p _ac8g _abcm");
  //2. get the button of 'not now'
  const NotNowSaveLoginInformationButton = document.getElementsByClassName("_acan _acao _acas");

  for (img of imgs) {
    if (img.src.includes('illo_lock2.png')) {
      warningLockAccount = true;
      break;
    }
  }

  if (cookiesAcceptButtons.length) {
    cookiesAcceptButtons[0].click()
  }

  // if the modal contains information about the saving login information then check if there is 'not now' button. if yes then click on not now
  if(saveLoginInformationModal.length && saveLoginInformationModal[0].textContent.includes("login information")) {
    console.log('in save login information check');
    if(NotNowSaveLoginInformationButton.length) {
      console.log('in not now button click');
      NotNowSaveLoginInformationButton[0].click();
    }
  }

  await wait(5, 2)

  const searchIcon = document.querySelector('svg[aria-label="Search"]')
  const accountLinks = document.getElementsByClassName('ENC4C')
  const loginLink = accountLinks && accountLinks.length ? accountLinks[0].href.includes('login') : false;
  const logged = !!(searchIcon && !loginLink)

  if (logged) {
    // console.log('is already logged')
    return { type: 'ok' }
  } else {
    if (warningLockAccount) {
      return { type: 'lockAccount' }
    } else if (warningPs.length > 0) {
      for (let i = 0; i < warningPs.length; i++) {
        if (warningPs[i].innerText.includes('phishing')) {
          return { type: 'phishing' }
        }
      }
    }

    const buttons = document.getElementsByTagName('button')
    const inputs = document.getElementsByTagName('input')
    // console.log(inputs.length)
    if (inputs.length === 2) {
      // console.log("has log in")
      return { type: 'ko' }
    } else {
      // console.log("Click to continue with current user")
      buttons[1].click()
      return { type: 'ok' }
    }
  }
}
