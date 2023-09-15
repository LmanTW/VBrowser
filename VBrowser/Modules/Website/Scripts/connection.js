//連線
export default (socket, accountData, updatePing) => {
  socket.on('disconnect', () => window.location.href = '/login')

  socket.on('connectionStart', (data) => {
    accountData = data

    startControlConnection(socket)

    setInterval(() => {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight-75) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight-75
        socket.emit('clientData', { resolution: accountData.resolution, width: canvas.width, height: canvas.height })
      }
    }, 100)

    socket.on('pageData', (data) => {
      if (data.url !== undefined) input_url.value = data.url

    })

    socket.on('render', (data) => {
      updatePing(data.ping)

      let image = new Image()

      image.onload = () => {
        socket.emit('receiveRenderData', data.id)

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      }

      image.src = `data:image/png;base64,${data.data}`
    })

    socket.once('render', () => {
      setTimeout(() => {
        loading.style.opacity = 0
        setTimeout(() => loading.remove(), 1000)
      }, 500)
    })
  })

  socket.emit('clientReady')
}

import startControlConnection from '/script/controlConnection.js'

const loading = document.getElementById('loading')
const input_url = document.getElementById('input_url')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')