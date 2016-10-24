/* store actions
 */

var util = require('../util')

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

  return {
    getFiles: getFiles,
    updateFile: updateFile,

    getPlugins: getPlugins,
    addPlugin: addPlugin,
    removePlugin: removePlugin
  }
}

module.exports = actions
