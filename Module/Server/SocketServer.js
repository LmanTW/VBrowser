const { Server } = require('socket.io')

const { checkSession } = require('./Session')
const newConnection = require('./UserHandlers/Main')

//開始 Socket 伺服器
module.exports = (httpServer) => {
  let socketServer = new Server(httpServer)

  socketServer.on('connection', async (client) => {
    if (checkSession(client.handshake.auth.session) === 'false') client.disconnect()
    else newConnection(client)
  })

  return socketServer
}