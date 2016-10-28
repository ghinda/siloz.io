/* settings
 */

var util = require('../../util')
var Popup = require('../popup')

function Settings (actions) {
  var panes = actions.getPanes()
  var theme = actions.getTheme()

  function togglePane (type) {
    return function (e) {
      var panes = {}
      panes[type] = { hidden: !(e.target.checked) }
      return actions.updatePanes(panes)
    }
  }

  function setTheme () {
    actions.updateTheme(this.value)
  }

  this.mount = function ($container) {
    settingsPopup.mount($container)

    var $showHtml = $container.querySelector('.settings-show-html')
    var $showCss = $container.querySelector('.settings-show-css')
    var $showJs = $container.querySelector('.settings-show-js')

    $showHtml.addEventListener('change', togglePane('html'))
    $showCss.addEventListener('change', togglePane('css'))
    $showJs.addEventListener('change', togglePane('js'))

    $container.querySelector('.settings-theme').addEventListener('change', setTheme)
  }

  var settingsPopup = new Popup('settings', 'Settings', `
    <fieldset>
      <legend>
        Tabs
      </legend>

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
    </fieldset>

    <fieldset>
      <legend>
        Theme
      </legend>

      <select class="settings-theme select">
        <option value="solarized light" ${theme === 'solarized light' ? 'selected' : ''}>
          Solarized Light
        </option>
        <option value="solarized dark" ${theme === 'solarized dark' ? 'selected' : ''}>
          Solarized Dark
        </option>
      </select>
    </fieldset>
  </form>
  `)

  this.unmount = settingsPopup.unmount
  this.render = settingsPopup.render
}

module.exports = Settings
