/* share
 */

var util = require('../../util')
var Popup = require('../popup')

function Share (actions) {
  var shortUrl = actions.getShortUrl()

  this.mount = function ($container) {
    sharePopup.mount($container)

    actions.startShortUrlUpdater()
  }

  var sharePopup = new Popup('share', 'Share', `
    <fieldset>
      <legend>
        Short URL
      </legend>

      <input type="text" class="share-short-url" value="${shortUrl}">
    </fieldset>
  `)

  this.unmount = function () {
    sharePopup.unmount()

    actions.stopShortUrlUpdater()
  }

  this.render = sharePopup.render
}

module.exports = Share
