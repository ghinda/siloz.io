/* util
 */

function closest ($elem, selector) {
  // find the closest parent that matches the selector
  var $matches

  // loop through parents
  while ($elem && $elem !== document) {
    if ($elem.parentNode) {
      // find all siblings that match the selector
      $matches = $elem.parentNode.querySelectorAll(selector)
      // check if our element is matched (poor-man's Element.matches())
      if ([].indexOf.call($matches, $elem) !== -1) {
        return $elem
      }

      // go up the tree
      $elem = $elem.parentNode
    } else {
      return null
    }
  }

  return null
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

// one-level object extend
function extend (obj, defaults) {
  if (obj === null) {
    obj = {}
  }

  // clone object
  var extended = clone(obj)

  // copy default keys where undefined
  Object.keys(defaults).forEach(function (key) {
    if (typeof extended[key] !== 'undefined') {
      extended[key] = obj[key]
    } else {
      extended[key] = defaults[key]
    }
  })

  return extended
}

function debounce (func, wait, immediate) {
  var timeout
  return function () {
    var context = this
    var args = arguments
    var callNow = immediate && !timeout

    var later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}

module.exports = {
  clone: clone,
  extend: extend,
  closest: closest,
  debounce: debounce
}
