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

    callback(null, params)
  }, 2)
})

var pluginLibs = {
  markdown: ['https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.6/marked.min.js'],
  less: ['https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.1/less.min.js'],
  stylus: ['/libs/stylus.min.js'],
  coffeescript: ['https://cdn.rawgit.com/jashkenas/coffeescript/1.11.1/extras/coffee-script.js'],
  es2015: ['https://cdnjs.cloudflare.com/ajax/libs/babel-core/6.1.19/browser.min.js']
}

function EditorWidget (actions) {
  globalActions = actions

  this.mount = function ($container) {
    var plugins = actions.getPlugins()
    var libs = []

    // load libs
    Object.keys(pluginLibs).forEach((name) => {
      if (plugins.indexOf(name) !== -1) {
        Array.prototype.push.apply(libs, pluginLibs[name].map((url) => {
          return (done) => {
            util.loadScript(url, done)
          }
        }))
      }
    })

    Array.prototype.push.apply(plugins, [
      'siloz',
      {
        name: 'codemirror',
        options: {
          theme: 'solarized light',
          lineWrapping: true
        }
      }
    ])

    util.async(libs, () => {
      /* eslint-disable no-new */
      new Jotted($container, {
        files: actions.getFiles(),
        plugins: plugins
      })

      // move the result pane to the right
      $container.appendChild($container.querySelector('.jotted-pane-result'))
    })
  }

  this.render = function () {
    return '<div class="editor-widget jotted-theme-siloz"></div>'
  }
}

module.exports = EditorWidget
