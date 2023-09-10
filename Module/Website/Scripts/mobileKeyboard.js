//移動設備鍵盤
export default (socket) => {
  if (localStorage.mobile || window.navigator.maxTouchPoints > 1) {
    const button_keyboard = document.body.appendChild(createElement('img', { src: '/image/caret_up.svg', style: { position: 'fixed', backgroundColor: 'var(--blue)', borderRadius: '10px', left: '10px', bottom: '10px', padding: '10px', width: '40px' }}))
    const input_keyboard = document.getElementById('input_keyboard')

    button_keyboard.onclick = () => input_keyboard.focus()

    input_keyboard.addEventListener('keydown') = (e) => socket.emit('keyPress', e.key)
  }
}

import { createElement } from '/script/element.js'