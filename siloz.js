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
        light: '#fdfbf4'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FuLXByb21pc2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGlqa3N0cmFqcy9kaWprc3RyYS5qcyIsIm5vZGVfbW9kdWxlcy9kdXJydXRpL2R1cnJ1dGkuanMiLCJub2RlX21vZHVsZXMvZHVycnV0aS9zdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9qb3R0ZWQvam90dGVkLmpzIiwibm9kZV9tb2R1bGVzL2x6LXN0cmluZy9saWJzL2x6LXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FsaWdubWVudC1wYXR0ZXJuLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9hbHBoYW51bWVyaWMtZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LWJ1ZmZlci5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LW1hdHJpeC5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYnl0ZS1kYXRhLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2ZpbmRlci1wYXR0ZXJuLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9mb3JtYXQtaW5mby5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZ2Fsb2lzLWZpZWxkLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9rYW5qaS1kYXRhLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tYXNrLXBhdHRlcm4uanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL21vZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL251bWVyaWMtZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcG9seW5vbWlhbC5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcXJjb2RlLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9yZWVkLXNvbG9tb24tZW5jb2Rlci5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVnZXguanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3NlZ21lbnRzLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL2NhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3N2Zy10YWcuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3V0aWxzL3R5cGVkYXJyYXktYnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93aW5kb3ctb3ItZ2xvYmFsL2xpYi9pbmRleC5qcyIsInNyYy9hcHAuanMiLCJzcmMvY29tcG9uZW50cy9lZGl0b3IvZWRpdG9yLWJhci5qcyIsInNyYy9jb21wb25lbnRzL2VkaXRvci9lZGl0b3Itd2lkZ2V0LmpzIiwic3JjL2NvbXBvbmVudHMvZWRpdG9yL2VkaXRvci5qcyIsInNyYy9jb21wb25lbnRzL2hlYWRlci9hYm91dC5qcyIsInNyYy9jb21wb25lbnRzL2hlYWRlci9oZWFkZXIuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvc2V0dGluZ3MuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvc2hhcmUuanMiLCJzcmMvY29tcG9uZW50cy9tYWluLmpzIiwic3JjL2NvbXBvbmVudHMvcG9wdXAuanMiLCJzcmMvc3RhdGUvYWN0aW9ucy1pbnRlcm5hbC5qcyIsInNyYy9zdGF0ZS9hY3Rpb25zLmpzIiwic3JjL3N0YXRlL3N0b3JlLWludGVybmFsLmpzIiwic3JjL3N0YXRlL3N0b3JlLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3g2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFwQixFQUEwQjtBQUN4QixnQkFBWSxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsRUFBK0IsS0FBL0IsQ0FBcUMsR0FBckMsQ0FBWjtBQUNEOztBQUVELE1BQUksYUFBYSxFQUFqQjtBQUNBLE1BQUksYUFBYSxFQUFqQjs7QUFFQSxZQUFVLE9BQVYsQ0FBa0IsVUFBQyxJQUFELEVBQU8sQ0FBUCxFQUFhO0FBQzdCLFFBQUksV0FBVyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWY7QUFDQSxlQUFXLFNBQVMsQ0FBVCxDQUFYLElBQTBCLFNBQVMsQ0FBVCxLQUFlLEVBQXpDO0FBQ0QsR0FIRDs7QUFLQSxNQUFJLEdBQUosRUFBUztBQUNQLFFBQUksS0FBSixFQUFXO0FBQ1QsaUJBQVcsR0FBWCxJQUFrQixLQUFsQjtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sV0FBVyxHQUFYLENBQVA7QUFDRDtBQUNGOztBQUVEO0FBQ0EsU0FBTyxJQUFQLENBQVksVUFBWixFQUF3QixPQUF4QixDQUFnQyxVQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVk7QUFDMUMsUUFBSSxJQUFJLENBQVIsRUFBVztBQUNULG9CQUFjLEdBQWQ7QUFDRDs7QUFFRCxrQkFBYyxHQUFkOztBQUVBLFFBQUksV0FBVyxHQUFYLENBQUosRUFBcUI7QUFDbkIsMEJBQWtCLFdBQVcsR0FBWCxDQUFsQjtBQUNEO0FBQ0YsR0FWRDs7QUFZQSxTQUFPLFVBQVA7QUFDRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDZixTQUFPLEtBRFE7QUFFZixVQUFRLE1BRk87QUFHZixXQUFTLE9BSE07QUFJZixZQUFVLFFBSks7QUFLZixjQUFZLFVBTEc7QUFNZixTQUFPLEtBTlE7QUFPZixTQUFPLEtBUFE7QUFRZixRQUFNLElBUlM7O0FBVWYsWUFBVTtBQVZLLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG52YXIgRyA9IHJlcXVpcmUoJ3dpbmRvdy1vci1nbG9iYWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBHLlByb21pc2UgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgRy5Qcm9taXNlLnByb3RvdHlwZS50aGVuID09PSAnZnVuY3Rpb24nXG4gIClcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQ3JlYXRlZCAyMDA4LTA4LTE5LlxuICpcbiAqIERpamtzdHJhIHBhdGgtZmluZGluZyBmdW5jdGlvbnMuIEFkYXB0ZWQgZnJvbSB0aGUgRGlqa3N0YXIgUHl0aG9uIHByb2plY3QuXG4gKlxuICogQ29weXJpZ2h0IChDKSAyMDA4XG4gKiAgIFd5YXR0IEJhbGR3aW4gPHNlbGZAd3lhdHRiYWxkd2luLmNvbT5cbiAqICAgQWxsIHJpZ2h0cyByZXNlcnZlZFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqXG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgZGlqa3N0cmEgPSB7XG4gIHNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHM6IGZ1bmN0aW9uKGdyYXBoLCBzLCBkKSB7XG4gICAgLy8gUHJlZGVjZXNzb3IgbWFwIGZvciBlYWNoIG5vZGUgdGhhdCBoYXMgYmVlbiBlbmNvdW50ZXJlZC5cbiAgICAvLyBub2RlIElEID0+IHByZWRlY2Vzc29yIG5vZGUgSURcbiAgICB2YXIgcHJlZGVjZXNzb3JzID0ge307XG5cbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkLlxuICAgIC8vIG5vZGUgSUQgPT4gY29zdFxuICAgIHZhciBjb3N0cyA9IHt9O1xuICAgIGNvc3RzW3NdID0gMDtcblxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQ7IGRpZmZlcnMgZnJvbVxuICAgIC8vIGBjb3N0c2AgaW4gdGhhdCBpdCBwcm92aWRlcyBlYXN5IGFjY2VzcyB0byB0aGUgbm9kZSB0aGF0IGN1cnJlbnRseSBoYXNcbiAgICAvLyB0aGUga25vd24gc2hvcnRlc3QgcGF0aCBmcm9tIHMuXG4gICAgLy8gWFhYOiBEbyB3ZSBhY3R1YWxseSBuZWVkIGJvdGggYGNvc3RzYCBhbmQgYG9wZW5gP1xuICAgIHZhciBvcGVuID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZS5tYWtlKCk7XG4gICAgb3Blbi5wdXNoKHMsIDApO1xuXG4gICAgdmFyIGNsb3Nlc3QsXG4gICAgICAgIHUsIHYsXG4gICAgICAgIGNvc3Rfb2Zfc190b191LFxuICAgICAgICBhZGphY2VudF9ub2RlcyxcbiAgICAgICAgY29zdF9vZl9lLFxuICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSxcbiAgICAgICAgY29zdF9vZl9zX3RvX3YsXG4gICAgICAgIGZpcnN0X3Zpc2l0O1xuICAgIHdoaWxlICghb3Blbi5lbXB0eSgpKSB7XG4gICAgICAvLyBJbiB0aGUgbm9kZXMgcmVtYWluaW5nIGluIGdyYXBoIHRoYXQgaGF2ZSBhIGtub3duIGNvc3QgZnJvbSBzLFxuICAgICAgLy8gZmluZCB0aGUgbm9kZSwgdSwgdGhhdCBjdXJyZW50bHkgaGFzIHRoZSBzaG9ydGVzdCBwYXRoIGZyb20gcy5cbiAgICAgIGNsb3Nlc3QgPSBvcGVuLnBvcCgpO1xuICAgICAgdSA9IGNsb3Nlc3QudmFsdWU7XG4gICAgICBjb3N0X29mX3NfdG9fdSA9IGNsb3Nlc3QuY29zdDtcblxuICAgICAgLy8gR2V0IG5vZGVzIGFkamFjZW50IHRvIHUuLi5cbiAgICAgIGFkamFjZW50X25vZGVzID0gZ3JhcGhbdV0gfHwge307XG5cbiAgICAgIC8vIC4uLmFuZCBleHBsb3JlIHRoZSBlZGdlcyB0aGF0IGNvbm5lY3QgdSB0byB0aG9zZSBub2RlcywgdXBkYXRpbmdcbiAgICAgIC8vIHRoZSBjb3N0IG9mIHRoZSBzaG9ydGVzdCBwYXRocyB0byBhbnkgb3IgYWxsIG9mIHRob3NlIG5vZGVzIGFzXG4gICAgICAvLyBuZWNlc3NhcnkuIHYgaXMgdGhlIG5vZGUgYWNyb3NzIHRoZSBjdXJyZW50IGVkZ2UgZnJvbSB1LlxuICAgICAgZm9yICh2IGluIGFkamFjZW50X25vZGVzKSB7XG4gICAgICAgIGlmIChhZGphY2VudF9ub2Rlcy5oYXNPd25Qcm9wZXJ0eSh2KSkge1xuICAgICAgICAgIC8vIEdldCB0aGUgY29zdCBvZiB0aGUgZWRnZSBydW5uaW5nIGZyb20gdSB0byB2LlxuICAgICAgICAgIGNvc3Rfb2ZfZSA9IGFkamFjZW50X25vZGVzW3ZdO1xuXG4gICAgICAgICAgLy8gQ29zdCBvZiBzIHRvIHUgcGx1cyB0aGUgY29zdCBvZiB1IHRvIHYgYWNyb3NzIGUtLXRoaXMgaXMgKmEqXG4gICAgICAgICAgLy8gY29zdCBmcm9tIHMgdG8gdiB0aGF0IG1heSBvciBtYXkgbm90IGJlIGxlc3MgdGhhbiB0aGUgY3VycmVudFxuICAgICAgICAgIC8vIGtub3duIGNvc3QgdG8gdi5cbiAgICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSA9IGNvc3Rfb2Zfc190b191ICsgY29zdF9vZl9lO1xuXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCB2aXNpdGVkIHYgeWV0IE9SIGlmIHRoZSBjdXJyZW50IGtub3duIGNvc3QgZnJvbSBzIHRvXG4gICAgICAgICAgLy8gdiBpcyBncmVhdGVyIHRoYW4gdGhlIG5ldyBjb3N0IHdlIGp1c3QgZm91bmQgKGNvc3Qgb2YgcyB0byB1IHBsdXNcbiAgICAgICAgICAvLyBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZSksIHVwZGF0ZSB2J3MgY29zdCBpbiB0aGUgY29zdCBsaXN0IGFuZFxuICAgICAgICAgIC8vIHVwZGF0ZSB2J3MgcHJlZGVjZXNzb3IgaW4gdGhlIHByZWRlY2Vzc29yIGxpc3QgKGl0J3Mgbm93IHUpLlxuICAgICAgICAgIGNvc3Rfb2Zfc190b192ID0gY29zdHNbdl07XG4gICAgICAgICAgZmlyc3RfdmlzaXQgPSAodHlwZW9mIGNvc3RzW3ZdID09PSAndW5kZWZpbmVkJyk7XG4gICAgICAgICAgaWYgKGZpcnN0X3Zpc2l0IHx8IGNvc3Rfb2Zfc190b192ID4gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpIHtcbiAgICAgICAgICAgIGNvc3RzW3ZdID0gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2U7XG4gICAgICAgICAgICBvcGVuLnB1c2godiwgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpO1xuICAgICAgICAgICAgcHJlZGVjZXNzb3JzW3ZdID0gdTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb3N0c1tkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBtc2cgPSBbJ0NvdWxkIG5vdCBmaW5kIGEgcGF0aCBmcm9tICcsIHMsICcgdG8gJywgZCwgJy4nXS5qb2luKCcnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVkZWNlc3NvcnM7XG4gIH0sXG5cbiAgZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdDogZnVuY3Rpb24ocHJlZGVjZXNzb3JzLCBkKSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIHUgPSBkO1xuICAgIHZhciBwcmVkZWNlc3NvcjtcbiAgICB3aGlsZSAodSkge1xuICAgICAgbm9kZXMucHVzaCh1KTtcbiAgICAgIHByZWRlY2Vzc29yID0gcHJlZGVjZXNzb3JzW3VdO1xuICAgICAgdSA9IHByZWRlY2Vzc29yc1t1XTtcbiAgICB9XG4gICAgbm9kZXMucmV2ZXJzZSgpO1xuICAgIHJldHVybiBub2RlcztcbiAgfSxcblxuICBmaW5kX3BhdGg6IGZ1bmN0aW9uKGdyYXBoLCBzLCBkKSB7XG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IGRpamtzdHJhLnNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHMoZ3JhcGgsIHMsIGQpO1xuICAgIHJldHVybiBkaWprc3RyYS5leHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0KFxuICAgICAgcHJlZGVjZXNzb3JzLCBkKTtcbiAgfSxcblxuICAvKipcbiAgICogQSB2ZXJ5IG5haXZlIHByaW9yaXR5IHF1ZXVlIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgUHJpb3JpdHlRdWV1ZToge1xuICAgIG1ha2U6IGZ1bmN0aW9uIChvcHRzKSB7XG4gICAgICB2YXIgVCA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUsXG4gICAgICAgICAgdCA9IHt9LFxuICAgICAgICAgIGtleTtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgICAgZm9yIChrZXkgaW4gVCkge1xuICAgICAgICBpZiAoVC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgdFtrZXldID0gVFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0LnF1ZXVlID0gW107XG4gICAgICB0LnNvcnRlciA9IG9wdHMuc29ydGVyIHx8IFQuZGVmYXVsdF9zb3J0ZXI7XG4gICAgICByZXR1cm4gdDtcbiAgICB9LFxuXG4gICAgZGVmYXVsdF9zb3J0ZXI6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb3N0IC0gYi5jb3N0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgaXRlbSB0byB0aGUgcXVldWUgYW5kIGVuc3VyZSB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50XG4gICAgICogaXMgYXQgdGhlIGZyb250IG9mIHRoZSBxdWV1ZS5cbiAgICAgKi9cbiAgICBwdXNoOiBmdW5jdGlvbiAodmFsdWUsIGNvc3QpIHtcbiAgICAgIHZhciBpdGVtID0ge3ZhbHVlOiB2YWx1ZSwgY29zdDogY29zdH07XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICB0aGlzLnF1ZXVlLnNvcnQodGhpcy5zb3J0ZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBpbiB0aGUgcXVldWUuXG4gICAgICovXG4gICAgcG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgIH0sXG5cbiAgICBlbXB0eTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgfVxufTtcblxuXG4vLyBub2RlLmpzIG1vZHVsZSBleHBvcnRzXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBkaWprc3RyYTtcbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5kdXJydXRpID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogVXRpbHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGhhc1dpbmRvdygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICB2YXIgaXNDbGllbnQgPSBoYXNXaW5kb3coKTtcblxuICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfVxuXG4gIC8vIG9uZS1sZXZlbCBvYmplY3QgZXh0ZW5kXG5cblxuICB2YXIgRFVSUlVUSV9ERUJVRyA9IHRydWU7XG5cbiAgZnVuY3Rpb24gd2FybigpIHtcbiAgICBpZiAoRFVSUlVUSV9ERUJVRyA9PT0gdHJ1ZSkge1xuICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgLyogRHVycnV0aVxuICAgKiBDYXB0dXJlIGFuZCByZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICAgKi9cblxuICB2YXIgX3JlbW92ZUxpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygpIHt9O1xuXG4gIC8vIGNhcHR1cmUgYWxsIGxpc3RlbmVyc1xuICB2YXIgZXZlbnRzID0gW107XG4gIHZhciBkb21FdmVudFR5cGVzID0gW107XG5cbiAgZnVuY3Rpb24gZ2V0RG9tRXZlbnRUeXBlcygpIHtcbiAgICB2YXIgZXZlbnRUeXBlcyA9IFtdO1xuICAgIGZvciAodmFyIGF0dHIgaW4gZG9jdW1lbnQpIHtcbiAgICAgIC8vIHN0YXJ0cyB3aXRoIG9uXG4gICAgICBpZiAoYXR0ci5zdWJzdHIoMCwgMikgPT09ICdvbicpIHtcbiAgICAgICAgZXZlbnRUeXBlcy5wdXNoKGF0dHIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldmVudFR5cGVzO1xuICB9XG5cbiAgdmFyIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lcjtcblxuICBmdW5jdGlvbiBjYXB0dXJlQWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyZSkge1xuICAgIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgZXZlbnRzLnB1c2goe1xuICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGZuOiBmbixcbiAgICAgIGNhcHR1cmU6IGNhcHR1cmVcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU5vZGVFdmVudHMoJG5vZGUpIHtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IGV2ZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmIChldmVudHNbaV0udGFyZ2V0ID09PSAkbm9kZSkge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgICAgJG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudHNbaV0udHlwZSwgZXZlbnRzW2ldLmZuLCBldmVudHNbaV0uY2FwdHVyZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGV2ZW50XG4gICAgICAgIGV2ZW50cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGktLTtcbiAgICAgIH1cblxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBvbiogbGlzdGVuZXJzXG4gICAgZG9tRXZlbnRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudFR5cGUpIHtcbiAgICAgICRub2RlW2V2ZW50VHlwZV0gPSBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGlzQ2xpZW50KSB7XG4gICAgZG9tRXZlbnRUeXBlcyA9IGdldERvbUV2ZW50VHlwZXMoKTtcblxuICAgIC8vIGNhcHR1cmUgYWRkRXZlbnRMaXN0ZW5lclxuXG4gICAgLy8gSUVcbiAgICBpZiAod2luZG93Lk5vZGUucHJvdG90eXBlLmhhc093blByb3BlcnR5KCdhZGRFdmVudExpc3RlbmVyJykpIHtcbiAgICAgIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5Ob2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgd2luZG93Lk5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBjYXB0dXJlQWRkRXZlbnRMaXN0ZW5lcjtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2FkZEV2ZW50TGlzdGVuZXInKSkge1xuICAgICAgLy8gc3RhbmRhcmRcbiAgICAgIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGNhcHR1cmVBZGRFdmVudExpc3RlbmVyO1xuICAgIH1cblxuICAgIC8vIHRyYXZlcnNlIGFuZCByZW1vdmUgYWxsIGV2ZW50cyBsaXN0ZW5lcnMgZnJvbSBub2Rlc1xuICAgIF9yZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoJG5vZGUsIHRyYXZlcnNlKSB7XG4gICAgICByZW1vdmVOb2RlRXZlbnRzKCRub2RlKTtcblxuICAgICAgLy8gdHJhdmVyc2UgZWxlbWVudCBjaGlsZHJlblxuICAgICAgaWYgKHRyYXZlcnNlICYmICRub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBfcmVtb3ZlTGlzdGVuZXJzKCRub2RlLmNoaWxkcmVuW2ldLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB2YXIgcmVtb3ZlTGlzdGVuZXJzJDEgPSBfcmVtb3ZlTGlzdGVuZXJzO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogRE9NIHBhdGNoIC0gbW9ycGhzIGEgRE9NIG5vZGUgaW50byBhbm90aGVyLlxuICAgKi9cblxuICBmdW5jdGlvbiB0cmF2ZXJzZSgkbm9kZSwgJG5ld05vZGUsIHBhdGNoZXMpIHtcbiAgICAvLyB0cmF2ZXJzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgZGlmZigkbm9kZS5jaGlsZE5vZGVzW2ldLCAkbmV3Tm9kZS5jaGlsZE5vZGVzW2ldLCBwYXRjaGVzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYXBBdHRyaWJ1dGVzKCRub2RlLCAkbmV3Tm9kZSkge1xuICAgIHZhciBhdHRycyA9IHt9O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyc1skbm9kZS5hdHRyaWJ1dGVzW2ldLm5hbWVdID0gbnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgJG5ld05vZGUuYXR0cmlidXRlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIGF0dHJzWyRuZXdOb2RlLmF0dHJpYnV0ZXNbX2ldLm5hbWVdID0gJG5ld05vZGUuYXR0cmlidXRlc1tfaV0udmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGF0Y2hBdHRycygkbm9kZSwgJG5ld05vZGUpIHtcbiAgICAvLyBtYXAgYXR0cmlidXRlc1xuICAgIHZhciBhdHRycyA9IG1hcEF0dHJpYnV0ZXMoJG5vZGUsICRuZXdOb2RlKTtcblxuICAgIC8vIGFkZC1jaGFuZ2UgYXR0cmlidXRlc1xuICAgIGZvciAodmFyIHByb3AgaW4gYXR0cnMpIHtcbiAgICAgIGlmIChhdHRyc1twcm9wXSA9PT0gbnVsbCkge1xuICAgICAgICAkbm9kZS5yZW1vdmVBdHRyaWJ1dGUocHJvcCk7XG5cbiAgICAgICAgLy8gY2hlY2tlZCBuZWVkcyBleHRyYSB3b3JrXG4gICAgICAgIGlmIChwcm9wID09PSAnY2hlY2tlZCcpIHtcbiAgICAgICAgICAkbm9kZS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRub2RlLnNldEF0dHJpYnV0ZShwcm9wLCBhdHRyc1twcm9wXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlmZigkbm9kZSwgJG5ld05vZGUpIHtcbiAgICB2YXIgcGF0Y2hlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogW107XG5cbiAgICB2YXIgcGF0Y2ggPSB7XG4gICAgICBub2RlOiAkbm9kZSxcbiAgICAgIG5ld05vZGU6ICRuZXdOb2RlXG4gICAgfTtcblxuICAgIC8vIHB1c2ggdHJhdmVyc2VkIG5vZGUgdG8gcGF0Y2ggbGlzdFxuICAgIHBhdGNoZXMucHVzaChwYXRjaCk7XG5cbiAgICAvLyBmYXN0ZXIgdGhhbiBvdXRlcmh0bWxcbiAgICBpZiAoJG5vZGUuaXNFcXVhbE5vZGUoJG5ld05vZGUpKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIG9uIG5vZGUgYW5kIGNoaWxkcmVuXG4gICAgICByZW1vdmVMaXN0ZW5lcnMkMSgkbm9kZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiBwYXRjaGVzO1xuICAgIH1cblxuICAgIC8vIGlmIG9uZSBvZiB0aGVtIGlzIG5vdCBhbiBlbGVtZW50IG5vZGUsXG4gICAgLy8gb3IgdGhlIHRhZyBjaGFuZ2VkLFxuICAgIC8vIG9yIG5vdCB0aGUgc2FtZSBudW1iZXIgb2YgY2hpbGRyZW4uXG4gICAgaWYgKCRub2RlLm5vZGVUeXBlICE9PSAxIHx8ICRuZXdOb2RlLm5vZGVUeXBlICE9PSAxIHx8ICRub2RlLnRhZ05hbWUgIT09ICRuZXdOb2RlLnRhZ05hbWUgfHwgJG5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09ICRuZXdOb2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBwYXRjaC5yZXBsYWNlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2gudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVycyBvbiBub2RlXG4gICAgICByZW1vdmVMaXN0ZW5lcnMkMSgkbm9kZSk7XG5cbiAgICAgIC8vIHRyYXZlcnNlIGNoaWxkTm9kZXNcbiAgICAgIHRyYXZlcnNlKCRub2RlLCAkbmV3Tm9kZSwgcGF0Y2hlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGNoZXM7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVBhdGNoKHBhdGNoKSB7XG4gICAgaWYgKHBhdGNoLnJlcGxhY2UpIHtcbiAgICAgIHBhdGNoLm5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocGF0Y2gubmV3Tm9kZSwgcGF0Y2gubm9kZSk7XG4gICAgfSBlbHNlIGlmIChwYXRjaC51cGRhdGUpIHtcbiAgICAgIHBhdGNoQXR0cnMocGF0Y2gubm9kZSwgcGF0Y2gubmV3Tm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGF0Y2gocGF0Y2hlcykge1xuICAgIHBhdGNoZXMuZm9yRWFjaChhcHBseVBhdGNoKTtcblxuICAgIHJldHVybiBwYXRjaGVzO1xuICB9XG5cbiAgdmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgfSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICB9O1xuXG5cblxuXG5cbiAgdmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICAgIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgICB9O1xuICB9KCk7XG5cblxuXG5cblxuXG5cbiAgdmFyIGdldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIHZhciBzZXQgPSBmdW5jdGlvbiBzZXQob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MgJiYgZGVzYy53cml0YWJsZSkge1xuICAgICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2V0dGVyID0gZGVzYy5zZXQ7XG5cbiAgICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXR0ZXIuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKiBEdXJydXRpXG4gICAqIE1pY3JvIElzb21vcnBoaWMgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBidWlsZGluZyB1c2VyIGludGVyZmFjZXMuXG4gICAqL1xuXG4gIHZhciBkdXJydXRpQXR0ciA9ICdkYXRhLWR1cnJ1dGktaWQnO1xuICB2YXIgZHVycnV0aUVsZW1TZWxlY3RvciA9ICdbJyArIGR1cnJ1dGlBdHRyICsgJ10nO1xuICB2YXIgY29tcG9uZW50Q2FjaGUgPSBbXTtcbiAgdmFyIGNvbXBvbmVudEluZGV4ID0gMDtcblxuICAvLyBkZWNvcmF0ZSBhIGJhc2ljIGNsYXNzIHdpdGggZHVycnV0aSBzcGVjaWZpYyBwcm9wZXJ0aWVzXG4gIGZ1bmN0aW9uIGRlY29yYXRlKENvbXApIHtcbiAgICB2YXIgY29tcG9uZW50O1xuXG4gICAgLy8gaW5zdGFudGlhdGUgY2xhc3Nlc1xuICAgIGlmICh0eXBlb2YgQ29tcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcG9uZW50ID0gbmV3IENvbXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGNoYW5nZSB0aGUgaWQgb24gYSBjYWNoZWQgY29tcG9uZW50XG4gICAgICBjb21wb25lbnQgPSBPYmplY3QuY3JlYXRlKENvbXApO1xuICAgIH1cblxuICAgIC8vIGNvbXBvbmVudHMgZ2V0IGEgbmV3IGlkIG9uIHJlbmRlcixcbiAgICAvLyBzbyB3ZSBjYW4gY2xlYXIgdGhlIHByZXZpb3VzIGNvbXBvbmVudCBjYWNoZS5cbiAgICBjb21wb25lbnQuX2R1cnJ1dGlJZCA9IFN0cmluZyhjb21wb25lbnRJbmRleCsrKTtcblxuICAgIC8vIGNhY2hlIGNvbXBvbmVudFxuICAgIGNvbXBvbmVudENhY2hlLnB1c2goe1xuICAgICAgaWQ6IGNvbXBvbmVudC5fZHVycnV0aUlkLFxuICAgICAgY29tcG9uZW50OiBjb21wb25lbnRcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21wb25lbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpIHtcbiAgICAvLyBnZXQgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBkb20gbm9kZSAtIHJlbmRlcmVkIGluIGJyb3dzZXIuXG4gICAgaWYgKCRub2RlLl9kdXJydXRpKSB7XG4gICAgICByZXR1cm4gJG5vZGUuX2R1cnJ1dGk7XG4gICAgfVxuXG4gICAgLy8gb3IgZ2V0IGl0IGZyb20gdGhlIGNvbXBvbmVudCBjYWNoZSAtIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXIuXG4gICAgdmFyIGlkID0gJG5vZGUuZ2V0QXR0cmlidXRlKGR1cnJ1dGlBdHRyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY29tcG9uZW50Q2FjaGVbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnRDYWNoZVtpXS5jb21wb25lbnQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVtb3ZlIGN1c3RvbSBkYXRhIGF0dHJpYnV0ZXMsXG4gIC8vIGFuZCBjYWNoZSB0aGUgY29tcG9uZW50IG9uIHRoZSBET00gbm9kZS5cbiAgZnVuY3Rpb24gY2xlYW5BdHRyTm9kZXMoJGNvbnRhaW5lciwgaW5jbHVkZVBhcmVudCkge1xuICAgIHZhciBub2RlcyA9IFtdLnNsaWNlLmNhbGwoJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGR1cnJ1dGlFbGVtU2VsZWN0b3IpKTtcblxuICAgIGlmIChpbmNsdWRlUGFyZW50KSB7XG4gICAgICBub2Rlcy5wdXNoKCRjb250YWluZXIpO1xuICAgIH1cblxuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKCRub2RlKSB7XG4gICAgICAvLyBjYWNoZSBjb21wb25lbnQgaW4gbm9kZVxuICAgICAgJG5vZGUuX2R1cnJ1dGkgPSBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpO1xuXG4gICAgICAvLyBjbGVhbi11cCBkYXRhIGF0dHJpYnV0ZXNcbiAgICAgICRub2RlLnJlbW92ZUF0dHJpYnV0ZShkdXJydXRpQXR0cik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICBmdW5jdGlvbiB1bm1vdW50Tm9kZSgkbm9kZSkge1xuICAgIHZhciBjYWNoZWRDb21wb25lbnQgPSBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpO1xuXG4gICAgaWYgKGNhY2hlZENvbXBvbmVudC51bm1vdW50KSB7XG4gICAgICBjYWNoZWRDb21wb25lbnQudW5tb3VudCgkbm9kZSk7XG4gICAgfVxuXG4gICAgLy8gY2xlYXIgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBjYWNoZVxuICAgIGNsZWFyQ29tcG9uZW50Q2FjaGUoY2FjaGVkQ29tcG9uZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdW50Tm9kZSgkbm9kZSkge1xuICAgIHZhciBjYWNoZWRDb21wb25lbnQgPSBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpO1xuXG4gICAgaWYgKGNhY2hlZENvbXBvbmVudC5tb3VudCkge1xuICAgICAgY2FjaGVkQ29tcG9uZW50Lm1vdW50KCRub2RlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckNvbXBvbmVudENhY2hlKGNvbXBvbmVudCkge1xuICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50Q2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNvbXBvbmVudENhY2hlW2ldLmlkID09PSBjb21wb25lbnQuX2R1cnJ1dGlJZCkge1xuICAgICAgICAgIGNvbXBvbmVudENhY2hlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2xlYXIgdGhlIGVudGlyZSBjb21wb25lbnQgY2FjaGVcbiAgICAgIGNvbXBvbmVudEluZGV4ID0gMDtcbiAgICAgIGNvbXBvbmVudENhY2hlLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRnJhZ21lbnQoKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcblxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUudHJpbSgpO1xuICAgIHZhciBwYXJlbnQgPSAnZGl2JztcbiAgICB2YXIgJG5vZGU7XG5cbiAgICBpZiAodGVtcGxhdGUuaW5kZXhPZignPHRyJykgPT09IDApIHtcbiAgICAgIC8vIHRhYmxlIHJvd1xuICAgICAgcGFyZW50ID0gJ3Rib2R5JztcbiAgICB9IGVsc2UgaWYgKHRlbXBsYXRlLmluZGV4T2YoJzx0ZCcpID09PSAwKSB7XG4gICAgICAvLyB0YWJsZSBjb2x1bW5cbiAgICAgIHBhcmVudCA9ICd0cic7XG4gICAgfVxuXG4gICAgJG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHBhcmVudCk7XG4gICAgJG5vZGUuaW5uZXJIVE1MID0gdGVtcGxhdGU7XG5cbiAgICBpZiAoJG5vZGUuY2hpbGRyZW4ubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCB0ZW1wbGF0ZSBtdXN0IGhhdmUgYSBzaW5nbGUgcGFyZW50IG5vZGUuJywgdGVtcGxhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiAkbm9kZS5maXJzdEVsZW1lbnRDaGlsZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENvbXBvbmVudElkKHRlbXBsYXRlLCBjb21wb25lbnQpIHtcbiAgICAvLyBuYWl2ZSBpbXBsZW1lbnRhdGlvbiBvZiBhZGRpbmcgYW4gYXR0cmlidXRlIHRvIHRoZSBwYXJlbnQgY29udGFpbmVyLlxuICAgIC8vIHNvIHdlIGRvbid0IGRlcGVuZCBvbiBhIGRvbSBwYXJzZXIuXG4gICAgLy8gZG93bnNpZGUgaXMgd2UgY2FuJ3Qgd2FybiB0aGF0IHRlbXBsYXRlIE1VU1QgaGF2ZSBhIHNpbmdsZSBwYXJlbnQgKGluIE5vZGUuanMpLlxuXG4gICAgLy8gY2hlY2sgdm9pZCBlbGVtZW50cyBmaXJzdC5cbiAgICB2YXIgZmlyc3RCcmFja2V0SW5kZXggPSB0ZW1wbGF0ZS5pbmRleE9mKCcvPicpO1xuXG4gICAgLy8gbm9uLXZvaWQgZWxlbWVudHNcbiAgICBpZiAoZmlyc3RCcmFja2V0SW5kZXggPT09IC0xKSB7XG4gICAgICBmaXJzdEJyYWNrZXRJbmRleCA9IHRlbXBsYXRlLmluZGV4T2YoJz4nKTtcbiAgICB9XG5cbiAgICB2YXIgYXR0ciA9ICcgJyArIGR1cnJ1dGlBdHRyICsgJz1cIicgKyBjb21wb25lbnQuX2R1cnJ1dGlJZCArICdcIic7XG5cbiAgICByZXR1cm4gdGVtcGxhdGUuc3Vic3RyKDAsIGZpcnN0QnJhY2tldEluZGV4KSArIGF0dHIgKyB0ZW1wbGF0ZS5zdWJzdHIoZmlyc3RCcmFja2V0SW5kZXgpO1xuICB9XG5cbiAgLy8gdHJhdmVyc2UgYW5kIGZpbmQgZHVycnV0aSBub2Rlc1xuICBmdW5jdGlvbiBnZXRDb21wb25lbnROb2RlcygkY29udGFpbmVyKSB7XG4gICAgdmFyIGFyciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogW107XG5cbiAgICBpZiAoJGNvbnRhaW5lci5fZHVycnV0aSkge1xuICAgICAgYXJyLnB1c2goJGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgaWYgKCRjb250YWluZXIuY2hpbGRyZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJGNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBnZXRDb21wb25lbnROb2RlcygkY29udGFpbmVyLmNoaWxkcmVuW2ldLCBhcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG4gIH1cblxuICB2YXIgRHVycnV0aSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEdXJydXRpKCkge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgRHVycnV0aSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoRHVycnV0aSwgW3tcbiAgICAgIGtleTogJ3NlcnZlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2VydmVyKCkge1xuICAgICAgICBjbGVhckNvbXBvbmVudENhY2hlKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoY29tcG9uZW50LCAkY29udGFpbmVyKSB7XG4gICAgICAgIC8vIGRlY29yYXRlIGJhc2ljIGNsYXNzZXMgd2l0aCBkdXJydXRpIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGR1cnJ1dGlDb21wb25lbnQgPSBkZWNvcmF0ZShjb21wb25lbnQpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZHVycnV0aUNvbXBvbmVudC5yZW5kZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnRzIG11c3QgaGF2ZSBhIHJlbmRlcigpIG1ldGhvZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGR1cnJ1dGlDb21wb25lbnQucmVuZGVyKCk7XG4gICAgICAgIHZhciBjb21wb25lbnRIdG1sID0gYWRkQ29tcG9uZW50SWQodGVtcGxhdGUsIGR1cnJ1dGlDb21wb25lbnQpO1xuXG4gICAgICAgIC8vIG1vdW50IGFuZCB1bm1vdW50IGluIGJyb3dzZXIsIHdoZW4gd2Ugc3BlY2lmeSBhIGNvbnRhaW5lci5cbiAgICAgICAgaWYgKGlzQ2xpZW50ICYmICRjb250YWluZXIpIHtcbiAgICAgICAgICB2YXIgJG5ld0NvbXBvbmVudDtcbiAgICAgICAgICB2YXIgcGF0Y2hlcztcblxuICAgICAgICAgIHZhciBfcmV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIGNvbnRhaW5lciBpcyBzdGlsbCBpbiB0aGUgRE9NLlxuICAgICAgICAgICAgLy8gd2hlbiBydW5uaW5nIG11bHRpcGxlIHBhcmFsbGVsIHJlbmRlcidzLCB0aGUgY29udGFpbmVyXG4gICAgICAgICAgICAvLyBpcyByZW1vdmVkIGJ5IHRoZSBwcmV2aW91cyByZW5kZXIsIGJ1dCB0aGUgcmVmZXJlbmNlIHN0aWxsIGluIG1lbW9yeS5cbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucygkY29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAvLyB3YXJuIGZvciBwZXJmb3JtYW5jZS5cbiAgICAgICAgICAgICAgd2FybignTm9kZScsICRjb250YWluZXIsICdpcyBubyBsb25nZXIgaW4gdGhlIERPTS4gXFxuSXQgd2FzIHByb2JhYmx5IHJlbW92ZWQgYnkgYSBwYXJlbnQgY29tcG9uZW50LicpO1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHY6IHZvaWQgMFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50Tm9kZXMgPSBbXTtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIHRlbXBsYXRlIHN0cmluZyB0byBhIGRvbSBub2RlXG4gICAgICAgICAgICAkbmV3Q29tcG9uZW50ID0gY3JlYXRlRnJhZ21lbnQoY29tcG9uZW50SHRtbCk7XG5cbiAgICAgICAgICAgIC8vIHVubW91bnQgY29tcG9uZW50IGFuZCBzdWItY29tcG9uZW50c1xuXG4gICAgICAgICAgICBnZXRDb21wb25lbnROb2RlcygkY29udGFpbmVyKS5mb3JFYWNoKHVubW91bnROb2RlKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIGNvbnRhaW5lciBpcyBhIGR1cnJ1dGkgZWxlbWVudCxcbiAgICAgICAgICAgIC8vIHVubW91bnQgaXQgYW5kIGl0J3MgY2hpbGRyZW4gYW5kIHJlcGxhY2UgdGhlIG5vZGUuXG4gICAgICAgICAgICBpZiAoZ2V0Q2FjaGVkQ29tcG9uZW50KCRjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZGF0YSBhdHRyaWJ1dGVzIG9uIHRoZSBuZXcgbm9kZSxcbiAgICAgICAgICAgICAgLy8gYmVmb3JlIHBhdGNoLFxuICAgICAgICAgICAgICAvLyBhbmQgZ2V0IHRoZSBsaXN0IG9mIG5ldyBjb21wb25lbnRzLlxuICAgICAgICAgICAgICBjbGVhbkF0dHJOb2RlcygkbmV3Q29tcG9uZW50LCB0cnVlKTtcblxuICAgICAgICAgICAgICAvLyBnZXQgcmVxdWlyZWQgZG9tIHBhdGNoZXNcbiAgICAgICAgICAgICAgcGF0Y2hlcyA9IGRpZmYoJGNvbnRhaW5lciwgJG5ld0NvbXBvbmVudCk7XG5cblxuICAgICAgICAgICAgICBwYXRjaGVzLmZvckVhY2goZnVuY3Rpb24gKHBhdGNoJCQxKSB7XG4gICAgICAgICAgICAgICAgLy8gYWx3YXlzIHVwZGF0ZSBjb21wb25lbnQgaW5zdGFuY2VzLFxuICAgICAgICAgICAgICAgIC8vIGV2ZW4gaWYgdGhlIGRvbSBkb2Vzbid0IGNoYW5nZS5cbiAgICAgICAgICAgICAgICBwYXRjaCQkMS5ub2RlLl9kdXJydXRpID0gcGF0Y2gkJDEubmV3Tm9kZS5fZHVycnV0aTtcblxuICAgICAgICAgICAgICAgIC8vIHBhdGNoZXMgY29udGFpbiBhbGwgdGhlIHRyYXZlcnNlZCBub2Rlcy5cbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIG1vdW50IGNvbXBvbmVudHMgaGVyZSwgZm9yIHBlcmZvcm1hbmNlLlxuICAgICAgICAgICAgICAgIGlmIChwYXRjaCQkMS5ub2RlLl9kdXJydXRpKSB7XG4gICAgICAgICAgICAgICAgICBpZiAocGF0Y2gkJDEucmVwbGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2Rlcy5wdXNoKHBhdGNoJCQxLm5ld05vZGUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRjaCQkMS51cGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZXMucHVzaChwYXRjaCQkMS5ub2RlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vZGUgaXMgdGhlIHNhbWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB3ZSBuZWVkIHRvIG1vdW50IHN1Yi1jb21wb25lbnRzLlxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShjb21wb25lbnROb2RlcywgZ2V0Q29tcG9uZW50Tm9kZXMocGF0Y2gkJDEubm9kZSkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgLy8gbW9ycGggb2xkIGRvbSBub2RlIGludG8gbmV3IG9uZVxuICAgICAgICAgICAgICBwYXRjaChwYXRjaGVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGlmIHRoZSBjb21wb25lbnQgaXMgbm90IGEgZHVycnV0aSBlbGVtZW50LFxuICAgICAgICAgICAgICAvLyBpbnNlcnQgdGhlIHRlbXBsYXRlIHdpdGggaW5uZXJIVE1MLlxuXG4gICAgICAgICAgICAgIC8vIG9ubHkgaWYgdGhlIHNhbWUgaHRtbCBpcyBub3QgYWxyZWFkeSByZW5kZXJlZFxuICAgICAgICAgICAgICBpZiAoISRjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQgfHwgISRjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQuaXNFcXVhbE5vZGUoJG5ld0NvbXBvbmVudCkpIHtcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmlubmVySFRNTCA9IGNvbXBvbmVudEh0bWw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb21wb25lbnROb2RlcyA9IGNsZWFuQXR0ck5vZGVzKCRjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtb3VudCBuZXdseSBhZGRlZCBjb21wb25lbnRzXG4gICAgICAgICAgICBjb21wb25lbnROb2Rlcy5mb3JFYWNoKG1vdW50Tm9kZSk7XG4gICAgICAgICAgfSgpO1xuXG4gICAgICAgICAgaWYgKCh0eXBlb2YgX3JldCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoX3JldCkpID09PSBcIm9iamVjdFwiKSByZXR1cm4gX3JldC52O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudEh0bWw7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBEdXJydXRpO1xuICB9KCk7XG5cbiAgdmFyIGR1cnJ1dGkgPSBuZXcgRHVycnV0aSgpO1xuXG4gIHJldHVybiBkdXJydXRpO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kdXJydXRpLmpzLm1hcCIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5kdXJydXRpID0gZ2xvYmFsLmR1cnJ1dGkgfHwge30sIGdsb2JhbC5kdXJydXRpLlN0b3JlID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogVXRpbHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGhhc1dpbmRvdygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICB2YXIgaXNDbGllbnQgPSBoYXNXaW5kb3coKTtcblxuICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfVxuXG4gIC8vIG9uZS1sZXZlbCBvYmplY3QgZXh0ZW5kXG4gIGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgb2JqID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICB2YXIgZGVmYXVsdHMgPSBhcmd1bWVudHNbMV07XG5cbiAgICAvLyBjbG9uZSBvYmplY3RcbiAgICB2YXIgZXh0ZW5kZWQgPSBjbG9uZShvYmopO1xuXG4gICAgLy8gY29weSBkZWZhdWx0IGtleXMgd2hlcmUgdW5kZWZpbmVkXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBleHRlbmRlZFtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBleHRlbmRlZFtrZXldID0gZGVmYXVsdHNba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBleHRlbmRlZDtcbiAgfVxuXG4gIHZhciBEVVJSVVRJX0RFQlVHID0gdHJ1ZTtcblxuICAvKiBEdXJydXRpXG4gICAqIERhdGEgc3RvcmUgd2l0aCBjaGFuZ2UgZXZlbnRzLlxuICAgKi9cblxuICBmdW5jdGlvbiBTdG9yZShuYW1lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgaGlzdG9yeVN1cHBvcnQgPSBmYWxzZTtcbiAgICAvLyBoaXN0b3J5IGlzIGFjdGl2ZSBvbmx5IGluIHRoZSBicm93c2VyLCBieSBkZWZhdWx0XG4gICAgaWYgKGlzQ2xpZW50KSB7XG4gICAgICBoaXN0b3J5U3VwcG9ydCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgIGhpc3Rvcnk6IGhpc3RvcnlTdXBwb3J0XG4gICAgfSk7XG5cbiAgICB0aGlzLmV2ZW50cyA9IHtcbiAgICAgIGNoYW5nZTogW11cbiAgICB9O1xuXG4gICAgdGhpcy5kYXRhID0gW107XG4gIH1cblxuICBTdG9yZS5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uICh0b3BpYykge1xuICAgIHRoaXMuZXZlbnRzW3RvcGljXSA9IHRoaXMuZXZlbnRzW3RvcGljXSB8fCBbXTtcblxuICAgIC8vIGltbXV0YWJsZS5cbiAgICAvLyBzbyBvbi9vZmYgZG9uJ3QgY2hhbmdlIHRoZSBhcnJheSBkdXJyaW5nIHRyaWdnZXIuXG4gICAgdmFyIGZvdW5kRXZlbnRzID0gdGhpcy5ldmVudHNbdG9waWNdLnNsaWNlKCk7XG4gICAgZm91bmRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKHRvcGljLCBmdW5jKSB7XG4gICAgdGhpcy5ldmVudHNbdG9waWNdID0gdGhpcy5ldmVudHNbdG9waWNdIHx8IFtdO1xuICAgIHRoaXMuZXZlbnRzW3RvcGljXS5wdXNoKGZ1bmMpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAodG9waWMsIGZuKSB7XG4gICAgdGhpcy5ldmVudHNbdG9waWNdID0gdGhpcy5ldmVudHNbdG9waWNdIHx8IFtdO1xuXG4gICAgLy8gZmluZCB0aGUgZm4gaW4gdGhlIGFyclxuICAgIHZhciBpbmRleCA9IFtdLmluZGV4T2YuY2FsbCh0aGlzLmV2ZW50c1t0b3BpY10sIGZuKTtcblxuICAgIC8vIHdlIGRpZG4ndCBmaW5kIGl0IGluIHRoZSBhcnJheVxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50c1t0b3BpY10uc3BsaWNlKGluZGV4LCAxKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZGF0YVt0aGlzLmRhdGEubGVuZ3RoIC0gMV07XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsb25lKHZhbHVlKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY2xvbmUodGhpcy5kYXRhKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oaXN0b3J5KSB7XG4gICAgICB0aGlzLmRhdGEucHVzaCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGF0YSA9IFt2YWx1ZV07XG4gICAgfVxuXG4gICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2UnKTtcblxuICAgIHJldHVybiB0aGlzLmdldCgpO1xuICB9O1xuXG4gIHJldHVybiBTdG9yZTtcblxufSkpKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvcmUuanMubWFwIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLkpvdHRlZCA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKiB1dGlsXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgb2JqID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICB2YXIgZGVmYXVsdHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgdmFyIGV4dGVuZGVkID0ge307XG4gICAgLy8gY2xvbmUgb2JqZWN0XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGV4dGVuZGVkW2tleV0gPSBvYmpba2V5XTtcbiAgICB9KTtcblxuICAgIC8vIGNvcHkgZGVmYXVsdCBrZXlzIHdoZXJlIHVuZGVmaW5lZFxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2YgZXh0ZW5kZWRba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZXh0ZW5kZWRba2V5XSA9IG9ialtrZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXh0ZW5kZWRba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXh0ZW5kZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmZXRjaCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayh1cmwsIHhocik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9O1xuXG4gICAgeGhyLnNlbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkNhbGxiYWNrKGluZGV4LCBwYXJhbXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goZXJyKTtcbiAgICAgIH1cblxuICAgICAgaW5kZXgrKztcbiAgICAgIGlmIChpbmRleCA8IGFyci5sZW5ndGgpIHtcbiAgICAgICAgc2VxUnVubmVyKGluZGV4LCByZXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhlcnJvcnMsIHJlcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlcVJ1bm5lcihpbmRleCwgcGFyYW1zLCBhcnIsIGVycm9ycywgY2FsbGJhY2spIHtcbiAgICAvLyBhc3luY1xuICAgIGFycltpbmRleF0ocGFyYW1zLCBydW5DYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlcShhcnIsIHBhcmFtcykge1xuICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZnVuY3Rpb24gKCkge307XG5cbiAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcnMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgc2VxUnVubmVyKDAsIHBhcmFtcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlKGZuLCBkZWxheSkge1xuICAgIHZhciBjb29sZG93biA9IG51bGw7XG4gICAgdmFyIG11bHRpcGxlID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAoY29vbGRvd24pIHtcbiAgICAgICAgbXVsdGlwbGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgY2xlYXJUaW1lb3V0KGNvb2xkb3duKTtcblxuICAgICAgY29vbGRvd24gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICAgICAgZm4uYXBwbHkoX3RoaXMsIF9hcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29vbGRvd24gPSBudWxsO1xuICAgICAgICBtdWx0aXBsZSA9IG51bGw7XG4gICAgICB9LCBkZWxheSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc0NsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuICAgIGlmICghbm9kZS5jbGFzc05hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRlbXBDbGFzcyA9ICcgJyArIG5vZGUuY2xhc3NOYW1lICsgJyAnO1xuICAgIGNsYXNzTmFtZSA9ICcgJyArIGNsYXNzTmFtZSArICcgJztcblxuICAgIGlmICh0ZW1wQ2xhc3MuaW5kZXhPZihjbGFzc05hbWUpICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgLy8gY2xhc3MgaXMgYWxyZWFkeSBhZGRlZFxuICAgIGlmIChoYXNDbGFzcyhub2RlLCBjbGFzc05hbWUpKSB7XG4gICAgICByZXR1cm4gbm9kZS5jbGFzc05hbWU7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lKSB7XG4gICAgICBjbGFzc05hbWUgPSAnICcgKyBjbGFzc05hbWU7XG4gICAgfVxuXG4gICAgbm9kZS5jbGFzc05hbWUgKz0gY2xhc3NOYW1lO1xuXG4gICAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIHNwYWNlQmVmb3JlID0gJyAnICsgY2xhc3NOYW1lO1xuICAgIHZhciBzcGFjZUFmdGVyID0gY2xhc3NOYW1lICsgJyAnO1xuXG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lLmluZGV4T2Yoc3BhY2VCZWZvcmUpICE9PSAtMSkge1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKHNwYWNlQmVmb3JlLCAnJyk7XG4gICAgfSBlbHNlIGlmIChub2RlLmNsYXNzTmFtZS5pbmRleE9mKHNwYWNlQWZ0ZXIpICE9PSAtMSkge1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKHNwYWNlQWZ0ZXIsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKGNsYXNzTmFtZSwgJycpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlLmNsYXNzTmFtZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRhdGEobm9kZSwgYXR0cikge1xuICAgIHJldHVybiBub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgYXR0cik7XG4gIH1cblxuICAvLyBtb2RlIGRldGVjdGlvbiBiYXNlZCBvbiBjb250ZW50IHR5cGUgYW5kIGZpbGUgZXh0ZW5zaW9uXG4gIHZhciBkZWZhdWx0TW9kZW1hcCA9IHtcbiAgICAnaHRtbCc6ICdodG1sJyxcbiAgICAnY3NzJzogJ2NzcycsXG4gICAgJ2pzJzogJ2phdmFzY3JpcHQnLFxuICAgICdsZXNzJzogJ2xlc3MnLFxuICAgICdzdHlsJzogJ3N0eWx1cycsXG4gICAgJ2NvZmZlZSc6ICdjb2ZmZWVzY3JpcHQnXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0TW9kZSgpIHtcbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gICAgdmFyIGZpbGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgIHZhciBjdXN0b21Nb2RlbWFwID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICAgIHZhciBtb2RlbWFwID0gZXh0ZW5kKGN1c3RvbU1vZGVtYXAsIGRlZmF1bHRNb2RlbWFwKTtcblxuICAgIC8vIHRyeSB0aGUgZmlsZSBleHRlbnNpb25cbiAgICBmb3IgKHZhciBrZXkgaW4gbW9kZW1hcCkge1xuICAgICAgdmFyIGtleUxlbmd0aCA9IGtleS5sZW5ndGg7XG4gICAgICBpZiAoZmlsZS5zbGljZSgta2V5TGVuZ3RoKyspID09PSAnLicgKyBrZXkpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0cnkgdGhlIGZpbGUgdHlwZSAoaHRtbC9jc3MvanMpXG4gICAgZm9yICh2YXIgX2tleSBpbiBtb2RlbWFwKSB7XG4gICAgICBpZiAodHlwZSA9PT0gX2tleSkge1xuICAgICAgICByZXR1cm4gbW9kZW1hcFtfa2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZTtcbiAgfVxuXG4gIC8qIHRlbXBsYXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNvbnRhaW5lcigpIHtcbiAgICByZXR1cm4gJ1xcbiAgICA8dWwgY2xhc3M9XCJqb3R0ZWQtbmF2XCI+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1yZXN1bHRcIj5cXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1qb3R0ZWQtdHlwZT1cInJlc3VsdFwiPlxcbiAgICAgICAgICBSZXN1bHRcXG4gICAgICAgIDwvYT5cXG4gICAgICA8L2xpPlxcbiAgICAgIDxsaSBjbGFzcz1cImpvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0taHRtbFwiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwiaHRtbFwiPlxcbiAgICAgICAgICBIVE1MXFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLWNzc1wiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwiY3NzXCI+XFxuICAgICAgICAgIENTU1xcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1qc1wiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwianNcIj5cXG4gICAgICAgICAgSmF2YVNjcmlwdFxcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1yZXN1bHRcIj48aWZyYW1lPjwvaWZyYW1lPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXBhbmUgam90dGVkLXBhbmUtaHRtbFwiPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXBhbmUgam90dGVkLXBhbmUtY3NzXCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1qc1wiPjwvZGl2PlxcbiAgJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhbmVBY3RpdmVDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtcGFuZS1hY3RpdmUtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBjb250YWluZXJDbGFzcygpIHtcbiAgICByZXR1cm4gJ2pvdHRlZCc7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNGaWxlQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLWhhcy0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkaXRvckNsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1lZGl0b3Igam90dGVkLWVkaXRvci0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkaXRvckNvbnRlbnQodHlwZSkge1xuICAgIHZhciBmaWxlVXJsID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcblxuICAgIHJldHVybiAnXFxuICAgIDx0ZXh0YXJlYSBkYXRhLWpvdHRlZC10eXBlPVwiJyArIHR5cGUgKyAnXCIgZGF0YS1qb3R0ZWQtZmlsZT1cIicgKyBmaWxlVXJsICsgJ1wiPjwvdGV4dGFyZWE+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtc3RhdHVzXCI+PC9kaXY+XFxuICAnO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzTWVzc2FnZShlcnIpIHtcbiAgICByZXR1cm4gJ1xcbiAgICA8cD4nICsgZXJyICsgJzwvcD5cXG4gICc7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtc3RhdHVzLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzQWN0aXZlQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLXN0YXR1cy1hY3RpdmUtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBwbHVnaW5DbGFzcyhuYW1lKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtcGx1Z2luLScgKyBuYW1lO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzTG9hZGluZyh1cmwpIHtcbiAgICByZXR1cm4gJ0xvYWRpbmcgPHN0cm9uZz4nICsgdXJsICsgJzwvc3Ryb25nPi4uJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c0ZldGNoRXJyb3IodXJsKSB7XG4gICAgcmV0dXJuICdUaGVyZSB3YXMgYW4gZXJyb3IgbG9hZGluZyA8c3Ryb25nPicgKyB1cmwgKyAnPC9zdHJvbmc+Lic7XG4gIH1cblxuICB2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9IDogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICB9O1xuXG5cblxuXG5cbiAgdmFyIGFzeW5jR2VuZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEF3YWl0VmFsdWUodmFsdWUpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBBc3luY0dlbmVyYXRvcihnZW4pIHtcbiAgICAgIHZhciBmcm9udCwgYmFjaztcblxuICAgICAgZnVuY3Rpb24gc2VuZChrZXksIGFyZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICBhcmc6IGFyZyxcbiAgICAgICAgICAgIHJlc29sdmU6IHJlc29sdmUsXG4gICAgICAgICAgICByZWplY3Q6IHJlamVjdCxcbiAgICAgICAgICAgIG5leHQ6IG51bGxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKGJhY2spIHtcbiAgICAgICAgICAgIGJhY2sgPSBiYWNrLm5leHQgPSByZXF1ZXN0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcm9udCA9IGJhY2sgPSByZXF1ZXN0O1xuICAgICAgICAgICAgcmVzdW1lKGtleSwgYXJnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZXN1bWUoa2V5LCBhcmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBd2FpdFZhbHVlKSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodmFsdWUudmFsdWUpLnRoZW4oZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgICByZXN1bWUoXCJuZXh0XCIsIGFyZyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICAgIHJlc3VtZShcInRocm93XCIsIGFyZyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0dGxlKHJlc3VsdC5kb25lID8gXCJyZXR1cm5cIiA6IFwibm9ybWFsXCIsIHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBzZXR0bGUoXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldHRsZSh0eXBlLCB2YWx1ZSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwicmV0dXJuXCI6XG4gICAgICAgICAgICBmcm9udC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcInRocm93XCI6XG4gICAgICAgICAgICBmcm9udC5yZWplY3QodmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJvbnQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgZG9uZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBmcm9udCA9IGZyb250Lm5leHQ7XG5cbiAgICAgICAgaWYgKGZyb250KSB7XG4gICAgICAgICAgcmVzdW1lKGZyb250LmtleSwgZnJvbnQuYXJnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYWNrID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbnZva2UgPSBzZW5kO1xuXG4gICAgICBpZiAodHlwZW9mIGdlbi5yZXR1cm4gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnJldHVybiA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5hc3luY0l0ZXJhdG9yKSB7XG4gICAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGVbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKFwibmV4dFwiLCBhcmcpO1xuICAgIH07XG5cbiAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUudGhyb3cgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKFwidGhyb3dcIiwgYXJnKTtcbiAgICB9O1xuXG4gICAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLnJldHVybiA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdyYXA6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBuZXcgQXN5bmNHZW5lcmF0b3IoZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgYXdhaXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbmV3IEF3YWl0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH0oKTtcblxuXG5cblxuXG4gIHZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gICAgfTtcbiAgfSgpO1xuXG5cblxuXG5cblxuXG4gIHZhciBnZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgICB9XG4gIH07XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuICB2YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBzZXQocGFyZW50LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjICYmIGRlc2Mud3JpdGFibGUpIHtcbiAgICAgIGRlc2MudmFsdWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNldHRlciA9IGRlc2Muc2V0O1xuXG4gICAgICBpZiAoc2V0dGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyogcGx1Z2luXG4gICAqL1xuXG4gIHZhciBwbHVnaW5zID0gW107XG5cbiAgZnVuY3Rpb24gZmluZCQxKGlkKSB7XG4gICAgZm9yICh2YXIgcGx1Z2luSW5kZXggaW4gcGx1Z2lucykge1xuICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbcGx1Z2luSW5kZXhdO1xuICAgICAgaWYgKHBsdWdpbi5faWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2FuJ3QgZmluZCBwbHVnaW5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgaWQgKyAnIGlzIG5vdCByZWdpc3RlcmVkLicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIoaWQsIHBsdWdpbikge1xuICAgIC8vIHByaXZhdGUgcHJvcGVydGllc1xuICAgIHBsdWdpbi5faWQgPSBpZDtcbiAgICBwbHVnaW5zLnB1c2gocGx1Z2luKTtcbiAgfVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBlYWNoIHBsdWdpbiwgb24gdGhlIGpvdHRlZCBpbnN0YW5jZVxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLl9nZXQoJ29wdGlvbnMnKS5wbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgLy8gY2hlY2sgaWYgcGx1Z2luIGRlZmluaXRpb24gaXMgc3RyaW5nIG9yIG9iamVjdFxuICAgICAgdmFyIFBsdWdpbiA9IHZvaWQgMDtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gdm9pZCAwO1xuICAgICAgdmFyIHBsdWdpbk9wdGlvbnMgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2luID09PSAnc3RyaW5nJykge1xuICAgICAgICBwbHVnaW5OYW1lID0gcGx1Z2luO1xuICAgICAgfSBlbHNlIGlmICgodHlwZW9mIHBsdWdpbiA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YocGx1Z2luKSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHBsdWdpbk5hbWUgPSBwbHVnaW4ubmFtZTtcbiAgICAgICAgcGx1Z2luT3B0aW9ucyA9IHBsdWdpbi5vcHRpb25zIHx8IHt9O1xuICAgICAgfVxuXG4gICAgICBQbHVnaW4gPSBmaW5kJDEocGx1Z2luTmFtZSk7XG4gICAgICBfdGhpcy5fZ2V0KCdwbHVnaW5zJylbcGx1Z2luXSA9IG5ldyBQbHVnaW4oX3RoaXMsIHBsdWdpbk9wdGlvbnMpO1xuXG4gICAgICBhZGRDbGFzcyhfdGhpcy5fZ2V0KCckY29udGFpbmVyJyksIHBsdWdpbkNsYXNzKHBsdWdpbk5hbWUpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIHB1YnNvdXBcbiAgICovXG5cbiAgdmFyIFB1YlNvdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUHViU291cCgpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFB1YlNvdXApO1xuXG4gICAgICB0aGlzLnRvcGljcyA9IHt9O1xuICAgICAgdGhpcy5jYWxsYmFja3MgPSB7fTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQdWJTb3VwLCBbe1xuICAgICAga2V5OiAnZmluZCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZChxdWVyeSkge1xuICAgICAgICB0aGlzLnRvcGljc1txdWVyeV0gPSB0aGlzLnRvcGljc1txdWVyeV0gfHwgW107XG4gICAgICAgIHJldHVybiB0aGlzLnRvcGljc1txdWVyeV07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnc3Vic2NyaWJlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdWJzY3JpYmUodG9waWMsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHByaW9yaXR5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiA5MDtcblxuICAgICAgICB2YXIgZm91bmRUb3BpYyA9IHRoaXMuZmluZCh0b3BpYyk7XG4gICAgICAgIHN1YnNjcmliZXIuX3ByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgIGZvdW5kVG9waWMucHVzaChzdWJzY3JpYmVyKTtcblxuICAgICAgICAvLyBzb3J0IHN1YnNjcmliZXJzIG9uIHByaW9yaXR5XG4gICAgICAgIGZvdW5kVG9waWMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLl9wcmlvcml0eSA+IGIuX3ByaW9yaXR5ID8gMSA6IGIuX3ByaW9yaXR5ID4gYS5fcHJpb3JpdHkgPyAtMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyByZW1vdmVzIGEgZnVuY3Rpb24gZnJvbSBhbiBhcnJheVxuXG4gICAgfSwge1xuICAgICAga2V5OiAncmVtb3ZlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlcihhcnIsIGZuKSB7XG4gICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBpZiBubyBmbiBpcyBzcGVjaWZpZWRcbiAgICAgICAgICAvLyBjbGVhbi11cCB0aGUgYXJyYXlcbiAgICAgICAgICBpZiAoIWZuKSB7XG4gICAgICAgICAgICBhcnIubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBmaW5kIHRoZSBmbiBpbiB0aGUgYXJyXG4gICAgICAgICAgdmFyIGluZGV4ID0gW10uaW5kZXhPZi5jYWxsKGFyciwgZm4pO1xuXG4gICAgICAgICAgLy8gd2UgZGlkbid0IGZpbmQgaXQgaW4gdGhlIGFycmF5XG4gICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICd1bnN1YnNjcmliZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdW5zdWJzY3JpYmUodG9waWMsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gc3Vic2NyaWJlcnNcbiAgICAgICAgdmFyIGZvdW5kVG9waWMgPSB0aGlzLmZpbmQodG9waWMpO1xuICAgICAgICB0aGlzLnJlbW92ZXIoZm91bmRUb3BpYywgc3Vic2NyaWJlcik7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gY2FsbGJhY2tzXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3RvcGljXSA9IHRoaXMuY2FsbGJhY2tzW3RvcGljXSB8fCBbXTtcbiAgICAgICAgdGhpcy5yZW1vdmVyKHRoaXMuY2FsbGJhY2tzW3RvcGljXSwgc3Vic2NyaWJlcik7XG4gICAgICB9XG5cbiAgICAgIC8vIHNlcXVlbnRpYWxseSBydW5zIGEgbWV0aG9kIG9uIGFsbCBwbHVnaW5zXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdwdWJsaXNoJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwdWJsaXNoKHRvcGljKSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgICAgIHZhciBmb3VuZFRvcGljID0gdGhpcy5maW5kKHRvcGljKTtcbiAgICAgICAgdmFyIHJ1bkxpc3QgPSBbXTtcblxuICAgICAgICBmb3VuZFRvcGljLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgICBydW5MaXN0LnB1c2goc3Vic2NyaWJlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlcShydW5MaXN0LCBwYXJhbXMsIHRoaXMucnVuQ2FsbGJhY2tzKHRvcGljKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhcmFsbGVsIHJ1biBhbGwgLmRvbmUgY2FsbGJhY2tzXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdydW5DYWxsYmFja3MnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJ1bkNhbGxiYWNrcyh0b3BpYykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXJyLCBwYXJhbXMpIHtcbiAgICAgICAgICBfdGhpcy5jYWxsYmFja3NbdG9waWNdID0gX3RoaXMuY2FsbGJhY2tzW3RvcGljXSB8fCBbXTtcblxuICAgICAgICAgIF90aGlzLmNhbGxiYWNrc1t0b3BpY10uZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgYyhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIGF0dGFjaCBhIGNhbGxiYWNrIHdoZW4gYSBwdWJsaXNoW3RvcGljXSBpcyBkb25lXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkb25lJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkb25lKHRvcGljKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZnVuY3Rpb24gKCkge307XG5cbiAgICAgICAgdGhpcy5jYWxsYmFja3NbdG9waWNdID0gdGhpcy5jYWxsYmFja3NbdG9waWNdIHx8IFtdO1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1t0b3BpY10ucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQdWJTb3VwO1xuICB9KCk7XG5cbiAgLyogcmVuZGVyIHBsdWdpblxuICAgKiByZW5kZXJzIHRoZSBpZnJhbWVcbiAgICovXG5cbiAgdmFyIFBsdWdpblJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5SZW5kZXIoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5SZW5kZXIpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gaWZyYW1lIHNyY2RvYyBzdXBwb3J0XG4gICAgICB2YXIgc3VwcG9ydFNyY2RvYyA9ICEhKCdzcmNkb2MnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpKTtcbiAgICAgIHZhciAkcmVzdWx0RnJhbWUgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXBhbmUtcmVzdWx0IGlmcmFtZScpO1xuXG4gICAgICB2YXIgZnJhbWVDb250ZW50ID0gJyc7XG5cbiAgICAgIC8vIGNhY2hlZCBjb250ZW50XG4gICAgICB2YXIgY29udGVudCA9IHtcbiAgICAgICAgaHRtbDogJycsXG4gICAgICAgIGNzczogJycsXG4gICAgICAgIGpzOiAnJ1xuICAgICAgfTtcblxuICAgICAgLy8gY2F0Y2ggZG9tcmVhZHkgZXZlbnRzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLmRvbXJlYWR5LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyByZW5kZXIgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgMTAwKTtcblxuICAgICAgLy8gcHVibGljXG4gICAgICB0aGlzLnN1cHBvcnRTcmNkb2MgPSBzdXBwb3J0U3JjZG9jO1xuICAgICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgICAgIHRoaXMuZnJhbWVDb250ZW50ID0gZnJhbWVDb250ZW50O1xuICAgICAgdGhpcy4kcmVzdWx0RnJhbWUgPSAkcmVzdWx0RnJhbWU7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgICB0aGlzLmluZGV4ID0gMDtcblxuICAgICAgdGhpcy5sYXN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5SZW5kZXIsIFt7XG4gICAgICBrZXk6ICd0ZW1wbGF0ZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gICAgICAgIHZhciBib2R5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgICAgICAgdmFyIHNjcmlwdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogJyc7XG5cbiAgICAgICAgcmV0dXJuICdcXG4gICAgICA8IWRvY3R5cGUgaHRtbD5cXG4gICAgICA8aHRtbD5cXG4gICAgICAgIDxoZWFkPlxcbiAgICAgICAgICA8c2NyaXB0PlxcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XFxuICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcXCdET01Db250ZW50TG9hZGVkXFwnLCBmdW5jdGlvbiAoKSB7XFxuICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFxcJ2pvdHRlZC1kb20tcmVhZHlcXCdcXG4gICAgICAgICAgICAgICAgfSksIFxcJypcXCcpXFxuICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgIH0oKSlcXG4gICAgICAgICAgPC9zY3JpcHQ+XFxuXFxuICAgICAgICAgIDxzdHlsZT4nICsgc3R5bGUgKyAnPC9zdHlsZT5cXG4gICAgICAgIDwvaGVhZD5cXG4gICAgICAgIDxib2R5PlxcbiAgICAgICAgICAnICsgYm9keSArICdcXG5cXG4gICAgICAgICAgPCEtLVxcbiAgICAgICAgICAgIEpvdHRlZDpcXG4gICAgICAgICAgICBFbXB0eSBzY3JpcHQgdGFnIHByZXZlbnRzIG1hbGZvcm1lZCBIVE1MIGZyb20gYnJlYWtpbmcgdGhlIG5leHQgc2NyaXB0LlxcbiAgICAgICAgICAtLT5cXG4gICAgICAgICAgPHNjcmlwdD48L3NjcmlwdD5cXG4gICAgICAgICAgPHNjcmlwdD4nICsgc2NyaXB0ICsgJzwvc2NyaXB0PlxcbiAgICAgICAgPC9ib2R5PlxcbiAgICAgIDwvaHRtbD5cXG4gICAgJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgLy8gY2FjaGUgbWFuaXB1bGF0ZWQgY29udGVudFxuICAgICAgICB0aGlzLmNvbnRlbnRbcGFyYW1zLnR5cGVdID0gcGFyYW1zLmNvbnRlbnQ7XG5cbiAgICAgICAgLy8gY2hlY2sgZXhpc3RpbmcgYW5kIHRvLWJlLXJlbmRlcmVkIGNvbnRlbnRcbiAgICAgICAgdmFyIG9sZEZyYW1lQ29udGVudCA9IHRoaXMuZnJhbWVDb250ZW50O1xuICAgICAgICB0aGlzLmZyYW1lQ29udGVudCA9IHRoaXMudGVtcGxhdGUodGhpcy5jb250ZW50Wydjc3MnXSwgdGhpcy5jb250ZW50WydodG1sJ10sIHRoaXMuY29udGVudFsnanMnXSk7XG5cbiAgICAgICAgLy8gY2FjaGUgdGhlIGN1cnJlbnQgY2FsbGJhY2sgYXMgZ2xvYmFsLFxuICAgICAgICAvLyBzbyB3ZSBjYW4gY2FsbCBpdCBmcm9tIHRoZSBtZXNzYWdlIGNhbGxiYWNrLlxuICAgICAgICB0aGlzLmxhc3RDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5sYXN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVuZGVyIGlmIHByZXZpb3VzIGFuZCBuZXcgZnJhbWUgY29udGVudCBhcmUgdGhlIHNhbWUuXG4gICAgICAgIC8vIG1vc3RseSBmb3IgdGhlIGBwbGF5YCBwbHVnaW4sXG4gICAgICAgIC8vIHNvIHdlIGRvbid0IHJlLXJlbmRlciB0aGUgc2FtZSBjb250ZW50IG9uIGVhY2ggY2hhbmdlLlxuICAgICAgICAvLyB1bmxlc3Mgd2Ugc2V0IGZvcmNlUmVuZGVyLlxuICAgICAgICBpZiAocGFyYW1zLmZvcmNlUmVuZGVyICE9PSB0cnVlICYmIHRoaXMuZnJhbWVDb250ZW50ID09PSBvbGRGcmFtZUNvbnRlbnQpIHtcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN1cHBvcnRTcmNkb2MpIHtcbiAgICAgICAgICAvLyBzcmNkb2MgaW4gdW5yZWxpYWJsZSBpbiBDaHJvbWUuXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2doaW5kYS9qb3R0ZWQvaXNzdWVzLzIzXG5cbiAgICAgICAgICAvLyByZS1jcmVhdGUgdGhlIGlmcmFtZSBvbiBlYWNoIGNoYW5nZSxcbiAgICAgICAgICAvLyB0byBkaXNjYXJkIHRoZSBwcmV2aW91c2x5IGxvYWRlZCBzY3JpcHRzLlxuICAgICAgICAgIHZhciAkbmV3UmVzdWx0RnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCgkbmV3UmVzdWx0RnJhbWUsIHRoaXMuJHJlc3VsdEZyYW1lKTtcbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZSA9ICRuZXdSZXN1bHRGcmFtZTtcblxuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQub3BlbigpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQud3JpdGUodGhpcy5mcmFtZUNvbnRlbnQpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY2xvc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvbGRlciBicm93c2VycyB3aXRob3V0IGlmcmFtZSBzcmNzZXQgc3VwcG9ydCAoSUU5KS5cbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjZG9jJywgdGhpcy5mcmFtZUNvbnRlbnQpO1xuXG4gICAgICAgICAgLy8gdGlwcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9qdWdnbGlubWlrZS9zcmNkb2MtcG9seWZpbGxcbiAgICAgICAgICAvLyBDb3B5cmlnaHQgKGMpIDIwMTIgTWlrZSBQZW5uaXNpXG4gICAgICAgICAgLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICAgICAgICAgIHZhciBqc1VybCA9ICdqYXZhc2NyaXB0OndpbmRvdy5mcmFtZUVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1zcmNkb2NcIik7JztcblxuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywganNVcmwpO1xuXG4gICAgICAgICAgLy8gRXhwbGljaXRseSBzZXQgdGhlIGlGcmFtZSdzIHdpbmRvdy5sb2NhdGlvbiBmb3JcbiAgICAgICAgICAvLyBjb21wYXRpYmlsaXR5IHdpdGggSUU5LCB3aGljaCBkb2VzIG5vdCByZWFjdCB0byBjaGFuZ2VzIGluXG4gICAgICAgICAgLy8gdGhlIGBzcmNgIGF0dHJpYnV0ZSB3aGVuIGl0IGlzIGEgYGphdmFzY3JpcHQ6YCBVUkwuXG4gICAgICAgICAgaWYgKHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24gPSBqc1VybDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkb21yZWFkeScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZG9tcmVhZHkoZSkge1xuICAgICAgICAvLyBvbmx5IGNhdGNoIG1lc3NhZ2VzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgICBpZiAoZS5zb3VyY2UgIT09IHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSQkMSA9IHt9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEkJDEgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgaWYgKGRhdGEkJDEudHlwZSA9PT0gJ2pvdHRlZC1kb20tcmVhZHknKSB7XG4gICAgICAgICAgdGhpcy5sYXN0Q2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luUmVuZGVyO1xuICB9KCk7XG5cbiAgLyogc2NyaXB0bGVzcyBwbHVnaW5cbiAgICogcmVtb3ZlcyBzY3JpcHQgdGFncyBmcm9tIGh0bWwgY29udGVudFxuICAgKi9cblxuICB2YXIgUGx1Z2luU2NyaXB0bGVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5TY3JpcHRsZXNzKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luU2NyaXB0bGVzcyk7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zY3JpcHRpbmcuaHRtbFxuICAgICAgdmFyIHJ1blNjcmlwdFR5cGVzID0gWydhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JywgJ2FwcGxpY2F0aW9uL2VjbWFzY3JpcHQnLCAnYXBwbGljYXRpb24veC1lY21hc2NyaXB0JywgJ2FwcGxpY2F0aW9uL3gtamF2YXNjcmlwdCcsICd0ZXh0L2VjbWFzY3JpcHQnLCAndGV4dC9qYXZhc2NyaXB0JywgJ3RleHQvamF2YXNjcmlwdDEuMCcsICd0ZXh0L2phdmFzY3JpcHQxLjEnLCAndGV4dC9qYXZhc2NyaXB0MS4yJywgJ3RleHQvamF2YXNjcmlwdDEuMycsICd0ZXh0L2phdmFzY3JpcHQxLjQnLCAndGV4dC9qYXZhc2NyaXB0MS41JywgJ3RleHQvanNjcmlwdCcsICd0ZXh0L2xpdmVzY3JpcHQnLCAndGV4dC94LWVjbWFzY3JpcHQnLCAndGV4dC94LWphdmFzY3JpcHQnXTtcblxuICAgICAgLy8gcmVtb3ZlIHNjcmlwdCB0YWdzIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBwdWJsaWNcbiAgICAgIHRoaXMucnVuU2NyaXB0VHlwZXMgPSBydW5TY3JpcHRUeXBlcztcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5TY3JpcHRsZXNzLCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdodG1sJykge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIElFOSBzdXBwb3J0LCByZW1vdmUgdGhlIHNjcmlwdCB0YWdzIGZyb20gSFRNTCBjb250ZW50LlxuICAgICAgICAvLyB3aGVuIHdlIHN0b3Agc3VwcG9ydGluZyBJRTksIHdlIGNhbiB1c2UgdGhlIHNhbmRib3ggYXR0cmlidXRlLlxuICAgICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZnJhZ21lbnQuaW5uZXJIVE1MID0gcGFyYW1zLmNvbnRlbnQ7XG5cbiAgICAgICAgdmFyIHR5cGVBdHRyID0gbnVsbDtcblxuICAgICAgICAvLyByZW1vdmUgYWxsIHNjcmlwdCB0YWdzXG4gICAgICAgIHZhciAkc2NyaXB0cyA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdHlwZUF0dHIgPSAkc2NyaXB0c1tpXS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcblxuICAgICAgICAgIC8vIG9ubHkgcmVtb3ZlIHNjcmlwdCB0YWdzIHdpdGhvdXQgdGhlIHR5cGUgYXR0cmlidXRlXG4gICAgICAgICAgLy8gb3Igd2l0aCBhIGphdmFzY3JpcHQgbWltZSBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICAgICAgLy8gdGhlIG9uZXMgdGhhdCBhcmUgcnVuIGJ5IHRoZSBicm93c2VyLlxuICAgICAgICAgIGlmICghdHlwZUF0dHIgfHwgdGhpcy5ydW5TY3JpcHRUeXBlcy5pbmRleE9mKHR5cGVBdHRyKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICRzY3JpcHRzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoJHNjcmlwdHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmFtcy5jb250ZW50ID0gZnJhZ21lbnQuaW5uZXJIVE1MO1xuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5TY3JpcHRsZXNzO1xuICB9KCk7XG5cbiAgLyogYWNlIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQWNlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkFjZShqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkFjZSk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDE7XG4gICAgICB2YXIgaTtcblxuICAgICAgdGhpcy5lZGl0b3IgPSB7fTtcbiAgICAgIHRoaXMuam90dGVkID0gam90dGVkO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgQWNlIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuYWNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciAkZWRpdG9ycyA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb3R0ZWQtZWRpdG9yJyk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkZWRpdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgJHRleHRhcmVhID0gJGVkaXRvcnNbaV0ucXVlcnlTZWxlY3RvcigndGV4dGFyZWEnKTtcbiAgICAgICAgdmFyIHR5cGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC10eXBlJyk7XG4gICAgICAgIHZhciBmaWxlID0gZGF0YSgkdGV4dGFyZWEsICdqb3R0ZWQtZmlsZScpO1xuXG4gICAgICAgIHZhciAkYWNlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICRlZGl0b3JzW2ldLmFwcGVuZENoaWxkKCRhY2VDb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuZWRpdG9yW3R5cGVdID0gd2luZG93LmFjZS5lZGl0KCRhY2VDb250YWluZXIpO1xuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3JbdHlwZV07XG5cbiAgICAgICAgdmFyIGVkaXRvck9wdGlvbnMgPSBleHRlbmQob3B0aW9ucyk7XG5cbiAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKCdhY2UvbW9kZS8nICsgZ2V0TW9kZSh0eXBlLCBmaWxlKSk7XG4gICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkuc2V0T3B0aW9ucyhlZGl0b3JPcHRpb25zKTtcblxuICAgICAgICBlZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICB9XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkFjZSwgW3tcbiAgICAgIGtleTogJ2VkaXRvckNoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZWRpdG9yQ2hhbmdlKHBhcmFtcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuam90dGVkLnRyaWdnZXIoJ2NoYW5nZScsIHBhcmFtcyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3JbcGFyYW1zLnR5cGVdO1xuXG4gICAgICAgIC8vIGlmIHRoZSBldmVudCBpcyBub3Qgc3RhcnRlZCBieSB0aGUgYWNlIGNoYW5nZS5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIG9ubHkgb25jZSBwZXIgZWRpdG9yLFxuICAgICAgICAvLyB3aGVuIHRoZSB0ZXh0YXJlYSBpcyBwb3B1bGF0ZWQvZmlsZSBpcyBsb2FkZWQuXG4gICAgICAgIGlmICghcGFyYW1zLmFjZUVkaXRvcikge1xuICAgICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkuc2V0VmFsdWUocGFyYW1zLmNvbnRlbnQpO1xuXG4gICAgICAgICAgLy8gYXR0YWNoIHRoZSBldmVudCBvbmx5IGFmdGVyIHRoZSBmaWxlIGlzIGxvYWRlZFxuICAgICAgICAgIHBhcmFtcy5hY2VFZGl0b3IgPSBlZGl0b3I7XG4gICAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCB0aGlzLmVkaXRvckNoYW5nZShwYXJhbXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hbmlwdWxhdGUgdGhlIHBhcmFtcyBhbmQgcGFzcyB0aGVtIG9uXG4gICAgICAgIHBhcmFtcy5jb250ZW50ID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5BY2U7XG4gIH0oKTtcblxuICAvKiBjb3JlbWlycm9yIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQ29kZU1pcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5Db2RlTWlycm9yKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQ29kZU1pcnJvcik7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDE7XG4gICAgICB2YXIgaTtcblxuICAgICAgdGhpcy5lZGl0b3IgPSB7fTtcbiAgICAgIHRoaXMuam90dGVkID0gam90dGVkO1xuXG4gICAgICAvLyBjdXN0b20gbW9kZW1hcCBmb3IgY29kZW1pcnJvclxuICAgICAgdmFyIG1vZGVtYXAgPSB7XG4gICAgICAgICdodG1sJzogJ2h0bWxtaXhlZCdcbiAgICAgIH07XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIENvZGVNaXJyb3IgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5Db2RlTWlycm9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciAkZWRpdG9ycyA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb3R0ZWQtZWRpdG9yJyk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkZWRpdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgJHRleHRhcmVhID0gJGVkaXRvcnNbaV0ucXVlcnlTZWxlY3RvcigndGV4dGFyZWEnKTtcbiAgICAgICAgdmFyIHR5cGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC10eXBlJyk7XG4gICAgICAgIHZhciBmaWxlID0gZGF0YSgkdGV4dGFyZWEsICdqb3R0ZWQtZmlsZScpO1xuXG4gICAgICAgIHRoaXMuZWRpdG9yW3R5cGVdID0gd2luZG93LkNvZGVNaXJyb3IuZnJvbVRleHRBcmVhKCR0ZXh0YXJlYSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWRpdG9yW3R5cGVdLnNldE9wdGlvbignbW9kZScsIGdldE1vZGUodHlwZSwgZmlsZSwgbW9kZW1hcCkpO1xuICAgICAgfVxuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5Db2RlTWlycm9yLCBbe1xuICAgICAga2V5OiAnZWRpdG9yQ2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlZGl0b3JDaGFuZ2UocGFyYW1zKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyB0cmlnZ2VyIGEgY2hhbmdlIGV2ZW50XG4gICAgICAgICAgX3RoaXMuam90dGVkLnRyaWdnZXIoJ2NoYW5nZScsIHBhcmFtcyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3JbcGFyYW1zLnR5cGVdO1xuXG4gICAgICAgIC8vIGlmIHRoZSBldmVudCBpcyBub3Qgc3RhcnRlZCBieSB0aGUgY29kZW1pcnJvciBjaGFuZ2UuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBvbmx5IG9uY2UgcGVyIGVkaXRvcixcbiAgICAgICAgLy8gd2hlbiB0aGUgdGV4dGFyZWEgaXMgcG9wdWxhdGVkL2ZpbGUgaXMgbG9hZGVkLlxuICAgICAgICBpZiAoIXBhcmFtcy5jbUVkaXRvcikge1xuICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZShwYXJhbXMuY29udGVudCk7XG5cbiAgICAgICAgICAvLyBhdHRhY2ggdGhlIGV2ZW50IG9ubHkgYWZ0ZXIgdGhlIGZpbGUgaXMgbG9hZGVkXG4gICAgICAgICAgcGFyYW1zLmNtRWRpdG9yID0gZWRpdG9yO1xuICAgICAgICAgIGVkaXRvci5vbignY2hhbmdlJywgdGhpcy5lZGl0b3JDaGFuZ2UocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYW5pcHVsYXRlIHRoZSBwYXJhbXMgYW5kIHBhc3MgdGhlbSBvblxuICAgICAgICBwYXJhbXMuY29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQ29kZU1pcnJvcjtcbiAgfSgpO1xuXG4gIC8qIGxlc3MgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5MZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkxlc3Moam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5MZXNzKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBsZXNzIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubGVzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGFuZ2UgQ1NTIGxpbmsgbGFiZWwgdG8gTGVzc1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwiY3NzXCJdJykuaW5uZXJIVE1MID0gJ0xlc3MnO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5MZXNzLCBbe1xuICAgICAga2V5OiAnaXNMZXNzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0xlc3MocGFyYW1zKSB7XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2NzcycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zLmZpbGUuaW5kZXhPZignLmxlc3MnKSAhPT0gLTEgfHwgcGFyYW1zLmZpbGUgPT09ICcnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSAubGVzcyBhbmQgYmxhbmsgZmlsZXNcbiAgICAgICAgaWYgKHRoaXMuaXNMZXNzKHBhcmFtcykpIHtcbiAgICAgICAgICB3aW5kb3cubGVzcy5yZW5kZXIocGFyYW1zLmNvbnRlbnQsIHRoaXMub3B0aW9ucywgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBjb250ZW50IHdpdGggdGhlIHBhcnNlZCBsZXNzXG4gICAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gcmVzLmNzcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5MZXNzO1xuICB9KCk7XG5cbiAgLyogY29mZmVlc2NyaXB0IHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQ29mZmVlU2NyaXB0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkNvZmZlZVNjcmlwdChqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkNvZmZlZVNjcmlwdCk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgY29mZmVlc2NyaXB0IGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuQ29mZmVlU2NyaXB0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBKUyBsaW5rIGxhYmVsIHRvIExlc3NcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImpzXCJdJykuaW5uZXJIVE1MID0gJ0NvZmZlZVNjcmlwdCc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkNvZmZlZVNjcmlwdCwgW3tcbiAgICAgIGtleTogJ2lzQ29mZmVlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0NvZmZlZShwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnanMnKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5maWxlLmluZGV4T2YoJy5jb2ZmZWUnKSAhPT0gLTEgfHwgcGFyYW1zLmZpbGUgPT09ICcnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSAubGVzcyBhbmQgYmxhbmsgZmlsZXNcbiAgICAgICAgaWYgKHRoaXMuaXNDb2ZmZWUocGFyYW1zKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHdpbmRvdy5Db2ZmZWVTY3JpcHQuY29tcGlsZShwYXJhbXMuY29udGVudCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5Db2ZmZWVTY3JpcHQ7XG4gIH0oKTtcblxuICAvKiBzdHlsdXMgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5TdHlsdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luU3R5bHVzKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luU3R5bHVzKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBzdHlsdXMgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5zdHlsdXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIENTUyBsaW5rIGxhYmVsIHRvIFN0eWx1c1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwiY3NzXCJdJykuaW5uZXJIVE1MID0gJ1N0eWx1cyc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblN0eWx1cywgW3tcbiAgICAgIGtleTogJ2lzU3R5bHVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc1N0eWx1cyhwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnY3NzJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMuZmlsZS5pbmRleE9mKCcuc3R5bCcpICE9PSAtMSB8fCBwYXJhbXMuZmlsZSA9PT0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIC5zdHlsIGFuZCBibGFuayBmaWxlc1xuICAgICAgICBpZiAodGhpcy5pc1N0eWx1cyhwYXJhbXMpKSB7XG4gICAgICAgICAgd2luZG93LnN0eWx1cyhwYXJhbXMuY29udGVudCwgdGhpcy5vcHRpb25zKS5yZW5kZXIoZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBjb250ZW50IHdpdGggdGhlIHBhcnNlZCBsZXNzXG4gICAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gcmVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpblN0eWx1cztcbiAgfSgpO1xuXG4gIC8qIGJhYmVsIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQmFiZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQmFiZWwoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5CYWJlbCk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBiYWJlbCBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LkJhYmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyB1c2luZyBiYWJlbC1zdGFuZGFsb25lXG4gICAgICAgIHRoaXMuYmFiZWwgPSB3aW5kb3cuQmFiZWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuYmFiZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIHVzaW5nIGJyb3dzZXIuanMgZnJvbSBiYWJlbC1jb3JlIDUueFxuICAgICAgICB0aGlzLmJhYmVsID0ge1xuICAgICAgICAgIHRyYW5zZm9ybTogd2luZG93LmJhYmVsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBqcyBsaW5rIGxhYmVsXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJqc1wiXScpLmlubmVySFRNTCA9ICdFUzIwMTUnO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5CYWJlbCwgW3tcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSBqcyBjb250ZW50XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2pzJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHRoaXMuYmFiZWwudHJhbnNmb3JtKHBhcmFtcy5jb250ZW50LCB0aGlzLm9wdGlvbnMpLmNvZGU7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQmFiZWw7XG4gIH0oKTtcblxuICAvKiBtYXJrZG93biBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbk1hcmtkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbk1hcmtkb3duKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luTWFya2Rvd24pO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgbWFya2VkIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubWFya2VkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5tYXJrZWQuc2V0T3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgLy8gY2hhbmdlIGh0bWwgbGluayBsYWJlbFxuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwiaHRtbFwiXScpLmlubmVySFRNTCA9ICdNYXJrZG93bic7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbk1hcmtkb3duLCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIGh0bWwgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdodG1sJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHdpbmRvdy5tYXJrZWQocGFyYW1zLmNvbnRlbnQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbk1hcmtkb3duO1xuICB9KCk7XG5cbiAgLyogY29uc29sZSBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkNvbnNvbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQ29uc29sZShqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkNvbnNvbGUpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgYXV0b0NsZWFyOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDMwO1xuICAgICAgdmFyIGhpc3RvcnkgPSBbXTtcbiAgICAgIHZhciBoaXN0b3J5SW5kZXggPSAwO1xuICAgICAgdmFyIGxvZ0NhcHR1cmVTbmlwcGV0ID0gJygnICsgdGhpcy5jYXB0dXJlLnRvU3RyaW5nKCkgKyAnKSgpOyc7XG4gICAgICB2YXIgY29udGVudENhY2hlID0ge1xuICAgICAgICBodG1sOiAnJyxcbiAgICAgICAgY3NzOiAnJyxcbiAgICAgICAganM6ICcnXG4gICAgICB9O1xuXG4gICAgICAvLyBuZXcgdGFiIGFuZCBwYW5lIG1hcmt1cFxuICAgICAgdmFyICRuYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgYWRkQ2xhc3MoJG5hdiwgJ2pvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0tY29uc29sZScpO1xuICAgICAgJG5hdi5pbm5lckhUTUwgPSAnPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwiY29uc29sZVwiPkpTIENvbnNvbGU8L2E+JztcblxuICAgICAgdmFyICRwYW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBhZGRDbGFzcygkcGFuZSwgJ2pvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLWNvbnNvbGUnKTtcblxuICAgICAgJHBhbmUuaW5uZXJIVE1MID0gJ1xcbiAgICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtY29uc29sZS1jb250YWluZXJcIj5cXG4gICAgICAgIDx1bCBjbGFzcz1cImpvdHRlZC1jb25zb2xlLW91dHB1dFwiPjwvdWw+XFxuICAgICAgICA8Zm9ybSBjbGFzcz1cImpvdHRlZC1jb25zb2xlLWlucHV0XCI+XFxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxcbiAgICAgICAgPC9mb3JtPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxidXR0b24gY2xhc3M9XCJqb3R0ZWQtYnV0dG9uIGpvdHRlZC1jb25zb2xlLWNsZWFyXCI+Q2xlYXI8L2J1dHRvbj5cXG4gICAgJztcblxuICAgICAgam90dGVkLiRjb250YWluZXIuYXBwZW5kQ2hpbGQoJHBhbmUpO1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1uYXYnKS5hcHBlbmRDaGlsZCgkbmF2KTtcblxuICAgICAgdmFyICRjb250YWluZXIgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtY29udGFpbmVyJyk7XG4gICAgICB2YXIgJG91dHB1dCA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1vdXRwdXQnKTtcbiAgICAgIHZhciAkaW5wdXQgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtaW5wdXQgaW5wdXQnKTtcbiAgICAgIHZhciAkaW5wdXRGb3JtID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLWlucHV0Jyk7XG4gICAgICB2YXIgJGNsZWFyID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLWNsZWFyJyk7XG5cbiAgICAgIC8vIHN1Ym1pdCB0aGUgaW5wdXQgZm9ybVxuICAgICAgJGlucHV0Rm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY29uc29sZSBoaXN0b3J5XG4gICAgICAkaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGlzdG9yeS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY2xlYXIgYnV0dG9uXG4gICAgICAkY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsZWFyLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjbGVhciB0aGUgY29uc29sZSBvbiBlYWNoIGNoYW5nZVxuICAgICAgaWYgKG9wdGlvbnMuYXV0b0NsZWFyID09PSB0cnVlKSB7XG4gICAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5hdXRvQ2xlYXIuYmluZCh0aGlzKSwgcHJpb3JpdHkgLSAxKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FwdHVyZSB0aGUgY29uc29sZSBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG5cbiAgICAgIC8vIGdldCBsb2cgZXZlbnRzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLmdldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIHBsdWdpbiBwdWJsaWMgcHJvcGVydGllc1xuICAgICAgdGhpcy4kam90dGVkQ29udGFpbmVyID0gam90dGVkLiRjb250YWluZXI7XG4gICAgICB0aGlzLiRjb250YWluZXIgPSAkY29udGFpbmVyO1xuICAgICAgdGhpcy4kaW5wdXQgPSAkaW5wdXQ7XG4gICAgICB0aGlzLiRvdXRwdXQgPSAkb3V0cHV0O1xuICAgICAgdGhpcy5oaXN0b3J5ID0gaGlzdG9yeTtcbiAgICAgIHRoaXMuaGlzdG9yeUluZGV4ID0gaGlzdG9yeUluZGV4O1xuICAgICAgdGhpcy5sb2dDYXB0dXJlU25pcHBldCA9IGxvZ0NhcHR1cmVTbmlwcGV0O1xuICAgICAgdGhpcy5jb250ZW50Q2FjaGUgPSBjb250ZW50Q2FjaGU7XG4gICAgICB0aGlzLmdldElmcmFtZSA9IHRoaXMuZ2V0SWZyYW1lLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQ29uc29sZSwgW3tcbiAgICAgIGtleTogJ2dldElmcmFtZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SWZyYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kam90dGVkQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS1yZXN1bHQgaWZyYW1lJyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnZ2V0TWVzc2FnZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShlKSB7XG4gICAgICAgIC8vIG9ubHkgY2F0Y2ggbWVzc2FnZXMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICAgIGlmIChlLnNvdXJjZSAhPT0gdGhpcy5nZXRJZnJhbWUoKS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEkJDEgPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhJCQxID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG5cbiAgICAgICAgaWYgKGRhdGEkJDEudHlwZSA9PT0gJ2pvdHRlZC1jb25zb2xlLWxvZycpIHtcbiAgICAgICAgICB0aGlzLmxvZyhkYXRhJCQxLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnYXV0b0NsZWFyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBhdXRvQ2xlYXIocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc25pcHBldGxlc3NDb250ZW50ID0gcGFyYW1zLmNvbnRlbnQ7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBzbmlwcGV0IGZyb20gY2FjaGVkIGpzIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnanMnKSB7XG4gICAgICAgICAgc25pcHBldGxlc3NDb250ZW50ID0gc25pcHBldGxlc3NDb250ZW50LnJlcGxhY2UodGhpcy5sb2dDYXB0dXJlU25pcHBldCwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgUGxheSBwbHVnaW4sXG4gICAgICAgIC8vIGNsZWFyIHRoZSBjb25zb2xlIG9ubHkgaWYgc29tZXRoaW5nIGhhcyBjaGFuZ2VkIG9yIGZvcmNlIHJlbmRlcmluZy5cbiAgICAgICAgaWYgKHBhcmFtcy5mb3JjZVJlbmRlciA9PT0gdHJ1ZSB8fCB0aGlzLmNvbnRlbnRDYWNoZVtwYXJhbXMudHlwZV0gIT09IHNuaXBwZXRsZXNzQ29udGVudCkge1xuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFsd2F5cyBjYWNoZSB0aGUgbGF0ZXN0IGNvbnRlbnRcbiAgICAgICAgdGhpcy5jb250ZW50Q2FjaGVbcGFyYW1zLnR5cGVdID0gc25pcHBldGxlc3NDb250ZW50O1xuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIGpzIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnanMnKSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgc25pcHBldCBpcyBhbHJlYWR5IGFkZGVkLlxuICAgICAgICAvLyB0aGUgUGxheSBwbHVnaW4gY2FjaGVzIHRoZSBjaGFuZ2VkIHBhcmFtcyBhbmQgdHJpZ2dlcnMgY2hhbmdlXG4gICAgICAgIC8vIHdpdGggdGhlIGNhY2hlZCByZXNwb25zZSwgY2F1c2luZyB0aGUgc25pcHBldCB0byBiZSBpbnNlcnRlZFxuICAgICAgICAvLyBtdWx0aXBsZSB0aW1lcywgb24gZWFjaCB0cmlnZ2VyLlxuICAgICAgICBpZiAocGFyYW1zLmNvbnRlbnQuaW5kZXhPZih0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0KSA9PT0gLTEpIHtcbiAgICAgICAgICBwYXJhbXMuY29udGVudCA9ICcnICsgdGhpcy5sb2dDYXB0dXJlU25pcHBldCArIHBhcmFtcy5jb250ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FwdHVyZSB0aGUgY29uc29sZS5sb2cgb3V0cHV0XG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjYXB0dXJlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYXB0dXJlKCkge1xuICAgICAgICAvLyBJRTkgd2l0aCBkZXZ0b29scyBjbG9zZWRcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuY29uc29sZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5jb25zb2xlLmxvZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgICAgICAgIGxvZzogZnVuY3Rpb24gbG9nKCkge31cbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIElFOSBzdXBwb3J0XG4gICAgICAgIHZhciBvbGRDb25zb2xlTG9nID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbCh3aW5kb3cuY29uc29sZS5sb2csIHdpbmRvdy5jb25zb2xlKTtcblxuICAgICAgICB3aW5kb3cuY29uc29sZS5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gc2VuZCBsb2cgbWVzc2FnZXMgdG8gdGhlIHBhcmVudCB3aW5kb3dcbiAgICAgICAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuZm9yRWFjaChmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdqb3R0ZWQtY29uc29sZS1sb2cnLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICAgICAgICB9KSwgJyonKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGluIElFOSwgY29uc29sZS5sb2cgaXMgb2JqZWN0IGluc3RlYWQgb2YgZnVuY3Rpb25cbiAgICAgICAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzU4NTg5Ni9jb25zb2xlLWxvZy10eXBlb2YtaXMtb2JqZWN0LWluc3RlYWQtb2YtZnVuY3Rpb25cbiAgICAgICAgICBvbGRDb25zb2xlTG9nLmFwcGx5KG9sZENvbnNvbGVMb2csIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbG9nJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2coKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdmFyICRsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBhZGRDbGFzcygkbG9nLCAnam90dGVkLWNvbnNvbGUtbG9nJyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGFkZENsYXNzKCRsb2csICdqb3R0ZWQtY29uc29sZS1sb2ctJyArIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxvZy5pbm5lckhUTUwgPSBtZXNzYWdlO1xuXG4gICAgICAgIHRoaXMuJG91dHB1dC5hcHBlbmRDaGlsZCgkbG9nKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzdWJtaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdChlKSB7XG4gICAgICAgIHZhciBpbnB1dFZhbHVlID0gdGhpcy4kaW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgIC8vIGlmIGlucHV0IGlzIGJsYW5rLCBkbyBub3RoaW5nXG4gICAgICAgIGlmIChpbnB1dFZhbHVlID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgcnVuIHRvIGhpc3RvcnlcbiAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goaW5wdXRWYWx1ZSk7XG4gICAgICAgIHRoaXMuaGlzdG9yeUluZGV4ID0gdGhpcy5oaXN0b3J5Lmxlbmd0aDtcblxuICAgICAgICAvLyBsb2cgaW5wdXQgdmFsdWVcbiAgICAgICAgdGhpcy5sb2coaW5wdXRWYWx1ZSwgJ2hpc3RvcnknKTtcblxuICAgICAgICAvLyBhZGQgcmV0dXJuIGlmIGl0IGRvZXNuJ3Qgc3RhcnQgd2l0aCBpdFxuICAgICAgICBpZiAoaW5wdXRWYWx1ZS5pbmRleE9mKCdyZXR1cm4nKSAhPT0gMCkge1xuICAgICAgICAgIGlucHV0VmFsdWUgPSAncmV0dXJuICcgKyBpbnB1dFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hvdyBvdXRwdXQgb3IgZXJyb3JzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gcnVuIHRoZSBjb25zb2xlIGlucHV0IGluIHRoZSBpZnJhbWUgY29udGV4dFxuICAgICAgICAgIHZhciBzY3JpcHRPdXRwdXQgPSB0aGlzLmdldElmcmFtZSgpLmNvbnRlbnRXaW5kb3cuZXZhbCgnKGZ1bmN0aW9uKCkgeycgKyBpbnB1dFZhbHVlICsgJ30pKCknKTtcblxuICAgICAgICAgIHRoaXMubG9nKHNjcmlwdE91dHB1dCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRoaXMubG9nKGVyciwgJ2Vycm9yJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhciB0aGUgY29uc29sZSB2YWx1ZVxuICAgICAgICB0aGlzLiRpbnB1dC52YWx1ZSA9ICcnO1xuXG4gICAgICAgIC8vIHNjcm9sbCBjb25zb2xlIHBhbmUgdG8gYm90dG9tXG4gICAgICAgIC8vIHRvIGtlZXAgdGhlIGlucHV0IGludG8gdmlld1xuICAgICAgICB0aGlzLiRjb250YWluZXIuc2Nyb2xsVG9wID0gdGhpcy4kY29udGFpbmVyLnNjcm9sbEhlaWdodDtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2xlYXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICB0aGlzLiRvdXRwdXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnaGlzdG9yeScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaGlzdG9yeShlKSB7XG4gICAgICAgIHZhciBVUCA9IDM4O1xuICAgICAgICB2YXIgRE9XTiA9IDQwO1xuICAgICAgICB2YXIgZ290SGlzdG9yeSA9IGZhbHNlO1xuICAgICAgICB2YXIgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLiRpbnB1dC5zZWxlY3Rpb25TdGFydDtcblxuICAgICAgICAvLyBvbmx5IGlmIHdlIGhhdmUgcHJldmlvdXMgaGlzdG9yeVxuICAgICAgICAvLyBhbmQgdGhlIGN1cnNvciBpcyBhdCB0aGUgc3RhcnRcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gVVAgJiYgdGhpcy5oaXN0b3J5SW5kZXggIT09IDAgJiYgc2VsZWN0aW9uU3RhcnQgPT09IDApIHtcbiAgICAgICAgICB0aGlzLmhpc3RvcnlJbmRleC0tO1xuICAgICAgICAgIGdvdEhpc3RvcnkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBpZiB3ZSBoYXZlIGZ1dHVyZSBoaXN0b3J5XG4gICAgICAgIC8vIGFuZCB0aGUgY3Vyc29yIGlzIGF0IHRoZSBlbmRcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gRE9XTiAmJiB0aGlzLmhpc3RvcnlJbmRleCAhPT0gdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDEgJiYgc2VsZWN0aW9uU3RhcnQgPT09IHRoaXMuJGlucHV0LnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4Kys7XG4gICAgICAgICAgZ290SGlzdG9yeSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvbmx5IGlmIGhpc3RvcnkgY2hhbmdlZFxuICAgICAgICBpZiAoZ290SGlzdG9yeSkge1xuICAgICAgICAgIHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5oaXN0b3J5W3RoaXMuaGlzdG9yeUluZGV4XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQ29uc29sZTtcbiAgfSgpO1xuXG4gIC8qIHBsYXkgcGx1Z2luXG4gICAqIGFkZHMgYSBSdW4gYnV0dG9uXG4gICAqL1xuXG4gIHZhciBQbHVnaW5QbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblBsYXkoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5QbGF5KTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIGZpcnN0UnVuOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMTA7XG4gICAgICAvLyBjYWNoZWQgY29kZVxuICAgICAgdmFyIGNhY2hlID0ge307XG4gICAgICAvLyBsYXRlc3QgdmVyc2lvbiBvZiB0aGUgY29kZS5cbiAgICAgIC8vIHJlcGxhY2VzIHRoZSBjYWNoZSB3aGVuIHRoZSBydW4gYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgICB2YXIgY29kZSA9IHt9O1xuXG4gICAgICAvLyBzZXQgZmlyc3RSdW49ZmFsc2UgdG8gc3RhcnQgd2l0aCBhIGJsYW5rIHByZXZpZXcuXG4gICAgICAvLyBydW4gdGhlIHJlYWwgY29udGVudCBvbmx5IGFmdGVyIHRoZSBmaXJzdCBSdW4gYnV0dG9uIHByZXNzLlxuICAgICAgaWYgKG9wdGlvbnMuZmlyc3RSdW4gPT09IGZhbHNlKSB7XG4gICAgICAgIGNhY2hlID0ge1xuICAgICAgICAgIGh0bWw6IHtcbiAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgIHR5cGU6ICdjc3MnLFxuICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICB9LFxuICAgICAgICAgIGpzOiB7XG4gICAgICAgICAgICB0eXBlOiAnanMnLFxuICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIHJ1biBidXR0b25cbiAgICAgIHZhciAkYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAkYnV0dG9uLmNsYXNzTmFtZSA9ICdqb3R0ZWQtYnV0dG9uIGpvdHRlZC1idXR0b24tcGxheSc7XG4gICAgICAkYnV0dG9uLmlubmVySFRNTCA9ICdSdW4nO1xuXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCgkYnV0dG9uKTtcbiAgICAgICRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnJ1bi5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY2FwdHVyZSB0aGUgY29kZSBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG5cbiAgICAgIC8vIHB1YmxpY1xuICAgICAgdGhpcy5jYWNoZSA9IGNhY2hlO1xuICAgICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgIHRoaXMuam90dGVkID0gam90dGVkO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblBsYXksIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIGFsd2F5cyBjYWNoZSB0aGUgbGF0ZXN0IGNvZGVcbiAgICAgICAgdGhpcy5jb2RlW3BhcmFtcy50eXBlXSA9IGV4dGVuZChwYXJhbXMpO1xuXG4gICAgICAgIC8vIHJlcGxhY2UgdGhlIHBhcmFtcyB3aXRoIHRoZSBsYXRlc3QgY2FjaGVcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXSk7XG5cbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgY2FjaGUgZm9yY2VSZW5kZXIsXG4gICAgICAgICAgLy8gYW5kIHNlbmQgaXQgd2l0aCBlYWNoIGNoYW5nZS5cbiAgICAgICAgICB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXS5mb3JjZVJlbmRlciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2FjaGUgdGhlIGZpcnN0IHJ1blxuICAgICAgICAgIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdID0gZXh0ZW5kKHBhcmFtcyk7XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncnVuJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBydW4oKSB7XG4gICAgICAgIC8vIHRyaWdnZXIgY2hhbmdlIG9uIGVhY2ggdHlwZSB3aXRoIHRoZSBsYXRlc3QgY29kZVxuICAgICAgICBmb3IgKHZhciB0eXBlIGluIHRoaXMuY29kZSkge1xuICAgICAgICAgIHRoaXMuY2FjaGVbdHlwZV0gPSBleHRlbmQodGhpcy5jb2RlW3R5cGVdLCB7XG4gICAgICAgICAgICAvLyBmb3JjZSByZW5kZXJpbmcgb24gZWFjaCBSdW4gcHJlc3NcbiAgICAgICAgICAgIGZvcmNlUmVuZGVyOiB0cnVlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBjaGFuZ2VcbiAgICAgICAgICB0aGlzLmpvdHRlZC50cmlnZ2VyKCdjaGFuZ2UnLCB0aGlzLmNhY2hlW3R5cGVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luUGxheTtcbiAgfSgpO1xuXG4gIC8qIGJ1bmRsZSBwbHVnaW5zXG4gICAqL1xuXG4gIC8vIHJlZ2lzdGVyIGJ1bmRsZWQgcGx1Z2luc1xuICBmdW5jdGlvbiBCdW5kbGVQbHVnaW5zKGpvdHRlZCkge1xuICAgIGpvdHRlZC5wbHVnaW4oJ3JlbmRlcicsIFBsdWdpblJlbmRlcik7XG4gICAgam90dGVkLnBsdWdpbignc2NyaXB0bGVzcycsIFBsdWdpblNjcmlwdGxlc3MpO1xuXG4gICAgam90dGVkLnBsdWdpbignYWNlJywgUGx1Z2luQWNlKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdjb2RlbWlycm9yJywgUGx1Z2luQ29kZU1pcnJvcik7XG4gICAgam90dGVkLnBsdWdpbignbGVzcycsIFBsdWdpbkxlc3MpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2NvZmZlZXNjcmlwdCcsIFBsdWdpbkNvZmZlZVNjcmlwdCk7XG4gICAgam90dGVkLnBsdWdpbignc3R5bHVzJywgUGx1Z2luU3R5bHVzKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdiYWJlbCcsIFBsdWdpbkJhYmVsKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdtYXJrZG93bicsIFBsdWdpbk1hcmtkb3duKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdjb25zb2xlJywgUGx1Z2luQ29uc29sZSk7XG4gICAgam90dGVkLnBsdWdpbigncGxheScsIFBsdWdpblBsYXkpO1xuICB9XG5cbiAgLyogam90dGVkXG4gICAqL1xuXG4gIHZhciBKb3R0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSm90dGVkKCRqb3R0ZWRDb250YWluZXIsIG9wdHMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIEpvdHRlZCk7XG5cbiAgICAgIGlmICghJGpvdHRlZENvbnRhaW5lcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3QgZmluZCBKb3R0ZWQgY29udGFpbmVyLicpO1xuICAgICAgfVxuXG4gICAgICAvLyBwcml2YXRlIGRhdGFcbiAgICAgIHZhciBfcHJpdmF0ZSA9IHt9O1xuICAgICAgdGhpcy5fZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gX3ByaXZhdGVba2V5XTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBfcHJpdmF0ZVtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBfcHJpdmF0ZVtrZXldO1xuICAgICAgfTtcblxuICAgICAgLy8gb3B0aW9uc1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9zZXQoJ29wdGlvbnMnLCBleHRlbmQob3B0cywge1xuICAgICAgICBmaWxlczogW10sXG4gICAgICAgIHNob3dCbGFuazogZmFsc2UsXG4gICAgICAgIHJ1blNjcmlwdHM6IHRydWUsXG4gICAgICAgIHBhbmU6ICdyZXN1bHQnLFxuICAgICAgICBkZWJvdW5jZTogMjUwLFxuICAgICAgICBwbHVnaW5zOiBbXVxuICAgICAgfSkpO1xuXG4gICAgICAvLyB0aGUgcmVuZGVyIHBsdWdpbiBpcyBtYW5kYXRvcnlcbiAgICAgIG9wdGlvbnMucGx1Z2lucy5wdXNoKCdyZW5kZXInKTtcblxuICAgICAgLy8gdXNlIHRoZSBzY3JpcHRsZXNzIHBsdWdpbiBpZiBydW5TY3JpcHRzIGlzIGZhbHNlXG4gICAgICBpZiAob3B0aW9ucy5ydW5TY3JpcHRzID09PSBmYWxzZSkge1xuICAgICAgICBvcHRpb25zLnBsdWdpbnMucHVzaCgnc2NyaXB0bGVzcycpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYWNoZWQgY29udGVudCBmb3IgdGhlIGNoYW5nZSBtZXRob2QuXG4gICAgICB0aGlzLl9zZXQoJ2NhY2hlZENvbnRlbnQnLCB7XG4gICAgICAgIGh0bWw6IG51bGwsXG4gICAgICAgIGNzczogbnVsbCxcbiAgICAgICAganM6IG51bGxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBQdWJTb3VwXG4gICAgICB2YXIgcHVic291cCA9IHRoaXMuX3NldCgncHVic291cCcsIG5ldyBQdWJTb3VwKCkpO1xuXG4gICAgICB0aGlzLl9zZXQoJ3RyaWdnZXInLCB0aGlzLnRyaWdnZXIoKSk7XG4gICAgICB0aGlzLl9zZXQoJ29uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwdWJzb3VwLnN1YnNjcmliZS5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ29mZicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHVic291cC51bnN1YnNjcmliZS5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICB2YXIgZG9uZSA9IHRoaXMuX3NldCgnZG9uZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHVic291cC5kb25lLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gYWZ0ZXIgYWxsIHBsdWdpbnMgcnVuXG4gICAgICAvLyBzaG93IGVycm9yc1xuICAgICAgZG9uZSgnY2hhbmdlJywgdGhpcy5lcnJvcnMuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIERPTVxuICAgICAgdmFyICRjb250YWluZXIgPSB0aGlzLl9zZXQoJyRjb250YWluZXInLCAkam90dGVkQ29udGFpbmVyKTtcbiAgICAgICRjb250YWluZXIuaW5uZXJIVE1MID0gY29udGFpbmVyKCk7XG4gICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBjb250YWluZXJDbGFzcygpKTtcblxuICAgICAgLy8gZGVmYXVsdCBwYW5lXG4gICAgICB2YXIgcGFuZUFjdGl2ZSA9IHRoaXMuX3NldCgncGFuZUFjdGl2ZScsIG9wdGlvbnMucGFuZSk7XG4gICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBwYW5lQWN0aXZlQ2xhc3MocGFuZUFjdGl2ZSkpO1xuXG4gICAgICAvLyBzdGF0dXMgbm9kZXNcbiAgICAgIHRoaXMuX3NldCgnJHN0YXR1cycsIHt9KTtcblxuICAgICAgdmFyIF9hcnIgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJ107XG4gICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgX2Fyci5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIF90eXBlID0gX2FycltfaV07XG4gICAgICAgIHRoaXMubWFya3VwKF90eXBlKTtcbiAgICAgIH1cblxuICAgICAgLy8gdGV4dGFyZWEgY2hhbmdlIGV2ZW50cy5cbiAgICAgICRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBkZWJvdW5jZSh0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBvcHRpb25zLmRlYm91bmNlKSk7XG4gICAgICAkY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGRlYm91bmNlKHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIG9wdGlvbnMuZGVib3VuY2UpKTtcblxuICAgICAgLy8gcGFuZSBjaGFuZ2VcbiAgICAgICRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnBhbmUuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGV4cG9zZSBwdWJsaWMgcHJvcGVydGllc1xuICAgICAgdGhpcy4kY29udGFpbmVyID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJyk7XG4gICAgICB0aGlzLm9uID0gdGhpcy5fZ2V0KCdvbicpO1xuICAgICAgdGhpcy5vZmYgPSB0aGlzLl9nZXQoJ29mZicpO1xuICAgICAgdGhpcy5kb25lID0gdGhpcy5fZ2V0KCdkb25lJyk7XG4gICAgICB0aGlzLnRyaWdnZXIgPSB0aGlzLl9nZXQoJ3RyaWdnZXInKTtcbiAgICAgIHRoaXMucGFuZUFjdGl2ZSA9IHRoaXMuX2dldCgncGFuZUFjdGl2ZScpO1xuXG4gICAgICAvLyBpbml0IHBsdWdpbnNcbiAgICAgIHRoaXMuX3NldCgncGx1Z2lucycsIHt9KTtcbiAgICAgIGluaXQuY2FsbCh0aGlzKTtcblxuICAgICAgLy8gbG9hZCBmaWxlc1xuICAgICAgdmFyIF9hcnIyID0gWydodG1sJywgJ2NzcycsICdqcyddO1xuICAgICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgX2FycjIubGVuZ3RoOyBfaTIrKykge1xuICAgICAgICB2YXIgX3R5cGUyID0gX2FycjJbX2kyXTtcbiAgICAgICAgdGhpcy5sb2FkKF90eXBlMik7XG4gICAgICB9XG5cbiAgICAgIC8vIHNob3cgYWxsIHRhYnMsIGV2ZW4gaWYgZW1wdHlcbiAgICAgIGlmIChvcHRpb25zLnNob3dCbGFuaykge1xuICAgICAgICB2YXIgX2FycjMgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJ107XG5cbiAgICAgICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgX2FycjMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICAgIHZhciB0eXBlID0gX2FycjNbX2kzXTtcbiAgICAgICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBoYXNGaWxlQ2xhc3ModHlwZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoSm90dGVkLCBbe1xuICAgICAga2V5OiAnZmluZEZpbGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRGaWxlKHR5cGUpIHtcbiAgICAgICAgdmFyIGZpbGUgPSB7fTtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9nZXQoJ29wdGlvbnMnKTtcblxuICAgICAgICBmb3IgKHZhciBmaWxlSW5kZXggaW4gb3B0aW9ucy5maWxlcykge1xuICAgICAgICAgIHZhciBfZmlsZSA9IG9wdGlvbnMuZmlsZXNbZmlsZUluZGV4XTtcbiAgICAgICAgICBpZiAoX2ZpbGUudHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9maWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ21hcmt1cCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbWFya3VwKHR5cGUpIHtcbiAgICAgICAgdmFyICRjb250YWluZXIgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKTtcbiAgICAgICAgdmFyICRwYXJlbnQgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS0nICsgdHlwZSk7XG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgbWFya3VwIGZvciBhbiBlZGl0b3JcbiAgICAgICAgdmFyIGZpbGUgPSB0aGlzLmZpbmRGaWxlKHR5cGUpO1xuXG4gICAgICAgIHZhciAkZWRpdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICRlZGl0b3IuaW5uZXJIVE1MID0gZWRpdG9yQ29udGVudCh0eXBlLCBmaWxlLnVybCk7XG4gICAgICAgICRlZGl0b3IuY2xhc3NOYW1lID0gZWRpdG9yQ2xhc3ModHlwZSk7XG5cbiAgICAgICAgJHBhcmVudC5hcHBlbmRDaGlsZCgkZWRpdG9yKTtcblxuICAgICAgICAvLyBnZXQgdGhlIHN0YXR1cyBub2RlXG4gICAgICAgIHRoaXMuX2dldCgnJHN0YXR1cycpW3R5cGVdID0gJHBhcmVudC5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXN0YXR1cycpO1xuXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBmaWxlIGZvciB0aGUgY3VycmVudCB0eXBlXG4gICAgICAgIGlmICh0eXBlb2YgZmlsZS51cmwgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBmaWxlLmNvbnRlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gYWRkIHRoZSBoYXMtdHlwZSBjbGFzcyB0byB0aGUgY29udGFpbmVyXG4gICAgICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgaGFzRmlsZUNsYXNzKHR5cGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQodHlwZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgbWFya3VwIGZvciBhbiBlZGl0b3JcbiAgICAgICAgdmFyIGZpbGUgPSB0aGlzLmZpbmRGaWxlKHR5cGUpO1xuICAgICAgICB2YXIgJHRleHRhcmVhID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJykucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLScgKyB0eXBlICsgJyB0ZXh0YXJlYScpO1xuXG4gICAgICAgIC8vIGZpbGUgYXMgc3RyaW5nXG4gICAgICAgIGlmICh0eXBlb2YgZmlsZS5jb250ZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoJHRleHRhcmVhLCBmaWxlLmNvbnRlbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWxlLnVybCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBzaG93IGxvYWRpbmcgbWVzc2FnZVxuICAgICAgICAgIHRoaXMuc3RhdHVzKCdsb2FkaW5nJywgW3N0YXR1c0xvYWRpbmcoZmlsZS51cmwpXSwge1xuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGZpbGUgYXMgdXJsXG4gICAgICAgICAgZmV0Y2goZmlsZS51cmwsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAvLyBzaG93IGxvYWQgZXJyb3JzXG4gICAgICAgICAgICAgIF90aGlzLnN0YXR1cygnZXJyb3InLCBbc3RhdHVzRmV0Y2hFcnJvcihlcnIpXSwge1xuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjbGVhciB0aGUgbG9hZGluZyBzdGF0dXNcbiAgICAgICAgICAgIF90aGlzLmNsZWFyU3RhdHVzKCdsb2FkaW5nJywge1xuICAgICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgX3RoaXMuc2V0VmFsdWUoJHRleHRhcmVhLCByZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRyaWdnZXIgYSBjaGFuZ2UgZXZlbnQgb24gYmxhbmsgZWRpdG9ycyxcbiAgICAgICAgICAvLyBmb3IgZWRpdG9yIHBsdWdpbnMgdG8gY2F0Y2guXG4gICAgICAgICAgLy8gKGVnLiB0aGUgY29kZW1pcnJvciBhbmQgYWNlIHBsdWdpbnMgYXR0YWNoIHRoZSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICAvLyBvbmx5IGFmdGVyIHRoZSBpbml0aWFsIGNoYW5nZS9sb2FkIGV2ZW50KVxuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoJHRleHRhcmVhLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzZXRWYWx1ZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VmFsdWUoJHRleHRhcmVhLCB2YWwpIHtcbiAgICAgICAgJHRleHRhcmVhLnZhbHVlID0gdmFsO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgY2hhbmdlIGV2ZW50LCBmb3IgaW5pdGlhbCByZW5kZXJcbiAgICAgICAgdGhpcy5jaGFuZ2Uoe1xuICAgICAgICAgIHRhcmdldDogJHRleHRhcmVhXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKGUpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBkYXRhKGUudGFyZ2V0LCAnam90dGVkLXR5cGUnKTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uJ3QgdHJpZ2dlciBjaGFuZ2UgaWYgdGhlIGNvbnRlbnQgaGFzbid0IGNoYW5nZWQuXG4gICAgICAgIC8vIGVnLiB3aGVuIGJsdXJyaW5nIHRoZSB0ZXh0YXJlYS5cbiAgICAgICAgdmFyIGNhY2hlZENvbnRlbnQgPSB0aGlzLl9nZXQoJ2NhY2hlZENvbnRlbnQnKTtcbiAgICAgICAgaWYgKGNhY2hlZENvbnRlbnRbdHlwZV0gPT09IGUudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FjaGUgbGF0ZXN0IGNvbnRlbnRcbiAgICAgICAgY2FjaGVkQ29udGVudFt0eXBlXSA9IGUudGFyZ2V0LnZhbHVlO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgdGhlIGNoYW5nZSBldmVudFxuICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIGZpbGU6IGRhdGEoZS50YXJnZXQsICdqb3R0ZWQtZmlsZScpLFxuICAgICAgICAgIGNvbnRlbnQ6IGNhY2hlZENvbnRlbnRbdHlwZV1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnZXJyb3JzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlcnJvcnMoZXJycywgcGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc3RhdHVzKCdlcnJvcicsIGVycnMsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncGFuZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcGFuZShlKSB7XG4gICAgICAgIGlmICghZGF0YShlLnRhcmdldCwgJ2pvdHRlZC10eXBlJykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJGNvbnRhaW5lciA9IHRoaXMuX2dldCgnJGNvbnRhaW5lcicpO1xuICAgICAgICB2YXIgcGFuZUFjdGl2ZSA9IHRoaXMuX2dldCgncGFuZUFjdGl2ZScpO1xuICAgICAgICByZW1vdmVDbGFzcygkY29udGFpbmVyLCBwYW5lQWN0aXZlQ2xhc3MocGFuZUFjdGl2ZSkpO1xuXG4gICAgICAgIHBhbmVBY3RpdmUgPSB0aGlzLl9zZXQoJ3BhbmVBY3RpdmUnLCBkYXRhKGUudGFyZ2V0LCAnam90dGVkLXR5cGUnKSk7XG4gICAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIHBhbmVBY3RpdmVDbGFzcyhwYW5lQWN0aXZlKSk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3N0YXR1cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc3RhdHVzKCkge1xuICAgICAgICB2YXIgc3RhdHVzVHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ2Vycm9yJztcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBbXTtcbiAgICAgICAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgICAgICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhclN0YXR1cyhzdGF0dXNUeXBlLCBwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRzdGF0dXMgPSB0aGlzLl9nZXQoJyRzdGF0dXMnKTtcblxuICAgICAgICAvLyBhZGQgZXJyb3IvbG9hZGluZyBjbGFzcyB0byBzdGF0dXNcbiAgICAgICAgYWRkQ2xhc3MoJHN0YXR1c1twYXJhbXMudHlwZV0sIHN0YXR1c0NsYXNzKHN0YXR1c1R5cGUpKTtcblxuICAgICAgICBhZGRDbGFzcyh0aGlzLl9nZXQoJyRjb250YWluZXInKSwgc3RhdHVzQWN0aXZlQ2xhc3MocGFyYW1zLnR5cGUpKTtcblxuICAgICAgICB2YXIgbWFya3VwID0gJyc7XG4gICAgICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIG1hcmt1cCArPSBzdGF0dXNNZXNzYWdlKGVycik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzdGF0dXNbcGFyYW1zLnR5cGVdLmlubmVySFRNTCA9IG1hcmt1cDtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjbGVhclN0YXR1cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJTdGF0dXMoc3RhdHVzVHlwZSwgcGFyYW1zKSB7XG4gICAgICAgIHZhciAkc3RhdHVzID0gdGhpcy5fZ2V0KCckc3RhdHVzJyk7XG5cbiAgICAgICAgcmVtb3ZlQ2xhc3MoJHN0YXR1c1twYXJhbXMudHlwZV0sIHN0YXR1c0NsYXNzKHN0YXR1c1R5cGUpKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5fZ2V0KCckY29udGFpbmVyJyksIHN0YXR1c0FjdGl2ZUNsYXNzKHBhcmFtcy50eXBlKSk7XG4gICAgICAgICRzdGF0dXNbcGFyYW1zLnR5cGVdLmlubmVySFRNTCA9ICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWJvdW5jZWQgdHJpZ2dlciBtZXRob2RcbiAgICAgIC8vIGN1c3RvbSBkZWJvdW5jZXIgdG8gdXNlIGEgZGlmZmVyZW50IHRpbWVyIHBlciB0eXBlXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd0cmlnZ2VyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB0cmlnZ2VyKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX2dldCgnb3B0aW9ucycpO1xuICAgICAgICB2YXIgcHVic291cCA9IHRoaXMuX2dldCgncHVic291cCcpO1xuXG4gICAgICAgIC8vIGFsbG93IGRpc2FibGluZyB0aGUgdHJpZ2dlciBkZWJvdW5jZXIuXG4gICAgICAgIC8vIG1vc3RseSBmb3IgdGVzdGluZzogd2hlbiB0cmlnZ2VyIGV2ZW50cyBoYXBwZW4gcmFwaWRseVxuICAgICAgICAvLyBtdWx0aXBsZSBldmVudHMgb2YgdGhlIHNhbWUgdHlwZSB3b3VsZCBiZSBjYXVnaHQgb25jZS5cbiAgICAgICAgaWYgKG9wdGlvbnMuZGVib3VuY2UgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHB1YnNvdXAucHVibGlzaC5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb29sZG93biB0aW1lclxuICAgICAgICB2YXIgY29vbGRvd24gPSB7fTtcbiAgICAgICAgLy8gbXVsdGlwbGUgY2FsbHNcbiAgICAgICAgdmFyIG11bHRpcGxlID0ge307XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0b3BpYykge1xuICAgICAgICAgIHZhciBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG4gICAgICAgICAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgICAgICAgdmFyIF9yZWYkdHlwZSA9IF9yZWYudHlwZTtcbiAgICAgICAgICB2YXIgdHlwZSA9IF9yZWYkdHlwZSA9PT0gdW5kZWZpbmVkID8gJ2RlZmF1bHQnIDogX3JlZiR0eXBlO1xuXG4gICAgICAgICAgaWYgKGNvb2xkb3duW3R5cGVdKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYWQgbXVsdGlwbGUgY2FsbHMgYmVmb3JlIHRoZSBjb29sZG93blxuICAgICAgICAgICAgbXVsdGlwbGVbdHlwZV0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0cmlnZ2VyIGltbWVkaWF0ZWx5IG9uY2UgY29vbGRvd24gaXMgb3ZlclxuICAgICAgICAgICAgcHVic291cC5wdWJsaXNoLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNvb2xkb3duW3R5cGVdKTtcblxuICAgICAgICAgIC8vIHNldCBjb29sZG93biB0aW1lclxuICAgICAgICAgIGNvb2xkb3duW3R5cGVdID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYWQgbXVsdGlwbGUgY2FsbHMgYmVmb3JlIHRoZSBjb29sZG93bixcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIGFnYWluIGF0IHRoZSBlbmQuXG4gICAgICAgICAgICBpZiAobXVsdGlwbGVbdHlwZV0pIHtcbiAgICAgICAgICAgICAgcHVic291cC5wdWJsaXNoLmFwcGx5KHB1YnNvdXAsIF9hcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtdWx0aXBsZVt0eXBlXSA9IG51bGw7XG4gICAgICAgICAgICBjb29sZG93blt0eXBlXSA9IG51bGw7XG4gICAgICAgICAgfSwgb3B0aW9ucy5kZWJvdW5jZSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBKb3R0ZWQ7XG4gIH0oKTtcblxuICAvLyByZWdpc3RlciBwbHVnaW5zXG5cblxuICBKb3R0ZWQucGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZWdpc3Rlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIHJlZ2lzdGVyIGJ1bmRsZWQgcGx1Z2luc1xuICBCdW5kbGVQbHVnaW5zKEpvdHRlZCk7XG5cbiAgcmV0dXJuIEpvdHRlZDtcblxufSkpKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9am90dGVkLmpzLm1hcCIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBQaWVyb3h5IDxwaWVyb3h5QHBpZXJveHkubmV0PlxuLy8gVGhpcyB3b3JrIGlzIGZyZWUuIFlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXRcbi8vIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgV1RGUEwsIFZlcnNpb24gMlxuLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlIExJQ0VOU0UudHh0IG9yIGh0dHA6Ly93d3cud3RmcGwubmV0L1xuLy9cbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uLCB0aGUgaG9tZSBwYWdlOlxuLy8gaHR0cDovL3BpZXJveHkubmV0L2Jsb2cvcGFnZXMvbHotc3RyaW5nL3Rlc3RpbmcuaHRtbFxuLy9cbi8vIExaLWJhc2VkIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgdmVyc2lvbiAxLjQuNFxudmFyIExaU3RyaW5nID0gKGZ1bmN0aW9uKCkge1xuXG4vLyBwcml2YXRlIHByb3BlcnR5XG52YXIgZiA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG52YXIga2V5U3RyQmFzZTY0ID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO1xudmFyIGtleVN0clVyaVNhZmUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky0kXCI7XG52YXIgYmFzZVJldmVyc2VEaWMgPSB7fTtcblxuZnVuY3Rpb24gZ2V0QmFzZVZhbHVlKGFscGhhYmV0LCBjaGFyYWN0ZXIpIHtcbiAgaWYgKCFiYXNlUmV2ZXJzZURpY1thbHBoYWJldF0pIHtcbiAgICBiYXNlUmV2ZXJzZURpY1thbHBoYWJldF0gPSB7fTtcbiAgICBmb3IgKHZhciBpPTAgOyBpPGFscGhhYmV0Lmxlbmd0aCA7IGkrKykge1xuICAgICAgYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdW2FscGhhYmV0LmNoYXJBdChpKV0gPSBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdW2NoYXJhY3Rlcl07XG59XG5cbnZhciBMWlN0cmluZyA9IHtcbiAgY29tcHJlc3NUb0Jhc2U2NCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICB2YXIgcmVzID0gTFpTdHJpbmcuX2NvbXByZXNzKGlucHV0LCA2LCBmdW5jdGlvbihhKXtyZXR1cm4ga2V5U3RyQmFzZTY0LmNoYXJBdChhKTt9KTtcbiAgICBzd2l0Y2ggKHJlcy5sZW5ndGggJSA0KSB7IC8vIFRvIHByb2R1Y2UgdmFsaWQgQmFzZTY0XG4gICAgZGVmYXVsdDogLy8gV2hlbiBjb3VsZCB0aGlzIGhhcHBlbiA/XG4gICAgY2FzZSAwIDogcmV0dXJuIHJlcztcbiAgICBjYXNlIDEgOiByZXR1cm4gcmVzK1wiPT09XCI7XG4gICAgY2FzZSAyIDogcmV0dXJuIHJlcytcIj09XCI7XG4gICAgY2FzZSAzIDogcmV0dXJuIHJlcytcIj1cIjtcbiAgICB9XG4gIH0sXG5cbiAgZGVjb21wcmVzc0Zyb21CYXNlNjQgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGlucHV0ID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhpbnB1dC5sZW5ndGgsIDMyLCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gZ2V0QmFzZVZhbHVlKGtleVN0ckJhc2U2NCwgaW5wdXQuY2hhckF0KGluZGV4KSk7IH0pO1xuICB9LFxuXG4gIGNvbXByZXNzVG9VVEYxNiA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKGlucHV0LCAxNSwgZnVuY3Rpb24oYSl7cmV0dXJuIGYoYSszMik7fSkgKyBcIiBcIjtcbiAgfSxcblxuICBkZWNvbXByZXNzRnJvbVVURjE2OiBmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgIGlmIChjb21wcmVzc2VkID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChjb21wcmVzc2VkID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhjb21wcmVzc2VkLmxlbmd0aCwgMTYzODQsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBjb21wcmVzc2VkLmNoYXJDb2RlQXQoaW5kZXgpIC0gMzI7IH0pO1xuICB9LFxuXG4gIC8vY29tcHJlc3MgaW50byB1aW50OGFycmF5IChVQ1MtMiBiaWcgZW5kaWFuIGZvcm1hdClcbiAgY29tcHJlc3NUb1VpbnQ4QXJyYXk6IGZ1bmN0aW9uICh1bmNvbXByZXNzZWQpIHtcbiAgICB2YXIgY29tcHJlc3NlZCA9IExaU3RyaW5nLmNvbXByZXNzKHVuY29tcHJlc3NlZCk7XG4gICAgdmFyIGJ1Zj1uZXcgVWludDhBcnJheShjb21wcmVzc2VkLmxlbmd0aCoyKTsgLy8gMiBieXRlcyBwZXIgY2hhcmFjdGVyXG5cbiAgICBmb3IgKHZhciBpPTAsIFRvdGFsTGVuPWNvbXByZXNzZWQubGVuZ3RoOyBpPFRvdGFsTGVuOyBpKyspIHtcbiAgICAgIHZhciBjdXJyZW50X3ZhbHVlID0gY29tcHJlc3NlZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgYnVmW2kqMl0gPSBjdXJyZW50X3ZhbHVlID4+PiA4O1xuICAgICAgYnVmW2kqMisxXSA9IGN1cnJlbnRfdmFsdWUgJSAyNTY7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG5cbiAgLy9kZWNvbXByZXNzIGZyb20gdWludDhhcnJheSAoVUNTLTIgYmlnIGVuZGlhbiBmb3JtYXQpXG4gIGRlY29tcHJlc3NGcm9tVWludDhBcnJheTpmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgIGlmIChjb21wcmVzc2VkPT09bnVsbCB8fCBjb21wcmVzc2VkPT09dW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuIExaU3RyaW5nLmRlY29tcHJlc3MoY29tcHJlc3NlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJ1Zj1uZXcgQXJyYXkoY29tcHJlc3NlZC5sZW5ndGgvMik7IC8vIDIgYnl0ZXMgcGVyIGNoYXJhY3RlclxuICAgICAgICBmb3IgKHZhciBpPTAsIFRvdGFsTGVuPWJ1Zi5sZW5ndGg7IGk8VG90YWxMZW47IGkrKykge1xuICAgICAgICAgIGJ1ZltpXT1jb21wcmVzc2VkW2kqMl0qMjU2K2NvbXByZXNzZWRbaSoyKzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBidWYuZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGYoYykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIExaU3RyaW5nLmRlY29tcHJlc3MocmVzdWx0LmpvaW4oJycpKTtcblxuICAgIH1cblxuICB9LFxuXG5cbiAgLy9jb21wcmVzcyBpbnRvIGEgc3RyaW5nIHRoYXQgaXMgYWxyZWFkeSBVUkkgZW5jb2RlZFxuICBjb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBMWlN0cmluZy5fY29tcHJlc3MoaW5wdXQsIDYsIGZ1bmN0aW9uKGEpe3JldHVybiBrZXlTdHJVcmlTYWZlLmNoYXJBdChhKTt9KTtcbiAgfSxcblxuICAvL2RlY29tcHJlc3MgZnJvbSBhbiBvdXRwdXQgb2YgY29tcHJlc3NUb0VuY29kZWRVUklDb21wb25lbnRcbiAgZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50OmZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoaW5wdXQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC8gL2csIFwiK1wiKTtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoaW5wdXQubGVuZ3RoLCAzMiwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGdldEJhc2VWYWx1ZShrZXlTdHJVcmlTYWZlLCBpbnB1dC5jaGFyQXQoaW5kZXgpKTsgfSk7XG4gIH0sXG5cbiAgY29tcHJlc3M6IGZ1bmN0aW9uICh1bmNvbXByZXNzZWQpIHtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKHVuY29tcHJlc3NlZCwgMTYsIGZ1bmN0aW9uKGEpe3JldHVybiBmKGEpO30pO1xuICB9LFxuICBfY29tcHJlc3M6IGZ1bmN0aW9uICh1bmNvbXByZXNzZWQsIGJpdHNQZXJDaGFyLCBnZXRDaGFyRnJvbUludCkge1xuICAgIGlmICh1bmNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgdmFyIGksIHZhbHVlLFxuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnk9IHt9LFxuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZT0ge30sXG4gICAgICAgIGNvbnRleHRfYz1cIlwiLFxuICAgICAgICBjb250ZXh0X3djPVwiXCIsXG4gICAgICAgIGNvbnRleHRfdz1cIlwiLFxuICAgICAgICBjb250ZXh0X2VubGFyZ2VJbj0gMiwgLy8gQ29tcGVuc2F0ZSBmb3IgdGhlIGZpcnN0IGVudHJ5IHdoaWNoIHNob3VsZCBub3QgY291bnRcbiAgICAgICAgY29udGV4dF9kaWN0U2l6ZT0gMyxcbiAgICAgICAgY29udGV4dF9udW1CaXRzPSAyLFxuICAgICAgICBjb250ZXh0X2RhdGE9W10sXG4gICAgICAgIGNvbnRleHRfZGF0YV92YWw9MCxcbiAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uPTAsXG4gICAgICAgIGlpO1xuXG4gICAgZm9yIChpaSA9IDA7IGlpIDwgdW5jb21wcmVzc2VkLmxlbmd0aDsgaWkgKz0gMSkge1xuICAgICAgY29udGV4dF9jID0gdW5jb21wcmVzc2VkLmNoYXJBdChpaSk7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnksY29udGV4dF9jKSkge1xuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF9jXSA9IGNvbnRleHRfZGljdFNpemUrKztcbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGVbY29udGV4dF9jXSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHRfd2MgPSBjb250ZXh0X3cgKyBjb250ZXh0X2M7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeSxjb250ZXh0X3djKSkge1xuICAgICAgICBjb250ZXh0X3cgPSBjb250ZXh0X3djO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZSxjb250ZXh0X3cpKSB7XG4gICAgICAgICAgaWYgKGNvbnRleHRfdy5jaGFyQ29kZUF0KDApPDI1Nikge1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPDggOyBpKyspIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gMTtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgdmFsdWU7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT1iaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSBjb250ZXh0X3cuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTwxNiA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZVtjb250ZXh0X3ddO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd107XG4gICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICB9XG5cblxuICAgICAgICB9XG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCB3YyB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd2NdID0gY29udGV4dF9kaWN0U2l6ZSsrO1xuICAgICAgICBjb250ZXh0X3cgPSBTdHJpbmcoY29udGV4dF9jKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPdXRwdXQgdGhlIGNvZGUgZm9yIHcuXG4gICAgaWYgKGNvbnRleHRfdyAhPT0gXCJcIikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZSxjb250ZXh0X3cpKSB7XG4gICAgICAgIGlmIChjb250ZXh0X3cuY2hhckNvZGVBdCgwKTwyNTYpIHtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgIGZvciAoaT0wIDsgaTw4IDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IDE7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgIGZvciAoaT0wIDsgaTwxNiA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlW2NvbnRleHRfd107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGNvbnRleHRfZGljdGlvbmFyeVtjb250ZXh0X3ddO1xuICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICB9XG5cblxuICAgICAgfVxuICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluID0gTWF0aC5wb3coMiwgY29udGV4dF9udW1CaXRzKTtcbiAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFyayB0aGUgZW5kIG9mIHRoZSBzdHJlYW1cbiAgICB2YWx1ZSA9IDI7XG4gICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaCB0aGUgbGFzdCBjaGFyXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZWxzZSBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHRfZGF0YS5qb2luKCcnKTtcbiAgfSxcblxuICBkZWNvbXByZXNzOiBmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgIGlmIChjb21wcmVzc2VkID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChjb21wcmVzc2VkID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhjb21wcmVzc2VkLmxlbmd0aCwgMzI3NjgsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBjb21wcmVzc2VkLmNoYXJDb2RlQXQoaW5kZXgpOyB9KTtcbiAgfSxcblxuICBfZGVjb21wcmVzczogZnVuY3Rpb24gKGxlbmd0aCwgcmVzZXRWYWx1ZSwgZ2V0TmV4dFZhbHVlKSB7XG4gICAgdmFyIGRpY3Rpb25hcnkgPSBbXSxcbiAgICAgICAgbmV4dCxcbiAgICAgICAgZW5sYXJnZUluID0gNCxcbiAgICAgICAgZGljdFNpemUgPSA0LFxuICAgICAgICBudW1CaXRzID0gMyxcbiAgICAgICAgZW50cnkgPSBcIlwiLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgaSxcbiAgICAgICAgdyxcbiAgICAgICAgYml0cywgcmVzYiwgbWF4cG93ZXIsIHBvd2VyLFxuICAgICAgICBjLFxuICAgICAgICBkYXRhID0ge3ZhbDpnZXROZXh0VmFsdWUoMCksIHBvc2l0aW9uOnJlc2V0VmFsdWUsIGluZGV4OjF9O1xuXG4gICAgZm9yIChpID0gMDsgaSA8IDM7IGkgKz0gMSkge1xuICAgICAgZGljdGlvbmFyeVtpXSA9IGk7XG4gICAgfVxuXG4gICAgYml0cyA9IDA7XG4gICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDIpO1xuICAgIHBvd2VyPTE7XG4gICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgfVxuICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICBwb3dlciA8PD0gMTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKG5leHQgPSBiaXRzKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDgpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIGMgPSBmKGJpdHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMTYpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIGMgPSBmKGJpdHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGRpY3Rpb25hcnlbM10gPSBjO1xuICAgIHcgPSBjO1xuICAgIHJlc3VsdC5wdXNoKGMpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoZGF0YS5pbmRleCA+IGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgIH1cblxuICAgICAgYml0cyA9IDA7XG4gICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsbnVtQml0cyk7XG4gICAgICBwb3dlcj0xO1xuICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgfVxuICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAoYyA9IGJpdHMpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiw4KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGljdGlvbmFyeVtkaWN0U2l6ZSsrXSA9IGYoYml0cyk7XG4gICAgICAgICAgYyA9IGRpY3RTaXplLTE7XG4gICAgICAgICAgZW5sYXJnZUluLS07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMTYpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGljdGlvbmFyeVtkaWN0U2l6ZSsrXSA9IGYoYml0cyk7XG4gICAgICAgICAgYyA9IGRpY3RTaXplLTE7XG4gICAgICAgICAgZW5sYXJnZUluLS07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgZW5sYXJnZUluID0gTWF0aC5wb3coMiwgbnVtQml0cyk7XG4gICAgICAgIG51bUJpdHMrKztcbiAgICAgIH1cblxuICAgICAgaWYgKGRpY3Rpb25hcnlbY10pIHtcbiAgICAgICAgZW50cnkgPSBkaWN0aW9uYXJ5W2NdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGMgPT09IGRpY3RTaXplKSB7XG4gICAgICAgICAgZW50cnkgPSB3ICsgdy5jaGFyQXQoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKGVudHJ5KTtcblxuICAgICAgLy8gQWRkIHcrZW50cnlbMF0gdG8gdGhlIGRpY3Rpb25hcnkuXG4gICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gdyArIGVudHJ5LmNoYXJBdCgwKTtcbiAgICAgIGVubGFyZ2VJbi0tO1xuXG4gICAgICB3ID0gZW50cnk7XG5cbiAgICAgIGlmIChlbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICBlbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBudW1CaXRzKTtcbiAgICAgICAgbnVtQml0cysrO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG59O1xuICByZXR1cm4gTFpTdHJpbmc7XG59KSgpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbiAoKSB7IHJldHVybiBMWlN0cmluZzsgfSk7XG59IGVsc2UgaWYoIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZSAhPSBudWxsICkge1xuICBtb2R1bGUuZXhwb3J0cyA9IExaU3RyaW5nXG59XG4iLCJ2YXIgY2FuUHJvbWlzZSA9IHJlcXVpcmUoJ2Nhbi1wcm9taXNlJylcbnZhciBRUkNvZGUgPSByZXF1aXJlKCcuL2NvcmUvcXJjb2RlJylcbnZhciBDYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvY2FudmFzJylcbnZhciBTdmdSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvc3ZnLXRhZy5qcycpXG5cbmZ1bmN0aW9uIHJlbmRlckNhbnZhcyAocmVuZGVyRnVuYywgY2FudmFzLCB0ZXh0LCBvcHRzLCBjYikge1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICB2YXIgYXJnc051bSA9IGFyZ3MubGVuZ3RoXG4gIHZhciBpc0xhc3RBcmdDYiA9IHR5cGVvZiBhcmdzW2FyZ3NOdW0gLSAxXSA9PT0gJ2Z1bmN0aW9uJ1xuXG4gIGlmICghaXNMYXN0QXJnQ2IgJiYgIWNhblByb21pc2UoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQgYXMgbGFzdCBhcmd1bWVudCcpXG4gIH1cblxuICBpZiAoaXNMYXN0QXJnQ2IpIHtcbiAgICBpZiAoYXJnc051bSA8IDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmIChhcmdzTnVtID09PSAyKSB7XG4gICAgICBjYiA9IHRleHRcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IG9wdHMgPSB1bmRlZmluZWRcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDMpIHtcbiAgICAgIGlmIChjYW52YXMuZ2V0Q29udGV4dCAmJiB0eXBlb2YgY2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNiID0gb3B0c1xuICAgICAgICBvcHRzID0gdW5kZWZpbmVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYiA9IG9wdHNcbiAgICAgICAgb3B0cyA9IHRleHRcbiAgICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGFyZ3NOdW0gPCAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBmZXcgYXJndW1lbnRzIHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAoYXJnc051bSA9PT0gMSkge1xuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMiAmJiAhY2FudmFzLmdldENvbnRleHQpIHtcbiAgICAgIG9wdHMgPSB0ZXh0XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGRhdGEgPSBRUkNvZGUuY3JlYXRlKHRleHQsIG9wdHMpXG4gICAgICAgIHJlc29sdmUocmVuZGVyRnVuYyhkYXRhLCBjYW52YXMsIG9wdHMpKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWplY3QoZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdHJ5IHtcbiAgICB2YXIgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcbiAgICBjYihudWxsLCByZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYihlKVxuICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlID0gUVJDb2RlLmNyZWF0ZVxuZXhwb3J0cy50b0NhbnZhcyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlcilcbmV4cG9ydHMudG9EYXRhVVJMID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyVG9EYXRhVVJMKVxuXG4vLyBvbmx5IHN2ZyBmb3Igbm93LlxuZXhwb3J0cy50b1N0cmluZyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIGZ1bmN0aW9uIChkYXRhLCBfLCBvcHRzKSB7XG4gIHJldHVybiBTdmdSZW5kZXJlci5yZW5kZXIoZGF0YSwgb3B0cylcbn0pXG4iLCIvKipcbiAqIEFsaWdubWVudCBwYXR0ZXJuIGFyZSBmaXhlZCByZWZlcmVuY2UgcGF0dGVybiBpbiBkZWZpbmVkIHBvc2l0aW9uc1xuICogaW4gYSBtYXRyaXggc3ltYm9sb2d5LCB3aGljaCBlbmFibGVzIHRoZSBkZWNvZGUgc29mdHdhcmUgdG8gcmUtc3luY2hyb25pc2VcbiAqIHRoZSBjb29yZGluYXRlIG1hcHBpbmcgb2YgdGhlIGltYWdlIG1vZHVsZXMgaW4gdGhlIGV2ZW50IG9mIG1vZGVyYXRlIGFtb3VudHNcbiAqIG9mIGRpc3RvcnRpb24gb2YgdGhlIGltYWdlLlxuICpcbiAqIEFsaWdubWVudCBwYXR0ZXJucyBhcmUgcHJlc2VudCBvbmx5IGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDIgb3IgbGFyZ2VyXG4gKiBhbmQgdGhlaXIgbnVtYmVyIGRlcGVuZHMgb24gdGhlIHN5bWJvbCB2ZXJzaW9uLlxuICovXG5cbnZhciBnZXRTeW1ib2xTaXplID0gcmVxdWlyZSgnLi91dGlscycpLmdldFN5bWJvbFNpemVcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHJvdy9jb2x1bW4gY29vcmRpbmF0ZXMgb2YgdGhlIGNlbnRlciBtb2R1bGUgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVyblxuICogZm9yIHRoZSBzcGVjaWZpZWQgUVIgQ29kZSB2ZXJzaW9uLlxuICpcbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMgYXJlIHBvc2l0aW9uZWQgc3ltbWV0cmljYWxseSBvbiBlaXRoZXIgc2lkZSBvZiB0aGUgZGlhZ29uYWxcbiAqIHJ1bm5pbmcgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBzeW1ib2wgdG8gdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXG4gKlxuICogU2luY2UgcG9zaXRpb25zIGFyZSBzaW1tZXRyaWNhbCBvbmx5IGhhbGYgb2YgdGhlIGNvb3JkaW5hdGVzIGFyZSByZXR1cm5lZC5cbiAqIEVhY2ggaXRlbSBvZiB0aGUgYXJyYXkgd2lsbCByZXByZXNlbnQgaW4gdHVybiB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxuICogQHNlZSB7QGxpbmsgZ2V0UG9zaXRpb25zfVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlXG4gKi9cbmV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzID0gZnVuY3Rpb24gZ2V0Um93Q29sQ29vcmRzICh2ZXJzaW9uKSB7XG4gIGlmICh2ZXJzaW9uID09PSAxKSByZXR1cm4gW11cblxuICB2YXIgcG9zQ291bnQgPSBNYXRoLmZsb29yKHZlcnNpb24gLyA3KSArIDJcbiAgdmFyIHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXG4gIHZhciBpbnRlcnZhbHMgPSBzaXplID09PSAxNDUgPyAyNiA6IE1hdGguY2VpbCgoc2l6ZSAtIDEzKSAvICgyICogcG9zQ291bnQgLSAyKSkgKiAyXG4gIHZhciBwb3NpdGlvbnMgPSBbc2l6ZSAtIDddIC8vIExhc3QgY29vcmQgaXMgYWx3YXlzIChzaXplIC0gNylcblxuICBmb3IgKHZhciBpID0gMTsgaSA8IHBvc0NvdW50IC0gMTsgaSsrKSB7XG4gICAgcG9zaXRpb25zW2ldID0gcG9zaXRpb25zW2kgLSAxXSAtIGludGVydmFsc1xuICB9XG5cbiAgcG9zaXRpb25zLnB1c2goNikgLy8gRmlyc3QgY29vcmQgaXMgYWx3YXlzIDZcblxuICByZXR1cm4gcG9zaXRpb25zLnJldmVyc2UoKVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggYWxpZ25tZW50IHBhdHRlcm4uXG4gKiBFYWNoIGFycmF5J3MgZWxlbWVudCByZXByZXNlbnQgdGhlIGNlbnRlciBwb2ludCBvZiB0aGUgcGF0dGVybiBhcyAoeCwgeSkgY29vcmRpbmF0ZXNcbiAqXG4gKiBDb29yZGluYXRlcyBhcmUgY2FsY3VsYXRlZCBleHBhbmRpbmcgdGhlIHJvdy9jb2x1bW4gY29vcmRpbmF0ZXMgcmV0dXJuZWQgYnkge0BsaW5rIGdldFJvd0NvbENvb3Jkc31cbiAqIGFuZCBmaWx0ZXJpbmcgb3V0IHRoZSBpdGVtcyB0aGF0IG92ZXJsYXBzIHdpdGggZmluZGVyIHBhdHRlcm5cbiAqXG4gKiBAZXhhbXBsZVxuICogRm9yIGEgVmVyc2lvbiA3IHN5bWJvbCB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfSByZXR1cm5zIHZhbHVlcyA2LCAyMiBhbmQgMzguXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zLCB0aGVyZWZvcmUsIGFyZSB0byBiZSBjZW50ZXJlZCBvbiAocm93LCBjb2x1bW4pXG4gKiBwb3NpdGlvbnMgKDYsMjIpLCAoMjIsNiksICgyMiwyMiksICgyMiwzOCksICgzOCwyMiksICgzOCwzOCkuXG4gKiBOb3RlIHRoYXQgdGhlIGNvb3JkaW5hdGVzICg2LDYpLCAoNiwzOCksICgzOCw2KSBhcmUgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXG4gKiBhbmQgYXJlIG5vdCB0aGVyZWZvcmUgdXNlZCBmb3IgYWxpZ25tZW50IHBhdHRlcm5zLlxuICpcbiAqIHZhciBwb3MgPSBnZXRQb3NpdGlvbnMoNylcbiAqIC8vIFtbNiwyMl0sIFsyMiw2XSwgWzIyLDIyXSwgWzIyLDM4XSwgWzM4LDIyXSwgWzM4LDM4XV1cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcbiAqL1xuZXhwb3J0cy5nZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiBnZXRQb3NpdGlvbnMgKHZlcnNpb24pIHtcbiAgdmFyIGNvb3JkcyA9IFtdXG4gIHZhciBwb3MgPSBleHBvcnRzLmdldFJvd0NvbENvb3Jkcyh2ZXJzaW9uKVxuICB2YXIgcG9zTGVuZ3RoID0gcG9zLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zTGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvc0xlbmd0aDsgaisrKSB7XG4gICAgICAvLyBTa2lwIGlmIHBvc2l0aW9uIGlzIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xuICAgICAgaWYgKChpID09PSAwICYmIGogPT09IDApIHx8ICAgICAgICAgICAgIC8vIHRvcC1sZWZ0XG4gICAgICAgICAgKGkgPT09IDAgJiYgaiA9PT0gcG9zTGVuZ3RoIC0gMSkgfHwgLy8gYm90dG9tLWxlZnRcbiAgICAgICAgICAoaSA9PT0gcG9zTGVuZ3RoIC0gMSAmJiBqID09PSAwKSkgeyAvLyB0b3AtcmlnaHRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29vcmRzLnB1c2goW3Bvc1tpXSwgcG9zW2pdXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29vcmRzXG59XG4iLCJ2YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbi8qKlxuICogQXJyYXkgb2YgY2hhcmFjdGVycyBhdmFpbGFibGUgaW4gYWxwaGFudW1lcmljIG1vZGVcbiAqXG4gKiBBcyBwZXIgUVIgQ29kZSBzcGVjaWZpY2F0aW9uLCB0byBlYWNoIGNoYXJhY3RlclxuICogaXMgYXNzaWduZWQgYSB2YWx1ZSBmcm9tIDAgdG8gNDQgd2hpY2ggaW4gdGhpcyBjYXNlIGNvaW5jaWRlc1xuICogd2l0aCB0aGUgYXJyYXkgaW5kZXhcbiAqXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbnZhciBBTFBIQV9OVU1fQ0hBUlMgPSBbXG4gICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JyxcbiAgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLFxuICAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXG4gICcgJywgJyQnLCAnJScsICcqJywgJysnLCAnLScsICcuJywgJy8nLCAnOidcbl1cblxuZnVuY3Rpb24gQWxwaGFudW1lcmljRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLkFMUEhBTlVNRVJJQ1xuICB0aGlzLmRhdGEgPSBkYXRhXG59XG5cbkFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gMTEgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDIpICsgNiAqIChsZW5ndGggJSAyKVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBBbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoYml0QnVmZmVyKSB7XG4gIHZhciBpXG5cbiAgLy8gSW5wdXQgZGF0YSBjaGFyYWN0ZXJzIGFyZSBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHR3byBjaGFyYWN0ZXJzXG4gIC8vIGFuZCBlbmNvZGVkIGFzIDExLWJpdCBiaW5hcnkgY29kZXMuXG4gIGZvciAoaSA9IDA7IGkgKyAyIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMikge1xuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpcnN0IGNoYXJhY3RlciBpcyBtdWx0aXBsaWVkIGJ5IDQ1XG4gICAgdmFyIHZhbHVlID0gQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSAqIDQ1XG5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBzZWNvbmQgZGlnaXQgaXMgYWRkZWQgdG8gdGhlIHByb2R1Y3RcbiAgICB2YWx1ZSArPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaSArIDFdKVxuXG4gICAgLy8gVGhlIHN1bSBpcyB0aGVuIHN0b3JlZCBhcyAxMS1iaXQgYmluYXJ5IG51bWJlclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDExKVxuICB9XG5cbiAgLy8gSWYgdGhlIG51bWJlciBvZiBpbnB1dCBkYXRhIGNoYXJhY3RlcnMgaXMgbm90IGEgbXVsdGlwbGUgb2YgdHdvLFxuICAvLyB0aGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBmaW5hbCBjaGFyYWN0ZXIgaXMgZW5jb2RlZCBhcyBhIDYtYml0IGJpbmFyeSBudW1iZXIuXG4gIGlmICh0aGlzLmRhdGEubGVuZ3RoICUgMikge1xuICAgIGJpdEJ1ZmZlci5wdXQoQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSwgNilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFscGhhbnVtZXJpY0RhdGFcbiIsImZ1bmN0aW9uIEJpdEJ1ZmZlciAoKSB7XG4gIHRoaXMuYnVmZmVyID0gW11cbiAgdGhpcy5sZW5ndGggPSAwXG59XG5cbkJpdEJ1ZmZlci5wcm90b3R5cGUgPSB7XG5cbiAgZ2V0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICB2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOClcbiAgICByZXR1cm4gKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSkgJiAxKSA9PT0gMVxuICB9LFxuXG4gIHB1dDogZnVuY3Rpb24gKG51bSwgbGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5wdXRCaXQoKChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkpICYgMSkgPT09IDEpXG4gICAgfVxuICB9LFxuXG4gIGdldExlbmd0aEluQml0czogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aFxuICB9LFxuXG4gIHB1dEJpdDogZnVuY3Rpb24gKGJpdCkge1xuICAgIHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyA4KVxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goMClcbiAgICB9XG5cbiAgICBpZiAoYml0KSB7XG4gICAgICB0aGlzLmJ1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+ICh0aGlzLmxlbmd0aCAlIDgpKVxuICAgIH1cblxuICAgIHRoaXMubGVuZ3RoKytcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJpdEJ1ZmZlclxuIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1ZmZlcicpXG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRvIGhhbmRsZSBRUiBDb2RlIHN5bWJvbCBtb2R1bGVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNpemUgU3ltYm9sIHNpemVcbiAqL1xuZnVuY3Rpb24gQml0TWF0cml4IChzaXplKSB7XG4gIGlmICghc2l6ZSB8fCBzaXplIDwgMSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQml0TWF0cml4IHNpemUgbXVzdCBiZSBkZWZpbmVkIGFuZCBncmVhdGVyIHRoYW4gMCcpXG4gIH1cblxuICB0aGlzLnNpemUgPSBzaXplXG4gIHRoaXMuZGF0YSA9IG5ldyBCdWZmZXIoc2l6ZSAqIHNpemUpXG4gIHRoaXMuZGF0YS5maWxsKDApXG4gIHRoaXMucmVzZXJ2ZWRCaXQgPSBuZXcgQnVmZmVyKHNpemUgKiBzaXplKVxuICB0aGlzLnJlc2VydmVkQml0LmZpbGwoMClcbn1cblxuLyoqXG4gKiBTZXQgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICogSWYgcmVzZXJ2ZWQgZmxhZyBpcyBzZXQsIHRoaXMgYml0IHdpbGwgYmUgaWdub3JlZCBkdXJpbmcgbWFza2luZyBwcm9jZXNzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgY29sXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2VydmVkXG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWx1ZSwgcmVzZXJ2ZWQpIHtcbiAgdmFyIGluZGV4ID0gcm93ICogdGhpcy5zaXplICsgY29sXG4gIHRoaXMuZGF0YVtpbmRleF0gPSB2YWx1ZVxuICBpZiAocmVzZXJ2ZWQpIHRoaXMucmVzZXJ2ZWRCaXRbaW5kZXhdID0gdHJ1ZVxufVxuXG4vKipcbiAqIFJldHVybnMgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIHJvd1xuICogQHBhcmFtICB7TnVtYmVyfSAgY29sXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIHhvciBvcGVyYXRvciBhdCBzcGVjaWZpZWQgbG9jYXRpb25cbiAqICh1c2VkIGR1cmluZyBtYXNraW5nIHByb2Nlc3MpXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgY29sXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUueG9yID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWx1ZSkge1xuICB0aGlzLmRhdGFbcm93ICogdGhpcy5zaXplICsgY29sXSBePSB2YWx1ZVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGJpdCBhdCBzcGVjaWZpZWQgbG9jYXRpb24gaXMgcmVzZXJ2ZWRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIGNvbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5pc1Jlc2VydmVkID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLnJlc2VydmVkQml0W3JvdyAqIHRoaXMuc2l6ZSArIGNvbF1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCaXRNYXRyaXhcbiIsInZhciBCdWZmZXIgPSByZXF1aXJlKCcuLi91dGlscy9idWZmZXInKVxudmFyIE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG5mdW5jdGlvbiBCeXRlRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLkJZVEVcbiAgdGhpcy5kYXRhID0gbmV3IEJ1ZmZlcihkYXRhKVxufVxuXG5CeXRlRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiBsZW5ndGggKiA4XG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYml0QnVmZmVyKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5kYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGJpdEJ1ZmZlci5wdXQodGhpcy5kYXRhW2ldLCA4KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnl0ZURhdGFcbiIsInZhciBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuXHJcbnZhciBFQ19CTE9DS1NfVEFCTEUgPSBbXHJcbi8vIEwgIE0gIFEgIEhcclxuICAxLCAxLCAxLCAxLFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMiwgMixcclxuICAxLCAyLCAyLCA0LFxyXG4gIDEsIDIsIDQsIDQsXHJcbiAgMiwgNCwgNCwgNCxcclxuICAyLCA0LCA2LCA1LFxyXG4gIDIsIDQsIDYsIDYsXHJcbiAgMiwgNSwgOCwgOCxcclxuICA0LCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDExLFxyXG4gIDQsIDgsIDEwLCAxMSxcclxuICA0LCA5LCAxMiwgMTYsXHJcbiAgNCwgOSwgMTYsIDE2LFxyXG4gIDYsIDEwLCAxMiwgMTgsXHJcbiAgNiwgMTAsIDE3LCAxNixcclxuICA2LCAxMSwgMTYsIDE5LFxyXG4gIDYsIDEzLCAxOCwgMjEsXHJcbiAgNywgMTQsIDIxLCAyNSxcclxuICA4LCAxNiwgMjAsIDI1LFxyXG4gIDgsIDE3LCAyMywgMjUsXHJcbiAgOSwgMTcsIDIzLCAzNCxcclxuICA5LCAxOCwgMjUsIDMwLFxyXG4gIDEwLCAyMCwgMjcsIDMyLFxyXG4gIDEyLCAyMSwgMjksIDM1LFxyXG4gIDEyLCAyMywgMzQsIDM3LFxyXG4gIDEyLCAyNSwgMzQsIDQwLFxyXG4gIDEzLCAyNiwgMzUsIDQyLFxyXG4gIDE0LCAyOCwgMzgsIDQ1LFxyXG4gIDE1LCAyOSwgNDAsIDQ4LFxyXG4gIDE2LCAzMSwgNDMsIDUxLFxyXG4gIDE3LCAzMywgNDUsIDU0LFxyXG4gIDE4LCAzNSwgNDgsIDU3LFxyXG4gIDE5LCAzNywgNTEsIDYwLFxyXG4gIDE5LCAzOCwgNTMsIDYzLFxyXG4gIDIwLCA0MCwgNTYsIDY2LFxyXG4gIDIxLCA0MywgNTksIDcwLFxyXG4gIDIyLCA0NSwgNjIsIDc0LFxyXG4gIDI0LCA0NywgNjUsIDc3LFxyXG4gIDI1LCA0OSwgNjgsIDgxXHJcbl1cclxuXHJcbnZhciBFQ19DT0RFV09SRFNfVEFCTEUgPSBbXHJcbi8vIEwgIE0gIFEgIEhcclxuICA3LCAxMCwgMTMsIDE3LFxyXG4gIDEwLCAxNiwgMjIsIDI4LFxyXG4gIDE1LCAyNiwgMzYsIDQ0LFxyXG4gIDIwLCAzNiwgNTIsIDY0LFxyXG4gIDI2LCA0OCwgNzIsIDg4LFxyXG4gIDM2LCA2NCwgOTYsIDExMixcclxuICA0MCwgNzIsIDEwOCwgMTMwLFxyXG4gIDQ4LCA4OCwgMTMyLCAxNTYsXHJcbiAgNjAsIDExMCwgMTYwLCAxOTIsXHJcbiAgNzIsIDEzMCwgMTkyLCAyMjQsXHJcbiAgODAsIDE1MCwgMjI0LCAyNjQsXHJcbiAgOTYsIDE3NiwgMjYwLCAzMDgsXHJcbiAgMTA0LCAxOTgsIDI4OCwgMzUyLFxyXG4gIDEyMCwgMjE2LCAzMjAsIDM4NCxcclxuICAxMzIsIDI0MCwgMzYwLCA0MzIsXHJcbiAgMTQ0LCAyODAsIDQwOCwgNDgwLFxyXG4gIDE2OCwgMzA4LCA0NDgsIDUzMixcclxuICAxODAsIDMzOCwgNTA0LCA1ODgsXHJcbiAgMTk2LCAzNjQsIDU0NiwgNjUwLFxyXG4gIDIyNCwgNDE2LCA2MDAsIDcwMCxcclxuICAyMjQsIDQ0MiwgNjQ0LCA3NTAsXHJcbiAgMjUyLCA0NzYsIDY5MCwgODE2LFxyXG4gIDI3MCwgNTA0LCA3NTAsIDkwMCxcclxuICAzMDAsIDU2MCwgODEwLCA5NjAsXHJcbiAgMzEyLCA1ODgsIDg3MCwgMTA1MCxcclxuICAzMzYsIDY0NCwgOTUyLCAxMTEwLFxyXG4gIDM2MCwgNzAwLCAxMDIwLCAxMjAwLFxyXG4gIDM5MCwgNzI4LCAxMDUwLCAxMjYwLFxyXG4gIDQyMCwgNzg0LCAxMTQwLCAxMzUwLFxyXG4gIDQ1MCwgODEyLCAxMjAwLCAxNDQwLFxyXG4gIDQ4MCwgODY4LCAxMjkwLCAxNTMwLFxyXG4gIDUxMCwgOTI0LCAxMzUwLCAxNjIwLFxyXG4gIDU0MCwgOTgwLCAxNDQwLCAxNzEwLFxyXG4gIDU3MCwgMTAzNiwgMTUzMCwgMTgwMCxcclxuICA1NzAsIDEwNjQsIDE1OTAsIDE4OTAsXHJcbiAgNjAwLCAxMTIwLCAxNjgwLCAxOTgwLFxyXG4gIDYzMCwgMTIwNCwgMTc3MCwgMjEwMCxcclxuICA2NjAsIDEyNjAsIDE4NjAsIDIyMjAsXHJcbiAgNzIwLCAxMzE2LCAxOTUwLCAyMzEwLFxyXG4gIDc1MCwgMTM3MiwgMjA0MCwgMjQzMFxyXG5dXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2sgdGhhdCB0aGUgUVIgQ29kZSBzaG91bGQgY29udGFpblxyXG4gKiBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBibG9ja3NcclxuICovXHJcbmV4cG9ydHMuZ2V0QmxvY2tzQ291bnQgPSBmdW5jdGlvbiBnZXRCbG9ja3NDb3VudCAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBzd2l0Y2ggKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlIEVDTGV2ZWwuTDpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDBdXHJcbiAgICBjYXNlIEVDTGV2ZWwuTTpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDFdXHJcbiAgICBjYXNlIEVDTGV2ZWwuUTpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDJdXHJcbiAgICBjYXNlIEVDTGV2ZWwuSDpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDNdXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIHRvIHVzZSBmb3IgdGhlIHNwZWNpZmllZFxyXG4gKiB2ZXJzaW9uIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcclxuICovXHJcbmV4cG9ydHMuZ2V0VG90YWxDb2Rld29yZHNDb3VudCA9IGZ1bmN0aW9uIGdldFRvdGFsQ29kZXdvcmRzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG4iLCJleHBvcnRzLkwgPSB7IGJpdDogMSB9XG5leHBvcnRzLk0gPSB7IGJpdDogMCB9XG5leHBvcnRzLlEgPSB7IGJpdDogMyB9XG5leHBvcnRzLkggPSB7IGJpdDogMiB9XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXG4gIH1cblxuICB2YXIgbGNTdHIgPSBzdHJpbmcudG9Mb3dlckNhc2UoKVxuXG4gIHN3aXRjaCAobGNTdHIpIHtcbiAgICBjYXNlICdsJzpcbiAgICBjYXNlICdsb3cnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTFxuXG4gICAgY2FzZSAnbSc6XG4gICAgY2FzZSAnbWVkaXVtJzpcbiAgICAgIHJldHVybiBleHBvcnRzLk1cblxuICAgIGNhc2UgJ3EnOlxuICAgIGNhc2UgJ3F1YXJ0aWxlJzpcbiAgICAgIHJldHVybiBleHBvcnRzLlFcblxuICAgIGNhc2UgJ2gnOlxuICAgIGNhc2UgJ2hpZ2gnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuSFxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBFQyBMZXZlbDogJyArIHN0cmluZylcbiAgfVxufVxuXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChsZXZlbCkge1xuICByZXR1cm4gbGV2ZWwgJiYgdHlwZW9mIGxldmVsLmJpdCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICBsZXZlbC5iaXQgPj0gMCAmJiBsZXZlbC5iaXQgPCA0XG59XG5cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIH1cbn1cbiIsInZhciBnZXRTeW1ib2xTaXplID0gcmVxdWlyZSgnLi91dGlscycpLmdldFN5bWJvbFNpemVcbnZhciBGSU5ERVJfUEFUVEVSTl9TSVpFID0gN1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggZmluZGVyIHBhdHRlcm4uXG4gKiBFYWNoIGFycmF5J3MgZWxlbWVudCByZXByZXNlbnQgdGhlIHRvcC1sZWZ0IHBvaW50IG9mIHRoZSBwYXR0ZXJuIGFzICh4LCB5KSBjb29yZGluYXRlc1xuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xuICovXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xuICB2YXIgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcblxuICByZXR1cm4gW1xuICAgIC8vIHRvcC1sZWZ0XG4gICAgWzAsIDBdLFxuICAgIC8vIHRvcC1yaWdodFxuICAgIFtzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRSwgMF0sXG4gICAgLy8gYm90dG9tLWxlZnRcbiAgICBbMCwgc2l6ZSAtIEZJTkRFUl9QQVRURVJOX1NJWkVdXG4gIF1cbn1cbiIsInZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG52YXIgRzE1ID0gKDEgPDwgMTApIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDQpIHwgKDEgPDwgMikgfCAoMSA8PCAxKSB8ICgxIDw8IDApXG52YXIgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpXG52YXIgRzE1X0JDSCA9IFV0aWxzLmdldEJDSERpZ2l0KEcxNSlcblxuLyoqXG4gKiBSZXR1cm5zIGZvcm1hdCBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xuICpcbiAqIFRoZSBmb3JtYXQgaW5mb3JtYXRpb24gaXMgYSAxNS1iaXQgc2VxdWVuY2UgY29udGFpbmluZyA1IGRhdGEgYml0cyxcbiAqIHdpdGggMTAgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxNSwgNSkgQkNIIGNvZGUuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2sgICAgICAgICAgICAgICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBFbmNvZGVkIGZvcm1hdCBpbmZvcm1hdGlvbiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0RW5jb2RlZEJpdHMgPSBmdW5jdGlvbiBnZXRFbmNvZGVkQml0cyAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spIHtcbiAgdmFyIGRhdGEgPSAoKGVycm9yQ29ycmVjdGlvbkxldmVsLmJpdCA8PCAzKSB8IG1hc2spXG4gIHZhciBkID0gZGF0YSA8PCAxMFxuXG4gIHdoaWxlIChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxNV9CQ0ggPj0gMCkge1xuICAgIGQgXj0gKEcxNSA8PCAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIKSlcbiAgfVxuXG4gIC8vIHhvciBmaW5hbCBkYXRhIHdpdGggbWFzayBwYXR0ZXJuIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0XG4gIC8vIG5vIGNvbWJpbmF0aW9uIG9mIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYW5kIGRhdGEgbWFzayBwYXR0ZXJuXG4gIC8vIHdpbGwgcmVzdWx0IGluIGFuIGFsbC16ZXJvIGRhdGEgc3RyaW5nXG4gIHJldHVybiAoKGRhdGEgPDwgMTApIHwgZCkgXiBHMTVfTUFTS1xufVxuIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1ZmZlcicpXG5cbnZhciBFWFBfVEFCTEUgPSBuZXcgQnVmZmVyKDUxMilcbnZhciBMT0dfVEFCTEUgPSBuZXcgQnVmZmVyKDI1NilcblxuLyoqXG4gKiBQcmVjb21wdXRlIHRoZSBsb2cgYW5kIGFudGktbG9nIHRhYmxlcyBmb3IgZmFzdGVyIGNvbXB1dGF0aW9uIGxhdGVyXG4gKlxuICogRm9yIGVhY2ggcG9zc2libGUgdmFsdWUgaW4gdGhlIGdhbG9pcyBmaWVsZCAyXjgsIHdlIHdpbGwgcHJlLWNvbXB1dGVcbiAqIHRoZSBsb2dhcml0aG0gYW5kIGFudGktbG9nYXJpdGhtIChleHBvbmVudGlhbCkgb2YgdGhpcyB2YWx1ZVxuICpcbiAqIHJlZiB7QGxpbmsgaHR0cHM6Ly9lbi53aWtpdmVyc2l0eS5vcmcvd2lraS9SZWVkJUUyJTgwJTkzU29sb21vbl9jb2Rlc19mb3JfY29kZXJzI0ludHJvZHVjdGlvbl90b19tYXRoZW1hdGljYWxfZmllbGRzfVxuICovXG47KGZ1bmN0aW9uIGluaXRUYWJsZXMgKCkge1xuICB2YXIgeCA9IDFcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTU7IGkrKykge1xuICAgIEVYUF9UQUJMRVtpXSA9IHhcbiAgICBMT0dfVEFCTEVbeF0gPSBpXG5cbiAgICB4IDw8PSAxIC8vIG11bHRpcGx5IGJ5IDJcblxuICAgIC8vIFRoZSBRUiBjb2RlIHNwZWNpZmljYXRpb24gc2F5cyB0byB1c2UgYnl0ZS13aXNlIG1vZHVsbyAxMDAwMTExMDEgYXJpdGhtZXRpYy5cbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgd2hlbiBhIG51bWJlciBpcyAyNTYgb3IgbGFyZ2VyLCBpdCBzaG91bGQgYmUgWE9SZWQgd2l0aCAweDExRC5cbiAgICBpZiAoeCAmIDB4MTAwKSB7IC8vIHNpbWlsYXIgdG8geCA+PSAyNTYsIGJ1dCBhIGxvdCBmYXN0ZXIgKGJlY2F1c2UgMHgxMDAgPT0gMjU2KVxuICAgICAgeCBePSAweDExRFxuICAgIH1cbiAgfVxuXG4gIC8vIE9wdGltaXphdGlvbjogZG91YmxlIHRoZSBzaXplIG9mIHRoZSBhbnRpLWxvZyB0YWJsZSBzbyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gbW9kIDI1NSB0b1xuICAvLyBzdGF5IGluc2lkZSB0aGUgYm91bmRzIChiZWNhdXNlIHdlIHdpbGwgbWFpbmx5IHVzZSB0aGlzIHRhYmxlIGZvciB0aGUgbXVsdGlwbGljYXRpb24gb2ZcbiAgLy8gdHdvIEdGIG51bWJlcnMsIG5vIG1vcmUpLlxuICAvLyBAc2VlIHtAbGluayBtdWx9XG4gIGZvciAoaSA9IDI1NTsgaSA8IDUxMjsgaSsrKSB7XG4gICAgRVhQX1RBQkxFW2ldID0gRVhQX1RBQkxFW2kgLSAyNTVdXG4gIH1cbn0oKSlcblxuLyoqXG4gKiBSZXR1cm5zIGxvZyB2YWx1ZSBvZiBuIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiBsb2cgKG4pIHtcbiAgaWYgKG4gPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2xvZygnICsgbiArICcpJylcbiAgcmV0dXJuIExPR19UQUJMRVtuXVxufVxuXG4vKipcbiAqIFJldHVybnMgYW50aS1sb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydHMuZXhwID0gZnVuY3Rpb24gZXhwIChuKSB7XG4gIHJldHVybiBFWFBfVEFCTEVbbl1cbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBudW1iZXIgaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0geFxuICogQHBhcmFtICB7TnVtYmVyfSB5XG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydHMubXVsID0gZnVuY3Rpb24gbXVsICh4LCB5KSB7XG4gIGlmICh4ID09PSAwIHx8IHkgPT09IDApIHJldHVybiAwXG5cbiAgLy8gc2hvdWxkIGJlIEVYUF9UQUJMRVsoTE9HX1RBQkxFW3hdICsgTE9HX1RBQkxFW3ldKSAlIDI1NV0gaWYgRVhQX1RBQkxFIHdhc24ndCBvdmVyc2l6ZWRcbiAgLy8gQHNlZSB7QGxpbmsgaW5pdFRhYmxlc31cbiAgcmV0dXJuIEVYUF9UQUJMRVtMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV1dXG59XG4iLCJ2YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gS2FuamlEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuS0FOSklcbiAgdGhpcy5kYXRhID0gZGF0YVxufVxuXG5LYW5qaURhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gbGVuZ3RoICogMTNcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYml0QnVmZmVyKSB7XG4gIHZhciBpXG5cbiAgLy8gSW4gdGhlIFNoaWZ0IEpJUyBzeXN0ZW0sIEthbmppIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IGEgdHdvIGJ5dGUgY29tYmluYXRpb24uXG4gIC8vIFRoZXNlIGJ5dGUgdmFsdWVzIGFyZSBzaGlmdGVkIGZyb20gdGhlIEpJUyBYIDAyMDggdmFsdWVzLlxuICAvLyBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHZhbHVlID0gVXRpbHMudG9TSklTKHRoaXMuZGF0YVtpXSlcblxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4ODE0MCB0byAweDlGRkM6XG4gICAgaWYgKHZhbHVlID49IDB4ODE0MCAmJiB2YWx1ZSA8PSAweDlGRkMpIHtcbiAgICAgIC8vIFN1YnRyYWN0IDB4ODE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxuICAgICAgdmFsdWUgLT0gMHg4MTQwXG5cbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweEUwNDAgdG8gMHhFQkJGXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA+PSAweEUwNDAgJiYgdmFsdWUgPD0gMHhFQkJGKSB7XG4gICAgICAvLyBTdWJ0cmFjdCAweEMxNDAgZnJvbSBTaGlmdCBKSVMgdmFsdWVcbiAgICAgIHZhbHVlIC09IDB4QzE0MFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhbGlkIFNKSVMgY2hhcmFjdGVyOiAnICsgdGhpcy5kYXRhW2ldICsgJ1xcbicgK1xuICAgICAgICAnTWFrZSBzdXJlIHlvdXIgY2hhcnNldCBpcyBVVEYtOCcpXG4gICAgfVxuXG4gICAgLy8gTXVsdGlwbHkgbW9zdCBzaWduaWZpY2FudCBieXRlIG9mIHJlc3VsdCBieSAweEMwXG4gICAgLy8gYW5kIGFkZCBsZWFzdCBzaWduaWZpY2FudCBieXRlIHRvIHByb2R1Y3RcbiAgICB2YWx1ZSA9ICgoKHZhbHVlID4+PiA4KSAmIDB4ZmYpICogMHhDMCkgKyAodmFsdWUgJiAweGZmKVxuXG4gICAgLy8gQ29udmVydCByZXN1bHQgdG8gYSAxMy1iaXQgYmluYXJ5IHN0cmluZ1xuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDEzKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gS2FuamlEYXRhXG4iLCIvKipcbiAqIERhdGEgbWFzayBwYXR0ZXJuIHJlZmVyZW5jZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5QYXR0ZXJucyA9IHtcbiAgUEFUVEVSTjAwMDogMCxcbiAgUEFUVEVSTjAwMTogMSxcbiAgUEFUVEVSTjAxMDogMixcbiAgUEFUVEVSTjAxMTogMyxcbiAgUEFUVEVSTjEwMDogNCxcbiAgUEFUVEVSTjEwMTogNSxcbiAgUEFUVEVSTjExMDogNixcbiAgUEFUVEVSTjExMTogN1xufVxuXG4vKipcbiAqIFdlaWdodGVkIHBlbmFsdHkgc2NvcmVzIGZvciB0aGUgdW5kZXNpcmFibGUgZmVhdHVyZXNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBQZW5hbHR5U2NvcmVzID0ge1xuICBOMTogMyxcbiAgTjI6IDMsXG4gIE4zOiA0MCxcbiAgTjQ6IDEwXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgbWFzayBwYXR0ZXJuIHZhbHVlIGlzIHZhbGlkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgbWFzayAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKG1hc2spIHtcbiAgcmV0dXJuIG1hc2sgJiYgbWFzayAhPT0gJycgJiYgIWlzTmFOKG1hc2spICYmIG1hc2sgPj0gMCAmJiBtYXNrIDw9IDdcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1hc2sgcGF0dGVybiBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgdmFsaWQsIHJldHVybnMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfFN0cmluZ30gdmFsdWUgICAgICAgIE1hc2sgcGF0dGVybiB2YWx1ZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFZhbGlkIG1hc2sgcGF0dGVybiBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUpIHtcbiAgcmV0dXJuIGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdW5kZWZpbmVkXG59XG5cbi8qKlxuKiBGaW5kIGFkamFjZW50IG1vZHVsZXMgaW4gcm93L2NvbHVtbiB3aXRoIHRoZSBzYW1lIGNvbG9yXG4qIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlLlxuKlxuKiBQb2ludHM6IE4xICsgaVxuKiBpIGlzIHRoZSBhbW91bnQgYnkgd2hpY2ggdGhlIG51bWJlciBvZiBhZGphY2VudCBtb2R1bGVzIG9mIHRoZSBzYW1lIGNvbG9yIGV4Y2VlZHMgNVxuKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4xID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4xIChkYXRhKSB7XG4gIHZhciBzaXplID0gZGF0YS5zaXplXG4gIHZhciBwb2ludHMgPSAwXG4gIHZhciBzYW1lQ291bnRDb2wgPSAwXG4gIHZhciBzYW1lQ291bnRSb3cgPSAwXG4gIHZhciBsYXN0Q29sID0gbnVsbFxuICB2YXIgbGFzdFJvdyA9IG51bGxcblxuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgIHNhbWVDb3VudENvbCA9IHNhbWVDb3VudFJvdyA9IDBcbiAgICBsYXN0Q29sID0gbGFzdFJvdyA9IG51bGxcblxuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XG4gICAgICB2YXIgbW9kdWxlID0gZGF0YS5nZXQocm93LCBjb2wpXG4gICAgICBpZiAobW9kdWxlID09PSBsYXN0Q29sKSB7XG4gICAgICAgIHNhbWVDb3VudENvbCsrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXG4gICAgICAgIGxhc3RDb2wgPSBtb2R1bGVcbiAgICAgICAgc2FtZUNvdW50Q29sID0gMVxuICAgICAgfVxuXG4gICAgICBtb2R1bGUgPSBkYXRhLmdldChjb2wsIHJvdylcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RSb3cpIHtcbiAgICAgICAgc2FtZUNvdW50Um93KytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzYW1lQ291bnRSb3cgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Um93IC0gNSlcbiAgICAgICAgbGFzdFJvdyA9IG1vZHVsZVxuICAgICAgICBzYW1lQ291bnRSb3cgPSAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNhbWVDb3VudENvbCA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRDb2wgLSA1KVxuICAgIGlmIChzYW1lQ291bnRSb3cgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Um93IC0gNSlcbiAgfVxuXG4gIHJldHVybiBwb2ludHNcbn1cblxuLyoqXG4gKiBGaW5kIDJ4MiBibG9ja3Mgd2l0aCB0aGUgc2FtZSBjb2xvciBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZVxuICpcbiAqIFBvaW50czogTjIgKiAobSAtIDEpICogKG4gLSAxKVxuICovXG5leHBvcnRzLmdldFBlbmFsdHlOMiA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMiAoZGF0YSkge1xuICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZVxuICB2YXIgcG9pbnRzID0gMFxuXG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNpemUgLSAxOyByb3crKykge1xuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNpemUgLSAxOyBjb2wrKykge1xuICAgICAgdmFyIGxhc3QgPSBkYXRhLmdldChyb3csIGNvbCkgK1xuICAgICAgICBkYXRhLmdldChyb3csIGNvbCArIDEpICtcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCArIDEpXG5cbiAgICAgIGlmIChsYXN0ID09PSA0IHx8IGxhc3QgPT09IDApIHBvaW50cysrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjJcbn1cblxuLyoqXG4gKiBGaW5kIDE6MTozOjE6MSByYXRpbyAoZGFyazpsaWdodDpkYXJrOmxpZ2h0OmRhcmspIHBhdHRlcm4gaW4gcm93L2NvbHVtbixcbiAqIHByZWNlZGVkIG9yIGZvbGxvd2VkIGJ5IGxpZ2h0IGFyZWEgNCBtb2R1bGVzIHdpZGVcbiAqXG4gKiBQb2ludHM6IE4zICogbnVtYmVyIG9mIHBhdHRlcm4gZm91bmRcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjMgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjMgKGRhdGEpIHtcbiAgdmFyIHNpemUgPSBkYXRhLnNpemVcbiAgdmFyIHBvaW50cyA9IDBcbiAgdmFyIGJpdHNDb2wgPSAwXG4gIHZhciBiaXRzUm93ID0gMFxuXG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgYml0c0NvbCA9IGJpdHNSb3cgPSAwXG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICAgIGJpdHNDb2wgPSAoKGJpdHNDb2wgPDwgMSkgJiAweDdGRikgfCBkYXRhLmdldChyb3csIGNvbClcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNDb2wgPT09IDB4NUQwIHx8IGJpdHNDb2wgPT09IDB4MDVEKSkgcG9pbnRzKytcblxuICAgICAgYml0c1JvdyA9ICgoYml0c1JvdyA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KGNvbCwgcm93KVxuICAgICAgaWYgKGNvbCA+PSAxMCAmJiAoYml0c1JvdyA9PT0gMHg1RDAgfHwgYml0c1JvdyA9PT0gMHgwNUQpKSBwb2ludHMrK1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb2ludHMgKiBQZW5hbHR5U2NvcmVzLk4zXG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHByb3BvcnRpb24gb2YgZGFyayBtb2R1bGVzIGluIGVudGlyZSBzeW1ib2xcbiAqXG4gKiBQb2ludHM6IE40ICoga1xuICpcbiAqIGsgaXMgdGhlIHJhdGluZyBvZiB0aGUgZGV2aWF0aW9uIG9mIHRoZSBwcm9wb3J0aW9uIG9mIGRhcmsgbW9kdWxlc1xuICogaW4gdGhlIHN5bWJvbCBmcm9tIDUwJSBpbiBzdGVwcyBvZiA1JVxuICovXG5leHBvcnRzLmdldFBlbmFsdHlONCA9IGZ1bmN0aW9uIGdldFBlbmFsdHlONCAoZGF0YSkge1xuICB2YXIgZGFya0NvdW50ID0gMFxuICB2YXIgbW9kdWxlc0NvdW50ID0gZGF0YS5kYXRhLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kdWxlc0NvdW50OyBpKyspIGRhcmtDb3VudCArPSBkYXRhLmRhdGFbaV1cblxuICB2YXIgayA9IE1hdGguYWJzKE1hdGguY2VpbCgoZGFya0NvdW50ICogMTAwIC8gbW9kdWxlc0NvdW50KSAvIDUpIC0gMTApXG5cbiAgcmV0dXJuIGsgKiBQZW5hbHR5U2NvcmVzLk40XG59XG5cbi8qKlxuICogUmV0dXJuIG1hc2sgdmFsdWUgYXQgZ2l2ZW4gcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2tQYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGkgICAgICAgICAgIFJvd1xuICogQHBhcmFtICB7TnVtYmVyfSBqICAgICAgICAgICBDb2x1bW5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgTWFzayB2YWx1ZVxuICovXG5mdW5jdGlvbiBnZXRNYXNrQXQgKG1hc2tQYXR0ZXJuLCBpLCBqKSB7XG4gIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAwMDogcmV0dXJuIChpICsgaikgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMDE6IHJldHVybiBpICUgMiA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDEwOiByZXR1cm4gaiAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAxMTogcmV0dXJuIChpICsgaikgJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDA6IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSkgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDE6IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTA6IHJldHVybiAoKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMykgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTE6IHJldHVybiAoKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09PSAwXG5cbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBtYXNrUGF0dGVybjonICsgbWFza1BhdHRlcm4pXG4gIH1cbn1cblxuLyoqXG4gKiBBcHBseSBhIG1hc2sgcGF0dGVybiB0byBhIEJpdE1hdHJpeFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gICAgcGF0dGVybiBQYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YSAgICBCaXRNYXRyaXggZGF0YVxuICovXG5leHBvcnRzLmFwcGx5TWFzayA9IGZ1bmN0aW9uIGFwcGx5TWFzayAocGF0dGVybiwgZGF0YSkge1xuICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZVxuXG4gIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICAgIGlmIChkYXRhLmlzUmVzZXJ2ZWQocm93LCBjb2wpKSBjb250aW51ZVxuICAgICAgZGF0YS54b3Iocm93LCBjb2wsIGdldE1hc2tBdChwYXR0ZXJuLCByb3csIGNvbCkpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYmVzdCBtYXNrIHBhdHRlcm4gZm9yIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IGRhdGFcbiAqIEByZXR1cm4ge051bWJlcn0gTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcbiAqL1xuZXhwb3J0cy5nZXRCZXN0TWFzayA9IGZ1bmN0aW9uIGdldEJlc3RNYXNrIChkYXRhLCBzZXR1cEZvcm1hdEZ1bmMpIHtcbiAgdmFyIG51bVBhdHRlcm5zID0gT2JqZWN0LmtleXMoZXhwb3J0cy5QYXR0ZXJucykubGVuZ3RoXG4gIHZhciBiZXN0UGF0dGVybiA9IDBcbiAgdmFyIGxvd2VyUGVuYWx0eSA9IEluZmluaXR5XG5cbiAgZm9yICh2YXIgcCA9IDA7IHAgPCBudW1QYXR0ZXJuczsgcCsrKSB7XG4gICAgc2V0dXBGb3JtYXRGdW5jKHApXG4gICAgZXhwb3J0cy5hcHBseU1hc2socCwgZGF0YSlcblxuICAgIC8vIENhbGN1bGF0ZSBwZW5hbHR5XG4gICAgdmFyIHBlbmFsdHkgPVxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjEoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjIoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjMoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjQoZGF0YSlcblxuICAgIC8vIFVuZG8gcHJldmlvdXNseSBhcHBsaWVkIG1hc2tcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxuXG4gICAgaWYgKHBlbmFsdHkgPCBsb3dlclBlbmFsdHkpIHtcbiAgICAgIGxvd2VyUGVuYWx0eSA9IHBlbmFsdHlcbiAgICAgIGJlc3RQYXR0ZXJuID0gcFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBiZXN0UGF0dGVyblxufVxuIiwidmFyIFZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKVxudmFyIFJlZ2V4ID0gcmVxdWlyZSgnLi9yZWdleCcpXG5cbi8qKlxuICogTnVtZXJpYyBtb2RlIGVuY29kZXMgZGF0YSBmcm9tIHRoZSBkZWNpbWFsIGRpZ2l0IHNldCAoMCAtIDkpXG4gKiAoYnl0ZSB2YWx1ZXMgMzBIRVggdG8gMzlIRVgpLlxuICogTm9ybWFsbHksIDMgZGF0YSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMCBiaXRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuTlVNRVJJQyA9IHtcbiAgaWQ6ICdOdW1lcmljJyxcbiAgYml0OiAxIDw8IDAsXG4gIGNjQml0czogWzEwLCAxMiwgMTRdXG59XG5cbi8qKlxuICogQWxwaGFudW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gYSBzZXQgb2YgNDUgY2hhcmFjdGVycyxcbiAqIGkuZS4gMTAgbnVtZXJpYyBkaWdpdHMgKDAgLSA5KSxcbiAqICAgICAgMjYgYWxwaGFiZXRpYyBjaGFyYWN0ZXJzIChBIC0gWiksXG4gKiAgIGFuZCA5IHN5bWJvbHMgKFNQLCAkLCAlLCAqLCArLCAtLCAuLCAvLCA6KS5cbiAqIE5vcm1hbGx5LCB0d28gaW5wdXQgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgMTEgYml0cy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLkFMUEhBTlVNRVJJQyA9IHtcbiAgaWQ6ICdBbHBoYW51bWVyaWMnLFxuICBiaXQ6IDEgPDwgMSxcbiAgY2NCaXRzOiBbOSwgMTEsIDEzXVxufVxuXG4vKipcbiAqIEluIGJ5dGUgbW9kZSwgZGF0YSBpcyBlbmNvZGVkIGF0IDggYml0cyBwZXIgY2hhcmFjdGVyLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuQllURSA9IHtcbiAgaWQ6ICdCeXRlJyxcbiAgYml0OiAxIDw8IDIsXG4gIGNjQml0czogWzgsIDE2LCAxNl1cbn1cblxuLyoqXG4gKiBUaGUgS2FuamkgbW9kZSBlZmZpY2llbnRseSBlbmNvZGVzIEthbmppIGNoYXJhY3RlcnMgaW4gYWNjb3JkYW5jZSB3aXRoXG4gKiB0aGUgU2hpZnQgSklTIHN5c3RlbSBiYXNlZCBvbiBKSVMgWCAwMjA4LlxuICogVGhlIFNoaWZ0IEpJUyB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXG4gKiBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxuICogRWFjaCB0d28tYnl0ZSBjaGFyYWN0ZXIgdmFsdWUgaXMgY29tcGFjdGVkIHRvIGEgMTMtYml0IGJpbmFyeSBjb2Rld29yZC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLktBTkpJID0ge1xuICBpZDogJ0thbmppJyxcbiAgYml0OiAxIDw8IDMsXG4gIGNjQml0czogWzgsIDEwLCAxMl1cbn1cblxuLyoqXG4gKiBNaXhlZCBtb2RlIHdpbGwgY29udGFpbiBhIHNlcXVlbmNlcyBvZiBkYXRhIGluIGEgY29tYmluYXRpb24gb2YgYW55IG9mXG4gKiB0aGUgbW9kZXMgZGVzY3JpYmVkIGFib3ZlXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5NSVhFRCA9IHtcbiAgYml0OiAtMVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byBzdG9yZSB0aGUgZGF0YSBsZW5ndGhcbiAqIGFjY29yZGluZyB0byBRUiBDb2RlIHNwZWNpZmljYXRpb25zLlxuICpcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICBEYXRhIG1vZGVcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBOdW1iZXIgb2YgYml0c1xuICovXG5leHBvcnRzLmdldENoYXJDb3VudEluZGljYXRvciA9IGZ1bmN0aW9uIGdldENoYXJDb3VudEluZGljYXRvciAobW9kZSwgdmVyc2lvbikge1xuICBpZiAoIW1vZGUuY2NCaXRzKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZTogJyArIG1vZGUpXG5cbiAgaWYgKCFWZXJzaW9uLmlzVmFsaWQodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyc2lvbjogJyArIHZlcnNpb24pXG4gIH1cblxuICBpZiAodmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPCAxMCkgcmV0dXJuIG1vZGUuY2NCaXRzWzBdXG4gIGVsc2UgaWYgKHZlcnNpb24gPCAyNykgcmV0dXJuIG1vZGUuY2NCaXRzWzFdXG4gIHJldHVybiBtb2RlLmNjQml0c1syXVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1vc3QgZWZmaWNpZW50IG1vZGUgdG8gc3RvcmUgdGhlIHNwZWNpZmllZCBkYXRhXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhU3RyIElucHV0IGRhdGEgc3RyaW5nXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgQmVzdCBtb2RlXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdE1vZGVGb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdE1vZGVGb3JEYXRhIChkYXRhU3RyKSB7XG4gIGlmIChSZWdleC50ZXN0TnVtZXJpYyhkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuTlVNRVJJQ1xuICBlbHNlIGlmIChSZWdleC50ZXN0QWxwaGFudW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcbiAgZWxzZSBpZiAoUmVnZXgudGVzdEthbmppKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5LQU5KSVxuICBlbHNlIHJldHVybiBleHBvcnRzLkJZVEVcbn1cblxuLyoqXG4gKiBSZXR1cm4gbW9kZSBuYW1lIGFzIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7TW9kZX0gbW9kZSBNb2RlIG9iamVjdFxuICogQHJldHVybnMge1N0cmluZ30gIE1vZGUgbmFtZVxuICovXG5leHBvcnRzLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKG1vZGUpIHtcbiAgaWYgKG1vZGUgJiYgbW9kZS5pZCkgcmV0dXJuIG1vZGUuaWRcbiAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1vZGUnKVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGlucHV0IHBhcmFtIGlzIGEgdmFsaWQgbW9kZSBvYmplY3RcbiAqXG4gKiBAcGFyYW0gICB7TW9kZX0gICAgbW9kZSBNb2RlIG9iamVjdFxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdmFsaWQgbW9kZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKG1vZGUpIHtcbiAgcmV0dXJuIG1vZGUgJiYgbW9kZS5iaXQgJiYgbW9kZS5jY0JpdHNcbn1cblxuLyoqXG4gKiBHZXQgbW9kZSBvYmplY3QgZnJvbSBpdHMgbmFtZVxuICpcbiAqIEBwYXJhbSAgIHtTdHJpbmd9IHN0cmluZyBNb2RlIG5hbWVcbiAqIEByZXR1cm5zIHtNb2RlfSAgICAgICAgICBNb2RlIG9iamVjdFxuICovXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbSBpcyBub3QgYSBzdHJpbmcnKVxuICB9XG5cbiAgdmFyIGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBzd2l0Y2ggKGxjU3RyKSB7XG4gICAgY2FzZSAnbnVtZXJpYyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5OVU1FUklDXG4gICAgY2FzZSAnYWxwaGFudW1lcmljJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xuICAgIGNhc2UgJ2thbmppJzpcbiAgICAgIHJldHVybiBleHBvcnRzLktBTkpJXG4gICAgY2FzZSAnYnl0ZSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5CWVRFXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBtb2RlOiAnICsgc3RyaW5nKVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBtb2RlIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIG1vZGUsIHJldHVybnMgZGVmYXVsdFZhbHVlXG4gKlxuICogQHBhcmFtICB7TW9kZXxTdHJpbmd9IHZhbHVlICAgICAgICBFbmNvZGluZyBtb2RlXG4gKiBAcGFyYW0gIHtNb2RlfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgICAgICAgICAgIEVuY29kaW5nIG1vZGVcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfVxufVxuIiwidmFyIE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG5mdW5jdGlvbiBOdW1lcmljRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLk5VTUVSSUNcbiAgdGhpcy5kYXRhID0gZGF0YS50b1N0cmluZygpXG59XG5cbk51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIDEwICogTWF0aC5mbG9vcihsZW5ndGggLyAzKSArICgobGVuZ3RoICUgMykgPyAoKGxlbmd0aCAlIDMpICogMyArIDEpIDogMClcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcbiAgdmFyIGksIGdyb3VwLCB2YWx1ZVxuXG4gIC8vIFRoZSBpbnB1dCBkYXRhIHN0cmluZyBpcyBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHRocmVlIGRpZ2l0cyxcbiAgLy8gYW5kIGVhY2ggZ3JvdXAgaXMgY29udmVydGVkIHRvIGl0cyAxMC1iaXQgYmluYXJ5IGVxdWl2YWxlbnQuXG4gIGZvciAoaSA9IDA7IGkgKyAzIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpLCAzKVxuICAgIHZhbHVlID0gcGFyc2VJbnQoZ3JvdXAsIDEwKVxuXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTApXG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRpZ2l0cyBpcyBub3QgYW4gZXhhY3QgbXVsdGlwbGUgb2YgdGhyZWUsXG4gIC8vIHRoZSBmaW5hbCBvbmUgb3IgdHdvIGRpZ2l0cyBhcmUgY29udmVydGVkIHRvIDQgb3IgNyBiaXRzIHJlc3BlY3RpdmVseS5cbiAgdmFyIHJlbWFpbmluZ051bSA9IHRoaXMuZGF0YS5sZW5ndGggLSBpXG4gIGlmIChyZW1haW5pbmdOdW0gPiAwKSB7XG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGkpXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXG5cbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCByZW1haW5pbmdOdW0gKiAzICsgMSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51bWVyaWNEYXRhXG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnLi4vdXRpbHMvYnVmZmVyJylcbnZhciBHRiA9IHJlcXVpcmUoJy4vZ2Fsb2lzLWZpZWxkJylcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBwb2x5bm9taWFscyBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7QnVmZmVyfSBwMSBQb2x5bm9taWFsXG4gKiBAcGFyYW0gIHtCdWZmZXJ9IHAyIFBvbHlub21pYWxcbiAqIEByZXR1cm4ge0J1ZmZlcn0gICAgUHJvZHVjdCBvZiBwMSBhbmQgcDJcbiAqL1xuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHAxLCBwMikge1xuICB2YXIgY29lZmYgPSBuZXcgQnVmZmVyKHAxLmxlbmd0aCArIHAyLmxlbmd0aCAtIDEpXG4gIGNvZWZmLmZpbGwoMClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHAxLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBwMi5sZW5ndGg7IGorKykge1xuICAgICAgY29lZmZbaSArIGpdIF49IEdGLm11bChwMVtpXSwgcDJbal0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvZWZmXG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSByZW1haW5kZXIgb2YgcG9seW5vbWlhbHMgZGl2aXNpb25cbiAqXG4gKiBAcGFyYW0gIHtCdWZmZXJ9IGRpdmlkZW50IFBvbHlub21pYWxcbiAqIEBwYXJhbSAge0J1ZmZlcn0gZGl2aXNvciAgUG9seW5vbWlhbFxuICogQHJldHVybiB7QnVmZmVyfSAgICAgICAgICBSZW1haW5kZXJcbiAqL1xuZXhwb3J0cy5tb2QgPSBmdW5jdGlvbiBtb2QgKGRpdmlkZW50LCBkaXZpc29yKSB7XG4gIHZhciByZXN1bHQgPSBuZXcgQnVmZmVyKGRpdmlkZW50KVxuXG4gIHdoaWxlICgocmVzdWx0Lmxlbmd0aCAtIGRpdmlzb3IubGVuZ3RoKSA+PSAwKSB7XG4gICAgdmFyIGNvZWZmID0gcmVzdWx0WzBdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpdmlzb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtpXSBePSBHRi5tdWwoZGl2aXNvcltpXSwgY29lZmYpXG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFsbCB6ZXJvcyBmcm9tIGJ1ZmZlciBoZWFkXG4gICAgdmFyIG9mZnNldCA9IDBcbiAgICB3aGlsZSAob2Zmc2V0IDwgcmVzdWx0Lmxlbmd0aCAmJiByZXN1bHRbb2Zmc2V0XSA9PT0gMCkgb2Zmc2V0KytcbiAgICByZXN1bHQgPSByZXN1bHQuc2xpY2Uob2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vKipcbiAqIEdlbmVyYXRlIGFuIGlycmVkdWNpYmxlIGdlbmVyYXRvciBwb2x5bm9taWFsIG9mIHNwZWNpZmllZCBkZWdyZWVcbiAqICh1c2VkIGJ5IFJlZWQtU29sb21vbiBlbmNvZGVyKVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGVncmVlIERlZ3JlZSBvZiB0aGUgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAqIEByZXR1cm4ge0J1ZmZlcn0gICAgICAgIEJ1ZmZlciBjb250YWluaW5nIHBvbHlub21pYWwgY29lZmZpY2llbnRzXG4gKi9cbmV4cG9ydHMuZ2VuZXJhdGVFQ1BvbHlub21pYWwgPSBmdW5jdGlvbiBnZW5lcmF0ZUVDUG9seW5vbWlhbCAoZGVncmVlKSB7XG4gIHZhciBwb2x5ID0gbmV3IEJ1ZmZlcihbMV0pXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGVncmVlOyBpKyspIHtcbiAgICBwb2x5ID0gZXhwb3J0cy5tdWwocG9seSwgWzEsIEdGLmV4cChpKV0pXG4gIH1cblxuICByZXR1cm4gcG9seVxufVxuIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1ZmZlcicpXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbnZhciBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcbnZhciBCaXRCdWZmZXIgPSByZXF1aXJlKCcuL2JpdC1idWZmZXInKVxudmFyIEJpdE1hdHJpeCA9IHJlcXVpcmUoJy4vYml0LW1hdHJpeCcpXG52YXIgQWxpZ25tZW50UGF0dGVybiA9IHJlcXVpcmUoJy4vYWxpZ25tZW50LXBhdHRlcm4nKVxudmFyIEZpbmRlclBhdHRlcm4gPSByZXF1aXJlKCcuL2ZpbmRlci1wYXR0ZXJuJylcbnZhciBNYXNrUGF0dGVybiA9IHJlcXVpcmUoJy4vbWFzay1wYXR0ZXJuJylcbnZhciBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXG52YXIgUmVlZFNvbG9tb25FbmNvZGVyID0gcmVxdWlyZSgnLi9yZWVkLXNvbG9tb24tZW5jb2RlcicpXG52YXIgVmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpXG52YXIgRm9ybWF0SW5mbyA9IHJlcXVpcmUoJy4vZm9ybWF0LWluZm8nKVxudmFyIE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxudmFyIFNlZ21lbnRzID0gcmVxdWlyZSgnLi9zZWdtZW50cycpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG4vKipcbiAqIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuICpcbiAqIG1vZGlmaWVkIGJ5IFJ5YW4gRGF5IGZvciBub2RlanMgc3VwcG9ydFxuICogQ29weXJpZ2h0IChjKSAyMDExIFJ5YW4gRGF5XG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkNvZGUgZm9yIEphdmFTY3JpcHRcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcbi8vXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4vLyAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4vL1xuLy8gVGhlIHdvcmQgXCJRUiBDb2RlXCIgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2Zcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG4vLyAgIGh0dHA6Ly93d3cuZGVuc28td2F2ZS5jb20vcXJjb2RlL2ZhcXBhdGVudC1lLmh0bWxcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxuLyoqXG4gKiBBZGQgZmluZGVyIHBhdHRlcm5zIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmZ1bmN0aW9uIHNldHVwRmluZGVyUGF0dGVybiAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIHZhciBzaXplID0gbWF0cml4LnNpemVcbiAgdmFyIHBvcyA9IEZpbmRlclBhdHRlcm4uZ2V0UG9zaXRpb25zKHZlcnNpb24pXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcm93ID0gcG9zW2ldWzBdXG4gICAgdmFyIGNvbCA9IHBvc1tpXVsxXVxuXG4gICAgZm9yICh2YXIgciA9IC0xOyByIDw9IDc7IHIrKykge1xuICAgICAgaWYgKHJvdyArIHIgPD0gLTEgfHwgc2l6ZSA8PSByb3cgKyByKSBjb250aW51ZVxuXG4gICAgICBmb3IgKHZhciBjID0gLTE7IGMgPD0gNzsgYysrKSB7XG4gICAgICAgIGlmIChjb2wgKyBjIDw9IC0xIHx8IHNpemUgPD0gY29sICsgYykgY29udGludWVcblxuICAgICAgICBpZiAoKHIgPj0gMCAmJiByIDw9IDYgJiYgKGMgPT09IDAgfHwgYyA9PT0gNikpIHx8XG4gICAgICAgICAgKGMgPj0gMCAmJiBjIDw9IDYgJiYgKHIgPT09IDAgfHwgciA9PT0gNikpIHx8XG4gICAgICAgICAgKHIgPj0gMiAmJiByIDw9IDQgJiYgYyA+PSAyICYmIGMgPD0gNCkpIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCBmYWxzZSwgdHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCB0aW1pbmcgcGF0dGVybiBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYmVmb3JlIHtAbGluayBzZXR1cEFsaWdubWVudFBhdHRlcm59XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggTW9kdWxlcyBtYXRyaXhcbiAqL1xuZnVuY3Rpb24gc2V0dXBUaW1pbmdQYXR0ZXJuIChtYXRyaXgpIHtcbiAgdmFyIHNpemUgPSBtYXRyaXguc2l6ZVxuXG4gIGZvciAodmFyIHIgPSA4OyByIDwgc2l6ZSAtIDg7IHIrKykge1xuICAgIHZhciB2YWx1ZSA9IHIgJSAyID09PSAwXG4gICAgbWF0cml4LnNldChyLCA2LCB2YWx1ZSwgdHJ1ZSlcbiAgICBtYXRyaXguc2V0KDYsIHIsIHZhbHVlLCB0cnVlKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGFsaWdubWVudCBwYXR0ZXJucyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYWZ0ZXIge0BsaW5rIHNldHVwVGltaW5nUGF0dGVybn1cbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBBbGlnbm1lbnRQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgdmFyIHBvcyA9IEFsaWdubWVudFBhdHRlcm4uZ2V0UG9zaXRpb25zKHZlcnNpb24pXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcm93ID0gcG9zW2ldWzBdXG4gICAgdmFyIGNvbCA9IHBvc1tpXVsxXVxuXG4gICAgZm9yICh2YXIgciA9IC0yOyByIDw9IDI7IHIrKykge1xuICAgICAgZm9yICh2YXIgYyA9IC0yOyBjIDw9IDI7IGMrKykge1xuICAgICAgICBpZiAociA9PT0gLTIgfHwgciA9PT0gMiB8fCBjID09PSAtMiB8fCBjID09PSAyIHx8XG4gICAgICAgICAgKHIgPT09IDAgJiYgYyA9PT0gMCkpIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCBmYWxzZSwgdHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCB2ZXJzaW9uIGluZm8gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBWZXJzaW9uSW5mbyAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIHZhciBzaXplID0gbWF0cml4LnNpemVcbiAgdmFyIGJpdHMgPSBWZXJzaW9uLmdldEVuY29kZWRCaXRzKHZlcnNpb24pXG4gIHZhciByb3csIGNvbCwgbW9kXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAxODsgaSsrKSB7XG4gICAgcm93ID0gTWF0aC5mbG9vcihpIC8gMylcbiAgICBjb2wgPSBpICUgMyArIHNpemUgLSA4IC0gM1xuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXG5cbiAgICBtYXRyaXguc2V0KHJvdywgY29sLCBtb2QsIHRydWUpXG4gICAgbWF0cml4LnNldChjb2wsIHJvdywgbW9kLCB0cnVlKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGZvcm1hdCBpbmZvIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggICAgICAgICAgICAgICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgIGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge051bWJlcn0gICAgbWFza1BhdHRlcm4gICAgICAgICAgTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBzZXR1cEZvcm1hdEluZm8gKG1hdHJpeCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XG4gIHZhciBzaXplID0gbWF0cml4LnNpemVcbiAgdmFyIGJpdHMgPSBGb3JtYXRJbmZvLmdldEVuY29kZWRCaXRzKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybilcbiAgdmFyIGksIG1vZFxuXG4gIGZvciAoaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgbW9kID0gKChiaXRzID4+IGkpICYgMSkgPT09IDFcblxuICAgIC8vIHZlcnRpY2FsXG4gICAgaWYgKGkgPCA2KSB7XG4gICAgICBtYXRyaXguc2V0KGksIDgsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2UgaWYgKGkgPCA4KSB7XG4gICAgICBtYXRyaXguc2V0KGkgKyAxLCA4LCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdHJpeC5zZXQoc2l6ZSAtIDE1ICsgaSwgOCwgbW9kLCB0cnVlKVxuICAgIH1cblxuICAgIC8vIGhvcml6b250YWxcbiAgICBpZiAoaSA8IDgpIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgc2l6ZSAtIGkgLSAxLCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIGlmIChpIDwgOSkge1xuICAgICAgbWF0cml4LnNldCg4LCAxNSAtIGkgLSAxICsgMSwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEsIG1vZCwgdHJ1ZSlcbiAgICB9XG4gIH1cblxuICAvLyBmaXhlZCBtb2R1bGVcbiAgbWF0cml4LnNldChzaXplIC0gOCwgOCwgMSwgdHJ1ZSlcbn1cblxuLyoqXG4gKiBBZGQgZW5jb2RlZCBkYXRhIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge0J1ZmZlcn0gICAgZGF0YSAgIERhdGEgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIHNldHVwRGF0YSAobWF0cml4LCBkYXRhKSB7XG4gIHZhciBzaXplID0gbWF0cml4LnNpemVcbiAgdmFyIGluYyA9IC0xXG4gIHZhciByb3cgPSBzaXplIC0gMVxuICB2YXIgYml0SW5kZXggPSA3XG4gIHZhciBieXRlSW5kZXggPSAwXG5cbiAgZm9yICh2YXIgY29sID0gc2l6ZSAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XG4gICAgaWYgKGNvbCA9PT0gNikgY29sLS1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBmb3IgKHZhciBjID0gMDsgYyA8IDI7IGMrKykge1xuICAgICAgICBpZiAoIW1hdHJpeC5pc1Jlc2VydmVkKHJvdywgY29sIC0gYykpIHtcbiAgICAgICAgICB2YXIgZGFyayA9IGZhbHNlXG5cbiAgICAgICAgICBpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhcmsgPSAoKChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09PSAxKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hdHJpeC5zZXQocm93LCBjb2wgLSBjLCBkYXJrKVxuICAgICAgICAgIGJpdEluZGV4LS1cblxuICAgICAgICAgIGlmIChiaXRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGJ5dGVJbmRleCsrXG4gICAgICAgICAgICBiaXRJbmRleCA9IDdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcm93ICs9IGluY1xuXG4gICAgICBpZiAocm93IDwgMCB8fCBzaXplIDw9IHJvdykge1xuICAgICAgICByb3cgLT0gaW5jXG4gICAgICAgIGluYyA9IC1pbmNcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgZW5jb2RlZCBjb2Rld29yZHMgZnJvbSBkYXRhIGlucHV0XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7Qnl0ZURhdGF9IGRhdGEgICAgICAgICAgICAgICAgIERhdGEgaW5wdXRcbiAqIEByZXR1cm4ge0J1ZmZlcn0gICAgICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBjcmVhdGVEYXRhICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpIHtcbiAgLy8gUHJlcGFyZSBkYXRhIGJ1ZmZlclxuICB2YXIgYnVmZmVyID0gbmV3IEJpdEJ1ZmZlcigpXG5cbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgIC8vIHByZWZpeCBkYXRhIHdpdGggbW9kZSBpbmRpY2F0b3IgKDQgYml0cylcbiAgICBidWZmZXIucHV0KGRhdGEubW9kZS5iaXQsIDQpXG5cbiAgICAvLyBQcmVmaXggZGF0YSB3aXRoIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IuXG4gICAgLy8gVGhlIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgaXMgYSBzdHJpbmcgb2YgYml0cyB0aGF0IHJlcHJlc2VudHMgdGhlXG4gICAgLy8gbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBhcmUgYmVpbmcgZW5jb2RlZC5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIGNvdW50IGluZGljYXRvciBtdXN0IGJlIHBsYWNlZCBhZnRlciB0aGUgbW9kZSBpbmRpY2F0b3JcbiAgICAvLyBhbmQgbXVzdCBiZSBhIGNlcnRhaW4gbnVtYmVyIG9mIGJpdHMgbG9uZywgZGVwZW5kaW5nIG9uIHRoZSBRUiB2ZXJzaW9uXG4gICAgLy8gYW5kIGRhdGEgbW9kZVxuICAgIC8vIEBzZWUge0BsaW5rIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yfS5cbiAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKGRhdGEubW9kZSwgdmVyc2lvbikpXG5cbiAgICAvLyBhZGQgYmluYXJ5IGRhdGEgc2VxdWVuY2UgdG8gYnVmZmVyXG4gICAgZGF0YS53cml0ZShidWZmZXIpXG4gIH0pXG5cbiAgLy8gQ2FsY3VsYXRlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzXG4gIHZhciB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG4gIHZhciBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG4gIHZhciBkYXRhVG90YWxDb2Rld29yZHNCaXRzID0gKHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3JkcykgKiA4XG5cbiAgLy8gQWRkIGEgdGVybWluYXRvci5cbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWlyZWQgYml0cyxcbiAgLy8gYSB0ZXJtaW5hdG9yIG9mIHVwIHRvIGZvdXIgMHMgbXVzdCBiZSBhZGRlZCB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgc3RyaW5nLlxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBtb3JlIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIgdGhhbiB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHMsXG4gIC8vIGFkZCBmb3VyIDBzIHRvIHRoZSBlbmQuXG4gIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgKyA0IDw9IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMpIHtcbiAgICBidWZmZXIucHV0KDAsIDQpXG4gIH1cblxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBmZXdlciB0aGFuIGZvdXIgYml0cyBzaG9ydGVyLCBhZGQgb25seSB0aGUgbnVtYmVyIG9mIDBzIHRoYXRcbiAgLy8gYXJlIG5lZWRlZCB0byByZWFjaCB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHMuXG5cbiAgLy8gQWZ0ZXIgYWRkaW5nIHRoZSB0ZXJtaW5hdG9yLCBpZiB0aGUgbnVtYmVyIG9mIGJpdHMgaW4gdGhlIHN0cmluZyBpcyBub3QgYSBtdWx0aXBsZSBvZiA4LFxuICAvLyBwYWQgdGhlIHN0cmluZyBvbiB0aGUgcmlnaHQgd2l0aCAwcyB0byBtYWtlIHRoZSBzdHJpbmcncyBsZW5ndGggYSBtdWx0aXBsZSBvZiA4LlxuICB3aGlsZSAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICUgOCAhPT0gMCkge1xuICAgIGJ1ZmZlci5wdXRCaXQoMClcbiAgfVxuXG4gIC8vIEFkZCBwYWQgYnl0ZXMgaWYgdGhlIHN0cmluZyBpcyBzdGlsbCBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiByZXF1aXJlZCBiaXRzLlxuICAvLyBFeHRlbmQgdGhlIGJ1ZmZlciB0byBmaWxsIHRoZSBkYXRhIGNhcGFjaXR5IG9mIHRoZSBzeW1ib2wgY29ycmVzcG9uZGluZyB0b1xuICAvLyB0aGUgVmVyc2lvbiBhbmQgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBieSBhZGRpbmcgdGhlIFBhZCBDb2Rld29yZHMgMTExMDExMDAgKDB4RUMpXG4gIC8vIGFuZCAwMDAxMDAwMSAoMHgxMSkgYWx0ZXJuYXRlbHkuXG4gIHZhciByZW1haW5pbmdCeXRlID0gKGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkpIC8gOFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbWFpbmluZ0J5dGU7IGkrKykge1xuICAgIGJ1ZmZlci5wdXQoaSAlIDIgPyAweDExIDogMHhFQywgOClcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDb2Rld29yZHMoYnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbn1cblxuLyoqXG4gKiBFbmNvZGUgaW5wdXQgZGF0YSB3aXRoIFJlZWQtU29sb21vbiBhbmQgcmV0dXJuIGNvZGV3b3JkcyB3aXRoXG4gKiByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBAcGFyYW0gIHtCaXRCdWZmZXJ9IGJpdEJ1ZmZlciAgICAgICAgICAgIERhdGEgdG8gZW5jb2RlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEByZXR1cm4ge0J1ZmZlcn0gICAgICAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29kZXdvcmRzIChiaXRCdWZmZXIsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxuICB2YXIgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xuICB2YXIgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xuICB2YXIgZGF0YVRvdGFsQ29kZXdvcmRzID0gdG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGJsb2Nrc1xuICB2YXIgZWNUb3RhbEJsb2NrcyA9IEVDQ29kZS5nZXRCbG9ja3NDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBDYWxjdWxhdGUgaG93IG1hbnkgYmxvY2tzIGVhY2ggZ3JvdXAgc2hvdWxkIGNvbnRhaW5cbiAgdmFyIGJsb2Nrc0luR3JvdXAyID0gdG90YWxDb2Rld29yZHMgJSBlY1RvdGFsQmxvY2tzXG4gIHZhciBibG9ja3NJbkdyb3VwMSA9IGVjVG90YWxCbG9ja3MgLSBibG9ja3NJbkdyb3VwMlxuXG4gIHZhciB0b3RhbENvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcih0b3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXG5cbiAgdmFyIGRhdGFDb2Rld29yZHNJbkdyb3VwMSA9IE1hdGguZmxvb3IoZGF0YVRvdGFsQ29kZXdvcmRzIC8gZWNUb3RhbEJsb2NrcylcbiAgdmFyIGRhdGFDb2Rld29yZHNJbkdyb3VwMiA9IGRhdGFDb2Rld29yZHNJbkdyb3VwMSArIDFcblxuICAvLyBOdW1iZXIgb2YgRUMgY29kZXdvcmRzIGlzIHRoZSBzYW1lIGZvciBib3RoIGdyb3Vwc1xuICB2YXIgZWNDb3VudCA9IHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgLSBkYXRhQ29kZXdvcmRzSW5Hcm91cDFcblxuICAvLyBJbml0aWFsaXplIGEgUmVlZC1Tb2xvbW9uIGVuY29kZXIgd2l0aCBhIGdlbmVyYXRvciBwb2x5bm9taWFsIG9mIGRlZ3JlZSBlY0NvdW50XG4gIHZhciBycyA9IG5ldyBSZWVkU29sb21vbkVuY29kZXIoZWNDb3VudClcblxuICB2YXIgb2Zmc2V0ID0gMFxuICB2YXIgZGNEYXRhID0gbmV3IEFycmF5KGVjVG90YWxCbG9ja3MpXG4gIHZhciBlY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcbiAgdmFyIG1heERhdGFTaXplID0gMFxuICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcihiaXRCdWZmZXIuYnVmZmVyKVxuXG4gIC8vIERpdmlkZSB0aGUgYnVmZmVyIGludG8gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBibG9ja3NcbiAgZm9yICh2YXIgYiA9IDA7IGIgPCBlY1RvdGFsQmxvY2tzOyBiKyspIHtcbiAgICB2YXIgZGF0YVNpemUgPSBiIDwgYmxvY2tzSW5Hcm91cDEgPyBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgOiBkYXRhQ29kZXdvcmRzSW5Hcm91cDJcblxuICAgIC8vIGV4dHJhY3QgYSBibG9jayBvZiBkYXRhIGZyb20gYnVmZmVyXG4gICAgZGNEYXRhW2JdID0gYnVmZmVyLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgZGF0YVNpemUpXG5cbiAgICAvLyBDYWxjdWxhdGUgRUMgY29kZXdvcmRzIGZvciB0aGlzIGRhdGEgYmxvY2tcbiAgICBlY0RhdGFbYl0gPSBycy5lbmNvZGUoZGNEYXRhW2JdKVxuXG4gICAgb2Zmc2V0ICs9IGRhdGFTaXplXG4gICAgbWF4RGF0YVNpemUgPSBNYXRoLm1heChtYXhEYXRhU2l6ZSwgZGF0YVNpemUpXG4gIH1cblxuICAvLyBDcmVhdGUgZmluYWwgZGF0YVxuICAvLyBJbnRlcmxlYXZlIHRoZSBkYXRhIGFuZCBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyBmcm9tIGVhY2ggYmxvY2tcbiAgdmFyIGRhdGEgPSBuZXcgQnVmZmVyKHRvdGFsQ29kZXdvcmRzKVxuICB2YXIgaW5kZXggPSAwXG4gIHZhciBpLCByXG5cbiAgLy8gQWRkIGRhdGEgY29kZXdvcmRzXG4gIGZvciAoaSA9IDA7IGkgPCBtYXhEYXRhU2l6ZTsgaSsrKSB7XG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xuICAgICAgaWYgKGkgPCBkY0RhdGFbcl0ubGVuZ3RoKSB7XG4gICAgICAgIGRhdGFbaW5kZXgrK10gPSBkY0RhdGFbcl1baV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBcHBlZCBFQyBjb2Rld29yZHNcbiAgZm9yIChpID0gMDsgaSA8IGVjQ291bnQ7IGkrKykge1xuICAgIGZvciAociA9IDA7IHIgPCBlY1RvdGFsQmxvY2tzOyByKyspIHtcbiAgICAgIGRhdGFbaW5kZXgrK10gPSBlY0RhdGFbcl1baV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGF0YVxufVxuXG4vKipcbiAqIEJ1aWxkIFFSIENvZGUgc3ltYm9sXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgICAgICAgICAgICAgICBJbnB1dCBzdHJpbmdcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJldGlvbkxldmVsfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBsZXZlbFxuICogQHBhcmFtICB7TWFza1BhdHRlcm59IG1hc2tQYXR0ZXJuICAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAgICAgT2JqZWN0IGNvbnRhaW5pbmcgc3ltYm9sIGRhdGFcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3ltYm9sIChkYXRhLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pIHtcbiAgdmFyIHNlZ21lbnRzXG5cbiAgaWYgKGlzQXJyYXkoZGF0YSkpIHtcbiAgICBzZWdtZW50cyA9IFNlZ21lbnRzLmZyb21BcnJheShkYXRhKVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIHZhciBlc3RpbWF0ZWRWZXJzaW9uID0gdmVyc2lvblxuXG4gICAgaWYgKCFlc3RpbWF0ZWRWZXJzaW9uKSB7XG4gICAgICB2YXIgcmF3U2VnbWVudHMgPSBTZWdtZW50cy5yYXdTcGxpdChkYXRhKVxuXG4gICAgICAvLyBFc3RpbWF0ZSBiZXN0IHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiByYXcgc3BsaXR0ZWQgc2VnbWVudHNcbiAgICAgIGVzdGltYXRlZFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShyYXdTZWdtZW50cyxcbiAgICAgICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG4gICAgfVxuXG4gICAgLy8gQnVpbGQgb3B0aW1pemVkIHNlZ21lbnRzXG4gICAgLy8gSWYgZXN0aW1hdGVkIHZlcnNpb24gaXMgdW5kZWZpbmVkLCB0cnkgd2l0aCB0aGUgaGlnaGVzdCB2ZXJzaW9uXG4gICAgc2VnbWVudHMgPSBTZWdtZW50cy5mcm9tU3RyaW5nKGRhdGEsIGVzdGltYXRlZFZlcnNpb24gfHwgNDApXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEnKVxuICB9XG5cbiAgLy8gR2V0IHRoZSBtaW4gdmVyc2lvbiB0aGF0IGNhbiBjb250YWluIGRhdGFcbiAgdmFyIGJlc3RWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEoc2VnbWVudHMsXG4gICAgICBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBJZiBubyB2ZXJzaW9uIGlzIGZvdW5kLCBkYXRhIGNhbm5vdCBiZSBzdG9yZWRcbiAgaWYgKCFiZXN0VmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGFtb3VudCBvZiBkYXRhIGlzIHRvbyBiaWcgdG8gYmUgc3RvcmVkIGluIGEgUVIgQ29kZScpXG4gIH1cblxuICAvLyBJZiBub3Qgc3BlY2lmaWVkLCB1c2UgbWluIHZlcnNpb24gYXMgZGVmYXVsdFxuICBpZiAoIXZlcnNpb24pIHtcbiAgICB2ZXJzaW9uID0gYmVzdFZlcnNpb25cblxuICAvLyBDaGVjayBpZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gY2FuIGNvbnRhaW4gdGhlIGRhdGFcbiAgfSBlbHNlIGlmICh2ZXJzaW9uIDwgYmVzdFZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1xcbicgK1xuICAgICAgJ1RoZSBjaG9zZW4gUVIgQ29kZSB2ZXJzaW9uIGNhbm5vdCBjb250YWluIHRoaXMgYW1vdW50IG9mIGRhdGEuXFxuJyArXG4gICAgICAnTWluaW11bSB2ZXJzaW9uIHJlcXVpcmVkIHRvIHN0b3JlIGN1cnJlbnQgZGF0YSBpczogJyArIGJlc3RWZXJzaW9uICsgJy5cXG4nXG4gICAgKVxuICB9XG5cbiAgdmFyIGRhdGFCaXRzID0gY3JlYXRlRGF0YSh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpXG5cbiAgLy8gQWxsb2NhdGUgbWF0cml4IGJ1ZmZlclxuICB2YXIgbW9kdWxlQ291bnQgPSBVdGlscy5nZXRTeW1ib2xTaXplKHZlcnNpb24pXG4gIHZhciBtb2R1bGVzID0gbmV3IEJpdE1hdHJpeChtb2R1bGVDb3VudClcblxuICAvLyBBZGQgZnVuY3Rpb24gbW9kdWxlc1xuICBzZXR1cEZpbmRlclBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcbiAgc2V0dXBUaW1pbmdQYXR0ZXJuKG1vZHVsZXMpXG4gIHNldHVwQWxpZ25tZW50UGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxuXG4gIC8vIEFkZCB0ZW1wb3JhcnkgZHVtbXkgYml0cyBmb3IgZm9ybWF0IGluZm8ganVzdCB0byBzZXQgdGhlbSBhcyByZXNlcnZlZC5cbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gcHJldmVudCB0aGVzZSBiaXRzIGZyb20gYmVpbmcgbWFza2VkIGJ5IHtAbGluayBNYXNrUGF0dGVybi5hcHBseU1hc2t9XG4gIC8vIHNpbmNlIHRoZSBtYXNraW5nIG9wZXJhdGlvbiBtdXN0IGJlIHBlcmZvcm1lZCBvbmx5IG9uIHRoZSBlbmNvZGluZyByZWdpb24uXG4gIC8vIFRoZXNlIGJsb2NrcyB3aWxsIGJlIHJlcGxhY2VkIHdpdGggY29ycmVjdCB2YWx1ZXMgbGF0ZXIgaW4gY29kZS5cbiAgc2V0dXBGb3JtYXRJbmZvKG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsLCAwKVxuXG4gIGlmICh2ZXJzaW9uID49IDcpIHtcbiAgICBzZXR1cFZlcnNpb25JbmZvKG1vZHVsZXMsIHZlcnNpb24pXG4gIH1cblxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcbiAgc2V0dXBEYXRhKG1vZHVsZXMsIGRhdGFCaXRzKVxuXG4gIGlmICghbWFza1BhdHRlcm4pIHtcbiAgICAvLyBGaW5kIGJlc3QgbWFzayBwYXR0ZXJuXG4gICAgbWFza1BhdHRlcm4gPSBNYXNrUGF0dGVybi5nZXRCZXN0TWFzayhtb2R1bGVzLFxuICAgICAgc2V0dXBGb3JtYXRJbmZvLmJpbmQobnVsbCwgbW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpKVxuICB9XG5cbiAgLy8gQXBwbHkgbWFzayBwYXR0ZXJuXG4gIE1hc2tQYXR0ZXJuLmFwcGx5TWFzayhtYXNrUGF0dGVybiwgbW9kdWxlcylcblxuICAvLyBSZXBsYWNlIGZvcm1hdCBpbmZvIGJpdHMgd2l0aCBjb3JyZWN0IHZhbHVlc1xuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxuXG4gIHJldHVybiB7XG4gICAgbW9kdWxlczogbW9kdWxlcyxcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBlcnJvckNvcnJlY3Rpb25MZXZlbCxcbiAgICBtYXNrUGF0dGVybjogbWFza1BhdHRlcm4sXG4gICAgc2VnbWVudHM6IHNlZ21lbnRzXG4gIH1cbn1cblxuLyoqXG4gKiBRUiBDb2RlXG4gKlxuICogQHBhcmFtIHtTdHJpbmcgfCBBcnJheX0gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgICAgICAgICAgICAgICAgICAgICAgT3B0aW9uYWwgY29uZmlndXJhdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy50b1NKSVNGdW5jICAgICAgICAgSGVscGVyIGZ1bmMgdG8gY29udmVydCB1dGY4IHRvIHNqaXNcbiAqL1xuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUgKGRhdGEsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fCBkYXRhID09PSAnJykge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5wdXQgdGV4dCcpXG4gIH1cblxuICB2YXIgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBFQ0xldmVsLk1cbiAgdmFyIHZlcnNpb25cbiAgdmFyIG1hc2tcblxuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gVXNlIGhpZ2hlciBlcnJvciBjb3JyZWN0aW9uIGxldmVsIGFzIGRlZmF1bHRcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuZnJvbShvcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsLCBFQ0xldmVsLk0pXG4gICAgdmVyc2lvbiA9IFZlcnNpb24uZnJvbShvcHRpb25zLnZlcnNpb24pXG4gICAgbWFzayA9IE1hc2tQYXR0ZXJuLmZyb20ob3B0aW9ucy5tYXNrUGF0dGVybilcblxuICAgIGlmIChvcHRpb25zLnRvU0pJU0Z1bmMpIHtcbiAgICAgIFV0aWxzLnNldFRvU0pJU0Z1bmN0aW9uKG9wdGlvbnMudG9TSklTRnVuYylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3JlYXRlU3ltYm9sKGRhdGEsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrKVxufVxuIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1ZmZlcicpXG52YXIgUG9seW5vbWlhbCA9IHJlcXVpcmUoJy4vcG9seW5vbWlhbCcpXG5cbmZ1bmN0aW9uIFJlZWRTb2xvbW9uRW5jb2RlciAoZGVncmVlKSB7XG4gIHRoaXMuZ2VuUG9seSA9IHVuZGVmaW5lZFxuICB0aGlzLmRlZ3JlZSA9IGRlZ3JlZVxuXG4gIGlmICh0aGlzLmRlZ3JlZSkgdGhpcy5pbml0aWFsaXplKHRoaXMuZGVncmVlKVxufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGVuY29kZXIuXG4gKiBUaGUgaW5wdXQgcGFyYW0gc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkcy5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRlZ3JlZVxuICovXG5SZWVkU29sb21vbkVuY29kZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiBpbml0aWFsaXplIChkZWdyZWUpIHtcbiAgLy8gY3JlYXRlIGFuIGlycmVkdWNpYmxlIGdlbmVyYXRvciBwb2x5bm9taWFsXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXG4gIHRoaXMuZ2VuUG9seSA9IFBvbHlub21pYWwuZ2VuZXJhdGVFQ1BvbHlub21pYWwodGhpcy5kZWdyZWUpXG59XG5cbi8qKlxuICogRW5jb2RlcyBhIGNodW5rIG9mIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtCdWZmZXJ9IGRhdGEgQnVmZmVyIGNvbnRhaW5pbmcgaW5wdXQgZGF0YVxuICogQHJldHVybiB7QnVmZmVyfSAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgZGF0YVxuICovXG5SZWVkU29sb21vbkVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZSAoZGF0YSkge1xuICBpZiAoIXRoaXMuZ2VuUG9seSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRW5jb2RlciBub3QgaW5pdGlhbGl6ZWQnKVxuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIEVDIGZvciB0aGlzIGRhdGEgYmxvY2tcbiAgLy8gZXh0ZW5kcyBkYXRhIHNpemUgdG8gZGF0YStnZW5Qb2x5IHNpemVcbiAgdmFyIHBhZCA9IG5ldyBCdWZmZXIodGhpcy5kZWdyZWUpXG4gIHBhZC5maWxsKDApXG4gIHZhciBwYWRkZWREYXRhID0gQnVmZmVyLmNvbmNhdChbZGF0YSwgcGFkXSwgZGF0YS5sZW5ndGggKyB0aGlzLmRlZ3JlZSlcblxuICAvLyBUaGUgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgYXJlIHRoZSByZW1haW5kZXIgYWZ0ZXIgZGl2aWRpbmcgdGhlIGRhdGEgY29kZXdvcmRzXG4gIC8vIGJ5IGEgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAgdmFyIHJlbWFpbmRlciA9IFBvbHlub21pYWwubW9kKHBhZGRlZERhdGEsIHRoaXMuZ2VuUG9seSlcblxuICAvLyByZXR1cm4gRUMgZGF0YSBibG9ja3MgKGxhc3QgbiBieXRlLCB3aGVyZSBuIGlzIHRoZSBkZWdyZWUgb2YgZ2VuUG9seSlcbiAgLy8gSWYgY29lZmZpY2llbnRzIG51bWJlciBpbiByZW1haW5kZXIgYXJlIGxlc3MgdGhhbiBnZW5Qb2x5IGRlZ3JlZSxcbiAgLy8gcGFkIHdpdGggMHMgdG8gdGhlIGxlZnQgdG8gcmVhY2ggdGhlIG5lZWRlZCBudW1iZXIgb2YgY29lZmZpY2llbnRzXG4gIHZhciBzdGFydCA9IHRoaXMuZGVncmVlIC0gcmVtYWluZGVyLmxlbmd0aFxuICBpZiAoc3RhcnQgPiAwKSB7XG4gICAgdmFyIGJ1ZmYgPSBuZXcgQnVmZmVyKHRoaXMuZGVncmVlKVxuICAgIGJ1ZmYuZmlsbCgwKVxuICAgIHJlbWFpbmRlci5jb3B5KGJ1ZmYsIHN0YXJ0KVxuXG4gICAgcmV0dXJuIGJ1ZmZcbiAgfVxuXG4gIHJldHVybiByZW1haW5kZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZWVkU29sb21vbkVuY29kZXJcbiIsInZhciBudW1lcmljID0gJ1swLTldKydcbnZhciBhbHBoYW51bWVyaWMgPSAnW0EtWiAkJSorXFxcXC0uLzpdKydcbnZhciBrYW5qaSA9ICcoPzpbdTMwMDAtdTMwM0ZdfFt1MzA0MC11MzA5Rl18W3UzMEEwLXUzMEZGXXwnICtcbiAgJ1t1RkYwMC11RkZFRl18W3U0RTAwLXU5RkFGXXxbdTI2MDUtdTI2MDZdfFt1MjE5MC11MjE5NV18dTIwM0J8JyArXG4gICdbdTIwMTB1MjAxNXUyMDE4dTIwMTl1MjAyNXUyMDI2dTIwMUN1MjAxRHUyMjI1dTIyNjBdfCcgK1xuICAnW3UwMzkxLXUwNDUxXXxbdTAwQTd1MDBBOHUwMEIxdTAwQjR1MDBEN3UwMEY3XSkrJ1xua2FuamkgPSBrYW5qaS5yZXBsYWNlKC91L2csICdcXFxcdScpXG5cbnZhciBieXRlID0gJyg/Oig/IVtBLVowLTkgJCUqK1xcXFwtLi86XXwnICsga2FuamkgKyAnKS4pKydcblxuZXhwb3J0cy5LQU5KSSA9IG5ldyBSZWdFeHAoa2FuamksICdnJylcbmV4cG9ydHMuQllURV9LQU5KSSA9IG5ldyBSZWdFeHAoJ1teQS1aMC05ICQlKitcXFxcLS4vOl0rJywgJ2cnKVxuZXhwb3J0cy5CWVRFID0gbmV3IFJlZ0V4cChieXRlLCAnZycpXG5leHBvcnRzLk5VTUVSSUMgPSBuZXcgUmVnRXhwKG51bWVyaWMsICdnJylcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cChhbHBoYW51bWVyaWMsICdnJylcblxudmFyIFRFU1RfS0FOSkkgPSBuZXcgUmVnRXhwKCdeJyArIGthbmppICsgJyQnKVxudmFyIFRFU1RfTlVNRVJJQyA9IG5ldyBSZWdFeHAoJ14nICsgbnVtZXJpYyArICckJylcbnZhciBURVNUX0FMUEhBTlVNRVJJQyA9IG5ldyBSZWdFeHAoJ15bQS1aMC05ICQlKitcXFxcLS4vOl0rJCcpXG5cbmV4cG9ydHMudGVzdEthbmppID0gZnVuY3Rpb24gdGVzdEthbmppIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfS0FOSkkudGVzdChzdHIpXG59XG5cbmV4cG9ydHMudGVzdE51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0TnVtZXJpYyAoc3RyKSB7XG4gIHJldHVybiBURVNUX05VTUVSSUMudGVzdChzdHIpXG59XG5cbmV4cG9ydHMudGVzdEFscGhhbnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3RBbHBoYW51bWVyaWMgKHN0cikge1xuICByZXR1cm4gVEVTVF9BTFBIQU5VTUVSSUMudGVzdChzdHIpXG59XG4iLCJ2YXIgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG52YXIgTnVtZXJpY0RhdGEgPSByZXF1aXJlKCcuL251bWVyaWMtZGF0YScpXG52YXIgQWxwaGFudW1lcmljRGF0YSA9IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljLWRhdGEnKVxudmFyIEJ5dGVEYXRhID0gcmVxdWlyZSgnLi9ieXRlLWRhdGEnKVxudmFyIEthbmppRGF0YSA9IHJlcXVpcmUoJy4va2FuamktZGF0YScpXG52YXIgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxudmFyIGRpamtzdHJhID0gcmVxdWlyZSgnZGlqa3N0cmFqcycpXG5cbi8qKlxuICogUmV0dXJucyBVVEY4IGJ5dGUgbGVuZ3RoXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBOdW1iZXIgb2YgYnl0ZVxuICovXG5mdW5jdGlvbiBnZXRTdHJpbmdCeXRlTGVuZ3RoIChzdHIpIHtcbiAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKS5sZW5ndGhcbn1cblxuLyoqXG4gKiBHZXQgYSBsaXN0IG9mIHNlZ21lbnRzIG9mIHRoZSBzcGVjaWZpZWQgbW9kZVxuICogZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSBTZWdtZW50IG1vZGVcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyICBTdHJpbmcgdG8gcHJvY2Vzc1xuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudHMgKHJlZ2V4LCBtb2RlLCBzdHIpIHtcbiAgdmFyIHNlZ21lbnRzID0gW11cbiAgdmFyIHJlc3VsdFxuXG4gIHdoaWxlICgocmVzdWx0ID0gcmVnZXguZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xuICAgIHNlZ21lbnRzLnB1c2goe1xuICAgICAgZGF0YTogcmVzdWx0WzBdLFxuICAgICAgaW5kZXg6IHJlc3VsdC5pbmRleCxcbiAgICAgIG1vZGU6IG1vZGUsXG4gICAgICBsZW5ndGg6IHJlc3VsdFswXS5sZW5ndGhcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHNlZ21lbnRzXG59XG5cbi8qKlxuICogRXh0cmFjdHMgYSBzZXJpZXMgb2Ygc2VnbWVudHMgd2l0aCB0aGUgYXBwcm9wcmlhdGVcbiAqIG1vZGVzIGZyb20gYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50c0Zyb21TdHJpbmcgKGRhdGFTdHIpIHtcbiAgdmFyIG51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5OVU1FUklDLCBNb2RlLk5VTUVSSUMsIGRhdGFTdHIpXG4gIHZhciBhbHBoYU51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5BTFBIQU5VTUVSSUMsIE1vZGUuQUxQSEFOVU1FUklDLCBkYXRhU3RyKVxuICB2YXIgYnl0ZVNlZ3NcbiAgdmFyIGthbmppU2Vnc1xuXG4gIGlmIChVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xuICAgIGJ5dGVTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQllURSwgTW9kZS5CWVRFLCBkYXRhU3RyKVxuICAgIGthbmppU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LktBTkpJLCBNb2RlLktBTkpJLCBkYXRhU3RyKVxuICB9IGVsc2Uge1xuICAgIGJ5dGVTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQllURV9LQU5KSSwgTW9kZS5CWVRFLCBkYXRhU3RyKVxuICAgIGthbmppU2VncyA9IFtdXG4gIH1cblxuICB2YXIgc2VncyA9IG51bVNlZ3MuY29uY2F0KGFscGhhTnVtU2VncywgYnl0ZVNlZ3MsIGthbmppU2VncylcblxuICByZXR1cm4gc2Vnc1xuICAgIC5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcbiAgICAgIHJldHVybiBzMS5pbmRleCAtIHMyLmluZGV4XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IG9iai5kYXRhLFxuICAgICAgICBtb2RlOiBvYmoubW9kZSxcbiAgICAgICAgbGVuZ3RoOiBvYmoubGVuZ3RoXG4gICAgICB9XG4gICAgfSlcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGhvdyBtYW55IGJpdHMgYXJlIG5lZWRlZCB0byBlbmNvZGUgYSBzdHJpbmcgb2ZcbiAqIHNwZWNpZmllZCBsZW5ndGggd2l0aCB0aGUgc3BlY2lmaWVkIG1vZGVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGxlbmd0aCBTdHJpbmcgbGVuZ3RoXG4gKiBAcGFyYW0gIHtNb2RlfSBtb2RlICAgICBTZWdtZW50IG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgIEJpdCBsZW5ndGhcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudEJpdHNMZW5ndGggKGxlbmd0aCwgbW9kZSkge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIEFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICAgIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlcyBhZGphY2VudCBzZWdtZW50cyB3aGljaCBoYXZlIHRoZSBzYW1lIG1vZGVcbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIG1lcmdlU2VnbWVudHMgKHNlZ3MpIHtcbiAgcmV0dXJuIHNlZ3MucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGN1cnIpIHtcbiAgICB2YXIgcHJldlNlZyA9IGFjYy5sZW5ndGggLSAxID49IDAgPyBhY2NbYWNjLmxlbmd0aCAtIDFdIDogbnVsbFxuICAgIGlmIChwcmV2U2VnICYmIHByZXZTZWcubW9kZSA9PT0gY3Vyci5tb2RlKSB7XG4gICAgICBhY2NbYWNjLmxlbmd0aCAtIDFdLmRhdGEgKz0gY3Vyci5kYXRhXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgYWNjLnB1c2goY3VycilcbiAgICByZXR1cm4gYWNjXG4gIH0sIFtdKVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGxpc3Qgb2YgYWxsIHBvc3NpYmxlIG5vZGVzIGNvbWJpbmF0aW9uIHdoaWNoXG4gKiB3aWxsIGJlIHVzZWQgdG8gYnVpbGQgYSBzZWdtZW50cyBncmFwaC5cbiAqXG4gKiBOb2RlcyBhcmUgZGl2aWRlZCBieSBncm91cHMuIEVhY2ggZ3JvdXAgd2lsbCBjb250YWluIGEgbGlzdCBvZiBhbGwgdGhlIG1vZGVzXG4gKiBpbiB3aGljaCBpcyBwb3NzaWJsZSB0byBlbmNvZGUgdGhlIGdpdmVuIHRleHQuXG4gKlxuICogRm9yIGV4YW1wbGUgdGhlIHRleHQgJzEyMzQ1JyBjYW4gYmUgZW5jb2RlZCBhcyBOdW1lcmljLCBBbHBoYW51bWVyaWMgb3IgQnl0ZS5cbiAqIFRoZSBncm91cCBmb3IgJzEyMzQ1JyB3aWxsIGNvbnRhaW4gdGhlbiAzIG9iamVjdHMsIG9uZSBmb3IgZWFjaFxuICogcG9zc2libGUgZW5jb2RpbmcgbW9kZS5cbiAqXG4gKiBFYWNoIG5vZGUgcmVwcmVzZW50cyBhIHBvc3NpYmxlIHNlZ21lbnQuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IHNlZ3MgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICogQHJldHVybiB7QXJyYXl9ICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBidWlsZE5vZGVzIChzZWdzKSB7XG4gIHZhciBub2RlcyA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2Vncy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzZWcgPSBzZWdzW2ldXG5cbiAgICBzd2l0Y2ggKHNlZy5tb2RlKSB7XG4gICAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQUxQSEFOVU1FUklDLCBsZW5ndGg6IHNlZy5sZW5ndGggfSxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IHNlZy5sZW5ndGggfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgICBub2Rlcy5wdXNoKFtcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxuICAgICAgICBdKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBub2Rlc1xufVxuXG4vKipcbiAqIEJ1aWxkcyBhIGdyYXBoIGZyb20gYSBsaXN0IG9mIG5vZGVzLlxuICogQWxsIHNlZ21lbnRzIGluIGVhY2ggbm9kZSBncm91cCB3aWxsIGJlIGNvbm5lY3RlZCB3aXRoIGFsbCB0aGUgc2VnbWVudHMgb2ZcbiAqIHRoZSBuZXh0IGdyb3VwIGFuZCBzbyBvbi5cbiAqXG4gKiBBdCBlYWNoIGNvbm5lY3Rpb24gd2lsbCBiZSBhc3NpZ25lZCBhIHdlaWdodCBkZXBlbmRpbmcgb24gdGhlXG4gKiBzZWdtZW50J3MgYnl0ZSBsZW5ndGguXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IG5vZGVzICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBHcmFwaCBvZiBhbGwgcG9zc2libGUgc2VnbWVudHNcbiAqL1xuZnVuY3Rpb24gYnVpbGRHcmFwaCAobm9kZXMsIHZlcnNpb24pIHtcbiAgdmFyIHRhYmxlID0ge31cbiAgdmFyIGdyYXBoID0geydzdGFydCc6IHt9fVxuICB2YXIgcHJldk5vZGVJZHMgPSBbJ3N0YXJ0J11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG5vZGVHcm91cCA9IG5vZGVzW2ldXG4gICAgdmFyIGN1cnJlbnROb2RlSWRzID0gW11cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbm9kZUdyb3VwLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVHcm91cFtqXVxuICAgICAgdmFyIGtleSA9ICcnICsgaSArIGpcblxuICAgICAgY3VycmVudE5vZGVJZHMucHVzaChrZXkpXG4gICAgICB0YWJsZVtrZXldID0geyBub2RlOiBub2RlLCBsYXN0Q291bnQ6IDAgfVxuICAgICAgZ3JhcGhba2V5XSA9IHt9XG5cbiAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgcHJldk5vZGVJZHMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgdmFyIHByZXZOb2RlSWQgPSBwcmV2Tm9kZUlkc1tuXVxuXG4gICAgICAgIGlmICh0YWJsZVtwcmV2Tm9kZUlkXSAmJiB0YWJsZVtwcmV2Tm9kZUlkXS5ub2RlLm1vZGUgPT09IG5vZGUubW9kZSkge1xuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPVxuICAgICAgICAgICAgZ2V0U2VnbWVudEJpdHNMZW5ndGgodGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ICsgbm9kZS5sZW5ndGgsIG5vZGUubW9kZSkgLVxuICAgICAgICAgICAgZ2V0U2VnbWVudEJpdHNMZW5ndGgodGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50LCBub2RlLm1vZGUpXG5cbiAgICAgICAgICB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKz0gbm9kZS5sZW5ndGhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGFibGVbcHJldk5vZGVJZF0pIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCA9IG5vZGUubGVuZ3RoXG5cbiAgICAgICAgICBncmFwaFtwcmV2Tm9kZUlkXVtrZXldID0gZ2V0U2VnbWVudEJpdHNMZW5ndGgobm9kZS5sZW5ndGgsIG5vZGUubW9kZSkgK1xuICAgICAgICAgICAgNCArIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKG5vZGUubW9kZSwgdmVyc2lvbikgLy8gc3dpdGNoIGNvc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHByZXZOb2RlSWRzID0gY3VycmVudE5vZGVJZHNcbiAgfVxuXG4gIGZvciAobiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xuICAgIGdyYXBoW3ByZXZOb2RlSWRzW25dXVsnZW5kJ10gPSAwXG4gIH1cblxuICByZXR1cm4geyBtYXA6IGdyYXBoLCB0YWJsZTogdGFibGUgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhIHNlZ21lbnQgZnJvbSBhIHNwZWNpZmllZCBkYXRhIGFuZCBtb2RlLlxuICogSWYgYSBtb2RlIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBtb3JlIHN1aXRhYmxlIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgSW5wdXQgZGF0YVxuICogQHBhcmFtICB7TW9kZSB8IFN0cmluZ30gbW9kZXNIaW50IERhdGEgbW9kZVxuICogQHJldHVybiB7U2VnbWVudH0gICAgICAgICAgICAgICAgIFNlZ21lbnRcbiAqL1xuZnVuY3Rpb24gYnVpbGRTaW5nbGVTZWdtZW50IChkYXRhLCBtb2Rlc0hpbnQpIHtcbiAgdmFyIG1vZGVcbiAgdmFyIGJlc3RNb2RlID0gTW9kZS5nZXRCZXN0TW9kZUZvckRhdGEoZGF0YSlcblxuICBtb2RlID0gTW9kZS5mcm9tKG1vZGVzSGludCwgYmVzdE1vZGUpXG5cbiAgLy8gTWFrZSBzdXJlIGRhdGEgY2FuIGJlIGVuY29kZWRcbiAgaWYgKG1vZGUgIT09IE1vZGUuQllURSAmJiBtb2RlLmJpdCA8IGJlc3RNb2RlLmJpdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXCInICsgZGF0YSArICdcIicgK1xuICAgICAgJyBjYW5ub3QgYmUgZW5jb2RlZCB3aXRoIG1vZGUgJyArIE1vZGUudG9TdHJpbmcobW9kZSkgK1xuICAgICAgJy5cXG4gU3VnZ2VzdGVkIG1vZGUgaXM6ICcgKyBNb2RlLnRvU3RyaW5nKGJlc3RNb2RlKSlcbiAgfVxuXG4gIC8vIFVzZSBNb2RlLkJZVEUgaWYgS2Fuamkgc3VwcG9ydCBpcyBkaXNhYmxlZFxuICBpZiAobW9kZSA9PT0gTW9kZS5LQU5KSSAmJiAhVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpIHtcbiAgICBtb2RlID0gTW9kZS5CWVRFXG4gIH1cblxuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBuZXcgTnVtZXJpY0RhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gbmV3IEFscGhhbnVtZXJpY0RhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgIHJldHVybiBuZXcgS2FuamlEYXRhKGRhdGEpXG5cbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICAgIHJldHVybiBuZXcgQnl0ZURhdGEoZGF0YSlcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhIGxpc3Qgb2Ygc2VnbWVudHMgZnJvbSBhbiBhcnJheS5cbiAqIEFycmF5IGNhbiBjb250YWluIFN0cmluZ3Mgb3IgT2JqZWN0cyB3aXRoIHNlZ21lbnQncyBpbmZvLlxuICpcbiAqIEZvciBlYWNoIGl0ZW0gd2hpY2ggaXMgYSBzdHJpbmcsIHdpbGwgYmUgZ2VuZXJhdGVkIGEgc2VnbWVudCB3aXRoIHRoZSBnaXZlblxuICogc3RyaW5nIGFuZCB0aGUgbW9yZSBhcHByb3ByaWF0ZSBlbmNvZGluZyBtb2RlLlxuICpcbiAqIEZvciBlYWNoIGl0ZW0gd2hpY2ggaXMgYW4gb2JqZWN0LCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGRhdGEgYW5kIG1vZGUuXG4gKiBPYmplY3RzIG11c3QgY29udGFpbiBhdCBsZWFzdCB0aGUgcHJvcGVydHkgXCJkYXRhXCIuXG4gKiBJZiBwcm9wZXJ0eSBcIm1vZGVcIiBpcyBub3QgcHJlc2VudCwgdGhlIG1vcmUgc3VpdGFibGUgbW9kZSB3aWxsIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IGFycmF5IEFycmF5IG9mIG9iamVjdHMgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2YgU2VnbWVudHNcbiAqL1xuZXhwb3J0cy5mcm9tQXJyYXkgPSBmdW5jdGlvbiBmcm9tQXJyYXkgKGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgc2VnKSB7XG4gICAgaWYgKHR5cGVvZiBzZWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhY2MucHVzaChidWlsZFNpbmdsZVNlZ21lbnQoc2VnLCBudWxsKSlcbiAgICB9IGVsc2UgaWYgKHNlZy5kYXRhKSB7XG4gICAgICBhY2MucHVzaChidWlsZFNpbmdsZVNlZ21lbnQoc2VnLmRhdGEsIHNlZy5tb2RlKSlcbiAgICB9XG5cbiAgICByZXR1cm4gYWNjXG4gIH0sIFtdKVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhbiBvcHRpbWl6ZWQgc2VxdWVuY2Ugb2Ygc2VnbWVudHMgZnJvbSBhIHN0cmluZyxcbiAqIHdoaWNoIHdpbGwgcHJvZHVjZSB0aGUgc2hvcnRlc3QgcG9zc2libGUgYml0c3RyZWFtLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICBJbnB1dCBzdHJpbmdcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBzZWdtZW50c1xuICovXG5leHBvcnRzLmZyb21TdHJpbmcgPSBmdW5jdGlvbiBmcm9tU3RyaW5nIChkYXRhLCB2ZXJzaW9uKSB7XG4gIHZhciBzZWdzID0gZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxuXG4gIHZhciBub2RlcyA9IGJ1aWxkTm9kZXMoc2VncylcbiAgdmFyIGdyYXBoID0gYnVpbGRHcmFwaChub2RlcywgdmVyc2lvbilcbiAgdmFyIHBhdGggPSBkaWprc3RyYS5maW5kX3BhdGgoZ3JhcGgubWFwLCAnc3RhcnQnLCAnZW5kJylcblxuICB2YXIgb3B0aW1pemVkU2VncyA9IFtdXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBvcHRpbWl6ZWRTZWdzLnB1c2goZ3JhcGgudGFibGVbcGF0aFtpXV0ubm9kZSlcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShtZXJnZVNlZ21lbnRzKG9wdGltaXplZFNlZ3MpKVxufVxuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmluZyBpbiB2YXJpb3VzIHNlZ21lbnRzIHdpdGggdGhlIG1vZGVzIHdoaWNoXG4gKiBiZXN0IHJlcHJlc2VudCB0aGVpciBjb250ZW50LlxuICogVGhlIHByb2R1Y2VkIHNlZ21lbnRzIGFyZSBmYXIgZnJvbSBiZWluZyBvcHRpbWl6ZWQuXG4gKiBUaGUgb3V0cHV0IG9mIHRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIHRvIGVzdGltYXRlIGEgUVIgQ29kZSB2ZXJzaW9uXG4gKiB3aGljaCBtYXkgY29udGFpbiB0aGUgZGF0YS5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRhdGEgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2Ygc2VnbWVudHNcbiAqL1xuZXhwb3J0cy5yYXdTcGxpdCA9IGZ1bmN0aW9uIHJhd1NwbGl0IChkYXRhKSB7XG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShcbiAgICBnZXRTZWdtZW50c0Zyb21TdHJpbmcoZGF0YSwgVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpXG4gIClcbn1cbiIsInZhciB0b1NKSVNGdW5jdGlvblxudmFyIENPREVXT1JEU19DT1VOVCA9IFtcbiAgMCwgLy8gTm90IHVzZWRcbiAgMjYsIDQ0LCA3MCwgMTAwLCAxMzQsIDE3MiwgMTk2LCAyNDIsIDI5MiwgMzQ2LFxuICA0MDQsIDQ2NiwgNTMyLCA1ODEsIDY1NSwgNzMzLCA4MTUsIDkwMSwgOTkxLCAxMDg1LFxuICAxMTU2LCAxMjU4LCAxMzY0LCAxNDc0LCAxNTg4LCAxNzA2LCAxODI4LCAxOTIxLCAyMDUxLCAyMTg1LFxuICAyMzIzLCAyNDY1LCAyNjExLCAyNzYxLCAyODc2LCAzMDM0LCAzMTk2LCAzMzYyLCAzNTMyLCAzNzA2XG5dXG5cbi8qKlxuICogUmV0dXJucyB0aGUgUVIgQ29kZSBzaXplIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgc2l6ZSBvZiBRUiBjb2RlXG4gKi9cbmV4cG9ydHMuZ2V0U3ltYm9sU2l6ZSA9IGZ1bmN0aW9uIGdldFN5bWJvbFNpemUgKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ1widmVyc2lvblwiIGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG4gIGlmICh2ZXJzaW9uIDwgMSB8fCB2ZXJzaW9uID4gNDApIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgc2hvdWxkIGJlIGluIHJhbmdlIGZyb20gMSB0byA0MCcpXG4gIHJldHVybiB2ZXJzaW9uICogNCArIDE3XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdG90YWwgbnVtYmVyIG9mIGNvZGV3b3JkcyB1c2VkIHRvIHN0b3JlIGRhdGEgYW5kIEVDIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBEYXRhIGxlbmd0aCBpbiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHMgPSBmdW5jdGlvbiBnZXRTeW1ib2xUb3RhbENvZGV3b3JkcyAodmVyc2lvbikge1xuICByZXR1cm4gQ09ERVdPUkRTX0NPVU5UW3ZlcnNpb25dXG59XG5cbi8qKlxuICogRW5jb2RlIGRhdGEgd2l0aCBCb3NlLUNoYXVkaHVyaS1Ib2NxdWVuZ2hlbVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGF0YSBWYWx1ZSB0byBlbmNvZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICBFbmNvZGVkIHZhbHVlXG4gKi9cbmV4cG9ydHMuZ2V0QkNIRGlnaXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICB2YXIgZGlnaXQgPSAwXG5cbiAgd2hpbGUgKGRhdGEgIT09IDApIHtcbiAgICBkaWdpdCsrXG4gICAgZGF0YSA+Pj49IDFcbiAgfVxuXG4gIHJldHVybiBkaWdpdFxufVxuXG5leHBvcnRzLnNldFRvU0pJU0Z1bmN0aW9uID0gZnVuY3Rpb24gc2V0VG9TSklTRnVuY3Rpb24gKGYpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcInRvU0pJU0Z1bmNcIiBpcyBub3QgYSB2YWxpZCBmdW5jdGlvbi4nKVxuICB9XG5cbiAgdG9TSklTRnVuY3Rpb24gPSBmXG59XG5cbmV4cG9ydHMuaXNLYW5qaU1vZGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIHRvU0pJU0Z1bmN0aW9uICE9PSAndW5kZWZpbmVkJ1xufVxuXG5leHBvcnRzLnRvU0pJUyA9IGZ1bmN0aW9uIHRvU0pJUyAoa2FuamkpIHtcbiAgcmV0dXJuIHRvU0pJU0Z1bmN0aW9uKGthbmppKVxufVxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG52YXIgRUNDb2RlID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWNvZGUnKVxudmFyIEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxudmFyIE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuLy8gR2VuZXJhdG9yIHBvbHlub21pYWwgdXNlZCB0byBlbmNvZGUgdmVyc2lvbiBpbmZvcm1hdGlvblxudmFyIEcxOCA9ICgxIDw8IDEyKSB8ICgxIDw8IDExKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDkpIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDIpIHwgKDEgPDwgMClcbnZhciBHMThfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE4KVxuXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGggKG1vZGUsIGxlbmd0aCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgZm9yICh2YXIgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1vZGUpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmZ1bmN0aW9uIGdldFJlc2VydmVkQml0c0NvdW50IChtb2RlLCB2ZXJzaW9uKSB7XG4gIC8vIENoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgKyBtb2RlIGluZGljYXRvciBiaXRzXG4gIHJldHVybiBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihtb2RlLCB2ZXJzaW9uKSArIDRcbn1cblxuZnVuY3Rpb24gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheSAoc2VnbWVudHMsIHZlcnNpb24pIHtcbiAgdmFyIHRvdGFsQml0cyA9IDBcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHJlc2VydmVkQml0cyA9IGdldFJlc2VydmVkQml0c0NvdW50KGRhdGEubW9kZSwgdmVyc2lvbilcbiAgICB0b3RhbEJpdHMgKz0gcmVzZXJ2ZWRCaXRzICsgZGF0YS5nZXRCaXRzTGVuZ3RoKClcbiAgfSlcblxuICByZXR1cm4gdG90YWxCaXRzXG59XG5cbmZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhIChzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgZm9yICh2YXIgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xuICAgIHZhciBsZW5ndGggPSBnZXRUb3RhbEJpdHNGcm9tRGF0YUFycmF5KHNlZ21lbnRzLCBjdXJyZW50VmVyc2lvbilcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBNb2RlLk1JWEVEKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWZXJzaW9uXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG4vKipcbiAqIENoZWNrIGlmIFFSIENvZGUgdmVyc2lvbiBpcyB2YWxpZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIHRydWUgaWYgdmFsaWQgdmVyc2lvbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKHZlcnNpb24pIHtcbiAgcmV0dXJuICFpc05hTih2ZXJzaW9uKSAmJiB2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8PSA0MFxufVxuXG4vKipcbiAqIFJldHVybnMgdmVyc2lvbiBudW1iZXIgZnJvbSBhIHZhbHVlLlxuICogSWYgdmFsdWUgaXMgbm90IGEgdmFsaWQgdmVyc2lvbiwgcmV0dXJucyBkZWZhdWx0VmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgICAgICBkZWZhdWx0VmFsdWUgRmFsbGJhY2sgdmFsdWVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gbnVtYmVyXG4gKi9cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKVxuICB9XG5cbiAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxufVxuXG4vKipcbiAqIFJldHVybnMgaG93IG11Y2ggZGF0YSBjYW4gYmUgc3RvcmVkIHdpdGggdGhlIHNwZWNpZmllZCBRUiBjb2RlIHZlcnNpb25cbiAqIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gKDEtNDApXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICAgICAgICAgICAgICAgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIFF1YW50aXR5IG9mIHN0b3JhYmxlIGRhdGFcbiAqL1xuZXhwb3J0cy5nZXRDYXBhY2l0eSA9IGZ1bmN0aW9uIGdldENhcGFjaXR5ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkge1xuICBpZiAoIWV4cG9ydHMuaXNWYWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBRUiBDb2RlIHZlcnNpb24nKVxuICB9XG5cbiAgLy8gVXNlIEJ5dGUgbW9kZSBhcyBkZWZhdWx0XG4gIGlmICh0eXBlb2YgbW9kZSA9PT0gJ3VuZGVmaW5lZCcpIG1vZGUgPSBNb2RlLkJZVEVcblxuICAvLyBUb3RhbCBjb2Rld29yZHMgZm9yIHRoaXMgUVIgY29kZSB2ZXJzaW9uIChEYXRhICsgRXJyb3IgY29ycmVjdGlvbilcbiAgdmFyIHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcbiAgdmFyIGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcbiAgdmFyIGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcblxuICBpZiAobW9kZSA9PT0gTW9kZS5NSVhFRCkgcmV0dXJuIGRhdGFUb3RhbENvZGV3b3Jkc0JpdHNcblxuICB2YXIgdXNhYmxlQml0cyA9IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBnZXRSZXNlcnZlZEJpdHNDb3VudChtb2RlLCB2ZXJzaW9uKVxuXG4gIC8vIFJldHVybiBtYXggbnVtYmVyIG9mIHN0b3JhYmxlIGNvZGV3b3Jkc1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTApICogMylcblxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigodXNhYmxlQml0cyAvIDExKSAqIDIpXG5cbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gMTMpXG5cbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodXNhYmxlQml0cyAvIDgpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIHZlcnNpb24gbmVlZGVkIHRvIGNvbnRhaW4gdGhlIGFtb3VudCBvZiBkYXRhXG4gKlxuICogQHBhcmFtICB7U2VnbWVudH0gZGF0YSAgICAgICAgICAgICAgICAgICAgU2VnbWVudCBvZiBkYXRhXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IFtlcnJvckNvcnJlY3Rpb25MZXZlbD1IXSBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtNb2RlfSBtb2RlICAgICAgICAgICAgICAgICAgICAgICBEYXRhIG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICovXG5leHBvcnRzLmdldEJlc3RWZXJzaW9uRm9yRGF0YSA9IGZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yRGF0YSAoZGF0YSwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgdmFyIHNlZ1xuXG4gIHZhciBlY2wgPSBFQ0xldmVsLmZyb20oZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcblxuICBpZiAoaXNBcnJheShkYXRhKSkge1xuICAgIGlmIChkYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YShkYXRhLCBlY2wpXG4gICAgfVxuXG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHNlZyA9IGRhdGFbMF1cbiAgfSBlbHNlIHtcbiAgICBzZWcgPSBkYXRhXG4gIH1cblxuICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoKHNlZy5tb2RlLCBzZWcuZ2V0TGVuZ3RoKCksIGVjbClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHZlcnNpb24gaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBpbmZvcm1hdGlvbiBpcyBpbmNsdWRlZCBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiA3IG9yIGxhcmdlci5cbiAqIEl0IGNvbnNpc3RzIG9mIGFuIDE4LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDYgZGF0YSBiaXRzLFxuICogd2l0aCAxMiBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE4LCA2KSBHb2xheSBjb2RlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBFbmNvZGVkIHZlcnNpb24gaW5mbyBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0RW5jb2RlZEJpdHMgPSBmdW5jdGlvbiBnZXRFbmNvZGVkQml0cyAodmVyc2lvbikge1xuICBpZiAoIWV4cG9ydHMuaXNWYWxpZCh2ZXJzaW9uKSB8fCB2ZXJzaW9uIDwgNykge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBRUiBDb2RlIHZlcnNpb24nKVxuICB9XG5cbiAgdmFyIGQgPSB2ZXJzaW9uIDw8IDEyXG5cbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCA+PSAwKSB7XG4gICAgZCBePSAoRzE4IDw8IChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxOF9CQ0gpKVxuICB9XG5cbiAgcmV0dXJuICh2ZXJzaW9uIDw8IDEyKSB8IGRcbn1cbiIsInZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBjbGVhckNhbnZhcyAoY3R4LCBjYW52YXMsIHNpemUpIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG5cbiAgaWYgKCFjYW52YXMuc3R5bGUpIGNhbnZhcy5zdHlsZSA9IHt9XG4gIGNhbnZhcy5oZWlnaHQgPSBzaXplXG4gIGNhbnZhcy53aWR0aCA9IHNpemVcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IHNpemUgKyAncHgnXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IHNpemUgKyAncHgnXG59XG5cbmZ1bmN0aW9uIGdldENhbnZhc0VsZW1lbnQgKCkge1xuICB0cnkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBzcGVjaWZ5IGEgY2FudmFzIGVsZW1lbnQnKVxuICB9XG59XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xuICB2YXIgb3B0cyA9IG9wdGlvbnNcbiAgdmFyIGNhbnZhc0VsID0gY2FudmFzXG5cbiAgaWYgKHR5cGVvZiBvcHRzID09PSAndW5kZWZpbmVkJyAmJiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpKSB7XG4gICAgb3B0cyA9IGNhbnZhc1xuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKCFjYW52YXMpIHtcbiAgICBjYW52YXNFbCA9IGdldENhbnZhc0VsZW1lbnQoKVxuICB9XG5cbiAgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0cylcbiAgdmFyIHNpemUgPSBVdGlscy5nZXRJbWFnZVdpZHRoKHFyRGF0YS5tb2R1bGVzLnNpemUsIG9wdHMpXG5cbiAgdmFyIGN0eCA9IGNhbnZhc0VsLmdldENvbnRleHQoJzJkJylcbiAgdmFyIGltYWdlID0gY3R4LmNyZWF0ZUltYWdlRGF0YShzaXplLCBzaXplKVxuICBVdGlscy5xclRvSW1hZ2VEYXRhKGltYWdlLmRhdGEsIHFyRGF0YSwgb3B0cylcblxuICBjbGVhckNhbnZhcyhjdHgsIGNhbnZhc0VsLCBzaXplKVxuICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlLCAwLCAwKVxuXG4gIHJldHVybiBjYW52YXNFbFxufVxuXG5leHBvcnRzLnJlbmRlclRvRGF0YVVSTCA9IGZ1bmN0aW9uIHJlbmRlclRvRGF0YVVSTCAocXJEYXRhLCBjYW52YXMsIG9wdGlvbnMpIHtcbiAgdmFyIG9wdHMgPSBvcHRpb25zXG5cbiAgaWYgKHR5cGVvZiBvcHRzID09PSAndW5kZWZpbmVkJyAmJiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpKSB7XG4gICAgb3B0cyA9IGNhbnZhc1xuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cblxuICB2YXIgY2FudmFzRWwgPSBleHBvcnRzLnJlbmRlcihxckRhdGEsIGNhbnZhcywgb3B0cylcblxuICB2YXIgdHlwZSA9IG9wdHMudHlwZSB8fCAnaW1hZ2UvcG5nJ1xuICB2YXIgcmVuZGVyZXJPcHRzID0gb3B0cy5yZW5kZXJlck9wdHMgfHwge31cblxuICByZXR1cm4gY2FudmFzRWwudG9EYXRhVVJMKHR5cGUsIHJlbmRlcmVyT3B0cy5xdWFsaXR5KVxufVxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIGdldENvbG9yQXR0cmliIChjb2xvciwgYXR0cmliKSB7XG4gIHZhciBhbHBoYSA9IGNvbG9yLmEgLyAyNTVcbiAgdmFyIHN0ciA9IGF0dHJpYiArICc9XCInICsgY29sb3IuaGV4ICsgJ1wiJ1xuXG4gIHJldHVybiBhbHBoYSA8IDFcbiAgICA/IHN0ciArICcgJyArIGF0dHJpYiArICctb3BhY2l0eT1cIicgKyBhbHBoYS50b0ZpeGVkKDIpLnNsaWNlKDEpICsgJ1wiJ1xuICAgIDogc3RyXG59XG5cbmZ1bmN0aW9uIHN2Z0NtZCAoY21kLCB4LCB5KSB7XG4gIHZhciBzdHIgPSBjbWQgKyB4XG4gIGlmICh0eXBlb2YgeSAhPT0gJ3VuZGVmaW5lZCcpIHN0ciArPSAnICcgKyB5XG5cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBxclRvUGF0aCAoZGF0YSwgc2l6ZSwgbWFyZ2luKSB7XG4gIHZhciBwYXRoID0gJydcbiAgdmFyIG1vdmVCeSA9IDBcbiAgdmFyIG5ld1JvdyA9IGZhbHNlXG4gIHZhciBsaW5lTGVuZ3RoID0gMFxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjb2wgPSBNYXRoLmZsb29yKGkgJSBzaXplKVxuICAgIHZhciByb3cgPSBNYXRoLmZsb29yKGkgLyBzaXplKVxuXG4gICAgaWYgKCFjb2wgJiYgIW5ld1JvdykgbmV3Um93ID0gdHJ1ZVxuXG4gICAgaWYgKGRhdGFbaV0pIHtcbiAgICAgIGxpbmVMZW5ndGgrK1xuXG4gICAgICBpZiAoIShpID4gMCAmJiBjb2wgPiAwICYmIGRhdGFbaSAtIDFdKSkge1xuICAgICAgICBwYXRoICs9IG5ld1Jvd1xuICAgICAgICAgID8gc3ZnQ21kKCdNJywgY29sICsgbWFyZ2luLCAwLjUgKyByb3cgKyBtYXJnaW4pXG4gICAgICAgICAgOiBzdmdDbWQoJ20nLCBtb3ZlQnksIDApXG5cbiAgICAgICAgbW92ZUJ5ID0gMFxuICAgICAgICBuZXdSb3cgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpZiAoIShjb2wgKyAxIDwgc2l6ZSAmJiBkYXRhW2kgKyAxXSkpIHtcbiAgICAgICAgcGF0aCArPSBzdmdDbWQoJ2gnLCBsaW5lTGVuZ3RoKVxuICAgICAgICBsaW5lTGVuZ3RoID0gMFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtb3ZlQnkrK1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXRoXG59XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBvcHRzID0gVXRpbHMuZ2V0T3B0aW9ucyhvcHRpb25zKVxuICB2YXIgc2l6ZSA9IHFyRGF0YS5tb2R1bGVzLnNpemVcbiAgdmFyIGRhdGEgPSBxckRhdGEubW9kdWxlcy5kYXRhXG4gIHZhciBxcmNvZGVzaXplID0gc2l6ZSArIG9wdHMubWFyZ2luICogMlxuXG4gIHZhciBiZyA9ICFvcHRzLmNvbG9yLmxpZ2h0LmFcbiAgICA/ICcnXG4gICAgOiAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IubGlnaHQsICdmaWxsJykgK1xuICAgICAgJyBkPVwiTTAgMGgnICsgcXJjb2Rlc2l6ZSArICd2JyArIHFyY29kZXNpemUgKyAnSDB6XCIvPidcblxuICB2YXIgcGF0aCA9XG4gICAgJzxwYXRoICcgKyBnZXRDb2xvckF0dHJpYihvcHRzLmNvbG9yLmRhcmssICdzdHJva2UnKSArXG4gICAgJyBkPVwiJyArIHFyVG9QYXRoKGRhdGEsIHNpemUsIG9wdHMubWFyZ2luKSArICdcIi8+J1xuXG4gIHZhciB2aWV3Qm94ID0gJ3ZpZXdCb3g9XCInICsgJzAgMCAnICsgcXJjb2Rlc2l6ZSArICcgJyArIHFyY29kZXNpemUgKyAnXCInXG5cbiAgdmFyIHdpZHRoID0gIW9wdHMud2lkdGggPyAnJyA6ICd3aWR0aD1cIicgKyBvcHRzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBvcHRzLndpZHRoICsgJ1wiICdcblxuICB2YXIgc3ZnVGFnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiICcgKyB3aWR0aCArIHZpZXdCb3ggKyAnPicgKyBiZyArIHBhdGggKyAnPC9zdmc+J1xuXG4gIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYihudWxsLCBzdmdUYWcpXG4gIH1cblxuICByZXR1cm4gc3ZnVGFnXG59XG4iLCJmdW5jdGlvbiBoZXgycmdiYSAoaGV4KSB7XG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29sb3Igc2hvdWxkIGJlIGRlZmluZWQgYXMgaGV4IHN0cmluZycpXG4gIH1cblxuICB2YXIgaGV4Q29kZSA9IGhleC5zbGljZSgpLnJlcGxhY2UoJyMnLCAnJykuc3BsaXQoJycpXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA8IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDUgfHwgaGV4Q29kZS5sZW5ndGggPiA4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBjb2xvcjogJyArIGhleClcbiAgfVxuXG4gIC8vIENvbnZlcnQgZnJvbSBzaG9ydCB0byBsb25nIGZvcm0gKGZmZiAtPiBmZmZmZmYpXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gMyB8fCBoZXhDb2RlLmxlbmd0aCA9PT0gNCkge1xuICAgIGhleENvZGUgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBoZXhDb2RlLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIFtjLCBjXVxuICAgIH0pKVxuICB9XG5cbiAgLy8gQWRkIGRlZmF1bHQgYWxwaGEgdmFsdWVcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSA2KSBoZXhDb2RlLnB1c2goJ0YnLCAnRicpXG5cbiAgdmFyIGhleFZhbHVlID0gcGFyc2VJbnQoaGV4Q29kZS5qb2luKCcnKSwgMTYpXG5cbiAgcmV0dXJuIHtcbiAgICByOiAoaGV4VmFsdWUgPj4gMjQpICYgMjU1LFxuICAgIGc6IChoZXhWYWx1ZSA+PiAxNikgJiAyNTUsXG4gICAgYjogKGhleFZhbHVlID4+IDgpICYgMjU1LFxuICAgIGE6IGhleFZhbHVlICYgMjU1LFxuICAgIGhleDogJyMnICsgaGV4Q29kZS5zbGljZSgwLCA2KS5qb2luKCcnKVxuICB9XG59XG5cbmV4cG9ydHMuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cbiAgaWYgKCFvcHRpb25zLmNvbG9yKSBvcHRpb25zLmNvbG9yID0ge31cblxuICB2YXIgbWFyZ2luID0gdHlwZW9mIG9wdGlvbnMubWFyZ2luID09PSAndW5kZWZpbmVkJyB8fFxuICAgIG9wdGlvbnMubWFyZ2luID09PSBudWxsIHx8XG4gICAgb3B0aW9ucy5tYXJnaW4gPCAwID8gNCA6IG9wdGlvbnMubWFyZ2luXG5cbiAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLndpZHRoID49IDIxID8gb3B0aW9ucy53aWR0aCA6IHVuZGVmaW5lZFxuICB2YXIgc2NhbGUgPSBvcHRpb25zLnNjYWxlIHx8IDRcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBzY2FsZTogd2lkdGggPyA0IDogc2NhbGUsXG4gICAgbWFyZ2luOiBtYXJnaW4sXG4gICAgY29sb3I6IHtcbiAgICAgIGRhcms6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IuZGFyayB8fCAnIzAwMDAwMGZmJyksXG4gICAgICBsaWdodDogaGV4MnJnYmEob3B0aW9ucy5jb2xvci5saWdodCB8fCAnI2ZmZmZmZmZmJylcbiAgICB9LFxuICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICByZW5kZXJlck9wdHM6IG9wdGlvbnMucmVuZGVyZXJPcHRzIHx8IHt9XG4gIH1cbn1cblxuZXhwb3J0cy5nZXRTY2FsZSA9IGZ1bmN0aW9uIGdldFNjYWxlIChxclNpemUsIG9wdHMpIHtcbiAgcmV0dXJuIG9wdHMud2lkdGggJiYgb3B0cy53aWR0aCA+PSBxclNpemUgKyBvcHRzLm1hcmdpbiAqIDJcbiAgICA/IG9wdHMud2lkdGggLyAocXJTaXplICsgb3B0cy5tYXJnaW4gKiAyKVxuICAgIDogb3B0cy5zY2FsZVxufVxuXG5leHBvcnRzLmdldEltYWdlV2lkdGggPSBmdW5jdGlvbiBnZXRJbWFnZVdpZHRoIChxclNpemUsIG9wdHMpIHtcbiAgdmFyIHNjYWxlID0gZXhwb3J0cy5nZXRTY2FsZShxclNpemUsIG9wdHMpXG4gIHJldHVybiBNYXRoLmZsb29yKChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXG59XG5cbmV4cG9ydHMucXJUb0ltYWdlRGF0YSA9IGZ1bmN0aW9uIHFyVG9JbWFnZURhdGEgKGltZ0RhdGEsIHFyLCBvcHRzKSB7XG4gIHZhciBzaXplID0gcXIubW9kdWxlcy5zaXplXG4gIHZhciBkYXRhID0gcXIubW9kdWxlcy5kYXRhXG4gIHZhciBzY2FsZSA9IGV4cG9ydHMuZ2V0U2NhbGUoc2l6ZSwgb3B0cylcbiAgdmFyIHN5bWJvbFNpemUgPSBNYXRoLmZsb29yKChzaXplICsgb3B0cy5tYXJnaW4gKiAyKSAqIHNjYWxlKVxuICB2YXIgc2NhbGVkTWFyZ2luID0gb3B0cy5tYXJnaW4gKiBzY2FsZVxuICB2YXIgcGFsZXR0ZSA9IFtvcHRzLmNvbG9yLmxpZ2h0LCBvcHRzLmNvbG9yLmRhcmtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xTaXplOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN5bWJvbFNpemU7IGorKykge1xuICAgICAgdmFyIHBvc0RzdCA9IChpICogc3ltYm9sU2l6ZSArIGopICogNFxuICAgICAgdmFyIHB4Q29sb3IgPSBvcHRzLmNvbG9yLmxpZ2h0XG5cbiAgICAgIGlmIChpID49IHNjYWxlZE1hcmdpbiAmJiBqID49IHNjYWxlZE1hcmdpbiAmJlxuICAgICAgICBpIDwgc3ltYm9sU2l6ZSAtIHNjYWxlZE1hcmdpbiAmJiBqIDwgc3ltYm9sU2l6ZSAtIHNjYWxlZE1hcmdpbikge1xuICAgICAgICB2YXIgaVNyYyA9IE1hdGguZmxvb3IoKGkgLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXG4gICAgICAgIHZhciBqU3JjID0gTWF0aC5mbG9vcigoaiAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcbiAgICAgICAgcHhDb2xvciA9IHBhbGV0dGVbZGF0YVtpU3JjICogc2l6ZSArIGpTcmNdID8gMSA6IDBdXG4gICAgICB9XG5cbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5yXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuZ1xuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmJcbiAgICAgIGltZ0RhdGFbcG9zRHN0XSA9IHB4Q29sb3IuYVxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBhIHN1YnNldCBvZiBub2RlLmpzIEJ1ZmZlciBtZXRob2RzIGZvciB0aGUgYnJvd3Nlci5cbiAqIEJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgLy8gQ2FuIHR5cGVkIGFycmF5IGluc3RhbmNlcyBiZSBhdWdtZW50ZWQ/XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHtfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH19XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gdHlwZWRBcnJheVN1cHBvcnQoKVxuXG52YXIgS19NQVhfTEVOR1RIID0gQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgICA/IDB4N2ZmZmZmZmZcbiAgICA6IDB4M2ZmZmZmZmZcblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKGFyZywgb2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gYWxsb2NVbnNhZmUodGhpcywgYXJnKVxuICB9XG5cbiAgcmV0dXJuIGZyb20odGhpcywgYXJnLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbiAgQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcblxuICAvLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgJiZcbiAgICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwgS19NQVhfTEVOR1RIYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBLX01BWF9MRU5HVEgudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gaXNuYW4gKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSB2YWwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gICAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgYnVmID0gdGhhdFxuICAgIGlmIChidWYgPT09IG51bGwpIHtcbiAgICAgIGJ1ZiA9IG5ldyBCdWZmZXIobGVuZ3RoKVxuICAgIH1cbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlICh0aGF0LCBzaXplKSB7XG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG5cbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgKytpKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nICh0aGF0LCBzdHJpbmcpIHtcbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IGJ1Zi53cml0ZShzdHJpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICBidWYgPSBidWYuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlICh0aGF0LCBhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnb2Zmc2V0XFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdsZW5ndGhcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICB2YXIgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICBidWYgPSBmcm9tQXJyYXlMaWtlKHRoYXQsIGJ1ZilcbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAodGhhdCwgb2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIG9iai5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgfHwgJ2xlbmd0aCcgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IGlzbmFuKG9iai5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmouZGF0YSlcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJylcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmdcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGZyb20gKHRoYXQsIHZhbHVlLCBvZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih0aGF0LCB2YWx1ZSwgb2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHRoYXQsIHZhbHVlLCBvZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh0aGF0LCB2YWx1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8IDBcbiAgICB9IGVsc2Uge1xuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gICAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyArK2kpIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuICB2YXIgaVxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIGlmIChsZW4gPCAxMDAwIHx8ICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIGFzY2VuZGluZyBjb3B5IGZyb20gc3RhcnRcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCkge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogbmV3IEJ1ZmZlcih2YWwpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihudWxsLCAwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gYWxsb2NVbnNhZmUobnVsbCwgbGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVmZmVyXG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmKSB8fFxuICAodHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCkgfHxcbiAgdGhpc1xuIiwiLyogc2lsb3ouaW9cbiAqL1xuXG52YXIgZHVycnV0aSA9IHJlcXVpcmUoJ2R1cnJ1dGknKVxudmFyIE1haW4gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvbWFpbi5qcycpXG5cbmR1cnJ1dGkucmVuZGVyKE1haW4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHAnKSlcbiIsIi8qIGVkaXRvciBiYXJcbiAqL1xuXG5mdW5jdGlvbiBFZGl0b3JCYXIgKGFjdGlvbnMpIHtcbiAgdmFyIHBsdWdpbnMgPSBhY3Rpb25zLmdldFBsdWdpbnMoKVxuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBodG1sOiBbe1xuICAgICAgdGl0bGU6ICdIVE1MJ1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnTWFya2Rvd24nLFxuICAgICAgcGx1Z2luOiAnbWFya2Rvd24nXG4gICAgfV0sXG4gICAgY3NzOiBbe1xuICAgICAgdGl0bGU6ICdDU1MnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdMZXNzJyxcbiAgICAgIHBsdWdpbjogJ2xlc3MnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdTdHlsdXMnLFxuICAgICAgcGx1Z2luOiAnc3R5bHVzJ1xuICAgIH1dLFxuICAgIGpzOiBbe1xuICAgICAgdGl0bGU6ICdKYXZhU2NyaXB0J1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnRVMyMDE1L0JhYmVsJyxcbiAgICAgIHBsdWdpbjogJ2JhYmVsJ1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnQ29mZmVlU2NyaXB0JyxcbiAgICAgIHBsdWdpbjogJ2NvZmZlZXNjcmlwdCdcbiAgICB9XVxuICB9XG5cbiAgdmFyIHNlbGVjdGVkID0ge1xuICAgIGh0bWw6ICcnLFxuICAgIGNzczogJycsXG4gICAganM6ICcnXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQbHVnaW4gKGxpc3QsIG5hbWUpIHtcbiAgICB2YXIgZm91bmRQbHVnaW4gPSBudWxsXG4gICAgbGlzdC5zb21lKChwbHVnaW4pID0+IHtcbiAgICAgIGlmIChwbHVnaW4ucGx1Z2luID09PSBuYW1lKSB7XG4gICAgICAgIGZvdW5kUGx1Z2luID0gcGx1Z2luXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmb3VuZFBsdWdpblxuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlUHJvY2Vzc29yICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIHJlbW92ZSBsYXN0IHNlbGVjdGVkIHBsdWdpblxuICAgICAgYWN0aW9ucy5yZW1vdmVQbHVnaW4oc2VsZWN0ZWRbdHlwZV0pXG5cbiAgICAgIC8vIHVwZGF0ZSByZWZlcmVuY2VcbiAgICAgIHNlbGVjdGVkW3R5cGVdID0gdGhpcy52YWx1ZVxuXG4gICAgICB2YXIgcGx1Z2luID0gZ2V0UGx1Z2luKG9wdGlvbnNbdHlwZV0sIHNlbGVjdGVkW3R5cGVdKVxuICAgICAgaWYgKHBsdWdpbikge1xuICAgICAgICBhY3Rpb25zLmFkZFBsdWdpbihwbHVnaW4ucGx1Z2luKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNlbGVjdCAodHlwZSwgb3B0aW9ucywgc2VsZWN0ZWQpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPHNlbGVjdCBjbGFzcz1cInNlbGVjdCBlZGl0b3ItYmFyLXNlbGVjdC0ke3R5cGV9XCI+XG4gICAgICAgICR7b3B0aW9ucy5tYXAoKG9wdCkgPT4ge1xuICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiJHtvcHQucGx1Z2luIHx8ICcnfVwiICR7b3B0LnBsdWdpbiA9PT0gc2VsZWN0ZWQgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgICAke29wdC50aXRsZX1cbiAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgfSkuam9pbignJyl9XG4gICAgICA8L3NlbGVjdD5cbiAgICBgXG4gIH1cblxuICBmdW5jdGlvbiBzZXRJbml0aWFsVmFsdWVzICgpIHtcbiAgICAvLyBzZXQgc2VsZWN0ZWQgdmFsdWVzIGJhc2VkIG9uIHN0b3JlXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgb3B0aW9uc1t0eXBlXS5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgICAgaWYgKHBsdWdpbnMuaW5kZXhPZihvcHRpb24ucGx1Z2luKSAhPT0gLTEpIHtcbiAgICAgICAgICBzZWxlY3RlZFt0eXBlXSA9IG9wdGlvbi5wbHVnaW5cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VQYW5lICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBwYW5lcyA9IHt9XG4gICAgICBwYW5lc1t0eXBlXSA9IHtcbiAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICB9XG5cbiAgICAgIGFjdGlvbnMudXBkYXRlUGFuZXMocGFuZXMpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gICAgZm9yIChsZXQgdHlwZSBvZiBbICdodG1sJywgJ2NzcycsICdqcycgXSkge1xuICAgICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuZWRpdG9yLWJhci1zZWxlY3QtJHt0eXBlfWApLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZVByb2Nlc3Nvcih0eXBlKSlcblxuICAgICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuZWRpdG9yLWJhci1wYW5lLWNsb3NlLSR7dHlwZX1gKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlUGFuZSh0eXBlKSlcbiAgICB9XG4gIH1cblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZXRJbml0aWFsVmFsdWVzKClcblxuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lIGVkaXRvci1iYXItcGFuZS1odG1sXCI+XG4gICAgICAgICAgJHtjcmVhdGVTZWxlY3QoJ2h0bWwnLCBvcHRpb25zLmh0bWwsIHNlbGVjdGVkLmh0bWwpfVxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUtY2xvc2UgZWRpdG9yLWJhci1wYW5lLWNsb3NlLWh0bWwgYnRuXCIgdGl0bGU9XCJIaWRlIEhUTUxcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpY29uLWNsb3NlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZSBlZGl0b3ItYmFyLXBhbmUtY3NzXCI+XG4gICAgICAgICAgJHtjcmVhdGVTZWxlY3QoJ2NzcycsIG9wdGlvbnMuY3NzLCBzZWxlY3RlZC5jc3MpfVxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUtY2xvc2UgZWRpdG9yLWJhci1wYW5lLWNsb3NlLWNzcyBidG5cIiB0aXRsZT1cIkhpZGUgQ1NTXCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImljb24gaWNvbi1jbG9zZVwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUgZWRpdG9yLWJhci1wYW5lLWpzXCI+XG4gICAgICAgICAgJHtjcmVhdGVTZWxlY3QoJ2pzJywgb3B0aW9ucy5qcywgc2VsZWN0ZWQuanMpfVxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUtY2xvc2UgZWRpdG9yLWJhci1wYW5lLWNsb3NlLWpzIGJ0blwiIHRpdGxlPVwiSGlkZSBKYXZhU2NyaXB0XCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImljb24gaWNvbi1jbG9zZVwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmVcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvckJhclxuIiwiLyogZWRpdG9yIHdpZGdldFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgSm90dGVkID0gcmVxdWlyZSgnam90dGVkJylcbnZhciBnbG9iYWxBY3Rpb25zXG5cbi8vIGpvdHRlZCBwbHVnaW5cbkpvdHRlZC5wbHVnaW4oJ3NpbG96JywgZnVuY3Rpb24gKGpvdHRlZCwgb3B0aW9ucykge1xuICBqb3R0ZWQub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgZ2xvYmFsQWN0aW9ucy51cGRhdGVGaWxlKHtcbiAgICAgIHR5cGU6IHBhcmFtcy50eXBlLFxuICAgICAgY29udGVudDogcGFyYW1zLmNvbnRlbnRcbiAgICB9KVxuXG4gICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKVxuICB9LCAyKVxufSlcblxudmFyIHBsdWdpbkxpYnMgPSB7XG4gIG1hcmtkb3duOiBbJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL21hcmtlZC8wLjMuNi9tYXJrZWQubWluLmpzJ10sXG4gIGxlc3M6IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbGVzcy5qcy8yLjcuMS9sZXNzLm1pbi5qcyddLFxuICBzdHlsdXM6IFsnL2xpYnMvc3R5bHVzLm1pbi5qcyddLFxuICBjb2ZmZWVzY3JpcHQ6IFsnaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9qYXNoa2VuYXMvY29mZmVlc2NyaXB0LzEuMTEuMS9leHRyYXMvY29mZmVlLXNjcmlwdC5qcyddLFxuICBlczIwMTU6IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvYmFiZWwtY29yZS82LjEuMTkvYnJvd3Nlci5taW4uanMnXVxufVxuXG5mdW5jdGlvbiBFZGl0b3JXaWRnZXQgKGFjdGlvbnMpIHtcbiAgZ2xvYmFsQWN0aW9ucyA9IGFjdGlvbnNcblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICB2YXIgcGx1Z2lucyA9IGFjdGlvbnMuZ2V0UGx1Z2lucygpXG4gICAgdmFyIGxpYnMgPSBbXVxuXG4gICAgLy8gbG9hZCBsaWJzXG4gICAgT2JqZWN0LmtleXMocGx1Z2luTGlicykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgaWYgKHBsdWdpbnMuaW5kZXhPZihuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkobGlicywgcGx1Z2luTGlic1tuYW1lXS5tYXAoKHVybCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoZG9uZSkgPT4ge1xuICAgICAgICAgICAgdXRpbC5sb2FkU2NyaXB0KHVybCwgZG9uZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShwbHVnaW5zLCBbXG4gICAgICAnc2lsb3onLFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29kZW1pcnJvcicsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICB0aGVtZTogYWN0aW9ucy5nZXRUaGVtZSgpLFxuICAgICAgICAgIGxpbmVXcmFwcGluZzogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSlcblxuICAgIHV0aWwuYXN5bmMobGlicywgKCkgPT4ge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tbmV3ICovXG4gICAgICBuZXcgSm90dGVkKCRjb250YWluZXIsIHtcbiAgICAgICAgZmlsZXM6IGFjdGlvbnMuZ2V0RmlsZXMoKSxcbiAgICAgICAgcGx1Z2luczogcGx1Z2luc1xuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZWRpdG9yLXdpZGdldCBqb3R0ZWQtdGhlbWUtc2lsb3pcIj48L2Rpdj4nXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JXaWRnZXRcbiIsIi8qIGVkaXRvclxuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgRWRpdG9yQmFyID0gcmVxdWlyZSgnLi9lZGl0b3ItYmFyJylcbnZhciBFZGl0b3JXaWRnZXQgPSByZXF1aXJlKCcuL2VkaXRvci13aWRnZXQnKVxuXG5mdW5jdGlvbiBFZGl0b3IgKGFjdGlvbnMpIHtcbiAgdmFyIHBhbmVzID0gYWN0aW9ucy5nZXRQYW5lcygpXG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JcbiAgICAgICAgJHtwYW5lcy5odG1sLmhpZGRlbiA/ICdlZGl0b3ItaXMtaGlkZGVuLWh0bWwnIDogJyd9XG4gICAgICAgICR7cGFuZXMuY3NzLmhpZGRlbiA/ICdlZGl0b3ItaXMtaGlkZGVuLWNzcycgOiAnJ31cbiAgICAgICAgJHtwYW5lcy5qcy5oaWRkZW4gPyAnZWRpdG9yLWlzLWhpZGRlbi1qcycgOiAnJ31cbiAgICAgIFwiPlxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBFZGl0b3JCYXIoYWN0aW9ucykpfVxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBFZGl0b3JXaWRnZXQoYWN0aW9ucykpfVxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yXG4iLCIvKiBhYm91dFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgUG9wdXAgPSByZXF1aXJlKCcuLi9wb3B1cCcpXG5cbmZ1bmN0aW9uIEhlbHAgKGFjdGlvbnMsIGFjdGlvbnNJbnRlcm5hbCkge1xuICB2YXIgc2VsZiA9IHV0aWwuaW5oZXJpdHModGhpcywgUG9wdXApXG4gIFBvcHVwLmNhbGwoc2VsZiwgJ2Fib3V0JywgYWN0aW9uc0ludGVybmFsKVxuXG4gIHNlbGYubW91bnQgPSBzZWxmLnN1cGVyLm1vdW50LmJpbmQoc2VsZilcbiAgc2VsZi51bm1vdW50ID0gc2VsZi5zdXBlci51bm1vdW50LmJpbmQoc2VsZilcblxuICBzZWxmLnJlbmRlciA9ICgpID0+IHtcbiAgICByZXR1cm4gc2VsZi5zdXBlci5yZW5kZXIuY2FsbChzZWxmLCAnQWJvdXQnLCBgXG4gICAgICA8cD5cbiAgICAgICAgPGEgaHJlZj1cIi9cIj5zaWxvei5pbzwvYT4gaXMgYSBwcml2YXRlIGNvZGUgcGxheWdyb3VuZCBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIDwvcD5cblxuICAgICAgPHA+XG4gICAgICAgIFlvdXIgc291cmNlIGNvZGUgaXMgc2F2ZWQgaW4gdGhlIFVSTCBhbmQgbmV2ZXIgcmVhY2hlcyBvdXIgc2VydmVycy5cbiAgICAgIDwvcD5cblxuICAgICAgPHA+XG4gICAgICAgIFVzZSBIVE1MLCBDU1MgYW5kIEphdmFTY3JpcHQsIGFsb25nIHdpdGggcHJvY2Vzc29ycyBsaWtlIENvZmZlZVNjcmlwdCwgQmFiZWwvRVMyMDE1LCBMZXNzLCBTdHlsdXMgb3IgTWFya2Rvd24uXG4gICAgICA8L3A+XG5cbiAgICAgIDxoMj5cbiAgICAgICAgU2hvcnQgVVJMc1xuICAgICAgPC9oMj5cblxuICAgICAgPHA+XG4gICAgICAgIHNpbG96LmlvIGNhbiBnZW5lcmF0ZSBzaG9ydGVyIHVybHMsIGF0IGEgcHJpdmFjeSBjb3N0LlxuICAgICAgPC9wPlxuXG4gICAgICA8cD5cbiAgICAgICAgV2hlbiBhIHNob3J0IHVybCBpcyBnZW5lcmF0ZWQsIHRoZSB1cmwgIC0gdGhhdCBpbmNsdWRlcyB0aGUgc291cmNlIGNvZGUgLSBpcyBzYXZlZCBvbiB0aGUgc2VydmVyLCBhbG9uZyB3aXRoIGEgdW5pcXVlIHRva2VuLlxuICAgICAgPC9wPlxuXG4gICAgICA8cD5cbiAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9naGluZGEvc2lsb3ouaW9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgICBTb3VyY2UgY29kZSBhdmFpbGFibGUgb24gR2l0SHViLlxuICAgICAgICA8L2E+XG4gICAgICA8L3A+XG4gICAgYClcbiAgfVxuXG4gIHJldHVybiBzZWxmXG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVscFxuIiwiLyogaGVhZGVyXG4gKi9cblxudmFyIGR1cnJ1dGkgPSByZXF1aXJlKCdkdXJydXRpJylcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKVxudmFyIFNoYXJlID0gcmVxdWlyZSgnLi9zaGFyZScpXG52YXIgQWJvdXQgPSByZXF1aXJlKCcuL2Fib3V0JylcblxudmFyIEludGVybmFsU3RvcmUgPSByZXF1aXJlKCcuLi8uLi9zdGF0ZS9zdG9yZS1pbnRlcm5hbCcpXG52YXIgc3RvcmVJbnRlcm5hbCA9IG5ldyBJbnRlcm5hbFN0b3JlKClcblxuZnVuY3Rpb24gSGVhZGVyIChhY3Rpb25zKSB7XG4gIHZhciAkY29udGFpbmVyXG4gIHZhciBkYXRhID0gc3RvcmVJbnRlcm5hbC5nZXQoKVxuICB2YXIgYWN0aW9uc0ludGVybmFsID0gc3RvcmVJbnRlcm5hbC5hY3Rpb25zXG4gIHZhciBsb2FkaW5nQ29sbGFib3JhdGUgPSBhY3Rpb25zSW50ZXJuYWwuZ2V0TG9hZGluZygnY29sbGFib3JhdGUnKVxuXG4gIHZhciBjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBzdG9yZUludGVybmFsLmdldCgpXG5cbiAgICAvLyBpZiBzb21ldGhpbmcgY2hhbmdlZC5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGF0YSkgIT09IEpTT04uc3RyaW5naWZ5KG5ld0RhdGEpKSB7XG4gICAgICBkdXJydXRpLnJlbmRlcihuZXcgSGVhZGVyKGFjdGlvbnMpLCAkY29udGFpbmVyKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUgKCkge1xuICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVMb2FkaW5nKCdjb2xsYWJvcmF0ZScsIGZhbHNlKVxuICB9XG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkbm9kZSkge1xuICAgICRjb250YWluZXIgPSAkbm9kZVxuXG4gICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY29sbGFib3JhdGUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIC8vIGxvYWRpbmdcbiAgICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVMb2FkaW5nKCdjb2xsYWJvcmF0ZScsIHRydWUpXG5cbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTKClcblxuICAgICAgd2luZG93LlRvZ2V0aGVySlMub24oJ3JlYWR5JywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTLm9uKCdjbG9zZScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgfSlcblxuICAgIHN0b3JlSW50ZXJuYWwub24oJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAod2luZG93LlRvZ2V0aGVySlMpIHtcbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTLm9mZigncmVhZHknLCBkb25lTG9hZGluZ0NvbGxhYm9yYXRlKVxuICAgICAgd2luZG93LlRvZ2V0aGVySlMub2ZmKCdjbG9zZScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgfVxuXG4gICAgc3RvcmVJbnRlcm5hbC5vZmYoJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgXG4gICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgIDxhIGhyZWY9XCIvXCIgY2xhc3M9XCJoZWFkZXItbG9nb1wiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiL2ltYWdlcy9sb2dvLnBuZ1wiIGhlaWdodD1cIjE2XCIgYWx0PVwic2lsb3ouaW9cIj5cbiAgICAgICAgPC9hPlxuXG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEFib3V0KGFjdGlvbnMsIHN0b3JlSW50ZXJuYWwuYWN0aW9ucykpfVxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBTZXR0aW5ncyhhY3Rpb25zLCBzdG9yZUludGVybmFsLmFjdGlvbnMpKX1cblxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBTaGFyZShhY3Rpb25zLCBzdG9yZUludGVybmFsLmFjdGlvbnMpKX1cblxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBjb2xsYWJvcmF0ZSAke2xvYWRpbmdDb2xsYWJvcmF0ZSA/ICdpcy1sb2FkaW5nJyA6ICcnfVwiPlxuICAgICAgICAgIENvbGxhYm9yYXRlXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyXG4iLCIvKiBzZXR0aW5nc1xuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgUG9wdXAgPSByZXF1aXJlKCcuLi9wb3B1cCcpXG5cbmZ1bmN0aW9uIFNldHRpbmdzIChhY3Rpb25zLCBhY3Rpb25zSW50ZXJuYWwpIHtcbiAgdmFyIHNlbGYgPSB1dGlsLmluaGVyaXRzKHRoaXMsIFBvcHVwKVxuICBQb3B1cC5jYWxsKHNlbGYsICdzZXR0aW5ncycsIGFjdGlvbnNJbnRlcm5hbClcblxuICB2YXIgcGFuZXMgPSBhY3Rpb25zLmdldFBhbmVzKClcbiAgdmFyIHRoZW1lID0gYWN0aW9ucy5nZXRUaGVtZSgpXG5cbiAgZnVuY3Rpb24gdG9nZ2xlUGFuZSAodHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHBhbmVzID0ge31cbiAgICAgIHBhbmVzW3R5cGVdID0geyBoaWRkZW46ICEoZS50YXJnZXQuY2hlY2tlZCkgfVxuICAgICAgcmV0dXJuIGFjdGlvbnMudXBkYXRlUGFuZXMocGFuZXMpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0VGhlbWUgKCkge1xuICAgIGFjdGlvbnMudXBkYXRlVGhlbWUodGhpcy52YWx1ZSlcbiAgfVxuXG4gIHNlbGYubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIHNlbGYuc3VwZXIubW91bnQuY2FsbChzZWxmLCAkY29udGFpbmVyKVxuXG4gICAgdmFyICRzaG93SHRtbCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXNob3ctaHRtbCcpXG4gICAgdmFyICRzaG93Q3NzID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3Mtc2hvdy1jc3MnKVxuICAgIHZhciAkc2hvd0pzID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3Mtc2hvdy1qcycpXG5cbiAgICAkc2hvd0h0bWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdG9nZ2xlUGFuZSgnaHRtbCcpKVxuICAgICRzaG93Q3NzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRvZ2dsZVBhbmUoJ2NzcycpKVxuICAgICRzaG93SnMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdG9nZ2xlUGFuZSgnanMnKSlcblxuICAgICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXRoZW1lJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgc2V0VGhlbWUpXG4gIH1cblxuICBzZWxmLnVubW91bnQgPSBzZWxmLnN1cGVyLnVubW91bnQuYmluZChzZWxmKVxuXG4gIHNlbGYucmVuZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiBzZWxmLnN1cGVyLnJlbmRlci5jYWxsKHNlbGYsICdTZXR0aW5ncycsIGBcbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBUYWJzXG4gICAgICAgIDwvbGVnZW5kPlxuXG4gICAgICAgIDxsYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJzZXR0aW5ncy1zaG93LWh0bWxcIiAkeyFwYW5lcy5odG1sLmhpZGRlbiA/ICdjaGVja2VkJyA6ICcnfT5cbiAgICAgICAgICBIVE1MXG4gICAgICAgIDwvbGFiZWw+XG5cbiAgICAgICAgPGxhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cInNldHRpbmdzLXNob3ctY3NzXCIgJHshcGFuZXMuY3NzLmhpZGRlbiA/ICdjaGVja2VkJyA6ICcnfT5cbiAgICAgICAgICBDU1NcbiAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2V0dGluZ3Mtc2hvdy1qc1wiICR7IXBhbmVzLmpzLmhpZGRlbiA/ICdjaGVja2VkJyA6ICcnfT5cbiAgICAgICAgICBKYXZhU2NyaXB0XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L2ZpZWxkc2V0PlxuXG4gICAgICA8ZmllbGRzZXQ+XG4gICAgICAgIDxsZWdlbmQ+XG4gICAgICAgICAgVGhlbWVcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPHNlbGVjdCBjbGFzcz1cInNldHRpbmdzLXRoZW1lIHNlbGVjdFwiPlxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJzb2xhcml6ZWQgbGlnaHRcIiAke3RoZW1lID09PSAnc29sYXJpemVkIGxpZ2h0JyA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICBTb2xhcml6ZWQgTGlnaHRcbiAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwic29sYXJpemVkIGRhcmtcIiAke3RoZW1lID09PSAnc29sYXJpemVkIGRhcmsnID8gJ3NlbGVjdGVkJyA6ICcnfT5cbiAgICAgICAgICAgIFNvbGFyaXplZCBEYXJrXG4gICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgPC9maWVsZHNldD5cbiAgICBgKVxuICB9XG5cbiAgcmV0dXJuIHNlbGZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nc1xuIiwiLyogc2hhcmVcbiAqL1xuXG52YXIgcXJjb2RlID0gcmVxdWlyZSgncXJjb2RlJylcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBQb3B1cCA9IHJlcXVpcmUoJy4uL3BvcHVwJylcblxuZnVuY3Rpb24gU2hhcmUgKGFjdGlvbnMsIGFjdGlvbnNJbnRlcm5hbCkge1xuICB2YXIgc2VsZiA9IHV0aWwuaW5oZXJpdHModGhpcywgUG9wdXApXG4gIFBvcHVwLmNhbGwoc2VsZiwgJ3NoYXJlJywgYWN0aW9uc0ludGVybmFsKVxuXG4gIHZhciBsb25nVXJsID0gJydcbiAgdmFyIHFyID0gYWN0aW9uc0ludGVybmFsLmdldFFyKClcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb25nVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcHkgKCRpbnB1dCkge1xuICAgIHJldHVybiAoZSkgPT4ge1xuICAgICAgdmFyICRidG4gPSB1dGlsLmNsb3Nlc3QoZS50YXJnZXQsICcuYnRuJylcblxuICAgICAgJGlucHV0LnNlbGVjdCgpXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcblxuICAgICAgICAkYnRuLmlubmVySFRNTCA9ICdDb3BpZWQnXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICRidG4uaW5uZXJIVE1MID0gJ0NvcHknXG4gICAgICAgIH0sIDIwMDApXG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGUgKCkge1xuICAgIHFyY29kZS50b0RhdGFVUkwobG9uZ1VybCwge1xuICAgICAgbWFyZ2luOiAyLFxuICAgICAgY29sb3I6IHtcbiAgICAgICAgbGlnaHQ6ICcjZmRmYmY0J1xuICAgICAgfVxuICAgIH0sIChlcnIsIHVybCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gYWN0aW9uc0ludGVybmFsLnVwZGF0ZVFyKHtcbiAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgIGVycm9yOiBlcnIudG9TdHJpbmcoKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBhY3Rpb25zSW50ZXJuYWwudXBkYXRlUXIoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgZXJyb3I6ICcnXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBzZWxmLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICBzZWxmLnN1cGVyLm1vdW50LmNhbGwoc2VsZiwgJGNvbnRhaW5lcilcblxuICAgIHZhciAkbG9uZ1VybCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNoYXJlLXVybC1pbnB1dC1sb25nJylcbiAgICB2YXIgJGxvbmdVcmxDb3B5ID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtdXJsLWNvcHktbG9uZycpXG5cbiAgICAkbG9uZ1VybENvcHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb3B5KCRsb25nVXJsKSlcbiAgfVxuXG4gIHNlbGYudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLnN1cGVyLnVubW91bnQuY2FsbChzZWxmKVxuICB9XG5cbiAgdmFyIG9sZFRvZ2dsZVBvcHVwID0gc2VsZi50b2dnbGVQb3B1cFxuICBzZWxmLnRvZ2dsZVBvcHVwID0gKCkgPT4ge1xuICAgIG9sZFRvZ2dsZVBvcHVwKClcblxuICAgIGlmICh0aGlzLnN0YXRlID09PSB0cnVlKSB7XG4gICAgICBnZW5lcmF0ZSgpXG4gICAgfVxuICB9XG5cbiAgc2VsZi5yZW5kZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGYuc3VwZXIucmVuZGVyLmNhbGwoc2VsZiwgJ1NoYXJlJywgYFxuICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiJHtxci51cmwgPyAnc2hhcmUtaXMtZ2VuZXJhdGVkJyA6ICcnfVwiPlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFFSIGNvZGVcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPGltZyBzcmM9XCIke3FyLnVybH1cIiBjbGFzcz1cInFyLXByZXZpZXdcIj5cblxuICAgICAgICA8cCBjbGFzcz1cInNoYXJlLXFyLWVycm9yXCI+XG4gICAgICAgICAgJHtxci5lcnJvcn1cbiAgICAgICAgPC9wPlxuICAgICAgPC9maWVsZHNldD5cbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBQZXJzaXN0ZW50IFVSTFxuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwic2hhcmUtdXJsXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzaGFyZS11cmwtaW5wdXQgc2hhcmUtdXJsLWlucHV0LWxvbmdcIiB2YWx1ZT1cIiR7bG9uZ1VybH1cIiByZWFkb25seT5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBzaGFyZS11cmwtY29weSBzaGFyZS11cmwtY29weS1sb25nXCI+XG4gICAgICAgICAgICBDb3B5XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9maWVsZHNldD5cbiAgICBgKVxuICB9XG5cbiAgcmV0dXJuIHNlbGZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVxuIiwiLyogbWFpblxuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIvaGVhZGVyJylcbnZhciBFZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvci9lZGl0b3InKVxuXG52YXIgR2xvYmFsU3RvcmUgPSByZXF1aXJlKCcuLi9zdGF0ZS9zdG9yZScpXG52YXIgc3RvcmUgPSBuZXcgR2xvYmFsU3RvcmUoKVxuXG5mdW5jdGlvbiBNYWluICgpIHtcbiAgdmFyICRjb250YWluZXJcbiAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICB2YXIgdGhlbWUgPSBzdG9yZS5hY3Rpb25zLmdldFRoZW1lKClcblxuICB2YXIgY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBuZXdEYXRhID0gc3RvcmUuZ2V0KClcblxuICAgIC8vIGRvbid0IGNvbXBhcmUgZmlsZXNcbiAgICBkZWxldGUgZGF0YS5maWxlc1xuICAgIGRlbGV0ZSBuZXdEYXRhLmZpbGVzXG5cbiAgICAvLyBpZiBzb21ldGhpbmcgY2hhbmdlZCxcbiAgICAvLyBleGNlcHQgdGhlIGZpbGVzLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkYXRhKSAhPT0gSlNPTi5zdHJpbmdpZnkobmV3RGF0YSkpIHtcbiAgICAgIGR1cnJ1dGkucmVuZGVyKE1haW4sICRjb250YWluZXIpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkbm9kZSkge1xuICAgICRjb250YWluZXIgPSAkbm9kZVxuXG4gICAgc3RvcmUub24oJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzdG9yZS5vZmYoJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibWFpbiBzaWxvei10aGVtZS0ke3RoZW1lLnJlcGxhY2UoLyAvZywgJy0nKX1cIj5cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgSGVhZGVyKHN0b3JlLmFjdGlvbnMpKX1cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgRWRpdG9yKHN0b3JlLmFjdGlvbnMpKX1cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5cbiIsIi8qIHBvcHVwXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJylcblxuZnVuY3Rpb24gUG9wdXAgKG5hbWUsIGFjdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gbmFtZVxuICB0aGlzLnN0YXRlID0gYWN0aW9ucy5nZXRQb3B1cChuYW1lKVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zXG4gIHRoaXMudG9nZ2xlUG9wdXAgPSB0aGlzLnByb3RvdHlwZS50b2dnbGVQb3B1cC5iaW5kKHRoaXMpXG4gIHRoaXMuaGlkZVBvcHVwID0gdGhpcy5wcm90b3R5cGUuaGlkZVBvcHVwLmJpbmQodGhpcylcbn1cblxuUG9wdXAucHJvdG90eXBlLnRvZ2dsZVBvcHVwID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGVcbiAgdGhpcy5hY3Rpb25zLnVwZGF0ZVBvcHVwKHRoaXMubmFtZSwgdGhpcy5zdGF0ZSlcbn1cblxuUG9wdXAucHJvdG90eXBlLmhpZGVQb3B1cCA9IGZ1bmN0aW9uIChlKSB7XG4gIGlmICh1dGlsLmNsb3Nlc3QoZS50YXJnZXQsICcucG9wdXAnKSB8fCBlLnRhcmdldCA9PT0gdGhpcy4kYnV0dG9uIHx8ICF0aGlzLnN0YXRlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLmFjdGlvbnMudXBkYXRlUG9wdXAodGhpcy5uYW1lLCBmYWxzZSlcbn1cblxuUG9wdXAucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgdGhpcy4kY29udGFpbmVyID0gJGNvbnRhaW5lclxuICB0aGlzLiRidXR0b24gPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5wb3B1cC1idXR0b24nKVxuXG4gIHRoaXMuJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudG9nZ2xlUG9wdXApXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oaWRlUG9wdXApXG59XG5cblBvcHVwLnByb3RvdHlwZS51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGlkZVBvcHVwKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKHRpdGxlLCBjb250ZW50KSB7XG4gIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz1cInBvcHVwLWNvbnRhaW5lciAke3RoaXMubmFtZX0gJHt0aGlzLnN0YXRlID8gJ3BvcHVwLWNvbnRhaW5lci1pcy1vcGVuJyA6ICcnfVwiPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCIke3RoaXMubmFtZX0tYnV0dG9uIHBvcHVwLWJ1dHRvbiBidG5cIj5cbiAgICAgICAgJHt0aXRsZX1cbiAgICAgIDwvYnV0dG9uPlxuXG4gICAgICA8Zm9ybSBjbGFzcz1cIiR7dGhpcy5uYW1lfS1wb3B1cCBwb3B1cFwiPlxuICAgICAgICAke2NvbnRlbnR9XG4gICAgICA8L2Zvcm0+XG4gICAgPC9kaXY+XG4gIGBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQb3B1cFxuIiwiLyogc3RvcmUgYWN0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGFjdGlvbnMgKHN0b3JlKSB7XG4gIGZ1bmN0aW9uIGdldFBvcHVwIChuYW1lKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnBvcHVwW25hbWVdXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVQb3B1cCAobmFtZSwgc3RhdGUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS5wb3B1cFtuYW1lXSA9IHN0YXRlXG5cbiAgICBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExvYWRpbmcgKG5hbWUpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkubG9hZGluZ1tuYW1lXVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTG9hZGluZyAobmFtZSwgc3RhdGUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS5sb2FkaW5nW25hbWVdID0gc3RhdGVcblxuICAgIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UXIgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5xclxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUXIgKHVybCkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLnFyID0gdXJsXG5cbiAgICBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0UG9wdXA6IGdldFBvcHVwLFxuICAgIHVwZGF0ZVBvcHVwOiB1cGRhdGVQb3B1cCxcblxuICAgIGdldExvYWRpbmc6IGdldExvYWRpbmcsXG4gICAgdXBkYXRlTG9hZGluZzogdXBkYXRlTG9hZGluZyxcblxuICAgIGdldFFyOiBnZXRRcixcbiAgICB1cGRhdGVRcjogdXBkYXRlUXJcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnNcbiIsIi8qIHN0b3JlIGFjdGlvbnNcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG5mdW5jdGlvbiBhY3Rpb25zIChzdG9yZSkge1xuICBmdW5jdGlvbiBnZXRGaWxlcyAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLmZpbGVzXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVGaWxlIChuZXdGaWxlKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuXG4gICAgZGF0YS5maWxlcy5zb21lKChmaWxlLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGZpbGUudHlwZSA9PT0gbmV3RmlsZS50eXBlKSB7XG4gICAgICAgIGRhdGEuZmlsZXNbaW5kZXhdID0gdXRpbC5leHRlbmQobmV3RmlsZSwgZGF0YS5maWxlc1tpbmRleF0pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBsdWdpbnMgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5wbHVnaW5zXG4gIH1cblxuICBmdW5jdGlvbiBhZGRQbHVnaW4gKG5ld1BsdWdpbikge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcblxuICAgIGRhdGEucGx1Z2lucy5wdXNoKG5ld1BsdWdpbilcbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVQbHVnaW4gKG9sZFBsdWdpbikge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICB2YXIgcGx1Z2luTmFtZSA9ICcnXG5cbiAgICBpZiAodHlwZW9mIG9sZFBsdWdpbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHBsdWdpbk5hbWUgPSBvbGRQbHVnaW4ubmFtZVxuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW5OYW1lID0gb2xkUGx1Z2luXG4gICAgfVxuXG4gICAgZGF0YS5wbHVnaW5zLnNvbWUoKHBsdWdpbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmICgodHlwZW9mIHBsdWdpbiA9PT0gJ29iamVjdCcgJiYgcGx1Z2luLm5hbWUgPT09IHBsdWdpbk5hbWUpIHx8XG4gICAgICAgICAgKHR5cGVvZiBwbHVnaW4gPT09ICdzdHJpbmcnICYmIHBsdWdpbiA9PT0gcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgZGF0YS5wbHVnaW5zLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGFuZXMgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5wYW5lc1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUGFuZXMgKG5ld1BhbmVzKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEucGFuZXMgPSB1dGlsLmV4dGVuZChuZXdQYW5lcywgZGF0YS5wYW5lcylcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRoZW1lICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkudGhlbWVcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVRoZW1lICh0aGVtZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLnRoZW1lID0gdGhlbWVcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0RmlsZXM6IGdldEZpbGVzLFxuICAgIHVwZGF0ZUZpbGU6IHVwZGF0ZUZpbGUsXG5cbiAgICBnZXRQbHVnaW5zOiBnZXRQbHVnaW5zLFxuICAgIGFkZFBsdWdpbjogYWRkUGx1Z2luLFxuICAgIHJlbW92ZVBsdWdpbjogcmVtb3ZlUGx1Z2luLFxuXG4gICAgZ2V0UGFuZXM6IGdldFBhbmVzLFxuICAgIHVwZGF0ZVBhbmVzOiB1cGRhdGVQYW5lcyxcblxuICAgIGdldFRoZW1lOiBnZXRUaGVtZSxcbiAgICB1cGRhdGVUaGVtZTogdXBkYXRlVGhlbWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnNcbiIsIi8qIGludGVybmFsIHN0b3JlLFxuICogbm90IHN0b3JlZCBpbiB1cmxcbiAqL1xuXG52YXIgU3RvcmUgPSByZXF1aXJlKCdkdXJydXRpL3N0b3JlJylcbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zLWludGVybmFsJylcblxudmFyIGRlZmF1bHRzID0ge1xuICBwb3B1cDoge30sXG4gIGxvYWRpbmc6IHt9LFxuICBxcjoge1xuICAgIHVybDogJycsXG4gICAgZXJyb3I6ICcnXG4gIH1cbn1cblxudmFyIEludGVybmFsU3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gIFN0b3JlLmNhbGwodGhpcylcbiAgdGhpcy5hY3Rpb25zID0gYWN0aW9ucyh0aGlzKVxuXG4gIHRoaXMuc2V0KGRlZmF1bHRzKVxufVxuXG5JbnRlcm5hbFN0b3JlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUucHJvdG90eXBlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVybmFsU3RvcmVcblxuIiwiLyogc3RvcmVcbiAqL1xuXG52YXIgU3RvcmUgPSByZXF1aXJlKCdkdXJydXRpL3N0b3JlJylcbnZhciBMWlN0cmluZyA9IHJlcXVpcmUoJ2x6LXN0cmluZycpXG52YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIHZlcnNpb246IDEsXG4gIGZpbGVzOiBbe1xuICAgIHR5cGU6ICdodG1sJyxcbiAgICBjb250ZW50OiAnJ1xuICB9LCB7XG4gICAgdHlwZTogJ2NzcycsXG4gICAgY29udGVudDogJydcbiAgfSwge1xuICAgIHR5cGU6ICdqcycsXG4gICAgY29udGVudDogJydcbiAgfV0sXG4gIHBsdWdpbnM6IFtdLFxuICB0aGVtZTogJ3NvbGFyaXplZCBsaWdodCcsXG5cbiAgLy8gcGFuZSBwcm9wZXJ0aWVzIChoaWRkZW4sIGV0YylcbiAgcGFuZXM6IHtcbiAgICBodG1sOiB7fSxcbiAgICBjc3M6IHt9LFxuICAgIGpzOiB7fVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VMb2NhdGlvbkhhc2ggKCkge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfVxuXG4gIGlmICh0eXBlb2Ygd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiAoaGFzaCkgPT4ge1xuICAgICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIG51bGwsIGAjJHtoYXNofWApXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAoaGFzaCkgPT4ge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoYCR7d2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXX0jJHtoYXNofWApXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlSGFzaCAoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKExaU3RyaW5nLmRlY29tcHJlc3NGcm9tRW5jb2RlZFVSSUNvbXBvbmVudCh1dGlsLmhhc2goJ3MnKSkpXG4gIH0gY2F0Y2ggKGVycikge31cblxuICByZXR1cm4gbnVsbFxufVxuXG52YXIgR2xvYmFsU3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gIFN0b3JlLmNhbGwodGhpcylcbiAgdGhpcy5hY3Rpb25zID0gYWN0aW9ucyh0aGlzKVxuXG4gIHZhciByZXBsYWNlSGFzaCA9IHJlcGxhY2VMb2NhdGlvbkhhc2goKVxuICB2YXIgY29tcHJlc3NlZERhdGEgPSAnJ1xuXG4gIHZhciBoYXNoRGF0YSA9IHBhcnNlSGFzaCgpXG4gIGlmIChoYXNoRGF0YSkge1xuICAgIHRoaXMuc2V0KHV0aWwuZXh0ZW5kKGhhc2hEYXRhLCBkZWZhdWx0cykpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zZXQoZGVmYXVsdHMpXG4gIH1cblxuICB0aGlzLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgLy8gc2F2ZSBpbiBoYXNoXG4gICAgdmFyIGRhdGEgPSB0aGlzLmdldCgpXG5cbiAgICBjb21wcmVzc2VkRGF0YSA9IExaU3RyaW5nLmNvbXByZXNzVG9FbmNvZGVkVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgIHJlcGxhY2VIYXNoKHV0aWwuaGFzaCgncycsIGNvbXByZXNzZWREYXRhKSlcbiAgfSlcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IHtcbiAgICAgIC8vIGZvcmNlIHBhZ2UgcmVsb2FkIGlmIG9ubHkgaGFzaCBjaGFuZ2VkLFxuICAgICAgLy8gYW5kIGNvbXByZXNzZWQgZGF0YSBpcyBkaWZmZXJlbnQuXG4gICAgICAvLyBlZy4gbWFudWFsbHkgY2hhbmdpbmcgdXJsIGhhc2guXG4gICAgICBpZiAodXRpbC5oYXNoKCdzJykgIT09IGNvbXByZXNzZWREYXRhKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuR2xvYmFsU3RvcmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdG9yZS5wcm90b3R5cGUpXG5cbm1vZHVsZS5leHBvcnRzID0gR2xvYmFsU3RvcmVcblxuIiwiLyogdXRpbFxuICovXG5cbmZ1bmN0aW9uIGNsb3Nlc3QgKCRlbGVtLCBzZWxlY3Rvcikge1xuICAvLyBmaW5kIHRoZSBjbG9zZXN0IHBhcmVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yXG4gIHZhciAkbWF0Y2hlc1xuXG4gIC8vIGxvb3AgdGhyb3VnaCBwYXJlbnRzXG4gIHdoaWxlICgkZWxlbSAmJiAkZWxlbSAhPT0gZG9jdW1lbnQpIHtcbiAgICBpZiAoJGVsZW0ucGFyZW50Tm9kZSkge1xuICAgICAgLy8gZmluZCBhbGwgc2libGluZ3MgdGhhdCBtYXRjaCB0aGUgc2VsZWN0b3JcbiAgICAgICRtYXRjaGVzID0gJGVsZW0ucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgLy8gY2hlY2sgaWYgb3VyIGVsZW1lbnQgaXMgbWF0Y2hlZCAocG9vci1tYW4ncyBFbGVtZW50Lm1hdGNoZXMoKSlcbiAgICAgIGlmIChbXS5pbmRleE9mLmNhbGwoJG1hdGNoZXMsICRlbGVtKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuICRlbGVtXG4gICAgICB9XG5cbiAgICAgIC8vIGdvIHVwIHRoZSB0cmVlXG4gICAgICAkZWxlbSA9ICRlbGVtLnBhcmVudE5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBjbG9uZSAob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpXG59XG5cbmZ1bmN0aW9uIGV4dGVuZExldmVsIChvYmosIGRlZmF1bHRzID0ge30pIHtcbiAgLy8gY29weSBkZWZhdWx0IGtleXMgd2hlcmUgdW5kZWZpbmVkXG4gIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gZGVmYXVsdFxuICAgICAgb2JqW2tleV0gPSBjbG9uZShkZWZhdWx0c1trZXldKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgZXh0ZW5kTGV2ZWwob2JqW2tleV0sIGRlZmF1bHRzW2tleV0pXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYmpcbn1cblxuLy8gbXVsdGktbGV2ZWwgb2JqZWN0IG1lcmdlXG5mdW5jdGlvbiBleHRlbmQgKG9iaiwgZGVmYXVsdHMpIHtcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHt9XG4gIH1cblxuICByZXR1cm4gZXh0ZW5kTGV2ZWwoY2xvbmUob2JqKSwgZGVmYXVsdHMpXG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlIChmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgdmFyIHRpbWVvdXRcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50c1xuICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbFxuICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgIGlmIChjYWxsTm93KSB7XG4gICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRTY3JpcHQgKHVybCwgZG9uZSA9ICgpID0+IHt9KSB7XG4gIHZhciAkc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgJHNjcmlwdC5zcmMgPSB1cmxcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCgkc2NyaXB0KVxuXG4gICRzY3JpcHQub25sb2FkID0gZG9uZVxufVxuXG5mdW5jdGlvbiBhc3luYyAoYXJyLCBkb25lLCBpID0gMCkge1xuICBpZiAoYXJyLmxlbmd0aCA9PT0gaSkge1xuICAgIHJldHVybiBkb25lKClcbiAgfVxuXG4gIGFycltpXSgoKSA9PiB7XG4gICAgaSsrXG4gICAgYXN5bmMoYXJyLCBkb25lLCBpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBmZXRjaCAocGF0aCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgLy8gb3B0aW9ucyBub3Qgc3BlY2lmaWVkXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgdHlwZTogJ0dFVCcsXG4gICAgZGF0YToge31cbiAgfSlcblxuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgcmVxdWVzdC5vcGVuKG9wdGlvbnMudHlwZSwgcGF0aClcbiAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04JylcbiAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdYLVJlcXVlc3RlZC1XaXRoJywgJ1hNTEh0dHBSZXF1ZXN0JylcblxuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQgfHwgJ3t9JylcblxuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXJyb3JcbiAgICAgIGNhbGxiYWNrKHJlcXVlc3QpXG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGVycm9yXG4gICAgY2FsbGJhY2socmVxdWVzdClcbiAgfVxuXG4gIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpKVxufVxuXG5mdW5jdGlvbiBpbmhlcml0cyAoYmFzZUNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGJhc2VDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKVxuICBiYXNlQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYmFzZUNsYXNzXG5cbiAgYmFzZUNsYXNzLnN1cGVyID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGJhc2VDbGFzcy5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIGJhc2VDbGFzc1xufVxuXG5mdW5jdGlvbiBoYXNoIChrZXksIHZhbHVlKSB7XG4gIHZhciBoYXNoUGFydHMgPSBbXVxuICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICBoYXNoUGFydHMgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkuc3BsaXQoJyYnKVxuICB9XG5cbiAgdmFyIHBhcnNlZEhhc2ggPSB7fVxuICB2YXIgc3RyaW5nSGFzaCA9ICcnXG5cbiAgaGFzaFBhcnRzLmZvckVhY2goKHBhcnQsIGkpID0+IHtcbiAgICB2YXIgc3ViUGFydHMgPSBwYXJ0LnNwbGl0KCc9JylcbiAgICBwYXJzZWRIYXNoW3N1YlBhcnRzWzBdXSA9IHN1YlBhcnRzWzFdIHx8ICcnXG4gIH0pXG5cbiAgaWYgKGtleSkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgcGFyc2VkSGFzaFtrZXldID0gdmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhcnNlZEhhc2hba2V5XVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlYnVpbGQgdG8gc3RyaW5nXG4gIE9iamVjdC5rZXlzKHBhcnNlZEhhc2gpLmZvckVhY2goKGtleSwgaSkgPT4ge1xuICAgIGlmIChpID4gMCkge1xuICAgICAgc3RyaW5nSGFzaCArPSAnJidcbiAgICB9XG5cbiAgICBzdHJpbmdIYXNoICs9IGtleVxuXG4gICAgaWYgKHBhcnNlZEhhc2hba2V5XSkge1xuICAgICAgc3RyaW5nSGFzaCArPSBgPSR7cGFyc2VkSGFzaFtrZXldfWBcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHN0cmluZ0hhc2hcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNsb25lOiBjbG9uZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIGNsb3Nlc3Q6IGNsb3Nlc3QsXG4gIGRlYm91bmNlOiBkZWJvdW5jZSxcbiAgbG9hZFNjcmlwdDogbG9hZFNjcmlwdCxcbiAgYXN5bmM6IGFzeW5jLFxuICBmZXRjaDogZmV0Y2gsXG4gIGhhc2g6IGhhc2gsXG5cbiAgaW5oZXJpdHM6IGluaGVyaXRzXG59XG4iXX0=
