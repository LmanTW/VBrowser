//啟動工具欄
export default (socket, accountData) => {
  const toolMenu = document.getElementById('toolMenu')
  const button_toolMenu = document.getElementById('button_toolMenu')
  const button_settings = document.getElementById('button_settings')
  const button_bookmart = document.getElementById('button_bookmart')
  const button_taskMonitor = document.getElementById('button_taskMonitor')

  let state = false
  let windows = {}

  let pageData = {}

  socket.on('pageData', (data) => pageData = Object.assign(pageData, data))

  button_toolMenu.onclick = () => {
    if (state) {
      toolMenu.style.left = '-50px'
      button_toolMenu.style.left = '15px'
      button_toolMenu.style.transform = 'rotate(0deg)'
    } else {
      toolMenu.style.left = '0px'
      button_toolMenu.style.left = '60px'
      button_toolMenu.style.transform = 'rotate(180deg)'
    }
    state = !state
  }

  button_settings.onclick = () => {
    if (windows.settings === undefined) {
      windows.settings = new Window('Settings')

      settings(windows.settings, socket, accountData)

      windows.settings.event('close', () => delete windows.settings)
    } else windows.settings.close()
  }
  button_taskMonitor.onclick = () => {
    if (windows.taskMonitor === undefined) {
      windows.taskMonitor = new Window('Task Monitor')

      taskMonitor(windows.taskMonitor, () => pageData.tasks)

      windows.taskMonitor.event('close', () => delete windows.taskMonitor)
    } else windows.taskMonitor.close()
  }
}

import taskMonitor from '/script/taskMonitor.js'
import settings from '/script/settings.js'
import Window from '/script/window.js'