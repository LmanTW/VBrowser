//設定
export default (window_, socket) => {
  let div = window_.content.appendChild(createElement('div', { style: { display: 'flex' }}))
  div.appendChild(createElement('h3', { innerHTML: 'Resolution', style: { color: 'var(--white)', marginLeft: '10px', marginRight: '10px', marginTop: '10px' }}))
  div.appendChild(createElement('input', { type: 'range', style: { backgroundColor: 'var(--white)' }}))
}

import { createElement } from '/script/element.js'