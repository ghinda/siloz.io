/* main
 */
var Jotted = require('jotted')
var LZString = require('lz-string')

var store = require('./components/store')

var data = store

function Main () {
  this.mount = function () {
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

    /* eslint-disable no-new */
    new Jotted(document.querySelector('.editor-instance'), {
      files: data.files,
      plugins: [
        'siloz'
      ]
    })
  }

  this.render = function () {
    return `<div class="main">
      <header class="header">
        <h1>
          siloz
        </h1>
      </header>

      <div class="editor">
        <div class="editor-instance jotted-theme-bin jotted-theme-siloz"></div>
      </div>
    </div>`
  }
}

module.exports = Main
