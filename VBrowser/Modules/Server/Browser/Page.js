//頁面
module.exports = class {
  #browser
  #id
  #tasks = []

  constructor (browser, id, updateInterval) {
    this.#browser = browser
    this.#id = id

    this.#executeTask(updateInterval)

    this.#browser.pages[this.#id].on('loading', () => console.log(true))

    this.mouse = new Mouse(async (name, data, callback) => await this.#addTask(name, data, callback))
    this.keyboard = new Keyboard(async (name, data, callback) => await this.#addTask(name, data, callback))
  }

  get tasks () {return this.#tasks}

  //取得標題
  async getTitle () {{
    if (this.#browser.pages[this.#id] !== undefined) return await this.#browser.pages[this.#id].title()
  }}
  //取得連結
  async getUrl () {
    if (this.#browser.pages[this.#id] !== undefined) return await this.#browser.pages[this.#id].url()
  }
  //取得內容
  async getContent () {
    if (this.#browser.pages[this.#id] !== undefined) return await this.#browser.pages[this.#id].content()
  }
  //取得Cookie
  async getCookie () {
    if (this.#browser.pages[this.#id] !== undefined) return await this.#browser.pages[this.#id].cookies()
  }

  //設定大小
  async setSize (width, height) {
    await this.#addTask('setSize', { width, height })
  }
  //前往頁面
  async goto (url) {{
    try {new URL(url)}
    catch (error) {url = `https://www.google.com/search?q=${url}`}

    try {await fetch(url)}
    catch (error) {url = `https://www.google.com/search?q=${url}`}

    this.#tasks = []
    return await this.#addTask('goto', url)
  }}
  //重新加載視窗
  async reload () {
    await this.#addTask('reload')
  }
  //擷取視窗
  async screenshot (type, quality, encoding) {
    return await this.#addTask('screenshot', { type, quality, encoding, optimizeForSpeed: true })
  }
  //關閉視窗
  async close () {
    await this.#addTask('close')
  }

  //添加任務
  #addTask = async (name, data) => {
    return new Promise((resolve) => {
      this.#tasks.push({ name, data, callback: (callbackData) => resolve(callbackData) })
    })
  }

  //執行任務
  #executeTask = async (updateInterval) => {
    if (this.#tasks.length > 0) {
      while (this.#tasks.length > 25) this.#tasks.splice(0, 1)

      let task = this.#tasks[0]

      try {
        if (task.name === 'setSize') task.callback(await this.#browser.pages[this.#id].setViewport(task.data))
        else if (task.name === 'goto') task.callback(await this.#browser.pages[this.#id].goto(task.data, { waitUntil: 'domcontentloaded' }))
        else if (task.name === 'reload') task.callback(await this.#browser.pages[this.#id].reload({ waitUntil: 'domcontentloaded' }))
        else if (task.name === 'screenshot') task.callback(await this.#browser.pages[this.#id].screenshot(task.data))

        else if (task.name === 'moveMouse') task.callback(await this.#browser.pages[this.#id].mouse.move(task.data.x, task.data.y))
        else if (task.name === 'clickMouse') task.callback(await this.#browser.pages[this.#id].mouse.click(task.data.x, task.data.y, { button: task.data.button }))
        else if (task.name === 'mouseDown') task.callback(await this.#browser.pages[this.#id].mouse.down({ button: task.data }))
        else if (task.name === 'mouseUp') task.callback(await this.#browser.pages[this.#id].mouse.up({ button: task.data }))
        else if (task.name === 'scrollMouse') task.callback(await this.#browser.pages[this.#id].mouse.wheel(task.data))

        else if (task.name === 'pressKeyboard') task.callback(await this.#browser.pages[this.#id].keyboard.press(task.data))
        else if (task.name === 'keyboardType') task.callback(await this.#browser.pages[this.#id].keyboard.type(task.data))

        else if (task.name === 'close') return task.callback(await this.#browser.closePage(this.#id))
      } catch (error) {}

      this.#tasks.splice(0, 1)
    }

    setTimeout(() => this.#executeTask(updateInterval), updateInterval)
  }
}

const Keyboard = require('./Keyboard')
const Mouse = require('./Mouse')