/* store
 */

var Store = require('durruti/store')
var LZString = require('lz-string')
var actions = require('./actions')

var defaults = {
  version: 1,
  files: [{
    type: 'html',
    content: '',
    hide: true
  }, {
    type: 'css',
    content: ''
  }, {
    type: 'js',
    content: ''
  }],
  theme: '',
  plugins: []
}

var GlobalStore = function () {
  Store.call(this)
  this.actions = actions(this)

  var hashData = null

  try {
    if (window.location.hash) {
      hashData = JSON.parse(LZString.decompressFromEncodedURIComponent(window.location.hash.substr(1)))
    }
  } catch (err) {}

  if (hashData) {
    this.set(hashData)
  } else {
    this.set(defaults)
  }

  this.on('change', () => {
    // save in hash
    var data = this.get()

    var compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data))
    window.history.replaceState(null, null, '#' + compressed)
  })
}

GlobalStore.prototype = Object.create(Store.prototype)

module.exports = GlobalStore

