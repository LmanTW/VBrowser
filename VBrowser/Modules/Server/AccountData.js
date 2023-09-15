const fs = require('fs')

//帳號資料庫
module.exports = class {
  #VBrowser
  #data

  constructor (VBrowser) {
    this.#VBrowser = VBrowser

    this.#data = (this.#VBrowser.config.accountsDataFilePath === undefined) ? require('../../Data/AccountsData.json') : require(this.#VBrowser.config.accountsDataFilePath)
  
    Object.keys(VBrowser.config.accounts).forEach((item) => {
      if (this.#data[item] === undefined) this.#data[item] = {
        token: generateID(50, Object.keys(this.#data).map((item) => this.#data[item].token)),

        resolution: VBrowser.config.accounts[item].maxResolution,
        fps: VBrowser.config.accounts[item].maxFPS,

        bookMart: [],
        history: ['https://google.com'],
        historyIndex: 0,

        cookies: {}
      }
    })

    Object.keys(this.#data).forEach((item) => {
      if (this.#VBrowser.config.accounts[item] === undefined) delete this.#VBrowser.config.accounts[item]
    })

    fs.writeFileSync((this.#VBrowser.config.accountsDataFilePath === undefined) ? getPath(__dirname, ['<', '<', 'Data', 'AccountsData.json']) : this.#VBrowser.config.accountsDataFilePath, JSON.stringify(this.#data))
    
    createInterval(60000, () => fs.writeFileSync((this.#VBrowser.config.accountsDataFilePath === undefined) ? getPath(__dirname, ['<', '<', 'Data', 'AccountsData.json']) : this.#VBrowser.config.accountsDataFilePath, JSON.stringify(this.#data)))
    process.on('exit', () => fs.writeFileSync((this.#VBrowser.config.accountsDataFilePath === undefined) ? getPath(__dirname, ['<', '<', 'Data', 'AccountsData.json']) : this.#VBrowser.config.accountsDataFilePath, JSON.stringify(this.#data)))
  }

  //登入
  login (username, password) {
    if (this.#VBrowser.config.accounts[username] === undefined || password !== this.#VBrowser.config.accounts[username].password) return 'wrongUsernameOrPassowd'
    else {
      this.#data[username].token = generateID(50, Object.keys(this.#data).map((item) => this.#data[item].token))
      return this.#data[username].token
    }
  }
  //檢查密鑰
  checkToken (token) {
    let keys = Object.keys(this.#data)
    for (let i = 0; i < keys.length; i++) {
      if (this.#data[keys[i]].token === token) return 'true'
    }
    return 'false'
  }
  //取得帳號資料
  getAccountData (token) {
    let keys = Object.keys(this.#data)
    for (let i = 0; i < keys.length; i++) {
      if (this.#data[keys[i]].token === token) return Object.assign(this.#data[keys[i]], { username: keys[i] })
    }
  }
  //檢查帳號資料
  checkAccountData (username) {
    this.#data[username].resolution = (this.#data[username].resolution > this.#VBrowser.config.accounts[username].maxResolution) ? this.#VBrowser.config.accounts[username].maxResolution : this.#data[username].resolution
    this.#data[username].fps = (this.#data[username].fps > this.#VBrowser.config.accounts[username].maxFPS) ? this.#VBrowser.config.accounts[username].maxFPS : this.#data[username].fps

    while (this.#data[username].history.length > this.#VBrowser.config.accounts[username].maxHistoryLength) this.#data[username].history.splice(0, 1)
  }
}

const { createInterval } = require('./Tools/Interval')
const generateID = require('./Tools/GenerateID')
const getPath = require('./Tools/GetPath')