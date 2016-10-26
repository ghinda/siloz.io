/* main
 */

var durruti = require('durruti')
var Header = require('./header')
var Editor = require('./editor')

var GlobalStore = require('../state/store')
var store = new GlobalStore()

function Main () {
  var $container
  var data = store.get()
  var panes = store.actions.getPanes()

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
    return `
      <div class="main ${panes.html.hidden ? 'main-is-hidden-html' : ''}">
        ${durruti.render(new Header(store.actions))}
        ${durruti.render(new Editor(store.actions))}
      </div>
    `
  }
}

module.exports = Main
