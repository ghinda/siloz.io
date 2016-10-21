/* main
 */

var durruti = require('durruti')
var EditorWidget = require('./editor-widget')

var GlobalStore = require('../state/store')
var store = new GlobalStore()

function Main () {
  var $container
  var data = store.get()

  var change = function () {
    var newData = store.get()

    // don't compare the files
    delete data.files
    delete newData.files

    // if something changed,
    // except the files.
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      durruti.render(Main, $container)
    }
  }

  this.mount = function ($node) {
    $container = $node

    store.on('change', change)
  }

  this.unmount = function () {
    store.off('change', change)
  }

  this.render = function () {
    return `<div class="main">
      <header class="header">
        <h1>
          siloz
        </h1>
      </header>

      <div class="editor">
        ${durruti.render(new EditorWidget(store.actions))}
      </div>
    </div>`
  }
}

module.exports = Main
