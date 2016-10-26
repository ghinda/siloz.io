/* settings
 */

var util = require('../util')

function Settings (actions) {
  var $container
  var popupVisibleClass = 'settings-is-open'
  var panes = actions.getPanes()

  function togglePopup (hide) {
    $container.classList.toggle(popupVisibleClass)
  }

  function hidePopup (e) {
    if (util.closest(e.target, '.settings-button') || util.closest(e.target, '.settings-popup')) {
      return
    }

    $container.classList.remove(popupVisibleClass)
  }

  function togglePane (type) {
    return function (e) {
      var panes = {}
      panes[type] = { hidden: !(e.target.checked) }
      return actions.updatePanes(panes)
    }
  }

  this.mount = function ($node) {
    $container = $node
    var $button = $container.querySelector('.settings-button')
    var $showHtml = $container.querySelector('.settings-show-html')
    var $showCss = $container.querySelector('.settings-show-css')
    var $showJs = $container.querySelector('.settings-show-js')

    $button.addEventListener('click', togglePopup)
    document.addEventListener('click', hidePopup)

    $showHtml.addEventListener('change', togglePane('html'))
    $showCss.addEventListener('change', togglePane('css'))
    $showJs.addEventListener('change', togglePane('js'))
  }

  this.unmount = function () {
    document.removeEventListener('click', hidePopup)
  }

  this.render = function () {
    return `
      <form class="settings">
        <button type="button" class="settings-button">
          Settings
        </button>

        <div class="settings-popup">
          <h3>
            Tabs
          </h3>

          <label>
            <input type="checkbox" class="settings-show-html" ${!panes.html.hidden ? 'checked' : ''}>
            HTML
          </label>

          <label>
            <input type="checkbox" class="settings-show-css" ${!panes.css.hidden ? 'checked' : ''}>
            CSS
          </label>

          <label>
            <input type="checkbox" class="settings-show-js" ${!panes.js.hidden ? 'checked' : ''}>
            JavaScript
          </label>
        </div>
      </form>
    `
  }
}

module.exports = Settings
