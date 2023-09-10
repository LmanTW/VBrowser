const http = require('http')
const url = require('url')
const fs = require('fs')

const getPath = require('./Tools/GetPath')

const { createSession, checkSession, closeSession } = require('./Session')

const config = require('../../config.json')

//開始 Http 伺服器
module.exports = () => {
  let httpServer = http.createServer(async (req, res) => {
    let path = url.parse(req.url, true).path
    if (path.includes('?')) path = path.substring(0, path.indexOf('?'))
    path = path.split('/')
    path.splice(0, 1)

    if (path[0] === 'api') {
      let query = url.parse(req.url, true).query

      if (path[1] === 'checkSession') res.end(checkSession(query.session))
      else if (path[1] === 'login') res.end(await createSession(query.username, query.password))
      else if (path[1] === 'logout') res.end(await closeSession(query.session))
    } else if (path[0] === 'image') {
      if (fs.existsSync(getPath(__dirname, ['<', 'Website', 'Images', path[1]]))) {
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
        res.end(fs.readFileSync(getPath(__dirname, ['<', 'Website', 'Images', path[1]])))
      }
      else res.end('Resource Not Found')
    } else if (path[0] === 'style') {
      if (fs.existsSync(getPath(__dirname, ['<', 'Website', 'Styles', path[1]]))) res.end(fs.readFileSync(getPath(__dirname, ['<', 'Website', 'Styles', path[1]])))
      else res.end('Resource Not Found')
    } else if (path[0] === 'script') {
      if (fs.existsSync(getPath(__dirname, ['<', 'Website', 'Scripts', path[1]]))) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.end(fs.readFileSync(getPath(__dirname, ['<', 'Website', 'Scripts', path[1]]), 'utf8'))
      } else res.end('Resource Not Found')
    } else if (fs.existsSync(getPath(__dirname, ['<', 'Website', 'Pages', `${path[0]}.html`]))) res.end(fs.readFileSync(getPath(__dirname, ['<', 'Website', 'Pages', `${path[0]}.html`])))
    else res.end(fs.readFileSync(getPath(__dirname, ['<', 'Website', 'Pages', 'browser.html'])))
  })

  httpServer.listen(config.port)

  return httpServer
}