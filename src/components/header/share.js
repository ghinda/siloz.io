/* share
 */

var qrcode = require('qrcode')

var util = require('../../util')
var Popup = require('../popup')

function Share (actions, actionsInternal) {
  var self = util.inherits(this, Popup)
  Popup.call(self, 'share', actionsInternal)

  var longUrl = ''
  var qr = actionsInternal.getQr()

  if (typeof window !== 'undefined') {
    longUrl = window.location.href
  }

  function copy ($input) {
    return (e) => {
      var $btn = util.closest(e.target, '.btn')

      $input.select()

      try {
        document.execCommand('copy')

        $btn.innerHTML = 'Copied'
        setTimeout(() => {
          $btn.innerHTML = 'Copy'
        }, 2000)
      } catch (err) {}
    }
  }

  function generate () {
    qrcode.toDataURL(longUrl, {
      margin: 2,
      color: {
        light: '#fdfbf4'
      }
    }, (err, url) => {
      if (err) {
        return actionsInternal.updateQr({
          url: '',
          error: err.toString()
        })
      }

      actionsInternal.updateQr({
        url: url,
        error: ''
      })
    })
  }

  self.mount = function ($container) {
    self.super.mount.call(self, $container)

    var $longUrl = $container.querySelector('.share-url-input-long')
    var $longUrlCopy = $container.querySelector('.share-url-copy-long')

    $longUrlCopy.addEventListener('click', copy($longUrl))
  }

  self.unmount = function () {
    self.super.unmount.call(self)
  }

  var oldTogglePopup = self.togglePopup
  self.togglePopup = () => {
    oldTogglePopup()

    if (this.state === true) {
      generate()
    }
  }

  self.render = () => {
    return self.super.render.call(self, 'Share', `
      <fieldset class="${qr.url ? 'share-is-generated' : ''}">
        <legend>
          QR code
        </legend>

        <img src="${qr.url}" class="qr-preview">

        <p class="share-qr-error">
          ${qr.error}
        </p>
      </fieldset>
      <fieldset>
        <legend>
          Persistent URL
        </legend>

        <div class="share-url">
          <input type="text" class="share-url-input share-url-input-long" value="${longUrl}" readonly>
          <button type="button" class="btn share-url-copy share-url-copy-long">
            Copy
          </button>
        </div>
      </fieldset>
    `)
  }

  return self
}

module.exports = Share
