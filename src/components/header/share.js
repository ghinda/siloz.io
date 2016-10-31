/* share
 */

var util = require('../../util')
var Popup = require('../popup')

function Share (actions) {
  var shortUrl = actions.getShortUrl()
  var longUrl = ''
  var watcher

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
    actions.updateShortUrl()
  }

  this.mount = function ($container) {
    sharePopup.mount($container)
    var $shortUrl = $container.querySelector('.share-url-input-short')
    var $shortUrlCopy = $container.querySelector('.share-url-copy-short')
    var $longUrl = $container.querySelector('.share-url-input-long')
    var $longUrlCopy = $container.querySelector('.share-url-copy-long')

    $shortUrlCopy.addEventListener('click', copy($shortUrl))
    $longUrlCopy.addEventListener('click', copy($longUrl))

    var $generateShort = $container.querySelector('.share-generate')
    $generateShort.addEventListener('click', generate)

    if (shortUrl) {
      // give it a sec,
      // to not trigger url update on load,
      // and force url generation even if nothing was changed,
      // on foreign clients.
      watcher = setTimeout(function () {
        actions.startShortUrlUpdater()
      }, 1000)
    }
  }

  var sharePopup = new Popup('share', 'Share', `
    <fieldset class="${shortUrl ? 'share-is-generated' : ''}">
      <legend>
        Short URL
      </legend>

      <button type="button" class="btn btn-primary share-generate">
        Generate Short URL
      </button>

      <div class="share-url share-url-short">
        <input type="text" class="share-url-input share-url-input-short" value="${shortUrl}" readonly>
        <button type="button" class="btn share-url-copy share-url-copy-short">
          Copy
        </button>
      </div>
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

  this.unmount = function () {
    sharePopup.unmount()

    if (watcher) {
      clearTimeout(watcher)
    }

    if (shortUrl) {
      actions.stopShortUrlUpdater()
    }
  }

  this.render = sharePopup.render
}

module.exports = Share
