(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

/* siloz.io
 */

var durruti = require('durruti');
var Main = require('./components/main.js');

durruti.render(Main, document.querySelector('.app'));

},{"./components/main.js":12,"durruti":1}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"../../util":19,"jotted":3}],8:[function(require,module,exports){
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

},{"./editor-bar":6,"./editor-widget":7,"durruti":1}],9:[function(require,module,exports){
'use strict';

/* header
 */

var durruti = require('durruti');
var Settings = require('./settings');
var Share = require('./share');

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
    return '\n      <header class="header">\n        <a href="/" class="header-logo">\n          <img src="/images/logo.png" height="16" alt="siloz.io">\n        </a>\n\n        ' + durruti.render(new Settings(actions, storeInternal.actions)) + '\n        ' + durruti.render(new Share(actions, storeInternal.actions)) + '\n\n        <button type="button" class="btn collaborate ' + (loadingCollaborate ? 'is-loading' : '') + '">\n          Collaborate\n        </button>\n      </header>\n    ';
  };
}

module.exports = Header;

},{"../../state/store-internal":17,"./settings":10,"./share":11,"durruti":1}],10:[function(require,module,exports){
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

},{"../../util":19,"../popup":13}],11:[function(require,module,exports){
'use strict';

/* share
 */

var util = require('../../util');
var Popup = require('../popup');

function Share(actions, actionsInternal) {
  var self = util.inherits(this, Popup);
  Popup.call(self, 'share', actionsInternal);

  var shortUrl = actions.getShortUrl();
  var longUrl = '';
  var watcher;

  var generating = actionsInternal.getLoading('generate-url');

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
    // loading
    actionsInternal.updateLoading('generate-url', true);

    actions.updateShortUrl(function () {
      actionsInternal.updateLoading('generate-url', false);
    });
  }

  self.mount = function ($container) {
    self.super.mount.call(self, $container);

    var $shortUrl = $container.querySelector('.share-url-input-short');
    var $shortUrlCopy = $container.querySelector('.share-url-copy-short');
    var $longUrl = $container.querySelector('.share-url-input-long');
    var $longUrlCopy = $container.querySelector('.share-url-copy-long');

    $shortUrlCopy.addEventListener('click', copy($shortUrl));
    $longUrlCopy.addEventListener('click', copy($longUrl));

    var $generateShort = $container.querySelector('.share-generate');
    $generateShort.addEventListener('click', generate);

    if (shortUrl) {
      // give it a sec,
      // to not trigger url update on load,
      // and force url generation even if nothing was changed,
      // on foreign clients.
      watcher = setTimeout(function () {
        actions.startShortUrlUpdater();
      }, 1000);
    }
  };

  self.unmount = function () {
    self.super.unmount.call(self);

    if (watcher) {
      clearTimeout(watcher);
    }

    if (shortUrl) {
      actions.stopShortUrlUpdater();
    }
  };

  self.render = function () {
    return self.super.render.call(self, 'Share', '\n      <fieldset class="' + (shortUrl ? 'share-is-generated' : '') + '">\n        <legend>\n          Short URL\n        </legend>\n\n        <button type="button" class="btn btn-primary share-generate ' + (generating ? 'is-loading' : '') + '">\n          Generate Short URL\n        </button>\n\n        <div class="share-url share-url-short">\n          <input type="text" class="share-url-input share-url-input-short" value="' + shortUrl + '" readonly>\n          <button type="button" class="btn share-url-copy share-url-copy-short">\n            Copy\n          </button>\n        </div>\n      </fieldset>\n      <fieldset>\n        <legend>\n          Persistent URL\n        </legend>\n\n        <div class="share-url">\n          <input type="text" class="share-url-input share-url-input-long" value="' + longUrl + '" readonly>\n          <button type="button" class="btn share-url-copy share-url-copy-long">\n            Copy\n          </button>\n        </div>\n      </fieldset>\n    ');
  };

  return self;
}

module.exports = Share;

},{"../../util":19,"../popup":13}],12:[function(require,module,exports){
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

},{"../state/store":18,"./editor/editor":8,"./header/header":9,"durruti":1}],13:[function(require,module,exports){
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

},{"../util":19}],14:[function(require,module,exports){
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

  return {
    getPopup: getPopup,
    updatePopup: updatePopup,

    getLoading: getLoading,
    updateLoading: updateLoading
  };
}

module.exports = actions;

},{}],15:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* store actions
 */

var util = require('../util');
var shortUrlService = require('./short-url');

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

  function getShortUrl() {
    return store.get().short_url;
  }

  var longUrl = '';

  function updateShortUrl(force) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

    // force not defined, but callback is
    if (typeof force === 'function') {
      callback = force;
      force = false;
    }

    // existing short_url's,
    // check if window.location.href is not already saved
    // and update link.
    var shortUrl = getShortUrl();
    if (!shortUrl || force) {
      longUrl = window.location.href;

      shortUrlService.create({
        long_url: longUrl
      }, function (err, res) {
        if (err) {
          return console.log(err);
        }

        var data = store.get();
        data.short_url = res.short_url;
        store.set(data);

        // after short_url is added to hash,
        // update long_url to point to url with hash.
        longUrl = window.location.href;

        // update existing short url
        shortUrlService.update({
          long_url: longUrl,
          short_url: res.short_url
        }, function (err, res) {
          if (err) {
            return console.log(err);
          }

          callback();
        });
      });
    } else if (longUrl !== window.location.href) {
      longUrl = window.location.href;

      // update existing short url
      shortUrlService.update({
        long_url: longUrl,
        short_url: shortUrl
      }, function (err, res) {
        if (err) {
          // stop url updater.
          stopShortUrlUpdater();

          // delete existing short_url
          var data = store.get();
          data.short_url = '';
          store.set(data);

          return console.log(err);
        }

        callback();
      });
    }
  }

  var debouncedUpdateShortUrl = util.debounce(updateShortUrl, 500);

  function startShortUrlUpdater() {
    // update short url when data changes
    store.on('change', debouncedUpdateShortUrl);
  }

  function stopShortUrlUpdater() {
    // stop monitoring data changes
    store.off('change', debouncedUpdateShortUrl);
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
    updateTheme: updateTheme,

    getShortUrl: getShortUrl,
    updateShortUrl: updateShortUrl,
    startShortUrlUpdater: startShortUrlUpdater,
    stopShortUrlUpdater: stopShortUrlUpdater
  };
}

module.exports = actions;

},{"../util":19,"./short-url":16}],16:[function(require,module,exports){
'use strict';

/* short url api
 */

// env detection
var env = 'local';
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  env = 'live';
}

var apiUrl = 'http://localhost:3000';
var shortUrl = apiUrl;

if (env !== 'local') {
  apiUrl = 'https://prajina-ghinda.rhcloud.com';
  shortUrl = 'http://s.siloz.io';
}

var util = require('../util');

var sessionKey = 'siloz-io';

function getSession() {
  try {
    var cache = window.localStorage.getItem(sessionKey);
    if (cache) {
      return JSON.parse(cache);
    }
  } catch (e) {
    return {};
  }

  return {};
}

var session = getSession();

function saveSession(newSession) {
  session = util.extend(newSession, session);

  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

function create(data) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

  util.fetch(apiUrl + '/api/', {
    type: 'POST',
    data: data
  }, function (err, res) {
    if (err) {
      return callback(err);
    }

    // set full url for shorturl
    res.short_url = shortUrl + '/' + res.short_url;

    // save session
    saveSession({
      token: res.token
    });

    callback(null, res);
  });
}

function update(data) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

  // remove api url from short_url
  data.short_url = data.short_url.replace(shortUrl + '/', '');

  // add token
  data.token = session.token;

  util.fetch(apiUrl + '/api/', {
    type: 'PUT',
    data: data
  }, function (err, res) {
    if (err) {
      return callback(err);
    }

    callback(null, res);
  });
}

