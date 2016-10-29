/* store actions
 */

var util = require('../util')
var shortUrl = require('./short-url')

function actions (store) {
  function getFiles () {
    return store.get().files
  }

  function updateFile (newFile) {
    var data = store.get()

    data.files.some((file, index) => {
      if (file.type === newFile.type) {
        data.files[index] = util.extend(newFile, data.files[index])
        return true
      }
    })

    return store.set(data)
  }

  function getPlugins () {
    return store.get().plugins
  }

  function addPlugin (newPlugin) {
    var data = store.get()

    data.plugins.push(newPlugin)
    return store.set(data)
  }

  function removePlugin (oldPlugin) {
    var data = store.get()
    var pluginName = ''

    if (typeof oldPlugin === 'object') {
      pluginName = oldPlugin.name
    } else {
      pluginName = oldPlugin
    }

    data.plugins.some((plugin, index) => {
      if ((typeof plugin === 'object' && plugin.name === pluginName) ||
          (typeof plugin === 'string' && plugin === pluginName)) {
        data.plugins.splice(index, 1)
        return true
      }
    })

    return store.set(data)
  }

  function getPanes () {
    return store.get().panes
  }

  function updatePanes (newPanes) {
    var data = store.get()
    data.panes = util.extend(newPanes, data.panes)

    return store.set(data)
  }

  function getTheme () {
    return store.get().theme
  }

  function updateTheme (theme) {
    var data = store.get()
    data.theme = theme

    return store.set(data)
  }

  function getShortUrl () {
    return store.get().short_url
  }

  var longUrl

  function updateShortUrl () {
    // TODO if existing short_url,
    // check if window.location.href is different from longUrl (not already saved),
    // and update link.

    // else
    // window.location.href to api, and get short url
    // set short_url in state.

    // TODO too many requests trigger on load,
    // needs throttling.
    var data = store.get()
    if (!data.short_url) {
      longUrl = window.location.href

      shortUrl.create({
        long_url: longUrl
      }, (err, res) => {
        if (err) {
          return console.log(err)
        }

        data.short_url = res.short_url
        store.set(data)
      })
    } else if (longUrl !== window.location.href) {
      longUrl = window.location.href

      // TODO update here
      shortUrl.update({
        long_url: longUrl,
        short_url: data.short_url
      }, (err, res) => {
        if (err) {
          return console.log(err)
        }

        console.log(err, res)
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

  return {
    getFiles: getFiles,
    updateFile: updateFile,

    getPlugins: getPlugins,
    addPlugin: addPlugin,
    removePlugin: removePlugin,

    getPanes: getPanes,
    updatePanes: updatePanes,

    getTheme: getTheme,
    updateTheme: updateTheme,

    getShortUrl: getShortUrl,
    startShortUrlUpdater: startShortUrlUpdater,
    stopShortUrlUpdater: stopShortUrlUpdater
  }
}

module.exports = actions
