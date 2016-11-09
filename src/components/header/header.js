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
  var actionsInternal = storeInternal.actions
  var loadingCollaborate = actionsInternal.getLoading('collaborate')

  var change = function () {
    var newData = storeInternal.get()

    // if something changed.
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      durruti.render(new Header(actions), $container)
    }
  }

  function doneLoadingCollaborate () {
    actionsInternal.updateLoading('collaborate', false)
  }

  this.mount = function ($node) {
    $container = $node

    $container.querySelector('.collaborate').addEventListener('click', () => {
      // loading
      actionsInternal.updateLoading('collaborate', true)

      window.TogetherJS()

      window.TogetherJS.on('ready', doneLoadingCollaborate)
      window.TogetherJS.on('close', doneLoadingCollaborate)
    })

    storeInternal.on('change', change)
  }

  this.unmount = function () {
    if (window.TogetherJS) {
      window.TogetherJS.off('ready', doneLoadingCollaborate)
      window.TogetherJS.off('close', doneLoadingCollaborate)
    }

    storeInternal.off('change', change)
  }

  this.render = function () {
    return `
      <header class="header">
        <a href="/" class="header-logo">
          <img src="/images/logo.png" height="16" alt="siloz.io">
        </a>

        <a href="https://github.com/ghinda/siloz.io#silozio" target="_blank" class="btn">
          Help
        </a>

        ${durruti.render(new Settings(actions, storeInternal.actions))}

        ${durruti.render(new Share(actions, storeInternal.actions))}

        <button type="button" class="btn collaborate ${loadingCollaborate ? 'is-loading' : ''}">
          Collaborate
        </button>
      </header>
    `
  }
}

module.exports = Header