module.exports = {
  create: create,
  update: update
};

},{"../util":19}],17:[function(require,module,exports){
'use strict';

/* internal store,
 * not stored in url
 */

var Store = require('durruti/store');
var actions = require('./actions-internal');

var defaults = {
  popup: {},
  loading: {}
};

var InternalStore = function InternalStore() {
  Store.call(this);
  this.actions = actions(this);

  this.set(defaults);
};

InternalStore.prototype = Object.create(Store.prototype);

module.exports = InternalStore;

},{"./actions-internal":14,"durruti/store":2}],18:[function(require,module,exports){
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
  },

  short_url: ''
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

var GlobalStore = function GlobalStore() {
  var _this = this;

  Store.call(this);
  this.actions = actions(this);

  var hashData = null;
  var replaceHash = replaceLocationHash();

  try {
    if (window.location.hash) {
      hashData = JSON.parse(LZString.decompressFromEncodedURIComponent(util.hash('s')));
    }
  } catch (err) {}

  if (hashData) {
    this.set(util.extend(hashData, defaults));
  } else {
    this.set(defaults);
  }

  this.on('change', function () {
    // save in hash
    var data = _this.get();

    var compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    replaceHash(util.hash('s', compressed));
  });
};

GlobalStore.prototype = Object.create(Store.prototype);

module.exports = GlobalStore;

},{"../util":19,"./actions":15,"durruti/store":2,"lz-string":4}],19:[function(require,module,exports){
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

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZHVycnV0aS9kdXJydXRpLmpzIiwibm9kZV9tb2R1bGVzL2R1cnJ1dGkvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvam90dGVkL2pvdHRlZC5qcyIsIm5vZGVfbW9kdWxlcy9sei1zdHJpbmcvbGlicy9sei1zdHJpbmcuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbXBvbmVudHMvZWRpdG9yL2VkaXRvci1iYXIuanMiLCJzcmMvY29tcG9uZW50cy9lZGl0b3IvZWRpdG9yLXdpZGdldC5qcyIsInNyYy9jb21wb25lbnRzL2VkaXRvci9lZGl0b3IuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvaGVhZGVyLmpzIiwic3JjL2NvbXBvbmVudHMvaGVhZGVyL3NldHRpbmdzLmpzIiwic3JjL2NvbXBvbmVudHMvaGVhZGVyL3NoYXJlLmpzIiwic3JjL2NvbXBvbmVudHMvbWFpbi5qcyIsInNyYy9jb21wb25lbnRzL3BvcHVwLmpzIiwic3JjL3N0YXRlL2FjdGlvbnMtaW50ZXJuYWwuanMiLCJzcmMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9zdGF0ZS9zaG9ydC11cmwuanMiLCJzcmMvc3RhdGUvc3RvcmUtaW50ZXJuYWwuanMiLCJzcmMvc3RhdGUvc3RvcmUuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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ZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5kdXJydXRpID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogVXRpbHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGhhc1dpbmRvdygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICB2YXIgaXNDbGllbnQgPSBoYXNXaW5kb3coKTtcblxuICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfVxuXG4gIC8vIG9uZS1sZXZlbCBvYmplY3QgZXh0ZW5kXG5cblxuICB2YXIgRFVSUlVUSV9ERUJVRyA9IHRydWU7XG5cbiAgZnVuY3Rpb24gd2FybigpIHtcbiAgICBpZiAoRFVSUlVUSV9ERUJVRyA9PT0gdHJ1ZSkge1xuICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgLyogRHVycnV0aVxuICAgKiBDYXB0dXJlIGFuZCByZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICAgKi9cblxuICB2YXIgX3JlbW92ZUxpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygpIHt9O1xuXG4gIC8vIGNhcHR1cmUgYWxsIGxpc3RlbmVyc1xuICB2YXIgZXZlbnRzID0gW107XG4gIHZhciBkb21FdmVudFR5cGVzID0gW107XG5cbiAgZnVuY3Rpb24gZ2V0RG9tRXZlbnRUeXBlcygpIHtcbiAgICB2YXIgZXZlbnRUeXBlcyA9IFtdO1xuICAgIGZvciAodmFyIGF0dHIgaW4gZG9jdW1lbnQpIHtcbiAgICAgIC8vIHN0YXJ0cyB3aXRoIG9uXG4gICAgICBpZiAoYXR0ci5zdWJzdHIoMCwgMikgPT09ICdvbicpIHtcbiAgICAgICAgZXZlbnRUeXBlcy5wdXNoKGF0dHIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldmVudFR5cGVzO1xuICB9XG5cbiAgdmFyIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lcjtcblxuICBmdW5jdGlvbiBjYXB0dXJlQWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyZSkge1xuICAgIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgZXZlbnRzLnB1c2goe1xuICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGZuOiBmbixcbiAgICAgIGNhcHR1cmU6IGNhcHR1cmVcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU5vZGVFdmVudHMoJG5vZGUpIHtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IGV2ZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmIChldmVudHNbaV0udGFyZ2V0ID09PSAkbm9kZSkge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgICAgJG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudHNbaV0udHlwZSwgZXZlbnRzW2ldLmZuLCBldmVudHNbaV0uY2FwdHVyZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGV2ZW50XG4gICAgICAgIGV2ZW50cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGktLTtcbiAgICAgIH1cblxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBvbiogbGlzdGVuZXJzXG4gICAgZG9tRXZlbnRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudFR5cGUpIHtcbiAgICAgICRub2RlW2V2ZW50VHlwZV0gPSBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGlzQ2xpZW50KSB7XG4gICAgZG9tRXZlbnRUeXBlcyA9IGdldERvbUV2ZW50VHlwZXMoKTtcblxuICAgIC8vIGNhcHR1cmUgYWRkRXZlbnRMaXN0ZW5lclxuXG4gICAgLy8gSUVcbiAgICBpZiAod2luZG93Lk5vZGUucHJvdG90eXBlLmhhc093blByb3BlcnR5KCdhZGRFdmVudExpc3RlbmVyJykpIHtcbiAgICAgIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5Ob2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgd2luZG93Lk5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBjYXB0dXJlQWRkRXZlbnRMaXN0ZW5lcjtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2FkZEV2ZW50TGlzdGVuZXInKSkge1xuICAgICAgLy8gc3RhbmRhcmRcbiAgICAgIG9yaWdpbmFsQWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGNhcHR1cmVBZGRFdmVudExpc3RlbmVyO1xuICAgIH1cblxuICAgIC8vIHRyYXZlcnNlIGFuZCByZW1vdmUgYWxsIGV2ZW50cyBsaXN0ZW5lcnMgZnJvbSBub2Rlc1xuICAgIF9yZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoJG5vZGUsIHRyYXZlcnNlKSB7XG4gICAgICByZW1vdmVOb2RlRXZlbnRzKCRub2RlKTtcblxuICAgICAgLy8gdHJhdmVyc2UgZWxlbWVudCBjaGlsZHJlblxuICAgICAgaWYgKHRyYXZlcnNlICYmICRub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBfcmVtb3ZlTGlzdGVuZXJzKCRub2RlLmNoaWxkcmVuW2ldLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB2YXIgcmVtb3ZlTGlzdGVuZXJzJDEgPSBfcmVtb3ZlTGlzdGVuZXJzO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogRE9NIHBhdGNoIC0gbW9ycGhzIGEgRE9NIG5vZGUgaW50byBhbm90aGVyLlxuICAgKi9cblxuICBmdW5jdGlvbiB0cmF2ZXJzZSgkbm9kZSwgJG5ld05vZGUsIHBhdGNoZXMpIHtcbiAgICAvLyB0cmF2ZXJzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgZGlmZigkbm9kZS5jaGlsZE5vZGVzW2ldLCAkbmV3Tm9kZS5jaGlsZE5vZGVzW2ldLCBwYXRjaGVzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYXBBdHRyaWJ1dGVzKCRub2RlLCAkbmV3Tm9kZSkge1xuICAgIHZhciBhdHRycyA9IHt9O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyc1skbm9kZS5hdHRyaWJ1dGVzW2ldLm5hbWVdID0gbnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgJG5ld05vZGUuYXR0cmlidXRlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIGF0dHJzWyRuZXdOb2RlLmF0dHJpYnV0ZXNbX2ldLm5hbWVdID0gJG5ld05vZGUuYXR0cmlidXRlc1tfaV0udmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGF0Y2hBdHRycygkbm9kZSwgJG5ld05vZGUpIHtcbiAgICAvLyBtYXAgYXR0cmlidXRlc1xuICAgIHZhciBhdHRycyA9IG1hcEF0dHJpYnV0ZXMoJG5vZGUsICRuZXdOb2RlKTtcblxuICAgIC8vIGFkZC1jaGFuZ2UgYXR0cmlidXRlc1xuICAgIGZvciAodmFyIHByb3AgaW4gYXR0cnMpIHtcbiAgICAgIGlmIChhdHRyc1twcm9wXSA9PT0gbnVsbCkge1xuICAgICAgICAkbm9kZS5yZW1vdmVBdHRyaWJ1dGUocHJvcCk7XG5cbiAgICAgICAgLy8gY2hlY2tlZCBuZWVkcyBleHRyYSB3b3JrXG4gICAgICAgIGlmIChwcm9wID09PSAnY2hlY2tlZCcpIHtcbiAgICAgICAgICAkbm9kZS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRub2RlLnNldEF0dHJpYnV0ZShwcm9wLCBhdHRyc1twcm9wXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlmZigkbm9kZSwgJG5ld05vZGUpIHtcbiAgICB2YXIgcGF0Y2hlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogW107XG5cbiAgICB2YXIgcGF0Y2ggPSB7XG4gICAgICBub2RlOiAkbm9kZSxcbiAgICAgIG5ld05vZGU6ICRuZXdOb2RlXG4gICAgfTtcblxuICAgIC8vIHB1c2ggdHJhdmVyc2VkIG5vZGUgdG8gcGF0Y2ggbGlzdFxuICAgIHBhdGNoZXMucHVzaChwYXRjaCk7XG5cbiAgICAvLyBmYXN0ZXIgdGhhbiBvdXRlcmh0bWxcbiAgICBpZiAoJG5vZGUuaXNFcXVhbE5vZGUoJG5ld05vZGUpKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIG9uIG5vZGUgYW5kIGNoaWxkcmVuXG4gICAgICByZW1vdmVMaXN0ZW5lcnMkMSgkbm9kZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiBwYXRjaGVzO1xuICAgIH1cblxuICAgIC8vIGlmIG9uZSBvZiB0aGVtIGlzIG5vdCBhbiBlbGVtZW50IG5vZGUsXG4gICAgLy8gb3IgdGhlIHRhZyBjaGFuZ2VkLFxuICAgIC8vIG9yIG5vdCB0aGUgc2FtZSBudW1iZXIgb2YgY2hpbGRyZW4uXG4gICAgaWYgKCRub2RlLm5vZGVUeXBlICE9PSAxIHx8ICRuZXdOb2RlLm5vZGVUeXBlICE9PSAxIHx8ICRub2RlLnRhZ05hbWUgIT09ICRuZXdOb2RlLnRhZ05hbWUgfHwgJG5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09ICRuZXdOb2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBwYXRjaC5yZXBsYWNlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2gudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVycyBvbiBub2RlXG4gICAgICByZW1vdmVMaXN0ZW5lcnMkMSgkbm9kZSk7XG5cbiAgICAgIC8vIHRyYXZlcnNlIGNoaWxkTm9kZXNcbiAgICAgIHRyYXZlcnNlKCRub2RlLCAkbmV3Tm9kZSwgcGF0Y2hlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGNoZXM7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVBhdGNoKHBhdGNoKSB7XG4gICAgaWYgKHBhdGNoLnJlcGxhY2UpIHtcbiAgICAgIHBhdGNoLm5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocGF0Y2gubmV3Tm9kZSwgcGF0Y2gubm9kZSk7XG4gICAgfSBlbHNlIGlmIChwYXRjaC51cGRhdGUpIHtcbiAgICAgIHBhdGNoQXR0cnMocGF0Y2gubm9kZSwgcGF0Y2gubmV3Tm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGF0Y2gocGF0Y2hlcykge1xuICAgIHBhdGNoZXMuZm9yRWFjaChhcHBseVBhdGNoKTtcblxuICAgIHJldHVybiBwYXRjaGVzO1xuICB9XG5cbiAgdmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgfSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICB9O1xuXG5cblxuXG5cbiAgdmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICAgIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgICB9O1xuICB9KCk7XG5cblxuXG5cblxuXG5cbiAgdmFyIGdldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIHZhciBzZXQgPSBmdW5jdGlvbiBzZXQob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MgJiYgZGVzYy53cml0YWJsZSkge1xuICAgICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2V0dGVyID0gZGVzYy5zZXQ7XG5cbiAgICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXR0ZXIuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKiBEdXJydXRpXG4gICAqIE1pY3JvIElzb21vcnBoaWMgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBidWlsZGluZyB1c2VyIGludGVyZmFjZXMuXG4gICAqL1xuXG4gIHZhciBkdXJydXRpQXR0ciA9ICdkYXRhLWR1cnJ1dGktaWQnO1xuICB2YXIgZHVycnV0aUVsZW1TZWxlY3RvciA9ICdbJyArIGR1cnJ1dGlBdHRyICsgJ10nO1xuICB2YXIgY29tcG9uZW50Q2FjaGUgPSBbXTtcbiAgdmFyIGNvbXBvbmVudEluZGV4ID0gMDtcblxuICAvLyBkZWNvcmF0ZSBhIGJhc2ljIGNsYXNzIHdpdGggZHVycnV0aSBzcGVjaWZpYyBwcm9wZXJ0aWVzXG4gIGZ1bmN0aW9uIGRlY29yYXRlKENvbXApIHtcbiAgICB2YXIgY29tcG9uZW50O1xuXG4gICAgLy8gaW5zdGFudGlhdGUgY2xhc3Nlc1xuICAgIGlmICh0eXBlb2YgQ29tcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcG9uZW50ID0gbmV3IENvbXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGNoYW5nZSB0aGUgaWQgb24gYSBjYWNoZWQgY29tcG9uZW50XG4gICAgICBjb21wb25lbnQgPSBPYmplY3QuY3JlYXRlKENvbXApO1xuICAgIH1cblxuICAgIC8vIGNvbXBvbmVudHMgZ2V0IGEgbmV3IGlkIG9uIHJlbmRlcixcbiAgICAvLyBzbyB3ZSBjYW4gY2xlYXIgdGhlIHByZXZpb3VzIGNvbXBvbmVudCBjYWNoZS5cbiAgICBjb21wb25lbnQuX2R1cnJ1dGlJZCA9IFN0cmluZyhjb21wb25lbnRJbmRleCsrKTtcblxuICAgIC8vIGNhY2hlIGNvbXBvbmVudFxuICAgIGNvbXBvbmVudENhY2hlLnB1c2goe1xuICAgICAgaWQ6IGNvbXBvbmVudC5fZHVycnV0aUlkLFxuICAgICAgY29tcG9uZW50OiBjb21wb25lbnRcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21wb25lbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpIHtcbiAgICAvLyBnZXQgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBkb20gbm9kZSAtIHJlbmRlcmVkIGluIGJyb3dzZXIuXG4gICAgaWYgKCRub2RlLl9kdXJydXRpKSB7XG4gICAgICByZXR1cm4gJG5vZGUuX2R1cnJ1dGk7XG4gICAgfVxuXG4gICAgLy8gb3IgZ2V0IGl0IGZyb20gdGhlIGNvbXBvbmVudCBjYWNoZSAtIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXIuXG4gICAgdmFyIGlkID0gJG5vZGUuZ2V0QXR0cmlidXRlKGR1cnJ1dGlBdHRyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY29tcG9uZW50Q2FjaGVbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnRDYWNoZVtpXS5jb21wb25lbnQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVtb3ZlIGN1c3RvbSBkYXRhIGF0dHJpYnV0ZXMsXG4gIC8vIGFuZCBjYWNoZSB0aGUgY29tcG9uZW50IG9uIHRoZSBET00gbm9kZS5cbiAgZnVuY3Rpb24gY2xlYW5BdHRyTm9kZXMoJGNvbnRhaW5lciwgaW5jbHVkZVBhcmVudCkge1xuICAgIHZhciBub2RlcyA9IFtdLnNsaWNlLmNhbGwoJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGR1cnJ1dGlFbGVtU2VsZWN0b3IpKTtcblxuICAgIGlmIChpbmNsdWRlUGFyZW50KSB7XG4gICAgICBub2Rlcy5wdXNoKCRjb250YWluZXIpO1xuICAgIH1cblxuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKCRub2RlKSB7XG4gICAgICAvLyBjYWNoZSBjb21wb25lbnQgaW4gbm9kZVxuICAgICAgJG5vZGUuX2R1cnJ1dGkgPSBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpO1xuXG4gICAgICAvLyBjbGVhbi11cCBkYXRhIGF0dHJpYnV0ZXNcbiAgICAgICRub2RlLnJlbW92ZUF0dHJpYnV0ZShkdXJydXRpQXR0cik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICBmdW5jdGlvbiB1bm1vdW50Tm9kZSgkbm9kZSkge1xuICAgIHZhciBjYWNoZWRDb21wb25lbnQgPSBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpO1xuXG4gICAgaWYgKGNhY2hlZENvbXBvbmVudC51bm1vdW50KSB7XG4gICAgICBjYWNoZWRDb21wb25lbnQudW5tb3VudCgkbm9kZSk7XG4gICAgfVxuXG4gICAgLy8gY2xlYXIgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBjYWNoZVxuICAgIGNsZWFyQ29tcG9uZW50Q2FjaGUoY2FjaGVkQ29tcG9uZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdW50Tm9kZSgkbm9kZSkge1xuICAgIHZhciBjYWNoZWRDb21wb25lbnQgPSBnZXRDYWNoZWRDb21wb25lbnQoJG5vZGUpO1xuXG4gICAgaWYgKGNhY2hlZENvbXBvbmVudC5tb3VudCkge1xuICAgICAgY2FjaGVkQ29tcG9uZW50Lm1vdW50KCRub2RlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckNvbXBvbmVudENhY2hlKGNvbXBvbmVudCkge1xuICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50Q2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNvbXBvbmVudENhY2hlW2ldLmlkID09PSBjb21wb25lbnQuX2R1cnJ1dGlJZCkge1xuICAgICAgICAgIGNvbXBvbmVudENhY2hlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2xlYXIgdGhlIGVudGlyZSBjb21wb25lbnQgY2FjaGVcbiAgICAgIGNvbXBvbmVudEluZGV4ID0gMDtcbiAgICAgIGNvbXBvbmVudENhY2hlLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRnJhZ21lbnQoKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcblxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUudHJpbSgpO1xuICAgIHZhciBwYXJlbnQgPSAnZGl2JztcbiAgICB2YXIgJG5vZGU7XG5cbiAgICBpZiAodGVtcGxhdGUuaW5kZXhPZignPHRyJykgPT09IDApIHtcbiAgICAgIC8vIHRhYmxlIHJvd1xuICAgICAgcGFyZW50ID0gJ3Rib2R5JztcbiAgICB9IGVsc2UgaWYgKHRlbXBsYXRlLmluZGV4T2YoJzx0ZCcpID09PSAwKSB7XG4gICAgICAvLyB0YWJsZSBjb2x1bW5cbiAgICAgIHBhcmVudCA9ICd0cic7XG4gICAgfVxuXG4gICAgJG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHBhcmVudCk7XG4gICAgJG5vZGUuaW5uZXJIVE1MID0gdGVtcGxhdGU7XG5cbiAgICBpZiAoJG5vZGUuY2hpbGRyZW4ubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCB0ZW1wbGF0ZSBtdXN0IGhhdmUgYSBzaW5nbGUgcGFyZW50IG5vZGUuJywgdGVtcGxhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiAkbm9kZS5maXJzdEVsZW1lbnRDaGlsZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENvbXBvbmVudElkKHRlbXBsYXRlLCBjb21wb25lbnQpIHtcbiAgICAvLyBuYWl2ZSBpbXBsZW1lbnRhdGlvbiBvZiBhZGRpbmcgYW4gYXR0cmlidXRlIHRvIHRoZSBwYXJlbnQgY29udGFpbmVyLlxuICAgIC8vIHNvIHdlIGRvbid0IGRlcGVuZCBvbiBhIGRvbSBwYXJzZXIuXG4gICAgLy8gZG93bnNpZGUgaXMgd2UgY2FuJ3Qgd2FybiB0aGF0IHRlbXBsYXRlIE1VU1QgaGF2ZSBhIHNpbmdsZSBwYXJlbnQgKGluIE5vZGUuanMpLlxuXG4gICAgLy8gY2hlY2sgdm9pZCBlbGVtZW50cyBmaXJzdC5cbiAgICB2YXIgZmlyc3RCcmFja2V0SW5kZXggPSB0ZW1wbGF0ZS5pbmRleE9mKCcvPicpO1xuXG4gICAgLy8gbm9uLXZvaWQgZWxlbWVudHNcbiAgICBpZiAoZmlyc3RCcmFja2V0SW5kZXggPT09IC0xKSB7XG4gICAgICBmaXJzdEJyYWNrZXRJbmRleCA9IHRlbXBsYXRlLmluZGV4T2YoJz4nKTtcbiAgICB9XG5cbiAgICB2YXIgYXR0ciA9ICcgJyArIGR1cnJ1dGlBdHRyICsgJz1cIicgKyBjb21wb25lbnQuX2R1cnJ1dGlJZCArICdcIic7XG5cbiAgICByZXR1cm4gdGVtcGxhdGUuc3Vic3RyKDAsIGZpcnN0QnJhY2tldEluZGV4KSArIGF0dHIgKyB0ZW1wbGF0ZS5zdWJzdHIoZmlyc3RCcmFja2V0SW5kZXgpO1xuICB9XG5cbiAgLy8gdHJhdmVyc2UgYW5kIGZpbmQgZHVycnV0aSBub2Rlc1xuICBmdW5jdGlvbiBnZXRDb21wb25lbnROb2RlcygkY29udGFpbmVyKSB7XG4gICAgdmFyIGFyciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogW107XG5cbiAgICBpZiAoJGNvbnRhaW5lci5fZHVycnV0aSkge1xuICAgICAgYXJyLnB1c2goJGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgaWYgKCRjb250YWluZXIuY2hpbGRyZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJGNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBnZXRDb21wb25lbnROb2RlcygkY29udGFpbmVyLmNoaWxkcmVuW2ldLCBhcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG4gIH1cblxuICB2YXIgRHVycnV0aSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEdXJydXRpKCkge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgRHVycnV0aSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoRHVycnV0aSwgW3tcbiAgICAgIGtleTogJ3NlcnZlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2VydmVyKCkge1xuICAgICAgICBjbGVhckNvbXBvbmVudENhY2hlKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoY29tcG9uZW50LCAkY29udGFpbmVyKSB7XG4gICAgICAgIC8vIGRlY29yYXRlIGJhc2ljIGNsYXNzZXMgd2l0aCBkdXJydXRpIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGR1cnJ1dGlDb21wb25lbnQgPSBkZWNvcmF0ZShjb21wb25lbnQpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZHVycnV0aUNvbXBvbmVudC5yZW5kZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnRzIG11c3QgaGF2ZSBhIHJlbmRlcigpIG1ldGhvZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGR1cnJ1dGlDb21wb25lbnQucmVuZGVyKCk7XG4gICAgICAgIHZhciBjb21wb25lbnRIdG1sID0gYWRkQ29tcG9uZW50SWQodGVtcGxhdGUsIGR1cnJ1dGlDb21wb25lbnQpO1xuXG4gICAgICAgIC8vIG1vdW50IGFuZCB1bm1vdW50IGluIGJyb3dzZXIsIHdoZW4gd2Ugc3BlY2lmeSBhIGNvbnRhaW5lci5cbiAgICAgICAgaWYgKGlzQ2xpZW50ICYmICRjb250YWluZXIpIHtcbiAgICAgICAgICB2YXIgJG5ld0NvbXBvbmVudDtcbiAgICAgICAgICB2YXIgcGF0Y2hlcztcblxuICAgICAgICAgIHZhciBfcmV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIGNvbnRhaW5lciBpcyBzdGlsbCBpbiB0aGUgRE9NLlxuICAgICAgICAgICAgLy8gd2hlbiBydW5uaW5nIG11bHRpcGxlIHBhcmFsbGVsIHJlbmRlcidzLCB0aGUgY29udGFpbmVyXG4gICAgICAgICAgICAvLyBpcyByZW1vdmVkIGJ5IHRoZSBwcmV2aW91cyByZW5kZXIsIGJ1dCB0aGUgcmVmZXJlbmNlIHN0aWxsIGluIG1lbW9yeS5cbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucygkY29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAvLyB3YXJuIGZvciBwZXJmb3JtYW5jZS5cbiAgICAgICAgICAgICAgd2FybignTm9kZScsICRjb250YWluZXIsICdpcyBubyBsb25nZXIgaW4gdGhlIERPTS4gXFxuSXQgd2FzIHByb2JhYmx5IHJlbW92ZWQgYnkgYSBwYXJlbnQgY29tcG9uZW50LicpO1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHY6IHZvaWQgMFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50Tm9kZXMgPSBbXTtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIHRlbXBsYXRlIHN0cmluZyB0byBhIGRvbSBub2RlXG4gICAgICAgICAgICAkbmV3Q29tcG9uZW50ID0gY3JlYXRlRnJhZ21lbnQoY29tcG9uZW50SHRtbCk7XG5cbiAgICAgICAgICAgIC8vIHVubW91bnQgY29tcG9uZW50IGFuZCBzdWItY29tcG9uZW50c1xuXG4gICAgICAgICAgICBnZXRDb21wb25lbnROb2RlcygkY29udGFpbmVyKS5mb3JFYWNoKHVubW91bnROb2RlKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIGNvbnRhaW5lciBpcyBhIGR1cnJ1dGkgZWxlbWVudCxcbiAgICAgICAgICAgIC8vIHVubW91bnQgaXQgYW5kIGl0J3MgY2hpbGRyZW4gYW5kIHJlcGxhY2UgdGhlIG5vZGUuXG4gICAgICAgICAgICBpZiAoZ2V0Q2FjaGVkQ29tcG9uZW50KCRjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZGF0YSBhdHRyaWJ1dGVzIG9uIHRoZSBuZXcgbm9kZSxcbiAgICAgICAgICAgICAgLy8gYmVmb3JlIHBhdGNoLFxuICAgICAgICAgICAgICAvLyBhbmQgZ2V0IHRoZSBsaXN0IG9mIG5ldyBjb21wb25lbnRzLlxuICAgICAgICAgICAgICBjbGVhbkF0dHJOb2RlcygkbmV3Q29tcG9uZW50LCB0cnVlKTtcblxuICAgICAgICAgICAgICAvLyBnZXQgcmVxdWlyZWQgZG9tIHBhdGNoZXNcbiAgICAgICAgICAgICAgcGF0Y2hlcyA9IGRpZmYoJGNvbnRhaW5lciwgJG5ld0NvbXBvbmVudCk7XG5cblxuICAgICAgICAgICAgICBwYXRjaGVzLmZvckVhY2goZnVuY3Rpb24gKHBhdGNoJCQxKSB7XG4gICAgICAgICAgICAgICAgLy8gYWx3YXlzIHVwZGF0ZSBjb21wb25lbnQgaW5zdGFuY2VzLFxuICAgICAgICAgICAgICAgIC8vIGV2ZW4gaWYgdGhlIGRvbSBkb2Vzbid0IGNoYW5nZS5cbiAgICAgICAgICAgICAgICBwYXRjaCQkMS5ub2RlLl9kdXJydXRpID0gcGF0Y2gkJDEubmV3Tm9kZS5fZHVycnV0aTtcblxuICAgICAgICAgICAgICAgIC8vIHBhdGNoZXMgY29udGFpbiBhbGwgdGhlIHRyYXZlcnNlZCBub2Rlcy5cbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIG1vdW50IGNvbXBvbmVudHMgaGVyZSwgZm9yIHBlcmZvcm1hbmNlLlxuICAgICAgICAgICAgICAgIGlmIChwYXRjaCQkMS5ub2RlLl9kdXJydXRpKSB7XG4gICAgICAgICAgICAgICAgICBpZiAocGF0Y2gkJDEucmVwbGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2Rlcy5wdXNoKHBhdGNoJCQxLm5ld05vZGUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRjaCQkMS51cGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZXMucHVzaChwYXRjaCQkMS5ub2RlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vZGUgaXMgdGhlIHNhbWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB3ZSBuZWVkIHRvIG1vdW50IHN1Yi1jb21wb25lbnRzLlxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShjb21wb25lbnROb2RlcywgZ2V0Q29tcG9uZW50Tm9kZXMocGF0Y2gkJDEubm9kZSkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgLy8gbW9ycGggb2xkIGRvbSBub2RlIGludG8gbmV3IG9uZVxuICAgICAgICAgICAgICBwYXRjaChwYXRjaGVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGlmIHRoZSBjb21wb25lbnQgaXMgbm90IGEgZHVycnV0aSBlbGVtZW50LFxuICAgICAgICAgICAgICAvLyBpbnNlcnQgdGhlIHRlbXBsYXRlIHdpdGggaW5uZXJIVE1MLlxuXG4gICAgICAgICAgICAgIC8vIG9ubHkgaWYgdGhlIHNhbWUgaHRtbCBpcyBub3QgYWxyZWFkeSByZW5kZXJlZFxuICAgICAgICAgICAgICBpZiAoISRjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQgfHwgISRjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQuaXNFcXVhbE5vZGUoJG5ld0NvbXBvbmVudCkpIHtcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmlubmVySFRNTCA9IGNvbXBvbmVudEh0bWw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb21wb25lbnROb2RlcyA9IGNsZWFuQXR0ck5vZGVzKCRjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtb3VudCBuZXdseSBhZGRlZCBjb21wb25lbnRzXG4gICAgICAgICAgICBjb21wb25lbnROb2Rlcy5mb3JFYWNoKG1vdW50Tm9kZSk7XG4gICAgICAgICAgfSgpO1xuXG4gICAgICAgICAgaWYgKCh0eXBlb2YgX3JldCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoX3JldCkpID09PSBcIm9iamVjdFwiKSByZXR1cm4gX3JldC52O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudEh0bWw7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBEdXJydXRpO1xuICB9KCk7XG5cbiAgdmFyIGR1cnJ1dGkgPSBuZXcgRHVycnV0aSgpO1xuXG4gIHJldHVybiBkdXJydXRpO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kdXJydXRpLmpzLm1hcCIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5kdXJydXRpID0gZ2xvYmFsLmR1cnJ1dGkgfHwge30sIGdsb2JhbC5kdXJydXRpLlN0b3JlID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogVXRpbHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGhhc1dpbmRvdygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICB2YXIgaXNDbGllbnQgPSBoYXNXaW5kb3coKTtcblxuICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfVxuXG4gIC8vIG9uZS1sZXZlbCBvYmplY3QgZXh0ZW5kXG4gIGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgb2JqID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICB2YXIgZGVmYXVsdHMgPSBhcmd1bWVudHNbMV07XG5cbiAgICAvLyBjbG9uZSBvYmplY3RcbiAgICB2YXIgZXh0ZW5kZWQgPSBjbG9uZShvYmopO1xuXG4gICAgLy8gY29weSBkZWZhdWx0IGtleXMgd2hlcmUgdW5kZWZpbmVkXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBleHRlbmRlZFtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBleHRlbmRlZFtrZXldID0gZGVmYXVsdHNba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBleHRlbmRlZDtcbiAgfVxuXG4gIHZhciBEVVJSVVRJX0RFQlVHID0gdHJ1ZTtcblxuICAvKiBEdXJydXRpXG4gICAqIERhdGEgc3RvcmUgd2l0aCBjaGFuZ2UgZXZlbnRzLlxuICAgKi9cblxuICBmdW5jdGlvbiBTdG9yZShuYW1lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgaGlzdG9yeVN1cHBvcnQgPSBmYWxzZTtcbiAgICAvLyBoaXN0b3J5IGlzIGFjdGl2ZSBvbmx5IGluIHRoZSBicm93c2VyLCBieSBkZWZhdWx0XG4gICAgaWYgKGlzQ2xpZW50KSB7XG4gICAgICBoaXN0b3J5U3VwcG9ydCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgIGhpc3Rvcnk6IGhpc3RvcnlTdXBwb3J0XG4gICAgfSk7XG5cbiAgICB0aGlzLmV2ZW50cyA9IHtcbiAgICAgIGNoYW5nZTogW11cbiAgICB9O1xuXG4gICAgdGhpcy5kYXRhID0gW107XG4gIH1cblxuICBTdG9yZS5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uICh0b3BpYykge1xuICAgIHRoaXMuZXZlbnRzW3RvcGljXSA9IHRoaXMuZXZlbnRzW3RvcGljXSB8fCBbXTtcblxuICAgIC8vIGltbXV0YWJsZS5cbiAgICAvLyBzbyBvbi9vZmYgZG9uJ3QgY2hhbmdlIHRoZSBhcnJheSBkdXJyaW5nIHRyaWdnZXIuXG4gICAgdmFyIGZvdW5kRXZlbnRzID0gdGhpcy5ldmVudHNbdG9waWNdLnNsaWNlKCk7XG4gICAgZm91bmRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKHRvcGljLCBmdW5jKSB7XG4gICAgdGhpcy5ldmVudHNbdG9waWNdID0gdGhpcy5ldmVudHNbdG9waWNdIHx8IFtdO1xuICAgIHRoaXMuZXZlbnRzW3RvcGljXS5wdXNoKGZ1bmMpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAodG9waWMsIGZuKSB7XG4gICAgdGhpcy5ldmVudHNbdG9waWNdID0gdGhpcy5ldmVudHNbdG9waWNdIHx8IFtdO1xuXG4gICAgLy8gZmluZCB0aGUgZm4gaW4gdGhlIGFyclxuICAgIHZhciBpbmRleCA9IFtdLmluZGV4T2YuY2FsbCh0aGlzLmV2ZW50c1t0b3BpY10sIGZuKTtcblxuICAgIC8vIHdlIGRpZG4ndCBmaW5kIGl0IGluIHRoZSBhcnJheVxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50c1t0b3BpY10uc3BsaWNlKGluZGV4LCAxKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZGF0YVt0aGlzLmRhdGEubGVuZ3RoIC0gMV07XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsb25lKHZhbHVlKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY2xvbmUodGhpcy5kYXRhKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oaXN0b3J5KSB7XG4gICAgICB0aGlzLmRhdGEucHVzaCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGF0YSA9IFt2YWx1ZV07XG4gICAgfVxuXG4gICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2UnKTtcblxuICAgIHJldHVybiB0aGlzLmdldCgpO1xuICB9O1xuXG4gIHJldHVybiBTdG9yZTtcblxufSkpKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvcmUuanMubWFwIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLkpvdHRlZCA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKiB1dGlsXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgb2JqID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICB2YXIgZGVmYXVsdHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgdmFyIGV4dGVuZGVkID0ge307XG4gICAgLy8gY2xvbmUgb2JqZWN0XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGV4dGVuZGVkW2tleV0gPSBvYmpba2V5XTtcbiAgICB9KTtcblxuICAgIC8vIGNvcHkgZGVmYXVsdCBrZXlzIHdoZXJlIHVuZGVmaW5lZFxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2YgZXh0ZW5kZWRba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZXh0ZW5kZWRba2V5XSA9IG9ialtrZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXh0ZW5kZWRba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXh0ZW5kZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmZXRjaCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayh1cmwsIHhocik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9O1xuXG4gICAgeGhyLnNlbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkNhbGxiYWNrKGluZGV4LCBwYXJhbXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goZXJyKTtcbiAgICAgIH1cblxuICAgICAgaW5kZXgrKztcbiAgICAgIGlmIChpbmRleCA8IGFyci5sZW5ndGgpIHtcbiAgICAgICAgc2VxUnVubmVyKGluZGV4LCByZXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhlcnJvcnMsIHJlcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlcVJ1bm5lcihpbmRleCwgcGFyYW1zLCBhcnIsIGVycm9ycywgY2FsbGJhY2spIHtcbiAgICAvLyBhc3luY1xuICAgIGFycltpbmRleF0ocGFyYW1zLCBydW5DYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlcShhcnIsIHBhcmFtcykge1xuICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZnVuY3Rpb24gKCkge307XG5cbiAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcnMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgc2VxUnVubmVyKDAsIHBhcmFtcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlKGZuLCBkZWxheSkge1xuICAgIHZhciBjb29sZG93biA9IG51bGw7XG4gICAgdmFyIG11bHRpcGxlID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAoY29vbGRvd24pIHtcbiAgICAgICAgbXVsdGlwbGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgY2xlYXJUaW1lb3V0KGNvb2xkb3duKTtcblxuICAgICAgY29vbGRvd24gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICAgICAgZm4uYXBwbHkoX3RoaXMsIF9hcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29vbGRvd24gPSBudWxsO1xuICAgICAgICBtdWx0aXBsZSA9IG51bGw7XG4gICAgICB9LCBkZWxheSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc0NsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuICAgIGlmICghbm9kZS5jbGFzc05hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRlbXBDbGFzcyA9ICcgJyArIG5vZGUuY2xhc3NOYW1lICsgJyAnO1xuICAgIGNsYXNzTmFtZSA9ICcgJyArIGNsYXNzTmFtZSArICcgJztcblxuICAgIGlmICh0ZW1wQ2xhc3MuaW5kZXhPZihjbGFzc05hbWUpICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgLy8gY2xhc3MgaXMgYWxyZWFkeSBhZGRlZFxuICAgIGlmIChoYXNDbGFzcyhub2RlLCBjbGFzc05hbWUpKSB7XG4gICAgICByZXR1cm4gbm9kZS5jbGFzc05hbWU7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lKSB7XG4gICAgICBjbGFzc05hbWUgPSAnICcgKyBjbGFzc05hbWU7XG4gICAgfVxuXG4gICAgbm9kZS5jbGFzc05hbWUgKz0gY2xhc3NOYW1lO1xuXG4gICAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIHNwYWNlQmVmb3JlID0gJyAnICsgY2xhc3NOYW1lO1xuICAgIHZhciBzcGFjZUFmdGVyID0gY2xhc3NOYW1lICsgJyAnO1xuXG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lLmluZGV4T2Yoc3BhY2VCZWZvcmUpICE9PSAtMSkge1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKHNwYWNlQmVmb3JlLCAnJyk7XG4gICAgfSBlbHNlIGlmIChub2RlLmNsYXNzTmFtZS5pbmRleE9mKHNwYWNlQWZ0ZXIpICE9PSAtMSkge1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKHNwYWNlQWZ0ZXIsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKGNsYXNzTmFtZSwgJycpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlLmNsYXNzTmFtZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRhdGEobm9kZSwgYXR0cikge1xuICAgIHJldHVybiBub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgYXR0cik7XG4gIH1cblxuICAvLyBtb2RlIGRldGVjdGlvbiBiYXNlZCBvbiBjb250ZW50IHR5cGUgYW5kIGZpbGUgZXh0ZW5zaW9uXG4gIHZhciBkZWZhdWx0TW9kZW1hcCA9IHtcbiAgICAnaHRtbCc6ICdodG1sJyxcbiAgICAnY3NzJzogJ2NzcycsXG4gICAgJ2pzJzogJ2phdmFzY3JpcHQnLFxuICAgICdsZXNzJzogJ2xlc3MnLFxuICAgICdzdHlsJzogJ3N0eWx1cycsXG4gICAgJ2NvZmZlZSc6ICdjb2ZmZWVzY3JpcHQnXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0TW9kZSgpIHtcbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gICAgdmFyIGZpbGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgIHZhciBjdXN0b21Nb2RlbWFwID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICAgIHZhciBtb2RlbWFwID0gZXh0ZW5kKGN1c3RvbU1vZGVtYXAsIGRlZmF1bHRNb2RlbWFwKTtcblxuICAgIC8vIHRyeSB0aGUgZmlsZSBleHRlbnNpb25cbiAgICBmb3IgKHZhciBrZXkgaW4gbW9kZW1hcCkge1xuICAgICAgdmFyIGtleUxlbmd0aCA9IGtleS5sZW5ndGg7XG4gICAgICBpZiAoZmlsZS5zbGljZSgta2V5TGVuZ3RoKyspID09PSAnLicgKyBrZXkpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0cnkgdGhlIGZpbGUgdHlwZSAoaHRtbC9jc3MvanMpXG4gICAgZm9yICh2YXIgX2tleSBpbiBtb2RlbWFwKSB7XG4gICAgICBpZiAodHlwZSA9PT0gX2tleSkge1xuICAgICAgICByZXR1cm4gbW9kZW1hcFtfa2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZTtcbiAgfVxuXG4gIC8qIHRlbXBsYXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNvbnRhaW5lcigpIHtcbiAgICByZXR1cm4gJ1xcbiAgICA8dWwgY2xhc3M9XCJqb3R0ZWQtbmF2XCI+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1yZXN1bHRcIj5cXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1qb3R0ZWQtdHlwZT1cInJlc3VsdFwiPlxcbiAgICAgICAgICBSZXN1bHRcXG4gICAgICAgIDwvYT5cXG4gICAgICA8L2xpPlxcbiAgICAgIDxsaSBjbGFzcz1cImpvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0taHRtbFwiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwiaHRtbFwiPlxcbiAgICAgICAgICBIVE1MXFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLWNzc1wiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwiY3NzXCI+XFxuICAgICAgICAgIENTU1xcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1qc1wiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwianNcIj5cXG4gICAgICAgICAgSmF2YVNjcmlwdFxcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1yZXN1bHRcIj48aWZyYW1lPjwvaWZyYW1lPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXBhbmUgam90dGVkLXBhbmUtaHRtbFwiPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXBhbmUgam90dGVkLXBhbmUtY3NzXCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1qc1wiPjwvZGl2PlxcbiAgJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhbmVBY3RpdmVDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtcGFuZS1hY3RpdmUtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBjb250YWluZXJDbGFzcygpIHtcbiAgICByZXR1cm4gJ2pvdHRlZCc7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNGaWxlQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLWhhcy0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkaXRvckNsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1lZGl0b3Igam90dGVkLWVkaXRvci0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkaXRvckNvbnRlbnQodHlwZSkge1xuICAgIHZhciBmaWxlVXJsID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcblxuICAgIHJldHVybiAnXFxuICAgIDx0ZXh0YXJlYSBkYXRhLWpvdHRlZC10eXBlPVwiJyArIHR5cGUgKyAnXCIgZGF0YS1qb3R0ZWQtZmlsZT1cIicgKyBmaWxlVXJsICsgJ1wiPjwvdGV4dGFyZWE+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtc3RhdHVzXCI+PC9kaXY+XFxuICAnO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzTWVzc2FnZShlcnIpIHtcbiAgICByZXR1cm4gJ1xcbiAgICA8cD4nICsgZXJyICsgJzwvcD5cXG4gICc7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtc3RhdHVzLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzQWN0aXZlQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLXN0YXR1cy1hY3RpdmUtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBwbHVnaW5DbGFzcyhuYW1lKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtcGx1Z2luLScgKyBuYW1lO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzTG9hZGluZyh1cmwpIHtcbiAgICByZXR1cm4gJ0xvYWRpbmcgPHN0cm9uZz4nICsgdXJsICsgJzwvc3Ryb25nPi4uJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c0ZldGNoRXJyb3IodXJsKSB7XG4gICAgcmV0dXJuICdUaGVyZSB3YXMgYW4gZXJyb3IgbG9hZGluZyA8c3Ryb25nPicgKyB1cmwgKyAnPC9zdHJvbmc+Lic7XG4gIH1cblxuICB2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9IDogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICB9O1xuXG5cblxuXG5cbiAgdmFyIGFzeW5jR2VuZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEF3YWl0VmFsdWUodmFsdWUpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBBc3luY0dlbmVyYXRvcihnZW4pIHtcbiAgICAgIHZhciBmcm9udCwgYmFjaztcblxuICAgICAgZnVuY3Rpb24gc2VuZChrZXksIGFyZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICBhcmc6IGFyZyxcbiAgICAgICAgICAgIHJlc29sdmU6IHJlc29sdmUsXG4gICAgICAgICAgICByZWplY3Q6IHJlamVjdCxcbiAgICAgICAgICAgIG5leHQ6IG51bGxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKGJhY2spIHtcbiAgICAgICAgICAgIGJhY2sgPSBiYWNrLm5leHQgPSByZXF1ZXN0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcm9udCA9IGJhY2sgPSByZXF1ZXN0O1xuICAgICAgICAgICAgcmVzdW1lKGtleSwgYXJnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZXN1bWUoa2V5LCBhcmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBd2FpdFZhbHVlKSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodmFsdWUudmFsdWUpLnRoZW4oZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgICByZXN1bWUoXCJuZXh0XCIsIGFyZyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICAgIHJlc3VtZShcInRocm93XCIsIGFyZyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0dGxlKHJlc3VsdC5kb25lID8gXCJyZXR1cm5cIiA6IFwibm9ybWFsXCIsIHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBzZXR0bGUoXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldHRsZSh0eXBlLCB2YWx1ZSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwicmV0dXJuXCI6XG4gICAgICAgICAgICBmcm9udC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcInRocm93XCI6XG4gICAgICAgICAgICBmcm9udC5yZWplY3QodmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJvbnQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgZG9uZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBmcm9udCA9IGZyb250Lm5leHQ7XG5cbiAgICAgICAgaWYgKGZyb250KSB7XG4gICAgICAgICAgcmVzdW1lKGZyb250LmtleSwgZnJvbnQuYXJnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYWNrID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbnZva2UgPSBzZW5kO1xuXG4gICAgICBpZiAodHlwZW9mIGdlbi5yZXR1cm4gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnJldHVybiA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5hc3luY0l0ZXJhdG9yKSB7XG4gICAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGVbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKFwibmV4dFwiLCBhcmcpO1xuICAgIH07XG5cbiAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUudGhyb3cgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKFwidGhyb3dcIiwgYXJnKTtcbiAgICB9O1xuXG4gICAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLnJldHVybiA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdyYXA6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBuZXcgQXN5bmNHZW5lcmF0b3IoZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgYXdhaXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbmV3IEF3YWl0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH0oKTtcblxuXG5cblxuXG4gIHZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gICAgfTtcbiAgfSgpO1xuXG5cblxuXG5cblxuXG4gIHZhciBnZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgICB9XG4gIH07XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuICB2YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBzZXQocGFyZW50LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjICYmIGRlc2Mud3JpdGFibGUpIHtcbiAgICAgIGRlc2MudmFsdWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNldHRlciA9IGRlc2Muc2V0O1xuXG4gICAgICBpZiAoc2V0dGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyogcGx1Z2luXG4gICAqL1xuXG4gIHZhciBwbHVnaW5zID0gW107XG5cbiAgZnVuY3Rpb24gZmluZCQxKGlkKSB7XG4gICAgZm9yICh2YXIgcGx1Z2luSW5kZXggaW4gcGx1Z2lucykge1xuICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbcGx1Z2luSW5kZXhdO1xuICAgICAgaWYgKHBsdWdpbi5faWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2FuJ3QgZmluZCBwbHVnaW5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgaWQgKyAnIGlzIG5vdCByZWdpc3RlcmVkLicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIoaWQsIHBsdWdpbikge1xuICAgIC8vIHByaXZhdGUgcHJvcGVydGllc1xuICAgIHBsdWdpbi5faWQgPSBpZDtcbiAgICBwbHVnaW5zLnB1c2gocGx1Z2luKTtcbiAgfVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBlYWNoIHBsdWdpbiwgb24gdGhlIGpvdHRlZCBpbnN0YW5jZVxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLl9nZXQoJ29wdGlvbnMnKS5wbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgLy8gY2hlY2sgaWYgcGx1Z2luIGRlZmluaXRpb24gaXMgc3RyaW5nIG9yIG9iamVjdFxuICAgICAgdmFyIFBsdWdpbiA9IHZvaWQgMDtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gdm9pZCAwO1xuICAgICAgdmFyIHBsdWdpbk9wdGlvbnMgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2luID09PSAnc3RyaW5nJykge1xuICAgICAgICBwbHVnaW5OYW1lID0gcGx1Z2luO1xuICAgICAgfSBlbHNlIGlmICgodHlwZW9mIHBsdWdpbiA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YocGx1Z2luKSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHBsdWdpbk5hbWUgPSBwbHVnaW4ubmFtZTtcbiAgICAgICAgcGx1Z2luT3B0aW9ucyA9IHBsdWdpbi5vcHRpb25zIHx8IHt9O1xuICAgICAgfVxuXG4gICAgICBQbHVnaW4gPSBmaW5kJDEocGx1Z2luTmFtZSk7XG4gICAgICBfdGhpcy5fZ2V0KCdwbHVnaW5zJylbcGx1Z2luXSA9IG5ldyBQbHVnaW4oX3RoaXMsIHBsdWdpbk9wdGlvbnMpO1xuXG4gICAgICBhZGRDbGFzcyhfdGhpcy5fZ2V0KCckY29udGFpbmVyJyksIHBsdWdpbkNsYXNzKHBsdWdpbk5hbWUpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIHB1YnNvdXBcbiAgICovXG5cbiAgdmFyIFB1YlNvdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUHViU291cCgpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFB1YlNvdXApO1xuXG4gICAgICB0aGlzLnRvcGljcyA9IHt9O1xuICAgICAgdGhpcy5jYWxsYmFja3MgPSB7fTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQdWJTb3VwLCBbe1xuICAgICAga2V5OiAnZmluZCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZChxdWVyeSkge1xuICAgICAgICB0aGlzLnRvcGljc1txdWVyeV0gPSB0aGlzLnRvcGljc1txdWVyeV0gfHwgW107XG4gICAgICAgIHJldHVybiB0aGlzLnRvcGljc1txdWVyeV07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnc3Vic2NyaWJlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdWJzY3JpYmUodG9waWMsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHByaW9yaXR5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiA5MDtcblxuICAgICAgICB2YXIgZm91bmRUb3BpYyA9IHRoaXMuZmluZCh0b3BpYyk7XG4gICAgICAgIHN1YnNjcmliZXIuX3ByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgIGZvdW5kVG9waWMucHVzaChzdWJzY3JpYmVyKTtcblxuICAgICAgICAvLyBzb3J0IHN1YnNjcmliZXJzIG9uIHByaW9yaXR5XG4gICAgICAgIGZvdW5kVG9waWMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLl9wcmlvcml0eSA+IGIuX3ByaW9yaXR5ID8gMSA6IGIuX3ByaW9yaXR5ID4gYS5fcHJpb3JpdHkgPyAtMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyByZW1vdmVzIGEgZnVuY3Rpb24gZnJvbSBhbiBhcnJheVxuXG4gICAgfSwge1xuICAgICAga2V5OiAncmVtb3ZlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlcihhcnIsIGZuKSB7XG4gICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBpZiBubyBmbiBpcyBzcGVjaWZpZWRcbiAgICAgICAgICAvLyBjbGVhbi11cCB0aGUgYXJyYXlcbiAgICAgICAgICBpZiAoIWZuKSB7XG4gICAgICAgICAgICBhcnIubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBmaW5kIHRoZSBmbiBpbiB0aGUgYXJyXG4gICAgICAgICAgdmFyIGluZGV4ID0gW10uaW5kZXhPZi5jYWxsKGFyciwgZm4pO1xuXG4gICAgICAgICAgLy8gd2UgZGlkbid0IGZpbmQgaXQgaW4gdGhlIGFycmF5XG4gICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICd1bnN1YnNjcmliZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdW5zdWJzY3JpYmUodG9waWMsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gc3Vic2NyaWJlcnNcbiAgICAgICAgdmFyIGZvdW5kVG9waWMgPSB0aGlzLmZpbmQodG9waWMpO1xuICAgICAgICB0aGlzLnJlbW92ZXIoZm91bmRUb3BpYywgc3Vic2NyaWJlcik7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gY2FsbGJhY2tzXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3RvcGljXSA9IHRoaXMuY2FsbGJhY2tzW3RvcGljXSB8fCBbXTtcbiAgICAgICAgdGhpcy5yZW1vdmVyKHRoaXMuY2FsbGJhY2tzW3RvcGljXSwgc3Vic2NyaWJlcik7XG4gICAgICB9XG5cbiAgICAgIC8vIHNlcXVlbnRpYWxseSBydW5zIGEgbWV0aG9kIG9uIGFsbCBwbHVnaW5zXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdwdWJsaXNoJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwdWJsaXNoKHRvcGljKSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgICAgIHZhciBmb3VuZFRvcGljID0gdGhpcy5maW5kKHRvcGljKTtcbiAgICAgICAgdmFyIHJ1bkxpc3QgPSBbXTtcblxuICAgICAgICBmb3VuZFRvcGljLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgICBydW5MaXN0LnB1c2goc3Vic2NyaWJlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlcShydW5MaXN0LCBwYXJhbXMsIHRoaXMucnVuQ2FsbGJhY2tzKHRvcGljKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhcmFsbGVsIHJ1biBhbGwgLmRvbmUgY2FsbGJhY2tzXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdydW5DYWxsYmFja3MnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJ1bkNhbGxiYWNrcyh0b3BpYykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXJyLCBwYXJhbXMpIHtcbiAgICAgICAgICBfdGhpcy5jYWxsYmFja3NbdG9waWNdID0gX3RoaXMuY2FsbGJhY2tzW3RvcGljXSB8fCBbXTtcblxuICAgICAgICAgIF90aGlzLmNhbGxiYWNrc1t0b3BpY10uZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgYyhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIGF0dGFjaCBhIGNhbGxiYWNrIHdoZW4gYSBwdWJsaXNoW3RvcGljXSBpcyBkb25lXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkb25lJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkb25lKHRvcGljKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZnVuY3Rpb24gKCkge307XG5cbiAgICAgICAgdGhpcy5jYWxsYmFja3NbdG9waWNdID0gdGhpcy5jYWxsYmFja3NbdG9waWNdIHx8IFtdO1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1t0b3BpY10ucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQdWJTb3VwO1xuICB9KCk7XG5cbiAgLyogcmVuZGVyIHBsdWdpblxuICAgKiByZW5kZXJzIHRoZSBpZnJhbWVcbiAgICovXG5cbiAgdmFyIFBsdWdpblJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5SZW5kZXIoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5SZW5kZXIpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gaWZyYW1lIHNyY2RvYyBzdXBwb3J0XG4gICAgICB2YXIgc3VwcG9ydFNyY2RvYyA9ICEhKCdzcmNkb2MnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpKTtcbiAgICAgIHZhciAkcmVzdWx0RnJhbWUgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXBhbmUtcmVzdWx0IGlmcmFtZScpO1xuXG4gICAgICB2YXIgZnJhbWVDb250ZW50ID0gJyc7XG5cbiAgICAgIC8vIGNhY2hlZCBjb250ZW50XG4gICAgICB2YXIgY29udGVudCA9IHtcbiAgICAgICAgaHRtbDogJycsXG4gICAgICAgIGNzczogJycsXG4gICAgICAgIGpzOiAnJ1xuICAgICAgfTtcblxuICAgICAgLy8gY2F0Y2ggZG9tcmVhZHkgZXZlbnRzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLmRvbXJlYWR5LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyByZW5kZXIgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgMTAwKTtcblxuICAgICAgLy8gcHVibGljXG4gICAgICB0aGlzLnN1cHBvcnRTcmNkb2MgPSBzdXBwb3J0U3JjZG9jO1xuICAgICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgICAgIHRoaXMuZnJhbWVDb250ZW50ID0gZnJhbWVDb250ZW50O1xuICAgICAgdGhpcy4kcmVzdWx0RnJhbWUgPSAkcmVzdWx0RnJhbWU7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgICB0aGlzLmluZGV4ID0gMDtcblxuICAgICAgdGhpcy5sYXN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5SZW5kZXIsIFt7XG4gICAgICBrZXk6ICd0ZW1wbGF0ZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gICAgICAgIHZhciBib2R5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgICAgICAgdmFyIHNjcmlwdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogJyc7XG5cbiAgICAgICAgcmV0dXJuICdcXG4gICAgICA8IWRvY3R5cGUgaHRtbD5cXG4gICAgICA8aHRtbD5cXG4gICAgICAgIDxoZWFkPlxcbiAgICAgICAgICA8c2NyaXB0PlxcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XFxuICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcXCdET01Db250ZW50TG9hZGVkXFwnLCBmdW5jdGlvbiAoKSB7XFxuICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFxcJ2pvdHRlZC1kb20tcmVhZHlcXCdcXG4gICAgICAgICAgICAgICAgfSksIFxcJypcXCcpXFxuICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgIH0oKSlcXG4gICAgICAgICAgPC9zY3JpcHQ+XFxuXFxuICAgICAgICAgIDxzdHlsZT4nICsgc3R5bGUgKyAnPC9zdHlsZT5cXG4gICAgICAgIDwvaGVhZD5cXG4gICAgICAgIDxib2R5PlxcbiAgICAgICAgICAnICsgYm9keSArICdcXG5cXG4gICAgICAgICAgPCEtLVxcbiAgICAgICAgICAgIEpvdHRlZDpcXG4gICAgICAgICAgICBFbXB0eSBzY3JpcHQgdGFnIHByZXZlbnRzIG1hbGZvcm1lZCBIVE1MIGZyb20gYnJlYWtpbmcgdGhlIG5leHQgc2NyaXB0LlxcbiAgICAgICAgICAtLT5cXG4gICAgICAgICAgPHNjcmlwdD48L3NjcmlwdD5cXG4gICAgICAgICAgPHNjcmlwdD4nICsgc2NyaXB0ICsgJzwvc2NyaXB0PlxcbiAgICAgICAgPC9ib2R5PlxcbiAgICAgIDwvaHRtbD5cXG4gICAgJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgLy8gY2FjaGUgbWFuaXB1bGF0ZWQgY29udGVudFxuICAgICAgICB0aGlzLmNvbnRlbnRbcGFyYW1zLnR5cGVdID0gcGFyYW1zLmNvbnRlbnQ7XG5cbiAgICAgICAgLy8gY2hlY2sgZXhpc3RpbmcgYW5kIHRvLWJlLXJlbmRlcmVkIGNvbnRlbnRcbiAgICAgICAgdmFyIG9sZEZyYW1lQ29udGVudCA9IHRoaXMuZnJhbWVDb250ZW50O1xuICAgICAgICB0aGlzLmZyYW1lQ29udGVudCA9IHRoaXMudGVtcGxhdGUodGhpcy5jb250ZW50Wydjc3MnXSwgdGhpcy5jb250ZW50WydodG1sJ10sIHRoaXMuY29udGVudFsnanMnXSk7XG5cbiAgICAgICAgLy8gY2FjaGUgdGhlIGN1cnJlbnQgY2FsbGJhY2sgYXMgZ2xvYmFsLFxuICAgICAgICAvLyBzbyB3ZSBjYW4gY2FsbCBpdCBmcm9tIHRoZSBtZXNzYWdlIGNhbGxiYWNrLlxuICAgICAgICB0aGlzLmxhc3RDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5sYXN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVuZGVyIGlmIHByZXZpb3VzIGFuZCBuZXcgZnJhbWUgY29udGVudCBhcmUgdGhlIHNhbWUuXG4gICAgICAgIC8vIG1vc3RseSBmb3IgdGhlIGBwbGF5YCBwbHVnaW4sXG4gICAgICAgIC8vIHNvIHdlIGRvbid0IHJlLXJlbmRlciB0aGUgc2FtZSBjb250ZW50IG9uIGVhY2ggY2hhbmdlLlxuICAgICAgICAvLyB1bmxlc3Mgd2Ugc2V0IGZvcmNlUmVuZGVyLlxuICAgICAgICBpZiAocGFyYW1zLmZvcmNlUmVuZGVyICE9PSB0cnVlICYmIHRoaXMuZnJhbWVDb250ZW50ID09PSBvbGRGcmFtZUNvbnRlbnQpIHtcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN1cHBvcnRTcmNkb2MpIHtcbiAgICAgICAgICAvLyBzcmNkb2MgaW4gdW5yZWxpYWJsZSBpbiBDaHJvbWUuXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2doaW5kYS9qb3R0ZWQvaXNzdWVzLzIzXG5cbiAgICAgICAgICAvLyByZS1jcmVhdGUgdGhlIGlmcmFtZSBvbiBlYWNoIGNoYW5nZSxcbiAgICAgICAgICAvLyB0byBkaXNjYXJkIHRoZSBwcmV2aW91c2x5IGxvYWRlZCBzY3JpcHRzLlxuICAgICAgICAgIHZhciAkbmV3UmVzdWx0RnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCgkbmV3UmVzdWx0RnJhbWUsIHRoaXMuJHJlc3VsdEZyYW1lKTtcbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZSA9ICRuZXdSZXN1bHRGcmFtZTtcblxuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQub3BlbigpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQud3JpdGUodGhpcy5mcmFtZUNvbnRlbnQpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY2xvc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvbGRlciBicm93c2VycyB3aXRob3V0IGlmcmFtZSBzcmNzZXQgc3VwcG9ydCAoSUU5KS5cbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjZG9jJywgdGhpcy5mcmFtZUNvbnRlbnQpO1xuXG4gICAgICAgICAgLy8gdGlwcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9qdWdnbGlubWlrZS9zcmNkb2MtcG9seWZpbGxcbiAgICAgICAgICAvLyBDb3B5cmlnaHQgKGMpIDIwMTIgTWlrZSBQZW5uaXNpXG4gICAgICAgICAgLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICAgICAgICAgIHZhciBqc1VybCA9ICdqYXZhc2NyaXB0OndpbmRvdy5mcmFtZUVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1zcmNkb2NcIik7JztcblxuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywganNVcmwpO1xuXG4gICAgICAgICAgLy8gRXhwbGljaXRseSBzZXQgdGhlIGlGcmFtZSdzIHdpbmRvdy5sb2NhdGlvbiBmb3JcbiAgICAgICAgICAvLyBjb21wYXRpYmlsaXR5IHdpdGggSUU5LCB3aGljaCBkb2VzIG5vdCByZWFjdCB0byBjaGFuZ2VzIGluXG4gICAgICAgICAgLy8gdGhlIGBzcmNgIGF0dHJpYnV0ZSB3aGVuIGl0IGlzIGEgYGphdmFzY3JpcHQ6YCBVUkwuXG4gICAgICAgICAgaWYgKHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24gPSBqc1VybDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkb21yZWFkeScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZG9tcmVhZHkoZSkge1xuICAgICAgICAvLyBvbmx5IGNhdGNoIG1lc3NhZ2VzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgICBpZiAoZS5zb3VyY2UgIT09IHRoaXMuJHJlc3VsdEZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSQkMSA9IHt9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEkJDEgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgaWYgKGRhdGEkJDEudHlwZSA9PT0gJ2pvdHRlZC1kb20tcmVhZHknKSB7XG4gICAgICAgICAgdGhpcy5sYXN0Q2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luUmVuZGVyO1xuICB9KCk7XG5cbiAgLyogc2NyaXB0bGVzcyBwbHVnaW5cbiAgICogcmVtb3ZlcyBzY3JpcHQgdGFncyBmcm9tIGh0bWwgY29udGVudFxuICAgKi9cblxuICB2YXIgUGx1Z2luU2NyaXB0bGVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5TY3JpcHRsZXNzKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luU2NyaXB0bGVzcyk7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zY3JpcHRpbmcuaHRtbFxuICAgICAgdmFyIHJ1blNjcmlwdFR5cGVzID0gWydhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JywgJ2FwcGxpY2F0aW9uL2VjbWFzY3JpcHQnLCAnYXBwbGljYXRpb24veC1lY21hc2NyaXB0JywgJ2FwcGxpY2F0aW9uL3gtamF2YXNjcmlwdCcsICd0ZXh0L2VjbWFzY3JpcHQnLCAndGV4dC9qYXZhc2NyaXB0JywgJ3RleHQvamF2YXNjcmlwdDEuMCcsICd0ZXh0L2phdmFzY3JpcHQxLjEnLCAndGV4dC9qYXZhc2NyaXB0MS4yJywgJ3RleHQvamF2YXNjcmlwdDEuMycsICd0ZXh0L2phdmFzY3JpcHQxLjQnLCAndGV4dC9qYXZhc2NyaXB0MS41JywgJ3RleHQvanNjcmlwdCcsICd0ZXh0L2xpdmVzY3JpcHQnLCAndGV4dC94LWVjbWFzY3JpcHQnLCAndGV4dC94LWphdmFzY3JpcHQnXTtcblxuICAgICAgLy8gcmVtb3ZlIHNjcmlwdCB0YWdzIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBwdWJsaWNcbiAgICAgIHRoaXMucnVuU2NyaXB0VHlwZXMgPSBydW5TY3JpcHRUeXBlcztcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5TY3JpcHRsZXNzLCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdodG1sJykge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIElFOSBzdXBwb3J0LCByZW1vdmUgdGhlIHNjcmlwdCB0YWdzIGZyb20gSFRNTCBjb250ZW50LlxuICAgICAgICAvLyB3aGVuIHdlIHN0b3Agc3VwcG9ydGluZyBJRTksIHdlIGNhbiB1c2UgdGhlIHNhbmRib3ggYXR0cmlidXRlLlxuICAgICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZnJhZ21lbnQuaW5uZXJIVE1MID0gcGFyYW1zLmNvbnRlbnQ7XG5cbiAgICAgICAgdmFyIHR5cGVBdHRyID0gbnVsbDtcblxuICAgICAgICAvLyByZW1vdmUgYWxsIHNjcmlwdCB0YWdzXG4gICAgICAgIHZhciAkc2NyaXB0cyA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdHlwZUF0dHIgPSAkc2NyaXB0c1tpXS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcblxuICAgICAgICAgIC8vIG9ubHkgcmVtb3ZlIHNjcmlwdCB0YWdzIHdpdGhvdXQgdGhlIHR5cGUgYXR0cmlidXRlXG4gICAgICAgICAgLy8gb3Igd2l0aCBhIGphdmFzY3JpcHQgbWltZSBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICAgICAgLy8gdGhlIG9uZXMgdGhhdCBhcmUgcnVuIGJ5IHRoZSBicm93c2VyLlxuICAgICAgICAgIGlmICghdHlwZUF0dHIgfHwgdGhpcy5ydW5TY3JpcHRUeXBlcy5pbmRleE9mKHR5cGVBdHRyKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICRzY3JpcHRzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoJHNjcmlwdHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmFtcy5jb250ZW50ID0gZnJhZ21lbnQuaW5uZXJIVE1MO1xuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5TY3JpcHRsZXNzO1xuICB9KCk7XG5cbiAgLyogYWNlIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQWNlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkFjZShqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkFjZSk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDE7XG4gICAgICB2YXIgaTtcblxuICAgICAgdGhpcy5lZGl0b3IgPSB7fTtcbiAgICAgIHRoaXMuam90dGVkID0gam90dGVkO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgQWNlIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuYWNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciAkZWRpdG9ycyA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb3R0ZWQtZWRpdG9yJyk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkZWRpdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgJHRleHRhcmVhID0gJGVkaXRvcnNbaV0ucXVlcnlTZWxlY3RvcigndGV4dGFyZWEnKTtcbiAgICAgICAgdmFyIHR5cGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC10eXBlJyk7XG4gICAgICAgIHZhciBmaWxlID0gZGF0YSgkdGV4dGFyZWEsICdqb3R0ZWQtZmlsZScpO1xuXG4gICAgICAgIHZhciAkYWNlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICRlZGl0b3JzW2ldLmFwcGVuZENoaWxkKCRhY2VDb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuZWRpdG9yW3R5cGVdID0gd2luZG93LmFjZS5lZGl0KCRhY2VDb250YWluZXIpO1xuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3JbdHlwZV07XG5cbiAgICAgICAgdmFyIGVkaXRvck9wdGlvbnMgPSBleHRlbmQob3B0aW9ucyk7XG5cbiAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKCdhY2UvbW9kZS8nICsgZ2V0TW9kZSh0eXBlLCBmaWxlKSk7XG4gICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkuc2V0T3B0aW9ucyhlZGl0b3JPcHRpb25zKTtcblxuICAgICAgICBlZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICB9XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkFjZSwgW3tcbiAgICAgIGtleTogJ2VkaXRvckNoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZWRpdG9yQ2hhbmdlKHBhcmFtcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuam90dGVkLnRyaWdnZXIoJ2NoYW5nZScsIHBhcmFtcyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3JbcGFyYW1zLnR5cGVdO1xuXG4gICAgICAgIC8vIGlmIHRoZSBldmVudCBpcyBub3Qgc3RhcnRlZCBieSB0aGUgYWNlIGNoYW5nZS5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIG9ubHkgb25jZSBwZXIgZWRpdG9yLFxuICAgICAgICAvLyB3aGVuIHRoZSB0ZXh0YXJlYSBpcyBwb3B1bGF0ZWQvZmlsZSBpcyBsb2FkZWQuXG4gICAgICAgIGlmICghcGFyYW1zLmFjZUVkaXRvcikge1xuICAgICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkuc2V0VmFsdWUocGFyYW1zLmNvbnRlbnQpO1xuXG4gICAgICAgICAgLy8gYXR0YWNoIHRoZSBldmVudCBvbmx5IGFmdGVyIHRoZSBmaWxlIGlzIGxvYWRlZFxuICAgICAgICAgIHBhcmFtcy5hY2VFZGl0b3IgPSBlZGl0b3I7XG4gICAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCB0aGlzLmVkaXRvckNoYW5nZShwYXJhbXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hbmlwdWxhdGUgdGhlIHBhcmFtcyBhbmQgcGFzcyB0aGVtIG9uXG4gICAgICAgIHBhcmFtcy5jb250ZW50ID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5BY2U7XG4gIH0oKTtcblxuICAvKiBjb3JlbWlycm9yIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQ29kZU1pcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5Db2RlTWlycm9yKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQ29kZU1pcnJvcik7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDE7XG4gICAgICB2YXIgaTtcblxuICAgICAgdGhpcy5lZGl0b3IgPSB7fTtcbiAgICAgIHRoaXMuam90dGVkID0gam90dGVkO1xuXG4gICAgICAvLyBjdXN0b20gbW9kZW1hcCBmb3IgY29kZW1pcnJvclxuICAgICAgdmFyIG1vZGVtYXAgPSB7XG4gICAgICAgICdodG1sJzogJ2h0bWxtaXhlZCdcbiAgICAgIH07XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIENvZGVNaXJyb3IgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5Db2RlTWlycm9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciAkZWRpdG9ycyA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb3R0ZWQtZWRpdG9yJyk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkZWRpdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgJHRleHRhcmVhID0gJGVkaXRvcnNbaV0ucXVlcnlTZWxlY3RvcigndGV4dGFyZWEnKTtcbiAgICAgICAgdmFyIHR5cGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC10eXBlJyk7XG4gICAgICAgIHZhciBmaWxlID0gZGF0YSgkdGV4dGFyZWEsICdqb3R0ZWQtZmlsZScpO1xuXG4gICAgICAgIHRoaXMuZWRpdG9yW3R5cGVdID0gd2luZG93LkNvZGVNaXJyb3IuZnJvbVRleHRBcmVhKCR0ZXh0YXJlYSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWRpdG9yW3R5cGVdLnNldE9wdGlvbignbW9kZScsIGdldE1vZGUodHlwZSwgZmlsZSwgbW9kZW1hcCkpO1xuICAgICAgfVxuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5Db2RlTWlycm9yLCBbe1xuICAgICAga2V5OiAnZWRpdG9yQ2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlZGl0b3JDaGFuZ2UocGFyYW1zKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyB0cmlnZ2VyIGEgY2hhbmdlIGV2ZW50XG4gICAgICAgICAgX3RoaXMuam90dGVkLnRyaWdnZXIoJ2NoYW5nZScsIHBhcmFtcyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3JbcGFyYW1zLnR5cGVdO1xuXG4gICAgICAgIC8vIGlmIHRoZSBldmVudCBpcyBub3Qgc3RhcnRlZCBieSB0aGUgY29kZW1pcnJvciBjaGFuZ2UuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBvbmx5IG9uY2UgcGVyIGVkaXRvcixcbiAgICAgICAgLy8gd2hlbiB0aGUgdGV4dGFyZWEgaXMgcG9wdWxhdGVkL2ZpbGUgaXMgbG9hZGVkLlxuICAgICAgICBpZiAoIXBhcmFtcy5jbUVkaXRvcikge1xuICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZShwYXJhbXMuY29udGVudCk7XG5cbiAgICAgICAgICAvLyBhdHRhY2ggdGhlIGV2ZW50IG9ubHkgYWZ0ZXIgdGhlIGZpbGUgaXMgbG9hZGVkXG4gICAgICAgICAgcGFyYW1zLmNtRWRpdG9yID0gZWRpdG9yO1xuICAgICAgICAgIGVkaXRvci5vbignY2hhbmdlJywgdGhpcy5lZGl0b3JDaGFuZ2UocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYW5pcHVsYXRlIHRoZSBwYXJhbXMgYW5kIHBhc3MgdGhlbSBvblxuICAgICAgICBwYXJhbXMuY29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQ29kZU1pcnJvcjtcbiAgfSgpO1xuXG4gIC8qIGxlc3MgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5MZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkxlc3Moam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5MZXNzKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBsZXNzIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubGVzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGFuZ2UgQ1NTIGxpbmsgbGFiZWwgdG8gTGVzc1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwiY3NzXCJdJykuaW5uZXJIVE1MID0gJ0xlc3MnO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5MZXNzLCBbe1xuICAgICAga2V5OiAnaXNMZXNzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0xlc3MocGFyYW1zKSB7XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2NzcycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zLmZpbGUuaW5kZXhPZignLmxlc3MnKSAhPT0gLTEgfHwgcGFyYW1zLmZpbGUgPT09ICcnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSAubGVzcyBhbmQgYmxhbmsgZmlsZXNcbiAgICAgICAgaWYgKHRoaXMuaXNMZXNzKHBhcmFtcykpIHtcbiAgICAgICAgICB3aW5kb3cubGVzcy5yZW5kZXIocGFyYW1zLmNvbnRlbnQsIHRoaXMub3B0aW9ucywgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBjb250ZW50IHdpdGggdGhlIHBhcnNlZCBsZXNzXG4gICAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gcmVzLmNzcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5MZXNzO1xuICB9KCk7XG5cbiAgLyogY29mZmVlc2NyaXB0IHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQ29mZmVlU2NyaXB0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkNvZmZlZVNjcmlwdChqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkNvZmZlZVNjcmlwdCk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgY29mZmVlc2NyaXB0IGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuQ29mZmVlU2NyaXB0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBKUyBsaW5rIGxhYmVsIHRvIExlc3NcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImpzXCJdJykuaW5uZXJIVE1MID0gJ0NvZmZlZVNjcmlwdCc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkNvZmZlZVNjcmlwdCwgW3tcbiAgICAgIGtleTogJ2lzQ29mZmVlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0NvZmZlZShwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnanMnKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5maWxlLmluZGV4T2YoJy5jb2ZmZWUnKSAhPT0gLTEgfHwgcGFyYW1zLmZpbGUgPT09ICcnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSAubGVzcyBhbmQgYmxhbmsgZmlsZXNcbiAgICAgICAgaWYgKHRoaXMuaXNDb2ZmZWUocGFyYW1zKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHdpbmRvdy5Db2ZmZWVTY3JpcHQuY29tcGlsZShwYXJhbXMuY29udGVudCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5Db2ZmZWVTY3JpcHQ7XG4gIH0oKTtcblxuICAvKiBzdHlsdXMgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5TdHlsdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luU3R5bHVzKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luU3R5bHVzKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBzdHlsdXMgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5zdHlsdXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIENTUyBsaW5rIGxhYmVsIHRvIFN0eWx1c1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwiY3NzXCJdJykuaW5uZXJIVE1MID0gJ1N0eWx1cyc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblN0eWx1cywgW3tcbiAgICAgIGtleTogJ2lzU3R5bHVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc1N0eWx1cyhwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnY3NzJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMuZmlsZS5pbmRleE9mKCcuc3R5bCcpICE9PSAtMSB8fCBwYXJhbXMuZmlsZSA9PT0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIC5zdHlsIGFuZCBibGFuayBmaWxlc1xuICAgICAgICBpZiAodGhpcy5pc1N0eWx1cyhwYXJhbXMpKSB7XG4gICAgICAgICAgd2luZG93LnN0eWx1cyhwYXJhbXMuY29udGVudCwgdGhpcy5vcHRpb25zKS5yZW5kZXIoZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBjb250ZW50IHdpdGggdGhlIHBhcnNlZCBsZXNzXG4gICAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gcmVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpblN0eWx1cztcbiAgfSgpO1xuXG4gIC8qIGJhYmVsIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQmFiZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQmFiZWwoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5CYWJlbCk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBiYWJlbCBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LkJhYmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyB1c2luZyBiYWJlbC1zdGFuZGFsb25lXG4gICAgICAgIHRoaXMuYmFiZWwgPSB3aW5kb3cuQmFiZWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuYmFiZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIHVzaW5nIGJyb3dzZXIuanMgZnJvbSBiYWJlbC1jb3JlIDUueFxuICAgICAgICB0aGlzLmJhYmVsID0ge1xuICAgICAgICAgIHRyYW5zZm9ybTogd2luZG93LmJhYmVsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBqcyBsaW5rIGxhYmVsXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJqc1wiXScpLmlubmVySFRNTCA9ICdFUzIwMTUnO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5CYWJlbCwgW3tcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSBqcyBjb250ZW50XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2pzJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHRoaXMuYmFiZWwudHJhbnNmb3JtKHBhcmFtcy5jb250ZW50LCB0aGlzLm9wdGlvbnMpLmNvZGU7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQmFiZWw7XG4gIH0oKTtcblxuICAvKiBtYXJrZG93biBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbk1hcmtkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbk1hcmtkb3duKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luTWFya2Rvd24pO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgbWFya2VkIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubWFya2VkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5tYXJrZWQuc2V0T3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgLy8gY2hhbmdlIGh0bWwgbGluayBsYWJlbFxuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwiaHRtbFwiXScpLmlubmVySFRNTCA9ICdNYXJrZG93bic7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbk1hcmtkb3duLCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIGh0bWwgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdodG1sJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHdpbmRvdy5tYXJrZWQocGFyYW1zLmNvbnRlbnQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbk1hcmtkb3duO1xuICB9KCk7XG5cbiAgLyogY29uc29sZSBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkNvbnNvbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQ29uc29sZShqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkNvbnNvbGUpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgYXV0b0NsZWFyOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDMwO1xuICAgICAgdmFyIGhpc3RvcnkgPSBbXTtcbiAgICAgIHZhciBoaXN0b3J5SW5kZXggPSAwO1xuICAgICAgdmFyIGxvZ0NhcHR1cmVTbmlwcGV0ID0gJygnICsgdGhpcy5jYXB0dXJlLnRvU3RyaW5nKCkgKyAnKSgpOyc7XG4gICAgICB2YXIgY29udGVudENhY2hlID0ge1xuICAgICAgICBodG1sOiAnJyxcbiAgICAgICAgY3NzOiAnJyxcbiAgICAgICAganM6ICcnXG4gICAgICB9O1xuXG4gICAgICAvLyBuZXcgdGFiIGFuZCBwYW5lIG1hcmt1cFxuICAgICAgdmFyICRuYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgYWRkQ2xhc3MoJG5hdiwgJ2pvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0tY29uc29sZScpO1xuICAgICAgJG5hdi5pbm5lckhUTUwgPSAnPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwiY29uc29sZVwiPkpTIENvbnNvbGU8L2E+JztcblxuICAgICAgdmFyICRwYW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBhZGRDbGFzcygkcGFuZSwgJ2pvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLWNvbnNvbGUnKTtcblxuICAgICAgJHBhbmUuaW5uZXJIVE1MID0gJ1xcbiAgICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtY29uc29sZS1jb250YWluZXJcIj5cXG4gICAgICAgIDx1bCBjbGFzcz1cImpvdHRlZC1jb25zb2xlLW91dHB1dFwiPjwvdWw+XFxuICAgICAgICA8Zm9ybSBjbGFzcz1cImpvdHRlZC1jb25zb2xlLWlucHV0XCI+XFxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxcbiAgICAgICAgPC9mb3JtPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxidXR0b24gY2xhc3M9XCJqb3R0ZWQtYnV0dG9uIGpvdHRlZC1jb25zb2xlLWNsZWFyXCI+Q2xlYXI8L2J1dHRvbj5cXG4gICAgJztcblxuICAgICAgam90dGVkLiRjb250YWluZXIuYXBwZW5kQ2hpbGQoJHBhbmUpO1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1uYXYnKS5hcHBlbmRDaGlsZCgkbmF2KTtcblxuICAgICAgdmFyICRjb250YWluZXIgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtY29udGFpbmVyJyk7XG4gICAgICB2YXIgJG91dHB1dCA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1vdXRwdXQnKTtcbiAgICAgIHZhciAkaW5wdXQgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtaW5wdXQgaW5wdXQnKTtcbiAgICAgIHZhciAkaW5wdXRGb3JtID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLWlucHV0Jyk7XG4gICAgICB2YXIgJGNsZWFyID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLWNsZWFyJyk7XG5cbiAgICAgIC8vIHN1Ym1pdCB0aGUgaW5wdXQgZm9ybVxuICAgICAgJGlucHV0Rm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY29uc29sZSBoaXN0b3J5XG4gICAgICAkaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGlzdG9yeS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY2xlYXIgYnV0dG9uXG4gICAgICAkY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsZWFyLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjbGVhciB0aGUgY29uc29sZSBvbiBlYWNoIGNoYW5nZVxuICAgICAgaWYgKG9wdGlvbnMuYXV0b0NsZWFyID09PSB0cnVlKSB7XG4gICAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5hdXRvQ2xlYXIuYmluZCh0aGlzKSwgcHJpb3JpdHkgLSAxKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FwdHVyZSB0aGUgY29uc29sZSBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG5cbiAgICAgIC8vIGdldCBsb2cgZXZlbnRzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLmdldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIHBsdWdpbiBwdWJsaWMgcHJvcGVydGllc1xuICAgICAgdGhpcy4kam90dGVkQ29udGFpbmVyID0gam90dGVkLiRjb250YWluZXI7XG4gICAgICB0aGlzLiRjb250YWluZXIgPSAkY29udGFpbmVyO1xuICAgICAgdGhpcy4kaW5wdXQgPSAkaW5wdXQ7XG4gICAgICB0aGlzLiRvdXRwdXQgPSAkb3V0cHV0O1xuICAgICAgdGhpcy5oaXN0b3J5ID0gaGlzdG9yeTtcbiAgICAgIHRoaXMuaGlzdG9yeUluZGV4ID0gaGlzdG9yeUluZGV4O1xuICAgICAgdGhpcy5sb2dDYXB0dXJlU25pcHBldCA9IGxvZ0NhcHR1cmVTbmlwcGV0O1xuICAgICAgdGhpcy5jb250ZW50Q2FjaGUgPSBjb250ZW50Q2FjaGU7XG4gICAgICB0aGlzLmdldElmcmFtZSA9IHRoaXMuZ2V0SWZyYW1lLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQ29uc29sZSwgW3tcbiAgICAgIGtleTogJ2dldElmcmFtZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SWZyYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kam90dGVkQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS1yZXN1bHQgaWZyYW1lJyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnZ2V0TWVzc2FnZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShlKSB7XG4gICAgICAgIC8vIG9ubHkgY2F0Y2ggbWVzc2FnZXMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICAgIGlmIChlLnNvdXJjZSAhPT0gdGhpcy5nZXRJZnJhbWUoKS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEkJDEgPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhJCQxID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG5cbiAgICAgICAgaWYgKGRhdGEkJDEudHlwZSA9PT0gJ2pvdHRlZC1jb25zb2xlLWxvZycpIHtcbiAgICAgICAgICB0aGlzLmxvZyhkYXRhJCQxLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnYXV0b0NsZWFyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBhdXRvQ2xlYXIocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc25pcHBldGxlc3NDb250ZW50ID0gcGFyYW1zLmNvbnRlbnQ7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBzbmlwcGV0IGZyb20gY2FjaGVkIGpzIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnanMnKSB7XG4gICAgICAgICAgc25pcHBldGxlc3NDb250ZW50ID0gc25pcHBldGxlc3NDb250ZW50LnJlcGxhY2UodGhpcy5sb2dDYXB0dXJlU25pcHBldCwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgUGxheSBwbHVnaW4sXG4gICAgICAgIC8vIGNsZWFyIHRoZSBjb25zb2xlIG9ubHkgaWYgc29tZXRoaW5nIGhhcyBjaGFuZ2VkIG9yIGZvcmNlIHJlbmRlcmluZy5cbiAgICAgICAgaWYgKHBhcmFtcy5mb3JjZVJlbmRlciA9PT0gdHJ1ZSB8fCB0aGlzLmNvbnRlbnRDYWNoZVtwYXJhbXMudHlwZV0gIT09IHNuaXBwZXRsZXNzQ29udGVudCkge1xuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFsd2F5cyBjYWNoZSB0aGUgbGF0ZXN0IGNvbnRlbnRcbiAgICAgICAgdGhpcy5jb250ZW50Q2FjaGVbcGFyYW1zLnR5cGVdID0gc25pcHBldGxlc3NDb250ZW50O1xuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIGpzIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnanMnKSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgc25pcHBldCBpcyBhbHJlYWR5IGFkZGVkLlxuICAgICAgICAvLyB0aGUgUGxheSBwbHVnaW4gY2FjaGVzIHRoZSBjaGFuZ2VkIHBhcmFtcyBhbmQgdHJpZ2dlcnMgY2hhbmdlXG4gICAgICAgIC8vIHdpdGggdGhlIGNhY2hlZCByZXNwb25zZSwgY2F1c2luZyB0aGUgc25pcHBldCB0byBiZSBpbnNlcnRlZFxuICAgICAgICAvLyBtdWx0aXBsZSB0aW1lcywgb24gZWFjaCB0cmlnZ2VyLlxuICAgICAgICBpZiAocGFyYW1zLmNvbnRlbnQuaW5kZXhPZih0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0KSA9PT0gLTEpIHtcbiAgICAgICAgICBwYXJhbXMuY29udGVudCA9ICcnICsgdGhpcy5sb2dDYXB0dXJlU25pcHBldCArIHBhcmFtcy5jb250ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FwdHVyZSB0aGUgY29uc29sZS5sb2cgb3V0cHV0XG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjYXB0dXJlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYXB0dXJlKCkge1xuICAgICAgICAvLyBJRTkgd2l0aCBkZXZ0b29scyBjbG9zZWRcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuY29uc29sZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5jb25zb2xlLmxvZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgICAgICAgIGxvZzogZnVuY3Rpb24gbG9nKCkge31cbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIElFOSBzdXBwb3J0XG4gICAgICAgIHZhciBvbGRDb25zb2xlTG9nID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbCh3aW5kb3cuY29uc29sZS5sb2csIHdpbmRvdy5jb25zb2xlKTtcblxuICAgICAgICB3aW5kb3cuY29uc29sZS5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gc2VuZCBsb2cgbWVzc2FnZXMgdG8gdGhlIHBhcmVudCB3aW5kb3dcbiAgICAgICAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuZm9yRWFjaChmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdqb3R0ZWQtY29uc29sZS1sb2cnLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICAgICAgICB9KSwgJyonKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGluIElFOSwgY29uc29sZS5sb2cgaXMgb2JqZWN0IGluc3RlYWQgb2YgZnVuY3Rpb25cbiAgICAgICAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzU4NTg5Ni9jb25zb2xlLWxvZy10eXBlb2YtaXMtb2JqZWN0LWluc3RlYWQtb2YtZnVuY3Rpb25cbiAgICAgICAgICBvbGRDb25zb2xlTG9nLmFwcGx5KG9sZENvbnNvbGVMb2csIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbG9nJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2coKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdmFyICRsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBhZGRDbGFzcygkbG9nLCAnam90dGVkLWNvbnNvbGUtbG9nJyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGFkZENsYXNzKCRsb2csICdqb3R0ZWQtY29uc29sZS1sb2ctJyArIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxvZy5pbm5lckhUTUwgPSBtZXNzYWdlO1xuXG4gICAgICAgIHRoaXMuJG91dHB1dC5hcHBlbmRDaGlsZCgkbG9nKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzdWJtaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdChlKSB7XG4gICAgICAgIHZhciBpbnB1dFZhbHVlID0gdGhpcy4kaW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgIC8vIGlmIGlucHV0IGlzIGJsYW5rLCBkbyBub3RoaW5nXG4gICAgICAgIGlmIChpbnB1dFZhbHVlID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgcnVuIHRvIGhpc3RvcnlcbiAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goaW5wdXRWYWx1ZSk7XG4gICAgICAgIHRoaXMuaGlzdG9yeUluZGV4ID0gdGhpcy5oaXN0b3J5Lmxlbmd0aDtcblxuICAgICAgICAvLyBsb2cgaW5wdXQgdmFsdWVcbiAgICAgICAgdGhpcy5sb2coaW5wdXRWYWx1ZSwgJ2hpc3RvcnknKTtcblxuICAgICAgICAvLyBhZGQgcmV0dXJuIGlmIGl0IGRvZXNuJ3Qgc3RhcnQgd2l0aCBpdFxuICAgICAgICBpZiAoaW5wdXRWYWx1ZS5pbmRleE9mKCdyZXR1cm4nKSAhPT0gMCkge1xuICAgICAgICAgIGlucHV0VmFsdWUgPSAncmV0dXJuICcgKyBpbnB1dFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hvdyBvdXRwdXQgb3IgZXJyb3JzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gcnVuIHRoZSBjb25zb2xlIGlucHV0IGluIHRoZSBpZnJhbWUgY29udGV4dFxuICAgICAgICAgIHZhciBzY3JpcHRPdXRwdXQgPSB0aGlzLmdldElmcmFtZSgpLmNvbnRlbnRXaW5kb3cuZXZhbCgnKGZ1bmN0aW9uKCkgeycgKyBpbnB1dFZhbHVlICsgJ30pKCknKTtcblxuICAgICAgICAgIHRoaXMubG9nKHNjcmlwdE91dHB1dCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRoaXMubG9nKGVyciwgJ2Vycm9yJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhciB0aGUgY29uc29sZSB2YWx1ZVxuICAgICAgICB0aGlzLiRpbnB1dC52YWx1ZSA9ICcnO1xuXG4gICAgICAgIC8vIHNjcm9sbCBjb25zb2xlIHBhbmUgdG8gYm90dG9tXG4gICAgICAgIC8vIHRvIGtlZXAgdGhlIGlucHV0IGludG8gdmlld1xuICAgICAgICB0aGlzLiRjb250YWluZXIuc2Nyb2xsVG9wID0gdGhpcy4kY29udGFpbmVyLnNjcm9sbEhlaWdodDtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2xlYXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICB0aGlzLiRvdXRwdXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnaGlzdG9yeScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaGlzdG9yeShlKSB7XG4gICAgICAgIHZhciBVUCA9IDM4O1xuICAgICAgICB2YXIgRE9XTiA9IDQwO1xuICAgICAgICB2YXIgZ290SGlzdG9yeSA9IGZhbHNlO1xuICAgICAgICB2YXIgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLiRpbnB1dC5zZWxlY3Rpb25TdGFydDtcblxuICAgICAgICAvLyBvbmx5IGlmIHdlIGhhdmUgcHJldmlvdXMgaGlzdG9yeVxuICAgICAgICAvLyBhbmQgdGhlIGN1cnNvciBpcyBhdCB0aGUgc3RhcnRcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gVVAgJiYgdGhpcy5oaXN0b3J5SW5kZXggIT09IDAgJiYgc2VsZWN0aW9uU3RhcnQgPT09IDApIHtcbiAgICAgICAgICB0aGlzLmhpc3RvcnlJbmRleC0tO1xuICAgICAgICAgIGdvdEhpc3RvcnkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBpZiB3ZSBoYXZlIGZ1dHVyZSBoaXN0b3J5XG4gICAgICAgIC8vIGFuZCB0aGUgY3Vyc29yIGlzIGF0IHRoZSBlbmRcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gRE9XTiAmJiB0aGlzLmhpc3RvcnlJbmRleCAhPT0gdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDEgJiYgc2VsZWN0aW9uU3RhcnQgPT09IHRoaXMuJGlucHV0LnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4Kys7XG4gICAgICAgICAgZ290SGlzdG9yeSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvbmx5IGlmIGhpc3RvcnkgY2hhbmdlZFxuICAgICAgICBpZiAoZ290SGlzdG9yeSkge1xuICAgICAgICAgIHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5oaXN0b3J5W3RoaXMuaGlzdG9yeUluZGV4XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQ29uc29sZTtcbiAgfSgpO1xuXG4gIC8qIHBsYXkgcGx1Z2luXG4gICAqIGFkZHMgYSBSdW4gYnV0dG9uXG4gICAqL1xuXG4gIHZhciBQbHVnaW5QbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblBsYXkoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5QbGF5KTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIGZpcnN0UnVuOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMTA7XG4gICAgICAvLyBjYWNoZWQgY29kZVxuICAgICAgdmFyIGNhY2hlID0ge307XG4gICAgICAvLyBsYXRlc3QgdmVyc2lvbiBvZiB0aGUgY29kZS5cbiAgICAgIC8vIHJlcGxhY2VzIHRoZSBjYWNoZSB3aGVuIHRoZSBydW4gYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgICB2YXIgY29kZSA9IHt9O1xuXG4gICAgICAvLyBzZXQgZmlyc3RSdW49ZmFsc2UgdG8gc3RhcnQgd2l0aCBhIGJsYW5rIHByZXZpZXcuXG4gICAgICAvLyBydW4gdGhlIHJlYWwgY29udGVudCBvbmx5IGFmdGVyIHRoZSBmaXJzdCBSdW4gYnV0dG9uIHByZXNzLlxuICAgICAgaWYgKG9wdGlvbnMuZmlyc3RSdW4gPT09IGZhbHNlKSB7XG4gICAgICAgIGNhY2hlID0ge1xuICAgICAgICAgIGh0bWw6IHtcbiAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgIHR5cGU6ICdjc3MnLFxuICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICB9LFxuICAgICAgICAgIGpzOiB7XG4gICAgICAgICAgICB0eXBlOiAnanMnLFxuICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIHJ1biBidXR0b25cbiAgICAgIHZhciAkYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAkYnV0dG9uLmNsYXNzTmFtZSA9ICdqb3R0ZWQtYnV0dG9uIGpvdHRlZC1idXR0b24tcGxheSc7XG4gICAgICAkYnV0dG9uLmlubmVySFRNTCA9ICdSdW4nO1xuXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCgkYnV0dG9uKTtcbiAgICAgICRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnJ1bi5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY2FwdHVyZSB0aGUgY29kZSBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG5cbiAgICAgIC8vIHB1YmxpY1xuICAgICAgdGhpcy5jYWNoZSA9IGNhY2hlO1xuICAgICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgIHRoaXMuam90dGVkID0gam90dGVkO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblBsYXksIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIGFsd2F5cyBjYWNoZSB0aGUgbGF0ZXN0IGNvZGVcbiAgICAgICAgdGhpcy5jb2RlW3BhcmFtcy50eXBlXSA9IGV4dGVuZChwYXJhbXMpO1xuXG4gICAgICAgIC8vIHJlcGxhY2UgdGhlIHBhcmFtcyB3aXRoIHRoZSBsYXRlc3QgY2FjaGVcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXSk7XG5cbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgY2FjaGUgZm9yY2VSZW5kZXIsXG4gICAgICAgICAgLy8gYW5kIHNlbmQgaXQgd2l0aCBlYWNoIGNoYW5nZS5cbiAgICAgICAgICB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXS5mb3JjZVJlbmRlciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2FjaGUgdGhlIGZpcnN0IHJ1blxuICAgICAgICAgIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdID0gZXh0ZW5kKHBhcmFtcyk7XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncnVuJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBydW4oKSB7XG4gICAgICAgIC8vIHRyaWdnZXIgY2hhbmdlIG9uIGVhY2ggdHlwZSB3aXRoIHRoZSBsYXRlc3QgY29kZVxuICAgICAgICBmb3IgKHZhciB0eXBlIGluIHRoaXMuY29kZSkge1xuICAgICAgICAgIHRoaXMuY2FjaGVbdHlwZV0gPSBleHRlbmQodGhpcy5jb2RlW3R5cGVdLCB7XG4gICAgICAgICAgICAvLyBmb3JjZSByZW5kZXJpbmcgb24gZWFjaCBSdW4gcHJlc3NcbiAgICAgICAgICAgIGZvcmNlUmVuZGVyOiB0cnVlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBjaGFuZ2VcbiAgICAgICAgICB0aGlzLmpvdHRlZC50cmlnZ2VyKCdjaGFuZ2UnLCB0aGlzLmNhY2hlW3R5cGVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luUGxheTtcbiAgfSgpO1xuXG4gIC8qIGJ1bmRsZSBwbHVnaW5zXG4gICAqL1xuXG4gIC8vIHJlZ2lzdGVyIGJ1bmRsZWQgcGx1Z2luc1xuICBmdW5jdGlvbiBCdW5kbGVQbHVnaW5zKGpvdHRlZCkge1xuICAgIGpvdHRlZC5wbHVnaW4oJ3JlbmRlcicsIFBsdWdpblJlbmRlcik7XG4gICAgam90dGVkLnBsdWdpbignc2NyaXB0bGVzcycsIFBsdWdpblNjcmlwdGxlc3MpO1xuXG4gICAgam90dGVkLnBsdWdpbignYWNlJywgUGx1Z2luQWNlKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdjb2RlbWlycm9yJywgUGx1Z2luQ29kZU1pcnJvcik7XG4gICAgam90dGVkLnBsdWdpbignbGVzcycsIFBsdWdpbkxlc3MpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2NvZmZlZXNjcmlwdCcsIFBsdWdpbkNvZmZlZVNjcmlwdCk7XG4gICAgam90dGVkLnBsdWdpbignc3R5bHVzJywgUGx1Z2luU3R5bHVzKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdiYWJlbCcsIFBsdWdpbkJhYmVsKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdtYXJrZG93bicsIFBsdWdpbk1hcmtkb3duKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdjb25zb2xlJywgUGx1Z2luQ29uc29sZSk7XG4gICAgam90dGVkLnBsdWdpbigncGxheScsIFBsdWdpblBsYXkpO1xuICB9XG5cbiAgLyogam90dGVkXG4gICAqL1xuXG4gIHZhciBKb3R0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSm90dGVkKCRqb3R0ZWRDb250YWluZXIsIG9wdHMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIEpvdHRlZCk7XG5cbiAgICAgIGlmICghJGpvdHRlZENvbnRhaW5lcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3QgZmluZCBKb3R0ZWQgY29udGFpbmVyLicpO1xuICAgICAgfVxuXG4gICAgICAvLyBwcml2YXRlIGRhdGFcbiAgICAgIHZhciBfcHJpdmF0ZSA9IHt9O1xuICAgICAgdGhpcy5fZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gX3ByaXZhdGVba2V5XTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBfcHJpdmF0ZVtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBfcHJpdmF0ZVtrZXldO1xuICAgICAgfTtcblxuICAgICAgLy8gb3B0aW9uc1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9zZXQoJ29wdGlvbnMnLCBleHRlbmQob3B0cywge1xuICAgICAgICBmaWxlczogW10sXG4gICAgICAgIHNob3dCbGFuazogZmFsc2UsXG4gICAgICAgIHJ1blNjcmlwdHM6IHRydWUsXG4gICAgICAgIHBhbmU6ICdyZXN1bHQnLFxuICAgICAgICBkZWJvdW5jZTogMjUwLFxuICAgICAgICBwbHVnaW5zOiBbXVxuICAgICAgfSkpO1xuXG4gICAgICAvLyB0aGUgcmVuZGVyIHBsdWdpbiBpcyBtYW5kYXRvcnlcbiAgICAgIG9wdGlvbnMucGx1Z2lucy5wdXNoKCdyZW5kZXInKTtcblxuICAgICAgLy8gdXNlIHRoZSBzY3JpcHRsZXNzIHBsdWdpbiBpZiBydW5TY3JpcHRzIGlzIGZhbHNlXG4gICAgICBpZiAob3B0aW9ucy5ydW5TY3JpcHRzID09PSBmYWxzZSkge1xuICAgICAgICBvcHRpb25zLnBsdWdpbnMucHVzaCgnc2NyaXB0bGVzcycpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYWNoZWQgY29udGVudCBmb3IgdGhlIGNoYW5nZSBtZXRob2QuXG4gICAgICB0aGlzLl9zZXQoJ2NhY2hlZENvbnRlbnQnLCB7XG4gICAgICAgIGh0bWw6IG51bGwsXG4gICAgICAgIGNzczogbnVsbCxcbiAgICAgICAganM6IG51bGxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBQdWJTb3VwXG4gICAgICB2YXIgcHVic291cCA9IHRoaXMuX3NldCgncHVic291cCcsIG5ldyBQdWJTb3VwKCkpO1xuXG4gICAgICB0aGlzLl9zZXQoJ3RyaWdnZXInLCB0aGlzLnRyaWdnZXIoKSk7XG4gICAgICB0aGlzLl9zZXQoJ29uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwdWJzb3VwLnN1YnNjcmliZS5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ29mZicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHVic291cC51bnN1YnNjcmliZS5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICB2YXIgZG9uZSA9IHRoaXMuX3NldCgnZG9uZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHVic291cC5kb25lLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gYWZ0ZXIgYWxsIHBsdWdpbnMgcnVuXG4gICAgICAvLyBzaG93IGVycm9yc1xuICAgICAgZG9uZSgnY2hhbmdlJywgdGhpcy5lcnJvcnMuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIERPTVxuICAgICAgdmFyICRjb250YWluZXIgPSB0aGlzLl9zZXQoJyRjb250YWluZXInLCAkam90dGVkQ29udGFpbmVyKTtcbiAgICAgICRjb250YWluZXIuaW5uZXJIVE1MID0gY29udGFpbmVyKCk7XG4gICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBjb250YWluZXJDbGFzcygpKTtcblxuICAgICAgLy8gZGVmYXVsdCBwYW5lXG4gICAgICB2YXIgcGFuZUFjdGl2ZSA9IHRoaXMuX3NldCgncGFuZUFjdGl2ZScsIG9wdGlvbnMucGFuZSk7XG4gICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBwYW5lQWN0aXZlQ2xhc3MocGFuZUFjdGl2ZSkpO1xuXG4gICAgICAvLyBzdGF0dXMgbm9kZXNcbiAgICAgIHRoaXMuX3NldCgnJHN0YXR1cycsIHt9KTtcblxuICAgICAgdmFyIF9hcnIgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJ107XG4gICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgX2Fyci5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIF90eXBlID0gX2FycltfaV07XG4gICAgICAgIHRoaXMubWFya3VwKF90eXBlKTtcbiAgICAgIH1cblxuICAgICAgLy8gdGV4dGFyZWEgY2hhbmdlIGV2ZW50cy5cbiAgICAgICRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBkZWJvdW5jZSh0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBvcHRpb25zLmRlYm91bmNlKSk7XG4gICAgICAkY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGRlYm91bmNlKHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIG9wdGlvbnMuZGVib3VuY2UpKTtcblxuICAgICAgLy8gcGFuZSBjaGFuZ2VcbiAgICAgICRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnBhbmUuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGV4cG9zZSBwdWJsaWMgcHJvcGVydGllc1xuICAgICAgdGhpcy4kY29udGFpbmVyID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJyk7XG4gICAgICB0aGlzLm9uID0gdGhpcy5fZ2V0KCdvbicpO1xuICAgICAgdGhpcy5vZmYgPSB0aGlzLl9nZXQoJ29mZicpO1xuICAgICAgdGhpcy5kb25lID0gdGhpcy5fZ2V0KCdkb25lJyk7XG4gICAgICB0aGlzLnRyaWdnZXIgPSB0aGlzLl9nZXQoJ3RyaWdnZXInKTtcbiAgICAgIHRoaXMucGFuZUFjdGl2ZSA9IHRoaXMuX2dldCgncGFuZUFjdGl2ZScpO1xuXG4gICAgICAvLyBpbml0IHBsdWdpbnNcbiAgICAgIHRoaXMuX3NldCgncGx1Z2lucycsIHt9KTtcbiAgICAgIGluaXQuY2FsbCh0aGlzKTtcblxuICAgICAgLy8gbG9hZCBmaWxlc1xuICAgICAgdmFyIF9hcnIyID0gWydodG1sJywgJ2NzcycsICdqcyddO1xuICAgICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgX2FycjIubGVuZ3RoOyBfaTIrKykge1xuICAgICAgICB2YXIgX3R5cGUyID0gX2FycjJbX2kyXTtcbiAgICAgICAgdGhpcy5sb2FkKF90eXBlMik7XG4gICAgICB9XG5cbiAgICAgIC8vIHNob3cgYWxsIHRhYnMsIGV2ZW4gaWYgZW1wdHlcbiAgICAgIGlmIChvcHRpb25zLnNob3dCbGFuaykge1xuICAgICAgICB2YXIgX2FycjMgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJ107XG5cbiAgICAgICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgX2FycjMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICAgIHZhciB0eXBlID0gX2FycjNbX2kzXTtcbiAgICAgICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBoYXNGaWxlQ2xhc3ModHlwZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoSm90dGVkLCBbe1xuICAgICAga2V5OiAnZmluZEZpbGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRGaWxlKHR5cGUpIHtcbiAgICAgICAgdmFyIGZpbGUgPSB7fTtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9nZXQoJ29wdGlvbnMnKTtcblxuICAgICAgICBmb3IgKHZhciBmaWxlSW5kZXggaW4gb3B0aW9ucy5maWxlcykge1xuICAgICAgICAgIHZhciBfZmlsZSA9IG9wdGlvbnMuZmlsZXNbZmlsZUluZGV4XTtcbiAgICAgICAgICBpZiAoX2ZpbGUudHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9maWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ21hcmt1cCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbWFya3VwKHR5cGUpIHtcbiAgICAgICAgdmFyICRjb250YWluZXIgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKTtcbiAgICAgICAgdmFyICRwYXJlbnQgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS0nICsgdHlwZSk7XG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgbWFya3VwIGZvciBhbiBlZGl0b3JcbiAgICAgICAgdmFyIGZpbGUgPSB0aGlzLmZpbmRGaWxlKHR5cGUpO1xuXG4gICAgICAgIHZhciAkZWRpdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICRlZGl0b3IuaW5uZXJIVE1MID0gZWRpdG9yQ29udGVudCh0eXBlLCBmaWxlLnVybCk7XG4gICAgICAgICRlZGl0b3IuY2xhc3NOYW1lID0gZWRpdG9yQ2xhc3ModHlwZSk7XG5cbiAgICAgICAgJHBhcmVudC5hcHBlbmRDaGlsZCgkZWRpdG9yKTtcblxuICAgICAgICAvLyBnZXQgdGhlIHN0YXR1cyBub2RlXG4gICAgICAgIHRoaXMuX2dldCgnJHN0YXR1cycpW3R5cGVdID0gJHBhcmVudC5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXN0YXR1cycpO1xuXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBmaWxlIGZvciB0aGUgY3VycmVudCB0eXBlXG4gICAgICAgIGlmICh0eXBlb2YgZmlsZS51cmwgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBmaWxlLmNvbnRlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gYWRkIHRoZSBoYXMtdHlwZSBjbGFzcyB0byB0aGUgY29udGFpbmVyXG4gICAgICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgaGFzRmlsZUNsYXNzKHR5cGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQodHlwZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgbWFya3VwIGZvciBhbiBlZGl0b3JcbiAgICAgICAgdmFyIGZpbGUgPSB0aGlzLmZpbmRGaWxlKHR5cGUpO1xuICAgICAgICB2YXIgJHRleHRhcmVhID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJykucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLScgKyB0eXBlICsgJyB0ZXh0YXJlYScpO1xuXG4gICAgICAgIC8vIGZpbGUgYXMgc3RyaW5nXG4gICAgICAgIGlmICh0eXBlb2YgZmlsZS5jb250ZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoJHRleHRhcmVhLCBmaWxlLmNvbnRlbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWxlLnVybCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBzaG93IGxvYWRpbmcgbWVzc2FnZVxuICAgICAgICAgIHRoaXMuc3RhdHVzKCdsb2FkaW5nJywgW3N0YXR1c0xvYWRpbmcoZmlsZS51cmwpXSwge1xuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGZpbGUgYXMgdXJsXG4gICAgICAgICAgZmV0Y2goZmlsZS51cmwsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAvLyBzaG93IGxvYWQgZXJyb3JzXG4gICAgICAgICAgICAgIF90aGlzLnN0YXR1cygnZXJyb3InLCBbc3RhdHVzRmV0Y2hFcnJvcihlcnIpXSwge1xuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjbGVhciB0aGUgbG9hZGluZyBzdGF0dXNcbiAgICAgICAgICAgIF90aGlzLmNsZWFyU3RhdHVzKCdsb2FkaW5nJywge1xuICAgICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgX3RoaXMuc2V0VmFsdWUoJHRleHRhcmVhLCByZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRyaWdnZXIgYSBjaGFuZ2UgZXZlbnQgb24gYmxhbmsgZWRpdG9ycyxcbiAgICAgICAgICAvLyBmb3IgZWRpdG9yIHBsdWdpbnMgdG8gY2F0Y2guXG4gICAgICAgICAgLy8gKGVnLiB0aGUgY29kZW1pcnJvciBhbmQgYWNlIHBsdWdpbnMgYXR0YWNoIHRoZSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICAvLyBvbmx5IGFmdGVyIHRoZSBpbml0aWFsIGNoYW5nZS9sb2FkIGV2ZW50KVxuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoJHRleHRhcmVhLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzZXRWYWx1ZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VmFsdWUoJHRleHRhcmVhLCB2YWwpIHtcbiAgICAgICAgJHRleHRhcmVhLnZhbHVlID0gdmFsO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgY2hhbmdlIGV2ZW50LCBmb3IgaW5pdGlhbCByZW5kZXJcbiAgICAgICAgdGhpcy5jaGFuZ2Uoe1xuICAgICAgICAgIHRhcmdldDogJHRleHRhcmVhXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKGUpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBkYXRhKGUudGFyZ2V0LCAnam90dGVkLXR5cGUnKTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uJ3QgdHJpZ2dlciBjaGFuZ2UgaWYgdGhlIGNvbnRlbnQgaGFzbid0IGNoYW5nZWQuXG4gICAgICAgIC8vIGVnLiB3aGVuIGJsdXJyaW5nIHRoZSB0ZXh0YXJlYS5cbiAgICAgICAgdmFyIGNhY2hlZENvbnRlbnQgPSB0aGlzLl9nZXQoJ2NhY2hlZENvbnRlbnQnKTtcbiAgICAgICAgaWYgKGNhY2hlZENvbnRlbnRbdHlwZV0gPT09IGUudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FjaGUgbGF0ZXN0IGNvbnRlbnRcbiAgICAgICAgY2FjaGVkQ29udGVudFt0eXBlXSA9IGUudGFyZ2V0LnZhbHVlO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgdGhlIGNoYW5nZSBldmVudFxuICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIGZpbGU6IGRhdGEoZS50YXJnZXQsICdqb3R0ZWQtZmlsZScpLFxuICAgICAgICAgIGNvbnRlbnQ6IGNhY2hlZENvbnRlbnRbdHlwZV1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnZXJyb3JzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlcnJvcnMoZXJycywgcGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc3RhdHVzKCdlcnJvcicsIGVycnMsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncGFuZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcGFuZShlKSB7XG4gICAgICAgIGlmICghZGF0YShlLnRhcmdldCwgJ2pvdHRlZC10eXBlJykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJGNvbnRhaW5lciA9IHRoaXMuX2dldCgnJGNvbnRhaW5lcicpO1xuICAgICAgICB2YXIgcGFuZUFjdGl2ZSA9IHRoaXMuX2dldCgncGFuZUFjdGl2ZScpO1xuICAgICAgICByZW1vdmVDbGFzcygkY29udGFpbmVyLCBwYW5lQWN0aXZlQ2xhc3MocGFuZUFjdGl2ZSkpO1xuXG4gICAgICAgIHBhbmVBY3RpdmUgPSB0aGlzLl9zZXQoJ3BhbmVBY3RpdmUnLCBkYXRhKGUudGFyZ2V0LCAnam90dGVkLXR5cGUnKSk7XG4gICAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIHBhbmVBY3RpdmVDbGFzcyhwYW5lQWN0aXZlKSk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3N0YXR1cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc3RhdHVzKCkge1xuICAgICAgICB2YXIgc3RhdHVzVHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ2Vycm9yJztcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBbXTtcbiAgICAgICAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgICAgICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhclN0YXR1cyhzdGF0dXNUeXBlLCBwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRzdGF0dXMgPSB0aGlzLl9nZXQoJyRzdGF0dXMnKTtcblxuICAgICAgICAvLyBhZGQgZXJyb3IvbG9hZGluZyBjbGFzcyB0byBzdGF0dXNcbiAgICAgICAgYWRkQ2xhc3MoJHN0YXR1c1twYXJhbXMudHlwZV0sIHN0YXR1c0NsYXNzKHN0YXR1c1R5cGUpKTtcblxuICAgICAgICBhZGRDbGFzcyh0aGlzLl9nZXQoJyRjb250YWluZXInKSwgc3RhdHVzQWN0aXZlQ2xhc3MocGFyYW1zLnR5cGUpKTtcblxuICAgICAgICB2YXIgbWFya3VwID0gJyc7XG4gICAgICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIG1hcmt1cCArPSBzdGF0dXNNZXNzYWdlKGVycik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzdGF0dXNbcGFyYW1zLnR5cGVdLmlubmVySFRNTCA9IG1hcmt1cDtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjbGVhclN0YXR1cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJTdGF0dXMoc3RhdHVzVHlwZSwgcGFyYW1zKSB7XG4gICAgICAgIHZhciAkc3RhdHVzID0gdGhpcy5fZ2V0KCckc3RhdHVzJyk7XG5cbiAgICAgICAgcmVtb3ZlQ2xhc3MoJHN0YXR1c1twYXJhbXMudHlwZV0sIHN0YXR1c0NsYXNzKHN0YXR1c1R5cGUpKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5fZ2V0KCckY29udGFpbmVyJyksIHN0YXR1c0FjdGl2ZUNsYXNzKHBhcmFtcy50eXBlKSk7XG4gICAgICAgICRzdGF0dXNbcGFyYW1zLnR5cGVdLmlubmVySFRNTCA9ICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWJvdW5jZWQgdHJpZ2dlciBtZXRob2RcbiAgICAgIC8vIGN1c3RvbSBkZWJvdW5jZXIgdG8gdXNlIGEgZGlmZmVyZW50IHRpbWVyIHBlciB0eXBlXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd0cmlnZ2VyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB0cmlnZ2VyKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX2dldCgnb3B0aW9ucycpO1xuICAgICAgICB2YXIgcHVic291cCA9IHRoaXMuX2dldCgncHVic291cCcpO1xuXG4gICAgICAgIC8vIGFsbG93IGRpc2FibGluZyB0aGUgdHJpZ2dlciBkZWJvdW5jZXIuXG4gICAgICAgIC8vIG1vc3RseSBmb3IgdGVzdGluZzogd2hlbiB0cmlnZ2VyIGV2ZW50cyBoYXBwZW4gcmFwaWRseVxuICAgICAgICAvLyBtdWx0aXBsZSBldmVudHMgb2YgdGhlIHNhbWUgdHlwZSB3b3VsZCBiZSBjYXVnaHQgb25jZS5cbiAgICAgICAgaWYgKG9wdGlvbnMuZGVib3VuY2UgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHB1YnNvdXAucHVibGlzaC5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb29sZG93biB0aW1lclxuICAgICAgICB2YXIgY29vbGRvd24gPSB7fTtcbiAgICAgICAgLy8gbXVsdGlwbGUgY2FsbHNcbiAgICAgICAgdmFyIG11bHRpcGxlID0ge307XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0b3BpYykge1xuICAgICAgICAgIHZhciBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG4gICAgICAgICAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgICAgICAgdmFyIF9yZWYkdHlwZSA9IF9yZWYudHlwZTtcbiAgICAgICAgICB2YXIgdHlwZSA9IF9yZWYkdHlwZSA9PT0gdW5kZWZpbmVkID8gJ2RlZmF1bHQnIDogX3JlZiR0eXBlO1xuXG4gICAgICAgICAgaWYgKGNvb2xkb3duW3R5cGVdKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYWQgbXVsdGlwbGUgY2FsbHMgYmVmb3JlIHRoZSBjb29sZG93blxuICAgICAgICAgICAgbXVsdGlwbGVbdHlwZV0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0cmlnZ2VyIGltbWVkaWF0ZWx5IG9uY2UgY29vbGRvd24gaXMgb3ZlclxuICAgICAgICAgICAgcHVic291cC5wdWJsaXNoLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNvb2xkb3duW3R5cGVdKTtcblxuICAgICAgICAgIC8vIHNldCBjb29sZG93biB0aW1lclxuICAgICAgICAgIGNvb2xkb3duW3R5cGVdID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYWQgbXVsdGlwbGUgY2FsbHMgYmVmb3JlIHRoZSBjb29sZG93bixcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIGFnYWluIGF0IHRoZSBlbmQuXG4gICAgICAgICAgICBpZiAobXVsdGlwbGVbdHlwZV0pIHtcbiAgICAgICAgICAgICAgcHVic291cC5wdWJsaXNoLmFwcGx5KHB1YnNvdXAsIF9hcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtdWx0aXBsZVt0eXBlXSA9IG51bGw7XG4gICAgICAgICAgICBjb29sZG93blt0eXBlXSA9IG51bGw7XG4gICAgICAgICAgfSwgb3B0aW9ucy5kZWJvdW5jZSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBKb3R0ZWQ7XG4gIH0oKTtcblxuICAvLyByZWdpc3RlciBwbHVnaW5zXG5cblxuICBKb3R0ZWQucGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZWdpc3Rlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIHJlZ2lzdGVyIGJ1bmRsZWQgcGx1Z2luc1xuICBCdW5kbGVQbHVnaW5zKEpvdHRlZCk7XG5cbiAgcmV0dXJuIEpvdHRlZDtcblxufSkpKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9am90dGVkLmpzLm1hcCIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBQaWVyb3h5IDxwaWVyb3h5QHBpZXJveHkubmV0PlxuLy8gVGhpcyB3b3JrIGlzIGZyZWUuIFlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXRcbi8vIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgV1RGUEwsIFZlcnNpb24gMlxuLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlIExJQ0VOU0UudHh0IG9yIGh0dHA6Ly93d3cud3RmcGwubmV0L1xuLy9cbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uLCB0aGUgaG9tZSBwYWdlOlxuLy8gaHR0cDovL3BpZXJveHkubmV0L2Jsb2cvcGFnZXMvbHotc3RyaW5nL3Rlc3RpbmcuaHRtbFxuLy9cbi8vIExaLWJhc2VkIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgdmVyc2lvbiAxLjQuNFxudmFyIExaU3RyaW5nID0gKGZ1bmN0aW9uKCkge1xuXG4vLyBwcml2YXRlIHByb3BlcnR5XG52YXIgZiA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG52YXIga2V5U3RyQmFzZTY0ID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO1xudmFyIGtleVN0clVyaVNhZmUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky0kXCI7XG52YXIgYmFzZVJldmVyc2VEaWMgPSB7fTtcblxuZnVuY3Rpb24gZ2V0QmFzZVZhbHVlKGFscGhhYmV0LCBjaGFyYWN0ZXIpIHtcbiAgaWYgKCFiYXNlUmV2ZXJzZURpY1thbHBoYWJldF0pIHtcbiAgICBiYXNlUmV2ZXJzZURpY1thbHBoYWJldF0gPSB7fTtcbiAgICBmb3IgKHZhciBpPTAgOyBpPGFscGhhYmV0Lmxlbmd0aCA7IGkrKykge1xuICAgICAgYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdW2FscGhhYmV0LmNoYXJBdChpKV0gPSBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdW2NoYXJhY3Rlcl07XG59XG5cbnZhciBMWlN0cmluZyA9IHtcbiAgY29tcHJlc3NUb0Jhc2U2NCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICB2YXIgcmVzID0gTFpTdHJpbmcuX2NvbXByZXNzKGlucHV0LCA2LCBmdW5jdGlvbihhKXtyZXR1cm4ga2V5U3RyQmFzZTY0LmNoYXJBdChhKTt9KTtcbiAgICBzd2l0Y2ggKHJlcy5sZW5ndGggJSA0KSB7IC8vIFRvIHByb2R1Y2UgdmFsaWQgQmFzZTY0XG4gICAgZGVmYXVsdDogLy8gV2hlbiBjb3VsZCB0aGlzIGhhcHBlbiA/XG4gICAgY2FzZSAwIDogcmV0dXJuIHJlcztcbiAgICBjYXNlIDEgOiByZXR1cm4gcmVzK1wiPT09XCI7XG4gICAgY2FzZSAyIDogcmV0dXJuIHJlcytcIj09XCI7XG4gICAgY2FzZSAzIDogcmV0dXJuIHJlcytcIj1cIjtcbiAgICB9XG4gIH0sXG5cbiAgZGVjb21wcmVzc0Zyb21CYXNlNjQgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGlucHV0ID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhpbnB1dC5sZW5ndGgsIDMyLCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gZ2V0QmFzZVZhbHVlKGtleVN0ckJhc2U2NCwgaW5wdXQuY2hhckF0KGluZGV4KSk7IH0pO1xuICB9LFxuXG4gIGNvbXByZXNzVG9VVEYxNiA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKGlucHV0LCAxNSwgZnVuY3Rpb24oYSl7cmV0dXJuIGYoYSszMik7fSkgKyBcIiBcIjtcbiAgfSxcblxuICBkZWNvbXByZXNzRnJvbVVURjE2OiBmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgIGlmIChjb21wcmVzc2VkID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChjb21wcmVzc2VkID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhjb21wcmVzc2VkLmxlbmd0aCwgMTYzODQsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBjb21wcmVzc2VkLmNoYXJDb2RlQXQoaW5kZXgpIC0gMzI7IH0pO1xuICB9LFxuXG4gIC8vY29tcHJlc3MgaW50byB1aW50OGFycmF5IChVQ1MtMiBiaWcgZW5kaWFuIGZvcm1hdClcbiAgY29tcHJlc3NUb1VpbnQ4QXJyYXk6IGZ1bmN0aW9uICh1bmNvbXByZXNzZWQpIHtcbiAgICB2YXIgY29tcHJlc3NlZCA9IExaU3RyaW5nLmNvbXByZXNzKHVuY29tcHJlc3NlZCk7XG4gICAgdmFyIGJ1Zj1uZXcgVWludDhBcnJheShjb21wcmVzc2VkLmxlbmd0aCoyKTsgLy8gMiBieXRlcyBwZXIgY2hhcmFjdGVyXG5cbiAgICBmb3IgKHZhciBpPTAsIFRvdGFsTGVuPWNvbXByZXNzZWQubGVuZ3RoOyBpPFRvdGFsTGVuOyBpKyspIHtcbiAgICAgIHZhciBjdXJyZW50X3ZhbHVlID0gY29tcHJlc3NlZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgYnVmW2kqMl0gPSBjdXJyZW50X3ZhbHVlID4+PiA4O1xuICAgICAgYnVmW2kqMisxXSA9IGN1cnJlbnRfdmFsdWUgJSAyNTY7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG5cbiAgLy9kZWNvbXByZXNzIGZyb20gdWludDhhcnJheSAoVUNTLTIgYmlnIGVuZGlhbiBmb3JtYXQpXG4gIGRlY29tcHJlc3NGcm9tVWludDhBcnJheTpmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgIGlmIChjb21wcmVzc2VkPT09bnVsbCB8fCBjb21wcmVzc2VkPT09dW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuIExaU3RyaW5nLmRlY29tcHJlc3MoY29tcHJlc3NlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJ1Zj1uZXcgQXJyYXkoY29tcHJlc3NlZC5sZW5ndGgvMik7IC8vIDIgYnl0ZXMgcGVyIGNoYXJhY3RlclxuICAgICAgICBmb3IgKHZhciBpPTAsIFRvdGFsTGVuPWJ1Zi5sZW5ndGg7IGk8VG90YWxMZW47IGkrKykge1xuICAgICAgICAgIGJ1ZltpXT1jb21wcmVzc2VkW2kqMl0qMjU2K2NvbXByZXNzZWRbaSoyKzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBidWYuZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGYoYykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIExaU3RyaW5nLmRlY29tcHJlc3MocmVzdWx0LmpvaW4oJycpKTtcblxuICAgIH1cblxuICB9LFxuXG5cbiAgLy9jb21wcmVzcyBpbnRvIGEgc3RyaW5nIHRoYXQgaXMgYWxyZWFkeSBVUkkgZW5jb2RlZFxuICBjb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBMWlN0cmluZy5fY29tcHJlc3MoaW5wdXQsIDYsIGZ1bmN0aW9uKGEpe3JldHVybiBrZXlTdHJVcmlTYWZlLmNoYXJBdChhKTt9KTtcbiAgfSxcblxuICAvL2RlY29tcHJlc3MgZnJvbSBhbiBvdXRwdXQgb2YgY29tcHJlc3NUb0VuY29kZWRVUklDb21wb25lbnRcbiAgZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50OmZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoaW5wdXQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC8gL2csIFwiK1wiKTtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoaW5wdXQubGVuZ3RoLCAzMiwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGdldEJhc2VWYWx1ZShrZXlTdHJVcmlTYWZlLCBpbnB1dC5jaGFyQXQoaW5kZXgpKTsgfSk7XG4gIH0sXG5cbiAgY29tcHJlc3M6IGZ1bmN0aW9uICh1bmNvbXByZXNzZWQpIHtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKHVuY29tcHJlc3NlZCwgMTYsIGZ1bmN0aW9uKGEpe3JldHVybiBmKGEpO30pO1xuICB9LFxuICBfY29tcHJlc3M6IGZ1bmN0aW9uICh1bmNvbXByZXNzZWQsIGJpdHNQZXJDaGFyLCBnZXRDaGFyRnJvbUludCkge1xuICAgIGlmICh1bmNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgdmFyIGksIHZhbHVlLFxuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnk9IHt9LFxuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZT0ge30sXG4gICAgICAgIGNvbnRleHRfYz1cIlwiLFxuICAgICAgICBjb250ZXh0X3djPVwiXCIsXG4gICAgICAgIGNvbnRleHRfdz1cIlwiLFxuICAgICAgICBjb250ZXh0X2VubGFyZ2VJbj0gMiwgLy8gQ29tcGVuc2F0ZSBmb3IgdGhlIGZpcnN0IGVudHJ5IHdoaWNoIHNob3VsZCBub3QgY291bnRcbiAgICAgICAgY29udGV4dF9kaWN0U2l6ZT0gMyxcbiAgICAgICAgY29udGV4dF9udW1CaXRzPSAyLFxuICAgICAgICBjb250ZXh0X2RhdGE9W10sXG4gICAgICAgIGNvbnRleHRfZGF0YV92YWw9MCxcbiAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uPTAsXG4gICAgICAgIGlpO1xuXG4gICAgZm9yIChpaSA9IDA7IGlpIDwgdW5jb21wcmVzc2VkLmxlbmd0aDsgaWkgKz0gMSkge1xuICAgICAgY29udGV4dF9jID0gdW5jb21wcmVzc2VkLmNoYXJBdChpaSk7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnksY29udGV4dF9jKSkge1xuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF9jXSA9IGNvbnRleHRfZGljdFNpemUrKztcbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGVbY29udGV4dF9jXSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHRfd2MgPSBjb250ZXh0X3cgKyBjb250ZXh0X2M7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeSxjb250ZXh0X3djKSkge1xuICAgICAgICBjb250ZXh0X3cgPSBjb250ZXh0X3djO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZSxjb250ZXh0X3cpKSB7XG4gICAgICAgICAgaWYgKGNvbnRleHRfdy5jaGFyQ29kZUF0KDApPDI1Nikge1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPDggOyBpKyspIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gMTtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgdmFsdWU7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT1iaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSBjb250ZXh0X3cuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTwxNiA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZVtjb250ZXh0X3ddO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd107XG4gICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICB9XG5cblxuICAgICAgICB9XG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCB3YyB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd2NdID0gY29udGV4dF9kaWN0U2l6ZSsrO1xuICAgICAgICBjb250ZXh0X3cgPSBTdHJpbmcoY29udGV4dF9jKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPdXRwdXQgdGhlIGNvZGUgZm9yIHcuXG4gICAgaWYgKGNvbnRleHRfdyAhPT0gXCJcIikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZSxjb250ZXh0X3cpKSB7XG4gICAgICAgIGlmIChjb250ZXh0X3cuY2hhckNvZGVBdCgwKTwyNTYpIHtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgIGZvciAoaT0wIDsgaTw4IDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IDE7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgIGZvciAoaT0wIDsgaTwxNiA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlW2NvbnRleHRfd107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGNvbnRleHRfZGljdGlvbmFyeVtjb250ZXh0X3ddO1xuICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICB9XG5cblxuICAgICAgfVxuICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluID0gTWF0aC5wb3coMiwgY29udGV4dF9udW1CaXRzKTtcbiAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFyayB0aGUgZW5kIG9mIHRoZSBzdHJlYW1cbiAgICB2YWx1ZSA9IDI7XG4gICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaCB0aGUgbGFzdCBjaGFyXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZWxzZSBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHRfZGF0YS5qb2luKCcnKTtcbiAgfSxcblxuICBkZWNvbXByZXNzOiBmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgIGlmIChjb21wcmVzc2VkID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChjb21wcmVzc2VkID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhjb21wcmVzc2VkLmxlbmd0aCwgMzI3NjgsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBjb21wcmVzc2VkLmNoYXJDb2RlQXQoaW5kZXgpOyB9KTtcbiAgfSxcblxuICBfZGVjb21wcmVzczogZnVuY3Rpb24gKGxlbmd0aCwgcmVzZXRWYWx1ZSwgZ2V0TmV4dFZhbHVlKSB7XG4gICAgdmFyIGRpY3Rpb25hcnkgPSBbXSxcbiAgICAgICAgbmV4dCxcbiAgICAgICAgZW5sYXJnZUluID0gNCxcbiAgICAgICAgZGljdFNpemUgPSA0LFxuICAgICAgICBudW1CaXRzID0gMyxcbiAgICAgICAgZW50cnkgPSBcIlwiLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgaSxcbiAgICAgICAgdyxcbiAgICAgICAgYml0cywgcmVzYiwgbWF4cG93ZXIsIHBvd2VyLFxuICAgICAgICBjLFxuICAgICAgICBkYXRhID0ge3ZhbDpnZXROZXh0VmFsdWUoMCksIHBvc2l0aW9uOnJlc2V0VmFsdWUsIGluZGV4OjF9O1xuXG4gICAgZm9yIChpID0gMDsgaSA8IDM7IGkgKz0gMSkge1xuICAgICAgZGljdGlvbmFyeVtpXSA9IGk7XG4gICAgfVxuXG4gICAgYml0cyA9IDA7XG4gICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDIpO1xuICAgIHBvd2VyPTE7XG4gICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgfVxuICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICBwb3dlciA8PD0gMTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKG5leHQgPSBiaXRzKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDgpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIGMgPSBmKGJpdHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMTYpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIGMgPSBmKGJpdHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGRpY3Rpb25hcnlbM10gPSBjO1xuICAgIHcgPSBjO1xuICAgIHJlc3VsdC5wdXNoKGMpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoZGF0YS5pbmRleCA+IGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgIH1cblxuICAgICAgYml0cyA9IDA7XG4gICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsbnVtQml0cyk7XG4gICAgICBwb3dlcj0xO1xuICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgfVxuICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAoYyA9IGJpdHMpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiw4KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGljdGlvbmFyeVtkaWN0U2l6ZSsrXSA9IGYoYml0cyk7XG4gICAgICAgICAgYyA9IGRpY3RTaXplLTE7XG4gICAgICAgICAgZW5sYXJnZUluLS07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMTYpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGljdGlvbmFyeVtkaWN0U2l6ZSsrXSA9IGYoYml0cyk7XG4gICAgICAgICAgYyA9IGRpY3RTaXplLTE7XG4gICAgICAgICAgZW5sYXJnZUluLS07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgZW5sYXJnZUluID0gTWF0aC5wb3coMiwgbnVtQml0cyk7XG4gICAgICAgIG51bUJpdHMrKztcbiAgICAgIH1cblxuICAgICAgaWYgKGRpY3Rpb25hcnlbY10pIHtcbiAgICAgICAgZW50cnkgPSBkaWN0aW9uYXJ5W2NdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGMgPT09IGRpY3RTaXplKSB7XG4gICAgICAgICAgZW50cnkgPSB3ICsgdy5jaGFyQXQoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKGVudHJ5KTtcblxuICAgICAgLy8gQWRkIHcrZW50cnlbMF0gdG8gdGhlIGRpY3Rpb25hcnkuXG4gICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gdyArIGVudHJ5LmNoYXJBdCgwKTtcbiAgICAgIGVubGFyZ2VJbi0tO1xuXG4gICAgICB3ID0gZW50cnk7XG5cbiAgICAgIGlmIChlbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICBlbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBudW1CaXRzKTtcbiAgICAgICAgbnVtQml0cysrO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG59O1xuICByZXR1cm4gTFpTdHJpbmc7XG59KSgpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbiAoKSB7IHJldHVybiBMWlN0cmluZzsgfSk7XG59IGVsc2UgaWYoIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZSAhPSBudWxsICkge1xuICBtb2R1bGUuZXhwb3J0cyA9IExaU3RyaW5nXG59XG4iLCIvKiBzaWxvei5pb1xuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgTWFpbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9tYWluLmpzJylcblxuZHVycnV0aS5yZW5kZXIoTWFpbiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcCcpKVxuIiwiLyogZWRpdG9yIGJhclxuICovXG5cbmZ1bmN0aW9uIEVkaXRvckJhciAoYWN0aW9ucykge1xuICB2YXIgcGx1Z2lucyA9IGFjdGlvbnMuZ2V0UGx1Z2lucygpXG4gIHZhciBvcHRpb25zID0ge1xuICAgIGh0bWw6IFt7XG4gICAgICB0aXRsZTogJ0hUTUwnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdNYXJrZG93bicsXG4gICAgICBwbHVnaW46ICdtYXJrZG93bidcbiAgICB9XSxcbiAgICBjc3M6IFt7XG4gICAgICB0aXRsZTogJ0NTUydcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ0xlc3MnLFxuICAgICAgcGx1Z2luOiAnbGVzcydcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ1N0eWx1cycsXG4gICAgICBwbHVnaW46ICdzdHlsdXMnXG4gICAgfV0sXG4gICAganM6IFt7XG4gICAgICB0aXRsZTogJ0phdmFTY3JpcHQnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdFUzIwMTUvQmFiZWwnLFxuICAgICAgcGx1Z2luOiAnYmFiZWwnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdDb2ZmZWVTY3JpcHQnLFxuICAgICAgcGx1Z2luOiAnY29mZmVlc2NyaXB0J1xuICAgIH1dXG4gIH1cblxuICB2YXIgc2VsZWN0ZWQgPSB7XG4gICAgaHRtbDogJycsXG4gICAgY3NzOiAnJyxcbiAgICBqczogJydcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBsdWdpbiAobGlzdCwgbmFtZSkge1xuICAgIHZhciBmb3VuZFBsdWdpbiA9IG51bGxcbiAgICBsaXN0LnNvbWUoKHBsdWdpbikgPT4ge1xuICAgICAgaWYgKHBsdWdpbi5wbHVnaW4gPT09IG5hbWUpIHtcbiAgICAgICAgZm91bmRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZvdW5kUGx1Z2luXG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VQcm9jZXNzb3IgKHR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gcmVtb3ZlIGxhc3Qgc2VsZWN0ZWQgcGx1Z2luXG4gICAgICBhY3Rpb25zLnJlbW92ZVBsdWdpbihzZWxlY3RlZFt0eXBlXSlcblxuICAgICAgLy8gdXBkYXRlIHJlZmVyZW5jZVxuICAgICAgc2VsZWN0ZWRbdHlwZV0gPSB0aGlzLnZhbHVlXG5cbiAgICAgIHZhciBwbHVnaW4gPSBnZXRQbHVnaW4ob3B0aW9uc1t0eXBlXSwgc2VsZWN0ZWRbdHlwZV0pXG4gICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgIGFjdGlvbnMuYWRkUGx1Z2luKHBsdWdpbi5wbHVnaW4pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU2VsZWN0ICh0eXBlLCBvcHRpb25zLCBzZWxlY3RlZCkge1xuICAgIHJldHVybiBgXG4gICAgICA8c2VsZWN0IGNsYXNzPVwic2VsZWN0IGVkaXRvci1iYXItc2VsZWN0LSR7dHlwZX1cIj5cbiAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIke29wdC5wbHVnaW4gfHwgJyd9XCIgJHtvcHQucGx1Z2luID09PSBzZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICAgICR7b3B0LnRpdGxlfVxuICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgYFxuICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgIDwvc2VsZWN0PlxuICAgIGBcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEluaXRpYWxWYWx1ZXMgKCkge1xuICAgIC8vIHNldCBzZWxlY3RlZCB2YWx1ZXMgYmFzZWQgb24gc3RvcmVcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBvcHRpb25zW3R5cGVdLmZvckVhY2goKG9wdGlvbikgPT4ge1xuICAgICAgICBpZiAocGx1Z2lucy5pbmRleE9mKG9wdGlvbi5wbHVnaW4pICE9PSAtMSkge1xuICAgICAgICAgIHNlbGVjdGVkW3R5cGVdID0gb3B0aW9uLnBsdWdpblxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZVBhbmUgKHR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHBhbmVzID0ge31cbiAgICAgIHBhbmVzW3R5cGVdID0ge1xuICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgIH1cblxuICAgICAgYWN0aW9ucy51cGRhdGVQYW5lcyhwYW5lcylcbiAgICB9XG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICBmb3IgKGxldCB0eXBlIG9mIFsgJ2h0bWwnLCAnY3NzJywgJ2pzJyBdKSB7XG4gICAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC5lZGl0b3ItYmFyLXNlbGVjdC0ke3R5cGV9YCkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2hhbmdlUHJvY2Vzc29yKHR5cGUpKVxuXG4gICAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC5lZGl0b3ItYmFyLXBhbmUtY2xvc2UtJHt0eXBlfWApLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VQYW5lKHR5cGUpKVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHNldEluaXRpYWxWYWx1ZXMoKVxuXG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUgZWRpdG9yLWJhci1wYW5lLWh0bWxcIj5cbiAgICAgICAgICAke2NyZWF0ZVNlbGVjdCgnaHRtbCcsIG9wdGlvbnMuaHRtbCwgc2VsZWN0ZWQuaHRtbCl9XG5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImVkaXRvci1iYXItcGFuZS1jbG9zZSBlZGl0b3ItYmFyLXBhbmUtY2xvc2UtaHRtbCBidG5cIiB0aXRsZT1cIkhpZGUgSFRNTFwiPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uIGljb24tY2xvc2VcIj48L2k+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lIGVkaXRvci1iYXItcGFuZS1jc3NcIj5cbiAgICAgICAgICAke2NyZWF0ZVNlbGVjdCgnY3NzJywgb3B0aW9ucy5jc3MsIHNlbGVjdGVkLmNzcyl9XG5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImVkaXRvci1iYXItcGFuZS1jbG9zZSBlZGl0b3ItYmFyLXBhbmUtY2xvc2UtY3NzIGJ0blwiIHRpdGxlPVwiSGlkZSBDU1NcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpY29uLWNsb3NlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZSBlZGl0b3ItYmFyLXBhbmUtanNcIj5cbiAgICAgICAgICAke2NyZWF0ZVNlbGVjdCgnanMnLCBvcHRpb25zLmpzLCBzZWxlY3RlZC5qcyl9XG5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImVkaXRvci1iYXItcGFuZS1jbG9zZSBlZGl0b3ItYmFyLXBhbmUtY2xvc2UtanMgYnRuXCIgdGl0bGU9XCJIaWRlIEphdmFTY3JpcHRcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpY29uLWNsb3NlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZVwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yQmFyXG4iLCIvKiBlZGl0b3Igd2lkZ2V0XG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBKb3R0ZWQgPSByZXF1aXJlKCdqb3R0ZWQnKVxudmFyIGdsb2JhbEFjdGlvbnNcblxuLy8gam90dGVkIHBsdWdpblxuSm90dGVkLnBsdWdpbignc2lsb3onLCBmdW5jdGlvbiAoam90dGVkLCBvcHRpb25zKSB7XG4gIGpvdHRlZC5vbignY2hhbmdlJywgZnVuY3Rpb24gKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICBnbG9iYWxBY3Rpb25zLnVwZGF0ZUZpbGUoe1xuICAgICAgdHlwZTogcGFyYW1zLnR5cGUsXG4gICAgICBjb250ZW50OiBwYXJhbXMuY29udGVudFxuICAgIH0pXG5cbiAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpXG4gIH0sIDIpXG59KVxuXG52YXIgcGx1Z2luTGlicyA9IHtcbiAgbWFya2Rvd246IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbWFya2VkLzAuMy42L21hcmtlZC5taW4uanMnXSxcbiAgbGVzczogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9sZXNzLmpzLzIuNy4xL2xlc3MubWluLmpzJ10sXG4gIHN0eWx1czogWycvbGlicy9zdHlsdXMubWluLmpzJ10sXG4gIGNvZmZlZXNjcmlwdDogWydodHRwczovL2Nkbi5yYXdnaXQuY29tL2phc2hrZW5hcy9jb2ZmZWVzY3JpcHQvMS4xMS4xL2V4dHJhcy9jb2ZmZWUtc2NyaXB0LmpzJ10sXG4gIGVzMjAxNTogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9iYWJlbC1jb3JlLzYuMS4xOS9icm93c2VyLm1pbi5qcyddXG59XG5cbmZ1bmN0aW9uIEVkaXRvcldpZGdldCAoYWN0aW9ucykge1xuICBnbG9iYWxBY3Rpb25zID0gYWN0aW9uc1xuXG4gIHRoaXMubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIHZhciBwbHVnaW5zID0gYWN0aW9ucy5nZXRQbHVnaW5zKClcbiAgICB2YXIgbGlicyA9IFtdXG5cbiAgICAvLyBsb2FkIGxpYnNcbiAgICBPYmplY3Qua2V5cyhwbHVnaW5MaWJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBpZiAocGx1Z2lucy5pbmRleE9mKG5hbWUpICE9PSAtMSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShsaWJzLCBwbHVnaW5MaWJzW25hbWVdLm1hcCgodXJsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChkb25lKSA9PiB7XG4gICAgICAgICAgICB1dGlsLmxvYWRTY3JpcHQodXJsLCBkb25lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHBsdWdpbnMsIFtcbiAgICAgICdzaWxveicsXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb2RlbWlycm9yJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHRoZW1lOiBhY3Rpb25zLmdldFRoZW1lKCksXG4gICAgICAgICAgbGluZVdyYXBwaW5nOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKVxuXG4gICAgdXRpbC5hc3luYyhsaWJzLCAoKSA9PiB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1uZXcgKi9cbiAgICAgIG5ldyBKb3R0ZWQoJGNvbnRhaW5lciwge1xuICAgICAgICBmaWxlczogYWN0aW9ucy5nZXRGaWxlcygpLFxuICAgICAgICBwbHVnaW5zOiBwbHVnaW5zXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJlZGl0b3Itd2lkZ2V0IGpvdHRlZC10aGVtZS1zaWxvelwiPjwvZGl2PidcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvcldpZGdldFxuIiwiLyogZWRpdG9yXG4gKi9cblxudmFyIGR1cnJ1dGkgPSByZXF1aXJlKCdkdXJydXRpJylcbnZhciBFZGl0b3JCYXIgPSByZXF1aXJlKCcuL2VkaXRvci1iYXInKVxudmFyIEVkaXRvcldpZGdldCA9IHJlcXVpcmUoJy4vZWRpdG9yLXdpZGdldCcpXG5cbmZ1bmN0aW9uIEVkaXRvciAoYWN0aW9ucykge1xuICB2YXIgcGFuZXMgPSBhY3Rpb25zLmdldFBhbmVzKClcblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cImVkaXRvclxuICAgICAgICAke3BhbmVzLmh0bWwuaGlkZGVuID8gJ2VkaXRvci1pcy1oaWRkZW4taHRtbCcgOiAnJ31cbiAgICAgICAgJHtwYW5lcy5jc3MuaGlkZGVuID8gJ2VkaXRvci1pcy1oaWRkZW4tY3NzJyA6ICcnfVxuICAgICAgICAke3BhbmVzLmpzLmhpZGRlbiA/ICdlZGl0b3ItaXMtaGlkZGVuLWpzJyA6ICcnfVxuICAgICAgXCI+XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEVkaXRvckJhcihhY3Rpb25zKSl9XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEVkaXRvcldpZGdldChhY3Rpb25zKSl9XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JcbiIsIi8qIGhlYWRlclxuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJylcbnZhciBTaGFyZSA9IHJlcXVpcmUoJy4vc2hhcmUnKVxuXG52YXIgSW50ZXJuYWxTdG9yZSA9IHJlcXVpcmUoJy4uLy4uL3N0YXRlL3N0b3JlLWludGVybmFsJylcbnZhciBzdG9yZUludGVybmFsID0gbmV3IEludGVybmFsU3RvcmUoKVxuXG5mdW5jdGlvbiBIZWFkZXIgKGFjdGlvbnMpIHtcbiAgdmFyICRjb250YWluZXJcbiAgdmFyIGRhdGEgPSBzdG9yZUludGVybmFsLmdldCgpXG4gIHZhciBhY3Rpb25zSW50ZXJuYWwgPSBzdG9yZUludGVybmFsLmFjdGlvbnNcbiAgdmFyIGxvYWRpbmdDb2xsYWJvcmF0ZSA9IGFjdGlvbnNJbnRlcm5hbC5nZXRMb2FkaW5nKCdjb2xsYWJvcmF0ZScpXG5cbiAgdmFyIGNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmV3RGF0YSA9IHN0b3JlSW50ZXJuYWwuZ2V0KClcblxuICAgIC8vIGlmIHNvbWV0aGluZyBjaGFuZ2VkLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkYXRhKSAhPT0gSlNPTi5zdHJpbmdpZnkobmV3RGF0YSkpIHtcbiAgICAgIGR1cnJ1dGkucmVuZGVyKG5ldyBIZWFkZXIoYWN0aW9ucyksICRjb250YWluZXIpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSAoKSB7XG4gICAgYWN0aW9uc0ludGVybmFsLnVwZGF0ZUxvYWRpbmcoJ2NvbGxhYm9yYXRlJywgZmFsc2UpXG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRub2RlKSB7XG4gICAgJGNvbnRhaW5lciA9ICRub2RlXG5cbiAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jb2xsYWJvcmF0ZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgLy8gbG9hZGluZ1xuICAgICAgYWN0aW9uc0ludGVybmFsLnVwZGF0ZUxvYWRpbmcoJ2NvbGxhYm9yYXRlJywgdHJ1ZSlcblxuICAgICAgd2luZG93LlRvZ2V0aGVySlMoKVxuXG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUy5vbigncmVhZHknLCBkb25lTG9hZGluZ0NvbGxhYm9yYXRlKVxuICAgICAgd2luZG93LlRvZ2V0aGVySlMub24oJ2Nsb3NlJywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICB9KVxuXG4gICAgc3RvcmVJbnRlcm5hbC5vbignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh3aW5kb3cuVG9nZXRoZXJKUykge1xuICAgICAgd2luZG93LlRvZ2V0aGVySlMub2ZmKCdyZWFkeScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUy5vZmYoJ2Nsb3NlJywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICB9XG5cbiAgICBzdG9yZUludGVybmFsLm9mZignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgPGEgaHJlZj1cIi9cIiBjbGFzcz1cImhlYWRlci1sb2dvXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIvaW1hZ2VzL2xvZ28ucG5nXCIgaGVpZ2h0PVwiMTZcIiBhbHQ9XCJzaWxvei5pb1wiPlxuICAgICAgICA8L2E+XG5cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgU2V0dGluZ3MoYWN0aW9ucywgc3RvcmVJbnRlcm5hbC5hY3Rpb25zKSl9XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IFNoYXJlKGFjdGlvbnMsIHN0b3JlSW50ZXJuYWwuYWN0aW9ucykpfVxuXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGNvbGxhYm9yYXRlICR7bG9hZGluZ0NvbGxhYm9yYXRlID8gJ2lzLWxvYWRpbmcnIDogJyd9XCI+XG4gICAgICAgICAgQ29sbGFib3JhdGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cbiAgICBgXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJcbiIsIi8qIHNldHRpbmdzXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBQb3B1cCA9IHJlcXVpcmUoJy4uL3BvcHVwJylcblxuZnVuY3Rpb24gU2V0dGluZ3MgKGFjdGlvbnMsIGFjdGlvbnNJbnRlcm5hbCkge1xuICB2YXIgc2VsZiA9IHV0aWwuaW5oZXJpdHModGhpcywgUG9wdXApXG4gIFBvcHVwLmNhbGwoc2VsZiwgJ3NldHRpbmdzJywgYWN0aW9uc0ludGVybmFsKVxuXG4gIHZhciBwYW5lcyA9IGFjdGlvbnMuZ2V0UGFuZXMoKVxuICB2YXIgdGhlbWUgPSBhY3Rpb25zLmdldFRoZW1lKClcblxuICBmdW5jdGlvbiB0b2dnbGVQYW5lICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgcGFuZXMgPSB7fVxuICAgICAgcGFuZXNbdHlwZV0gPSB7IGhpZGRlbjogIShlLnRhcmdldC5jaGVja2VkKSB9XG4gICAgICByZXR1cm4gYWN0aW9ucy51cGRhdGVQYW5lcyhwYW5lcylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRUaGVtZSAoKSB7XG4gICAgYWN0aW9ucy51cGRhdGVUaGVtZSh0aGlzLnZhbHVlKVxuICB9XG5cbiAgc2VsZi5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gICAgc2VsZi5zdXBlci5tb3VudC5jYWxsKHNlbGYsICRjb250YWluZXIpXG5cbiAgICB2YXIgJHNob3dIdG1sID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3Mtc2hvdy1odG1sJylcbiAgICB2YXIgJHNob3dDc3MgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy1zaG93LWNzcycpXG4gICAgdmFyICRzaG93SnMgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy1zaG93LWpzJylcblxuICAgICRzaG93SHRtbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0b2dnbGVQYW5lKCdodG1sJykpXG4gICAgJHNob3dDc3MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdG9nZ2xlUGFuZSgnY3NzJykpXG4gICAgJHNob3dKcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0b2dnbGVQYW5lKCdqcycpKVxuXG4gICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3MtdGhlbWUnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBzZXRUaGVtZSlcbiAgfVxuXG4gIHNlbGYudW5tb3VudCA9IHNlbGYuc3VwZXIudW5tb3VudC5iaW5kKHNlbGYpXG5cbiAgc2VsZi5yZW5kZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGYuc3VwZXIucmVuZGVyLmNhbGwoc2VsZiwgJ1NldHRpbmdzJywgYFxuICAgICAgPGZpZWxkc2V0PlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFRhYnNcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPGxhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cInNldHRpbmdzLXNob3ctaHRtbFwiICR7IXBhbmVzLmh0bWwuaGlkZGVuID8gJ2NoZWNrZWQnIDogJyd9PlxuICAgICAgICAgIEhUTUxcbiAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2V0dGluZ3Mtc2hvdy1jc3NcIiAkeyFwYW5lcy5jc3MuaGlkZGVuID8gJ2NoZWNrZWQnIDogJyd9PlxuICAgICAgICAgIENTU1xuICAgICAgICA8L2xhYmVsPlxuXG4gICAgICAgIDxsYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJzZXR0aW5ncy1zaG93LWpzXCIgJHshcGFuZXMuanMuaGlkZGVuID8gJ2NoZWNrZWQnIDogJyd9PlxuICAgICAgICAgIEphdmFTY3JpcHRcbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvZmllbGRzZXQ+XG5cbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBUaGVtZVxuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8c2VsZWN0IGNsYXNzPVwic2V0dGluZ3MtdGhlbWUgc2VsZWN0XCI+XG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInNvbGFyaXplZCBsaWdodFwiICR7dGhlbWUgPT09ICdzb2xhcml6ZWQgbGlnaHQnID8gJ3NlbGVjdGVkJyA6ICcnfT5cbiAgICAgICAgICAgIFNvbGFyaXplZCBMaWdodFxuICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJzb2xhcml6ZWQgZGFya1wiICR7dGhlbWUgPT09ICdzb2xhcml6ZWQgZGFyaycgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgU29sYXJpemVkIERhcmtcbiAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgIGApXG4gIH1cblxuICByZXR1cm4gc2VsZlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzXG4iLCIvKiBzaGFyZVxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgUG9wdXAgPSByZXF1aXJlKCcuLi9wb3B1cCcpXG5cbmZ1bmN0aW9uIFNoYXJlIChhY3Rpb25zLCBhY3Rpb25zSW50ZXJuYWwpIHtcbiAgdmFyIHNlbGYgPSB1dGlsLmluaGVyaXRzKHRoaXMsIFBvcHVwKVxuICBQb3B1cC5jYWxsKHNlbGYsICdzaGFyZScsIGFjdGlvbnNJbnRlcm5hbClcblxuICB2YXIgc2hvcnRVcmwgPSBhY3Rpb25zLmdldFNob3J0VXJsKClcbiAgdmFyIGxvbmdVcmwgPSAnJ1xuICB2YXIgd2F0Y2hlclxuXG4gIHZhciBnZW5lcmF0aW5nID0gYWN0aW9uc0ludGVybmFsLmdldExvYWRpbmcoJ2dlbmVyYXRlLXVybCcpXG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9uZ1VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIH1cblxuICBmdW5jdGlvbiBjb3B5ICgkaW5wdXQpIHtcbiAgICByZXR1cm4gKGUpID0+IHtcbiAgICAgIHZhciAkYnRuID0gdXRpbC5jbG9zZXN0KGUudGFyZ2V0LCAnLmJ0bicpXG5cbiAgICAgICRpbnB1dC5zZWxlY3QoKVxuXG4gICAgICB0cnkge1xuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG5cbiAgICAgICAgJGJ0bi5pbm5lckhUTUwgPSAnQ29waWVkJ1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkYnRuLmlubmVySFRNTCA9ICdDb3B5J1xuICAgICAgICB9LCAyMDAwKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlICgpIHtcbiAgICAvLyBsb2FkaW5nXG4gICAgYWN0aW9uc0ludGVybmFsLnVwZGF0ZUxvYWRpbmcoJ2dlbmVyYXRlLXVybCcsIHRydWUpXG5cbiAgICBhY3Rpb25zLnVwZGF0ZVNob3J0VXJsKCgpID0+IHtcbiAgICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVMb2FkaW5nKCdnZW5lcmF0ZS11cmwnLCBmYWxzZSlcbiAgICB9KVxuICB9XG5cbiAgc2VsZi5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gICAgc2VsZi5zdXBlci5tb3VudC5jYWxsKHNlbGYsICRjb250YWluZXIpXG5cbiAgICB2YXIgJHNob3J0VXJsID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtdXJsLWlucHV0LXNob3J0JylcbiAgICB2YXIgJHNob3J0VXJsQ29weSA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNoYXJlLXVybC1jb3B5LXNob3J0JylcbiAgICB2YXIgJGxvbmdVcmwgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZS11cmwtaW5wdXQtbG9uZycpXG4gICAgdmFyICRsb25nVXJsQ29weSA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNoYXJlLXVybC1jb3B5LWxvbmcnKVxuXG4gICAgJHNob3J0VXJsQ29weS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHkoJHNob3J0VXJsKSlcbiAgICAkbG9uZ1VybENvcHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb3B5KCRsb25nVXJsKSlcblxuICAgIHZhciAkZ2VuZXJhdGVTaG9ydCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNoYXJlLWdlbmVyYXRlJylcbiAgICAkZ2VuZXJhdGVTaG9ydC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGdlbmVyYXRlKVxuXG4gICAgaWYgKHNob3J0VXJsKSB7XG4gICAgICAvLyBnaXZlIGl0IGEgc2VjLFxuICAgICAgLy8gdG8gbm90IHRyaWdnZXIgdXJsIHVwZGF0ZSBvbiBsb2FkLFxuICAgICAgLy8gYW5kIGZvcmNlIHVybCBnZW5lcmF0aW9uIGV2ZW4gaWYgbm90aGluZyB3YXMgY2hhbmdlZCxcbiAgICAgIC8vIG9uIGZvcmVpZ24gY2xpZW50cy5cbiAgICAgIHdhdGNoZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWN0aW9ucy5zdGFydFNob3J0VXJsVXBkYXRlcigpXG4gICAgICB9LCAxMDAwKVxuICAgIH1cbiAgfVxuXG4gIHNlbGYudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLnN1cGVyLnVubW91bnQuY2FsbChzZWxmKVxuXG4gICAgaWYgKHdhdGNoZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh3YXRjaGVyKVxuICAgIH1cblxuICAgIGlmIChzaG9ydFVybCkge1xuICAgICAgYWN0aW9ucy5zdG9wU2hvcnRVcmxVcGRhdGVyKClcbiAgICB9XG4gIH1cblxuICBzZWxmLnJlbmRlciA9ICgpID0+IHtcbiAgICByZXR1cm4gc2VsZi5zdXBlci5yZW5kZXIuY2FsbChzZWxmLCAnU2hhcmUnLCBgXG4gICAgICA8ZmllbGRzZXQgY2xhc3M9XCIke3Nob3J0VXJsID8gJ3NoYXJlLWlzLWdlbmVyYXRlZCcgOiAnJ31cIj5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBTaG9ydCBVUkxcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgc2hhcmUtZ2VuZXJhdGUgJHtnZW5lcmF0aW5nID8gJ2lzLWxvYWRpbmcnIDogJyd9XCI+XG4gICAgICAgICAgR2VuZXJhdGUgU2hvcnQgVVJMXG4gICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzaGFyZS11cmwgc2hhcmUtdXJsLXNob3J0XCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzaGFyZS11cmwtaW5wdXQgc2hhcmUtdXJsLWlucHV0LXNob3J0XCIgdmFsdWU9XCIke3Nob3J0VXJsfVwiIHJlYWRvbmx5PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIHNoYXJlLXVybC1jb3B5IHNoYXJlLXVybC1jb3B5LXNob3J0XCI+XG4gICAgICAgICAgICBDb3B5XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9maWVsZHNldD5cbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBQZXJzaXN0ZW50IFVSTFxuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwic2hhcmUtdXJsXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzaGFyZS11cmwtaW5wdXQgc2hhcmUtdXJsLWlucHV0LWxvbmdcIiB2YWx1ZT1cIiR7bG9uZ1VybH1cIiByZWFkb25seT5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBzaGFyZS11cmwtY29weSBzaGFyZS11cmwtY29weS1sb25nXCI+XG4gICAgICAgICAgICBDb3B5XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9maWVsZHNldD5cbiAgICBgKVxuICB9XG5cbiAgcmV0dXJuIHNlbGZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVxuIiwiLyogbWFpblxuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIvaGVhZGVyJylcbnZhciBFZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvci9lZGl0b3InKVxuXG52YXIgR2xvYmFsU3RvcmUgPSByZXF1aXJlKCcuLi9zdGF0ZS9zdG9yZScpXG52YXIgc3RvcmUgPSBuZXcgR2xvYmFsU3RvcmUoKVxuXG5mdW5jdGlvbiBNYWluICgpIHtcbiAgdmFyICRjb250YWluZXJcbiAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICB2YXIgdGhlbWUgPSBzdG9yZS5hY3Rpb25zLmdldFRoZW1lKClcblxuICB2YXIgY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBuZXdEYXRhID0gc3RvcmUuZ2V0KClcblxuICAgIC8vIGRvbid0IGNvbXBhcmUgZmlsZXNcbiAgICBkZWxldGUgZGF0YS5maWxlc1xuICAgIGRlbGV0ZSBuZXdEYXRhLmZpbGVzXG5cbiAgICAvLyBpZiBzb21ldGhpbmcgY2hhbmdlZCxcbiAgICAvLyBleGNlcHQgdGhlIGZpbGVzLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkYXRhKSAhPT0gSlNPTi5zdHJpbmdpZnkobmV3RGF0YSkpIHtcbiAgICAgIGR1cnJ1dGkucmVuZGVyKE1haW4sICRjb250YWluZXIpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkbm9kZSkge1xuICAgICRjb250YWluZXIgPSAkbm9kZVxuXG4gICAgc3RvcmUub24oJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzdG9yZS5vZmYoJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibWFpbiBzaWxvei10aGVtZS0ke3RoZW1lLnJlcGxhY2UoLyAvZywgJy0nKX1cIj5cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgSGVhZGVyKHN0b3JlLmFjdGlvbnMpKX1cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgRWRpdG9yKHN0b3JlLmFjdGlvbnMpKX1cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5cbiIsIi8qIHBvcHVwXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJylcblxuZnVuY3Rpb24gUG9wdXAgKG5hbWUsIGFjdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gbmFtZVxuICB0aGlzLnN0YXRlID0gYWN0aW9ucy5nZXRQb3B1cChuYW1lKVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zXG4gIHRoaXMudG9nZ2xlUG9wdXAgPSB0aGlzLnByb3RvdHlwZS50b2dnbGVQb3B1cC5iaW5kKHRoaXMpXG4gIHRoaXMuaGlkZVBvcHVwID0gdGhpcy5wcm90b3R5cGUuaGlkZVBvcHVwLmJpbmQodGhpcylcbn1cblxuUG9wdXAucHJvdG90eXBlLnRvZ2dsZVBvcHVwID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGVcbiAgdGhpcy5hY3Rpb25zLnVwZGF0ZVBvcHVwKHRoaXMubmFtZSwgdGhpcy5zdGF0ZSlcbn1cblxuUG9wdXAucHJvdG90eXBlLmhpZGVQb3B1cCA9IGZ1bmN0aW9uIChlKSB7XG4gIGlmICh1dGlsLmNsb3Nlc3QoZS50YXJnZXQsICcucG9wdXAnKSB8fCBlLnRhcmdldCA9PT0gdGhpcy4kYnV0dG9uIHx8ICF0aGlzLnN0YXRlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLmFjdGlvbnMudXBkYXRlUG9wdXAodGhpcy5uYW1lLCBmYWxzZSlcbn1cblxuUG9wdXAucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgdGhpcy4kY29udGFpbmVyID0gJGNvbnRhaW5lclxuICB0aGlzLiRidXR0b24gPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5wb3B1cC1idXR0b24nKVxuXG4gIHRoaXMuJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudG9nZ2xlUG9wdXApXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oaWRlUG9wdXApXG59XG5cblBvcHVwLnByb3RvdHlwZS51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGlkZVBvcHVwKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKHRpdGxlLCBjb250ZW50KSB7XG4gIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz1cInBvcHVwLWNvbnRhaW5lciAke3RoaXMubmFtZX0gJHt0aGlzLnN0YXRlID8gJ3BvcHVwLWNvbnRhaW5lci1pcy1vcGVuJyA6ICcnfVwiPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCIke3RoaXMubmFtZX0tYnV0dG9uIHBvcHVwLWJ1dHRvbiBidG5cIj5cbiAgICAgICAgJHt0aXRsZX1cbiAgICAgIDwvYnV0dG9uPlxuXG4gICAgICA8Zm9ybSBjbGFzcz1cIiR7dGhpcy5uYW1lfS1wb3B1cCBwb3B1cFwiPlxuICAgICAgICAke2NvbnRlbnR9XG4gICAgICA8L2Zvcm0+XG4gICAgPC9kaXY+XG4gIGBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQb3B1cFxuIiwiLyogc3RvcmUgYWN0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGFjdGlvbnMgKHN0b3JlKSB7XG4gIGZ1bmN0aW9uIGdldFBvcHVwIChuYW1lKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnBvcHVwW25hbWVdXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVQb3B1cCAobmFtZSwgc3RhdGUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS5wb3B1cFtuYW1lXSA9IHN0YXRlXG5cbiAgICBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExvYWRpbmcgKG5hbWUpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkubG9hZGluZ1tuYW1lXVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTG9hZGluZyAobmFtZSwgc3RhdGUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS5sb2FkaW5nW25hbWVdID0gc3RhdGVcblxuICAgIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRQb3B1cDogZ2V0UG9wdXAsXG4gICAgdXBkYXRlUG9wdXA6IHVwZGF0ZVBvcHVwLFxuXG4gICAgZ2V0TG9hZGluZzogZ2V0TG9hZGluZyxcbiAgICB1cGRhdGVMb2FkaW5nOiB1cGRhdGVMb2FkaW5nXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhY3Rpb25zXG4iLCIvKiBzdG9yZSBhY3Rpb25zXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciBzaG9ydFVybFNlcnZpY2UgPSByZXF1aXJlKCcuL3Nob3J0LXVybCcpXG5cbmZ1bmN0aW9uIGFjdGlvbnMgKHN0b3JlKSB7XG4gIGZ1bmN0aW9uIGdldEZpbGVzICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkuZmlsZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUZpbGUgKG5ld0ZpbGUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG5cbiAgICBkYXRhLmZpbGVzLnNvbWUoKGZpbGUsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoZmlsZS50eXBlID09PSBuZXdGaWxlLnR5cGUpIHtcbiAgICAgICAgZGF0YS5maWxlc1tpbmRleF0gPSB1dGlsLmV4dGVuZChuZXdGaWxlLCBkYXRhLmZpbGVzW2luZGV4XSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGx1Z2lucyAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnBsdWdpbnNcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFBsdWdpbiAobmV3UGx1Z2luKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuXG4gICAgZGF0YS5wbHVnaW5zLnB1c2gobmV3UGx1Z2luKVxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVBsdWdpbiAob2xkUGx1Z2luKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIHZhciBwbHVnaW5OYW1lID0gJydcblxuICAgIGlmICh0eXBlb2Ygb2xkUGx1Z2luID09PSAnb2JqZWN0Jykge1xuICAgICAgcGx1Z2luTmFtZSA9IG9sZFBsdWdpbi5uYW1lXG4gICAgfSBlbHNlIHtcbiAgICAgIHBsdWdpbk5hbWUgPSBvbGRQbHVnaW5cbiAgICB9XG5cbiAgICBkYXRhLnBsdWdpbnMuc29tZSgocGx1Z2luLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKCh0eXBlb2YgcGx1Z2luID09PSAnb2JqZWN0JyAmJiBwbHVnaW4ubmFtZSA9PT0gcGx1Z2luTmFtZSkgfHxcbiAgICAgICAgICAodHlwZW9mIHBsdWdpbiA9PT0gJ3N0cmluZycgJiYgcGx1Z2luID09PSBwbHVnaW5OYW1lKSkge1xuICAgICAgICBkYXRhLnBsdWdpbnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQYW5lcyAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnBhbmVzXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVQYW5lcyAobmV3UGFuZXMpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS5wYW5lcyA9IHV0aWwuZXh0ZW5kKG5ld1BhbmVzLCBkYXRhLnBhbmVzKVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VGhlbWUgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS50aGVtZVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlVGhlbWUgKHRoZW1lKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEudGhlbWUgPSB0aGVtZVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2hvcnRVcmwgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5zaG9ydF91cmxcbiAgfVxuXG4gIHZhciBsb25nVXJsID0gJydcblxuICBmdW5jdGlvbiB1cGRhdGVTaG9ydFVybCAoZm9yY2UsIGNhbGxiYWNrID0gKCkgPT4ge30pIHtcbiAgICAvLyBmb3JjZSBub3QgZGVmaW5lZCwgYnV0IGNhbGxiYWNrIGlzXG4gICAgaWYgKHR5cGVvZiBmb3JjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBmb3JjZVxuICAgICAgZm9yY2UgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIGV4aXN0aW5nIHNob3J0X3VybCdzLFxuICAgIC8vIGNoZWNrIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmIGlzIG5vdCBhbHJlYWR5IHNhdmVkXG4gICAgLy8gYW5kIHVwZGF0ZSBsaW5rLlxuICAgIHZhciBzaG9ydFVybCA9IGdldFNob3J0VXJsKClcbiAgICBpZiAoIXNob3J0VXJsIHx8IGZvcmNlKSB7XG4gICAgICBsb25nVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcblxuICAgICAgc2hvcnRVcmxTZXJ2aWNlLmNyZWF0ZSh7XG4gICAgICAgIGxvbmdfdXJsOiBsb25nVXJsXG4gICAgICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgICAgIGRhdGEuc2hvcnRfdXJsID0gcmVzLnNob3J0X3VybFxuICAgICAgICBzdG9yZS5zZXQoZGF0YSlcblxuICAgICAgICAvLyBhZnRlciBzaG9ydF91cmwgaXMgYWRkZWQgdG8gaGFzaCxcbiAgICAgICAgLy8gdXBkYXRlIGxvbmdfdXJsIHRvIHBvaW50IHRvIHVybCB3aXRoIGhhc2guXG4gICAgICAgIGxvbmdVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuXG4gICAgICAgIC8vIHVwZGF0ZSBleGlzdGluZyBzaG9ydCB1cmxcbiAgICAgICAgc2hvcnRVcmxTZXJ2aWNlLnVwZGF0ZSh7XG4gICAgICAgICAgbG9uZ191cmw6IGxvbmdVcmwsXG4gICAgICAgICAgc2hvcnRfdXJsOiByZXMuc2hvcnRfdXJsXG4gICAgICAgIH0sIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKGxvbmdVcmwgIT09IHdpbmRvdy5sb2NhdGlvbi5ocmVmKSB7XG4gICAgICBsb25nVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcblxuICAgICAgLy8gdXBkYXRlIGV4aXN0aW5nIHNob3J0IHVybFxuICAgICAgc2hvcnRVcmxTZXJ2aWNlLnVwZGF0ZSh7XG4gICAgICAgIGxvbmdfdXJsOiBsb25nVXJsLFxuICAgICAgICBzaG9ydF91cmw6IHNob3J0VXJsXG4gICAgICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIHN0b3AgdXJsIHVwZGF0ZXIuXG4gICAgICAgICAgc3RvcFNob3J0VXJsVXBkYXRlcigpXG5cbiAgICAgICAgICAvLyBkZWxldGUgZXhpc3Rpbmcgc2hvcnRfdXJsXG4gICAgICAgICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgICAgICAgIGRhdGEuc2hvcnRfdXJsID0gJydcbiAgICAgICAgICBzdG9yZS5zZXQoZGF0YSlcblxuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjaygpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHZhciBkZWJvdW5jZWRVcGRhdGVTaG9ydFVybCA9IHV0aWwuZGVib3VuY2UodXBkYXRlU2hvcnRVcmwsIDUwMClcblxuICBmdW5jdGlvbiBzdGFydFNob3J0VXJsVXBkYXRlciAoKSB7XG4gICAgLy8gdXBkYXRlIHNob3J0IHVybCB3aGVuIGRhdGEgY2hhbmdlc1xuICAgIHN0b3JlLm9uKCdjaGFuZ2UnLCBkZWJvdW5jZWRVcGRhdGVTaG9ydFVybClcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BTaG9ydFVybFVwZGF0ZXIgKCkge1xuICAgIC8vIHN0b3AgbW9uaXRvcmluZyBkYXRhIGNoYW5nZXNcbiAgICBzdG9yZS5vZmYoJ2NoYW5nZScsIGRlYm91bmNlZFVwZGF0ZVNob3J0VXJsKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRGaWxlczogZ2V0RmlsZXMsXG4gICAgdXBkYXRlRmlsZTogdXBkYXRlRmlsZSxcblxuICAgIGdldFBsdWdpbnM6IGdldFBsdWdpbnMsXG4gICAgYWRkUGx1Z2luOiBhZGRQbHVnaW4sXG4gICAgcmVtb3ZlUGx1Z2luOiByZW1vdmVQbHVnaW4sXG5cbiAgICBnZXRQYW5lczogZ2V0UGFuZXMsXG4gICAgdXBkYXRlUGFuZXM6IHVwZGF0ZVBhbmVzLFxuXG4gICAgZ2V0VGhlbWU6IGdldFRoZW1lLFxuICAgIHVwZGF0ZVRoZW1lOiB1cGRhdGVUaGVtZSxcblxuICAgIGdldFNob3J0VXJsOiBnZXRTaG9ydFVybCxcbiAgICB1cGRhdGVTaG9ydFVybDogdXBkYXRlU2hvcnRVcmwsXG4gICAgc3RhcnRTaG9ydFVybFVwZGF0ZXI6IHN0YXJ0U2hvcnRVcmxVcGRhdGVyLFxuICAgIHN0b3BTaG9ydFVybFVwZGF0ZXI6IHN0b3BTaG9ydFVybFVwZGF0ZXJcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnNcbiIsIi8qIHNob3J0IHVybCBhcGlcbiAqL1xuXG4vLyBlbnYgZGV0ZWN0aW9uXG52YXIgZW52ID0gJ2xvY2FsJ1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSAhPT0gJ2xvY2FsaG9zdCcpIHtcbiAgZW52ID0gJ2xpdmUnXG59XG5cbnZhciBhcGlVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xudmFyIHNob3J0VXJsID0gYXBpVXJsXG5cbmlmIChlbnYgIT09ICdsb2NhbCcpIHtcbiAgYXBpVXJsID0gJ2h0dHBzOi8vcHJhamluYS1naGluZGEucmhjbG91ZC5jb20nXG4gIHNob3J0VXJsID0gJ2h0dHA6Ly9zLnNpbG96LmlvJ1xufVxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG52YXIgc2Vzc2lvbktleSA9ICdzaWxvei1pbydcblxuZnVuY3Rpb24gZ2V0U2Vzc2lvbiAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGNhY2hlID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHNlc3Npb25LZXkpXG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjYWNoZSlcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIHJldHVybiB7fVxufVxuXG52YXIgc2Vzc2lvbiA9IGdldFNlc3Npb24oKVxuXG5mdW5jdGlvbiBzYXZlU2Vzc2lvbiAobmV3U2Vzc2lvbikge1xuICBzZXNzaW9uID0gdXRpbC5leHRlbmQobmV3U2Vzc2lvbiwgc2Vzc2lvbilcblxuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc2Vzc2lvbktleSwgSlNPTi5zdHJpbmdpZnkoc2Vzc2lvbikpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZSAoZGF0YSwgY2FsbGJhY2sgPSAoKSA9PiB7fSkge1xuICB1dGlsLmZldGNoKGAke2FwaVVybH0vYXBpL2AsIHtcbiAgICB0eXBlOiAnUE9TVCcsXG4gICAgZGF0YTogZGF0YVxuICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyKVxuICAgIH1cblxuICAgIC8vIHNldCBmdWxsIHVybCBmb3Igc2hvcnR1cmxcbiAgICByZXMuc2hvcnRfdXJsID0gYCR7c2hvcnRVcmx9LyR7cmVzLnNob3J0X3VybH1gXG5cbiAgICAvLyBzYXZlIHNlc3Npb25cbiAgICBzYXZlU2Vzc2lvbih7XG4gICAgICB0b2tlbjogcmVzLnRva2VuXG4gICAgfSlcblxuICAgIGNhbGxiYWNrKG51bGwsIHJlcylcbiAgfSlcbn1cblxuZnVuY3Rpb24gdXBkYXRlIChkYXRhLCBjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gIC8vIHJlbW92ZSBhcGkgdXJsIGZyb20gc2hvcnRfdXJsXG4gIGRhdGEuc2hvcnRfdXJsID0gZGF0YS5zaG9ydF91cmwucmVwbGFjZShgJHtzaG9ydFVybH0vYCwgJycpXG5cbiAgLy8gYWRkIHRva2VuXG4gIGRhdGEudG9rZW4gPSBzZXNzaW9uLnRva2VuXG5cbiAgdXRpbC5mZXRjaChgJHthcGlVcmx9L2FwaS9gLCB7XG4gICAgdHlwZTogJ1BVVCcsXG4gICAgZGF0YTogZGF0YVxuICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyKVxuICAgIH1cblxuICAgIGNhbGxiYWNrKG51bGwsIHJlcylcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY3JlYXRlLFxuICB1cGRhdGU6IHVwZGF0ZVxufVxuIiwiLyogaW50ZXJuYWwgc3RvcmUsXG4gKiBub3Qgc3RvcmVkIGluIHVybFxuICovXG5cbnZhciBTdG9yZSA9IHJlcXVpcmUoJ2R1cnJ1dGkvc3RvcmUnKVxudmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuL2FjdGlvbnMtaW50ZXJuYWwnKVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIHBvcHVwOiB7fSxcbiAgbG9hZGluZzoge31cbn1cblxudmFyIEludGVybmFsU3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gIFN0b3JlLmNhbGwodGhpcylcbiAgdGhpcy5hY3Rpb25zID0gYWN0aW9ucyh0aGlzKVxuXG4gIHRoaXMuc2V0KGRlZmF1bHRzKVxufVxuXG5JbnRlcm5hbFN0b3JlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUucHJvdG90eXBlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVybmFsU3RvcmVcblxuIiwiLyogc3RvcmVcbiAqL1xuXG52YXIgU3RvcmUgPSByZXF1aXJlKCdkdXJydXRpL3N0b3JlJylcbnZhciBMWlN0cmluZyA9IHJlcXVpcmUoJ2x6LXN0cmluZycpXG52YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIHZlcnNpb246IDEsXG4gIGZpbGVzOiBbe1xuICAgIHR5cGU6ICdodG1sJyxcbiAgICBjb250ZW50OiAnJ1xuICB9LCB7XG4gICAgdHlwZTogJ2NzcycsXG4gICAgY29udGVudDogJydcbiAgfSwge1xuICAgIHR5cGU6ICdqcycsXG4gICAgY29udGVudDogJydcbiAgfV0sXG4gIHBsdWdpbnM6IFtdLFxuICB0aGVtZTogJ3NvbGFyaXplZCBsaWdodCcsXG5cbiAgLy8gcGFuZSBwcm9wZXJ0aWVzIChoaWRkZW4sIGV0YylcbiAgcGFuZXM6IHtcbiAgICBodG1sOiB7fSxcbiAgICBjc3M6IHt9LFxuICAgIGpzOiB7fVxuICB9LFxuXG4gIHNob3J0X3VybDogJydcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUxvY2F0aW9uSGFzaCAoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiAoKSA9PiB7fVxuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIChoYXNoKSA9PiB7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgYCMke2hhc2h9YClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChoYXNoKSA9PiB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShgJHt3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdfSMke2hhc2h9YClcbiAgICB9XG4gIH1cbn1cblxudmFyIEdsb2JhbFN0b3JlID0gZnVuY3Rpb24gKCkge1xuICBTdG9yZS5jYWxsKHRoaXMpXG4gIHRoaXMuYWN0aW9ucyA9IGFjdGlvbnModGhpcylcblxuICB2YXIgaGFzaERhdGEgPSBudWxsXG4gIHZhciByZXBsYWNlSGFzaCA9IHJlcGxhY2VMb2NhdGlvbkhhc2goKVxuXG4gIHRyeSB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICBoYXNoRGF0YSA9IEpTT04ucGFyc2UoTFpTdHJpbmcuZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50KHV0aWwuaGFzaCgncycpKSlcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge31cblxuICBpZiAoaGFzaERhdGEpIHtcbiAgICB0aGlzLnNldCh1dGlsLmV4dGVuZChoYXNoRGF0YSwgZGVmYXVsdHMpKVxuICB9IGVsc2Uge1xuICAgIHRoaXMuc2V0KGRlZmF1bHRzKVxuICB9XG5cbiAgdGhpcy5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgIC8vIHNhdmUgaW4gaGFzaFxuICAgIHZhciBkYXRhID0gdGhpcy5nZXQoKVxuXG4gICAgdmFyIGNvbXByZXNzZWQgPSBMWlN0cmluZy5jb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICByZXBsYWNlSGFzaCh1dGlsLmhhc2goJ3MnLCBjb21wcmVzc2VkKSlcbiAgfSlcbn1cblxuR2xvYmFsU3RvcmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdG9yZS5wcm90b3R5cGUpXG5cbm1vZHVsZS5leHBvcnRzID0gR2xvYmFsU3RvcmVcblxuIiwiLyogdXRpbFxuICovXG5cbmZ1bmN0aW9uIGNsb3Nlc3QgKCRlbGVtLCBzZWxlY3Rvcikge1xuICAvLyBmaW5kIHRoZSBjbG9zZXN0IHBhcmVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yXG4gIHZhciAkbWF0Y2hlc1xuXG4gIC8vIGxvb3AgdGhyb3VnaCBwYXJlbnRzXG4gIHdoaWxlICgkZWxlbSAmJiAkZWxlbSAhPT0gZG9jdW1lbnQpIHtcbiAgICBpZiAoJGVsZW0ucGFyZW50Tm9kZSkge1xuICAgICAgLy8gZmluZCBhbGwgc2libGluZ3MgdGhhdCBtYXRjaCB0aGUgc2VsZWN0b3JcbiAgICAgICRtYXRjaGVzID0gJGVsZW0ucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgLy8gY2hlY2sgaWYgb3VyIGVsZW1lbnQgaXMgbWF0Y2hlZCAocG9vci1tYW4ncyBFbGVtZW50Lm1hdGNoZXMoKSlcbiAgICAgIGlmIChbXS5pbmRleE9mLmNhbGwoJG1hdGNoZXMsICRlbGVtKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuICRlbGVtXG4gICAgICB9XG5cbiAgICAgIC8vIGdvIHVwIHRoZSB0cmVlXG4gICAgICAkZWxlbSA9ICRlbGVtLnBhcmVudE5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBjbG9uZSAob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpXG59XG5cbmZ1bmN0aW9uIGV4dGVuZExldmVsIChvYmosIGRlZmF1bHRzID0ge30pIHtcbiAgLy8gY29weSBkZWZhdWx0IGtleXMgd2hlcmUgdW5kZWZpbmVkXG4gIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gZGVmYXVsdFxuICAgICAgb2JqW2tleV0gPSBjbG9uZShkZWZhdWx0c1trZXldKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgZXh0ZW5kTGV2ZWwob2JqW2tleV0sIGRlZmF1bHRzW2tleV0pXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYmpcbn1cblxuLy8gbXVsdGktbGV2ZWwgb2JqZWN0IG1lcmdlXG5mdW5jdGlvbiBleHRlbmQgKG9iaiwgZGVmYXVsdHMpIHtcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHt9XG4gIH1cblxuICByZXR1cm4gZXh0ZW5kTGV2ZWwoY2xvbmUob2JqKSwgZGVmYXVsdHMpXG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlIChmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgdmFyIHRpbWVvdXRcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50c1xuICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbFxuICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgIGlmIChjYWxsTm93KSB7XG4gICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRTY3JpcHQgKHVybCwgZG9uZSA9ICgpID0+IHt9KSB7XG4gIHZhciAkc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgJHNjcmlwdC5zcmMgPSB1cmxcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCgkc2NyaXB0KVxuXG4gICRzY3JpcHQub25sb2FkID0gZG9uZVxufVxuXG5mdW5jdGlvbiBhc3luYyAoYXJyLCBkb25lLCBpID0gMCkge1xuICBpZiAoYXJyLmxlbmd0aCA9PT0gaSkge1xuICAgIHJldHVybiBkb25lKClcbiAgfVxuXG4gIGFycltpXSgoKSA9PiB7XG4gICAgaSsrXG4gICAgYXN5bmMoYXJyLCBkb25lLCBpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBmZXRjaCAocGF0aCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgLy8gb3B0aW9ucyBub3Qgc3BlY2lmaWVkXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgdHlwZTogJ0dFVCcsXG4gICAgZGF0YToge31cbiAgfSlcblxuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgcmVxdWVzdC5vcGVuKG9wdGlvbnMudHlwZSwgcGF0aClcbiAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04JylcbiAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdYLVJlcXVlc3RlZC1XaXRoJywgJ1hNTEh0dHBSZXF1ZXN0JylcblxuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQgfHwgJ3t9JylcblxuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXJyb3JcbiAgICAgIGNhbGxiYWNrKHJlcXVlc3QpXG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGVycm9yXG4gICAgY2FsbGJhY2socmVxdWVzdClcbiAgfVxuXG4gIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpKVxufVxuXG5mdW5jdGlvbiBpbmhlcml0cyAoYmFzZUNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGJhc2VDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKVxuICBiYXNlQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYmFzZUNsYXNzXG5cbiAgYmFzZUNsYXNzLnN1cGVyID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGJhc2VDbGFzcy5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIGJhc2VDbGFzc1xufVxuXG5mdW5jdGlvbiBoYXNoIChrZXksIHZhbHVlKSB7XG4gIHZhciBoYXNoUGFydHMgPSBbXVxuICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICBoYXNoUGFydHMgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkuc3BsaXQoJyYnKVxuICB9XG5cbiAgdmFyIHBhcnNlZEhhc2ggPSB7fVxuICB2YXIgc3RyaW5nSGFzaCA9ICcnXG5cbiAgaGFzaFBhcnRzLmZvckVhY2goKHBhcnQsIGkpID0+IHtcbiAgICB2YXIgc3ViUGFydHMgPSBwYXJ0LnNwbGl0KCc9JylcbiAgICBwYXJzZWRIYXNoW3N1YlBhcnRzWzBdXSA9IHN1YlBhcnRzWzFdIHx8ICcnXG4gIH0pXG5cbiAgaWYgKGtleSkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgcGFyc2VkSGFzaFtrZXldID0gdmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhcnNlZEhhc2hba2V5XVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlYnVpbGQgdG8gc3RyaW5nXG4gIE9iamVjdC5rZXlzKHBhcnNlZEhhc2gpLmZvckVhY2goKGtleSwgaSkgPT4ge1xuICAgIGlmIChpID4gMCkge1xuICAgICAgc3RyaW5nSGFzaCArPSAnJidcbiAgICB9XG5cbiAgICBzdHJpbmdIYXNoICs9IGtleVxuXG4gICAgaWYgKHBhcnNlZEhhc2hba2V5XSkge1xuICAgICAgc3RyaW5nSGFzaCArPSBgPSR7cGFyc2VkSGFzaFtrZXldfWBcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHN0cmluZ0hhc2hcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNsb25lOiBjbG9uZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIGNsb3Nlc3Q6IGNsb3Nlc3QsXG4gIGRlYm91bmNlOiBkZWJvdW5jZSxcbiAgbG9hZFNjcmlwdDogbG9hZFNjcmlwdCxcbiAgYXN5bmM6IGFzeW5jLFxuICBmZXRjaDogZmV0Y2gsXG4gIGhhc2g6IGhhc2gsXG5cbiAgaW5oZXJpdHM6IGluaGVyaXRzXG59XG4iXX0=
