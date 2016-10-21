/* editor
 */

var Jotted = require('jotted')
var globalActions

// jotted plugin
Jotted.plugin('siloz', function (jotted, options) {
  jotted.on('change', function (params, callback) {
    globalActions.updateFile({
      type: params.type,
      content: params.content
    })

    callback(null, params)
  })
})

function EditorWidget (actions) {
  globalActions = actions

  this.mount = function ($container) {
    /* eslint-disable no-new */
    new Jotted($container, {
      files: actions.getFiles(),
      plugins: [
        'siloz',
        {
          name: 'codemirror',
          options: {
            theme: 'material'
          }
        }
      ]
    })
  }

  this.render = function () {
    return '<div class="editor-widget jotted-theme-siloz"></div>'
  }
}

module.exports = EditorWidget
