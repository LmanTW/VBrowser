module.exports = { createInterval, deleteInterval }

const generateID = require('./GenerateID')

let timers = []

setInterval(() => {
  let time = performance.now()
  timers.forEach((item) => {
    if (time-item.lastUpdateTime > item.interval) {
      item.lastUpdateTime = time
      item.callback()
    }
  })
}, 1)

//創建 Interval
function createInterval (interval, callback) {
  let id = generateID(5, timers.map((item) => {return item.id}))
  timers.push({
    id,
    interval,
    callback,
    lastUpdateTime: performance.now()
  })
  return id
}

//刪除 Interval
function deleteInterval (id) {
  delete timers[id]
}