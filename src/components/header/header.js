/* header
 */

var durruti = require('durruti')
var Settings = require('./settings')
var Share = require('./share')

var InternalStore = require('../../state/store-internal')
var storeInternal = new InternalStore()

function Header (actions) {
  var $container
  var data = storeInternal.get()

  var change = function () {
    var newData = storeInternal.get()

    // if something changed.
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      durruti.render(new Header(actions), $container)
    }
  }

  this.mount = function ($node) {
    $container = $node

    storeInternal.on('change', change)
  }

  this.unmount = function () {
    storeInternal.off('change', change)
  }

  this.render = function () {
    return `
      <header class="header">
        <a href="/" class="header-logo">
          <h1>
            siloz.io
          </h1>
        </a>

        ${durruti.render(new Settings(actions, storeInternal.actions))}
        ${durruti.render(new Share(storeInternal.actions))}
      </header>
    `
  }
}

module.exports = Header
