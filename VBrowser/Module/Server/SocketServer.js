const { Server } = require('socket.io')

const { checkSession, getSessionData } = require('./Session')

const config = require('../../config.json')

//開始 Socket 伺服器
module.exports = (httpServer) => {
  let socketServer = new Server(httpServer)

  socketServer.on('connection', async (client) => {
    if (checkSession(client.handshake.auth.session) === 'false') client.disconnect()
    else {
      let sessionData = getSessionData(client.handshake.auth.session)

      sessionData.windowSize = { width: +client.handshake.query.width, height: +client.handshake.query.height }

      await sessionData.page.setViewport(sessionData.windowSize)
      await sendPageData(client, sessionData)

      let oldUrl = await sessionData.page.url()
      let window = sessionData.windowSize
      let mouse = { oldX: 0, oldY: 0, x: 0, y: 0, down: false, up: false, pressing: false }
      let coolDown = 0

      client.on('windowResize', (size) => sessionData.windowSize = size)
      client.on('changeUrl', async (content) => {
        try {
          new URL(content)
        } catch (error) {
          content = `https://google.com/search?q=${content}`
        }

        sessionData.state = 'loading'
        await sessionData.page.goto(content, { waitUntil: 'domcontentloaded' })
        sessionData.state = 'idle'
      })
      client.on('mouseMove', (position) => {
        mouse.x = position.x
        mouse.y = position.y
      })
      client.on('mouseDown', () => mouse.down = true)
      client.on('mouseUp', () => mouse.up = true)
      client.on('mouseWheel', (data) => sessionData.page.mouse.wheel(data))
      client.on('keyPress', async (key) => {
        try {
          sessionData.page.keyboard.press(key)
        } catch (error) {
          sessionData.page.keyboard.type(key)
        }
      })
      client.on('ping', (ping) => {
        if (ping > 250) coolDown = 5
      })
      
      let interval = setInterval(async () => {
        if (sessionData.windowSize.width !== window.width || sessionData.windowSize.height !== window.height) {
          await sessionData.page.setViewport(sessionData.windowSize)
          window = sessionData.windowSize
        }

        if (mouse.oldX !== mouse.x || mouse.oldY !== mouse.y) {
          await sessionData.page.mouse.move(mouse.x, mouse.y)
          mouse.oldX = mouse.x
          mouse.oldY = mouse.y
        }

        if (mouse.down && !mouse.pressing) {
          try {await sessionData.page.mouse.click(mouse.x, mouse.y)} catch (error) {}
          try {await sessionData.page.mouse.down()} catch (error) {}
          mouse.down = false
          mouse.pressing = true
        }
        if (mouse.up && mouse.pressing) {
          try {await sessionData.page.mouse.up()} catch (error) {}
          mouse.up = false
          mouse.pressing = false
        }

        if (oldUrl !== await sessionData.page.url()) {
          oldUrl = await sessionData.page.url()
          sendPageData(client, sessionData)
        }

        if (coolDown > 0) coolDown--
        else sendFrame(client, sessionData, config.resolution*100)
      }, 100)

      client.on('disconnect', () => clearInterval(interval))
    }
  })

  return socketServer
}

//發送頁面資料
async function sendPageData (client, sessionData) {
  client.emit('pageData', { url: await sessionData.page.url(), state: sessionData.state })
}

//發送畫面
async function sendFrame (client, sessionData, quality) {
  try {
    client.emit('frame', { sendDate: Date.now(), data: await sessionData.page.screenshot({ type: 'jpeg', quality: quality, optimizeForSpeed: true, encoding: 'base64' }) })
  } catch (error) {}
}