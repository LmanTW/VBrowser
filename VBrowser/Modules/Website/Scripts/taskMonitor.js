//任務監視器
export default (window_, getTasks) => {
  let canvas = window_.content.appendChild(createElement('canvas', {}))
  let ctx = canvas.getContext('2d')

  canvas.width = window_.width
  canvas.height = window_.height

  let taskRecord = []

  let interval = setInterval(() => {
    taskRecord.push(getTasks())
    while (taskRecord.length > 100) taskRecord.splice(0, 1)

    ctx.beginPath()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineCap = 'round'      
    ctx.lineWidth = 3

    let average = slice(taskRecord, 0, 5)
    ctx.moveTo(0, canvas.height-((average.reduce((a, b) => a+b)/average.length)*10)-10)
    taskRecord.forEach((item, index) => {
      average = slice(taskRecord, index-5, index+5)
      ctx.lineTo((window_.width/(taskRecord.length-1))*index, canvas.height-((average.reduce((a, b) => a+b)/average.length)*10)-10)
    })
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1

    ctx.moveTo(0, canvas.height-(taskRecord[0]*10)-10)
    taskRecord.forEach((item, index) => ctx.lineTo((window_.width/(taskRecord.length-1))*index, canvas.height-(item*10)-10))
    ctx.stroke()
  }, 100)

  window_.event('close', () => {
    clearInterval(interval)
  })
}

//切片陣列
function slice (array, start, end) {
  let data = []
  for (let i = start; i < end; i++) {
    if (array[i] !== undefined) data.push(array[i])
  }
  return (data.length < 1) ? [0] : data
}

import { createElement } from '/script/element.js'