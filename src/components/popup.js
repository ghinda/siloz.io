/* popup
 */

var util = require('../util')

function Popup (name, title, content) {
  var $container
  var $button
  var popupVisibleClass = 'popup-container-is-open'

  function togglePopup () {
    $container.classList.toggle(popupVisibleClass)
  }

  function hidePopup (e) {
    if (util.closest(e.target, '.popup') || e.target === $button) {
      return
    }

    $container.classList.remove(popupVisibleClass)
  }

  this.mount = function ($node) {
    $container = $node
    $button = $container.querySelector('.popup-button')

    $button.addEventListener('click', togglePopup)
    document.addEventListener('click', hidePopup)
  }

  this.unmount = function () {
    document.removeEventListener('click', hidePopup)
  }

  this.render = function () {
    return `
      <div class="popup-container ${name}">
        <button type="button" class="${name}-button popup-button btn">
          ${title}
        </button>

        <form class="${name}-popup popup">
          ${content}
        </form>
      </div>
    `
  }
}

module.exports = Popup
