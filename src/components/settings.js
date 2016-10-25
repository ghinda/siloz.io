/* settings
 */

var util = require('../util')

function Settings (actions) {
  var $container
  var popupVisibleClass = 'settings-is-open'

  function togglePopup (hide) {
    $container.classList.toggle(popupVisibleClass)
  }

  function hidePopup (e) {
    if (util.closest(e.target, '.settings-button') || util.closest(e.target, '.settings-popup')) {
      return
    }

    $container.classList.remove(popupVisibleClass)
  }

  this.mount = function ($node) {
    $container = $node
    var $button = $container.querySelector('.settings-button')

    $button.addEventListener('click', togglePopup)

    document.addEventListener('click', hidePopup)
  }

  this.unmount = function () {
    document.removeEventListener('click', hidePopup)
  }

  this.render = function () {
    return `
      <div class="settings">
        <button class="settings-button">
          settings
        </button>

        <div class="settings-popup">
          settings-popup
        </div>
      </settings>
    `
  }
}

module.exports = Settings
