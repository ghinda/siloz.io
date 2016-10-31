/* short url api
 */

// env detection
var env = 'local'
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  env = 'live'
}

var apiUrl = 'http://localhost:3000'
var shortUrl = apiUrl

if (env !== 'local') {
  apiUrl = 'https://prajina-ghinda.rhcloud.com'
  shortUrl = 'http://s.siloz.io'
}

var util = require('../util')

var sessionKey = 'siloz-io'

function getSession () {
  try {
    var cache = window.localStorage.getItem(sessionKey)
    if (cache) {
      return JSON.parse(cache)
    }
  } catch (e) {
    return {}
  }

  return {}
}

var session = getSession()

function saveSession (newSession) {
  session = util.extend(newSession, session)

  window.localStorage.setItem(sessionKey, JSON.stringify(session))
}

function create (data, callback) {
  util.fetch(`${apiUrl}/api/`, {
    type: 'POST',
    data: data
  }, (err, res) => {
    if (err) {
      return callback(err)
    }

    // set full url for shorturl
    res.short_url = `${shortUrl}/${res.short_url}`

    // save session
    saveSession({
      token: res.token
    })

    callback(null, res)
  })
}

function update (data, callback) {
  // remove api url from short_url
  data.short_url = data.short_url.replace(`${apiUrl}/`, '')

  // add token
  data.token = session.token

  util.fetch(`${apiUrl}/api/`, {
    type: 'PUT',
    data: data
  }, (err, res) => {
    if (err) {
      return callback(err)
    }

    callback(null, res)
  })
}

module.exports = {
  create: create,
  update: update
}
