//滑鼠
module.exports = class {
  #mouseData = { x: 0, y: 0, pressing: {} }
  #addTask

  constructor (addTask) {
    this.#addTask = addTask
  }

  //移動滑鼠
  async move (x, y) {
    this.#mouseData.x = x
    this.#mouseData.y = y
    await this.#addTask('moveMouse', { x, y })
  }
  //點擊滑鼠
  async click (button) {
    if (button === undefined) button = 'left'
    if (this.#mouseData.pressing[button] === undefined) {
      await this.#addTask('clickMouse', { x: this.#mouseData.x, y: this.#mouseData.y, button })
    }
  }
  //按下滑鼠
  async down (button) {
    if (button === undefined) button = 'left'
    if (this.#mouseData.pressing[button] === undefined) {
      this.#mouseData.pressing[button] = true
      await this.#addTask('mouseDown', button)
    }
  }
  //放開滑鼠
  async up (button) {
    if (button === undefined) button = 'left'
    if (this.#mouseData.pressing[button] === true) {
      delete this.#mouseData.pressing[button]
      await this.#addTask('mouseUp', button)
    }
  }
  //滾動滾輪
  async scroll (deltaX, deltaY) {
    await this.#addTask('scrollMouse', { deltaX, deltaY })
  }
}