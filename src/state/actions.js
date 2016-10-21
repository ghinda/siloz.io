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

  return {
    getFiles: getFiles,
    updateFile: updateFile
  }
}

module.exports = actions
