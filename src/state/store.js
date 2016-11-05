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

  short_url: ''
}

var GlobalStore = function () {
  Store.call(this)
  this.actions = actions(this)

  var hashData = null

  try {
    if (window.location.hash) {
      hashData = JSON.parse(LZString.decompressFromEncodedURIComponent(util.hash('s')))
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

    var compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data))
    window.history.replaceState(null, null, '#' + util.hash('s', compressed))
  })
}

GlobalStore.prototype = Object.create(Store.prototype)

module.exports = GlobalStore

