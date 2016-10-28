/* share
 */

var util = require('../../util')
var Popup = require('../popup')

function Share (actions) {
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
    sharePopup.mount($container)
  }

  var sharePopup = new Popup('share', 'Share', `
    <fieldset>
      <legend>
        share
      </legend>

      share
    </fieldset>
  `)

  this.unmount = sharePopup.unmount
  this.render = sharePopup.render
}

module.exports = Share
