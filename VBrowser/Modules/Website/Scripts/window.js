//創建視窗
export default class {
  #size
  #window
  #content
  #events = {}

  constructor (title, x, y, width, height) {
    if (width === undefined) width = 500
    if (height === undefined) height = 300
    this.#size = { width, height }

    this.#window = document.body.appendChild(createElement('div', { classList: 'shadow', style: { position: 'fixed', background: 'var(--blue)', borderRadius: '10px', left: (window.innerWidth/2)-(width/2), top: (window.innerHeight/2)-(height/2), width: `${width}px`, height: `${height}px`, overflow: 'hidden' }}))
    let windowBar = this.#window.appendChild(createElement('div', { style: { display: 'flex', alignItems: 'center', width: `${width}px`, height: '40px', cursor: 'grab' }}))
    let windowTitle = windowBar.appendChild(createElement('h2', { innerHTML: title, style: { flex: 1, color: 'var(--white)', marginLeft: '10px' }}))
    let windowCloseButton = windowBar.appendChild(createElement('img', { src: '/image/close.svg', style: { width: '30px', marginRight: '5px' }}))
    this.#content = this.#window.appendChild(createElement('div', { style: { backgroundColor: '2264FF', width: `${width}px`, height: `${height-40}px` }}))
  
    windowBar.addEventListener('mousedown', (e) => {
      let startMousePosition = { x: e.clientX, y: e.clientY }
      let startWindowPosition = { x: this.#window.getBoundingClientRect().left, y: this.#window.getBoundingClientRect().top }
      
      window.addEventListener('mousemove', mouseMove)

      let _window = this.#window
      function mouseMove (e) {
        _window.style.left = startWindowPosition.x+(e.clientX-startMousePosition.x)
        _window.style.top = startWindowPosition.y+(e.clientY-startMousePosition.y)
      }

      windowBar.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', mouseMove)
      }, { once: true })

      windowCloseButton.onclick = () => {
        this.#window.remove()
        this.#callEvent('close')
        this.#events = {}
      }
    })
  }

  get width () {return this.#size.width}
  get height () {return this.#size.height-40}
  get content () {return this.#content}

  close () {
    this.#callEvent('close')
    this.#window.remove()
  }

  //聆聽事件
  event (name, callback) {
    if (this.#events[name] === undefined) this.#events[name] = []
    this.#events[name].push(callback)
  }

  //呼叫事件
  #callEvent (name, data) {
    if (this.#events[name] !== undefined) this.#events[name].forEach((item) => item(data))
  }
}

import { createElement } from '/script/element.js'