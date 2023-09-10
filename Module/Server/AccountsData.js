const fs = require('fs')

module.exports = { loadAccountsData, getAccountData }

const getPath = require('./Tools/GetPath')

const config = require('../../config.json')

let accountsData = {}

//加載帳戶的資料
function loadAccountsData () {
  accountsData = require('./Data/Accounts.json')

  Object.keys(config.accounts).forEach((item) => {
    if (accountsData[item] === undefined) accountsData[item] = {
      history: ['https://google.com'],
      bookmark: []
    }
  })

  Object.keys(accountsData).forEach((item) => {
    if (config.accounts[item] === undefined) delete accountsData[item]
  })

  fs.writeFileSync(getPath(__dirname, ['Data', 'Accounts.json']), JSON.stringify(accountsData))
}

//儲存用戶的資料
function saveAccountsData () {
  fs.writeFileSync(getPath(__dirname, ['Data', 'Accounts.json']), JSON.stringify(accountsData))
}

//取得帳戶的資料
function getAccountData(username) {
  return accountsData[username]
}

setInterval(() => saveAccountsData, 30000)

process.addListener('exit', () => saveAccountsData())