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

var GlobalStore = function GlobalStore() {
  var _this = this;

  Store.call(this);
  this.actions = actions(this);

  var hashData = null;

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
    window.history.replaceState(null, null, '#' + util.hash('s', compressed));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZHVycnV0aS9kdXJydXRpLmpzIiwibm9kZV9tb2R1bGVzL2R1cnJ1dGkvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvam90dGVkL2pvdHRlZC5qcyIsIm5vZGVfbW9kdWxlcy9sei1zdHJpbmcvbGlicy9sei1zdHJpbmcuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbXBvbmVudHMvZWRpdG9yL2VkaXRvci1iYXIuanMiLCJzcmMvY29tcG9uZW50cy9lZGl0b3IvZWRpdG9yLXdpZGdldC5qcyIsInNyYy9jb21wb25lbnRzL2VkaXRvci9lZGl0b3IuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvaGVhZGVyLmpzIiwic3JjL2NvbXBvbmVudHMvaGVhZGVyL3NldHRpbmdzLmpzIiwic3JjL2NvbXBvbmVudHMvaGVhZGVyL3NoYXJlLmpzIiwic3JjL2NvbXBvbmVudHMvbWFpbi5qcyIsInNyYy9jb21wb25lbnRzL3BvcHVwLmpzIiwic3JjL3N0YXRlL2FjdGlvbnMtaW50ZXJuYWwuanMiLCJzcmMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9zdGF0ZS9zaG9ydC11cmwuanMiLCJzcmMvc3RhdGUvc3RvcmUtaW50ZXJuYWwuanMiLCJzcmMvc3RhdGUvc3RvcmUuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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SSxHQUFKLEVBQVM7QUFDUCxRQUFJLEtBQUosRUFBVztBQUNULGlCQUFXLEdBQVgsSUFBa0IsS0FBbEI7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLFdBQVcsR0FBWCxDQUFQO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLFNBQU8sSUFBUCxDQUFZLFVBQVosRUFBd0IsT0FBeEIsQ0FBZ0MsVUFBQyxHQUFELEVBQU0sQ0FBTixFQUFZO0FBQzFDLFFBQUksSUFBSSxDQUFSLEVBQVc7QUFDVCxvQkFBYyxHQUFkO0FBQ0Q7O0FBRUQsa0JBQWMsR0FBZDs7QUFFQSxRQUFJLFdBQVcsR0FBWCxDQUFKLEVBQXFCO0FBQ25CLDBCQUFrQixXQUFXLEdBQVgsQ0FBbEI7QUFDRDtBQUNGLEdBVkQ7O0FBWUEsU0FBTyxVQUFQO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ2YsU0FBTyxLQURRO0FBRWYsVUFBUSxNQUZPO0FBR2YsV0FBUyxPQUhNO0FBSWYsWUFBVSxRQUpLO0FBS2YsY0FBWSxVQUxHO0FBTWYsU0FBTyxLQU5RO0FBT2YsU0FBTyxLQVBRO0FBUWYsUUFBTSxJQVJTOztBQVVmLFlBQVU7QUFWSyxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwuZHVycnV0aSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKiBEdXJydXRpXG4gICAqIFV0aWxzLlxuICAgKi9cblxuICBmdW5jdGlvbiBoYXNXaW5kb3coKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgdmFyIGlzQ2xpZW50ID0gaGFzV2luZG93KCk7XG5cbiAgZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gIH1cblxuICAvLyBvbmUtbGV2ZWwgb2JqZWN0IGV4dGVuZFxuXG5cbiAgdmFyIERVUlJVVElfREVCVUcgPSB0cnVlO1xuXG4gIGZ1bmN0aW9uIHdhcm4oKSB7XG4gICAgaWYgKERVUlJVVElfREVCVUcgPT09IHRydWUpIHtcbiAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qIER1cnJ1dGlcbiAgICogQ2FwdHVyZSBhbmQgcmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAgICovXG5cbiAgdmFyIF9yZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoKSB7fTtcblxuICAvLyBjYXB0dXJlIGFsbCBsaXN0ZW5lcnNcbiAgdmFyIGV2ZW50cyA9IFtdO1xuICB2YXIgZG9tRXZlbnRUeXBlcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIGdldERvbUV2ZW50VHlwZXMoKSB7XG4gICAgdmFyIGV2ZW50VHlwZXMgPSBbXTtcbiAgICBmb3IgKHZhciBhdHRyIGluIGRvY3VtZW50KSB7XG4gICAgICAvLyBzdGFydHMgd2l0aCBvblxuICAgICAgaWYgKGF0dHIuc3Vic3RyKDAsIDIpID09PSAnb24nKSB7XG4gICAgICAgIGV2ZW50VHlwZXMucHVzaChhdHRyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnRUeXBlcztcbiAgfVxuXG4gIHZhciBvcmlnaW5hbEFkZEV2ZW50TGlzdGVuZXI7XG5cbiAgZnVuY3Rpb24gY2FwdHVyZUFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmUpIHtcbiAgICBvcmlnaW5hbEFkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGV2ZW50cy5wdXNoKHtcbiAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBmbjogZm4sXG4gICAgICBjYXB0dXJlOiBjYXB0dXJlXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVOb2RlRXZlbnRzKCRub2RlKSB7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBldmVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAoZXZlbnRzW2ldLnRhcmdldCA9PT0gJG5vZGUpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAgICRub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRzW2ldLnR5cGUsIGV2ZW50c1tpXS5mbiwgZXZlbnRzW2ldLmNhcHR1cmUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBldmVudFxuICAgICAgICBldmVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpLS07XG4gICAgICB9XG5cbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgb24qIGxpc3RlbmVyc1xuICAgIGRvbUV2ZW50VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRUeXBlKSB7XG4gICAgICAkbm9kZVtldmVudFR5cGVdID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpc0NsaWVudCkge1xuICAgIGRvbUV2ZW50VHlwZXMgPSBnZXREb21FdmVudFR5cGVzKCk7XG5cbiAgICAvLyBjYXB0dXJlIGFkZEV2ZW50TGlzdGVuZXJcblxuICAgIC8vIElFXG4gICAgaWYgKHdpbmRvdy5Ob2RlLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnYWRkRXZlbnRMaXN0ZW5lcicpKSB7XG4gICAgICBvcmlnaW5hbEFkZEV2ZW50TGlzdGVuZXIgPSB3aW5kb3cuTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIHdpbmRvdy5Ob2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gY2FwdHVyZUFkZEV2ZW50TGlzdGVuZXI7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuRXZlbnRUYXJnZXQucHJvdG90eXBlLmhhc093blByb3BlcnR5KCdhZGRFdmVudExpc3RlbmVyJykpIHtcbiAgICAgIC8vIHN0YW5kYXJkXG4gICAgICBvcmlnaW5hbEFkZEV2ZW50TGlzdGVuZXIgPSB3aW5kb3cuRXZlbnRUYXJnZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICB3aW5kb3cuRXZlbnRUYXJnZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBjYXB0dXJlQWRkRXZlbnRMaXN0ZW5lcjtcbiAgICB9XG5cbiAgICAvLyB0cmF2ZXJzZSBhbmQgcmVtb3ZlIGFsbCBldmVudHMgbGlzdGVuZXJzIGZyb20gbm9kZXNcbiAgICBfcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKCRub2RlLCB0cmF2ZXJzZSkge1xuICAgICAgcmVtb3ZlTm9kZUV2ZW50cygkbm9kZSk7XG5cbiAgICAgIC8vIHRyYXZlcnNlIGVsZW1lbnQgY2hpbGRyZW5cbiAgICAgIGlmICh0cmF2ZXJzZSAmJiAkbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgX3JlbW92ZUxpc3RlbmVycygkbm9kZS5jaGlsZHJlbltpXSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgdmFyIHJlbW92ZUxpc3RlbmVycyQxID0gX3JlbW92ZUxpc3RlbmVycztcblxuICAvKiBEdXJydXRpXG4gICAqIERPTSBwYXRjaCAtIG1vcnBocyBhIERPTSBub2RlIGludG8gYW5vdGhlci5cbiAgICovXG5cbiAgZnVuY3Rpb24gdHJhdmVyc2UoJG5vZGUsICRuZXdOb2RlLCBwYXRjaGVzKSB7XG4gICAgLy8gdHJhdmVyc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRub2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRpZmYoJG5vZGUuY2hpbGROb2Rlc1tpXSwgJG5ld05vZGUuY2hpbGROb2Rlc1tpXSwgcGF0Y2hlcyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFwQXR0cmlidXRlcygkbm9kZSwgJG5ld05vZGUpIHtcbiAgICB2YXIgYXR0cnMgPSB7fTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJG5vZGUuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnNbJG5vZGUuYXR0cmlidXRlc1tpXS5uYW1lXSA9IG51bGw7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8ICRuZXdOb2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICBhdHRyc1skbmV3Tm9kZS5hdHRyaWJ1dGVzW19pXS5uYW1lXSA9ICRuZXdOb2RlLmF0dHJpYnV0ZXNbX2ldLnZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRycztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoQXR0cnMoJG5vZGUsICRuZXdOb2RlKSB7XG4gICAgLy8gbWFwIGF0dHJpYnV0ZXNcbiAgICB2YXIgYXR0cnMgPSBtYXBBdHRyaWJ1dGVzKCRub2RlLCAkbmV3Tm9kZSk7XG5cbiAgICAvLyBhZGQtY2hhbmdlIGF0dHJpYnV0ZXNcbiAgICBmb3IgKHZhciBwcm9wIGluIGF0dHJzKSB7XG4gICAgICBpZiAoYXR0cnNbcHJvcF0gPT09IG51bGwpIHtcbiAgICAgICAgJG5vZGUucmVtb3ZlQXR0cmlidXRlKHByb3ApO1xuXG4gICAgICAgIC8vIGNoZWNrZWQgbmVlZHMgZXh0cmEgd29ya1xuICAgICAgICBpZiAocHJvcCA9PT0gJ2NoZWNrZWQnKSB7XG4gICAgICAgICAgJG5vZGUuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkbm9kZS5zZXRBdHRyaWJ1dGUocHJvcCwgYXR0cnNbcHJvcF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRpZmYoJG5vZGUsICRuZXdOb2RlKSB7XG4gICAgdmFyIHBhdGNoZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFtdO1xuXG4gICAgdmFyIHBhdGNoID0ge1xuICAgICAgbm9kZTogJG5vZGUsXG4gICAgICBuZXdOb2RlOiAkbmV3Tm9kZVxuICAgIH07XG5cbiAgICAvLyBwdXNoIHRyYXZlcnNlZCBub2RlIHRvIHBhdGNoIGxpc3RcbiAgICBwYXRjaGVzLnB1c2gocGF0Y2gpO1xuXG4gICAgLy8gZmFzdGVyIHRoYW4gb3V0ZXJodG1sXG4gICAgaWYgKCRub2RlLmlzRXF1YWxOb2RlKCRuZXdOb2RlKSkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVycyBvbiBub2RlIGFuZCBjaGlsZHJlblxuICAgICAgcmVtb3ZlTGlzdGVuZXJzJDEoJG5vZGUsIHRydWUpO1xuXG4gICAgICByZXR1cm4gcGF0Y2hlcztcbiAgICB9XG5cbiAgICAvLyBpZiBvbmUgb2YgdGhlbSBpcyBub3QgYW4gZWxlbWVudCBub2RlLFxuICAgIC8vIG9yIHRoZSB0YWcgY2hhbmdlZCxcbiAgICAvLyBvciBub3QgdGhlIHNhbWUgbnVtYmVyIG9mIGNoaWxkcmVuLlxuICAgIGlmICgkbm9kZS5ub2RlVHlwZSAhPT0gMSB8fCAkbmV3Tm9kZS5ub2RlVHlwZSAhPT0gMSB8fCAkbm9kZS50YWdOYW1lICE9PSAkbmV3Tm9kZS50YWdOYW1lIHx8ICRub2RlLmNoaWxkTm9kZXMubGVuZ3RoICE9PSAkbmV3Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgcGF0Y2gucmVwbGFjZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGNoLnVwZGF0ZSA9IHRydWU7XG5cbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnMgb24gbm9kZVxuICAgICAgcmVtb3ZlTGlzdGVuZXJzJDEoJG5vZGUpO1xuXG4gICAgICAvLyB0cmF2ZXJzZSBjaGlsZE5vZGVzXG4gICAgICB0cmF2ZXJzZSgkbm9kZSwgJG5ld05vZGUsIHBhdGNoZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXRjaGVzO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlQYXRjaChwYXRjaCkge1xuICAgIGlmIChwYXRjaC5yZXBsYWNlKSB7XG4gICAgICBwYXRjaC5ub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBhdGNoLm5ld05vZGUsIHBhdGNoLm5vZGUpO1xuICAgIH0gZWxzZSBpZiAocGF0Y2gudXBkYXRlKSB7XG4gICAgICBwYXRjaEF0dHJzKHBhdGNoLm5vZGUsIHBhdGNoLm5ld05vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoKHBhdGNoZXMpIHtcbiAgICBwYXRjaGVzLmZvckVhY2goYXBwbHlQYXRjaCk7XG5cbiAgICByZXR1cm4gcGF0Y2hlcztcbiAgfVxuXG4gIHZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gIH0gOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgfTtcblxuXG5cblxuXG4gIHZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gICAgfTtcbiAgfSgpO1xuXG5cblxuXG5cblxuXG4gIHZhciBnZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgICB9XG4gIH07XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuICB2YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBzZXQocGFyZW50LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjICYmIGRlc2Mud3JpdGFibGUpIHtcbiAgICAgIGRlc2MudmFsdWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNldHRlciA9IGRlc2Muc2V0O1xuXG4gICAgICBpZiAoc2V0dGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyogRHVycnV0aVxuICAgKiBNaWNybyBJc29tb3JwaGljIEphdmFTY3JpcHQgbGlicmFyeSBmb3IgYnVpbGRpbmcgdXNlciBpbnRlcmZhY2VzLlxuICAgKi9cblxuICB2YXIgZHVycnV0aUF0dHIgPSAnZGF0YS1kdXJydXRpLWlkJztcbiAgdmFyIGR1cnJ1dGlFbGVtU2VsZWN0b3IgPSAnWycgKyBkdXJydXRpQXR0ciArICddJztcbiAgdmFyIGNvbXBvbmVudENhY2hlID0gW107XG4gIHZhciBjb21wb25lbnRJbmRleCA9IDA7XG5cbiAgLy8gZGVjb3JhdGUgYSBiYXNpYyBjbGFzcyB3aXRoIGR1cnJ1dGkgc3BlY2lmaWMgcHJvcGVydGllc1xuICBmdW5jdGlvbiBkZWNvcmF0ZShDb21wKSB7XG4gICAgdmFyIGNvbXBvbmVudDtcblxuICAgIC8vIGluc3RhbnRpYXRlIGNsYXNzZXNcbiAgICBpZiAodHlwZW9mIENvbXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBvbmVudCA9IG5ldyBDb21wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBjaGFuZ2UgdGhlIGlkIG9uIGEgY2FjaGVkIGNvbXBvbmVudFxuICAgICAgY29tcG9uZW50ID0gT2JqZWN0LmNyZWF0ZShDb21wKTtcbiAgICB9XG5cbiAgICAvLyBjb21wb25lbnRzIGdldCBhIG5ldyBpZCBvbiByZW5kZXIsXG4gICAgLy8gc28gd2UgY2FuIGNsZWFyIHRoZSBwcmV2aW91cyBjb21wb25lbnQgY2FjaGUuXG4gICAgY29tcG9uZW50Ll9kdXJydXRpSWQgPSBTdHJpbmcoY29tcG9uZW50SW5kZXgrKyk7XG5cbiAgICAvLyBjYWNoZSBjb21wb25lbnRcbiAgICBjb21wb25lbnRDYWNoZS5wdXNoKHtcbiAgICAgIGlkOiBjb21wb25lbnQuX2R1cnJ1dGlJZCxcbiAgICAgIGNvbXBvbmVudDogY29tcG9uZW50XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29tcG9uZW50O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2FjaGVkQ29tcG9uZW50KCRub2RlKSB7XG4gICAgLy8gZ2V0IHRoZSBjb21wb25lbnQgZnJvbSB0aGUgZG9tIG5vZGUgLSByZW5kZXJlZCBpbiBicm93c2VyLlxuICAgIGlmICgkbm9kZS5fZHVycnV0aSkge1xuICAgICAgcmV0dXJuICRub2RlLl9kdXJydXRpO1xuICAgIH1cblxuICAgIC8vIG9yIGdldCBpdCBmcm9tIHRoZSBjb21wb25lbnQgY2FjaGUgLSByZW5kZXJlZCBvbiB0aGUgc2VydmVyLlxuICAgIHZhciBpZCA9ICRub2RlLmdldEF0dHJpYnV0ZShkdXJydXRpQXR0cik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRDYWNoZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNvbXBvbmVudENhY2hlW2ldLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50Q2FjaGVbaV0uY29tcG9uZW50O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlbW92ZSBjdXN0b20gZGF0YSBhdHRyaWJ1dGVzLFxuICAvLyBhbmQgY2FjaGUgdGhlIGNvbXBvbmVudCBvbiB0aGUgRE9NIG5vZGUuXG4gIGZ1bmN0aW9uIGNsZWFuQXR0ck5vZGVzKCRjb250YWluZXIsIGluY2x1ZGVQYXJlbnQpIHtcbiAgICB2YXIgbm9kZXMgPSBbXS5zbGljZS5jYWxsKCRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChkdXJydXRpRWxlbVNlbGVjdG9yKSk7XG5cbiAgICBpZiAoaW5jbHVkZVBhcmVudCkge1xuICAgICAgbm9kZXMucHVzaCgkY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICgkbm9kZSkge1xuICAgICAgLy8gY2FjaGUgY29tcG9uZW50IGluIG5vZGVcbiAgICAgICRub2RlLl9kdXJydXRpID0gZ2V0Q2FjaGVkQ29tcG9uZW50KCRub2RlKTtcblxuICAgICAgLy8gY2xlYW4tdXAgZGF0YSBhdHRyaWJ1dGVzXG4gICAgICAkbm9kZS5yZW1vdmVBdHRyaWJ1dGUoZHVycnV0aUF0dHIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5tb3VudE5vZGUoJG5vZGUpIHtcbiAgICB2YXIgY2FjaGVkQ29tcG9uZW50ID0gZ2V0Q2FjaGVkQ29tcG9uZW50KCRub2RlKTtcblxuICAgIGlmIChjYWNoZWRDb21wb25lbnQudW5tb3VudCkge1xuICAgICAgY2FjaGVkQ29tcG9uZW50LnVubW91bnQoJG5vZGUpO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIHRoZSBjb21wb25lbnQgZnJvbSB0aGUgY2FjaGVcbiAgICBjbGVhckNvbXBvbmVudENhY2hlKGNhY2hlZENvbXBvbmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBtb3VudE5vZGUoJG5vZGUpIHtcbiAgICB2YXIgY2FjaGVkQ29tcG9uZW50ID0gZ2V0Q2FjaGVkQ29tcG9uZW50KCRub2RlKTtcblxuICAgIGlmIChjYWNoZWRDb21wb25lbnQubW91bnQpIHtcbiAgICAgIGNhY2hlZENvbXBvbmVudC5tb3VudCgkbm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJDb21wb25lbnRDYWNoZShjb21wb25lbnQpIHtcbiAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjb21wb25lbnRDYWNoZVtpXS5pZCA9PT0gY29tcG9uZW50Ll9kdXJydXRpSWQpIHtcbiAgICAgICAgICBjb21wb25lbnRDYWNoZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNsZWFyIHRoZSBlbnRpcmUgY29tcG9uZW50IGNhY2hlXG4gICAgICBjb21wb25lbnRJbmRleCA9IDA7XG4gICAgICBjb21wb25lbnRDYWNoZS5sZW5ndGggPSAwO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUZyYWdtZW50KCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG5cbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnRyaW0oKTtcbiAgICB2YXIgcGFyZW50ID0gJ2Rpdic7XG4gICAgdmFyICRub2RlO1xuXG4gICAgaWYgKHRlbXBsYXRlLmluZGV4T2YoJzx0cicpID09PSAwKSB7XG4gICAgICAvLyB0YWJsZSByb3dcbiAgICAgIHBhcmVudCA9ICd0Ym9keSc7XG4gICAgfSBlbHNlIGlmICh0ZW1wbGF0ZS5pbmRleE9mKCc8dGQnKSA9PT0gMCkge1xuICAgICAgLy8gdGFibGUgY29sdW1uXG4gICAgICBwYXJlbnQgPSAndHInO1xuICAgIH1cblxuICAgICRub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChwYXJlbnQpO1xuICAgICRub2RlLmlubmVySFRNTCA9IHRlbXBsYXRlO1xuXG4gICAgaWYgKCRub2RlLmNoaWxkcmVuLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgdGVtcGxhdGUgbXVzdCBoYXZlIGEgc2luZ2xlIHBhcmVudCBub2RlLicsIHRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJG5vZGUuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDb21wb25lbnRJZCh0ZW1wbGF0ZSwgY29tcG9uZW50KSB7XG4gICAgLy8gbmFpdmUgaW1wbGVtZW50YXRpb24gb2YgYWRkaW5nIGFuIGF0dHJpYnV0ZSB0byB0aGUgcGFyZW50IGNvbnRhaW5lci5cbiAgICAvLyBzbyB3ZSBkb24ndCBkZXBlbmQgb24gYSBkb20gcGFyc2VyLlxuICAgIC8vIGRvd25zaWRlIGlzIHdlIGNhbid0IHdhcm4gdGhhdCB0ZW1wbGF0ZSBNVVNUIGhhdmUgYSBzaW5nbGUgcGFyZW50IChpbiBOb2RlLmpzKS5cblxuICAgIC8vIGNoZWNrIHZvaWQgZWxlbWVudHMgZmlyc3QuXG4gICAgdmFyIGZpcnN0QnJhY2tldEluZGV4ID0gdGVtcGxhdGUuaW5kZXhPZignLz4nKTtcblxuICAgIC8vIG5vbi12b2lkIGVsZW1lbnRzXG4gICAgaWYgKGZpcnN0QnJhY2tldEluZGV4ID09PSAtMSkge1xuICAgICAgZmlyc3RCcmFja2V0SW5kZXggPSB0ZW1wbGF0ZS5pbmRleE9mKCc+Jyk7XG4gICAgfVxuXG4gICAgdmFyIGF0dHIgPSAnICcgKyBkdXJydXRpQXR0ciArICc9XCInICsgY29tcG9uZW50Ll9kdXJydXRpSWQgKyAnXCInO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlLnN1YnN0cigwLCBmaXJzdEJyYWNrZXRJbmRleCkgKyBhdHRyICsgdGVtcGxhdGUuc3Vic3RyKGZpcnN0QnJhY2tldEluZGV4KTtcbiAgfVxuXG4gIC8vIHRyYXZlcnNlIGFuZCBmaW5kIGR1cnJ1dGkgbm9kZXNcbiAgZnVuY3Rpb24gZ2V0Q29tcG9uZW50Tm9kZXMoJGNvbnRhaW5lcikge1xuICAgIHZhciBhcnIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IFtdO1xuXG4gICAgaWYgKCRjb250YWluZXIuX2R1cnJ1dGkpIHtcbiAgICAgIGFyci5wdXNoKCRjb250YWluZXIpO1xuICAgIH1cblxuICAgIGlmICgkY29udGFpbmVyLmNoaWxkcmVuKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRjb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZ2V0Q29tcG9uZW50Tm9kZXMoJGNvbnRhaW5lci5jaGlsZHJlbltpXSwgYXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xuICB9XG5cbiAgdmFyIER1cnJ1dGkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRHVycnV0aSgpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIER1cnJ1dGkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKER1cnJ1dGksIFt7XG4gICAgICBrZXk6ICdzZXJ2ZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNlcnZlcigpIHtcbiAgICAgICAgY2xlYXJDb21wb25lbnRDYWNoZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKGNvbXBvbmVudCwgJGNvbnRhaW5lcikge1xuICAgICAgICAvLyBkZWNvcmF0ZSBiYXNpYyBjbGFzc2VzIHdpdGggZHVycnV0aSBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBkdXJydXRpQ29tcG9uZW50ID0gZGVjb3JhdGUoY29tcG9uZW50KTtcblxuICAgICAgICBpZiAodHlwZW9mIGR1cnJ1dGlDb21wb25lbnQucmVuZGVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50cyBtdXN0IGhhdmUgYSByZW5kZXIoKSBtZXRob2QuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkdXJydXRpQ29tcG9uZW50LnJlbmRlcigpO1xuICAgICAgICB2YXIgY29tcG9uZW50SHRtbCA9IGFkZENvbXBvbmVudElkKHRlbXBsYXRlLCBkdXJydXRpQ29tcG9uZW50KTtcblxuICAgICAgICAvLyBtb3VudCBhbmQgdW5tb3VudCBpbiBicm93c2VyLCB3aGVuIHdlIHNwZWNpZnkgYSBjb250YWluZXIuXG4gICAgICAgIGlmIChpc0NsaWVudCAmJiAkY29udGFpbmVyKSB7XG4gICAgICAgICAgdmFyICRuZXdDb21wb25lbnQ7XG4gICAgICAgICAgdmFyIHBhdGNoZXM7XG5cbiAgICAgICAgICB2YXIgX3JldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZSBjb250YWluZXIgaXMgc3RpbGwgaW4gdGhlIERPTS5cbiAgICAgICAgICAgIC8vIHdoZW4gcnVubmluZyBtdWx0aXBsZSBwYXJhbGxlbCByZW5kZXIncywgdGhlIGNvbnRhaW5lclxuICAgICAgICAgICAgLy8gaXMgcmVtb3ZlZCBieSB0aGUgcHJldmlvdXMgcmVuZGVyLCBidXQgdGhlIHJlZmVyZW5jZSBzdGlsbCBpbiBtZW1vcnkuXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoJGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgLy8gd2FybiBmb3IgcGVyZm9ybWFuY2UuXG4gICAgICAgICAgICAgIHdhcm4oJ05vZGUnLCAkY29udGFpbmVyLCAnaXMgbm8gbG9uZ2VyIGluIHRoZSBET00uIFxcbkl0IHdhcyBwcm9iYWJseSByZW1vdmVkIGJ5IGEgcGFyZW50IGNvbXBvbmVudC4nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2OiB2b2lkIDBcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudE5vZGVzID0gW107XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSB0ZW1wbGF0ZSBzdHJpbmcgdG8gYSBkb20gbm9kZVxuICAgICAgICAgICAgJG5ld0NvbXBvbmVudCA9IGNyZWF0ZUZyYWdtZW50KGNvbXBvbmVudEh0bWwpO1xuXG4gICAgICAgICAgICAvLyB1bm1vdW50IGNvbXBvbmVudCBhbmQgc3ViLWNvbXBvbmVudHNcblxuICAgICAgICAgICAgZ2V0Q29tcG9uZW50Tm9kZXMoJGNvbnRhaW5lcikuZm9yRWFjaCh1bm1vdW50Tm9kZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSBjb250YWluZXIgaXMgYSBkdXJydXRpIGVsZW1lbnQsXG4gICAgICAgICAgICAvLyB1bm1vdW50IGl0IGFuZCBpdCdzIGNoaWxkcmVuIGFuZCByZXBsYWNlIHRoZSBub2RlLlxuICAgICAgICAgICAgaWYgKGdldENhY2hlZENvbXBvbmVudCgkY29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGRhdGEgYXR0cmlidXRlcyBvbiB0aGUgbmV3IG5vZGUsXG4gICAgICAgICAgICAgIC8vIGJlZm9yZSBwYXRjaCxcbiAgICAgICAgICAgICAgLy8gYW5kIGdldCB0aGUgbGlzdCBvZiBuZXcgY29tcG9uZW50cy5cbiAgICAgICAgICAgICAgY2xlYW5BdHRyTm9kZXMoJG5ld0NvbXBvbmVudCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgLy8gZ2V0IHJlcXVpcmVkIGRvbSBwYXRjaGVzXG4gICAgICAgICAgICAgIHBhdGNoZXMgPSBkaWZmKCRjb250YWluZXIsICRuZXdDb21wb25lbnQpO1xuXG5cbiAgICAgICAgICAgICAgcGF0Y2hlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXRjaCQkMSkge1xuICAgICAgICAgICAgICAgIC8vIGFsd2F5cyB1cGRhdGUgY29tcG9uZW50IGluc3RhbmNlcyxcbiAgICAgICAgICAgICAgICAvLyBldmVuIGlmIHRoZSBkb20gZG9lc24ndCBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgcGF0Y2gkJDEubm9kZS5fZHVycnV0aSA9IHBhdGNoJCQxLm5ld05vZGUuX2R1cnJ1dGk7XG5cbiAgICAgICAgICAgICAgICAvLyBwYXRjaGVzIGNvbnRhaW4gYWxsIHRoZSB0cmF2ZXJzZWQgbm9kZXMuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBtb3VudCBjb21wb25lbnRzIGhlcmUsIGZvciBwZXJmb3JtYW5jZS5cbiAgICAgICAgICAgICAgICBpZiAocGF0Y2gkJDEubm9kZS5fZHVycnV0aSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHBhdGNoJCQxLnJlcGxhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZXMucHVzaChwYXRjaCQkMS5uZXdOb2RlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0Y2gkJDEudXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzLnB1c2gocGF0Y2gkJDEubm9kZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBub2RlIGlzIHRoZSBzYW1lLFxuICAgICAgICAgICAgICAgICAgICAvLyBidXQgd2UgbmVlZCB0byBtb3VudCBzdWItY29tcG9uZW50cy5cbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoY29tcG9uZW50Tm9kZXMsIGdldENvbXBvbmVudE5vZGVzKHBhdGNoJCQxLm5vZGUpKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIC8vIG1vcnBoIG9sZCBkb20gbm9kZSBpbnRvIG5ldyBvbmVcbiAgICAgICAgICAgICAgcGF0Y2gocGF0Y2hlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpZiB0aGUgY29tcG9uZW50IGlzIG5vdCBhIGR1cnJ1dGkgZWxlbWVudCxcbiAgICAgICAgICAgICAgLy8gaW5zZXJ0IHRoZSB0ZW1wbGF0ZSB3aXRoIGlubmVySFRNTC5cblxuICAgICAgICAgICAgICAvLyBvbmx5IGlmIHRoZSBzYW1lIGh0bWwgaXMgbm90IGFscmVhZHkgcmVuZGVyZWRcbiAgICAgICAgICAgICAgaWYgKCEkY29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkIHx8ICEkY29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLmlzRXF1YWxOb2RlKCRuZXdDb21wb25lbnQpKSB7XG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5pbm5lckhUTUwgPSBjb21wb25lbnRIdG1sO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZXMgPSBjbGVhbkF0dHJOb2RlcygkY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbW91bnQgbmV3bHkgYWRkZWQgY29tcG9uZW50c1xuICAgICAgICAgICAgY29tcG9uZW50Tm9kZXMuZm9yRWFjaChtb3VudE5vZGUpO1xuICAgICAgICAgIH0oKTtcblxuICAgICAgICAgIGlmICgodHlwZW9mIF9yZXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKF9yZXQpKSA9PT0gXCJvYmplY3RcIikgcmV0dXJuIF9yZXQudjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb21wb25lbnRIdG1sO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gRHVycnV0aTtcbiAgfSgpO1xuXG4gIHZhciBkdXJydXRpID0gbmV3IER1cnJ1dGkoKTtcblxuICByZXR1cm4gZHVycnV0aTtcblxufSkpKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZHVycnV0aS5qcy5tYXAiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwuZHVycnV0aSA9IGdsb2JhbC5kdXJydXRpIHx8IHt9LCBnbG9iYWwuZHVycnV0aS5TdG9yZSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKiBEdXJydXRpXG4gICAqIFV0aWxzLlxuICAgKi9cblxuICBmdW5jdGlvbiBoYXNXaW5kb3coKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgdmFyIGlzQ2xpZW50ID0gaGFzV2luZG93KCk7XG5cbiAgZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gIH1cblxuICAvLyBvbmUtbGV2ZWwgb2JqZWN0IGV4dGVuZFxuICBmdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIG9iaiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgdmFyIGRlZmF1bHRzID0gYXJndW1lbnRzWzFdO1xuXG4gICAgLy8gY2xvbmUgb2JqZWN0XG4gICAgdmFyIGV4dGVuZGVkID0gY2xvbmUob2JqKTtcblxuICAgIC8vIGNvcHkgZGVmYXVsdCBrZXlzIHdoZXJlIHVuZGVmaW5lZFxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2YgZXh0ZW5kZWRba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZXh0ZW5kZWRba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXh0ZW5kZWQ7XG4gIH1cblxuICB2YXIgRFVSUlVUSV9ERUJVRyA9IHRydWU7XG5cbiAgLyogRHVycnV0aVxuICAgKiBEYXRhIHN0b3JlIHdpdGggY2hhbmdlIGV2ZW50cy5cbiAgICovXG5cbiAgZnVuY3Rpb24gU3RvcmUobmFtZSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGhpc3RvcnlTdXBwb3J0ID0gZmFsc2U7XG4gICAgLy8gaGlzdG9yeSBpcyBhY3RpdmUgb25seSBpbiB0aGUgYnJvd3NlciwgYnkgZGVmYXVsdFxuICAgIGlmIChpc0NsaWVudCkge1xuICAgICAgaGlzdG9yeVN1cHBvcnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICBoaXN0b3J5OiBoaXN0b3J5U3VwcG9ydFxuICAgIH0pO1xuXG4gICAgdGhpcy5ldmVudHMgPSB7XG4gICAgICBjaGFuZ2U6IFtdXG4gICAgfTtcblxuICAgIHRoaXMuZGF0YSA9IFtdO1xuICB9XG5cbiAgU3RvcmUucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAodG9waWMpIHtcbiAgICB0aGlzLmV2ZW50c1t0b3BpY10gPSB0aGlzLmV2ZW50c1t0b3BpY10gfHwgW107XG5cbiAgICAvLyBpbW11dGFibGUuXG4gICAgLy8gc28gb24vb2ZmIGRvbid0IGNoYW5nZSB0aGUgYXJyYXkgZHVycmluZyB0cmlnZ2VyLlxuICAgIHZhciBmb3VuZEV2ZW50cyA9IHRoaXMuZXZlbnRzW3RvcGljXS5zbGljZSgpO1xuICAgIGZvdW5kRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBldmVudCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICh0b3BpYywgZnVuYykge1xuICAgIHRoaXMuZXZlbnRzW3RvcGljXSA9IHRoaXMuZXZlbnRzW3RvcGljXSB8fCBbXTtcbiAgICB0aGlzLmV2ZW50c1t0b3BpY10ucHVzaChmdW5jKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKHRvcGljLCBmbikge1xuICAgIHRoaXMuZXZlbnRzW3RvcGljXSA9IHRoaXMuZXZlbnRzW3RvcGljXSB8fCBbXTtcblxuICAgIC8vIGZpbmQgdGhlIGZuIGluIHRoZSBhcnJcbiAgICB2YXIgaW5kZXggPSBbXS5pbmRleE9mLmNhbGwodGhpcy5ldmVudHNbdG9waWNdLCBmbik7XG5cbiAgICAvLyB3ZSBkaWRuJ3QgZmluZCBpdCBpbiB0aGUgYXJyYXlcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNbdG9waWNdLnNwbGljZShpbmRleCwgMSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmRhdGFbdGhpcy5kYXRhLmxlbmd0aCAtIDFdO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjbG9uZSh2YWx1ZSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNsb25lKHRoaXMuZGF0YSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaGlzdG9yeSkge1xuICAgICAgdGhpcy5kYXRhLnB1c2godmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRhdGEgPSBbdmFsdWVdO1xuICAgIH1cblxuICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJyk7XG5cbiAgICByZXR1cm4gdGhpcy5nZXQoKTtcbiAgfTtcblxuICByZXR1cm4gU3RvcmU7XG5cbn0pKSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0b3JlLmpzLm1hcCIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5Kb3R0ZWQgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogdXRpbFxuICAgKi9cblxuICBmdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIG9iaiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgdmFyIGRlZmF1bHRzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICAgIHZhciBleHRlbmRlZCA9IHt9O1xuICAgIC8vIGNsb25lIG9iamVjdFxuICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBleHRlbmRlZFtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG5cbiAgICAvLyBjb3B5IGRlZmF1bHQga2V5cyB3aGVyZSB1bmRlZmluZWRcbiAgICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIGV4dGVuZGVkW2tleV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGV4dGVuZGVkW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4dGVuZGVkW2tleV0gPSBkZWZhdWx0c1trZXldO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV4dGVuZGVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2godXJsLCBjYWxsYmFjaykge1xuICAgIHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcblxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2sodXJsLCB4aHIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgfTtcblxuICAgIHhoci5zZW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBydW5DYWxsYmFjayhpbmRleCwgcGFyYW1zLCBhcnIsIGVycm9ycywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICB9XG5cbiAgICAgIGluZGV4Kys7XG4gICAgICBpZiAoaW5kZXggPCBhcnIubGVuZ3RoKSB7XG4gICAgICAgIHNlcVJ1bm5lcihpbmRleCwgcmVzLCBhcnIsIGVycm9ycywgY2FsbGJhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3JzLCByZXMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBzZXFSdW5uZXIoaW5kZXgsIHBhcmFtcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKSB7XG4gICAgLy8gYXN5bmNcbiAgICBhcnJbaW5kZXhdKHBhcmFtcywgcnVuQ2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXEoYXJyLCBwYXJhbXMpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgaWYgKCFhcnIubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3JzLCBwYXJhbXMpO1xuICAgIH1cblxuICAgIHNlcVJ1bm5lcigwLCBwYXJhbXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjayk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZShmbiwgZGVsYXkpIHtcbiAgICB2YXIgY29vbGRvd24gPSBudWxsO1xuICAgIHZhciBtdWx0aXBsZSA9IG51bGw7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKGNvb2xkb3duKSB7XG4gICAgICAgIG11bHRpcGxlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyVGltZW91dChjb29sZG93bik7XG5cbiAgICAgIGNvb2xkb3duID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgICAgIGZuLmFwcGx5KF90aGlzLCBfYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvb2xkb3duID0gbnVsbDtcbiAgICAgICAgbXVsdGlwbGUgPSBudWxsO1xuICAgICAgfSwgZGVsYXkpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBoYXNDbGFzcyhub2RlLCBjbGFzc05hbWUpIHtcbiAgICBpZiAoIW5vZGUuY2xhc3NOYW1lKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciB0ZW1wQ2xhc3MgPSAnICcgKyBub2RlLmNsYXNzTmFtZSArICcgJztcbiAgICBjbGFzc05hbWUgPSAnICcgKyBjbGFzc05hbWUgKyAnICc7XG5cbiAgICBpZiAodGVtcENsYXNzLmluZGV4T2YoY2xhc3NOYW1lKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuICAgIC8vIGNsYXNzIGlzIGFscmVhZHkgYWRkZWRcbiAgICBpZiAoaGFzQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSkge1xuICAgICAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lO1xuICAgIH1cblxuICAgIGlmIChub2RlLmNsYXNzTmFtZSkge1xuICAgICAgY2xhc3NOYW1lID0gJyAnICsgY2xhc3NOYW1lO1xuICAgIH1cblxuICAgIG5vZGUuY2xhc3NOYW1lICs9IGNsYXNzTmFtZTtcblxuICAgIHJldHVybiBub2RlLmNsYXNzTmFtZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuICAgIHZhciBzcGFjZUJlZm9yZSA9ICcgJyArIGNsYXNzTmFtZTtcbiAgICB2YXIgc3BhY2VBZnRlciA9IGNsYXNzTmFtZSArICcgJztcblxuICAgIGlmIChub2RlLmNsYXNzTmFtZS5pbmRleE9mKHNwYWNlQmVmb3JlKSAhPT0gLTEpIHtcbiAgICAgIG5vZGUuY2xhc3NOYW1lID0gbm9kZS5jbGFzc05hbWUucmVwbGFjZShzcGFjZUJlZm9yZSwgJycpO1xuICAgIH0gZWxzZSBpZiAobm9kZS5jbGFzc05hbWUuaW5kZXhPZihzcGFjZUFmdGVyKSAhPT0gLTEpIHtcbiAgICAgIG5vZGUuY2xhc3NOYW1lID0gbm9kZS5jbGFzc05hbWUucmVwbGFjZShzcGFjZUFmdGVyLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuY2xhc3NOYW1lID0gbm9kZS5jbGFzc05hbWUucmVwbGFjZShjbGFzc05hbWUsICcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZS5jbGFzc05hbWU7XG4gIH1cblxuICBmdW5jdGlvbiBkYXRhKG5vZGUsIGF0dHIpIHtcbiAgICByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGF0dHIpO1xuICB9XG5cbiAgLy8gbW9kZSBkZXRlY3Rpb24gYmFzZWQgb24gY29udGVudCB0eXBlIGFuZCBmaWxlIGV4dGVuc2lvblxuICB2YXIgZGVmYXVsdE1vZGVtYXAgPSB7XG4gICAgJ2h0bWwnOiAnaHRtbCcsXG4gICAgJ2Nzcyc6ICdjc3MnLFxuICAgICdqcyc6ICdqYXZhc2NyaXB0JyxcbiAgICAnbGVzcyc6ICdsZXNzJyxcbiAgICAnc3R5bCc6ICdzdHlsdXMnLFxuICAgICdjb2ZmZWUnOiAnY29mZmVlc2NyaXB0J1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldE1vZGUoKSB7XG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgIHZhciBmaWxlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgICB2YXIgY3VzdG9tTW9kZW1hcCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgICB2YXIgbW9kZW1hcCA9IGV4dGVuZChjdXN0b21Nb2RlbWFwLCBkZWZhdWx0TW9kZW1hcCk7XG5cbiAgICAvLyB0cnkgdGhlIGZpbGUgZXh0ZW5zaW9uXG4gICAgZm9yICh2YXIga2V5IGluIG1vZGVtYXApIHtcbiAgICAgIHZhciBrZXlMZW5ndGggPSBrZXkubGVuZ3RoO1xuICAgICAgaWYgKGZpbGUuc2xpY2UoLWtleUxlbmd0aCsrKSA9PT0gJy4nICsga2V5KSB7XG4gICAgICAgIHJldHVybiBtb2RlbWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdHJ5IHRoZSBmaWxlIHR5cGUgKGh0bWwvY3NzL2pzKVxuICAgIGZvciAodmFyIF9rZXkgaW4gbW9kZW1hcCkge1xuICAgICAgaWYgKHR5cGUgPT09IF9rZXkpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVtYXBbX2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICAvKiB0ZW1wbGF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBjb250YWluZXIoKSB7XG4gICAgcmV0dXJuICdcXG4gICAgPHVsIGNsYXNzPVwiam90dGVkLW5hdlwiPlxcbiAgICAgIDxsaSBjbGFzcz1cImpvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0tcmVzdWx0XCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJyZXN1bHRcIj5cXG4gICAgICAgICAgUmVzdWx0XFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLWh0bWxcIj5cXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1qb3R0ZWQtdHlwZT1cImh0bWxcIj5cXG4gICAgICAgICAgSFRNTFxcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1jc3NcIj5cXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1qb3R0ZWQtdHlwZT1cImNzc1wiPlxcbiAgICAgICAgICBDU1NcXG4gICAgICAgIDwvYT5cXG4gICAgICA8L2xpPlxcbiAgICAgIDxsaSBjbGFzcz1cImpvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0tanNcIj5cXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1qb3R0ZWQtdHlwZT1cImpzXCI+XFxuICAgICAgICAgIEphdmFTY3JpcHRcXG4gICAgICAgIDwvYT5cXG4gICAgICA8L2xpPlxcbiAgICA8L3VsPlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXBhbmUgam90dGVkLXBhbmUtcmVzdWx0XCI+PGlmcmFtZT48L2lmcmFtZT48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLWh0bWxcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLWNzc1wiPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXBhbmUgam90dGVkLXBhbmUtanNcIj48L2Rpdj5cXG4gICc7XG4gIH1cblxuICBmdW5jdGlvbiBwYW5lQWN0aXZlQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLXBhbmUtYWN0aXZlLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gY29udGFpbmVyQ2xhc3MoKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQnO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzRmlsZUNsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1oYXMtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBlZGl0b3JDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtZWRpdG9yIGpvdHRlZC1lZGl0b3ItJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBlZGl0b3JDb250ZW50KHR5cGUpIHtcbiAgICB2YXIgZmlsZVVybCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG5cbiAgICByZXR1cm4gJ1xcbiAgICA8dGV4dGFyZWEgZGF0YS1qb3R0ZWQtdHlwZT1cIicgKyB0eXBlICsgJ1wiIGRhdGEtam90dGVkLWZpbGU9XCInICsgZmlsZVVybCArICdcIj48L3RleHRhcmVhPlxcbiAgICA8ZGl2IGNsYXNzPVwiam90dGVkLXN0YXR1c1wiPjwvZGl2PlxcbiAgJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c01lc3NhZ2UoZXJyKSB7XG4gICAgcmV0dXJuICdcXG4gICAgPHA+JyArIGVyciArICc8L3A+XFxuICAnO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLXN0YXR1cy0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c0FjdGl2ZUNsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1zdGF0dXMtYWN0aXZlLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gcGx1Z2luQ2xhc3MobmFtZSkge1xuICAgIHJldHVybiAnam90dGVkLXBsdWdpbi0nICsgbmFtZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c0xvYWRpbmcodXJsKSB7XG4gICAgcmV0dXJuICdMb2FkaW5nIDxzdHJvbmc+JyArIHVybCArICc8L3N0cm9uZz4uLic7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNGZXRjaEVycm9yKHVybCkge1xuICAgIHJldHVybiAnVGhlcmUgd2FzIGFuIGVycm9yIGxvYWRpbmcgPHN0cm9uZz4nICsgdXJsICsgJzwvc3Ryb25nPi4nO1xuICB9XG5cbiAgdmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgfSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgfTtcblxuXG5cblxuXG4gIHZhciBhc3luY0dlbmVyYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBd2FpdFZhbHVlKHZhbHVlKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gQXN5bmNHZW5lcmF0b3IoZ2VuKSB7XG4gICAgICB2YXIgZnJvbnQsIGJhY2s7XG5cbiAgICAgIGZ1bmN0aW9uIHNlbmQoa2V5LCBhcmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgYXJnOiBhcmcsXG4gICAgICAgICAgICByZXNvbHZlOiByZXNvbHZlLFxuICAgICAgICAgICAgcmVqZWN0OiByZWplY3QsXG4gICAgICAgICAgICBuZXh0OiBudWxsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChiYWNrKSB7XG4gICAgICAgICAgICBiYWNrID0gYmFjay5uZXh0ID0gcmVxdWVzdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJvbnQgPSBiYWNrID0gcmVxdWVzdDtcbiAgICAgICAgICAgIHJlc3VtZShrZXksIGFyZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVzdW1lKGtleSwgYXJnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGdlbltrZXldKGFyZyk7XG4gICAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXdhaXRWYWx1ZSkge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlLnZhbHVlKS50aGVuKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgICAgcmVzdW1lKFwibmV4dFwiLCBhcmcpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgICByZXN1bWUoXCJ0aHJvd1wiLCBhcmcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldHRsZShyZXN1bHQuZG9uZSA/IFwicmV0dXJuXCIgOiBcIm5vcm1hbFwiLCByZXN1bHQudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgc2V0dGxlKFwidGhyb3dcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXR0bGUodHlwZSwgdmFsdWUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgY2FzZSBcInJldHVyblwiOlxuICAgICAgICAgICAgZnJvbnQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgZG9uZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJ0aHJvd1wiOlxuICAgICAgICAgICAgZnJvbnQucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGZyb250LnJlc29sdmUoe1xuICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgIGRvbmU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbnQgPSBmcm9udC5uZXh0O1xuXG4gICAgICAgIGlmIChmcm9udCkge1xuICAgICAgICAgIHJlc3VtZShmcm9udC5rZXksIGZyb250LmFyZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmFjayA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5faW52b2tlID0gc2VuZDtcblxuICAgICAgaWYgKHR5cGVvZiBnZW4ucmV0dXJuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5yZXR1cm4gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuYXN5bmNJdGVyYXRvcikge1xuICAgICAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgIH1cblxuICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShcIm5leHRcIiwgYXJnKTtcbiAgICB9O1xuXG4gICAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLnRocm93ID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShcInRocm93XCIsIGFyZyk7XG4gICAgfTtcblxuICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZS5yZXR1cm4gPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKFwicmV0dXJuXCIsIGFyZyk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICB3cmFwOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IEFzeW5jR2VuZXJhdG9yKGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIGF3YWl0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBd2FpdFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KCk7XG5cblxuXG5cblxuICB2YXIgY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICAgIH07XG4gIH0oKTtcblxuXG5cblxuXG5cblxuICB2YXIgZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gICAgfVxuICB9O1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiAgdmFyIHNldCA9IGZ1bmN0aW9uIHNldChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgc2V0KHBhcmVudCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgICBkZXNjLnZhbHVlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgICAgaWYgKHNldHRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNldHRlci5jYWxsKHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qIHBsdWdpblxuICAgKi9cblxuICB2YXIgcGx1Z2lucyA9IFtdO1xuXG4gIGZ1bmN0aW9uIGZpbmQkMShpZCkge1xuICAgIGZvciAodmFyIHBsdWdpbkluZGV4IGluIHBsdWdpbnMpIHtcbiAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW3BsdWdpbkluZGV4XTtcbiAgICAgIGlmIChwbHVnaW4uX2lkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gcGx1Z2luO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNhbid0IGZpbmQgcGx1Z2luXG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIGlkICsgJyBpcyBub3QgcmVnaXN0ZXJlZC4nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyKGlkLCBwbHVnaW4pIHtcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICBwbHVnaW4uX2lkID0gaWQ7XG4gICAgcGx1Z2lucy5wdXNoKHBsdWdpbik7XG4gIH1cblxuICAvLyBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgZWFjaCBwbHVnaW4sIG9uIHRoZSBqb3R0ZWQgaW5zdGFuY2VcbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5fZ2V0KCdvcHRpb25zJykucGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIC8vIGNoZWNrIGlmIHBsdWdpbiBkZWZpbml0aW9uIGlzIHN0cmluZyBvciBvYmplY3RcbiAgICAgIHZhciBQbHVnaW4gPSB2b2lkIDA7XG4gICAgICB2YXIgcGx1Z2luTmFtZSA9IHZvaWQgMDtcbiAgICAgIHZhciBwbHVnaW5PcHRpb25zID0ge307XG4gICAgICBpZiAodHlwZW9mIHBsdWdpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGx1Z2luTmFtZSA9IHBsdWdpbjtcbiAgICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBwbHVnaW4gPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHBsdWdpbikpID09PSAnb2JqZWN0Jykge1xuICAgICAgICBwbHVnaW5OYW1lID0gcGx1Z2luLm5hbWU7XG4gICAgICAgIHBsdWdpbk9wdGlvbnMgPSBwbHVnaW4ub3B0aW9ucyB8fCB7fTtcbiAgICAgIH1cblxuICAgICAgUGx1Z2luID0gZmluZCQxKHBsdWdpbk5hbWUpO1xuICAgICAgX3RoaXMuX2dldCgncGx1Z2lucycpW3BsdWdpbl0gPSBuZXcgUGx1Z2luKF90aGlzLCBwbHVnaW5PcHRpb25zKTtcblxuICAgICAgYWRkQ2xhc3MoX3RoaXMuX2dldCgnJGNvbnRhaW5lcicpLCBwbHVnaW5DbGFzcyhwbHVnaW5OYW1lKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBwdWJzb3VwXG4gICAqL1xuXG4gIHZhciBQdWJTb3VwID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFB1YlNvdXAoKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQdWJTb3VwKTtcblxuICAgICAgdGhpcy50b3BpY3MgPSB7fTtcbiAgICAgIHRoaXMuY2FsbGJhY2tzID0ge307XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUHViU291cCwgW3tcbiAgICAgIGtleTogJ2ZpbmQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmQocXVlcnkpIHtcbiAgICAgICAgdGhpcy50b3BpY3NbcXVlcnldID0gdGhpcy50b3BpY3NbcXVlcnldIHx8IFtdO1xuICAgICAgICByZXR1cm4gdGhpcy50b3BpY3NbcXVlcnldO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3N1YnNjcmliZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc3Vic2NyaWJlKHRvcGljLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBwcmlvcml0eSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogOTA7XG5cbiAgICAgICAgdmFyIGZvdW5kVG9waWMgPSB0aGlzLmZpbmQodG9waWMpO1xuICAgICAgICBzdWJzY3JpYmVyLl9wcmlvcml0eSA9IHByaW9yaXR5O1xuICAgICAgICBmb3VuZFRvcGljLnB1c2goc3Vic2NyaWJlcik7XG5cbiAgICAgICAgLy8gc29ydCBzdWJzY3JpYmVycyBvbiBwcmlvcml0eVxuICAgICAgICBmb3VuZFRvcGljLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYS5fcHJpb3JpdHkgPiBiLl9wcmlvcml0eSA/IDEgOiBiLl9wcmlvcml0eSA+IGEuX3ByaW9yaXR5ID8gLTEgOiAwO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlcyBhIGZ1bmN0aW9uIGZyb20gYW4gYXJyYXlcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlbW92ZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZXIoYXJyLCBmbikge1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gaWYgbm8gZm4gaXMgc3BlY2lmaWVkXG4gICAgICAgICAgLy8gY2xlYW4tdXAgdGhlIGFycmF5XG4gICAgICAgICAgaWYgKCFmbikge1xuICAgICAgICAgICAgYXJyLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZmluZCB0aGUgZm4gaW4gdGhlIGFyclxuICAgICAgICAgIHZhciBpbmRleCA9IFtdLmluZGV4T2YuY2FsbChhcnIsIGZuKTtcblxuICAgICAgICAgIC8vIHdlIGRpZG4ndCBmaW5kIGl0IGluIHRoZSBhcnJheVxuICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAndW5zdWJzY3JpYmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKHRvcGljLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBmcm9tIHN1YnNjcmliZXJzXG4gICAgICAgIHZhciBmb3VuZFRvcGljID0gdGhpcy5maW5kKHRvcGljKTtcbiAgICAgICAgdGhpcy5yZW1vdmVyKGZvdW5kVG9waWMsIHN1YnNjcmliZXIpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBmcm9tIGNhbGxiYWNrc1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1t0b3BpY10gPSB0aGlzLmNhbGxiYWNrc1t0b3BpY10gfHwgW107XG4gICAgICAgIHRoaXMucmVtb3Zlcih0aGlzLmNhbGxiYWNrc1t0b3BpY10sIHN1YnNjcmliZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBzZXF1ZW50aWFsbHkgcnVucyBhIG1ldGhvZCBvbiBhbGwgcGx1Z2luc1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncHVibGlzaCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcHVibGlzaCh0b3BpYykge1xuICAgICAgICB2YXIgcGFyYW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICAgICAgICB2YXIgZm91bmRUb3BpYyA9IHRoaXMuZmluZCh0b3BpYyk7XG4gICAgICAgIHZhciBydW5MaXN0ID0gW107XG5cbiAgICAgICAgZm91bmRUb3BpYy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgICAgcnVuTGlzdC5wdXNoKHN1YnNjcmliZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXEocnVuTGlzdCwgcGFyYW1zLCB0aGlzLnJ1bkNhbGxiYWNrcyh0b3BpYykpO1xuICAgICAgfVxuXG4gICAgICAvLyBwYXJhbGxlbCBydW4gYWxsIC5kb25lIGNhbGxiYWNrc1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncnVuQ2FsbGJhY2tzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBydW5DYWxsYmFja3ModG9waWMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGVyciwgcGFyYW1zKSB7XG4gICAgICAgICAgX3RoaXMuY2FsbGJhY2tzW3RvcGljXSA9IF90aGlzLmNhbGxiYWNrc1t0b3BpY10gfHwgW107XG5cbiAgICAgICAgICBfdGhpcy5jYWxsYmFja3NbdG9waWNdLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIGMoZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBhdHRhY2ggYSBjYWxsYmFjayB3aGVuIGEgcHVibGlzaFt0b3BpY10gaXMgZG9uZVxuXG4gICAgfSwge1xuICAgICAga2V5OiAnZG9uZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZG9uZSh0b3BpYykge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3RvcGljXSA9IHRoaXMuY2FsbGJhY2tzW3RvcGljXSB8fCBbXTtcbiAgICAgICAgdGhpcy5jYWxsYmFja3NbdG9waWNdLnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUHViU291cDtcbiAgfSgpO1xuXG4gIC8qIHJlbmRlciBwbHVnaW5cbiAgICogcmVuZGVycyB0aGUgaWZyYW1lXG4gICAqL1xuXG4gIHZhciBQbHVnaW5SZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luUmVuZGVyKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luUmVuZGVyKTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGlmcmFtZSBzcmNkb2Mgc3VwcG9ydFxuICAgICAgdmFyIHN1cHBvcnRTcmNkb2MgPSAhISgnc3JjZG9jJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKSk7XG4gICAgICB2YXIgJHJlc3VsdEZyYW1lID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLXJlc3VsdCBpZnJhbWUnKTtcblxuICAgICAgdmFyIGZyYW1lQ29udGVudCA9ICcnO1xuXG4gICAgICAvLyBjYWNoZWQgY29udGVudFxuICAgICAgdmFyIGNvbnRlbnQgPSB7XG4gICAgICAgIGh0bWw6ICcnLFxuICAgICAgICBjc3M6ICcnLFxuICAgICAgICBqczogJydcbiAgICAgIH07XG5cbiAgICAgIC8vIGNhdGNoIGRvbXJlYWR5IGV2ZW50cyBmcm9tIHRoZSBpZnJhbWVcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5kb21yZWFkeS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gcmVuZGVyIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIDEwMCk7XG5cbiAgICAgIC8vIHB1YmxpY1xuICAgICAgdGhpcy5zdXBwb3J0U3JjZG9jID0gc3VwcG9ydFNyY2RvYztcbiAgICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgICB0aGlzLmZyYW1lQ29udGVudCA9IGZyYW1lQ29udGVudDtcbiAgICAgIHRoaXMuJHJlc3VsdEZyYW1lID0gJHJlc3VsdEZyYW1lO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgICAgdGhpcy5pbmRleCA9IDA7XG5cbiAgICAgIHRoaXMubGFzdENhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luUmVuZGVyLCBbe1xuICAgICAga2V5OiAndGVtcGxhdGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICAgICAgICB2YXIgc3R5bGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgICAgICB2YXIgYm9keSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG4gICAgICAgIHZhciBzY3JpcHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6ICcnO1xuXG4gICAgICAgIHJldHVybiAnXFxuICAgICAgPCFkb2N0eXBlIGh0bWw+XFxuICAgICAgPGh0bWw+XFxuICAgICAgICA8aGVhZD5cXG4gICAgICAgICAgPHNjcmlwdD5cXG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xcbiAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXFwnRE9NQ29udGVudExvYWRlZFxcJywgZnVuY3Rpb24gKCkge1xcbiAgICAgICAgICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHtcXG4gICAgICAgICAgICAgICAgICB0eXBlOiBcXCdqb3R0ZWQtZG9tLXJlYWR5XFwnXFxuICAgICAgICAgICAgICAgIH0pLCBcXCcqXFwnKVxcbiAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICB9KCkpXFxuICAgICAgICAgIDwvc2NyaXB0PlxcblxcbiAgICAgICAgICA8c3R5bGU+JyArIHN0eWxlICsgJzwvc3R5bGU+XFxuICAgICAgICA8L2hlYWQ+XFxuICAgICAgICA8Ym9keT5cXG4gICAgICAgICAgJyArIGJvZHkgKyAnXFxuXFxuICAgICAgICAgIDwhLS1cXG4gICAgICAgICAgICBKb3R0ZWQ6XFxuICAgICAgICAgICAgRW1wdHkgc2NyaXB0IHRhZyBwcmV2ZW50cyBtYWxmb3JtZWQgSFRNTCBmcm9tIGJyZWFraW5nIHRoZSBuZXh0IHNjcmlwdC5cXG4gICAgICAgICAgLS0+XFxuICAgICAgICAgIDxzY3JpcHQ+PC9zY3JpcHQ+XFxuICAgICAgICAgIDxzY3JpcHQ+JyArIHNjcmlwdCArICc8L3NjcmlwdD5cXG4gICAgICAgIDwvYm9keT5cXG4gICAgICA8L2h0bWw+XFxuICAgICc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIC8vIGNhY2hlIG1hbmlwdWxhdGVkIGNvbnRlbnRcbiAgICAgICAgdGhpcy5jb250ZW50W3BhcmFtcy50eXBlXSA9IHBhcmFtcy5jb250ZW50O1xuXG4gICAgICAgIC8vIGNoZWNrIGV4aXN0aW5nIGFuZCB0by1iZS1yZW5kZXJlZCBjb250ZW50XG4gICAgICAgIHZhciBvbGRGcmFtZUNvbnRlbnQgPSB0aGlzLmZyYW1lQ29udGVudDtcbiAgICAgICAgdGhpcy5mcmFtZUNvbnRlbnQgPSB0aGlzLnRlbXBsYXRlKHRoaXMuY29udGVudFsnY3NzJ10sIHRoaXMuY29udGVudFsnaHRtbCddLCB0aGlzLmNvbnRlbnRbJ2pzJ10pO1xuXG4gICAgICAgIC8vIGNhY2hlIHRoZSBjdXJyZW50IGNhbGxiYWNrIGFzIGdsb2JhbCxcbiAgICAgICAgLy8gc28gd2UgY2FuIGNhbGwgaXQgZnJvbSB0aGUgbWVzc2FnZSBjYWxsYmFjay5cbiAgICAgICAgdGhpcy5sYXN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMubGFzdENhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGRvbid0IHJlbmRlciBpZiBwcmV2aW91cyBhbmQgbmV3IGZyYW1lIGNvbnRlbnQgYXJlIHRoZSBzYW1lLlxuICAgICAgICAvLyBtb3N0bHkgZm9yIHRoZSBgcGxheWAgcGx1Z2luLFxuICAgICAgICAvLyBzbyB3ZSBkb24ndCByZS1yZW5kZXIgdGhlIHNhbWUgY29udGVudCBvbiBlYWNoIGNoYW5nZS5cbiAgICAgICAgLy8gdW5sZXNzIHdlIHNldCBmb3JjZVJlbmRlci5cbiAgICAgICAgaWYgKHBhcmFtcy5mb3JjZVJlbmRlciAhPT0gdHJ1ZSAmJiB0aGlzLmZyYW1lQ29udGVudCA9PT0gb2xkRnJhbWVDb250ZW50KSB7XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdXBwb3J0U3JjZG9jKSB7XG4gICAgICAgICAgLy8gc3JjZG9jIGluIHVucmVsaWFibGUgaW4gQ2hyb21lLlxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9naGluZGEvam90dGVkL2lzc3Vlcy8yM1xuXG4gICAgICAgICAgLy8gcmUtY3JlYXRlIHRoZSBpZnJhbWUgb24gZWFjaCBjaGFuZ2UsXG4gICAgICAgICAgLy8gdG8gZGlzY2FyZCB0aGUgcHJldmlvdXNseSBsb2FkZWQgc2NyaXB0cy5cbiAgICAgICAgICB2YXIgJG5ld1Jlc3VsdEZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoJG5ld1Jlc3VsdEZyYW1lLCB0aGlzLiRyZXN1bHRGcmFtZSk7XG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUgPSAkbmV3UmVzdWx0RnJhbWU7XG5cbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50Lm9wZW4oKTtcbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LndyaXRlKHRoaXMuZnJhbWVDb250ZW50KTtcbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNsb3NlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gb2xkZXIgYnJvd3NlcnMgd2l0aG91dCBpZnJhbWUgc3Jjc2V0IHN1cHBvcnQgKElFOSkuXG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuc2V0QXR0cmlidXRlKCdkYXRhLXNyY2RvYycsIHRoaXMuZnJhbWVDb250ZW50KTtcblxuICAgICAgICAgIC8vIHRpcHMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vanVnZ2xpbm1pa2Uvc3JjZG9jLXBvbHlmaWxsXG4gICAgICAgICAgLy8gQ29weXJpZ2h0IChjKSAyMDEyIE1pa2UgUGVubmlzaVxuICAgICAgICAgIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAgICAgICAgICB2YXIganNVcmwgPSAnamF2YXNjcmlwdDp3aW5kb3cuZnJhbWVFbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtc3JjZG9jXCIpOyc7XG5cbiAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIGpzVXJsKTtcblxuICAgICAgICAgIC8vIEV4cGxpY2l0bHkgc2V0IHRoZSBpRnJhbWUncyB3aW5kb3cubG9jYXRpb24gZm9yXG4gICAgICAgICAgLy8gY29tcGF0aWJpbGl0eSB3aXRoIElFOSwgd2hpY2ggZG9lcyBub3QgcmVhY3QgdG8gY2hhbmdlcyBpblxuICAgICAgICAgIC8vIHRoZSBgc3JjYCBhdHRyaWJ1dGUgd2hlbiBpdCBpcyBhIGBqYXZhc2NyaXB0OmAgVVJMLlxuICAgICAgICAgIGlmICh0aGlzLiRyZXN1bHRGcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLiRyZXN1bHRGcmFtZS5jb250ZW50V2luZG93LmxvY2F0aW9uID0ganNVcmw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnZG9tcmVhZHknLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRvbXJlYWR5KGUpIHtcbiAgICAgICAgLy8gb25seSBjYXRjaCBtZXNzYWdlcyBmcm9tIHRoZSBpZnJhbWVcbiAgICAgICAgaWYgKGUuc291cmNlICE9PSB0aGlzLiRyZXN1bHRGcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEkJDEgPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhJCQxID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgICAgIGlmIChkYXRhJCQxLnR5cGUgPT09ICdqb3R0ZWQtZG9tLXJlYWR5Jykge1xuICAgICAgICAgIHRoaXMubGFzdENhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpblJlbmRlcjtcbiAgfSgpO1xuXG4gIC8qIHNjcmlwdGxlc3MgcGx1Z2luXG4gICAqIHJlbW92ZXMgc2NyaXB0IHRhZ3MgZnJvbSBodG1sIGNvbnRlbnRcbiAgICovXG5cbiAgdmFyIFBsdWdpblNjcmlwdGxlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luU2NyaXB0bGVzcyhqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpblNjcmlwdGxlc3MpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc2NyaXB0aW5nLmh0bWxcbiAgICAgIHZhciBydW5TY3JpcHRUeXBlcyA9IFsnYXBwbGljYXRpb24vamF2YXNjcmlwdCcsICdhcHBsaWNhdGlvbi9lY21hc2NyaXB0JywgJ2FwcGxpY2F0aW9uL3gtZWNtYXNjcmlwdCcsICdhcHBsaWNhdGlvbi94LWphdmFzY3JpcHQnLCAndGV4dC9lY21hc2NyaXB0JywgJ3RleHQvamF2YXNjcmlwdCcsICd0ZXh0L2phdmFzY3JpcHQxLjAnLCAndGV4dC9qYXZhc2NyaXB0MS4xJywgJ3RleHQvamF2YXNjcmlwdDEuMicsICd0ZXh0L2phdmFzY3JpcHQxLjMnLCAndGV4dC9qYXZhc2NyaXB0MS40JywgJ3RleHQvamF2YXNjcmlwdDEuNScsICd0ZXh0L2pzY3JpcHQnLCAndGV4dC9saXZlc2NyaXB0JywgJ3RleHQveC1lY21hc2NyaXB0JywgJ3RleHQveC1qYXZhc2NyaXB0J107XG5cbiAgICAgIC8vIHJlbW92ZSBzY3JpcHQgdGFncyBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gcHVibGljXG4gICAgICB0aGlzLnJ1blNjcmlwdFR5cGVzID0gcnVuU2NyaXB0VHlwZXM7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luU2NyaXB0bGVzcywgW3tcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnaHRtbCcpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvciBJRTkgc3VwcG9ydCwgcmVtb3ZlIHRoZSBzY3JpcHQgdGFncyBmcm9tIEhUTUwgY29udGVudC5cbiAgICAgICAgLy8gd2hlbiB3ZSBzdG9wIHN1cHBvcnRpbmcgSUU5LCB3ZSBjYW4gdXNlIHRoZSBzYW5kYm94IGF0dHJpYnV0ZS5cbiAgICAgICAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGZyYWdtZW50LmlubmVySFRNTCA9IHBhcmFtcy5jb250ZW50O1xuXG4gICAgICAgIHZhciB0eXBlQXR0ciA9IG51bGw7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBzY3JpcHQgdGFnc1xuICAgICAgICB2YXIgJHNjcmlwdHMgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHQnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NyaXB0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHR5cGVBdHRyID0gJHNjcmlwdHNbaV0uZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG5cbiAgICAgICAgICAvLyBvbmx5IHJlbW92ZSBzY3JpcHQgdGFncyB3aXRob3V0IHRoZSB0eXBlIGF0dHJpYnV0ZVxuICAgICAgICAgIC8vIG9yIHdpdGggYSBqYXZhc2NyaXB0IG1pbWUgYXR0cmlidXRlIHZhbHVlLlxuICAgICAgICAgIC8vIHRoZSBvbmVzIHRoYXQgYXJlIHJ1biBieSB0aGUgYnJvd3Nlci5cbiAgICAgICAgICBpZiAoIXR5cGVBdHRyIHx8IHRoaXMucnVuU2NyaXB0VHlwZXMuaW5kZXhPZih0eXBlQXR0cikgIT09IC0xKSB7XG4gICAgICAgICAgICAkc2NyaXB0c1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCRzY3JpcHRzW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbXMuY29udGVudCA9IGZyYWdtZW50LmlubmVySFRNTDtcblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luU2NyaXB0bGVzcztcbiAgfSgpO1xuXG4gIC8qIGFjZSBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5BY2Uoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5BY2UpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAxO1xuICAgICAgdmFyIGk7XG5cbiAgICAgIHRoaXMuZWRpdG9yID0ge307XG4gICAgICB0aGlzLmpvdHRlZCA9IGpvdHRlZDtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIEFjZSBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LmFjZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgJGVkaXRvcnMgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuam90dGVkLWVkaXRvcicpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgJGVkaXRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyICR0ZXh0YXJlYSA9ICRlZGl0b3JzW2ldLnF1ZXJ5U2VsZWN0b3IoJ3RleHRhcmVhJyk7XG4gICAgICAgIHZhciB0eXBlID0gZGF0YSgkdGV4dGFyZWEsICdqb3R0ZWQtdHlwZScpO1xuICAgICAgICB2YXIgZmlsZSA9IGRhdGEoJHRleHRhcmVhLCAnam90dGVkLWZpbGUnKTtcblxuICAgICAgICB2YXIgJGFjZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAkZWRpdG9yc1tpXS5hcHBlbmRDaGlsZCgkYWNlQ29udGFpbmVyKTtcblxuICAgICAgICB0aGlzLmVkaXRvclt0eXBlXSA9IHdpbmRvdy5hY2UuZWRpdCgkYWNlQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIGVkaXRvciA9IHRoaXMuZWRpdG9yW3R5cGVdO1xuXG4gICAgICAgIHZhciBlZGl0b3JPcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMpO1xuXG4gICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZSgnYWNlL21vZGUvJyArIGdldE1vZGUodHlwZSwgZmlsZSkpO1xuICAgICAgICBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE9wdGlvbnMoZWRpdG9yT3B0aW9ucyk7XG5cbiAgICAgICAgZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgfVxuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5BY2UsIFt7XG4gICAgICBrZXk6ICdlZGl0b3JDaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRvckNoYW5nZShwYXJhbXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLmpvdHRlZC50cmlnZ2VyKCdjaGFuZ2UnLCBwYXJhbXMpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGVkaXRvciA9IHRoaXMuZWRpdG9yW3BhcmFtcy50eXBlXTtcblxuICAgICAgICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IHN0YXJ0ZWQgYnkgdGhlIGFjZSBjaGFuZ2UuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBvbmx5IG9uY2UgcGVyIGVkaXRvcixcbiAgICAgICAgLy8gd2hlbiB0aGUgdGV4dGFyZWEgaXMgcG9wdWxhdGVkL2ZpbGUgaXMgbG9hZGVkLlxuICAgICAgICBpZiAoIXBhcmFtcy5hY2VFZGl0b3IpIHtcbiAgICAgICAgICBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldFZhbHVlKHBhcmFtcy5jb250ZW50KTtcblxuICAgICAgICAgIC8vIGF0dGFjaCB0aGUgZXZlbnQgb25seSBhZnRlciB0aGUgZmlsZSBpcyBsb2FkZWRcbiAgICAgICAgICBwYXJhbXMuYWNlRWRpdG9yID0gZWRpdG9yO1xuICAgICAgICAgIGVkaXRvci5vbignY2hhbmdlJywgdGhpcy5lZGl0b3JDaGFuZ2UocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYW5pcHVsYXRlIHRoZSBwYXJhbXMgYW5kIHBhc3MgdGhlbSBvblxuICAgICAgICBwYXJhbXMuY29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQWNlO1xuICB9KCk7XG5cbiAgLyogY29yZW1pcnJvciBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkNvZGVNaXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQ29kZU1pcnJvcihqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkNvZGVNaXJyb3IpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAxO1xuICAgICAgdmFyIGk7XG5cbiAgICAgIHRoaXMuZWRpdG9yID0ge307XG4gICAgICB0aGlzLmpvdHRlZCA9IGpvdHRlZDtcblxuICAgICAgLy8gY3VzdG9tIG1vZGVtYXAgZm9yIGNvZGVtaXJyb3JcbiAgICAgIHZhciBtb2RlbWFwID0ge1xuICAgICAgICAnaHRtbCc6ICdodG1sbWl4ZWQnXG4gICAgICB9O1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgbGluZU51bWJlcnM6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICAvLyBjaGVjayBpZiBDb2RlTWlycm9yIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuQ29kZU1pcnJvciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgJGVkaXRvcnMgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuam90dGVkLWVkaXRvcicpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgJGVkaXRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyICR0ZXh0YXJlYSA9ICRlZGl0b3JzW2ldLnF1ZXJ5U2VsZWN0b3IoJ3RleHRhcmVhJyk7XG4gICAgICAgIHZhciB0eXBlID0gZGF0YSgkdGV4dGFyZWEsICdqb3R0ZWQtdHlwZScpO1xuICAgICAgICB2YXIgZmlsZSA9IGRhdGEoJHRleHRhcmVhLCAnam90dGVkLWZpbGUnKTtcblxuICAgICAgICB0aGlzLmVkaXRvclt0eXBlXSA9IHdpbmRvdy5Db2RlTWlycm9yLmZyb21UZXh0QXJlYSgkdGV4dGFyZWEsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVkaXRvclt0eXBlXS5zZXRPcHRpb24oJ21vZGUnLCBnZXRNb2RlKHR5cGUsIGZpbGUsIG1vZGVtYXApKTtcbiAgICAgIH1cblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQ29kZU1pcnJvciwgW3tcbiAgICAgIGtleTogJ2VkaXRvckNoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZWRpdG9yQ2hhbmdlKHBhcmFtcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gdHJpZ2dlciBhIGNoYW5nZSBldmVudFxuICAgICAgICAgIF90aGlzLmpvdHRlZC50cmlnZ2VyKCdjaGFuZ2UnLCBwYXJhbXMpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGVkaXRvciA9IHRoaXMuZWRpdG9yW3BhcmFtcy50eXBlXTtcblxuICAgICAgICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IHN0YXJ0ZWQgYnkgdGhlIGNvZGVtaXJyb3IgY2hhbmdlLlxuICAgICAgICAvLyB0cmlnZ2VyZWQgb25seSBvbmNlIHBlciBlZGl0b3IsXG4gICAgICAgIC8vIHdoZW4gdGhlIHRleHRhcmVhIGlzIHBvcHVsYXRlZC9maWxlIGlzIGxvYWRlZC5cbiAgICAgICAgaWYgKCFwYXJhbXMuY21FZGl0b3IpIHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUocGFyYW1zLmNvbnRlbnQpO1xuXG4gICAgICAgICAgLy8gYXR0YWNoIHRoZSBldmVudCBvbmx5IGFmdGVyIHRoZSBmaWxlIGlzIGxvYWRlZFxuICAgICAgICAgIHBhcmFtcy5jbUVkaXRvciA9IGVkaXRvcjtcbiAgICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIHRoaXMuZWRpdG9yQ2hhbmdlKHBhcmFtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFuaXB1bGF0ZSB0aGUgcGFyYW1zIGFuZCBwYXNzIHRoZW0gb25cbiAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkNvZGVNaXJyb3I7XG4gIH0oKTtcblxuICAvKiBsZXNzIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luTGVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5MZXNzKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luTGVzcyk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgbGVzcyBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93Lmxlc3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIENTUyBsaW5rIGxhYmVsIHRvIExlc3NcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImNzc1wiXScpLmlubmVySFRNTCA9ICdMZXNzJztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luTGVzcywgW3tcbiAgICAgIGtleTogJ2lzTGVzcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaXNMZXNzKHBhcmFtcykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdjc3MnKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5maWxlLmluZGV4T2YoJy5sZXNzJykgIT09IC0xIHx8IHBhcmFtcy5maWxlID09PSAnJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UgLmxlc3MgYW5kIGJsYW5rIGZpbGVzXG4gICAgICAgIGlmICh0aGlzLmlzTGVzcyhwYXJhbXMpKSB7XG4gICAgICAgICAgd2luZG93Lmxlc3MucmVuZGVyKHBhcmFtcy5jb250ZW50LCB0aGlzLm9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgY29udGVudCB3aXRoIHRoZSBwYXJzZWQgbGVzc1xuICAgICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHJlcy5jc3M7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luTGVzcztcbiAgfSgpO1xuXG4gIC8qIGNvZmZlZXNjcmlwdCBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkNvZmZlZVNjcmlwdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5Db2ZmZWVTY3JpcHQoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5Db2ZmZWVTY3JpcHQpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGNvZmZlZXNjcmlwdCBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LkNvZmZlZVNjcmlwdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGFuZ2UgSlMgbGluayBsYWJlbCB0byBMZXNzXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJqc1wiXScpLmlubmVySFRNTCA9ICdDb2ZmZWVTY3JpcHQnO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5Db2ZmZWVTY3JpcHQsIFt7XG4gICAgICBrZXk6ICdpc0NvZmZlZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaXNDb2ZmZWUocGFyYW1zKSB7XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2pzJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMuZmlsZS5pbmRleE9mKCcuY29mZmVlJykgIT09IC0xIHx8IHBhcmFtcy5maWxlID09PSAnJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UgLmxlc3MgYW5kIGJsYW5rIGZpbGVzXG4gICAgICAgIGlmICh0aGlzLmlzQ29mZmVlKHBhcmFtcykpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSB3aW5kb3cuQ29mZmVlU2NyaXB0LmNvbXBpbGUocGFyYW1zLmNvbnRlbnQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luQ29mZmVlU2NyaXB0O1xuICB9KCk7XG5cbiAgLyogc3R5bHVzIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luU3R5bHVzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblN0eWx1cyhqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpblN0eWx1cyk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgc3R5bHVzIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuc3R5bHVzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBDU1MgbGluayBsYWJlbCB0byBTdHlsdXNcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImNzc1wiXScpLmlubmVySFRNTCA9ICdTdHlsdXMnO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5TdHlsdXMsIFt7XG4gICAgICBrZXk6ICdpc1N0eWx1cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaXNTdHlsdXMocGFyYW1zKSB7XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2NzcycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zLmZpbGUuaW5kZXhPZignLnN0eWwnKSAhPT0gLTEgfHwgcGFyYW1zLmZpbGUgPT09ICcnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSAuc3R5bCBhbmQgYmxhbmsgZmlsZXNcbiAgICAgICAgaWYgKHRoaXMuaXNTdHlsdXMocGFyYW1zKSkge1xuICAgICAgICAgIHdpbmRvdy5zdHlsdXMocGFyYW1zLmNvbnRlbnQsIHRoaXMub3B0aW9ucykucmVuZGVyKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgY29udGVudCB3aXRoIHRoZSBwYXJzZWQgbGVzc1xuICAgICAgICAgICAgICBwYXJhbXMuY29udGVudCA9IHJlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5TdHlsdXM7XG4gIH0oKTtcblxuICAvKiBiYWJlbCBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkJhYmVsID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkJhYmVsKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQmFiZWwpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHt9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgYmFiZWwgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5CYWJlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdXNpbmcgYmFiZWwtc3RhbmRhbG9uZVxuICAgICAgICB0aGlzLmJhYmVsID0gd2luZG93LkJhYmVsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93LmJhYmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyB1c2luZyBicm93c2VyLmpzIGZyb20gYmFiZWwtY29yZSA1LnhcbiAgICAgICAgdGhpcy5iYWJlbCA9IHtcbiAgICAgICAgICB0cmFuc2Zvcm06IHdpbmRvdy5iYWJlbFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGFuZ2UganMgbGluayBsYWJlbFxuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwianNcIl0nKS5pbm5lckhUTUwgPSAnRVMyMDE1JztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQmFiZWwsIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UganMgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdqcycpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSB0aGlzLmJhYmVsLnRyYW5zZm9ybShwYXJhbXMuY29udGVudCwgdGhpcy5vcHRpb25zKS5jb2RlO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkJhYmVsO1xuICB9KCk7XG5cbiAgLyogbWFya2Rvd24gcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5NYXJrZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5NYXJrZG93bihqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbk1hcmtkb3duKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIG1hcmtlZCBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm1hcmtlZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB3aW5kb3cubWFya2VkLnNldE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgIC8vIGNoYW5nZSBodG1sIGxpbmsgbGFiZWxcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImh0bWxcIl0nKS5pbm5lckhUTUwgPSAnTWFya2Rvd24nO1xuXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5NYXJrZG93biwgW3tcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSBodG1sIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnaHRtbCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSB3aW5kb3cubWFya2VkKHBhcmFtcy5jb250ZW50KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5NYXJrZG93bjtcbiAgfSgpO1xuXG4gIC8qIGNvbnNvbGUgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5Db25zb2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkNvbnNvbGUoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5Db25zb2xlKTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIGF1dG9DbGVhcjogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAzMDtcbiAgICAgIHZhciBoaXN0b3J5ID0gW107XG4gICAgICB2YXIgaGlzdG9yeUluZGV4ID0gMDtcbiAgICAgIHZhciBsb2dDYXB0dXJlU25pcHBldCA9ICcoJyArIHRoaXMuY2FwdHVyZS50b1N0cmluZygpICsgJykoKTsnO1xuICAgICAgdmFyIGNvbnRlbnRDYWNoZSA9IHtcbiAgICAgICAgaHRtbDogJycsXG4gICAgICAgIGNzczogJycsXG4gICAgICAgIGpzOiAnJ1xuICAgICAgfTtcblxuICAgICAgLy8gbmV3IHRhYiBhbmQgcGFuZSBtYXJrdXBcbiAgICAgIHZhciAkbmF2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGFkZENsYXNzKCRuYXYsICdqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLWNvbnNvbGUnKTtcbiAgICAgICRuYXYuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCIjXCIgZGF0YS1qb3R0ZWQtdHlwZT1cImNvbnNvbGVcIj5KUyBDb25zb2xlPC9hPic7XG5cbiAgICAgIHZhciAkcGFuZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgYWRkQ2xhc3MoJHBhbmUsICdqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1jb25zb2xlJyk7XG5cbiAgICAgICRwYW5lLmlubmVySFRNTCA9ICdcXG4gICAgICA8ZGl2IGNsYXNzPVwiam90dGVkLWNvbnNvbGUtY29udGFpbmVyXCI+XFxuICAgICAgICA8dWwgY2xhc3M9XCJqb3R0ZWQtY29uc29sZS1vdXRwdXRcIj48L3VsPlxcbiAgICAgICAgPGZvcm0gY2xhc3M9XCJqb3R0ZWQtY29uc29sZS1pbnB1dFwiPlxcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIj5cXG4gICAgICAgIDwvZm9ybT5cXG4gICAgICA8L2Rpdj5cXG4gICAgICA8YnV0dG9uIGNsYXNzPVwiam90dGVkLWJ1dHRvbiBqb3R0ZWQtY29uc29sZS1jbGVhclwiPkNsZWFyPC9idXR0b24+XFxuICAgICc7XG5cbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLmFwcGVuZENoaWxkKCRwYW5lKTtcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtbmF2JykuYXBwZW5kQ2hpbGQoJG5hdik7XG5cbiAgICAgIHZhciAkY29udGFpbmVyID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLWNvbnRhaW5lcicpO1xuICAgICAgdmFyICRvdXRwdXQgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtb3V0cHV0Jyk7XG4gICAgICB2YXIgJGlucHV0ID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLWlucHV0IGlucHV0Jyk7XG4gICAgICB2YXIgJGlucHV0Rm9ybSA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1pbnB1dCcpO1xuICAgICAgdmFyICRjbGVhciA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1jbGVhcicpO1xuXG4gICAgICAvLyBzdWJtaXQgdGhlIGlucHV0IGZvcm1cbiAgICAgICRpbnB1dEZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdGhpcy5zdWJtaXQuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGNvbnNvbGUgaGlzdG9yeVxuICAgICAgJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmhpc3RvcnkuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGNsZWFyIGJ1dHRvblxuICAgICAgJGNsZWFyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGVhci5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gY2xlYXIgdGhlIGNvbnNvbGUgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGlmIChvcHRpb25zLmF1dG9DbGVhciA9PT0gdHJ1ZSkge1xuICAgICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuYXV0b0NsZWFyLmJpbmQodGhpcyksIHByaW9yaXR5IC0gMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhcHR1cmUgdGhlIGNvbnNvbGUgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuXG4gICAgICAvLyBnZXQgbG9nIGV2ZW50cyBmcm9tIHRoZSBpZnJhbWVcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5nZXRNZXNzYWdlLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBwbHVnaW4gcHVibGljIHByb3BlcnRpZXNcbiAgICAgIHRoaXMuJGpvdHRlZENvbnRhaW5lciA9IGpvdHRlZC4kY29udGFpbmVyO1xuICAgICAgdGhpcy4kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcbiAgICAgIHRoaXMuJGlucHV0ID0gJGlucHV0O1xuICAgICAgdGhpcy4kb3V0cHV0ID0gJG91dHB1dDtcbiAgICAgIHRoaXMuaGlzdG9yeSA9IGhpc3Rvcnk7XG4gICAgICB0aGlzLmhpc3RvcnlJbmRleCA9IGhpc3RvcnlJbmRleDtcbiAgICAgIHRoaXMubG9nQ2FwdHVyZVNuaXBwZXQgPSBsb2dDYXB0dXJlU25pcHBldDtcbiAgICAgIHRoaXMuY29udGVudENhY2hlID0gY29udGVudENhY2hlO1xuICAgICAgdGhpcy5nZXRJZnJhbWUgPSB0aGlzLmdldElmcmFtZS5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkNvbnNvbGUsIFt7XG4gICAgICBrZXk6ICdnZXRJZnJhbWUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldElmcmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGpvdHRlZENvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXBhbmUtcmVzdWx0IGlmcmFtZScpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2dldE1lc3NhZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1lc3NhZ2UoZSkge1xuICAgICAgICAvLyBvbmx5IGNhdGNoIG1lc3NhZ2VzIGZyb20gdGhlIGlmcmFtZVxuICAgICAgICBpZiAoZS5zb3VyY2UgIT09IHRoaXMuZ2V0SWZyYW1lKCkuY29udGVudFdpbmRvdykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhJCQxID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSQkMSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuXG4gICAgICAgIGlmIChkYXRhJCQxLnR5cGUgPT09ICdqb3R0ZWQtY29uc29sZS1sb2cnKSB7XG4gICAgICAgICAgdGhpcy5sb2coZGF0YSQkMS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2F1dG9DbGVhcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gYXV0b0NsZWFyKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNuaXBwZXRsZXNzQ29udGVudCA9IHBhcmFtcy5jb250ZW50O1xuXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgc25pcHBldCBmcm9tIGNhY2hlZCBqcyBjb250ZW50XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2pzJykge1xuICAgICAgICAgIHNuaXBwZXRsZXNzQ29udGVudCA9IHNuaXBwZXRsZXNzQ29udGVudC5yZXBsYWNlKHRoaXMubG9nQ2FwdHVyZVNuaXBwZXQsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvciBjb21wYXRpYmlsaXR5IHdpdGggdGhlIFBsYXkgcGx1Z2luLFxuICAgICAgICAvLyBjbGVhciB0aGUgY29uc29sZSBvbmx5IGlmIHNvbWV0aGluZyBoYXMgY2hhbmdlZCBvciBmb3JjZSByZW5kZXJpbmcuXG4gICAgICAgIGlmIChwYXJhbXMuZm9yY2VSZW5kZXIgPT09IHRydWUgfHwgdGhpcy5jb250ZW50Q2FjaGVbcGFyYW1zLnR5cGVdICE9PSBzbmlwcGV0bGVzc0NvbnRlbnQpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhbHdheXMgY2FjaGUgdGhlIGxhdGVzdCBjb250ZW50XG4gICAgICAgIHRoaXMuY29udGVudENhY2hlW3BhcmFtcy50eXBlXSA9IHNuaXBwZXRsZXNzQ29udGVudDtcblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gb25seSBwYXJzZSBqcyBjb250ZW50XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2pzJykge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHNuaXBwZXQgaXMgYWxyZWFkeSBhZGRlZC5cbiAgICAgICAgLy8gdGhlIFBsYXkgcGx1Z2luIGNhY2hlcyB0aGUgY2hhbmdlZCBwYXJhbXMgYW5kIHRyaWdnZXJzIGNoYW5nZVxuICAgICAgICAvLyB3aXRoIHRoZSBjYWNoZWQgcmVzcG9uc2UsIGNhdXNpbmcgdGhlIHNuaXBwZXQgdG8gYmUgaW5zZXJ0ZWRcbiAgICAgICAgLy8gbXVsdGlwbGUgdGltZXMsIG9uIGVhY2ggdHJpZ2dlci5cbiAgICAgICAgaWYgKHBhcmFtcy5jb250ZW50LmluZGV4T2YodGhpcy5sb2dDYXB0dXJlU25pcHBldCkgPT09IC0xKSB7XG4gICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSAnJyArIHRoaXMubG9nQ2FwdHVyZVNuaXBwZXQgKyBwYXJhbXMuY29udGVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhcHR1cmUgdGhlIGNvbnNvbGUubG9nIG91dHB1dFxuXG4gICAgfSwge1xuICAgICAga2V5OiAnY2FwdHVyZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2FwdHVyZSgpIHtcbiAgICAgICAgLy8gSUU5IHdpdGggZGV2dG9vbHMgY2xvc2VkXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmNvbnNvbGUgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cuY29uc29sZS5sb2cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICAgICAgICBsb2c6IGZ1bmN0aW9uIGxvZygpIHt9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvciBJRTkgc3VwcG9ydFxuICAgICAgICB2YXIgb2xkQ29uc29sZUxvZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwod2luZG93LmNvbnNvbGUubG9nLCB3aW5kb3cuY29uc29sZSk7XG5cbiAgICAgICAgd2luZG93LmNvbnNvbGUubG9nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIHNlbmQgbG9nIG1lc3NhZ2VzIHRvIHRoZSBwYXJlbnQgd2luZG93XG4gICAgICAgICAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLmZvckVhY2goZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICB0eXBlOiAnam90dGVkLWNvbnNvbGUtbG9nJyxcbiAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgICAgICAgfSksICcqJyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBpbiBJRTksIGNvbnNvbGUubG9nIGlzIG9iamVjdCBpbnN0ZWFkIG9mIGZ1bmN0aW9uXG4gICAgICAgICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy81ODU4OTYvY29uc29sZS1sb2ctdHlwZW9mLWlzLW9iamVjdC1pbnN0ZWFkLW9mLWZ1bmN0aW9uXG4gICAgICAgICAgb2xkQ29uc29sZUxvZy5hcHBseShvbGRDb25zb2xlTG9nLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2xvZycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbG9nKCkge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gICAgICAgIHZhciB0eXBlID0gYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHZhciAkbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgYWRkQ2xhc3MoJGxvZywgJ2pvdHRlZC1jb25zb2xlLWxvZycpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBhZGRDbGFzcygkbG9nLCAnam90dGVkLWNvbnNvbGUtbG9nLScgKyB0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRsb2cuaW5uZXJIVE1MID0gbWVzc2FnZTtcblxuICAgICAgICB0aGlzLiRvdXRwdXQuYXBwZW5kQ2hpbGQoJGxvZyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdWJtaXQoZSkge1xuICAgICAgICB2YXIgaW5wdXRWYWx1ZSA9IHRoaXMuJGlucHV0LnZhbHVlLnRyaW0oKTtcblxuICAgICAgICAvLyBpZiBpbnB1dCBpcyBibGFuaywgZG8gbm90aGluZ1xuICAgICAgICBpZiAoaW5wdXRWYWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHJ1biB0byBoaXN0b3J5XG4gICAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKGlucHV0VmFsdWUpO1xuICAgICAgICB0aGlzLmhpc3RvcnlJbmRleCA9IHRoaXMuaGlzdG9yeS5sZW5ndGg7XG5cbiAgICAgICAgLy8gbG9nIGlucHV0IHZhbHVlXG4gICAgICAgIHRoaXMubG9nKGlucHV0VmFsdWUsICdoaXN0b3J5Jyk7XG5cbiAgICAgICAgLy8gYWRkIHJldHVybiBpZiBpdCBkb2Vzbid0IHN0YXJ0IHdpdGggaXRcbiAgICAgICAgaWYgKGlucHV0VmFsdWUuaW5kZXhPZigncmV0dXJuJykgIT09IDApIHtcbiAgICAgICAgICBpbnB1dFZhbHVlID0gJ3JldHVybiAnICsgaW5wdXRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNob3cgb3V0cHV0IG9yIGVycm9yc1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIHJ1biB0aGUgY29uc29sZSBpbnB1dCBpbiB0aGUgaWZyYW1lIGNvbnRleHRcbiAgICAgICAgICB2YXIgc2NyaXB0T3V0cHV0ID0gdGhpcy5nZXRJZnJhbWUoKS5jb250ZW50V2luZG93LmV2YWwoJyhmdW5jdGlvbigpIHsnICsgaW5wdXRWYWx1ZSArICd9KSgpJyk7XG5cbiAgICAgICAgICB0aGlzLmxvZyhzY3JpcHRPdXRwdXQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aGlzLmxvZyhlcnIsICdlcnJvcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xlYXIgdGhlIGNvbnNvbGUgdmFsdWVcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsdWUgPSAnJztcblxuICAgICAgICAvLyBzY3JvbGwgY29uc29sZSBwYW5lIHRvIGJvdHRvbVxuICAgICAgICAvLyB0byBrZWVwIHRoZSBpbnB1dCBpbnRvIHZpZXdcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnNjcm9sbFRvcCA9IHRoaXMuJGNvbnRhaW5lci5zY3JvbGxIZWlnaHQ7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NsZWFyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgdGhpcy4kb3V0cHV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2hpc3RvcnknLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhpc3RvcnkoZSkge1xuICAgICAgICB2YXIgVVAgPSAzODtcbiAgICAgICAgdmFyIERPV04gPSA0MDtcbiAgICAgICAgdmFyIGdvdEhpc3RvcnkgPSBmYWxzZTtcbiAgICAgICAgdmFyIHNlbGVjdGlvblN0YXJ0ID0gdGhpcy4kaW5wdXQuc2VsZWN0aW9uU3RhcnQ7XG5cbiAgICAgICAgLy8gb25seSBpZiB3ZSBoYXZlIHByZXZpb3VzIGhpc3RvcnlcbiAgICAgICAgLy8gYW5kIHRoZSBjdXJzb3IgaXMgYXQgdGhlIHN0YXJ0XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IFVQICYmIHRoaXMuaGlzdG9yeUluZGV4ICE9PSAwICYmIHNlbGVjdGlvblN0YXJ0ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXgtLTtcbiAgICAgICAgICBnb3RIaXN0b3J5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgaWYgd2UgaGF2ZSBmdXR1cmUgaGlzdG9yeVxuICAgICAgICAvLyBhbmQgdGhlIGN1cnNvciBpcyBhdCB0aGUgZW5kXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IERPV04gJiYgdGhpcy5oaXN0b3J5SW5kZXggIT09IHRoaXMuaGlzdG9yeS5sZW5ndGggLSAxICYmIHNlbGVjdGlvblN0YXJ0ID09PSB0aGlzLiRpbnB1dC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLmhpc3RvcnlJbmRleCsrO1xuICAgICAgICAgIGdvdEhpc3RvcnkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBpZiBoaXN0b3J5IGNoYW5nZWRcbiAgICAgICAgaWYgKGdvdEhpc3RvcnkpIHtcbiAgICAgICAgICB0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuaGlzdG9yeVt0aGlzLmhpc3RvcnlJbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkNvbnNvbGU7XG4gIH0oKTtcblxuICAvKiBwbGF5IHBsdWdpblxuICAgKiBhZGRzIGEgUnVuIGJ1dHRvblxuICAgKi9cblxuICB2YXIgUGx1Z2luUGxheSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5QbGF5KGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luUGxheSk7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICBmaXJzdFJ1bjogdHJ1ZVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDEwO1xuICAgICAgLy8gY2FjaGVkIGNvZGVcbiAgICAgIHZhciBjYWNoZSA9IHt9O1xuICAgICAgLy8gbGF0ZXN0IHZlcnNpb24gb2YgdGhlIGNvZGUuXG4gICAgICAvLyByZXBsYWNlcyB0aGUgY2FjaGUgd2hlbiB0aGUgcnVuIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAgdmFyIGNvZGUgPSB7fTtcblxuICAgICAgLy8gc2V0IGZpcnN0UnVuPWZhbHNlIHRvIHN0YXJ0IHdpdGggYSBibGFuayBwcmV2aWV3LlxuICAgICAgLy8gcnVuIHRoZSByZWFsIGNvbnRlbnQgb25seSBhZnRlciB0aGUgZmlyc3QgUnVuIGJ1dHRvbiBwcmVzcy5cbiAgICAgIGlmIChvcHRpb25zLmZpcnN0UnVuID09PSBmYWxzZSkge1xuICAgICAgICBjYWNoZSA9IHtcbiAgICAgICAgICBodG1sOiB7XG4gICAgICAgICAgICB0eXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgY3NzOiB7XG4gICAgICAgICAgICB0eXBlOiAnY3NzJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBqczoge1xuICAgICAgICAgICAgdHlwZTogJ2pzJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBydW4gYnV0dG9uXG4gICAgICB2YXIgJGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgJGJ1dHRvbi5jbGFzc05hbWUgPSAnam90dGVkLWJ1dHRvbiBqb3R0ZWQtYnV0dG9uLXBsYXknO1xuICAgICAgJGJ1dHRvbi5pbm5lckhUTUwgPSAnUnVuJztcblxuICAgICAgam90dGVkLiRjb250YWluZXIuYXBwZW5kQ2hpbGQoJGJ1dHRvbik7XG4gICAgICAkYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5ydW4uYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGNhcHR1cmUgdGhlIGNvZGUgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuXG4gICAgICAvLyBwdWJsaWNcbiAgICAgIHRoaXMuY2FjaGUgPSBjYWNoZTtcbiAgICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgICB0aGlzLmpvdHRlZCA9IGpvdHRlZDtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5QbGF5LCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBhbHdheXMgY2FjaGUgdGhlIGxhdGVzdCBjb2RlXG4gICAgICAgIHRoaXMuY29kZVtwYXJhbXMudHlwZV0gPSBleHRlbmQocGFyYW1zKTtcblxuICAgICAgICAvLyByZXBsYWNlIHRoZSBwYXJhbXMgd2l0aCB0aGUgbGF0ZXN0IGNhY2hlXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jYWNoZVtwYXJhbXMudHlwZV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgdGhpcy5jYWNoZVtwYXJhbXMudHlwZV0pO1xuXG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGNhY2hlIGZvcmNlUmVuZGVyLFxuICAgICAgICAgIC8vIGFuZCBzZW5kIGl0IHdpdGggZWFjaCBjaGFuZ2UuXG4gICAgICAgICAgdGhpcy5jYWNoZVtwYXJhbXMudHlwZV0uZm9yY2VSZW5kZXIgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhY2hlIHRoZSBmaXJzdCBydW5cbiAgICAgICAgICB0aGlzLmNhY2hlW3BhcmFtcy50eXBlXSA9IGV4dGVuZChwYXJhbXMpO1xuXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3J1bicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICAvLyB0cmlnZ2VyIGNoYW5nZSBvbiBlYWNoIHR5cGUgd2l0aCB0aGUgbGF0ZXN0IGNvZGVcbiAgICAgICAgZm9yICh2YXIgdHlwZSBpbiB0aGlzLmNvZGUpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlW3R5cGVdID0gZXh0ZW5kKHRoaXMuY29kZVt0eXBlXSwge1xuICAgICAgICAgICAgLy8gZm9yY2UgcmVuZGVyaW5nIG9uIGVhY2ggUnVuIHByZXNzXG4gICAgICAgICAgICBmb3JjZVJlbmRlcjogdHJ1ZVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gdHJpZ2dlciB0aGUgY2hhbmdlXG4gICAgICAgICAgdGhpcy5qb3R0ZWQudHJpZ2dlcignY2hhbmdlJywgdGhpcy5jYWNoZVt0eXBlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpblBsYXk7XG4gIH0oKTtcblxuICAvKiBidW5kbGUgcGx1Z2luc1xuICAgKi9cblxuICAvLyByZWdpc3RlciBidW5kbGVkIHBsdWdpbnNcbiAgZnVuY3Rpb24gQnVuZGxlUGx1Z2lucyhqb3R0ZWQpIHtcbiAgICBqb3R0ZWQucGx1Z2luKCdyZW5kZXInLCBQbHVnaW5SZW5kZXIpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ3NjcmlwdGxlc3MnLCBQbHVnaW5TY3JpcHRsZXNzKTtcblxuICAgIGpvdHRlZC5wbHVnaW4oJ2FjZScsIFBsdWdpbkFjZSk7XG4gICAgam90dGVkLnBsdWdpbignY29kZW1pcnJvcicsIFBsdWdpbkNvZGVNaXJyb3IpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2xlc3MnLCBQbHVnaW5MZXNzKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdjb2ZmZWVzY3JpcHQnLCBQbHVnaW5Db2ZmZWVTY3JpcHQpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ3N0eWx1cycsIFBsdWdpblN0eWx1cyk7XG4gICAgam90dGVkLnBsdWdpbignYmFiZWwnLCBQbHVnaW5CYWJlbCk7XG4gICAgam90dGVkLnBsdWdpbignbWFya2Rvd24nLCBQbHVnaW5NYXJrZG93bik7XG4gICAgam90dGVkLnBsdWdpbignY29uc29sZScsIFBsdWdpbkNvbnNvbGUpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ3BsYXknLCBQbHVnaW5QbGF5KTtcbiAgfVxuXG4gIC8qIGpvdHRlZFxuICAgKi9cblxuICB2YXIgSm90dGVkID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEpvdHRlZCgkam90dGVkQ29udGFpbmVyLCBvcHRzKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBKb3R0ZWQpO1xuXG4gICAgICBpZiAoISRqb3R0ZWRDb250YWluZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IGZpbmQgSm90dGVkIGNvbnRhaW5lci4nKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJpdmF0ZSBkYXRhXG4gICAgICB2YXIgX3ByaXZhdGUgPSB7fTtcbiAgICAgIHRoaXMuX2dldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9wcml2YXRlW2tleV07XG4gICAgICB9O1xuICAgICAgdGhpcy5fc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgX3ByaXZhdGVba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gX3ByaXZhdGVba2V5XTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9wdGlvbnNcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fc2V0KCdvcHRpb25zJywgZXh0ZW5kKG9wdHMsIHtcbiAgICAgICAgZmlsZXM6IFtdLFxuICAgICAgICBzaG93Qmxhbms6IGZhbHNlLFxuICAgICAgICBydW5TY3JpcHRzOiB0cnVlLFxuICAgICAgICBwYW5lOiAncmVzdWx0JyxcbiAgICAgICAgZGVib3VuY2U6IDI1MCxcbiAgICAgICAgcGx1Z2luczogW11cbiAgICAgIH0pKTtcblxuICAgICAgLy8gdGhlIHJlbmRlciBwbHVnaW4gaXMgbWFuZGF0b3J5XG4gICAgICBvcHRpb25zLnBsdWdpbnMucHVzaCgncmVuZGVyJyk7XG5cbiAgICAgIC8vIHVzZSB0aGUgc2NyaXB0bGVzcyBwbHVnaW4gaWYgcnVuU2NyaXB0cyBpcyBmYWxzZVxuICAgICAgaWYgKG9wdGlvbnMucnVuU2NyaXB0cyA9PT0gZmFsc2UpIHtcbiAgICAgICAgb3B0aW9ucy5wbHVnaW5zLnB1c2goJ3NjcmlwdGxlc3MnKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FjaGVkIGNvbnRlbnQgZm9yIHRoZSBjaGFuZ2UgbWV0aG9kLlxuICAgICAgdGhpcy5fc2V0KCdjYWNoZWRDb250ZW50Jywge1xuICAgICAgICBodG1sOiBudWxsLFxuICAgICAgICBjc3M6IG51bGwsXG4gICAgICAgIGpzOiBudWxsXG4gICAgICB9KTtcblxuICAgICAgLy8gUHViU291cFxuICAgICAgdmFyIHB1YnNvdXAgPSB0aGlzLl9zZXQoJ3B1YnNvdXAnLCBuZXcgUHViU291cCgpKTtcblxuICAgICAgdGhpcy5fc2V0KCd0cmlnZ2VyJywgdGhpcy50cmlnZ2VyKCkpO1xuICAgICAgdGhpcy5fc2V0KCdvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHVic291cC5zdWJzY3JpYmUuYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2V0KCdvZmYnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHB1YnNvdXAudW5zdWJzY3JpYmUuYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGRvbmUgPSB0aGlzLl9zZXQoJ2RvbmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHB1YnNvdXAuZG9uZS5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGFmdGVyIGFsbCBwbHVnaW5zIHJ1blxuICAgICAgLy8gc2hvdyBlcnJvcnNcbiAgICAgIGRvbmUoJ2NoYW5nZScsIHRoaXMuZXJyb3JzLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBET01cbiAgICAgIHZhciAkY29udGFpbmVyID0gdGhpcy5fc2V0KCckY29udGFpbmVyJywgJGpvdHRlZENvbnRhaW5lcik7XG4gICAgICAkY29udGFpbmVyLmlubmVySFRNTCA9IGNvbnRhaW5lcigpO1xuICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgY29udGFpbmVyQ2xhc3MoKSk7XG5cbiAgICAgIC8vIGRlZmF1bHQgcGFuZVxuICAgICAgdmFyIHBhbmVBY3RpdmUgPSB0aGlzLl9zZXQoJ3BhbmVBY3RpdmUnLCBvcHRpb25zLnBhbmUpO1xuICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgcGFuZUFjdGl2ZUNsYXNzKHBhbmVBY3RpdmUpKTtcblxuICAgICAgLy8gc3RhdHVzIG5vZGVzXG4gICAgICB0aGlzLl9zZXQoJyRzdGF0dXMnLCB7fSk7XG5cbiAgICAgIHZhciBfYXJyID0gWydodG1sJywgJ2NzcycsICdqcyddO1xuICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IF9hcnIubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfdHlwZSA9IF9hcnJbX2ldO1xuICAgICAgICB0aGlzLm1hcmt1cChfdHlwZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRhcmVhIGNoYW5nZSBldmVudHMuXG4gICAgICAkY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZGVib3VuY2UodGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgb3B0aW9ucy5kZWJvdW5jZSkpO1xuICAgICAgJGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBkZWJvdW5jZSh0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBvcHRpb25zLmRlYm91bmNlKSk7XG5cbiAgICAgIC8vIHBhbmUgY2hhbmdlXG4gICAgICAkY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5wYW5lLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBleHBvc2UgcHVibGljIHByb3BlcnRpZXNcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuX2dldCgnJGNvbnRhaW5lcicpO1xuICAgICAgdGhpcy5vbiA9IHRoaXMuX2dldCgnb24nKTtcbiAgICAgIHRoaXMub2ZmID0gdGhpcy5fZ2V0KCdvZmYnKTtcbiAgICAgIHRoaXMuZG9uZSA9IHRoaXMuX2dldCgnZG9uZScpO1xuICAgICAgdGhpcy50cmlnZ2VyID0gdGhpcy5fZ2V0KCd0cmlnZ2VyJyk7XG4gICAgICB0aGlzLnBhbmVBY3RpdmUgPSB0aGlzLl9nZXQoJ3BhbmVBY3RpdmUnKTtcblxuICAgICAgLy8gaW5pdCBwbHVnaW5zXG4gICAgICB0aGlzLl9zZXQoJ3BsdWdpbnMnLCB7fSk7XG4gICAgICBpbml0LmNhbGwodGhpcyk7XG5cbiAgICAgIC8vIGxvYWQgZmlsZXNcbiAgICAgIHZhciBfYXJyMiA9IFsnaHRtbCcsICdjc3MnLCAnanMnXTtcbiAgICAgIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IF9hcnIyLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgdmFyIF90eXBlMiA9IF9hcnIyW19pMl07XG4gICAgICAgIHRoaXMubG9hZChfdHlwZTIpO1xuICAgICAgfVxuXG4gICAgICAvLyBzaG93IGFsbCB0YWJzLCBldmVuIGlmIGVtcHR5XG4gICAgICBpZiAob3B0aW9ucy5zaG93QmxhbmspIHtcbiAgICAgICAgdmFyIF9hcnIzID0gWydodG1sJywgJ2NzcycsICdqcyddO1xuXG4gICAgICAgIGZvciAodmFyIF9pMyA9IDA7IF9pMyA8IF9hcnIzLmxlbmd0aDsgX2kzKyspIHtcbiAgICAgICAgICB2YXIgdHlwZSA9IF9hcnIzW19pM107XG4gICAgICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgaGFzRmlsZUNsYXNzKHR5cGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKEpvdHRlZCwgW3tcbiAgICAgIGtleTogJ2ZpbmRGaWxlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmaW5kRmlsZSh0eXBlKSB7XG4gICAgICAgIHZhciBmaWxlID0ge307XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fZ2V0KCdvcHRpb25zJyk7XG5cbiAgICAgICAgZm9yICh2YXIgZmlsZUluZGV4IGluIG9wdGlvbnMuZmlsZXMpIHtcbiAgICAgICAgICB2YXIgX2ZpbGUgPSBvcHRpb25zLmZpbGVzW2ZpbGVJbmRleF07XG4gICAgICAgICAgaWYgKF9maWxlLnR5cGUgPT09IHR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfZmlsZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdtYXJrdXAnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1hcmt1cCh0eXBlKSB7XG4gICAgICAgIHZhciAkY29udGFpbmVyID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJyk7XG4gICAgICAgIHZhciAkcGFyZW50ID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXBhbmUtJyArIHR5cGUpO1xuICAgICAgICAvLyBjcmVhdGUgdGhlIG1hcmt1cCBmb3IgYW4gZWRpdG9yXG4gICAgICAgIHZhciBmaWxlID0gdGhpcy5maW5kRmlsZSh0eXBlKTtcblxuICAgICAgICB2YXIgJGVkaXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAkZWRpdG9yLmlubmVySFRNTCA9IGVkaXRvckNvbnRlbnQodHlwZSwgZmlsZS51cmwpO1xuICAgICAgICAkZWRpdG9yLmNsYXNzTmFtZSA9IGVkaXRvckNsYXNzKHR5cGUpO1xuXG4gICAgICAgICRwYXJlbnQuYXBwZW5kQ2hpbGQoJGVkaXRvcik7XG5cbiAgICAgICAgLy8gZ2V0IHRoZSBzdGF0dXMgbm9kZVxuICAgICAgICB0aGlzLl9nZXQoJyRzdGF0dXMnKVt0eXBlXSA9ICRwYXJlbnQucXVlcnlTZWxlY3RvcignLmpvdHRlZC1zdGF0dXMnKTtcblxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgZmlsZSBmb3IgdGhlIGN1cnJlbnQgdHlwZVxuICAgICAgICBpZiAodHlwZW9mIGZpbGUudXJsICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZmlsZS5jb250ZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIGFkZCB0aGUgaGFzLXR5cGUgY2xhc3MgdG8gdGhlIGNvbnRhaW5lclxuICAgICAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIGhhc0ZpbGVDbGFzcyh0eXBlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdsb2FkJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkKHR5cGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIG1hcmt1cCBmb3IgYW4gZWRpdG9yXG4gICAgICAgIHZhciBmaWxlID0gdGhpcy5maW5kRmlsZSh0eXBlKTtcbiAgICAgICAgdmFyICR0ZXh0YXJlYSA9IHRoaXMuX2dldCgnJGNvbnRhaW5lcicpLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS0nICsgdHlwZSArICcgdGV4dGFyZWEnKTtcblxuICAgICAgICAvLyBmaWxlIGFzIHN0cmluZ1xuICAgICAgICBpZiAodHlwZW9mIGZpbGUuY29udGVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aGlzLnNldFZhbHVlKCR0ZXh0YXJlYSwgZmlsZS5jb250ZW50KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmlsZS51cmwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gc2hvdyBsb2FkaW5nIG1lc3NhZ2VcbiAgICAgICAgICB0aGlzLnN0YXR1cygnbG9hZGluZycsIFtzdGF0dXNMb2FkaW5nKGZpbGUudXJsKV0sIHtcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBmaWxlOiBmaWxlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBmaWxlIGFzIHVybFxuICAgICAgICAgIGZldGNoKGZpbGUudXJsLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgLy8gc2hvdyBsb2FkIGVycm9yc1xuICAgICAgICAgICAgICBfdGhpcy5zdGF0dXMoJ2Vycm9yJywgW3N0YXR1c0ZldGNoRXJyb3IoZXJyKV0sIHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2xlYXIgdGhlIGxvYWRpbmcgc3RhdHVzXG4gICAgICAgICAgICBfdGhpcy5jbGVhclN0YXR1cygnbG9hZGluZycsIHtcbiAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF90aGlzLnNldFZhbHVlKCR0ZXh0YXJlYSwgcmVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB0cmlnZ2VyIGEgY2hhbmdlIGV2ZW50IG9uIGJsYW5rIGVkaXRvcnMsXG4gICAgICAgICAgLy8gZm9yIGVkaXRvciBwbHVnaW5zIHRvIGNhdGNoLlxuICAgICAgICAgIC8vIChlZy4gdGhlIGNvZGVtaXJyb3IgYW5kIGFjZSBwbHVnaW5zIGF0dGFjaCB0aGUgY2hhbmdlIGV2ZW50XG4gICAgICAgICAgLy8gb25seSBhZnRlciB0aGUgaW5pdGlhbCBjaGFuZ2UvbG9hZCBldmVudClcbiAgICAgICAgICB0aGlzLnNldFZhbHVlKCR0ZXh0YXJlYSwgJycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnc2V0VmFsdWUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZhbHVlKCR0ZXh0YXJlYSwgdmFsKSB7XG4gICAgICAgICR0ZXh0YXJlYS52YWx1ZSA9IHZhbDtcblxuICAgICAgICAvLyB0cmlnZ2VyIGNoYW5nZSBldmVudCwgZm9yIGluaXRpYWwgcmVuZGVyXG4gICAgICAgIHRoaXMuY2hhbmdlKHtcbiAgICAgICAgICB0YXJnZXQ6ICR0ZXh0YXJlYVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShlKSB7XG4gICAgICAgIHZhciB0eXBlID0gZGF0YShlLnRhcmdldCwgJ2pvdHRlZC10eXBlJyk7XG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbid0IHRyaWdnZXIgY2hhbmdlIGlmIHRoZSBjb250ZW50IGhhc24ndCBjaGFuZ2VkLlxuICAgICAgICAvLyBlZy4gd2hlbiBibHVycmluZyB0aGUgdGV4dGFyZWEuXG4gICAgICAgIHZhciBjYWNoZWRDb250ZW50ID0gdGhpcy5fZ2V0KCdjYWNoZWRDb250ZW50Jyk7XG4gICAgICAgIGlmIChjYWNoZWRDb250ZW50W3R5cGVdID09PSBlLnRhcmdldC52YWx1ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhY2hlIGxhdGVzdCBjb250ZW50XG4gICAgICAgIGNhY2hlZENvbnRlbnRbdHlwZV0gPSBlLnRhcmdldC52YWx1ZTtcblxuICAgICAgICAvLyB0cmlnZ2VyIHRoZSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBmaWxlOiBkYXRhKGUudGFyZ2V0LCAnam90dGVkLWZpbGUnKSxcbiAgICAgICAgICBjb250ZW50OiBjYWNoZWRDb250ZW50W3R5cGVdXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Vycm9ycycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZXJyb3JzKGVycnMsIHBhcmFtcykge1xuICAgICAgICB0aGlzLnN0YXR1cygnZXJyb3InLCBlcnJzLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3BhbmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhbmUoZSkge1xuICAgICAgICBpZiAoIWRhdGEoZS50YXJnZXQsICdqb3R0ZWQtdHlwZScpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRjb250YWluZXIgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKTtcbiAgICAgICAgdmFyIHBhbmVBY3RpdmUgPSB0aGlzLl9nZXQoJ3BhbmVBY3RpdmUnKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoJGNvbnRhaW5lciwgcGFuZUFjdGl2ZUNsYXNzKHBhbmVBY3RpdmUpKTtcblxuICAgICAgICBwYW5lQWN0aXZlID0gdGhpcy5fc2V0KCdwYW5lQWN0aXZlJywgZGF0YShlLnRhcmdldCwgJ2pvdHRlZC10eXBlJykpO1xuICAgICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBwYW5lQWN0aXZlQ2xhc3MocGFuZUFjdGl2ZSkpO1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzdGF0dXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXR1cygpIHtcbiAgICAgICAgdmFyIHN0YXR1c1R5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICdlcnJvcic7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogW107XG4gICAgICAgIHZhciBwYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gICAgICAgIGlmICghbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXJTdGF0dXMoc3RhdHVzVHlwZSwgcGFyYW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkc3RhdHVzID0gdGhpcy5fZ2V0KCckc3RhdHVzJyk7XG5cbiAgICAgICAgLy8gYWRkIGVycm9yL2xvYWRpbmcgY2xhc3MgdG8gc3RhdHVzXG4gICAgICAgIGFkZENsYXNzKCRzdGF0dXNbcGFyYW1zLnR5cGVdLCBzdGF0dXNDbGFzcyhzdGF0dXNUeXBlKSk7XG5cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5fZ2V0KCckY29udGFpbmVyJyksIHN0YXR1c0FjdGl2ZUNsYXNzKHBhcmFtcy50eXBlKSk7XG5cbiAgICAgICAgdmFyIG1hcmt1cCA9ICcnO1xuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBtYXJrdXAgKz0gc3RhdHVzTWVzc2FnZShlcnIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc3RhdHVzW3BhcmFtcy50eXBlXS5pbm5lckhUTUwgPSBtYXJrdXA7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2xlYXJTdGF0dXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyU3RhdHVzKHN0YXR1c1R5cGUsIHBhcmFtcykge1xuICAgICAgICB2YXIgJHN0YXR1cyA9IHRoaXMuX2dldCgnJHN0YXR1cycpO1xuXG4gICAgICAgIHJlbW92ZUNsYXNzKCRzdGF0dXNbcGFyYW1zLnR5cGVdLCBzdGF0dXNDbGFzcyhzdGF0dXNUeXBlKSk7XG4gICAgICAgIHJlbW92ZUNsYXNzKHRoaXMuX2dldCgnJGNvbnRhaW5lcicpLCBzdGF0dXNBY3RpdmVDbGFzcyhwYXJhbXMudHlwZSkpO1xuICAgICAgICAkc3RhdHVzW3BhcmFtcy50eXBlXS5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cblxuICAgICAgLy8gZGVib3VuY2VkIHRyaWdnZXIgbWV0aG9kXG4gICAgICAvLyBjdXN0b20gZGVib3VuY2VyIHRvIHVzZSBhIGRpZmZlcmVudCB0aW1lciBwZXIgdHlwZVxuXG4gICAgfSwge1xuICAgICAga2V5OiAndHJpZ2dlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdHJpZ2dlcigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9nZXQoJ29wdGlvbnMnKTtcbiAgICAgICAgdmFyIHB1YnNvdXAgPSB0aGlzLl9nZXQoJ3B1YnNvdXAnKTtcblxuICAgICAgICAvLyBhbGxvdyBkaXNhYmxpbmcgdGhlIHRyaWdnZXIgZGVib3VuY2VyLlxuICAgICAgICAvLyBtb3N0bHkgZm9yIHRlc3Rpbmc6IHdoZW4gdHJpZ2dlciBldmVudHMgaGFwcGVuIHJhcGlkbHlcbiAgICAgICAgLy8gbXVsdGlwbGUgZXZlbnRzIG9mIHRoZSBzYW1lIHR5cGUgd291bGQgYmUgY2F1Z2h0IG9uY2UuXG4gICAgICAgIGlmIChvcHRpb25zLmRlYm91bmNlID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwdWJzb3VwLnB1Ymxpc2guYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29vbGRvd24gdGltZXJcbiAgICAgICAgdmFyIGNvb2xkb3duID0ge307XG4gICAgICAgIC8vIG11bHRpcGxlIGNhbGxzXG4gICAgICAgIHZhciBtdWx0aXBsZSA9IHt9O1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodG9waWMpIHtcbiAgICAgICAgICB2YXIgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcblxuICAgICAgICAgIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICAgICAgICAgIHZhciBfcmVmJHR5cGUgPSBfcmVmLnR5cGU7XG4gICAgICAgICAgdmFyIHR5cGUgPSBfcmVmJHR5cGUgPT09IHVuZGVmaW5lZCA/ICdkZWZhdWx0JyA6IF9yZWYkdHlwZTtcblxuICAgICAgICAgIGlmIChjb29sZG93blt0eXBlXSkge1xuICAgICAgICAgICAgLy8gaWYgd2UgaGFkIG11bHRpcGxlIGNhbGxzIGJlZm9yZSB0aGUgY29vbGRvd25cbiAgICAgICAgICAgIG11bHRpcGxlW3R5cGVdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdHJpZ2dlciBpbW1lZGlhdGVseSBvbmNlIGNvb2xkb3duIGlzIG92ZXJcbiAgICAgICAgICAgIHB1YnNvdXAucHVibGlzaC5hcHBseShwdWJzb3VwLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNsZWFyVGltZW91dChjb29sZG93blt0eXBlXSk7XG5cbiAgICAgICAgICAvLyBzZXQgY29vbGRvd24gdGltZXJcbiAgICAgICAgICBjb29sZG93blt0eXBlXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gaWYgd2UgaGFkIG11bHRpcGxlIGNhbGxzIGJlZm9yZSB0aGUgY29vbGRvd24sXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBhZ2FpbiBhdCB0aGUgZW5kLlxuICAgICAgICAgICAgaWYgKG11bHRpcGxlW3R5cGVdKSB7XG4gICAgICAgICAgICAgIHB1YnNvdXAucHVibGlzaC5hcHBseShwdWJzb3VwLCBfYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbXVsdGlwbGVbdHlwZV0gPSBudWxsO1xuICAgICAgICAgICAgY29vbGRvd25bdHlwZV0gPSBudWxsO1xuICAgICAgICAgIH0sIG9wdGlvbnMuZGVib3VuY2UpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gSm90dGVkO1xuICB9KCk7XG5cbiAgLy8gcmVnaXN0ZXIgcGx1Z2luc1xuXG5cbiAgSm90dGVkLnBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvLyByZWdpc3RlciBidW5kbGVkIHBsdWdpbnNcbiAgQnVuZGxlUGx1Z2lucyhKb3R0ZWQpO1xuXG4gIHJldHVybiBKb3R0ZWQ7XG5cbn0pKSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWpvdHRlZC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgUGllcm94eSA8cGllcm94eUBwaWVyb3h5Lm5ldD5cbi8vIFRoaXMgd29yayBpcyBmcmVlLiBZb3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0XG4vLyB1bmRlciB0aGUgdGVybXMgb2YgdGhlIFdURlBMLCBWZXJzaW9uIDJcbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uIHNlZSBMSUNFTlNFLnR4dCBvciBodHRwOi8vd3d3Lnd0ZnBsLm5ldC9cbi8vXG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgdGhlIGhvbWUgcGFnZTpcbi8vIGh0dHA6Ly9waWVyb3h5Lm5ldC9ibG9nL3BhZ2VzL2x6LXN0cmluZy90ZXN0aW5nLmh0bWxcbi8vXG4vLyBMWi1iYXNlZCBjb21wcmVzc2lvbiBhbGdvcml0aG0sIHZlcnNpb24gMS40LjRcbnZhciBMWlN0cmluZyA9IChmdW5jdGlvbigpIHtcblxuLy8gcHJpdmF0ZSBwcm9wZXJ0eVxudmFyIGYgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xudmFyIGtleVN0ckJhc2U2NCA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIjtcbnZhciBrZXlTdHJVcmlTYWZlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSstJFwiO1xudmFyIGJhc2VSZXZlcnNlRGljID0ge307XG5cbmZ1bmN0aW9uIGdldEJhc2VWYWx1ZShhbHBoYWJldCwgY2hhcmFjdGVyKSB7XG4gIGlmICghYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdKSB7XG4gICAgYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdID0ge307XG4gICAgZm9yICh2YXIgaT0wIDsgaTxhbHBoYWJldC5sZW5ndGggOyBpKyspIHtcbiAgICAgIGJhc2VSZXZlcnNlRGljW2FscGhhYmV0XVthbHBoYWJldC5jaGFyQXQoaSldID0gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJhc2VSZXZlcnNlRGljW2FscGhhYmV0XVtjaGFyYWN0ZXJdO1xufVxuXG52YXIgTFpTdHJpbmcgPSB7XG4gIGNvbXByZXNzVG9CYXNlNjQgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgdmFyIHJlcyA9IExaU3RyaW5nLl9jb21wcmVzcyhpbnB1dCwgNiwgZnVuY3Rpb24oYSl7cmV0dXJuIGtleVN0ckJhc2U2NC5jaGFyQXQoYSk7fSk7XG4gICAgc3dpdGNoIChyZXMubGVuZ3RoICUgNCkgeyAvLyBUbyBwcm9kdWNlIHZhbGlkIEJhc2U2NFxuICAgIGRlZmF1bHQ6IC8vIFdoZW4gY291bGQgdGhpcyBoYXBwZW4gP1xuICAgIGNhc2UgMCA6IHJldHVybiByZXM7XG4gICAgY2FzZSAxIDogcmV0dXJuIHJlcytcIj09PVwiO1xuICAgIGNhc2UgMiA6IHJldHVybiByZXMrXCI9PVwiO1xuICAgIGNhc2UgMyA6IHJldHVybiByZXMrXCI9XCI7XG4gICAgfVxuICB9LFxuXG4gIGRlY29tcHJlc3NGcm9tQmFzZTY0IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChpbnB1dCA9PSBcIlwiKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoaW5wdXQubGVuZ3RoLCAzMiwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGdldEJhc2VWYWx1ZShrZXlTdHJCYXNlNjQsIGlucHV0LmNoYXJBdChpbmRleCkpOyB9KTtcbiAgfSxcblxuICBjb21wcmVzc1RvVVRGMTYgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9jb21wcmVzcyhpbnB1dCwgMTUsIGZ1bmN0aW9uKGEpe3JldHVybiBmKGErMzIpO30pICsgXCIgXCI7XG4gIH0sXG5cbiAgZGVjb21wcmVzc0Zyb21VVEYxNjogZnVuY3Rpb24gKGNvbXByZXNzZWQpIHtcbiAgICBpZiAoY29tcHJlc3NlZCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoY29tcHJlc3NlZCA9PSBcIlwiKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoY29tcHJlc3NlZC5sZW5ndGgsIDE2Mzg0LCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gY29tcHJlc3NlZC5jaGFyQ29kZUF0KGluZGV4KSAtIDMyOyB9KTtcbiAgfSxcblxuICAvL2NvbXByZXNzIGludG8gdWludDhhcnJheSAoVUNTLTIgYmlnIGVuZGlhbiBmb3JtYXQpXG4gIGNvbXByZXNzVG9VaW50OEFycmF5OiBmdW5jdGlvbiAodW5jb21wcmVzc2VkKSB7XG4gICAgdmFyIGNvbXByZXNzZWQgPSBMWlN0cmluZy5jb21wcmVzcyh1bmNvbXByZXNzZWQpO1xuICAgIHZhciBidWY9bmV3IFVpbnQ4QXJyYXkoY29tcHJlc3NlZC5sZW5ndGgqMik7IC8vIDIgYnl0ZXMgcGVyIGNoYXJhY3RlclxuXG4gICAgZm9yICh2YXIgaT0wLCBUb3RhbExlbj1jb21wcmVzc2VkLmxlbmd0aDsgaTxUb3RhbExlbjsgaSsrKSB7XG4gICAgICB2YXIgY3VycmVudF92YWx1ZSA9IGNvbXByZXNzZWQuY2hhckNvZGVBdChpKTtcbiAgICAgIGJ1ZltpKjJdID0gY3VycmVudF92YWx1ZSA+Pj4gODtcbiAgICAgIGJ1ZltpKjIrMV0gPSBjdXJyZW50X3ZhbHVlICUgMjU2O1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuXG4gIC8vZGVjb21wcmVzcyBmcm9tIHVpbnQ4YXJyYXkgKFVDUy0yIGJpZyBlbmRpYW4gZm9ybWF0KVxuICBkZWNvbXByZXNzRnJvbVVpbnQ4QXJyYXk6ZnVuY3Rpb24gKGNvbXByZXNzZWQpIHtcbiAgICBpZiAoY29tcHJlc3NlZD09PW51bGwgfHwgY29tcHJlc3NlZD09PXVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiBMWlN0cmluZy5kZWNvbXByZXNzKGNvbXByZXNzZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBidWY9bmV3IEFycmF5KGNvbXByZXNzZWQubGVuZ3RoLzIpOyAvLyAyIGJ5dGVzIHBlciBjaGFyYWN0ZXJcbiAgICAgICAgZm9yICh2YXIgaT0wLCBUb3RhbExlbj1idWYubGVuZ3RoOyBpPFRvdGFsTGVuOyBpKyspIHtcbiAgICAgICAgICBidWZbaV09Y29tcHJlc3NlZFtpKjJdKjI1Nitjb21wcmVzc2VkW2kqMisxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgYnVmLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICByZXN1bHQucHVzaChmKGMpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBMWlN0cmluZy5kZWNvbXByZXNzKHJlc3VsdC5qb2luKCcnKSk7XG5cbiAgICB9XG5cbiAgfSxcblxuXG4gIC8vY29tcHJlc3MgaW50byBhIHN0cmluZyB0aGF0IGlzIGFscmVhZHkgVVJJIGVuY29kZWRcbiAgY29tcHJlc3NUb0VuY29kZWRVUklDb21wb25lbnQ6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKGlucHV0LCA2LCBmdW5jdGlvbihhKXtyZXR1cm4ga2V5U3RyVXJpU2FmZS5jaGFyQXQoYSk7fSk7XG4gIH0sXG5cbiAgLy9kZWNvbXByZXNzIGZyb20gYW4gb3V0cHV0IG9mIGNvbXByZXNzVG9FbmNvZGVkVVJJQ29tcG9uZW50XG4gIGRlY29tcHJlc3NGcm9tRW5jb2RlZFVSSUNvbXBvbmVudDpmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGlucHV0ID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvIC9nLCBcIitcIik7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGlucHV0Lmxlbmd0aCwgMzIsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBnZXRCYXNlVmFsdWUoa2V5U3RyVXJpU2FmZSwgaW5wdXQuY2hhckF0KGluZGV4KSk7IH0pO1xuICB9LFxuXG4gIGNvbXByZXNzOiBmdW5jdGlvbiAodW5jb21wcmVzc2VkKSB7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9jb21wcmVzcyh1bmNvbXByZXNzZWQsIDE2LCBmdW5jdGlvbihhKXtyZXR1cm4gZihhKTt9KTtcbiAgfSxcbiAgX2NvbXByZXNzOiBmdW5jdGlvbiAodW5jb21wcmVzc2VkLCBiaXRzUGVyQ2hhciwgZ2V0Q2hhckZyb21JbnQpIHtcbiAgICBpZiAodW5jb21wcmVzc2VkID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHZhciBpLCB2YWx1ZSxcbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5PSB7fSxcbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGU9IHt9LFxuICAgICAgICBjb250ZXh0X2M9XCJcIixcbiAgICAgICAgY29udGV4dF93Yz1cIlwiLFxuICAgICAgICBjb250ZXh0X3c9XCJcIixcbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW49IDIsIC8vIENvbXBlbnNhdGUgZm9yIHRoZSBmaXJzdCBlbnRyeSB3aGljaCBzaG91bGQgbm90IGNvdW50XG4gICAgICAgIGNvbnRleHRfZGljdFNpemU9IDMsXG4gICAgICAgIGNvbnRleHRfbnVtQml0cz0gMixcbiAgICAgICAgY29udGV4dF9kYXRhPVtdLFxuICAgICAgICBjb250ZXh0X2RhdGFfdmFsPTAsXG4gICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbj0wLFxuICAgICAgICBpaTtcblxuICAgIGZvciAoaWkgPSAwOyBpaSA8IHVuY29tcHJlc3NlZC5sZW5ndGg7IGlpICs9IDEpIHtcbiAgICAgIGNvbnRleHRfYyA9IHVuY29tcHJlc3NlZC5jaGFyQXQoaWkpO1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dF9kaWN0aW9uYXJ5LGNvbnRleHRfYykpIHtcbiAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfY10gPSBjb250ZXh0X2RpY3RTaXplKys7XG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlW2NvbnRleHRfY10gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0X3djID0gY29udGV4dF93ICsgY29udGV4dF9jO1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnksY29udGV4dF93YykpIHtcbiAgICAgICAgY29udGV4dF93ID0gY29udGV4dF93YztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGUsY29udGV4dF93KSkge1xuICAgICAgICAgIGlmIChjb250ZXh0X3cuY2hhckNvZGVBdCgwKTwyNTYpIHtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSBjb250ZXh0X3cuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTw4IDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IDE7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8IHZhbHVlO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09Yml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8MTYgOyBpKyspIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgICAgIGNvbnRleHRfZW5sYXJnZUluID0gTWF0aC5wb3coMiwgY29udGV4dF9udW1CaXRzKTtcbiAgICAgICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWxldGUgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGVbY29udGV4dF93XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfZGljdGlvbmFyeVtjb250ZXh0X3ddO1xuICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgfVxuXG5cbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgIGNvbnRleHRfZW5sYXJnZUluID0gTWF0aC5wb3coMiwgY29udGV4dF9udW1CaXRzKTtcbiAgICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgd2MgdG8gdGhlIGRpY3Rpb25hcnkuXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVtjb250ZXh0X3djXSA9IGNvbnRleHRfZGljdFNpemUrKztcbiAgICAgICAgY29udGV4dF93ID0gU3RyaW5nKGNvbnRleHRfYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3V0cHV0IHRoZSBjb2RlIGZvciB3LlxuICAgIGlmIChjb250ZXh0X3cgIT09IFwiXCIpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGUsY29udGV4dF93KSkge1xuICAgICAgICBpZiAoY29udGV4dF93LmNoYXJDb2RlQXQoMCk8MjU2KSB7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0X3cuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8OCA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSAxO1xuICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8IHZhbHVlO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0X3cuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8MTYgOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZVtjb250ZXh0X3ddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF93XTtcbiAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgfVxuXG5cbiAgICAgIH1cbiAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmsgdGhlIGVuZCBvZiB0aGUgc3RyZWFtXG4gICAgdmFsdWUgPSAyO1xuICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgfVxuXG4gICAgLy8gRmx1c2ggdGhlIGxhc3QgY2hhclxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGVsc2UgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0X2RhdGEuam9pbignJyk7XG4gIH0sXG5cbiAgZGVjb21wcmVzczogZnVuY3Rpb24gKGNvbXByZXNzZWQpIHtcbiAgICBpZiAoY29tcHJlc3NlZCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoY29tcHJlc3NlZCA9PSBcIlwiKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoY29tcHJlc3NlZC5sZW5ndGgsIDMyNzY4LCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gY29tcHJlc3NlZC5jaGFyQ29kZUF0KGluZGV4KTsgfSk7XG4gIH0sXG5cbiAgX2RlY29tcHJlc3M6IGZ1bmN0aW9uIChsZW5ndGgsIHJlc2V0VmFsdWUsIGdldE5leHRWYWx1ZSkge1xuICAgIHZhciBkaWN0aW9uYXJ5ID0gW10sXG4gICAgICAgIG5leHQsXG4gICAgICAgIGVubGFyZ2VJbiA9IDQsXG4gICAgICAgIGRpY3RTaXplID0gNCxcbiAgICAgICAgbnVtQml0cyA9IDMsXG4gICAgICAgIGVudHJ5ID0gXCJcIixcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGksXG4gICAgICAgIHcsXG4gICAgICAgIGJpdHMsIHJlc2IsIG1heHBvd2VyLCBwb3dlcixcbiAgICAgICAgYyxcbiAgICAgICAgZGF0YSA9IHt2YWw6Z2V0TmV4dFZhbHVlKDApLCBwb3NpdGlvbjpyZXNldFZhbHVlLCBpbmRleDoxfTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICAgIGRpY3Rpb25hcnlbaV0gPSBpO1xuICAgIH1cblxuICAgIGJpdHMgPSAwO1xuICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiwyKTtcbiAgICBwb3dlcj0xO1xuICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgIH1cbiAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgcG93ZXIgPDw9IDE7XG4gICAgfVxuXG4gICAgc3dpdGNoIChuZXh0ID0gYml0cykge1xuICAgICAgY2FzZSAwOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiw4KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuICAgICAgICBjID0gZihiaXRzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDE2KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuICAgICAgICBjID0gZihiaXRzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBkaWN0aW9uYXJ5WzNdID0gYztcbiAgICB3ID0gYztcbiAgICByZXN1bHQucHVzaChjKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKGRhdGEuaW5kZXggPiBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9XG5cbiAgICAgIGJpdHMgPSAwO1xuICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLG51bUJpdHMpO1xuICAgICAgcG93ZXI9MTtcbiAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgIH1cbiAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKGMgPSBiaXRzKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsOCk7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRpY3Rpb25hcnlbZGljdFNpemUrK10gPSBmKGJpdHMpO1xuICAgICAgICAgIGMgPSBkaWN0U2l6ZS0xO1xuICAgICAgICAgIGVubGFyZ2VJbi0tO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDE2KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRpY3Rpb25hcnlbZGljdFNpemUrK10gPSBmKGJpdHMpO1xuICAgICAgICAgIGMgPSBkaWN0U2l6ZS0xO1xuICAgICAgICAgIGVubGFyZ2VJbi0tO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgIGVubGFyZ2VJbiA9IE1hdGgucG93KDIsIG51bUJpdHMpO1xuICAgICAgICBudW1CaXRzKys7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaWN0aW9uYXJ5W2NdKSB7XG4gICAgICAgIGVudHJ5ID0gZGljdGlvbmFyeVtjXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjID09PSBkaWN0U2l6ZSkge1xuICAgICAgICAgIGVudHJ5ID0gdyArIHcuY2hhckF0KDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaChlbnRyeSk7XG5cbiAgICAgIC8vIEFkZCB3K2VudHJ5WzBdIHRvIHRoZSBkaWN0aW9uYXJ5LlxuICAgICAgZGljdGlvbmFyeVtkaWN0U2l6ZSsrXSA9IHcgKyBlbnRyeS5jaGFyQXQoMCk7XG4gICAgICBlbmxhcmdlSW4tLTtcblxuICAgICAgdyA9IGVudHJ5O1xuXG4gICAgICBpZiAoZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgZW5sYXJnZUluID0gTWF0aC5wb3coMiwgbnVtQml0cyk7XG4gICAgICAgIG51bUJpdHMrKztcbiAgICAgIH1cblxuICAgIH1cbiAgfVxufTtcbiAgcmV0dXJuIExaU3RyaW5nO1xufSkoKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24gKCkgeyByZXR1cm4gTFpTdHJpbmc7IH0pO1xufSBlbHNlIGlmKCB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgIT0gbnVsbCApIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBMWlN0cmluZ1xufVxuIiwiLyogc2lsb3ouaW9cbiAqL1xuXG52YXIgZHVycnV0aSA9IHJlcXVpcmUoJ2R1cnJ1dGknKVxudmFyIE1haW4gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvbWFpbi5qcycpXG5cbmR1cnJ1dGkucmVuZGVyKE1haW4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHAnKSlcbiIsIi8qIGVkaXRvciBiYXJcbiAqL1xuXG5mdW5jdGlvbiBFZGl0b3JCYXIgKGFjdGlvbnMpIHtcbiAgdmFyIHBsdWdpbnMgPSBhY3Rpb25zLmdldFBsdWdpbnMoKVxuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBodG1sOiBbe1xuICAgICAgdGl0bGU6ICdIVE1MJ1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnTWFya2Rvd24nLFxuICAgICAgcGx1Z2luOiAnbWFya2Rvd24nXG4gICAgfV0sXG4gICAgY3NzOiBbe1xuICAgICAgdGl0bGU6ICdDU1MnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdMZXNzJyxcbiAgICAgIHBsdWdpbjogJ2xlc3MnXG4gICAgfSwge1xuICAgICAgdGl0bGU6ICdTdHlsdXMnLFxuICAgICAgcGx1Z2luOiAnc3R5bHVzJ1xuICAgIH1dLFxuICAgIGpzOiBbe1xuICAgICAgdGl0bGU6ICdKYXZhU2NyaXB0J1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnRVMyMDE1L0JhYmVsJyxcbiAgICAgIHBsdWdpbjogJ2JhYmVsJ1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnQ29mZmVlU2NyaXB0JyxcbiAgICAgIHBsdWdpbjogJ2NvZmZlZXNjcmlwdCdcbiAgICB9XVxuICB9XG5cbiAgdmFyIHNlbGVjdGVkID0ge1xuICAgIGh0bWw6ICcnLFxuICAgIGNzczogJycsXG4gICAganM6ICcnXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQbHVnaW4gKGxpc3QsIG5hbWUpIHtcbiAgICB2YXIgZm91bmRQbHVnaW4gPSBudWxsXG4gICAgbGlzdC5zb21lKChwbHVnaW4pID0+IHtcbiAgICAgIGlmIChwbHVnaW4ucGx1Z2luID09PSBuYW1lKSB7XG4gICAgICAgIGZvdW5kUGx1Z2luID0gcGx1Z2luXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmb3VuZFBsdWdpblxuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlUHJvY2Vzc29yICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIHJlbW92ZSBsYXN0IHNlbGVjdGVkIHBsdWdpblxuICAgICAgYWN0aW9ucy5yZW1vdmVQbHVnaW4oc2VsZWN0ZWRbdHlwZV0pXG5cbiAgICAgIC8vIHVwZGF0ZSByZWZlcmVuY2VcbiAgICAgIHNlbGVjdGVkW3R5cGVdID0gdGhpcy52YWx1ZVxuXG4gICAgICB2YXIgcGx1Z2luID0gZ2V0UGx1Z2luKG9wdGlvbnNbdHlwZV0sIHNlbGVjdGVkW3R5cGVdKVxuICAgICAgaWYgKHBsdWdpbikge1xuICAgICAgICBhY3Rpb25zLmFkZFBsdWdpbihwbHVnaW4ucGx1Z2luKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNlbGVjdCAodHlwZSwgb3B0aW9ucywgc2VsZWN0ZWQpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPHNlbGVjdCBjbGFzcz1cInNlbGVjdCBlZGl0b3ItYmFyLXNlbGVjdC0ke3R5cGV9XCI+XG4gICAgICAgICR7b3B0aW9ucy5tYXAoKG9wdCkgPT4ge1xuICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiJHtvcHQucGx1Z2luIHx8ICcnfVwiICR7b3B0LnBsdWdpbiA9PT0gc2VsZWN0ZWQgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgICAke29wdC50aXRsZX1cbiAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgfSkuam9pbignJyl9XG4gICAgICA8L3NlbGVjdD5cbiAgICBgXG4gIH1cblxuICBmdW5jdGlvbiBzZXRJbml0aWFsVmFsdWVzICgpIHtcbiAgICAvLyBzZXQgc2VsZWN0ZWQgdmFsdWVzIGJhc2VkIG9uIHN0b3JlXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgb3B0aW9uc1t0eXBlXS5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgICAgaWYgKHBsdWdpbnMuaW5kZXhPZihvcHRpb24ucGx1Z2luKSAhPT0gLTEpIHtcbiAgICAgICAgICBzZWxlY3RlZFt0eXBlXSA9IG9wdGlvbi5wbHVnaW5cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VQYW5lICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBwYW5lcyA9IHt9XG4gICAgICBwYW5lc1t0eXBlXSA9IHtcbiAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICB9XG5cbiAgICAgIGFjdGlvbnMudXBkYXRlUGFuZXMocGFuZXMpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gICAgZm9yIChsZXQgdHlwZSBvZiBbICdodG1sJywgJ2NzcycsICdqcycgXSkge1xuICAgICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuZWRpdG9yLWJhci1zZWxlY3QtJHt0eXBlfWApLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZVByb2Nlc3Nvcih0eXBlKSlcblxuICAgICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuZWRpdG9yLWJhci1wYW5lLWNsb3NlLSR7dHlwZX1gKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlUGFuZSh0eXBlKSlcbiAgICB9XG4gIH1cblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZXRJbml0aWFsVmFsdWVzKClcblxuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lIGVkaXRvci1iYXItcGFuZS1odG1sXCI+XG4gICAgICAgICAgJHtjcmVhdGVTZWxlY3QoJ2h0bWwnLCBvcHRpb25zLmh0bWwsIHNlbGVjdGVkLmh0bWwpfVxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUtY2xvc2UgZWRpdG9yLWJhci1wYW5lLWNsb3NlLWh0bWwgYnRuXCIgdGl0bGU9XCJIaWRlIEhUTUxcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpY29uLWNsb3NlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZSBlZGl0b3ItYmFyLXBhbmUtY3NzXCI+XG4gICAgICAgICAgJHtjcmVhdGVTZWxlY3QoJ2NzcycsIG9wdGlvbnMuY3NzLCBzZWxlY3RlZC5jc3MpfVxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUtY2xvc2UgZWRpdG9yLWJhci1wYW5lLWNsb3NlLWNzcyBidG5cIiB0aXRsZT1cIkhpZGUgQ1NTXCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImljb24gaWNvbi1jbG9zZVwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUgZWRpdG9yLWJhci1wYW5lLWpzXCI+XG4gICAgICAgICAgJHtjcmVhdGVTZWxlY3QoJ2pzJywgb3B0aW9ucy5qcywgc2VsZWN0ZWQuanMpfVxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUtY2xvc2UgZWRpdG9yLWJhci1wYW5lLWNsb3NlLWpzIGJ0blwiIHRpdGxlPVwiSGlkZSBKYXZhU2NyaXB0XCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImljb24gaWNvbi1jbG9zZVwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmVcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvckJhclxuIiwiLyogZWRpdG9yIHdpZGdldFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgSm90dGVkID0gcmVxdWlyZSgnam90dGVkJylcbnZhciBnbG9iYWxBY3Rpb25zXG5cbi8vIGpvdHRlZCBwbHVnaW5cbkpvdHRlZC5wbHVnaW4oJ3NpbG96JywgZnVuY3Rpb24gKGpvdHRlZCwgb3B0aW9ucykge1xuICBqb3R0ZWQub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgZ2xvYmFsQWN0aW9ucy51cGRhdGVGaWxlKHtcbiAgICAgIHR5cGU6IHBhcmFtcy50eXBlLFxuICAgICAgY29udGVudDogcGFyYW1zLmNvbnRlbnRcbiAgICB9KVxuXG4gICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKVxuICB9LCAyKVxufSlcblxudmFyIHBsdWdpbkxpYnMgPSB7XG4gIG1hcmtkb3duOiBbJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL21hcmtlZC8wLjMuNi9tYXJrZWQubWluLmpzJ10sXG4gIGxlc3M6IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbGVzcy5qcy8yLjcuMS9sZXNzLm1pbi5qcyddLFxuICBzdHlsdXM6IFsnL2xpYnMvc3R5bHVzLm1pbi5qcyddLFxuICBjb2ZmZWVzY3JpcHQ6IFsnaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9qYXNoa2VuYXMvY29mZmVlc2NyaXB0LzEuMTEuMS9leHRyYXMvY29mZmVlLXNjcmlwdC5qcyddLFxuICBlczIwMTU6IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvYmFiZWwtY29yZS82LjEuMTkvYnJvd3Nlci5taW4uanMnXVxufVxuXG5mdW5jdGlvbiBFZGl0b3JXaWRnZXQgKGFjdGlvbnMpIHtcbiAgZ2xvYmFsQWN0aW9ucyA9IGFjdGlvbnNcblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICB2YXIgcGx1Z2lucyA9IGFjdGlvbnMuZ2V0UGx1Z2lucygpXG4gICAgdmFyIGxpYnMgPSBbXVxuXG4gICAgLy8gbG9hZCBsaWJzXG4gICAgT2JqZWN0LmtleXMocGx1Z2luTGlicykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgaWYgKHBsdWdpbnMuaW5kZXhPZihuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkobGlicywgcGx1Z2luTGlic1tuYW1lXS5tYXAoKHVybCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoZG9uZSkgPT4ge1xuICAgICAgICAgICAgdXRpbC5sb2FkU2NyaXB0KHVybCwgZG9uZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShwbHVnaW5zLCBbXG4gICAgICAnc2lsb3onLFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29kZW1pcnJvcicsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICB0aGVtZTogYWN0aW9ucy5nZXRUaGVtZSgpLFxuICAgICAgICAgIGxpbmVXcmFwcGluZzogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSlcblxuICAgIHV0aWwuYXN5bmMobGlicywgKCkgPT4ge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tbmV3ICovXG4gICAgICBuZXcgSm90dGVkKCRjb250YWluZXIsIHtcbiAgICAgICAgZmlsZXM6IGFjdGlvbnMuZ2V0RmlsZXMoKSxcbiAgICAgICAgcGx1Z2luczogcGx1Z2luc1xuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZWRpdG9yLXdpZGdldCBqb3R0ZWQtdGhlbWUtc2lsb3pcIj48L2Rpdj4nXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JXaWRnZXRcbiIsIi8qIGVkaXRvclxuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgRWRpdG9yQmFyID0gcmVxdWlyZSgnLi9lZGl0b3ItYmFyJylcbnZhciBFZGl0b3JXaWRnZXQgPSByZXF1aXJlKCcuL2VkaXRvci13aWRnZXQnKVxuXG5mdW5jdGlvbiBFZGl0b3IgKGFjdGlvbnMpIHtcbiAgdmFyIHBhbmVzID0gYWN0aW9ucy5nZXRQYW5lcygpXG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JcbiAgICAgICAgJHtwYW5lcy5odG1sLmhpZGRlbiA/ICdlZGl0b3ItaXMtaGlkZGVuLWh0bWwnIDogJyd9XG4gICAgICAgICR7cGFuZXMuY3NzLmhpZGRlbiA/ICdlZGl0b3ItaXMtaGlkZGVuLWNzcycgOiAnJ31cbiAgICAgICAgJHtwYW5lcy5qcy5oaWRkZW4gPyAnZWRpdG9yLWlzLWhpZGRlbi1qcycgOiAnJ31cbiAgICAgIFwiPlxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBFZGl0b3JCYXIoYWN0aW9ucykpfVxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBFZGl0b3JXaWRnZXQoYWN0aW9ucykpfVxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yXG4iLCIvKiBoZWFkZXJcbiAqL1xuXG52YXIgZHVycnV0aSA9IHJlcXVpcmUoJ2R1cnJ1dGknKVxudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpXG52YXIgU2hhcmUgPSByZXF1aXJlKCcuL3NoYXJlJylcblxudmFyIEludGVybmFsU3RvcmUgPSByZXF1aXJlKCcuLi8uLi9zdGF0ZS9zdG9yZS1pbnRlcm5hbCcpXG52YXIgc3RvcmVJbnRlcm5hbCA9IG5ldyBJbnRlcm5hbFN0b3JlKClcblxuZnVuY3Rpb24gSGVhZGVyIChhY3Rpb25zKSB7XG4gIHZhciAkY29udGFpbmVyXG4gIHZhciBkYXRhID0gc3RvcmVJbnRlcm5hbC5nZXQoKVxuICB2YXIgYWN0aW9uc0ludGVybmFsID0gc3RvcmVJbnRlcm5hbC5hY3Rpb25zXG4gIHZhciBsb2FkaW5nQ29sbGFib3JhdGUgPSBhY3Rpb25zSW50ZXJuYWwuZ2V0TG9hZGluZygnY29sbGFib3JhdGUnKVxuXG4gIHZhciBjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBzdG9yZUludGVybmFsLmdldCgpXG5cbiAgICAvLyBpZiBzb21ldGhpbmcgY2hhbmdlZC5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGF0YSkgIT09IEpTT04uc3RyaW5naWZ5KG5ld0RhdGEpKSB7XG4gICAgICBkdXJydXRpLnJlbmRlcihuZXcgSGVhZGVyKGFjdGlvbnMpLCAkY29udGFpbmVyKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUgKCkge1xuICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVMb2FkaW5nKCdjb2xsYWJvcmF0ZScsIGZhbHNlKVxuICB9XG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkbm9kZSkge1xuICAgICRjb250YWluZXIgPSAkbm9kZVxuXG4gICAgJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY29sbGFib3JhdGUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIC8vIGxvYWRpbmdcbiAgICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVMb2FkaW5nKCdjb2xsYWJvcmF0ZScsIHRydWUpXG5cbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTKClcblxuICAgICAgd2luZG93LlRvZ2V0aGVySlMub24oJ3JlYWR5JywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTLm9uKCdjbG9zZScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgfSlcblxuICAgIHN0b3JlSW50ZXJuYWwub24oJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAod2luZG93LlRvZ2V0aGVySlMpIHtcbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTLm9mZigncmVhZHknLCBkb25lTG9hZGluZ0NvbGxhYm9yYXRlKVxuICAgICAgd2luZG93LlRvZ2V0aGVySlMub2ZmKCdjbG9zZScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgfVxuXG4gICAgc3RvcmVJbnRlcm5hbC5vZmYoJ2NoYW5nZScsIGNoYW5nZSlcbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgXG4gICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgIDxhIGhyZWY9XCIvXCIgY2xhc3M9XCJoZWFkZXItbG9nb1wiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiL2ltYWdlcy9sb2dvLnBuZ1wiIGhlaWdodD1cIjE2XCIgYWx0PVwic2lsb3ouaW9cIj5cbiAgICAgICAgPC9hPlxuXG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IFNldHRpbmdzKGFjdGlvbnMsIHN0b3JlSW50ZXJuYWwuYWN0aW9ucykpfVxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBTaGFyZShhY3Rpb25zLCBzdG9yZUludGVybmFsLmFjdGlvbnMpKX1cblxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBjb2xsYWJvcmF0ZSAke2xvYWRpbmdDb2xsYWJvcmF0ZSA/ICdpcy1sb2FkaW5nJyA6ICcnfVwiPlxuICAgICAgICAgIENvbGxhYm9yYXRlXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyXG4iLCIvKiBzZXR0aW5nc1xuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgUG9wdXAgPSByZXF1aXJlKCcuLi9wb3B1cCcpXG5cbmZ1bmN0aW9uIFNldHRpbmdzIChhY3Rpb25zLCBhY3Rpb25zSW50ZXJuYWwpIHtcbiAgdmFyIHNlbGYgPSB1dGlsLmluaGVyaXRzKHRoaXMsIFBvcHVwKVxuICBQb3B1cC5jYWxsKHNlbGYsICdzZXR0aW5ncycsIGFjdGlvbnNJbnRlcm5hbClcblxuICB2YXIgcGFuZXMgPSBhY3Rpb25zLmdldFBhbmVzKClcbiAgdmFyIHRoZW1lID0gYWN0aW9ucy5nZXRUaGVtZSgpXG5cbiAgZnVuY3Rpb24gdG9nZ2xlUGFuZSAodHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHBhbmVzID0ge31cbiAgICAgIHBhbmVzW3R5cGVdID0geyBoaWRkZW46ICEoZS50YXJnZXQuY2hlY2tlZCkgfVxuICAgICAgcmV0dXJuIGFjdGlvbnMudXBkYXRlUGFuZXMocGFuZXMpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0VGhlbWUgKCkge1xuICAgIGFjdGlvbnMudXBkYXRlVGhlbWUodGhpcy52YWx1ZSlcbiAgfVxuXG4gIHNlbGYubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIHNlbGYuc3VwZXIubW91bnQuY2FsbChzZWxmLCAkY29udGFpbmVyKVxuXG4gICAgdmFyICRzaG93SHRtbCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXNob3ctaHRtbCcpXG4gICAgdmFyICRzaG93Q3NzID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3Mtc2hvdy1jc3MnKVxuICAgIHZhciAkc2hvd0pzID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3Mtc2hvdy1qcycpXG5cbiAgICAkc2hvd0h0bWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdG9nZ2xlUGFuZSgnaHRtbCcpKVxuICAgICRzaG93Q3NzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRvZ2dsZVBhbmUoJ2NzcycpKVxuICAgICRzaG93SnMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdG9nZ2xlUGFuZSgnanMnKSlcblxuICAgICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXRoZW1lJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgc2V0VGhlbWUpXG4gIH1cblxuICBzZWxmLnVubW91bnQgPSBzZWxmLnN1cGVyLnVubW91bnQuYmluZChzZWxmKVxuXG4gIHNlbGYucmVuZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiBzZWxmLnN1cGVyLnJlbmRlci5jYWxsKHNlbGYsICdTZXR0aW5ncycsIGBcbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxlZ2VuZD5cbiAgICAgICAgICBUYWJzXG4gICAgICAgIDwvbGVnZW5kPlxuXG4gICAgICAgIDxsYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJzZXR0aW5ncy1zaG93LWh0bWxcIiAkeyFwYW5lcy5odG1sLmhpZGRlbiA/ICdjaGVja2VkJyA6ICcnfT5cbiAgICAgICAgICBIVE1MXG4gICAgICAgIDwvbGFiZWw+XG5cbiAgICAgICAgPGxhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cInNldHRpbmdzLXNob3ctY3NzXCIgJHshcGFuZXMuY3NzLmhpZGRlbiA/ICdjaGVja2VkJyA6ICcnfT5cbiAgICAgICAgICBDU1NcbiAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2V0dGluZ3Mtc2hvdy1qc1wiICR7IXBhbmVzLmpzLmhpZGRlbiA/ICdjaGVja2VkJyA6ICcnfT5cbiAgICAgICAgICBKYXZhU2NyaXB0XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L2ZpZWxkc2V0PlxuXG4gICAgICA8ZmllbGRzZXQ+XG4gICAgICAgIDxsZWdlbmQ+XG4gICAgICAgICAgVGhlbWVcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPHNlbGVjdCBjbGFzcz1cInNldHRpbmdzLXRoZW1lIHNlbGVjdFwiPlxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJzb2xhcml6ZWQgbGlnaHRcIiAke3RoZW1lID09PSAnc29sYXJpemVkIGxpZ2h0JyA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICBTb2xhcml6ZWQgTGlnaHRcbiAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwic29sYXJpemVkIGRhcmtcIiAke3RoZW1lID09PSAnc29sYXJpemVkIGRhcmsnID8gJ3NlbGVjdGVkJyA6ICcnfT5cbiAgICAgICAgICAgIFNvbGFyaXplZCBEYXJrXG4gICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgPC9maWVsZHNldD5cbiAgICBgKVxuICB9XG5cbiAgcmV0dXJuIHNlbGZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nc1xuIiwiLyogc2hhcmVcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxudmFyIFBvcHVwID0gcmVxdWlyZSgnLi4vcG9wdXAnKVxuXG5mdW5jdGlvbiBTaGFyZSAoYWN0aW9ucywgYWN0aW9uc0ludGVybmFsKSB7XG4gIHZhciBzZWxmID0gdXRpbC5pbmhlcml0cyh0aGlzLCBQb3B1cClcbiAgUG9wdXAuY2FsbChzZWxmLCAnc2hhcmUnLCBhY3Rpb25zSW50ZXJuYWwpXG5cbiAgdmFyIHNob3J0VXJsID0gYWN0aW9ucy5nZXRTaG9ydFVybCgpXG4gIHZhciBsb25nVXJsID0gJydcbiAgdmFyIHdhdGNoZXJcblxuICB2YXIgZ2VuZXJhdGluZyA9IGFjdGlvbnNJbnRlcm5hbC5nZXRMb2FkaW5nKCdnZW5lcmF0ZS11cmwnKVxuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvbmdVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICB9XG5cbiAgZnVuY3Rpb24gY29weSAoJGlucHV0KSB7XG4gICAgcmV0dXJuIChlKSA9PiB7XG4gICAgICB2YXIgJGJ0biA9IHV0aWwuY2xvc2VzdChlLnRhcmdldCwgJy5idG4nKVxuXG4gICAgICAkaW5wdXQuc2VsZWN0KClcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuXG4gICAgICAgICRidG4uaW5uZXJIVE1MID0gJ0NvcGllZCdcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgJGJ0bi5pbm5lckhUTUwgPSAnQ29weSdcbiAgICAgICAgfSwgMjAwMClcbiAgICAgIH0gY2F0Y2ggKGVycikge31cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZSAoKSB7XG4gICAgLy8gbG9hZGluZ1xuICAgIGFjdGlvbnNJbnRlcm5hbC51cGRhdGVMb2FkaW5nKCdnZW5lcmF0ZS11cmwnLCB0cnVlKVxuXG4gICAgYWN0aW9ucy51cGRhdGVTaG9ydFVybCgoKSA9PiB7XG4gICAgICBhY3Rpb25zSW50ZXJuYWwudXBkYXRlTG9hZGluZygnZ2VuZXJhdGUtdXJsJywgZmFsc2UpXG4gICAgfSlcbiAgfVxuXG4gIHNlbGYubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIHNlbGYuc3VwZXIubW91bnQuY2FsbChzZWxmLCAkY29udGFpbmVyKVxuXG4gICAgdmFyICRzaG9ydFVybCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNoYXJlLXVybC1pbnB1dC1zaG9ydCcpXG4gICAgdmFyICRzaG9ydFVybENvcHkgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZS11cmwtY29weS1zaG9ydCcpXG4gICAgdmFyICRsb25nVXJsID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtdXJsLWlucHV0LWxvbmcnKVxuICAgIHZhciAkbG9uZ1VybENvcHkgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZS11cmwtY29weS1sb25nJylcblxuICAgICRzaG9ydFVybENvcHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb3B5KCRzaG9ydFVybCkpXG4gICAgJGxvbmdVcmxDb3B5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY29weSgkbG9uZ1VybCkpXG5cbiAgICB2YXIgJGdlbmVyYXRlU2hvcnQgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZS1nZW5lcmF0ZScpXG4gICAgJGdlbmVyYXRlU2hvcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBnZW5lcmF0ZSlcblxuICAgIGlmIChzaG9ydFVybCkge1xuICAgICAgLy8gZ2l2ZSBpdCBhIHNlYyxcbiAgICAgIC8vIHRvIG5vdCB0cmlnZ2VyIHVybCB1cGRhdGUgb24gbG9hZCxcbiAgICAgIC8vIGFuZCBmb3JjZSB1cmwgZ2VuZXJhdGlvbiBldmVuIGlmIG5vdGhpbmcgd2FzIGNoYW5nZWQsXG4gICAgICAvLyBvbiBmb3JlaWduIGNsaWVudHMuXG4gICAgICB3YXRjaGVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFjdGlvbnMuc3RhcnRTaG9ydFVybFVwZGF0ZXIoKVxuICAgICAgfSwgMTAwMClcbiAgICB9XG4gIH1cblxuICBzZWxmLnVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5zdXBlci51bm1vdW50LmNhbGwoc2VsZilcblxuICAgIGlmICh3YXRjaGVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQod2F0Y2hlcilcbiAgICB9XG5cbiAgICBpZiAoc2hvcnRVcmwpIHtcbiAgICAgIGFjdGlvbnMuc3RvcFNob3J0VXJsVXBkYXRlcigpXG4gICAgfVxuICB9XG5cbiAgc2VsZi5yZW5kZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGYuc3VwZXIucmVuZGVyLmNhbGwoc2VsZiwgJ1NoYXJlJywgYFxuICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiJHtzaG9ydFVybCA/ICdzaGFyZS1pcy1nZW5lcmF0ZWQnIDogJyd9XCI+XG4gICAgICAgIDxsZWdlbmQ+XG4gICAgICAgICAgU2hvcnQgVVJMXG4gICAgICAgIDwvbGVnZW5kPlxuXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHNoYXJlLWdlbmVyYXRlICR7Z2VuZXJhdGluZyA/ICdpcy1sb2FkaW5nJyA6ICcnfVwiPlxuICAgICAgICAgIEdlbmVyYXRlIFNob3J0IFVSTFxuICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwic2hhcmUtdXJsIHNoYXJlLXVybC1zaG9ydFwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2hhcmUtdXJsLWlucHV0IHNoYXJlLXVybC1pbnB1dC1zaG9ydFwiIHZhbHVlPVwiJHtzaG9ydFVybH1cIiByZWFkb25seT5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBzaGFyZS11cmwtY29weSBzaGFyZS11cmwtY29weS1zaG9ydFwiPlxuICAgICAgICAgICAgQ29weVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgICA8ZmllbGRzZXQ+XG4gICAgICAgIDxsZWdlbmQ+XG4gICAgICAgICAgUGVyc2lzdGVudCBVUkxcbiAgICAgICAgPC9sZWdlbmQ+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNoYXJlLXVybFwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2hhcmUtdXJsLWlucHV0IHNoYXJlLXVybC1pbnB1dC1sb25nXCIgdmFsdWU9XCIke2xvbmdVcmx9XCIgcmVhZG9ubHk+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gc2hhcmUtdXJsLWNvcHkgc2hhcmUtdXJsLWNvcHktbG9uZ1wiPlxuICAgICAgICAgICAgQ29weVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgYClcbiAgfVxuXG4gIHJldHVybiBzZWxmXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVcbiIsIi8qIG1haW5cbiAqL1xuXG52YXIgZHVycnV0aSA9IHJlcXVpcmUoJ2R1cnJ1dGknKVxudmFyIEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyL2hlYWRlcicpXG52YXIgRWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3IvZWRpdG9yJylcblxudmFyIEdsb2JhbFN0b3JlID0gcmVxdWlyZSgnLi4vc3RhdGUvc3RvcmUnKVxudmFyIHN0b3JlID0gbmV3IEdsb2JhbFN0b3JlKClcblxuZnVuY3Rpb24gTWFpbiAoKSB7XG4gIHZhciAkY29udGFpbmVyXG4gIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgdmFyIHRoZW1lID0gc3RvcmUuYWN0aW9ucy5nZXRUaGVtZSgpXG5cbiAgdmFyIGNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmV3RGF0YSA9IHN0b3JlLmdldCgpXG5cbiAgICAvLyBkb24ndCBjb21wYXJlIGZpbGVzXG4gICAgZGVsZXRlIGRhdGEuZmlsZXNcbiAgICBkZWxldGUgbmV3RGF0YS5maWxlc1xuXG4gICAgLy8gaWYgc29tZXRoaW5nIGNoYW5nZWQsXG4gICAgLy8gZXhjZXB0IHRoZSBmaWxlcy5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGF0YSkgIT09IEpTT04uc3RyaW5naWZ5KG5ld0RhdGEpKSB7XG4gICAgICBkdXJydXRpLnJlbmRlcihNYWluLCAkY29udGFpbmVyKVxuICAgIH1cbiAgfVxuXG4gIHRoaXMubW91bnQgPSBmdW5jdGlvbiAoJG5vZGUpIHtcbiAgICAkY29udGFpbmVyID0gJG5vZGVcblxuICAgIHN0b3JlLm9uKCdjaGFuZ2UnLCBjaGFuZ2UpXG4gIH1cblxuICB0aGlzLnVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3RvcmUub2ZmKCdjaGFuZ2UnLCBjaGFuZ2UpXG4gIH1cblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1haW4gc2lsb3otdGhlbWUtJHt0aGVtZS5yZXBsYWNlKC8gL2csICctJyl9XCI+XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEhlYWRlcihzdG9yZS5hY3Rpb25zKSl9XG4gICAgICAgICR7ZHVycnV0aS5yZW5kZXIobmV3IEVkaXRvcihzdG9yZS5hY3Rpb25zKSl9XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYWluXG4iLCIvKiBwb3B1cFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpXG5cbmZ1bmN0aW9uIFBvcHVwIChuYW1lLCBhY3Rpb25zKSB7XG4gIHRoaXMubmFtZSA9IG5hbWVcbiAgdGhpcy5zdGF0ZSA9IGFjdGlvbnMuZ2V0UG9wdXAobmFtZSlcbiAgdGhpcy5hY3Rpb25zID0gYWN0aW9uc1xuICB0aGlzLnRvZ2dsZVBvcHVwID0gdGhpcy5wcm90b3R5cGUudG9nZ2xlUG9wdXAuYmluZCh0aGlzKVxuICB0aGlzLmhpZGVQb3B1cCA9IHRoaXMucHJvdG90eXBlLmhpZGVQb3B1cC5iaW5kKHRoaXMpXG59XG5cblBvcHVwLnByb3RvdHlwZS50b2dnbGVQb3B1cCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlXG4gIHRoaXMuYWN0aW9ucy51cGRhdGVQb3B1cCh0aGlzLm5hbWUsIHRoaXMuc3RhdGUpXG59XG5cblBvcHVwLnByb3RvdHlwZS5oaWRlUG9wdXAgPSBmdW5jdGlvbiAoZSkge1xuICBpZiAodXRpbC5jbG9zZXN0KGUudGFyZ2V0LCAnLnBvcHVwJykgfHwgZS50YXJnZXQgPT09IHRoaXMuJGJ1dHRvbiB8fCAhdGhpcy5zdGF0ZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5hY3Rpb25zLnVwZGF0ZVBvcHVwKHRoaXMubmFtZSwgZmFsc2UpXG59XG5cblBvcHVwLnByb3RvdHlwZS5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gIHRoaXMuJGNvbnRhaW5lciA9ICRjb250YWluZXJcbiAgdGhpcy4kYnV0dG9uID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcucG9wdXAtYnV0dG9uJylcblxuICB0aGlzLiRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnRvZ2dsZVBvcHVwKVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGlkZVBvcHVwKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUudW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhpZGVQb3B1cClcbn1cblxuUG9wdXAucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICh0aXRsZSwgY29udGVudCkge1xuICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9XCJwb3B1cC1jb250YWluZXIgJHt0aGlzLm5hbWV9ICR7dGhpcy5zdGF0ZSA/ICdwb3B1cC1jb250YWluZXItaXMtb3BlbicgOiAnJ31cIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiJHt0aGlzLm5hbWV9LWJ1dHRvbiBwb3B1cC1idXR0b24gYnRuXCI+XG4gICAgICAgICR7dGl0bGV9XG4gICAgICA8L2J1dHRvbj5cblxuICAgICAgPGZvcm0gY2xhc3M9XCIke3RoaXMubmFtZX0tcG9wdXAgcG9wdXBcIj5cbiAgICAgICAgJHtjb250ZW50fVxuICAgICAgPC9mb3JtPlxuICAgIDwvZGl2PlxuICBgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUG9wdXBcbiIsIi8qIHN0b3JlIGFjdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBhY3Rpb25zIChzdG9yZSkge1xuICBmdW5jdGlvbiBnZXRQb3B1cCAobmFtZSkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5wb3B1cFtuYW1lXVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUG9wdXAgKG5hbWUsIHN0YXRlKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEucG9wdXBbbmFtZV0gPSBzdGF0ZVxuXG4gICAgc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMb2FkaW5nIChuYW1lKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLmxvYWRpbmdbbmFtZV1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxvYWRpbmcgKG5hbWUsIHN0YXRlKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEubG9hZGluZ1tuYW1lXSA9IHN0YXRlXG5cbiAgICBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0UG9wdXA6IGdldFBvcHVwLFxuICAgIHVwZGF0ZVBvcHVwOiB1cGRhdGVQb3B1cCxcblxuICAgIGdldExvYWRpbmc6IGdldExvYWRpbmcsXG4gICAgdXBkYXRlTG9hZGluZzogdXBkYXRlTG9hZGluZ1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWN0aW9uc1xuIiwiLyogc3RvcmUgYWN0aW9uc1xuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgc2hvcnRVcmxTZXJ2aWNlID0gcmVxdWlyZSgnLi9zaG9ydC11cmwnKVxuXG5mdW5jdGlvbiBhY3Rpb25zIChzdG9yZSkge1xuICBmdW5jdGlvbiBnZXRGaWxlcyAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLmZpbGVzXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVGaWxlIChuZXdGaWxlKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuXG4gICAgZGF0YS5maWxlcy5zb21lKChmaWxlLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGZpbGUudHlwZSA9PT0gbmV3RmlsZS50eXBlKSB7XG4gICAgICAgIGRhdGEuZmlsZXNbaW5kZXhdID0gdXRpbC5leHRlbmQobmV3RmlsZSwgZGF0YS5maWxlc1tpbmRleF0pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBsdWdpbnMgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5wbHVnaW5zXG4gIH1cblxuICBmdW5jdGlvbiBhZGRQbHVnaW4gKG5ld1BsdWdpbikge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcblxuICAgIGRhdGEucGx1Z2lucy5wdXNoKG5ld1BsdWdpbilcbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVQbHVnaW4gKG9sZFBsdWdpbikge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICB2YXIgcGx1Z2luTmFtZSA9ICcnXG5cbiAgICBpZiAodHlwZW9mIG9sZFBsdWdpbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHBsdWdpbk5hbWUgPSBvbGRQbHVnaW4ubmFtZVxuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW5OYW1lID0gb2xkUGx1Z2luXG4gICAgfVxuXG4gICAgZGF0YS5wbHVnaW5zLnNvbWUoKHBsdWdpbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmICgodHlwZW9mIHBsdWdpbiA9PT0gJ29iamVjdCcgJiYgcGx1Z2luLm5hbWUgPT09IHBsdWdpbk5hbWUpIHx8XG4gICAgICAgICAgKHR5cGVvZiBwbHVnaW4gPT09ICdzdHJpbmcnICYmIHBsdWdpbiA9PT0gcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgZGF0YS5wbHVnaW5zLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGFuZXMgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5wYW5lc1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUGFuZXMgKG5ld1BhbmVzKSB7XG4gICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgIGRhdGEucGFuZXMgPSB1dGlsLmV4dGVuZChuZXdQYW5lcywgZGF0YS5wYW5lcylcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRoZW1lICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkudGhlbWVcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVRoZW1lICh0aGVtZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLnRoZW1lID0gdGhlbWVcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNob3J0VXJsICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkuc2hvcnRfdXJsXG4gIH1cblxuICB2YXIgbG9uZ1VybCA9ICcnXG5cbiAgZnVuY3Rpb24gdXBkYXRlU2hvcnRVcmwgKGZvcmNlLCBjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gICAgLy8gZm9yY2Ugbm90IGRlZmluZWQsIGJ1dCBjYWxsYmFjayBpc1xuICAgIGlmICh0eXBlb2YgZm9yY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gZm9yY2VcbiAgICAgIGZvcmNlID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBleGlzdGluZyBzaG9ydF91cmwncyxcbiAgICAvLyBjaGVjayBpZiB3aW5kb3cubG9jYXRpb24uaHJlZiBpcyBub3QgYWxyZWFkeSBzYXZlZFxuICAgIC8vIGFuZCB1cGRhdGUgbGluay5cbiAgICB2YXIgc2hvcnRVcmwgPSBnZXRTaG9ydFVybCgpXG4gICAgaWYgKCFzaG9ydFVybCB8fCBmb3JjZSkge1xuICAgICAgbG9uZ1VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG5cbiAgICAgIHNob3J0VXJsU2VydmljZS5jcmVhdGUoe1xuICAgICAgICBsb25nX3VybDogbG9uZ1VybFxuICAgICAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coZXJyKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEgPSBzdG9yZS5nZXQoKVxuICAgICAgICBkYXRhLnNob3J0X3VybCA9IHJlcy5zaG9ydF91cmxcbiAgICAgICAgc3RvcmUuc2V0KGRhdGEpXG5cbiAgICAgICAgLy8gYWZ0ZXIgc2hvcnRfdXJsIGlzIGFkZGVkIHRvIGhhc2gsXG4gICAgICAgIC8vIHVwZGF0ZSBsb25nX3VybCB0byBwb2ludCB0byB1cmwgd2l0aCBoYXNoLlxuICAgICAgICBsb25nVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcblxuICAgICAgICAvLyB1cGRhdGUgZXhpc3Rpbmcgc2hvcnQgdXJsXG4gICAgICAgIHNob3J0VXJsU2VydmljZS51cGRhdGUoe1xuICAgICAgICAgIGxvbmdfdXJsOiBsb25nVXJsLFxuICAgICAgICAgIHNob3J0X3VybDogcmVzLnNob3J0X3VybFxuICAgICAgICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coZXJyKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChsb25nVXJsICE9PSB3aW5kb3cubG9jYXRpb24uaHJlZikge1xuICAgICAgbG9uZ1VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG5cbiAgICAgIC8vIHVwZGF0ZSBleGlzdGluZyBzaG9ydCB1cmxcbiAgICAgIHNob3J0VXJsU2VydmljZS51cGRhdGUoe1xuICAgICAgICBsb25nX3VybDogbG9uZ1VybCxcbiAgICAgICAgc2hvcnRfdXJsOiBzaG9ydFVybFxuICAgICAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBzdG9wIHVybCB1cGRhdGVyLlxuICAgICAgICAgIHN0b3BTaG9ydFVybFVwZGF0ZXIoKVxuXG4gICAgICAgICAgLy8gZGVsZXRlIGV4aXN0aW5nIHNob3J0X3VybFxuICAgICAgICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICAgICAgICBkYXRhLnNob3J0X3VybCA9ICcnXG4gICAgICAgICAgc3RvcmUuc2V0KGRhdGEpXG5cbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coZXJyKVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICB2YXIgZGVib3VuY2VkVXBkYXRlU2hvcnRVcmwgPSB1dGlsLmRlYm91bmNlKHVwZGF0ZVNob3J0VXJsLCA1MDApXG5cbiAgZnVuY3Rpb24gc3RhcnRTaG9ydFVybFVwZGF0ZXIgKCkge1xuICAgIC8vIHVwZGF0ZSBzaG9ydCB1cmwgd2hlbiBkYXRhIGNoYW5nZXNcbiAgICBzdG9yZS5vbignY2hhbmdlJywgZGVib3VuY2VkVXBkYXRlU2hvcnRVcmwpXG4gIH1cblxuICBmdW5jdGlvbiBzdG9wU2hvcnRVcmxVcGRhdGVyICgpIHtcbiAgICAvLyBzdG9wIG1vbml0b3JpbmcgZGF0YSBjaGFuZ2VzXG4gICAgc3RvcmUub2ZmKCdjaGFuZ2UnLCBkZWJvdW5jZWRVcGRhdGVTaG9ydFVybClcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0RmlsZXM6IGdldEZpbGVzLFxuICAgIHVwZGF0ZUZpbGU6IHVwZGF0ZUZpbGUsXG5cbiAgICBnZXRQbHVnaW5zOiBnZXRQbHVnaW5zLFxuICAgIGFkZFBsdWdpbjogYWRkUGx1Z2luLFxuICAgIHJlbW92ZVBsdWdpbjogcmVtb3ZlUGx1Z2luLFxuXG4gICAgZ2V0UGFuZXM6IGdldFBhbmVzLFxuICAgIHVwZGF0ZVBhbmVzOiB1cGRhdGVQYW5lcyxcblxuICAgIGdldFRoZW1lOiBnZXRUaGVtZSxcbiAgICB1cGRhdGVUaGVtZTogdXBkYXRlVGhlbWUsXG5cbiAgICBnZXRTaG9ydFVybDogZ2V0U2hvcnRVcmwsXG4gICAgdXBkYXRlU2hvcnRVcmw6IHVwZGF0ZVNob3J0VXJsLFxuICAgIHN0YXJ0U2hvcnRVcmxVcGRhdGVyOiBzdGFydFNob3J0VXJsVXBkYXRlcixcbiAgICBzdG9wU2hvcnRVcmxVcGRhdGVyOiBzdG9wU2hvcnRVcmxVcGRhdGVyXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhY3Rpb25zXG4iLCIvKiBzaG9ydCB1cmwgYXBpXG4gKi9cblxuLy8gZW52IGRldGVjdGlvblxudmFyIGVudiA9ICdsb2NhbCdcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgIT09ICdsb2NhbGhvc3QnKSB7XG4gIGVudiA9ICdsaXZlJ1xufVxuXG52YXIgYXBpVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcbnZhciBzaG9ydFVybCA9IGFwaVVybFxuXG5pZiAoZW52ICE9PSAnbG9jYWwnKSB7XG4gIGFwaVVybCA9ICdodHRwczovL3ByYWppbmEtZ2hpbmRhLnJoY2xvdWQuY29tJ1xuICBzaG9ydFVybCA9ICdodHRwOi8vcy5zaWxvei5pbydcbn1cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJylcblxudmFyIHNlc3Npb25LZXkgPSAnc2lsb3otaW8nXG5cbmZ1bmN0aW9uIGdldFNlc3Npb24gKCkge1xuICB0cnkge1xuICAgIHZhciBjYWNoZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzZXNzaW9uS2V5KVxuICAgIGlmIChjYWNoZSkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY2FjaGUpXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cblxuICByZXR1cm4ge31cbn1cblxudmFyIHNlc3Npb24gPSBnZXRTZXNzaW9uKClcblxuZnVuY3Rpb24gc2F2ZVNlc3Npb24gKG5ld1Nlc3Npb24pIHtcbiAgc2Vzc2lvbiA9IHV0aWwuZXh0ZW5kKG5ld1Nlc3Npb24sIHNlc3Npb24pXG5cbiAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHNlc3Npb25LZXksIEpTT04uc3RyaW5naWZ5KHNlc3Npb24pKVxufVxuXG5mdW5jdGlvbiBjcmVhdGUgKGRhdGEsIGNhbGxiYWNrID0gKCkgPT4ge30pIHtcbiAgdXRpbC5mZXRjaChgJHthcGlVcmx9L2FwaS9gLCB7XG4gICAgdHlwZTogJ1BPU1QnLFxuICAgIGRhdGE6IGRhdGFcbiAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycilcbiAgICB9XG5cbiAgICAvLyBzZXQgZnVsbCB1cmwgZm9yIHNob3J0dXJsXG4gICAgcmVzLnNob3J0X3VybCA9IGAke3Nob3J0VXJsfS8ke3Jlcy5zaG9ydF91cmx9YFxuXG4gICAgLy8gc2F2ZSBzZXNzaW9uXG4gICAgc2F2ZVNlc3Npb24oe1xuICAgICAgdG9rZW46IHJlcy50b2tlblxuICAgIH0pXG5cbiAgICBjYWxsYmFjayhudWxsLCByZXMpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSAoZGF0YSwgY2FsbGJhY2sgPSAoKSA9PiB7fSkge1xuICAvLyByZW1vdmUgYXBpIHVybCBmcm9tIHNob3J0X3VybFxuICBkYXRhLnNob3J0X3VybCA9IGRhdGEuc2hvcnRfdXJsLnJlcGxhY2UoYCR7c2hvcnRVcmx9L2AsICcnKVxuXG4gIC8vIGFkZCB0b2tlblxuICBkYXRhLnRva2VuID0gc2Vzc2lvbi50b2tlblxuXG4gIHV0aWwuZmV0Y2goYCR7YXBpVXJsfS9hcGkvYCwge1xuICAgIHR5cGU6ICdQVVQnLFxuICAgIGRhdGE6IGRhdGFcbiAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycilcbiAgICB9XG5cbiAgICBjYWxsYmFjayhudWxsLCByZXMpXG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGNyZWF0ZSxcbiAgdXBkYXRlOiB1cGRhdGVcbn1cbiIsIi8qIGludGVybmFsIHN0b3JlLFxuICogbm90IHN0b3JlZCBpbiB1cmxcbiAqL1xuXG52YXIgU3RvcmUgPSByZXF1aXJlKCdkdXJydXRpL3N0b3JlJylcbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zLWludGVybmFsJylcblxudmFyIGRlZmF1bHRzID0ge1xuICBwb3B1cDoge30sXG4gIGxvYWRpbmc6IHt9XG59XG5cbnZhciBJbnRlcm5hbFN0b3JlID0gZnVuY3Rpb24gKCkge1xuICBTdG9yZS5jYWxsKHRoaXMpXG4gIHRoaXMuYWN0aW9ucyA9IGFjdGlvbnModGhpcylcblxuICB0aGlzLnNldChkZWZhdWx0cylcbn1cblxuSW50ZXJuYWxTdG9yZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFN0b3JlLnByb3RvdHlwZSlcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcm5hbFN0b3JlXG5cbiIsIi8qIHN0b3JlXG4gKi9cblxudmFyIFN0b3JlID0gcmVxdWlyZSgnZHVycnV0aS9zdG9yZScpXG52YXIgTFpTdHJpbmcgPSByZXF1aXJlKCdsei1zdHJpbmcnKVxudmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuL2FjdGlvbnMnKVxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJylcblxudmFyIGRlZmF1bHRzID0ge1xuICB2ZXJzaW9uOiAxLFxuICBmaWxlczogW3tcbiAgICB0eXBlOiAnaHRtbCcsXG4gICAgY29udGVudDogJydcbiAgfSwge1xuICAgIHR5cGU6ICdjc3MnLFxuICAgIGNvbnRlbnQ6ICcnXG4gIH0sIHtcbiAgICB0eXBlOiAnanMnLFxuICAgIGNvbnRlbnQ6ICcnXG4gIH1dLFxuICBwbHVnaW5zOiBbXSxcbiAgdGhlbWU6ICdzb2xhcml6ZWQgbGlnaHQnLFxuXG4gIC8vIHBhbmUgcHJvcGVydGllcyAoaGlkZGVuLCBldGMpXG4gIHBhbmVzOiB7XG4gICAgaHRtbDoge30sXG4gICAgY3NzOiB7fSxcbiAgICBqczoge31cbiAgfSxcblxuICBzaG9ydF91cmw6ICcnXG59XG5cbnZhciBHbG9iYWxTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgU3RvcmUuY2FsbCh0aGlzKVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zKHRoaXMpXG5cbiAgdmFyIGhhc2hEYXRhID0gbnVsbFxuXG4gIHRyeSB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICBoYXNoRGF0YSA9IEpTT04ucGFyc2UoTFpTdHJpbmcuZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50KHV0aWwuaGFzaCgncycpKSlcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge31cblxuICBpZiAoaGFzaERhdGEpIHtcbiAgICB0aGlzLnNldCh1dGlsLmV4dGVuZChoYXNoRGF0YSwgZGVmYXVsdHMpKVxuICB9IGVsc2Uge1xuICAgIHRoaXMuc2V0KGRlZmF1bHRzKVxuICB9XG5cbiAgdGhpcy5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgIC8vIHNhdmUgaW4gaGFzaFxuICAgIHZhciBkYXRhID0gdGhpcy5nZXQoKVxuXG4gICAgdmFyIGNvbXByZXNzZWQgPSBMWlN0cmluZy5jb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgJyMnICsgdXRpbC5oYXNoKCdzJywgY29tcHJlc3NlZCkpXG4gIH0pXG59XG5cbkdsb2JhbFN0b3JlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUucHJvdG90eXBlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdsb2JhbFN0b3JlXG5cbiIsIi8qIHV0aWxcbiAqL1xuXG5mdW5jdGlvbiBjbG9zZXN0ICgkZWxlbSwgc2VsZWN0b3IpIHtcbiAgLy8gZmluZCB0aGUgY2xvc2VzdCBwYXJlbnQgdGhhdCBtYXRjaGVzIHRoZSBzZWxlY3RvclxuICB2YXIgJG1hdGNoZXNcblxuICAvLyBsb29wIHRocm91Z2ggcGFyZW50c1xuICB3aGlsZSAoJGVsZW0gJiYgJGVsZW0gIT09IGRvY3VtZW50KSB7XG4gICAgaWYgKCRlbGVtLnBhcmVudE5vZGUpIHtcbiAgICAgIC8vIGZpbmQgYWxsIHNpYmxpbmdzIHRoYXQgbWF0Y2ggdGhlIHNlbGVjdG9yXG4gICAgICAkbWF0Y2hlcyA9ICRlbGVtLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgIC8vIGNoZWNrIGlmIG91ciBlbGVtZW50IGlzIG1hdGNoZWQgKHBvb3ItbWFuJ3MgRWxlbWVudC5tYXRjaGVzKCkpXG4gICAgICBpZiAoW10uaW5kZXhPZi5jYWxsKCRtYXRjaGVzLCAkZWxlbSkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiAkZWxlbVxuICAgICAgfVxuXG4gICAgICAvLyBnbyB1cCB0aGUgdHJlZVxuICAgICAgJGVsZW0gPSAkZWxlbS5wYXJlbnROb2RlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gY2xvbmUgKG9iaikge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxufVxuXG5mdW5jdGlvbiBleHRlbmRMZXZlbCAob2JqLCBkZWZhdWx0cyA9IHt9KSB7XG4gIC8vIGNvcHkgZGVmYXVsdCBrZXlzIHdoZXJlIHVuZGVmaW5lZFxuICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIGRlZmF1bHRcbiAgICAgIG9ialtrZXldID0gY2xvbmUoZGVmYXVsdHNba2V5XSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGV4dGVuZExldmVsKG9ialtrZXldLCBkZWZhdWx0c1trZXldKVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gb2JqXG59XG5cbi8vIG11bHRpLWxldmVsIG9iamVjdCBtZXJnZVxuZnVuY3Rpb24gZXh0ZW5kIChvYmosIGRlZmF1bHRzKSB7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB7fVxuICB9XG5cbiAgcmV0dXJuIGV4dGVuZExldmVsKGNsb25lKG9iaiksIGRlZmF1bHRzKVxufVxuXG5mdW5jdGlvbiBkZWJvdW5jZSAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gIHZhciB0aW1lb3V0XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzXG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHNcbiAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dFxuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQodGltZW91dClcbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcbiAgICBpZiAoY2FsbE5vdykge1xuICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0ICh1cmwsIGRvbmUgPSAoKSA9PiB7fSkge1xuICB2YXIgJHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICRzY3JpcHQuc3JjID0gdXJsXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoJHNjcmlwdClcblxuICAkc2NyaXB0Lm9ubG9hZCA9IGRvbmVcbn1cblxuZnVuY3Rpb24gYXN5bmMgKGFyciwgZG9uZSwgaSA9IDApIHtcbiAgaWYgKGFyci5sZW5ndGggPT09IGkpIHtcbiAgICByZXR1cm4gZG9uZSgpXG4gIH1cblxuICBhcnJbaV0oKCkgPT4ge1xuICAgIGkrK1xuICAgIGFzeW5jKGFyciwgZG9uZSwgaSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gZmV0Y2ggKHBhdGgsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIC8vIG9wdGlvbnMgbm90IHNwZWNpZmllZFxuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgIHR5cGU6ICdHRVQnLFxuICAgIGRhdGE6IHt9XG4gIH0pXG5cbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fVxuXG4gIHZhciByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gIHJlcXVlc3Qub3BlbihvcHRpb25zLnR5cGUsIHBhdGgpXG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD1VVEYtOCcpXG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpXG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgLy8gc3VjY2Vzc1xuICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0IHx8ICd7fScpXG5cbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVycm9yXG4gICAgICBjYWxsYmFjayhyZXF1ZXN0KVxuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBlcnJvclxuICAgIGNhbGxiYWNrKHJlcXVlc3QpXG4gIH1cblxuICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5kYXRhKSlcbn1cblxuZnVuY3Rpb24gaW5oZXJpdHMgKGJhc2VDbGFzcywgc3VwZXJDbGFzcykge1xuICBiYXNlQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSlcbiAgYmFzZUNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGJhc2VDbGFzc1xuXG4gIGJhc2VDbGFzcy5zdXBlciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihiYXNlQ2xhc3MucHJvdG90eXBlKVxuXG4gIHJldHVybiBiYXNlQ2xhc3Ncbn1cblxuZnVuY3Rpb24gaGFzaCAoa2V5LCB2YWx1ZSkge1xuICB2YXIgaGFzaFBhcnRzID0gW11cbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgaGFzaFBhcnRzID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpLnNwbGl0KCcmJylcbiAgfVxuXG4gIHZhciBwYXJzZWRIYXNoID0ge31cbiAgdmFyIHN0cmluZ0hhc2ggPSAnJ1xuXG4gIGhhc2hQYXJ0cy5mb3JFYWNoKChwYXJ0LCBpKSA9PiB7XG4gICAgdmFyIHN1YlBhcnRzID0gcGFydC5zcGxpdCgnPScpXG4gICAgcGFyc2VkSGFzaFtzdWJQYXJ0c1swXV0gPSBzdWJQYXJ0c1sxXSB8fCAnJ1xuICB9KVxuXG4gIGlmIChrZXkpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHBhcnNlZEhhc2hba2V5XSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXJzZWRIYXNoW2tleV1cbiAgICB9XG4gIH1cblxuICAvLyByZWJ1aWxkIHRvIHN0cmluZ1xuICBPYmplY3Qua2V5cyhwYXJzZWRIYXNoKS5mb3JFYWNoKChrZXksIGkpID0+IHtcbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHN0cmluZ0hhc2ggKz0gJyYnXG4gICAgfVxuXG4gICAgc3RyaW5nSGFzaCArPSBrZXlcblxuICAgIGlmIChwYXJzZWRIYXNoW2tleV0pIHtcbiAgICAgIHN0cmluZ0hhc2ggKz0gYD0ke3BhcnNlZEhhc2hba2V5XX1gXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBzdHJpbmdIYXNoXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjbG9uZTogY2xvbmUsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICBjbG9zZXN0OiBjbG9zZXN0LFxuICBkZWJvdW5jZTogZGVib3VuY2UsXG4gIGxvYWRTY3JpcHQ6IGxvYWRTY3JpcHQsXG4gIGFzeW5jOiBhc3luYyxcbiAgZmV0Y2g6IGZldGNoLFxuICBoYXNoOiBoYXNoLFxuXG4gIGluaGVyaXRzOiBpbmhlcml0c1xufVxuIl19
