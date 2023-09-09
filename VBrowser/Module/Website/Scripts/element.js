export { createElement }

//取得物件所有的key
function getAllKeysOfObject (object, path) {
  let allKey = Object.keys(object)
  let keys = []
  allKey.map((item) => {
    if (typeof object[item] === 'object') {
      (path.length > 0) ? keys.push(`${path.join('.')}.${item}`) : keys.push(item)
      path.push(item)
      keys = keys.concat(getAllKeysOfObject(object[item], path))
    } else (path.length > 0) ? keys.push(`${path.join('.')}.${item}`) : keys.push(item)
  })
  return keys
}

//創建Element
function createElement (tagName, options) {
  let element = document.createElement(tagName)
  let allKey = getAllKeysOfObject(options, [])
  allKey.map((item) => eval(`element.${item} = options.${item}`))
  return element
}