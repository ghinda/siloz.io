/* store
 */

var Store = require('durruti/store')
var LZString = require('lz-string')
var actions = require('./actions')
var util = require('../util')

var defaults = {
  version: 1,
  files: [{
    type: 'html',
    content: ''
  }, {
    type: 'css',
    content: ''
  }, {
    type: 'js',
    content: ''
  }],
  plugins: [],
  theme: 'solarized light',

  // pane properties (hidden, etc)
  panes: {
    html: {},
    css: {},
    js: {}
  },

  short_url: '',

  // not stored in url
  _internal: {
    popup: {}
  }
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
    this.set(util.extend(hashData, defaults))
  } else {
    this.set(defaults)
  }

  this.on('change', () => {
    // save in hash
    var data = this.get()

    // delete internal props
    delete data._internal

    var compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data))
    window.history.replaceState(null, null, '#' + compressed)
  })
}

GlobalStore.prototype = Object.create(Store.prototype)

module.exports = GlobalStore

