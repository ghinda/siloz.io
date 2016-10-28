/* popup
 */

var util = require('../util')

function Popup (name, title, content) {
  var $container
  var popupVisibleClass = 'popup-container-is-open'

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
      <div class="popup-container ${name}">
        <button type="button" class="${name}-button btn">
          Settings
        </button>

        <form class="${name}-popup popup">
          ${content}
        </form>
      </div>
    `
  }
}

module.exports = Popup
