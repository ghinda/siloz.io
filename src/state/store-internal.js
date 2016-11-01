/* internal store,
 * not stored in url
 */

var Store = require('durruti/store')
var actions = require('./actions-internal')

var defaults = {
  popup: {}
}

var InternalStore = function () {
  Store.call(this)
  this.actions = actions(this)

  this.set(defaults)
}

InternalStore.prototype = Object.create(Store.prototype)

module.exports = InternalStore

