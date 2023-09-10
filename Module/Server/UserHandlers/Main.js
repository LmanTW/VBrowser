//處理用戶的連接
module.exports = async (client) => {
  let sessionData = getSessionData(client.handshake.auth.session)
  let accountData = getAccountData(sessionData.username)

  sessionData.windowSize = { width: +client.handshake.query.width, height: +client.handshake.query.height }

  await sessionData.page.setViewport(sessionData.windowSize)
  await sendPageData(client, sessionData, accountData)

  let oldUrl = await sessionData.page.url()
  let window = sessionData.windowSize
  let coolDown = 0

  let moveMouse = inputConnection(client, sessionData)
  historyConnection(client, sessionData, accountData)

  client.on('windowResize', (size) => sessionData.windowSize = size)
  client.on('changeUrl', async (data) => {
    checkConnection(client, sessionData)

    try {new URL(data.url)}
    catch (error) {data.url = `https://google.com/search?q=${data.url}`}

    sessionData.state = 'loading'
    await sessionData.page.goto(data.url, { waitUntil: 'domcontentloaded' })
    sessionData.state = 'idle'
    
    sendPageData(client, sessionData, accountData)
  })
  
  client.on('ping', (ping) => {
    if (ping > 250) coolDown = 5
  })
  
  let interval = setInterval(async () => {
    if (sessionData.windowSize.width !== window.width || sessionData.windowSize.height !== window.height) {
      await sessionData.page.setViewport(sessionData.windowSize)
      window = sessionData.windowSize
    }

    await moveMouse()

    sendPageState(client, sessionData)
    if (oldUrl !== await sessionData.page.url()) {
      oldUrl = await sessionData.page.url()
      if (sessionData.goingToHistory) sessionData.goingToHistory = false
      else {
        if (sessionData.historyIndex === accountData.history.length-1) {
          accountData.history.push(await sessionData.page.url())
          while (accountData.history.length > config.maxHistoryLength) accountData.history.splice(0, 1)
          sessionData.historyIndex = accountData.history.length-1
        } else {
          accountData.history.splice(sessionData.historyIndex, accountData.history.length-sessionData.historyIndex)
          accountData.history.push(await sessionData.page.url())
          sessionData.historyIndex = accountData.history.length-1
        }
      }
      sendPageData(client, sessionData, accountData)
    }

    if (coolDown > 0) coolDown--
    else sendFrame(client, sessionData, config.resolution*100)
  }, 100)

  client.on('disconnect', () => clearInterval(interval))
}

//發送頁面狀態
async function sendPageState (client, sessionData) {
  client.emit('pageState', { state: sessionData.state })
}

//發送頁面資料
async function sendPageData (client, sessionData, accountData) {
  client.emit('pageData', { url: await sessionData.page.url(), canGoBack: sessionData.historyIndex > 0, canGoFoward: sessionData.historyIndex < accountData.history.length-1 })
}

//發送畫面
async function sendFrame (client, sessionData, quality) {
  try {
    client.emit('frame', { sendDate: Date.now(), data: await sessionData.page.screenshot({ type: 'jpeg', quality: quality, optimizeForSpeed: true, encoding: 'base64' }) })
  } catch (error) {}
}

const { getAccountData } = require('../AccountsData')
const checkConnection = require('./CheckConnection')
const { getSessionData } = require('../Session')
const historyConnection = require('./History')
const inputConnection = require('./Input') 

const config = require('../../../config.json')

