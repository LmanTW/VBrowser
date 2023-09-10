//瀏覽歷史
module.exports = (client, sessionData, accountData) => {
  client.on('goBack', async (data) => {
    checkConnection(client, data.session)

    if (!sessionData.goingToHistory) {
      if (sessionData.historyIndex > 0) sessionData.historyIndex--

      sessionData.state = 'loading'
      try {
        sessionData.goingToHistory = true
        await sessionData.page.goto(accountData.history[sessionData.historyIndex], { waitUntil: 'domcontentloaded' })
      } catch (error) {}
      sessionData.state = 'idle'
    }
  })
  client.on('goFoward', async (data) => {
    checkConnection(client, data.session)

    if (!sessionData.goingToHistory) {
      if (sessionData.historyIndex < accountData.history.length-1) sessionData.historyIndex++

      sessionData.state = 'loading'
      try {
        sessionData.goingToHistory = true
        await sessionData.page.goto(accountData.history[sessionData.historyIndex], { waitUntil: 'domcontentloaded' })
      } catch (error) {}
      sessionData.state = 'idle'
    }
  })
  client.on('reload', async (data) => {
    checkConnection(client, data.session)

    sessionData.state = 'loading'
    await sessionData.page.reload({ waitUntil: 'domcontentloaded' })
    sessionData.state = 'idle'
  })
}

const checkConnection = require('./CheckConnection')