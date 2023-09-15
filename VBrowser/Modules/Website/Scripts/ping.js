//啟動Ping追蹤
export default () => {
  const text_ping = document.getElementById('text_ping')

  let averagePing = []

  setInterval(() => {
    if (averagePing.length > 0) {
      let ping = averagePing.reduce((a, b) => a+b)/averagePing.length

      text_ping.innerHTML = `${Math.trunc(ping)}ms`
      if (ping < 100) text_ping.style.color = 'var(--green)'
      else if (ping < 250) text_ping.style.color = 'var(--yellow)'
      else text_ping.style.color = 'var(--red)'
    }
  }, 1000)

  return (ping) => {
    averagePing.push(ping)

    if (averagePing.length > 5) averagePing.splice(0, 1)
  }
}