//檢查會議
module.exports = (client, session) => {
  if (!checkSession(session)) client.disconnect()
}

const { checkSession } = require('../Session')