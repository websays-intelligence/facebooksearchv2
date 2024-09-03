const dayjs = require('dayjs')
const axios = require('axios')
const { server_winput } = require('../../config')

var currentUser

const setCurrentUser = user => {
  currentUser = user
}

const getCurrentUser = () => {
  return currentUser
}

const getWinputUser = async () => {
  var userResponse = {
    type: 'ko',
    user: undefined
  }
  try {
    const urlNextUser = `${server_winput}winput/ig/users/next`
    var res = await axios.get(urlNextUser)
    var result = res.status === 200 ? 'OK' : `HTTP ERROR ${res.status}`
    console.log(`GET NEXT USER FROM: ${urlNextUser} RESULT -> ${result}`)
    if (res.status === 200) {
      userResponse.type = 'ok'
      userResponse.user = res.data
      userResponse.user.workdayFinishDate = dayjs().add(8, 'hour')
      userResponse.user.nextRestDate = dayjs().add(2, 'hour')
      setCurrentUser(userResponse.user)
    } else if (res.status === 400 || res.status === 404) {
      userResponse.type = 'no_users'
      console.warn(`[GET USER][WARNING] msg="No next user"`)
    }
  } catch (error) {
    var error_message = JSON.stringify(error.message)
    if (error_message.includes('404')) {
      userResponse.type = 'no_users'
      console.warn(`[GET USER][WARNING] HTTP ERROR: ${error_message}`)
    } else {
      console.error(`[GET USER][ERROR] level=error HTTP ERROR: ${error_message}`)
    }
  }
  return userResponse
}

const releaseUsers = async () => {
  try {
    const urlReleaseUsers = `${server_winput}winput/ig/users/release`
    var res = await axios.put(urlReleaseUsers)
    var result = res.status === 200 || res.status === 204 ? 'OK' : `HTTP ERROR ${res.status}`
    console.log(
      `[USERS RELEASE] RESULT -> ${result}`
    )
  } catch (error) {
    var error_message = JSON.stringify(error.message)
    console.error(
      `[USERS RELEASE][ERROR] level=error HTTP ERROR: ${error_message}`
    )
  }
}

const setUserToSleep = async (userID) => {
  try {
    const urlUserSleep = `${server_winput}winput/ig/users/${userID}/sleep`
    var res = await axios.put(urlUserSleep)
    var result = res.status === 200 || res.status === 204 ? 'OK' : `HTTP ERROR ${res.status}`
    if (res.status === 200 || res.status === 204) {
      setCurrentUser(null)
    }
    console.log(`[USER SLEEP] USER ID: ${userID} RESULT -> ${result}`)
  } catch (error) {
    var error_message = JSON.stringify(error.message)
    console.error(
      `[USER SLEEP][ERROR] level=error USER ID: ${userID} -> HTTP ERROR: ${error_message}`
    )
  }
}

const workdayFinish = (workdayFinishDate) => {
  const currentDate = dayjs();
  const workdayFinish = !!(currentDate >= workdayFinishDate);
  return workdayFinish;
}

const userManager = {
  async getSearchUser() {
    var winputUserResponse
    var userPack = getCurrentUser()
  
    if (!userPack) {
      winputUserResponse = await getWinputUser()
      userPack = winputUserResponse.user
    } else if (workdayFinish(userPack.workdayFinishDate)) {
      await setUserToSleep(userPack.id)
      winputUserResponse = await getWinputUser()
      userPack = winputUserResponse.user
    }

    if (winputUserResponse && winputUserResponse.type === 'no_users') {
      await releaseUsers()
      winputUserResponse = await getWinputUser()
      userPack = winputUserResponse.user
    }
  
    return userPack
  },
  async setUserToWait(userID) {
    try {
      const urlUserWait = `${server_winput}winput/ig/users/${userID}/wait`
      var res = await axios.put(urlUserWait)
      var result = res.status === 200 || res.status === 204 ? 'OK' : `HTTP ERROR ${res.status}`
      console.log(
        `[USER WAIT] USER ID: ${userID} RESULT -> ${result}`
      )
      if (res.status === 200 || res.status === 204) {
        setCurrentUser(null)
      }
    } catch (error) {
      var error_message = JSON.stringify(error.message)
      console.error(
        `[USER WAIT][ERROR] level=error USER ID: ${userID} -> HTTP ERROR: ${error_message}`
      )
    }
  },
  async setUserInQuarantine(userID) {
    try {
      const urlUserQuarantine = `${server_winput}winput/ig/users/${userID}/quarantine`
      var res = await axios.put(urlUserQuarantine)
      var result = res.status === 200 || res.status === 204 ? 'OK' : `HTTP ERROR ${res.status}`
      console.log(
        `[USER QUARANTINE] USER ID: ${userID} RESULT -> ${result}`
      )
      if (res.status === 200 || res.status === 204) {
        setCurrentUser(null)
      }
    } catch (error) {
      var error_message = JSON.stringify(error.message)
      console.error(
        `[USER QUARANTINE][ERROR] level=error USER ID: ${userID} -> HTTP ERROR: ${error_message}`
      )
    }
  },
  isRestTime() {
    const currentUser = getCurrentUser()
    const currentDate = dayjs();
    const restTime = currentUser ? !!(currentDate >= currentUser.nextRestDate) : false;
    return restTime;
  }
}

module.exports = userManager