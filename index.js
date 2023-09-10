require('./Module/Server/AccountsData').loadAccountsData()
let httpServer = require('./Module/Server/HttpServer')()
let socketServer = require('./Module/Server/SocketServer')(httpServer)

//https://coolors.co/080708-3772ff-df2935-fdca40-e6e8e6