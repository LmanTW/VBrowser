const puppeteer = require('puppeteer') 

module.exports = { createSession, checkSession, getSessionData }

const generateID = require('./Tools/GenerateID')

const config = require('../../config.json')

let seassons = {}

setInterval(() => {
  Object.keys(seassons).forEach((item) => {
    if (Date.now()-seassons[item].createDate > 1000*60*60*12) delete seassons[item]
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
      let browser = await puppeteer.launch({ headless: 'new' })
      let page = await browser.newPage()

      page.setDefaultNavigationTimeout(0)
      await page.goto('https://google.com', { waitUntil: 'load' })

      seassons[seasson] = { username, windowSize: {}, browser, page, state: 'idle', createDate: Date.now() }
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