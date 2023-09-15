const { Server } = require('socket.io')

//啟動 Socket 伺服器
module.exports = (VBrowser, httpServer) => {
  let socketServer = new Server(httpServer)

  socketServer.on('connection', (client) => {
    if (VBrowser.accountDatabase.checkToken(client.handshake.auth.token) === 'false') client.disconnect()
    else newConnection(VBrowser, client)
  })
}

//新連線
async function newConnection (VBrowser, client) {
  let accountData = VBrowser.accountDatabase.getAccountData(client.handshake.auth.token)

  client.once('clientReady', async () => {
    let clientData = JSON.parse(client.handshake.query.clientData)

    accountData.resolution = clientData.resolution
    VBrowser.accountDatabase.checkAccountData(accountData.username)

    let page = await VBrowser.browser.newPage(VBrowser.config.accounts[accountData.username].taskInterval)
    await page.goto(accountData.history[accountData.historyIndex])
    if (typeof clientData.width === 'number' && typeof clientData.height === 'number') await page.setSize(clientData.width, clientData.height)

    client.emit('connectionStart', { displayMode: accountData.displayMode, resolution: accountData.resolution })

    updatePageData(client, { url: await page.getUrl() })
    trackHistory(VBrowser, page, client, accountData)
    controlConnection(VBrowser, page, client)

    let dataSent = {}
    let ping = 0

    let interval = createInterval(1000/accountData.fps, async () => {
      let id = generateID(5, Object.keys(dataSent))
      dataSent[id] = performance.now()
      client.emit('render', { data: await page.screenshot('jpeg', accountData.resolution*100, 'base64'), ping, id })
    })

    let interval2 = createInterval(100, () => {
      updatePageData(client, { tasks: page.tasks.length })
    })

    client.on('clientData', async (data) => {
      accountData.resolution = +data.resolution
      VBrowser.accountDatabase.checkAccountData(accountData.username)

      if (typeof +data.width === 'number' && typeof +data.height === 'number') await page.setSize(+data.width, +data.height)
    })

    client.on('receiveRenderData', (id) => {
      ping = performance.now()-dataSent[id]
      delete dataSent[id]
    })

    client.on('disconnect', async () => {
      deleteInterval(interval)
      deleteInterval(interval2)
      await page.close()
    })
  })
}

//更新頁面資料
function updatePageData (client, data) {
  client.emit('pageData', data)
}

//追蹤歷史紀錄
async function trackHistory (VBrowser, page, client, accountData) {
  let url = await page.getUrl()

  async function loop () {
    let newUrl = await page.getUrl()

    if (newUrl !== null && url !== newUrl) {
      url = newUrl

      if (accountData.historyIndex === accountData.history.length-1) {
        accountData.history.push(url)
        VBrowser.accountDatabase.checkAccountData(accountData.username)
        accountData.historyIndex = accountData.history.length-1
      } else {
        accountData.history.splice(accountData.historyIndex, accountData.history.length-accountData.historyIndex)
        accountData.history.push(url)
        accountData.historyIndex = accountData.history.length-1
      }

      updatePageData(client, { url })
    }

    setTimeout(() => loop(), 100)
  }
  
  loop()
}

//控制連線
function controlConnection (VBrowser, page, client) {
  client.on('reload', async () => {
    updatePageData(client, { state: 'loading' })
    await page.reload()
    updatePageData(client, { state: 'idle' })
  })
  client.on('changeUrl', async (url) => {
    try {
      new URL(url)
      try {await fetch(url)}
      catch (error) {url = `https://www.google.com/search?q=${url}`}
    } catch (error) {url = `https://www.google.com/search?q=${url}`}
    updatePageData(client, { state: 'loading' })
    await page.goto(url)
    updatePageData(client, { state: 'idle' })
  })
  client.on('moveMouse', (data) => page.mouse.move(data.x, data.y))
  client.on('mouseDown', async (data) => {
    await page.mouse.move(data.x, data.y)
    page.mouse.down(data.button)
  })
  client.on('scrollMouse', (data) => page.mouse.scroll(data.deltaX, data.deltaY))
  client.on('mouseUp', (data) => page.mouse.up(data))
  client.on('pressKey', (data) => page.keyboard.press(data))
}

const { createInterval, deleteInterval } = require('./Tools/Interval')
const generateID = require('./Tools/GenerateID')
