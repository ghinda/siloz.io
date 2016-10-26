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

function extendLevel (obj, defaults = {}) {
  // copy default keys where undefined
  Object.keys(defaults).forEach(function (key) {
    if (typeof obj[key] === 'undefined') {
      // default
      obj[key] = clone(defaults[key])
    } else if (typeof obj[key] === 'object') {
      extendLevel(obj[key], defaults[key])
    }
  })

  return obj
}

// multi-level object merge
function extend (obj, defaults) {
  if (obj === null) {
    obj = {}
  }

  return extendLevel(clone(obj), defaults)
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

function loadScript (url, done = () => {}) {
  var $script = document.createElement('script')
  $script.src = url
  document.body.appendChild($script)

  $script.onload = done
}

function async (arr, done, i = 0) {
  if (arr.length === i) {
    return done()
  }

  arr[i](() => {
    i++
    async(arr, done, i)
  })
}

module.exports = {
  clone: clone,
  extend: extend,
  closest: closest,
  debounce: debounce,
  loadScript: loadScript,
  async: async
}
