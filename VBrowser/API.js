//VBrowser
module.exports = class {
  #config
  #browser
  #accountDatabase

  constructor (config) {
    this.#config = Object.assign({
      accountsDataFilePath: undefined,
      accounts: {
        admin: {
          password: 'abc123',

          maxResolution: 1,
          maxFPS: 10,
          taskInterval: 10,

          maxBookmarkLength: 10,
          maxHistoryLength: 10
        }
      },

      port: 8080,
      chromePath: undefined
    }, config)

    this.#browser = new Browser(this.#config.chromePath)
    this.#accountDatabase = new AccountDatabase(this)

    let httpServer = startHttpServer(this)
    let socketServer = startSocketServer(this, httpServer)
  }

  get config () {return this.#config}

  get browser () {return this.#browser}
  get accountDatabase () {return this.#accountDatabase}
}

const startSocketServer = require('./Modules/Server/SocketServer')
const AccountDatabase = require('./Modules/Server/AccountData')
const startHttpServer = require('./Modules/Server/HttpServer')
const Browser = require('./Modules/Server/Browser/Main')