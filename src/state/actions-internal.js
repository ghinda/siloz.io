/* store actions
 */

var util = require('../util')
var shortUrlService = require('./short-url')

function actions (store) {
  function getShortUrl () {
    return store.get().short_url
  }

  var longUrl = ''

  function updateShortUrl () {
    // existing short_url's,
    // check if window.location.href is not already saved
    // and update link.
    var shortUrl = getShortUrl()
    if (!shortUrl) {
      longUrl = window.location.href

      shortUrlService.create({
        long_url: longUrl
      }, (err, res) => {
        if (err) {
          return console.log(err)
        }

        var data = store.get()
        data.short_url = res.short_url
        store.set(data)
      })
    } else if (longUrl !== window.location.href) {
      longUrl = window.location.href

      // update existing short url
      shortUrlService.update({
        long_url: longUrl,
        short_url: shortUrl
      }, (err, res) => {
        if (err) {
          // stop url updater.
          stopShortUrlUpdater()

          // delete existing short_url
          var data = store.get()
          data.short_url = ''
          store.set(data)

          return console.log(err)
        }
      })
    }
  }

  var debouncedUpdateShortUrl = util.debounce(updateShortUrl, 500)

  function startShortUrlUpdater () {
    // update short url when data changes
    store.on('change', debouncedUpdateShortUrl)
  }

  function stopShortUrlUpdater () {
    // stop monitoring data changes
    store.off('change', debouncedUpdateShortUrl)
  }

  function getPopup (name) {
    return store.get().popup[name]
  }

  function updatePopup (name, state) {
    var data = store.get()
    data.popup[name] = state

    store.set(data)
  }

  return {
    getShortUrl: getShortUrl,
    updateShortUrl: updateShortUrl,
    startShortUrlUpdater: startShortUrlUpdater,
    stopShortUrlUpdater: stopShortUrlUpdater,

    getPopup: getPopup,
    updatePopup: updatePopup
  }
}

module.exports = actions
