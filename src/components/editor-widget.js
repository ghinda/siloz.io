/* editor widget
 */

var util = require('../util')
var Jotted = require('jotted')
var globalActions

// jotted plugin
Jotted.plugin('siloz', function (jotted, options) {
  jotted.on('change', function (params, callback) {
    globalActions.updateFile({
      type: params.type,
      content: params.content
    })

    console.log(params.content)

    callback(null, params)
  }, 1)
})

function EditorWidget (actions) {
  globalActions = actions

  this.mount = function ($container) {
    var plugins = actions.getPlugins()
    var libs = []

    // load libs
    if (plugins.indexOf('markdown') !== -1) {
      libs.push(function (done) {
        util.loadScript('https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.6/marked.min.js', done)
      })
    }

    Array.prototype.push.apply(plugins, [
      'siloz',
      {
        name: 'codemirror',
        options: {
          theme: 'solarized light'
        }
      }
    ])

    util.async(libs, () => {
      /* eslint-disable no-new */
      new Jotted($container, {
        files: actions.getFiles(),
        plugins: plugins
      })
    })
  }

  this.render = function () {
    return '<div class="editor-widget jotted-theme-bin jotted-theme-siloz"></div>'
  }
}

module.exports = EditorWidget
