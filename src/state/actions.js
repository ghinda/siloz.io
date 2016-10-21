/* store actions
 */

function actions (store) {
  function getFiles () {
    return store.get().files
  }

  function updateFile (newFile) {
    var data = store.get()

    data.files.some((file, index) => {
      if (file.type === newFile.type) {
        // TODO extend
        data.files[index] = newFile
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
