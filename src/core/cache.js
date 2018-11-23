import { ROOT_DIR } from './configs'
import md5 from 'md5'
import fs from 'fs-extra'

let cacheObj = {}
let cacheKeys = []

const MAX_CACHE_LENGTH = 100 // 最大缓存的文件数

const cacheFile = `${ROOT_DIR}/.cache`

let promise = Promise.resolve()

const init = () => {
  if (!promise) {
    promise = async () => {
      let json
      try {
        json = await fs.readJson(cacheFile)
      } catch (e) {
        json = { cacheObj: {}, cacheKeys: [] }
        writeToDisk()
      }
      cacheObj = json.cacheObj;
      cacheKeys = json.cacheKeys;
    }
  }
  return promise
}

let timer = null

const writeToDisk = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    const json = { cacheObj, cacheKeys }
    fs.outputJson(cacheFile, json)
    timer = null
  }, 500)
}

export default (source, fn) => {
  promise = init().then(async () => {
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
}
