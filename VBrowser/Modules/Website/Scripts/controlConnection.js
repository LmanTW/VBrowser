//開始控制連線
export default (socket) => {
  const button_reload = document.getElementById('button_reload')
  const input_url = document.getElementById('input_url')
  const canvas = document.getElementById('canvas')

  let oldMousePosition = { x: 0, y: 0 }
  let mousePosition = { x: 0, y: 0 }
  let mouseWheel = { deltaX: 0, deltaY: 0 }
  let isMouseHover = false

  socket.on('pageData', (data) => {
    if (data.state !== undefined) {
      button_reload.style.opacity = (data.state === 'idle') ? 1 : 0.5
    }
  })

  button_reload.onclick = () => {
    if (button_reload.style.opacity === '1') socket.emit('reload')
  }
  input_url.onchange = () => socket.emit('changeUrl', input_url.value)
  canvas.addEventListener('mouseenter', () => isMouseHover = true)
  canvas.addEventListener('mouseleave', () => isMouseHover = false)
  canvas.addEventListener('mousemove', (e) => {
    if (isMouseHover) {
      mousePosition.x = e.offsetX
    mousePosition.y = e.offsetY
    }
  })
  window.addEventListener('mousedown', (e) => {
    if (isMouseHover) socket.emit('mouseDown', { x: mousePosition.x, y: mousePosition.y, button: ['left', 'middle', 'right'][e.button] })
  })
  window.addEventListener('mouseup', (e) => {
    if (isMouseHover) socket.emit('mouseUp', ['left', 'middle', 'right'][e.button] )
  })
  window.addEventListener('mousewheel', (e) => {
    if (isMouseHover) {
      mouseWheel.deltaX+=e.deltaX
      mouseWheel.deltaY+=e.deltaY
    }
  })
  window.addEventListener('keydown', (e) => {
    if (isMouseHover) socket.emit('pressKey', e.key)
  })

  setInterval(() => {
    if (oldMousePosition.x !== mousePosition.x || oldMousePosition.y !== mousePosition.y) {
      oldMousePosition.x = mousePosition.x
      oldMousePosition.y = mousePosition.y
      socket.emit('moveMouse', { x: mousePosition.x, y: mousePosition.y })
    }
    
    if (mouseWheel.deltaX !== 0 || mouseWheel.deltaY !== 0) {
      socket.emit('scrollMouse', mouseWheel)
      mouseWheel = { deltaX: 0, deltaY: 0 }
    }
  }, 100)
}