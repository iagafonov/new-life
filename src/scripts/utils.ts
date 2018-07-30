export const log = console.log.bind(console)
export const err = console.error.bind(console)

export const loadFile = (fileName: string, noCache: boolean): Promise<string> => {
  return new Promise(function (resolve, reject) {
    const request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (request.readyState === 1) {
        request.send()
      } else if (request.readyState === 4) {
        if (request.status === 200) {
          resolve(request.responseText)
        } else if (request.status === 404) {
          reject('File "' + fileName + '" does not exist.')
        } else {
          reject('XHR error ' + request.status + '.')
        }
      }
    }
    let url = fileName
    if (noCache) {
      url += '?' + (new Date()).getTime()
    }
    request.open('GET', url, true)
  })
}
