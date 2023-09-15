const puppeteer = require('puppeteer')

//瀏覽器
module.exports = class {
  #browser
  #pages = {}

  #tasks = []

  constructor (chromePath) {
    (async () => {
      this.#browser = await puppeteer.launch({
        headless: 'new',
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-gpu'] })

      this.#executeTask()

      process.on('exit', () => this.#browser.close())
    })()
  }

  get pages () {return this.#pages}

  //新頁面
  async newPage (taskInterval) {
    let id = generateID(10, Object.keys(this.#pages))

    this.#pages[id] = await this.#addTask('newPage')
    this.#pages[id].setDefaultNavigationTimeout(0)

    return new Page(this, id, taskInterval)
  }
  //關閉頁面
  async closePage (id) {
    if (this.#pages[id] === undefined) throw new Error(`Page Not Found (${id})`)
    await this.#pages[id].close()
    delete this.#pages[id]
  }

  //添加任務
  #addTask = async (name, data) => {
    return new Promise((resolve) => {
      this.#tasks.push({ name, data, callback: (callbackData) => resolve(callbackData) })
    })
  }

  //執行任務
  #executeTask = async () => {
    if (this.#tasks.length > 0) {
      let task = this.#tasks[0]

      if (task.name === 'newPage') task.callback(await this.#browser.newPage())

      this.#tasks.splice(0, 1)
    }

    setTimeout(() => this.#executeTask(), 10)
  }
}

const Page = require('./Page')

const letters = 'abcdefghijklmnopqrstuvwxyz1234567890'

//取得隨機數
function getRandom (min, max) {
  return Math.floor(Math.random()*max)+min
}

//生成ID
function generateID (length, keys) {
  //生成一串ID
  function generateAnID (length) {
    let string = ''
    for (let i = 0; i < length; i++) string+=letters[getRandom(0, letters.length)]

    return string
  }

  let string = generateAnID(length)
  while (keys.includes(string)) string = generateAnID(length)

  return string
}