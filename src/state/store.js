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
  }
}

function replaceLocationHash () {
  if (typeof window === 'undefined') {
    return () => {}
  }

  if (typeof window.history.replaceState !== 'undefined') {
    return (hash) => {
      window.history.replaceState(null, null, `#${hash}`)
    }
  } else {
    return (hash) => {
      window.location.replace(`${window.location.href.split('#')[0]}#${hash}`)
    }
  }
}

function parseHash () {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return JSON.parse(LZString.decompressFromEncodedURIComponent(util.hash('s')))
  } catch (err) {}

  return null
}

var GlobalStore = function () {
  Store.call(this)
  this.actions = actions(this)

  var replaceHash = replaceLocationHash()
  var compressedData = ''

  var hashData = parseHash()
  if (hashData) {
    this.set(util.extend(hashData, defaults))
  } else {
    this.set(defaults)
  }

  this.on('change', () => {
    // save in hash
    var data = this.get()

    compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(data))
    replaceHash(util.hash('s', compressedData))
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
      // force page reload if only hash changed,
      // and compressed data is different.
      // eg. manually changing url hash.
      if (util.hash('s') !== compressedData) {
        window.location.reload()
      }
    })
  }
}

GlobalStore.prototype = Object.create(Store.prototype)

module.exports = GlobalStore

