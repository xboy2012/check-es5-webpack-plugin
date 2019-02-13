import md5 from 'md5'

let cacheObj = {}
let cacheKeys = []

const MAX_CACHE_LENGTH = 100 // 最大缓存的文件数

let promise = Promise.resolve()

const cache = (source, fn) => {
  promise = promise.then(async () => {
    const key = md5(source.source())
    if (key in cacheObj) {
      return cacheObj[key]
    }
    const value = await fn(source)
    if (cacheKeys.length === MAX_CACHE_LENGTH) {
      const firstKey = cacheKeys.shift()
      delete cacheObj[firstKey]
    }
    cacheKeys.push(key)
    cacheObj[key] = value
    return value
  })
  return promise
}

export default (fn) => {
  return source => cache(source, fn)
}

