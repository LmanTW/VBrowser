//用戶輸入
module.exports = (client, sessionData) => {
  let mouse = { oldX: 0, oldY: 0, x: 0, y: 0, down: false, up: false, pressing: false }

  client.on('mouseMove', (data) => {
    checkConnection(client, data.session)
    mouse.x = data.x
    mouse.y = data.y
  })
  client.on('mouseDown', (data) => {
    checkConnection(client, data.session)
    mouse.down = true
  })
  client.on('mouseUp', (data) => {
    checkConnection(client, data.session)
    mouse.up = true
  })
  client.on('mouseWheel', (data) => {
    checkConnection(client, data.session)
    sessionData.page.mouse.wheel(data)
  })
  client.on('keyPress', async (data) => {
    checkConnection(client, data.session)
    try {await sessionData.page.keyboard.press(data.key)} 
    catch (error) {sessionData.page.keyboard.type(data.key)}
  })

  return async () => {
    if (mouse.oldX !== mouse.x || mouse.oldY !== mouse.y) {
      await sessionData.page.mouse.move(mouse.x, mouse.y)
      mouse.oldX = mouse.x
      mouse.oldY = mouse.y
    }

    if (mouse.down && !mouse.pressing) {
      try {await sessionData.page.mouse.click(mouse.x, mouse.y)} catch (error) {}
      try {await sessionData.page.mouse.down()} catch (error) {}
      mouse.down = false
      mouse.pressing = true
    }
    if (mouse.up && mouse.pressing) {
      try {await sessionData.page.mouse.up()} catch (error) {}
      mouse.up = false
      mouse.pressing = false
    }
  }
}

const checkConnection = require('./CheckConnection')