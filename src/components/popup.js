/* popup
 */

var util = require('../util')

function Popup (name, actions) {
  this.name = name
  this.state = actions.getPopup(name)
  this.actions = actions
  this.togglePopup = this.prototype.togglePopup.bind(this)
  this.hidePopup = this.prototype.hidePopup.bind(this)
}

Popup.prototype.togglePopup = function () {
  this.state = !this.state
  this.actions.updatePopup(this.name, this.state)
}

Popup.prototype.hidePopup = function (e) {
  if (util.closest(e.target, '.popup') || e.target === this.$button || !this.state) {
    return
  }

  this.actions.updatePopup(this.name, false)
}

Popup.prototype.mount = function ($container) {
  this.$container = $container
  this.$button = $container.querySelector('.popup-button')

  this.$button.addEventListener('click', this.togglePopup)
  document.addEventListener('click', this.hidePopup)
}

Popup.prototype.unmount = function () {
  document.removeEventListener('click', this.hidePopup)
}

Popup.prototype.render = function (title, content) {
  return `
    <div class="popup-container ${this.name} ${this.state ? 'popup-container-is-open' : ''}">
      <button type="button" class="${this.name}-button popup-button btn">
        ${title}
      </button>

      <form class="${this.name}-popup popup">
        ${content}
      </form>
    </div>
  `
}

module.exports = Popup
