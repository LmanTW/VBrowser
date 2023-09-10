const puppeteer = require('puppeteer') 

module.exports = { createSession, checkSession, getSessionData, closeSession }

const generateID = require('./Tools/GenerateID')

const { getAccountData } = require('./AccountsData')

const config = require('../../config.json')

let seassons = {}
let browser

setInterval(() => {
  Object.keys(seassons).forEach((item) => {
    if (Date.now()-seassons[item].createDate > 1000*60*60*12) closeSession(item)
  })
}, 1000)

//創建會議
async function createSession (username, password) {
  if (config.accounts[username] === undefined || config.accounts[username].password !== password) return 'wrongUsernameOrPassword'
  else {
    let seasson = generateID(50, Object.keys(seassons))

    if (Object.keys(seassons).filter((item) => seassons[item].username === username).length > 0) {
      let keys = Object.keys(seassons)
      for (let i = 0; i < keys.length; i++) {
        if (seassons[keys[i]].username === username) {
          seassons[seasson] = seassons[keys[i]]
          delete seassons[keys[i]]
          break
        }
      }
    } else {
      let accountData = getAccountData(username)

      if (browser === undefined) browser = await puppeteer.launch({ headless: 'new' })

      let page = await browser.newPage()
      page.setDefaultNavigationTimeout(0)

      await page.goto(accountData.history[accountData.history.length-1], { waitUntil: 'load' })

      seassons[seasson] = { username, windowSize: {}, page, state: 'idle', historyIndex: accountData.history.length-1, goingToHistory: false, createDate: Date.now() }
    }

    return seasson
  }
}

//檢查會議
function checkSession (seasson) {
  return `${seassons[seasson] !== undefined}`
}

//取得會議
function getSessionData (seasson) {
  return seassons[seasson]
}

//關閉會議
async function closeSession (seasson) {
  if (seassons[seassons] === undefined) return 'sessionNotFound'
  await seassons[seasson].page.close()
  delete seassons[seasson]
}