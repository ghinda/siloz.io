import Jotted from 'jotted'
import LZString from 'lz-string'

import store from './components/store'

var data = store

// TODO plugin
Jotted.plugin('siloz', function (jotted, options) {
  jotted.on('change', function (params, callback) {
    data.files.some((file) => {
      if (file.type === params.type) {
        file.content = params.content
        return true
      }
    })

    var compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data))
    window.history.replaceState(null, null, '#' + compressed)

    callback(null, params)
  })

  // TODO last priority when saved
})

try {
  if (window.location.hash) {
    data = JSON.parse(LZString.decompressFromEncodedURIComponent(window.location.hash.substr(1)))
  }
} catch (err) {
  console.log(err)
}

var editor = new Jotted(document.querySelector('.editor-instance'), {
  files: data.files,
  plugins: [
    'siloz'
  ]
})

console.log(editor)
