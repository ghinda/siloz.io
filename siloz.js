(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var G = require('window-or-global')

module.exports = function() {
  return (
    typeof G.Promise === 'function' &&
    typeof G.Promise.prototype.then === 'function'
  )
}

},{"window-or-global":34}],2:[function(require,module,exports){
'use strict';

/******************************************************************************
 * Created 2008-08-19.
 *
 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
 *
 * Copyright (C) 2008
 *   Wyatt Baldwin <self@wyattbaldwin.com>
 *   All rights reserved
 *
 * Licensed under the MIT license.
 *
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *****************************************************************************/
var dijkstra = {
  single_source_shortest_paths: function(graph, s, d) {
    // Predecessor map for each node that has been encountered.
    // node ID => predecessor node ID
    var predecessors = {};

    // Costs of shortest paths from s to all nodes encountered.
    // node ID => cost
    var costs = {};
    costs[s] = 0;

    // Costs of shortest paths from s to all nodes encountered; differs from
    // `costs` in that it provides easy access to the node that currently has
    // the known shortest path from s.
    // XXX: Do we actually need both `costs` and `open`?
    var open = dijkstra.PriorityQueue.make();
    open.push(s, 0);

    var closest,
        u, v,
        cost_of_s_to_u,
        adjacent_nodes,
        cost_of_e,
        cost_of_s_to_u_plus_cost_of_e,
        cost_of_s_to_v,
        first_visit;
    while (!open.empty()) {
      // In the nodes remaining in graph that have a known cost from s,
      // find the node, u, that currently has the shortest path from s.
      closest = open.pop();
      u = closest.value;
      cost_of_s_to_u = closest.cost;

      // Get nodes adjacent to u...
      adjacent_nodes = graph[u] || {};

      // ...and explore the edges that connect u to those nodes, updating
      // the cost of the shortest paths to any or all of those nodes as
      // necessary. v is the node across the current edge from u.
      for (v in adjacent_nodes) {
        if (adjacent_nodes.hasOwnProperty(v)) {
          // Get the cost of the edge running from u to v.
          cost_of_e = adjacent_nodes[v];

          // Cost of s to u plus the cost of u to v across e--this is *a*
          // cost from s to v that may or may not be less than the current
          // known cost to v.
          cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

          // If we haven't visited v yet OR if the current known cost from s to
          // v is greater than the new cost we just found (cost of s to u plus
          // cost of u to v across e), update v's cost in the cost list and
          // update v's predecessor in the predecessor list (it's now u).
          cost_of_s_to_v = costs[v];
          first_visit = (typeof costs[v] === 'undefined');
          if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
            costs[v] = cost_of_s_to_u_plus_cost_of_e;
            open.push(v, cost_of_s_to_u_plus_cost_of_e);
            predecessors[v] = u;
          }
        }
      }
    }

    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
      throw new Error(msg);
    }

    return predecessors;
  },

  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
    var nodes = [];
    var u = d;
    var predecessor;
    while (u) {
      nodes.push(u);
      predecessor = predecessors[u];
      u = predecessors[u];
    }
    nodes.reverse();
    return nodes;
  },

  find_path: function(graph, s, d) {
    var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
    return dijkstra.extract_shortest_path_from_predecessor_list(
      predecessors, d);
  },

  /**
   * A very naive priority queue implementation.
   */
  PriorityQueue: {
    make: function (opts) {
      var T = dijkstra.PriorityQueue,
          t = {},
          key;
      opts = opts || {};
      for (key in T) {
        if (T.hasOwnProperty(key)) {
          t[key] = T[key];
        }
      }
      t.queue = [];
      t.sorter = opts.sorter || T.default_sorter;
      return t;
    },

    default_sorter: function (a, b) {
      return a.cost - b.cost;
    },

    /**
     * Add a new item to the queue and ensure the highest priority element
     * is at the front of the queue.
     */
    push: function (value, cost) {
      var item = {value: value, cost: cost};
      this.queue.push(item);
      this.queue.sort(this.sorter);
    },

    /**
     * Return the highest priority element in the queue.
     */
    pop: function () {
      return this.queue.shift();
    },

    empty: function () {
      return this.queue.length === 0;
    }
  }
};


// node.js module exports
if (typeof module !== 'undefined') {
  module.exports = dijkstra;
}

},{}],3:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.durruti = factory());
}(this, (function () { 'use strict';

  /* Durruti
   * Utils.
   */

  function hasWindow() {
    return typeof window !== 'undefined';
  }

  var isClient = hasWindow();

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // one-level object extend


  var DURRUTI_DEBUG = true;

  function warn() {
    if (DURRUTI_DEBUG === true) {
      console.warn.apply(console, arguments);
    }
  }

  /* Durruti
   * Capture and remove event listeners.
   */

  var _removeListeners = function removeListeners() {};

  // capture all listeners
  var events = [];
  var domEventTypes = [];

  function getDomEventTypes() {
    var eventTypes = [];
    for (var attr in document) {
      // starts with on
      if (attr.substr(0, 2) === 'on') {
        eventTypes.push(attr);
      }
    }

    return eventTypes;
  }

  var originalAddEventListener;

  function captureAddEventListener(type, fn, capture) {
    originalAddEventListener.apply(this, arguments);

    events.push({
      target: this,
      type: type,
      fn: fn,
      capture: capture
    });
  }

  function removeNodeEvents($node) {
    var i = 0;

    while (i < events.length) {
      if (events[i].target === $node) {
        // remove listener
        $node.removeEventListener(events[i].type, events[i].fn, events[i].capture);

        // remove event
        events.splice(i, 1);
        i--;
      }

      i++;
    }

    // remove on* listeners
    domEventTypes.forEach(function (eventType) {
      $node[eventType] = null;
    });
  }

  if (isClient) {
    domEventTypes = getDomEventTypes();

    // capture addEventListener

    // IE
    if (window.Node.prototype.hasOwnProperty('addEventListener')) {
      originalAddEventListener = window.Node.prototype.addEventListener;
      window.Node.prototype.addEventListener = captureAddEventListener;
    } else if (window.EventTarget.prototype.hasOwnProperty('addEventListener')) {
      // standard
      originalAddEventListener = window.EventTarget.prototype.addEventListener;
      window.EventTarget.prototype.addEventListener = captureAddEventListener;
    }

    // traverse and remove all events listeners from nodes
    _removeListeners = function removeListeners($node, traverse) {
      removeNodeEvents($node);

      // traverse element children
      if (traverse && $node.children) {
        for (var i = 0; i < $node.children.length; i++) {
          _removeListeners($node.children[i], true);
        }
      }
    };
  }

  var removeListeners$1 = _removeListeners;

  /* Durruti
   * DOM patch - morphs a DOM node into another.
   */

  function traverse($node, $newNode, patches) {
    // traverse
    for (var i = 0; i < $node.childNodes.length; i++) {
      diff($node.childNodes[i], $newNode.childNodes[i], patches);
    }
  }

  function mapAttributes($node, $newNode) {
    var attrs = {};

    for (var i = 0; i < $node.attributes.length; i++) {
      attrs[$node.attributes[i].name] = null;
    }

    for (var _i = 0; _i < $newNode.attributes.length; _i++) {
      attrs[$newNode.attributes[_i].name] = $newNode.attributes[_i].value;
    }

    return attrs;
  }

  function patchAttrs($node, $newNode) {
    // map attributes
    var attrs = mapAttributes($node, $newNode);

    // add-change attributes
    for (var prop in attrs) {
      if (attrs[prop] === null) {
        $node.removeAttribute(prop);

        // checked needs extra work
        if (prop === 'checked') {
          $node.checked = false;
        }
      } else {
        $node.setAttribute(prop, attrs[prop]);
      }
    }
  }

  function diff($node, $newNode) {
    var patches = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var patch = {
      node: $node,
      newNode: $newNode
    };

    // push traversed node to patch list
    patches.push(patch);

    // faster than outerhtml
    if ($node.isEqualNode($newNode)) {
      // remove listeners on node and children
      removeListeners$1($node, true);

      return patches;
    }

    // if one of them is not an element node,
    // or the tag changed,
    // or not the same number of children.
    if ($node.nodeType !== 1 || $newNode.nodeType !== 1 || $node.tagName !== $newNode.tagName || $node.childNodes.length !== $newNode.childNodes.length) {
      patch.replace = true;
    } else {
      patch.update = true;

      // remove listeners on node
      removeListeners$1($node);

      // traverse childNodes
      traverse($node, $newNode, patches);
    }

    return patches;
  }

  function applyPatch(patch) {
    if (patch.replace) {
      patch.node.parentNode.replaceChild(patch.newNode, patch.node);
    } else if (patch.update) {
      patchAttrs(patch.node, patch.newNode);
    }
  }

  function patch(patches) {
    patches.forEach(applyPatch);

    return patches;
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };





  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();







  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

















  var set = function set(object, property, value, receiver) {
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent !== null) {
        set(parent, property, value, receiver);
      }
    } else if ("value" in desc && desc.writable) {
      desc.value = value;
    } else {
      var setter = desc.set;

      if (setter !== undefined) {
        setter.call(receiver, value);
      }
    }

    return value;
  };

  /* Durruti
   * Micro Isomorphic JavaScript library for building user interfaces.
   */

  var durrutiAttr = 'data-durruti-id';
  var durrutiElemSelector = '[' + durrutiAttr + ']';
  var componentCache = [];
  var componentIndex = 0;

  // decorate a basic class with durruti specific properties
  function decorate(Comp) {
    var component;

    // instantiate classes
    if (typeof Comp === 'function') {
      component = new Comp();
    } else {
      // make sure we don't change the id on a cached component
      component = Object.create(Comp);
    }

    // components get a new id on render,
    // so we can clear the previous component cache.
    component._durrutiId = String(componentIndex++);

    // cache component
    componentCache.push({
      id: component._durrutiId,
      component: component
    });

    return component;
  }

  function getCachedComponent($node) {
    // get the component from the dom node - rendered in browser.
    if ($node._durruti) {
      return $node._durruti;
    }

    // or get it from the component cache - rendered on the server.
    var id = $node.getAttribute(durrutiAttr);
    for (var i = 0; i < componentCache.length; i++) {
      if (componentCache[i].id === id) {
        return componentCache[i].component;
      }
    }
  }

  // remove custom data attributes,
  // and cache the component on the DOM node.
  function cleanAttrNodes($container, includeParent) {
    var nodes = [].slice.call($container.querySelectorAll(durrutiElemSelector));

    if (includeParent) {
      nodes.push($container);
    }

    nodes.forEach(function ($node) {
      // cache component in node
      $node._durruti = getCachedComponent($node);

      // clean-up data attributes
      $node.removeAttribute(durrutiAttr);
    });

    return nodes;
  }

  function unmountNode($node) {
    var cachedComponent = getCachedComponent($node);

    if (cachedComponent.unmount) {
      cachedComponent.unmount($node);
    }

    // clear the component from the cache
    clearComponentCache(cachedComponent);
  }

  function mountNode($node) {
    var cachedComponent = getCachedComponent($node);

    if (cachedComponent.mount) {
      cachedComponent.mount($node);
    }
  }

  function clearComponentCache(component) {
    if (component) {
      for (var i = 0; i < componentCache.length; i++) {
        if (componentCache[i].id === component._durrutiId) {
          componentCache.splice(i, 1);
          return;
        }
      }
    } else {
      // clear the entire component cache
      componentIndex = 0;
      componentCache.length = 0;
    }
  }

  function createFragment() {
    var template = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    template = template.trim();
    var parent = 'div';
    var $node;

    if (template.indexOf('<tr') === 0) {
      // table row
      parent = 'tbody';
    } else if (template.indexOf('<td') === 0) {
      // table column
      parent = 'tr';
    }

    $node = document.createElement(parent);
    $node.innerHTML = template;

    if ($node.children.length !== 1) {
      throw new Error('Component template must have a single parent node.', template);
    }

    return $node.firstElementChild;
  }

  function addComponentId(template, component) {
    // naive implementation of adding an attribute to the parent container.
    // so we don't depend on a dom parser.
    // downside is we can't warn that template MUST have a single parent (in Node.js).

    // check void elements first.
    var firstBracketIndex = template.indexOf('/>');

    // non-void elements
    if (firstBracketIndex === -1) {
      firstBracketIndex = template.indexOf('>');
    }

    var attr = ' ' + durrutiAttr + '="' + component._durrutiId + '"';

    return template.substr(0, firstBracketIndex) + attr + template.substr(firstBracketIndex);
  }

  // traverse and find durruti nodes
  function getComponentNodes($container) {
    var arr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if ($container._durruti) {
      arr.push($container);
    }

    if ($container.children) {
      for (var i = 0; i < $container.children.length; i++) {
        getComponentNodes($container.children[i], arr);
      }
    }

    return arr;
  }

  var Durruti = function () {
    function Durruti() {
      classCallCheck(this, Durruti);
    }

    createClass(Durruti, [{
      key: 'server',
      value: function server() {
        clearComponentCache();

        return this;
      }
    }, {
      key: 'render',
      value: function render(component, $container) {
        // decorate basic classes with durruti properties
        var durrutiComponent = decorate(component);

        if (typeof durrutiComponent.render === 'undefined') {
          throw new Error('Components must have a render() method.');
        }

        var template = durrutiComponent.render();
        var componentHtml = addComponentId(template, durrutiComponent);

        // mount and unmount in browser, when we specify a container.
        if (isClient && $container) {
          var $newComponent;
          var patches;

          var _ret = function () {
            // check if the container is still in the DOM.
            // when running multiple parallel render's, the container
            // is removed by the previous render, but the reference still in memory.
            if (!document.body.contains($container)) {
              // warn for performance.
              warn('Node', $container, 'is no longer in the DOM. \nIt was probably removed by a parent component.');
              return {
                v: void 0
              };
            }

            var componentNodes = [];
            // convert the template string to a dom node
            $newComponent = createFragment(componentHtml);

            // unmount component and sub-components

            getComponentNodes($container).forEach(unmountNode);

            // if the container is a durruti element,
            // unmount it and it's children and replace the node.
            if (getCachedComponent($container)) {
              // remove the data attributes on the new node,
              // before patch,
              // and get the list of new components.
              cleanAttrNodes($newComponent, true);

              // get required dom patches
              patches = diff($container, $newComponent);


              patches.forEach(function (patch$$1) {
                // always update component instances,
                // even if the dom doesn't change.
                patch$$1.node._durruti = patch$$1.newNode._durruti;

                // patches contain all the traversed nodes.
                // get the mount components here, for performance.
                if (patch$$1.node._durruti) {
                  if (patch$$1.replace) {
                    componentNodes.push(patch$$1.newNode);
                  } else if (patch$$1.update) {
                    componentNodes.push(patch$$1.node);
                  } else {
                    // node is the same,
                    // but we need to mount sub-components.
                    Array.prototype.push.apply(componentNodes, getComponentNodes(patch$$1.node));
                  }
                }
              });

              // morph old dom node into new one
              patch(patches);
            } else {
              // if the component is not a durruti element,
              // insert the template with innerHTML.

              // only if the same html is not already rendered
              if (!$container.firstElementChild || !$container.firstElementChild.isEqualNode($newComponent)) {
                $container.innerHTML = componentHtml;
              }

              componentNodes = cleanAttrNodes($container);
            }

            // mount newly added components
            componentNodes.forEach(mountNode);
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }

        return componentHtml;
      }
    }]);
    return Durruti;
  }();

  var durruti = new Durruti();

  return durruti;

})));


},{}],4:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.durruti = global.durruti || {}, global.durruti.Store = factory());
}(this, (function () { 'use strict';

  /* Durruti
   * Utils.
   */

  function hasWindow() {
    return typeof window !== 'undefined';
  }

  var isClient = hasWindow();

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // one-level object extend
  function extend() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaults = arguments[1];

    // clone object
    var extended = clone(obj);

    // copy default keys where undefined
    Object.keys(defaults).forEach(function (key) {
      if (typeof extended[key] === 'undefined') {
        extended[key] = defaults[key];
      }
    });

    return extended;
  }

  var DURRUTI_DEBUG = true;

  /* Durruti
   * Data store with change events.
   */

  function Store(name, options) {
    options = options || {};

    var historySupport = false;
    // history is active only in the browser, by default
    if (isClient) {
      historySupport = true;
    }

    this.options = extend(options, {
      history: historySupport
    });

    this.events = {
      change: []
    };

    this.data = [];
  }

  Store.prototype.trigger = function (topic) {
    this.events[topic] = this.events[topic] || [];

    // immutable.
    // so on/off don't change the array durring trigger.
    var foundEvents = this.events[topic].slice();
    foundEvents.forEach(function (event) {
      event();
    });
  };

  Store.prototype.on = function (topic, func) {
    this.events[topic] = this.events[topic] || [];
    this.events[topic].push(func);
  };

  Store.prototype.off = function (topic, fn) {
    this.events[topic] = this.events[topic] || [];

    // find the fn in the arr
    var index = [].indexOf.call(this.events[topic], fn);

    // we didn't find it in the array
    if (index === -1) {
      return;
    }

    this.events[topic].splice(index, 1);
  };

  Store.prototype.get = function () {
    var value = this.data[this.data.length - 1];
    if (!value) {
      return null;
    }

    return clone(value);
  };

  Store.prototype.list = function () {
    return clone(this.data);
  };

  Store.prototype.set = function (value) {
    if (this.options.history) {
      this.data.push(value);
    } else {
      this.data = [value];
    }

    this.trigger('change');

    return this.get();
  };

  return Store;

})));


},{}],5:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Jotted = factory());
}(this, (function () { 'use strict';

  /* util
   */

  function extend() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var extended = {};
    // clone object
    Object.keys(obj).forEach(function (key) {
      extended[key] = obj[key];
    });

    // copy default keys where undefined
    Object.keys(defaults).forEach(function (key) {
      if (typeof extended[key] !== 'undefined') {
        extended[key] = obj[key];
      } else {
        extended[key] = defaults[key];
      }
    });

    return extended;
  }

  function fetch(url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'text';

    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(null, xhr.responseText);
      } else {
        callback(url, xhr);
      }
    };

    xhr.onerror = function (err) {
      callback(err);
    };

    xhr.send();
  }

  function runCallback(index, params, arr, errors, callback) {
    return function (err, res) {
      if (err) {
        errors.push(err);
      }

      index++;
      if (index < arr.length) {
        seqRunner(index, res, arr, errors, callback);
      } else {
        callback(errors, res);
      }
    };
  }

  function seqRunner(index, params, arr, errors, callback) {
    // async
    arr[index](params, runCallback.apply(this, arguments));
  }

  function seq(arr, params) {
    var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

    var errors = [];

    if (!arr.length) {
      return callback(errors, params);
    }

    seqRunner(0, params, arr, errors, callback);
  }

  function debounce(fn, delay) {
    var cooldown = null;
    var multiple = null;
    return function () {
      var _this = this,
          _arguments = arguments;

      if (cooldown) {
        multiple = true;
      } else {
        fn.apply(this, arguments);
      }

      clearTimeout(cooldown);

      cooldown = setTimeout(function () {
        if (multiple) {
          fn.apply(_this, _arguments);
        }

        cooldown = null;
        multiple = null;
      }, delay);
    };
  }

  function hasClass(node, className) {
    if (!node.className) {
      return false;
    }
    var tempClass = ' ' + node.className + ' ';
    className = ' ' + className + ' ';

    if (tempClass.indexOf(className) !== -1) {
      return true;
    }

    return false;
  }

  function addClass(node, className) {
    // class is already added
    if (hasClass(node, className)) {
      return node.className;
    }

    if (node.className) {
      className = ' ' + className;
    }

    node.className += className;

    return node.className;
  }

  function removeClass(node, className) {
    var spaceBefore = ' ' + className;
    var spaceAfter = className + ' ';

    if (node.className.indexOf(spaceBefore) !== -1) {
      node.className = node.className.replace(spaceBefore, '');
    } else if (node.className.indexOf(spaceAfter) !== -1) {
      node.className = node.className.replace(spaceAfter, '');
    } else {
      node.className = node.className.replace(className, '');
    }

    return node.className;
  }

  function data(node, attr) {
    return node.getAttribute('data-' + attr);
  }

  // mode detection based on content type and file extension
  var defaultModemap = {
    'html': 'html',
    'css': 'css',
    'js': 'javascript',
    'less': 'less',
    'styl': 'stylus',
    'coffee': 'coffeescript'
  };

  function getMode() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var file = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var customModemap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var modemap = extend(customModemap, defaultModemap);

    // try the file extension
    for (var key in modemap) {
      var keyLength = key.length;
      if (file.slice(-keyLength++) === '.' + key) {
        return modemap[key];
      }
    }

    // try the file type (html/css/js)
    for (var _key in modemap) {
      if (type === _key) {
        return modemap[_key];
      }
    }

    return type;
  }

  /* template
   */

  function container() {
    return '\n    <ul class="jotted-nav">\n      <li class="jotted-nav-item jotted-nav-item-result">\n        <a href="#" data-jotted-type="result">\n          Result\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-html">\n        <a href="#" data-jotted-type="html">\n          HTML\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-css">\n        <a href="#" data-jotted-type="css">\n          CSS\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-js">\n        <a href="#" data-jotted-type="js">\n          JavaScript\n        </a>\n      </li>\n    </ul>\n    <div class="jotted-pane jotted-pane-result"><iframe></iframe></div>\n    <div class="jotted-pane jotted-pane-html"></div>\n    <div class="jotted-pane jotted-pane-css"></div>\n    <div class="jotted-pane jotted-pane-js"></div>\n  ';
  }

  function paneActiveClass(type) {
    return 'jotted-pane-active-' + type;
  }

  function containerClass() {
    return 'jotted';
  }

  function hasFileClass(type) {
    return 'jotted-has-' + type;
  }

  function editorClass(type) {
    return 'jotted-editor jotted-editor-' + type;
  }

  function editorContent(type) {
    var fileUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    return '\n    <textarea data-jotted-type="' + type + '" data-jotted-file="' + fileUrl + '"></textarea>\n    <div class="jotted-status"></div>\n  ';
  }

  function statusMessage(err) {
    return '\n    <p>' + err + '</p>\n  ';
  }

  function statusClass(type) {
    return 'jotted-status-' + type;
  }

  function statusActiveClass(type) {
    return 'jotted-status-active-' + type;
  }

  function pluginClass(name) {
    return 'jotted-plugin-' + name;
  }

  function statusLoading(url) {
    return 'Loading <strong>' + url + '</strong>..';
  }

  function statusFetchError(url) {
    return 'There was an error loading <strong>' + url + '</strong>.';
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };





  var asyncGenerator = function () {
    function AwaitValue(value) {
      this.value = value;
    }

    function AsyncGenerator(gen) {
      var front, back;

      function send(key, arg) {
        return new Promise(function (resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
          };

          if (back) {
            back = back.next = request;
          } else {
            front = back = request;
            resume(key, arg);
          }
        });
      }

      function resume(key, arg) {
        try {
          var result = gen[key](arg);
          var value = result.value;

          if (value instanceof AwaitValue) {
            Promise.resolve(value.value).then(function (arg) {
              resume("next", arg);
            }, function (arg) {
              resume("throw", arg);
            });
          } else {
            settle(result.done ? "return" : "normal", result.value);
          }
        } catch (err) {
          settle("throw", err);
        }
      }

      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true
            });
            break;

          case "throw":
            front.reject(value);
            break;

          default:
            front.resolve({
              value: value,
              done: false
            });
            break;
        }

        front = front.next;

        if (front) {
          resume(front.key, front.arg);
        } else {
          back = null;
        }
      }

      this._invoke = send;

      if (typeof gen.return !== "function") {
        this.return = undefined;
      }
    }

    if (typeof Symbol === "function" && Symbol.asyncIterator) {
      AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
        return this;
      };
    }

    AsyncGenerator.prototype.next = function (arg) {
      return this._invoke("next", arg);
    };

    AsyncGenerator.prototype.throw = function (arg) {
      return this._invoke("throw", arg);
    };

    AsyncGenerator.prototype.return = function (arg) {
      return this._invoke("return", arg);
    };

    return {
      wrap: function (fn) {
        return function () {
          return new AsyncGenerator(fn.apply(this, arguments));
        };
      },
      await: function (value) {
        return new AwaitValue(value);
      }
    };
  }();





  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();







  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

















  var set = function set(object, property, value, receiver) {
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent !== null) {
        set(parent, property, value, receiver);
      }
    } else if ("value" in desc && desc.writable) {
      desc.value = value;
    } else {
      var setter = desc.set;

      if (setter !== undefined) {
        setter.call(receiver, value);
      }
    }

    return value;
  };

  /* plugin
   */

  var plugins = [];

  function find$1(id) {
    for (var pluginIndex in plugins) {
      var plugin = plugins[pluginIndex];
      if (plugin._id === id) {
        return plugin;
      }
    }

    // can't find plugin
    throw new Error('Plugin ' + id + ' is not registered.');
  }

  function register(id, plugin) {
    // private properties
    plugin._id = id;
    plugins.push(plugin);
  }

  // create a new instance of each plugin, on the jotted instance
  function init() {
    var _this = this;

    this._get('options').plugins.forEach(function (plugin) {
      // check if plugin definition is string or object
      var Plugin = void 0;
      var pluginName = void 0;
      var pluginOptions = {};
      if (typeof plugin === 'string') {
        pluginName = plugin;
      } else if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object') {
        pluginName = plugin.name;
        pluginOptions = plugin.options || {};
      }

      Plugin = find$1(pluginName);
      _this._get('plugins')[plugin] = new Plugin(_this, pluginOptions);

      addClass(_this._get('$container'), pluginClass(pluginName));
    });
  }

  /* pubsoup
   */

  var PubSoup = function () {
    function PubSoup() {
      classCallCheck(this, PubSoup);

      this.topics = {};
      this.callbacks = {};
    }

    createClass(PubSoup, [{
      key: 'find',
      value: function find(query) {
        this.topics[query] = this.topics[query] || [];
        return this.topics[query];
      }
    }, {
      key: 'subscribe',
      value: function subscribe(topic, subscriber) {
        var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 90;

        var foundTopic = this.find(topic);
        subscriber._priority = priority;
        foundTopic.push(subscriber);

        // sort subscribers on priority
        foundTopic.sort(function (a, b) {
          return a._priority > b._priority ? 1 : b._priority > a._priority ? -1 : 0;
        });
      }

      // removes a function from an array

    }, {
      key: 'remover',
      value: function remover(arr, fn) {
        arr.forEach(function () {
          // if no fn is specified
          // clean-up the array
          if (!fn) {
            arr.length = 0;
            return;
          }

          // find the fn in the arr
          var index = [].indexOf.call(arr, fn);

          // we didn't find it in the array
          if (index === -1) {
            return;
          }

          arr.splice(index, 1);
        });
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(topic, subscriber) {
        // remove from subscribers
        var foundTopic = this.find(topic);
        this.remover(foundTopic, subscriber);

        // remove from callbacks
        this.callbacks[topic] = this.callbacks[topic] || [];
        this.remover(this.callbacks[topic], subscriber);
      }

      // sequentially runs a method on all plugins

    }, {
      key: 'publish',
      value: function publish(topic) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var foundTopic = this.find(topic);
        var runList = [];

        foundTopic.forEach(function (subscriber) {
          runList.push(subscriber);
        });

        seq(runList, params, this.runCallbacks(topic));
      }

      // parallel run all .done callbacks

    }, {
      key: 'runCallbacks',
      value: function runCallbacks(topic) {
        var _this = this;

        return function (err, params) {
          _this.callbacks[topic] = _this.callbacks[topic] || [];

          _this.callbacks[topic].forEach(function (c) {
            c(err, params);
          });
        };
      }

      // attach a callback when a publish[topic] is done

    }, {
      key: 'done',
      value: function done(topic) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

        this.callbacks[topic] = this.callbacks[topic] || [];
        this.callbacks[topic].push(callback);
      }
    }]);
    return PubSoup;
  }();

  /* render plugin
   * renders the iframe
   */

  var PluginRender = function () {
    function PluginRender(jotted, options) {
      classCallCheck(this, PluginRender);

      options = extend(options, {});

      // iframe srcdoc support
      var supportSrcdoc = !!('srcdoc' in document.createElement('iframe'));
      var $resultFrame = jotted.$container.querySelector('.jotted-pane-result iframe');

      var frameContent = '';

      // cached content
      var content = {
        html: '',
        css: '',
        js: ''
      };

      // catch domready events from the iframe
      window.addEventListener('message', this.domready.bind(this));

      // render on each change
      jotted.on('change', this.change.bind(this), 100);

      // public
      this.supportSrcdoc = supportSrcdoc;
      this.content = content;
      this.frameContent = frameContent;
      this.$resultFrame = $resultFrame;

      this.callbacks = [];
      this.index = 0;

      this.lastCallback = function () {};
    }

    createClass(PluginRender, [{
      key: 'template',
      value: function template() {
        var style = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var script = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        return '\n      <!doctype html>\n      <html>\n        <head>\n          <script>\n            (function () {\n              window.addEventListener(\'DOMContentLoaded\', function () {\n                window.parent.postMessage(JSON.stringify({\n                  type: \'jotted-dom-ready\'\n                }), \'*\')\n              })\n            }())\n          </script>\n\n          <style>' + style + '</style>\n        </head>\n        <body>\n          ' + body + '\n\n          <!--\n            Jotted:\n            Empty script tag prevents malformed HTML from breaking the next script.\n          -->\n          <script></script>\n          <script>' + script + '</script>\n        </body>\n      </html>\n    ';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        var _this = this;

        // cache manipulated content
        this.content[params.type] = params.content;

        // check existing and to-be-rendered content
        var oldFrameContent = this.frameContent;
        this.frameContent = this.template(this.content['css'], this.content['html'], this.content['js']);

        // cache the current callback as global,
        // so we can call it from the message callback.
        this.lastCallback = function () {
          _this.lastCallback = function () {};

          callback(null, params);
        };

        // don't render if previous and new frame content are the same.
        // mostly for the `play` plugin,
        // so we don't re-render the same content on each change.
        // unless we set forceRender.
        if (params.forceRender !== true && this.frameContent === oldFrameContent) {
          callback(null, params);
          return;
        }

        if (this.supportSrcdoc) {
          // srcdoc in unreliable in Chrome.
          // https://github.com/ghinda/jotted/issues/23

          // re-create the iframe on each change,
          // to discard the previously loaded scripts.
          var $newResultFrame = document.createElement('iframe');
          this.$resultFrame.parentNode.replaceChild($newResultFrame, this.$resultFrame);
          this.$resultFrame = $newResultFrame;

          this.$resultFrame.contentWindow.document.open();
          this.$resultFrame.contentWindow.document.write(this.frameContent);
          this.$resultFrame.contentWindow.document.close();
        } else {
          // older browsers without iframe srcset support (IE9).
          this.$resultFrame.setAttribute('data-srcdoc', this.frameContent);

          // tips from https://github.com/jugglinmike/srcdoc-polyfill
          // Copyright (c) 2012 Mike Pennisi
          // Licensed under the MIT license.
          var jsUrl = 'javascript:window.frameElement.getAttribute("data-srcdoc");';

          this.$resultFrame.setAttribute('src', jsUrl);

          // Explicitly set the iFrame's window.location for
          // compatibility with IE9, which does not react to changes in
          // the `src` attribute when it is a `javascript:` URL.
          if (this.$resultFrame.contentWindow) {
            this.$resultFrame.contentWindow.location = jsUrl;
          }
        }
      }
    }, {
      key: 'domready',
      value: function domready(e) {
        // only catch messages from the iframe
        if (e.source !== this.$resultFrame.contentWindow) {
          return;
        }

        var data$$1 = {};
        try {
          data$$1 = JSON.parse(e.data);
        } catch (e) {}

        if (data$$1.type === 'jotted-dom-ready') {
          this.lastCallback();
        }
      }
    }]);
    return PluginRender;
  }();

  /* scriptless plugin
   * removes script tags from html content
   */

  var PluginScriptless = function () {
    function PluginScriptless(jotted, options) {
      classCallCheck(this, PluginScriptless);

      options = extend(options, {});

      // https://html.spec.whatwg.org/multipage/scripting.html
      var runScriptTypes = ['application/javascript', 'application/ecmascript', 'application/x-ecmascript', 'application/x-javascript', 'text/ecmascript', 'text/javascript', 'text/javascript1.0', 'text/javascript1.1', 'text/javascript1.2', 'text/javascript1.3', 'text/javascript1.4', 'text/javascript1.5', 'text/jscript', 'text/livescript', 'text/x-ecmascript', 'text/x-javascript'];

      // remove script tags on each change
      jotted.on('change', this.change.bind(this));

      // public
      this.runScriptTypes = runScriptTypes;
    }

    createClass(PluginScriptless, [{
      key: 'change',
      value: function change(params, callback) {
        if (params.type !== 'html') {
          return callback(null, params);
        }

        // for IE9 support, remove the script tags from HTML content.
        // when we stop supporting IE9, we can use the sandbox attribute.
        var fragment = document.createElement('div');
        fragment.innerHTML = params.content;

        var typeAttr = null;

        // remove all script tags
        var $scripts = fragment.querySelectorAll('script');
        for (var i = 0; i < $scripts.length; i++) {
          typeAttr = $scripts[i].getAttribute('type');

          // only remove script tags without the type attribute
          // or with a javascript mime attribute value.
          // the ones that are run by the browser.
          if (!typeAttr || this.runScriptTypes.indexOf(typeAttr) !== -1) {
            $scripts[i].parentNode.removeChild($scripts[i]);
          }
        }

        params.content = fragment.innerHTML;

        callback(null, params);
      }
    }]);
    return PluginScriptless;
  }();

  /* ace plugin
   */

  var PluginAce = function () {
    function PluginAce(jotted, options) {
      classCallCheck(this, PluginAce);

      var priority = 1;
      var i;

      this.editor = {};
      this.jotted = jotted;

      options = extend(options, {});

      // check if Ace is loaded
      if (typeof window.ace === 'undefined') {
        return;
      }

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      for (i = 0; i < $editors.length; i++) {
        var $textarea = $editors[i].querySelector('textarea');
        var type = data($textarea, 'jotted-type');
        var file = data($textarea, 'jotted-file');

        var $aceContainer = document.createElement('div');
        $editors[i].appendChild($aceContainer);

        this.editor[type] = window.ace.edit($aceContainer);
        var editor = this.editor[type];

        var editorOptions = extend(options);

        editor.getSession().setMode('ace/mode/' + getMode(type, file));
        editor.getSession().setOptions(editorOptions);

        editor.$blockScrolling = Infinity;
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginAce, [{
      key: 'editorChange',
      value: function editorChange(params) {
        var _this = this;

        return function () {
          _this.jotted.trigger('change', params);
        };
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editor[params.type];

        // if the event is not started by the ace change.
        // triggered only once per editor,
        // when the textarea is populated/file is loaded.
        if (!params.aceEditor) {
          editor.getSession().setValue(params.content);

          // attach the event only after the file is loaded
          params.aceEditor = editor;
          editor.on('change', this.editorChange(params));
        }

        // manipulate the params and pass them on
        params.content = editor.getValue();
        callback(null, params);
      }
    }]);
    return PluginAce;
  }();

  /* coremirror plugin
   */

  var PluginCodeMirror = function () {
    function PluginCodeMirror(jotted, options) {
      classCallCheck(this, PluginCodeMirror);

      var priority = 1;
      var i;

      this.editor = {};
      this.jotted = jotted;

      // custom modemap for codemirror
      var modemap = {
        'html': 'htmlmixed'
      };

      options = extend(options, {
        lineNumbers: true
      });

      // check if CodeMirror is loaded
      if (typeof window.CodeMirror === 'undefined') {
        return;
      }

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      for (i = 0; i < $editors.length; i++) {
        var $textarea = $editors[i].querySelector('textarea');
        var type = data($textarea, 'jotted-type');
        var file = data($textarea, 'jotted-file');

        this.editor[type] = window.CodeMirror.fromTextArea($textarea, options);
        this.editor[type].setOption('mode', getMode(type, file, modemap));
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginCodeMirror, [{
      key: 'editorChange',
      value: function editorChange(params) {
        var _this = this;

        return function () {
          // trigger a change event
          _this.jotted.trigger('change', params);
        };
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editor[params.type];

        // if the event is not started by the codemirror change.
        // triggered only once per editor,
        // when the textarea is populated/file is loaded.
        if (!params.cmEditor) {
          editor.setValue(params.content);

          // attach the event only after the file is loaded
          params.cmEditor = editor;
          editor.on('change', this.editorChange(params));
        }

        // manipulate the params and pass them on
        params.content = editor.getValue();
        callback(null, params);
      }
    }]);
    return PluginCodeMirror;
  }();

  /* less plugin
   */

  var PluginLess = function () {
    function PluginLess(jotted, options) {
      classCallCheck(this, PluginLess);

      var priority = 20;

      options = extend(options, {});

      // check if less is loaded
      if (typeof window.less === 'undefined') {
        return;
      }

      // change CSS link label to Less
      jotted.$container.querySelector('a[data-jotted-type="css"]').innerHTML = 'Less';

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginLess, [{
      key: 'isLess',
      value: function isLess(params) {
        if (params.type !== 'css') {
          return false;
        }

        return params.file.indexOf('.less') !== -1 || params.file === '';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse .less and blank files
        if (this.isLess(params)) {
          window.less.render(params.content, this.options, function (err, res) {
            if (err) {
              return callback(err, params);
            } else {
              // replace the content with the parsed less
              params.content = res.css;
            }

            callback(null, params);
          });
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginLess;
  }();

  /* coffeescript plugin
   */

  var PluginCoffeeScript = function () {
    function PluginCoffeeScript(jotted, options) {
      classCallCheck(this, PluginCoffeeScript);

      var priority = 20;

      options = extend(options, {});

      // check if coffeescript is loaded
      if (typeof window.CoffeeScript === 'undefined') {
        return;
      }

      // change JS link label to Less
      jotted.$container.querySelector('a[data-jotted-type="js"]').innerHTML = 'CoffeeScript';

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginCoffeeScript, [{
      key: 'isCoffee',
      value: function isCoffee(params) {
        if (params.type !== 'js') {
          return false;
        }

        return params.file.indexOf('.coffee') !== -1 || params.file === '';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse .less and blank files
        if (this.isCoffee(params)) {
          try {
            params.content = window.CoffeeScript.compile(params.content);
          } catch (err) {
            return callback(err, params);
          }
        }

        callback(null, params);
      }
    }]);
    return PluginCoffeeScript;
  }();

  /* stylus plugin
   */

  var PluginStylus = function () {
    function PluginStylus(jotted, options) {
      classCallCheck(this, PluginStylus);

      var priority = 20;

      options = extend(options, {});

      // check if stylus is loaded
      if (typeof window.stylus === 'undefined') {
        return;
      }

      // change CSS link label to Stylus
      jotted.$container.querySelector('a[data-jotted-type="css"]').innerHTML = 'Stylus';

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginStylus, [{
      key: 'isStylus',
      value: function isStylus(params) {
        if (params.type !== 'css') {
          return false;
        }

        return params.file.indexOf('.styl') !== -1 || params.file === '';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse .styl and blank files
        if (this.isStylus(params)) {
          window.stylus(params.content, this.options).render(function (err, res) {
            if (err) {
              return callback(err, params);
            } else {
              // replace the content with the parsed less
              params.content = res;
            }

            callback(null, params);
          });
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginStylus;
  }();

  /* babel plugin
   */

  var PluginBabel = function () {
    function PluginBabel(jotted, options) {
      classCallCheck(this, PluginBabel);

      var priority = 20;

      this.options = extend(options, {});

      // check if babel is loaded
      if (typeof window.Babel !== 'undefined') {
        // using babel-standalone
        this.babel = window.Babel;
      } else if (typeof window.babel !== 'undefined') {
        // using browser.js from babel-core 5.x
        this.babel = {
          transform: window.babel
        };
      } else {
        return;
      }

      // change js link label
      jotted.$container.querySelector('a[data-jotted-type="js"]').innerHTML = 'ES2015';

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginBabel, [{
      key: 'change',
      value: function change(params, callback) {
        // only parse js content
        if (params.type === 'js') {
          try {
            params.content = this.babel.transform(params.content, this.options).code;
          } catch (err) {
            return callback(err, params);
          }

          callback(null, params);
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginBabel;
  }();

  /* markdown plugin
   */

  var PluginMarkdown = function () {
    function PluginMarkdown(jotted, options) {
      classCallCheck(this, PluginMarkdown);

      var priority = 20;

      this.options = extend(options, {});

      // check if marked is loaded
      if (typeof window.marked === 'undefined') {
        return;
      }

      window.marked.setOptions(options);

      // change html link label
      jotted.$container.querySelector('a[data-jotted-type="html"]').innerHTML = 'Markdown';

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginMarkdown, [{
      key: 'change',
      value: function change(params, callback) {
        // only parse html content
        if (params.type === 'html') {
          try {
            params.content = window.marked(params.content);
          } catch (err) {
            return callback(err, params);
          }

          callback(null, params);
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginMarkdown;
  }();

  /* console plugin
   */

  var PluginConsole = function () {
    function PluginConsole(jotted, options) {
      classCallCheck(this, PluginConsole);

      options = extend(options, {
        autoClear: false
      });

      var priority = 30;
      var history = [];
      var historyIndex = 0;
      var logCaptureSnippet = '(' + this.capture.toString() + ')();';
      var contentCache = {
        html: '',
        css: '',
        js: ''
      };

      // new tab and pane markup
      var $nav = document.createElement('li');
      addClass($nav, 'jotted-nav-item jotted-nav-item-console');
      $nav.innerHTML = '<a href="#" data-jotted-type="console">JS Console</a>';

      var $pane = document.createElement('div');
      addClass($pane, 'jotted-pane jotted-pane-console');

      $pane.innerHTML = '\n      <div class="jotted-console-container">\n        <ul class="jotted-console-output"></ul>\n        <form class="jotted-console-input">\n          <input type="text">\n        </form>\n      </div>\n      <button class="jotted-button jotted-console-clear">Clear</button>\n    ';

      jotted.$container.appendChild($pane);
      jotted.$container.querySelector('.jotted-nav').appendChild($nav);

      var $container = jotted.$container.querySelector('.jotted-console-container');
      var $output = jotted.$container.querySelector('.jotted-console-output');
      var $input = jotted.$container.querySelector('.jotted-console-input input');
      var $inputForm = jotted.$container.querySelector('.jotted-console-input');
      var $clear = jotted.$container.querySelector('.jotted-console-clear');

      // submit the input form
      $inputForm.addEventListener('submit', this.submit.bind(this));

      // console history
      $input.addEventListener('keydown', this.history.bind(this));

      // clear button
      $clear.addEventListener('click', this.clear.bind(this));

      // clear the console on each change
      if (options.autoClear === true) {
        jotted.on('change', this.autoClear.bind(this), priority - 1);
      }

      // capture the console on each change
      jotted.on('change', this.change.bind(this), priority);

      // get log events from the iframe
      window.addEventListener('message', this.getMessage.bind(this));

      // plugin public properties
      this.$jottedContainer = jotted.$container;
      this.$container = $container;
      this.$input = $input;
      this.$output = $output;
      this.history = history;
      this.historyIndex = historyIndex;
      this.logCaptureSnippet = logCaptureSnippet;
      this.contentCache = contentCache;
      this.getIframe = this.getIframe.bind(this);
    }

    createClass(PluginConsole, [{
      key: 'getIframe',
      value: function getIframe() {
        return this.$jottedContainer.querySelector('.jotted-pane-result iframe');
      }
    }, {
      key: 'getMessage',
      value: function getMessage(e) {
        // only catch messages from the iframe
        if (e.source !== this.getIframe().contentWindow) {
          return;
        }

        var data$$1 = {};
        try {
          data$$1 = JSON.parse(e.data);
        } catch (err) {}

        if (data$$1.type === 'jotted-console-log') {
          this.log(data$$1.message);
        }
      }
    }, {
      key: 'autoClear',
      value: function autoClear(params, callback) {
        var snippetlessContent = params.content;

        // remove the snippet from cached js content
        if (params.type === 'js') {
          snippetlessContent = snippetlessContent.replace(this.logCaptureSnippet, '');
        }

        // for compatibility with the Play plugin,
        // clear the console only if something has changed or force rendering.
        if (params.forceRender === true || this.contentCache[params.type] !== snippetlessContent) {
          this.clear();
        }

        // always cache the latest content
        this.contentCache[params.type] = snippetlessContent;

        callback(null, params);
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse js content
        if (params.type !== 'js') {
          // make sure we callback either way,
          // to not break the pubsoup
          return callback(null, params);
        }

        // check if the snippet is already added.
        // the Play plugin caches the changed params and triggers change
        // with the cached response, causing the snippet to be inserted
        // multiple times, on each trigger.
        if (params.content.indexOf(this.logCaptureSnippet) === -1) {
          params.content = '' + this.logCaptureSnippet + params.content;
        }

        callback(null, params);
      }

      // capture the console.log output

    }, {
      key: 'capture',
      value: function capture() {
        // IE9 with devtools closed
        if (typeof window.console === 'undefined' || typeof window.console.log === 'undefined') {
          window.console = {
            log: function log() {}
          };
        }

        // for IE9 support
        var oldConsoleLog = Function.prototype.bind.call(window.console.log, window.console);

        window.console.log = function () {
          // send log messages to the parent window
          [].slice.call(arguments).forEach(function (message) {
            window.parent.postMessage(JSON.stringify({
              type: 'jotted-console-log',
              message: message
            }), '*');
          });

          // in IE9, console.log is object instead of function
          // https://connect.microsoft.com/IE/feedback/details/585896/console-log-typeof-is-object-instead-of-function
          oldConsoleLog.apply(oldConsoleLog, arguments);
        };
      }
    }, {
      key: 'log',
      value: function log() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var type = arguments[1];

        var $log = document.createElement('li');
        addClass($log, 'jotted-console-log');

        if (typeof type !== 'undefined') {
          addClass($log, 'jotted-console-log-' + type);
        }

        $log.innerHTML = message;

        this.$output.appendChild($log);
      }
    }, {
      key: 'submit',
      value: function submit(e) {
        var inputValue = this.$input.value.trim();

        // if input is blank, do nothing
        if (inputValue === '') {
          return e.preventDefault();
        }

        // add run to history
        this.history.push(inputValue);
        this.historyIndex = this.history.length;

        // log input value
        this.log(inputValue, 'history');

        // add return if it doesn't start with it
        if (inputValue.indexOf('return') !== 0) {
          inputValue = 'return ' + inputValue;
        }

        // show output or errors
        try {
          // run the console input in the iframe context
          var scriptOutput = this.getIframe().contentWindow.eval('(function() {' + inputValue + '})()');

          this.log(scriptOutput);
        } catch (err) {
          this.log(err, 'error');
        }

        // clear the console value
        this.$input.value = '';

        // scroll console pane to bottom
        // to keep the input into view
        this.$container.scrollTop = this.$container.scrollHeight;

        e.preventDefault();
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.$output.innerHTML = '';
      }
    }, {
      key: 'history',
      value: function history(e) {
        var UP = 38;
        var DOWN = 40;
        var gotHistory = false;
        var selectionStart = this.$input.selectionStart;

        // only if we have previous history
        // and the cursor is at the start
        if (e.keyCode === UP && this.historyIndex !== 0 && selectionStart === 0) {
          this.historyIndex--;
          gotHistory = true;
        }

        // only if we have future history
        // and the cursor is at the end
        if (e.keyCode === DOWN && this.historyIndex !== this.history.length - 1 && selectionStart === this.$input.value.length) {
          this.historyIndex++;
          gotHistory = true;
        }

        // only if history changed
        if (gotHistory) {
          this.$input.value = this.history[this.historyIndex];
        }
      }
    }]);
    return PluginConsole;
  }();

  /* play plugin
   * adds a Run button
   */

  var PluginPlay = function () {
    function PluginPlay(jotted, options) {
      classCallCheck(this, PluginPlay);

      options = extend(options, {
        firstRun: true
      });

      var priority = 10;
      // cached code
      var cache = {};
      // latest version of the code.
      // replaces the cache when the run button is pressed.
      var code = {};

      // set firstRun=false to start with a blank preview.
      // run the real content only after the first Run button press.
      if (options.firstRun === false) {
        cache = {
          html: {
            type: 'html',
            content: ''
          },
          css: {
            type: 'css',
            content: ''
          },
          js: {
            type: 'js',
            content: ''
          }
        };
      }

      // run button
      var $button = document.createElement('button');
      $button.className = 'jotted-button jotted-button-play';
      $button.innerHTML = 'Run';

      jotted.$container.appendChild($button);
      $button.addEventListener('click', this.run.bind(this));

      // capture the code on each change
      jotted.on('change', this.change.bind(this), priority);

      // public
      this.cache = cache;
      this.code = code;
      this.jotted = jotted;
    }

    createClass(PluginPlay, [{
      key: 'change',
      value: function change(params, callback) {
        // always cache the latest code
        this.code[params.type] = extend(params);

        // replace the params with the latest cache
        if (typeof this.cache[params.type] !== 'undefined') {
          callback(null, this.cache[params.type]);

          // make sure we don't cache forceRender,
          // and send it with each change.
          this.cache[params.type].forceRender = null;
        } else {
          // cache the first run
          this.cache[params.type] = extend(params);

          callback(null, params);
        }
      }
    }, {
      key: 'run',
      value: function run() {
        // trigger change on each type with the latest code
        for (var type in this.code) {
          this.cache[type] = extend(this.code[type], {
            // force rendering on each Run press
            forceRender: true
          });

          // trigger the change
          this.jotted.trigger('change', this.cache[type]);
        }
      }
    }]);
    return PluginPlay;
  }();

  /* bundle plugins
   */

  // register bundled plugins
  function BundlePlugins(jotted) {
    jotted.plugin('render', PluginRender);
    jotted.plugin('scriptless', PluginScriptless);

    jotted.plugin('ace', PluginAce);
    jotted.plugin('codemirror', PluginCodeMirror);
    jotted.plugin('less', PluginLess);
    jotted.plugin('coffeescript', PluginCoffeeScript);
    jotted.plugin('stylus', PluginStylus);
    jotted.plugin('babel', PluginBabel);
    jotted.plugin('markdown', PluginMarkdown);
    jotted.plugin('console', PluginConsole);
    jotted.plugin('play', PluginPlay);
  }

  /* jotted
   */

  var Jotted = function () {
    function Jotted($jottedContainer, opts) {
      classCallCheck(this, Jotted);

      if (!$jottedContainer) {
        throw new Error('Can\'t find Jotted container.');
      }

      // private data
      var _private = {};
      this._get = function (key) {
        return _private[key];
      };
      this._set = function (key, value) {
        _private[key] = value;
        return _private[key];
      };

      // options
      var options = this._set('options', extend(opts, {
        files: [],
        showBlank: false,
        runScripts: true,
        pane: 'result',
        debounce: 250,
        plugins: []
      }));

      // the render plugin is mandatory
      options.plugins.push('render');

      // use the scriptless plugin if runScripts is false
      if (options.runScripts === false) {
        options.plugins.push('scriptless');
      }

      // cached content for the change method.
      this._set('cachedContent', {
        html: null,
        css: null,
        js: null
      });

      // PubSoup
      var pubsoup = this._set('pubsoup', new PubSoup());

      this._set('trigger', this.trigger());
      this._set('on', function () {
        pubsoup.subscribe.apply(pubsoup, arguments);
      });
      this._set('off', function () {
        pubsoup.unsubscribe.apply(pubsoup, arguments);
      });
      var done = this._set('done', function () {
        pubsoup.done.apply(pubsoup, arguments);
      });

      // after all plugins run
      // show errors
      done('change', this.errors.bind(this));

      // DOM
      var $container = this._set('$container', $jottedContainer);
      $container.innerHTML = container();
      addClass($container, containerClass());

      // default pane
      var paneActive = this._set('paneActive', options.pane);
      addClass($container, paneActiveClass(paneActive));

      // status nodes
      this._set('$status', {});

      var _arr = ['html', 'css', 'js'];
      for (var _i = 0; _i < _arr.length; _i++) {
        var _type = _arr[_i];
        this.markup(_type);
      }

      // textarea change events.
      $container.addEventListener('keyup', debounce(this.change.bind(this), options.debounce));
      $container.addEventListener('change', debounce(this.change.bind(this), options.debounce));

      // pane change
      $container.addEventListener('click', this.pane.bind(this));

      // expose public properties
      this.$container = this._get('$container');
      this.on = this._get('on');
      this.off = this._get('off');
      this.done = this._get('done');
      this.trigger = this._get('trigger');
      this.paneActive = this._get('paneActive');

      // init plugins
      this._set('plugins', {});
      init.call(this);

      // load files
      var _arr2 = ['html', 'css', 'js'];
      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var _type2 = _arr2[_i2];
        this.load(_type2);
      }

      // show all tabs, even if empty
      if (options.showBlank) {
        var _arr3 = ['html', 'css', 'js'];

        for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
          var type = _arr3[_i3];
          addClass($container, hasFileClass(type));
        }
      }
    }

    createClass(Jotted, [{
      key: 'findFile',
      value: function findFile(type) {
        var file = {};
        var options = this._get('options');

        for (var fileIndex in options.files) {
          var _file = options.files[fileIndex];
          if (_file.type === type) {
            return _file;
          }
        }

        return file;
      }
    }, {
      key: 'markup',
      value: function markup(type) {
        var $container = this._get('$container');
        var $parent = $container.querySelector('.jotted-pane-' + type);
        // create the markup for an editor
        var file = this.findFile(type);

        var $editor = document.createElement('div');
        $editor.innerHTML = editorContent(type, file.url);
        $editor.className = editorClass(type);

        $parent.appendChild($editor);

        // get the status node
        this._get('$status')[type] = $parent.querySelector('.jotted-status');

        // if we have a file for the current type
        if (typeof file.url !== 'undefined' || typeof file.content !== 'undefined') {
          // add the has-type class to the container
          addClass($container, hasFileClass(type));
        }
      }
    }, {
      key: 'load',
      value: function load(type) {
        var _this = this;

        // create the markup for an editor
        var file = this.findFile(type);
        var $textarea = this._get('$container').querySelector('.jotted-pane-' + type + ' textarea');

        // file as string
        if (typeof file.content !== 'undefined') {
          this.setValue($textarea, file.content);
        } else if (typeof file.url !== 'undefined') {
          // show loading message
          this.status('loading', [statusLoading(file.url)], {
            type: type,
            file: file
          });

          // file as url
          fetch(file.url, function (err, res) {
            if (err) {
              // show load errors
              _this.status('error', [statusFetchError(err)], {
                type: type
              });

              return;
            }

            // clear the loading status
            _this.clearStatus('loading', {
              type: type
            });

            _this.setValue($textarea, res);
          });
        } else {
          // trigger a change event on blank editors,
          // for editor plugins to catch.
          // (eg. the codemirror and ace plugins attach the change event
          // only after the initial change/load event)
          this.setValue($textarea, '');
        }
      }
    }, {
      key: 'setValue',
      value: function setValue($textarea, val) {
        $textarea.value = val;

        // trigger change event, for initial render
        this.change({
          target: $textarea
        });
      }
    }, {
      key: 'change',
      value: function change(e) {
        var type = data(e.target, 'jotted-type');
        if (!type) {
          return;
        }

        // don't trigger change if the content hasn't changed.
        // eg. when blurring the textarea.
        var cachedContent = this._get('cachedContent');
        if (cachedContent[type] === e.target.value) {
          return;
        }

        // cache latest content
        cachedContent[type] = e.target.value;

        // trigger the change event
        this.trigger('change', {
          type: type,
          file: data(e.target, 'jotted-file'),
          content: cachedContent[type]
        });
      }
    }, {
      key: 'errors',
      value: function errors(errs, params) {
        this.status('error', errs, params);
      }
    }, {
      key: 'pane',
      value: function pane(e) {
        if (!data(e.target, 'jotted-type')) {
          return;
        }

        var $container = this._get('$container');
        var paneActive = this._get('paneActive');
        removeClass($container, paneActiveClass(paneActive));

        paneActive = this._set('paneActive', data(e.target, 'jotted-type'));
        addClass($container, paneActiveClass(paneActive));

        e.preventDefault();
      }
    }, {
      key: 'status',
      value: function status() {
        var statusType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'error';
        var messages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!messages.length) {
          return this.clearStatus(statusType, params);
        }

        var $status = this._get('$status');

        // add error/loading class to status
        addClass($status[params.type], statusClass(statusType));

        addClass(this._get('$container'), statusActiveClass(params.type));

        var markup = '';
        messages.forEach(function (err) {
          markup += statusMessage(err);
        });

        $status[params.type].innerHTML = markup;
      }
    }, {
      key: 'clearStatus',
      value: function clearStatus(statusType, params) {
        var $status = this._get('$status');

        removeClass($status[params.type], statusClass(statusType));
        removeClass(this._get('$container'), statusActiveClass(params.type));
        $status[params.type].innerHTML = '';
      }

      // debounced trigger method
      // custom debouncer to use a different timer per type

    }, {
      key: 'trigger',
      value: function trigger() {
        var options = this._get('options');
        var pubsoup = this._get('pubsoup');

        // allow disabling the trigger debouncer.
        // mostly for testing: when trigger events happen rapidly
        // multiple events of the same type would be caught once.
        if (options.debounce === false) {
          return function () {
            pubsoup.publish.apply(pubsoup, arguments);
          };
        }

        // cooldown timer
        var cooldown = {};
        // multiple calls
        var multiple = {};

        return function (topic) {
          var _arguments = arguments;

          var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _ref$type = _ref.type;
          var type = _ref$type === undefined ? 'default' : _ref$type;

          if (cooldown[type]) {
            // if we had multiple calls before the cooldown
            multiple[type] = true;
          } else {
            // trigger immediately once cooldown is over
            pubsoup.publish.apply(pubsoup, arguments);
          }

          clearTimeout(cooldown[type]);

          // set cooldown timer
          cooldown[type] = setTimeout(function () {
            // if we had multiple calls before the cooldown,
            // trigger the function again at the end.
            if (multiple[type]) {
              pubsoup.publish.apply(pubsoup, _arguments);
            }

            multiple[type] = null;
            cooldown[type] = null;
          }, options.debounce);
        };
      }
    }]);
    return Jotted;
  }();

  // register plugins


  Jotted.plugin = function () {
    return register.apply(this, arguments);
  };

  // register bundled plugins
  BundlePlugins(Jotted);

  return Jotted;

})));


},{}],6:[function(require,module,exports){
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (typeof define === 'function' && define.amd) {
  define(function () { return LZString; });
} else if( typeof module !== 'undefined' && module != null ) {
  module.exports = LZString
}

},{}],7:[function(require,module,exports){
var canPromise = require('can-promise')
var QRCode = require('./core/qrcode')
var CanvasRenderer = require('./renderer/canvas')
var SvgRenderer = require('./renderer/svg-tag.js')

function renderCanvas (renderFunc, canvas, text, opts, cb) {
  var args = [].slice.call(arguments, 1)
  var argsNum = args.length
  var isLastArgCb = typeof args[argsNum - 1] === 'function'

  if (!isLastArgCb && !canPromise()) {
    throw new Error('Callback required as last argument')
  }

  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error('Too few arguments provided')
    }

    if (argsNum === 2) {
      cb = text
      text = canvas
      canvas = opts = undefined
    } else if (argsNum === 3) {
      if (canvas.getContext && typeof cb === 'undefined') {
        cb = opts
        opts = undefined
      } else {
        cb = opts
        opts = text
        text = canvas
        canvas = undefined
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error('Too few arguments provided')
    }

    if (argsNum === 1) {
      text = canvas
      canvas = opts = undefined
    } else if (argsNum === 2 && !canvas.getContext) {
      opts = text
      text = canvas
      canvas = undefined
    }

    return new Promise(function (resolve, reject) {
      try {
        var data = QRCode.create(text, opts)
        resolve(renderFunc(data, canvas, opts))
      } catch (e) {
        reject(e)
      }
    })
  }

  try {
    var data = QRCode.create(text, opts)
    cb(null, renderFunc(data, canvas, opts))
  } catch (e) {
    cb(e)
  }
}

exports.create = QRCode.create
exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render)
exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL)

// only svg for now.
exports.toString = renderCanvas.bind(null, function (data, _, opts) {
  return SvgRenderer.render(data, opts)
})

},{"./core/qrcode":23,"./renderer/canvas":29,"./renderer/svg-tag.js":30,"can-promise":1}],8:[function(require,module,exports){
/**
 * Alignment pattern are fixed reference pattern in defined positions
 * in a matrix symbology, which enables the decode software to re-synchronise
 * the coordinate mapping of the image modules in the event of moderate amounts
 * of distortion of the image.
 *
 * Alignment patterns are present only in QR Code symbols of version 2 or larger
 * and their number depends on the symbol version.
 */

var getSymbolSize = require('./utils').getSymbolSize

/**
 * Calculate the row/column coordinates of the center module of each alignment pattern
 * for the specified QR Code version.
 *
 * The alignment patterns are positioned symmetrically on either side of the diagonal
 * running from the top left corner of the symbol to the bottom right corner.
 *
 * Since positions are simmetrical only half of the coordinates are returned.
 * Each item of the array will represent in turn the x and y coordinate.
 * @see {@link getPositions}
 *
 * @param  {Number} version QR Code version
 * @return {Array}          Array of coordinate
 */
exports.getRowColCoords = function getRowColCoords (version) {
  if (version === 1) return []

  var posCount = Math.floor(version / 7) + 2
  var size = getSymbolSize(version)
  var intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2
  var positions = [size - 7] // Last coord is always (size - 7)

  for (var i = 1; i < posCount - 1; i++) {
    positions[i] = positions[i - 1] - intervals
  }

  positions.push(6) // First coord is always 6

  return positions.reverse()
}

/**
 * Returns an array containing the positions of each alignment pattern.
 * Each array's element represent the center point of the pattern as (x, y) coordinates
 *
 * Coordinates are calculated expanding the row/column coordinates returned by {@link getRowColCoords}
 * and filtering out the items that overlaps with finder pattern
 *
 * @example
 * For a Version 7 symbol {@link getRowColCoords} returns values 6, 22 and 38.
 * The alignment patterns, therefore, are to be centered on (row, column)
 * positions (6,22), (22,6), (22,22), (22,38), (38,22), (38,38).
 * Note that the coordinates (6,6), (6,38), (38,6) are occupied by finder patterns
 * and are not therefore used for alignment patterns.
 *
 * var pos = getPositions(7)
 * // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
 *
 * @param  {Number} version QR Code version
 * @return {Array}          Array of coordinates
 */
exports.getPositions = function getPositions (version) {
  var coords = []
  var pos = exports.getRowColCoords(version)
  var posLength = pos.length

  for (var i = 0; i < posLength; i++) {
    for (var j = 0; j < posLength; j++) {
      // Skip if position is occupied by finder patterns
      if ((i === 0 && j === 0) ||             // top-left
          (i === 0 && j === posLength - 1) || // bottom-left
          (i === posLength - 1 && j === 0)) { // top-right
        continue
      }

      coords.push([pos[i], pos[j]])
    }
  }

  return coords
}

},{"./utils":27}],9:[function(require,module,exports){
var Mode = require('./mode')

/**
 * Array of characters available in alphanumeric mode
 *
 * As per QR Code specification, to each character
 * is assigned a value from 0 to 44 which in this case coincides
 * with the array index
 *
 * @type {Array}
 */
var ALPHA_NUM_CHARS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ' ', '$', '%', '*', '+', '-', '.', '/', ':'
]

function AlphanumericData (data) {
  this.mode = Mode.ALPHANUMERIC
  this.data = data
}

AlphanumericData.getBitsLength = function getBitsLength (length) {
  return 11 * Math.floor(length / 2) + 6 * (length % 2)
}

AlphanumericData.prototype.getLength = function getLength () {
  return this.data.length
}

AlphanumericData.prototype.getBitsLength = function getBitsLength () {
  return AlphanumericData.getBitsLength(this.data.length)
}

AlphanumericData.prototype.write = function write (bitBuffer) {
  var i

  // Input data characters are divided into groups of two characters
  // and encoded as 11-bit binary codes.
  for (i = 0; i + 2 <= this.data.length; i += 2) {
    // The character value of the first character is multiplied by 45
    var value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45

    // The character value of the second digit is added to the product
    value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1])

    // The sum is then stored as 11-bit binary number
    bitBuffer.put(value, 11)
  }

  // If the number of input data characters is not a multiple of two,
  // the character value of the final character is encoded as a 6-bit binary number.
  if (this.data.length % 2) {
    bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6)
  }
}

module.exports = AlphanumericData

},{"./mode":20}],10:[function(require,module,exports){
function BitBuffer () {
  this.buffer = []
  this.length = 0
}

BitBuffer.prototype = {

  get: function (index) {
    var bufIndex = Math.floor(index / 8)
    return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1
  },

  put: function (num, length) {
    for (var i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1)
    }
  },

  getLengthInBits: function () {
    return this.length
  },

  putBit: function (bit) {
    var bufIndex = Math.floor(this.length / 8)
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0)
    }

    if (bit) {
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8))
    }

    this.length++
  }
}

module.exports = BitBuffer

},{}],11:[function(require,module,exports){
var Buffer = require('../utils/buffer')

/**
 * Helper class to handle QR Code symbol modules
 *
 * @param {Number} size Symbol size
 */
function BitMatrix (size) {
  if (!size || size < 1) {
    throw new Error('BitMatrix size must be defined and greater than 0')
  }

  this.size = size
  this.data = new Buffer(size * size)
  this.data.fill(0)
  this.reservedBit = new Buffer(size * size)
  this.reservedBit.fill(0)
}

/**
 * Set bit value at specified location
 * If reserved flag is set, this bit will be ignored during masking process
 *
 * @param {Number}  row
 * @param {Number}  col
 * @param {Boolean} value
 * @param {Boolean} reserved
 */
BitMatrix.prototype.set = function (row, col, value, reserved) {
  var index = row * this.size + col
  this.data[index] = value
  if (reserved) this.reservedBit[index] = true
}

/**
 * Returns bit value at specified location
 *
 * @param  {Number}  row
 * @param  {Number}  col
 * @return {Boolean}
 */
BitMatrix.prototype.get = function (row, col) {
  return this.data[row * this.size + col]
}

/**
 * Applies xor operator at specified location
 * (used during masking process)
 *
 * @param {Number}  row
 * @param {Number}  col
 * @param {Boolean} value
 */
BitMatrix.prototype.xor = function (row, col, value) {
  this.data[row * this.size + col] ^= value
}

/**
 * Check if bit at specified location is reserved
 *
 * @param {Number}   row
 * @param {Number}   col
 * @return {Boolean}
 */
BitMatrix.prototype.isReserved = function (row, col) {
  return this.reservedBit[row * this.size + col]
}

module.exports = BitMatrix

},{"../utils/buffer":32}],12:[function(require,module,exports){
var Buffer = require('../utils/buffer')
var Mode = require('./mode')

function ByteData (data) {
  this.mode = Mode.BYTE
  this.data = new Buffer(data)
}

ByteData.getBitsLength = function getBitsLength (length) {
  return length * 8
}

ByteData.prototype.getLength = function getLength () {
  return this.data.length
}

ByteData.prototype.getBitsLength = function getBitsLength () {
  return ByteData.getBitsLength(this.data.length)
}

ByteData.prototype.write = function (bitBuffer) {
  for (var i = 0, l = this.data.length; i < l; i++) {
    bitBuffer.put(this.data[i], 8)
  }
}

module.exports = ByteData

},{"../utils/buffer":32,"./mode":20}],13:[function(require,module,exports){
var ECLevel = require('./error-correction-level')

var EC_BLOCKS_TABLE = [
// L  M  Q  H
  1, 1, 1, 1,
  1, 1, 1, 1,
  1, 1, 2, 2,
  1, 2, 2, 4,
  1, 2, 4, 4,
  2, 4, 4, 4,
  2, 4, 6, 5,
  2, 4, 6, 6,
  2, 5, 8, 8,
  4, 5, 8, 8,
  4, 5, 8, 11,
  4, 8, 10, 11,
  4, 9, 12, 16,
  4, 9, 16, 16,
  6, 10, 12, 18,
  6, 10, 17, 16,
  6, 11, 16, 19,
  6, 13, 18, 21,
  7, 14, 21, 25,
  8, 16, 20, 25,
  8, 17, 23, 25,
  9, 17, 23, 34,
  9, 18, 25, 30,
  10, 20, 27, 32,
  12, 21, 29, 35,
  12, 23, 34, 37,
  12, 25, 34, 40,
  13, 26, 35, 42,
  14, 28, 38, 45,
  15, 29, 40, 48,
  16, 31, 43, 51,
  17, 33, 45, 54,
  18, 35, 48, 57,
  19, 37, 51, 60,
  19, 38, 53, 63,
  20, 40, 56, 66,
  21, 43, 59, 70,
  22, 45, 62, 74,
  24, 47, 65, 77,
  25, 49, 68, 81
]

var EC_CODEWORDS_TABLE = [
// L  M  Q  H
  7, 10, 13, 17,
  10, 16, 22, 28,
  15, 26, 36, 44,
  20, 36, 52, 64,
  26, 48, 72, 88,
  36, 64, 96, 112,
  40, 72, 108, 130,
  48, 88, 132, 156,
  60, 110, 160, 192,
  72, 130, 192, 224,
  80, 150, 224, 264,
  96, 176, 260, 308,
  104, 198, 288, 352,
  120, 216, 320, 384,
  132, 240, 360, 432,
  144, 280, 408, 480,
  168, 308, 448, 532,
  180, 338, 504, 588,
  196, 364, 546, 650,
  224, 416, 600, 700,
  224, 442, 644, 750,
  252, 476, 690, 816,
  270, 504, 750, 900,
  300, 560, 810, 960,
  312, 588, 870, 1050,
  336, 644, 952, 1110,
  360, 700, 1020, 1200,
  390, 728, 1050, 1260,
  420, 784, 1140, 1350,
  450, 812, 1200, 1440,
  480, 868, 1290, 1530,
  510, 924, 1350, 1620,
  540, 980, 1440, 1710,
  570, 1036, 1530, 1800,
  570, 1064, 1590, 1890,
  600, 1120, 1680, 1980,
  630, 1204, 1770, 2100,
  660, 1260, 1860, 2220,
  720, 1316, 1950, 2310,
  750, 1372, 2040, 2430
]

/**
 * Returns the number of error correction block that the QR Code should contain
 * for the specified version and error correction level.
 *
 * @param  {Number} version              QR Code version
 * @param  {Number} errorCorrectionLevel Error correction level
 * @return {Number}                      Number of error correction blocks
 */
exports.getBlocksCount = function getBlocksCount (version, errorCorrectionLevel) {
  switch (errorCorrectionLevel) {
    case ECLevel.L:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 0]
    case ECLevel.M:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 1]
    case ECLevel.Q:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 2]
    case ECLevel.H:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 3]
    default:
      return undefined
  }
}

/**
 * Returns the number of error correction codewords to use for the specified
 * version and error correction level.
 *
 * @param  {Number} version              QR Code version
 * @param  {Number} errorCorrectionLevel Error correction level
 * @return {Number}                      Number of error correction codewords
 */
exports.getTotalCodewordsCount = function getTotalCodewordsCount (version, errorCorrectionLevel) {
  switch (errorCorrectionLevel) {
    case ECLevel.L:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0]
    case ECLevel.M:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1]
    case ECLevel.Q:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2]
    case ECLevel.H:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3]
    default:
      return undefined
  }
}

},{"./error-correction-level":14}],14:[function(require,module,exports){
exports.L = { bit: 1 }
exports.M = { bit: 0 }
exports.Q = { bit: 3 }
exports.H = { bit: 2 }

function fromString (string) {
  if (typeof string !== 'string') {
    throw new Error('Param is not a string')
  }

  var lcStr = string.toLowerCase()

  switch (lcStr) {
    case 'l':
    case 'low':
      return exports.L

    case 'm':
    case 'medium':
      return exports.M

    case 'q':
    case 'quartile':
      return exports.Q

    case 'h':
    case 'high':
      return exports.H

    default:
      throw new Error('Unknown EC Level: ' + string)
  }
}

exports.isValid = function isValid (level) {
  return level && typeof level.bit !== 'undefined' &&
    level.bit >= 0 && level.bit < 4
}

exports.from = function from (value, defaultValue) {
  if (exports.isValid(value)) {
    return value
  }

  try {
    return fromString(value)
  } catch (e) {
    return defaultValue
  }
}

},{}],15:[function(require,module,exports){
var getSymbolSize = require('./utils').getSymbolSize
var FINDER_PATTERN_SIZE = 7

/**
 * Returns an array containing the positions of each finder pattern.
 * Each array's element represent the top-left point of the pattern as (x, y) coordinates
 *
 * @param  {Number} version QR Code version
 * @return {Array}          Array of coordinates
 */
exports.getPositions = function getPositions (version) {
  var size = getSymbolSize(version)

  return [
    // top-left
    [0, 0],
    // top-right
    [size - FINDER_PATTERN_SIZE, 0],
    // bottom-left
    [0, size - FINDER_PATTERN_SIZE]
  ]
}

},{"./utils":27}],16:[function(require,module,exports){
var Utils = require('./utils')

var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0)
var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1)
var G15_BCH = Utils.getBCHDigit(G15)

/**
 * Returns format information with relative error correction bits
 *
 * The format information is a 15-bit sequence containing 5 data bits,
 * with 10 error correction bits calculated using the (15, 5) BCH code.
 *
 * @param  {Number} errorCorrectionLevel Error correction level
 * @param  {Number} mask                 Mask pattern
 * @return {Number}                      Encoded format information bits
 */
exports.getEncodedBits = function getEncodedBits (errorCorrectionLevel, mask) {
  var data = ((errorCorrectionLevel.bit << 3) | mask)
  var d = data << 10

  while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= (G15 << (Utils.getBCHDigit(d) - G15_BCH))
  }

  // xor final data with mask pattern in order to ensure that
  // no combination of Error Correction Level and data mask pattern
  // will result in an all-zero data string
  return ((data << 10) | d) ^ G15_MASK
}

},{"./utils":27}],17:[function(require,module,exports){
var Buffer = require('../utils/buffer')

var EXP_TABLE = new Buffer(512)
var LOG_TABLE = new Buffer(256)

/**
 * Precompute the log and anti-log tables for faster computation later
 *
 * For each possible value in the galois field 2^8, we will pre-compute
 * the logarithm and anti-logarithm (exponential) of this value
 *
 * ref {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Introduction_to_mathematical_fields}
 */
;(function initTables () {
  var x = 1
  for (var i = 0; i < 255; i++) {
    EXP_TABLE[i] = x
    LOG_TABLE[x] = i

    x <<= 1 // multiply by 2

    // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
    // This means that when a number is 256 or larger, it should be XORed with 0x11D.
    if (x & 0x100) { // similar to x >= 256, but a lot faster (because 0x100 == 256)
      x ^= 0x11D
    }
  }

  // Optimization: double the size of the anti-log table so that we don't need to mod 255 to
  // stay inside the bounds (because we will mainly use this table for the multiplication of
  // two GF numbers, no more).
  // @see {@link mul}
  for (i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255]
  }
}())

/**
 * Returns log value of n inside Galois Field
 *
 * @param  {Number} n
 * @return {Number}
 */
exports.log = function log (n) {
  if (n < 1) throw new Error('log(' + n + ')')
  return LOG_TABLE[n]
}

/**
 * Returns anti-log value of n inside Galois Field
 *
 * @param  {Number} n
 * @return {Number}
 */
exports.exp = function exp (n) {
  return EXP_TABLE[n]
}

/**
 * Multiplies two number inside Galois Field
 *
 * @param  {Number} x
 * @param  {Number} y
 * @return {Number}
 */
exports.mul = function mul (x, y) {
  if (x === 0 || y === 0) return 0

  // should be EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255] if EXP_TABLE wasn't oversized
  // @see {@link initTables}
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
}

},{"../utils/buffer":32}],18:[function(require,module,exports){
var Mode = require('./mode')
var Utils = require('./utils')

function KanjiData (data) {
  this.mode = Mode.KANJI
  this.data = data
}

KanjiData.getBitsLength = function getBitsLength (length) {
  return length * 13
}

KanjiData.prototype.getLength = function getLength () {
  return this.data.length
}

KanjiData.prototype.getBitsLength = function getBitsLength () {
  return KanjiData.getBitsLength(this.data.length)
}

KanjiData.prototype.write = function (bitBuffer) {
  var i

  // In the Shift JIS system, Kanji characters are represented by a two byte combination.
  // These byte values are shifted from the JIS X 0208 values.
  // JIS X 0208 gives details of the shift coded representation.
  for (i = 0; i < this.data.length; i++) {
    var value = Utils.toSJIS(this.data[i])

    // For characters with Shift JIS values from 0x8140 to 0x9FFC:
    if (value >= 0x8140 && value <= 0x9FFC) {
      // Subtract 0x8140 from Shift JIS value
      value -= 0x8140

    // For characters with Shift JIS values from 0xE040 to 0xEBBF
    } else if (value >= 0xE040 && value <= 0xEBBF) {
      // Subtract 0xC140 from Shift JIS value
      value -= 0xC140
    } else {
      throw new Error(
        'Invalid SJIS character: ' + this.data[i] + '\n' +
        'Make sure your charset is UTF-8')
    }

    // Multiply most significant byte of result by 0xC0
    // and add least significant byte to product
    value = (((value >>> 8) & 0xff) * 0xC0) + (value & 0xff)

    // Convert result to a 13-bit binary string
    bitBuffer.put(value, 13)
  }
}

module.exports = KanjiData

},{"./mode":20,"./utils":27}],19:[function(require,module,exports){
/**
 * Data mask pattern reference
 * @type {Object}
 */
exports.Patterns = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7
}

/**
 * Weighted penalty scores for the undesirable features
 * @type {Object}
 */
var PenaltyScores = {
  N1: 3,
  N2: 3,
  N3: 40,
  N4: 10
}

/**
 * Check if mask pattern value is valid
 *
 * @param  {Number}  mask    Mask pattern
 * @return {Boolean}         true if valid, false otherwise
 */
exports.isValid = function isValid (mask) {
  return mask && mask !== '' && !isNaN(mask) && mask >= 0 && mask <= 7
}

/**
 * Returns mask pattern from a value.
 * If value is not valid, returns undefined
 *
 * @param  {Number|String} value        Mask pattern value
 * @return {Number}                     Valid mask pattern or undefined
 */
exports.from = function from (value) {
  return exports.isValid(value) ? parseInt(value, 10) : undefined
}

/**
* Find adjacent modules in row/column with the same color
* and assign a penalty value.
*
* Points: N1 + i
* i is the amount by which the number of adjacent modules of the same color exceeds 5
*/
exports.getPenaltyN1 = function getPenaltyN1 (data) {
  var size = data.size
  var points = 0
  var sameCountCol = 0
  var sameCountRow = 0
  var lastCol = null
  var lastRow = null

  for (var row = 0; row < size; row++) {
    sameCountCol = sameCountRow = 0
    lastCol = lastRow = null

    for (var col = 0; col < size; col++) {
      var module = data.get(row, col)
      if (module === lastCol) {
        sameCountCol++
      } else {
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
        lastCol = module
        sameCountCol = 1
      }

      module = data.get(col, row)
      if (module === lastRow) {
        sameCountRow++
      } else {
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
        lastRow = module
        sameCountRow = 1
      }
    }

    if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
    if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
  }

  return points
}

/**
 * Find 2x2 blocks with the same color and assign a penalty value
 *
 * Points: N2 * (m - 1) * (n - 1)
 */
exports.getPenaltyN2 = function getPenaltyN2 (data) {
  var size = data.size
  var points = 0

  for (var row = 0; row < size - 1; row++) {
    for (var col = 0; col < size - 1; col++) {
      var last = data.get(row, col) +
        data.get(row, col + 1) +
        data.get(row + 1, col) +
        data.get(row + 1, col + 1)

      if (last === 4 || last === 0) points++
    }
  }

  return points * PenaltyScores.N2
}

/**
 * Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
 * preceded or followed by light area 4 modules wide
 *
 * Points: N3 * number of pattern found
 */
exports.getPenaltyN3 = function getPenaltyN3 (data) {
  var size = data.size
  var points = 0
  var bitsCol = 0
  var bitsRow = 0

  for (var row = 0; row < size; row++) {
    bitsCol = bitsRow = 0
    for (var col = 0; col < size; col++) {
      bitsCol = ((bitsCol << 1) & 0x7FF) | data.get(row, col)
      if (col >= 10 && (bitsCol === 0x5D0 || bitsCol === 0x05D)) points++

      bitsRow = ((bitsRow << 1) & 0x7FF) | data.get(col, row)
      if (col >= 10 && (bitsRow === 0x5D0 || bitsRow === 0x05D)) points++
    }
  }

  return points * PenaltyScores.N3
}

/**
 * Calculate proportion of dark modules in entire symbol
 *
 * Points: N4 * k
 *
 * k is the rating of the deviation of the proportion of dark modules
 * in the symbol from 50% in steps of 5%
 */
exports.getPenaltyN4 = function getPenaltyN4 (data) {
  var darkCount = 0
  var modulesCount = data.data.length

  for (var i = 0; i < modulesCount; i++) darkCount += data.data[i]

  var k = Math.abs(Math.ceil((darkCount * 100 / modulesCount) / 5) - 10)

  return k * PenaltyScores.N4
}

/**
 * Return mask value at given position
 *
 * @param  {Number} maskPattern Pattern reference value
 * @param  {Number} i           Row
 * @param  {Number} j           Column
 * @return {Boolean}            Mask value
 */
function getMaskAt (maskPattern, i, j) {
  switch (maskPattern) {
    case exports.Patterns.PATTERN000: return (i + j) % 2 === 0
    case exports.Patterns.PATTERN001: return i % 2 === 0
    case exports.Patterns.PATTERN010: return j % 3 === 0
    case exports.Patterns.PATTERN011: return (i + j) % 3 === 0
    case exports.Patterns.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
    case exports.Patterns.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0
    case exports.Patterns.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0
    case exports.Patterns.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 === 0

    default: throw new Error('bad maskPattern:' + maskPattern)
  }
}

/**
 * Apply a mask pattern to a BitMatrix
 *
 * @param  {Number}    pattern Pattern reference number
 * @param  {BitMatrix} data    BitMatrix data
 */
exports.applyMask = function applyMask (pattern, data) {
  var size = data.size

  for (var col = 0; col < size; col++) {
    for (var row = 0; row < size; row++) {
      if (data.isReserved(row, col)) continue
      data.xor(row, col, getMaskAt(pattern, row, col))
    }
  }
}

/**
 * Returns the best mask pattern for data
 *
 * @param  {BitMatrix} data
 * @return {Number} Mask pattern reference number
 */
exports.getBestMask = function getBestMask (data, setupFormatFunc) {
  var numPatterns = Object.keys(exports.Patterns).length
  var bestPattern = 0
  var lowerPenalty = Infinity

  for (var p = 0; p < numPatterns; p++) {
    setupFormatFunc(p)
    exports.applyMask(p, data)

    // Calculate penalty
    var penalty =
      exports.getPenaltyN1(data) +
      exports.getPenaltyN2(data) +
      exports.getPenaltyN3(data) +
      exports.getPenaltyN4(data)

    // Undo previously applied mask
    exports.applyMask(p, data)

    if (penalty < lowerPenalty) {
      lowerPenalty = penalty
      bestPattern = p
    }
  }

  return bestPattern
}

},{}],20:[function(require,module,exports){
var Version = require('./version')
var Regex = require('./regex')

/**
 * Numeric mode encodes data from the decimal digit set (0 - 9)
 * (byte values 30HEX to 39HEX).
 * Normally, 3 data characters are represented by 10 bits.
 *
 * @type {Object}
 */
exports.NUMERIC = {
  id: 'Numeric',
  bit: 1 << 0,
  ccBits: [10, 12, 14]
}

/**
 * Alphanumeric mode encodes data from a set of 45 characters,
 * i.e. 10 numeric digits (0 - 9),
 *      26 alphabetic characters (A - Z),
 *   and 9 symbols (SP, $, %, *, +, -, ., /, :).
 * Normally, two input characters are represented by 11 bits.
 *
 * @type {Object}
 */
exports.ALPHANUMERIC = {
  id: 'Alphanumeric',
  bit: 1 << 1,
  ccBits: [9, 11, 13]
}

/**
 * In byte mode, data is encoded at 8 bits per character.
 *
 * @type {Object}
 */
exports.BYTE = {
  id: 'Byte',
  bit: 1 << 2,
  ccBits: [8, 16, 16]
}

/**
 * The Kanji mode efficiently encodes Kanji characters in accordance with
 * the Shift JIS system based on JIS X 0208.
 * The Shift JIS values are shifted from the JIS X 0208 values.
 * JIS X 0208 gives details of the shift coded representation.
 * Each two-byte character value is compacted to a 13-bit binary codeword.
 *
 * @type {Object}
 */
exports.KANJI = {
  id: 'Kanji',
  bit: 1 << 3,
  ccBits: [8, 10, 12]
}

/**
 * Mixed mode will contain a sequences of data in a combination of any of
 * the modes described above
 *
 * @type {Object}
 */
exports.MIXED = {
  bit: -1
}

/**
 * Returns the number of bits needed to store the data length
 * according to QR Code specifications.
 *
 * @param  {Mode}   mode    Data mode
 * @param  {Number} version QR Code version
 * @return {Number}         Number of bits
 */
exports.getCharCountIndicator = function getCharCountIndicator (mode, version) {
  if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

  if (!Version.isValid(version)) {
    throw new Error('Invalid version: ' + version)
  }

  if (version >= 1 && version < 10) return mode.ccBits[0]
  else if (version < 27) return mode.ccBits[1]
  return mode.ccBits[2]
}

/**
 * Returns the most efficient mode to store the specified data
 *
 * @param  {String} dataStr Input data string
 * @return {Mode}           Best mode
 */
exports.getBestModeForData = function getBestModeForData (dataStr) {
  if (Regex.testNumeric(dataStr)) return exports.NUMERIC
  else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC
  else if (Regex.testKanji(dataStr)) return exports.KANJI
  else return exports.BYTE
}

/**
 * Return mode name as string
 *
 * @param {Mode} mode Mode object
 * @returns {String}  Mode name
 */
exports.toString = function toString (mode) {
  if (mode && mode.id) return mode.id
  throw new Error('Invalid mode')
}

/**
 * Check if input param is a valid mode object
 *
 * @param   {Mode}    mode Mode object
 * @returns {Boolean} True if valid mode, false otherwise
 */
exports.isValid = function isValid (mode) {
  return mode && mode.bit && mode.ccBits
}

/**
 * Get mode object from its name
 *
 * @param   {String} string Mode name
 * @returns {Mode}          Mode object
 */
function fromString (string) {
  if (typeof string !== 'string') {
    throw new Error('Param is not a string')
  }

  var lcStr = string.toLowerCase()

  switch (lcStr) {
    case 'numeric':
      return exports.NUMERIC
    case 'alphanumeric':
      return exports.ALPHANUMERIC
    case 'kanji':
      return exports.KANJI
    case 'byte':
      return exports.BYTE
    default:
      throw new Error('Unknown mode: ' + string)
  }
}

/**
 * Returns mode from a value.
 * If value is not a valid mode, returns defaultValue
 *
 * @param  {Mode|String} value        Encoding mode
 * @param  {Mode}        defaultValue Fallback value
 * @return {Mode}                     Encoding mode
 */
exports.from = function from (value, defaultValue) {
  if (exports.isValid(value)) {
    return value
  }

  try {
    return fromString(value)
  } catch (e) {
    return defaultValue
  }
}

},{"./regex":25,"./version":28}],21:[function(require,module,exports){
var Mode = require('./mode')

function NumericData (data) {
  this.mode = Mode.NUMERIC
  this.data = data.toString()
}

NumericData.getBitsLength = function getBitsLength (length) {
  return 10 * Math.floor(length / 3) + ((length % 3) ? ((length % 3) * 3 + 1) : 0)
}

NumericData.prototype.getLength = function getLength () {
  return this.data.length
}

NumericData.prototype.getBitsLength = function getBitsLength () {
  return NumericData.getBitsLength(this.data.length)
}

NumericData.prototype.write = function write (bitBuffer) {
  var i, group, value

  // The input data string is divided into groups of three digits,
  // and each group is converted to its 10-bit binary equivalent.
  for (i = 0; i + 3 <= this.data.length; i += 3) {
    group = this.data.substr(i, 3)
    value = parseInt(group, 10)

    bitBuffer.put(value, 10)
  }

  // If the number of input digits is not an exact multiple of three,
  // the final one or two digits are converted to 4 or 7 bits respectively.
  var remainingNum = this.data.length - i
  if (remainingNum > 0) {
    group = this.data.substr(i)
    value = parseInt(group, 10)

    bitBuffer.put(value, remainingNum * 3 + 1)
  }
}

module.exports = NumericData

},{"./mode":20}],22:[function(require,module,exports){
var Buffer = require('../utils/buffer')
var GF = require('./galois-field')

/**
 * Multiplies two polynomials inside Galois Field
 *
 * @param  {Buffer} p1 Polynomial
 * @param  {Buffer} p2 Polynomial
 * @return {Buffer}    Product of p1 and p2
 */
exports.mul = function mul (p1, p2) {
  var coeff = new Buffer(p1.length + p2.length - 1)
  coeff.fill(0)

  for (var i = 0; i < p1.length; i++) {
    for (var j = 0; j < p2.length; j++) {
      coeff[i + j] ^= GF.mul(p1[i], p2[j])
    }
  }

  return coeff
}

/**
 * Calculate the remainder of polynomials division
 *
 * @param  {Buffer} divident Polynomial
 * @param  {Buffer} divisor  Polynomial
 * @return {Buffer}          Remainder
 */
exports.mod = function mod (divident, divisor) {
  var result = new Buffer(divident)

  while ((result.length - divisor.length) >= 0) {
    var coeff = result[0]

    for (var i = 0; i < divisor.length; i++) {
      result[i] ^= GF.mul(divisor[i], coeff)
    }

    // remove all zeros from buffer head
    var offset = 0
    while (offset < result.length && result[offset] === 0) offset++
    result = result.slice(offset)
  }

  return result
}

/**
 * Generate an irreducible generator polynomial of specified degree
 * (used by Reed-Solomon encoder)
 *
 * @param  {Number} degree Degree of the generator polynomial
 * @return {Buffer}        Buffer containing polynomial coefficients
 */
exports.generateECPolynomial = function generateECPolynomial (degree) {
  var poly = new Buffer([1])
  for (var i = 0; i < degree; i++) {
    poly = exports.mul(poly, [1, GF.exp(i)])
  }

  return poly
}

},{"../utils/buffer":32,"./galois-field":17}],23:[function(require,module,exports){
var Buffer = require('../utils/buffer')
var Utils = require('./utils')
var ECLevel = require('./error-correction-level')
var BitBuffer = require('./bit-buffer')
var BitMatrix = require('./bit-matrix')
var AlignmentPattern = require('./alignment-pattern')
var FinderPattern = require('./finder-pattern')
var MaskPattern = require('./mask-pattern')
var ECCode = require('./error-correction-code')
var ReedSolomonEncoder = require('./reed-solomon-encoder')
var Version = require('./version')
var FormatInfo = require('./format-info')
var Mode = require('./mode')
var Segments = require('./segments')
var isArray = require('isarray')

/**
 * QRCode for JavaScript
 *
 * modified by Ryan Day for nodejs support
 * Copyright (c) 2011 Ryan Day
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
*/

/**
 * Add finder patterns bits to matrix
 *
 * @param  {BitMatrix} matrix  Modules matrix
 * @param  {Number}    version QR Code version
 */
function setupFinderPattern (matrix, version) {
  var size = matrix.size
  var pos = FinderPattern.getPositions(version)

  for (var i = 0; i < pos.length; i++) {
    var row = pos[i][0]
    var col = pos[i][1]

    for (var r = -1; r <= 7; r++) {
      if (row + r <= -1 || size <= row + r) continue

      for (var c = -1; c <= 7; c++) {
        if (col + c <= -1 || size <= col + c) continue

        if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix.set(row + r, col + c, true, true)
        } else {
          matrix.set(row + r, col + c, false, true)
        }
      }
    }
  }
}

/**
 * Add timing pattern bits to matrix
 *
 * Note: this function must be called before {@link setupAlignmentPattern}
 *
 * @param  {BitMatrix} matrix Modules matrix
 */
function setupTimingPattern (matrix) {
  var size = matrix.size

  for (var r = 8; r < size - 8; r++) {
    var value = r % 2 === 0
    matrix.set(r, 6, value, true)
    matrix.set(6, r, value, true)
  }
}

/**
 * Add alignment patterns bits to matrix
 *
 * Note: this function must be called after {@link setupTimingPattern}
 *
 * @param  {BitMatrix} matrix  Modules matrix
 * @param  {Number}    version QR Code version
 */
function setupAlignmentPattern (matrix, version) {
  var pos = AlignmentPattern.getPositions(version)

  for (var i = 0; i < pos.length; i++) {
    var row = pos[i][0]
    var col = pos[i][1]

    for (var r = -2; r <= 2; r++) {
      for (var c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 ||
          (r === 0 && c === 0)) {
          matrix.set(row + r, col + c, true, true)
        } else {
          matrix.set(row + r, col + c, false, true)
        }
      }
    }
  }
}

/**
 * Add version info bits to matrix
 *
 * @param  {BitMatrix} matrix  Modules matrix
 * @param  {Number}    version QR Code version
 */
function setupVersionInfo (matrix, version) {
  var size = matrix.size
  var bits = Version.getEncodedBits(version)
  var row, col, mod

  for (var i = 0; i < 18; i++) {
    row = Math.floor(i / 3)
    col = i % 3 + size - 8 - 3
    mod = ((bits >> i) & 1) === 1

    matrix.set(row, col, mod, true)
    matrix.set(col, row, mod, true)
  }
}

/**
 * Add format info bits to matrix
 *
 * @param  {BitMatrix} matrix               Modules matrix
 * @param  {ErrorCorrectionLevel}    errorCorrectionLevel Error correction level
 * @param  {Number}    maskPattern          Mask pattern reference value
 */
function setupFormatInfo (matrix, errorCorrectionLevel, maskPattern) {
  var size = matrix.size
  var bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern)
  var i, mod

  for (i = 0; i < 15; i++) {
    mod = ((bits >> i) & 1) === 1

    // vertical
    if (i < 6) {
      matrix.set(i, 8, mod, true)
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true)
    } else {
      matrix.set(size - 15 + i, 8, mod, true)
    }

    // horizontal
    if (i < 8) {
      matrix.set(8, size - i - 1, mod, true)
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true)
    } else {
      matrix.set(8, 15 - i - 1, mod, true)
    }
  }

  // fixed module
  matrix.set(size - 8, 8, 1, true)
}

/**
 * Add encoded data bits to matrix
 *
 * @param  {BitMatrix} matrix Modules matrix
 * @param  {Buffer}    data   Data codewords
 */
function setupData (matrix, data) {
  var size = matrix.size
  var inc = -1
  var row = size - 1
  var bitIndex = 7
  var byteIndex = 0

  for (var col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--

    while (true) {
      for (var c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          var dark = false

          if (byteIndex < data.length) {
            dark = (((data[byteIndex] >>> bitIndex) & 1) === 1)
          }

          matrix.set(row, col - c, dark)
          bitIndex--

          if (bitIndex === -1) {
            byteIndex++
            bitIndex = 7
          }
        }
      }

      row += inc

      if (row < 0 || size <= row) {
        row -= inc
        inc = -inc
        break
      }
    }
  }
}

/**
 * Create encoded codewords from data input
 *
 * @param  {Number}   version              QR Code version
 * @param  {ErrorCorrectionLevel}   errorCorrectionLevel Error correction level
 * @param  {ByteData} data                 Data input
 * @return {Buffer}                        Buffer containing encoded codewords
 */
function createData (version, errorCorrectionLevel, segments) {
  // Prepare data buffer
  var buffer = new BitBuffer()

  segments.forEach(function (data) {
    // prefix data with mode indicator (4 bits)
    buffer.put(data.mode.bit, 4)

    // Prefix data with character count indicator.
    // The character count indicator is a string of bits that represents the
    // number of characters that are being encoded.
    // The character count indicator must be placed after the mode indicator
    // and must be a certain number of bits long, depending on the QR version
    // and data mode
    // @see {@link Mode.getCharCountIndicator}.
    buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version))

    // add binary data sequence to buffer
    data.write(buffer)
  })

  // Calculate required number of bits
  var totalCodewords = Utils.getSymbolTotalCodewords(version)
  var ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)
  var dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8

  // Add a terminator.
  // If the bit string is shorter than the total number of required bits,
  // a terminator of up to four 0s must be added to the right side of the string.
  // If the bit string is more than four bits shorter than the required number of bits,
  // add four 0s to the end.
  if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer.put(0, 4)
  }

  // If the bit string is fewer than four bits shorter, add only the number of 0s that
  // are needed to reach the required number of bits.

  // After adding the terminator, if the number of bits in the string is not a multiple of 8,
  // pad the string on the right with 0s to make the string's length a multiple of 8.
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(0)
  }

  // Add pad bytes if the string is still shorter than the total number of required bits.
  // Extend the buffer to fill the data capacity of the symbol corresponding to
  // the Version and Error Correction Level by adding the Pad Codewords 11101100 (0xEC)
  // and 00010001 (0x11) alternately.
  var remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8
  for (var i = 0; i < remainingByte; i++) {
    buffer.put(i % 2 ? 0x11 : 0xEC, 8)
  }

  return createCodewords(buffer, version, errorCorrectionLevel)
}

/**
 * Encode input data with Reed-Solomon and return codewords with
 * relative error correction bits
 *
 * @param  {BitBuffer} bitBuffer            Data to encode
 * @param  {Number}    version              QR Code version
 * @param  {ErrorCorrectionLevel} errorCorrectionLevel Error correction level
 * @return {Buffer}                         Buffer containing encoded codewords
 */
function createCodewords (bitBuffer, version, errorCorrectionLevel) {
  // Total codewords for this QR code version (Data + Error correction)
  var totalCodewords = Utils.getSymbolTotalCodewords(version)

  // Total number of error correction codewords
  var ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

  // Total number of data codewords
  var dataTotalCodewords = totalCodewords - ecTotalCodewords

  // Total number of blocks
  var ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel)

  // Calculate how many blocks each group should contain
  var blocksInGroup2 = totalCodewords % ecTotalBlocks
  var blocksInGroup1 = ecTotalBlocks - blocksInGroup2

  var totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks)

  var dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks)
  var dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1

  // Number of EC codewords is the same for both groups
  var ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1

  // Initialize a Reed-Solomon encoder with a generator polynomial of degree ecCount
  var rs = new ReedSolomonEncoder(ecCount)

  var offset = 0
  var dcData = new Array(ecTotalBlocks)
  var ecData = new Array(ecTotalBlocks)
  var maxDataSize = 0
  var buffer = new Buffer(bitBuffer.buffer)

  // Divide the buffer into the required number of blocks
  for (var b = 0; b < ecTotalBlocks; b++) {
    var dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2

    // extract a block of data from buffer
    dcData[b] = buffer.slice(offset, offset + dataSize)

    // Calculate EC codewords for this data block
    ecData[b] = rs.encode(dcData[b])

    offset += dataSize
    maxDataSize = Math.max(maxDataSize, dataSize)
  }

  // Create final data
  // Interleave the data and error correction codewords from each block
  var data = new Buffer(totalCodewords)
  var index = 0
  var i, r

  // Add data codewords
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i]
      }
    }
  }

  // Apped EC codewords
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      data[index++] = ecData[r][i]
    }
  }

  return data
}

/**
 * Build QR Code symbol
 *
 * @param  {String} data                 Input string
 * @param  {Number} version              QR Code version
 * @param  {ErrorCorretionLevel} errorCorrectionLevel Error level
 * @param  {MaskPattern} maskPattern     Mask pattern
 * @return {Object}                      Object containing symbol data
 */
function createSymbol (data, version, errorCorrectionLevel, maskPattern) {
  var segments

  if (isArray(data)) {
    segments = Segments.fromArray(data)
  } else if (typeof data === 'string') {
    var estimatedVersion = version

    if (!estimatedVersion) {
      var rawSegments = Segments.rawSplit(data)

      // Estimate best version that can contain raw splitted segments
      estimatedVersion = Version.getBestVersionForData(rawSegments,
        errorCorrectionLevel)
    }

    // Build optimized segments
    // If estimated version is undefined, try with the highest version
    segments = Segments.fromString(data, estimatedVersion || 40)
  } else {
    throw new Error('Invalid data')
  }

  // Get the min version that can contain data
  var bestVersion = Version.getBestVersionForData(segments,
      errorCorrectionLevel)

  // If no version is found, data cannot be stored
  if (!bestVersion) {
    throw new Error('The amount of data is too big to be stored in a QR Code')
  }

  // If not specified, use min version as default
  if (!version) {
    version = bestVersion

  // Check if the specified version can contain the data
  } else if (version < bestVersion) {
    throw new Error('\n' +
      'The chosen QR Code version cannot contain this amount of data.\n' +
      'Minimum version required to store current data is: ' + bestVersion + '.\n'
    )
  }

  var dataBits = createData(version, errorCorrectionLevel, segments)

  // Allocate matrix buffer
  var moduleCount = Utils.getSymbolSize(version)
  var modules = new BitMatrix(moduleCount)

  // Add function modules
  setupFinderPattern(modules, version)
  setupTimingPattern(modules)
  setupAlignmentPattern(modules, version)

  // Add temporary dummy bits for format info just to set them as reserved.
  // This is needed to prevent these bits from being masked by {@link MaskPattern.applyMask}
  // since the masking operation must be performed only on the encoding region.
  // These blocks will be replaced with correct values later in code.
  setupFormatInfo(modules, errorCorrectionLevel, 0)

  if (version >= 7) {
    setupVersionInfo(modules, version)
  }

  // Add data codewords
  setupData(modules, dataBits)

  if (!maskPattern) {
    // Find best mask pattern
    maskPattern = MaskPattern.getBestMask(modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel))
  }

  // Apply mask pattern
  MaskPattern.applyMask(maskPattern, modules)

  // Replace format info bits with correct values
  setupFormatInfo(modules, errorCorrectionLevel, maskPattern)

  return {
    modules: modules,
    version: version,
    errorCorrectionLevel: errorCorrectionLevel,
    maskPattern: maskPattern,
    segments: segments
  }
}

/**
 * QR Code
 *
 * @param {String | Array} data                 Input data
 * @param {Object} options                      Optional configurations
 * @param {Number} options.version              QR Code version
 * @param {String} options.errorCorrectionLevel Error correction level
 * @param {Function} options.toSJISFunc         Helper func to convert utf8 to sjis
 */
exports.create = function create (data, options) {
  if (typeof data === 'undefined' || data === '') {
    throw new Error('No input text')
  }

  var errorCorrectionLevel = ECLevel.M
  var version
  var mask

  if (typeof options !== 'undefined') {
    // Use higher error correction level as default
    errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M)
    version = Version.from(options.version)
    mask = MaskPattern.from(options.maskPattern)

    if (options.toSJISFunc) {
      Utils.setToSJISFunction(options.toSJISFunc)
    }
  }

  return createSymbol(data, version, errorCorrectionLevel, mask)
}

},{"../utils/buffer":32,"./alignment-pattern":8,"./bit-buffer":10,"./bit-matrix":11,"./error-correction-code":13,"./error-correction-level":14,"./finder-pattern":15,"./format-info":16,"./mask-pattern":19,"./mode":20,"./reed-solomon-encoder":24,"./segments":26,"./utils":27,"./version":28,"isarray":33}],24:[function(require,module,exports){
var Buffer = require('../utils/buffer')
var Polynomial = require('./polynomial')

function ReedSolomonEncoder (degree) {
  this.genPoly = undefined
  this.degree = degree

  if (this.degree) this.initialize(this.degree)
}

/**
 * Initialize the encoder.
 * The input param should correspond to the number of error correction codewords.
 *
 * @param  {Number} degree
 */
ReedSolomonEncoder.prototype.initialize = function initialize (degree) {
  // create an irreducible generator polynomial
  this.degree = degree
  this.genPoly = Polynomial.generateECPolynomial(this.degree)
}

/**
 * Encodes a chunk of data
 *
 * @param  {Buffer} data Buffer containing input data
 * @return {Buffer}      Buffer containing encoded data
 */
ReedSolomonEncoder.prototype.encode = function encode (data) {
  if (!this.genPoly) {
    throw new Error('Encoder not initialized')
  }

  // Calculate EC for this data block
  // extends data size to data+genPoly size
  var pad = new Buffer(this.degree)
  pad.fill(0)
  var paddedData = Buffer.concat([data, pad], data.length + this.degree)

  // The error correction codewords are the remainder after dividing the data codewords
  // by a generator polynomial
  var remainder = Polynomial.mod(paddedData, this.genPoly)

  // return EC data blocks (last n byte, where n is the degree of genPoly)
  // If coefficients number in remainder are less than genPoly degree,
  // pad with 0s to the left to reach the needed number of coefficients
  var start = this.degree - remainder.length
  if (start > 0) {
    var buff = new Buffer(this.degree)
    buff.fill(0)
    remainder.copy(buff, start)

    return buff
  }

  return remainder
}

module.exports = ReedSolomonEncoder

},{"../utils/buffer":32,"./polynomial":22}],25:[function(require,module,exports){
var numeric = '[0-9]+'
var alphanumeric = '[A-Z $%*+\\-./:]+'
var kanji = '(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|' +
  '[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|' +
  '[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|' +
  '[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+'
kanji = kanji.replace(/u/g, '\\u')

var byte = '(?:(?![A-Z0-9 $%*+\\-./:]|' + kanji + ').)+'

exports.KANJI = new RegExp(kanji, 'g')
exports.BYTE_KANJI = new RegExp('[^A-Z0-9 $%*+\\-./:]+', 'g')
exports.BYTE = new RegExp(byte, 'g')
exports.NUMERIC = new RegExp(numeric, 'g')
exports.ALPHANUMERIC = new RegExp(alphanumeric, 'g')

var TEST_KANJI = new RegExp('^' + kanji + '$')
var TEST_NUMERIC = new RegExp('^' + numeric + '$')
var TEST_ALPHANUMERIC = new RegExp('^[A-Z0-9 $%*+\\-./:]+$')

exports.testKanji = function testKanji (str) {
  return TEST_KANJI.test(str)
}

exports.testNumeric = function testNumeric (str) {
  return TEST_NUMERIC.test(str)
}

exports.testAlphanumeric = function testAlphanumeric (str) {
  return TEST_ALPHANUMERIC.test(str)
}

},{}],26:[function(require,module,exports){
var Mode = require('./mode')
var NumericData = require('./numeric-data')
var AlphanumericData = require('./alphanumeric-data')
var ByteData = require('./byte-data')
var KanjiData = require('./kanji-data')
var Regex = require('./regex')
var Utils = require('./utils')
var dijkstra = require('dijkstrajs')

/**
 * Returns UTF8 byte length
 *
 * @param  {String} str Input string
 * @return {Number}     Number of byte
 */
function getStringByteLength (str) {
  return unescape(encodeURIComponent(str)).length
}

/**
 * Get a list of segments of the specified mode
 * from a string
 *
 * @param  {Mode}   mode Segment mode
 * @param  {String} str  String to process
 * @return {Array}       Array of object with segments data
 */
function getSegments (regex, mode, str) {
  var segments = []
  var result

  while ((result = regex.exec(str)) !== null) {
    segments.push({
      data: result[0],
      index: result.index,
      mode: mode,
      length: result[0].length
    })
  }

  return segments
}

/**
 * Extracts a series of segments with the appropriate
 * modes from a string
 *
 * @param  {String} dataStr Input string
 * @return {Array}          Array of object with segments data
 */
function getSegmentsFromString (dataStr) {
  var numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr)
  var alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr)
  var byteSegs
  var kanjiSegs

  if (Utils.isKanjiModeEnabled()) {
    byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr)
    kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr)
  } else {
    byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr)
    kanjiSegs = []
  }

  var segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs)

  return segs
    .sort(function (s1, s2) {
      return s1.index - s2.index
    })
    .map(function (obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length
      }
    })
}

/**
 * Returns how many bits are needed to encode a string of
 * specified length with the specified mode
 *
 * @param  {Number} length String length
 * @param  {Mode} mode     Segment mode
 * @return {Number}        Bit length
 */
function getSegmentBitsLength (length, mode) {
  switch (mode) {
    case Mode.NUMERIC:
      return NumericData.getBitsLength(length)
    case Mode.ALPHANUMERIC:
      return AlphanumericData.getBitsLength(length)
    case Mode.KANJI:
      return KanjiData.getBitsLength(length)
    case Mode.BYTE:
      return ByteData.getBitsLength(length)
  }
}

/**
 * Merges adjacent segments which have the same mode
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function mergeSegments (segs) {
  return segs.reduce(function (acc, curr) {
    var prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null
    if (prevSeg && prevSeg.mode === curr.mode) {
      acc[acc.length - 1].data += curr.data
      return acc
    }

    acc.push(curr)
    return acc
  }, [])
}

/**
 * Generates a list of all possible nodes combination which
 * will be used to build a segments graph.
 *
 * Nodes are divided by groups. Each group will contain a list of all the modes
 * in which is possible to encode the given text.
 *
 * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
 * The group for '12345' will contain then 3 objects, one for each
 * possible encoding mode.
 *
 * Each node represents a possible segment.
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function buildNodes (segs) {
  var nodes = []
  for (var i = 0; i < segs.length; i++) {
    var seg = segs[i]

    switch (seg.mode) {
      case Mode.NUMERIC:
        nodes.push([seg,
          { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
          { data: seg.data, mode: Mode.BYTE, length: seg.length }
        ])
        break
      case Mode.ALPHANUMERIC:
        nodes.push([seg,
          { data: seg.data, mode: Mode.BYTE, length: seg.length }
        ])
        break
      case Mode.KANJI:
        nodes.push([seg,
          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
        ])
        break
      case Mode.BYTE:
        nodes.push([
          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
        ])
    }
  }

  return nodes
}

/**
 * Builds a graph from a list of nodes.
 * All segments in each node group will be connected with all the segments of
 * the next group and so on.
 *
 * At each connection will be assigned a weight depending on the
 * segment's byte length.
 *
 * @param  {Array} nodes    Array of object with segments data
 * @param  {Number} version QR Code version
 * @return {Object}         Graph of all possible segments
 */
function buildGraph (nodes, version) {
  var table = {}
  var graph = {'start': {}}
  var prevNodeIds = ['start']

  for (var i = 0; i < nodes.length; i++) {
    var nodeGroup = nodes[i]
    var currentNodeIds = []

    for (var j = 0; j < nodeGroup.length; j++) {
      var node = nodeGroup[j]
      var key = '' + i + j

      currentNodeIds.push(key)
      table[key] = { node: node, lastCount: 0 }
      graph[key] = {}

      for (var n = 0; n < prevNodeIds.length; n++) {
        var prevNodeId = prevNodeIds[n]

        if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
          graph[prevNodeId][key] =
            getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
            getSegmentBitsLength(table[prevNodeId].lastCount, node.mode)

          table[prevNodeId].lastCount += node.length
        } else {
          if (table[prevNodeId]) table[prevNodeId].lastCount = node.length

          graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) +
            4 + Mode.getCharCountIndicator(node.mode, version) // switch cost
        }
      }
    }

    prevNodeIds = currentNodeIds
  }

  for (n = 0; n < prevNodeIds.length; n++) {
    graph[prevNodeIds[n]]['end'] = 0
  }

  return { map: graph, table: table }
}

/**
 * Builds a segment from a specified data and mode.
 * If a mode is not specified, the more suitable will be used.
 *
 * @param  {String} data             Input data
 * @param  {Mode | String} modesHint Data mode
 * @return {Segment}                 Segment
 */
function buildSingleSegment (data, modesHint) {
  var mode
  var bestMode = Mode.getBestModeForData(data)

  mode = Mode.from(modesHint, bestMode)

  // Make sure data can be encoded
  if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
    throw new Error('"' + data + '"' +
      ' cannot be encoded with mode ' + Mode.toString(mode) +
      '.\n Suggested mode is: ' + Mode.toString(bestMode))
  }

  // Use Mode.BYTE if Kanji support is disabled
  if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
    mode = Mode.BYTE
  }

  switch (mode) {
    case Mode.NUMERIC:
      return new NumericData(data)

    case Mode.ALPHANUMERIC:
      return new AlphanumericData(data)

    case Mode.KANJI:
      return new KanjiData(data)

    case Mode.BYTE:
      return new ByteData(data)
  }
}

/**
 * Builds a list of segments from an array.
 * Array can contain Strings or Objects with segment's info.
 *
 * For each item which is a string, will be generated a segment with the given
 * string and the more appropriate encoding mode.
 *
 * For each item which is an object, will be generated a segment with the given
 * data and mode.
 * Objects must contain at least the property "data".
 * If property "mode" is not present, the more suitable mode will be used.
 *
 * @param  {Array} array Array of objects with segments data
 * @return {Array}       Array of Segments
 */
exports.fromArray = function fromArray (array) {
  return array.reduce(function (acc, seg) {
    if (typeof seg === 'string') {
      acc.push(buildSingleSegment(seg, null))
    } else if (seg.data) {
      acc.push(buildSingleSegment(seg.data, seg.mode))
    }

    return acc
  }, [])
}

/**
 * Builds an optimized sequence of segments from a string,
 * which will produce the shortest possible bitstream.
 *
 * @param  {String} data    Input string
 * @param  {Number} version QR Code version
 * @return {Array}          Array of segments
 */
exports.fromString = function fromString (data, version) {
  var segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled())

  var nodes = buildNodes(segs)
  var graph = buildGraph(nodes, version)
  var path = dijkstra.find_path(graph.map, 'start', 'end')

  var optimizedSegs = []
  for (var i = 1; i < path.length - 1; i++) {
    optimizedSegs.push(graph.table[path[i]].node)
  }

  return exports.fromArray(mergeSegments(optimizedSegs))
}

/**
 * Splits a string in various segments with the modes which
 * best represent their content.
 * The produced segments are far from being optimized.
 * The output of this function is only used to estimate a QR Code version
 * which may contain the data.
 *
 * @param  {string} data Input string
 * @return {Array}       Array of segments
 */
exports.rawSplit = function rawSplit (data) {
  return exports.fromArray(
    getSegmentsFromString(data, Utils.isKanjiModeEnabled())
  )
}

},{"./alphanumeric-data":9,"./byte-data":12,"./kanji-data":18,"./mode":20,"./numeric-data":21,"./regex":25,"./utils":27,"dijkstrajs":2}],27:[function(require,module,exports){
var toSJISFunction
var CODEWORDS_COUNT = [
  0, // Not used
  26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
  404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
  1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
  2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
]

/**
 * Returns the QR Code size for the specified version
 *
 * @param  {Number} version QR Code version
 * @return {Number}         size of QR code
 */
exports.getSymbolSize = function getSymbolSize (version) {
  if (!version) throw new Error('"version" cannot be null or undefined')
  if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40')
  return version * 4 + 17
}

/**
 * Returns the total number of codewords used to store data and EC information.
 *
 * @param  {Number} version QR Code version
 * @return {Number}         Data length in bits
 */
exports.getSymbolTotalCodewords = function getSymbolTotalCodewords (version) {
  return CODEWORDS_COUNT[version]
}

/**
 * Encode data with Bose-Chaudhuri-Hocquenghem
 *
 * @param  {Number} data Value to encode
 * @return {Number}      Encoded value
 */
exports.getBCHDigit = function (data) {
  var digit = 0

  while (data !== 0) {
    digit++
    data >>>= 1
  }

  return digit
}

exports.setToSJISFunction = function setToSJISFunction (f) {
  if (typeof f !== 'function') {
    throw new Error('"toSJISFunc" is not a valid function.')
  }

  toSJISFunction = f
}

exports.isKanjiModeEnabled = function () {
  return typeof toSJISFunction !== 'undefined'
}

exports.toSJIS = function toSJIS (kanji) {
  return toSJISFunction(kanji)
}

},{}],28:[function(require,module,exports){
var Utils = require('./utils')
var ECCode = require('./error-correction-code')
var ECLevel = require('./error-correction-level')
var Mode = require('./mode')
var isArray = require('isarray')

// Generator polynomial used to encode version information
var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0)
var G18_BCH = Utils.getBCHDigit(G18)

function getBestVersionForDataLength (mode, length, errorCorrectionLevel) {
  for (var currentVersion = 1; currentVersion <= 40; currentVersion++) {
    if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
      return currentVersion
    }
  }

  return undefined
}

function getReservedBitsCount (mode, version) {
  // Character count indicator + mode indicator bits
  return Mode.getCharCountIndicator(mode, version) + 4
}

function getTotalBitsFromDataArray (segments, version) {
  var totalBits = 0

  segments.forEach(function (data) {
    var reservedBits = getReservedBitsCount(data.mode, version)
    totalBits += reservedBits + data.getBitsLength()
  })

  return totalBits
}

function getBestVersionForMixedData (segments, errorCorrectionLevel) {
  for (var currentVersion = 1; currentVersion <= 40; currentVersion++) {
    var length = getTotalBitsFromDataArray(segments, currentVersion)
    if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
      return currentVersion
    }
  }

  return undefined
}

/**
 * Check if QR Code version is valid
 *
 * @param  {Number}  version QR Code version
 * @return {Boolean}         true if valid version, false otherwise
 */
exports.isValid = function isValid (version) {
  return !isNaN(version) && version >= 1 && version <= 40
}

/**
 * Returns version number from a value.
 * If value is not a valid version, returns defaultValue
 *
 * @param  {Number|String} value        QR Code version
 * @param  {Number}        defaultValue Fallback value
 * @return {Number}                     QR Code version number
 */
exports.from = function from (value, defaultValue) {
  if (exports.isValid(value)) {
    return parseInt(value, 10)
  }

  return defaultValue
}

/**
 * Returns how much data can be stored with the specified QR code version
 * and error correction level
 *
 * @param  {Number} version              QR Code version (1-40)
 * @param  {Number} errorCorrectionLevel Error correction level
 * @param  {Mode}   mode                 Data mode
 * @return {Number}                      Quantity of storable data
 */
exports.getCapacity = function getCapacity (version, errorCorrectionLevel, mode) {
  if (!exports.isValid(version)) {
    throw new Error('Invalid QR Code version')
  }

  // Use Byte mode as default
  if (typeof mode === 'undefined') mode = Mode.BYTE

  // Total codewords for this QR code version (Data + Error correction)
  var totalCodewords = Utils.getSymbolTotalCodewords(version)

  // Total number of error correction codewords
  var ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

  // Total number of data codewords
  var dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8

  if (mode === Mode.MIXED) return dataTotalCodewordsBits

  var usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version)

  // Return max number of storable codewords
  switch (mode) {
    case Mode.NUMERIC:
      return Math.floor((usableBits / 10) * 3)

    case Mode.ALPHANUMERIC:
      return Math.floor((usableBits / 11) * 2)

    case Mode.KANJI:
      return Math.floor(usableBits / 13)

    case Mode.BYTE:
    default:
      return Math.floor(usableBits / 8)
  }
}

/**
 * Returns the minimum version needed to contain the amount of data
 *
 * @param  {Segment} data                    Segment of data
 * @param  {Number} [errorCorrectionLevel=H] Error correction level
 * @param  {Mode} mode                       Data mode
 * @return {Number}                          QR Code version
 */
exports.getBestVersionForData = function getBestVersionForData (data, errorCorrectionLevel) {
  var seg

  var ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M)

  if (isArray(data)) {
    if (data.length > 1) {
      return getBestVersionForMixedData(data, ecl)
    }

    if (data.length === 0) {
      return 1
    }

    seg = data[0]
  } else {
    seg = data
  }

  return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl)
}

/**
 * Returns version information with relative error correction bits
 *
 * The version information is included in QR Code symbols of version 7 or larger.
 * It consists of an 18-bit sequence containing 6 data bits,
 * with 12 error correction bits calculated using the (18, 6) Golay code.
 *
 * @param  {Number} version QR Code version
 * @return {Number}         Encoded version info bits
 */
exports.getEncodedBits = function getEncodedBits (version) {
  if (!exports.isValid(version) || version < 7) {
    throw new Error('Invalid QR Code version')
  }

  var d = version << 12

  while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
    d ^= (G18 << (Utils.getBCHDigit(d) - G18_BCH))
  }

  return (version << 12) | d
}

},{"./error-correction-code":13,"./error-correction-level":14,"./mode":20,"./utils":27,"isarray":33}],29:[function(require,module,exports){
var Utils = require('./utils')

function clearCanvas (ctx, canvas, size) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (!canvas.style) canvas.style = {}
  canvas.height = size
  canvas.width = size
  canvas.style.height = size + 'px'
  canvas.style.width = size + 'px'
}

function getCanvasElement () {
  try {
    return document.createElement('canvas')
  } catch (e) {
    throw new Error('You need to specify a canvas element')
  }
}

exports.render = function render (qrData, canvas, options) {
  var opts = options
  var canvasEl = canvas

  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    opts = canvas
    canvas = undefined
  }

  if (!canvas) {
    canvasEl = getCanvasElement()
  }

  opts = Utils.getOptions(opts)
  var size = Utils.getImageWidth(qrData.modules.size, opts)

  var ctx = canvasEl.getContext('2d')
  var image = ctx.createImageData(size, size)
  Utils.qrToImageData(image.data, qrData, opts)

  clearCanvas(ctx, canvasEl, size)
  ctx.putImageData(image, 0, 0)

  return canvasEl
}

exports.renderToDataURL = function renderToDataURL (qrData, canvas, options) {
  var opts = options

  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    opts = canvas
    canvas = undefined
  }

  if (!opts) opts = {}

  var canvasEl = exports.render(qrData, canvas, opts)

  var type = opts.type || 'image/png'
  var rendererOpts = opts.rendererOpts || {}

  return canvasEl.toDataURL(type, rendererOpts.quality)
}

},{"./utils":31}],30:[function(require,module,exports){
var Utils = require('./utils')

function getColorAttrib (color, attrib) {
  var alpha = color.a / 255
  var str = attrib + '="' + color.hex + '"'

  return alpha < 1
    ? str + ' ' + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"'
    : str
}

function svgCmd (cmd, x, y) {
  var str = cmd + x
  if (typeof y !== 'undefined') str += ' ' + y

  return str
}

function qrToPath (data, size, margin) {
  var path = ''
  var moveBy = 0
  var newRow = false
  var lineLength = 0

  for (var i = 0; i < data.length; i++) {
    var col = Math.floor(i % size)
    var row = Math.floor(i / size)

    if (!col && !newRow) newRow = true

    if (data[i]) {
      lineLength++

      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow
          ? svgCmd('M', col + margin, 0.5 + row + margin)
          : svgCmd('m', moveBy, 0)

        moveBy = 0
        newRow = false
      }

      if (!(col + 1 < size && data[i + 1])) {
        path += svgCmd('h', lineLength)
        lineLength = 0
      }
    } else {
      moveBy++
    }
  }

  return path
}

exports.render = function render (qrData, options, cb) {
  var opts = Utils.getOptions(options)
  var size = qrData.modules.size
  var data = qrData.modules.data
  var qrcodesize = size + opts.margin * 2

  var bg = !opts.color.light.a
    ? ''
    : '<path ' + getColorAttrib(opts.color.light, 'fill') +
      ' d="M0 0h' + qrcodesize + 'v' + qrcodesize + 'H0z"/>'

  var path =
    '<path ' + getColorAttrib(opts.color.dark, 'stroke') +
    ' d="' + qrToPath(data, size, opts.margin) + '"/>'

  var viewBox = 'viewBox="' + '0 0 ' + qrcodesize + ' ' + qrcodesize + '"'

  var width = !opts.width ? '' : 'width="' + opts.width + '" height="' + opts.width + '" '

  var svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + '>' + bg + path + '</svg>'

  if (typeof cb === 'function') {
    cb(null, svgTag)
  }

  return svgTag
}

},{"./utils":31}],31:[function(require,module,exports){
function hex2rgba (hex) {
  if (typeof hex !== 'string') {
    throw new Error('Color should be defined as hex string')
  }

  var hexCode = hex.slice().replace('#', '').split('')
  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
    throw new Error('Invalid hex color: ' + hex)
  }

  // Convert from short to long form (fff -> ffffff)
  if (hexCode.length === 3 || hexCode.length === 4) {
    hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
      return [c, c]
    }))
  }

  // Add default alpha value
  if (hexCode.length === 6) hexCode.push('F', 'F')

  var hexValue = parseInt(hexCode.join(''), 16)

  return {
    r: (hexValue >> 24) & 255,
    g: (hexValue >> 16) & 255,
    b: (hexValue >> 8) & 255,
    a: hexValue & 255,
    hex: '#' + hexCode.slice(0, 6).join('')
  }
}

exports.getOptions = function getOptions (options) {
  if (!options) options = {}
  if (!options.color) options.color = {}

  var margin = typeof options.margin === 'undefined' ||
    options.margin === null ||
    options.margin < 0 ? 4 : options.margin

  var width = options.width && options.width >= 21 ? options.width : undefined
  var scale = options.scale || 4

  return {
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || '#000000ff'),
      light: hex2rgba(options.color.light || '#ffffffff')
    },
    type: options.type,
    rendererOpts: options.rendererOpts || {}
  }
}

exports.getScale = function getScale (qrSize, opts) {
  return opts.width && opts.width >= qrSize + opts.margin * 2
    ? opts.width / (qrSize + opts.margin * 2)
    : opts.scale
}

exports.getImageWidth = function getImageWidth (qrSize, opts) {
  var scale = exports.getScale(qrSize, opts)
  return Math.floor((qrSize + opts.margin * 2) * scale)
}

exports.qrToImageData = function qrToImageData (imgData, qr, opts) {
  var size = qr.modules.size
  var data = qr.modules.data
  var scale = exports.getScale(size, opts)
  var symbolSize = Math.floor((size + opts.margin * 2) * scale)
  var scaledMargin = opts.margin * scale
  var palette = [opts.color.light, opts.color.dark]

  for (var i = 0; i < symbolSize; i++) {
    for (var j = 0; j < symbolSize; j++) {
      var posDst = (i * symbolSize + j) * 4
      var pxColor = opts.color.light

      if (i >= scaledMargin && j >= scaledMargin &&
        i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
        var iSrc = Math.floor((i - scaledMargin) / scale)
        var jSrc = Math.floor((j - scaledMargin) / scale)
        pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0]
      }

      imgData[posDst++] = pxColor.r
      imgData[posDst++] = pxColor.g
      imgData[posDst++] = pxColor.b
      imgData[posDst] = pxColor.a
    }
  }
}

},{}],32:[function(require,module,exports){
/**
 * Implementation of a subset of node.js Buffer methods for the browser.
 * Based on https://github.com/feross/buffer
 */

/* eslint-disable no-proto */

'use strict'

var isArray = require('isarray')

function typedArraySupport () {
  // Can typed array instances be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

var K_MAX_LENGTH = Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff

function Buffer (arg, offset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, offset, length)
  }

  if (typeof arg === 'number') {
    return allocUnsafe(this, arg)
  }

  return from(this, arg, offset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array

  // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    })
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

function createBuffer (that, length) {
  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    buf = new Uint8Array(length)
    buf.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    buf = that
    if (buf === null) {
      buf = new Buffer(length)
    }
    buf.length = length
  }

  return buf
}

function allocUnsafe (that, size) {
  var buf = createBuffer(that, size < 0 ? 0 : checked(size) | 0)

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      buf[i] = 0
    }
  }

  return buf
}

function fromString (that, string) {
  var length = byteLength(string) | 0
  var buf = createBuffer(that, length)

  var actual = buf.write(string)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (that, array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    buf.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    buf = fromArrayLike(that, buf)
  }

  return buf
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(that, len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function byteLength (string) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  return utf8ToBytes(string).length
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function from (that, value, offset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, offset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, offset)
  }

  return fromObject(that, value)
}

Buffer.prototype.write = function write (string, offset, length) {
  // Buffer#write(string)
  if (offset === undefined) {
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
    } else {
      length = undefined
    }
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  return utf8Write(this, string, offset, length)
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    // Return an augmented `Uint8Array` instance
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

Buffer.prototype.fill = function fill (val, start, end) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return createBuffer(null, 0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = allocUnsafe(null, length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

Buffer.byteLength = byteLength

Buffer.prototype._isBuffer = true
Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

module.exports = Buffer

},{"isarray":33}],33:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],34:[function(require,module,exports){
(function (global){
'use strict'
module.exports = (typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global) ||
  this

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],35:[function(require,module,exports){
'use strict';

/* siloz.io
 */

var durruti = require('durruti');
var Main = require('./components/main.js');

durruti.render(Main, document.querySelector('.app'));

},{"./components/main.js":43,"durruti":3}],36:[function(require,module,exports){
'use strict';

/* editor bar
 */

function EditorBar(actions) {
  var plugins = actions.getPlugins();
  var options = {
    html: [{
      title: 'HTML'
    }, {
      title: 'Markdown',
      plugin: 'markdown'
    }],
    css: [{
      title: 'CSS'
    }, {
      title: 'Less',
      plugin: 'less'
    }, {
      title: 'Stylus',
      plugin: 'stylus'
    }],
    js: [{
      title: 'JavaScript'
    }, {
      title: 'ES2015/Babel',
      plugin: 'babel'
    }, {
      title: 'CoffeeScript',
      plugin: 'coffeescript'
    }]
  };

  var selected = {
    html: '',
    css: '',
    js: ''
  };

  function getPlugin(list, name) {
    var foundPlugin = null;
    list.some(function (plugin) {
      if (plugin.plugin === name) {
        foundPlugin = plugin;
        return true;
      }
    });

    return foundPlugin;
  }

  function changeProcessor(type) {
    return function () {
      // remove last selected plugin
      actions.removePlugin(selected[type]);

      // update reference
      selected[type] = this.value;

      var plugin = getPlugin(options[type], selected[type]);
      if (plugin) {
        actions.addPlugin(plugin.plugin);
      }
    };
  }

  function createSelect(type, options, selected) {
    return '\n      <select class="select editor-bar-select-' + type + '">\n        ' + options.map(function (opt) {
      return '\n            <option value="' + (opt.plugin || '') + '" ' + (opt.plugin === selected ? 'selected' : '') + '>\n              ' + opt.title + '\n            </option>\n          ';
    }).join('') + '\n      </select>\n    ';
  }

  function setInitialValues() {
    // set selected values based on store
    Object.keys(options).forEach(function (type) {
      options[type].forEach(function (option) {
        if (plugins.indexOf(option.plugin) !== -1) {
          selected[type] = option.plugin;
        }
      });
    });
  }

  function closePane(type) {
    return function () {
      var panes = {};
      panes[type] = {
        hidden: true
      };

      actions.updatePanes(panes);
    };
  }

  this.mount = function ($container) {
    var _arr = ['html', 'css', 'js'];

    for (var _i = 0; _i < _arr.length; _i++) {
      var type = _arr[_i];
      $container.querySelector('.editor-bar-select-' + type).addEventListener('change', changeProcessor(type));

      $container.querySelector('.editor-bar-pane-close-' + type).addEventListener('click', closePane(type));
    }
  };

  this.render = function () {
    setInitialValues();

    return '\n      <div class="editor-bar">\n        <div class="editor-bar-pane editor-bar-pane-html">\n          ' + createSelect('html', options.html, selected.html) + '\n\n          <button type="button" class="editor-bar-pane-close editor-bar-pane-close-html btn" title="Hide HTML">\n            <i class="icon icon-close"></i>\n          </button>\n        </div>\n        <div class="editor-bar-pane editor-bar-pane-css">\n          ' + createSelect('css', options.css, selected.css) + '\n\n          <button type="button" class="editor-bar-pane-close editor-bar-pane-close-css btn" title="Hide CSS">\n            <i class="icon icon-close"></i>\n          </button>\n        </div>\n        <div class="editor-bar-pane editor-bar-pane-js">\n          ' + createSelect('js', options.js, selected.js) + '\n\n          <button type="button" class="editor-bar-pane-close editor-bar-pane-close-js btn" title="Hide JavaScript">\n            <i class="icon icon-close"></i>\n          </button>\n        </div>\n        <div class="editor-bar-pane"></div>\n      </div>\n    ';
  };
}

module.exports = EditorBar;

},{}],37:[function(require,module,exports){
'use strict';

/* editor widget
 */

var util = require('../../util');
var Jotted = require('jotted');
var globalActions;

// jotted plugin
Jotted.plugin('siloz', function (jotted, options) {
  jotted.on('change', function (params, callback) {
    globalActions.updateFile({
      type: params.type,
      content: params.content
    });

    callback(null, params);
  }, 2);
});

var pluginLibs = {
  markdown: ['https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.6/marked.min.js'],
  less: ['https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.1/less.min.js'],
  stylus: ['/libs/stylus.min.js'],
  coffeescript: ['https://cdn.rawgit.com/jashkenas/coffeescript/1.11.1/extras/coffee-script.js'],
  es2015: ['https://cdnjs.cloudflare.com/ajax/libs/babel-core/6.1.19/browser.min.js']
};

function EditorWidget(actions) {
  globalActions = actions;

  this.mount = function ($container) {
    var plugins = actions.getPlugins();
    var libs = [];

    // load libs
    Object.keys(pluginLibs).forEach(function (name) {
      if (plugins.indexOf(name) !== -1) {
        Array.prototype.push.apply(libs, pluginLibs[name].map(function (url) {
          return function (done) {
            util.loadScript(url, done);
          };
        }));
      }
    });

    Array.prototype.push.apply(plugins, ['siloz', {
      name: 'codemirror',
      options: {
        theme: actions.getTheme(),
        lineWrapping: true
      }
    }]);

    util.async(libs, function () {
      /* eslint-disable no-new */
      new Jotted($container, {
        files: actions.getFiles(),
        plugins: plugins
      });
    });
  };

  this.render = function () {
    return '<div class="editor-widget jotted-theme-siloz"></div>';
  };
}

module.exports = EditorWidget;

},{"../../util":49,"jotted":5}],38:[function(require,module,exports){
'use strict';

/* editor
 */

var durruti = require('durruti');
var EditorBar = require('./editor-bar');
var EditorWidget = require('./editor-widget');

function Editor(actions) {
  var panes = actions.getPanes();

  this.render = function () {
    return '\n      <div class="editor\n        ' + (panes.html.hidden ? 'editor-is-hidden-html' : '') + '\n        ' + (panes.css.hidden ? 'editor-is-hidden-css' : '') + '\n        ' + (panes.js.hidden ? 'editor-is-hidden-js' : '') + '\n      ">\n        ' + durruti.render(new EditorBar(actions)) + '\n        ' + durruti.render(new EditorWidget(actions)) + '\n      </div>\n    ';
  };
}

module.exports = Editor;

},{"./editor-bar":36,"./editor-widget":37,"durruti":3}],39:[function(require,module,exports){
'use strict';

/* about
 */

var util = require('../../util');
var Popup = require('../popup');

function Help(actions, actionsInternal) {
  var self = util.inherits(this, Popup);
  Popup.call(self, 'about', actionsInternal);

  self.mount = self.super.mount.bind(self);
  self.unmount = self.super.unmount.bind(self);

  self.render = function () {
    return self.super.render.call(self, 'About', '\n      <p>\n        <a href="/">siloz.io</a> is a private code playground in the browser.\n      </p>\n\n      <p>\n        Your source code is saved in the URL and never reaches our servers.\n      </p>\n\n      <p>\n        Use HTML, CSS and JavaScript, along with processors like CoffeeScript, Babel/ES2015, Less, Stylus or Markdown.\n      </p>\n\n      <h2>\n        Short URLs\n      </h2>\n\n      <p>\n        siloz.io can generate shorter urls, at a privacy cost.\n      </p>\n\n      <p>\n        When a short url is generated, the url  - that includes the source code - is saved on the server, along with a unique token.\n      </p>\n\n      <p>\n        <a href="https://github.com/ghinda/siloz.io" target="_blank">\n          Source code available on GitHub.\n        </a>\n      </p>\n    ');
  };

  return self;
}

module.exports = Help;

},{"../../util":49,"../popup":44}],40:[function(require,module,exports){
'use strict';

/* header
 */

var durruti = require('durruti');
var Settings = require('./settings');
var Share = require('./share');
var About = require('./about');

var InternalStore = require('../../state/store-internal');
var storeInternal = new InternalStore();

function Header(actions) {
  var $container;
  var data = storeInternal.get();
  var actionsInternal = storeInternal.actions;
  var loadingCollaborate = actionsInternal.getLoading('collaborate');

  var change = function change() {
    var newData = storeInternal.get();

    // if something changed.
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      durruti.render(new Header(actions), $container);
    }
  };

  function doneLoadingCollaborate() {
    actionsInternal.updateLoading('collaborate', false);
  }

  this.mount = function ($node) {
    $container = $node;

    $container.querySelector('.collaborate').addEventListener('click', function () {
      // loading
      actionsInternal.updateLoading('collaborate', true);

      window.TogetherJS();

      window.TogetherJS.on('ready', doneLoadingCollaborate);
      window.TogetherJS.on('close', doneLoadingCollaborate);
    });

    storeInternal.on('change', change);
  };

  this.unmount = function () {
    if (window.TogetherJS) {
      window.TogetherJS.off('ready', doneLoadingCollaborate);
      window.TogetherJS.off('close', doneLoadingCollaborate);
    }

    storeInternal.off('change', change);
  };

  this.render = function () {
    return '\n      <header class="header">\n        <a href="/" class="header-logo">\n          <img src="/images/logo.png" height="16" alt="siloz.io">\n        </a>\n\n        ' + durruti.render(new About(actions, storeInternal.actions)) + '\n        ' + durruti.render(new Settings(actions, storeInternal.actions)) + '\n\n        ' + durruti.render(new Share(actions, storeInternal.actions)) + '\n\n        <button type="button" class="btn collaborate ' + (loadingCollaborate ? 'is-loading' : '') + '">\n          Collaborate\n        </button>\n      </header>\n    ';
  };
}

module.exports = Header;

},{"../../state/store-internal":47,"./about":39,"./settings":41,"./share":42,"durruti":3}],41:[function(require,module,exports){
'use strict';

/* settings
 */

var util = require('../../util');
var Popup = require('../popup');

function Settings(actions, actionsInternal) {
  var self = util.inherits(this, Popup);
  Popup.call(self, 'settings', actionsInternal);

  var panes = actions.getPanes();
  var theme = actions.getTheme();

  function togglePane(type) {
    return function (e) {
      var panes = {};
      panes[type] = { hidden: !e.target.checked };
      return actions.updatePanes(panes);
    };
  }

  function setTheme() {
    actions.updateTheme(this.value);
  }

  self.mount = function ($container) {
    self.super.mount.call(self, $container);

    var $showHtml = $container.querySelector('.settings-show-html');
    var $showCss = $container.querySelector('.settings-show-css');
    var $showJs = $container.querySelector('.settings-show-js');

    $showHtml.addEventListener('change', togglePane('html'));
    $showCss.addEventListener('change', togglePane('css'));
    $showJs.addEventListener('change', togglePane('js'));

    $container.querySelector('.settings-theme').addEventListener('change', setTheme);
  };

  self.unmount = self.super.unmount.bind(self);

  self.render = function () {
    return self.super.render.call(self, 'Settings', '\n      <fieldset>\n        <legend>\n          Tabs\n        </legend>\n\n        <label>\n          <input type="checkbox" class="settings-show-html" ' + (!panes.html.hidden ? 'checked' : '') + '>\n          HTML\n        </label>\n\n        <label>\n          <input type="checkbox" class="settings-show-css" ' + (!panes.css.hidden ? 'checked' : '') + '>\n          CSS\n        </label>\n\n        <label>\n          <input type="checkbox" class="settings-show-js" ' + (!panes.js.hidden ? 'checked' : '') + '>\n          JavaScript\n        </label>\n      </fieldset>\n\n      <fieldset>\n        <legend>\n          Theme\n        </legend>\n\n        <select class="settings-theme select">\n          <option value="solarized light" ' + (theme === 'solarized light' ? 'selected' : '') + '>\n            Solarized Light\n          </option>\n          <option value="solarized dark" ' + (theme === 'solarized dark' ? 'selected' : '') + '>\n            Solarized Dark\n          </option>\n        </select>\n      </fieldset>\n    ');
  };

  return self;
}

module.exports = Settings;

},{"../../util":49,"../popup":44}],42:[function(require,module,exports){
'use strict';

/* share
 */

var qrcode = require('qrcode');

var util = require('../../util');
var Popup = require('../popup');

function Share(actions, actionsInternal) {
  var _this = this;

  var self = util.inherits(this, Popup);
  Popup.call(self, 'share', actionsInternal);

  var longUrl = '';
  var qr = actionsInternal.getQr();

  if (typeof window !== 'undefined') {
    longUrl = window.location.href;
  }

  function copy($input) {
    return function (e) {
      var $btn = util.closest(e.target, '.btn');

      $input.select();

      try {
        document.execCommand('copy');

        $btn.innerHTML = 'Copied';
        setTimeout(function () {
          $btn.innerHTML = 'Copy';
        }, 2000);
      } catch (err) {}
    };
  }

  function generate() {
    qrcode.toDataURL(longUrl, {
      margin: 2,
      color: {
        // transparent background
        light: '#0000'
      }
    }, function (err, url) {
      if (err) {
        return actionsInternal.updateQr({
          url: '',
          error: err.toString()
        });
      }

      actionsInternal.updateQr({
        url: url,
        error: ''
      });
    });
  }

  self.mount = function ($container) {
    self.super.mount.call(self, $container);

    var $longUrl = $container.querySelector('.share-url-input-long');
    var $longUrlCopy = $container.querySelector('.share-url-copy-long');

    $longUrlCopy.addEventListener('click', copy($longUrl));
  };

  self.unmount = function () {
    self.super.unmount.call(self);
  };

  var oldTogglePopup = self.togglePopup;
  self.togglePopup = function () {
    oldTogglePopup();

    if (_this.state === true) {
      generate();
    }
  };

  self.render = function () {
    return self.super.render.call(self, 'Share', '\n      <fieldset class="' + (qr.url ? 'share-is-generated' : '') + '">\n        <legend>\n          QR code\n        </legend>\n\n        <img src="' + qr.url + '" class="qr-preview">\n\n        <p class="share-qr-error">\n          ' + qr.error + '\n        </p>\n      </fieldset>\n      <fieldset>\n        <legend>\n          Persistent URL\n        </legend>\n\n        <div class="share-url">\n          <input type="text" class="share-url-input share-url-input-long" value="' + longUrl + '" readonly>\n          <button type="button" class="btn share-url-copy share-url-copy-long">\n            Copy\n          </button>\n        </div>\n      </fieldset>\n    ');
  };

  return self;
}

module.exports = Share;

},{"../../util":49,"../popup":44,"qrcode":7}],43:[function(require,module,exports){
'use strict';

/* main
 */

var durruti = require('durruti');
var Header = require('./header/header');
var Editor = require('./editor/editor');

var GlobalStore = require('../state/store');
var store = new GlobalStore();

function Main() {
  var $container;
  var data = store.get();
  var theme = store.actions.getTheme();

  var change = function change() {
    var newData = store.get();

    // don't compare files
    delete data.files;
    delete newData.files;

    // if something changed,
    // except the files.
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      durruti.render(Main, $container);
    }
  };

  this.mount = function ($node) {
    $container = $node;

    store.on('change', change);
  };

  this.unmount = function () {
    store.off('change', change);
  };

  this.render = function () {
    return '\n      <div class="main siloz-theme-' + theme.replace(/ /g, '-') + '">\n        ' + durruti.render(new Header(store.actions)) + '\n        ' + durruti.render(new Editor(store.actions)) + '\n      </div>\n    ';
  };
}

module.exports = Main;

},{"../state/store":48,"./editor/editor":38,"./header/header":40,"durruti":3}],44:[function(require,module,exports){
'use strict';

/* popup
 */

var util = require('../util');

function Popup(name, actions) {
  this.name = name;
  this.state = actions.getPopup(name);
  this.actions = actions;
  this.togglePopup = this.prototype.togglePopup.bind(this);
  this.hidePopup = this.prototype.hidePopup.bind(this);
}

Popup.prototype.togglePopup = function () {
  this.state = !this.state;
  this.actions.updatePopup(this.name, this.state);
};

Popup.prototype.hidePopup = function (e) {
  if (util.closest(e.target, '.popup') || e.target === this.$button || !this.state) {
    return;
  }

  this.actions.updatePopup(this.name, false);
};

Popup.prototype.mount = function ($container) {
  this.$container = $container;
  this.$button = $container.querySelector('.popup-button');

  this.$button.addEventListener('click', this.togglePopup);
  document.addEventListener('click', this.hidePopup);
};

Popup.prototype.unmount = function () {
  document.removeEventListener('click', this.hidePopup);
};

Popup.prototype.render = function (title, content) {
  return '\n    <div class="popup-container ' + this.name + ' ' + (this.state ? 'popup-container-is-open' : '') + '">\n      <button type="button" class="' + this.name + '-button popup-button btn">\n        ' + title + '\n      </button>\n\n      <form class="' + this.name + '-popup popup">\n        ' + content + '\n      </form>\n    </div>\n  ';
};

module.exports = Popup;

},{"../util":49}],45:[function(require,module,exports){
"use strict";

/* store actions
 */

function actions(store) {
  function getPopup(name) {
    return store.get().popup[name];
  }

  function updatePopup(name, state) {
    var data = store.get();
    data.popup[name] = state;

    store.set(data);
  }

  function getLoading(name) {
    return store.get().loading[name];
  }

  function updateLoading(name, state) {
    var data = store.get();
    data.loading[name] = state;

    store.set(data);
  }

  function getQr() {
    return store.get().qr;
  }

  function updateQr(url) {
    var data = store.get();
    data.qr = url;

    store.set(data);
  }

  return {
    getPopup: getPopup,
    updatePopup: updatePopup,

    getLoading: getLoading,
    updateLoading: updateLoading,

    getQr: getQr,
    updateQr: updateQr
  };
}

module.exports = actions;

},{}],46:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* store actions
 */

var util = require('../util');

function actions(store) {
  function getFiles() {
    return store.get().files;
  }

  function updateFile(newFile) {
    var data = store.get();

    data.files.some(function (file, index) {
      if (file.type === newFile.type) {
        data.files[index] = util.extend(newFile, data.files[index]);
        return true;
      }
    });

    return store.set(data);
  }

  function getPlugins() {
    return store.get().plugins;
  }

  function addPlugin(newPlugin) {
    var data = store.get();

    data.plugins.push(newPlugin);
    return store.set(data);
  }

  function removePlugin(oldPlugin) {
    var data = store.get();
    var pluginName = '';

    if ((typeof oldPlugin === 'undefined' ? 'undefined' : _typeof(oldPlugin)) === 'object') {
      pluginName = oldPlugin.name;
    } else {
      pluginName = oldPlugin;
    }

    data.plugins.some(function (plugin, index) {
      if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.name === pluginName || typeof plugin === 'string' && plugin === pluginName) {
        data.plugins.splice(index, 1);
        return true;
      }
    });

    return store.set(data);
  }

  function getPanes() {
    return store.get().panes;
  }

  function updatePanes(newPanes) {
    var data = store.get();
    data.panes = util.extend(newPanes, data.panes);

    return store.set(data);
  }

  function getTheme() {
    return store.get().theme;
  }

  function updateTheme(theme) {
    var data = store.get();
    data.theme = theme;

    return store.set(data);
  }

  return {
    getFiles: getFiles,
    updateFile: updateFile,

    getPlugins: getPlugins,
    addPlugin: addPlugin,
    removePlugin: removePlugin,

    getPanes: getPanes,
    updatePanes: updatePanes,

    getTheme: getTheme,
    updateTheme: updateTheme
  };
}

module.exports = actions;

},{"../util":49}],47:[function(require,module,exports){
'use strict';

/* internal store,
 * not stored in url
 */

var Store = require('durruti/store');
var actions = require('./actions-internal');

var defaults = {
  popup: {},
  loading: {},
  qr: {
    url: '',
    error: ''
  }
};

var InternalStore = function InternalStore() {
  Store.call(this);
  this.actions = actions(this);

  this.set(defaults);
};

InternalStore.prototype = Object.create(Store.prototype);

module.exports = InternalStore;

},{"./actions-internal":45,"durruti/store":4}],48:[function(require,module,exports){
'use strict';

/* store
 */

var Store = require('durruti/store');
var LZString = require('lz-string');
var actions = require('./actions');
var util = require('../util');

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
};

function replaceLocationHash() {
  if (typeof window === 'undefined') {
    return function () {};
  }

  if (typeof window.history.replaceState !== 'undefined') {
    return function (hash) {
      window.history.replaceState(null, null, '#' + hash);
    };
  } else {
    return function (hash) {
      window.location.replace(window.location.href.split('#')[0] + '#' + hash);
    };
  }
}

function parseHash() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(LZString.decompressFromEncodedURIComponent(util.hash('s')));
  } catch (err) {}

  return null;
}

var GlobalStore = function GlobalStore() {
  var _this = this;

  Store.call(this);
  this.actions = actions(this);

  var replaceHash = replaceLocationHash();
  var compressedData = '';

  var hashData = parseHash();
  if (hashData) {
    this.set(util.extend(hashData, defaults));
  } else {
    this.set(defaults);
  }

  this.on('change', function () {
    // save in hash
    var data = _this.get();

    compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    replaceHash(util.hash('s', compressedData));
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', function () {
      // force page reload if only hash changed,
      // and compressed data is different.
      // eg. manually changing url hash.
      if (util.hash('s') !== compressedData) {
        window.location.reload();
      }
    });
  }
};

GlobalStore.prototype = Object.create(Store.prototype);

module.exports = GlobalStore;

},{"../util":49,"./actions":46,"durruti/store":4,"lz-string":6}],49:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* util
 */

function closest($elem, selector) {
  // find the closest parent that matches the selector
  var $matches;

  // loop through parents
  while ($elem && $elem !== document) {
    if ($elem.parentNode) {
      // find all siblings that match the selector
      $matches = $elem.parentNode.querySelectorAll(selector);
      // check if our element is matched (poor-man's Element.matches())
      if ([].indexOf.call($matches, $elem) !== -1) {
        return $elem;
      }

      // go up the tree
      $elem = $elem.parentNode;
    } else {
      return null;
    }
  }

  return null;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function extendLevel(obj) {
  var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // copy default keys where undefined
  Object.keys(defaults).forEach(function (key) {
    if (typeof obj[key] === 'undefined') {
      // default
      obj[key] = clone(defaults[key]);
    } else if (_typeof(obj[key]) === 'object') {
      extendLevel(obj[key], defaults[key]);
    }
  });

  return obj;
}

// multi-level object merge
function extend(obj, defaults) {
  if (obj === null) {
    obj = {};
  }

  return extendLevel(clone(obj), defaults);
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    var callNow = immediate && !timeout;

    var later = function later() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

function loadScript(url) {
  var done = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

  var $script = document.createElement('script');
  $script.src = url;
  document.body.appendChild($script);

  $script.onload = done;
}

function async(arr, done) {
  var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (arr.length === i) {
    return done();
  }

  arr[i](function () {
    i++;
    async(arr, done, i);
  });
}

function fetch(path, options, callback) {
  // options not specified
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = extend(options, {
    type: 'GET',
    data: {}
  });

  callback = callback || function () {};

  var request = new window.XMLHttpRequest();
  request.open(options.type, path);
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // success
      var data = JSON.parse(request.responseText || '{}');

      callback(null, data);
    } else {
      // error
      callback(request);
    }
  };

  request.onerror = function () {
    // error
    callback(request);
  };

  request.send(JSON.stringify(options.data));
}

function inherits(baseClass, superClass) {
  baseClass.prototype = Object.create(superClass.prototype);
  baseClass.prototype.constructor = baseClass;

  baseClass.super = Object.getPrototypeOf(baseClass.prototype);

  return baseClass;
}

function hash(key, value) {
  var hashParts = [];
  if (window.location.hash) {
    hashParts = window.location.hash.substr(1).split('&');
  }

  var parsedHash = {};
  var stringHash = '';

  hashParts.forEach(function (part, i) {
    var subParts = part.split('=');
    parsedHash[subParts[0]] = subParts[1] || '';
  });

  if (key) {
    if (value) {
      parsedHash[key] = value;
    } else {
      return parsedHash[key];
    }
  }

  // rebuild to string
  Object.keys(parsedHash).forEach(function (key, i) {
    if (i > 0) {
      stringHash += '&';
    }

    stringHash += key;

    if (parsedHash[key]) {
      stringHash += '=' + parsedHash[key];
    }
  });

  return stringHash;
}

module.exports = {
  clone: clone,
  extend: extend,
  closest: closest,
  debounce: debounce,
  loadScript: loadScript,
  async: async,
  fetch: fetch,
  hash: hash,

  inherits: inherits
};

},{}]},{},[35])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FuLXByb21pc2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGlqa3N0cmFqcy9kaWprc3RyYS5qcyIsIm5vZGVfbW9kdWxlcy9kdXJydXRpL2R1cnJ1dGkuanMiLCJub2RlX21vZHVsZXMvZHVycnV0aS9zdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9qb3R0ZWQvam90dGVkLmpzIiwibm9kZV9tb2R1bGVzL2x6LXN0cmluZy9saWJzL2x6LXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FsaWdubWVudC1wYXR0ZXJuLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9hbHBoYW51bWVyaWMtZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LWJ1ZmZlci5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LW1hdHJpeC5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYnl0ZS1kYXRhLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2ZpbmRlci1wYXR0ZXJuLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9mb3JtYXQtaW5mby5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZ2Fsb2lzLWZpZWxkLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9rYW5qaS1kYXRhLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tYXNrLXBhdHRlcm4uanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL21vZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL251bWVyaWMtZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcG9seW5vbWlhbC5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcXJjb2RlLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9yZWVkLXNvbG9tb24tZW5jb2Rlci5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVnZXguanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3NlZ21lbnRzLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL2NhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3N2Zy10YWcuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3V0aWxzL3R5cGVkYXJyYXktYnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93aW5kb3ctb3ItZ2xvYmFsL2xpYi9pbmRleC5qcyIsInNyYy9hcHAuanMiLCJzcmMvY29tcG9uZW50cy9lZGl0b3IvZWRpdG9yLWJhci5qcyIsInNyYy9jb21wb25lbnRzL2VkaXRvci9lZGl0b3Itd2lkZ2V0LmpzIiwic3JjL2NvbXBvbmVudHMvZWRpdG9yL2VkaXRvci5qcyIsInNyYy9jb21wb25lbnRzL2hlYWRlci9hYm91dC5qcyIsInNyYy9jb21wb25lbnRzL2hlYWRlci9oZWFkZXIuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvc2V0dGluZ3MuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvc2hhcmUuanMiLCJzcmMvY29tcG9uZW50cy9tYWluLmpzIiwic3JjL2NvbXBvbmVudHMvcG9wdXAuanMiLCJzcmMvc3RhdGUvYWN0aW9ucy1pbnRlcm5hbC5qcyIsInNyYy9zdGF0ZS9hY3Rpb25zLmpzIiwic3JjL3N0YXRlL3N0b3JlLWludGVybmFsLmpzIiwic3JjL3N0YXRlL3N0b3JlLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3g2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDSkE7OztBQUdBLElBQUksVUFBVSxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQUksT0FBTyxRQUFRLHNCQUFSLENBQVg7O0FBRUEsUUFBUSxNQUFSLENBQWUsSUFBZixFQUFxQixTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBckI7Ozs7O0FDTkE7OztBQUdBLFNBQVMsU0FBVCxDQUFvQixPQUFwQixFQUE2QjtBQUMzQixNQUFJLFVBQVUsUUFBUSxVQUFSLEVBQWQ7QUFDQSxNQUFJLFVBQVU7QUFDWixVQUFNLENBQUM7QUFDTCxhQUFPO0FBREYsS0FBRCxFQUVIO0FBQ0QsYUFBTyxVQUROO0FBRUQsY0FBUTtBQUZQLEtBRkcsQ0FETTtBQU9aLFNBQUssQ0FBQztBQUNKLGFBQU87QUFESCxLQUFELEVBRUY7QUFDRCxhQUFPLE1BRE47QUFFRCxjQUFRO0FBRlAsS0FGRSxFQUtGO0FBQ0QsYUFBTyxRQUROO0FBRUQsY0FBUTtBQUZQLEtBTEUsQ0FQTztBQWdCWixRQUFJLENBQUM7QUFDSCxhQUFPO0FBREosS0FBRCxFQUVEO0FBQ0QsYUFBTyxjQUROO0FBRUQsY0FBUTtBQUZQLEtBRkMsRUFLRDtBQUNELGFBQU8sY0FETjtBQUVELGNBQVE7QUFGUCxLQUxDO0FBaEJRLEdBQWQ7O0FBMkJBLE1BQUksV0FBVztBQUNiLFVBQU0sRUFETztBQUViLFNBQUssRUFGUTtBQUdiLFFBQUk7QUFIUyxHQUFmOztBQU1BLFdBQVMsU0FBVCxDQUFvQixJQUFwQixFQUEwQixJQUExQixFQUFnQztBQUM5QixRQUFJLGNBQWMsSUFBbEI7QUFDQSxTQUFLLElBQUwsQ0FBVSxVQUFDLE1BQUQsRUFBWTtBQUNwQixVQUFJLE9BQU8sTUFBUCxLQUFrQixJQUF0QixFQUE0QjtBQUMxQixzQkFBYyxNQUFkO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7QUFDRixLQUxEOztBQU9BLFdBQU8sV0FBUDtBQUNEOztBQUVELFdBQVMsZUFBVCxDQUEwQixJQUExQixFQUFnQztBQUM5QixXQUFPLFlBQVk7QUFDakI7QUFDQSxjQUFRLFlBQVIsQ0FBcUIsU0FBUyxJQUFULENBQXJCOztBQUVBO0FBQ0EsZUFBUyxJQUFULElBQWlCLEtBQUssS0FBdEI7O0FBRUEsVUFBSSxTQUFTLFVBQVUsUUFBUSxJQUFSLENBQVYsRUFBeUIsU0FBUyxJQUFULENBQXpCLENBQWI7QUFDQSxVQUFJLE1BQUosRUFBWTtBQUNWLGdCQUFRLFNBQVIsQ0FBa0IsT0FBTyxNQUF6QjtBQUNEO0FBQ0YsS0FYRDtBQVlEOztBQUVELFdBQVMsWUFBVCxDQUF1QixJQUF2QixFQUE2QixPQUE3QixFQUFzQyxRQUF0QyxFQUFnRDtBQUM5QyxnRUFDNEMsSUFENUMsb0JBRU0sUUFBUSxHQUFSLENBQVksVUFBQyxHQUFELEVBQVM7QUFDckIsZ0RBQ21CLElBQUksTUFBSixJQUFjLEVBRGpDLFlBQ3dDLElBQUksTUFBSixLQUFlLFFBQWYsR0FBMEIsVUFBMUIsR0FBdUMsRUFEL0UsMEJBRU0sSUFBSSxLQUZWO0FBS0QsS0FOQyxFQU1DLElBTkQsQ0FNTSxFQU5OLENBRk47QUFXRDs7QUFFRCxXQUFTLGdCQUFULEdBQTZCO0FBQzNCO0FBQ0EsV0FBTyxJQUFQLENBQVksT0FBWixFQUFxQixPQUFyQixDQUE2QixVQUFDLElBQUQsRUFBVTtBQUNyQyxjQUFRLElBQVIsRUFBYyxPQUFkLENBQXNCLFVBQUMsTUFBRCxFQUFZO0FBQ2hDLFlBQUksUUFBUSxPQUFSLENBQWdCLE9BQU8sTUFBdkIsTUFBbUMsQ0FBQyxDQUF4QyxFQUEyQztBQUN6QyxtQkFBUyxJQUFULElBQWlCLE9BQU8sTUFBeEI7QUFDRDtBQUNGLE9BSkQ7QUFLRCxLQU5EO0FBT0Q7O0FBRUQsV0FBUyxTQUFULENBQW9CLElBQXBCLEVBQTBCO0FBQ3hCLFdBQU8sWUFBWTtBQUNqQixVQUFJLFFBQVEsRUFBWjtBQUNBLFlBQU0sSUFBTixJQUFjO0FBQ1osZ0JBQVE7QUFESSxPQUFkOztBQUlBLGNBQVEsV0FBUixDQUFvQixLQUFwQjtBQUNELEtBUEQ7QUFRRDs7QUFFRCxPQUFLLEtBQUwsR0FBYSxVQUFVLFVBQVYsRUFBc0I7QUFBQSxlQUNoQixDQUFFLE1BQUYsRUFBVSxLQUFWLEVBQWlCLElBQWpCLENBRGdCOztBQUNqQyw2Q0FBMEM7QUFBckMsVUFBSSxlQUFKO0FBQ0gsaUJBQVcsYUFBWCx5QkFBK0MsSUFBL0MsRUFBdUQsZ0JBQXZELENBQXdFLFFBQXhFLEVBQWtGLGdCQUFnQixJQUFoQixDQUFsRjs7QUFFQSxpQkFBVyxhQUFYLDZCQUFtRCxJQUFuRCxFQUEyRCxnQkFBM0QsQ0FBNEUsT0FBNUUsRUFBcUYsVUFBVSxJQUFWLENBQXJGO0FBQ0Q7QUFDRixHQU5EOztBQVFBLE9BQUssTUFBTCxHQUFjLFlBQVk7QUFDeEI7O0FBRUEsd0hBR1EsYUFBYSxNQUFiLEVBQXFCLFFBQVEsSUFBN0IsRUFBbUMsU0FBUyxJQUE1QyxDQUhSLG9SQVVRLGFBQWEsS0FBYixFQUFvQixRQUFRLEdBQTVCLEVBQWlDLFNBQVMsR0FBMUMsQ0FWUixpUkFpQlEsYUFBYSxJQUFiLEVBQW1CLFFBQVEsRUFBM0IsRUFBK0IsU0FBUyxFQUF4QyxDQWpCUjtBQTBCRCxHQTdCRDtBQThCRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7O0FDN0lBOzs7QUFHQSxJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVg7QUFDQSxJQUFJLFNBQVMsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFJLGFBQUo7O0FBRUE7QUFDQSxPQUFPLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLFVBQVUsTUFBVixFQUFrQixPQUFsQixFQUEyQjtBQUNoRCxTQUFPLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLFVBQVUsTUFBVixFQUFrQixRQUFsQixFQUE0QjtBQUM5QyxrQkFBYyxVQUFkLENBQXlCO0FBQ3ZCLFlBQU0sT0FBTyxJQURVO0FBRXZCLGVBQVMsT0FBTztBQUZPLEtBQXpCOztBQUtBLGFBQVMsSUFBVCxFQUFlLE1BQWY7QUFDRCxHQVBELEVBT0csQ0FQSDtBQVFELENBVEQ7O0FBV0EsSUFBSSxhQUFhO0FBQ2YsWUFBVSxDQUFDLG1FQUFELENBREs7QUFFZixRQUFNLENBQUMsa0VBQUQsQ0FGUztBQUdmLFVBQVEsQ0FBQyxxQkFBRCxDQUhPO0FBSWYsZ0JBQWMsQ0FBQyw4RUFBRCxDQUpDO0FBS2YsVUFBUSxDQUFDLHlFQUFEO0FBTE8sQ0FBakI7O0FBUUEsU0FBUyxZQUFULENBQXVCLE9BQXZCLEVBQWdDO0FBQzlCLGtCQUFnQixPQUFoQjs7QUFFQSxPQUFLLEtBQUwsR0FBYSxVQUFVLFVBQVYsRUFBc0I7QUFDakMsUUFBSSxVQUFVLFFBQVEsVUFBUixFQUFkO0FBQ0EsUUFBSSxPQUFPLEVBQVg7O0FBRUE7QUFDQSxXQUFPLElBQVAsQ0FBWSxVQUFaLEVBQXdCLE9BQXhCLENBQWdDLFVBQUMsSUFBRCxFQUFVO0FBQ3hDLFVBQUksUUFBUSxPQUFSLENBQWdCLElBQWhCLE1BQTBCLENBQUMsQ0FBL0IsRUFBa0M7QUFDaEMsY0FBTSxTQUFOLENBQWdCLElBQWhCLENBQXFCLEtBQXJCLENBQTJCLElBQTNCLEVBQWlDLFdBQVcsSUFBWCxFQUFpQixHQUFqQixDQUFxQixVQUFDLEdBQUQsRUFBUztBQUM3RCxpQkFBTyxVQUFDLElBQUQsRUFBVTtBQUNmLGlCQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckI7QUFDRCxXQUZEO0FBR0QsU0FKZ0MsQ0FBakM7QUFLRDtBQUNGLEtBUkQ7O0FBVUEsVUFBTSxTQUFOLENBQWdCLElBQWhCLENBQXFCLEtBQXJCLENBQTJCLE9BQTNCLEVBQW9DLENBQ2xDLE9BRGtDLEVBRWxDO0FBQ0UsWUFBTSxZQURSO0FBRUUsZUFBUztBQUNQLGVBQU8sUUFBUSxRQUFSLEVBREE7QUFFUCxzQkFBYztBQUZQO0FBRlgsS0FGa0MsQ0FBcEM7O0FBV0EsU0FBSyxLQUFMLENBQVcsSUFBWCxFQUFpQixZQUFNO0FBQ3JCO0FBQ0EsVUFBSSxNQUFKLENBQVcsVUFBWCxFQUF1QjtBQUNyQixlQUFPLFFBQVEsUUFBUixFQURjO0FBRXJCLGlCQUFTO0FBRlksT0FBdkI7QUFJRCxLQU5EO0FBT0QsR0FqQ0Q7O0FBbUNBLE9BQUssTUFBTCxHQUFjLFlBQVk7QUFDeEIsV0FBTyxzREFBUDtBQUNELEdBRkQ7QUFHRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsWUFBakI7Ozs7O0FDdEVBOzs7QUFHQSxJQUFJLFVBQVUsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFJLFlBQVksUUFBUSxjQUFSLENBQWhCO0FBQ0EsSUFBSSxlQUFlLFFBQVEsaUJBQVIsQ0FBbkI7O0FBRUEsU0FBUyxNQUFULENBQWlCLE9BQWpCLEVBQTBCO0FBQ3hCLE1BQUksUUFBUSxRQUFRLFFBQVIsRUFBWjs7QUFFQSxPQUFLLE1BQUwsR0FBYyxZQUFZO0FBQ3hCLHFEQUVNLE1BQU0sSUFBTixDQUFXLE1BQVgsR0FBb0IsdUJBQXBCLEdBQThDLEVBRnBELG9CQUdNLE1BQU0sR0FBTixDQUFVLE1BQVYsR0FBbUIsc0JBQW5CLEdBQTRDLEVBSGxELG9CQUlNLE1BQU0sRUFBTixDQUFTLE1BQVQsR0FBa0IscUJBQWxCLEdBQTBDLEVBSmhELDZCQU1NLFFBQVEsTUFBUixDQUFlLElBQUksU0FBSixDQUFjLE9BQWQsQ0FBZixDQU5OLGtCQU9NLFFBQVEsTUFBUixDQUFlLElBQUksWUFBSixDQUFpQixPQUFqQixDQUFmLENBUE47QUFVRCxHQVhEO0FBWUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7OztBQ3hCQTs7O0FBR0EsSUFBSSxPQUFPLFFBQVEsWUFBUixDQUFYO0FBQ0EsSUFBSSxRQUFRLFFBQVEsVUFBUixDQUFaOztBQUVBLFNBQVMsSUFBVCxDQUFlLE9BQWYsRUFBd0IsZUFBeEIsRUFBeUM7QUFDdkMsTUFBSSxPQUFPLEtBQUssUUFBTCxDQUFjLElBQWQsRUFBb0IsS0FBcEIsQ0FBWDtBQUNBLFFBQU0sSUFBTixDQUFXLElBQVgsRUFBaUIsT0FBakIsRUFBMEIsZUFBMUI7O0FBRUEsT0FBSyxLQUFMLEdBQWEsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixDQUFiO0FBQ0EsT0FBSyxPQUFMLEdBQWUsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixJQUFuQixDQUF3QixJQUF4QixDQUFmOztBQUVBLE9BQUssTUFBTCxHQUFjLFlBQU07QUFDbEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQWxCLENBQXVCLElBQXZCLEVBQTZCLE9BQTdCLHl5QkFBUDtBQStCRCxHQWhDRDs7QUFrQ0EsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7OztBQ2xEQTs7O0FBR0EsSUFBSSxVQUFVLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBSSxXQUFXLFFBQVEsWUFBUixDQUFmO0FBQ0EsSUFBSSxRQUFRLFFBQVEsU0FBUixDQUFaO0FBQ0EsSUFBSSxRQUFRLFFBQVEsU0FBUixDQUFaOztBQUVBLElBQUksZ0JBQWdCLFFBQVEsNEJBQVIsQ0FBcEI7QUFDQSxJQUFJLGdCQUFnQixJQUFJLGFBQUosRUFBcEI7O0FBRUEsU0FBUyxNQUFULENBQWlCLE9BQWpCLEVBQTBCO0FBQ3hCLE1BQUksVUFBSjtBQUNBLE1BQUksT0FBTyxjQUFjLEdBQWQsRUFBWDtBQUNBLE1BQUksa0JBQWtCLGNBQWMsT0FBcEM7QUFDQSxNQUFJLHFCQUFxQixnQkFBZ0IsVUFBaEIsQ0FBMkIsYUFBM0IsQ0FBekI7O0FBRUEsTUFBSSxTQUFTLFNBQVQsTUFBUyxHQUFZO0FBQ3ZCLFFBQUksVUFBVSxjQUFjLEdBQWQsRUFBZDs7QUFFQTtBQUNBLFFBQUksS0FBSyxTQUFMLENBQWUsSUFBZixNQUF5QixLQUFLLFNBQUwsQ0FBZSxPQUFmLENBQTdCLEVBQXNEO0FBQ3BELGNBQVEsTUFBUixDQUFlLElBQUksTUFBSixDQUFXLE9BQVgsQ0FBZixFQUFvQyxVQUFwQztBQUNEO0FBQ0YsR0FQRDs7QUFTQSxXQUFTLHNCQUFULEdBQW1DO0FBQ2pDLG9CQUFnQixhQUFoQixDQUE4QixhQUE5QixFQUE2QyxLQUE3QztBQUNEOztBQUVELE9BQUssS0FBTCxHQUFhLFVBQVUsS0FBVixFQUFpQjtBQUM1QixpQkFBYSxLQUFiOztBQUVBLGVBQVcsYUFBWCxDQUF5QixjQUF6QixFQUF5QyxnQkFBekMsQ0FBMEQsT0FBMUQsRUFBbUUsWUFBTTtBQUN2RTtBQUNBLHNCQUFnQixhQUFoQixDQUE4QixhQUE5QixFQUE2QyxJQUE3Qzs7QUFFQSxhQUFPLFVBQVA7O0FBRUEsYUFBTyxVQUFQLENBQWtCLEVBQWxCLENBQXFCLE9BQXJCLEVBQThCLHNCQUE5QjtBQUNBLGFBQU8sVUFBUCxDQUFrQixFQUFsQixDQUFxQixPQUFyQixFQUE4QixzQkFBOUI7QUFDRCxLQVJEOztBQVVBLGtCQUFjLEVBQWQsQ0FBaUIsUUFBakIsRUFBMkIsTUFBM0I7QUFDRCxHQWREOztBQWdCQSxPQUFLLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLFFBQUksT0FBTyxVQUFYLEVBQXVCO0FBQ3JCLGFBQU8sVUFBUCxDQUFrQixHQUFsQixDQUFzQixPQUF0QixFQUErQixzQkFBL0I7QUFDQSxhQUFPLFVBQVAsQ0FBa0IsR0FBbEIsQ0FBc0IsT0FBdEIsRUFBK0Isc0JBQS9CO0FBQ0Q7O0FBRUQsa0JBQWMsR0FBZCxDQUFrQixRQUFsQixFQUE0QixNQUE1QjtBQUNELEdBUEQ7O0FBU0EsT0FBSyxNQUFMLEdBQWMsWUFBWTtBQUN4QixzTEFNTSxRQUFRLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxPQUFWLEVBQW1CLGNBQWMsT0FBakMsQ0FBZixDQU5OLGtCQU9NLFFBQVEsTUFBUixDQUFlLElBQUksUUFBSixDQUFhLE9BQWIsRUFBc0IsY0FBYyxPQUFwQyxDQUFmLENBUE4sb0JBU00sUUFBUSxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsT0FBVixFQUFtQixjQUFjLE9BQWpDLENBQWYsQ0FUTixrRUFXbUQscUJBQXFCLFlBQXJCLEdBQW9DLEVBWHZGO0FBZ0JELEdBakJEO0FBa0JEOztBQUVELE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7QUMzRUE7OztBQUdBLElBQUksT0FBTyxRQUFRLFlBQVIsQ0FBWDtBQUNBLElBQUksUUFBUSxRQUFRLFVBQVIsQ0FBWjs7QUFFQSxTQUFTLFFBQVQsQ0FBbUIsT0FBbkIsRUFBNEIsZUFBNUIsRUFBNkM7QUFDM0MsTUFBSSxPQUFPLEtBQUssUUFBTCxDQUFjLElBQWQsRUFBb0IsS0FBcEIsQ0FBWDtBQUNBLFFBQU0sSUFBTixDQUFXLElBQVgsRUFBaUIsVUFBakIsRUFBNkIsZUFBN0I7O0FBRUEsTUFBSSxRQUFRLFFBQVEsUUFBUixFQUFaO0FBQ0EsTUFBSSxRQUFRLFFBQVEsUUFBUixFQUFaOztBQUVBLFdBQVMsVUFBVCxDQUFxQixJQUFyQixFQUEyQjtBQUN6QixXQUFPLFVBQVUsQ0FBVixFQUFhO0FBQ2xCLFVBQUksUUFBUSxFQUFaO0FBQ0EsWUFBTSxJQUFOLElBQWMsRUFBRSxRQUFRLENBQUUsRUFBRSxNQUFGLENBQVMsT0FBckIsRUFBZDtBQUNBLGFBQU8sUUFBUSxXQUFSLENBQW9CLEtBQXBCLENBQVA7QUFDRCxLQUpEO0FBS0Q7O0FBRUQsV0FBUyxRQUFULEdBQXFCO0FBQ25CLFlBQVEsV0FBUixDQUFvQixLQUFLLEtBQXpCO0FBQ0Q7O0FBRUQsT0FBSyxLQUFMLEdBQWEsVUFBVSxVQUFWLEVBQXNCO0FBQ2pDLFNBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsSUFBakIsQ0FBc0IsSUFBdEIsRUFBNEIsVUFBNUI7O0FBRUEsUUFBSSxZQUFZLFdBQVcsYUFBWCxDQUF5QixxQkFBekIsQ0FBaEI7QUFDQSxRQUFJLFdBQVcsV0FBVyxhQUFYLENBQXlCLG9CQUF6QixDQUFmO0FBQ0EsUUFBSSxVQUFVLFdBQVcsYUFBWCxDQUF5QixtQkFBekIsQ0FBZDs7QUFFQSxjQUFVLGdCQUFWLENBQTJCLFFBQTNCLEVBQXFDLFdBQVcsTUFBWCxDQUFyQztBQUNBLGFBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsRUFBb0MsV0FBVyxLQUFYLENBQXBDO0FBQ0EsWUFBUSxnQkFBUixDQUF5QixRQUF6QixFQUFtQyxXQUFXLElBQVgsQ0FBbkM7O0FBRUEsZUFBVyxhQUFYLENBQXlCLGlCQUF6QixFQUE0QyxnQkFBNUMsQ0FBNkQsUUFBN0QsRUFBdUUsUUFBdkU7QUFDRCxHQVpEOztBQWNBLE9BQUssT0FBTCxHQUFlLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBZjs7QUFFQSxPQUFLLE1BQUwsR0FBYyxZQUFNO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixFQUE2QixVQUE3QixnS0FPbUQsQ0FBQyxNQUFNLElBQU4sQ0FBVyxNQUFaLEdBQXFCLFNBQXJCLEdBQWlDLEVBUHBGLDZIQVlrRCxDQUFDLE1BQU0sR0FBTixDQUFVLE1BQVgsR0FBb0IsU0FBcEIsR0FBZ0MsRUFabEYsMkhBaUJpRCxDQUFDLE1BQU0sRUFBTixDQUFTLE1BQVYsR0FBbUIsU0FBbkIsR0FBK0IsRUFqQmhGLDhPQTRCaUMsVUFBVSxpQkFBVixHQUE4QixVQUE5QixHQUEyQyxFQTVCNUUsd0dBK0JnQyxVQUFVLGdCQUFWLEdBQTZCLFVBQTdCLEdBQTBDLEVBL0IxRSxxR0FBUDtBQXFDRCxHQXRDRDs7QUF3Q0EsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7OztBQ3BGQTs7O0FBR0EsSUFBSSxTQUFTLFFBQVEsUUFBUixDQUFiOztBQUVBLElBQUksT0FBTyxRQUFRLFlBQVIsQ0FBWDtBQUNBLElBQUksUUFBUSxRQUFRLFVBQVIsQ0FBWjs7QUFFQSxTQUFTLEtBQVQsQ0FBZ0IsT0FBaEIsRUFBeUIsZUFBekIsRUFBMEM7QUFBQTs7QUFDeEMsTUFBSSxPQUFPLEtBQUssUUFBTCxDQUFjLElBQWQsRUFBb0IsS0FBcEIsQ0FBWDtBQUNBLFFBQU0sSUFBTixDQUFXLElBQVgsRUFBaUIsT0FBakIsRUFBMEIsZUFBMUI7O0FBRUEsTUFBSSxVQUFVLEVBQWQ7QUFDQSxNQUFJLEtBQUssZ0JBQWdCLEtBQWhCLEVBQVQ7O0FBRUEsTUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakMsY0FBVSxPQUFPLFFBQVAsQ0FBZ0IsSUFBMUI7QUFDRDs7QUFFRCxXQUFTLElBQVQsQ0FBZSxNQUFmLEVBQXVCO0FBQ3JCLFdBQU8sVUFBQyxDQUFELEVBQU87QUFDWixVQUFJLE9BQU8sS0FBSyxPQUFMLENBQWEsRUFBRSxNQUFmLEVBQXVCLE1BQXZCLENBQVg7O0FBRUEsYUFBTyxNQUFQOztBQUVBLFVBQUk7QUFDRixpQkFBUyxXQUFULENBQXFCLE1BQXJCOztBQUVBLGFBQUssU0FBTCxHQUFpQixRQUFqQjtBQUNBLG1CQUFXLFlBQU07QUFDZixlQUFLLFNBQUwsR0FBaUIsTUFBakI7QUFDRCxTQUZELEVBRUcsSUFGSDtBQUdELE9BUEQsQ0FPRSxPQUFPLEdBQVAsRUFBWSxDQUFFO0FBQ2pCLEtBYkQ7QUFjRDs7QUFFRCxXQUFTLFFBQVQsR0FBcUI7QUFDbkIsV0FBTyxTQUFQLENBQWlCLE9BQWpCLEVBQTBCO0FBQ3hCLGNBQVEsQ0FEZ0I7QUFFeEIsYUFBTztBQUNMO0FBQ0EsZUFBTztBQUZGO0FBRmlCLEtBQTFCLEVBTUcsVUFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQ2YsVUFBSSxHQUFKLEVBQVM7QUFDUCxlQUFPLGdCQUFnQixRQUFoQixDQUF5QjtBQUM5QixlQUFLLEVBRHlCO0FBRTlCLGlCQUFPLElBQUksUUFBSjtBQUZ1QixTQUF6QixDQUFQO0FBSUQ7O0FBRUQsc0JBQWdCLFFBQWhCLENBQXlCO0FBQ3ZCLGFBQUssR0FEa0I7QUFFdkIsZUFBTztBQUZnQixPQUF6QjtBQUlELEtBbEJEO0FBbUJEOztBQUVELE9BQUssS0FBTCxHQUFhLFVBQVUsVUFBVixFQUFzQjtBQUNqQyxTQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLENBQXNCLElBQXRCLEVBQTRCLFVBQTVCOztBQUVBLFFBQUksV0FBVyxXQUFXLGFBQVgsQ0FBeUIsdUJBQXpCLENBQWY7QUFDQSxRQUFJLGVBQWUsV0FBVyxhQUFYLENBQXlCLHNCQUF6QixDQUFuQjs7QUFFQSxpQkFBYSxnQkFBYixDQUE4QixPQUE5QixFQUF1QyxLQUFLLFFBQUwsQ0FBdkM7QUFDRCxHQVBEOztBQVNBLE9BQUssT0FBTCxHQUFlLFlBQVk7QUFDekIsU0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixJQUFuQixDQUF3QixJQUF4QjtBQUNELEdBRkQ7O0FBSUEsTUFBSSxpQkFBaUIsS0FBSyxXQUExQjtBQUNBLE9BQUssV0FBTCxHQUFtQixZQUFNO0FBQ3ZCOztBQUVBLFFBQUksTUFBSyxLQUFMLEtBQWUsSUFBbkIsRUFBeUI7QUFDdkI7QUFDRDtBQUNGLEdBTkQ7O0FBUUEsT0FBSyxNQUFMLEdBQWMsWUFBTTtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsaUNBQ2MsR0FBRyxHQUFILEdBQVMsb0JBQVQsR0FBZ0MsRUFEOUMseUZBTVMsR0FBRyxHQU5aLCtFQVNDLEdBQUcsS0FUSixnUEFrQndFLE9BbEJ4RSxrTEFBUDtBQXlCRCxHQTFCRDs7QUE0QkEsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLEtBQWpCOzs7OztBQy9HQTs7O0FBR0EsSUFBSSxVQUFVLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBSSxTQUFTLFFBQVEsaUJBQVIsQ0FBYjtBQUNBLElBQUksU0FBUyxRQUFRLGlCQUFSLENBQWI7O0FBRUEsSUFBSSxjQUFjLFFBQVEsZ0JBQVIsQ0FBbEI7QUFDQSxJQUFJLFFBQVEsSUFBSSxXQUFKLEVBQVo7O0FBRUEsU0FBUyxJQUFULEdBQWlCO0FBQ2YsTUFBSSxVQUFKO0FBQ0EsTUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYO0FBQ0EsTUFBSSxRQUFRLE1BQU0sT0FBTixDQUFjLFFBQWQsRUFBWjs7QUFFQSxNQUFJLFNBQVMsU0FBVCxNQUFTLEdBQVk7QUFDdkIsUUFBSSxVQUFVLE1BQU0sR0FBTixFQUFkOztBQUVBO0FBQ0EsV0FBTyxLQUFLLEtBQVo7QUFDQSxXQUFPLFFBQVEsS0FBZjs7QUFFQTtBQUNBO0FBQ0EsUUFBSSxLQUFLLFNBQUwsQ0FBZSxJQUFmLE1BQXlCLEtBQUssU0FBTCxDQUFlLE9BQWYsQ0FBN0IsRUFBc0Q7QUFDcEQsY0FBUSxNQUFSLENBQWUsSUFBZixFQUFxQixVQUFyQjtBQUNEO0FBQ0YsR0FaRDs7QUFjQSxPQUFLLEtBQUwsR0FBYSxVQUFVLEtBQVYsRUFBaUI7QUFDNUIsaUJBQWEsS0FBYjs7QUFFQSxVQUFNLEVBQU4sQ0FBUyxRQUFULEVBQW1CLE1BQW5CO0FBQ0QsR0FKRDs7QUFNQSxPQUFLLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLFVBQU0sR0FBTixDQUFVLFFBQVYsRUFBb0IsTUFBcEI7QUFDRCxHQUZEOztBQUlBLE9BQUssTUFBTCxHQUFjLFlBQVk7QUFDeEIscURBQ2lDLE1BQU0sT0FBTixDQUFjLElBQWQsRUFBb0IsR0FBcEIsQ0FEakMsb0JBRU0sUUFBUSxNQUFSLENBQWUsSUFBSSxNQUFKLENBQVcsTUFBTSxPQUFqQixDQUFmLENBRk4sa0JBR00sUUFBUSxNQUFSLENBQWUsSUFBSSxNQUFKLENBQVcsTUFBTSxPQUFqQixDQUFmLENBSE47QUFNRCxHQVBEO0FBUUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7OztBQ2pEQTs7O0FBR0EsSUFBSSxPQUFPLFFBQVEsU0FBUixDQUFYOztBQUVBLFNBQVMsS0FBVCxDQUFnQixJQUFoQixFQUFzQixPQUF0QixFQUErQjtBQUM3QixPQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsT0FBSyxLQUFMLEdBQWEsUUFBUSxRQUFSLENBQWlCLElBQWpCLENBQWI7QUFDQSxPQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsT0FBSyxXQUFMLEdBQW1CLEtBQUssU0FBTCxDQUFlLFdBQWYsQ0FBMkIsSUFBM0IsQ0FBZ0MsSUFBaEMsQ0FBbkI7QUFDQSxPQUFLLFNBQUwsR0FBaUIsS0FBSyxTQUFMLENBQWUsU0FBZixDQUF5QixJQUF6QixDQUE4QixJQUE5QixDQUFqQjtBQUNEOztBQUVELE1BQU0sU0FBTixDQUFnQixXQUFoQixHQUE4QixZQUFZO0FBQ3hDLE9BQUssS0FBTCxHQUFhLENBQUMsS0FBSyxLQUFuQjtBQUNBLE9BQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsS0FBSyxJQUE5QixFQUFvQyxLQUFLLEtBQXpDO0FBQ0QsQ0FIRDs7QUFLQSxNQUFNLFNBQU4sQ0FBZ0IsU0FBaEIsR0FBNEIsVUFBVSxDQUFWLEVBQWE7QUFDdkMsTUFBSSxLQUFLLE9BQUwsQ0FBYSxFQUFFLE1BQWYsRUFBdUIsUUFBdkIsS0FBb0MsRUFBRSxNQUFGLEtBQWEsS0FBSyxPQUF0RCxJQUFpRSxDQUFDLEtBQUssS0FBM0UsRUFBa0Y7QUFDaEY7QUFDRDs7QUFFRCxPQUFLLE9BQUwsQ0FBYSxXQUFiLENBQXlCLEtBQUssSUFBOUIsRUFBb0MsS0FBcEM7QUFDRCxDQU5EOztBQVFBLE1BQU0sU0FBTixDQUFnQixLQUFoQixHQUF3QixVQUFVLFVBQVYsRUFBc0I7QUFDNUMsT0FBSyxVQUFMLEdBQWtCLFVBQWxCO0FBQ0EsT0FBSyxPQUFMLEdBQWUsV0FBVyxhQUFYLENBQXlCLGVBQXpCLENBQWY7O0FBRUEsT0FBSyxPQUFMLENBQWEsZ0JBQWIsQ0FBOEIsT0FBOUIsRUFBdUMsS0FBSyxXQUE1QztBQUNBLFdBQVMsZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBbUMsS0FBSyxTQUF4QztBQUNELENBTkQ7O0FBUUEsTUFBTSxTQUFOLENBQWdCLE9BQWhCLEdBQTBCLFlBQVk7QUFDcEMsV0FBUyxtQkFBVCxDQUE2QixPQUE3QixFQUFzQyxLQUFLLFNBQTNDO0FBQ0QsQ0FGRDs7QUFJQSxNQUFNLFNBQU4sQ0FBZ0IsTUFBaEIsR0FBeUIsVUFBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTBCO0FBQ2pELGdEQUNnQyxLQUFLLElBRHJDLFVBQzZDLEtBQUssS0FBTCxHQUFhLHlCQUFiLEdBQXlDLEVBRHRGLGdEQUVtQyxLQUFLLElBRnhDLDRDQUdRLEtBSFIsZ0RBTW1CLEtBQUssSUFOeEIsZ0NBT1EsT0FQUjtBQVdELENBWkQ7O0FBY0EsT0FBTyxPQUFQLEdBQWlCLEtBQWpCOzs7OztBQ3BEQTs7O0FBR0EsU0FBUyxPQUFULENBQWtCLEtBQWxCLEVBQXlCO0FBQ3ZCLFdBQVMsUUFBVCxDQUFtQixJQUFuQixFQUF5QjtBQUN2QixXQUFPLE1BQU0sR0FBTixHQUFZLEtBQVosQ0FBa0IsSUFBbEIsQ0FBUDtBQUNEOztBQUVELFdBQVMsV0FBVCxDQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQztBQUNqQyxRQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQSxTQUFLLEtBQUwsQ0FBVyxJQUFYLElBQW1CLEtBQW5COztBQUVBLFVBQU0sR0FBTixDQUFVLElBQVY7QUFDRDs7QUFFRCxXQUFTLFVBQVQsQ0FBcUIsSUFBckIsRUFBMkI7QUFDekIsV0FBTyxNQUFNLEdBQU4sR0FBWSxPQUFaLENBQW9CLElBQXBCLENBQVA7QUFDRDs7QUFFRCxXQUFTLGFBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsS0FBOUIsRUFBcUM7QUFDbkMsUUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYO0FBQ0EsU0FBSyxPQUFMLENBQWEsSUFBYixJQUFxQixLQUFyQjs7QUFFQSxVQUFNLEdBQU4sQ0FBVSxJQUFWO0FBQ0Q7O0FBRUQsV0FBUyxLQUFULEdBQWtCO0FBQ2hCLFdBQU8sTUFBTSxHQUFOLEdBQVksRUFBbkI7QUFDRDs7QUFFRCxXQUFTLFFBQVQsQ0FBbUIsR0FBbkIsRUFBd0I7QUFDdEIsUUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsR0FBVjs7QUFFQSxVQUFNLEdBQU4sQ0FBVSxJQUFWO0FBQ0Q7O0FBRUQsU0FBTztBQUNMLGNBQVUsUUFETDtBQUVMLGlCQUFhLFdBRlI7O0FBSUwsZ0JBQVksVUFKUDtBQUtMLG1CQUFlLGFBTFY7O0FBT0wsV0FBTyxLQVBGO0FBUUwsY0FBVTtBQVJMLEdBQVA7QUFVRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsT0FBakI7Ozs7Ozs7QUNqREE7OztBQUdBLElBQUksT0FBTyxRQUFRLFNBQVIsQ0FBWDs7QUFFQSxTQUFTLE9BQVQsQ0FBa0IsS0FBbEIsRUFBeUI7QUFDdkIsV0FBUyxRQUFULEdBQXFCO0FBQ25CLFdBQU8sTUFBTSxHQUFOLEdBQVksS0FBbkI7QUFDRDs7QUFFRCxXQUFTLFVBQVQsQ0FBcUIsT0FBckIsRUFBOEI7QUFDNUIsUUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYOztBQUVBLFNBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsVUFBQyxJQUFELEVBQU8sS0FBUCxFQUFpQjtBQUMvQixVQUFJLEtBQUssSUFBTCxLQUFjLFFBQVEsSUFBMUIsRUFBZ0M7QUFDOUIsYUFBSyxLQUFMLENBQVcsS0FBWCxJQUFvQixLQUFLLE1BQUwsQ0FBWSxPQUFaLEVBQXFCLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBckIsQ0FBcEI7QUFDQSxlQUFPLElBQVA7QUFDRDtBQUNGLEtBTEQ7O0FBT0EsV0FBTyxNQUFNLEdBQU4sQ0FBVSxJQUFWLENBQVA7QUFDRDs7QUFFRCxXQUFTLFVBQVQsR0FBdUI7QUFDckIsV0FBTyxNQUFNLEdBQU4sR0FBWSxPQUFuQjtBQUNEOztBQUVELFdBQVMsU0FBVCxDQUFvQixTQUFwQixFQUErQjtBQUM3QixRQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7O0FBRUEsU0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixTQUFsQjtBQUNBLFdBQU8sTUFBTSxHQUFOLENBQVUsSUFBVixDQUFQO0FBQ0Q7O0FBRUQsV0FBUyxZQUFULENBQXVCLFNBQXZCLEVBQWtDO0FBQ2hDLFFBQUksT0FBTyxNQUFNLEdBQU4sRUFBWDtBQUNBLFFBQUksYUFBYSxFQUFqQjs7QUFFQSxRQUFJLFFBQU8sU0FBUCx5Q0FBTyxTQUFQLE9BQXFCLFFBQXpCLEVBQW1DO0FBQ2pDLG1CQUFhLFVBQVUsSUFBdkI7QUFDRCxLQUZELE1BRU87QUFDTCxtQkFBYSxTQUFiO0FBQ0Q7O0FBRUQsU0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixVQUFDLE1BQUQsRUFBUyxLQUFULEVBQW1CO0FBQ25DLFVBQUssUUFBTyxNQUFQLHlDQUFPLE1BQVAsT0FBa0IsUUFBbEIsSUFBOEIsT0FBTyxJQUFQLEtBQWdCLFVBQS9DLElBQ0MsT0FBTyxNQUFQLEtBQWtCLFFBQWxCLElBQThCLFdBQVcsVUFEOUMsRUFDMkQ7QUFDekQsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixLQUFwQixFQUEyQixDQUEzQjtBQUNBLGVBQU8sSUFBUDtBQUNEO0FBQ0YsS0FORDs7QUFRQSxXQUFPLE1BQU0sR0FBTixDQUFVLElBQVYsQ0FBUDtBQUNEOztBQUVELFdBQVMsUUFBVCxHQUFxQjtBQUNuQixXQUFPLE1BQU0sR0FBTixHQUFZLEtBQW5CO0FBQ0Q7O0FBRUQsV0FBUyxXQUFULENBQXNCLFFBQXRCLEVBQWdDO0FBQzlCLFFBQUksT0FBTyxNQUFNLEdBQU4sRUFBWDtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQUssTUFBTCxDQUFZLFFBQVosRUFBc0IsS0FBSyxLQUEzQixDQUFiOztBQUVBLFdBQU8sTUFBTSxHQUFOLENBQVUsSUFBVixDQUFQO0FBQ0Q7O0FBRUQsV0FBUyxRQUFULEdBQXFCO0FBQ25CLFdBQU8sTUFBTSxHQUFOLEdBQVksS0FBbkI7QUFDRDs7QUFFRCxXQUFTLFdBQVQsQ0FBc0IsS0FBdEIsRUFBNkI7QUFDM0IsUUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjs7QUFFQSxXQUFPLE1BQU0sR0FBTixDQUFVLElBQVYsQ0FBUDtBQUNEOztBQUVELFNBQU87QUFDTCxjQUFVLFFBREw7QUFFTCxnQkFBWSxVQUZQOztBQUlMLGdCQUFZLFVBSlA7QUFLTCxlQUFXLFNBTE47QUFNTCxrQkFBYyxZQU5UOztBQVFMLGNBQVUsUUFSTDtBQVNMLGlCQUFhLFdBVFI7O0FBV0wsY0FBVSxRQVhMO0FBWUwsaUJBQWE7QUFaUixHQUFQO0FBY0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7OztBQzdGQTs7OztBQUlBLElBQUksUUFBUSxRQUFRLGVBQVIsQ0FBWjtBQUNBLElBQUksVUFBVSxRQUFRLG9CQUFSLENBQWQ7O0FBRUEsSUFBSSxXQUFXO0FBQ2IsU0FBTyxFQURNO0FBRWIsV0FBUyxFQUZJO0FBR2IsTUFBSTtBQUNGLFNBQUssRUFESDtBQUVGLFdBQU87QUFGTDtBQUhTLENBQWY7O0FBU0EsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBWTtBQUM5QixRQUFNLElBQU4sQ0FBVyxJQUFYO0FBQ0EsT0FBSyxPQUFMLEdBQWUsUUFBUSxJQUFSLENBQWY7O0FBRUEsT0FBSyxHQUFMLENBQVMsUUFBVDtBQUNELENBTEQ7O0FBT0EsY0FBYyxTQUFkLEdBQTBCLE9BQU8sTUFBUCxDQUFjLE1BQU0sU0FBcEIsQ0FBMUI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLGFBQWpCOzs7OztBQ3pCQTs7O0FBR0EsSUFBSSxRQUFRLFFBQVEsZUFBUixDQUFaO0FBQ0EsSUFBSSxXQUFXLFFBQVEsV0FBUixDQUFmO0FBQ0EsSUFBSSxVQUFVLFFBQVEsV0FBUixDQUFkO0FBQ0EsSUFBSSxPQUFPLFFBQVEsU0FBUixDQUFYOztBQUVBLElBQUksV0FBVztBQUNiLFdBQVMsQ0FESTtBQUViLFNBQU8sQ0FBQztBQUNOLFVBQU0sTUFEQTtBQUVOLGFBQVM7QUFGSCxHQUFELEVBR0o7QUFDRCxVQUFNLEtBREw7QUFFRCxhQUFTO0FBRlIsR0FISSxFQU1KO0FBQ0QsVUFBTSxJQURMO0FBRUQsYUFBUztBQUZSLEdBTkksQ0FGTTtBQVliLFdBQVMsRUFaSTtBQWFiLFNBQU8saUJBYk07O0FBZWI7QUFDQSxTQUFPO0FBQ0wsVUFBTSxFQUREO0FBRUwsU0FBSyxFQUZBO0FBR0wsUUFBSTtBQUhDO0FBaEJNLENBQWY7O0FBdUJBLFNBQVMsbUJBQVQsR0FBZ0M7QUFDOUIsTUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakMsV0FBTyxZQUFNLENBQUUsQ0FBZjtBQUNEOztBQUVELE1BQUksT0FBTyxPQUFPLE9BQVAsQ0FBZSxZQUF0QixLQUF1QyxXQUEzQyxFQUF3RDtBQUN0RCxXQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsYUFBTyxPQUFQLENBQWUsWUFBZixDQUE0QixJQUE1QixFQUFrQyxJQUFsQyxRQUE0QyxJQUE1QztBQUNELEtBRkQ7QUFHRCxHQUpELE1BSU87QUFDTCxXQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsYUFBTyxRQUFQLENBQWdCLE9BQWhCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixLQUFyQixDQUEyQixHQUEzQixFQUFnQyxDQUFoQyxDQUEzQixTQUFpRSxJQUFqRTtBQUNELEtBRkQ7QUFHRDtBQUNGOztBQUVELFNBQVMsU0FBVCxHQUFzQjtBQUNwQixNQUFJLE9BQU8sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQyxXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJO0FBQ0YsV0FBTyxLQUFLLEtBQUwsQ0FBVyxTQUFTLGlDQUFULENBQTJDLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBM0MsQ0FBWCxDQUFQO0FBQ0QsR0FGRCxDQUVFLE9BQU8sR0FBUCxFQUFZLENBQUU7O0FBRWhCLFNBQU8sSUFBUDtBQUNEOztBQUVELElBQUksY0FBYyxTQUFkLFdBQWMsR0FBWTtBQUFBOztBQUM1QixRQUFNLElBQU4sQ0FBVyxJQUFYO0FBQ0EsT0FBSyxPQUFMLEdBQWUsUUFBUSxJQUFSLENBQWY7O0FBRUEsTUFBSSxjQUFjLHFCQUFsQjtBQUNBLE1BQUksaUJBQWlCLEVBQXJCOztBQUVBLE1BQUksV0FBVyxXQUFmO0FBQ0EsTUFBSSxRQUFKLEVBQWM7QUFDWixTQUFLLEdBQUwsQ0FBUyxLQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLFFBQXRCLENBQVQ7QUFDRCxHQUZELE1BRU87QUFDTCxTQUFLLEdBQUwsQ0FBUyxRQUFUO0FBQ0Q7O0FBRUQsT0FBSyxFQUFMLENBQVEsUUFBUixFQUFrQixZQUFNO0FBQ3RCO0FBQ0EsUUFBSSxPQUFPLE1BQUssR0FBTCxFQUFYOztBQUVBLHFCQUFpQixTQUFTLDZCQUFULENBQXVDLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBdkMsQ0FBakI7QUFDQSxnQkFBWSxLQUFLLElBQUwsQ0FBVSxHQUFWLEVBQWUsY0FBZixDQUFaO0FBQ0QsR0FORDs7QUFRQSxNQUFJLE9BQU8sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQyxXQUFPLGdCQUFQLENBQXdCLFlBQXhCLEVBQXNDLFlBQU07QUFDMUM7QUFDQTtBQUNBO0FBQ0EsVUFBSSxLQUFLLElBQUwsQ0FBVSxHQUFWLE1BQW1CLGNBQXZCLEVBQXVDO0FBQ3JDLGVBQU8sUUFBUCxDQUFnQixNQUFoQjtBQUNEO0FBQ0YsS0FQRDtBQVFEO0FBQ0YsQ0FoQ0Q7O0FBa0NBLFlBQVksU0FBWixHQUF3QixPQUFPLE1BQVAsQ0FBYyxNQUFNLFNBQXBCLENBQXhCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixXQUFqQjs7Ozs7OztBQy9GQTs7O0FBR0EsU0FBUyxPQUFULENBQWtCLEtBQWxCLEVBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDO0FBQ0EsTUFBSSxRQUFKOztBQUVBO0FBQ0EsU0FBTyxTQUFTLFVBQVUsUUFBMUIsRUFBb0M7QUFDbEMsUUFBSSxNQUFNLFVBQVYsRUFBc0I7QUFDcEI7QUFDQSxpQkFBVyxNQUFNLFVBQU4sQ0FBaUIsZ0JBQWpCLENBQWtDLFFBQWxDLENBQVg7QUFDQTtBQUNBLFVBQUksR0FBRyxPQUFILENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixLQUExQixNQUFxQyxDQUFDLENBQTFDLEVBQTZDO0FBQzNDLGVBQU8sS0FBUDtBQUNEOztBQUVEO0FBQ0EsY0FBUSxNQUFNLFVBQWQ7QUFDRCxLQVZELE1BVU87QUFDTCxhQUFPLElBQVA7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUDtBQUNEOztBQUVELFNBQVMsS0FBVCxDQUFnQixHQUFoQixFQUFxQjtBQUNuQixTQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBWCxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxXQUFULENBQXNCLEdBQXRCLEVBQTBDO0FBQUEsTUFBZixRQUFlLHVFQUFKLEVBQUk7O0FBQ3hDO0FBQ0EsU0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixPQUF0QixDQUE4QixVQUFVLEdBQVYsRUFBZTtBQUMzQyxRQUFJLE9BQU8sSUFBSSxHQUFKLENBQVAsS0FBb0IsV0FBeEIsRUFBcUM7QUFDbkM7QUFDQSxVQUFJLEdBQUosSUFBVyxNQUFNLFNBQVMsR0FBVCxDQUFOLENBQVg7QUFDRCxLQUhELE1BR08sSUFBSSxRQUFPLElBQUksR0FBSixDQUFQLE1BQW9CLFFBQXhCLEVBQWtDO0FBQ3ZDLGtCQUFZLElBQUksR0FBSixDQUFaLEVBQXNCLFNBQVMsR0FBVCxDQUF0QjtBQUNEO0FBQ0YsR0FQRDs7QUFTQSxTQUFPLEdBQVA7QUFDRDs7QUFFRDtBQUNBLFNBQVMsTUFBVCxDQUFpQixHQUFqQixFQUFzQixRQUF0QixFQUFnQztBQUM5QixNQUFJLFFBQVEsSUFBWixFQUFrQjtBQUNoQixVQUFNLEVBQU47QUFDRDs7QUFFRCxTQUFPLFlBQVksTUFBTSxHQUFOLENBQVosRUFBd0IsUUFBeEIsQ0FBUDtBQUNEOztBQUVELFNBQVMsUUFBVCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixTQUEvQixFQUEwQztBQUN4QyxNQUFJLE9BQUo7QUFDQSxTQUFPLFlBQVk7QUFDakIsUUFBSSxVQUFVLElBQWQ7QUFDQSxRQUFJLE9BQU8sU0FBWDtBQUNBLFFBQUksVUFBVSxhQUFhLENBQUMsT0FBNUI7O0FBRUEsUUFBSSxRQUFRLFNBQVIsS0FBUSxHQUFZO0FBQ3RCLGdCQUFVLElBQVY7QUFDQSxVQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNkLGFBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEI7QUFDRDtBQUNGLEtBTEQ7O0FBT0EsaUJBQWEsT0FBYjtBQUNBLGNBQVUsV0FBVyxLQUFYLEVBQWtCLElBQWxCLENBQVY7QUFDQSxRQUFJLE9BQUosRUFBYTtBQUNYLFdBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEI7QUFDRDtBQUNGLEdBakJEO0FBa0JEOztBQUVELFNBQVMsVUFBVCxDQUFxQixHQUFyQixFQUEyQztBQUFBLE1BQWpCLElBQWlCLHVFQUFWLFlBQU0sQ0FBRSxDQUFFOztBQUN6QyxNQUFJLFVBQVUsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQWQ7QUFDQSxVQUFRLEdBQVIsR0FBYyxHQUFkO0FBQ0EsV0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixPQUExQjs7QUFFQSxVQUFRLE1BQVIsR0FBaUIsSUFBakI7QUFDRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckIsRUFBa0M7QUFBQSxNQUFQLENBQU8sdUVBQUgsQ0FBRzs7QUFDaEMsTUFBSSxJQUFJLE1BQUosS0FBZSxDQUFuQixFQUFzQjtBQUNwQixXQUFPLE1BQVA7QUFDRDs7QUFFRCxNQUFJLENBQUosRUFBTyxZQUFNO0FBQ1g7QUFDQSxVQUFNLEdBQU4sRUFBVyxJQUFYLEVBQWlCLENBQWpCO0FBQ0QsR0FIRDtBQUlEOztBQUVELFNBQVMsS0FBVCxDQUFnQixJQUFoQixFQUFzQixPQUF0QixFQUErQixRQUEvQixFQUF5QztBQUN2QztBQUNBLE1BQUksT0FBTyxPQUFQLEtBQW1CLFVBQXZCLEVBQW1DO0FBQ2pDLGVBQVcsT0FBWDtBQUNBLGNBQVUsRUFBVjtBQUNEOztBQUVELFlBQVUsT0FBTyxPQUFQLEVBQWdCO0FBQ3hCLFVBQU0sS0FEa0I7QUFFeEIsVUFBTTtBQUZrQixHQUFoQixDQUFWOztBQUtBLGFBQVcsWUFBWSxZQUFZLENBQUUsQ0FBckM7O0FBRUEsTUFBSSxVQUFVLElBQUksT0FBTyxjQUFYLEVBQWQ7QUFDQSxVQUFRLElBQVIsQ0FBYSxRQUFRLElBQXJCLEVBQTJCLElBQTNCO0FBQ0EsVUFBUSxnQkFBUixDQUF5QixjQUF6QixFQUF5QyxnQ0FBekM7QUFDQSxVQUFRLGdCQUFSLENBQXlCLGtCQUF6QixFQUE2QyxnQkFBN0M7O0FBRUEsVUFBUSxNQUFSLEdBQWlCLFlBQVk7QUFDM0IsUUFBSSxRQUFRLE1BQVIsSUFBa0IsR0FBbEIsSUFBeUIsUUFBUSxNQUFSLEdBQWlCLEdBQTlDLEVBQW1EO0FBQ2pEO0FBQ0EsVUFBSSxPQUFPLEtBQUssS0FBTCxDQUFXLFFBQVEsWUFBUixJQUF3QixJQUFuQyxDQUFYOztBQUVBLGVBQVMsSUFBVCxFQUFlLElBQWY7QUFDRCxLQUxELE1BS087QUFDTDtBQUNBLGVBQVMsT0FBVDtBQUNEO0FBQ0YsR0FWRDs7QUFZQSxVQUFRLE9BQVIsR0FBa0IsWUFBWTtBQUM1QjtBQUNBLGFBQVMsT0FBVDtBQUNELEdBSEQ7O0FBS0EsVUFBUSxJQUFSLENBQWEsS0FBSyxTQUFMLENBQWUsUUFBUSxJQUF2QixDQUFiO0FBQ0Q7O0FBRUQsU0FBUyxRQUFULENBQW1CLFNBQW5CLEVBQThCLFVBQTlCLEVBQTBDO0FBQ3hDLFlBQVUsU0FBVixHQUFzQixPQUFPLE1BQVAsQ0FBYyxXQUFXLFNBQXpCLENBQXRCO0FBQ0EsWUFBVSxTQUFWLENBQW9CLFdBQXBCLEdBQWtDLFNBQWxDOztBQUVBLFlBQVUsS0FBVixHQUFrQixPQUFPLGNBQVAsQ0FBc0IsVUFBVSxTQUFoQyxDQUFsQjs7QUFFQSxTQUFPLFNBQVA7QUFDRDs7QUFFRCxTQUFTLElBQVQsQ0FBZSxHQUFmLEVBQW9CLEtBQXBCLEVBQTJCO0FBQ3pCLE1BQUksWUFBWSxFQUFoQjtBQUNBLE1BQUksT0FBTyxRQUFQLENBQWdCLElBQXBCLEVBQTBCO0FBQ3hCLGdCQUFZLE9BQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixNQUFyQixDQUE0QixDQUE1QixFQUErQixLQUEvQixDQUFxQyxHQUFyQyxDQUFaO0FBQ0Q7O0FBRUQsTUFBSSxhQUFhLEVBQWpCO0FBQ0EsTUFBSSxhQUFhLEVBQWpCOztBQUVBLFlBQVUsT0FBVixDQUFrQixVQUFDLElBQUQsRUFBTyxDQUFQLEVBQWE7QUFDN0IsUUFBSSxXQUFXLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZjtBQUNBLGVBQVcsU0FBUyxDQUFULENBQVgsSUFBMEIsU0FBUyxDQUFULEtBQWUsRUFBekM7QUFDRCxHQUhEOztBQUtBLE1BQUksR0FBSixFQUFTO0FBQ1AsUUFBSSxLQUFKLEVBQVc7QUFDVCxpQkFBVyxHQUFYLElBQWtCLEtBQWxCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxXQUFXLEdBQVgsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxTQUFPLElBQVAsQ0FBWSxVQUFaLEVBQXdCLE9BQXhCLENBQWdDLFVBQUMsR0FBRCxFQUFNLENBQU4sRUFBWTtBQUMxQyxRQUFJLElBQUksQ0FBUixFQUFXO0FBQ1Qsb0JBQWMsR0FBZDtBQUNEOztBQUVELGtCQUFjLEdBQWQ7O0FBRUEsUUFBSSxXQUFXLEdBQVgsQ0FBSixFQUFxQjtBQUNuQiwwQkFBa0IsV0FBVyxHQUFYLENBQWxCO0FBQ0Q7QUFDRixHQVZEOztBQVlBLFNBQU8sVUFBUDtBQUNEOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNmLFNBQU8sS0FEUTtBQUVmLFVBQVEsTUFGTztBQUdmLFdBQVMsT0FITTtBQUlmLFlBQVUsUUFKSztBQUtmLGNBQVksVUFMRztBQU1mLFNBQU8sS0FOUTtBQU9mLFNBQU8sS0FQUTtBQVFmLFFBQU0sSUFSUzs7QUFVZixZQUFVO0FBVkssQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBHID0gcmVxdWlyZSgnd2luZG93LW9yLWdsb2JhbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIEcuUHJvbWlzZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBHLlByb21pc2UucHJvdG90eXBlLnRoZW4gPT09ICdmdW5jdGlvbidcbiAgKVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBDcmVhdGVkIDIwMDgtMDgtMTkuXG4gKlxuICogRGlqa3N0cmEgcGF0aC1maW5kaW5nIGZ1bmN0aW9ucy4gQWRhcHRlZCBmcm9tIHRoZSBEaWprc3RhciBQeXRob24gcHJvamVjdC5cbiAqXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDhcbiAqICAgV3lhdHQgQmFsZHdpbiA8c2VsZkB3eWF0dGJhbGR3aW4uY29tPlxuICogICBBbGwgcmlnaHRzIHJlc2VydmVkXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBkaWprc3RyYSA9IHtcbiAgc2luZ2xlX3NvdXJjZV9zaG9ydGVzdF9wYXRoczogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcbiAgICAvLyBQcmVkZWNlc3NvciBtYXAgZm9yIGVhY2ggbm9kZSB0aGF0IGhhcyBiZWVuIGVuY291bnRlcmVkLlxuICAgIC8vIG5vZGUgSUQgPT4gcHJlZGVjZXNzb3Igbm9kZSBJRFxuICAgIHZhciBwcmVkZWNlc3NvcnMgPSB7fTtcblxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQuXG4gICAgLy8gbm9kZSBJRCA9PiBjb3N0XG4gICAgdmFyIGNvc3RzID0ge307XG4gICAgY29zdHNbc10gPSAwO1xuXG4gICAgLy8gQ29zdHMgb2Ygc2hvcnRlc3QgcGF0aHMgZnJvbSBzIHRvIGFsbCBub2RlcyBlbmNvdW50ZXJlZDsgZGlmZmVycyBmcm9tXG4gICAgLy8gYGNvc3RzYCBpbiB0aGF0IGl0IHByb3ZpZGVzIGVhc3kgYWNjZXNzIHRvIHRoZSBub2RlIHRoYXQgY3VycmVudGx5IGhhc1xuICAgIC8vIHRoZSBrbm93biBzaG9ydGVzdCBwYXRoIGZyb20gcy5cbiAgICAvLyBYWFg6IERvIHdlIGFjdHVhbGx5IG5lZWQgYm90aCBgY29zdHNgIGFuZCBgb3BlbmA/XG4gICAgdmFyIG9wZW4gPSBkaWprc3RyYS5Qcmlvcml0eVF1ZXVlLm1ha2UoKTtcbiAgICBvcGVuLnB1c2gocywgMCk7XG5cbiAgICB2YXIgY2xvc2VzdCxcbiAgICAgICAgdSwgdixcbiAgICAgICAgY29zdF9vZl9zX3RvX3UsXG4gICAgICAgIGFkamFjZW50X25vZGVzLFxuICAgICAgICBjb3N0X29mX2UsXG4gICAgICAgIGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lLFxuICAgICAgICBjb3N0X29mX3NfdG9fdixcbiAgICAgICAgZmlyc3RfdmlzaXQ7XG4gICAgd2hpbGUgKCFvcGVuLmVtcHR5KCkpIHtcbiAgICAgIC8vIEluIHRoZSBub2RlcyByZW1haW5pbmcgaW4gZ3JhcGggdGhhdCBoYXZlIGEga25vd24gY29zdCBmcm9tIHMsXG4gICAgICAvLyBmaW5kIHRoZSBub2RlLCB1LCB0aGF0IGN1cnJlbnRseSBoYXMgdGhlIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxuICAgICAgY2xvc2VzdCA9IG9wZW4ucG9wKCk7XG4gICAgICB1ID0gY2xvc2VzdC52YWx1ZTtcbiAgICAgIGNvc3Rfb2Zfc190b191ID0gY2xvc2VzdC5jb3N0O1xuXG4gICAgICAvLyBHZXQgbm9kZXMgYWRqYWNlbnQgdG8gdS4uLlxuICAgICAgYWRqYWNlbnRfbm9kZXMgPSBncmFwaFt1XSB8fCB7fTtcblxuICAgICAgLy8gLi4uYW5kIGV4cGxvcmUgdGhlIGVkZ2VzIHRoYXQgY29ubmVjdCB1IHRvIHRob3NlIG5vZGVzLCB1cGRhdGluZ1xuICAgICAgLy8gdGhlIGNvc3Qgb2YgdGhlIHNob3J0ZXN0IHBhdGhzIHRvIGFueSBvciBhbGwgb2YgdGhvc2Ugbm9kZXMgYXNcbiAgICAgIC8vIG5lY2Vzc2FyeS4gdiBpcyB0aGUgbm9kZSBhY3Jvc3MgdGhlIGN1cnJlbnQgZWRnZSBmcm9tIHUuXG4gICAgICBmb3IgKHYgaW4gYWRqYWNlbnRfbm9kZXMpIHtcbiAgICAgICAgaWYgKGFkamFjZW50X25vZGVzLmhhc093blByb3BlcnR5KHYpKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBjb3N0IG9mIHRoZSBlZGdlIHJ1bm5pbmcgZnJvbSB1IHRvIHYuXG4gICAgICAgICAgY29zdF9vZl9lID0gYWRqYWNlbnRfbm9kZXNbdl07XG5cbiAgICAgICAgICAvLyBDb3N0IG9mIHMgdG8gdSBwbHVzIHRoZSBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZS0tdGhpcyBpcyAqYSpcbiAgICAgICAgICAvLyBjb3N0IGZyb20gcyB0byB2IHRoYXQgbWF5IG9yIG1heSBub3QgYmUgbGVzcyB0aGFuIHRoZSBjdXJyZW50XG4gICAgICAgICAgLy8ga25vd24gY29zdCB0byB2LlxuICAgICAgICAgIGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lID0gY29zdF9vZl9zX3RvX3UgKyBjb3N0X29mX2U7XG5cbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlbid0IHZpc2l0ZWQgdiB5ZXQgT1IgaWYgdGhlIGN1cnJlbnQga25vd24gY29zdCBmcm9tIHMgdG9cbiAgICAgICAgICAvLyB2IGlzIGdyZWF0ZXIgdGhhbiB0aGUgbmV3IGNvc3Qgd2UganVzdCBmb3VuZCAoY29zdCBvZiBzIHRvIHUgcGx1c1xuICAgICAgICAgIC8vIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlKSwgdXBkYXRlIHYncyBjb3N0IGluIHRoZSBjb3N0IGxpc3QgYW5kXG4gICAgICAgICAgLy8gdXBkYXRlIHYncyBwcmVkZWNlc3NvciBpbiB0aGUgcHJlZGVjZXNzb3IgbGlzdCAoaXQncyBub3cgdSkuXG4gICAgICAgICAgY29zdF9vZl9zX3RvX3YgPSBjb3N0c1t2XTtcbiAgICAgICAgICBmaXJzdF92aXNpdCA9ICh0eXBlb2YgY29zdHNbdl0gPT09ICd1bmRlZmluZWQnKTtcbiAgICAgICAgICBpZiAoZmlyc3RfdmlzaXQgfHwgY29zdF9vZl9zX3RvX3YgPiBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSkge1xuICAgICAgICAgICAgY29zdHNbdl0gPSBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZTtcbiAgICAgICAgICAgIG9wZW4ucHVzaCh2LCBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSk7XG4gICAgICAgICAgICBwcmVkZWNlc3NvcnNbdl0gPSB1O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvc3RzW2RdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIG1zZyA9IFsnQ291bGQgbm90IGZpbmQgYSBwYXRoIGZyb20gJywgcywgJyB0byAnLCBkLCAnLiddLmpvaW4oJycpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWRlY2Vzc29ycztcbiAgfSxcblxuICBleHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0OiBmdW5jdGlvbihwcmVkZWNlc3NvcnMsIGQpIHtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgdSA9IGQ7XG4gICAgdmFyIHByZWRlY2Vzc29yO1xuICAgIHdoaWxlICh1KSB7XG4gICAgICBub2Rlcy5wdXNoKHUpO1xuICAgICAgcHJlZGVjZXNzb3IgPSBwcmVkZWNlc3NvcnNbdV07XG4gICAgICB1ID0gcHJlZGVjZXNzb3JzW3VdO1xuICAgIH1cbiAgICBub2Rlcy5yZXZlcnNlKCk7XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9LFxuXG4gIGZpbmRfcGF0aDogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcbiAgICB2YXIgcHJlZGVjZXNzb3JzID0gZGlqa3N0cmEuc2luZ2xlX3NvdXJjZV9zaG9ydGVzdF9wYXRocyhncmFwaCwgcywgZCk7XG4gICAgcmV0dXJuIGRpamtzdHJhLmV4dHJhY3Rfc2hvcnRlc3RfcGF0aF9mcm9tX3ByZWRlY2Vzc29yX2xpc3QoXG4gICAgICBwcmVkZWNlc3NvcnMsIGQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBIHZlcnkgbmFpdmUgcHJpb3JpdHkgcXVldWUgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBQcmlvcml0eVF1ZXVlOiB7XG4gICAgbWFrZTogZnVuY3Rpb24gKG9wdHMpIHtcbiAgICAgIHZhciBUID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZSxcbiAgICAgICAgICB0ID0ge30sXG4gICAgICAgICAga2V5O1xuICAgICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgICBmb3IgKGtleSBpbiBUKSB7XG4gICAgICAgIGlmIChULmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICB0W2tleV0gPSBUW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHQucXVldWUgPSBbXTtcbiAgICAgIHQuc29ydGVyID0gb3B0cy5zb3J0ZXIgfHwgVC5kZWZhdWx0X3NvcnRlcjtcbiAgICAgIHJldHVybiB0O1xuICAgIH0sXG5cbiAgICBkZWZhdWx0X3NvcnRlcjogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvc3QgLSBiLmNvc3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBpdGVtIHRvIHRoZSBxdWV1ZSBhbmQgZW5zdXJlIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnRcbiAgICAgKiBpcyBhdCB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlLlxuICAgICAqL1xuICAgIHB1c2g6IGZ1bmN0aW9uICh2YWx1ZSwgY29zdCkge1xuICAgICAgdmFyIGl0ZW0gPSB7dmFsdWU6IHZhbHVlLCBjb3N0OiBjb3N0fTtcbiAgICAgIHRoaXMucXVldWUucHVzaChpdGVtKTtcbiAgICAgIHRoaXMucXVldWUuc29ydCh0aGlzLnNvcnRlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IGluIHRoZSBxdWV1ZS5cbiAgICAgKi9cbiAgICBwb3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgfSxcblxuICAgIGVtcHR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGggPT09IDA7XG4gICAgfVxuICB9XG59O1xuXG5cbi8vIG5vZGUuanMgbW9kdWxlIGV4cG9ydHNcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGRpamtzdHJhO1xufVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLmR1cnJ1dGkgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogRHVycnV0aVxuICAgKiBVdGlscy5cbiAgICovXG5cbiAgZnVuY3Rpb24gaGFzV2luZG93KCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIHZhciBpc0NsaWVudCA9IGhhc1dpbmRvdygpO1xuXG4gIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9XG5cbiAgLy8gb25lLWxldmVsIG9iamVjdCBleHRlbmRcblxuXG4gIHZhciBEVVJSVVRJX0RFQlVHID0gdHJ1ZTtcblxuICBmdW5jdGlvbiB3YXJuKCkge1xuICAgIGlmIChEVVJSVVRJX0RFQlVHID09PSB0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICAvKiBEdXJydXRpXG4gICAqIENhcHR1cmUgYW5kIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gICAqL1xuXG4gIHZhciBfcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKCkge307XG5cbiAgLy8gY2FwdHVyZSBhbGwgbGlzdGVuZXJzXG4gIHZhciBldmVudHMgPSBbXTtcbiAgdmFyIGRvbUV2ZW50VHlwZXMgPSBbXTtcblxuICBmdW5jdGlvbiBnZXREb21FdmVudFR5cGVzKCkge1xuICAgIHZhciBldmVudFR5cGVzID0gW107XG4gICAgZm9yICh2YXIgYXR0ciBpbiBkb2N1bWVudCkge1xuICAgICAgLy8gc3RhcnRzIHdpdGggb25cbiAgICAgIGlmIChhdHRyLnN1YnN0cigwLCAyKSA9PT0gJ29uJykge1xuICAgICAgICBldmVudFR5cGVzLnB1c2goYXR0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2ZW50VHlwZXM7XG4gIH1cblxuICB2YXIgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyO1xuXG4gIGZ1bmN0aW9uIGNhcHR1cmVBZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlKSB7XG4gICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBldmVudHMucHVzaCh7XG4gICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZm46IGZuLFxuICAgICAgY2FwdHVyZTogY2FwdHVyZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTm9kZUV2ZW50cygkbm9kZSkge1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgZXZlbnRzLmxlbmd0aCkge1xuICAgICAgaWYgKGV2ZW50c1tpXS50YXJnZXQgPT09ICRub2RlKSB7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgICAkbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXS50eXBlLCBldmVudHNbaV0uZm4sIGV2ZW50c1tpXS5jYXB0dXJlKTtcblxuICAgICAgICAvLyByZW1vdmUgZXZlbnRcbiAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuXG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIG9uKiBsaXN0ZW5lcnNcbiAgICBkb21FdmVudFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50VHlwZSkge1xuICAgICAgJG5vZGVbZXZlbnRUeXBlXSA9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoaXNDbGllbnQpIHtcbiAgICBkb21FdmVudFR5cGVzID0gZ2V0RG9tRXZlbnRUeXBlcygpO1xuXG4gICAgLy8gY2FwdHVyZSBhZGRFdmVudExpc3RlbmVyXG5cbiAgICAvLyBJRVxuICAgIGlmICh3aW5kb3cuTm9kZS5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2FkZEV2ZW50TGlzdGVuZXInKSkge1xuICAgICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyID0gd2luZG93Lk5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICB3aW5kb3cuTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGNhcHR1cmVBZGRFdmVudExpc3RlbmVyO1xuICAgIH0gZWxzZSBpZiAod2luZG93LkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnYWRkRXZlbnRMaXN0ZW5lcicpKSB7XG4gICAgICAvLyBzdGFuZGFyZFxuICAgICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyID0gd2luZG93LkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgd2luZG93LkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gY2FwdHVyZUFkZEV2ZW50TGlzdGVuZXI7XG4gICAgfVxuXG4gICAgLy8gdHJhdmVyc2UgYW5kIHJlbW92ZSBhbGwgZXZlbnRzIGxpc3RlbmVycyBmcm9tIG5vZGVzXG4gICAgX3JlbW92ZUxpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygkbm9kZSwgdHJhdmVyc2UpIHtcbiAgICAgIHJlbW92ZU5vZGVFdmVudHMoJG5vZGUpO1xuXG4gICAgICAvLyB0cmF2ZXJzZSBlbGVtZW50IGNoaWxkcmVuXG4gICAgICBpZiAodHJhdmVyc2UgJiYgJG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIF9yZW1vdmVMaXN0ZW5lcnMoJG5vZGUuY2hpbGRyZW5baV0sIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHZhciByZW1vdmVMaXN0ZW5lcnMkMSA9IF9yZW1vdmVMaXN0ZW5lcnM7XG5cbiAgLyogRHVycnV0aVxuICAgKiBET00gcGF0Y2ggLSBtb3JwaHMgYSBET00gbm9kZSBpbnRvIGFub3RoZXIuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHRyYXZlcnNlKCRub2RlLCAkbmV3Tm9kZSwgcGF0Y2hlcykge1xuICAgIC8vIHRyYXZlcnNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkaWZmKCRub2RlLmNoaWxkTm9kZXNbaV0sICRuZXdOb2RlLmNoaWxkTm9kZXNbaV0sIHBhdGNoZXMpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1hcEF0dHJpYnV0ZXMoJG5vZGUsICRuZXdOb2RlKSB7XG4gICAgdmFyIGF0dHJzID0ge307XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzWyRub2RlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSBudWxsO1xuICAgIH1cblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCAkbmV3Tm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgX2krKykge1xuICAgICAgYXR0cnNbJG5ld05vZGUuYXR0cmlidXRlc1tfaV0ubmFtZV0gPSAkbmV3Tm9kZS5hdHRyaWJ1dGVzW19pXS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaEF0dHJzKCRub2RlLCAkbmV3Tm9kZSkge1xuICAgIC8vIG1hcCBhdHRyaWJ1dGVzXG4gICAgdmFyIGF0dHJzID0gbWFwQXR0cmlidXRlcygkbm9kZSwgJG5ld05vZGUpO1xuXG4gICAgLy8gYWRkLWNoYW5nZSBhdHRyaWJ1dGVzXG4gICAgZm9yICh2YXIgcHJvcCBpbiBhdHRycykge1xuICAgICAgaWYgKGF0dHJzW3Byb3BdID09PSBudWxsKSB7XG4gICAgICAgICRub2RlLnJlbW92ZUF0dHJpYnV0ZShwcm9wKTtcblxuICAgICAgICAvLyBjaGVja2VkIG5lZWRzIGV4dHJhIHdvcmtcbiAgICAgICAgaWYgKHByb3AgPT09ICdjaGVja2VkJykge1xuICAgICAgICAgICRub2RlLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJG5vZGUuc2V0QXR0cmlidXRlKHByb3AsIGF0dHJzW3Byb3BdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkaWZmKCRub2RlLCAkbmV3Tm9kZSkge1xuICAgIHZhciBwYXRjaGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBbXTtcblxuICAgIHZhciBwYXRjaCA9IHtcbiAgICAgIG5vZGU6ICRub2RlLFxuICAgICAgbmV3Tm9kZTogJG5ld05vZGVcbiAgICB9O1xuXG4gICAgLy8gcHVzaCB0cmF2ZXJzZWQgbm9kZSB0byBwYXRjaCBsaXN0XG4gICAgcGF0Y2hlcy5wdXNoKHBhdGNoKTtcblxuICAgIC8vIGZhc3RlciB0aGFuIG91dGVyaHRtbFxuICAgIGlmICgkbm9kZS5pc0VxdWFsTm9kZSgkbmV3Tm9kZSkpIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnMgb24gbm9kZSBhbmQgY2hpbGRyZW5cbiAgICAgIHJlbW92ZUxpc3RlbmVycyQxKCRub2RlLCB0cnVlKTtcblxuICAgICAgcmV0dXJuIHBhdGNoZXM7XG4gICAgfVxuXG4gICAgLy8gaWYgb25lIG9mIHRoZW0gaXMgbm90IGFuIGVsZW1lbnQgbm9kZSxcbiAgICAvLyBvciB0aGUgdGFnIGNoYW5nZWQsXG4gICAgLy8gb3Igbm90IHRoZSBzYW1lIG51bWJlciBvZiBjaGlsZHJlbi5cbiAgICBpZiAoJG5vZGUubm9kZVR5cGUgIT09IDEgfHwgJG5ld05vZGUubm9kZVR5cGUgIT09IDEgfHwgJG5vZGUudGFnTmFtZSAhPT0gJG5ld05vZGUudGFnTmFtZSB8fCAkbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCAhPT0gJG5ld05vZGUuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHBhdGNoLnJlcGxhY2UgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRjaC51cGRhdGUgPSB0cnVlO1xuXG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIG9uIG5vZGVcbiAgICAgIHJlbW92ZUxpc3RlbmVycyQxKCRub2RlKTtcblxuICAgICAgLy8gdHJhdmVyc2UgY2hpbGROb2Rlc1xuICAgICAgdHJhdmVyc2UoJG5vZGUsICRuZXdOb2RlLCBwYXRjaGVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0Y2hlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGx5UGF0Y2gocGF0Y2gpIHtcbiAgICBpZiAocGF0Y2gucmVwbGFjZSkge1xuICAgICAgcGF0Y2gubm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwYXRjaC5uZXdOb2RlLCBwYXRjaC5ub2RlKTtcbiAgICB9IGVsc2UgaWYgKHBhdGNoLnVwZGF0ZSkge1xuICAgICAgcGF0Y2hBdHRycyhwYXRjaC5ub2RlLCBwYXRjaC5uZXdOb2RlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaChwYXRjaGVzKSB7XG4gICAgcGF0Y2hlcy5mb3JFYWNoKGFwcGx5UGF0Y2gpO1xuXG4gICAgcmV0dXJuIHBhdGNoZXM7XG4gIH1cblxuICB2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9IDogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gIH07XG5cblxuXG5cblxuICB2YXIgY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICAgIH07XG4gIH0oKTtcblxuXG5cblxuXG5cblxuICB2YXIgZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gICAgfVxuICB9O1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiAgdmFyIHNldCA9IGZ1bmN0aW9uIHNldChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgc2V0KHBhcmVudCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgICBkZXNjLnZhbHVlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgICAgaWYgKHNldHRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNldHRlci5jYWxsKHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qIER1cnJ1dGlcbiAgICogTWljcm8gSXNvbW9ycGhpYyBKYXZhU2NyaXB0IGxpYnJhcnkgZm9yIGJ1aWxkaW5nIHVzZXIgaW50ZXJmYWNlcy5cbiAgICovXG5cbiAgdmFyIGR1cnJ1dGlBdHRyID0gJ2RhdGEtZHVycnV0aS1pZCc7XG4gIHZhciBkdXJydXRpRWxlbVNlbGVjdG9yID0gJ1snICsgZHVycnV0aUF0dHIgKyAnXSc7XG4gIHZhciBjb21wb25lbnRDYWNoZSA9IFtdO1xuICB2YXIgY29tcG9uZW50SW5kZXggPSAwO1xuXG4gIC8vIGRlY29yYXRlIGEgYmFzaWMgY2xhc3Mgd2l0aCBkdXJydXRpIHNwZWNpZmljIHByb3BlcnRpZXNcbiAgZnVuY3Rpb24gZGVjb3JhdGUoQ29tcCkge1xuICAgIHZhciBjb21wb25lbnQ7XG5cbiAgICAvLyBpbnN0YW50aWF0ZSBjbGFzc2VzXG4gICAgaWYgKHR5cGVvZiBDb21wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnQgPSBuZXcgQ29tcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgY2hhbmdlIHRoZSBpZCBvbiBhIGNhY2hlZCBjb21wb25lbnRcbiAgICAgIGNvbXBvbmVudCA9IE9iamVjdC5jcmVhdGUoQ29tcCk7XG4gICAgfVxuXG4gICAgLy8gY29tcG9uZW50cyBnZXQgYSBuZXcgaWQgb24gcmVuZGVyLFxuICAgIC8vIHNvIHdlIGNhbiBjbGVhciB0aGUgcHJldmlvdXMgY29tcG9uZW50IGNhY2hlLlxuICAgIGNvbXBvbmVudC5fZHVycnV0aUlkID0gU3RyaW5nKGNvbXBvbmVudEluZGV4KyspO1xuXG4gICAgLy8gY2FjaGUgY29tcG9uZW50XG4gICAgY29tcG9uZW50Q2FjaGUucHVzaCh7XG4gICAgICBpZDogY29tcG9uZW50Ll9kdXJydXRpSWQsXG4gICAgICBjb21wb25lbnQ6IGNvbXBvbmVudFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENhY2hlZENvbXBvbmVudCgkbm9kZSkge1xuICAgIC8vIGdldCB0aGUgY29tcG9uZW50IGZyb20gdGhlIGRvbSBub2RlIC0gcmVuZGVyZWQgaW4gYnJvd3Nlci5cbiAgICBpZiAoJG5vZGUuX2R1cnJ1dGkpIHtcbiAgICAgIHJldHVybiAkbm9kZS5fZHVycnV0aTtcbiAgICB9XG5cbiAgICAvLyBvciBnZXQgaXQgZnJvbSB0aGUgY29tcG9uZW50IGNhY2hlIC0gcmVuZGVyZWQgb24gdGhlIHNlcnZlci5cbiAgICB2YXIgaWQgPSAkbm9kZS5nZXRBdHRyaWJ1dGUoZHVycnV0aUF0dHIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50Q2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjb21wb25lbnRDYWNoZVtpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudENhY2hlW2ldLmNvbXBvbmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgY3VzdG9tIGRhdGEgYXR0cmlidXRlcyxcbiAgLy8gYW5kIGNhY2hlIHRoZSBjb21wb25lbnQgb24gdGhlIERPTSBub2RlLlxuICBmdW5jdGlvbiBjbGVhbkF0dHJOb2RlcygkY29udGFpbmVyLCBpbmNsdWRlUGFyZW50KSB7XG4gICAgdmFyIG5vZGVzID0gW10uc2xpY2UuY2FsbCgkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoZHVycnV0aUVsZW1TZWxlY3RvcikpO1xuXG4gICAgaWYgKGluY2x1ZGVQYXJlbnQpIHtcbiAgICAgIG5vZGVzLnB1c2goJGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoJG5vZGUpIHtcbiAgICAgIC8vIGNhY2hlIGNvbXBvbmVudCBpbiBub2RlXG4gICAgICAkbm9kZS5fZHVycnV0aSA9IGdldENhY2hlZENvbXBvbmVudCgkbm9kZSk7XG5cbiAgICAgIC8vIGNsZWFuLXVwIGRhdGEgYXR0cmlidXRlc1xuICAgICAgJG5vZGUucmVtb3ZlQXR0cmlidXRlKGR1cnJ1dGlBdHRyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIHVubW91bnROb2RlKCRub2RlKSB7XG4gICAgdmFyIGNhY2hlZENvbXBvbmVudCA9IGdldENhY2hlZENvbXBvbmVudCgkbm9kZSk7XG5cbiAgICBpZiAoY2FjaGVkQ29tcG9uZW50LnVubW91bnQpIHtcbiAgICAgIGNhY2hlZENvbXBvbmVudC51bm1vdW50KCRub2RlKTtcbiAgICB9XG5cbiAgICAvLyBjbGVhciB0aGUgY29tcG9uZW50IGZyb20gdGhlIGNhY2hlXG4gICAgY2xlYXJDb21wb25lbnRDYWNoZShjYWNoZWRDb21wb25lbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW91bnROb2RlKCRub2RlKSB7XG4gICAgdmFyIGNhY2hlZENvbXBvbmVudCA9IGdldENhY2hlZENvbXBvbmVudCgkbm9kZSk7XG5cbiAgICBpZiAoY2FjaGVkQ29tcG9uZW50Lm1vdW50KSB7XG4gICAgICBjYWNoZWRDb21wb25lbnQubW91bnQoJG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyQ29tcG9uZW50Q2FjaGUoY29tcG9uZW50KSB7XG4gICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRDYWNoZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY29tcG9uZW50Q2FjaGVbaV0uaWQgPT09IGNvbXBvbmVudC5fZHVycnV0aUlkKSB7XG4gICAgICAgICAgY29tcG9uZW50Q2FjaGUuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjbGVhciB0aGUgZW50aXJlIGNvbXBvbmVudCBjYWNoZVxuICAgICAgY29tcG9uZW50SW5kZXggPSAwO1xuICAgICAgY29tcG9uZW50Q2FjaGUubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVGcmFnbWVudCgpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuXG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS50cmltKCk7XG4gICAgdmFyIHBhcmVudCA9ICdkaXYnO1xuICAgIHZhciAkbm9kZTtcblxuICAgIGlmICh0ZW1wbGF0ZS5pbmRleE9mKCc8dHInKSA9PT0gMCkge1xuICAgICAgLy8gdGFibGUgcm93XG4gICAgICBwYXJlbnQgPSAndGJvZHknO1xuICAgIH0gZWxzZSBpZiAodGVtcGxhdGUuaW5kZXhPZignPHRkJykgPT09IDApIHtcbiAgICAgIC8vIHRhYmxlIGNvbHVtblxuICAgICAgcGFyZW50ID0gJ3RyJztcbiAgICB9XG5cbiAgICAkbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50KTtcbiAgICAkbm9kZS5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcblxuICAgIGlmICgkbm9kZS5jaGlsZHJlbi5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IHRlbXBsYXRlIG11c3QgaGF2ZSBhIHNpbmdsZSBwYXJlbnQgbm9kZS4nLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRub2RlLmZpcnN0RWxlbWVudENoaWxkO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ29tcG9uZW50SWQodGVtcGxhdGUsIGNvbXBvbmVudCkge1xuICAgIC8vIG5haXZlIGltcGxlbWVudGF0aW9uIG9mIGFkZGluZyBhbiBhdHRyaWJ1dGUgdG8gdGhlIHBhcmVudCBjb250YWluZXIuXG4gICAgLy8gc28gd2UgZG9uJ3QgZGVwZW5kIG9uIGEgZG9tIHBhcnNlci5cbiAgICAvLyBkb3duc2lkZSBpcyB3ZSBjYW4ndCB3YXJuIHRoYXQgdGVtcGxhdGUgTVVTVCBoYXZlIGEgc2luZ2xlIHBhcmVudCAoaW4gTm9kZS5qcykuXG5cbiAgICAvLyBjaGVjayB2b2lkIGVsZW1lbnRzIGZpcnN0LlxuICAgIHZhciBmaXJzdEJyYWNrZXRJbmRleCA9IHRlbXBsYXRlLmluZGV4T2YoJy8+Jyk7XG5cbiAgICAvLyBub24tdm9pZCBlbGVtZW50c1xuICAgIGlmIChmaXJzdEJyYWNrZXRJbmRleCA9PT0gLTEpIHtcbiAgICAgIGZpcnN0QnJhY2tldEluZGV4ID0gdGVtcGxhdGUuaW5kZXhPZignPicpO1xuICAgIH1cblxuICAgIHZhciBhdHRyID0gJyAnICsgZHVycnV0aUF0dHIgKyAnPVwiJyArIGNvbXBvbmVudC5fZHVycnV0aUlkICsgJ1wiJztcblxuICAgIHJldHVybiB0ZW1wbGF0ZS5zdWJzdHIoMCwgZmlyc3RCcmFja2V0SW5kZXgpICsgYXR0ciArIHRlbXBsYXRlLnN1YnN0cihmaXJzdEJyYWNrZXRJbmRleCk7XG4gIH1cblxuICAvLyB0cmF2ZXJzZSBhbmQgZmluZCBkdXJydXRpIG5vZGVzXG4gIGZ1bmN0aW9uIGdldENvbXBvbmVudE5vZGVzKCRjb250YWluZXIpIHtcbiAgICB2YXIgYXJyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBbXTtcblxuICAgIGlmICgkY29udGFpbmVyLl9kdXJydXRpKSB7XG4gICAgICBhcnIucHVzaCgkY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICBpZiAoJGNvbnRhaW5lci5jaGlsZHJlbikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGdldENvbXBvbmVudE5vZGVzKCRjb250YWluZXIuY2hpbGRyZW5baV0sIGFycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIHZhciBEdXJydXRpID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIER1cnJ1dGkoKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBEdXJydXRpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhEdXJydXRpLCBbe1xuICAgICAga2V5OiAnc2VydmVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXJ2ZXIoKSB7XG4gICAgICAgIGNsZWFyQ29tcG9uZW50Q2FjaGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcihjb21wb25lbnQsICRjb250YWluZXIpIHtcbiAgICAgICAgLy8gZGVjb3JhdGUgYmFzaWMgY2xhc3NlcyB3aXRoIGR1cnJ1dGkgcHJvcGVydGllc1xuICAgICAgICB2YXIgZHVycnV0aUNvbXBvbmVudCA9IGRlY29yYXRlKGNvbXBvbmVudCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkdXJydXRpQ29tcG9uZW50LnJlbmRlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudHMgbXVzdCBoYXZlIGEgcmVuZGVyKCkgbWV0aG9kLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZHVycnV0aUNvbXBvbmVudC5yZW5kZXIoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudEh0bWwgPSBhZGRDb21wb25lbnRJZCh0ZW1wbGF0ZSwgZHVycnV0aUNvbXBvbmVudCk7XG5cbiAgICAgICAgLy8gbW91bnQgYW5kIHVubW91bnQgaW4gYnJvd3Nlciwgd2hlbiB3ZSBzcGVjaWZ5IGEgY29udGFpbmVyLlxuICAgICAgICBpZiAoaXNDbGllbnQgJiYgJGNvbnRhaW5lcikge1xuICAgICAgICAgIHZhciAkbmV3Q29tcG9uZW50O1xuICAgICAgICAgIHZhciBwYXRjaGVzO1xuXG4gICAgICAgICAgdmFyIF9yZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgY29udGFpbmVyIGlzIHN0aWxsIGluIHRoZSBET00uXG4gICAgICAgICAgICAvLyB3aGVuIHJ1bm5pbmcgbXVsdGlwbGUgcGFyYWxsZWwgcmVuZGVyJ3MsIHRoZSBjb250YWluZXJcbiAgICAgICAgICAgIC8vIGlzIHJlbW92ZWQgYnkgdGhlIHByZXZpb3VzIHJlbmRlciwgYnV0IHRoZSByZWZlcmVuY2Ugc3RpbGwgaW4gbWVtb3J5LlxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKCRjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgIC8vIHdhcm4gZm9yIHBlcmZvcm1hbmNlLlxuICAgICAgICAgICAgICB3YXJuKCdOb2RlJywgJGNvbnRhaW5lciwgJ2lzIG5vIGxvbmdlciBpbiB0aGUgRE9NLiBcXG5JdCB3YXMgcHJvYmFibHkgcmVtb3ZlZCBieSBhIHBhcmVudCBjb21wb25lbnQuJyk7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdjogdm9pZCAwXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21wb25lbnROb2RlcyA9IFtdO1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgdGVtcGxhdGUgc3RyaW5nIHRvIGEgZG9tIG5vZGVcbiAgICAgICAgICAgICRuZXdDb21wb25lbnQgPSBjcmVhdGVGcmFnbWVudChjb21wb25lbnRIdG1sKTtcblxuICAgICAgICAgICAgLy8gdW5tb3VudCBjb21wb25lbnQgYW5kIHN1Yi1jb21wb25lbnRzXG5cbiAgICAgICAgICAgIGdldENvbXBvbmVudE5vZGVzKCRjb250YWluZXIpLmZvckVhY2godW5tb3VudE5vZGUpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgY29udGFpbmVyIGlzIGEgZHVycnV0aSBlbGVtZW50LFxuICAgICAgICAgICAgLy8gdW5tb3VudCBpdCBhbmQgaXQncyBjaGlsZHJlbiBhbmQgcmVwbGFjZSB0aGUgbm9kZS5cbiAgICAgICAgICAgIGlmIChnZXRDYWNoZWRDb21wb25lbnQoJGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBkYXRhIGF0dHJpYnV0ZXMgb24gdGhlIG5ldyBub2RlLFxuICAgICAgICAgICAgICAvLyBiZWZvcmUgcGF0Y2gsXG4gICAgICAgICAgICAgIC8vIGFuZCBnZXQgdGhlIGxpc3Qgb2YgbmV3IGNvbXBvbmVudHMuXG4gICAgICAgICAgICAgIGNsZWFuQXR0ck5vZGVzKCRuZXdDb21wb25lbnQsIHRydWUpO1xuXG4gICAgICAgICAgICAgIC8vIGdldCByZXF1aXJlZCBkb20gcGF0Y2hlc1xuICAgICAgICAgICAgICBwYXRjaGVzID0gZGlmZigkY29udGFpbmVyLCAkbmV3Q29tcG9uZW50KTtcblxuXG4gICAgICAgICAgICAgIHBhdGNoZXMuZm9yRWFjaChmdW5jdGlvbiAocGF0Y2gkJDEpIHtcbiAgICAgICAgICAgICAgICAvLyBhbHdheXMgdXBkYXRlIGNvbXBvbmVudCBpbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgLy8gZXZlbiBpZiB0aGUgZG9tIGRvZXNuJ3QgY2hhbmdlLlxuICAgICAgICAgICAgICAgIHBhdGNoJCQxLm5vZGUuX2R1cnJ1dGkgPSBwYXRjaCQkMS5uZXdOb2RlLl9kdXJydXRpO1xuXG4gICAgICAgICAgICAgICAgLy8gcGF0Y2hlcyBjb250YWluIGFsbCB0aGUgdHJhdmVyc2VkIG5vZGVzLlxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbW91bnQgY29tcG9uZW50cyBoZXJlLCBmb3IgcGVyZm9ybWFuY2UuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGNoJCQxLm5vZGUuX2R1cnJ1dGkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwYXRjaCQkMS5yZXBsYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzLnB1c2gocGF0Y2gkJDEubmV3Tm9kZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGNoJCQxLnVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2Rlcy5wdXNoKHBhdGNoJCQxLm5vZGUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm9kZSBpcyB0aGUgc2FtZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHdlIG5lZWQgdG8gbW91bnQgc3ViLWNvbXBvbmVudHMuXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGNvbXBvbmVudE5vZGVzLCBnZXRDb21wb25lbnROb2RlcyhwYXRjaCQkMS5ub2RlKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAvLyBtb3JwaCBvbGQgZG9tIG5vZGUgaW50byBuZXcgb25lXG4gICAgICAgICAgICAgIHBhdGNoKHBhdGNoZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaWYgdGhlIGNvbXBvbmVudCBpcyBub3QgYSBkdXJydXRpIGVsZW1lbnQsXG4gICAgICAgICAgICAgIC8vIGluc2VydCB0aGUgdGVtcGxhdGUgd2l0aCBpbm5lckhUTUwuXG5cbiAgICAgICAgICAgICAgLy8gb25seSBpZiB0aGUgc2FtZSBodG1sIGlzIG5vdCBhbHJlYWR5IHJlbmRlcmVkXG4gICAgICAgICAgICAgIGlmICghJGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZCB8fCAhJGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZC5pc0VxdWFsTm9kZSgkbmV3Q29tcG9uZW50KSkge1xuICAgICAgICAgICAgICAgICRjb250YWluZXIuaW5uZXJIVE1MID0gY29tcG9uZW50SHRtbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzID0gY2xlYW5BdHRyTm9kZXMoJGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1vdW50IG5ld2x5IGFkZGVkIGNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzLmZvckVhY2gobW91bnROb2RlKTtcbiAgICAgICAgICB9KCk7XG5cbiAgICAgICAgICBpZiAoKHR5cGVvZiBfcmV0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihfcmV0KSkgPT09IFwib2JqZWN0XCIpIHJldHVybiBfcmV0LnY7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcG9uZW50SHRtbDtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIER1cnJ1dGk7XG4gIH0oKTtcblxuICB2YXIgZHVycnV0aSA9IG5ldyBEdXJydXRpKCk7XG5cbiAgcmV0dXJuIGR1cnJ1dGk7XG5cbn0pKSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWR1cnJ1dGkuanMubWFwIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLmR1cnJ1dGkgPSBnbG9iYWwuZHVycnV0aSB8fCB7fSwgZ2xvYmFsLmR1cnJ1dGkuU3RvcmUgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogRHVycnV0aVxuICAgKiBVdGlscy5cbiAgICovXG5cbiAgZnVuY3Rpb24gaGFzV2luZG93KCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIHZhciBpc0NsaWVudCA9IGhhc1dpbmRvdygpO1xuXG4gIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9XG5cbiAgLy8gb25lLWxldmVsIG9iamVjdCBleHRlbmRcbiAgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBvYmogPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIHZhciBkZWZhdWx0cyA9IGFyZ3VtZW50c1sxXTtcblxuICAgIC8vIGNsb25lIG9iamVjdFxuICAgIHZhciBleHRlbmRlZCA9IGNsb25lKG9iaik7XG5cbiAgICAvLyBjb3B5IGRlZmF1bHQga2V5cyB3aGVyZSB1bmRlZmluZWRcbiAgICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIGV4dGVuZGVkW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGV4dGVuZGVkW2tleV0gPSBkZWZhdWx0c1trZXldO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV4dGVuZGVkO1xuICB9XG5cbiAgdmFyIERVUlJVVElfREVCVUcgPSB0cnVlO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogRGF0YSBzdG9yZSB3aXRoIGNoYW5nZSBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFN0b3JlKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBoaXN0b3J5U3VwcG9ydCA9IGZhbHNlO1xuICAgIC8vIGhpc3RvcnkgaXMgYWN0aXZlIG9ubHkgaW4gdGhlIGJyb3dzZXIsIGJ5IGRlZmF1bHRcbiAgICBpZiAoaXNDbGllbnQpIHtcbiAgICAgIGhpc3RvcnlTdXBwb3J0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgaGlzdG9yeTogaGlzdG9yeVN1cHBvcnRcbiAgICB9KTtcblxuICAgIHRoaXMuZXZlbnRzID0ge1xuICAgICAgY2hhbmdlOiBbXVxuICAgIH07XG5cbiAgICB0aGlzLmRhdGEgPSBbXTtcbiAgfVxuXG4gIFN0b3JlLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKHRvcGljKSB7XG4gICAgdGhpcy5ldmVudHNbdG9waWNdID0gdGhpcy5ldmVudHNbdG9waWNdIHx8IFtdO1xuXG4gICAgLy8gaW1tdXRhYmxlLlxuICAgIC8vIHNvIG9uL29mZiBkb24ndCBjaGFuZ2UgdGhlIGFycmF5IGR1cnJpbmcgdHJpZ2dlci5cbiAgICB2YXIgZm91bmRFdmVudHMgPSB0aGlzLmV2ZW50c1t0b3BpY10uc2xpY2UoKTtcbiAgICBmb3VuZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgZXZlbnQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAodG9waWMsIGZ1bmMpIHtcbiAgICB0aGlzLmV2ZW50c1t0b3BpY10gPSB0aGlzLmV2ZW50c1t0b3BpY10gfHwgW107XG4gICAgdGhpcy5ldmVudHNbdG9waWNdLnB1c2goZnVuYyk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uICh0b3BpYywgZm4pIHtcbiAgICB0aGlzLmV2ZW50c1t0b3BpY10gPSB0aGlzLmV2ZW50c1t0b3BpY10gfHwgW107XG5cbiAgICAvLyBmaW5kIHRoZSBmbiBpbiB0aGUgYXJyXG4gICAgdmFyIGluZGV4ID0gW10uaW5kZXhPZi5jYWxsKHRoaXMuZXZlbnRzW3RvcGljXSwgZm4pO1xuXG4gICAgLy8gd2UgZGlkbid0IGZpbmQgaXQgaW4gdGhlIGFycmF5XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzW3RvcGljXS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5kYXRhW3RoaXMuZGF0YS5sZW5ndGggLSAxXTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xvbmUodmFsdWUpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjbG9uZSh0aGlzLmRhdGEpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhpc3RvcnkpIHtcbiAgICAgIHRoaXMuZGF0YS5wdXNoKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kYXRhID0gW3ZhbHVlXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScpO1xuXG4gICAgcmV0dXJuIHRoaXMuZ2V0KCk7XG4gIH07XG5cbiAgcmV0dXJuIFN0b3JlO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9yZS5qcy5tYXAiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwuSm90dGVkID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIHV0aWxcbiAgICovXG5cbiAgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBvYmogPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIHZhciBkZWZhdWx0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICB2YXIgZXh0ZW5kZWQgPSB7fTtcbiAgICAvLyBjbG9uZSBvYmplY3RcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgZXh0ZW5kZWRba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuXG4gICAgLy8gY29weSBkZWZhdWx0IGtleXMgd2hlcmUgdW5kZWZpbmVkXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBleHRlbmRlZFtrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBleHRlbmRlZFtrZXldID0gb2JqW2tleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleHRlbmRlZFtrZXldID0gZGVmYXVsdHNba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBleHRlbmRlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZldGNoKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG5cbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKHVybCwgeGhyKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH07XG5cbiAgICB4aHIuc2VuZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcnVuQ2FsbGJhY2soaW5kZXgsIHBhcmFtcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgfVxuXG4gICAgICBpbmRleCsrO1xuICAgICAgaWYgKGluZGV4IDwgYXJyLmxlbmd0aCkge1xuICAgICAgICBzZXFSdW5uZXIoaW5kZXgsIHJlcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9ycywgcmVzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxUnVubmVyKGluZGV4LCBwYXJhbXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjaykge1xuICAgIC8vIGFzeW5jXG4gICAgYXJyW2luZGV4XShwYXJhbXMsIHJ1bkNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxKGFyciwgcGFyYW1zKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmdW5jdGlvbiAoKSB7fTtcblxuICAgIHZhciBlcnJvcnMgPSBbXTtcblxuICAgIGlmICghYXJyLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9ycywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBzZXFSdW5uZXIoMCwgcGFyYW1zLCBhcnIsIGVycm9ycywgY2FsbGJhY2spO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2UoZm4sIGRlbGF5KSB7XG4gICAgdmFyIGNvb2xkb3duID0gbnVsbDtcbiAgICB2YXIgbXVsdGlwbGUgPSBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgIF9hcmd1bWVudHMgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmIChjb29sZG93bikge1xuICAgICAgICBtdWx0aXBsZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICBjbGVhclRpbWVvdXQoY29vbGRvd24pO1xuXG4gICAgICBjb29sZG93biA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgICAgICBmbi5hcHBseShfdGhpcywgX2FyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb29sZG93biA9IG51bGw7XG4gICAgICAgIG11bHRpcGxlID0gbnVsbDtcbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgaWYgKCFub2RlLmNsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgdGVtcENsYXNzID0gJyAnICsgbm9kZS5jbGFzc05hbWUgKyAnICc7XG4gICAgY2xhc3NOYW1lID0gJyAnICsgY2xhc3NOYW1lICsgJyAnO1xuXG4gICAgaWYgKHRlbXBDbGFzcy5pbmRleE9mKGNsYXNzTmFtZSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpIHtcbiAgICAvLyBjbGFzcyBpcyBhbHJlYWR5IGFkZGVkXG4gICAgaWYgKGhhc0NsYXNzKG5vZGUsIGNsYXNzTmFtZSkpIHtcbiAgICAgIHJldHVybiBub2RlLmNsYXNzTmFtZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5jbGFzc05hbWUpIHtcbiAgICAgIGNsYXNzTmFtZSA9ICcgJyArIGNsYXNzTmFtZTtcbiAgICB9XG5cbiAgICBub2RlLmNsYXNzTmFtZSArPSBjbGFzc05hbWU7XG5cbiAgICByZXR1cm4gbm9kZS5jbGFzc05hbWU7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpIHtcbiAgICB2YXIgc3BhY2VCZWZvcmUgPSAnICcgKyBjbGFzc05hbWU7XG4gICAgdmFyIHNwYWNlQWZ0ZXIgPSBjbGFzc05hbWUgKyAnICc7XG5cbiAgICBpZiAobm9kZS5jbGFzc05hbWUuaW5kZXhPZihzcGFjZUJlZm9yZSkgIT09IC0xKSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnJlcGxhY2Uoc3BhY2VCZWZvcmUsICcnKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUuY2xhc3NOYW1lLmluZGV4T2Yoc3BhY2VBZnRlcikgIT09IC0xKSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnJlcGxhY2Uoc3BhY2VBZnRlciwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnJlcGxhY2UoY2xhc3NOYW1lLCAnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lO1xuICB9XG5cbiAgZnVuY3Rpb24gZGF0YShub2RlLCBhdHRyKSB7XG4gICAgcmV0dXJuIG5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBhdHRyKTtcbiAgfVxuXG4gIC8vIG1vZGUgZGV0ZWN0aW9uIGJhc2VkIG9uIGNvbnRlbnQgdHlwZSBhbmQgZmlsZSBleHRlbnNpb25cbiAgdmFyIGRlZmF1bHRNb2RlbWFwID0ge1xuICAgICdodG1sJzogJ2h0bWwnLFxuICAgICdjc3MnOiAnY3NzJyxcbiAgICAnanMnOiAnamF2YXNjcmlwdCcsXG4gICAgJ2xlc3MnOiAnbGVzcycsXG4gICAgJ3N0eWwnOiAnc3R5bHVzJyxcbiAgICAnY29mZmVlJzogJ2NvZmZlZXNjcmlwdCdcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRNb2RlKCkge1xuICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgICB2YXIgZmlsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG4gICAgdmFyIGN1c3RvbU1vZGVtYXAgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gICAgdmFyIG1vZGVtYXAgPSBleHRlbmQoY3VzdG9tTW9kZW1hcCwgZGVmYXVsdE1vZGVtYXApO1xuXG4gICAgLy8gdHJ5IHRoZSBmaWxlIGV4dGVuc2lvblxuICAgIGZvciAodmFyIGtleSBpbiBtb2RlbWFwKSB7XG4gICAgICB2YXIga2V5TGVuZ3RoID0ga2V5Lmxlbmd0aDtcbiAgICAgIGlmIChmaWxlLnNsaWNlKC1rZXlMZW5ndGgrKykgPT09ICcuJyArIGtleSkge1xuICAgICAgICByZXR1cm4gbW9kZW1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRyeSB0aGUgZmlsZSB0eXBlIChodG1sL2Nzcy9qcylcbiAgICBmb3IgKHZhciBfa2V5IGluIG1vZGVtYXApIHtcbiAgICAgIGlmICh0eXBlID09PSBfa2V5KSB7XG4gICAgICAgIHJldHVybiBtb2RlbWFwW19rZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0eXBlO1xuICB9XG5cbiAgLyogdGVtcGxhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY29udGFpbmVyKCkge1xuICAgIHJldHVybiAnXFxuICAgIDx1bCBjbGFzcz1cImpvdHRlZC1uYXZcIj5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLXJlc3VsdFwiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwicmVzdWx0XCI+XFxuICAgICAgICAgIFJlc3VsdFxcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1odG1sXCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJodG1sXCI+XFxuICAgICAgICAgIEhUTUxcXG4gICAgICAgIDwvYT5cXG4gICAgICA8L2xpPlxcbiAgICAgIDxsaSBjbGFzcz1cImpvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0tY3NzXCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJjc3NcIj5cXG4gICAgICAgICAgQ1NTXFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLWpzXCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJqc1wiPlxcbiAgICAgICAgICBKYXZhU2NyaXB0XFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgPC91bD5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLXJlc3VsdFwiPjxpZnJhbWU+PC9pZnJhbWU+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1odG1sXCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1jc3NcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLWpzXCI+PC9kaXY+XFxuICAnO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFuZUFjdGl2ZUNsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1wYW5lLWFjdGl2ZS0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnRhaW5lckNsYXNzKCkge1xuICAgIHJldHVybiAnam90dGVkJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc0ZpbGVDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtaGFzLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gZWRpdG9yQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLWVkaXRvciBqb3R0ZWQtZWRpdG9yLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gZWRpdG9yQ29udGVudCh0eXBlKSB7XG4gICAgdmFyIGZpbGVVcmwgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuXG4gICAgcmV0dXJuICdcXG4gICAgPHRleHRhcmVhIGRhdGEtam90dGVkLXR5cGU9XCInICsgdHlwZSArICdcIiBkYXRhLWpvdHRlZC1maWxlPVwiJyArIGZpbGVVcmwgKyAnXCI+PC90ZXh0YXJlYT5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1zdGF0dXNcIj48L2Rpdj5cXG4gICc7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNNZXNzYWdlKGVycikge1xuICAgIHJldHVybiAnXFxuICAgIDxwPicgKyBlcnIgKyAnPC9wPlxcbiAgJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c0NsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1zdGF0dXMtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNBY3RpdmVDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtc3RhdHVzLWFjdGl2ZS0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsdWdpbkNsYXNzKG5hbWUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1wbHVnaW4tJyArIG5hbWU7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNMb2FkaW5nKHVybCkge1xuICAgIHJldHVybiAnTG9hZGluZyA8c3Ryb25nPicgKyB1cmwgKyAnPC9zdHJvbmc+Li4nO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzRmV0Y2hFcnJvcih1cmwpIHtcbiAgICByZXR1cm4gJ1RoZXJlIHdhcyBhbiBlcnJvciBsb2FkaW5nIDxzdHJvbmc+JyArIHVybCArICc8L3N0cm9uZz4uJztcbiAgfVxuXG4gIHZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gIH0gOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gIH07XG5cblxuXG5cblxuICB2YXIgYXN5bmNHZW5lcmF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXdhaXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIEFzeW5jR2VuZXJhdG9yKGdlbikge1xuICAgICAgdmFyIGZyb250LCBiYWNrO1xuXG4gICAgICBmdW5jdGlvbiBzZW5kKGtleSwgYXJnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgIGFyZzogYXJnLFxuICAgICAgICAgICAgcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICAgIHJlamVjdDogcmVqZWN0LFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoYmFjaykge1xuICAgICAgICAgICAgYmFjayA9IGJhY2submV4dCA9IHJlcXVlc3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyb250ID0gYmFjayA9IHJlcXVlc3Q7XG4gICAgICAgICAgICByZXN1bWUoa2V5LCBhcmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlc3VtZShrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBnZW5ba2V5XShhcmcpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEF3YWl0VmFsdWUpIHtcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZS52YWx1ZSkudGhlbihmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICAgIHJlc3VtZShcIm5leHRcIiwgYXJnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgICAgcmVzdW1lKFwidGhyb3dcIiwgYXJnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXR0bGUocmVzdWx0LmRvbmUgPyBcInJldHVyblwiIDogXCJub3JtYWxcIiwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHNldHRsZShcInRocm93XCIsIGVycik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0dGxlKHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJyZXR1cm5cIjpcbiAgICAgICAgICAgIGZyb250LnJlc29sdmUoe1xuICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgIGRvbmU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwidGhyb3dcIjpcbiAgICAgICAgICAgIGZyb250LnJlamVjdCh2YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBmcm9udC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICBkb25lOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb250ID0gZnJvbnQubmV4dDtcblxuICAgICAgICBpZiAoZnJvbnQpIHtcbiAgICAgICAgICByZXN1bWUoZnJvbnQua2V5LCBmcm9udC5hcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhY2sgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ludm9rZSA9IHNlbmQ7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2VuLnJldHVybiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucmV0dXJuID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHtcbiAgICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoXCJuZXh0XCIsIGFyZyk7XG4gICAgfTtcblxuICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZS50aHJvdyA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoXCJ0aHJvd1wiLCBhcmcpO1xuICAgIH07XG5cbiAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUucmV0dXJuID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShcInJldHVyblwiLCBhcmcpO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgd3JhcDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBBc3luY0dlbmVyYXRvcihmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBhd2FpdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXdhaXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSgpO1xuXG5cblxuXG5cbiAgdmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICAgIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgICB9O1xuICB9KCk7XG5cblxuXG5cblxuXG5cbiAgdmFyIGdldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIHZhciBzZXQgPSBmdW5jdGlvbiBzZXQob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MgJiYgZGVzYy53cml0YWJsZSkge1xuICAgICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2V0dGVyID0gZGVzYy5zZXQ7XG5cbiAgICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXR0ZXIuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKiBwbHVnaW5cbiAgICovXG5cbiAgdmFyIHBsdWdpbnMgPSBbXTtcblxuICBmdW5jdGlvbiBmaW5kJDEoaWQpIHtcbiAgICBmb3IgKHZhciBwbHVnaW5JbmRleCBpbiBwbHVnaW5zKSB7XG4gICAgICB2YXIgcGx1Z2luID0gcGx1Z2luc1twbHVnaW5JbmRleF07XG4gICAgICBpZiAocGx1Z2luLl9pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjYW4ndCBmaW5kIHBsdWdpblxuICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBpZCArICcgaXMgbm90IHJlZ2lzdGVyZWQuJyk7XG4gIH1cblxuICBmdW5jdGlvbiByZWdpc3RlcihpZCwgcGx1Z2luKSB7XG4gICAgLy8gcHJpdmF0ZSBwcm9wZXJ0aWVzXG4gICAgcGx1Z2luLl9pZCA9IGlkO1xuICAgIHBsdWdpbnMucHVzaChwbHVnaW4pO1xuICB9XG5cbiAgLy8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGVhY2ggcGx1Z2luLCBvbiB0aGUgam90dGVkIGluc3RhbmNlXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX2dldCgnb3B0aW9ucycpLnBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICAvLyBjaGVjayBpZiBwbHVnaW4gZGVmaW5pdGlvbiBpcyBzdHJpbmcgb3Igb2JqZWN0XG4gICAgICB2YXIgUGx1Z2luID0gdm9pZCAwO1xuICAgICAgdmFyIHBsdWdpbk5hbWUgPSB2b2lkIDA7XG4gICAgICB2YXIgcGx1Z2luT3B0aW9ucyA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBwbHVnaW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdpbk5hbWUgPSBwbHVnaW47XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2YgcGx1Z2luID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihwbHVnaW4pKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGx1Z2luTmFtZSA9IHBsdWdpbi5uYW1lO1xuICAgICAgICBwbHVnaW5PcHRpb25zID0gcGx1Z2luLm9wdGlvbnMgfHwge307XG4gICAgICB9XG5cbiAgICAgIFBsdWdpbiA9IGZpbmQkMShwbHVnaW5OYW1lKTtcbiAgICAgIF90aGlzLl9nZXQoJ3BsdWdpbnMnKVtwbHVnaW5dID0gbmV3IFBsdWdpbihfdGhpcywgcGx1Z2luT3B0aW9ucyk7XG5cbiAgICAgIGFkZENsYXNzKF90aGlzLl9nZXQoJyRjb250YWluZXInKSwgcGx1Z2luQ2xhc3MocGx1Z2luTmFtZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogcHVic291cFxuICAgKi9cblxuICB2YXIgUHViU291cCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQdWJTb3VwKCkge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUHViU291cCk7XG5cbiAgICAgIHRoaXMudG9waWNzID0ge307XG4gICAgICB0aGlzLmNhbGxiYWNrcyA9IHt9O1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFB1YlNvdXAsIFt7XG4gICAgICBrZXk6ICdmaW5kJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmaW5kKHF1ZXJ5KSB7XG4gICAgICAgIHRoaXMudG9waWNzW3F1ZXJ5XSA9IHRoaXMudG9waWNzW3F1ZXJ5XSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9waWNzW3F1ZXJ5XTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzdWJzY3JpYmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1YnNjcmliZSh0b3BpYywgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgcHJpb3JpdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDkwO1xuXG4gICAgICAgIHZhciBmb3VuZFRvcGljID0gdGhpcy5maW5kKHRvcGljKTtcbiAgICAgICAgc3Vic2NyaWJlci5fcHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgZm91bmRUb3BpYy5wdXNoKHN1YnNjcmliZXIpO1xuXG4gICAgICAgIC8vIHNvcnQgc3Vic2NyaWJlcnMgb24gcHJpb3JpdHlcbiAgICAgICAgZm91bmRUb3BpYy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuX3ByaW9yaXR5ID4gYi5fcHJpb3JpdHkgPyAxIDogYi5fcHJpb3JpdHkgPiBhLl9wcmlvcml0eSA/IC0xIDogMDtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlbW92ZXMgYSBmdW5jdGlvbiBmcm9tIGFuIGFycmF5XG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW1vdmVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVyKGFyciwgZm4pIHtcbiAgICAgICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIGlmIG5vIGZuIGlzIHNwZWNpZmllZFxuICAgICAgICAgIC8vIGNsZWFuLXVwIHRoZSBhcnJheVxuICAgICAgICAgIGlmICghZm4pIHtcbiAgICAgICAgICAgIGFyci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGZpbmQgdGhlIGZuIGluIHRoZSBhcnJcbiAgICAgICAgICB2YXIgaW5kZXggPSBbXS5pbmRleE9mLmNhbGwoYXJyLCBmbik7XG5cbiAgICAgICAgICAvLyB3ZSBkaWRuJ3QgZmluZCBpdCBpbiB0aGUgYXJyYXlcbiAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3Vuc3Vic2NyaWJlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB1bnN1YnNjcmliZSh0b3BpYywgc3Vic2NyaWJlcikge1xuICAgICAgICAvLyByZW1vdmUgZnJvbSBzdWJzY3JpYmVyc1xuICAgICAgICB2YXIgZm91bmRUb3BpYyA9IHRoaXMuZmluZCh0b3BpYyk7XG4gICAgICAgIHRoaXMucmVtb3Zlcihmb3VuZFRvcGljLCBzdWJzY3JpYmVyKTtcblxuICAgICAgICAvLyByZW1vdmUgZnJvbSBjYWxsYmFja3NcbiAgICAgICAgdGhpcy5jYWxsYmFja3NbdG9waWNdID0gdGhpcy5jYWxsYmFja3NbdG9waWNdIHx8IFtdO1xuICAgICAgICB0aGlzLnJlbW92ZXIodGhpcy5jYWxsYmFja3NbdG9waWNdLCBzdWJzY3JpYmVyKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2VxdWVudGlhbGx5IHJ1bnMgYSBtZXRob2Qgb24gYWxsIHBsdWdpbnNcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3B1Ymxpc2gnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHB1Ymxpc2godG9waWMpIHtcbiAgICAgICAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICAgICAgdmFyIGZvdW5kVG9waWMgPSB0aGlzLmZpbmQodG9waWMpO1xuICAgICAgICB2YXIgcnVuTGlzdCA9IFtdO1xuXG4gICAgICAgIGZvdW5kVG9waWMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICAgIHJ1bkxpc3QucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VxKHJ1bkxpc3QsIHBhcmFtcywgdGhpcy5ydW5DYWxsYmFja3ModG9waWMpKTtcbiAgICAgIH1cblxuICAgICAgLy8gcGFyYWxsZWwgcnVuIGFsbCAuZG9uZSBjYWxsYmFja3NcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3J1bkNhbGxiYWNrcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcnVuQ2FsbGJhY2tzKHRvcGljKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlcnIsIHBhcmFtcykge1xuICAgICAgICAgIF90aGlzLmNhbGxiYWNrc1t0b3BpY10gPSBfdGhpcy5jYWxsYmFja3NbdG9waWNdIHx8IFtdO1xuXG4gICAgICAgICAgX3RoaXMuY2FsbGJhY2tzW3RvcGljXS5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gYXR0YWNoIGEgY2FsbGJhY2sgd2hlbiBhIHB1Ymxpc2hbdG9waWNdIGlzIGRvbmVcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2RvbmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRvbmUodG9waWMpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICB0aGlzLmNhbGxiYWNrc1t0b3BpY10gPSB0aGlzLmNhbGxiYWNrc1t0b3BpY10gfHwgW107XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3RvcGljXS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFB1YlNvdXA7XG4gIH0oKTtcblxuICAvKiByZW5kZXIgcGx1Z2luXG4gICAqIHJlbmRlcnMgdGhlIGlmcmFtZVxuICAgKi9cblxuICB2YXIgUGx1Z2luUmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblJlbmRlcihqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpblJlbmRlcik7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBpZnJhbWUgc3JjZG9jIHN1cHBvcnRcbiAgICAgIHZhciBzdXBwb3J0U3JjZG9jID0gISEoJ3NyY2RvYycgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJykpO1xuICAgICAgdmFyICRyZXN1bHRGcmFtZSA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS1yZXN1bHQgaWZyYW1lJyk7XG5cbiAgICAgIHZhciBmcmFtZUNvbnRlbnQgPSAnJztcblxuICAgICAgLy8gY2FjaGVkIGNvbnRlbnRcbiAgICAgIHZhciBjb250ZW50ID0ge1xuICAgICAgICBodG1sOiAnJyxcbiAgICAgICAgY3NzOiAnJyxcbiAgICAgICAganM6ICcnXG4gICAgICB9O1xuXG4gICAgICAvLyBjYXRjaCBkb21yZWFkeSBldmVudHMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZG9tcmVhZHkuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIHJlbmRlciBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCAxMDApO1xuXG4gICAgICAvLyBwdWJsaWNcbiAgICAgIHRoaXMuc3VwcG9ydFNyY2RvYyA9IHN1cHBvcnRTcmNkb2M7XG4gICAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgdGhpcy5mcmFtZUNvbnRlbnQgPSBmcmFtZUNvbnRlbnQ7XG4gICAgICB0aGlzLiRyZXN1bHRGcmFtZSA9ICRyZXN1bHRGcmFtZTtcblxuICAgICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICAgIHRoaXMuaW5kZXggPSAwO1xuXG4gICAgICB0aGlzLmxhc3RDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblJlbmRlciwgW3tcbiAgICAgIGtleTogJ3RlbXBsYXRlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgICAgICAgdmFyIGJvZHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgICAgICB2YXIgc2NyaXB0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAnJztcblxuICAgICAgICByZXR1cm4gJ1xcbiAgICAgIDwhZG9jdHlwZSBodG1sPlxcbiAgICAgIDxodG1sPlxcbiAgICAgICAgPGhlYWQ+XFxuICAgICAgICAgIDxzY3JpcHQ+XFxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcXG4gICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxcJ0RPTUNvbnRlbnRMb2FkZWRcXCcsIGZ1bmN0aW9uICgpIHtcXG4gICAgICAgICAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeSh7XFxuICAgICAgICAgICAgICAgICAgdHlwZTogXFwnam90dGVkLWRvbS1yZWFkeVxcJ1xcbiAgICAgICAgICAgICAgICB9KSwgXFwnKlxcJylcXG4gICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgfSgpKVxcbiAgICAgICAgICA8L3NjcmlwdD5cXG5cXG4gICAgICAgICAgPHN0eWxlPicgKyBzdHlsZSArICc8L3N0eWxlPlxcbiAgICAgICAgPC9oZWFkPlxcbiAgICAgICAgPGJvZHk+XFxuICAgICAgICAgICcgKyBib2R5ICsgJ1xcblxcbiAgICAgICAgICA8IS0tXFxuICAgICAgICAgICAgSm90dGVkOlxcbiAgICAgICAgICAgIEVtcHR5IHNjcmlwdCB0YWcgcHJldmVudHMgbWFsZm9ybWVkIEhUTUwgZnJvbSBicmVha2luZyB0aGUgbmV4dCBzY3JpcHQuXFxuICAgICAgICAgIC0tPlxcbiAgICAgICAgICA8c2NyaXB0Pjwvc2NyaXB0PlxcbiAgICAgICAgICA8c2NyaXB0PicgKyBzY3JpcHQgKyAnPC9zY3JpcHQ+XFxuICAgICAgICA8L2JvZHk+XFxuICAgICAgPC9odG1sPlxcbiAgICAnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAvLyBjYWNoZSBtYW5pcHVsYXRlZCBjb250ZW50XG4gICAgICAgIHRoaXMuY29udGVudFtwYXJhbXMudHlwZV0gPSBwYXJhbXMuY29udGVudDtcblxuICAgICAgICAvLyBjaGVjayBleGlzdGluZyBhbmQgdG8tYmUtcmVuZGVyZWQgY29udGVudFxuICAgICAgICB2YXIgb2xkRnJhbWVDb250ZW50ID0gdGhpcy5mcmFtZUNvbnRlbnQ7XG4gICAgICAgIHRoaXMuZnJhbWVDb250ZW50ID0gdGhpcy50ZW1wbGF0ZSh0aGlzLmNvbnRlbnRbJ2NzcyddLCB0aGlzLmNvbnRlbnRbJ2h0bWwnXSwgdGhpcy5jb250ZW50WydqcyddKTtcblxuICAgICAgICAvLyBjYWNoZSB0aGUgY3VycmVudCBjYWxsYmFjayBhcyBnbG9iYWwsXG4gICAgICAgIC8vIHNvIHdlIGNhbiBjYWxsIGl0IGZyb20gdGhlIG1lc3NhZ2UgY2FsbGJhY2suXG4gICAgICAgIHRoaXMubGFzdENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLmxhc3RDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBkb24ndCByZW5kZXIgaWYgcHJldmlvdXMgYW5kIG5ldyBmcmFtZSBjb250ZW50IGFyZSB0aGUgc2FtZS5cbiAgICAgICAgLy8gbW9zdGx5IGZvciB0aGUgYHBsYXlgIHBsdWdpbixcbiAgICAgICAgLy8gc28gd2UgZG9uJ3QgcmUtcmVuZGVyIHRoZSBzYW1lIGNvbnRlbnQgb24gZWFjaCBjaGFuZ2UuXG4gICAgICAgIC8vIHVubGVzcyB3ZSBzZXQgZm9yY2VSZW5kZXIuXG4gICAgICAgIGlmIChwYXJhbXMuZm9yY2VSZW5kZXIgIT09IHRydWUgJiYgdGhpcy5mcmFtZUNvbnRlbnQgPT09IG9sZEZyYW1lQ29udGVudCkge1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3VwcG9ydFNyY2RvYykge1xuICAgICAgICAgIC8vIHNyY2RvYyBpbiB1bnJlbGlhYmxlIGluIENocm9tZS5cbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZ2hpbmRhL2pvdHRlZC9pc3N1ZXMvMjNcblxuICAgICAgICAgIC8vIHJlLWNyZWF0ZSB0aGUgaWZyYW1lIG9uIGVhY2ggY2hhbmdlLFxuICAgICAgICAgIC8vIHRvIGRpc2NhcmQgdGhlIHByZXZpb3VzbHkgbG9hZGVkIHNjcmlwdHMuXG4gICAgICAgICAgdmFyICRuZXdSZXN1bHRGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKCRuZXdSZXN1bHRGcmFtZSwgdGhpcy4kcmVzdWx0RnJhbWUpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lID0gJG5ld1Jlc3VsdEZyYW1lO1xuXG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5vcGVuKCk7XG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC53cml0ZSh0aGlzLmZyYW1lQ29udGVudCk7XG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5jbG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG9sZGVyIGJyb3dzZXJzIHdpdGhvdXQgaWZyYW1lIHNyY3NldCBzdXBwb3J0IChJRTkpLlxuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1zcmNkb2MnLCB0aGlzLmZyYW1lQ29udGVudCk7XG5cbiAgICAgICAgICAvLyB0aXBzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2p1Z2dsaW5taWtlL3NyY2RvYy1wb2x5ZmlsbFxuICAgICAgICAgIC8vIENvcHlyaWdodCAoYykgMjAxMiBNaWtlIFBlbm5pc2lcbiAgICAgICAgICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gICAgICAgICAgdmFyIGpzVXJsID0gJ2phdmFzY3JpcHQ6d2luZG93LmZyYW1lRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNyY2RvY1wiKTsnO1xuXG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuc2V0QXR0cmlidXRlKCdzcmMnLCBqc1VybCk7XG5cbiAgICAgICAgICAvLyBFeHBsaWNpdGx5IHNldCB0aGUgaUZyYW1lJ3Mgd2luZG93LmxvY2F0aW9uIGZvclxuICAgICAgICAgIC8vIGNvbXBhdGliaWxpdHkgd2l0aCBJRTksIHdoaWNoIGRvZXMgbm90IHJlYWN0IHRvIGNoYW5nZXMgaW5cbiAgICAgICAgICAvLyB0aGUgYHNyY2AgYXR0cmlidXRlIHdoZW4gaXQgaXMgYSBgamF2YXNjcmlwdDpgIFVSTC5cbiAgICAgICAgICBpZiAodGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbiA9IGpzVXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2RvbXJlYWR5JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkb21yZWFkeShlKSB7XG4gICAgICAgIC8vIG9ubHkgY2F0Y2ggbWVzc2FnZXMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICAgIGlmIChlLnNvdXJjZSAhPT0gdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhJCQxID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSQkMSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICBpZiAoZGF0YSQkMS50eXBlID09PSAnam90dGVkLWRvbS1yZWFkeScpIHtcbiAgICAgICAgICB0aGlzLmxhc3RDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5SZW5kZXI7XG4gIH0oKTtcblxuICAvKiBzY3JpcHRsZXNzIHBsdWdpblxuICAgKiByZW1vdmVzIHNjcmlwdCB0YWdzIGZyb20gaHRtbCBjb250ZW50XG4gICAqL1xuXG4gIHZhciBQbHVnaW5TY3JpcHRsZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblNjcmlwdGxlc3Moam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5TY3JpcHRsZXNzKTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3NjcmlwdGluZy5odG1sXG4gICAgICB2YXIgcnVuU2NyaXB0VHlwZXMgPSBbJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnLCAnYXBwbGljYXRpb24vZWNtYXNjcmlwdCcsICdhcHBsaWNhdGlvbi94LWVjbWFzY3JpcHQnLCAnYXBwbGljYXRpb24veC1qYXZhc2NyaXB0JywgJ3RleHQvZWNtYXNjcmlwdCcsICd0ZXh0L2phdmFzY3JpcHQnLCAndGV4dC9qYXZhc2NyaXB0MS4wJywgJ3RleHQvamF2YXNjcmlwdDEuMScsICd0ZXh0L2phdmFzY3JpcHQxLjInLCAndGV4dC9qYXZhc2NyaXB0MS4zJywgJ3RleHQvamF2YXNjcmlwdDEuNCcsICd0ZXh0L2phdmFzY3JpcHQxLjUnLCAndGV4dC9qc2NyaXB0JywgJ3RleHQvbGl2ZXNjcmlwdCcsICd0ZXh0L3gtZWNtYXNjcmlwdCcsICd0ZXh0L3gtamF2YXNjcmlwdCddO1xuXG4gICAgICAvLyByZW1vdmUgc2NyaXB0IHRhZ3Mgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIHB1YmxpY1xuICAgICAgdGhpcy5ydW5TY3JpcHRUeXBlcyA9IHJ1blNjcmlwdFR5cGVzO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblNjcmlwdGxlc3MsIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2h0bWwnKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgSUU5IHN1cHBvcnQsIHJlbW92ZSB0aGUgc2NyaXB0IHRhZ3MgZnJvbSBIVE1MIGNvbnRlbnQuXG4gICAgICAgIC8vIHdoZW4gd2Ugc3RvcCBzdXBwb3J0aW5nIElFOSwgd2UgY2FuIHVzZSB0aGUgc2FuZGJveCBhdHRyaWJ1dGUuXG4gICAgICAgIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBmcmFnbWVudC5pbm5lckhUTUwgPSBwYXJhbXMuY29udGVudDtcblxuICAgICAgICB2YXIgdHlwZUF0dHIgPSBudWxsO1xuXG4gICAgICAgIC8vIHJlbW92ZSBhbGwgc2NyaXB0IHRhZ3NcbiAgICAgICAgdmFyICRzY3JpcHRzID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0Jyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0eXBlQXR0ciA9ICRzY3JpcHRzW2ldLmdldEF0dHJpYnV0ZSgndHlwZScpO1xuXG4gICAgICAgICAgLy8gb25seSByZW1vdmUgc2NyaXB0IHRhZ3Mgd2l0aG91dCB0aGUgdHlwZSBhdHRyaWJ1dGVcbiAgICAgICAgICAvLyBvciB3aXRoIGEgamF2YXNjcmlwdCBtaW1lIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgICAgICAvLyB0aGUgb25lcyB0aGF0IGFyZSBydW4gYnkgdGhlIGJyb3dzZXIuXG4gICAgICAgICAgaWYgKCF0eXBlQXR0ciB8fCB0aGlzLnJ1blNjcmlwdFR5cGVzLmluZGV4T2YodHlwZUF0dHIpICE9PSAtMSkge1xuICAgICAgICAgICAgJHNjcmlwdHNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCgkc2NyaXB0c1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSBmcmFnbWVudC5pbm5lckhUTUw7XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpblNjcmlwdGxlc3M7XG4gIH0oKTtcblxuICAvKiBhY2UgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5BY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQWNlKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQWNlKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMTtcbiAgICAgIHZhciBpO1xuXG4gICAgICB0aGlzLmVkaXRvciA9IHt9O1xuICAgICAgdGhpcy5qb3R0ZWQgPSBqb3R0ZWQ7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBBY2UgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5hY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyICRlZGl0b3JzID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmpvdHRlZC1lZGl0b3InKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8ICRlZGl0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciAkdGV4dGFyZWEgPSAkZWRpdG9yc1tpXS5xdWVyeVNlbGVjdG9yKCd0ZXh0YXJlYScpO1xuICAgICAgICB2YXIgdHlwZSA9IGRhdGEoJHRleHRhcmVhLCAnam90dGVkLXR5cGUnKTtcbiAgICAgICAgdmFyIGZpbGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC1maWxlJyk7XG5cbiAgICAgICAgdmFyICRhY2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJGVkaXRvcnNbaV0uYXBwZW5kQ2hpbGQoJGFjZUNvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5lZGl0b3JbdHlwZV0gPSB3aW5kb3cuYWNlLmVkaXQoJGFjZUNvbnRhaW5lcik7XG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmVkaXRvclt0eXBlXTtcblxuICAgICAgICB2YXIgZWRpdG9yT3B0aW9ucyA9IGV4dGVuZChvcHRpb25zKTtcblxuICAgICAgICBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoJ2FjZS9tb2RlLycgKyBnZXRNb2RlKHR5cGUsIGZpbGUpKTtcbiAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuXG4gICAgICAgIGVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgIH1cblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQWNlLCBbe1xuICAgICAga2V5OiAnZWRpdG9yQ2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlZGl0b3JDaGFuZ2UocGFyYW1zKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5qb3R0ZWQudHJpZ2dlcignY2hhbmdlJywgcGFyYW1zKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmVkaXRvcltwYXJhbXMudHlwZV07XG5cbiAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBzdGFydGVkIGJ5IHRoZSBhY2UgY2hhbmdlLlxuICAgICAgICAvLyB0cmlnZ2VyZWQgb25seSBvbmNlIHBlciBlZGl0b3IsXG4gICAgICAgIC8vIHdoZW4gdGhlIHRleHRhcmVhIGlzIHBvcHVsYXRlZC9maWxlIGlzIGxvYWRlZC5cbiAgICAgICAgaWYgKCFwYXJhbXMuYWNlRWRpdG9yKSB7XG4gICAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRWYWx1ZShwYXJhbXMuY29udGVudCk7XG5cbiAgICAgICAgICAvLyBhdHRhY2ggdGhlIGV2ZW50IG9ubHkgYWZ0ZXIgdGhlIGZpbGUgaXMgbG9hZGVkXG4gICAgICAgICAgcGFyYW1zLmFjZUVkaXRvciA9IGVkaXRvcjtcbiAgICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIHRoaXMuZWRpdG9yQ2hhbmdlKHBhcmFtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFuaXB1bGF0ZSB0aGUgcGFyYW1zIGFuZCBwYXNzIHRoZW0gb25cbiAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkFjZTtcbiAgfSgpO1xuXG4gIC8qIGNvcmVtaXJyb3IgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5Db2RlTWlycm9yID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkNvZGVNaXJyb3Ioam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5Db2RlTWlycm9yKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMTtcbiAgICAgIHZhciBpO1xuXG4gICAgICB0aGlzLmVkaXRvciA9IHt9O1xuICAgICAgdGhpcy5qb3R0ZWQgPSBqb3R0ZWQ7XG5cbiAgICAgIC8vIGN1c3RvbSBtb2RlbWFwIGZvciBjb2RlbWlycm9yXG4gICAgICB2YXIgbW9kZW1hcCA9IHtcbiAgICAgICAgJ2h0bWwnOiAnaHRtbG1peGVkJ1xuICAgICAgfTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgQ29kZU1pcnJvciBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LkNvZGVNaXJyb3IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyICRlZGl0b3JzID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmpvdHRlZC1lZGl0b3InKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8ICRlZGl0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciAkdGV4dGFyZWEgPSAkZWRpdG9yc1tpXS5xdWVyeVNlbGVjdG9yKCd0ZXh0YXJlYScpO1xuICAgICAgICB2YXIgdHlwZSA9IGRhdGEoJHRleHRhcmVhLCAnam90dGVkLXR5cGUnKTtcbiAgICAgICAgdmFyIGZpbGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC1maWxlJyk7XG5cbiAgICAgICAgdGhpcy5lZGl0b3JbdHlwZV0gPSB3aW5kb3cuQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoJHRleHRhcmVhLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lZGl0b3JbdHlwZV0uc2V0T3B0aW9uKCdtb2RlJywgZ2V0TW9kZSh0eXBlLCBmaWxlLCBtb2RlbWFwKSk7XG4gICAgICB9XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkNvZGVNaXJyb3IsIFt7XG4gICAgICBrZXk6ICdlZGl0b3JDaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRvckNoYW5nZShwYXJhbXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIHRyaWdnZXIgYSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICBfdGhpcy5qb3R0ZWQudHJpZ2dlcignY2hhbmdlJywgcGFyYW1zKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmVkaXRvcltwYXJhbXMudHlwZV07XG5cbiAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBzdGFydGVkIGJ5IHRoZSBjb2RlbWlycm9yIGNoYW5nZS5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIG9ubHkgb25jZSBwZXIgZWRpdG9yLFxuICAgICAgICAvLyB3aGVuIHRoZSB0ZXh0YXJlYSBpcyBwb3B1bGF0ZWQvZmlsZSBpcyBsb2FkZWQuXG4gICAgICAgIGlmICghcGFyYW1zLmNtRWRpdG9yKSB7XG4gICAgICAgICAgZWRpdG9yLnNldFZhbHVlKHBhcmFtcy5jb250ZW50KTtcblxuICAgICAgICAgIC8vIGF0dGFjaCB0aGUgZXZlbnQgb25seSBhZnRlciB0aGUgZmlsZSBpcyBsb2FkZWRcbiAgICAgICAgICBwYXJhbXMuY21FZGl0b3IgPSBlZGl0b3I7XG4gICAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCB0aGlzLmVkaXRvckNoYW5nZShwYXJhbXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hbmlwdWxhdGUgdGhlIHBhcmFtcyBhbmQgcGFzcyB0aGVtIG9uXG4gICAgICAgIHBhcmFtcy5jb250ZW50ID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5Db2RlTWlycm9yO1xuICB9KCk7XG5cbiAgLyogbGVzcyBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkxlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luTGVzcyhqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkxlc3MpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGxlc3MgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5sZXNzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBDU1MgbGluayBsYWJlbCB0byBMZXNzXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJjc3NcIl0nKS5pbm5lckhUTUwgPSAnTGVzcyc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkxlc3MsIFt7XG4gICAgICBrZXk6ICdpc0xlc3MnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzTGVzcyhwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnY3NzJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMuZmlsZS5pbmRleE9mKCcubGVzcycpICE9PSAtMSB8fCBwYXJhbXMuZmlsZSA9PT0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIC5sZXNzIGFuZCBibGFuayBmaWxlc1xuICAgICAgICBpZiAodGhpcy5pc0xlc3MocGFyYW1zKSkge1xuICAgICAgICAgIHdpbmRvdy5sZXNzLnJlbmRlcihwYXJhbXMuY29udGVudCwgdGhpcy5vcHRpb25zLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGNvbnRlbnQgd2l0aCB0aGUgcGFyc2VkIGxlc3NcbiAgICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSByZXMuY3NzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkxlc3M7XG4gIH0oKTtcblxuICAvKiBjb2ZmZWVzY3JpcHQgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5Db2ZmZWVTY3JpcHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQ29mZmVlU2NyaXB0KGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQ29mZmVlU2NyaXB0KTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBjb2ZmZWVzY3JpcHQgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5Db2ZmZWVTY3JpcHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIEpTIGxpbmsgbGFiZWwgdG8gTGVzc1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwianNcIl0nKS5pbm5lckhUTUwgPSAnQ29mZmVlU2NyaXB0JztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQ29mZmVlU2NyaXB0LCBbe1xuICAgICAga2V5OiAnaXNDb2ZmZWUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzQ29mZmVlKHBhcmFtcykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdqcycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zLmZpbGUuaW5kZXhPZignLmNvZmZlZScpICE9PSAtMSB8fCBwYXJhbXMuZmlsZSA9PT0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIC5sZXNzIGFuZCBibGFuayBmaWxlc1xuICAgICAgICBpZiAodGhpcy5pc0NvZmZlZShwYXJhbXMpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gd2luZG93LkNvZmZlZVNjcmlwdC5jb21waWxlKHBhcmFtcy5jb250ZW50KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkNvZmZlZVNjcmlwdDtcbiAgfSgpO1xuXG4gIC8qIHN0eWx1cyBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpblN0eWx1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5TdHlsdXMoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5TdHlsdXMpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIHN0eWx1cyBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LnN0eWx1cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGFuZ2UgQ1NTIGxpbmsgbGFiZWwgdG8gU3R5bHVzXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJjc3NcIl0nKS5pbm5lckhUTUwgPSAnU3R5bHVzJztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luU3R5bHVzLCBbe1xuICAgICAga2V5OiAnaXNTdHlsdXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzU3R5bHVzKHBhcmFtcykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdjc3MnKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5maWxlLmluZGV4T2YoJy5zdHlsJykgIT09IC0xIHx8IHBhcmFtcy5maWxlID09PSAnJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UgLnN0eWwgYW5kIGJsYW5rIGZpbGVzXG4gICAgICAgIGlmICh0aGlzLmlzU3R5bHVzKHBhcmFtcykpIHtcbiAgICAgICAgICB3aW5kb3cuc3R5bHVzKHBhcmFtcy5jb250ZW50LCB0aGlzLm9wdGlvbnMpLnJlbmRlcihmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGNvbnRlbnQgd2l0aCB0aGUgcGFyc2VkIGxlc3NcbiAgICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSByZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luU3R5bHVzO1xuICB9KCk7XG5cbiAgLyogYmFiZWwgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5CYWJlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5CYWJlbChqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkJhYmVsKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGJhYmVsIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuQmFiZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIHVzaW5nIGJhYmVsLXN0YW5kYWxvbmVcbiAgICAgICAgdGhpcy5iYWJlbCA9IHdpbmRvdy5CYWJlbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5iYWJlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdXNpbmcgYnJvd3Nlci5qcyBmcm9tIGJhYmVsLWNvcmUgNS54XG4gICAgICAgIHRoaXMuYmFiZWwgPSB7XG4gICAgICAgICAgdHJhbnNmb3JtOiB3aW5kb3cuYmFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIGpzIGxpbmsgbGFiZWxcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImpzXCJdJykuaW5uZXJIVE1MID0gJ0VTMjAxNSc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkJhYmVsLCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIGpzIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnanMnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gdGhpcy5iYWJlbC50cmFuc2Zvcm0ocGFyYW1zLmNvbnRlbnQsIHRoaXMub3B0aW9ucykuY29kZTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5CYWJlbDtcbiAgfSgpO1xuXG4gIC8qIG1hcmtkb3duIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luTWFya2Rvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luTWFya2Rvd24oam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5NYXJrZG93bik7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBtYXJrZWQgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5tYXJrZWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgd2luZG93Lm1hcmtlZC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAvLyBjaGFuZ2UgaHRtbCBsaW5rIGxhYmVsXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJodG1sXCJdJykuaW5uZXJIVE1MID0gJ01hcmtkb3duJztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luTWFya2Rvd24sIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UgaHRtbCBjb250ZW50XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2h0bWwnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gd2luZG93Lm1hcmtlZChwYXJhbXMuY29udGVudCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luTWFya2Rvd247XG4gIH0oKTtcblxuICAvKiBjb25zb2xlIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQ29uc29sZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5Db25zb2xlKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQ29uc29sZSk7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICBhdXRvQ2xlYXI6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMzA7XG4gICAgICB2YXIgaGlzdG9yeSA9IFtdO1xuICAgICAgdmFyIGhpc3RvcnlJbmRleCA9IDA7XG4gICAgICB2YXIgbG9nQ2FwdHVyZVNuaXBwZXQgPSAnKCcgKyB0aGlzLmNhcHR1cmUudG9TdHJpbmcoKSArICcpKCk7JztcbiAgICAgIHZhciBjb250ZW50Q2FjaGUgPSB7XG4gICAgICAgIGh0bWw6ICcnLFxuICAgICAgICBjc3M6ICcnLFxuICAgICAgICBqczogJydcbiAgICAgIH07XG5cbiAgICAgIC8vIG5ldyB0YWIgYW5kIHBhbmUgbWFya3VwXG4gICAgICB2YXIgJG5hdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICBhZGRDbGFzcygkbmF2LCAnam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1jb25zb2xlJyk7XG4gICAgICAkbmF2LmlubmVySFRNTCA9ICc8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJjb25zb2xlXCI+SlMgQ29uc29sZTwvYT4nO1xuXG4gICAgICB2YXIgJHBhbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGFkZENsYXNzKCRwYW5lLCAnam90dGVkLXBhbmUgam90dGVkLXBhbmUtY29uc29sZScpO1xuXG4gICAgICAkcGFuZS5pbm5lckhUTUwgPSAnXFxuICAgICAgPGRpdiBjbGFzcz1cImpvdHRlZC1jb25zb2xlLWNvbnRhaW5lclwiPlxcbiAgICAgICAgPHVsIGNsYXNzPVwiam90dGVkLWNvbnNvbGUtb3V0cHV0XCI+PC91bD5cXG4gICAgICAgIDxmb3JtIGNsYXNzPVwiam90dGVkLWNvbnNvbGUtaW5wdXRcIj5cXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XFxuICAgICAgICA8L2Zvcm0+XFxuICAgICAgPC9kaXY+XFxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImpvdHRlZC1idXR0b24gam90dGVkLWNvbnNvbGUtY2xlYXJcIj5DbGVhcjwvYnV0dG9uPlxcbiAgICAnO1xuXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCgkcGFuZSk7XG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLW5hdicpLmFwcGVuZENoaWxkKCRuYXYpO1xuXG4gICAgICB2YXIgJGNvbnRhaW5lciA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1jb250YWluZXInKTtcbiAgICAgIHZhciAkb3V0cHV0ID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLW91dHB1dCcpO1xuICAgICAgdmFyICRpbnB1dCA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1pbnB1dCBpbnB1dCcpO1xuICAgICAgdmFyICRpbnB1dEZvcm0gPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtaW5wdXQnKTtcbiAgICAgIHZhciAkY2xlYXIgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtY2xlYXInKTtcblxuICAgICAgLy8gc3VibWl0IHRoZSBpbnB1dCBmb3JtXG4gICAgICAkaW5wdXRGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMuc3VibWl0LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjb25zb2xlIGhpc3RvcnlcbiAgICAgICRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oaXN0b3J5LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjbGVhciBidXR0b25cbiAgICAgICRjbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xlYXIuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGNsZWFyIHRoZSBjb25zb2xlIG9uIGVhY2ggY2hhbmdlXG4gICAgICBpZiAob3B0aW9ucy5hdXRvQ2xlYXIgPT09IHRydWUpIHtcbiAgICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmF1dG9DbGVhci5iaW5kKHRoaXMpLCBwcmlvcml0eSAtIDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYXB0dXJlIHRoZSBjb25zb2xlIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcblxuICAgICAgLy8gZ2V0IGxvZyBldmVudHMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZ2V0TWVzc2FnZS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gcGx1Z2luIHB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgICB0aGlzLiRqb3R0ZWRDb250YWluZXIgPSBqb3R0ZWQuJGNvbnRhaW5lcjtcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICRjb250YWluZXI7XG4gICAgICB0aGlzLiRpbnB1dCA9ICRpbnB1dDtcbiAgICAgIHRoaXMuJG91dHB1dCA9ICRvdXRwdXQ7XG4gICAgICB0aGlzLmhpc3RvcnkgPSBoaXN0b3J5O1xuICAgICAgdGhpcy5oaXN0b3J5SW5kZXggPSBoaXN0b3J5SW5kZXg7XG4gICAgICB0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0ID0gbG9nQ2FwdHVyZVNuaXBwZXQ7XG4gICAgICB0aGlzLmNvbnRlbnRDYWNoZSA9IGNvbnRlbnRDYWNoZTtcbiAgICAgIHRoaXMuZ2V0SWZyYW1lID0gdGhpcy5nZXRJZnJhbWUuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5Db25zb2xlLCBbe1xuICAgICAga2V5OiAnZ2V0SWZyYW1lJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJZnJhbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRqb3R0ZWRDb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLXJlc3VsdCBpZnJhbWUnKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdnZXRNZXNzYWdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKGUpIHtcbiAgICAgICAgLy8gb25seSBjYXRjaCBtZXNzYWdlcyBmcm9tIHRoZSBpZnJhbWVcbiAgICAgICAgaWYgKGUuc291cmNlICE9PSB0aGlzLmdldElmcmFtZSgpLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSQkMSA9IHt9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEkJDEgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge31cblxuICAgICAgICBpZiAoZGF0YSQkMS50eXBlID09PSAnam90dGVkLWNvbnNvbGUtbG9nJykge1xuICAgICAgICAgIHRoaXMubG9nKGRhdGEkJDEubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdhdXRvQ2xlYXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGF1dG9DbGVhcihwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzbmlwcGV0bGVzc0NvbnRlbnQgPSBwYXJhbXMuY29udGVudDtcblxuICAgICAgICAvLyByZW1vdmUgdGhlIHNuaXBwZXQgZnJvbSBjYWNoZWQganMgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdqcycpIHtcbiAgICAgICAgICBzbmlwcGV0bGVzc0NvbnRlbnQgPSBzbmlwcGV0bGVzc0NvbnRlbnQucmVwbGFjZSh0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0LCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBQbGF5IHBsdWdpbixcbiAgICAgICAgLy8gY2xlYXIgdGhlIGNvbnNvbGUgb25seSBpZiBzb21ldGhpbmcgaGFzIGNoYW5nZWQgb3IgZm9yY2UgcmVuZGVyaW5nLlxuICAgICAgICBpZiAocGFyYW1zLmZvcmNlUmVuZGVyID09PSB0cnVlIHx8IHRoaXMuY29udGVudENhY2hlW3BhcmFtcy50eXBlXSAhPT0gc25pcHBldGxlc3NDb250ZW50KSB7XG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWx3YXlzIGNhY2hlIHRoZSBsYXRlc3QgY29udGVudFxuICAgICAgICB0aGlzLmNvbnRlbnRDYWNoZVtwYXJhbXMudHlwZV0gPSBzbmlwcGV0bGVzc0NvbnRlbnQ7XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UganMgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdqcycpIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBzbmlwcGV0IGlzIGFscmVhZHkgYWRkZWQuXG4gICAgICAgIC8vIHRoZSBQbGF5IHBsdWdpbiBjYWNoZXMgdGhlIGNoYW5nZWQgcGFyYW1zIGFuZCB0cmlnZ2VycyBjaGFuZ2VcbiAgICAgICAgLy8gd2l0aCB0aGUgY2FjaGVkIHJlc3BvbnNlLCBjYXVzaW5nIHRoZSBzbmlwcGV0IHRvIGJlIGluc2VydGVkXG4gICAgICAgIC8vIG11bHRpcGxlIHRpbWVzLCBvbiBlYWNoIHRyaWdnZXIuXG4gICAgICAgIGlmIChwYXJhbXMuY29udGVudC5pbmRleE9mKHRoaXMubG9nQ2FwdHVyZVNuaXBwZXQpID09PSAtMSkge1xuICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gJycgKyB0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0ICsgcGFyYW1zLmNvbnRlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYXB0dXJlIHRoZSBjb25zb2xlLmxvZyBvdXRwdXRcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NhcHR1cmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNhcHR1cmUoKSB7XG4gICAgICAgIC8vIElFOSB3aXRoIGRldnRvb2xzIGNsb3NlZFxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5jb25zb2xlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmNvbnNvbGUubG9nID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgICAgICAgbG9nOiBmdW5jdGlvbiBsb2coKSB7fVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgSUU5IHN1cHBvcnRcbiAgICAgICAgdmFyIG9sZENvbnNvbGVMb2cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKHdpbmRvdy5jb25zb2xlLmxvZywgd2luZG93LmNvbnNvbGUpO1xuXG4gICAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBzZW5kIGxvZyBtZXNzYWdlcyB0byB0aGUgcGFyZW50IHdpbmRvd1xuICAgICAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgdHlwZTogJ2pvdHRlZC1jb25zb2xlLWxvZycsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgICAgICAgIH0pLCAnKicpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gaW4gSUU5LCBjb25zb2xlLmxvZyBpcyBvYmplY3QgaW5zdGVhZCBvZiBmdW5jdGlvblxuICAgICAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvNTg1ODk2L2NvbnNvbGUtbG9nLXR5cGVvZi1pcy1vYmplY3QtaW5zdGVhZC1vZi1mdW5jdGlvblxuICAgICAgICAgIG9sZENvbnNvbGVMb2cuYXBwbHkob2xkQ29uc29sZUxvZywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdsb2cnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZygpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgJGxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGFkZENsYXNzKCRsb2csICdqb3R0ZWQtY29uc29sZS1sb2cnKTtcblxuICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgYWRkQ2xhc3MoJGxvZywgJ2pvdHRlZC1jb25zb2xlLWxvZy0nICsgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICAkbG9nLmlubmVySFRNTCA9IG1lc3NhZ2U7XG5cbiAgICAgICAgdGhpcy4kb3V0cHV0LmFwcGVuZENoaWxkKCRsb2cpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3N1Ym1pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0KGUpIHtcbiAgICAgICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLiRpbnB1dC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgLy8gaWYgaW5wdXQgaXMgYmxhbmssIGRvIG5vdGhpbmdcbiAgICAgICAgaWYgKGlucHV0VmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBydW4gdG8gaGlzdG9yeVxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaChpbnB1dFZhbHVlKTtcbiAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXggPSB0aGlzLmhpc3RvcnkubGVuZ3RoO1xuXG4gICAgICAgIC8vIGxvZyBpbnB1dCB2YWx1ZVxuICAgICAgICB0aGlzLmxvZyhpbnB1dFZhbHVlLCAnaGlzdG9yeScpO1xuXG4gICAgICAgIC8vIGFkZCByZXR1cm4gaWYgaXQgZG9lc24ndCBzdGFydCB3aXRoIGl0XG4gICAgICAgIGlmIChpbnB1dFZhbHVlLmluZGV4T2YoJ3JldHVybicpICE9PSAwKSB7XG4gICAgICAgICAgaW5wdXRWYWx1ZSA9ICdyZXR1cm4gJyArIGlucHV0VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaG93IG91dHB1dCBvciBlcnJvcnNcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBydW4gdGhlIGNvbnNvbGUgaW5wdXQgaW4gdGhlIGlmcmFtZSBjb250ZXh0XG4gICAgICAgICAgdmFyIHNjcmlwdE91dHB1dCA9IHRoaXMuZ2V0SWZyYW1lKCkuY29udGVudFdpbmRvdy5ldmFsKCcoZnVuY3Rpb24oKSB7JyArIGlucHV0VmFsdWUgKyAnfSkoKScpO1xuXG4gICAgICAgICAgdGhpcy5sb2coc2NyaXB0T3V0cHV0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5sb2coZXJyLCAnZXJyb3InKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsZWFyIHRoZSBjb25zb2xlIHZhbHVlXG4gICAgICAgIHRoaXMuJGlucHV0LnZhbHVlID0gJyc7XG5cbiAgICAgICAgLy8gc2Nyb2xsIGNvbnNvbGUgcGFuZSB0byBib3R0b21cbiAgICAgICAgLy8gdG8ga2VlcCB0aGUgaW5wdXQgaW50byB2aWV3XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5zY3JvbGxUb3AgPSB0aGlzLiRjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjbGVhcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuJG91dHB1dC5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdoaXN0b3J5JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBoaXN0b3J5KGUpIHtcbiAgICAgICAgdmFyIFVQID0gMzg7XG4gICAgICAgIHZhciBET1dOID0gNDA7XG4gICAgICAgIHZhciBnb3RIaXN0b3J5ID0gZmFsc2U7XG4gICAgICAgIHZhciBzZWxlY3Rpb25TdGFydCA9IHRoaXMuJGlucHV0LnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgICAgIC8vIG9ubHkgaWYgd2UgaGF2ZSBwcmV2aW91cyBoaXN0b3J5XG4gICAgICAgIC8vIGFuZCB0aGUgY3Vyc29yIGlzIGF0IHRoZSBzdGFydFxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBVUCAmJiB0aGlzLmhpc3RvcnlJbmRleCAhPT0gMCAmJiBzZWxlY3Rpb25TdGFydCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4LS07XG4gICAgICAgICAgZ290SGlzdG9yeSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvbmx5IGlmIHdlIGhhdmUgZnV0dXJlIGhpc3RvcnlcbiAgICAgICAgLy8gYW5kIHRoZSBjdXJzb3IgaXMgYXQgdGhlIGVuZFxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBET1dOICYmIHRoaXMuaGlzdG9yeUluZGV4ICE9PSB0aGlzLmhpc3RvcnkubGVuZ3RoIC0gMSAmJiBzZWxlY3Rpb25TdGFydCA9PT0gdGhpcy4kaW5wdXQudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXgrKztcbiAgICAgICAgICBnb3RIaXN0b3J5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgaWYgaGlzdG9yeSBjaGFuZ2VkXG4gICAgICAgIGlmIChnb3RIaXN0b3J5KSB7XG4gICAgICAgICAgdGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5SW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5Db25zb2xlO1xuICB9KCk7XG5cbiAgLyogcGxheSBwbHVnaW5cbiAgICogYWRkcyBhIFJ1biBidXR0b25cbiAgICovXG5cbiAgdmFyIFBsdWdpblBsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luUGxheShqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpblBsYXkpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgZmlyc3RSdW46IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAxMDtcbiAgICAgIC8vIGNhY2hlZCBjb2RlXG4gICAgICB2YXIgY2FjaGUgPSB7fTtcbiAgICAgIC8vIGxhdGVzdCB2ZXJzaW9uIG9mIHRoZSBjb2RlLlxuICAgICAgLy8gcmVwbGFjZXMgdGhlIGNhY2hlIHdoZW4gdGhlIHJ1biBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgIHZhciBjb2RlID0ge307XG5cbiAgICAgIC8vIHNldCBmaXJzdFJ1bj1mYWxzZSB0byBzdGFydCB3aXRoIGEgYmxhbmsgcHJldmlldy5cbiAgICAgIC8vIHJ1biB0aGUgcmVhbCBjb250ZW50IG9ubHkgYWZ0ZXIgdGhlIGZpcnN0IFJ1biBidXR0b24gcHJlc3MuXG4gICAgICBpZiAob3B0aW9ucy5maXJzdFJ1biA9PT0gZmFsc2UpIHtcbiAgICAgICAgY2FjaGUgPSB7XG4gICAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgdHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgdHlwZTogJ2NzcycsXG4gICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAganM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdqcycsXG4gICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gcnVuIGJ1dHRvblxuICAgICAgdmFyICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICRidXR0b24uY2xhc3NOYW1lID0gJ2pvdHRlZC1idXR0b24gam90dGVkLWJ1dHRvbi1wbGF5JztcbiAgICAgICRidXR0b24uaW5uZXJIVE1MID0gJ1J1bic7XG5cbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLmFwcGVuZENoaWxkKCRidXR0b24pO1xuICAgICAgJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMucnVuLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjYXB0dXJlIHRoZSBjb2RlIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcblxuICAgICAgLy8gcHVibGljXG4gICAgICB0aGlzLmNhY2hlID0gY2FjaGU7XG4gICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgdGhpcy5qb3R0ZWQgPSBqb3R0ZWQ7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luUGxheSwgW3tcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gYWx3YXlzIGNhY2hlIHRoZSBsYXRlc3QgY29kZVxuICAgICAgICB0aGlzLmNvZGVbcGFyYW1zLnR5cGVdID0gZXh0ZW5kKHBhcmFtcyk7XG5cbiAgICAgICAgLy8gcmVwbGFjZSB0aGUgcGFyYW1zIHdpdGggdGhlIGxhdGVzdCBjYWNoZVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdKTtcblxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBjYWNoZSBmb3JjZVJlbmRlcixcbiAgICAgICAgICAvLyBhbmQgc2VuZCBpdCB3aXRoIGVhY2ggY2hhbmdlLlxuICAgICAgICAgIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdLmZvcmNlUmVuZGVyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBjYWNoZSB0aGUgZmlyc3QgcnVuXG4gICAgICAgICAgdGhpcy5jYWNoZVtwYXJhbXMudHlwZV0gPSBleHRlbmQocGFyYW1zKTtcblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdydW4nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJ1bigpIHtcbiAgICAgICAgLy8gdHJpZ2dlciBjaGFuZ2Ugb24gZWFjaCB0eXBlIHdpdGggdGhlIGxhdGVzdCBjb2RlXG4gICAgICAgIGZvciAodmFyIHR5cGUgaW4gdGhpcy5jb2RlKSB7XG4gICAgICAgICAgdGhpcy5jYWNoZVt0eXBlXSA9IGV4dGVuZCh0aGlzLmNvZGVbdHlwZV0sIHtcbiAgICAgICAgICAgIC8vIGZvcmNlIHJlbmRlcmluZyBvbiBlYWNoIFJ1biBwcmVzc1xuICAgICAgICAgICAgZm9yY2VSZW5kZXI6IHRydWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGNoYW5nZVxuICAgICAgICAgIHRoaXMuam90dGVkLnRyaWdnZXIoJ2NoYW5nZScsIHRoaXMuY2FjaGVbdHlwZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5QbGF5O1xuICB9KCk7XG5cbiAgLyogYnVuZGxlIHBsdWdpbnNcbiAgICovXG5cbiAgLy8gcmVnaXN0ZXIgYnVuZGxlZCBwbHVnaW5zXG4gIGZ1bmN0aW9uIEJ1bmRsZVBsdWdpbnMoam90dGVkKSB7XG4gICAgam90dGVkLnBsdWdpbigncmVuZGVyJywgUGx1Z2luUmVuZGVyKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdzY3JpcHRsZXNzJywgUGx1Z2luU2NyaXB0bGVzcyk7XG5cbiAgICBqb3R0ZWQucGx1Z2luKCdhY2UnLCBQbHVnaW5BY2UpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2NvZGVtaXJyb3InLCBQbHVnaW5Db2RlTWlycm9yKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdsZXNzJywgUGx1Z2luTGVzcyk7XG4gICAgam90dGVkLnBsdWdpbignY29mZmVlc2NyaXB0JywgUGx1Z2luQ29mZmVlU2NyaXB0KTtcbiAgICBqb3R0ZWQucGx1Z2luKCdzdHlsdXMnLCBQbHVnaW5TdHlsdXMpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2JhYmVsJywgUGx1Z2luQmFiZWwpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ21hcmtkb3duJywgUGx1Z2luTWFya2Rvd24pO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2NvbnNvbGUnLCBQbHVnaW5Db25zb2xlKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdwbGF5JywgUGx1Z2luUGxheSk7XG4gIH1cblxuICAvKiBqb3R0ZWRcbiAgICovXG5cbiAgdmFyIEpvdHRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBKb3R0ZWQoJGpvdHRlZENvbnRhaW5lciwgb3B0cykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgSm90dGVkKTtcblxuICAgICAgaWYgKCEkam90dGVkQ29udGFpbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuXFwndCBmaW5kIEpvdHRlZCBjb250YWluZXIuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHByaXZhdGUgZGF0YVxuICAgICAgdmFyIF9wcml2YXRlID0ge307XG4gICAgICB0aGlzLl9nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiBfcHJpdmF0ZVtrZXldO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3NldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIF9wcml2YXRlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIF9wcml2YXRlW2tleV07XG4gICAgICB9O1xuXG4gICAgICAvLyBvcHRpb25zXG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX3NldCgnb3B0aW9ucycsIGV4dGVuZChvcHRzLCB7XG4gICAgICAgIGZpbGVzOiBbXSxcbiAgICAgICAgc2hvd0JsYW5rOiBmYWxzZSxcbiAgICAgICAgcnVuU2NyaXB0czogdHJ1ZSxcbiAgICAgICAgcGFuZTogJ3Jlc3VsdCcsXG4gICAgICAgIGRlYm91bmNlOiAyNTAsXG4gICAgICAgIHBsdWdpbnM6IFtdXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIHRoZSByZW5kZXIgcGx1Z2luIGlzIG1hbmRhdG9yeVxuICAgICAgb3B0aW9ucy5wbHVnaW5zLnB1c2goJ3JlbmRlcicpO1xuXG4gICAgICAvLyB1c2UgdGhlIHNjcmlwdGxlc3MgcGx1Z2luIGlmIHJ1blNjcmlwdHMgaXMgZmFsc2VcbiAgICAgIGlmIChvcHRpb25zLnJ1blNjcmlwdHMgPT09IGZhbHNlKSB7XG4gICAgICAgIG9wdGlvbnMucGx1Z2lucy5wdXNoKCdzY3JpcHRsZXNzJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhY2hlZCBjb250ZW50IGZvciB0aGUgY2hhbmdlIG1ldGhvZC5cbiAgICAgIHRoaXMuX3NldCgnY2FjaGVkQ29udGVudCcsIHtcbiAgICAgICAgaHRtbDogbnVsbCxcbiAgICAgICAgY3NzOiBudWxsLFxuICAgICAgICBqczogbnVsbFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFB1YlNvdXBcbiAgICAgIHZhciBwdWJzb3VwID0gdGhpcy5fc2V0KCdwdWJzb3VwJywgbmV3IFB1YlNvdXAoKSk7XG5cbiAgICAgIHRoaXMuX3NldCgndHJpZ2dlcicsIHRoaXMudHJpZ2dlcigpKTtcbiAgICAgIHRoaXMuX3NldCgnb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHB1YnNvdXAuc3Vic2NyaWJlLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnb2ZmJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwdWJzb3VwLnVuc3Vic2NyaWJlLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIHZhciBkb25lID0gdGhpcy5fc2V0KCdkb25lJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwdWJzb3VwLmRvbmUuYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBhZnRlciBhbGwgcGx1Z2lucyBydW5cbiAgICAgIC8vIHNob3cgZXJyb3JzXG4gICAgICBkb25lKCdjaGFuZ2UnLCB0aGlzLmVycm9ycy5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gRE9NXG4gICAgICB2YXIgJGNvbnRhaW5lciA9IHRoaXMuX3NldCgnJGNvbnRhaW5lcicsICRqb3R0ZWRDb250YWluZXIpO1xuICAgICAgJGNvbnRhaW5lci5pbm5lckhUTUwgPSBjb250YWluZXIoKTtcbiAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIGNvbnRhaW5lckNsYXNzKCkpO1xuXG4gICAgICAvLyBkZWZhdWx0IHBhbmVcbiAgICAgIHZhciBwYW5lQWN0aXZlID0gdGhpcy5fc2V0KCdwYW5lQWN0aXZlJywgb3B0aW9ucy5wYW5lKTtcbiAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIHBhbmVBY3RpdmVDbGFzcyhwYW5lQWN0aXZlKSk7XG5cbiAgICAgIC8vIHN0YXR1cyBub2Rlc1xuICAgICAgdGhpcy5fc2V0KCckc3RhdHVzJywge30pO1xuXG4gICAgICB2YXIgX2FyciA9IFsnaHRtbCcsICdjc3MnLCAnanMnXTtcbiAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBfYXJyLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX3R5cGUgPSBfYXJyW19pXTtcbiAgICAgICAgdGhpcy5tYXJrdXAoX3R5cGUpO1xuICAgICAgfVxuXG4gICAgICAvLyB0ZXh0YXJlYSBjaGFuZ2UgZXZlbnRzLlxuICAgICAgJGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGRlYm91bmNlKHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIG9wdGlvbnMuZGVib3VuY2UpKTtcbiAgICAgICRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZGVib3VuY2UodGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgb3B0aW9ucy5kZWJvdW5jZSkpO1xuXG4gICAgICAvLyBwYW5lIGNoYW5nZVxuICAgICAgJGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMucGFuZS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gZXhwb3NlIHB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKTtcbiAgICAgIHRoaXMub24gPSB0aGlzLl9nZXQoJ29uJyk7XG4gICAgICB0aGlzLm9mZiA9IHRoaXMuX2dldCgnb2ZmJyk7XG4gICAgICB0aGlzLmRvbmUgPSB0aGlzLl9nZXQoJ2RvbmUnKTtcbiAgICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuX2dldCgndHJpZ2dlcicpO1xuICAgICAgdGhpcy5wYW5lQWN0aXZlID0gdGhpcy5fZ2V0KCdwYW5lQWN0aXZlJyk7XG5cbiAgICAgIC8vIGluaXQgcGx1Z2luc1xuICAgICAgdGhpcy5fc2V0KCdwbHVnaW5zJywge30pO1xuICAgICAgaW5pdC5jYWxsKHRoaXMpO1xuXG4gICAgICAvLyBsb2FkIGZpbGVzXG4gICAgICB2YXIgX2FycjIgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJ107XG4gICAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBfYXJyMi5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIHZhciBfdHlwZTIgPSBfYXJyMltfaTJdO1xuICAgICAgICB0aGlzLmxvYWQoX3R5cGUyKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2hvdyBhbGwgdGFicywgZXZlbiBpZiBlbXB0eVxuICAgICAgaWYgKG9wdGlvbnMuc2hvd0JsYW5rKSB7XG4gICAgICAgIHZhciBfYXJyMyA9IFsnaHRtbCcsICdjc3MnLCAnanMnXTtcblxuICAgICAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBfYXJyMy5sZW5ndGg7IF9pMysrKSB7XG4gICAgICAgICAgdmFyIHR5cGUgPSBfYXJyM1tfaTNdO1xuICAgICAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIGhhc0ZpbGVDbGFzcyh0eXBlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhKb3R0ZWQsIFt7XG4gICAgICBrZXk6ICdmaW5kRmlsZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZEZpbGUodHlwZSkge1xuICAgICAgICB2YXIgZmlsZSA9IHt9O1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX2dldCgnb3B0aW9ucycpO1xuXG4gICAgICAgIGZvciAodmFyIGZpbGVJbmRleCBpbiBvcHRpb25zLmZpbGVzKSB7XG4gICAgICAgICAgdmFyIF9maWxlID0gb3B0aW9ucy5maWxlc1tmaWxlSW5kZXhdO1xuICAgICAgICAgIGlmIChfZmlsZS50eXBlID09PSB0eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gX2ZpbGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbWFya3VwJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBtYXJrdXAodHlwZSkge1xuICAgICAgICB2YXIgJGNvbnRhaW5lciA9IHRoaXMuX2dldCgnJGNvbnRhaW5lcicpO1xuICAgICAgICB2YXIgJHBhcmVudCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLScgKyB0eXBlKTtcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBtYXJrdXAgZm9yIGFuIGVkaXRvclxuICAgICAgICB2YXIgZmlsZSA9IHRoaXMuZmluZEZpbGUodHlwZSk7XG5cbiAgICAgICAgdmFyICRlZGl0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJGVkaXRvci5pbm5lckhUTUwgPSBlZGl0b3JDb250ZW50KHR5cGUsIGZpbGUudXJsKTtcbiAgICAgICAgJGVkaXRvci5jbGFzc05hbWUgPSBlZGl0b3JDbGFzcyh0eXBlKTtcblxuICAgICAgICAkcGFyZW50LmFwcGVuZENoaWxkKCRlZGl0b3IpO1xuXG4gICAgICAgIC8vIGdldCB0aGUgc3RhdHVzIG5vZGVcbiAgICAgICAgdGhpcy5fZ2V0KCckc3RhdHVzJylbdHlwZV0gPSAkcGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtc3RhdHVzJyk7XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIGZpbGUgZm9yIHRoZSBjdXJyZW50IHR5cGVcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlLnVybCAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGZpbGUuY29udGVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBhZGQgdGhlIGhhcy10eXBlIGNsYXNzIHRvIHRoZSBjb250YWluZXJcbiAgICAgICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBoYXNGaWxlQ2xhc3ModHlwZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbG9hZCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZCh0eXBlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBtYXJrdXAgZm9yIGFuIGVkaXRvclxuICAgICAgICB2YXIgZmlsZSA9IHRoaXMuZmluZEZpbGUodHlwZSk7XG4gICAgICAgIHZhciAkdGV4dGFyZWEgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKS5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXBhbmUtJyArIHR5cGUgKyAnIHRleHRhcmVhJyk7XG5cbiAgICAgICAgLy8gZmlsZSBhcyBzdHJpbmdcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlLmNvbnRlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSgkdGV4dGFyZWEsIGZpbGUuY29udGVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbGUudXJsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIHNob3cgbG9hZGluZyBtZXNzYWdlXG4gICAgICAgICAgdGhpcy5zdGF0dXMoJ2xvYWRpbmcnLCBbc3RhdHVzTG9hZGluZyhmaWxlLnVybCldLCB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gZmlsZSBhcyB1cmxcbiAgICAgICAgICBmZXRjaChmaWxlLnVybCwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIC8vIHNob3cgbG9hZCBlcnJvcnNcbiAgICAgICAgICAgICAgX3RoaXMuc3RhdHVzKCdlcnJvcicsIFtzdGF0dXNGZXRjaEVycm9yKGVycildLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBsb2FkaW5nIHN0YXR1c1xuICAgICAgICAgICAgX3RoaXMuY2xlYXJTdGF0dXMoJ2xvYWRpbmcnLCB7XG4gICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfdGhpcy5zZXRWYWx1ZSgkdGV4dGFyZWEsIHJlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdHJpZ2dlciBhIGNoYW5nZSBldmVudCBvbiBibGFuayBlZGl0b3JzLFxuICAgICAgICAgIC8vIGZvciBlZGl0b3IgcGx1Z2lucyB0byBjYXRjaC5cbiAgICAgICAgICAvLyAoZWcuIHRoZSBjb2RlbWlycm9yIGFuZCBhY2UgcGx1Z2lucyBhdHRhY2ggdGhlIGNoYW5nZSBldmVudFxuICAgICAgICAgIC8vIG9ubHkgYWZ0ZXIgdGhlIGluaXRpYWwgY2hhbmdlL2xvYWQgZXZlbnQpXG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSgkdGV4dGFyZWEsICcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3NldFZhbHVlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRWYWx1ZSgkdGV4dGFyZWEsIHZhbCkge1xuICAgICAgICAkdGV4dGFyZWEudmFsdWUgPSB2YWw7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBjaGFuZ2UgZXZlbnQsIGZvciBpbml0aWFsIHJlbmRlclxuICAgICAgICB0aGlzLmNoYW5nZSh7XG4gICAgICAgICAgdGFyZ2V0OiAkdGV4dGFyZWFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UoZSkge1xuICAgICAgICB2YXIgdHlwZSA9IGRhdGEoZS50YXJnZXQsICdqb3R0ZWQtdHlwZScpO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkb24ndCB0cmlnZ2VyIGNoYW5nZSBpZiB0aGUgY29udGVudCBoYXNuJ3QgY2hhbmdlZC5cbiAgICAgICAgLy8gZWcuIHdoZW4gYmx1cnJpbmcgdGhlIHRleHRhcmVhLlxuICAgICAgICB2YXIgY2FjaGVkQ29udGVudCA9IHRoaXMuX2dldCgnY2FjaGVkQ29udGVudCcpO1xuICAgICAgICBpZiAoY2FjaGVkQ29udGVudFt0eXBlXSA9PT0gZS50YXJnZXQudmFsdWUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYWNoZSBsYXRlc3QgY29udGVudFxuICAgICAgICBjYWNoZWRDb250ZW50W3R5cGVdID0gZS50YXJnZXQudmFsdWU7XG5cbiAgICAgICAgLy8gdHJpZ2dlciB0aGUgY2hhbmdlIGV2ZW50XG4gICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJywge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgZmlsZTogZGF0YShlLnRhcmdldCwgJ2pvdHRlZC1maWxlJyksXG4gICAgICAgICAgY29udGVudDogY2FjaGVkQ29udGVudFt0eXBlXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdlcnJvcnMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVycm9ycyhlcnJzLCBwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5zdGF0dXMoJ2Vycm9yJywgZXJycywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdwYW5lJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYW5lKGUpIHtcbiAgICAgICAgaWYgKCFkYXRhKGUudGFyZ2V0LCAnam90dGVkLXR5cGUnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkY29udGFpbmVyID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJyk7XG4gICAgICAgIHZhciBwYW5lQWN0aXZlID0gdGhpcy5fZ2V0KCdwYW5lQWN0aXZlJyk7XG4gICAgICAgIHJlbW92ZUNsYXNzKCRjb250YWluZXIsIHBhbmVBY3RpdmVDbGFzcyhwYW5lQWN0aXZlKSk7XG5cbiAgICAgICAgcGFuZUFjdGl2ZSA9IHRoaXMuX3NldCgncGFuZUFjdGl2ZScsIGRhdGEoZS50YXJnZXQsICdqb3R0ZWQtdHlwZScpKTtcbiAgICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgcGFuZUFjdGl2ZUNsYXNzKHBhbmVBY3RpdmUpKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnc3RhdHVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdGF0dXMoKSB7XG4gICAgICAgIHZhciBzdGF0dXNUeXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnZXJyb3InO1xuICAgICAgICB2YXIgbWVzc2FnZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IFtdO1xuICAgICAgICB2YXIgcGFyYW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICAgICAgICBpZiAoIW1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFyU3RhdHVzKHN0YXR1c1R5cGUsIHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJHN0YXR1cyA9IHRoaXMuX2dldCgnJHN0YXR1cycpO1xuXG4gICAgICAgIC8vIGFkZCBlcnJvci9sb2FkaW5nIGNsYXNzIHRvIHN0YXR1c1xuICAgICAgICBhZGRDbGFzcygkc3RhdHVzW3BhcmFtcy50eXBlXSwgc3RhdHVzQ2xhc3Moc3RhdHVzVHlwZSkpO1xuXG4gICAgICAgIGFkZENsYXNzKHRoaXMuX2dldCgnJGNvbnRhaW5lcicpLCBzdGF0dXNBY3RpdmVDbGFzcyhwYXJhbXMudHlwZSkpO1xuXG4gICAgICAgIHZhciBtYXJrdXAgPSAnJztcbiAgICAgICAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgbWFya3VwICs9IHN0YXR1c01lc3NhZ2UoZXJyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXR1c1twYXJhbXMudHlwZV0uaW5uZXJIVE1MID0gbWFya3VwO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NsZWFyU3RhdHVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhclN0YXR1cyhzdGF0dXNUeXBlLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyICRzdGF0dXMgPSB0aGlzLl9nZXQoJyRzdGF0dXMnKTtcblxuICAgICAgICByZW1vdmVDbGFzcygkc3RhdHVzW3BhcmFtcy50eXBlXSwgc3RhdHVzQ2xhc3Moc3RhdHVzVHlwZSkpO1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLl9nZXQoJyRjb250YWluZXInKSwgc3RhdHVzQWN0aXZlQ2xhc3MocGFyYW1zLnR5cGUpKTtcbiAgICAgICAgJHN0YXR1c1twYXJhbXMudHlwZV0uaW5uZXJIVE1MID0gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlYm91bmNlZCB0cmlnZ2VyIG1ldGhvZFxuICAgICAgLy8gY3VzdG9tIGRlYm91bmNlciB0byB1c2UgYSBkaWZmZXJlbnQgdGltZXIgcGVyIHR5cGVcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3RyaWdnZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fZ2V0KCdvcHRpb25zJyk7XG4gICAgICAgIHZhciBwdWJzb3VwID0gdGhpcy5fZ2V0KCdwdWJzb3VwJyk7XG5cbiAgICAgICAgLy8gYWxsb3cgZGlzYWJsaW5nIHRoZSB0cmlnZ2VyIGRlYm91bmNlci5cbiAgICAgICAgLy8gbW9zdGx5IGZvciB0ZXN0aW5nOiB3aGVuIHRyaWdnZXIgZXZlbnRzIGhhcHBlbiByYXBpZGx5XG4gICAgICAgIC8vIG11bHRpcGxlIGV2ZW50cyBvZiB0aGUgc2FtZSB0eXBlIHdvdWxkIGJlIGNhdWdodCBvbmNlLlxuICAgICAgICBpZiAob3B0aW9ucy5kZWJvdW5jZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHVic291cC5wdWJsaXNoLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvb2xkb3duIHRpbWVyXG4gICAgICAgIHZhciBjb29sZG93biA9IHt9O1xuICAgICAgICAvLyBtdWx0aXBsZSBjYWxsc1xuICAgICAgICB2YXIgbXVsdGlwbGUgPSB7fTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRvcGljKSB7XG4gICAgICAgICAgdmFyIF9hcmd1bWVudHMgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgICB2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICAgICAgICB2YXIgX3JlZiR0eXBlID0gX3JlZi50eXBlO1xuICAgICAgICAgIHZhciB0eXBlID0gX3JlZiR0eXBlID09PSB1bmRlZmluZWQgPyAnZGVmYXVsdCcgOiBfcmVmJHR5cGU7XG5cbiAgICAgICAgICBpZiAoY29vbGRvd25bdHlwZV0pIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhZCBtdWx0aXBsZSBjYWxscyBiZWZvcmUgdGhlIGNvb2xkb3duXG4gICAgICAgICAgICBtdWx0aXBsZVt0eXBlXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgaW1tZWRpYXRlbHkgb25jZSBjb29sZG93biBpcyBvdmVyXG4gICAgICAgICAgICBwdWJzb3VwLnB1Ymxpc2guYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29vbGRvd25bdHlwZV0pO1xuXG4gICAgICAgICAgLy8gc2V0IGNvb2xkb3duIHRpbWVyXG4gICAgICAgICAgY29vbGRvd25bdHlwZV0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhZCBtdWx0aXBsZSBjYWxscyBiZWZvcmUgdGhlIGNvb2xkb3duLFxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgZnVuY3Rpb24gYWdhaW4gYXQgdGhlIGVuZC5cbiAgICAgICAgICAgIGlmIChtdWx0aXBsZVt0eXBlXSkge1xuICAgICAgICAgICAgICBwdWJzb3VwLnB1Ymxpc2guYXBwbHkocHVic291cCwgX2FyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG11bHRpcGxlW3R5cGVdID0gbnVsbDtcbiAgICAgICAgICAgIGNvb2xkb3duW3R5cGVdID0gbnVsbDtcbiAgICAgICAgICB9LCBvcHRpb25zLmRlYm91bmNlKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIEpvdHRlZDtcbiAgfSgpO1xuXG4gIC8vIHJlZ2lzdGVyIHBsdWdpbnNcblxuXG4gIEpvdHRlZC5wbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gcmVnaXN0ZXIgYnVuZGxlZCBwbHVnaW5zXG4gIEJ1bmRsZVBsdWdpbnMoSm90dGVkKTtcblxuICByZXR1cm4gSm90dGVkO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1qb3R0ZWQuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFBpZXJveHkgPHBpZXJveHlAcGllcm94eS5uZXQ+XG4vLyBUaGlzIHdvcmsgaXMgZnJlZS4gWW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdFxuLy8gdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBXVEZQTCwgVmVyc2lvbiAyXG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWUgTElDRU5TRS50eHQgb3IgaHR0cDovL3d3dy53dGZwbC5uZXQvXG4vL1xuLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24sIHRoZSBob21lIHBhZ2U6XG4vLyBodHRwOi8vcGllcm94eS5uZXQvYmxvZy9wYWdlcy9sei1zdHJpbmcvdGVzdGluZy5odG1sXG4vL1xuLy8gTFotYmFzZWQgY29tcHJlc3Npb24gYWxnb3JpdGhtLCB2ZXJzaW9uIDEuNC40XG52YXIgTFpTdHJpbmcgPSAoZnVuY3Rpb24oKSB7XG5cbi8vIHByaXZhdGUgcHJvcGVydHlcbnZhciBmID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbnZhciBrZXlTdHJCYXNlNjQgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCI7XG52YXIga2V5U3RyVXJpU2FmZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLSRcIjtcbnZhciBiYXNlUmV2ZXJzZURpYyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRCYXNlVmFsdWUoYWxwaGFiZXQsIGNoYXJhY3Rlcikge1xuICBpZiAoIWJhc2VSZXZlcnNlRGljW2FscGhhYmV0XSkge1xuICAgIGJhc2VSZXZlcnNlRGljW2FscGhhYmV0XSA9IHt9O1xuICAgIGZvciAodmFyIGk9MCA7IGk8YWxwaGFiZXQubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBiYXNlUmV2ZXJzZURpY1thbHBoYWJldF1bYWxwaGFiZXQuY2hhckF0KGkpXSA9IGk7XG4gICAgfVxuICB9XG4gIHJldHVybiBiYXNlUmV2ZXJzZURpY1thbHBoYWJldF1bY2hhcmFjdGVyXTtcbn1cblxudmFyIExaU3RyaW5nID0ge1xuICBjb21wcmVzc1RvQmFzZTY0IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHZhciByZXMgPSBMWlN0cmluZy5fY29tcHJlc3MoaW5wdXQsIDYsIGZ1bmN0aW9uKGEpe3JldHVybiBrZXlTdHJCYXNlNjQuY2hhckF0KGEpO30pO1xuICAgIHN3aXRjaCAocmVzLmxlbmd0aCAlIDQpIHsgLy8gVG8gcHJvZHVjZSB2YWxpZCBCYXNlNjRcbiAgICBkZWZhdWx0OiAvLyBXaGVuIGNvdWxkIHRoaXMgaGFwcGVuID9cbiAgICBjYXNlIDAgOiByZXR1cm4gcmVzO1xuICAgIGNhc2UgMSA6IHJldHVybiByZXMrXCI9PT1cIjtcbiAgICBjYXNlIDIgOiByZXR1cm4gcmVzK1wiPT1cIjtcbiAgICBjYXNlIDMgOiByZXR1cm4gcmVzK1wiPVwiO1xuICAgIH1cbiAgfSxcblxuICBkZWNvbXByZXNzRnJvbUJhc2U2NCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoaW5wdXQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGlucHV0Lmxlbmd0aCwgMzIsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBnZXRCYXNlVmFsdWUoa2V5U3RyQmFzZTY0LCBpbnB1dC5jaGFyQXQoaW5kZXgpKTsgfSk7XG4gIH0sXG5cbiAgY29tcHJlc3NUb1VURjE2IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBMWlN0cmluZy5fY29tcHJlc3MoaW5wdXQsIDE1LCBmdW5jdGlvbihhKXtyZXR1cm4gZihhKzMyKTt9KSArIFwiIFwiO1xuICB9LFxuXG4gIGRlY29tcHJlc3NGcm9tVVRGMTY6IGZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGNvbXByZXNzZWQubGVuZ3RoLCAxNjM4NCwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGNvbXByZXNzZWQuY2hhckNvZGVBdChpbmRleCkgLSAzMjsgfSk7XG4gIH0sXG5cbiAgLy9jb21wcmVzcyBpbnRvIHVpbnQ4YXJyYXkgKFVDUy0yIGJpZyBlbmRpYW4gZm9ybWF0KVxuICBjb21wcmVzc1RvVWludDhBcnJheTogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCkge1xuICAgIHZhciBjb21wcmVzc2VkID0gTFpTdHJpbmcuY29tcHJlc3ModW5jb21wcmVzc2VkKTtcbiAgICB2YXIgYnVmPW5ldyBVaW50OEFycmF5KGNvbXByZXNzZWQubGVuZ3RoKjIpOyAvLyAyIGJ5dGVzIHBlciBjaGFyYWN0ZXJcblxuICAgIGZvciAodmFyIGk9MCwgVG90YWxMZW49Y29tcHJlc3NlZC5sZW5ndGg7IGk8VG90YWxMZW47IGkrKykge1xuICAgICAgdmFyIGN1cnJlbnRfdmFsdWUgPSBjb21wcmVzc2VkLmNoYXJDb2RlQXQoaSk7XG4gICAgICBidWZbaSoyXSA9IGN1cnJlbnRfdmFsdWUgPj4+IDg7XG4gICAgICBidWZbaSoyKzFdID0gY3VycmVudF92YWx1ZSAlIDI1NjtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcblxuICAvL2RlY29tcHJlc3MgZnJvbSB1aW50OGFycmF5IChVQ1MtMiBiaWcgZW5kaWFuIGZvcm1hdClcbiAgZGVjb21wcmVzc0Zyb21VaW50OEFycmF5OmZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgaWYgKGNvbXByZXNzZWQ9PT1udWxsIHx8IGNvbXByZXNzZWQ9PT11bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gTFpTdHJpbmcuZGVjb21wcmVzcyhjb21wcmVzc2VkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYnVmPW5ldyBBcnJheShjb21wcmVzc2VkLmxlbmd0aC8yKTsgLy8gMiBieXRlcyBwZXIgY2hhcmFjdGVyXG4gICAgICAgIGZvciAodmFyIGk9MCwgVG90YWxMZW49YnVmLmxlbmd0aDsgaTxUb3RhbExlbjsgaSsrKSB7XG4gICAgICAgICAgYnVmW2ldPWNvbXByZXNzZWRbaSoyXSoyNTYrY29tcHJlc3NlZFtpKjIrMV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGJ1Zi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goZihjKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gTFpTdHJpbmcuZGVjb21wcmVzcyhyZXN1bHQuam9pbignJykpO1xuXG4gICAgfVxuXG4gIH0sXG5cblxuICAvL2NvbXByZXNzIGludG8gYSBzdHJpbmcgdGhhdCBpcyBhbHJlYWR5IFVSSSBlbmNvZGVkXG4gIGNvbXByZXNzVG9FbmNvZGVkVVJJQ29tcG9uZW50OiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9jb21wcmVzcyhpbnB1dCwgNiwgZnVuY3Rpb24oYSl7cmV0dXJuIGtleVN0clVyaVNhZmUuY2hhckF0KGEpO30pO1xuICB9LFxuXG4gIC8vZGVjb21wcmVzcyBmcm9tIGFuIG91dHB1dCBvZiBjb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudFxuICBkZWNvbXByZXNzRnJvbUVuY29kZWRVUklDb21wb25lbnQ6ZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChpbnB1dCA9PSBcIlwiKSByZXR1cm4gbnVsbDtcbiAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoLyAvZywgXCIrXCIpO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhpbnB1dC5sZW5ndGgsIDMyLCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gZ2V0QmFzZVZhbHVlKGtleVN0clVyaVNhZmUsIGlucHV0LmNoYXJBdChpbmRleCkpOyB9KTtcbiAgfSxcblxuICBjb21wcmVzczogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCkge1xuICAgIHJldHVybiBMWlN0cmluZy5fY29tcHJlc3ModW5jb21wcmVzc2VkLCAxNiwgZnVuY3Rpb24oYSl7cmV0dXJuIGYoYSk7fSk7XG4gIH0sXG4gIF9jb21wcmVzczogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCwgYml0c1BlckNoYXIsIGdldENoYXJGcm9tSW50KSB7XG4gICAgaWYgKHVuY29tcHJlc3NlZCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICB2YXIgaSwgdmFsdWUsXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeT0ge30sXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlPSB7fSxcbiAgICAgICAgY29udGV4dF9jPVwiXCIsXG4gICAgICAgIGNvbnRleHRfd2M9XCJcIixcbiAgICAgICAgY29udGV4dF93PVwiXCIsXG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluPSAyLCAvLyBDb21wZW5zYXRlIGZvciB0aGUgZmlyc3QgZW50cnkgd2hpY2ggc2hvdWxkIG5vdCBjb3VudFxuICAgICAgICBjb250ZXh0X2RpY3RTaXplPSAzLFxuICAgICAgICBjb250ZXh0X251bUJpdHM9IDIsXG4gICAgICAgIGNvbnRleHRfZGF0YT1bXSxcbiAgICAgICAgY29udGV4dF9kYXRhX3ZhbD0wLFxuICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb249MCxcbiAgICAgICAgaWk7XG5cbiAgICBmb3IgKGlpID0gMDsgaWkgPCB1bmNvbXByZXNzZWQubGVuZ3RoOyBpaSArPSAxKSB7XG4gICAgICBjb250ZXh0X2MgPSB1bmNvbXByZXNzZWQuY2hhckF0KGlpKTtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeSxjb250ZXh0X2MpKSB7XG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVtjb250ZXh0X2NdID0gY29udGV4dF9kaWN0U2l6ZSsrO1xuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZVtjb250ZXh0X2NdID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dF93YyA9IGNvbnRleHRfdyArIGNvbnRleHRfYztcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dF9kaWN0aW9uYXJ5LGNvbnRleHRfd2MpKSB7XG4gICAgICAgIGNvbnRleHRfdyA9IGNvbnRleHRfd2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlLGNvbnRleHRfdykpIHtcbiAgICAgICAgICBpZiAoY29udGV4dF93LmNoYXJDb2RlQXQoMCk8MjU2KSB7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8OCA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSAxO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCB2YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PWJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPDE2IDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlW2NvbnRleHRfd107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF93XTtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHdjIHRvIHRoZSBkaWN0aW9uYXJ5LlxuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF93Y10gPSBjb250ZXh0X2RpY3RTaXplKys7XG4gICAgICAgIGNvbnRleHRfdyA9IFN0cmluZyhjb250ZXh0X2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE91dHB1dCB0aGUgY29kZSBmb3Igdy5cbiAgICBpZiAoY29udGV4dF93ICE9PSBcIlwiKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlLGNvbnRleHRfdykpIHtcbiAgICAgICAgaWYgKGNvbnRleHRfdy5jaGFyQ29kZUF0KDApPDI1Nikge1xuICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPDggOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gMTtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPDE2IDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgIGNvbnRleHRfZW5sYXJnZUluID0gTWF0aC5wb3coMiwgY29udGV4dF9udW1CaXRzKTtcbiAgICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGVbY29udGV4dF93XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd107XG4gICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgIH1cblxuXG4gICAgICB9XG4gICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXJrIHRoZSBlbmQgb2YgdGhlIHN0cmVhbVxuICAgIHZhbHVlID0gMjtcbiAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgIH1cblxuICAgIC8vIEZsdXNoIHRoZSBsYXN0IGNoYXJcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpO1xuICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBlbHNlIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dF9kYXRhLmpvaW4oJycpO1xuICB9LFxuXG4gIGRlY29tcHJlc3M6IGZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGNvbXByZXNzZWQubGVuZ3RoLCAzMjc2OCwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGNvbXByZXNzZWQuY2hhckNvZGVBdChpbmRleCk7IH0pO1xuICB9LFxuXG4gIF9kZWNvbXByZXNzOiBmdW5jdGlvbiAobGVuZ3RoLCByZXNldFZhbHVlLCBnZXROZXh0VmFsdWUpIHtcbiAgICB2YXIgZGljdGlvbmFyeSA9IFtdLFxuICAgICAgICBuZXh0LFxuICAgICAgICBlbmxhcmdlSW4gPSA0LFxuICAgICAgICBkaWN0U2l6ZSA9IDQsXG4gICAgICAgIG51bUJpdHMgPSAzLFxuICAgICAgICBlbnRyeSA9IFwiXCIsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBpLFxuICAgICAgICB3LFxuICAgICAgICBiaXRzLCByZXNiLCBtYXhwb3dlciwgcG93ZXIsXG4gICAgICAgIGMsXG4gICAgICAgIGRhdGEgPSB7dmFsOmdldE5leHRWYWx1ZSgwKSwgcG9zaXRpb246cmVzZXRWYWx1ZSwgaW5kZXg6MX07XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSArPSAxKSB7XG4gICAgICBkaWN0aW9uYXJ5W2ldID0gaTtcbiAgICB9XG5cbiAgICBiaXRzID0gMDtcbiAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMik7XG4gICAgcG93ZXI9MTtcbiAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICB9XG4gICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgIHBvd2VyIDw8PSAxO1xuICAgIH1cblxuICAgIHN3aXRjaCAobmV4dCA9IGJpdHMpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsOCk7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgYyA9IGYoYml0cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiwxNik7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgYyA9IGYoYml0cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgZGljdGlvbmFyeVszXSA9IGM7XG4gICAgdyA9IGM7XG4gICAgcmVzdWx0LnB1c2goYyk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmIChkYXRhLmluZGV4ID4gbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfVxuXG4gICAgICBiaXRzID0gMDtcbiAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMixudW1CaXRzKTtcbiAgICAgIHBvd2VyPTE7XG4gICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICB9XG4gICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgIH1cblxuICAgICAgc3dpdGNoIChjID0gYml0cykge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDgpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gZihiaXRzKTtcbiAgICAgICAgICBjID0gZGljdFNpemUtMTtcbiAgICAgICAgICBlbmxhcmdlSW4tLTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiwxNik7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gZihiaXRzKTtcbiAgICAgICAgICBjID0gZGljdFNpemUtMTtcbiAgICAgICAgICBlbmxhcmdlSW4tLTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHJldHVybiByZXN1bHQuam9pbignJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICBlbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBudW1CaXRzKTtcbiAgICAgICAgbnVtQml0cysrO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGljdGlvbmFyeVtjXSkge1xuICAgICAgICBlbnRyeSA9IGRpY3Rpb25hcnlbY107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoYyA9PT0gZGljdFNpemUpIHtcbiAgICAgICAgICBlbnRyeSA9IHcgKyB3LmNoYXJBdCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2goZW50cnkpO1xuXG4gICAgICAvLyBBZGQgdytlbnRyeVswXSB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgIGRpY3Rpb25hcnlbZGljdFNpemUrK10gPSB3ICsgZW50cnkuY2hhckF0KDApO1xuICAgICAgZW5sYXJnZUluLS07XG5cbiAgICAgIHcgPSBlbnRyeTtcblxuICAgICAgaWYgKGVubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgIGVubGFyZ2VJbiA9IE1hdGgucG93KDIsIG51bUJpdHMpO1xuICAgICAgICBudW1CaXRzKys7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cbn07XG4gIHJldHVybiBMWlN0cmluZztcbn0pKCk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuIExaU3RyaW5nOyB9KTtcbn0gZWxzZSBpZiggdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlICE9IG51bGwgKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gTFpTdHJpbmdcbn1cbiIsInZhciBjYW5Qcm9taXNlID0gcmVxdWlyZSgnY2FuLXByb21pc2UnKVxudmFyIFFSQ29kZSA9IHJlcXVpcmUoJy4vY29yZS9xcmNvZGUnKVxudmFyIENhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9jYW52YXMnKVxudmFyIFN2Z1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9zdmctdGFnLmpzJylcblxuZnVuY3Rpb24gcmVuZGVyQ2FudmFzIChyZW5kZXJGdW5jLCBjYW52YXMsIHRleHQsIG9wdHMsIGNiKSB7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gIHZhciBhcmdzTnVtID0gYXJncy5sZW5ndGhcbiAgdmFyIGlzTGFzdEFyZ0NiID0gdHlwZW9mIGFyZ3NbYXJnc051bSAtIDFdID09PSAnZnVuY3Rpb24nXG5cbiAgaWYgKCFpc0xhc3RBcmdDYiAmJiAhY2FuUHJvbWlzZSgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayByZXF1aXJlZCBhcyBsYXN0IGFyZ3VtZW50JylcbiAgfVxuXG4gIGlmIChpc0xhc3RBcmdDYikge1xuICAgIGlmIChhcmdzTnVtIDwgMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb28gZmV3IGFyZ3VtZW50cyBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3NOdW0gPT09IDIpIHtcbiAgICAgIGNiID0gdGV4dFxuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMykge1xuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0ICYmIHR5cGVvZiBjYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY2IgPSBvcHRzXG4gICAgICAgIG9wdHMgPSB1bmRlZmluZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiID0gb3B0c1xuICAgICAgICBvcHRzID0gdGV4dFxuICAgICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYXJnc051bSA8IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmIChhcmdzTnVtID09PSAxKSB7XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmIChhcmdzTnVtID09PSAyICYmICFjYW52YXMuZ2V0Q29udGV4dCkge1xuICAgICAgb3B0cyA9IHRleHRcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcbiAgICAgICAgcmVzb2x2ZShyZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB0cnkge1xuICAgIHZhciBkYXRhID0gUVJDb2RlLmNyZWF0ZSh0ZXh0LCBvcHRzKVxuICAgIGNiKG51bGwsIHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNiKGUpXG4gIH1cbn1cblxuZXhwb3J0cy5jcmVhdGUgPSBRUkNvZGUuY3JlYXRlXG5leHBvcnRzLnRvQ2FudmFzID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyKVxuZXhwb3J0cy50b0RhdGFVUkwgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBDYW52YXNSZW5kZXJlci5yZW5kZXJUb0RhdGFVUkwpXG5cbi8vIG9ubHkgc3ZnIGZvciBub3cuXG5leHBvcnRzLnRvU3RyaW5nID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgZnVuY3Rpb24gKGRhdGEsIF8sIG9wdHMpIHtcbiAgcmV0dXJuIFN2Z1JlbmRlcmVyLnJlbmRlcihkYXRhLCBvcHRzKVxufSlcbiIsIi8qKlxuICogQWxpZ25tZW50IHBhdHRlcm4gYXJlIGZpeGVkIHJlZmVyZW5jZSBwYXR0ZXJuIGluIGRlZmluZWQgcG9zaXRpb25zXG4gKiBpbiBhIG1hdHJpeCBzeW1ib2xvZ3ksIHdoaWNoIGVuYWJsZXMgdGhlIGRlY29kZSBzb2Z0d2FyZSB0byByZS1zeW5jaHJvbmlzZVxuICogdGhlIGNvb3JkaW5hdGUgbWFwcGluZyBvZiB0aGUgaW1hZ2UgbW9kdWxlcyBpbiB0aGUgZXZlbnQgb2YgbW9kZXJhdGUgYW1vdW50c1xuICogb2YgZGlzdG9ydGlvbiBvZiB0aGUgaW1hZ2UuXG4gKlxuICogQWxpZ25tZW50IHBhdHRlcm5zIGFyZSBwcmVzZW50IG9ubHkgaW4gUVIgQ29kZSBzeW1ib2xzIG9mIHZlcnNpb24gMiBvciBsYXJnZXJcbiAqIGFuZCB0aGVpciBudW1iZXIgZGVwZW5kcyBvbiB0aGUgc3ltYm9sIHZlcnNpb24uXG4gKi9cblxudmFyIGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyBvZiB0aGUgY2VudGVyIG1vZHVsZSBvZiBlYWNoIGFsaWdubWVudCBwYXR0ZXJuXG4gKiBmb3IgdGhlIHNwZWNpZmllZCBRUiBDb2RlIHZlcnNpb24uXG4gKlxuICogVGhlIGFsaWdubWVudCBwYXR0ZXJucyBhcmUgcG9zaXRpb25lZCBzeW1tZXRyaWNhbGx5IG9uIGVpdGhlciBzaWRlIG9mIHRoZSBkaWFnb25hbFxuICogcnVubmluZyBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHN5bWJvbCB0byB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lci5cbiAqXG4gKiBTaW5jZSBwb3NpdGlvbnMgYXJlIHNpbW1ldHJpY2FsIG9ubHkgaGFsZiBvZiB0aGUgY29vcmRpbmF0ZXMgYXJlIHJldHVybmVkLlxuICogRWFjaCBpdGVtIG9mIHRoZSBhcnJheSB3aWxsIHJlcHJlc2VudCBpbiB0dXJuIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGUuXG4gKiBAc2VlIHtAbGluayBnZXRQb3NpdGlvbnN9XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVcbiAqL1xuZXhwb3J0cy5nZXRSb3dDb2xDb29yZHMgPSBmdW5jdGlvbiBnZXRSb3dDb2xDb29yZHMgKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gPT09IDEpIHJldHVybiBbXVxuXG4gIHZhciBwb3NDb3VudCA9IE1hdGguZmxvb3IodmVyc2lvbiAvIDcpICsgMlxuICB2YXIgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcbiAgdmFyIGludGVydmFscyA9IHNpemUgPT09IDE0NSA/IDI2IDogTWF0aC5jZWlsKChzaXplIC0gMTMpIC8gKDIgKiBwb3NDb3VudCAtIDIpKSAqIDJcbiAgdmFyIHBvc2l0aW9ucyA9IFtzaXplIC0gN10gLy8gTGFzdCBjb29yZCBpcyBhbHdheXMgKHNpemUgLSA3KVxuXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgcG9zQ291bnQgLSAxOyBpKyspIHtcbiAgICBwb3NpdGlvbnNbaV0gPSBwb3NpdGlvbnNbaSAtIDFdIC0gaW50ZXJ2YWxzXG4gIH1cblxuICBwb3NpdGlvbnMucHVzaCg2KSAvLyBGaXJzdCBjb29yZCBpcyBhbHdheXMgNlxuXG4gIHJldHVybiBwb3NpdGlvbnMucmV2ZXJzZSgpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVybi5cbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgY2VudGVyIHBvaW50IG9mIHRoZSBwYXR0ZXJuIGFzICh4LCB5KSBjb29yZGluYXRlc1xuICpcbiAqIENvb3JkaW5hdGVzIGFyZSBjYWxjdWxhdGVkIGV4cGFuZGluZyB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyByZXR1cm5lZCBieSB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfVxuICogYW5kIGZpbHRlcmluZyBvdXQgdGhlIGl0ZW1zIHRoYXQgb3ZlcmxhcHMgd2l0aCBmaW5kZXIgcGF0dGVyblxuICpcbiAqIEBleGFtcGxlXG4gKiBGb3IgYSBWZXJzaW9uIDcgc3ltYm9sIHtAbGluayBnZXRSb3dDb2xDb29yZHN9IHJldHVybnMgdmFsdWVzIDYsIDIyIGFuZCAzOC5cbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMsIHRoZXJlZm9yZSwgYXJlIHRvIGJlIGNlbnRlcmVkIG9uIChyb3csIGNvbHVtbilcbiAqIHBvc2l0aW9ucyAoNiwyMiksICgyMiw2KSwgKDIyLDIyKSwgKDIyLDM4KSwgKDM4LDIyKSwgKDM4LDM4KS5cbiAqIE5vdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgKDYsNiksICg2LDM4KSwgKDM4LDYpIGFyZSBvY2N1cGllZCBieSBmaW5kZXIgcGF0dGVybnNcbiAqIGFuZCBhcmUgbm90IHRoZXJlZm9yZSB1c2VkIGZvciBhbGlnbm1lbnQgcGF0dGVybnMuXG4gKlxuICogdmFyIHBvcyA9IGdldFBvc2l0aW9ucyg3KVxuICogLy8gW1s2LDIyXSwgWzIyLDZdLCBbMjIsMjJdLCBbMjIsMzhdLCBbMzgsMjJdLCBbMzgsMzhdXVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xuICovXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xuICB2YXIgY29vcmRzID0gW11cbiAgdmFyIHBvcyA9IGV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzKHZlcnNpb24pXG4gIHZhciBwb3NMZW5ndGggPSBwb3MubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3NMZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9zTGVuZ3RoOyBqKyspIHtcbiAgICAgIC8vIFNraXAgaWYgcG9zaXRpb24gaXMgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXG4gICAgICBpZiAoKGkgPT09IDAgJiYgaiA9PT0gMCkgfHwgICAgICAgICAgICAgLy8gdG9wLWxlZnRcbiAgICAgICAgICAoaSA9PT0gMCAmJiBqID09PSBwb3NMZW5ndGggLSAxKSB8fCAvLyBib3R0b20tbGVmdFxuICAgICAgICAgIChpID09PSBwb3NMZW5ndGggLSAxICYmIGogPT09IDApKSB7IC8vIHRvcC1yaWdodFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb29yZHMucHVzaChbcG9zW2ldLCBwb3Nbal1dKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb29yZHNcbn1cbiIsInZhciBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcblxuLyoqXG4gKiBBcnJheSBvZiBjaGFyYWN0ZXJzIGF2YWlsYWJsZSBpbiBhbHBoYW51bWVyaWMgbW9kZVxuICpcbiAqIEFzIHBlciBRUiBDb2RlIHNwZWNpZmljYXRpb24sIHRvIGVhY2ggY2hhcmFjdGVyXG4gKiBpcyBhc3NpZ25lZCBhIHZhbHVlIGZyb20gMCB0byA0NCB3aGljaCBpbiB0aGlzIGNhc2UgY29pbmNpZGVzXG4gKiB3aXRoIHRoZSBhcnJheSBpbmRleFxuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xudmFyIEFMUEhBX05VTV9DSEFSUyA9IFtcbiAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLFxuICAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsXG4gICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxcbiAgJyAnLCAnJCcsICclJywgJyonLCAnKycsICctJywgJy4nLCAnLycsICc6J1xuXVxuXG5mdW5jdGlvbiBBbHBoYW51bWVyaWNEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuQUxQSEFOVU1FUklDXG4gIHRoaXMuZGF0YSA9IGRhdGFcbn1cblxuQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiAxMSAqIE1hdGguZmxvb3IobGVuZ3RoIC8gMikgKyA2ICogKGxlbmd0aCAlIDIpXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcbiAgdmFyIGlcblxuICAvLyBJbnB1dCBkYXRhIGNoYXJhY3RlcnMgYXJlIGRpdmlkZWQgaW50byBncm91cHMgb2YgdHdvIGNoYXJhY3RlcnNcbiAgLy8gYW5kIGVuY29kZWQgYXMgMTEtYml0IGJpbmFyeSBjb2Rlcy5cbiAgZm9yIChpID0gMDsgaSArIDIgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgLy8gVGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIG11bHRpcGxpZWQgYnkgNDVcbiAgICB2YXIgdmFsdWUgPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pICogNDVcblxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIHNlY29uZCBkaWdpdCBpcyBhZGRlZCB0byB0aGUgcHJvZHVjdFxuICAgIHZhbHVlICs9IEFMUEhBX05VTV9DSEFSUy5pbmRleE9mKHRoaXMuZGF0YVtpICsgMV0pXG5cbiAgICAvLyBUaGUgc3VtIGlzIHRoZW4gc3RvcmVkIGFzIDExLWJpdCBiaW5hcnkgbnVtYmVyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTEpXG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRhdGEgY2hhcmFjdGVycyBpcyBub3QgYSBtdWx0aXBsZSBvZiB0d28sXG4gIC8vIHRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpbmFsIGNoYXJhY3RlciBpcyBlbmNvZGVkIGFzIGEgNi1iaXQgYmluYXJ5IG51bWJlci5cbiAgaWYgKHRoaXMuZGF0YS5sZW5ndGggJSAyKSB7XG4gICAgYml0QnVmZmVyLnB1dChBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pLCA2KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWxwaGFudW1lcmljRGF0YVxuIiwiZnVuY3Rpb24gQml0QnVmZmVyICgpIHtcbiAgdGhpcy5idWZmZXIgPSBbXVxuICB0aGlzLmxlbmd0aCA9IDBcbn1cblxuQml0QnVmZmVyLnByb3RvdHlwZSA9IHtcblxuICBnZXQ6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyA4KVxuICAgIHJldHVybiAoKHRoaXMuYnVmZmVyW2J1ZkluZGV4XSA+Pj4gKDcgLSBpbmRleCAlIDgpKSAmIDEpID09PSAxXG4gIH0sXG5cbiAgcHV0OiBmdW5jdGlvbiAobnVtLCBsZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnB1dEJpdCgoKG51bSA+Pj4gKGxlbmd0aCAtIGkgLSAxKSkgJiAxKSA9PT0gMSlcbiAgICB9XG4gIH0sXG5cbiAgZ2V0TGVuZ3RoSW5CaXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoXG4gIH0sXG5cbiAgcHV0Qml0OiBmdW5jdGlvbiAoYml0KSB7XG4gICAgdmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmxlbmd0aCAvIDgpXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xuICAgICAgdGhpcy5idWZmZXIucHVzaCgwKVxuICAgIH1cblxuICAgIGlmIChiaXQpIHtcbiAgICAgIHRoaXMuYnVmZmVyW2J1ZkluZGV4XSB8PSAoMHg4MCA+Pj4gKHRoaXMubGVuZ3RoICUgOCkpXG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGgrK1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQml0QnVmZmVyXG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnLi4vdXRpbHMvYnVmZmVyJylcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIFFSIENvZGUgc3ltYm9sIG1vZHVsZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2l6ZSBTeW1ib2wgc2l6ZVxuICovXG5mdW5jdGlvbiBCaXRNYXRyaXggKHNpemUpIHtcbiAgaWYgKCFzaXplIHx8IHNpemUgPCAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCaXRNYXRyaXggc2l6ZSBtdXN0IGJlIGRlZmluZWQgYW5kIGdyZWF0ZXIgdGhhbiAwJylcbiAgfVxuXG4gIHRoaXMuc2l6ZSA9IHNpemVcbiAgdGhpcy5kYXRhID0gbmV3IEJ1ZmZlcihzaXplICogc2l6ZSlcbiAgdGhpcy5kYXRhLmZpbGwoMClcbiAgdGhpcy5yZXNlcnZlZEJpdCA9IG5ldyBCdWZmZXIoc2l6ZSAqIHNpemUpXG4gIHRoaXMucmVzZXJ2ZWRCaXQuZmlsbCgwKVxufVxuXG4vKipcbiAqIFNldCBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiBJZiByZXNlcnZlZCBmbGFnIGlzIHNldCwgdGhpcyBiaXQgd2lsbCBiZSBpZ25vcmVkIGR1cmluZyBtYXNraW5nIHByb2Nlc3NcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXJ2ZWRcbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlLCByZXNlcnZlZCkge1xuICB2YXIgaW5kZXggPSByb3cgKiB0aGlzLnNpemUgKyBjb2xcbiAgdGhpcy5kYXRhW2luZGV4XSA9IHZhbHVlXG4gIGlmIChyZXNlcnZlZCkgdGhpcy5yZXNlcnZlZEJpdFtpbmRleF0gPSB0cnVlXG59XG5cbi8qKlxuICogUmV0dXJucyBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgcm93XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBjb2xcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmRhdGFbcm93ICogdGhpcy5zaXplICsgY29sXVxufVxuXG4vKipcbiAqIEFwcGxpZXMgeG9yIG9wZXJhdG9yIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICogKHVzZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2VzcylcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlKSB7XG4gIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdIF49IHZhbHVlXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYml0IGF0IHNwZWNpZmllZCBsb2NhdGlvbiBpcyByZXNlcnZlZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICAgY29sXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLmlzUmVzZXJ2ZWQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMucmVzZXJ2ZWRCaXRbcm93ICogdGhpcy5zaXplICsgY29sXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJpdE1hdHJpeFxuIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1ZmZlcicpXG52YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbmZ1bmN0aW9uIEJ5dGVEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuQllURVxuICB0aGlzLmRhdGEgPSBuZXcgQnVmZmVyKGRhdGEpXG59XG5cbkJ5dGVEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIGxlbmd0aCAqIDhcbn1cblxuQnl0ZURhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgYml0QnVmZmVyLnB1dCh0aGlzLmRhdGFbaV0sIDgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCeXRlRGF0YVxuIiwidmFyIEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxyXG5cclxudmFyIEVDX0JMT0NLU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAyLCAyLFxyXG4gIDEsIDIsIDIsIDQsXHJcbiAgMSwgMiwgNCwgNCxcclxuICAyLCA0LCA0LCA0LFxyXG4gIDIsIDQsIDYsIDUsXHJcbiAgMiwgNCwgNiwgNixcclxuICAyLCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgMTEsXHJcbiAgNCwgOCwgMTAsIDExLFxyXG4gIDQsIDksIDEyLCAxNixcclxuICA0LCA5LCAxNiwgMTYsXHJcbiAgNiwgMTAsIDEyLCAxOCxcclxuICA2LCAxMCwgMTcsIDE2LFxyXG4gIDYsIDExLCAxNiwgMTksXHJcbiAgNiwgMTMsIDE4LCAyMSxcclxuICA3LCAxNCwgMjEsIDI1LFxyXG4gIDgsIDE2LCAyMCwgMjUsXHJcbiAgOCwgMTcsIDIzLCAyNSxcclxuICA5LCAxNywgMjMsIDM0LFxyXG4gIDksIDE4LCAyNSwgMzAsXHJcbiAgMTAsIDIwLCAyNywgMzIsXHJcbiAgMTIsIDIxLCAyOSwgMzUsXHJcbiAgMTIsIDIzLCAzNCwgMzcsXHJcbiAgMTIsIDI1LCAzNCwgNDAsXHJcbiAgMTMsIDI2LCAzNSwgNDIsXHJcbiAgMTQsIDI4LCAzOCwgNDUsXHJcbiAgMTUsIDI5LCA0MCwgNDgsXHJcbiAgMTYsIDMxLCA0MywgNTEsXHJcbiAgMTcsIDMzLCA0NSwgNTQsXHJcbiAgMTgsIDM1LCA0OCwgNTcsXHJcbiAgMTksIDM3LCA1MSwgNjAsXHJcbiAgMTksIDM4LCA1MywgNjMsXHJcbiAgMjAsIDQwLCA1NiwgNjYsXHJcbiAgMjEsIDQzLCA1OSwgNzAsXHJcbiAgMjIsIDQ1LCA2MiwgNzQsXHJcbiAgMjQsIDQ3LCA2NSwgNzcsXHJcbiAgMjUsIDQ5LCA2OCwgODFcclxuXVxyXG5cclxudmFyIEVDX0NPREVXT1JEU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDcsIDEwLCAxMywgMTcsXHJcbiAgMTAsIDE2LCAyMiwgMjgsXHJcbiAgMTUsIDI2LCAzNiwgNDQsXHJcbiAgMjAsIDM2LCA1MiwgNjQsXHJcbiAgMjYsIDQ4LCA3MiwgODgsXHJcbiAgMzYsIDY0LCA5NiwgMTEyLFxyXG4gIDQwLCA3MiwgMTA4LCAxMzAsXHJcbiAgNDgsIDg4LCAxMzIsIDE1NixcclxuICA2MCwgMTEwLCAxNjAsIDE5MixcclxuICA3MiwgMTMwLCAxOTIsIDIyNCxcclxuICA4MCwgMTUwLCAyMjQsIDI2NCxcclxuICA5NiwgMTc2LCAyNjAsIDMwOCxcclxuICAxMDQsIDE5OCwgMjg4LCAzNTIsXHJcbiAgMTIwLCAyMTYsIDMyMCwgMzg0LFxyXG4gIDEzMiwgMjQwLCAzNjAsIDQzMixcclxuICAxNDQsIDI4MCwgNDA4LCA0ODAsXHJcbiAgMTY4LCAzMDgsIDQ0OCwgNTMyLFxyXG4gIDE4MCwgMzM4LCA1MDQsIDU4OCxcclxuICAxOTYsIDM2NCwgNTQ2LCA2NTAsXHJcbiAgMjI0LCA0MTYsIDYwMCwgNzAwLFxyXG4gIDIyNCwgNDQyLCA2NDQsIDc1MCxcclxuICAyNTIsIDQ3NiwgNjkwLCA4MTYsXHJcbiAgMjcwLCA1MDQsIDc1MCwgOTAwLFxyXG4gIDMwMCwgNTYwLCA4MTAsIDk2MCxcclxuICAzMTIsIDU4OCwgODcwLCAxMDUwLFxyXG4gIDMzNiwgNjQ0LCA5NTIsIDExMTAsXHJcbiAgMzYwLCA3MDAsIDEwMjAsIDEyMDAsXHJcbiAgMzkwLCA3MjgsIDEwNTAsIDEyNjAsXHJcbiAgNDIwLCA3ODQsIDExNDAsIDEzNTAsXHJcbiAgNDUwLCA4MTIsIDEyMDAsIDE0NDAsXHJcbiAgNDgwLCA4NjgsIDEyOTAsIDE1MzAsXHJcbiAgNTEwLCA5MjQsIDEzNTAsIDE2MjAsXHJcbiAgNTQwLCA5ODAsIDE0NDAsIDE3MTAsXHJcbiAgNTcwLCAxMDM2LCAxNTMwLCAxODAwLFxyXG4gIDU3MCwgMTA2NCwgMTU5MCwgMTg5MCxcclxuICA2MDAsIDExMjAsIDE2ODAsIDE5ODAsXHJcbiAgNjMwLCAxMjA0LCAxNzcwLCAyMTAwLFxyXG4gIDY2MCwgMTI2MCwgMTg2MCwgMjIyMCxcclxuICA3MjAsIDEzMTYsIDE5NTAsIDIzMTAsXHJcbiAgNzUwLCAxMzcyLCAyMDQwLCAyNDMwXHJcbl1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBibG9jayB0aGF0IHRoZSBRUiBDb2RlIHNob3VsZCBjb250YWluXHJcbiAqIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIE51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2Nrc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRCbG9ja3NDb3VudCA9IGZ1bmN0aW9uIGdldEJsb2Nrc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgdG8gdXNlIGZvciB0aGUgc3BlY2lmaWVkXHJcbiAqIHZlcnNpb24gYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIE51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRUb3RhbENvZGV3b3Jkc0NvdW50ID0gZnVuY3Rpb24gZ2V0VG90YWxDb2Rld29yZHNDb3VudCAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBzd2l0Y2ggKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlIEVDTGV2ZWwuTDpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDBdXHJcbiAgICBjYXNlIEVDTGV2ZWwuTTpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDFdXHJcbiAgICBjYXNlIEVDTGV2ZWwuUTpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDJdXHJcbiAgICBjYXNlIEVDTGV2ZWwuSDpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDNdXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcbiIsImV4cG9ydHMuTCA9IHsgYml0OiAxIH1cbmV4cG9ydHMuTSA9IHsgYml0OiAwIH1cbmV4cG9ydHMuUSA9IHsgYml0OiAzIH1cbmV4cG9ydHMuSCA9IHsgYml0OiAyIH1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcbiAgfVxuXG4gIHZhciBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXG5cbiAgc3dpdGNoIChsY1N0cikge1xuICAgIGNhc2UgJ2wnOlxuICAgIGNhc2UgJ2xvdyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5MXG5cbiAgICBjYXNlICdtJzpcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTVxuXG4gICAgY2FzZSAncSc6XG4gICAgY2FzZSAncXVhcnRpbGUnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuUVxuXG4gICAgY2FzZSAnaCc6XG4gICAgY2FzZSAnaGlnaCc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5IXG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIEVDIExldmVsOiAnICsgc3RyaW5nKVxuICB9XG59XG5cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKGxldmVsKSB7XG4gIHJldHVybiBsZXZlbCAmJiB0eXBlb2YgbGV2ZWwuYml0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIGxldmVsLmJpdCA+PSAwICYmIGxldmVsLmJpdCA8IDRcbn1cblxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfVxufVxuIiwidmFyIGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxudmFyIEZJTkRFUl9QQVRURVJOX1NJWkUgPSA3XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBmaW5kZXIgcGF0dGVybi5cbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgdG9wLWxlZnQgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVzXG4gKi9cbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XG4gIHZhciBzaXplID0gZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxuXG4gIHJldHVybiBbXG4gICAgLy8gdG9wLWxlZnRcbiAgICBbMCwgMF0sXG4gICAgLy8gdG9wLXJpZ2h0XG4gICAgW3NpemUgLSBGSU5ERVJfUEFUVEVSTl9TSVpFLCAwXSxcbiAgICAvLyBib3R0b20tbGVmdFxuICAgIFswLCBzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRV1cbiAgXVxufVxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbnZhciBHMTUgPSAoMSA8PCAxMCkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgNCkgfCAoMSA8PCAyKSB8ICgxIDw8IDEpIHwgKDEgPDwgMClcbnZhciBHMTVfTUFTSyA9ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDQpIHwgKDEgPDwgMSlcbnZhciBHMTVfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE1KVxuXG4vKipcbiAqIFJldHVybnMgZm9ybWF0IGluZm9ybWF0aW9uIHdpdGggcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogVGhlIGZvcm1hdCBpbmZvcm1hdGlvbiBpcyBhIDE1LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDUgZGF0YSBiaXRzLFxuICogd2l0aCAxMCBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE1LCA1KSBCQ0ggY29kZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge051bWJlcn0gbWFzayAgICAgICAgICAgICAgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIEVuY29kZWQgZm9ybWF0IGluZm9ybWF0aW9uIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzIChlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFzaykge1xuICB2YXIgZGF0YSA9ICgoZXJyb3JDb3JyZWN0aW9uTGV2ZWwuYml0IDw8IDMpIHwgbWFzaylcbiAgdmFyIGQgPSBkYXRhIDw8IDEwXG5cbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCA+PSAwKSB7XG4gICAgZCBePSAoRzE1IDw8IChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxNV9CQ0gpKVxuICB9XG5cbiAgLy8geG9yIGZpbmFsIGRhdGEgd2l0aCBtYXNrIHBhdHRlcm4gaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXRcbiAgLy8gbm8gY29tYmluYXRpb24gb2YgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBhbmQgZGF0YSBtYXNrIHBhdHRlcm5cbiAgLy8gd2lsbCByZXN1bHQgaW4gYW4gYWxsLXplcm8gZGF0YSBzdHJpbmdcbiAgcmV0dXJuICgoZGF0YSA8PCAxMCkgfCBkKSBeIEcxNV9NQVNLXG59XG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnLi4vdXRpbHMvYnVmZmVyJylcblxudmFyIEVYUF9UQUJMRSA9IG5ldyBCdWZmZXIoNTEyKVxudmFyIExPR19UQUJMRSA9IG5ldyBCdWZmZXIoMjU2KVxuXG4vKipcbiAqIFByZWNvbXB1dGUgdGhlIGxvZyBhbmQgYW50aS1sb2cgdGFibGVzIGZvciBmYXN0ZXIgY29tcHV0YXRpb24gbGF0ZXJcbiAqXG4gKiBGb3IgZWFjaCBwb3NzaWJsZSB2YWx1ZSBpbiB0aGUgZ2Fsb2lzIGZpZWxkIDJeOCwgd2Ugd2lsbCBwcmUtY29tcHV0ZVxuICogdGhlIGxvZ2FyaXRobSBhbmQgYW50aS1sb2dhcml0aG0gKGV4cG9uZW50aWFsKSBvZiB0aGlzIHZhbHVlXG4gKlxuICogcmVmIHtAbGluayBodHRwczovL2VuLndpa2l2ZXJzaXR5Lm9yZy93aWtpL1JlZWQlRTIlODAlOTNTb2xvbW9uX2NvZGVzX2Zvcl9jb2RlcnMjSW50cm9kdWN0aW9uX3RvX21hdGhlbWF0aWNhbF9maWVsZHN9XG4gKi9cbjsoZnVuY3Rpb24gaW5pdFRhYmxlcyAoKSB7XG4gIHZhciB4ID0gMVxuICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XG4gICAgRVhQX1RBQkxFW2ldID0geFxuICAgIExPR19UQUJMRVt4XSA9IGlcblxuICAgIHggPDw9IDEgLy8gbXVsdGlwbHkgYnkgMlxuXG4gICAgLy8gVGhlIFFSIGNvZGUgc3BlY2lmaWNhdGlvbiBzYXlzIHRvIHVzZSBieXRlLXdpc2UgbW9kdWxvIDEwMDAxMTEwMSBhcml0aG1ldGljLlxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB3aGVuIGEgbnVtYmVyIGlzIDI1NiBvciBsYXJnZXIsIGl0IHNob3VsZCBiZSBYT1JlZCB3aXRoIDB4MTFELlxuICAgIGlmICh4ICYgMHgxMDApIHsgLy8gc2ltaWxhciB0byB4ID49IDI1NiwgYnV0IGEgbG90IGZhc3RlciAoYmVjYXVzZSAweDEwMCA9PSAyNTYpXG4gICAgICB4IF49IDB4MTFEXG4gICAgfVxuICB9XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBkb3VibGUgdGhlIHNpemUgb2YgdGhlIGFudGktbG9nIHRhYmxlIHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBtb2QgMjU1IHRvXG4gIC8vIHN0YXkgaW5zaWRlIHRoZSBib3VuZHMgKGJlY2F1c2Ugd2Ugd2lsbCBtYWlubHkgdXNlIHRoaXMgdGFibGUgZm9yIHRoZSBtdWx0aXBsaWNhdGlvbiBvZlxuICAvLyB0d28gR0YgbnVtYmVycywgbm8gbW9yZSkuXG4gIC8vIEBzZWUge0BsaW5rIG11bH1cbiAgZm9yIChpID0gMjU1OyBpIDwgNTEyOyBpKyspIHtcbiAgICBFWFBfVEFCTEVbaV0gPSBFWFBfVEFCTEVbaSAtIDI1NV1cbiAgfVxufSgpKVxuXG4vKipcbiAqIFJldHVybnMgbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uIGxvZyAobikge1xuICBpZiAobiA8IDEpIHRocm93IG5ldyBFcnJvcignbG9nKCcgKyBuICsgJyknKVxuICByZXR1cm4gTE9HX1RBQkxFW25dXG59XG5cbi8qKlxuICogUmV0dXJucyBhbnRpLWxvZyB2YWx1ZSBvZiBuIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5leHAgPSBmdW5jdGlvbiBleHAgKG4pIHtcbiAgcmV0dXJuIEVYUF9UQUJMRVtuXVxufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG51bWJlciBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHgsIHkpIHtcbiAgaWYgKHggPT09IDAgfHwgeSA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBzaG91bGQgYmUgRVhQX1RBQkxFWyhMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV0pICUgMjU1XSBpZiBFWFBfVEFCTEUgd2Fzbid0IG92ZXJzaXplZFxuICAvLyBAc2VlIHtAbGluayBpbml0VGFibGVzfVxuICByZXR1cm4gRVhQX1RBQkxFW0xPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XV1cbn1cbiIsInZhciBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBLYW5qaURhdGEgKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gTW9kZS5LQU5KSVxuICB0aGlzLmRhdGEgPSBkYXRhXG59XG5cbkthbmppRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiBsZW5ndGggKiAxM1xufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcbiAgdmFyIGlcblxuICAvLyBJbiB0aGUgU2hpZnQgSklTIHN5c3RlbSwgS2FuamkgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgYSB0d28gYnl0ZSBjb21iaW5hdGlvbi5cbiAgLy8gVGhlc2UgYnl0ZSB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXG4gIC8vIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdmFsdWUgPSBVdGlscy50b1NKSVModGhpcy5kYXRhW2ldKVxuXG4gICAgLy8gRm9yIGNoYXJhY3RlcnMgd2l0aCBTaGlmdCBKSVMgdmFsdWVzIGZyb20gMHg4MTQwIHRvIDB4OUZGQzpcbiAgICBpZiAodmFsdWUgPj0gMHg4MTQwICYmIHZhbHVlIDw9IDB4OUZGQykge1xuICAgICAgLy8gU3VidHJhY3QgMHg4MTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXG4gICAgICB2YWx1ZSAtPSAweDgxNDBcblxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4RTA0MCB0byAweEVCQkZcbiAgICB9IGVsc2UgaWYgKHZhbHVlID49IDB4RTA0MCAmJiB2YWx1ZSA8PSAweEVCQkYpIHtcbiAgICAgIC8vIFN1YnRyYWN0IDB4QzE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxuICAgICAgdmFsdWUgLT0gMHhDMTQwXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFsaWQgU0pJUyBjaGFyYWN0ZXI6ICcgKyB0aGlzLmRhdGFbaV0gKyAnXFxuJyArXG4gICAgICAgICdNYWtlIHN1cmUgeW91ciBjaGFyc2V0IGlzIFVURi04JylcbiAgICB9XG5cbiAgICAvLyBNdWx0aXBseSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgcmVzdWx0IGJ5IDB4QzBcbiAgICAvLyBhbmQgYWRkIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgdG8gcHJvZHVjdFxuICAgIHZhbHVlID0gKCgodmFsdWUgPj4+IDgpICYgMHhmZikgKiAweEMwKSArICh2YWx1ZSAmIDB4ZmYpXG5cbiAgICAvLyBDb252ZXJ0IHJlc3VsdCB0byBhIDEzLWJpdCBiaW5hcnkgc3RyaW5nXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTMpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBLYW5qaURhdGFcbiIsIi8qKlxuICogRGF0YSBtYXNrIHBhdHRlcm4gcmVmZXJlbmNlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLlBhdHRlcm5zID0ge1xuICBQQVRURVJOMDAwOiAwLFxuICBQQVRURVJOMDAxOiAxLFxuICBQQVRURVJOMDEwOiAyLFxuICBQQVRURVJOMDExOiAzLFxuICBQQVRURVJOMTAwOiA0LFxuICBQQVRURVJOMTAxOiA1LFxuICBQQVRURVJOMTEwOiA2LFxuICBQQVRURVJOMTExOiA3XG59XG5cbi8qKlxuICogV2VpZ2h0ZWQgcGVuYWx0eSBzY29yZXMgZm9yIHRoZSB1bmRlc2lyYWJsZSBmZWF0dXJlc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIFBlbmFsdHlTY29yZXMgPSB7XG4gIE4xOiAzLFxuICBOMjogMyxcbiAgTjM6IDQwLFxuICBONDogMTBcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBtYXNrIHBhdHRlcm4gdmFsdWUgaXMgdmFsaWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBtYXNrICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobWFzaykge1xuICByZXR1cm4gbWFzayAmJiBtYXNrICE9PSAnJyAmJiAhaXNOYU4obWFzaykgJiYgbWFzayA+PSAwICYmIG1hc2sgPD0gN1xufVxuXG4vKipcbiAqIFJldHVybnMgbWFzayBwYXR0ZXJuIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCB2YWxpZCwgcmV0dXJucyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgTWFzayBwYXR0ZXJuIHZhbHVlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgVmFsaWQgbWFzayBwYXR0ZXJuIG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSkge1xuICByZXR1cm4gZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB1bmRlZmluZWRcbn1cblxuLyoqXG4qIEZpbmQgYWRqYWNlbnQgbW9kdWxlcyBpbiByb3cvY29sdW1uIHdpdGggdGhlIHNhbWUgY29sb3JcbiogYW5kIGFzc2lnbiBhIHBlbmFsdHkgdmFsdWUuXG4qXG4qIFBvaW50czogTjEgKyBpXG4qIGkgaXMgdGhlIGFtb3VudCBieSB3aGljaCB0aGUgbnVtYmVyIG9mIGFkamFjZW50IG1vZHVsZXMgb2YgdGhlIHNhbWUgY29sb3IgZXhjZWVkcyA1XG4qL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjEgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjEgKGRhdGEpIHtcbiAgdmFyIHNpemUgPSBkYXRhLnNpemVcbiAgdmFyIHBvaW50cyA9IDBcbiAgdmFyIHNhbWVDb3VudENvbCA9IDBcbiAgdmFyIHNhbWVDb3VudFJvdyA9IDBcbiAgdmFyIGxhc3RDb2wgPSBudWxsXG4gIHZhciBsYXN0Um93ID0gbnVsbFxuXG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgc2FtZUNvdW50Q29sID0gc2FtZUNvdW50Um93ID0gMFxuICAgIGxhc3RDb2wgPSBsYXN0Um93ID0gbnVsbFxuXG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICAgIHZhciBtb2R1bGUgPSBkYXRhLmdldChyb3csIGNvbClcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RDb2wpIHtcbiAgICAgICAgc2FtZUNvdW50Q29sKytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcbiAgICAgICAgbGFzdENvbCA9IG1vZHVsZVxuICAgICAgICBzYW1lQ291bnRDb2wgPSAxXG4gICAgICB9XG5cbiAgICAgIG1vZHVsZSA9IGRhdGEuZ2V0KGNvbCwgcm93KVxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdFJvdykge1xuICAgICAgICBzYW1lQ291bnRSb3crK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxuICAgICAgICBsYXN0Um93ID0gbW9kdWxlXG4gICAgICAgIHNhbWVDb3VudFJvdyA9IDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXG4gICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxuICB9XG5cbiAgcmV0dXJuIHBvaW50c1xufVxuXG4vKipcbiAqIEZpbmQgMngyIGJsb2NrcyB3aXRoIHRoZSBzYW1lIGNvbG9yIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlXG4gKlxuICogUG9pbnRzOiBOMiAqIChtIC0gMSkgKiAobiAtIDEpXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4yID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4yIChkYXRhKSB7XG4gIHZhciBzaXplID0gZGF0YS5zaXplXG4gIHZhciBwb2ludHMgPSAwXG5cbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2l6ZSAtIDE7IHJvdysrKSB7XG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2l6ZSAtIDE7IGNvbCsrKSB7XG4gICAgICB2YXIgbGFzdCA9IGRhdGEuZ2V0KHJvdywgY29sKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdywgY29sICsgMSkgK1xuICAgICAgICBkYXRhLmdldChyb3cgKyAxLCBjb2wpICtcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sICsgMSlcblxuICAgICAgaWYgKGxhc3QgPT09IDQgfHwgbGFzdCA9PT0gMCkgcG9pbnRzKytcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9pbnRzICogUGVuYWx0eVNjb3Jlcy5OMlxufVxuXG4vKipcbiAqIEZpbmQgMToxOjM6MToxIHJhdGlvIChkYXJrOmxpZ2h0OmRhcms6bGlnaHQ6ZGFyaykgcGF0dGVybiBpbiByb3cvY29sdW1uLFxuICogcHJlY2VkZWQgb3IgZm9sbG93ZWQgYnkgbGlnaHQgYXJlYSA0IG1vZHVsZXMgd2lkZVxuICpcbiAqIFBvaW50czogTjMgKiBudW1iZXIgb2YgcGF0dGVybiBmb3VuZFxuICovXG5leHBvcnRzLmdldFBlbmFsdHlOMyA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMyAoZGF0YSkge1xuICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZVxuICB2YXIgcG9pbnRzID0gMFxuICB2YXIgYml0c0NvbCA9IDBcbiAgdmFyIGJpdHNSb3cgPSAwXG5cbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICBiaXRzQ29sID0gYml0c1JvdyA9IDBcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgICAgYml0c0NvbCA9ICgoYml0c0NvbCA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KHJvdywgY29sKVxuICAgICAgaWYgKGNvbCA+PSAxMCAmJiAoYml0c0NvbCA9PT0gMHg1RDAgfHwgYml0c0NvbCA9PT0gMHgwNUQpKSBwb2ludHMrK1xuXG4gICAgICBiaXRzUm93ID0gKChiaXRzUm93IDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQoY29sLCByb3cpXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzUm93ID09PSAweDVEMCB8fCBiaXRzUm93ID09PSAweDA1RCkpIHBvaW50cysrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjNcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXMgaW4gZW50aXJlIHN5bWJvbFxuICpcbiAqIFBvaW50czogTjQgKiBrXG4gKlxuICogayBpcyB0aGUgcmF0aW5nIG9mIHRoZSBkZXZpYXRpb24gb2YgdGhlIHByb3BvcnRpb24gb2YgZGFyayBtb2R1bGVzXG4gKiBpbiB0aGUgc3ltYm9sIGZyb20gNTAlIGluIHN0ZXBzIG9mIDUlXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU40ID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU40IChkYXRhKSB7XG4gIHZhciBkYXJrQ291bnQgPSAwXG4gIHZhciBtb2R1bGVzQ291bnQgPSBkYXRhLmRhdGEubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2R1bGVzQ291bnQ7IGkrKykgZGFya0NvdW50ICs9IGRhdGEuZGF0YVtpXVxuXG4gIHZhciBrID0gTWF0aC5hYnMoTWF0aC5jZWlsKChkYXJrQ291bnQgKiAxMDAgLyBtb2R1bGVzQ291bnQpIC8gNSkgLSAxMClcblxuICByZXR1cm4gayAqIFBlbmFsdHlTY29yZXMuTjRcbn1cblxuLyoqXG4gKiBSZXR1cm4gbWFzayB2YWx1ZSBhdCBnaXZlbiBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbWFza1BhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgdmFsdWVcbiAqIEBwYXJhbSAge051bWJlcn0gaSAgICAgICAgICAgUm93XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGogICAgICAgICAgIENvbHVtblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICBNYXNrIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGdldE1hc2tBdCAobWFza1BhdHRlcm4sIGksIGopIHtcbiAgc3dpdGNoIChtYXNrUGF0dGVybikge1xuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAwOiByZXR1cm4gKGkgKyBqKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAwMTogcmV0dXJuIGkgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMTA6IHJldHVybiBqICUgMyA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDExOiByZXR1cm4gKGkgKyBqKSAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMDogcmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMTogcmV0dXJuIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMDogcmV0dXJuICgoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMTogcmV0dXJuICgoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT09IDBcblxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybilcbiAgfVxufVxuXG4vKipcbiAqIEFwcGx5IGEgbWFzayBwYXR0ZXJuIHRvIGEgQml0TWF0cml4XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgICBwYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhICAgIEJpdE1hdHJpeCBkYXRhXG4gKi9cbmV4cG9ydHMuYXBwbHlNYXNrID0gZnVuY3Rpb24gYXBwbHlNYXNrIChwYXR0ZXJuLCBkYXRhKSB7XG4gIHZhciBzaXplID0gZGF0YS5zaXplXG5cbiAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgICAgaWYgKGRhdGEuaXNSZXNlcnZlZChyb3csIGNvbCkpIGNvbnRpbnVlXG4gICAgICBkYXRhLnhvcihyb3csIGNvbCwgZ2V0TWFza0F0KHBhdHRlcm4sIHJvdywgY29sKSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiZXN0IG1hc2sgcGF0dGVybiBmb3IgZGF0YVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YVxuICogQHJldHVybiB7TnVtYmVyfSBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxuICovXG5leHBvcnRzLmdldEJlc3RNYXNrID0gZnVuY3Rpb24gZ2V0QmVzdE1hc2sgKGRhdGEsIHNldHVwRm9ybWF0RnVuYykge1xuICB2YXIgbnVtUGF0dGVybnMgPSBPYmplY3Qua2V5cyhleHBvcnRzLlBhdHRlcm5zKS5sZW5ndGhcbiAgdmFyIGJlc3RQYXR0ZXJuID0gMFxuICB2YXIgbG93ZXJQZW5hbHR5ID0gSW5maW5pdHlcblxuICBmb3IgKHZhciBwID0gMDsgcCA8IG51bVBhdHRlcm5zOyBwKyspIHtcbiAgICBzZXR1cEZvcm1hdEZ1bmMocClcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxuXG4gICAgLy8gQ2FsY3VsYXRlIHBlbmFsdHlcbiAgICB2YXIgcGVuYWx0eSA9XG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMShkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMihkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMyhkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlONChkYXRhKVxuXG4gICAgLy8gVW5kbyBwcmV2aW91c2x5IGFwcGxpZWQgbWFza1xuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXG5cbiAgICBpZiAocGVuYWx0eSA8IGxvd2VyUGVuYWx0eSkge1xuICAgICAgbG93ZXJQZW5hbHR5ID0gcGVuYWx0eVxuICAgICAgYmVzdFBhdHRlcm4gPSBwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJlc3RQYXR0ZXJuXG59XG4iLCJ2YXIgVmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpXG52YXIgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcblxuLyoqXG4gKiBOdW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gdGhlIGRlY2ltYWwgZGlnaXQgc2V0ICgwIC0gOSlcbiAqIChieXRlIHZhbHVlcyAzMEhFWCB0byAzOUhFWCkuXG4gKiBOb3JtYWxseSwgMyBkYXRhIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IDEwIGJpdHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5OVU1FUklDID0ge1xuICBpZDogJ051bWVyaWMnLFxuICBiaXQ6IDEgPDwgMCxcbiAgY2NCaXRzOiBbMTAsIDEyLCAxNF1cbn1cblxuLyoqXG4gKiBBbHBoYW51bWVyaWMgbW9kZSBlbmNvZGVzIGRhdGEgZnJvbSBhIHNldCBvZiA0NSBjaGFyYWN0ZXJzLFxuICogaS5lLiAxMCBudW1lcmljIGRpZ2l0cyAoMCAtIDkpLFxuICogICAgICAyNiBhbHBoYWJldGljIGNoYXJhY3RlcnMgKEEgLSBaKSxcbiAqICAgYW5kIDkgc3ltYm9scyAoU1AsICQsICUsICosICssIC0sIC4sIC8sIDopLlxuICogTm9ybWFsbHksIHR3byBpbnB1dCBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMSBiaXRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuQUxQSEFOVU1FUklDID0ge1xuICBpZDogJ0FscGhhbnVtZXJpYycsXG4gIGJpdDogMSA8PCAxLFxuICBjY0JpdHM6IFs5LCAxMSwgMTNdXG59XG5cbi8qKlxuICogSW4gYnl0ZSBtb2RlLCBkYXRhIGlzIGVuY29kZWQgYXQgOCBiaXRzIHBlciBjaGFyYWN0ZXIuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5CWVRFID0ge1xuICBpZDogJ0J5dGUnLFxuICBiaXQ6IDEgPDwgMixcbiAgY2NCaXRzOiBbOCwgMTYsIDE2XVxufVxuXG4vKipcbiAqIFRoZSBLYW5qaSBtb2RlIGVmZmljaWVudGx5IGVuY29kZXMgS2FuamkgY2hhcmFjdGVycyBpbiBhY2NvcmRhbmNlIHdpdGhcbiAqIHRoZSBTaGlmdCBKSVMgc3lzdGVtIGJhc2VkIG9uIEpJUyBYIDAyMDguXG4gKiBUaGUgU2hpZnQgSklTIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cbiAqIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXG4gKiBFYWNoIHR3by1ieXRlIGNoYXJhY3RlciB2YWx1ZSBpcyBjb21wYWN0ZWQgdG8gYSAxMy1iaXQgYmluYXJ5IGNvZGV3b3JkLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuS0FOSkkgPSB7XG4gIGlkOiAnS2FuamknLFxuICBiaXQ6IDEgPDwgMyxcbiAgY2NCaXRzOiBbOCwgMTAsIDEyXVxufVxuXG4vKipcbiAqIE1peGVkIG1vZGUgd2lsbCBjb250YWluIGEgc2VxdWVuY2VzIG9mIGRhdGEgaW4gYSBjb21iaW5hdGlvbiBvZiBhbnkgb2ZcbiAqIHRoZSBtb2RlcyBkZXNjcmliZWQgYWJvdmVcbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLk1JWEVEID0ge1xuICBiaXQ6IC0xXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHN0b3JlIHRoZSBkYXRhIGxlbmd0aFxuICogYWNjb3JkaW5nIHRvIFFSIENvZGUgc3BlY2lmaWNhdGlvbnMuXG4gKlxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgIERhdGEgbW9kZVxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIE51bWJlciBvZiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0Q2hhckNvdW50SW5kaWNhdG9yID0gZnVuY3Rpb24gZ2V0Q2hhckNvdW50SW5kaWNhdG9yIChtb2RlLCB2ZXJzaW9uKSB7XG4gIGlmICghbW9kZS5jY0JpdHMpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlOiAnICsgbW9kZSlcblxuICBpZiAoIVZlcnNpb24uaXNWYWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJzaW9uOiAnICsgdmVyc2lvbilcbiAgfVxuXG4gIGlmICh2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8IDEwKSByZXR1cm4gbW9kZS5jY0JpdHNbMF1cbiAgZWxzZSBpZiAodmVyc2lvbiA8IDI3KSByZXR1cm4gbW9kZS5jY0JpdHNbMV1cbiAgcmV0dXJuIG1vZGUuY2NCaXRzWzJdXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbW9zdCBlZmZpY2llbnQgbW9kZSB0byBzdG9yZSB0aGUgc3BlY2lmaWVkIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgZGF0YSBzdHJpbmdcbiAqIEByZXR1cm4ge01vZGV9ICAgICAgICAgICBCZXN0IG1vZGVcbiAqL1xuZXhwb3J0cy5nZXRCZXN0TW9kZUZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0TW9kZUZvckRhdGEgKGRhdGFTdHIpIHtcbiAgaWYgKFJlZ2V4LnRlc3ROdW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5OVU1FUklDXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RBbHBoYW51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xuICBlbHNlIGlmIChSZWdleC50ZXN0S2FuamkoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLktBTkpJXG4gIGVsc2UgcmV0dXJuIGV4cG9ydHMuQllURVxufVxuXG4vKipcbiAqIFJldHVybiBtb2RlIG5hbWUgYXMgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtNb2RlfSBtb2RlIE1vZGUgb2JqZWN0XG4gKiBAcmV0dXJucyB7U3RyaW5nfSAgTW9kZSBuYW1lXG4gKi9cbmV4cG9ydHMudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAobW9kZSkge1xuICBpZiAobW9kZSAmJiBtb2RlLmlkKSByZXR1cm4gbW9kZS5pZFxuICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZScpXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgaW5wdXQgcGFyYW0gaXMgYSB2YWxpZCBtb2RlIG9iamVjdFxuICpcbiAqIEBwYXJhbSAgIHtNb2RlfSAgICBtb2RlIE1vZGUgb2JqZWN0XG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB2YWxpZCBtb2RlLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobW9kZSkge1xuICByZXR1cm4gbW9kZSAmJiBtb2RlLmJpdCAmJiBtb2RlLmNjQml0c1xufVxuXG4vKipcbiAqIEdldCBtb2RlIG9iamVjdCBmcm9tIGl0cyBuYW1lXG4gKlxuICogQHBhcmFtICAge1N0cmluZ30gc3RyaW5nIE1vZGUgbmFtZVxuICogQHJldHVybnMge01vZGV9ICAgICAgICAgIE1vZGUgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXG4gIH1cblxuICB2YXIgbGNTdHIgPSBzdHJpbmcudG9Mb3dlckNhc2UoKVxuXG4gIHN3aXRjaCAobGNTdHIpIHtcbiAgICBjYXNlICdudW1lcmljJzpcbiAgICAgIHJldHVybiBleHBvcnRzLk5VTUVSSUNcbiAgICBjYXNlICdhbHBoYW51bWVyaWMnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuQUxQSEFOVU1FUklDXG4gICAgY2FzZSAna2FuamknOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuS0FOSklcbiAgICBjYXNlICdieXRlJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkJZVEVcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG1vZGU6ICcgKyBzdHJpbmcpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1vZGUgZnJvbSBhIHZhbHVlLlxuICogSWYgdmFsdWUgaXMgbm90IGEgdmFsaWQgbW9kZSwgcmV0dXJucyBkZWZhdWx0VmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtNb2RlfFN0cmluZ30gdmFsdWUgICAgICAgIEVuY29kaW5nIG1vZGVcbiAqIEBwYXJhbSAge01vZGV9ICAgICAgICBkZWZhdWx0VmFsdWUgRmFsbGJhY2sgdmFsdWVcbiAqIEByZXR1cm4ge01vZGV9ICAgICAgICAgICAgICAgICAgICAgRW5jb2RpbmcgbW9kZVxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmIChleHBvcnRzLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICB9XG59XG4iLCJ2YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbmZ1bmN0aW9uIE51bWVyaWNEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuTlVNRVJJQ1xuICB0aGlzLmRhdGEgPSBkYXRhLnRvU3RyaW5nKClcbn1cblxuTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gMTAgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDMpICsgKChsZW5ndGggJSAzKSA/ICgobGVuZ3RoICUgMykgKiAzICsgMSkgOiAwKVxufVxuXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xuICB2YXIgaSwgZ3JvdXAsIHZhbHVlXG5cbiAgLy8gVGhlIGlucHV0IGRhdGEgc3RyaW5nIGlzIGRpdmlkZWQgaW50byBncm91cHMgb2YgdGhyZWUgZGlnaXRzLFxuICAvLyBhbmQgZWFjaCBncm91cCBpcyBjb252ZXJ0ZWQgdG8gaXRzIDEwLWJpdCBiaW5hcnkgZXF1aXZhbGVudC5cbiAgZm9yIChpID0gMDsgaSArIDMgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGksIDMpXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXG5cbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCAxMClcbiAgfVxuXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgaW5wdXQgZGlnaXRzIGlzIG5vdCBhbiBleGFjdCBtdWx0aXBsZSBvZiB0aHJlZSxcbiAgLy8gdGhlIGZpbmFsIG9uZSBvciB0d28gZGlnaXRzIGFyZSBjb252ZXJ0ZWQgdG8gNCBvciA3IGJpdHMgcmVzcGVjdGl2ZWx5LlxuICB2YXIgcmVtYWluaW5nTnVtID0gdGhpcy5kYXRhLmxlbmd0aCAtIGlcbiAgaWYgKHJlbWFpbmluZ051bSA+IDApIHtcbiAgICBncm91cCA9IHRoaXMuZGF0YS5zdWJzdHIoaSlcbiAgICB2YWx1ZSA9IHBhcnNlSW50KGdyb3VwLCAxMClcblxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIHJlbWFpbmluZ051bSAqIDMgKyAxKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVtZXJpY0RhdGFcbiIsInZhciBCdWZmZXIgPSByZXF1aXJlKCcuLi91dGlscy9idWZmZXInKVxudmFyIEdGID0gcmVxdWlyZSgnLi9nYWxvaXMtZmllbGQnKVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHBvbHlub21pYWxzIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtCdWZmZXJ9IHAxIFBvbHlub21pYWxcbiAqIEBwYXJhbSAge0J1ZmZlcn0gcDIgUG9seW5vbWlhbFxuICogQHJldHVybiB7QnVmZmVyfSAgICBQcm9kdWN0IG9mIHAxIGFuZCBwMlxuICovXG5leHBvcnRzLm11bCA9IGZ1bmN0aW9uIG11bCAocDEsIHAyKSB7XG4gIHZhciBjb2VmZiA9IG5ldyBCdWZmZXIocDEubGVuZ3RoICsgcDIubGVuZ3RoIC0gMSlcbiAgY29lZmYuZmlsbCgwKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcDEubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHAyLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb2VmZltpICsgal0gXj0gR0YubXVsKHAxW2ldLCBwMltqXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29lZmZcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHJlbWFpbmRlciBvZiBwb2x5bm9taWFscyBkaXZpc2lvblxuICpcbiAqIEBwYXJhbSAge0J1ZmZlcn0gZGl2aWRlbnQgUG9seW5vbWlhbFxuICogQHBhcmFtICB7QnVmZmVyfSBkaXZpc29yICBQb2x5bm9taWFsXG4gKiBAcmV0dXJuIHtCdWZmZXJ9ICAgICAgICAgIFJlbWFpbmRlclxuICovXG5leHBvcnRzLm1vZCA9IGZ1bmN0aW9uIG1vZCAoZGl2aWRlbnQsIGRpdmlzb3IpIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyBCdWZmZXIoZGl2aWRlbnQpXG5cbiAgd2hpbGUgKChyZXN1bHQubGVuZ3RoIC0gZGl2aXNvci5sZW5ndGgpID49IDApIHtcbiAgICB2YXIgY29lZmYgPSByZXN1bHRbMF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGl2aXNvci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W2ldIF49IEdGLm11bChkaXZpc29yW2ldLCBjb2VmZilcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgYWxsIHplcm9zIGZyb20gYnVmZmVyIGhlYWRcbiAgICB2YXIgb2Zmc2V0ID0gMFxuICAgIHdoaWxlIChvZmZzZXQgPCByZXN1bHQubGVuZ3RoICYmIHJlc3VsdFtvZmZzZXRdID09PSAwKSBvZmZzZXQrK1xuICAgIHJlc3VsdCA9IHJlc3VsdC5zbGljZShvZmZzZXQpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2Ygc3BlY2lmaWVkIGRlZ3JlZVxuICogKHVzZWQgYnkgUmVlZC1Tb2xvbW9uIGVuY29kZXIpXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWUgRGVncmVlIG9mIHRoZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICogQHJldHVybiB7QnVmZmVyfSAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgcG9seW5vbWlhbCBjb2VmZmljaWVudHNcbiAqL1xuZXhwb3J0cy5nZW5lcmF0ZUVDUG9seW5vbWlhbCA9IGZ1bmN0aW9uIGdlbmVyYXRlRUNQb2x5bm9taWFsIChkZWdyZWUpIHtcbiAgdmFyIHBvbHkgPSBuZXcgQnVmZmVyKFsxXSlcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWdyZWU7IGkrKykge1xuICAgIHBvbHkgPSBleHBvcnRzLm11bChwb2x5LCBbMSwgR0YuZXhwKGkpXSlcbiAgfVxuXG4gIHJldHVybiBwb2x5XG59XG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnLi4vdXRpbHMvYnVmZmVyJylcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxudmFyIEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxudmFyIEJpdEJ1ZmZlciA9IHJlcXVpcmUoJy4vYml0LWJ1ZmZlcicpXG52YXIgQml0TWF0cml4ID0gcmVxdWlyZSgnLi9iaXQtbWF0cml4JylcbnZhciBBbGlnbm1lbnRQYXR0ZXJuID0gcmVxdWlyZSgnLi9hbGlnbm1lbnQtcGF0dGVybicpXG52YXIgRmluZGVyUGF0dGVybiA9IHJlcXVpcmUoJy4vZmluZGVyLXBhdHRlcm4nKVxudmFyIE1hc2tQYXR0ZXJuID0gcmVxdWlyZSgnLi9tYXNrLXBhdHRlcm4nKVxudmFyIEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcbnZhciBSZWVkU29sb21vbkVuY29kZXIgPSByZXF1aXJlKCcuL3JlZWQtc29sb21vbi1lbmNvZGVyJylcbnZhciBWZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJylcbnZhciBGb3JtYXRJbmZvID0gcmVxdWlyZSgnLi9mb3JtYXQtaW5mbycpXG52YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG52YXIgU2VnbWVudHMgPSByZXF1aXJlKCcuL3NlZ21lbnRzJylcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbi8qKlxuICogUVJDb2RlIGZvciBKYXZhU2NyaXB0XG4gKlxuICogbW9kaWZpZWQgYnkgUnlhbiBEYXkgZm9yIG5vZGVqcyBzdXBwb3J0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgUnlhbiBEYXlcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxuLy9cbi8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbi8vICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbi8vXG4vLyBUaGUgd29yZCBcIlFSIENvZGVcIiBpcyByZWdpc3RlcmVkIHRyYWRlbWFyayBvZlxuLy8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcbi8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuXG4vKipcbiAqIEFkZCBmaW5kZXIgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBGaW5kZXJQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgdmFyIHNpemUgPSBtYXRyaXguc2l6ZVxuICB2YXIgcG9zID0gRmluZGVyUGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByb3cgPSBwb3NbaV1bMF1cbiAgICB2YXIgY29sID0gcG9zW2ldWzFdXG5cbiAgICBmb3IgKHZhciByID0gLTE7IHIgPD0gNzsgcisrKSB7XG4gICAgICBpZiAocm93ICsgciA8PSAtMSB8fCBzaXplIDw9IHJvdyArIHIpIGNvbnRpbnVlXG5cbiAgICAgIGZvciAodmFyIGMgPSAtMTsgYyA8PSA3OyBjKyspIHtcbiAgICAgICAgaWYgKGNvbCArIGMgPD0gLTEgfHwgc2l6ZSA8PSBjb2wgKyBjKSBjb250aW51ZVxuXG4gICAgICAgIGlmICgociA+PSAwICYmIHIgPD0gNiAmJiAoYyA9PT0gMCB8fCBjID09PSA2KSkgfHxcbiAgICAgICAgICAoYyA+PSAwICYmIGMgPD0gNiAmJiAociA9PT0gMCB8fCByID09PSA2KSkgfHxcbiAgICAgICAgICAociA+PSAyICYmIHIgPD0gNCAmJiBjID49IDIgJiYgYyA8PSA0KSkge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIHRpbWluZyBwYXR0ZXJuIGJpdHMgdG8gbWF0cml4XG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBiZWZvcmUge0BsaW5rIHNldHVwQWxpZ25tZW50UGF0dGVybn1cbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxuICovXG5mdW5jdGlvbiBzZXR1cFRpbWluZ1BhdHRlcm4gKG1hdHJpeCkge1xuICB2YXIgc2l6ZSA9IG1hdHJpeC5zaXplXG5cbiAgZm9yICh2YXIgciA9IDg7IHIgPCBzaXplIC0gODsgcisrKSB7XG4gICAgdmFyIHZhbHVlID0gciAlIDIgPT09IDBcbiAgICBtYXRyaXguc2V0KHIsIDYsIHZhbHVlLCB0cnVlKVxuICAgIG1hdHJpeC5zZXQoNiwgciwgdmFsdWUsIHRydWUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgYWxpZ25tZW50IHBhdHRlcm5zIGJpdHMgdG8gbWF0cml4XG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBhZnRlciB7QGxpbmsgc2V0dXBUaW1pbmdQYXR0ZXJufVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cEFsaWdubWVudFBhdHRlcm4gKG1hdHJpeCwgdmVyc2lvbikge1xuICB2YXIgcG9zID0gQWxpZ25tZW50UGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByb3cgPSBwb3NbaV1bMF1cbiAgICB2YXIgY29sID0gcG9zW2ldWzFdXG5cbiAgICBmb3IgKHZhciByID0gLTI7IHIgPD0gMjsgcisrKSB7XG4gICAgICBmb3IgKHZhciBjID0gLTI7IGMgPD0gMjsgYysrKSB7XG4gICAgICAgIGlmIChyID09PSAtMiB8fCByID09PSAyIHx8IGMgPT09IC0yIHx8IGMgPT09IDIgfHxcbiAgICAgICAgICAociA9PT0gMCAmJiBjID09PSAwKSkge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIHZlcnNpb24gaW5mbyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cFZlcnNpb25JbmZvIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgdmFyIHNpemUgPSBtYXRyaXguc2l6ZVxuICB2YXIgYml0cyA9IFZlcnNpb24uZ2V0RW5jb2RlZEJpdHModmVyc2lvbilcbiAgdmFyIHJvdywgY29sLCBtb2RcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpKyspIHtcbiAgICByb3cgPSBNYXRoLmZsb29yKGkgLyAzKVxuICAgIGNvbCA9IGkgJSAzICsgc2l6ZSAtIDggLSAzXG4gICAgbW9kID0gKChiaXRzID4+IGkpICYgMSkgPT09IDFcblxuICAgIG1hdHJpeC5zZXQocm93LCBjb2wsIG1vZCwgdHJ1ZSlcbiAgICBtYXRyaXguc2V0KGNvbCwgcm93LCBtb2QsIHRydWUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgZm9ybWF0IGluZm8gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgICAgICAgICAgICAgIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TnVtYmVyfSAgICBtYXNrUGF0dGVybiAgICAgICAgICBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHNldHVwRm9ybWF0SW5mbyAobWF0cml4LCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pIHtcbiAgdmFyIHNpemUgPSBtYXRyaXguc2l6ZVxuICB2YXIgYml0cyA9IEZvcm1hdEluZm8uZ2V0RW5jb2RlZEJpdHMoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxuICB2YXIgaSwgbW9kXG5cbiAgZm9yIChpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxuXG4gICAgLy8gdmVydGljYWxcbiAgICBpZiAoaSA8IDYpIHtcbiAgICAgIG1hdHJpeC5zZXQoaSwgOCwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSBpZiAoaSA8IDgpIHtcbiAgICAgIG1hdHJpeC5zZXQoaSArIDEsIDgsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0cml4LnNldChzaXplIC0gMTUgKyBpLCA4LCBtb2QsIHRydWUpXG4gICAgfVxuXG4gICAgLy8gaG9yaXpvbnRhbFxuICAgIGlmIChpIDwgOCkge1xuICAgICAgbWF0cml4LnNldCg4LCBzaXplIC0gaSAtIDEsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2UgaWYgKGkgPCA5KSB7XG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEgKyAxLCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSwgbW9kLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIC8vIGZpeGVkIG1vZHVsZVxuICBtYXRyaXguc2V0KHNpemUgLSA4LCA4LCAxLCB0cnVlKVxufVxuXG4vKipcbiAqIEFkZCBlbmNvZGVkIGRhdGEgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7QnVmZmVyfSAgICBkYXRhICAgRGF0YSBjb2Rld29yZHNcbiAqL1xuZnVuY3Rpb24gc2V0dXBEYXRhIChtYXRyaXgsIGRhdGEpIHtcbiAgdmFyIHNpemUgPSBtYXRyaXguc2l6ZVxuICB2YXIgaW5jID0gLTFcbiAgdmFyIHJvdyA9IHNpemUgLSAxXG4gIHZhciBiaXRJbmRleCA9IDdcbiAgdmFyIGJ5dGVJbmRleCA9IDBcblxuICBmb3IgKHZhciBjb2wgPSBzaXplIC0gMTsgY29sID4gMDsgY29sIC09IDIpIHtcbiAgICBpZiAoY29sID09PSA2KSBjb2wtLVxuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgMjsgYysrKSB7XG4gICAgICAgIGlmICghbWF0cml4LmlzUmVzZXJ2ZWQocm93LCBjb2wgLSBjKSkge1xuICAgICAgICAgIHZhciBkYXJrID0gZmFsc2VcblxuICAgICAgICAgIGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgZGFyayA9ICgoKGRhdGFbYnl0ZUluZGV4XSA+Pj4gYml0SW5kZXgpICYgMSkgPT09IDEpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWF0cml4LnNldChyb3csIGNvbCAtIGMsIGRhcmspXG4gICAgICAgICAgYml0SW5kZXgtLVxuXG4gICAgICAgICAgaWYgKGJpdEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgYnl0ZUluZGV4KytcbiAgICAgICAgICAgIGJpdEluZGV4ID0gN1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByb3cgKz0gaW5jXG5cbiAgICAgIGlmIChyb3cgPCAwIHx8IHNpemUgPD0gcm93KSB7XG4gICAgICAgIHJvdyAtPSBpbmNcbiAgICAgICAgaW5jID0gLWluY1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBlbmNvZGVkIGNvZGV3b3JkcyBmcm9tIGRhdGEgaW5wdXRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtCeXRlRGF0YX0gZGF0YSAgICAgICAgICAgICAgICAgRGF0YSBpbnB1dFxuICogQHJldHVybiB7QnVmZmVyfSAgICAgICAgICAgICAgICAgICAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURhdGEgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cykge1xuICAvLyBQcmVwYXJlIGRhdGEgYnVmZmVyXG4gIHZhciBidWZmZXIgPSBuZXcgQml0QnVmZmVyKClcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgLy8gcHJlZml4IGRhdGEgd2l0aCBtb2RlIGluZGljYXRvciAoNCBiaXRzKVxuICAgIGJ1ZmZlci5wdXQoZGF0YS5tb2RlLmJpdCwgNClcblxuICAgIC8vIFByZWZpeCBkYXRhIHdpdGggY2hhcmFjdGVyIGNvdW50IGluZGljYXRvci5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIGNvdW50IGluZGljYXRvciBpcyBhIHN0cmluZyBvZiBiaXRzIHRoYXQgcmVwcmVzZW50cyB0aGVcbiAgICAvLyBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGFyZSBiZWluZyBlbmNvZGVkLlxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIG11c3QgYmUgcGxhY2VkIGFmdGVyIHRoZSBtb2RlIGluZGljYXRvclxuICAgIC8vIGFuZCBtdXN0IGJlIGEgY2VydGFpbiBudW1iZXIgb2YgYml0cyBsb25nLCBkZXBlbmRpbmcgb24gdGhlIFFSIHZlcnNpb25cbiAgICAvLyBhbmQgZGF0YSBtb2RlXG4gICAgLy8gQHNlZSB7QGxpbmsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3J9LlxuICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IoZGF0YS5tb2RlLCB2ZXJzaW9uKSlcblxuICAgIC8vIGFkZCBiaW5hcnkgZGF0YSBzZXF1ZW5jZSB0byBidWZmZXJcbiAgICBkYXRhLndyaXRlKGJ1ZmZlcilcbiAgfSlcblxuICAvLyBDYWxjdWxhdGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHNcbiAgdmFyIHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcbiAgdmFyIGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbiAgdmFyIGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcblxuICAvLyBBZGQgYSB0ZXJtaW5hdG9yLlxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiByZXF1aXJlZCBiaXRzLFxuICAvLyBhIHRlcm1pbmF0b3Igb2YgdXAgdG8gZm91ciAwcyBtdXN0IGJlIGFkZGVkIHRvIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdHJpbmcuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIG1vcmUgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciB0aGFuIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cyxcbiAgLy8gYWRkIGZvdXIgMHMgdG8gdGhlIGVuZC5cbiAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cykge1xuICAgIGJ1ZmZlci5wdXQoMCwgNClcbiAgfVxuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIGZld2VyIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIsIGFkZCBvbmx5IHRoZSBudW1iZXIgb2YgMHMgdGhhdFxuICAvLyBhcmUgbmVlZGVkIHRvIHJlYWNoIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cy5cblxuICAvLyBBZnRlciBhZGRpbmcgdGhlIHRlcm1pbmF0b3IsIGlmIHRoZSBudW1iZXIgb2YgYml0cyBpbiB0aGUgc3RyaW5nIGlzIG5vdCBhIG11bHRpcGxlIG9mIDgsXG4gIC8vIHBhZCB0aGUgc3RyaW5nIG9uIHRoZSByaWdodCB3aXRoIDBzIHRvIG1ha2UgdGhlIHN0cmluZydzIGxlbmd0aCBhIG11bHRpcGxlIG9mIDguXG4gIHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9PSAwKSB7XG4gICAgYnVmZmVyLnB1dEJpdCgwKVxuICB9XG5cbiAgLy8gQWRkIHBhZCBieXRlcyBpZiB0aGUgc3RyaW5nIGlzIHN0aWxsIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMuXG4gIC8vIEV4dGVuZCB0aGUgYnVmZmVyIHRvIGZpbGwgdGhlIGRhdGEgY2FwYWNpdHkgb2YgdGhlIHN5bWJvbCBjb3JyZXNwb25kaW5nIHRvXG4gIC8vIHRoZSBWZXJzaW9uIGFuZCBFcnJvciBDb3JyZWN0aW9uIExldmVsIGJ5IGFkZGluZyB0aGUgUGFkIENvZGV3b3JkcyAxMTEwMTEwMCAoMHhFQylcbiAgLy8gYW5kIDAwMDEwMDAxICgweDExKSBhbHRlcm5hdGVseS5cbiAgdmFyIHJlbWFpbmluZ0J5dGUgPSAoZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSkgLyA4XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtYWluaW5nQnl0ZTsgaSsrKSB7XG4gICAgYnVmZmVyLnB1dChpICUgMiA/IDB4MTEgOiAweEVDLCA4KVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZUNvZGV3b3JkcyhidWZmZXIsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxufVxuXG4vKipcbiAqIEVuY29kZSBpbnB1dCBkYXRhIHdpdGggUmVlZC1Tb2xvbW9uIGFuZCByZXR1cm4gY29kZXdvcmRzIHdpdGhcbiAqIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xuICpcbiAqIEBwYXJhbSAge0JpdEJ1ZmZlcn0gYml0QnVmZmVyICAgICAgICAgICAgRGF0YSB0byBlbmNvZGVcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHJldHVybiB7QnVmZmVyfSAgICAgICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBjcmVhdGVDb2Rld29yZHMgKGJpdEJ1ZmZlciwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgLy8gVG90YWwgY29kZXdvcmRzIGZvciB0aGlzIFFSIGNvZGUgdmVyc2lvbiAoRGF0YSArIEVycm9yIGNvcnJlY3Rpb24pXG4gIHZhciB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXG4gIHZhciBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGRhdGEgY29kZXdvcmRzXG4gIHZhciBkYXRhVG90YWxDb2Rld29yZHMgPSB0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHNcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgYmxvY2tzXG4gIHZhciBlY1RvdGFsQmxvY2tzID0gRUNDb2RlLmdldEJsb2Nrc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBibG9ja3MgZWFjaCBncm91cCBzaG91bGQgY29udGFpblxuICB2YXIgYmxvY2tzSW5Hcm91cDIgPSB0b3RhbENvZGV3b3JkcyAlIGVjVG90YWxCbG9ja3NcbiAgdmFyIGJsb2Nrc0luR3JvdXAxID0gZWNUb3RhbEJsb2NrcyAtIGJsb2Nrc0luR3JvdXAyXG5cbiAgdmFyIHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKHRvdGFsQ29kZXdvcmRzIC8gZWNUb3RhbEJsb2NrcylcblxuICB2YXIgZGF0YUNvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcihkYXRhVG90YWxDb2Rld29yZHMgLyBlY1RvdGFsQmxvY2tzKVxuICB2YXIgZGF0YUNvZGV3b3Jkc0luR3JvdXAyID0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxICsgMVxuXG4gIC8vIE51bWJlciBvZiBFQyBjb2Rld29yZHMgaXMgdGhlIHNhbWUgZm9yIGJvdGggZ3JvdXBzXG4gIHZhciBlY0NvdW50ID0gdG90YWxDb2Rld29yZHNJbkdyb3VwMSAtIGRhdGFDb2Rld29yZHNJbkdyb3VwMVxuXG4gIC8vIEluaXRpYWxpemUgYSBSZWVkLVNvbG9tb24gZW5jb2RlciB3aXRoIGEgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2YgZGVncmVlIGVjQ291bnRcbiAgdmFyIHJzID0gbmV3IFJlZWRTb2xvbW9uRW5jb2RlcihlY0NvdW50KVxuXG4gIHZhciBvZmZzZXQgPSAwXG4gIHZhciBkY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcbiAgdmFyIGVjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxuICB2YXIgbWF4RGF0YVNpemUgPSAwXG4gIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKGJpdEJ1ZmZlci5idWZmZXIpXG5cbiAgLy8gRGl2aWRlIHRoZSBidWZmZXIgaW50byB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJsb2Nrc1xuICBmb3IgKHZhciBiID0gMDsgYiA8IGVjVG90YWxCbG9ja3M7IGIrKykge1xuICAgIHZhciBkYXRhU2l6ZSA9IGIgPCBibG9ja3NJbkdyb3VwMSA/IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA6IGRhdGFDb2Rld29yZHNJbkdyb3VwMlxuXG4gICAgLy8gZXh0cmFjdCBhIGJsb2NrIG9mIGRhdGEgZnJvbSBidWZmZXJcbiAgICBkY0RhdGFbYl0gPSBidWZmZXIuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBkYXRhU2l6ZSlcblxuICAgIC8vIENhbGN1bGF0ZSBFQyBjb2Rld29yZHMgZm9yIHRoaXMgZGF0YSBibG9ja1xuICAgIGVjRGF0YVtiXSA9IHJzLmVuY29kZShkY0RhdGFbYl0pXG5cbiAgICBvZmZzZXQgKz0gZGF0YVNpemVcbiAgICBtYXhEYXRhU2l6ZSA9IE1hdGgubWF4KG1heERhdGFTaXplLCBkYXRhU2l6ZSlcbiAgfVxuXG4gIC8vIENyZWF0ZSBmaW5hbCBkYXRhXG4gIC8vIEludGVybGVhdmUgdGhlIGRhdGEgYW5kIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGZyb20gZWFjaCBibG9ja1xuICB2YXIgZGF0YSA9IG5ldyBCdWZmZXIodG90YWxDb2Rld29yZHMpXG4gIHZhciBpbmRleCA9IDBcbiAgdmFyIGksIHJcblxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcbiAgZm9yIChpID0gMDsgaSA8IG1heERhdGFTaXplOyBpKyspIHtcbiAgICBmb3IgKHIgPSAwOyByIDwgZWNUb3RhbEJsb2NrczsgcisrKSB7XG4gICAgICBpZiAoaSA8IGRjRGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgZGF0YVtpbmRleCsrXSA9IGRjRGF0YVtyXVtpXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFwcGVkIEVDIGNvZGV3b3Jkc1xuICBmb3IgKGkgPSAwOyBpIDwgZWNDb3VudDsgaSsrKSB7XG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xuICAgICAgZGF0YVtpbmRleCsrXSA9IGVjRGF0YVtyXVtpXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRhXG59XG5cbi8qKlxuICogQnVpbGQgUVIgQ29kZSBzeW1ib2xcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IHN0cmluZ1xuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge0Vycm9yQ29ycmV0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGxldmVsXG4gKiBAcGFyYW0gIHtNYXNrUGF0dGVybn0gbWFza1BhdHRlcm4gICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBzeW1ib2wgZGF0YVxuICovXG5mdW5jdGlvbiBjcmVhdGVTeW1ib2wgKGRhdGEsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xuICB2YXIgc2VnbWVudHNcblxuICBpZiAoaXNBcnJheShkYXRhKSkge1xuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbUFycmF5KGRhdGEpXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGVzdGltYXRlZFZlcnNpb24gPSB2ZXJzaW9uXG5cbiAgICBpZiAoIWVzdGltYXRlZFZlcnNpb24pIHtcbiAgICAgIHZhciByYXdTZWdtZW50cyA9IFNlZ21lbnRzLnJhd1NwbGl0KGRhdGEpXG5cbiAgICAgIC8vIEVzdGltYXRlIGJlc3QgdmVyc2lvbiB0aGF0IGNhbiBjb250YWluIHJhdyBzcGxpdHRlZCBzZWdtZW50c1xuICAgICAgZXN0aW1hdGVkVmVyc2lvbiA9IFZlcnNpb24uZ2V0QmVzdFZlcnNpb25Gb3JEYXRhKHJhd1NlZ21lbnRzLFxuICAgICAgICBlcnJvckNvcnJlY3Rpb25MZXZlbClcbiAgICB9XG5cbiAgICAvLyBCdWlsZCBvcHRpbWl6ZWQgc2VnbWVudHNcbiAgICAvLyBJZiBlc3RpbWF0ZWQgdmVyc2lvbiBpcyB1bmRlZmluZWQsIHRyeSB3aXRoIHRoZSBoaWdoZXN0IHZlcnNpb25cbiAgICBzZWdtZW50cyA9IFNlZ21lbnRzLmZyb21TdHJpbmcoZGF0YSwgZXN0aW1hdGVkVmVyc2lvbiB8fCA0MClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YScpXG4gIH1cblxuICAvLyBHZXQgdGhlIG1pbiB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gZGF0YVxuICB2YXIgYmVzdFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShzZWdtZW50cyxcbiAgICAgIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIElmIG5vIHZlcnNpb24gaXMgZm91bmQsIGRhdGEgY2Fubm90IGJlIHN0b3JlZFxuICBpZiAoIWJlc3RWZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYW1vdW50IG9mIGRhdGEgaXMgdG9vIGJpZyB0byBiZSBzdG9yZWQgaW4gYSBRUiBDb2RlJylcbiAgfVxuXG4gIC8vIElmIG5vdCBzcGVjaWZpZWQsIHVzZSBtaW4gdmVyc2lvbiBhcyBkZWZhdWx0XG4gIGlmICghdmVyc2lvbikge1xuICAgIHZlcnNpb24gPSBiZXN0VmVyc2lvblxuXG4gIC8vIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBjYW4gY29udGFpbiB0aGUgZGF0YVxuICB9IGVsc2UgaWYgKHZlcnNpb24gPCBiZXN0VmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignXFxuJyArXG4gICAgICAnVGhlIGNob3NlbiBRUiBDb2RlIHZlcnNpb24gY2Fubm90IGNvbnRhaW4gdGhpcyBhbW91bnQgb2YgZGF0YS5cXG4nICtcbiAgICAgICdNaW5pbXVtIHZlcnNpb24gcmVxdWlyZWQgdG8gc3RvcmUgY3VycmVudCBkYXRhIGlzOiAnICsgYmVzdFZlcnNpb24gKyAnLlxcbidcbiAgICApXG4gIH1cblxuICB2YXIgZGF0YUJpdHMgPSBjcmVhdGVEYXRhKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cylcblxuICAvLyBBbGxvY2F0ZSBtYXRyaXggYnVmZmVyXG4gIHZhciBtb2R1bGVDb3VudCA9IFV0aWxzLmdldFN5bWJvbFNpemUodmVyc2lvbilcbiAgdmFyIG1vZHVsZXMgPSBuZXcgQml0TWF0cml4KG1vZHVsZUNvdW50KVxuXG4gIC8vIEFkZCBmdW5jdGlvbiBtb2R1bGVzXG4gIHNldHVwRmluZGVyUGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxuICBzZXR1cFRpbWluZ1BhdHRlcm4obW9kdWxlcylcbiAgc2V0dXBBbGlnbm1lbnRQYXR0ZXJuKG1vZHVsZXMsIHZlcnNpb24pXG5cbiAgLy8gQWRkIHRlbXBvcmFyeSBkdW1teSBiaXRzIGZvciBmb3JtYXQgaW5mbyBqdXN0IHRvIHNldCB0aGVtIGFzIHJlc2VydmVkLlxuICAvLyBUaGlzIGlzIG5lZWRlZCB0byBwcmV2ZW50IHRoZXNlIGJpdHMgZnJvbSBiZWluZyBtYXNrZWQgYnkge0BsaW5rIE1hc2tQYXR0ZXJuLmFwcGx5TWFza31cbiAgLy8gc2luY2UgdGhlIG1hc2tpbmcgb3BlcmF0aW9uIG11c3QgYmUgcGVyZm9ybWVkIG9ubHkgb24gdGhlIGVuY29kaW5nIHJlZ2lvbi5cbiAgLy8gVGhlc2UgYmxvY2tzIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBjb3JyZWN0IHZhbHVlcyBsYXRlciBpbiBjb2RlLlxuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIDApXG5cbiAgaWYgKHZlcnNpb24gPj0gNykge1xuICAgIHNldHVwVmVyc2lvbkluZm8obW9kdWxlcywgdmVyc2lvbilcbiAgfVxuXG4gIC8vIEFkZCBkYXRhIGNvZGV3b3Jkc1xuICBzZXR1cERhdGEobW9kdWxlcywgZGF0YUJpdHMpXG5cbiAgaWYgKCFtYXNrUGF0dGVybikge1xuICAgIC8vIEZpbmQgYmVzdCBtYXNrIHBhdHRlcm5cbiAgICBtYXNrUGF0dGVybiA9IE1hc2tQYXR0ZXJuLmdldEJlc3RNYXNrKG1vZHVsZXMsXG4gICAgICBzZXR1cEZvcm1hdEluZm8uYmluZChudWxsLCBtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkpXG4gIH1cblxuICAvLyBBcHBseSBtYXNrIHBhdHRlcm5cbiAgTWFza1BhdHRlcm4uYXBwbHlNYXNrKG1hc2tQYXR0ZXJuLCBtb2R1bGVzKVxuXG4gIC8vIFJlcGxhY2UgZm9ybWF0IGluZm8gYml0cyB3aXRoIGNvcnJlY3QgdmFsdWVzXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pXG5cbiAgcmV0dXJuIHtcbiAgICBtb2R1bGVzOiBtb2R1bGVzLFxuICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6IGVycm9yQ29ycmVjdGlvbkxldmVsLFxuICAgIG1hc2tQYXR0ZXJuOiBtYXNrUGF0dGVybixcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfVxufVxuXG4vKipcbiAqIFFSIENvZGVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZyB8IEFycmF5fSBkYXRhICAgICAgICAgICAgICAgICBJbnB1dCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbCBjb25maWd1cmF0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMudmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRvU0pJU0Z1bmMgICAgICAgICBIZWxwZXIgZnVuYyB0byBjb252ZXJ0IHV0ZjggdG8gc2ppc1xuICovXG5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSAoZGF0YSwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8IGRhdGEgPT09ICcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnB1dCB0ZXh0JylcbiAgfVxuXG4gIHZhciBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuTVxuICB2YXIgdmVyc2lvblxuICB2YXIgbWFza1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBVc2UgaGlnaGVyIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwgYXMgZGVmYXVsdFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5mcm9tKG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcbiAgICB2ZXJzaW9uID0gVmVyc2lvbi5mcm9tKG9wdGlvbnMudmVyc2lvbilcbiAgICBtYXNrID0gTWFza1BhdHRlcm4uZnJvbShvcHRpb25zLm1hc2tQYXR0ZXJuKVxuXG4gICAgaWYgKG9wdGlvbnMudG9TSklTRnVuYykge1xuICAgICAgVXRpbHMuc2V0VG9TSklTRnVuY3Rpb24ob3B0aW9ucy50b1NKSVNGdW5jKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVTeW1ib2woZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spXG59XG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnLi4vdXRpbHMvYnVmZmVyJylcbnZhciBQb2x5bm9taWFsID0gcmVxdWlyZSgnLi9wb2x5bm9taWFsJylcblxuZnVuY3Rpb24gUmVlZFNvbG9tb25FbmNvZGVyIChkZWdyZWUpIHtcbiAgdGhpcy5nZW5Qb2x5ID0gdW5kZWZpbmVkXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXG5cbiAgaWYgKHRoaXMuZGVncmVlKSB0aGlzLmluaXRpYWxpemUodGhpcy5kZWdyZWUpXG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgZW5jb2Rlci5cbiAqIFRoZSBpbnB1dCBwYXJhbSBzaG91bGQgY29ycmVzcG9uZCB0byB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGVncmVlXG4gKi9cblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGluaXRpYWxpemUgKGRlZ3JlZSkge1xuICAvLyBjcmVhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcbiAgdGhpcy5nZW5Qb2x5ID0gUG9seW5vbWlhbC5nZW5lcmF0ZUVDUG9seW5vbWlhbCh0aGlzLmRlZ3JlZSlcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgY2h1bmsgb2YgZGF0YVxuICpcbiAqIEBwYXJhbSAge0J1ZmZlcn0gZGF0YSBCdWZmZXIgY29udGFpbmluZyBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtCdWZmZXJ9ICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBkYXRhXG4gKi9cblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlIChkYXRhKSB7XG4gIGlmICghdGhpcy5nZW5Qb2x5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbmNvZGVyIG5vdCBpbml0aWFsaXplZCcpXG4gIH1cblxuICAvLyBDYWxjdWxhdGUgRUMgZm9yIHRoaXMgZGF0YSBibG9ja1xuICAvLyBleHRlbmRzIGRhdGEgc2l6ZSB0byBkYXRhK2dlblBvbHkgc2l6ZVxuICB2YXIgcGFkID0gbmV3IEJ1ZmZlcih0aGlzLmRlZ3JlZSlcbiAgcGFkLmZpbGwoMClcbiAgdmFyIHBhZGRlZERhdGEgPSBCdWZmZXIuY29uY2F0KFtkYXRhLCBwYWRdLCBkYXRhLmxlbmd0aCArIHRoaXMuZGVncmVlKVxuXG4gIC8vIFRoZSBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyBhcmUgdGhlIHJlbWFpbmRlciBhZnRlciBkaXZpZGluZyB0aGUgZGF0YSBjb2Rld29yZHNcbiAgLy8gYnkgYSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICB2YXIgcmVtYWluZGVyID0gUG9seW5vbWlhbC5tb2QocGFkZGVkRGF0YSwgdGhpcy5nZW5Qb2x5KVxuXG4gIC8vIHJldHVybiBFQyBkYXRhIGJsb2NrcyAobGFzdCBuIGJ5dGUsIHdoZXJlIG4gaXMgdGhlIGRlZ3JlZSBvZiBnZW5Qb2x5KVxuICAvLyBJZiBjb2VmZmljaWVudHMgbnVtYmVyIGluIHJlbWFpbmRlciBhcmUgbGVzcyB0aGFuIGdlblBvbHkgZGVncmVlLFxuICAvLyBwYWQgd2l0aCAwcyB0byB0aGUgbGVmdCB0byByZWFjaCB0aGUgbmVlZGVkIG51bWJlciBvZiBjb2VmZmljaWVudHNcbiAgdmFyIHN0YXJ0ID0gdGhpcy5kZWdyZWUgLSByZW1haW5kZXIubGVuZ3RoXG4gIGlmIChzdGFydCA+IDApIHtcbiAgICB2YXIgYnVmZiA9IG5ldyBCdWZmZXIodGhpcy5kZWdyZWUpXG4gICAgYnVmZi5maWxsKDApXG4gICAgcmVtYWluZGVyLmNvcHkoYnVmZiwgc3RhcnQpXG5cbiAgICByZXR1cm4gYnVmZlxuICB9XG5cbiAgcmV0dXJuIHJlbWFpbmRlclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZWRTb2xvbW9uRW5jb2RlclxuIiwidmFyIG51bWVyaWMgPSAnWzAtOV0rJ1xudmFyIGFscGhhbnVtZXJpYyA9ICdbQS1aICQlKitcXFxcLS4vOl0rJ1xudmFyIGthbmppID0gJyg/Olt1MzAwMC11MzAzRl18W3UzMDQwLXUzMDlGXXxbdTMwQTAtdTMwRkZdfCcgK1xuICAnW3VGRjAwLXVGRkVGXXxbdTRFMDAtdTlGQUZdfFt1MjYwNS11MjYwNl18W3UyMTkwLXUyMTk1XXx1MjAzQnwnICtcbiAgJ1t1MjAxMHUyMDE1dTIwMTh1MjAxOXUyMDI1dTIwMjZ1MjAxQ3UyMDFEdTIyMjV1MjI2MF18JyArXG4gICdbdTAzOTEtdTA0NTFdfFt1MDBBN3UwMEE4dTAwQjF1MDBCNHUwMEQ3dTAwRjddKSsnXG5rYW5qaSA9IGthbmppLnJlcGxhY2UoL3UvZywgJ1xcXFx1JylcblxudmFyIGJ5dGUgPSAnKD86KD8hW0EtWjAtOSAkJSorXFxcXC0uLzpdfCcgKyBrYW5qaSArICcpLikrJ1xuXG5leHBvcnRzLktBTkpJID0gbmV3IFJlZ0V4cChrYW5qaSwgJ2cnKVxuZXhwb3J0cy5CWVRFX0tBTkpJID0gbmV3IFJlZ0V4cCgnW15BLVowLTkgJCUqK1xcXFwtLi86XSsnLCAnZycpXG5leHBvcnRzLkJZVEUgPSBuZXcgUmVnRXhwKGJ5dGUsICdnJylcbmV4cG9ydHMuTlVNRVJJQyA9IG5ldyBSZWdFeHAobnVtZXJpYywgJ2cnKVxuZXhwb3J0cy5BTFBIQU5VTUVSSUMgPSBuZXcgUmVnRXhwKGFscGhhbnVtZXJpYywgJ2cnKVxuXG52YXIgVEVTVF9LQU5KSSA9IG5ldyBSZWdFeHAoJ14nICsga2FuamkgKyAnJCcpXG52YXIgVEVTVF9OVU1FUklDID0gbmV3IFJlZ0V4cCgnXicgKyBudW1lcmljICsgJyQnKVxudmFyIFRFU1RfQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cCgnXltBLVowLTkgJCUqK1xcXFwtLi86XSskJylcblxuZXhwb3J0cy50ZXN0S2FuamkgPSBmdW5jdGlvbiB0ZXN0S2FuamkgKHN0cikge1xuICByZXR1cm4gVEVTVF9LQU5KSS50ZXN0KHN0cilcbn1cblxuZXhwb3J0cy50ZXN0TnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3ROdW1lcmljIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfTlVNRVJJQy50ZXN0KHN0cilcbn1cblxuZXhwb3J0cy50ZXN0QWxwaGFudW1lcmljID0gZnVuY3Rpb24gdGVzdEFscGhhbnVtZXJpYyAoc3RyKSB7XG4gIHJldHVybiBURVNUX0FMUEhBTlVNRVJJQy50ZXN0KHN0cilcbn1cbiIsInZhciBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbnZhciBOdW1lcmljRGF0YSA9IHJlcXVpcmUoJy4vbnVtZXJpYy1kYXRhJylcbnZhciBBbHBoYW51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9hbHBoYW51bWVyaWMtZGF0YScpXG52YXIgQnl0ZURhdGEgPSByZXF1aXJlKCcuL2J5dGUtZGF0YScpXG52YXIgS2FuamlEYXRhID0gcmVxdWlyZSgnLi9rYW5qaS1kYXRhJylcbnZhciBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG52YXIgZGlqa3N0cmEgPSByZXF1aXJlKCdkaWprc3RyYWpzJylcblxuLyoqXG4gKiBSZXR1cm5zIFVURjggYnl0ZSBsZW5ndGhcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge051bWJlcn0gICAgIE51bWJlciBvZiBieXRlXG4gKi9cbmZ1bmN0aW9uIGdldFN0cmluZ0J5dGVMZW5ndGggKHN0cikge1xuICByZXR1cm4gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpLmxlbmd0aFxufVxuXG4vKipcbiAqIEdldCBhIGxpc3Qgb2Ygc2VnbWVudHMgb2YgdGhlIHNwZWNpZmllZCBtb2RlXG4gKiBmcm9tIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlIFNlZ21lbnQgbW9kZVxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgIFN0cmluZyB0byBwcm9jZXNzXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50cyAocmVnZXgsIG1vZGUsIHN0cikge1xuICB2YXIgc2VnbWVudHMgPSBbXVxuICB2YXIgcmVzdWx0XG5cbiAgd2hpbGUgKChyZXN1bHQgPSByZWdleC5leGVjKHN0cikpICE9PSBudWxsKSB7XG4gICAgc2VnbWVudHMucHVzaCh7XG4gICAgICBkYXRhOiByZXN1bHRbMF0sXG4gICAgICBpbmRleDogcmVzdWx0LmluZGV4LFxuICAgICAgbW9kZTogbW9kZSxcbiAgICAgIGxlbmd0aDogcmVzdWx0WzBdLmxlbmd0aFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gc2VnbWVudHNcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBhIHNlcmllcyBvZiBzZWdtZW50cyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxuICogbW9kZXMgZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdldFNlZ21lbnRzRnJvbVN0cmluZyAoZGF0YVN0cikge1xuICB2YXIgbnVtU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4Lk5VTUVSSUMsIE1vZGUuTlVNRVJJQywgZGF0YVN0cilcbiAgdmFyIGFscGhhTnVtU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkFMUEhBTlVNRVJJQywgTW9kZS5BTFBIQU5VTUVSSUMsIGRhdGFTdHIpXG4gIHZhciBieXRlU2Vnc1xuICB2YXIga2FuamlTZWdzXG5cbiAgaWYgKFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKSB7XG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFLCBNb2RlLkJZVEUsIGRhdGFTdHIpXG4gICAga2FuamlTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguS0FOSkksIE1vZGUuS0FOSkksIGRhdGFTdHIpXG4gIH0gZWxzZSB7XG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFX0tBTkpJLCBNb2RlLkJZVEUsIGRhdGFTdHIpXG4gICAga2FuamlTZWdzID0gW11cbiAgfVxuXG4gIHZhciBzZWdzID0gbnVtU2Vncy5jb25jYXQoYWxwaGFOdW1TZWdzLCBieXRlU2Vncywga2FuamlTZWdzKVxuXG4gIHJldHVybiBzZWdzXG4gICAgLnNvcnQoZnVuY3Rpb24gKHMxLCBzMikge1xuICAgICAgcmV0dXJuIHMxLmluZGV4IC0gczIuaW5kZXhcbiAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogb2JqLmRhdGEsXG4gICAgICAgIG1vZGU6IG9iai5tb2RlLFxuICAgICAgICBsZW5ndGg6IG9iai5sZW5ndGhcbiAgICAgIH1cbiAgICB9KVxufVxuXG4vKipcbiAqIFJldHVybnMgaG93IG1hbnkgYml0cyBhcmUgbmVlZGVkIHRvIGVuY29kZSBhIHN0cmluZyBvZlxuICogc3BlY2lmaWVkIGxlbmd0aCB3aXRoIHRoZSBzcGVjaWZpZWQgbW9kZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbGVuZ3RoIFN0cmluZyBsZW5ndGhcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgIFNlZ21lbnQgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgQml0IGxlbmd0aFxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50Qml0c0xlbmd0aCAobGVuZ3RoLCBtb2RlKSB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgcmV0dXJuIEJ5dGVEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICB9XG59XG5cbi8qKlxuICogTWVyZ2VzIGFkamFjZW50IHNlZ21lbnRzIHdoaWNoIGhhdmUgdGhlIHNhbWUgbW9kZVxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBzZWdzIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gbWVyZ2VTZWdtZW50cyAoc2Vncykge1xuICByZXR1cm4gc2Vncy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgY3Vycikge1xuICAgIHZhciBwcmV2U2VnID0gYWNjLmxlbmd0aCAtIDEgPj0gMCA/IGFjY1thY2MubGVuZ3RoIC0gMV0gOiBudWxsXG4gICAgaWYgKHByZXZTZWcgJiYgcHJldlNlZy5tb2RlID09PSBjdXJyLm1vZGUpIHtcbiAgICAgIGFjY1thY2MubGVuZ3RoIC0gMV0uZGF0YSArPSBjdXJyLmRhdGFcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBhY2MucHVzaChjdXJyKVxuICAgIHJldHVybiBhY2NcbiAgfSwgW10pXG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbGlzdCBvZiBhbGwgcG9zc2libGUgbm9kZXMgY29tYmluYXRpb24gd2hpY2hcbiAqIHdpbGwgYmUgdXNlZCB0byBidWlsZCBhIHNlZ21lbnRzIGdyYXBoLlxuICpcbiAqIE5vZGVzIGFyZSBkaXZpZGVkIGJ5IGdyb3Vwcy4gRWFjaCBncm91cCB3aWxsIGNvbnRhaW4gYSBsaXN0IG9mIGFsbCB0aGUgbW9kZXNcbiAqIGluIHdoaWNoIGlzIHBvc3NpYmxlIHRvIGVuY29kZSB0aGUgZ2l2ZW4gdGV4dC5cbiAqXG4gKiBGb3IgZXhhbXBsZSB0aGUgdGV4dCAnMTIzNDUnIGNhbiBiZSBlbmNvZGVkIGFzIE51bWVyaWMsIEFscGhhbnVtZXJpYyBvciBCeXRlLlxuICogVGhlIGdyb3VwIGZvciAnMTIzNDUnIHdpbGwgY29udGFpbiB0aGVuIDMgb2JqZWN0cywgb25lIGZvciBlYWNoXG4gKiBwb3NzaWJsZSBlbmNvZGluZyBtb2RlLlxuICpcbiAqIEVhY2ggbm9kZSByZXByZXNlbnRzIGEgcG9zc2libGUgc2VnbWVudC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTm9kZXMgKHNlZ3MpIHtcbiAgdmFyIG5vZGVzID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNlZyA9IHNlZ3NbaV1cblxuICAgIHN3aXRjaCAoc2VnLm1vZGUpIHtcbiAgICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5BTFBIQU5VTUVSSUMsIGxlbmd0aDogc2VnLmxlbmd0aCB9LFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBzZWcubGVuZ3RoIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgICAgIG5vZGVzLnB1c2goW1xuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBnZXRTdHJpbmdCeXRlTGVuZ3RoKHNlZy5kYXRhKSB9XG4gICAgICAgIF0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5vZGVzXG59XG5cbi8qKlxuICogQnVpbGRzIGEgZ3JhcGggZnJvbSBhIGxpc3Qgb2Ygbm9kZXMuXG4gKiBBbGwgc2VnbWVudHMgaW4gZWFjaCBub2RlIGdyb3VwIHdpbGwgYmUgY29ubmVjdGVkIHdpdGggYWxsIHRoZSBzZWdtZW50cyBvZlxuICogdGhlIG5leHQgZ3JvdXAgYW5kIHNvIG9uLlxuICpcbiAqIEF0IGVhY2ggY29ubmVjdGlvbiB3aWxsIGJlIGFzc2lnbmVkIGEgd2VpZ2h0IGRlcGVuZGluZyBvbiB0aGVcbiAqIHNlZ21lbnQncyBieXRlIGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gbm9kZXMgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgIEdyYXBoIG9mIGFsbCBwb3NzaWJsZSBzZWdtZW50c1xuICovXG5mdW5jdGlvbiBidWlsZEdyYXBoIChub2RlcywgdmVyc2lvbikge1xuICB2YXIgdGFibGUgPSB7fVxuICB2YXIgZ3JhcGggPSB7J3N0YXJ0Jzoge319XG4gIHZhciBwcmV2Tm9kZUlkcyA9IFsnc3RhcnQnXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbm9kZUdyb3VwID0gbm9kZXNbaV1cbiAgICB2YXIgY3VycmVudE5vZGVJZHMgPSBbXVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBub2RlR3JvdXAubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBub2RlID0gbm9kZUdyb3VwW2pdXG4gICAgICB2YXIga2V5ID0gJycgKyBpICsgalxuXG4gICAgICBjdXJyZW50Tm9kZUlkcy5wdXNoKGtleSlcbiAgICAgIHRhYmxlW2tleV0gPSB7IG5vZGU6IG5vZGUsIGxhc3RDb3VudDogMCB9XG4gICAgICBncmFwaFtrZXldID0ge31cblxuICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xuICAgICAgICB2YXIgcHJldk5vZGVJZCA9IHByZXZOb2RlSWRzW25dXG5cbiAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdICYmIHRhYmxlW3ByZXZOb2RlSWRdLm5vZGUubW9kZSA9PT0gbm9kZS5tb2RlKSB7XG4gICAgICAgICAgZ3JhcGhbcHJldk5vZGVJZF1ba2V5XSA9XG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKyBub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSAtXG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQsIG5vZGUubW9kZSlcblxuICAgICAgICAgIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCArPSBub2RlLmxlbmd0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0YWJsZVtwcmV2Tm9kZUlkXSkgdGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ID0gbm9kZS5sZW5ndGhcblxuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPSBnZXRTZWdtZW50Qml0c0xlbmd0aChub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSArXG4gICAgICAgICAgICA0ICsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3Iobm9kZS5tb2RlLCB2ZXJzaW9uKSAvLyBzd2l0Y2ggY29zdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJldk5vZGVJZHMgPSBjdXJyZW50Tm9kZUlkc1xuICB9XG5cbiAgZm9yIChuID0gMDsgbiA8IHByZXZOb2RlSWRzLmxlbmd0aDsgbisrKSB7XG4gICAgZ3JhcGhbcHJldk5vZGVJZHNbbl1dWydlbmQnXSA9IDBcbiAgfVxuXG4gIHJldHVybiB7IG1hcDogZ3JhcGgsIHRhYmxlOiB0YWJsZSB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgc2VnbWVudCBmcm9tIGEgc3BlY2lmaWVkIGRhdGEgYW5kIG1vZGUuXG4gKiBJZiBhIG1vZGUgaXMgbm90IHNwZWNpZmllZCwgdGhlIG1vcmUgc3VpdGFibGUgd2lsbCBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICBJbnB1dCBkYXRhXG4gKiBAcGFyYW0gIHtNb2RlIHwgU3RyaW5nfSBtb2Rlc0hpbnQgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtTZWdtZW50fSAgICAgICAgICAgICAgICAgU2VnbWVudFxuICovXG5mdW5jdGlvbiBidWlsZFNpbmdsZVNlZ21lbnQgKGRhdGEsIG1vZGVzSGludCkge1xuICB2YXIgbW9kZVxuICB2YXIgYmVzdE1vZGUgPSBNb2RlLmdldEJlc3RNb2RlRm9yRGF0YShkYXRhKVxuXG4gIG1vZGUgPSBNb2RlLmZyb20obW9kZXNIaW50LCBiZXN0TW9kZSlcblxuICAvLyBNYWtlIHN1cmUgZGF0YSBjYW4gYmUgZW5jb2RlZFxuICBpZiAobW9kZSAhPT0gTW9kZS5CWVRFICYmIG1vZGUuYml0IDwgYmVzdE1vZGUuYml0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBkYXRhICsgJ1wiJyArXG4gICAgICAnIGNhbm5vdCBiZSBlbmNvZGVkIHdpdGggbW9kZSAnICsgTW9kZS50b1N0cmluZyhtb2RlKSArXG4gICAgICAnLlxcbiBTdWdnZXN0ZWQgbW9kZSBpczogJyArIE1vZGUudG9TdHJpbmcoYmVzdE1vZGUpKVxuICB9XG5cbiAgLy8gVXNlIE1vZGUuQllURSBpZiBLYW5qaSBzdXBwb3J0IGlzIGRpc2FibGVkXG4gIGlmIChtb2RlID09PSBNb2RlLktBTkpJICYmICFVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xuICAgIG1vZGUgPSBNb2RlLkJZVEVcbiAgfVxuXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIG5ldyBOdW1lcmljRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBuZXcgQWxwaGFudW1lcmljRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIG5ldyBLYW5qaURhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgcmV0dXJuIG5ldyBCeXRlRGF0YShkYXRhKVxuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgbGlzdCBvZiBzZWdtZW50cyBmcm9tIGFuIGFycmF5LlxuICogQXJyYXkgY2FuIGNvbnRhaW4gU3RyaW5ncyBvciBPYmplY3RzIHdpdGggc2VnbWVudCdzIGluZm8uXG4gKlxuICogRm9yIGVhY2ggaXRlbSB3aGljaCBpcyBhIHN0cmluZywgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXG4gKiBzdHJpbmcgYW5kIHRoZSBtb3JlIGFwcHJvcHJpYXRlIGVuY29kaW5nIG1vZGUuXG4gKlxuICogRm9yIGVhY2ggaXRlbSB3aGljaCBpcyBhbiBvYmplY3QsIHdpbGwgYmUgZ2VuZXJhdGVkIGEgc2VnbWVudCB3aXRoIHRoZSBnaXZlblxuICogZGF0YSBhbmQgbW9kZS5cbiAqIE9iamVjdHMgbXVzdCBjb250YWluIGF0IGxlYXN0IHRoZSBwcm9wZXJ0eSBcImRhdGFcIi5cbiAqIElmIHByb3BlcnR5IFwibW9kZVwiIGlzIG5vdCBwcmVzZW50LCB0aGUgbW9yZSBzdWl0YWJsZSBtb2RlIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gYXJyYXkgQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBTZWdtZW50c1xuICovXG5leHBvcnRzLmZyb21BcnJheSA9IGZ1bmN0aW9uIGZyb21BcnJheSAoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAoYWNjLCBzZWcpIHtcbiAgICBpZiAodHlwZW9mIHNlZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcsIG51bGwpKVxuICAgIH0gZWxzZSBpZiAoc2VnLmRhdGEpIHtcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcuZGF0YSwgc2VnLm1vZGUpKVxuICAgIH1cblxuICAgIHJldHVybiBhY2NcbiAgfSwgW10pXG59XG5cbi8qKlxuICogQnVpbGRzIGFuIG9wdGltaXplZCBzZXF1ZW5jZSBvZiBzZWdtZW50cyBmcm9tIGEgc3RyaW5nLFxuICogd2hpY2ggd2lsbCBwcm9kdWNlIHRoZSBzaG9ydGVzdCBwb3NzaWJsZSBiaXRzdHJlYW0uXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgIElucHV0IHN0cmluZ1xuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXG4gKi9cbmV4cG9ydHMuZnJvbVN0cmluZyA9IGZ1bmN0aW9uIGZyb21TdHJpbmcgKGRhdGEsIHZlcnNpb24pIHtcbiAgdmFyIHNlZ3MgPSBnZXRTZWdtZW50c0Zyb21TdHJpbmcoZGF0YSwgVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpXG5cbiAgdmFyIG5vZGVzID0gYnVpbGROb2RlcyhzZWdzKVxuICB2YXIgZ3JhcGggPSBidWlsZEdyYXBoKG5vZGVzLCB2ZXJzaW9uKVxuICB2YXIgcGF0aCA9IGRpamtzdHJhLmZpbmRfcGF0aChncmFwaC5tYXAsICdzdGFydCcsICdlbmQnKVxuXG4gIHZhciBvcHRpbWl6ZWRTZWdzID0gW11cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIG9wdGltaXplZFNlZ3MucHVzaChncmFwaC50YWJsZVtwYXRoW2ldXS5ub2RlKVxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KG1lcmdlU2VnbWVudHMob3B0aW1pemVkU2VncykpXG59XG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGluIHZhcmlvdXMgc2VnbWVudHMgd2l0aCB0aGUgbW9kZXMgd2hpY2hcbiAqIGJlc3QgcmVwcmVzZW50IHRoZWlyIGNvbnRlbnQuXG4gKiBUaGUgcHJvZHVjZWQgc2VnbWVudHMgYXJlIGZhciBmcm9tIGJlaW5nIG9wdGltaXplZC5cbiAqIFRoZSBvdXRwdXQgb2YgdGhpcyBmdW5jdGlvbiBpcyBvbmx5IHVzZWQgdG8gZXN0aW1hdGUgYSBRUiBDb2RlIHZlcnNpb25cbiAqIHdoaWNoIG1heSBjb250YWluIHRoZSBkYXRhLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gZGF0YSBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBzZWdtZW50c1xuICovXG5leHBvcnRzLnJhd1NwbGl0ID0gZnVuY3Rpb24gcmF3U3BsaXQgKGRhdGEpIHtcbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KFxuICAgIGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcbiAgKVxufVxuIiwidmFyIHRvU0pJU0Z1bmN0aW9uXG52YXIgQ09ERVdPUkRTX0NPVU5UID0gW1xuICAwLCAvLyBOb3QgdXNlZFxuICAyNiwgNDQsIDcwLCAxMDAsIDEzNCwgMTcyLCAxOTYsIDI0MiwgMjkyLCAzNDYsXG4gIDQwNCwgNDY2LCA1MzIsIDU4MSwgNjU1LCA3MzMsIDgxNSwgOTAxLCA5OTEsIDEwODUsXG4gIDExNTYsIDEyNTgsIDEzNjQsIDE0NzQsIDE1ODgsIDE3MDYsIDE4MjgsIDE5MjEsIDIwNTEsIDIxODUsXG4gIDIzMjMsIDI0NjUsIDI2MTEsIDI3NjEsIDI4NzYsIDMwMzQsIDMxOTYsIDMzNjIsIDM1MzIsIDM3MDZcbl1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBRUiBDb2RlIHNpemUgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBzaXplIG9mIFFSIGNvZGVcbiAqL1xuZXhwb3J0cy5nZXRTeW1ib2xTaXplID0gZnVuY3Rpb24gZ2V0U3ltYm9sU2l6ZSAodmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgaWYgKHZlcnNpb24gPCAxIHx8IHZlcnNpb24gPiA0MCkgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBzaG91bGQgYmUgaW4gcmFuZ2UgZnJvbSAxIHRvIDQwJylcbiAgcmV0dXJuIHZlcnNpb24gKiA0ICsgMTdcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgY29kZXdvcmRzIHVzZWQgdG8gc3RvcmUgZGF0YSBhbmQgRUMgaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIERhdGEgbGVuZ3RoIGluIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRTeW1ib2xUb3RhbENvZGV3b3JkcyA9IGZ1bmN0aW9uIGdldFN5bWJvbFRvdGFsQ29kZXdvcmRzICh2ZXJzaW9uKSB7XG4gIHJldHVybiBDT0RFV09SRFNfQ09VTlRbdmVyc2lvbl1cbn1cblxuLyoqXG4gKiBFbmNvZGUgZGF0YSB3aXRoIEJvc2UtQ2hhdWRodXJpLUhvY3F1ZW5naGVtXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkYXRhIFZhbHVlIHRvIGVuY29kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIEVuY29kZWQgdmFsdWVcbiAqL1xuZXhwb3J0cy5nZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIHZhciBkaWdpdCA9IDBcblxuICB3aGlsZSAoZGF0YSAhPT0gMCkge1xuICAgIGRpZ2l0KytcbiAgICBkYXRhID4+Pj0gMVxuICB9XG5cbiAgcmV0dXJuIGRpZ2l0XG59XG5cbmV4cG9ydHMuc2V0VG9TSklTRnVuY3Rpb24gPSBmdW5jdGlvbiBzZXRUb1NKSVNGdW5jdGlvbiAoZikge1xuICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1widG9TSklTRnVuY1wiIGlzIG5vdCBhIHZhbGlkIGZ1bmN0aW9uLicpXG4gIH1cblxuICB0b1NKSVNGdW5jdGlvbiA9IGZcbn1cblxuZXhwb3J0cy5pc0thbmppTW9kZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgdG9TSklTRnVuY3Rpb24gIT09ICd1bmRlZmluZWQnXG59XG5cbmV4cG9ydHMudG9TSklTID0gZnVuY3Rpb24gdG9TSklTIChrYW5qaSkge1xuICByZXR1cm4gdG9TSklTRnVuY3Rpb24oa2FuamkpXG59XG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbnZhciBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXG52YXIgRUNMZXZlbCA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1sZXZlbCcpXG52YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG4vLyBHZW5lcmF0b3IgcG9seW5vbWlhbCB1c2VkIHRvIGVuY29kZSB2ZXJzaW9uIGluZm9ybWF0aW9uXG52YXIgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKVxudmFyIEcxOF9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTgpXG5cbmZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yRGF0YUxlbmd0aCAobW9kZSwgbGVuZ3RoLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBmb3IgKHZhciBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XG4gICAgaWYgKGxlbmd0aCA8PSBleHBvcnRzLmdldENhcGFjaXR5KGN1cnJlbnRWZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkpIHtcbiAgICAgIHJldHVybiBjdXJyZW50VmVyc2lvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZnVuY3Rpb24gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQgKG1vZGUsIHZlcnNpb24pIHtcbiAgLy8gQ2hhcmFjdGVyIGNvdW50IGluZGljYXRvciArIG1vZGUgaW5kaWNhdG9yIGJpdHNcbiAgcmV0dXJuIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKG1vZGUsIHZlcnNpb24pICsgNFxufVxuXG5mdW5jdGlvbiBnZXRUb3RhbEJpdHNGcm9tRGF0YUFycmF5IChzZWdtZW50cywgdmVyc2lvbikge1xuICB2YXIgdG90YWxCaXRzID0gMFxuXG4gIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgcmVzZXJ2ZWRCaXRzID0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQoZGF0YS5tb2RlLCB2ZXJzaW9uKVxuICAgIHRvdGFsQml0cyArPSByZXNlcnZlZEJpdHMgKyBkYXRhLmdldEJpdHNMZW5ndGgoKVxuICB9KVxuXG4gIHJldHVybiB0b3RhbEJpdHNcbn1cblxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JNaXhlZERhdGEgKHNlZ21lbnRzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBmb3IgKHZhciBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XG4gICAgdmFyIGxlbmd0aCA9IGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkoc2VnbWVudHMsIGN1cnJlbnRWZXJzaW9uKVxuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIE1vZGUuTUlYRUQpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgUVIgQ29kZSB2ZXJzaW9uIGlzIHZhbGlkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCB2ZXJzaW9uLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAodmVyc2lvbikge1xuICByZXR1cm4gIWlzTmFOKHZlcnNpb24pICYmIHZlcnNpb24gPj0gMSAmJiB2ZXJzaW9uIDw9IDQwXG59XG5cbi8qKlxuICogUmV0dXJucyB2ZXJzaW9uIG51bWJlciBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCB2ZXJzaW9uLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge051bWJlcn0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvbiBudW1iZXJcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApXG4gIH1cblxuICByZXR1cm4gZGVmYXVsdFZhbHVlXG59XG5cbi8qKlxuICogUmV0dXJucyBob3cgbXVjaCBkYXRhIGNhbiBiZSBzdG9yZWQgd2l0aCB0aGUgc3BlY2lmaWVkIFFSIGNvZGUgdmVyc2lvblxuICogYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvbiAoMS00MClcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgICAgICAgICAgICAgICBEYXRhIG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgUXVhbnRpdHkgb2Ygc3RvcmFibGUgZGF0YVxuICovXG5leHBvcnRzLmdldENhcGFjaXR5ID0gZnVuY3Rpb24gZ2V0Q2FwYWNpdHkgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSB7XG4gIGlmICghZXhwb3J0cy5pc1ZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXG4gIH1cblxuICAvLyBVc2UgQnl0ZSBtb2RlIGFzIGRlZmF1bHRcbiAgaWYgKHR5cGVvZiBtb2RlID09PSAndW5kZWZpbmVkJykgbW9kZSA9IE1vZGUuQllURVxuXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxuICB2YXIgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xuICB2YXIgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xuICB2YXIgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxuXG4gIGlmIChtb2RlID09PSBNb2RlLk1JWEVEKSByZXR1cm4gZGF0YVRvdGFsQ29kZXdvcmRzQml0c1xuXG4gIHZhciB1c2FibGVCaXRzID0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGdldFJlc2VydmVkQml0c0NvdW50KG1vZGUsIHZlcnNpb24pXG5cbiAgLy8gUmV0dXJuIG1heCBudW1iZXIgb2Ygc3RvcmFibGUgY29kZXdvcmRzXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHVzYWJsZUJpdHMgLyAxMCkgKiAzKVxuXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTEpICogMilcblxuICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyAxMylcblxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gOClcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gdmVyc2lvbiBuZWVkZWQgdG8gY29udGFpbiB0aGUgYW1vdW50IG9mIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtTZWdtZW50fSBkYXRhICAgICAgICAgICAgICAgICAgICBTZWdtZW50IG9mIGRhdGFcbiAqIEBwYXJhbSAge051bWJlcn0gW2Vycm9yQ29ycmVjdGlvbkxldmVsPUhdIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgICAgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdFZlcnNpb25Gb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhIChkYXRhLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICB2YXIgc2VnXG5cbiAgdmFyIGVjbCA9IEVDTGV2ZWwuZnJvbShlcnJvckNvcnJlY3Rpb25MZXZlbCwgRUNMZXZlbC5NKVxuXG4gIGlmIChpc0FycmF5KGRhdGEpKSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoID4gMSkge1xuICAgICAgcmV0dXJuIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhKGRhdGEsIGVjbClcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgc2VnID0gZGF0YVswXVxuICB9IGVsc2Uge1xuICAgIHNlZyA9IGRhdGFcbiAgfVxuXG4gIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGgoc2VnLm1vZGUsIHNlZy5nZXRMZW5ndGgoKSwgZWNsKVxufVxuXG4vKipcbiAqIFJldHVybnMgdmVyc2lvbiBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xuICpcbiAqIFRoZSB2ZXJzaW9uIGluZm9ybWF0aW9uIGlzIGluY2x1ZGVkIGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDcgb3IgbGFyZ2VyLlxuICogSXQgY29uc2lzdHMgb2YgYW4gMTgtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNiBkYXRhIGJpdHMsXG4gKiB3aXRoIDEyIGVycm9yIGNvcnJlY3Rpb24gYml0cyBjYWxjdWxhdGVkIHVzaW5nIHRoZSAoMTgsIDYpIEdvbGF5IGNvZGUuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIEVuY29kZWQgdmVyc2lvbiBpbmZvIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzICh2ZXJzaW9uKSB7XG4gIGlmICghZXhwb3J0cy5pc1ZhbGlkKHZlcnNpb24pIHx8IHZlcnNpb24gPCA3KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXG4gIH1cblxuICB2YXIgZCA9IHZlcnNpb24gPDwgMTJcblxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMThfQkNIID49IDApIHtcbiAgICBkIF49IChHMTggPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCkpXG4gIH1cblxuICByZXR1cm4gKHZlcnNpb24gPDwgMTIpIHwgZFxufVxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzIChjdHgsIGNhbnZhcywgc2l6ZSkge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICBpZiAoIWNhbnZhcy5zdHlsZSkgY2FudmFzLnN0eWxlID0ge31cbiAgY2FudmFzLmhlaWdodCA9IHNpemVcbiAgY2FudmFzLndpZHRoID0gc2l6ZVxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gc2l6ZSArICdweCdcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gc2l6ZSArICdweCdcbn1cblxuZnVuY3Rpb24gZ2V0Q2FudmFzRWxlbWVudCAoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgYSBjYW52YXMgZWxlbWVudCcpXG4gIH1cbn1cblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHFyRGF0YSwgY2FudmFzLCBvcHRpb25zKSB7XG4gIHZhciBvcHRzID0gb3B0aW9uc1xuICB2YXIgY2FudmFzRWwgPSBjYW52YXNcblxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcbiAgICBvcHRzID0gY2FudmFzXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAoIWNhbnZhcykge1xuICAgIGNhbnZhc0VsID0gZ2V0Q2FudmFzRWxlbWVudCgpXG4gIH1cblxuICBvcHRzID0gVXRpbHMuZ2V0T3B0aW9ucyhvcHRzKVxuICB2YXIgc2l6ZSA9IFV0aWxzLmdldEltYWdlV2lkdGgocXJEYXRhLm1vZHVsZXMuc2l6ZSwgb3B0cylcblxuICB2YXIgY3R4ID0gY2FudmFzRWwuZ2V0Q29udGV4dCgnMmQnKVxuICB2YXIgaW1hZ2UgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHNpemUsIHNpemUpXG4gIFV0aWxzLnFyVG9JbWFnZURhdGEoaW1hZ2UuZGF0YSwgcXJEYXRhLCBvcHRzKVxuXG4gIGNsZWFyQ2FudmFzKGN0eCwgY2FudmFzRWwsIHNpemUpXG4gIGN0eC5wdXRJbWFnZURhdGEoaW1hZ2UsIDAsIDApXG5cbiAgcmV0dXJuIGNhbnZhc0VsXG59XG5cbmV4cG9ydHMucmVuZGVyVG9EYXRhVVJMID0gZnVuY3Rpb24gcmVuZGVyVG9EYXRhVVJMIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xuICB2YXIgb3B0cyA9IG9wdGlvbnNcblxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcbiAgICBvcHRzID0gY2FudmFzXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAoIW9wdHMpIG9wdHMgPSB7fVxuXG4gIHZhciBjYW52YXNFbCA9IGV4cG9ydHMucmVuZGVyKHFyRGF0YSwgY2FudmFzLCBvcHRzKVxuXG4gIHZhciB0eXBlID0gb3B0cy50eXBlIHx8ICdpbWFnZS9wbmcnXG4gIHZhciByZW5kZXJlck9wdHMgPSBvcHRzLnJlbmRlcmVyT3B0cyB8fCB7fVxuXG4gIHJldHVybiBjYW52YXNFbC50b0RhdGFVUkwodHlwZSwgcmVuZGVyZXJPcHRzLnF1YWxpdHkpXG59XG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gZ2V0Q29sb3JBdHRyaWIgKGNvbG9yLCBhdHRyaWIpIHtcbiAgdmFyIGFscGhhID0gY29sb3IuYSAvIDI1NVxuICB2YXIgc3RyID0gYXR0cmliICsgJz1cIicgKyBjb2xvci5oZXggKyAnXCInXG5cbiAgcmV0dXJuIGFscGhhIDwgMVxuICAgID8gc3RyICsgJyAnICsgYXR0cmliICsgJy1vcGFjaXR5PVwiJyArIGFscGhhLnRvRml4ZWQoMikuc2xpY2UoMSkgKyAnXCInXG4gICAgOiBzdHJcbn1cblxuZnVuY3Rpb24gc3ZnQ21kIChjbWQsIHgsIHkpIHtcbiAgdmFyIHN0ciA9IGNtZCArIHhcbiAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgc3RyICs9ICcgJyArIHlcblxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHFyVG9QYXRoIChkYXRhLCBzaXplLCBtYXJnaW4pIHtcbiAgdmFyIHBhdGggPSAnJ1xuICB2YXIgbW92ZUJ5ID0gMFxuICB2YXIgbmV3Um93ID0gZmFsc2VcbiAgdmFyIGxpbmVMZW5ndGggPSAwXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNvbCA9IE1hdGguZmxvb3IoaSAlIHNpemUpXG4gICAgdmFyIHJvdyA9IE1hdGguZmxvb3IoaSAvIHNpemUpXG5cbiAgICBpZiAoIWNvbCAmJiAhbmV3Um93KSBuZXdSb3cgPSB0cnVlXG5cbiAgICBpZiAoZGF0YVtpXSkge1xuICAgICAgbGluZUxlbmd0aCsrXG5cbiAgICAgIGlmICghKGkgPiAwICYmIGNvbCA+IDAgJiYgZGF0YVtpIC0gMV0pKSB7XG4gICAgICAgIHBhdGggKz0gbmV3Um93XG4gICAgICAgICAgPyBzdmdDbWQoJ00nLCBjb2wgKyBtYXJnaW4sIDAuNSArIHJvdyArIG1hcmdpbilcbiAgICAgICAgICA6IHN2Z0NtZCgnbScsIG1vdmVCeSwgMClcblxuICAgICAgICBtb3ZlQnkgPSAwXG4gICAgICAgIG5ld1JvdyA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGlmICghKGNvbCArIDEgPCBzaXplICYmIGRhdGFbaSArIDFdKSkge1xuICAgICAgICBwYXRoICs9IHN2Z0NtZCgnaCcsIGxpbmVMZW5ndGgpXG4gICAgICAgIGxpbmVMZW5ndGggPSAwXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1vdmVCeSsrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhdGhcbn1cblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHFyRGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdGlvbnMpXG4gIHZhciBzaXplID0gcXJEYXRhLm1vZHVsZXMuc2l6ZVxuICB2YXIgZGF0YSA9IHFyRGF0YS5tb2R1bGVzLmRhdGFcbiAgdmFyIHFyY29kZXNpemUgPSBzaXplICsgb3B0cy5tYXJnaW4gKiAyXG5cbiAgdmFyIGJnID0gIW9wdHMuY29sb3IubGlnaHQuYVxuICAgID8gJydcbiAgICA6ICc8cGF0aCAnICsgZ2V0Q29sb3JBdHRyaWIob3B0cy5jb2xvci5saWdodCwgJ2ZpbGwnKSArXG4gICAgICAnIGQ9XCJNMCAwaCcgKyBxcmNvZGVzaXplICsgJ3YnICsgcXJjb2Rlc2l6ZSArICdIMHpcIi8+J1xuXG4gIHZhciBwYXRoID1cbiAgICAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IuZGFyaywgJ3N0cm9rZScpICtcbiAgICAnIGQ9XCInICsgcXJUb1BhdGgoZGF0YSwgc2l6ZSwgb3B0cy5tYXJnaW4pICsgJ1wiLz4nXG5cbiAgdmFyIHZpZXdCb3ggPSAndmlld0JveD1cIicgKyAnMCAwICcgKyBxcmNvZGVzaXplICsgJyAnICsgcXJjb2Rlc2l6ZSArICdcIidcblxuICB2YXIgd2lkdGggPSAhb3B0cy53aWR0aCA/ICcnIDogJ3dpZHRoPVwiJyArIG9wdHMud2lkdGggKyAnXCIgaGVpZ2h0PVwiJyArIG9wdHMud2lkdGggKyAnXCIgJ1xuXG4gIHZhciBzdmdUYWcgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgJyArIHdpZHRoICsgdmlld0JveCArICc+JyArIGJnICsgcGF0aCArICc8L3N2Zz4nXG5cbiAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiKG51bGwsIHN2Z1RhZylcbiAgfVxuXG4gIHJldHVybiBzdmdUYWdcbn1cbiIsImZ1bmN0aW9uIGhleDJyZ2JhIChoZXgpIHtcbiAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb2xvciBzaG91bGQgYmUgZGVmaW5lZCBhcyBoZXggc3RyaW5nJylcbiAgfVxuXG4gIHZhciBoZXhDb2RlID0gaGV4LnNsaWNlKCkucmVwbGFjZSgnIycsICcnKS5zcGxpdCgnJylcbiAgaWYgKGhleENvZGUubGVuZ3RoIDwgMyB8fCBoZXhDb2RlLmxlbmd0aCA9PT0gNSB8fCBoZXhDb2RlLmxlbmd0aCA+IDgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IGNvbG9yOiAnICsgaGV4KVxuICB9XG5cbiAgLy8gQ29udmVydCBmcm9tIHNob3J0IHRvIGxvbmcgZm9ybSAoZmZmIC0+IGZmZmZmZilcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSAzIHx8IGhleENvZGUubGVuZ3RoID09PSA0KSB7XG4gICAgaGV4Q29kZSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGhleENvZGUubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICByZXR1cm4gW2MsIGNdXG4gICAgfSkpXG4gIH1cblxuICAvLyBBZGQgZGVmYXVsdCBhbHBoYSB2YWx1ZVxuICBpZiAoaGV4Q29kZS5sZW5ndGggPT09IDYpIGhleENvZGUucHVzaCgnRicsICdGJylcblxuICB2YXIgaGV4VmFsdWUgPSBwYXJzZUludChoZXhDb2RlLmpvaW4oJycpLCAxNilcblxuICByZXR1cm4ge1xuICAgIHI6IChoZXhWYWx1ZSA+PiAyNCkgJiAyNTUsXG4gICAgZzogKGhleFZhbHVlID4+IDE2KSAmIDI1NSxcbiAgICBiOiAoaGV4VmFsdWUgPj4gOCkgJiAyNTUsXG4gICAgYTogaGV4VmFsdWUgJiAyNTUsXG4gICAgaGV4OiAnIycgKyBoZXhDb2RlLnNsaWNlKDAsIDYpLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0cy5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyAob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fVxuICBpZiAoIW9wdGlvbnMuY29sb3IpIG9wdGlvbnMuY29sb3IgPSB7fVxuXG4gIHZhciBtYXJnaW4gPSB0eXBlb2Ygb3B0aW9ucy5tYXJnaW4gPT09ICd1bmRlZmluZWQnIHx8XG4gICAgb3B0aW9ucy5tYXJnaW4gPT09IG51bGwgfHxcbiAgICBvcHRpb25zLm1hcmdpbiA8IDAgPyA0IDogb3B0aW9ucy5tYXJnaW5cblxuICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoICYmIG9wdGlvbnMud2lkdGggPj0gMjEgPyBvcHRpb25zLndpZHRoIDogdW5kZWZpbmVkXG4gIHZhciBzY2FsZSA9IG9wdGlvbnMuc2NhbGUgfHwgNFxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIHNjYWxlOiB3aWR0aCA/IDQgOiBzY2FsZSxcbiAgICBtYXJnaW46IG1hcmdpbixcbiAgICBjb2xvcjoge1xuICAgICAgZGFyazogaGV4MnJnYmEob3B0aW9ucy5jb2xvci5kYXJrIHx8ICcjMDAwMDAwZmYnKSxcbiAgICAgIGxpZ2h0OiBoZXgycmdiYShvcHRpb25zLmNvbG9yLmxpZ2h0IHx8ICcjZmZmZmZmZmYnKVxuICAgIH0sXG4gICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgIHJlbmRlcmVyT3B0czogb3B0aW9ucy5yZW5kZXJlck9wdHMgfHwge31cbiAgfVxufVxuXG5leHBvcnRzLmdldFNjYWxlID0gZnVuY3Rpb24gZ2V0U2NhbGUgKHFyU2l6ZSwgb3B0cykge1xuICByZXR1cm4gb3B0cy53aWR0aCAmJiBvcHRzLndpZHRoID49IHFyU2l6ZSArIG9wdHMubWFyZ2luICogMlxuICAgID8gb3B0cy53aWR0aCAvIChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpXG4gICAgOiBvcHRzLnNjYWxlXG59XG5cbmV4cG9ydHMuZ2V0SW1hZ2VXaWR0aCA9IGZ1bmN0aW9uIGdldEltYWdlV2lkdGggKHFyU2l6ZSwgb3B0cykge1xuICB2YXIgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHFyU2l6ZSwgb3B0cylcbiAgcmV0dXJuIE1hdGguZmxvb3IoKHFyU2l6ZSArIG9wdHMubWFyZ2luICogMikgKiBzY2FsZSlcbn1cblxuZXhwb3J0cy5xclRvSW1hZ2VEYXRhID0gZnVuY3Rpb24gcXJUb0ltYWdlRGF0YSAoaW1nRGF0YSwgcXIsIG9wdHMpIHtcbiAgdmFyIHNpemUgPSBxci5tb2R1bGVzLnNpemVcbiAgdmFyIGRhdGEgPSBxci5tb2R1bGVzLmRhdGFcbiAgdmFyIHNjYWxlID0gZXhwb3J0cy5nZXRTY2FsZShzaXplLCBvcHRzKVxuICB2YXIgc3ltYm9sU2l6ZSA9IE1hdGguZmxvb3IoKHNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXG4gIHZhciBzY2FsZWRNYXJnaW4gPSBvcHRzLm1hcmdpbiAqIHNjYWxlXG4gIHZhciBwYWxldHRlID0gW29wdHMuY29sb3IubGlnaHQsIG9wdHMuY29sb3IuZGFya11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbFNpemU7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ltYm9sU2l6ZTsgaisrKSB7XG4gICAgICB2YXIgcG9zRHN0ID0gKGkgKiBzeW1ib2xTaXplICsgaikgKiA0XG4gICAgICB2YXIgcHhDb2xvciA9IG9wdHMuY29sb3IubGlnaHRcblxuICAgICAgaWYgKGkgPj0gc2NhbGVkTWFyZ2luICYmIGogPj0gc2NhbGVkTWFyZ2luICYmXG4gICAgICAgIGkgPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luICYmIGogPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luKSB7XG4gICAgICAgIHZhciBpU3JjID0gTWF0aC5mbG9vcigoaSAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcbiAgICAgICAgdmFyIGpTcmMgPSBNYXRoLmZsb29yKChqIC0gc2NhbGVkTWFyZ2luKSAvIHNjYWxlKVxuICAgICAgICBweENvbG9yID0gcGFsZXR0ZVtkYXRhW2lTcmMgKiBzaXplICsgalNyY10gPyAxIDogMF1cbiAgICAgIH1cblxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLnJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5nXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuYlxuICAgICAgaW1nRGF0YVtwb3NEc3RdID0gcHhDb2xvci5hXG4gICAgfVxuICB9XG59XG4iLCIvKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIGEgc3Vic2V0IG9mIG5vZGUuanMgQnVmZmVyIG1ldGhvZHMgZm9yIHRoZSBicm93c2VyLlxuICogQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICAvLyBDYW4gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbnZhciBLX01BWF9MRU5HVEggPSBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVFxuICAgID8gMHg3ZmZmZmZmZlxuICAgIDogMHgzZmZmZmZmZlxuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiAhKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoYXJnLCBvZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBhbGxvY1Vuc2FmZSh0aGlzLCBhcmcpXG4gIH1cblxuICByZXR1cm4gZnJvbSh0aGlzLCBhcmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5pZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuICBCdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuXG4gIC8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAmJlxuICAgICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKHRoYXQsIGxlbmd0aCkge1xuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICBidWYgPSB0aGF0XG4gICAgaWYgKGJ1ZiA9PT0gbnVsbCkge1xuICAgICAgYnVmID0gbmV3IEJ1ZmZlcihsZW5ndGgpXG4gICAgfVxuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHRoYXQsIHNpemUpIHtcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcblxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyArK2kpIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZykge1xuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcpIHwgMFxuICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gYnVmLndyaXRlKHN0cmluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyICh0aGF0LCBhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIGJ1ZiA9IGZyb21BcnJheUxpa2UodGhhdCwgYnVmKVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW4pXG5cbiAgICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJ1ZlxuICAgIH1cblxuICAgIG9iai5jb3B5KGJ1ZiwgMCwgMCwgbGVuKVxuICAgIHJldHVybiBidWZcbiAgfVxuXG4gIGlmIChvYmopIHtcbiAgICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgb2JqLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fCAnbGVuZ3RoJyBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgaXNuYW4ob2JqLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCAwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqKVxuICAgIH1cblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgQXJyYXkuaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iai5kYXRhKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBzdHJpbmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gZnJvbSAodGhhdCwgdmFsdWUsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIGEgbnVtYmVyJylcbiAgfVxuXG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHRoYXQsIHZhbHVlLCBvZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodGhhdCwgdmFsdWUsIG9mZnNldClcbiAgfVxuXG4gIHJldHVybiBmcm9tT2JqZWN0KHRoYXQsIHZhbHVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF0pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoIHwgMFxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47ICsraSkge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiBuZXcgQnVmZmVyKHZhbClcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKG51bGwsIDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBhbGxvY1Vuc2FmZShudWxsLCBsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWZmZXJcbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnXG5tb2R1bGUuZXhwb3J0cyA9ICh0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYpIHx8XG4gICh0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsKSB8fFxuICB0aGlzXG4iLCIvKiBzaWxvei5pb1xuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgTWFpbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9tYWluLmpzJylcblxuZHVycnV0aS5yZW5kZXIoTWFpbiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcCcpKVxuIiwiLyogZWRpdG9yIGJhclxuICovXG5cbmZ1bmN0aW9uIEVkaXRvckJhciAoYWN0aW9ucykge1xuICB2YXIgcGx1Z2lucyA9IGFjdGlvbnMuZ2V0UGx1Z2lucygpXG4gIHZhciBvcHRpb25zID0ge1xuICAgIGh0bWw6IFt7XG4gICAgICB0aXRsZTogJ0hUTUwnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdNYXJrZG93bicsXG4gICAgICBwbHVnaW46ICdtYXJrZG93bidcbiAgICB9XSxcbiAgICBjc3M6IFt7XG4gICAgICB0aXRsZTogJ0NTUydcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ0xlc3MnLFxuICAgICAgcGx1Z2luOiAnbGVzcydcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ1N0eWx1cycsXG4gICAgICBwbHVnaW46ICdzdHlsdXMnXG4gICAgfV0sXG4gICAganM6IFt7XG4gICAgICB0aXRsZTogJ0phdmFTY3JpcHQnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdFUzIwMTUvQmFiZWwnLFxuICAgICAgcGx1Z2luOiAnYmFiZWwnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdDb2ZmZWVTY3JpcHQnLFxuICAgICAgcGx1Z2luOiAnY29mZmVlc2NyaXB0J1xuICAgIH1dXG4gIH1cblxuICB2YXIgc2VsZWN0ZWQgPSB7XG4gICAgaHRtbDogJycsXG4gICAgY3NzOiAnJyxcbiAgICBqczogJydcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBsdWdpbiAobGlzdCwgbmFtZSkge1xuICAgIHZhciBmb3VuZFBsdWdpbiA9IG51bGxcbiAgICBsaXN0LnNvbWUoKHBsdWdpbikgPT4ge1xuICAgICAgaWYgKHBsdWdpbi5wbHVnaW4gPT09IG5hbWUpIHtcbiAgICAgICAgZm91bmRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZvdW5kUGx1Z2luXG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VQcm9jZXNzb3IgKHR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gcmVtb3ZlIGxhc3Qgc2VsZWN0ZWQgcGx1Z2luXG4gICAgICBhY3Rpb25zLnJlbW92ZVBsdWdpbihzZWxlY3RlZFt0eXBlXSlcblxuICAgICAgLy8gdXBkYXRlIHJlZmVyZW5jZVxuICAgICAgc2VsZWN0ZWRbdHlwZV0gPSB0aGlzLnZhbHVlXG5cbiAgICAgIHZhciBwbHVnaW4gPSBnZXRQbHVnaW4ob3B0aW9uc1t0eXBlXSwgc2VsZWN0ZWRbdHlwZV0pXG4gICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgIGFjdGlvbnMuYWRkUGx1Z2luKHBsdWdpbi5wbHVnaW4pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU2VsZWN0ICh0eXBlLCBvcHRpb25zLCBzZWxlY3RlZCkge1xuICAgIHJldHVybiBgXG4gICAgICA8c2VsZWN0IGNsYXNzPVwic2VsZWN0IGVkaXRvci1iYXItc2VsZWN0LSR7dHlwZX1cIj5cbiAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIke29wdC5wbHVnaW4gfHwgJyd9XCIgJHtvcHQucGx1Z2luID09PSBzZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICAgICR7b3B0LnRpdGxlfVxuICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgYFxuICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgIDwvc2VsZWN0PlxuICAgIGBcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEluaXRpYWxWYWx1ZXMgKCkge1xuICAgIC8vIHNldCBzZWxlY3RlZCB2YWx1ZXMgYmFzZWQgb24gc3RvcmVcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBvcHRpb25zW3R5cGVdLmZvckVhY2goKG9wdGlvbikgPT4ge1xuICAgICAgICBpZiAocGx1Z2lucy5pbmRleE9mKG9wdGlvbi5wbHVnaW4pICE9PSAtMSkge1xuICAgICAgICAgIHNlbGVjdGVkW3R5cGVdID0gb3B0aW9uLnBsdWdpblxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZVBhbmUgKHR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHBhbmVzID0ge31cbiAgICAgIHBhbmVzW3R5cGVdID0ge1xuICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgIH1cblxuICAgICAgYWN0aW9ucy51cGRhdGVQYW5lcyhwYW5lcylcbiAgICB9XG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICBmb3IgKGxldCB0eXBlIG9mIFsgJ2h0bWwnLCAnY3NzJywgJ2pzJyBdKSB7XG4gICAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC5lZGl0b3ItYmFyLXNlbGVjdC0ke3R5cGV9YCkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2hhbmdlUHJvY2Vzc29yKHR5cGUpKVxuXG4gICAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC5lZGl0b3ItYmFyLXBhbmUtY2xvc2UtJHt0eXBlfWApLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VQYW5lKHR5cGUpKVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHNldEluaXRpYWxWYWx1ZXMoKVxuXG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUgZWRpdG9yLWJhci1wYW5lLWh0bWxcIj5cbiAgICAgICAgICAke2NyZWF0ZVNlbGVjdCgnaHRtbCcsIG9wdGlvbnMuaHRtbCwgc2VsZWN0ZWQuaHRtbCl9XG5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImVkaXRvci1iYXItcGFuZS1jbG9zZSBlZGl0b3ItYmFyLXBhbmUtY2xvc2UtaHRtbCBidG5cIiB0aXRsZT1cIkhpZGUgSFRNTFwiPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uIGljb24tY2xvc2VcIj48L2k+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lIGVkaXRvci1iYXItcGFuZS1jc3NcIj5cbiAgICAgICAgICAke2NyZWF0ZVNlbGVjdCgnY3NzJywgb3B0aW9ucy5jc3MsIHNlbGVjdGVkLmNzcyl9XG5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImVkaXRvci1iYXItcGFuZS1jbG9zZSBlZGl0b3ItYmFyLXBhbmUtY2xvc2UtY3NzIGJ0blwiIHRpdGxlPVwiSGlkZSBDU1NcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpY29uLWNsb3NlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZSBlZGl0b3ItYmFyLXBhbmUtanNcIj5cbiAgICAgICAgICAke2NyZWF0ZVNlbGVjdCgnanMnLCBvcHRpb25zLmpzLCBzZWxlY3RlZC5qcyl9XG5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImVkaXRvci1iYXItcGFuZS1jbG9zZSBlZGl0b3ItYmFyLXBhbmUtY2xvc2UtanMgYnRuXCIgdGl0bGU9XCJIaWRlIEphdmFTY3JpcHRcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpY29uLWNsb3NlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZVwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yQmFyXG4iLCIvKiBlZGl0b3Igd2lkZ2V0XG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBKb3R0ZWQgPSByZXF1aXJlKCdqb3R0ZWQnKVxudmFyIGdsb2JhbEFjdGlvbnNcblxuLy8gam90dGVkIHBsdWdpblxuSm90dGVkLnBsdWdpbignc2lsb3onLCBmdW5jdGlvbiAoam90dGVkLCBvcHRpb25zKSB7XG4gIGpvdHRlZC5vbignY2hhbmdlJywgZnVuY3Rpb24gKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICBnbG9iYWxBY3Rpb25zLnVwZGF0ZUZpbGUoe1xuICAgICAgdHlwZTogcGFyYW1zLnR5cGUsXG4gICAgICBjb250ZW50OiBwYXJhbXMuY29udGVudFxuICAgIH0pXG5cbiAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpXG4gIH0sIDIpXG59KVxuXG52YXIgcGx1Z2luTGlicyA9IHtcbiAgbWFya2Rvd246IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbWFya2VkLzAuMy42L21hcmtlZC5taW4uanMnXSxcbiAgbGVzczogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9sZXNzLmpzLzIuNy4xL2xlc3MubWluLmpzJ10sXG4gIHN0eWx1czogWycvbGlicy9zdHlsdXMubWluLmpzJ10sXG4gIGNvZmZlZXNjcmlwdDogWydodHRwczovL2Nkbi5yYXdnaXQuY29tL2phc2hrZW5hcy9jb2ZmZWVzY3JpcHQvMS4xMS4xL2V4dHJhcy9jb2ZmZWUtc2NyaXB0LmpzJ10sXG4gIGVzMjAxNTogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9iYWJlbC1jb3JlLzYuMS4xOS9icm93c2VyLm1pbi5qcyddXG59XG5cbmZ1bmN0aW9uIEVkaXRvcldpZGdldCAoYWN0aW9ucykge1xuICBnbG9iYWxBY3Rpb25zID0gYWN0aW9uc1xuXG4gIHRoaXMubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIHZhciBwbHVnaW5zID0gYWN0aW9ucy5nZXRQbHVnaW5zKClcbiAgICB2YXIgbGlicyA9IFtdXG5cbiAgICAvLyBsb2FkIGxpYnNcbiAgICBPYmplY3Qua2V5cyhwbHVnaW5MaWJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBpZiAocGx1Z2lucy5pbmRleE9mKG5hbWUpICE9PSAtMSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShsaWJzLCBwbHVnaW5MaWJzW25hbWVdLm1hcCgodXJsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChkb25lKSA9PiB7XG4gICAgICAgICAgICB1dGlsLmxvYWRTY3JpcHQodXJsLCBkb25lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHBsdWdpbnMsIFtcbiAgICAgICdzaWxveicsXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb2RlbWlycm9yJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHRoZW1lOiBhY3Rpb25zLmdldFRoZW1lKCksXG4gICAgICAgICAgbGluZVdyYXBwaW5nOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKVxuXG4gICAgdXRpbC5hc3luYyhsaWJzLCAoKSA9PiB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1uZXcgKi9cbiAgICAgIG5ldyBKb3R0ZWQoJGNvbnRhaW5lciwge1xuICAgICAgICBmaWxlczogYWN0aW9ucy5nZXRGaWxlcygpLFxuICAgICAgICBwbHVnaW5zOiBwbHVnaW5zXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJlZGl0b3Itd2lkZ2V0IGpvdHRlZC10aGVtZS1zaWxvelwiPjwvZGl2PidcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvcldpZGdldFxuIiwiLyogZWRpdG9yXG4gKi9cblxudmFyIGR1cnJ1dGkgPSByZXF1aXJlKCdkdXJydXRpJylcbnZhciBFZGl0b3JCYXIgPSByZXF1aXJlKCcuL2VkaXRvci1iYXInKVxudmFyIEVkaXRvcldpZGdldCA9IHJlcXVpcmUoJy4vZWRpdG9yLXdpZGdldCcpXG5cbmZ1bmN0aW9uIEVkaXRvciAoYWN0aW9ucykge1xuICB2YXIgcGFuZXMgPSBhY3Rpb25zLmdldFBhbmVzKClcblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cImVkaXRvclxuICAgICAgICAke3BhbmVzLmh0bWwuaGlkZGVuID8gJ2VkaXRvci1pcy1oaWRkZW4taHRtbCcgOiAnJ31cbiAgICAgICAgJHtwYW5lcy5jc3MuaGlkZGVuID8gJ2VkaXRvci1pcy1oaWRkZW4tY3NzJyA6ICcnfVxuICAgICAgICAke3BhbmVzLmpzLmhpZGRlbiA/ICdlZGl0b3ItaXMtaGlkZGVuLWpzJyA6ICcnfVxuICAgICAgXCI+XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEVkaXRvckJhcihhY3Rpb25zKSl9XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEVkaXRvcldpZGdldChhY3Rpb25zKSl9XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JcbiIsIi8qIGFib3V0XG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBQb3B1cCA9IHJlcXVpcmUoJy4uL3BvcHVwJylcblxuZnVuY3Rpb24gSGVscCAoYWN0aW9ucywgYWN0aW9uc0ludGVybmFsKSB7XG4gIHZhciBzZWxmID0gdXRpbC5pbmhlcml0cyh0aGlzLCBQb3B1cClcbiAgUG9wdXAuY2FsbChzZWxmLCAnYWJvdXQnLCBhY3Rpb25zSW50ZXJuYWwpXG5cbiAgc2VsZi5tb3VudCA9IHNlbGYuc3VwZXIubW91bnQuYmluZChzZWxmKVxuICBzZWxmLnVubW91bnQgPSBzZWxmLnN1cGVyLnVubW91bnQuYmluZChzZWxmKVxuXG4gIHNlbGYucmVuZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiBzZWxmLnN1cGVyLnJlbmRlci5jYWxsKHNlbGYsICdBYm91dCcsIGBcbiAgICAgIDxwPlxuICAgICAgICA8YSBocmVmPVwiL1wiPnNpbG96LmlvPC9hPiBpcyBhIHByaXZhdGUgY29kZSBwbGF5Z3JvdW5kIGluIHRoZSBicm93c2VyLlxuICAgICAgPC9wPlxuXG4gICAgICA8cD5cbiAgICAgICAgWW91ciBzb3VyY2UgY29kZSBpcyBzYXZlZCBpbiB0aGUgVVJMIGFuZCBuZXZlciByZWFjaGVzIG91ciBzZXJ2ZXJzLlxuICAgICAgPC9wPlxuXG4gICAgICA8cD5cbiAgICAgICAgVXNlIEhUTUwsIENTUyBhbmQgSmF2YVNjcmlwdCwgYWxvbmcgd2l0aCBwcm9jZXNzb3JzIGxpa2UgQ29mZmVlU2NyaXB0LCBCYWJlbC9FUzIwMTUsIExlc3MsIFN0eWx1cyBvciBNYXJrZG93bi5cbiAgICAgIDwvcD5cblxuICAgICAgPGgyPlxuICAgICAgICBTaG9ydCBVUkxzXG4gICAgICA8L2gyPlxuXG4gICAgICA8cD5cbiAgICAgICAgc2lsb3ouaW8gY2FuIGdlbmVyYXRlIHNob3J0ZXIgdXJscywgYXQgYSBwcml2YWN5IGNvc3QuXG4gICAgICA8L3A+XG5cbiAgICAgIDxwPlxuICAgICAgICBXaGVuIGEgc2hvcnQgdXJsIGlzIGdlbmVyYXRlZCwgdGhlIHVybCAgLSB0aGF0IGluY2x1ZGVzIHRoZSBzb3VyY2UgY29kZSAtIGlzIHNhdmVkIG9uIHRoZSBzZXJ2ZXIsIGFsb25nIHdpdGggYSB1bmlxdWUgdG9rZW4uXG4gICAgICA8L3A+XG5cbiAgICAgIDxwPlxuICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2doaW5kYS9zaWxvei5pb1wiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgIFNvdXJjZSBjb2RlIGF2YWlsYWJsZSBvbiBHaXRIdWIuXG4gICAgICAgIDwvYT5cbiAgICAgIDwvcD5cbiAgICBgKVxuICB9XG5cbiAgcmV0dXJuIHNlbGZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWxwXG4iLCIvKiBoZWFkZXJcbiAqL1xuXG52YXIgZHVycnV0aSA9IHJlcXVpcmUoJ2R1cnJ1dGknKVxudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpXG52YXIgU2hhcmUgPSByZXF1aXJlKCcuL3NoYXJlJylcbnZhciBBYm91dCA9IHJlcXVpcmUoJy4vYWJvdXQnKVxuXG52YXIgSW50ZXJuYWxTdG9yZSA9IHJlcXVpcmUoJy4uLy4uL3N0YXRlL3N0b3JlLWludGVybmFsJylcbnZhciBzdG9yZUludGVybmFsID0gbmV3IEludGVybmFsU3RvcmUoKVxuXG5mdW5jdGlvbiBIZWFkZXIgKGFjdGlvbnMpIHtcbiAgdmFyICRjb250YWluZXJcbiAgdmFyIGRhdGEgPSBzdG9yZUludGVybmFsLmdldCgpXG4gIHZhciBhY3Rpb25zSW50ZXJuYWwgPSBzdG9yZUludGVybmFsLmFjdGlvbnNcbiAgdmFyIGxvYWRpbmdDb2xsYWJvcmF0ZSA9IGFjdGlvbnNJbnRlcm5hbC5nZXRMb2FkaW5nKCdjb2xsYWJvcmF0ZScpXG5cbiAgdmFyIGNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmV3RGF0YSA9IHN0b3JlSW50ZXJuYWwuZ2V0KClcblxuICAgIC8vIGlmIHNvbWV0aGluZyBjaGFuZ2VkLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkYXRhKSAhPT0gSlNPTi5zdHJpbmdpZnkobmV3RGF0YSkpIHtcbiAgICAgIGR1cnJ1dGkucmVuZGVyKG5ldyBIZWFkZXIoYWN0aW9ucyksICRjb250YWluZXIpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSAoKSB7XG4gICAgYWN0aW9uc0ludGVybmFsLnVwZGF0ZUxvYWRpbmcoJ2NvbGxhYm9yYXRlJywgZmFsc2UpXG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRub2RlKSB7XG4gICAgJGNvbnRhaW5lciA9ICRub2RlXG5cbiAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jb2xsYWJvcmF0ZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgLy8gbG9hZGluZ1xuICAgICAgYWN0aW9uc0ludGVybmFsLnVwZGF0ZUxvYWRpbmcoJ2NvbGxhYm9yYXRlJywgdHJ1ZSlcblxuICAgICAgd2luZG93LlRvZ2V0aGVySlMoKVxuXG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUy5vbigncmVhZHknLCBkb25lTG9hZGluZ0NvbGxhYm9yYXRlKVxuICAgICAgd2luZG93LlRvZ2V0aGVySlMub24oJ2Nsb3NlJywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICB9KVxuXG4gICAgc3RvcmVJbnRlcm5hbC5vbignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh3aW5kb3cuVG9nZXRoZXJKUykge1xuICAgICAgd2luZG93LlRvZ2V0aGVySlMub2ZmKCdyZWFkeScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUy5vZmYoJ2Nsb3NlJywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICB9XG5cbiAgICBzdG9yZUludGVybmFsLm9mZignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgPGEgaHJlZj1cIi9cIiBjbGFzcz1cImhlYWRlci1sb2dvXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIvaW1hZ2VzL2xvZ28ucG5nXCIgaGVpZ2h0PVwiMTZcIiBhbHQ9XCJzaWxvei5pb1wiPlxuICAgICAgICA8L2E+XG5cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgQWJvdXQoYWN0aW9ucywgc3RvcmVJbnRlcm5hbC5hY3Rpb25zKSl9XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IFNldHRpbmdzKGFjdGlvbnMsIHN0b3JlSW50ZXJuYWwuYWN0aW9ucykpfVxuXG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IFNoYXJlKGFjdGlvbnMsIHN0b3JlSW50ZXJuYWwuYWN0aW9ucykpfVxuXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGNvbGxhYm9yYXRlICR7bG9hZGluZ0NvbGxhYm9yYXRlID8gJ2lzLWxvYWRpbmcnIDogJyd9XCI+XG4gICAgICAgICAgQ29sbGFib3JhdGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cbiAgICBgXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJcbiIsIi8qIHNldHRpbmdzXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBQb3B1cCA9IHJlcXVpcmUoJy4uL3BvcHVwJylcblxuZnVuY3Rpb24gU2V0dGluZ3MgKGFjdGlvbnMsIGFjdGlvbnNJbnRlcm5hbCkge1xuICB2YXIgc2VsZiA9IHV0aWwuaW5oZXJpdHModGhpcywgUG9wdXApXG4gIFBvcHVwLmNhbGwoc2VsZiwgJ3NldHRpbmdzJywgYWN0aW9uc0ludGVybmFsKVxuXG4gIHZhciBwYW5lcyA9IGFjdGlvbnMuZ2V0UGFuZXMoKVxuICB2YXIgdGhlbWUgPSBhY3Rpb25zLmdldFRoZW1lKClcblxuICBmdW5jdGlvbiB0b2dnbGVQYW5lICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgcGFuZXMgPSB7fVxuICAgICAgcGFuZXNbdHlwZV0gPSB7IGhpZGRlbjogIShlLnRhcmdldC5jaGVja2VkKSB9XG4gICAgICByZXR1cm4gYWN0aW9ucy51cGRhdGVQYW5lcyhwYW5lcylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRUaGVtZSAoKSB7XG4gICAgYWN0aW9ucy51cGRhdGVUaGVtZSh0aGlzLnZhbHVlKVxuICB9XG5cbiAgc2VsZi5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gICAgc2VsZi5zdXBlci5tb3VudC5jYWxsKHNlbGYsICRjb250YWluZXIpXG5cbiAgICB2YXIgJHNob3dIdG1sID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3Mtc2hvdy1odG1sJylcbiAgICB2YXIgJHNob3dDc3MgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy1zaG93LWNzcycpXG4gICAgdmFyICRzaG93SnMgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy1zaG93LWpzJylcblxuICAgICRzaG93SHRtbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0b2dnbGVQYW5lKCdodG1sJykpXG4gICAgJHNob3dDc3MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdG9nZ2xlUGFuZSgnY3NzJykpXG4gICAgJHNob3dKcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0b2dnbGVQYW5lKCdqcycpKVxuXG4gICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3MtdGhlbWUnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBzZXRUaGVtZSlcbiAgfVxuXG4gIHNlbGYudW5tb3VudCA9IHNlbGYuc3VwZXIudW5tb3VudC5iaW5kKHNlbGYpXG5cbiAgc2VsZi5yZW5kZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGYuc3VwZXIucmVuZGVyLmNhbGwoc2VsZiwgJ1NldHRpbmdzJywgYFxuICAgICAgPGZpZWxkc2V0PlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFRhYnNcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPGxhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cInNldHRpbmdzLXNob3ctaHRtbFwiICR7IXBhbmVzLmh0bWwuaGlkZGVuID8gJ2NoZWNrZWQnIDogJyd9PlxuICAgICAgICAgIEhUTUxcbiAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2V0dGluZ3Mtc2hvdy1jc3NcIiAkeyFwYW5lcy5jc3MuaGlkZGVuID8gJ2NoZWNrZWQnIDogJyd9PlxuICAgICAgICAgIENTU1xuICAgICAgICA8L2xhYmVsPlxuXG4gICAgICAgIDxsYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJzZXR0aW5ncy1zaG93LWpzXCIgJHshcGFuZXMuanMuaGlkZGVuID8gJ2NoZWNrZWQnIDogJyd9PlxuICAgICAgICAgIEphdmFTY3JpcHRcbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvZmllbGRzZXQ+XG5cbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBUaGVtZVxuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8c2VsZWN0IGNsYXNzPVwic2V0dGluZ3MtdGhlbWUgc2VsZWN0XCI+XG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInNvbGFyaXplZCBsaWdodFwiICR7dGhlbWUgPT09ICdzb2xhcml6ZWQgbGlnaHQnID8gJ3NlbGVjdGVkJyA6ICcnfT5cbiAgICAgICAgICAgIFNvbGFyaXplZCBMaWdodFxuICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJzb2xhcml6ZWQgZGFya1wiICR7dGhlbWUgPT09ICdzb2xhcml6ZWQgZGFyaycgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgU29sYXJpemVkIERhcmtcbiAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgIGApXG4gIH1cblxuICByZXR1cm4gc2VsZlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzXG4iLCIvKiBzaGFyZVxuICovXG5cbnZhciBxcmNvZGUgPSByZXF1aXJlKCdxcmNvZGUnKVxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxudmFyIFBvcHVwID0gcmVxdWlyZSgnLi4vcG9wdXAnKVxuXG5mdW5jdGlvbiBTaGFyZSAoYWN0aW9ucywgYWN0aW9uc0ludGVybmFsKSB7XG4gIHZhciBzZWxmID0gdXRpbC5pbmhlcml0cyh0aGlzLCBQb3B1cClcbiAgUG9wdXAuY2FsbChzZWxmLCAnc2hhcmUnLCBhY3Rpb25zSW50ZXJuYWwpXG5cbiAgdmFyIGxvbmdVcmwgPSAnJ1xuICB2YXIgcXIgPSBhY3Rpb25zSW50ZXJuYWwuZ2V0UXIoKVxuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvbmdVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICB9XG5cbiAgZnVuY3Rpb24gY29weSAoJGlucHV0KSB7XG4gICAgcmV0dXJuIChlKSA9PiB7XG4gICAgICB2YXIgJGJ0biA9IHV0aWwuY2xvc2VzdChlLnRhcmdldCwgJy5idG4nKVxuXG4gICAgICAkaW5wdXQuc2VsZWN0KClcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuXG4gICAgICAgICRidG4uaW5uZXJIVE1MID0gJ0NvcGllZCdcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgJGJ0bi5pbm5lckhUTUwgPSAnQ29weSdcbiAgICAgICAgfSwgMjAwMClcbiAgICAgIH0gY2F0Y2ggKGVycikge31cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZSAoKSB7XG4gICAgcXJjb2RlLnRvRGF0YVVSTChsb25nVXJsLCB7XG4gICAgICBtYXJnaW46IDIsXG4gICAgICBjb2xvcjoge1xuICAgICAgICAvLyB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kXG4gICAgICAgIGxpZ2h0OiAnIzAwMDAnXG4gICAgICB9XG4gICAgfSwgKGVyciwgdXJsKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBhY3Rpb25zSW50ZXJuYWwudXBkYXRlUXIoe1xuICAgICAgICAgIHVybDogJycsXG4gICAgICAgICAgZXJyb3I6IGVyci50b1N0cmluZygpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVRcih7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBlcnJvcjogJydcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHNlbGYubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIHNlbGYuc3VwZXIubW91bnQuY2FsbChzZWxmLCAkY29udGFpbmVyKVxuXG4gICAgdmFyICRsb25nVXJsID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtdXJsLWlucHV0LWxvbmcnKVxuICAgIHZhciAkbG9uZ1VybENvcHkgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZS11cmwtY29weS1sb25nJylcblxuICAgICRsb25nVXJsQ29weS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHkoJGxvbmdVcmwpKVxuICB9XG5cbiAgc2VsZi51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuc3VwZXIudW5tb3VudC5jYWxsKHNlbGYpXG4gIH1cblxuICB2YXIgb2xkVG9nZ2xlUG9wdXAgPSBzZWxmLnRvZ2dsZVBvcHVwXG4gIHNlbGYudG9nZ2xlUG9wdXAgPSAoKSA9PiB7XG4gICAgb2xkVG9nZ2xlUG9wdXAoKVxuXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09IHRydWUpIHtcbiAgICAgIGdlbmVyYXRlKClcbiAgICB9XG4gIH1cblxuICBzZWxmLnJlbmRlciA9ICgpID0+IHtcbiAgICByZXR1cm4gc2VsZi5zdXBlci5yZW5kZXIuY2FsbChzZWxmLCAnU2hhcmUnLCBgXG4gICAgICA8ZmllbGRzZXQgY2xhc3M9XCIke3FyLnVybCA/ICdzaGFyZS1pcy1nZW5lcmF0ZWQnIDogJyd9XCI+XG4gICAgICAgIDxsZWdlbmQ+XG4gICAgICAgICAgUVIgY29kZVxuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8aW1nIHNyYz1cIiR7cXIudXJsfVwiIGNsYXNzPVwicXItcHJldmlld1wiPlxuXG4gICAgICAgIDxwIGNsYXNzPVwic2hhcmUtcXItZXJyb3JcIj5cbiAgICAgICAgICAke3FyLmVycm9yfVxuICAgICAgICA8L3A+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgICAgPGZpZWxkc2V0PlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFBlcnNpc3RlbnQgVVJMXG4gICAgICAgIDwvbGVnZW5kPlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzaGFyZS11cmxcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNoYXJlLXVybC1pbnB1dCBzaGFyZS11cmwtaW5wdXQtbG9uZ1wiIHZhbHVlPVwiJHtsb25nVXJsfVwiIHJlYWRvbmx5PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIHNoYXJlLXVybC1jb3B5IHNoYXJlLXVybC1jb3B5LWxvbmdcIj5cbiAgICAgICAgICAgIENvcHlcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgIGApXG4gIH1cblxuICByZXR1cm4gc2VsZlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlXG4iLCIvKiBtYWluXG4gKi9cblxudmFyIGR1cnJ1dGkgPSByZXF1aXJlKCdkdXJydXRpJylcbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci9oZWFkZXInKVxudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yL2VkaXRvcicpXG5cbnZhciBHbG9iYWxTdG9yZSA9IHJlcXVpcmUoJy4uL3N0YXRlL3N0b3JlJylcbnZhciBzdG9yZSA9IG5ldyBHbG9iYWxTdG9yZSgpXG5cbmZ1bmN0aW9uIE1haW4gKCkge1xuICB2YXIgJGNvbnRhaW5lclxuICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gIHZhciB0aGVtZSA9IHN0b3JlLmFjdGlvbnMuZ2V0VGhlbWUoKVxuXG4gIHZhciBjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBzdG9yZS5nZXQoKVxuXG4gICAgLy8gZG9uJ3QgY29tcGFyZSBmaWxlc1xuICAgIGRlbGV0ZSBkYXRhLmZpbGVzXG4gICAgZGVsZXRlIG5ld0RhdGEuZmlsZXNcblxuICAgIC8vIGlmIHNvbWV0aGluZyBjaGFuZ2VkLFxuICAgIC8vIGV4Y2VwdCB0aGUgZmlsZXMuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRhdGEpICE9PSBKU09OLnN0cmluZ2lmeShuZXdEYXRhKSkge1xuICAgICAgZHVycnV0aS5yZW5kZXIoTWFpbiwgJGNvbnRhaW5lcilcbiAgICB9XG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRub2RlKSB7XG4gICAgJGNvbnRhaW5lciA9ICRub2RlXG5cbiAgICBzdG9yZS5vbignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHN0b3JlLm9mZignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtYWluIHNpbG96LXRoZW1lLSR7dGhlbWUucmVwbGFjZSgvIC9nLCAnLScpfVwiPlxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBIZWFkZXIoc3RvcmUuYWN0aW9ucykpfVxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBFZGl0b3Ioc3RvcmUuYWN0aW9ucykpfVxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblxuIiwiLyogcG9wdXBcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG5mdW5jdGlvbiBQb3B1cCAobmFtZSwgYWN0aW9ucykge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMuc3RhdGUgPSBhY3Rpb25zLmdldFBvcHVwKG5hbWUpXG4gIHRoaXMuYWN0aW9ucyA9IGFjdGlvbnNcbiAgdGhpcy50b2dnbGVQb3B1cCA9IHRoaXMucHJvdG90eXBlLnRvZ2dsZVBvcHVwLmJpbmQodGhpcylcbiAgdGhpcy5oaWRlUG9wdXAgPSB0aGlzLnByb3RvdHlwZS5oaWRlUG9wdXAuYmluZCh0aGlzKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUudG9nZ2xlUG9wdXAgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RhdGUgPSAhdGhpcy5zdGF0ZVxuICB0aGlzLmFjdGlvbnMudXBkYXRlUG9wdXAodGhpcy5uYW1lLCB0aGlzLnN0YXRlKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUuaGlkZVBvcHVwID0gZnVuY3Rpb24gKGUpIHtcbiAgaWYgKHV0aWwuY2xvc2VzdChlLnRhcmdldCwgJy5wb3B1cCcpIHx8IGUudGFyZ2V0ID09PSB0aGlzLiRidXR0b24gfHwgIXRoaXMuc3RhdGUpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHRoaXMuYWN0aW9ucy51cGRhdGVQb3B1cCh0aGlzLm5hbWUsIGZhbHNlKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICB0aGlzLiRjb250YWluZXIgPSAkY29udGFpbmVyXG4gIHRoaXMuJGJ1dHRvbiA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnBvcHVwLWJ1dHRvbicpXG5cbiAgdGhpcy4kYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVQb3B1cClcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhpZGVQb3B1cClcbn1cblxuUG9wdXAucHJvdG90eXBlLnVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oaWRlUG9wdXApXG59XG5cblBvcHVwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAodGl0bGUsIGNvbnRlbnQpIHtcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwicG9wdXAtY29udGFpbmVyICR7dGhpcy5uYW1lfSAke3RoaXMuc3RhdGUgPyAncG9wdXAtY29udGFpbmVyLWlzLW9wZW4nIDogJyd9XCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIiR7dGhpcy5uYW1lfS1idXR0b24gcG9wdXAtYnV0dG9uIGJ0blwiPlxuICAgICAgICAke3RpdGxlfVxuICAgICAgPC9idXR0b24+XG5cbiAgICAgIDxmb3JtIGNsYXNzPVwiJHt0aGlzLm5hbWV9LXBvcHVwIHBvcHVwXCI+XG4gICAgICAgICR7Y29udGVudH1cbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cbiAgYFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwXG4iLCIvKiBzdG9yZSBhY3Rpb25zXG4gKi9cblxuZnVuY3Rpb24gYWN0aW9ucyAoc3RvcmUpIHtcbiAgZnVuY3Rpb24gZ2V0UG9wdXAgKG5hbWUpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkucG9wdXBbbmFtZV1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVBvcHVwIChuYW1lLCBzdGF0ZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLnBvcHVwW25hbWVdID0gc3RhdGVcblxuICAgIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TG9hZGluZyAobmFtZSkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5sb2FkaW5nW25hbWVdXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMb2FkaW5nIChuYW1lLCBzdGF0ZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLmxvYWRpbmdbbmFtZV0gPSBzdGF0ZVxuXG4gICAgc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRRciAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnFyXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVRciAodXJsKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEucXIgPSB1cmxcblxuICAgIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRQb3B1cDogZ2V0UG9wdXAsXG4gICAgdXBkYXRlUG9wdXA6IHVwZGF0ZVBvcHVwLFxuXG4gICAgZ2V0TG9hZGluZzogZ2V0TG9hZGluZyxcbiAgICB1cGRhdGVMb2FkaW5nOiB1cGRhdGVMb2FkaW5nLFxuXG4gICAgZ2V0UXI6IGdldFFyLFxuICAgIHVwZGF0ZVFyOiB1cGRhdGVRclxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWN0aW9uc1xuIiwiLyogc3RvcmUgYWN0aW9uc1xuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpXG5cbmZ1bmN0aW9uIGFjdGlvbnMgKHN0b3JlKSB7XG4gIGZ1bmN0aW9uIGdldEZpbGVzICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkuZmlsZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUZpbGUgKG5ld0ZpbGUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG5cbiAgICBkYXRhLmZpbGVzLnNvbWUoKGZpbGUsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoZmlsZS50eXBlID09PSBuZXdGaWxlLnR5cGUpIHtcbiAgICAgICAgZGF0YS5maWxlc1tpbmRleF0gPSB1dGlsLmV4dGVuZChuZXdGaWxlLCBkYXRhLmZpbGVzW2luZGV4XSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGx1Z2lucyAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnBsdWdpbnNcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFBsdWdpbiAobmV3UGx1Z2luKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuXG4gICAgZGF0YS5wbHVnaW5zLnB1c2gobmV3UGx1Z2luKVxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVBsdWdpbiAob2xkUGx1Z2luKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIHZhciBwbHVnaW5OYW1lID0gJydcblxuICAgIGlmICh0eXBlb2Ygb2xkUGx1Z2luID09PSAnb2JqZWN0Jykge1xuICAgICAgcGx1Z2luTmFtZSA9IG9sZFBsdWdpbi5uYW1lXG4gICAgfSBlbHNlIHtcbiAgICAgIHBsdWdpbk5hbWUgPSBvbGRQbHVnaW5cbiAgICB9XG5cbiAgICBkYXRhLnBsdWdpbnMuc29tZSgocGx1Z2luLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKCh0eXBlb2YgcGx1Z2luID09PSAnb2JqZWN0JyAmJiBwbHVnaW4ubmFtZSA9PT0gcGx1Z2luTmFtZSkgfHxcbiAgICAgICAgICAodHlwZW9mIHBsdWdpbiA9PT0gJ3N0cmluZycgJiYgcGx1Z2luID09PSBwbHVnaW5OYW1lKSkge1xuICAgICAgICBkYXRhLnBsdWdpbnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQYW5lcyAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnBhbmVzXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVQYW5lcyAobmV3UGFuZXMpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS5wYW5lcyA9IHV0aWwuZXh0ZW5kKG5ld1BhbmVzLCBkYXRhLnBhbmVzKVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VGhlbWUgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS50aGVtZVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlVGhlbWUgKHRoZW1lKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEudGhlbWUgPSB0aGVtZVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRGaWxlczogZ2V0RmlsZXMsXG4gICAgdXBkYXRlRmlsZTogdXBkYXRlRmlsZSxcblxuICAgIGdldFBsdWdpbnM6IGdldFBsdWdpbnMsXG4gICAgYWRkUGx1Z2luOiBhZGRQbHVnaW4sXG4gICAgcmVtb3ZlUGx1Z2luOiByZW1vdmVQbHVnaW4sXG5cbiAgICBnZXRQYW5lczogZ2V0UGFuZXMsXG4gICAgdXBkYXRlUGFuZXM6IHVwZGF0ZVBhbmVzLFxuXG4gICAgZ2V0VGhlbWU6IGdldFRoZW1lLFxuICAgIHVwZGF0ZVRoZW1lOiB1cGRhdGVUaGVtZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWN0aW9uc1xuIiwiLyogaW50ZXJuYWwgc3RvcmUsXG4gKiBub3Qgc3RvcmVkIGluIHVybFxuICovXG5cbnZhciBTdG9yZSA9IHJlcXVpcmUoJ2R1cnJ1dGkvc3RvcmUnKVxudmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuL2FjdGlvbnMtaW50ZXJuYWwnKVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIHBvcHVwOiB7fSxcbiAgbG9hZGluZzoge30sXG4gIHFyOiB7XG4gICAgdXJsOiAnJyxcbiAgICBlcnJvcjogJydcbiAgfVxufVxuXG52YXIgSW50ZXJuYWxTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgU3RvcmUuY2FsbCh0aGlzKVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zKHRoaXMpXG5cbiAgdGhpcy5zZXQoZGVmYXVsdHMpXG59XG5cbkludGVybmFsU3RvcmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdG9yZS5wcm90b3R5cGUpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJuYWxTdG9yZVxuXG4iLCIvKiBzdG9yZVxuICovXG5cbnZhciBTdG9yZSA9IHJlcXVpcmUoJ2R1cnJ1dGkvc3RvcmUnKVxudmFyIExaU3RyaW5nID0gcmVxdWlyZSgnbHotc3RyaW5nJylcbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zJylcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpXG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgdmVyc2lvbjogMSxcbiAgZmlsZXM6IFt7XG4gICAgdHlwZTogJ2h0bWwnLFxuICAgIGNvbnRlbnQ6ICcnXG4gIH0sIHtcbiAgICB0eXBlOiAnY3NzJyxcbiAgICBjb250ZW50OiAnJ1xuICB9LCB7XG4gICAgdHlwZTogJ2pzJyxcbiAgICBjb250ZW50OiAnJ1xuICB9XSxcbiAgcGx1Z2luczogW10sXG4gIHRoZW1lOiAnc29sYXJpemVkIGxpZ2h0JyxcblxuICAvLyBwYW5lIHByb3BlcnRpZXMgKGhpZGRlbiwgZXRjKVxuICBwYW5lczoge1xuICAgIGh0bWw6IHt9LFxuICAgIGNzczoge30sXG4gICAganM6IHt9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZUxvY2F0aW9uSGFzaCAoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiAoKSA9PiB7fVxuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIChoYXNoKSA9PiB7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgYCMke2hhc2h9YClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChoYXNoKSA9PiB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShgJHt3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdfSMke2hhc2h9YClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VIYXNoICgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoTFpTdHJpbmcuZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50KHV0aWwuaGFzaCgncycpKSlcbiAgfSBjYXRjaCAoZXJyKSB7fVxuXG4gIHJldHVybiBudWxsXG59XG5cbnZhciBHbG9iYWxTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgU3RvcmUuY2FsbCh0aGlzKVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zKHRoaXMpXG5cbiAgdmFyIHJlcGxhY2VIYXNoID0gcmVwbGFjZUxvY2F0aW9uSGFzaCgpXG4gIHZhciBjb21wcmVzc2VkRGF0YSA9ICcnXG5cbiAgdmFyIGhhc2hEYXRhID0gcGFyc2VIYXNoKClcbiAgaWYgKGhhc2hEYXRhKSB7XG4gICAgdGhpcy5zZXQodXRpbC5leHRlbmQoaGFzaERhdGEsIGRlZmF1bHRzKSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnNldChkZWZhdWx0cylcbiAgfVxuXG4gIHRoaXMub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICAvLyBzYXZlIGluIGhhc2hcbiAgICB2YXIgZGF0YSA9IHRoaXMuZ2V0KClcblxuICAgIGNvbXByZXNzZWREYXRhID0gTFpTdHJpbmcuY29tcHJlc3NUb0VuY29kZWRVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgcmVwbGFjZUhhc2godXRpbC5oYXNoKCdzJywgY29tcHJlc3NlZERhdGEpKVxuICB9KVxuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4ge1xuICAgICAgLy8gZm9yY2UgcGFnZSByZWxvYWQgaWYgb25seSBoYXNoIGNoYW5nZWQsXG4gICAgICAvLyBhbmQgY29tcHJlc3NlZCBkYXRhIGlzIGRpZmZlcmVudC5cbiAgICAgIC8vIGVnLiBtYW51YWxseSBjaGFuZ2luZyB1cmwgaGFzaC5cbiAgICAgIGlmICh1dGlsLmhhc2goJ3MnKSAhPT0gY29tcHJlc3NlZERhdGEpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5HbG9iYWxTdG9yZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFN0b3JlLnByb3RvdHlwZSlcblxubW9kdWxlLmV4cG9ydHMgPSBHbG9iYWxTdG9yZVxuXG4iLCIvKiB1dGlsXG4gKi9cblxuZnVuY3Rpb24gY2xvc2VzdCAoJGVsZW0sIHNlbGVjdG9yKSB7XG4gIC8vIGZpbmQgdGhlIGNsb3Nlc3QgcGFyZW50IHRoYXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3JcbiAgdmFyICRtYXRjaGVzXG5cbiAgLy8gbG9vcCB0aHJvdWdoIHBhcmVudHNcbiAgd2hpbGUgKCRlbGVtICYmICRlbGVtICE9PSBkb2N1bWVudCkge1xuICAgIGlmICgkZWxlbS5wYXJlbnROb2RlKSB7XG4gICAgICAvLyBmaW5kIGFsbCBzaWJsaW5ncyB0aGF0IG1hdGNoIHRoZSBzZWxlY3RvclxuICAgICAgJG1hdGNoZXMgPSAkZWxlbS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAvLyBjaGVjayBpZiBvdXIgZWxlbWVudCBpcyBtYXRjaGVkIChwb29yLW1hbidzIEVsZW1lbnQubWF0Y2hlcygpKVxuICAgICAgaWYgKFtdLmluZGV4T2YuY2FsbCgkbWF0Y2hlcywgJGVsZW0pICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gJGVsZW1cbiAgICAgIH1cblxuICAgICAgLy8gZ28gdXAgdGhlIHRyZWVcbiAgICAgICRlbGVtID0gJGVsZW0ucGFyZW50Tm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGNsb25lIChvYmopIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSlcbn1cblxuZnVuY3Rpb24gZXh0ZW5kTGV2ZWwgKG9iaiwgZGVmYXVsdHMgPSB7fSkge1xuICAvLyBjb3B5IGRlZmF1bHQga2V5cyB3aGVyZSB1bmRlZmluZWRcbiAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBkZWZhdWx0XG4gICAgICBvYmpba2V5XSA9IGNsb25lKGRlZmF1bHRzW2tleV0pXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICBleHRlbmRMZXZlbChvYmpba2V5XSwgZGVmYXVsdHNba2V5XSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG9ialxufVxuXG4vLyBtdWx0aS1sZXZlbCBvYmplY3QgbWVyZ2VcbmZ1bmN0aW9uIGV4dGVuZCAob2JqLCBkZWZhdWx0cykge1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0ge31cbiAgfVxuXG4gIHJldHVybiBleHRlbmRMZXZlbChjbG9uZShvYmopLCBkZWZhdWx0cylcbn1cblxuZnVuY3Rpb24gZGVib3VuY2UgKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICB2YXIgdGltZW91dFxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ZXh0ID0gdGhpc1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzXG4gICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXRcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZFNjcmlwdCAodXJsLCBkb25lID0gKCkgPT4ge30pIHtcbiAgdmFyICRzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAkc2NyaXB0LnNyYyA9IHVybFxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCRzY3JpcHQpXG5cbiAgJHNjcmlwdC5vbmxvYWQgPSBkb25lXG59XG5cbmZ1bmN0aW9uIGFzeW5jIChhcnIsIGRvbmUsIGkgPSAwKSB7XG4gIGlmIChhcnIubGVuZ3RoID09PSBpKSB7XG4gICAgcmV0dXJuIGRvbmUoKVxuICB9XG5cbiAgYXJyW2ldKCgpID0+IHtcbiAgICBpKytcbiAgICBhc3luYyhhcnIsIGRvbmUsIGkpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGZldGNoIChwYXRoLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAvLyBvcHRpb25zIG5vdCBzcGVjaWZpZWRcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICB0eXBlOiAnR0VUJyxcbiAgICBkYXRhOiB7fVxuICB9KVxuXG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge31cblxuICB2YXIgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICByZXF1ZXN0Lm9wZW4ob3B0aW9ucy50eXBlLCBwYXRoKVxuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnKVxuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ1gtUmVxdWVzdGVkLVdpdGgnLCAnWE1MSHR0cFJlcXVlc3QnKVxuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCB8fCAne30nKVxuXG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlcnJvclxuICAgICAgY2FsbGJhY2socmVxdWVzdClcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXJyb3JcbiAgICBjYWxsYmFjayhyZXF1ZXN0KVxuICB9XG5cbiAgcmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuZGF0YSkpXG59XG5cbmZ1bmN0aW9uIGluaGVyaXRzIChiYXNlQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgYmFzZUNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpXG4gIGJhc2VDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBiYXNlQ2xhc3NcblxuICBiYXNlQ2xhc3Muc3VwZXIgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYmFzZUNsYXNzLnByb3RvdHlwZSlcblxuICByZXR1cm4gYmFzZUNsYXNzXG59XG5cbmZ1bmN0aW9uIGhhc2ggKGtleSwgdmFsdWUpIHtcbiAgdmFyIGhhc2hQYXJ0cyA9IFtdXG4gIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgIGhhc2hQYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKS5zcGxpdCgnJicpXG4gIH1cblxuICB2YXIgcGFyc2VkSGFzaCA9IHt9XG4gIHZhciBzdHJpbmdIYXNoID0gJydcblxuICBoYXNoUGFydHMuZm9yRWFjaCgocGFydCwgaSkgPT4ge1xuICAgIHZhciBzdWJQYXJ0cyA9IHBhcnQuc3BsaXQoJz0nKVxuICAgIHBhcnNlZEhhc2hbc3ViUGFydHNbMF1dID0gc3ViUGFydHNbMV0gfHwgJydcbiAgfSlcblxuICBpZiAoa2V5KSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBwYXJzZWRIYXNoW2tleV0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGFyc2VkSGFzaFtrZXldXG4gICAgfVxuICB9XG5cbiAgLy8gcmVidWlsZCB0byBzdHJpbmdcbiAgT2JqZWN0LmtleXMocGFyc2VkSGFzaCkuZm9yRWFjaCgoa2V5LCBpKSA9PiB7XG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICBzdHJpbmdIYXNoICs9ICcmJ1xuICAgIH1cblxuICAgIHN0cmluZ0hhc2ggKz0ga2V5XG5cbiAgICBpZiAocGFyc2VkSGFzaFtrZXldKSB7XG4gICAgICBzdHJpbmdIYXNoICs9IGA9JHtwYXJzZWRIYXNoW2tleV19YFxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gc3RyaW5nSGFzaFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2xvbmU6IGNsb25lLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgY2xvc2VzdDogY2xvc2VzdCxcbiAgZGVib3VuY2U6IGRlYm91bmNlLFxuICBsb2FkU2NyaXB0OiBsb2FkU2NyaXB0LFxuICBhc3luYzogYXN5bmMsXG4gIGZldGNoOiBmZXRjaCxcbiAgaGFzaDogaGFzaCxcblxuICBpbmhlcml0czogaW5oZXJpdHNcbn1cbiJdfQ==
