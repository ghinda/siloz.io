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

},{"./components/main.js":13,"durruti":1}],6:[function(require,module,exports){
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

},{"../../util":20,"jotted":3}],8:[function(require,module,exports){
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

},{"../../util":20,"../popup":14}],10:[function(require,module,exports){
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

},{"../../state/store-internal":18,"./about":9,"./settings":11,"./share":12,"durruti":1}],11:[function(require,module,exports){
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

},{"../../util":20,"../popup":14}],12:[function(require,module,exports){
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

},{"../../util":20,"../popup":14}],13:[function(require,module,exports){
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

},{"../state/store":19,"./editor/editor":8,"./header/header":10,"durruti":1}],14:[function(require,module,exports){
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

},{"../util":20}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"../util":20,"./short-url":17}],17:[function(require,module,exports){
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
  apiUrl = 'https://s.siloz.io';
  shortUrl = apiUrl;
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

},{"../util":20}],18:[function(require,module,exports){
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

},{"./actions-internal":15,"durruti/store":2}],19:[function(require,module,exports){
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

},{"../util":20,"./actions":16,"durruti/store":2,"lz-string":4}],20:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZHVycnV0aS9kdXJydXRpLmpzIiwibm9kZV9tb2R1bGVzL2R1cnJ1dGkvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvam90dGVkL2pvdHRlZC5qcyIsIm5vZGVfbW9kdWxlcy9sei1zdHJpbmcvbGlicy9sei1zdHJpbmcuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbXBvbmVudHMvZWRpdG9yL2VkaXRvci1iYXIuanMiLCJzcmMvY29tcG9uZW50cy9lZGl0b3IvZWRpdG9yLXdpZGdldC5qcyIsInNyYy9jb21wb25lbnRzL2VkaXRvci9lZGl0b3IuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvYWJvdXQuanMiLCJzcmMvY29tcG9uZW50cy9oZWFkZXIvaGVhZGVyLmpzIiwic3JjL2NvbXBvbmVudHMvaGVhZGVyL3NldHRpbmdzLmpzIiwic3JjL2NvbXBvbmVudHMvaGVhZGVyL3NoYXJlLmpzIiwic3JjL2NvbXBvbmVudHMvbWFpbi5qcyIsInNyYy9jb21wb25lbnRzL3BvcHVwLmpzIiwic3JjL3N0YXRlL2FjdGlvbnMtaW50ZXJuYWwuanMiLCJzcmMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9zdGF0ZS9zaG9ydC11cmwuanMiLCJzcmMvc3RhdGUvc3RvcmUtaW50ZXJuYWwuanMiLCJzcmMvc3RhdGUvc3RvcmUuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JmQTs7O0FBR0EsSUFBSSxVQUFVLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBSSxPQUFPLFFBQVEsc0JBQVIsQ0FBWDs7QUFFQSxRQUFRLE1BQVIsQ0FBZSxJQUFmLEVBQXFCLFNBQVMsYUFBVCxDQUF1QixNQUF2QixDQUFyQjs7Ozs7QUNOQTs7O0FBR0EsU0FBUyxTQUFULENBQW9CLE9BQXBCLEVBQTZCO0FBQzNCLE1BQUksVUFBVSxRQUFRLFVBQVIsRUFBZDtBQUNBLE1BQUksVUFBVTtBQUNaLFVBQU0sQ0FBQztBQUNMLGFBQU87QUFERixLQUFELEVBRUg7QUFDRCxhQUFPLFVBRE47QUFFRCxjQUFRO0FBRlAsS0FGRyxDQURNO0FBT1osU0FBSyxDQUFDO0FBQ0osYUFBTztBQURILEtBQUQsRUFFRjtBQUNELGFBQU8sTUFETjtBQUVELGNBQVE7QUFGUCxLQUZFLEVBS0Y7QUFDRCxhQUFPLFFBRE47QUFFRCxjQUFRO0FBRlAsS0FMRSxDQVBPO0FBZ0JaLFFBQUksQ0FBQztBQUNILGFBQU87QUFESixLQUFELEVBRUQ7QUFDRCxhQUFPLGNBRE47QUFFRCxjQUFRO0FBRlAsS0FGQyxFQUtEO0FBQ0QsYUFBTyxjQUROO0FBRUQsY0FBUTtBQUZQLEtBTEM7QUFoQlEsR0FBZDs7QUEyQkEsTUFBSSxXQUFXO0FBQ2IsVUFBTSxFQURPO0FBRWIsU0FBSyxFQUZRO0FBR2IsUUFBSTtBQUhTLEdBQWY7O0FBTUEsV0FBUyxTQUFULENBQW9CLElBQXBCLEVBQTBCLElBQTFCLEVBQWdDO0FBQzlCLFFBQUksY0FBYyxJQUFsQjtBQUNBLFNBQUssSUFBTCxDQUFVLFVBQUMsTUFBRCxFQUFZO0FBQ3BCLFVBQUksT0FBTyxNQUFQLEtBQWtCLElBQXRCLEVBQTRCO0FBQzFCLHNCQUFjLE1BQWQ7QUFDQSxlQUFPLElBQVA7QUFDRDtBQUNGLEtBTEQ7O0FBT0EsV0FBTyxXQUFQO0FBQ0Q7O0FBRUQsV0FBUyxlQUFULENBQTBCLElBQTFCLEVBQWdDO0FBQzlCLFdBQU8sWUFBWTtBQUNqQjtBQUNBLGNBQVEsWUFBUixDQUFxQixTQUFTLElBQVQsQ0FBckI7O0FBRUE7QUFDQSxlQUFTLElBQVQsSUFBaUIsS0FBSyxLQUF0Qjs7QUFFQSxVQUFJLFNBQVMsVUFBVSxRQUFRLElBQVIsQ0FBVixFQUF5QixTQUFTLElBQVQsQ0FBekIsQ0FBYjtBQUNBLFVBQUksTUFBSixFQUFZO0FBQ1YsZ0JBQVEsU0FBUixDQUFrQixPQUFPLE1BQXpCO0FBQ0Q7QUFDRixLQVhEO0FBWUQ7O0FBRUQsV0FBUyxZQUFULENBQXVCLElBQXZCLEVBQTZCLE9BQTdCLEVBQXNDLFFBQXRDLEVBQWdEO0FBQzlDLGdFQUM0QyxJQUQ1QyxvQkFFTSxRQUFRLEdBQVIsQ0FBWSxVQUFDLEdBQUQsRUFBUztBQUNyQixnREFDbUIsSUFBSSxNQUFKLElBQWMsRUFEakMsWUFDd0MsSUFBSSxNQUFKLEtBQWUsUUFBZixHQUEwQixVQUExQixHQUF1QyxFQUQvRSwwQkFFTSxJQUFJLEtBRlY7QUFLRCxLQU5DLEVBTUMsSUFORCxDQU1NLEVBTk4sQ0FGTjtBQVdEOztBQUVELFdBQVMsZ0JBQVQsR0FBNkI7QUFDM0I7QUFDQSxXQUFPLElBQVAsQ0FBWSxPQUFaLEVBQXFCLE9BQXJCLENBQTZCLFVBQUMsSUFBRCxFQUFVO0FBQ3JDLGNBQVEsSUFBUixFQUFjLE9BQWQsQ0FBc0IsVUFBQyxNQUFELEVBQVk7QUFDaEMsWUFBSSxRQUFRLE9BQVIsQ0FBZ0IsT0FBTyxNQUF2QixNQUFtQyxDQUFDLENBQXhDLEVBQTJDO0FBQ3pDLG1CQUFTLElBQVQsSUFBaUIsT0FBTyxNQUF4QjtBQUNEO0FBQ0YsT0FKRDtBQUtELEtBTkQ7QUFPRDs7QUFFRCxXQUFTLFNBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7QUFDeEIsV0FBTyxZQUFZO0FBQ2pCLFVBQUksUUFBUSxFQUFaO0FBQ0EsWUFBTSxJQUFOLElBQWM7QUFDWixnQkFBUTtBQURJLE9BQWQ7O0FBSUEsY0FBUSxXQUFSLENBQW9CLEtBQXBCO0FBQ0QsS0FQRDtBQVFEOztBQUVELE9BQUssS0FBTCxHQUFhLFVBQVUsVUFBVixFQUFzQjtBQUFBLGVBQ2hCLENBQUUsTUFBRixFQUFVLEtBQVYsRUFBaUIsSUFBakIsQ0FEZ0I7O0FBQ2pDLDZDQUEwQztBQUFyQyxVQUFJLGVBQUo7QUFDSCxpQkFBVyxhQUFYLHlCQUErQyxJQUEvQyxFQUF1RCxnQkFBdkQsQ0FBd0UsUUFBeEUsRUFBa0YsZ0JBQWdCLElBQWhCLENBQWxGOztBQUVBLGlCQUFXLGFBQVgsNkJBQW1ELElBQW5ELEVBQTJELGdCQUEzRCxDQUE0RSxPQUE1RSxFQUFxRixVQUFVLElBQVYsQ0FBckY7QUFDRDtBQUNGLEdBTkQ7O0FBUUEsT0FBSyxNQUFMLEdBQWMsWUFBWTtBQUN4Qjs7QUFFQSx3SEFHUSxhQUFhLE1BQWIsRUFBcUIsUUFBUSxJQUE3QixFQUFtQyxTQUFTLElBQTVDLENBSFIsb1JBVVEsYUFBYSxLQUFiLEVBQW9CLFFBQVEsR0FBNUIsRUFBaUMsU0FBUyxHQUExQyxDQVZSLGlSQWlCUSxhQUFhLElBQWIsRUFBbUIsUUFBUSxFQUEzQixFQUErQixTQUFTLEVBQXhDLENBakJSO0FBMEJELEdBN0JEO0FBOEJEOztBQUVELE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7QUM3SUE7OztBQUdBLElBQUksT0FBTyxRQUFRLFlBQVIsQ0FBWDtBQUNBLElBQUksU0FBUyxRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQUksYUFBSjs7QUFFQTtBQUNBLE9BQU8sTUFBUCxDQUFjLE9BQWQsRUFBdUIsVUFBVSxNQUFWLEVBQWtCLE9BQWxCLEVBQTJCO0FBQ2hELFNBQU8sRUFBUCxDQUFVLFFBQVYsRUFBb0IsVUFBVSxNQUFWLEVBQWtCLFFBQWxCLEVBQTRCO0FBQzlDLGtCQUFjLFVBQWQsQ0FBeUI7QUFDdkIsWUFBTSxPQUFPLElBRFU7QUFFdkIsZUFBUyxPQUFPO0FBRk8sS0FBekI7O0FBS0EsYUFBUyxJQUFULEVBQWUsTUFBZjtBQUNELEdBUEQsRUFPRyxDQVBIO0FBUUQsQ0FURDs7QUFXQSxJQUFJLGFBQWE7QUFDZixZQUFVLENBQUMsbUVBQUQsQ0FESztBQUVmLFFBQU0sQ0FBQyxrRUFBRCxDQUZTO0FBR2YsVUFBUSxDQUFDLHFCQUFELENBSE87QUFJZixnQkFBYyxDQUFDLDhFQUFELENBSkM7QUFLZixVQUFRLENBQUMseUVBQUQ7QUFMTyxDQUFqQjs7QUFRQSxTQUFTLFlBQVQsQ0FBdUIsT0FBdkIsRUFBZ0M7QUFDOUIsa0JBQWdCLE9BQWhCOztBQUVBLE9BQUssS0FBTCxHQUFhLFVBQVUsVUFBVixFQUFzQjtBQUNqQyxRQUFJLFVBQVUsUUFBUSxVQUFSLEVBQWQ7QUFDQSxRQUFJLE9BQU8sRUFBWDs7QUFFQTtBQUNBLFdBQU8sSUFBUCxDQUFZLFVBQVosRUFBd0IsT0FBeEIsQ0FBZ0MsVUFBQyxJQUFELEVBQVU7QUFDeEMsVUFBSSxRQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsTUFBMEIsQ0FBQyxDQUEvQixFQUFrQztBQUNoQyxjQUFNLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckIsQ0FBMkIsSUFBM0IsRUFBaUMsV0FBVyxJQUFYLEVBQWlCLEdBQWpCLENBQXFCLFVBQUMsR0FBRCxFQUFTO0FBQzdELGlCQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsaUJBQUssVUFBTCxDQUFnQixHQUFoQixFQUFxQixJQUFyQjtBQUNELFdBRkQ7QUFHRCxTQUpnQyxDQUFqQztBQUtEO0FBQ0YsS0FSRDs7QUFVQSxVQUFNLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckIsQ0FBMkIsT0FBM0IsRUFBb0MsQ0FDbEMsT0FEa0MsRUFFbEM7QUFDRSxZQUFNLFlBRFI7QUFFRSxlQUFTO0FBQ1AsZUFBTyxRQUFRLFFBQVIsRUFEQTtBQUVQLHNCQUFjO0FBRlA7QUFGWCxLQUZrQyxDQUFwQzs7QUFXQSxTQUFLLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLFlBQU07QUFDckI7QUFDQSxVQUFJLE1BQUosQ0FBVyxVQUFYLEVBQXVCO0FBQ3JCLGVBQU8sUUFBUSxRQUFSLEVBRGM7QUFFckIsaUJBQVM7QUFGWSxPQUF2QjtBQUlELEtBTkQ7QUFPRCxHQWpDRDs7QUFtQ0EsT0FBSyxNQUFMLEdBQWMsWUFBWTtBQUN4QixXQUFPLHNEQUFQO0FBQ0QsR0FGRDtBQUdEOztBQUVELE9BQU8sT0FBUCxHQUFpQixZQUFqQjs7Ozs7QUN0RUE7OztBQUdBLElBQUksVUFBVSxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQUksWUFBWSxRQUFRLGNBQVIsQ0FBaEI7QUFDQSxJQUFJLGVBQWUsUUFBUSxpQkFBUixDQUFuQjs7QUFFQSxTQUFTLE1BQVQsQ0FBaUIsT0FBakIsRUFBMEI7QUFDeEIsTUFBSSxRQUFRLFFBQVEsUUFBUixFQUFaOztBQUVBLE9BQUssTUFBTCxHQUFjLFlBQVk7QUFDeEIscURBRU0sTUFBTSxJQUFOLENBQVcsTUFBWCxHQUFvQix1QkFBcEIsR0FBOEMsRUFGcEQsb0JBR00sTUFBTSxHQUFOLENBQVUsTUFBVixHQUFtQixzQkFBbkIsR0FBNEMsRUFIbEQsb0JBSU0sTUFBTSxFQUFOLENBQVMsTUFBVCxHQUFrQixxQkFBbEIsR0FBMEMsRUFKaEQsNkJBTU0sUUFBUSxNQUFSLENBQWUsSUFBSSxTQUFKLENBQWMsT0FBZCxDQUFmLENBTk4sa0JBT00sUUFBUSxNQUFSLENBQWUsSUFBSSxZQUFKLENBQWlCLE9BQWpCLENBQWYsQ0FQTjtBQVVELEdBWEQ7QUFZRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7O0FDeEJBOzs7QUFHQSxJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVg7QUFDQSxJQUFJLFFBQVEsUUFBUSxVQUFSLENBQVo7O0FBRUEsU0FBUyxJQUFULENBQWUsT0FBZixFQUF3QixlQUF4QixFQUF5QztBQUN2QyxNQUFJLE9BQU8sS0FBSyxRQUFMLENBQWMsSUFBZCxFQUFvQixLQUFwQixDQUFYO0FBQ0EsUUFBTSxJQUFOLENBQVcsSUFBWCxFQUFpQixPQUFqQixFQUEwQixlQUExQjs7QUFFQSxPQUFLLEtBQUwsR0FBYSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLENBQXNCLElBQXRCLENBQWI7QUFDQSxPQUFLLE9BQUwsR0FBZSxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLElBQW5CLENBQXdCLElBQXhCLENBQWY7O0FBRUEsT0FBSyxNQUFMLEdBQWMsWUFBTTtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IseXlCQUFQO0FBK0JELEdBaENEOztBQWtDQSxTQUFPLElBQVA7QUFDRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsSUFBakI7Ozs7O0FDbERBOzs7QUFHQSxJQUFJLFVBQVUsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFJLFdBQVcsUUFBUSxZQUFSLENBQWY7QUFDQSxJQUFJLFFBQVEsUUFBUSxTQUFSLENBQVo7QUFDQSxJQUFJLFFBQVEsUUFBUSxTQUFSLENBQVo7O0FBRUEsSUFBSSxnQkFBZ0IsUUFBUSw0QkFBUixDQUFwQjtBQUNBLElBQUksZ0JBQWdCLElBQUksYUFBSixFQUFwQjs7QUFFQSxTQUFTLE1BQVQsQ0FBaUIsT0FBakIsRUFBMEI7QUFDeEIsTUFBSSxVQUFKO0FBQ0EsTUFBSSxPQUFPLGNBQWMsR0FBZCxFQUFYO0FBQ0EsTUFBSSxrQkFBa0IsY0FBYyxPQUFwQztBQUNBLE1BQUkscUJBQXFCLGdCQUFnQixVQUFoQixDQUEyQixhQUEzQixDQUF6Qjs7QUFFQSxNQUFJLFNBQVMsU0FBVCxNQUFTLEdBQVk7QUFDdkIsUUFBSSxVQUFVLGNBQWMsR0FBZCxFQUFkOztBQUVBO0FBQ0EsUUFBSSxLQUFLLFNBQUwsQ0FBZSxJQUFmLE1BQXlCLEtBQUssU0FBTCxDQUFlLE9BQWYsQ0FBN0IsRUFBc0Q7QUFDcEQsY0FBUSxNQUFSLENBQWUsSUFBSSxNQUFKLENBQVcsT0FBWCxDQUFmLEVBQW9DLFVBQXBDO0FBQ0Q7QUFDRixHQVBEOztBQVNBLFdBQVMsc0JBQVQsR0FBbUM7QUFDakMsb0JBQWdCLGFBQWhCLENBQThCLGFBQTlCLEVBQTZDLEtBQTdDO0FBQ0Q7O0FBRUQsT0FBSyxLQUFMLEdBQWEsVUFBVSxLQUFWLEVBQWlCO0FBQzVCLGlCQUFhLEtBQWI7O0FBRUEsZUFBVyxhQUFYLENBQXlCLGNBQXpCLEVBQXlDLGdCQUF6QyxDQUEwRCxPQUExRCxFQUFtRSxZQUFNO0FBQ3ZFO0FBQ0Esc0JBQWdCLGFBQWhCLENBQThCLGFBQTlCLEVBQTZDLElBQTdDOztBQUVBLGFBQU8sVUFBUDs7QUFFQSxhQUFPLFVBQVAsQ0FBa0IsRUFBbEIsQ0FBcUIsT0FBckIsRUFBOEIsc0JBQTlCO0FBQ0EsYUFBTyxVQUFQLENBQWtCLEVBQWxCLENBQXFCLE9BQXJCLEVBQThCLHNCQUE5QjtBQUNELEtBUkQ7O0FBVUEsa0JBQWMsRUFBZCxDQUFpQixRQUFqQixFQUEyQixNQUEzQjtBQUNELEdBZEQ7O0FBZ0JBLE9BQUssT0FBTCxHQUFlLFlBQVk7QUFDekIsUUFBSSxPQUFPLFVBQVgsRUFBdUI7QUFDckIsYUFBTyxVQUFQLENBQWtCLEdBQWxCLENBQXNCLE9BQXRCLEVBQStCLHNCQUEvQjtBQUNBLGFBQU8sVUFBUCxDQUFrQixHQUFsQixDQUFzQixPQUF0QixFQUErQixzQkFBL0I7QUFDRDs7QUFFRCxrQkFBYyxHQUFkLENBQWtCLFFBQWxCLEVBQTRCLE1BQTVCO0FBQ0QsR0FQRDs7QUFTQSxPQUFLLE1BQUwsR0FBYyxZQUFZO0FBQ3hCLHNMQU1NLFFBQVEsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLE9BQVYsRUFBbUIsY0FBYyxPQUFqQyxDQUFmLENBTk4sa0JBT00sUUFBUSxNQUFSLENBQWUsSUFBSSxRQUFKLENBQWEsT0FBYixFQUFzQixjQUFjLE9BQXBDLENBQWYsQ0FQTixvQkFTTSxRQUFRLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxPQUFWLEVBQW1CLGNBQWMsT0FBakMsQ0FBZixDQVROLGtFQVdtRCxxQkFBcUIsWUFBckIsR0FBb0MsRUFYdkY7QUFnQkQsR0FqQkQ7QUFrQkQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7OztBQzNFQTs7O0FBR0EsSUFBSSxPQUFPLFFBQVEsWUFBUixDQUFYO0FBQ0EsSUFBSSxRQUFRLFFBQVEsVUFBUixDQUFaOztBQUVBLFNBQVMsUUFBVCxDQUFtQixPQUFuQixFQUE0QixlQUE1QixFQUE2QztBQUMzQyxNQUFJLE9BQU8sS0FBSyxRQUFMLENBQWMsSUFBZCxFQUFvQixLQUFwQixDQUFYO0FBQ0EsUUFBTSxJQUFOLENBQVcsSUFBWCxFQUFpQixVQUFqQixFQUE2QixlQUE3Qjs7QUFFQSxNQUFJLFFBQVEsUUFBUSxRQUFSLEVBQVo7QUFDQSxNQUFJLFFBQVEsUUFBUSxRQUFSLEVBQVo7O0FBRUEsV0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTJCO0FBQ3pCLFdBQU8sVUFBVSxDQUFWLEVBQWE7QUFDbEIsVUFBSSxRQUFRLEVBQVo7QUFDQSxZQUFNLElBQU4sSUFBYyxFQUFFLFFBQVEsQ0FBRSxFQUFFLE1BQUYsQ0FBUyxPQUFyQixFQUFkO0FBQ0EsYUFBTyxRQUFRLFdBQVIsQ0FBb0IsS0FBcEIsQ0FBUDtBQUNELEtBSkQ7QUFLRDs7QUFFRCxXQUFTLFFBQVQsR0FBcUI7QUFDbkIsWUFBUSxXQUFSLENBQW9CLEtBQUssS0FBekI7QUFDRDs7QUFFRCxPQUFLLEtBQUwsR0FBYSxVQUFVLFVBQVYsRUFBc0I7QUFDakMsU0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixFQUE0QixVQUE1Qjs7QUFFQSxRQUFJLFlBQVksV0FBVyxhQUFYLENBQXlCLHFCQUF6QixDQUFoQjtBQUNBLFFBQUksV0FBVyxXQUFXLGFBQVgsQ0FBeUIsb0JBQXpCLENBQWY7QUFDQSxRQUFJLFVBQVUsV0FBVyxhQUFYLENBQXlCLG1CQUF6QixDQUFkOztBQUVBLGNBQVUsZ0JBQVYsQ0FBMkIsUUFBM0IsRUFBcUMsV0FBVyxNQUFYLENBQXJDO0FBQ0EsYUFBUyxnQkFBVCxDQUEwQixRQUExQixFQUFvQyxXQUFXLEtBQVgsQ0FBcEM7QUFDQSxZQUFRLGdCQUFSLENBQXlCLFFBQXpCLEVBQW1DLFdBQVcsSUFBWCxDQUFuQzs7QUFFQSxlQUFXLGFBQVgsQ0FBeUIsaUJBQXpCLEVBQTRDLGdCQUE1QyxDQUE2RCxRQUE3RCxFQUF1RSxRQUF2RTtBQUNELEdBWkQ7O0FBY0EsT0FBSyxPQUFMLEdBQWUsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixJQUFuQixDQUF3QixJQUF4QixDQUFmOztBQUVBLE9BQUssTUFBTCxHQUFjLFlBQU07QUFDbEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQWxCLENBQXVCLElBQXZCLEVBQTZCLFVBQTdCLGdLQU9tRCxDQUFDLE1BQU0sSUFBTixDQUFXLE1BQVosR0FBcUIsU0FBckIsR0FBaUMsRUFQcEYsNkhBWWtELENBQUMsTUFBTSxHQUFOLENBQVUsTUFBWCxHQUFvQixTQUFwQixHQUFnQyxFQVpsRiwySEFpQmlELENBQUMsTUFBTSxFQUFOLENBQVMsTUFBVixHQUFtQixTQUFuQixHQUErQixFQWpCaEYsOE9BNEJpQyxVQUFVLGlCQUFWLEdBQThCLFVBQTlCLEdBQTJDLEVBNUI1RSx3R0ErQmdDLFVBQVUsZ0JBQVYsR0FBNkIsVUFBN0IsR0FBMEMsRUEvQjFFLHFHQUFQO0FBcUNELEdBdENEOztBQXdDQSxTQUFPLElBQVA7QUFDRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7O0FDcEZBOzs7QUFHQSxJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVg7QUFDQSxJQUFJLFFBQVEsUUFBUSxVQUFSLENBQVo7O0FBRUEsU0FBUyxLQUFULENBQWdCLE9BQWhCLEVBQXlCLGVBQXpCLEVBQTBDO0FBQ3hDLE1BQUksT0FBTyxLQUFLLFFBQUwsQ0FBYyxJQUFkLEVBQW9CLEtBQXBCLENBQVg7QUFDQSxRQUFNLElBQU4sQ0FBVyxJQUFYLEVBQWlCLE9BQWpCLEVBQTBCLGVBQTFCOztBQUVBLE1BQUksV0FBVyxRQUFRLFdBQVIsRUFBZjtBQUNBLE1BQUksVUFBVSxFQUFkO0FBQ0EsTUFBSSxPQUFKOztBQUVBLE1BQUksYUFBYSxnQkFBZ0IsVUFBaEIsQ0FBMkIsY0FBM0IsQ0FBakI7O0FBRUEsTUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakMsY0FBVSxPQUFPLFFBQVAsQ0FBZ0IsSUFBMUI7QUFDRDs7QUFFRCxXQUFTLElBQVQsQ0FBZSxNQUFmLEVBQXVCO0FBQ3JCLFdBQU8sVUFBQyxDQUFELEVBQU87QUFDWixVQUFJLE9BQU8sS0FBSyxPQUFMLENBQWEsRUFBRSxNQUFmLEVBQXVCLE1BQXZCLENBQVg7O0FBRUEsYUFBTyxNQUFQOztBQUVBLFVBQUk7QUFDRixpQkFBUyxXQUFULENBQXFCLE1BQXJCOztBQUVBLGFBQUssU0FBTCxHQUFpQixRQUFqQjtBQUNBLG1CQUFXLFlBQU07QUFDZixlQUFLLFNBQUwsR0FBaUIsTUFBakI7QUFDRCxTQUZELEVBRUcsSUFGSDtBQUdELE9BUEQsQ0FPRSxPQUFPLEdBQVAsRUFBWSxDQUFFO0FBQ2pCLEtBYkQ7QUFjRDs7QUFFRCxXQUFTLFFBQVQsR0FBcUI7QUFDbkI7QUFDQSxvQkFBZ0IsYUFBaEIsQ0FBOEIsY0FBOUIsRUFBOEMsSUFBOUM7O0FBRUEsWUFBUSxjQUFSLENBQXVCLFlBQU07QUFDM0Isc0JBQWdCLGFBQWhCLENBQThCLGNBQTlCLEVBQThDLEtBQTlDO0FBQ0QsS0FGRDtBQUdEOztBQUVELE9BQUssS0FBTCxHQUFhLFVBQVUsVUFBVixFQUFzQjtBQUNqQyxTQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLENBQXNCLElBQXRCLEVBQTRCLFVBQTVCOztBQUVBLFFBQUksWUFBWSxXQUFXLGFBQVgsQ0FBeUIsd0JBQXpCLENBQWhCO0FBQ0EsUUFBSSxnQkFBZ0IsV0FBVyxhQUFYLENBQXlCLHVCQUF6QixDQUFwQjtBQUNBLFFBQUksV0FBVyxXQUFXLGFBQVgsQ0FBeUIsdUJBQXpCLENBQWY7QUFDQSxRQUFJLGVBQWUsV0FBVyxhQUFYLENBQXlCLHNCQUF6QixDQUFuQjs7QUFFQSxrQkFBYyxnQkFBZCxDQUErQixPQUEvQixFQUF3QyxLQUFLLFNBQUwsQ0FBeEM7QUFDQSxpQkFBYSxnQkFBYixDQUE4QixPQUE5QixFQUF1QyxLQUFLLFFBQUwsQ0FBdkM7O0FBRUEsUUFBSSxpQkFBaUIsV0FBVyxhQUFYLENBQXlCLGlCQUF6QixDQUFyQjtBQUNBLG1CQUFlLGdCQUFmLENBQWdDLE9BQWhDLEVBQXlDLFFBQXpDOztBQUVBLFFBQUksUUFBSixFQUFjO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBVSxXQUFXLFlBQVk7QUFDL0IsZ0JBQVEsb0JBQVI7QUFDRCxPQUZTLEVBRVAsSUFGTyxDQUFWO0FBR0Q7QUFDRixHQXZCRDs7QUF5QkEsT0FBSyxPQUFMLEdBQWUsWUFBWTtBQUN6QixTQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLElBQW5CLENBQXdCLElBQXhCOztBQUVBLFFBQUksT0FBSixFQUFhO0FBQ1gsbUJBQWEsT0FBYjtBQUNEOztBQUVELFFBQUksUUFBSixFQUFjO0FBQ1osY0FBUSxtQkFBUjtBQUNEO0FBQ0YsR0FWRDs7QUFZQSxPQUFLLE1BQUwsR0FBYyxZQUFNO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixFQUE2QixPQUE3QixpQ0FDYyxXQUFXLG9CQUFYLEdBQWtDLEVBRGhELDhJQU0yRCxhQUFhLFlBQWIsR0FBNEIsRUFOdkYsbU1BV3lFLFFBWHpFLHNYQXVCd0UsT0F2QnhFLGtMQUFQO0FBOEJELEdBL0JEOztBQWlDQSxTQUFPLElBQVA7QUFDRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsS0FBakI7Ozs7O0FDdkhBOzs7QUFHQSxJQUFJLFVBQVUsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFJLFNBQVMsUUFBUSxpQkFBUixDQUFiO0FBQ0EsSUFBSSxTQUFTLFFBQVEsaUJBQVIsQ0FBYjs7QUFFQSxJQUFJLGNBQWMsUUFBUSxnQkFBUixDQUFsQjtBQUNBLElBQUksUUFBUSxJQUFJLFdBQUosRUFBWjs7QUFFQSxTQUFTLElBQVQsR0FBaUI7QUFDZixNQUFJLFVBQUo7QUFDQSxNQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQSxNQUFJLFFBQVEsTUFBTSxPQUFOLENBQWMsUUFBZCxFQUFaOztBQUVBLE1BQUksU0FBUyxTQUFULE1BQVMsR0FBWTtBQUN2QixRQUFJLFVBQVUsTUFBTSxHQUFOLEVBQWQ7O0FBRUE7QUFDQSxXQUFPLEtBQUssS0FBWjtBQUNBLFdBQU8sUUFBUSxLQUFmOztBQUVBO0FBQ0E7QUFDQSxRQUFJLEtBQUssU0FBTCxDQUFlLElBQWYsTUFBeUIsS0FBSyxTQUFMLENBQWUsT0FBZixDQUE3QixFQUFzRDtBQUNwRCxjQUFRLE1BQVIsQ0FBZSxJQUFmLEVBQXFCLFVBQXJCO0FBQ0Q7QUFDRixHQVpEOztBQWNBLE9BQUssS0FBTCxHQUFhLFVBQVUsS0FBVixFQUFpQjtBQUM1QixpQkFBYSxLQUFiOztBQUVBLFVBQU0sRUFBTixDQUFTLFFBQVQsRUFBbUIsTUFBbkI7QUFDRCxHQUpEOztBQU1BLE9BQUssT0FBTCxHQUFlLFlBQVk7QUFDekIsVUFBTSxHQUFOLENBQVUsUUFBVixFQUFvQixNQUFwQjtBQUNELEdBRkQ7O0FBSUEsT0FBSyxNQUFMLEdBQWMsWUFBWTtBQUN4QixxREFDaUMsTUFBTSxPQUFOLENBQWMsSUFBZCxFQUFvQixHQUFwQixDQURqQyxvQkFFTSxRQUFRLE1BQVIsQ0FBZSxJQUFJLE1BQUosQ0FBVyxNQUFNLE9BQWpCLENBQWYsQ0FGTixrQkFHTSxRQUFRLE1BQVIsQ0FBZSxJQUFJLE1BQUosQ0FBVyxNQUFNLE9BQWpCLENBQWYsQ0FITjtBQU1ELEdBUEQ7QUFRRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsSUFBakI7Ozs7O0FDakRBOzs7QUFHQSxJQUFJLE9BQU8sUUFBUSxTQUFSLENBQVg7O0FBRUEsU0FBUyxLQUFULENBQWdCLElBQWhCLEVBQXNCLE9BQXRCLEVBQStCO0FBQzdCLE9BQUssSUFBTCxHQUFZLElBQVo7QUFDQSxPQUFLLEtBQUwsR0FBYSxRQUFRLFFBQVIsQ0FBaUIsSUFBakIsQ0FBYjtBQUNBLE9BQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxPQUFLLFdBQUwsR0FBbUIsS0FBSyxTQUFMLENBQWUsV0FBZixDQUEyQixJQUEzQixDQUFnQyxJQUFoQyxDQUFuQjtBQUNBLE9BQUssU0FBTCxHQUFpQixLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQXlCLElBQXpCLENBQThCLElBQTlCLENBQWpCO0FBQ0Q7O0FBRUQsTUFBTSxTQUFOLENBQWdCLFdBQWhCLEdBQThCLFlBQVk7QUFDeEMsT0FBSyxLQUFMLEdBQWEsQ0FBQyxLQUFLLEtBQW5CO0FBQ0EsT0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixLQUFLLElBQTlCLEVBQW9DLEtBQUssS0FBekM7QUFDRCxDQUhEOztBQUtBLE1BQU0sU0FBTixDQUFnQixTQUFoQixHQUE0QixVQUFVLENBQVYsRUFBYTtBQUN2QyxNQUFJLEtBQUssT0FBTCxDQUFhLEVBQUUsTUFBZixFQUF1QixRQUF2QixLQUFvQyxFQUFFLE1BQUYsS0FBYSxLQUFLLE9BQXRELElBQWlFLENBQUMsS0FBSyxLQUEzRSxFQUFrRjtBQUNoRjtBQUNEOztBQUVELE9BQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsS0FBSyxJQUE5QixFQUFvQyxLQUFwQztBQUNELENBTkQ7O0FBUUEsTUFBTSxTQUFOLENBQWdCLEtBQWhCLEdBQXdCLFVBQVUsVUFBVixFQUFzQjtBQUM1QyxPQUFLLFVBQUwsR0FBa0IsVUFBbEI7QUFDQSxPQUFLLE9BQUwsR0FBZSxXQUFXLGFBQVgsQ0FBeUIsZUFBekIsQ0FBZjs7QUFFQSxPQUFLLE9BQUwsQ0FBYSxnQkFBYixDQUE4QixPQUE5QixFQUF1QyxLQUFLLFdBQTVDO0FBQ0EsV0FBUyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxLQUFLLFNBQXhDO0FBQ0QsQ0FORDs7QUFRQSxNQUFNLFNBQU4sQ0FBZ0IsT0FBaEIsR0FBMEIsWUFBWTtBQUNwQyxXQUFTLG1CQUFULENBQTZCLE9BQTdCLEVBQXNDLEtBQUssU0FBM0M7QUFDRCxDQUZEOztBQUlBLE1BQU0sU0FBTixDQUFnQixNQUFoQixHQUF5QixVQUFVLEtBQVYsRUFBaUIsT0FBakIsRUFBMEI7QUFDakQsZ0RBQ2dDLEtBQUssSUFEckMsVUFDNkMsS0FBSyxLQUFMLEdBQWEseUJBQWIsR0FBeUMsRUFEdEYsZ0RBRW1DLEtBQUssSUFGeEMsNENBR1EsS0FIUixnREFNbUIsS0FBSyxJQU54QixnQ0FPUSxPQVBSO0FBV0QsQ0FaRDs7QUFjQSxPQUFPLE9BQVAsR0FBaUIsS0FBakI7Ozs7O0FDcERBOzs7QUFHQSxTQUFTLE9BQVQsQ0FBa0IsS0FBbEIsRUFBeUI7QUFDdkIsV0FBUyxRQUFULENBQW1CLElBQW5CLEVBQXlCO0FBQ3ZCLFdBQU8sTUFBTSxHQUFOLEdBQVksS0FBWixDQUFrQixJQUFsQixDQUFQO0FBQ0Q7O0FBRUQsV0FBUyxXQUFULENBQXNCLElBQXRCLEVBQTRCLEtBQTVCLEVBQW1DO0FBQ2pDLFFBQUksT0FBTyxNQUFNLEdBQU4sRUFBWDtBQUNBLFNBQUssS0FBTCxDQUFXLElBQVgsSUFBbUIsS0FBbkI7O0FBRUEsVUFBTSxHQUFOLENBQVUsSUFBVjtBQUNEOztBQUVELFdBQVMsVUFBVCxDQUFxQixJQUFyQixFQUEyQjtBQUN6QixXQUFPLE1BQU0sR0FBTixHQUFZLE9BQVosQ0FBb0IsSUFBcEIsQ0FBUDtBQUNEOztBQUVELFdBQVMsYUFBVCxDQUF3QixJQUF4QixFQUE4QixLQUE5QixFQUFxQztBQUNuQyxRQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQSxTQUFLLE9BQUwsQ0FBYSxJQUFiLElBQXFCLEtBQXJCOztBQUVBLFVBQU0sR0FBTixDQUFVLElBQVY7QUFDRDs7QUFFRCxTQUFPO0FBQ0wsY0FBVSxRQURMO0FBRUwsaUJBQWEsV0FGUjs7QUFJTCxnQkFBWSxVQUpQO0FBS0wsbUJBQWU7QUFMVixHQUFQO0FBT0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7Ozs7O0FDbkNBOzs7QUFHQSxJQUFJLE9BQU8sUUFBUSxTQUFSLENBQVg7QUFDQSxJQUFJLGtCQUFrQixRQUFRLGFBQVIsQ0FBdEI7O0FBRUEsU0FBUyxPQUFULENBQWtCLEtBQWxCLEVBQXlCO0FBQ3ZCLFdBQVMsUUFBVCxHQUFxQjtBQUNuQixXQUFPLE1BQU0sR0FBTixHQUFZLEtBQW5CO0FBQ0Q7O0FBRUQsV0FBUyxVQUFULENBQXFCLE9BQXJCLEVBQThCO0FBQzVCLFFBQUksT0FBTyxNQUFNLEdBQU4sRUFBWDs7QUFFQSxTQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFVBQUMsSUFBRCxFQUFPLEtBQVAsRUFBaUI7QUFDL0IsVUFBSSxLQUFLLElBQUwsS0FBYyxRQUFRLElBQTFCLEVBQWdDO0FBQzlCLGFBQUssS0FBTCxDQUFXLEtBQVgsSUFBb0IsS0FBSyxNQUFMLENBQVksT0FBWixFQUFxQixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQXJCLENBQXBCO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7QUFDRixLQUxEOztBQU9BLFdBQU8sTUFBTSxHQUFOLENBQVUsSUFBVixDQUFQO0FBQ0Q7O0FBRUQsV0FBUyxVQUFULEdBQXVCO0FBQ3JCLFdBQU8sTUFBTSxHQUFOLEdBQVksT0FBbkI7QUFDRDs7QUFFRCxXQUFTLFNBQVQsQ0FBb0IsU0FBcEIsRUFBK0I7QUFDN0IsUUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYOztBQUVBLFNBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsU0FBbEI7QUFDQSxXQUFPLE1BQU0sR0FBTixDQUFVLElBQVYsQ0FBUDtBQUNEOztBQUVELFdBQVMsWUFBVCxDQUF1QixTQUF2QixFQUFrQztBQUNoQyxRQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQSxRQUFJLGFBQWEsRUFBakI7O0FBRUEsUUFBSSxRQUFPLFNBQVAseUNBQU8sU0FBUCxPQUFxQixRQUF6QixFQUFtQztBQUNqQyxtQkFBYSxVQUFVLElBQXZCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsbUJBQWEsU0FBYjtBQUNEOztBQUVELFNBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsVUFBQyxNQUFELEVBQVMsS0FBVCxFQUFtQjtBQUNuQyxVQUFLLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLE9BQU8sSUFBUCxLQUFnQixVQUEvQyxJQUNDLE9BQU8sTUFBUCxLQUFrQixRQUFsQixJQUE4QixXQUFXLFVBRDlDLEVBQzJEO0FBQ3pELGFBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsS0FBcEIsRUFBMkIsQ0FBM0I7QUFDQSxlQUFPLElBQVA7QUFDRDtBQUNGLEtBTkQ7O0FBUUEsV0FBTyxNQUFNLEdBQU4sQ0FBVSxJQUFWLENBQVA7QUFDRDs7QUFFRCxXQUFTLFFBQVQsR0FBcUI7QUFDbkIsV0FBTyxNQUFNLEdBQU4sR0FBWSxLQUFuQjtBQUNEOztBQUVELFdBQVMsV0FBVCxDQUFzQixRQUF0QixFQUFnQztBQUM5QixRQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLEtBQUssS0FBM0IsQ0FBYjs7QUFFQSxXQUFPLE1BQU0sR0FBTixDQUFVLElBQVYsQ0FBUDtBQUNEOztBQUVELFdBQVMsUUFBVCxHQUFxQjtBQUNuQixXQUFPLE1BQU0sR0FBTixHQUFZLEtBQW5CO0FBQ0Q7O0FBRUQsV0FBUyxXQUFULENBQXNCLEtBQXRCLEVBQTZCO0FBQzNCLFFBQUksT0FBTyxNQUFNLEdBQU4sRUFBWDtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7O0FBRUEsV0FBTyxNQUFNLEdBQU4sQ0FBVSxJQUFWLENBQVA7QUFDRDs7QUFFRCxXQUFTLFdBQVQsR0FBd0I7QUFDdEIsV0FBTyxNQUFNLEdBQU4sR0FBWSxTQUFuQjtBQUNEOztBQUVELE1BQUksVUFBVSxFQUFkOztBQUVBLFdBQVMsY0FBVCxDQUF5QixLQUF6QixFQUFxRDtBQUFBLFFBQXJCLFFBQXFCLHVFQUFWLFlBQU0sQ0FBRSxDQUFFOztBQUNuRDtBQUNBLFFBQUksT0FBTyxLQUFQLEtBQWlCLFVBQXJCLEVBQWlDO0FBQy9CLGlCQUFXLEtBQVg7QUFDQSxjQUFRLEtBQVI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxRQUFJLFdBQVcsYUFBZjtBQUNBLFFBQUksQ0FBQyxRQUFELElBQWEsS0FBakIsRUFBd0I7QUFDdEIsZ0JBQVUsT0FBTyxRQUFQLENBQWdCLElBQTFCOztBQUVBLHNCQUFnQixNQUFoQixDQUF1QjtBQUNyQixrQkFBVTtBQURXLE9BQXZCLEVBRUcsVUFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQ2YsWUFBSSxHQUFKLEVBQVM7QUFDUCxpQkFBTyxRQUFRLEdBQVIsQ0FBWSxHQUFaLENBQVA7QUFDRDs7QUFFRCxZQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQSxhQUFLLFNBQUwsR0FBaUIsSUFBSSxTQUFyQjtBQUNBLGNBQU0sR0FBTixDQUFVLElBQVY7O0FBRUE7QUFDQTtBQUNBLGtCQUFVLE9BQU8sUUFBUCxDQUFnQixJQUExQjs7QUFFQTtBQUNBLHdCQUFnQixNQUFoQixDQUF1QjtBQUNyQixvQkFBVSxPQURXO0FBRXJCLHFCQUFXLElBQUk7QUFGTSxTQUF2QixFQUdHLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNmLGNBQUksR0FBSixFQUFTO0FBQ1AsbUJBQU8sUUFBUSxHQUFSLENBQVksR0FBWixDQUFQO0FBQ0Q7O0FBRUQ7QUFDRCxTQVREO0FBVUQsT0ExQkQ7QUEyQkQsS0E5QkQsTUE4Qk8sSUFBSSxZQUFZLE9BQU8sUUFBUCxDQUFnQixJQUFoQyxFQUFzQztBQUMzQyxnQkFBVSxPQUFPLFFBQVAsQ0FBZ0IsSUFBMUI7O0FBRUE7QUFDQSxzQkFBZ0IsTUFBaEIsQ0FBdUI7QUFDckIsa0JBQVUsT0FEVztBQUVyQixtQkFBVztBQUZVLE9BQXZCLEVBR0csVUFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQ2YsWUFBSSxHQUFKLEVBQVM7QUFDUDtBQUNBOztBQUVBO0FBQ0EsY0FBSSxPQUFPLE1BQU0sR0FBTixFQUFYO0FBQ0EsZUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsZ0JBQU0sR0FBTixDQUFVLElBQVY7O0FBRUEsaUJBQU8sUUFBUSxHQUFSLENBQVksR0FBWixDQUFQO0FBQ0Q7O0FBRUQ7QUFDRCxPQWpCRDtBQWtCRDtBQUNGOztBQUVELE1BQUksMEJBQTBCLEtBQUssUUFBTCxDQUFjLGNBQWQsRUFBOEIsR0FBOUIsQ0FBOUI7O0FBRUEsV0FBUyxvQkFBVCxHQUFpQztBQUMvQjtBQUNBLFVBQU0sRUFBTixDQUFTLFFBQVQsRUFBbUIsdUJBQW5CO0FBQ0Q7O0FBRUQsV0FBUyxtQkFBVCxHQUFnQztBQUM5QjtBQUNBLFVBQU0sR0FBTixDQUFVLFFBQVYsRUFBb0IsdUJBQXBCO0FBQ0Q7O0FBRUQsU0FBTztBQUNMLGNBQVUsUUFETDtBQUVMLGdCQUFZLFVBRlA7O0FBSUwsZ0JBQVksVUFKUDtBQUtMLGVBQVcsU0FMTjtBQU1MLGtCQUFjLFlBTlQ7O0FBUUwsY0FBVSxRQVJMO0FBU0wsaUJBQWEsV0FUUjs7QUFXTCxjQUFVLFFBWEw7QUFZTCxpQkFBYSxXQVpSOztBQWNMLGlCQUFhLFdBZFI7QUFlTCxvQkFBZ0IsY0FmWDtBQWdCTCwwQkFBc0Isb0JBaEJqQjtBQWlCTCx5QkFBcUI7QUFqQmhCLEdBQVA7QUFtQkQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7OztBQ3ZMQTs7O0FBR0E7QUFDQSxJQUFJLE1BQU0sT0FBVjtBQUNBLElBQUksT0FBTyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDLE9BQU8sUUFBUCxDQUFnQixRQUFoQixLQUE2QixXQUFsRSxFQUErRTtBQUM3RSxRQUFNLE1BQU47QUFDRDs7QUFFRCxJQUFJLFNBQVMsdUJBQWI7QUFDQSxJQUFJLFdBQVcsTUFBZjs7QUFFQSxJQUFJLFFBQVEsT0FBWixFQUFxQjtBQUNuQixXQUFTLG9CQUFUO0FBQ0EsYUFBVyxNQUFYO0FBQ0Q7O0FBRUQsSUFBSSxPQUFPLFFBQVEsU0FBUixDQUFYOztBQUVBLElBQUksYUFBYSxVQUFqQjs7QUFFQSxTQUFTLFVBQVQsR0FBdUI7QUFDckIsTUFBSTtBQUNGLFFBQUksUUFBUSxPQUFPLFlBQVAsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBNUIsQ0FBWjtBQUNBLFFBQUksS0FBSixFQUFXO0FBQ1QsYUFBTyxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQVA7QUFDRDtBQUNGLEdBTEQsQ0FLRSxPQUFPLENBQVAsRUFBVTtBQUNWLFdBQU8sRUFBUDtBQUNEOztBQUVELFNBQU8sRUFBUDtBQUNEOztBQUVELElBQUksVUFBVSxZQUFkOztBQUVBLFNBQVMsV0FBVCxDQUFzQixVQUF0QixFQUFrQztBQUNoQyxZQUFVLEtBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsT0FBeEIsQ0FBVjs7QUFFQSxTQUFPLFlBQVAsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBNUIsRUFBd0MsS0FBSyxTQUFMLENBQWUsT0FBZixDQUF4QztBQUNEOztBQUVELFNBQVMsTUFBVCxDQUFpQixJQUFqQixFQUE0QztBQUFBLE1BQXJCLFFBQXFCLHVFQUFWLFlBQU0sQ0FBRSxDQUFFOztBQUMxQyxPQUFLLEtBQUwsQ0FBYyxNQUFkLFlBQTZCO0FBQzNCLFVBQU0sTUFEcUI7QUFFM0IsVUFBTTtBQUZxQixHQUE3QixFQUdHLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNmLFFBQUksR0FBSixFQUFTO0FBQ1AsYUFBTyxTQUFTLEdBQVQsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsUUFBSSxTQUFKLEdBQW1CLFFBQW5CLFNBQStCLElBQUksU0FBbkM7O0FBRUE7QUFDQSxnQkFBWTtBQUNWLGFBQU8sSUFBSTtBQURELEtBQVo7O0FBSUEsYUFBUyxJQUFULEVBQWUsR0FBZjtBQUNELEdBakJEO0FBa0JEOztBQUVELFNBQVMsTUFBVCxDQUFpQixJQUFqQixFQUE0QztBQUFBLE1BQXJCLFFBQXFCLHVFQUFWLFlBQU0sQ0FBRSxDQUFFOztBQUMxQztBQUNBLE9BQUssU0FBTCxHQUFpQixLQUFLLFNBQUwsQ0FBZSxPQUFmLENBQTBCLFFBQTFCLFFBQXVDLEVBQXZDLENBQWpCOztBQUVBO0FBQ0EsT0FBSyxLQUFMLEdBQWEsUUFBUSxLQUFyQjs7QUFFQSxPQUFLLEtBQUwsQ0FBYyxNQUFkLFlBQTZCO0FBQzNCLFVBQU0sS0FEcUI7QUFFM0IsVUFBTTtBQUZxQixHQUE3QixFQUdHLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNmLFFBQUksR0FBSixFQUFTO0FBQ1AsYUFBTyxTQUFTLEdBQVQsQ0FBUDtBQUNEOztBQUVELGFBQVMsSUFBVCxFQUFlLEdBQWY7QUFDRCxHQVREO0FBVUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ2YsVUFBUSxNQURPO0FBRWYsVUFBUTtBQUZPLENBQWpCOzs7OztBQ2xGQTs7OztBQUlBLElBQUksUUFBUSxRQUFRLGVBQVIsQ0FBWjtBQUNBLElBQUksVUFBVSxRQUFRLG9CQUFSLENBQWQ7O0FBRUEsSUFBSSxXQUFXO0FBQ2IsU0FBTyxFQURNO0FBRWIsV0FBUztBQUZJLENBQWY7O0FBS0EsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBWTtBQUM5QixRQUFNLElBQU4sQ0FBVyxJQUFYO0FBQ0EsT0FBSyxPQUFMLEdBQWUsUUFBUSxJQUFSLENBQWY7O0FBRUEsT0FBSyxHQUFMLENBQVMsUUFBVDtBQUNELENBTEQ7O0FBT0EsY0FBYyxTQUFkLEdBQTBCLE9BQU8sTUFBUCxDQUFjLE1BQU0sU0FBcEIsQ0FBMUI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLGFBQWpCOzs7OztBQ3JCQTs7O0FBR0EsSUFBSSxRQUFRLFFBQVEsZUFBUixDQUFaO0FBQ0EsSUFBSSxXQUFXLFFBQVEsV0FBUixDQUFmO0FBQ0EsSUFBSSxVQUFVLFFBQVEsV0FBUixDQUFkO0FBQ0EsSUFBSSxPQUFPLFFBQVEsU0FBUixDQUFYOztBQUVBLElBQUksV0FBVztBQUNiLFdBQVMsQ0FESTtBQUViLFNBQU8sQ0FBQztBQUNOLFVBQU0sTUFEQTtBQUVOLGFBQVM7QUFGSCxHQUFELEVBR0o7QUFDRCxVQUFNLEtBREw7QUFFRCxhQUFTO0FBRlIsR0FISSxFQU1KO0FBQ0QsVUFBTSxJQURMO0FBRUQsYUFBUztBQUZSLEdBTkksQ0FGTTtBQVliLFdBQVMsRUFaSTtBQWFiLFNBQU8saUJBYk07O0FBZWI7QUFDQSxTQUFPO0FBQ0wsVUFBTSxFQUREO0FBRUwsU0FBSyxFQUZBO0FBR0wsUUFBSTtBQUhDLEdBaEJNOztBQXNCYixhQUFXO0FBdEJFLENBQWY7O0FBeUJBLFNBQVMsbUJBQVQsR0FBZ0M7QUFDOUIsTUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakMsV0FBTyxZQUFNLENBQUUsQ0FBZjtBQUNEOztBQUVELE1BQUksT0FBTyxPQUFPLE9BQVAsQ0FBZSxZQUF0QixLQUF1QyxXQUEzQyxFQUF3RDtBQUN0RCxXQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsYUFBTyxPQUFQLENBQWUsWUFBZixDQUE0QixJQUE1QixFQUFrQyxJQUFsQyxRQUE0QyxJQUE1QztBQUNELEtBRkQ7QUFHRCxHQUpELE1BSU87QUFDTCxXQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsYUFBTyxRQUFQLENBQWdCLE9BQWhCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixLQUFyQixDQUEyQixHQUEzQixFQUFnQyxDQUFoQyxDQUEzQixTQUFpRSxJQUFqRTtBQUNELEtBRkQ7QUFHRDtBQUNGOztBQUVELFNBQVMsU0FBVCxHQUFzQjtBQUNwQixNQUFJLE9BQU8sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQyxXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJO0FBQ0YsV0FBTyxLQUFLLEtBQUwsQ0FBVyxTQUFTLGlDQUFULENBQTJDLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBM0MsQ0FBWCxDQUFQO0FBQ0QsR0FGRCxDQUVFLE9BQU8sR0FBUCxFQUFZLENBQUU7O0FBRWhCLFNBQU8sSUFBUDtBQUNEOztBQUVELElBQUksY0FBYyxTQUFkLFdBQWMsR0FBWTtBQUFBOztBQUM1QixRQUFNLElBQU4sQ0FBVyxJQUFYO0FBQ0EsT0FBSyxPQUFMLEdBQWUsUUFBUSxJQUFSLENBQWY7O0FBRUEsTUFBSSxjQUFjLHFCQUFsQjtBQUNBLE1BQUksaUJBQWlCLEVBQXJCOztBQUVBLE1BQUksV0FBVyxXQUFmO0FBQ0EsTUFBSSxRQUFKLEVBQWM7QUFDWixTQUFLLEdBQUwsQ0FBUyxLQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLFFBQXRCLENBQVQ7QUFDRCxHQUZELE1BRU87QUFDTCxTQUFLLEdBQUwsQ0FBUyxRQUFUO0FBQ0Q7O0FBRUQsT0FBSyxFQUFMLENBQVEsUUFBUixFQUFrQixZQUFNO0FBQ3RCO0FBQ0EsUUFBSSxPQUFPLE1BQUssR0FBTCxFQUFYOztBQUVBLHFCQUFpQixTQUFTLDZCQUFULENBQXVDLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBdkMsQ0FBakI7QUFDQSxnQkFBWSxLQUFLLElBQUwsQ0FBVSxHQUFWLEVBQWUsY0FBZixDQUFaO0FBQ0QsR0FORDs7QUFRQSxNQUFJLE9BQU8sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQyxXQUFPLGdCQUFQLENBQXdCLFlBQXhCLEVBQXNDLFlBQU07QUFDMUM7QUFDQTtBQUNBO0FBQ0EsVUFBSSxLQUFLLElBQUwsQ0FBVSxHQUFWLE1BQW1CLGNBQXZCLEVBQXVDO0FBQ3JDLGVBQU8sUUFBUCxDQUFnQixNQUFoQjtBQUNEO0FBQ0YsS0FQRDtBQVFEO0FBQ0YsQ0FoQ0Q7O0FBa0NBLFlBQVksU0FBWixHQUF3QixPQUFPLE1BQVAsQ0FBYyxNQUFNLFNBQXBCLENBQXhCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixXQUFqQjs7Ozs7OztBQ2pHQTs7O0FBR0EsU0FBUyxPQUFULENBQWtCLEtBQWxCLEVBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDO0FBQ0EsTUFBSSxRQUFKOztBQUVBO0FBQ0EsU0FBTyxTQUFTLFVBQVUsUUFBMUIsRUFBb0M7QUFDbEMsUUFBSSxNQUFNLFVBQVYsRUFBc0I7QUFDcEI7QUFDQSxpQkFBVyxNQUFNLFVBQU4sQ0FBaUIsZ0JBQWpCLENBQWtDLFFBQWxDLENBQVg7QUFDQTtBQUNBLFVBQUksR0FBRyxPQUFILENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixLQUExQixNQUFxQyxDQUFDLENBQTFDLEVBQTZDO0FBQzNDLGVBQU8sS0FBUDtBQUNEOztBQUVEO0FBQ0EsY0FBUSxNQUFNLFVBQWQ7QUFDRCxLQVZELE1BVU87QUFDTCxhQUFPLElBQVA7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUDtBQUNEOztBQUVELFNBQVMsS0FBVCxDQUFnQixHQUFoQixFQUFxQjtBQUNuQixTQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBWCxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxXQUFULENBQXNCLEdBQXRCLEVBQTBDO0FBQUEsTUFBZixRQUFlLHVFQUFKLEVBQUk7O0FBQ3hDO0FBQ0EsU0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixPQUF0QixDQUE4QixVQUFVLEdBQVYsRUFBZTtBQUMzQyxRQUFJLE9BQU8sSUFBSSxHQUFKLENBQVAsS0FBb0IsV0FBeEIsRUFBcUM7QUFDbkM7QUFDQSxVQUFJLEdBQUosSUFBVyxNQUFNLFNBQVMsR0FBVCxDQUFOLENBQVg7QUFDRCxLQUhELE1BR08sSUFBSSxRQUFPLElBQUksR0FBSixDQUFQLE1BQW9CLFFBQXhCLEVBQWtDO0FBQ3ZDLGtCQUFZLElBQUksR0FBSixDQUFaLEVBQXNCLFNBQVMsR0FBVCxDQUF0QjtBQUNEO0FBQ0YsR0FQRDs7QUFTQSxTQUFPLEdBQVA7QUFDRDs7QUFFRDtBQUNBLFNBQVMsTUFBVCxDQUFpQixHQUFqQixFQUFzQixRQUF0QixFQUFnQztBQUM5QixNQUFJLFFBQVEsSUFBWixFQUFrQjtBQUNoQixVQUFNLEVBQU47QUFDRDs7QUFFRCxTQUFPLFlBQVksTUFBTSxHQUFOLENBQVosRUFBd0IsUUFBeEIsQ0FBUDtBQUNEOztBQUVELFNBQVMsUUFBVCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixTQUEvQixFQUEwQztBQUN4QyxNQUFJLE9BQUo7QUFDQSxTQUFPLFlBQVk7QUFDakIsUUFBSSxVQUFVLElBQWQ7QUFDQSxRQUFJLE9BQU8sU0FBWDtBQUNBLFFBQUksVUFBVSxhQUFhLENBQUMsT0FBNUI7O0FBRUEsUUFBSSxRQUFRLFNBQVIsS0FBUSxHQUFZO0FBQ3RCLGdCQUFVLElBQVY7QUFDQSxVQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNkLGFBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEI7QUFDRDtBQUNGLEtBTEQ7O0FBT0EsaUJBQWEsT0FBYjtBQUNBLGNBQVUsV0FBVyxLQUFYLEVBQWtCLElBQWxCLENBQVY7QUFDQSxRQUFJLE9BQUosRUFBYTtBQUNYLFdBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEI7QUFDRDtBQUNGLEdBakJEO0FBa0JEOztBQUVELFNBQVMsVUFBVCxDQUFxQixHQUFyQixFQUEyQztBQUFBLE1BQWpCLElBQWlCLHVFQUFWLFlBQU0sQ0FBRSxDQUFFOztBQUN6QyxNQUFJLFVBQVUsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQWQ7QUFDQSxVQUFRLEdBQVIsR0FBYyxHQUFkO0FBQ0EsV0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixPQUExQjs7QUFFQSxVQUFRLE1BQVIsR0FBaUIsSUFBakI7QUFDRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckIsRUFBa0M7QUFBQSxNQUFQLENBQU8sdUVBQUgsQ0FBRzs7QUFDaEMsTUFBSSxJQUFJLE1BQUosS0FBZSxDQUFuQixFQUFzQjtBQUNwQixXQUFPLE1BQVA7QUFDRDs7QUFFRCxNQUFJLENBQUosRUFBTyxZQUFNO0FBQ1g7QUFDQSxVQUFNLEdBQU4sRUFBVyxJQUFYLEVBQWlCLENBQWpCO0FBQ0QsR0FIRDtBQUlEOztBQUVELFNBQVMsS0FBVCxDQUFnQixJQUFoQixFQUFzQixPQUF0QixFQUErQixRQUEvQixFQUF5QztBQUN2QztBQUNBLE1BQUksT0FBTyxPQUFQLEtBQW1CLFVBQXZCLEVBQW1DO0FBQ2pDLGVBQVcsT0FBWDtBQUNBLGNBQVUsRUFBVjtBQUNEOztBQUVELFlBQVUsT0FBTyxPQUFQLEVBQWdCO0FBQ3hCLFVBQU0sS0FEa0I7QUFFeEIsVUFBTTtBQUZrQixHQUFoQixDQUFWOztBQUtBLGFBQVcsWUFBWSxZQUFZLENBQUUsQ0FBckM7O0FBRUEsTUFBSSxVQUFVLElBQUksT0FBTyxjQUFYLEVBQWQ7QUFDQSxVQUFRLElBQVIsQ0FBYSxRQUFRLElBQXJCLEVBQTJCLElBQTNCO0FBQ0EsVUFBUSxnQkFBUixDQUF5QixjQUF6QixFQUF5QyxnQ0FBekM7QUFDQSxVQUFRLGdCQUFSLENBQXlCLGtCQUF6QixFQUE2QyxnQkFBN0M7O0FBRUEsVUFBUSxNQUFSLEdBQWlCLFlBQVk7QUFDM0IsUUFBSSxRQUFRLE1BQVIsSUFBa0IsR0FBbEIsSUFBeUIsUUFBUSxNQUFSLEdBQWlCLEdBQTlDLEVBQW1EO0FBQ2pEO0FBQ0EsVUFBSSxPQUFPLEtBQUssS0FBTCxDQUFXLFFBQVEsWUFBUixJQUF3QixJQUFuQyxDQUFYOztBQUVBLGVBQVMsSUFBVCxFQUFlLElBQWY7QUFDRCxLQUxELE1BS087QUFDTDtBQUNBLGVBQVMsT0FBVDtBQUNEO0FBQ0YsR0FWRDs7QUFZQSxVQUFRLE9BQVIsR0FBa0IsWUFBWTtBQUM1QjtBQUNBLGFBQVMsT0FBVDtBQUNELEdBSEQ7O0FBS0EsVUFBUSxJQUFSLENBQWEsS0FBSyxTQUFMLENBQWUsUUFBUSxJQUF2QixDQUFiO0FBQ0Q7O0FBRUQsU0FBUyxRQUFULENBQW1CLFNBQW5CLEVBQThCLFVBQTlCLEVBQTBDO0FBQ3hDLFlBQVUsU0FBVixHQUFzQixPQUFPLE1BQVAsQ0FBYyxXQUFXLFNBQXpCLENBQXRCO0FBQ0EsWUFBVSxTQUFWLENBQW9CLFdBQXBCLEdBQWtDLFNBQWxDOztBQUVBLFlBQVUsS0FBVixHQUFrQixPQUFPLGNBQVAsQ0FBc0IsVUFBVSxTQUFoQyxDQUFsQjs7QUFFQSxTQUFPLFNBQVA7QUFDRDs7QUFFRCxTQUFTLElBQVQsQ0FBZSxHQUFmLEVBQW9CLEtBQXBCLEVBQTJCO0FBQ3pCLE1BQUksWUFBWSxFQUFoQjtBQUNBLE1BQUksT0FBTyxRQUFQLENBQWdCLElBQXBCLEVBQTBCO0FBQ3hCLGdCQUFZLE9BQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixNQUFyQixDQUE0QixDQUE1QixFQUErQixLQUEvQixDQUFxQyxHQUFyQyxDQUFaO0FBQ0Q7O0FBRUQsTUFBSSxhQUFhLEVBQWpCO0FBQ0EsTUFBSSxhQUFhLEVBQWpCOztBQUVBLFlBQVUsT0FBVixDQUFrQixVQUFDLElBQUQsRUFBTyxDQUFQLEVBQWE7QUFDN0IsUUFBSSxXQUFXLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZjtBQUNBLGVBQVcsU0FBUyxDQUFULENBQVgsSUFBMEIsU0FBUyxDQUFULEtBQWUsRUFBekM7QUFDRCxHQUhEOztBQUtBLE1BQUksR0FBSixFQUFTO0FBQ1AsUUFBSSxLQUFKLEVBQVc7QUFDVCxpQkFBVyxHQUFYLElBQWtCLEtBQWxCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxXQUFXLEdBQVgsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxTQUFPLElBQVAsQ0FBWSxVQUFaLEVBQXdCLE9BQXhCLENBQWdDLFVBQUMsR0FBRCxFQUFNLENBQU4sRUFBWTtBQUMxQyxRQUFJLElBQUksQ0FBUixFQUFXO0FBQ1Qsb0JBQWMsR0FBZDtBQUNEOztBQUVELGtCQUFjLEdBQWQ7O0FBRUEsUUFBSSxXQUFXLEdBQVgsQ0FBSixFQUFxQjtBQUNuQiwwQkFBa0IsV0FBVyxHQUFYLENBQWxCO0FBQ0Q7QUFDRixHQVZEOztBQVlBLFNBQU8sVUFBUDtBQUNEOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNmLFNBQU8sS0FEUTtBQUVmLFVBQVEsTUFGTztBQUdmLFdBQVMsT0FITTtBQUlmLFlBQVUsUUFKSztBQUtmLGNBQVksVUFMRztBQU1mLFNBQU8sS0FOUTtBQU9mLFNBQU8sS0FQUTtBQVFmLFFBQU0sSUFSUzs7QUFVZixZQUFVO0FBVkssQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLmR1cnJ1dGkgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogRHVycnV0aVxuICAgKiBVdGlscy5cbiAgICovXG5cbiAgZnVuY3Rpb24gaGFzV2luZG93KCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIHZhciBpc0NsaWVudCA9IGhhc1dpbmRvdygpO1xuXG4gIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9XG5cbiAgLy8gb25lLWxldmVsIG9iamVjdCBleHRlbmRcblxuXG4gIHZhciBEVVJSVVRJX0RFQlVHID0gdHJ1ZTtcblxuICBmdW5jdGlvbiB3YXJuKCkge1xuICAgIGlmIChEVVJSVVRJX0RFQlVHID09PSB0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICAvKiBEdXJydXRpXG4gICAqIENhcHR1cmUgYW5kIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gICAqL1xuXG4gIHZhciBfcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKCkge307XG5cbiAgLy8gY2FwdHVyZSBhbGwgbGlzdGVuZXJzXG4gIHZhciBldmVudHMgPSBbXTtcbiAgdmFyIGRvbUV2ZW50VHlwZXMgPSBbXTtcblxuICBmdW5jdGlvbiBnZXREb21FdmVudFR5cGVzKCkge1xuICAgIHZhciBldmVudFR5cGVzID0gW107XG4gICAgZm9yICh2YXIgYXR0ciBpbiBkb2N1bWVudCkge1xuICAgICAgLy8gc3RhcnRzIHdpdGggb25cbiAgICAgIGlmIChhdHRyLnN1YnN0cigwLCAyKSA9PT0gJ29uJykge1xuICAgICAgICBldmVudFR5cGVzLnB1c2goYXR0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2ZW50VHlwZXM7XG4gIH1cblxuICB2YXIgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyO1xuXG4gIGZ1bmN0aW9uIGNhcHR1cmVBZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlKSB7XG4gICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBldmVudHMucHVzaCh7XG4gICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZm46IGZuLFxuICAgICAgY2FwdHVyZTogY2FwdHVyZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTm9kZUV2ZW50cygkbm9kZSkge1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgZXZlbnRzLmxlbmd0aCkge1xuICAgICAgaWYgKGV2ZW50c1tpXS50YXJnZXQgPT09ICRub2RlKSB7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgICAkbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXS50eXBlLCBldmVudHNbaV0uZm4sIGV2ZW50c1tpXS5jYXB0dXJlKTtcblxuICAgICAgICAvLyByZW1vdmUgZXZlbnRcbiAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuXG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIG9uKiBsaXN0ZW5lcnNcbiAgICBkb21FdmVudFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50VHlwZSkge1xuICAgICAgJG5vZGVbZXZlbnRUeXBlXSA9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoaXNDbGllbnQpIHtcbiAgICBkb21FdmVudFR5cGVzID0gZ2V0RG9tRXZlbnRUeXBlcygpO1xuXG4gICAgLy8gY2FwdHVyZSBhZGRFdmVudExpc3RlbmVyXG5cbiAgICAvLyBJRVxuICAgIGlmICh3aW5kb3cuTm9kZS5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2FkZEV2ZW50TGlzdGVuZXInKSkge1xuICAgICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyID0gd2luZG93Lk5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICB3aW5kb3cuTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGNhcHR1cmVBZGRFdmVudExpc3RlbmVyO1xuICAgIH0gZWxzZSBpZiAod2luZG93LkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnYWRkRXZlbnRMaXN0ZW5lcicpKSB7XG4gICAgICAvLyBzdGFuZGFyZFxuICAgICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyID0gd2luZG93LkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgd2luZG93LkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gY2FwdHVyZUFkZEV2ZW50TGlzdGVuZXI7XG4gICAgfVxuXG4gICAgLy8gdHJhdmVyc2UgYW5kIHJlbW92ZSBhbGwgZXZlbnRzIGxpc3RlbmVycyBmcm9tIG5vZGVzXG4gICAgX3JlbW92ZUxpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygkbm9kZSwgdHJhdmVyc2UpIHtcbiAgICAgIHJlbW92ZU5vZGVFdmVudHMoJG5vZGUpO1xuXG4gICAgICAvLyB0cmF2ZXJzZSBlbGVtZW50IGNoaWxkcmVuXG4gICAgICBpZiAodHJhdmVyc2UgJiYgJG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIF9yZW1vdmVMaXN0ZW5lcnMoJG5vZGUuY2hpbGRyZW5baV0sIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHZhciByZW1vdmVMaXN0ZW5lcnMkMSA9IF9yZW1vdmVMaXN0ZW5lcnM7XG5cbiAgLyogRHVycnV0aVxuICAgKiBET00gcGF0Y2ggLSBtb3JwaHMgYSBET00gbm9kZSBpbnRvIGFub3RoZXIuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHRyYXZlcnNlKCRub2RlLCAkbmV3Tm9kZSwgcGF0Y2hlcykge1xuICAgIC8vIHRyYXZlcnNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkaWZmKCRub2RlLmNoaWxkTm9kZXNbaV0sICRuZXdOb2RlLmNoaWxkTm9kZXNbaV0sIHBhdGNoZXMpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1hcEF0dHJpYnV0ZXMoJG5vZGUsICRuZXdOb2RlKSB7XG4gICAgdmFyIGF0dHJzID0ge307XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzWyRub2RlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSBudWxsO1xuICAgIH1cblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCAkbmV3Tm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgX2krKykge1xuICAgICAgYXR0cnNbJG5ld05vZGUuYXR0cmlidXRlc1tfaV0ubmFtZV0gPSAkbmV3Tm9kZS5hdHRyaWJ1dGVzW19pXS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaEF0dHJzKCRub2RlLCAkbmV3Tm9kZSkge1xuICAgIC8vIG1hcCBhdHRyaWJ1dGVzXG4gICAgdmFyIGF0dHJzID0gbWFwQXR0cmlidXRlcygkbm9kZSwgJG5ld05vZGUpO1xuXG4gICAgLy8gYWRkLWNoYW5nZSBhdHRyaWJ1dGVzXG4gICAgZm9yICh2YXIgcHJvcCBpbiBhdHRycykge1xuICAgICAgaWYgKGF0dHJzW3Byb3BdID09PSBudWxsKSB7XG4gICAgICAgICRub2RlLnJlbW92ZUF0dHJpYnV0ZShwcm9wKTtcblxuICAgICAgICAvLyBjaGVja2VkIG5lZWRzIGV4dHJhIHdvcmtcbiAgICAgICAgaWYgKHByb3AgPT09ICdjaGVja2VkJykge1xuICAgICAgICAgICRub2RlLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJG5vZGUuc2V0QXR0cmlidXRlKHByb3AsIGF0dHJzW3Byb3BdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkaWZmKCRub2RlLCAkbmV3Tm9kZSkge1xuICAgIHZhciBwYXRjaGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBbXTtcblxuICAgIHZhciBwYXRjaCA9IHtcbiAgICAgIG5vZGU6ICRub2RlLFxuICAgICAgbmV3Tm9kZTogJG5ld05vZGVcbiAgICB9O1xuXG4gICAgLy8gcHVzaCB0cmF2ZXJzZWQgbm9kZSB0byBwYXRjaCBsaXN0XG4gICAgcGF0Y2hlcy5wdXNoKHBhdGNoKTtcblxuICAgIC8vIGZhc3RlciB0aGFuIG91dGVyaHRtbFxuICAgIGlmICgkbm9kZS5pc0VxdWFsTm9kZSgkbmV3Tm9kZSkpIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnMgb24gbm9kZSBhbmQgY2hpbGRyZW5cbiAgICAgIHJlbW92ZUxpc3RlbmVycyQxKCRub2RlLCB0cnVlKTtcblxuICAgICAgcmV0dXJuIHBhdGNoZXM7XG4gICAgfVxuXG4gICAgLy8gaWYgb25lIG9mIHRoZW0gaXMgbm90IGFuIGVsZW1lbnQgbm9kZSxcbiAgICAvLyBvciB0aGUgdGFnIGNoYW5nZWQsXG4gICAgLy8gb3Igbm90IHRoZSBzYW1lIG51bWJlciBvZiBjaGlsZHJlbi5cbiAgICBpZiAoJG5vZGUubm9kZVR5cGUgIT09IDEgfHwgJG5ld05vZGUubm9kZVR5cGUgIT09IDEgfHwgJG5vZGUudGFnTmFtZSAhPT0gJG5ld05vZGUudGFnTmFtZSB8fCAkbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCAhPT0gJG5ld05vZGUuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHBhdGNoLnJlcGxhY2UgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRjaC51cGRhdGUgPSB0cnVlO1xuXG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIG9uIG5vZGVcbiAgICAgIHJlbW92ZUxpc3RlbmVycyQxKCRub2RlKTtcblxuICAgICAgLy8gdHJhdmVyc2UgY2hpbGROb2Rlc1xuICAgICAgdHJhdmVyc2UoJG5vZGUsICRuZXdOb2RlLCBwYXRjaGVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0Y2hlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGx5UGF0Y2gocGF0Y2gpIHtcbiAgICBpZiAocGF0Y2gucmVwbGFjZSkge1xuICAgICAgcGF0Y2gubm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwYXRjaC5uZXdOb2RlLCBwYXRjaC5ub2RlKTtcbiAgICB9IGVsc2UgaWYgKHBhdGNoLnVwZGF0ZSkge1xuICAgICAgcGF0Y2hBdHRycyhwYXRjaC5ub2RlLCBwYXRjaC5uZXdOb2RlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaChwYXRjaGVzKSB7XG4gICAgcGF0Y2hlcy5mb3JFYWNoKGFwcGx5UGF0Y2gpO1xuXG4gICAgcmV0dXJuIHBhdGNoZXM7XG4gIH1cblxuICB2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9IDogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gIH07XG5cblxuXG5cblxuICB2YXIgY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICAgIH07XG4gIH0oKTtcblxuXG5cblxuXG5cblxuICB2YXIgZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gICAgfVxuICB9O1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiAgdmFyIHNldCA9IGZ1bmN0aW9uIHNldChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgc2V0KHBhcmVudCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgICBkZXNjLnZhbHVlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgICAgaWYgKHNldHRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNldHRlci5jYWxsKHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qIER1cnJ1dGlcbiAgICogTWljcm8gSXNvbW9ycGhpYyBKYXZhU2NyaXB0IGxpYnJhcnkgZm9yIGJ1aWxkaW5nIHVzZXIgaW50ZXJmYWNlcy5cbiAgICovXG5cbiAgdmFyIGR1cnJ1dGlBdHRyID0gJ2RhdGEtZHVycnV0aS1pZCc7XG4gIHZhciBkdXJydXRpRWxlbVNlbGVjdG9yID0gJ1snICsgZHVycnV0aUF0dHIgKyAnXSc7XG4gIHZhciBjb21wb25lbnRDYWNoZSA9IFtdO1xuICB2YXIgY29tcG9uZW50SW5kZXggPSAwO1xuXG4gIC8vIGRlY29yYXRlIGEgYmFzaWMgY2xhc3Mgd2l0aCBkdXJydXRpIHNwZWNpZmljIHByb3BlcnRpZXNcbiAgZnVuY3Rpb24gZGVjb3JhdGUoQ29tcCkge1xuICAgIHZhciBjb21wb25lbnQ7XG5cbiAgICAvLyBpbnN0YW50aWF0ZSBjbGFzc2VzXG4gICAgaWYgKHR5cGVvZiBDb21wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnQgPSBuZXcgQ29tcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgY2hhbmdlIHRoZSBpZCBvbiBhIGNhY2hlZCBjb21wb25lbnRcbiAgICAgIGNvbXBvbmVudCA9IE9iamVjdC5jcmVhdGUoQ29tcCk7XG4gICAgfVxuXG4gICAgLy8gY29tcG9uZW50cyBnZXQgYSBuZXcgaWQgb24gcmVuZGVyLFxuICAgIC8vIHNvIHdlIGNhbiBjbGVhciB0aGUgcHJldmlvdXMgY29tcG9uZW50IGNhY2hlLlxuICAgIGNvbXBvbmVudC5fZHVycnV0aUlkID0gU3RyaW5nKGNvbXBvbmVudEluZGV4KyspO1xuXG4gICAgLy8gY2FjaGUgY29tcG9uZW50XG4gICAgY29tcG9uZW50Q2FjaGUucHVzaCh7XG4gICAgICBpZDogY29tcG9uZW50Ll9kdXJydXRpSWQsXG4gICAgICBjb21wb25lbnQ6IGNvbXBvbmVudFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENhY2hlZENvbXBvbmVudCgkbm9kZSkge1xuICAgIC8vIGdldCB0aGUgY29tcG9uZW50IGZyb20gdGhlIGRvbSBub2RlIC0gcmVuZGVyZWQgaW4gYnJvd3Nlci5cbiAgICBpZiAoJG5vZGUuX2R1cnJ1dGkpIHtcbiAgICAgIHJldHVybiAkbm9kZS5fZHVycnV0aTtcbiAgICB9XG5cbiAgICAvLyBvciBnZXQgaXQgZnJvbSB0aGUgY29tcG9uZW50IGNhY2hlIC0gcmVuZGVyZWQgb24gdGhlIHNlcnZlci5cbiAgICB2YXIgaWQgPSAkbm9kZS5nZXRBdHRyaWJ1dGUoZHVycnV0aUF0dHIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50Q2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjb21wb25lbnRDYWNoZVtpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudENhY2hlW2ldLmNvbXBvbmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgY3VzdG9tIGRhdGEgYXR0cmlidXRlcyxcbiAgLy8gYW5kIGNhY2hlIHRoZSBjb21wb25lbnQgb24gdGhlIERPTSBub2RlLlxuICBmdW5jdGlvbiBjbGVhbkF0dHJOb2RlcygkY29udGFpbmVyLCBpbmNsdWRlUGFyZW50KSB7XG4gICAgdmFyIG5vZGVzID0gW10uc2xpY2UuY2FsbCgkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoZHVycnV0aUVsZW1TZWxlY3RvcikpO1xuXG4gICAgaWYgKGluY2x1ZGVQYXJlbnQpIHtcbiAgICAgIG5vZGVzLnB1c2goJGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoJG5vZGUpIHtcbiAgICAgIC8vIGNhY2hlIGNvbXBvbmVudCBpbiBub2RlXG4gICAgICAkbm9kZS5fZHVycnV0aSA9IGdldENhY2hlZENvbXBvbmVudCgkbm9kZSk7XG5cbiAgICAgIC8vIGNsZWFuLXVwIGRhdGEgYXR0cmlidXRlc1xuICAgICAgJG5vZGUucmVtb3ZlQXR0cmlidXRlKGR1cnJ1dGlBdHRyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIHVubW91bnROb2RlKCRub2RlKSB7XG4gICAgdmFyIGNhY2hlZENvbXBvbmVudCA9IGdldENhY2hlZENvbXBvbmVudCgkbm9kZSk7XG5cbiAgICBpZiAoY2FjaGVkQ29tcG9uZW50LnVubW91bnQpIHtcbiAgICAgIGNhY2hlZENvbXBvbmVudC51bm1vdW50KCRub2RlKTtcbiAgICB9XG5cbiAgICAvLyBjbGVhciB0aGUgY29tcG9uZW50IGZyb20gdGhlIGNhY2hlXG4gICAgY2xlYXJDb21wb25lbnRDYWNoZShjYWNoZWRDb21wb25lbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW91bnROb2RlKCRub2RlKSB7XG4gICAgdmFyIGNhY2hlZENvbXBvbmVudCA9IGdldENhY2hlZENvbXBvbmVudCgkbm9kZSk7XG5cbiAgICBpZiAoY2FjaGVkQ29tcG9uZW50Lm1vdW50KSB7XG4gICAgICBjYWNoZWRDb21wb25lbnQubW91bnQoJG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyQ29tcG9uZW50Q2FjaGUoY29tcG9uZW50KSB7XG4gICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRDYWNoZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY29tcG9uZW50Q2FjaGVbaV0uaWQgPT09IGNvbXBvbmVudC5fZHVycnV0aUlkKSB7XG4gICAgICAgICAgY29tcG9uZW50Q2FjaGUuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjbGVhciB0aGUgZW50aXJlIGNvbXBvbmVudCBjYWNoZVxuICAgICAgY29tcG9uZW50SW5kZXggPSAwO1xuICAgICAgY29tcG9uZW50Q2FjaGUubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVGcmFnbWVudCgpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuXG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS50cmltKCk7XG4gICAgdmFyIHBhcmVudCA9ICdkaXYnO1xuICAgIHZhciAkbm9kZTtcblxuICAgIGlmICh0ZW1wbGF0ZS5pbmRleE9mKCc8dHInKSA9PT0gMCkge1xuICAgICAgLy8gdGFibGUgcm93XG4gICAgICBwYXJlbnQgPSAndGJvZHknO1xuICAgIH0gZWxzZSBpZiAodGVtcGxhdGUuaW5kZXhPZignPHRkJykgPT09IDApIHtcbiAgICAgIC8vIHRhYmxlIGNvbHVtblxuICAgICAgcGFyZW50ID0gJ3RyJztcbiAgICB9XG5cbiAgICAkbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50KTtcbiAgICAkbm9kZS5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcblxuICAgIGlmICgkbm9kZS5jaGlsZHJlbi5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IHRlbXBsYXRlIG11c3QgaGF2ZSBhIHNpbmdsZSBwYXJlbnQgbm9kZS4nLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRub2RlLmZpcnN0RWxlbWVudENoaWxkO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ29tcG9uZW50SWQodGVtcGxhdGUsIGNvbXBvbmVudCkge1xuICAgIC8vIG5haXZlIGltcGxlbWVudGF0aW9uIG9mIGFkZGluZyBhbiBhdHRyaWJ1dGUgdG8gdGhlIHBhcmVudCBjb250YWluZXIuXG4gICAgLy8gc28gd2UgZG9uJ3QgZGVwZW5kIG9uIGEgZG9tIHBhcnNlci5cbiAgICAvLyBkb3duc2lkZSBpcyB3ZSBjYW4ndCB3YXJuIHRoYXQgdGVtcGxhdGUgTVVTVCBoYXZlIGEgc2luZ2xlIHBhcmVudCAoaW4gTm9kZS5qcykuXG5cbiAgICAvLyBjaGVjayB2b2lkIGVsZW1lbnRzIGZpcnN0LlxuICAgIHZhciBmaXJzdEJyYWNrZXRJbmRleCA9IHRlbXBsYXRlLmluZGV4T2YoJy8+Jyk7XG5cbiAgICAvLyBub24tdm9pZCBlbGVtZW50c1xuICAgIGlmIChmaXJzdEJyYWNrZXRJbmRleCA9PT0gLTEpIHtcbiAgICAgIGZpcnN0QnJhY2tldEluZGV4ID0gdGVtcGxhdGUuaW5kZXhPZignPicpO1xuICAgIH1cblxuICAgIHZhciBhdHRyID0gJyAnICsgZHVycnV0aUF0dHIgKyAnPVwiJyArIGNvbXBvbmVudC5fZHVycnV0aUlkICsgJ1wiJztcblxuICAgIHJldHVybiB0ZW1wbGF0ZS5zdWJzdHIoMCwgZmlyc3RCcmFja2V0SW5kZXgpICsgYXR0ciArIHRlbXBsYXRlLnN1YnN0cihmaXJzdEJyYWNrZXRJbmRleCk7XG4gIH1cblxuICAvLyB0cmF2ZXJzZSBhbmQgZmluZCBkdXJydXRpIG5vZGVzXG4gIGZ1bmN0aW9uIGdldENvbXBvbmVudE5vZGVzKCRjb250YWluZXIpIHtcbiAgICB2YXIgYXJyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBbXTtcblxuICAgIGlmICgkY29udGFpbmVyLl9kdXJydXRpKSB7XG4gICAgICBhcnIucHVzaCgkY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICBpZiAoJGNvbnRhaW5lci5jaGlsZHJlbikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGdldENvbXBvbmVudE5vZGVzKCRjb250YWluZXIuY2hpbGRyZW5baV0sIGFycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIHZhciBEdXJydXRpID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIER1cnJ1dGkoKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBEdXJydXRpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhEdXJydXRpLCBbe1xuICAgICAga2V5OiAnc2VydmVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXJ2ZXIoKSB7XG4gICAgICAgIGNsZWFyQ29tcG9uZW50Q2FjaGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcihjb21wb25lbnQsICRjb250YWluZXIpIHtcbiAgICAgICAgLy8gZGVjb3JhdGUgYmFzaWMgY2xhc3NlcyB3aXRoIGR1cnJ1dGkgcHJvcGVydGllc1xuICAgICAgICB2YXIgZHVycnV0aUNvbXBvbmVudCA9IGRlY29yYXRlKGNvbXBvbmVudCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkdXJydXRpQ29tcG9uZW50LnJlbmRlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudHMgbXVzdCBoYXZlIGEgcmVuZGVyKCkgbWV0aG9kLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZHVycnV0aUNvbXBvbmVudC5yZW5kZXIoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudEh0bWwgPSBhZGRDb21wb25lbnRJZCh0ZW1wbGF0ZSwgZHVycnV0aUNvbXBvbmVudCk7XG5cbiAgICAgICAgLy8gbW91bnQgYW5kIHVubW91bnQgaW4gYnJvd3Nlciwgd2hlbiB3ZSBzcGVjaWZ5IGEgY29udGFpbmVyLlxuICAgICAgICBpZiAoaXNDbGllbnQgJiYgJGNvbnRhaW5lcikge1xuICAgICAgICAgIHZhciAkbmV3Q29tcG9uZW50O1xuICAgICAgICAgIHZhciBwYXRjaGVzO1xuXG4gICAgICAgICAgdmFyIF9yZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgY29udGFpbmVyIGlzIHN0aWxsIGluIHRoZSBET00uXG4gICAgICAgICAgICAvLyB3aGVuIHJ1bm5pbmcgbXVsdGlwbGUgcGFyYWxsZWwgcmVuZGVyJ3MsIHRoZSBjb250YWluZXJcbiAgICAgICAgICAgIC8vIGlzIHJlbW92ZWQgYnkgdGhlIHByZXZpb3VzIHJlbmRlciwgYnV0IHRoZSByZWZlcmVuY2Ugc3RpbGwgaW4gbWVtb3J5LlxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKCRjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgIC8vIHdhcm4gZm9yIHBlcmZvcm1hbmNlLlxuICAgICAgICAgICAgICB3YXJuKCdOb2RlJywgJGNvbnRhaW5lciwgJ2lzIG5vIGxvbmdlciBpbiB0aGUgRE9NLiBcXG5JdCB3YXMgcHJvYmFibHkgcmVtb3ZlZCBieSBhIHBhcmVudCBjb21wb25lbnQuJyk7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdjogdm9pZCAwXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21wb25lbnROb2RlcyA9IFtdO1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgdGVtcGxhdGUgc3RyaW5nIHRvIGEgZG9tIG5vZGVcbiAgICAgICAgICAgICRuZXdDb21wb25lbnQgPSBjcmVhdGVGcmFnbWVudChjb21wb25lbnRIdG1sKTtcblxuICAgICAgICAgICAgLy8gdW5tb3VudCBjb21wb25lbnQgYW5kIHN1Yi1jb21wb25lbnRzXG5cbiAgICAgICAgICAgIGdldENvbXBvbmVudE5vZGVzKCRjb250YWluZXIpLmZvckVhY2godW5tb3VudE5vZGUpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgY29udGFpbmVyIGlzIGEgZHVycnV0aSBlbGVtZW50LFxuICAgICAgICAgICAgLy8gdW5tb3VudCBpdCBhbmQgaXQncyBjaGlsZHJlbiBhbmQgcmVwbGFjZSB0aGUgbm9kZS5cbiAgICAgICAgICAgIGlmIChnZXRDYWNoZWRDb21wb25lbnQoJGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBkYXRhIGF0dHJpYnV0ZXMgb24gdGhlIG5ldyBub2RlLFxuICAgICAgICAgICAgICAvLyBiZWZvcmUgcGF0Y2gsXG4gICAgICAgICAgICAgIC8vIGFuZCBnZXQgdGhlIGxpc3Qgb2YgbmV3IGNvbXBvbmVudHMuXG4gICAgICAgICAgICAgIGNsZWFuQXR0ck5vZGVzKCRuZXdDb21wb25lbnQsIHRydWUpO1xuXG4gICAgICAgICAgICAgIC8vIGdldCByZXF1aXJlZCBkb20gcGF0Y2hlc1xuICAgICAgICAgICAgICBwYXRjaGVzID0gZGlmZigkY29udGFpbmVyLCAkbmV3Q29tcG9uZW50KTtcblxuXG4gICAgICAgICAgICAgIHBhdGNoZXMuZm9yRWFjaChmdW5jdGlvbiAocGF0Y2gkJDEpIHtcbiAgICAgICAgICAgICAgICAvLyBhbHdheXMgdXBkYXRlIGNvbXBvbmVudCBpbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgLy8gZXZlbiBpZiB0aGUgZG9tIGRvZXNuJ3QgY2hhbmdlLlxuICAgICAgICAgICAgICAgIHBhdGNoJCQxLm5vZGUuX2R1cnJ1dGkgPSBwYXRjaCQkMS5uZXdOb2RlLl9kdXJydXRpO1xuXG4gICAgICAgICAgICAgICAgLy8gcGF0Y2hlcyBjb250YWluIGFsbCB0aGUgdHJhdmVyc2VkIG5vZGVzLlxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbW91bnQgY29tcG9uZW50cyBoZXJlLCBmb3IgcGVyZm9ybWFuY2UuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGNoJCQxLm5vZGUuX2R1cnJ1dGkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwYXRjaCQkMS5yZXBsYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzLnB1c2gocGF0Y2gkJDEubmV3Tm9kZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGNoJCQxLnVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2Rlcy5wdXNoKHBhdGNoJCQxLm5vZGUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm9kZSBpcyB0aGUgc2FtZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHdlIG5lZWQgdG8gbW91bnQgc3ViLWNvbXBvbmVudHMuXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGNvbXBvbmVudE5vZGVzLCBnZXRDb21wb25lbnROb2RlcyhwYXRjaCQkMS5ub2RlKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAvLyBtb3JwaCBvbGQgZG9tIG5vZGUgaW50byBuZXcgb25lXG4gICAgICAgICAgICAgIHBhdGNoKHBhdGNoZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaWYgdGhlIGNvbXBvbmVudCBpcyBub3QgYSBkdXJydXRpIGVsZW1lbnQsXG4gICAgICAgICAgICAgIC8vIGluc2VydCB0aGUgdGVtcGxhdGUgd2l0aCBpbm5lckhUTUwuXG5cbiAgICAgICAgICAgICAgLy8gb25seSBpZiB0aGUgc2FtZSBodG1sIGlzIG5vdCBhbHJlYWR5IHJlbmRlcmVkXG4gICAgICAgICAgICAgIGlmICghJGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZCB8fCAhJGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZC5pc0VxdWFsTm9kZSgkbmV3Q29tcG9uZW50KSkge1xuICAgICAgICAgICAgICAgICRjb250YWluZXIuaW5uZXJIVE1MID0gY29tcG9uZW50SHRtbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzID0gY2xlYW5BdHRyTm9kZXMoJGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1vdW50IG5ld2x5IGFkZGVkIGNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudE5vZGVzLmZvckVhY2gobW91bnROb2RlKTtcbiAgICAgICAgICB9KCk7XG5cbiAgICAgICAgICBpZiAoKHR5cGVvZiBfcmV0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihfcmV0KSkgPT09IFwib2JqZWN0XCIpIHJldHVybiBfcmV0LnY7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcG9uZW50SHRtbDtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIER1cnJ1dGk7XG4gIH0oKTtcblxuICB2YXIgZHVycnV0aSA9IG5ldyBEdXJydXRpKCk7XG5cbiAgcmV0dXJuIGR1cnJ1dGk7XG5cbn0pKSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWR1cnJ1dGkuanMubWFwIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLmR1cnJ1dGkgPSBnbG9iYWwuZHVycnV0aSB8fCB7fSwgZ2xvYmFsLmR1cnJ1dGkuU3RvcmUgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogRHVycnV0aVxuICAgKiBVdGlscy5cbiAgICovXG5cbiAgZnVuY3Rpb24gaGFzV2luZG93KCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIHZhciBpc0NsaWVudCA9IGhhc1dpbmRvdygpO1xuXG4gIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9XG5cbiAgLy8gb25lLWxldmVsIG9iamVjdCBleHRlbmRcbiAgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBvYmogPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIHZhciBkZWZhdWx0cyA9IGFyZ3VtZW50c1sxXTtcblxuICAgIC8vIGNsb25lIG9iamVjdFxuICAgIHZhciBleHRlbmRlZCA9IGNsb25lKG9iaik7XG5cbiAgICAvLyBjb3B5IGRlZmF1bHQga2V5cyB3aGVyZSB1bmRlZmluZWRcbiAgICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIGV4dGVuZGVkW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGV4dGVuZGVkW2tleV0gPSBkZWZhdWx0c1trZXldO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV4dGVuZGVkO1xuICB9XG5cbiAgdmFyIERVUlJVVElfREVCVUcgPSB0cnVlO1xuXG4gIC8qIER1cnJ1dGlcbiAgICogRGF0YSBzdG9yZSB3aXRoIGNoYW5nZSBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFN0b3JlKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBoaXN0b3J5U3VwcG9ydCA9IGZhbHNlO1xuICAgIC8vIGhpc3RvcnkgaXMgYWN0aXZlIG9ubHkgaW4gdGhlIGJyb3dzZXIsIGJ5IGRlZmF1bHRcbiAgICBpZiAoaXNDbGllbnQpIHtcbiAgICAgIGhpc3RvcnlTdXBwb3J0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgaGlzdG9yeTogaGlzdG9yeVN1cHBvcnRcbiAgICB9KTtcblxuICAgIHRoaXMuZXZlbnRzID0ge1xuICAgICAgY2hhbmdlOiBbXVxuICAgIH07XG5cbiAgICB0aGlzLmRhdGEgPSBbXTtcbiAgfVxuXG4gIFN0b3JlLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKHRvcGljKSB7XG4gICAgdGhpcy5ldmVudHNbdG9waWNdID0gdGhpcy5ldmVudHNbdG9waWNdIHx8IFtdO1xuXG4gICAgLy8gaW1tdXRhYmxlLlxuICAgIC8vIHNvIG9uL29mZiBkb24ndCBjaGFuZ2UgdGhlIGFycmF5IGR1cnJpbmcgdHJpZ2dlci5cbiAgICB2YXIgZm91bmRFdmVudHMgPSB0aGlzLmV2ZW50c1t0b3BpY10uc2xpY2UoKTtcbiAgICBmb3VuZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgZXZlbnQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAodG9waWMsIGZ1bmMpIHtcbiAgICB0aGlzLmV2ZW50c1t0b3BpY10gPSB0aGlzLmV2ZW50c1t0b3BpY10gfHwgW107XG4gICAgdGhpcy5ldmVudHNbdG9waWNdLnB1c2goZnVuYyk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uICh0b3BpYywgZm4pIHtcbiAgICB0aGlzLmV2ZW50c1t0b3BpY10gPSB0aGlzLmV2ZW50c1t0b3BpY10gfHwgW107XG5cbiAgICAvLyBmaW5kIHRoZSBmbiBpbiB0aGUgYXJyXG4gICAgdmFyIGluZGV4ID0gW10uaW5kZXhPZi5jYWxsKHRoaXMuZXZlbnRzW3RvcGljXSwgZm4pO1xuXG4gICAgLy8gd2UgZGlkbid0IGZpbmQgaXQgaW4gdGhlIGFycmF5XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzW3RvcGljXS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5kYXRhW3RoaXMuZGF0YS5sZW5ndGggLSAxXTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xvbmUodmFsdWUpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjbG9uZSh0aGlzLmRhdGEpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhpc3RvcnkpIHtcbiAgICAgIHRoaXMuZGF0YS5wdXNoKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kYXRhID0gW3ZhbHVlXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScpO1xuXG4gICAgcmV0dXJuIHRoaXMuZ2V0KCk7XG4gIH07XG5cbiAgcmV0dXJuIFN0b3JlO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9yZS5qcy5tYXAiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwuSm90dGVkID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIHV0aWxcbiAgICovXG5cbiAgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBvYmogPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIHZhciBkZWZhdWx0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICB2YXIgZXh0ZW5kZWQgPSB7fTtcbiAgICAvLyBjbG9uZSBvYmplY3RcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgZXh0ZW5kZWRba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuXG4gICAgLy8gY29weSBkZWZhdWx0IGtleXMgd2hlcmUgdW5kZWZpbmVkXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBleHRlbmRlZFtrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBleHRlbmRlZFtrZXldID0gb2JqW2tleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleHRlbmRlZFtrZXldID0gZGVmYXVsdHNba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBleHRlbmRlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZldGNoKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG5cbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKHVybCwgeGhyKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH07XG5cbiAgICB4aHIuc2VuZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcnVuQ2FsbGJhY2soaW5kZXgsIHBhcmFtcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgfVxuXG4gICAgICBpbmRleCsrO1xuICAgICAgaWYgKGluZGV4IDwgYXJyLmxlbmd0aCkge1xuICAgICAgICBzZXFSdW5uZXIoaW5kZXgsIHJlcywgYXJyLCBlcnJvcnMsIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9ycywgcmVzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxUnVubmVyKGluZGV4LCBwYXJhbXMsIGFyciwgZXJyb3JzLCBjYWxsYmFjaykge1xuICAgIC8vIGFzeW5jXG4gICAgYXJyW2luZGV4XShwYXJhbXMsIHJ1bkNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxKGFyciwgcGFyYW1zKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmdW5jdGlvbiAoKSB7fTtcblxuICAgIHZhciBlcnJvcnMgPSBbXTtcblxuICAgIGlmICghYXJyLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9ycywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBzZXFSdW5uZXIoMCwgcGFyYW1zLCBhcnIsIGVycm9ycywgY2FsbGJhY2spO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2UoZm4sIGRlbGF5KSB7XG4gICAgdmFyIGNvb2xkb3duID0gbnVsbDtcbiAgICB2YXIgbXVsdGlwbGUgPSBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgIF9hcmd1bWVudHMgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmIChjb29sZG93bikge1xuICAgICAgICBtdWx0aXBsZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICBjbGVhclRpbWVvdXQoY29vbGRvd24pO1xuXG4gICAgICBjb29sZG93biA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgICAgICBmbi5hcHBseShfdGhpcywgX2FyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb29sZG93biA9IG51bGw7XG4gICAgICAgIG11bHRpcGxlID0gbnVsbDtcbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgaWYgKCFub2RlLmNsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgdGVtcENsYXNzID0gJyAnICsgbm9kZS5jbGFzc05hbWUgKyAnICc7XG4gICAgY2xhc3NOYW1lID0gJyAnICsgY2xhc3NOYW1lICsgJyAnO1xuXG4gICAgaWYgKHRlbXBDbGFzcy5pbmRleE9mKGNsYXNzTmFtZSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpIHtcbiAgICAvLyBjbGFzcyBpcyBhbHJlYWR5IGFkZGVkXG4gICAgaWYgKGhhc0NsYXNzKG5vZGUsIGNsYXNzTmFtZSkpIHtcbiAgICAgIHJldHVybiBub2RlLmNsYXNzTmFtZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5jbGFzc05hbWUpIHtcbiAgICAgIGNsYXNzTmFtZSA9ICcgJyArIGNsYXNzTmFtZTtcbiAgICB9XG5cbiAgICBub2RlLmNsYXNzTmFtZSArPSBjbGFzc05hbWU7XG5cbiAgICByZXR1cm4gbm9kZS5jbGFzc05hbWU7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpIHtcbiAgICB2YXIgc3BhY2VCZWZvcmUgPSAnICcgKyBjbGFzc05hbWU7XG4gICAgdmFyIHNwYWNlQWZ0ZXIgPSBjbGFzc05hbWUgKyAnICc7XG5cbiAgICBpZiAobm9kZS5jbGFzc05hbWUuaW5kZXhPZihzcGFjZUJlZm9yZSkgIT09IC0xKSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnJlcGxhY2Uoc3BhY2VCZWZvcmUsICcnKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUuY2xhc3NOYW1lLmluZGV4T2Yoc3BhY2VBZnRlcikgIT09IC0xKSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnJlcGxhY2Uoc3BhY2VBZnRlciwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnJlcGxhY2UoY2xhc3NOYW1lLCAnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lO1xuICB9XG5cbiAgZnVuY3Rpb24gZGF0YShub2RlLCBhdHRyKSB7XG4gICAgcmV0dXJuIG5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBhdHRyKTtcbiAgfVxuXG4gIC8vIG1vZGUgZGV0ZWN0aW9uIGJhc2VkIG9uIGNvbnRlbnQgdHlwZSBhbmQgZmlsZSBleHRlbnNpb25cbiAgdmFyIGRlZmF1bHRNb2RlbWFwID0ge1xuICAgICdodG1sJzogJ2h0bWwnLFxuICAgICdjc3MnOiAnY3NzJyxcbiAgICAnanMnOiAnamF2YXNjcmlwdCcsXG4gICAgJ2xlc3MnOiAnbGVzcycsXG4gICAgJ3N0eWwnOiAnc3R5bHVzJyxcbiAgICAnY29mZmVlJzogJ2NvZmZlZXNjcmlwdCdcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRNb2RlKCkge1xuICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgICB2YXIgZmlsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG4gICAgdmFyIGN1c3RvbU1vZGVtYXAgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gICAgdmFyIG1vZGVtYXAgPSBleHRlbmQoY3VzdG9tTW9kZW1hcCwgZGVmYXVsdE1vZGVtYXApO1xuXG4gICAgLy8gdHJ5IHRoZSBmaWxlIGV4dGVuc2lvblxuICAgIGZvciAodmFyIGtleSBpbiBtb2RlbWFwKSB7XG4gICAgICB2YXIga2V5TGVuZ3RoID0ga2V5Lmxlbmd0aDtcbiAgICAgIGlmIChmaWxlLnNsaWNlKC1rZXlMZW5ndGgrKykgPT09ICcuJyArIGtleSkge1xuICAgICAgICByZXR1cm4gbW9kZW1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRyeSB0aGUgZmlsZSB0eXBlIChodG1sL2Nzcy9qcylcbiAgICBmb3IgKHZhciBfa2V5IGluIG1vZGVtYXApIHtcbiAgICAgIGlmICh0eXBlID09PSBfa2V5KSB7XG4gICAgICAgIHJldHVybiBtb2RlbWFwW19rZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0eXBlO1xuICB9XG5cbiAgLyogdGVtcGxhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY29udGFpbmVyKCkge1xuICAgIHJldHVybiAnXFxuICAgIDx1bCBjbGFzcz1cImpvdHRlZC1uYXZcIj5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLXJlc3VsdFwiPlxcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWpvdHRlZC10eXBlPVwicmVzdWx0XCI+XFxuICAgICAgICAgIFJlc3VsdFxcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgICAgPGxpIGNsYXNzPVwiam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1odG1sXCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJodG1sXCI+XFxuICAgICAgICAgIEhUTUxcXG4gICAgICAgIDwvYT5cXG4gICAgICA8L2xpPlxcbiAgICAgIDxsaSBjbGFzcz1cImpvdHRlZC1uYXYtaXRlbSBqb3R0ZWQtbmF2LWl0ZW0tY3NzXCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJjc3NcIj5cXG4gICAgICAgICAgQ1NTXFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgICA8bGkgY2xhc3M9XCJqb3R0ZWQtbmF2LWl0ZW0gam90dGVkLW5hdi1pdGVtLWpzXCI+XFxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJqc1wiPlxcbiAgICAgICAgICBKYXZhU2NyaXB0XFxuICAgICAgICA8L2E+XFxuICAgICAgPC9saT5cXG4gICAgPC91bD5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLXJlc3VsdFwiPjxpZnJhbWU+PC9pZnJhbWU+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1odG1sXCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJqb3R0ZWQtcGFuZSBqb3R0ZWQtcGFuZS1jc3NcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1wYW5lIGpvdHRlZC1wYW5lLWpzXCI+PC9kaXY+XFxuICAnO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFuZUFjdGl2ZUNsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1wYW5lLWFjdGl2ZS0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnRhaW5lckNsYXNzKCkge1xuICAgIHJldHVybiAnam90dGVkJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc0ZpbGVDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtaGFzLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gZWRpdG9yQ2xhc3ModHlwZSkge1xuICAgIHJldHVybiAnam90dGVkLWVkaXRvciBqb3R0ZWQtZWRpdG9yLScgKyB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gZWRpdG9yQ29udGVudCh0eXBlKSB7XG4gICAgdmFyIGZpbGVVcmwgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuXG4gICAgcmV0dXJuICdcXG4gICAgPHRleHRhcmVhIGRhdGEtam90dGVkLXR5cGU9XCInICsgdHlwZSArICdcIiBkYXRhLWpvdHRlZC1maWxlPVwiJyArIGZpbGVVcmwgKyAnXCI+PC90ZXh0YXJlYT5cXG4gICAgPGRpdiBjbGFzcz1cImpvdHRlZC1zdGF0dXNcIj48L2Rpdj5cXG4gICc7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNNZXNzYWdlKGVycikge1xuICAgIHJldHVybiAnXFxuICAgIDxwPicgKyBlcnIgKyAnPC9wPlxcbiAgJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1c0NsYXNzKHR5cGUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1zdGF0dXMtJyArIHR5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNBY3RpdmVDbGFzcyh0eXBlKSB7XG4gICAgcmV0dXJuICdqb3R0ZWQtc3RhdHVzLWFjdGl2ZS0nICsgdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsdWdpbkNsYXNzKG5hbWUpIHtcbiAgICByZXR1cm4gJ2pvdHRlZC1wbHVnaW4tJyArIG5hbWU7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXNMb2FkaW5nKHVybCkge1xuICAgIHJldHVybiAnTG9hZGluZyA8c3Ryb25nPicgKyB1cmwgKyAnPC9zdHJvbmc+Li4nO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzRmV0Y2hFcnJvcih1cmwpIHtcbiAgICByZXR1cm4gJ1RoZXJlIHdhcyBhbiBlcnJvciBsb2FkaW5nIDxzdHJvbmc+JyArIHVybCArICc8L3N0cm9uZz4uJztcbiAgfVxuXG4gIHZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gIH0gOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gIH07XG5cblxuXG5cblxuICB2YXIgYXN5bmNHZW5lcmF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXdhaXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIEFzeW5jR2VuZXJhdG9yKGdlbikge1xuICAgICAgdmFyIGZyb250LCBiYWNrO1xuXG4gICAgICBmdW5jdGlvbiBzZW5kKGtleSwgYXJnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgIGFyZzogYXJnLFxuICAgICAgICAgICAgcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICAgIHJlamVjdDogcmVqZWN0LFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoYmFjaykge1xuICAgICAgICAgICAgYmFjayA9IGJhY2submV4dCA9IHJlcXVlc3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyb250ID0gYmFjayA9IHJlcXVlc3Q7XG4gICAgICAgICAgICByZXN1bWUoa2V5LCBhcmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlc3VtZShrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBnZW5ba2V5XShhcmcpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEF3YWl0VmFsdWUpIHtcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZS52YWx1ZSkudGhlbihmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICAgIHJlc3VtZShcIm5leHRcIiwgYXJnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgICAgcmVzdW1lKFwidGhyb3dcIiwgYXJnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXR0bGUocmVzdWx0LmRvbmUgPyBcInJldHVyblwiIDogXCJub3JtYWxcIiwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHNldHRsZShcInRocm93XCIsIGVycik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0dGxlKHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJyZXR1cm5cIjpcbiAgICAgICAgICAgIGZyb250LnJlc29sdmUoe1xuICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgIGRvbmU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwidGhyb3dcIjpcbiAgICAgICAgICAgIGZyb250LnJlamVjdCh2YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBmcm9udC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICBkb25lOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb250ID0gZnJvbnQubmV4dDtcblxuICAgICAgICBpZiAoZnJvbnQpIHtcbiAgICAgICAgICByZXN1bWUoZnJvbnQua2V5LCBmcm9udC5hcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhY2sgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ludm9rZSA9IHNlbmQ7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2VuLnJldHVybiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucmV0dXJuID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHtcbiAgICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoXCJuZXh0XCIsIGFyZyk7XG4gICAgfTtcblxuICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZS50aHJvdyA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoXCJ0aHJvd1wiLCBhcmcpO1xuICAgIH07XG5cbiAgICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUucmV0dXJuID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShcInJldHVyblwiLCBhcmcpO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgd3JhcDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBBc3luY0dlbmVyYXRvcihmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBhd2FpdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXdhaXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSgpO1xuXG5cblxuXG5cbiAgdmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICAgIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgICB9O1xuICB9KCk7XG5cblxuXG5cblxuXG5cbiAgdmFyIGdldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIHZhciBzZXQgPSBmdW5jdGlvbiBzZXQob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MgJiYgZGVzYy53cml0YWJsZSkge1xuICAgICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2V0dGVyID0gZGVzYy5zZXQ7XG5cbiAgICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXR0ZXIuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKiBwbHVnaW5cbiAgICovXG5cbiAgdmFyIHBsdWdpbnMgPSBbXTtcblxuICBmdW5jdGlvbiBmaW5kJDEoaWQpIHtcbiAgICBmb3IgKHZhciBwbHVnaW5JbmRleCBpbiBwbHVnaW5zKSB7XG4gICAgICB2YXIgcGx1Z2luID0gcGx1Z2luc1twbHVnaW5JbmRleF07XG4gICAgICBpZiAocGx1Z2luLl9pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjYW4ndCBmaW5kIHBsdWdpblxuICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBpZCArICcgaXMgbm90IHJlZ2lzdGVyZWQuJyk7XG4gIH1cblxuICBmdW5jdGlvbiByZWdpc3RlcihpZCwgcGx1Z2luKSB7XG4gICAgLy8gcHJpdmF0ZSBwcm9wZXJ0aWVzXG4gICAgcGx1Z2luLl9pZCA9IGlkO1xuICAgIHBsdWdpbnMucHVzaChwbHVnaW4pO1xuICB9XG5cbiAgLy8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGVhY2ggcGx1Z2luLCBvbiB0aGUgam90dGVkIGluc3RhbmNlXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX2dldCgnb3B0aW9ucycpLnBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICAvLyBjaGVjayBpZiBwbHVnaW4gZGVmaW5pdGlvbiBpcyBzdHJpbmcgb3Igb2JqZWN0XG4gICAgICB2YXIgUGx1Z2luID0gdm9pZCAwO1xuICAgICAgdmFyIHBsdWdpbk5hbWUgPSB2b2lkIDA7XG4gICAgICB2YXIgcGx1Z2luT3B0aW9ucyA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBwbHVnaW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdpbk5hbWUgPSBwbHVnaW47XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2YgcGx1Z2luID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihwbHVnaW4pKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGx1Z2luTmFtZSA9IHBsdWdpbi5uYW1lO1xuICAgICAgICBwbHVnaW5PcHRpb25zID0gcGx1Z2luLm9wdGlvbnMgfHwge307XG4gICAgICB9XG5cbiAgICAgIFBsdWdpbiA9IGZpbmQkMShwbHVnaW5OYW1lKTtcbiAgICAgIF90aGlzLl9nZXQoJ3BsdWdpbnMnKVtwbHVnaW5dID0gbmV3IFBsdWdpbihfdGhpcywgcGx1Z2luT3B0aW9ucyk7XG5cbiAgICAgIGFkZENsYXNzKF90aGlzLl9nZXQoJyRjb250YWluZXInKSwgcGx1Z2luQ2xhc3MocGx1Z2luTmFtZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogcHVic291cFxuICAgKi9cblxuICB2YXIgUHViU291cCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQdWJTb3VwKCkge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUHViU291cCk7XG5cbiAgICAgIHRoaXMudG9waWNzID0ge307XG4gICAgICB0aGlzLmNhbGxiYWNrcyA9IHt9O1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFB1YlNvdXAsIFt7XG4gICAgICBrZXk6ICdmaW5kJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmaW5kKHF1ZXJ5KSB7XG4gICAgICAgIHRoaXMudG9waWNzW3F1ZXJ5XSA9IHRoaXMudG9waWNzW3F1ZXJ5XSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9waWNzW3F1ZXJ5XTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdzdWJzY3JpYmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1YnNjcmliZSh0b3BpYywgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgcHJpb3JpdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDkwO1xuXG4gICAgICAgIHZhciBmb3VuZFRvcGljID0gdGhpcy5maW5kKHRvcGljKTtcbiAgICAgICAgc3Vic2NyaWJlci5fcHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgZm91bmRUb3BpYy5wdXNoKHN1YnNjcmliZXIpO1xuXG4gICAgICAgIC8vIHNvcnQgc3Vic2NyaWJlcnMgb24gcHJpb3JpdHlcbiAgICAgICAgZm91bmRUb3BpYy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuX3ByaW9yaXR5ID4gYi5fcHJpb3JpdHkgPyAxIDogYi5fcHJpb3JpdHkgPiBhLl9wcmlvcml0eSA/IC0xIDogMDtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlbW92ZXMgYSBmdW5jdGlvbiBmcm9tIGFuIGFycmF5XG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW1vdmVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVyKGFyciwgZm4pIHtcbiAgICAgICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIGlmIG5vIGZuIGlzIHNwZWNpZmllZFxuICAgICAgICAgIC8vIGNsZWFuLXVwIHRoZSBhcnJheVxuICAgICAgICAgIGlmICghZm4pIHtcbiAgICAgICAgICAgIGFyci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGZpbmQgdGhlIGZuIGluIHRoZSBhcnJcbiAgICAgICAgICB2YXIgaW5kZXggPSBbXS5pbmRleE9mLmNhbGwoYXJyLCBmbik7XG5cbiAgICAgICAgICAvLyB3ZSBkaWRuJ3QgZmluZCBpdCBpbiB0aGUgYXJyYXlcbiAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3Vuc3Vic2NyaWJlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB1bnN1YnNjcmliZSh0b3BpYywgc3Vic2NyaWJlcikge1xuICAgICAgICAvLyByZW1vdmUgZnJvbSBzdWJzY3JpYmVyc1xuICAgICAgICB2YXIgZm91bmRUb3BpYyA9IHRoaXMuZmluZCh0b3BpYyk7XG4gICAgICAgIHRoaXMucmVtb3Zlcihmb3VuZFRvcGljLCBzdWJzY3JpYmVyKTtcblxuICAgICAgICAvLyByZW1vdmUgZnJvbSBjYWxsYmFja3NcbiAgICAgICAgdGhpcy5jYWxsYmFja3NbdG9waWNdID0gdGhpcy5jYWxsYmFja3NbdG9waWNdIHx8IFtdO1xuICAgICAgICB0aGlzLnJlbW92ZXIodGhpcy5jYWxsYmFja3NbdG9waWNdLCBzdWJzY3JpYmVyKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2VxdWVudGlhbGx5IHJ1bnMgYSBtZXRob2Qgb24gYWxsIHBsdWdpbnNcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3B1Ymxpc2gnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHB1Ymxpc2godG9waWMpIHtcbiAgICAgICAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICAgICAgdmFyIGZvdW5kVG9waWMgPSB0aGlzLmZpbmQodG9waWMpO1xuICAgICAgICB2YXIgcnVuTGlzdCA9IFtdO1xuXG4gICAgICAgIGZvdW5kVG9waWMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICAgIHJ1bkxpc3QucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VxKHJ1bkxpc3QsIHBhcmFtcywgdGhpcy5ydW5DYWxsYmFja3ModG9waWMpKTtcbiAgICAgIH1cblxuICAgICAgLy8gcGFyYWxsZWwgcnVuIGFsbCAuZG9uZSBjYWxsYmFja3NcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3J1bkNhbGxiYWNrcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcnVuQ2FsbGJhY2tzKHRvcGljKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlcnIsIHBhcmFtcykge1xuICAgICAgICAgIF90aGlzLmNhbGxiYWNrc1t0b3BpY10gPSBfdGhpcy5jYWxsYmFja3NbdG9waWNdIHx8IFtdO1xuXG4gICAgICAgICAgX3RoaXMuY2FsbGJhY2tzW3RvcGljXS5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gYXR0YWNoIGEgY2FsbGJhY2sgd2hlbiBhIHB1Ymxpc2hbdG9waWNdIGlzIGRvbmVcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2RvbmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRvbmUodG9waWMpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICB0aGlzLmNhbGxiYWNrc1t0b3BpY10gPSB0aGlzLmNhbGxiYWNrc1t0b3BpY10gfHwgW107XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3RvcGljXS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFB1YlNvdXA7XG4gIH0oKTtcblxuICAvKiByZW5kZXIgcGx1Z2luXG4gICAqIHJlbmRlcnMgdGhlIGlmcmFtZVxuICAgKi9cblxuICB2YXIgUGx1Z2luUmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblJlbmRlcihqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpblJlbmRlcik7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBpZnJhbWUgc3JjZG9jIHN1cHBvcnRcbiAgICAgIHZhciBzdXBwb3J0U3JjZG9jID0gISEoJ3NyY2RvYycgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJykpO1xuICAgICAgdmFyICRyZXN1bHRGcmFtZSA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtcGFuZS1yZXN1bHQgaWZyYW1lJyk7XG5cbiAgICAgIHZhciBmcmFtZUNvbnRlbnQgPSAnJztcblxuICAgICAgLy8gY2FjaGVkIGNvbnRlbnRcbiAgICAgIHZhciBjb250ZW50ID0ge1xuICAgICAgICBodG1sOiAnJyxcbiAgICAgICAgY3NzOiAnJyxcbiAgICAgICAganM6ICcnXG4gICAgICB9O1xuXG4gICAgICAvLyBjYXRjaCBkb21yZWFkeSBldmVudHMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZG9tcmVhZHkuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIHJlbmRlciBvbiBlYWNoIGNoYW5nZVxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCAxMDApO1xuXG4gICAgICAvLyBwdWJsaWNcbiAgICAgIHRoaXMuc3VwcG9ydFNyY2RvYyA9IHN1cHBvcnRTcmNkb2M7XG4gICAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgdGhpcy5mcmFtZUNvbnRlbnQgPSBmcmFtZUNvbnRlbnQ7XG4gICAgICB0aGlzLiRyZXN1bHRGcmFtZSA9ICRyZXN1bHRGcmFtZTtcblxuICAgICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICAgIHRoaXMuaW5kZXggPSAwO1xuXG4gICAgICB0aGlzLmxhc3RDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblJlbmRlciwgW3tcbiAgICAgIGtleTogJ3RlbXBsYXRlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgICAgICAgdmFyIGJvZHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgICAgICB2YXIgc2NyaXB0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAnJztcblxuICAgICAgICByZXR1cm4gJ1xcbiAgICAgIDwhZG9jdHlwZSBodG1sPlxcbiAgICAgIDxodG1sPlxcbiAgICAgICAgPGhlYWQ+XFxuICAgICAgICAgIDxzY3JpcHQ+XFxuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcXG4gICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxcJ0RPTUNvbnRlbnRMb2FkZWRcXCcsIGZ1bmN0aW9uICgpIHtcXG4gICAgICAgICAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeSh7XFxuICAgICAgICAgICAgICAgICAgdHlwZTogXFwnam90dGVkLWRvbS1yZWFkeVxcJ1xcbiAgICAgICAgICAgICAgICB9KSwgXFwnKlxcJylcXG4gICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgfSgpKVxcbiAgICAgICAgICA8L3NjcmlwdD5cXG5cXG4gICAgICAgICAgPHN0eWxlPicgKyBzdHlsZSArICc8L3N0eWxlPlxcbiAgICAgICAgPC9oZWFkPlxcbiAgICAgICAgPGJvZHk+XFxuICAgICAgICAgICcgKyBib2R5ICsgJ1xcblxcbiAgICAgICAgICA8IS0tXFxuICAgICAgICAgICAgSm90dGVkOlxcbiAgICAgICAgICAgIEVtcHR5IHNjcmlwdCB0YWcgcHJldmVudHMgbWFsZm9ybWVkIEhUTUwgZnJvbSBicmVha2luZyB0aGUgbmV4dCBzY3JpcHQuXFxuICAgICAgICAgIC0tPlxcbiAgICAgICAgICA8c2NyaXB0Pjwvc2NyaXB0PlxcbiAgICAgICAgICA8c2NyaXB0PicgKyBzY3JpcHQgKyAnPC9zY3JpcHQ+XFxuICAgICAgICA8L2JvZHk+XFxuICAgICAgPC9odG1sPlxcbiAgICAnO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAvLyBjYWNoZSBtYW5pcHVsYXRlZCBjb250ZW50XG4gICAgICAgIHRoaXMuY29udGVudFtwYXJhbXMudHlwZV0gPSBwYXJhbXMuY29udGVudDtcblxuICAgICAgICAvLyBjaGVjayBleGlzdGluZyBhbmQgdG8tYmUtcmVuZGVyZWQgY29udGVudFxuICAgICAgICB2YXIgb2xkRnJhbWVDb250ZW50ID0gdGhpcy5mcmFtZUNvbnRlbnQ7XG4gICAgICAgIHRoaXMuZnJhbWVDb250ZW50ID0gdGhpcy50ZW1wbGF0ZSh0aGlzLmNvbnRlbnRbJ2NzcyddLCB0aGlzLmNvbnRlbnRbJ2h0bWwnXSwgdGhpcy5jb250ZW50WydqcyddKTtcblxuICAgICAgICAvLyBjYWNoZSB0aGUgY3VycmVudCBjYWxsYmFjayBhcyBnbG9iYWwsXG4gICAgICAgIC8vIHNvIHdlIGNhbiBjYWxsIGl0IGZyb20gdGhlIG1lc3NhZ2UgY2FsbGJhY2suXG4gICAgICAgIHRoaXMubGFzdENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLmxhc3RDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBkb24ndCByZW5kZXIgaWYgcHJldmlvdXMgYW5kIG5ldyBmcmFtZSBjb250ZW50IGFyZSB0aGUgc2FtZS5cbiAgICAgICAgLy8gbW9zdGx5IGZvciB0aGUgYHBsYXlgIHBsdWdpbixcbiAgICAgICAgLy8gc28gd2UgZG9uJ3QgcmUtcmVuZGVyIHRoZSBzYW1lIGNvbnRlbnQgb24gZWFjaCBjaGFuZ2UuXG4gICAgICAgIC8vIHVubGVzcyB3ZSBzZXQgZm9yY2VSZW5kZXIuXG4gICAgICAgIGlmIChwYXJhbXMuZm9yY2VSZW5kZXIgIT09IHRydWUgJiYgdGhpcy5mcmFtZUNvbnRlbnQgPT09IG9sZEZyYW1lQ29udGVudCkge1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3VwcG9ydFNyY2RvYykge1xuICAgICAgICAgIC8vIHNyY2RvYyBpbiB1bnJlbGlhYmxlIGluIENocm9tZS5cbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZ2hpbmRhL2pvdHRlZC9pc3N1ZXMvMjNcblxuICAgICAgICAgIC8vIHJlLWNyZWF0ZSB0aGUgaWZyYW1lIG9uIGVhY2ggY2hhbmdlLFxuICAgICAgICAgIC8vIHRvIGRpc2NhcmQgdGhlIHByZXZpb3VzbHkgbG9hZGVkIHNjcmlwdHMuXG4gICAgICAgICAgdmFyICRuZXdSZXN1bHRGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKCRuZXdSZXN1bHRGcmFtZSwgdGhpcy4kcmVzdWx0RnJhbWUpO1xuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lID0gJG5ld1Jlc3VsdEZyYW1lO1xuXG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5vcGVuKCk7XG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC53cml0ZSh0aGlzLmZyYW1lQ29udGVudCk7XG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5jbG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG9sZGVyIGJyb3dzZXJzIHdpdGhvdXQgaWZyYW1lIHNyY3NldCBzdXBwb3J0IChJRTkpLlxuICAgICAgICAgIHRoaXMuJHJlc3VsdEZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1zcmNkb2MnLCB0aGlzLmZyYW1lQ29udGVudCk7XG5cbiAgICAgICAgICAvLyB0aXBzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2p1Z2dsaW5taWtlL3NyY2RvYy1wb2x5ZmlsbFxuICAgICAgICAgIC8vIENvcHlyaWdodCAoYykgMjAxMiBNaWtlIFBlbm5pc2lcbiAgICAgICAgICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gICAgICAgICAgdmFyIGpzVXJsID0gJ2phdmFzY3JpcHQ6d2luZG93LmZyYW1lRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNyY2RvY1wiKTsnO1xuXG4gICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuc2V0QXR0cmlidXRlKCdzcmMnLCBqc1VybCk7XG5cbiAgICAgICAgICAvLyBFeHBsaWNpdGx5IHNldCB0aGUgaUZyYW1lJ3Mgd2luZG93LmxvY2F0aW9uIGZvclxuICAgICAgICAgIC8vIGNvbXBhdGliaWxpdHkgd2l0aCBJRTksIHdoaWNoIGRvZXMgbm90IHJlYWN0IHRvIGNoYW5nZXMgaW5cbiAgICAgICAgICAvLyB0aGUgYHNyY2AgYXR0cmlidXRlIHdoZW4gaXQgaXMgYSBgamF2YXNjcmlwdDpgIFVSTC5cbiAgICAgICAgICBpZiAodGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbiA9IGpzVXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2RvbXJlYWR5JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkb21yZWFkeShlKSB7XG4gICAgICAgIC8vIG9ubHkgY2F0Y2ggbWVzc2FnZXMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICAgIGlmIChlLnNvdXJjZSAhPT0gdGhpcy4kcmVzdWx0RnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhJCQxID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSQkMSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICBpZiAoZGF0YSQkMS50eXBlID09PSAnam90dGVkLWRvbS1yZWFkeScpIHtcbiAgICAgICAgICB0aGlzLmxhc3RDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5SZW5kZXI7XG4gIH0oKTtcblxuICAvKiBzY3JpcHRsZXNzIHBsdWdpblxuICAgKiByZW1vdmVzIHNjcmlwdCB0YWdzIGZyb20gaHRtbCBjb250ZW50XG4gICAqL1xuXG4gIHZhciBQbHVnaW5TY3JpcHRsZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpblNjcmlwdGxlc3Moam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5TY3JpcHRsZXNzKTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3NjcmlwdGluZy5odG1sXG4gICAgICB2YXIgcnVuU2NyaXB0VHlwZXMgPSBbJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnLCAnYXBwbGljYXRpb24vZWNtYXNjcmlwdCcsICdhcHBsaWNhdGlvbi94LWVjbWFzY3JpcHQnLCAnYXBwbGljYXRpb24veC1qYXZhc2NyaXB0JywgJ3RleHQvZWNtYXNjcmlwdCcsICd0ZXh0L2phdmFzY3JpcHQnLCAndGV4dC9qYXZhc2NyaXB0MS4wJywgJ3RleHQvamF2YXNjcmlwdDEuMScsICd0ZXh0L2phdmFzY3JpcHQxLjInLCAndGV4dC9qYXZhc2NyaXB0MS4zJywgJ3RleHQvamF2YXNjcmlwdDEuNCcsICd0ZXh0L2phdmFzY3JpcHQxLjUnLCAndGV4dC9qc2NyaXB0JywgJ3RleHQvbGl2ZXNjcmlwdCcsICd0ZXh0L3gtZWNtYXNjcmlwdCcsICd0ZXh0L3gtamF2YXNjcmlwdCddO1xuXG4gICAgICAvLyByZW1vdmUgc2NyaXB0IHRhZ3Mgb24gZWFjaCBjaGFuZ2VcbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIHB1YmxpY1xuICAgICAgdGhpcy5ydW5TY3JpcHRUeXBlcyA9IHJ1blNjcmlwdFR5cGVzO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpblNjcmlwdGxlc3MsIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2h0bWwnKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgSUU5IHN1cHBvcnQsIHJlbW92ZSB0aGUgc2NyaXB0IHRhZ3MgZnJvbSBIVE1MIGNvbnRlbnQuXG4gICAgICAgIC8vIHdoZW4gd2Ugc3RvcCBzdXBwb3J0aW5nIElFOSwgd2UgY2FuIHVzZSB0aGUgc2FuZGJveCBhdHRyaWJ1dGUuXG4gICAgICAgIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBmcmFnbWVudC5pbm5lckhUTUwgPSBwYXJhbXMuY29udGVudDtcblxuICAgICAgICB2YXIgdHlwZUF0dHIgPSBudWxsO1xuXG4gICAgICAgIC8vIHJlbW92ZSBhbGwgc2NyaXB0IHRhZ3NcbiAgICAgICAgdmFyICRzY3JpcHRzID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0Jyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0eXBlQXR0ciA9ICRzY3JpcHRzW2ldLmdldEF0dHJpYnV0ZSgndHlwZScpO1xuXG4gICAgICAgICAgLy8gb25seSByZW1vdmUgc2NyaXB0IHRhZ3Mgd2l0aG91dCB0aGUgdHlwZSBhdHRyaWJ1dGVcbiAgICAgICAgICAvLyBvciB3aXRoIGEgamF2YXNjcmlwdCBtaW1lIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgICAgICAvLyB0aGUgb25lcyB0aGF0IGFyZSBydW4gYnkgdGhlIGJyb3dzZXIuXG4gICAgICAgICAgaWYgKCF0eXBlQXR0ciB8fCB0aGlzLnJ1blNjcmlwdFR5cGVzLmluZGV4T2YodHlwZUF0dHIpICE9PSAtMSkge1xuICAgICAgICAgICAgJHNjcmlwdHNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCgkc2NyaXB0c1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSBmcmFnbWVudC5pbm5lckhUTUw7XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpblNjcmlwdGxlc3M7XG4gIH0oKTtcblxuICAvKiBhY2UgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5BY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQWNlKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQWNlKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMTtcbiAgICAgIHZhciBpO1xuXG4gICAgICB0aGlzLmVkaXRvciA9IHt9O1xuICAgICAgdGhpcy5qb3R0ZWQgPSBqb3R0ZWQ7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBBY2UgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5hY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyICRlZGl0b3JzID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmpvdHRlZC1lZGl0b3InKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8ICRlZGl0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciAkdGV4dGFyZWEgPSAkZWRpdG9yc1tpXS5xdWVyeVNlbGVjdG9yKCd0ZXh0YXJlYScpO1xuICAgICAgICB2YXIgdHlwZSA9IGRhdGEoJHRleHRhcmVhLCAnam90dGVkLXR5cGUnKTtcbiAgICAgICAgdmFyIGZpbGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC1maWxlJyk7XG5cbiAgICAgICAgdmFyICRhY2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJGVkaXRvcnNbaV0uYXBwZW5kQ2hpbGQoJGFjZUNvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5lZGl0b3JbdHlwZV0gPSB3aW5kb3cuYWNlLmVkaXQoJGFjZUNvbnRhaW5lcik7XG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmVkaXRvclt0eXBlXTtcblxuICAgICAgICB2YXIgZWRpdG9yT3B0aW9ucyA9IGV4dGVuZChvcHRpb25zKTtcblxuICAgICAgICBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoJ2FjZS9tb2RlLycgKyBnZXRNb2RlKHR5cGUsIGZpbGUpKTtcbiAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuXG4gICAgICAgIGVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgIH1cblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQWNlLCBbe1xuICAgICAga2V5OiAnZWRpdG9yQ2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlZGl0b3JDaGFuZ2UocGFyYW1zKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5qb3R0ZWQudHJpZ2dlcignY2hhbmdlJywgcGFyYW1zKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmVkaXRvcltwYXJhbXMudHlwZV07XG5cbiAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBzdGFydGVkIGJ5IHRoZSBhY2UgY2hhbmdlLlxuICAgICAgICAvLyB0cmlnZ2VyZWQgb25seSBvbmNlIHBlciBlZGl0b3IsXG4gICAgICAgIC8vIHdoZW4gdGhlIHRleHRhcmVhIGlzIHBvcHVsYXRlZC9maWxlIGlzIGxvYWRlZC5cbiAgICAgICAgaWYgKCFwYXJhbXMuYWNlRWRpdG9yKSB7XG4gICAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRWYWx1ZShwYXJhbXMuY29udGVudCk7XG5cbiAgICAgICAgICAvLyBhdHRhY2ggdGhlIGV2ZW50IG9ubHkgYWZ0ZXIgdGhlIGZpbGUgaXMgbG9hZGVkXG4gICAgICAgICAgcGFyYW1zLmFjZUVkaXRvciA9IGVkaXRvcjtcbiAgICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIHRoaXMuZWRpdG9yQ2hhbmdlKHBhcmFtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFuaXB1bGF0ZSB0aGUgcGFyYW1zIGFuZCBwYXNzIHRoZW0gb25cbiAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkFjZTtcbiAgfSgpO1xuXG4gIC8qIGNvcmVtaXJyb3IgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5Db2RlTWlycm9yID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBsdWdpbkNvZGVNaXJyb3Ioam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5Db2RlTWlycm9yKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMTtcbiAgICAgIHZhciBpO1xuXG4gICAgICB0aGlzLmVkaXRvciA9IHt9O1xuICAgICAgdGhpcy5qb3R0ZWQgPSBqb3R0ZWQ7XG5cbiAgICAgIC8vIGN1c3RvbSBtb2RlbWFwIGZvciBjb2RlbWlycm9yXG4gICAgICB2YXIgbW9kZW1hcCA9IHtcbiAgICAgICAgJ2h0bWwnOiAnaHRtbG1peGVkJ1xuICAgICAgfTtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgLy8gY2hlY2sgaWYgQ29kZU1pcnJvciBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LkNvZGVNaXJyb3IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyICRlZGl0b3JzID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmpvdHRlZC1lZGl0b3InKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8ICRlZGl0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciAkdGV4dGFyZWEgPSAkZWRpdG9yc1tpXS5xdWVyeVNlbGVjdG9yKCd0ZXh0YXJlYScpO1xuICAgICAgICB2YXIgdHlwZSA9IGRhdGEoJHRleHRhcmVhLCAnam90dGVkLXR5cGUnKTtcbiAgICAgICAgdmFyIGZpbGUgPSBkYXRhKCR0ZXh0YXJlYSwgJ2pvdHRlZC1maWxlJyk7XG5cbiAgICAgICAgdGhpcy5lZGl0b3JbdHlwZV0gPSB3aW5kb3cuQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoJHRleHRhcmVhLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lZGl0b3JbdHlwZV0uc2V0T3B0aW9uKCdtb2RlJywgZ2V0TW9kZSh0eXBlLCBmaWxlLCBtb2RlbWFwKSk7XG4gICAgICB9XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkNvZGVNaXJyb3IsIFt7XG4gICAgICBrZXk6ICdlZGl0b3JDaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRvckNoYW5nZShwYXJhbXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIHRyaWdnZXIgYSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICBfdGhpcy5qb3R0ZWQudHJpZ2dlcignY2hhbmdlJywgcGFyYW1zKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmVkaXRvcltwYXJhbXMudHlwZV07XG5cbiAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBzdGFydGVkIGJ5IHRoZSBjb2RlbWlycm9yIGNoYW5nZS5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIG9ubHkgb25jZSBwZXIgZWRpdG9yLFxuICAgICAgICAvLyB3aGVuIHRoZSB0ZXh0YXJlYSBpcyBwb3B1bGF0ZWQvZmlsZSBpcyBsb2FkZWQuXG4gICAgICAgIGlmICghcGFyYW1zLmNtRWRpdG9yKSB7XG4gICAgICAgICAgZWRpdG9yLnNldFZhbHVlKHBhcmFtcy5jb250ZW50KTtcblxuICAgICAgICAgIC8vIGF0dGFjaCB0aGUgZXZlbnQgb25seSBhZnRlciB0aGUgZmlsZSBpcyBsb2FkZWRcbiAgICAgICAgICBwYXJhbXMuY21FZGl0b3IgPSBlZGl0b3I7XG4gICAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCB0aGlzLmVkaXRvckNoYW5nZShwYXJhbXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hbmlwdWxhdGUgdGhlIHBhcmFtcyBhbmQgcGFzcyB0aGVtIG9uXG4gICAgICAgIHBhcmFtcy5jb250ZW50ID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5Db2RlTWlycm9yO1xuICB9KCk7XG5cbiAgLyogbGVzcyBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpbkxlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luTGVzcyhqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkxlc3MpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGxlc3MgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5sZXNzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGNoYW5nZSBDU1MgbGluayBsYWJlbCB0byBMZXNzXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJjc3NcIl0nKS5pbm5lckhUTUwgPSAnTGVzcyc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkxlc3MsIFt7XG4gICAgICBrZXk6ICdpc0xlc3MnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzTGVzcyhwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlICE9PSAnY3NzJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXMuZmlsZS5pbmRleE9mKCcubGVzcycpICE9PSAtMSB8fCBwYXJhbXMuZmlsZSA9PT0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIC5sZXNzIGFuZCBibGFuayBmaWxlc1xuICAgICAgICBpZiAodGhpcy5pc0xlc3MocGFyYW1zKSkge1xuICAgICAgICAgIHdpbmRvdy5sZXNzLnJlbmRlcihwYXJhbXMuY29udGVudCwgdGhpcy5vcHRpb25zLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGNvbnRlbnQgd2l0aCB0aGUgcGFyc2VkIGxlc3NcbiAgICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSByZXMuY3NzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBjYWxsYmFjayBlaXRoZXIgd2F5LFxuICAgICAgICAgIC8vIHRvIG5vdCBicmVhayB0aGUgcHVic291cFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkxlc3M7XG4gIH0oKTtcblxuICAvKiBjb2ZmZWVzY3JpcHQgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5Db2ZmZWVTY3JpcHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luQ29mZmVlU2NyaXB0KGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQ29mZmVlU2NyaXB0KTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBjb2ZmZWVzY3JpcHQgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5Db2ZmZWVTY3JpcHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIEpTIGxpbmsgbGFiZWwgdG8gTGVzc1xuICAgICAgam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignYVtkYXRhLWpvdHRlZC10eXBlPVwianNcIl0nKS5pbm5lckhUTUwgPSAnQ29mZmVlU2NyaXB0JztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luQ29mZmVlU2NyaXB0LCBbe1xuICAgICAga2V5OiAnaXNDb2ZmZWUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzQ29mZmVlKHBhcmFtcykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdqcycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zLmZpbGUuaW5kZXhPZignLmNvZmZlZScpICE9PSAtMSB8fCBwYXJhbXMuZmlsZSA9PT0gJyc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIC5sZXNzIGFuZCBibGFuayBmaWxlc1xuICAgICAgICBpZiAodGhpcy5pc0NvZmZlZShwYXJhbXMpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gd2luZG93LkNvZmZlZVNjcmlwdC5jb21waWxlKHBhcmFtcy5jb250ZW50KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFBsdWdpbkNvZmZlZVNjcmlwdDtcbiAgfSgpO1xuXG4gIC8qIHN0eWx1cyBwbHVnaW5cbiAgICovXG5cbiAgdmFyIFBsdWdpblN0eWx1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5TdHlsdXMoam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5TdHlsdXMpO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAyMDtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIHN0eWx1cyBpcyBsb2FkZWRcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LnN0eWx1cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGFuZ2UgQ1NTIGxpbmsgbGFiZWwgdG8gU3R5bHVzXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJjc3NcIl0nKS5pbm5lckhUTUwgPSAnU3R5bHVzJztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luU3R5bHVzLCBbe1xuICAgICAga2V5OiAnaXNTdHlsdXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzU3R5bHVzKHBhcmFtcykge1xuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdjc3MnKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5maWxlLmluZGV4T2YoJy5zdHlsJykgIT09IC0xIHx8IHBhcmFtcy5maWxlID09PSAnJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UgLnN0eWwgYW5kIGJsYW5rIGZpbGVzXG4gICAgICAgIGlmICh0aGlzLmlzU3R5bHVzKHBhcmFtcykpIHtcbiAgICAgICAgICB3aW5kb3cuc3R5bHVzKHBhcmFtcy5jb250ZW50LCB0aGlzLm9wdGlvbnMpLnJlbmRlcihmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGNvbnRlbnQgd2l0aCB0aGUgcGFyc2VkIGxlc3NcbiAgICAgICAgICAgICAgcGFyYW1zLmNvbnRlbnQgPSByZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luU3R5bHVzO1xuICB9KCk7XG5cbiAgLyogYmFiZWwgcGx1Z2luXG4gICAqL1xuXG4gIHZhciBQbHVnaW5CYWJlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5CYWJlbChqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbkJhYmVsKTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMjA7XG5cbiAgICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGJhYmVsIGlzIGxvYWRlZFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuQmFiZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIHVzaW5nIGJhYmVsLXN0YW5kYWxvbmVcbiAgICAgICAgdGhpcy5iYWJlbCA9IHdpbmRvdy5CYWJlbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5iYWJlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdXNpbmcgYnJvd3Nlci5qcyBmcm9tIGJhYmVsLWNvcmUgNS54XG4gICAgICAgIHRoaXMuYmFiZWwgPSB7XG4gICAgICAgICAgdHJhbnNmb3JtOiB3aW5kb3cuYmFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIGpzIGxpbmsgbGFiZWxcbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1qb3R0ZWQtdHlwZT1cImpzXCJdJykuaW5uZXJIVE1MID0gJ0VTMjAxNSc7XG5cbiAgICAgIGpvdHRlZC5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgcHJpb3JpdHkpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFBsdWdpbkJhYmVsLCBbe1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBvbmx5IHBhcnNlIGpzIGNvbnRlbnRcbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnanMnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gdGhpcy5iYWJlbC50cmFuc2Zvcm0ocGFyYW1zLmNvbnRlbnQsIHRoaXMub3B0aW9ucykuY29kZTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHBhcmFtcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5CYWJlbDtcbiAgfSgpO1xuXG4gIC8qIG1hcmtkb3duIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luTWFya2Rvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luTWFya2Rvd24oam90dGVkLCBvcHRpb25zKSB7XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBQbHVnaW5NYXJrZG93bik7XG5cbiAgICAgIHZhciBwcmlvcml0eSA9IDIwO1xuXG4gICAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge30pO1xuXG4gICAgICAvLyBjaGVjayBpZiBtYXJrZWQgaXMgbG9hZGVkXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5tYXJrZWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgd2luZG93Lm1hcmtlZC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAvLyBjaGFuZ2UgaHRtbCBsaW5rIGxhYmVsXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtam90dGVkLXR5cGU9XCJodG1sXCJdJykuaW5uZXJIVE1MID0gJ01hcmtkb3duJztcblxuICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZS5iaW5kKHRoaXMpLCBwcmlvcml0eSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luTWFya2Rvd24sIFt7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UgaHRtbCBjb250ZW50XG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2h0bWwnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gd2luZG93Lm1hcmtlZChwYXJhbXMuY29udGVudCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBwYXJhbXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGNhbGxiYWNrIGVpdGhlciB3YXksXG4gICAgICAgICAgLy8gdG8gbm90IGJyZWFrIHRoZSBwdWJzb3VwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gUGx1Z2luTWFya2Rvd247XG4gIH0oKTtcblxuICAvKiBjb25zb2xlIHBsdWdpblxuICAgKi9cblxuICB2YXIgUGx1Z2luQ29uc29sZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQbHVnaW5Db25zb2xlKGpvdHRlZCwgb3B0aW9ucykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luQ29uc29sZSk7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICBhdXRvQ2xlYXI6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByaW9yaXR5ID0gMzA7XG4gICAgICB2YXIgaGlzdG9yeSA9IFtdO1xuICAgICAgdmFyIGhpc3RvcnlJbmRleCA9IDA7XG4gICAgICB2YXIgbG9nQ2FwdHVyZVNuaXBwZXQgPSAnKCcgKyB0aGlzLmNhcHR1cmUudG9TdHJpbmcoKSArICcpKCk7JztcbiAgICAgIHZhciBjb250ZW50Q2FjaGUgPSB7XG4gICAgICAgIGh0bWw6ICcnLFxuICAgICAgICBjc3M6ICcnLFxuICAgICAgICBqczogJydcbiAgICAgIH07XG5cbiAgICAgIC8vIG5ldyB0YWIgYW5kIHBhbmUgbWFya3VwXG4gICAgICB2YXIgJG5hdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICBhZGRDbGFzcygkbmF2LCAnam90dGVkLW5hdi1pdGVtIGpvdHRlZC1uYXYtaXRlbS1jb25zb2xlJyk7XG4gICAgICAkbmF2LmlubmVySFRNTCA9ICc8YSBocmVmPVwiI1wiIGRhdGEtam90dGVkLXR5cGU9XCJjb25zb2xlXCI+SlMgQ29uc29sZTwvYT4nO1xuXG4gICAgICB2YXIgJHBhbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGFkZENsYXNzKCRwYW5lLCAnam90dGVkLXBhbmUgam90dGVkLXBhbmUtY29uc29sZScpO1xuXG4gICAgICAkcGFuZS5pbm5lckhUTUwgPSAnXFxuICAgICAgPGRpdiBjbGFzcz1cImpvdHRlZC1jb25zb2xlLWNvbnRhaW5lclwiPlxcbiAgICAgICAgPHVsIGNsYXNzPVwiam90dGVkLWNvbnNvbGUtb3V0cHV0XCI+PC91bD5cXG4gICAgICAgIDxmb3JtIGNsYXNzPVwiam90dGVkLWNvbnNvbGUtaW5wdXRcIj5cXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XFxuICAgICAgICA8L2Zvcm0+XFxuICAgICAgPC9kaXY+XFxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImpvdHRlZC1idXR0b24gam90dGVkLWNvbnNvbGUtY2xlYXJcIj5DbGVhcjwvYnV0dG9uPlxcbiAgICAnO1xuXG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCgkcGFuZSk7XG4gICAgICBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLW5hdicpLmFwcGVuZENoaWxkKCRuYXYpO1xuXG4gICAgICB2YXIgJGNvbnRhaW5lciA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1jb250YWluZXInKTtcbiAgICAgIHZhciAkb3V0cHV0ID0gam90dGVkLiRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1jb25zb2xlLW91dHB1dCcpO1xuICAgICAgdmFyICRpbnB1dCA9IGpvdHRlZC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtY29uc29sZS1pbnB1dCBpbnB1dCcpO1xuICAgICAgdmFyICRpbnB1dEZvcm0gPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtaW5wdXQnKTtcbiAgICAgIHZhciAkY2xlYXIgPSBqb3R0ZWQuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuam90dGVkLWNvbnNvbGUtY2xlYXInKTtcblxuICAgICAgLy8gc3VibWl0IHRoZSBpbnB1dCBmb3JtXG4gICAgICAkaW5wdXRGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMuc3VibWl0LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjb25zb2xlIGhpc3RvcnlcbiAgICAgICRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oaXN0b3J5LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjbGVhciBidXR0b25cbiAgICAgICRjbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xlYXIuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGNsZWFyIHRoZSBjb25zb2xlIG9uIGVhY2ggY2hhbmdlXG4gICAgICBpZiAob3B0aW9ucy5hdXRvQ2xlYXIgPT09IHRydWUpIHtcbiAgICAgICAgam90dGVkLm9uKCdjaGFuZ2UnLCB0aGlzLmF1dG9DbGVhci5iaW5kKHRoaXMpLCBwcmlvcml0eSAtIDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYXB0dXJlIHRoZSBjb25zb2xlIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcblxuICAgICAgLy8gZ2V0IGxvZyBldmVudHMgZnJvbSB0aGUgaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZ2V0TWVzc2FnZS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gcGx1Z2luIHB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgICB0aGlzLiRqb3R0ZWRDb250YWluZXIgPSBqb3R0ZWQuJGNvbnRhaW5lcjtcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICRjb250YWluZXI7XG4gICAgICB0aGlzLiRpbnB1dCA9ICRpbnB1dDtcbiAgICAgIHRoaXMuJG91dHB1dCA9ICRvdXRwdXQ7XG4gICAgICB0aGlzLmhpc3RvcnkgPSBoaXN0b3J5O1xuICAgICAgdGhpcy5oaXN0b3J5SW5kZXggPSBoaXN0b3J5SW5kZXg7XG4gICAgICB0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0ID0gbG9nQ2FwdHVyZVNuaXBwZXQ7XG4gICAgICB0aGlzLmNvbnRlbnRDYWNoZSA9IGNvbnRlbnRDYWNoZTtcbiAgICAgIHRoaXMuZ2V0SWZyYW1lID0gdGhpcy5nZXRJZnJhbWUuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhQbHVnaW5Db25zb2xlLCBbe1xuICAgICAga2V5OiAnZ2V0SWZyYW1lJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJZnJhbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRqb3R0ZWRDb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLXJlc3VsdCBpZnJhbWUnKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdnZXRNZXNzYWdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKGUpIHtcbiAgICAgICAgLy8gb25seSBjYXRjaCBtZXNzYWdlcyBmcm9tIHRoZSBpZnJhbWVcbiAgICAgICAgaWYgKGUuc291cmNlICE9PSB0aGlzLmdldElmcmFtZSgpLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSQkMSA9IHt9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEkJDEgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge31cblxuICAgICAgICBpZiAoZGF0YSQkMS50eXBlID09PSAnam90dGVkLWNvbnNvbGUtbG9nJykge1xuICAgICAgICAgIHRoaXMubG9nKGRhdGEkJDEubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdhdXRvQ2xlYXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGF1dG9DbGVhcihwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzbmlwcGV0bGVzc0NvbnRlbnQgPSBwYXJhbXMuY29udGVudDtcblxuICAgICAgICAvLyByZW1vdmUgdGhlIHNuaXBwZXQgZnJvbSBjYWNoZWQganMgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdqcycpIHtcbiAgICAgICAgICBzbmlwcGV0bGVzc0NvbnRlbnQgPSBzbmlwcGV0bGVzc0NvbnRlbnQucmVwbGFjZSh0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0LCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBQbGF5IHBsdWdpbixcbiAgICAgICAgLy8gY2xlYXIgdGhlIGNvbnNvbGUgb25seSBpZiBzb21ldGhpbmcgaGFzIGNoYW5nZWQgb3IgZm9yY2UgcmVuZGVyaW5nLlxuICAgICAgICBpZiAocGFyYW1zLmZvcmNlUmVuZGVyID09PSB0cnVlIHx8IHRoaXMuY29udGVudENhY2hlW3BhcmFtcy50eXBlXSAhPT0gc25pcHBldGxlc3NDb250ZW50KSB7XG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWx3YXlzIGNhY2hlIHRoZSBsYXRlc3QgY29udGVudFxuICAgICAgICB0aGlzLmNvbnRlbnRDYWNoZVtwYXJhbXMudHlwZV0gPSBzbmlwcGV0bGVzc0NvbnRlbnQ7XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZShwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIG9ubHkgcGFyc2UganMgY29udGVudFxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdqcycpIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgY2FsbGJhY2sgZWl0aGVyIHdheSxcbiAgICAgICAgICAvLyB0byBub3QgYnJlYWsgdGhlIHB1YnNvdXBcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcGFyYW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBzbmlwcGV0IGlzIGFscmVhZHkgYWRkZWQuXG4gICAgICAgIC8vIHRoZSBQbGF5IHBsdWdpbiBjYWNoZXMgdGhlIGNoYW5nZWQgcGFyYW1zIGFuZCB0cmlnZ2VycyBjaGFuZ2VcbiAgICAgICAgLy8gd2l0aCB0aGUgY2FjaGVkIHJlc3BvbnNlLCBjYXVzaW5nIHRoZSBzbmlwcGV0IHRvIGJlIGluc2VydGVkXG4gICAgICAgIC8vIG11bHRpcGxlIHRpbWVzLCBvbiBlYWNoIHRyaWdnZXIuXG4gICAgICAgIGlmIChwYXJhbXMuY29udGVudC5pbmRleE9mKHRoaXMubG9nQ2FwdHVyZVNuaXBwZXQpID09PSAtMSkge1xuICAgICAgICAgIHBhcmFtcy5jb250ZW50ID0gJycgKyB0aGlzLmxvZ0NhcHR1cmVTbmlwcGV0ICsgcGFyYW1zLmNvbnRlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYXJhbXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYXB0dXJlIHRoZSBjb25zb2xlLmxvZyBvdXRwdXRcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NhcHR1cmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNhcHR1cmUoKSB7XG4gICAgICAgIC8vIElFOSB3aXRoIGRldnRvb2xzIGNsb3NlZFxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5jb25zb2xlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmNvbnNvbGUubG9nID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgICAgICAgbG9nOiBmdW5jdGlvbiBsb2coKSB7fVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgSUU5IHN1cHBvcnRcbiAgICAgICAgdmFyIG9sZENvbnNvbGVMb2cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKHdpbmRvdy5jb25zb2xlLmxvZywgd2luZG93LmNvbnNvbGUpO1xuXG4gICAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBzZW5kIGxvZyBtZXNzYWdlcyB0byB0aGUgcGFyZW50IHdpbmRvd1xuICAgICAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgdHlwZTogJ2pvdHRlZC1jb25zb2xlLWxvZycsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgICAgICAgIH0pLCAnKicpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gaW4gSUU5LCBjb25zb2xlLmxvZyBpcyBvYmplY3QgaW5zdGVhZCBvZiBmdW5jdGlvblxuICAgICAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvNTg1ODk2L2NvbnNvbGUtbG9nLXR5cGVvZi1pcy1vYmplY3QtaW5zdGVhZC1vZi1mdW5jdGlvblxuICAgICAgICAgIG9sZENvbnNvbGVMb2cuYXBwbHkob2xkQ29uc29sZUxvZywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdsb2cnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZygpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgJGxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGFkZENsYXNzKCRsb2csICdqb3R0ZWQtY29uc29sZS1sb2cnKTtcblxuICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgYWRkQ2xhc3MoJGxvZywgJ2pvdHRlZC1jb25zb2xlLWxvZy0nICsgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICAkbG9nLmlubmVySFRNTCA9IG1lc3NhZ2U7XG5cbiAgICAgICAgdGhpcy4kb3V0cHV0LmFwcGVuZENoaWxkKCRsb2cpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3N1Ym1pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0KGUpIHtcbiAgICAgICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLiRpbnB1dC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgLy8gaWYgaW5wdXQgaXMgYmxhbmssIGRvIG5vdGhpbmdcbiAgICAgICAgaWYgKGlucHV0VmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBydW4gdG8gaGlzdG9yeVxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaChpbnB1dFZhbHVlKTtcbiAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXggPSB0aGlzLmhpc3RvcnkubGVuZ3RoO1xuXG4gICAgICAgIC8vIGxvZyBpbnB1dCB2YWx1ZVxuICAgICAgICB0aGlzLmxvZyhpbnB1dFZhbHVlLCAnaGlzdG9yeScpO1xuXG4gICAgICAgIC8vIGFkZCByZXR1cm4gaWYgaXQgZG9lc24ndCBzdGFydCB3aXRoIGl0XG4gICAgICAgIGlmIChpbnB1dFZhbHVlLmluZGV4T2YoJ3JldHVybicpICE9PSAwKSB7XG4gICAgICAgICAgaW5wdXRWYWx1ZSA9ICdyZXR1cm4gJyArIGlucHV0VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaG93IG91dHB1dCBvciBlcnJvcnNcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBydW4gdGhlIGNvbnNvbGUgaW5wdXQgaW4gdGhlIGlmcmFtZSBjb250ZXh0XG4gICAgICAgICAgdmFyIHNjcmlwdE91dHB1dCA9IHRoaXMuZ2V0SWZyYW1lKCkuY29udGVudFdpbmRvdy5ldmFsKCcoZnVuY3Rpb24oKSB7JyArIGlucHV0VmFsdWUgKyAnfSkoKScpO1xuXG4gICAgICAgICAgdGhpcy5sb2coc2NyaXB0T3V0cHV0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5sb2coZXJyLCAnZXJyb3InKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsZWFyIHRoZSBjb25zb2xlIHZhbHVlXG4gICAgICAgIHRoaXMuJGlucHV0LnZhbHVlID0gJyc7XG5cbiAgICAgICAgLy8gc2Nyb2xsIGNvbnNvbGUgcGFuZSB0byBib3R0b21cbiAgICAgICAgLy8gdG8ga2VlcCB0aGUgaW5wdXQgaW50byB2aWV3XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5zY3JvbGxUb3AgPSB0aGlzLiRjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjbGVhcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuJG91dHB1dC5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdoaXN0b3J5JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBoaXN0b3J5KGUpIHtcbiAgICAgICAgdmFyIFVQID0gMzg7XG4gICAgICAgIHZhciBET1dOID0gNDA7XG4gICAgICAgIHZhciBnb3RIaXN0b3J5ID0gZmFsc2U7XG4gICAgICAgIHZhciBzZWxlY3Rpb25TdGFydCA9IHRoaXMuJGlucHV0LnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgICAgIC8vIG9ubHkgaWYgd2UgaGF2ZSBwcmV2aW91cyBoaXN0b3J5XG4gICAgICAgIC8vIGFuZCB0aGUgY3Vyc29yIGlzIGF0IHRoZSBzdGFydFxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBVUCAmJiB0aGlzLmhpc3RvcnlJbmRleCAhPT0gMCAmJiBzZWxlY3Rpb25TdGFydCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4LS07XG4gICAgICAgICAgZ290SGlzdG9yeSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvbmx5IGlmIHdlIGhhdmUgZnV0dXJlIGhpc3RvcnlcbiAgICAgICAgLy8gYW5kIHRoZSBjdXJzb3IgaXMgYXQgdGhlIGVuZFxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBET1dOICYmIHRoaXMuaGlzdG9yeUluZGV4ICE9PSB0aGlzLmhpc3RvcnkubGVuZ3RoIC0gMSAmJiBzZWxlY3Rpb25TdGFydCA9PT0gdGhpcy4kaW5wdXQudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXgrKztcbiAgICAgICAgICBnb3RIaXN0b3J5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgaWYgaGlzdG9yeSBjaGFuZ2VkXG4gICAgICAgIGlmIChnb3RIaXN0b3J5KSB7XG4gICAgICAgICAgdGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5SW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5Db25zb2xlO1xuICB9KCk7XG5cbiAgLyogcGxheSBwbHVnaW5cbiAgICogYWRkcyBhIFJ1biBidXR0b25cbiAgICovXG5cbiAgdmFyIFBsdWdpblBsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGx1Z2luUGxheShqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpblBsYXkpO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgZmlyc3RSdW46IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgcHJpb3JpdHkgPSAxMDtcbiAgICAgIC8vIGNhY2hlZCBjb2RlXG4gICAgICB2YXIgY2FjaGUgPSB7fTtcbiAgICAgIC8vIGxhdGVzdCB2ZXJzaW9uIG9mIHRoZSBjb2RlLlxuICAgICAgLy8gcmVwbGFjZXMgdGhlIGNhY2hlIHdoZW4gdGhlIHJ1biBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgIHZhciBjb2RlID0ge307XG5cbiAgICAgIC8vIHNldCBmaXJzdFJ1bj1mYWxzZSB0byBzdGFydCB3aXRoIGEgYmxhbmsgcHJldmlldy5cbiAgICAgIC8vIHJ1biB0aGUgcmVhbCBjb250ZW50IG9ubHkgYWZ0ZXIgdGhlIGZpcnN0IFJ1biBidXR0b24gcHJlc3MuXG4gICAgICBpZiAob3B0aW9ucy5maXJzdFJ1biA9PT0gZmFsc2UpIHtcbiAgICAgICAgY2FjaGUgPSB7XG4gICAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgdHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgdHlwZTogJ2NzcycsXG4gICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAganM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdqcycsXG4gICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gcnVuIGJ1dHRvblxuICAgICAgdmFyICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICRidXR0b24uY2xhc3NOYW1lID0gJ2pvdHRlZC1idXR0b24gam90dGVkLWJ1dHRvbi1wbGF5JztcbiAgICAgICRidXR0b24uaW5uZXJIVE1MID0gJ1J1bic7XG5cbiAgICAgIGpvdHRlZC4kY29udGFpbmVyLmFwcGVuZENoaWxkKCRidXR0b24pO1xuICAgICAgJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMucnVuLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBjYXB0dXJlIHRoZSBjb2RlIG9uIGVhY2ggY2hhbmdlXG4gICAgICBqb3R0ZWQub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIHByaW9yaXR5KTtcblxuICAgICAgLy8gcHVibGljXG4gICAgICB0aGlzLmNhY2hlID0gY2FjaGU7XG4gICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgdGhpcy5qb3R0ZWQgPSBqb3R0ZWQ7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoUGx1Z2luUGxheSwgW3tcbiAgICAgIGtleTogJ2NoYW5nZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gYWx3YXlzIGNhY2hlIHRoZSBsYXRlc3QgY29kZVxuICAgICAgICB0aGlzLmNvZGVbcGFyYW1zLnR5cGVdID0gZXh0ZW5kKHBhcmFtcyk7XG5cbiAgICAgICAgLy8gcmVwbGFjZSB0aGUgcGFyYW1zIHdpdGggdGhlIGxhdGVzdCBjYWNoZVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdKTtcblxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBjYWNoZSBmb3JjZVJlbmRlcixcbiAgICAgICAgICAvLyBhbmQgc2VuZCBpdCB3aXRoIGVhY2ggY2hhbmdlLlxuICAgICAgICAgIHRoaXMuY2FjaGVbcGFyYW1zLnR5cGVdLmZvcmNlUmVuZGVyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBjYWNoZSB0aGUgZmlyc3QgcnVuXG4gICAgICAgICAgdGhpcy5jYWNoZVtwYXJhbXMudHlwZV0gPSBleHRlbmQocGFyYW1zKTtcblxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdydW4nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJ1bigpIHtcbiAgICAgICAgLy8gdHJpZ2dlciBjaGFuZ2Ugb24gZWFjaCB0eXBlIHdpdGggdGhlIGxhdGVzdCBjb2RlXG4gICAgICAgIGZvciAodmFyIHR5cGUgaW4gdGhpcy5jb2RlKSB7XG4gICAgICAgICAgdGhpcy5jYWNoZVt0eXBlXSA9IGV4dGVuZCh0aGlzLmNvZGVbdHlwZV0sIHtcbiAgICAgICAgICAgIC8vIGZvcmNlIHJlbmRlcmluZyBvbiBlYWNoIFJ1biBwcmVzc1xuICAgICAgICAgICAgZm9yY2VSZW5kZXI6IHRydWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGNoYW5nZVxuICAgICAgICAgIHRoaXMuam90dGVkLnRyaWdnZXIoJ2NoYW5nZScsIHRoaXMuY2FjaGVbdHlwZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBQbHVnaW5QbGF5O1xuICB9KCk7XG5cbiAgLyogYnVuZGxlIHBsdWdpbnNcbiAgICovXG5cbiAgLy8gcmVnaXN0ZXIgYnVuZGxlZCBwbHVnaW5zXG4gIGZ1bmN0aW9uIEJ1bmRsZVBsdWdpbnMoam90dGVkKSB7XG4gICAgam90dGVkLnBsdWdpbigncmVuZGVyJywgUGx1Z2luUmVuZGVyKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdzY3JpcHRsZXNzJywgUGx1Z2luU2NyaXB0bGVzcyk7XG5cbiAgICBqb3R0ZWQucGx1Z2luKCdhY2UnLCBQbHVnaW5BY2UpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2NvZGVtaXJyb3InLCBQbHVnaW5Db2RlTWlycm9yKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdsZXNzJywgUGx1Z2luTGVzcyk7XG4gICAgam90dGVkLnBsdWdpbignY29mZmVlc2NyaXB0JywgUGx1Z2luQ29mZmVlU2NyaXB0KTtcbiAgICBqb3R0ZWQucGx1Z2luKCdzdHlsdXMnLCBQbHVnaW5TdHlsdXMpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2JhYmVsJywgUGx1Z2luQmFiZWwpO1xuICAgIGpvdHRlZC5wbHVnaW4oJ21hcmtkb3duJywgUGx1Z2luTWFya2Rvd24pO1xuICAgIGpvdHRlZC5wbHVnaW4oJ2NvbnNvbGUnLCBQbHVnaW5Db25zb2xlKTtcbiAgICBqb3R0ZWQucGx1Z2luKCdwbGF5JywgUGx1Z2luUGxheSk7XG4gIH1cblxuICAvKiBqb3R0ZWRcbiAgICovXG5cbiAgdmFyIEpvdHRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBKb3R0ZWQoJGpvdHRlZENvbnRhaW5lciwgb3B0cykge1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgSm90dGVkKTtcblxuICAgICAgaWYgKCEkam90dGVkQ29udGFpbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuXFwndCBmaW5kIEpvdHRlZCBjb250YWluZXIuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHByaXZhdGUgZGF0YVxuICAgICAgdmFyIF9wcml2YXRlID0ge307XG4gICAgICB0aGlzLl9nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiBfcHJpdmF0ZVtrZXldO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3NldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIF9wcml2YXRlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIF9wcml2YXRlW2tleV07XG4gICAgICB9O1xuXG4gICAgICAvLyBvcHRpb25zXG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX3NldCgnb3B0aW9ucycsIGV4dGVuZChvcHRzLCB7XG4gICAgICAgIGZpbGVzOiBbXSxcbiAgICAgICAgc2hvd0JsYW5rOiBmYWxzZSxcbiAgICAgICAgcnVuU2NyaXB0czogdHJ1ZSxcbiAgICAgICAgcGFuZTogJ3Jlc3VsdCcsXG4gICAgICAgIGRlYm91bmNlOiAyNTAsXG4gICAgICAgIHBsdWdpbnM6IFtdXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIHRoZSByZW5kZXIgcGx1Z2luIGlzIG1hbmRhdG9yeVxuICAgICAgb3B0aW9ucy5wbHVnaW5zLnB1c2goJ3JlbmRlcicpO1xuXG4gICAgICAvLyB1c2UgdGhlIHNjcmlwdGxlc3MgcGx1Z2luIGlmIHJ1blNjcmlwdHMgaXMgZmFsc2VcbiAgICAgIGlmIChvcHRpb25zLnJ1blNjcmlwdHMgPT09IGZhbHNlKSB7XG4gICAgICAgIG9wdGlvbnMucGx1Z2lucy5wdXNoKCdzY3JpcHRsZXNzJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhY2hlZCBjb250ZW50IGZvciB0aGUgY2hhbmdlIG1ldGhvZC5cbiAgICAgIHRoaXMuX3NldCgnY2FjaGVkQ29udGVudCcsIHtcbiAgICAgICAgaHRtbDogbnVsbCxcbiAgICAgICAgY3NzOiBudWxsLFxuICAgICAgICBqczogbnVsbFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFB1YlNvdXBcbiAgICAgIHZhciBwdWJzb3VwID0gdGhpcy5fc2V0KCdwdWJzb3VwJywgbmV3IFB1YlNvdXAoKSk7XG5cbiAgICAgIHRoaXMuX3NldCgndHJpZ2dlcicsIHRoaXMudHJpZ2dlcigpKTtcbiAgICAgIHRoaXMuX3NldCgnb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHB1YnNvdXAuc3Vic2NyaWJlLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnb2ZmJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwdWJzb3VwLnVuc3Vic2NyaWJlLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIHZhciBkb25lID0gdGhpcy5fc2V0KCdkb25lJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwdWJzb3VwLmRvbmUuYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBhZnRlciBhbGwgcGx1Z2lucyBydW5cbiAgICAgIC8vIHNob3cgZXJyb3JzXG4gICAgICBkb25lKCdjaGFuZ2UnLCB0aGlzLmVycm9ycy5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gRE9NXG4gICAgICB2YXIgJGNvbnRhaW5lciA9IHRoaXMuX3NldCgnJGNvbnRhaW5lcicsICRqb3R0ZWRDb250YWluZXIpO1xuICAgICAgJGNvbnRhaW5lci5pbm5lckhUTUwgPSBjb250YWluZXIoKTtcbiAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIGNvbnRhaW5lckNsYXNzKCkpO1xuXG4gICAgICAvLyBkZWZhdWx0IHBhbmVcbiAgICAgIHZhciBwYW5lQWN0aXZlID0gdGhpcy5fc2V0KCdwYW5lQWN0aXZlJywgb3B0aW9ucy5wYW5lKTtcbiAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIHBhbmVBY3RpdmVDbGFzcyhwYW5lQWN0aXZlKSk7XG5cbiAgICAgIC8vIHN0YXR1cyBub2Rlc1xuICAgICAgdGhpcy5fc2V0KCckc3RhdHVzJywge30pO1xuXG4gICAgICB2YXIgX2FyciA9IFsnaHRtbCcsICdjc3MnLCAnanMnXTtcbiAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBfYXJyLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX3R5cGUgPSBfYXJyW19pXTtcbiAgICAgICAgdGhpcy5tYXJrdXAoX3R5cGUpO1xuICAgICAgfVxuXG4gICAgICAvLyB0ZXh0YXJlYSBjaGFuZ2UgZXZlbnRzLlxuICAgICAgJGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGRlYm91bmNlKHRoaXMuY2hhbmdlLmJpbmQodGhpcyksIG9wdGlvbnMuZGVib3VuY2UpKTtcbiAgICAgICRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZGVib3VuY2UodGhpcy5jaGFuZ2UuYmluZCh0aGlzKSwgb3B0aW9ucy5kZWJvdW5jZSkpO1xuXG4gICAgICAvLyBwYW5lIGNoYW5nZVxuICAgICAgJGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMucGFuZS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gZXhwb3NlIHB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKTtcbiAgICAgIHRoaXMub24gPSB0aGlzLl9nZXQoJ29uJyk7XG4gICAgICB0aGlzLm9mZiA9IHRoaXMuX2dldCgnb2ZmJyk7XG4gICAgICB0aGlzLmRvbmUgPSB0aGlzLl9nZXQoJ2RvbmUnKTtcbiAgICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuX2dldCgndHJpZ2dlcicpO1xuICAgICAgdGhpcy5wYW5lQWN0aXZlID0gdGhpcy5fZ2V0KCdwYW5lQWN0aXZlJyk7XG5cbiAgICAgIC8vIGluaXQgcGx1Z2luc1xuICAgICAgdGhpcy5fc2V0KCdwbHVnaW5zJywge30pO1xuICAgICAgaW5pdC5jYWxsKHRoaXMpO1xuXG4gICAgICAvLyBsb2FkIGZpbGVzXG4gICAgICB2YXIgX2FycjIgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJ107XG4gICAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBfYXJyMi5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIHZhciBfdHlwZTIgPSBfYXJyMltfaTJdO1xuICAgICAgICB0aGlzLmxvYWQoX3R5cGUyKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2hvdyBhbGwgdGFicywgZXZlbiBpZiBlbXB0eVxuICAgICAgaWYgKG9wdGlvbnMuc2hvd0JsYW5rKSB7XG4gICAgICAgIHZhciBfYXJyMyA9IFsnaHRtbCcsICdjc3MnLCAnanMnXTtcblxuICAgICAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBfYXJyMy5sZW5ndGg7IF9pMysrKSB7XG4gICAgICAgICAgdmFyIHR5cGUgPSBfYXJyM1tfaTNdO1xuICAgICAgICAgIGFkZENsYXNzKCRjb250YWluZXIsIGhhc0ZpbGVDbGFzcyh0eXBlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVDbGFzcyhKb3R0ZWQsIFt7XG4gICAgICBrZXk6ICdmaW5kRmlsZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZEZpbGUodHlwZSkge1xuICAgICAgICB2YXIgZmlsZSA9IHt9O1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX2dldCgnb3B0aW9ucycpO1xuXG4gICAgICAgIGZvciAodmFyIGZpbGVJbmRleCBpbiBvcHRpb25zLmZpbGVzKSB7XG4gICAgICAgICAgdmFyIF9maWxlID0gb3B0aW9ucy5maWxlc1tmaWxlSW5kZXhdO1xuICAgICAgICAgIGlmIChfZmlsZS50eXBlID09PSB0eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gX2ZpbGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbWFya3VwJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBtYXJrdXAodHlwZSkge1xuICAgICAgICB2YXIgJGNvbnRhaW5lciA9IHRoaXMuX2dldCgnJGNvbnRhaW5lcicpO1xuICAgICAgICB2YXIgJHBhcmVudCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpvdHRlZC1wYW5lLScgKyB0eXBlKTtcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBtYXJrdXAgZm9yIGFuIGVkaXRvclxuICAgICAgICB2YXIgZmlsZSA9IHRoaXMuZmluZEZpbGUodHlwZSk7XG5cbiAgICAgICAgdmFyICRlZGl0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJGVkaXRvci5pbm5lckhUTUwgPSBlZGl0b3JDb250ZW50KHR5cGUsIGZpbGUudXJsKTtcbiAgICAgICAgJGVkaXRvci5jbGFzc05hbWUgPSBlZGl0b3JDbGFzcyh0eXBlKTtcblxuICAgICAgICAkcGFyZW50LmFwcGVuZENoaWxkKCRlZGl0b3IpO1xuXG4gICAgICAgIC8vIGdldCB0aGUgc3RhdHVzIG5vZGVcbiAgICAgICAgdGhpcy5fZ2V0KCckc3RhdHVzJylbdHlwZV0gPSAkcGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3R0ZWQtc3RhdHVzJyk7XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIGZpbGUgZm9yIHRoZSBjdXJyZW50IHR5cGVcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlLnVybCAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGZpbGUuY29udGVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBhZGQgdGhlIGhhcy10eXBlIGNsYXNzIHRvIHRoZSBjb250YWluZXJcbiAgICAgICAgICBhZGRDbGFzcygkY29udGFpbmVyLCBoYXNGaWxlQ2xhc3ModHlwZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbG9hZCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZCh0eXBlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBtYXJrdXAgZm9yIGFuIGVkaXRvclxuICAgICAgICB2YXIgZmlsZSA9IHRoaXMuZmluZEZpbGUodHlwZSk7XG4gICAgICAgIHZhciAkdGV4dGFyZWEgPSB0aGlzLl9nZXQoJyRjb250YWluZXInKS5xdWVyeVNlbGVjdG9yKCcuam90dGVkLXBhbmUtJyArIHR5cGUgKyAnIHRleHRhcmVhJyk7XG5cbiAgICAgICAgLy8gZmlsZSBhcyBzdHJpbmdcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlLmNvbnRlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSgkdGV4dGFyZWEsIGZpbGUuY29udGVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbGUudXJsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIHNob3cgbG9hZGluZyBtZXNzYWdlXG4gICAgICAgICAgdGhpcy5zdGF0dXMoJ2xvYWRpbmcnLCBbc3RhdHVzTG9hZGluZyhmaWxlLnVybCldLCB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gZmlsZSBhcyB1cmxcbiAgICAgICAgICBmZXRjaChmaWxlLnVybCwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIC8vIHNob3cgbG9hZCBlcnJvcnNcbiAgICAgICAgICAgICAgX3RoaXMuc3RhdHVzKCdlcnJvcicsIFtzdGF0dXNGZXRjaEVycm9yKGVycildLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBsb2FkaW5nIHN0YXR1c1xuICAgICAgICAgICAgX3RoaXMuY2xlYXJTdGF0dXMoJ2xvYWRpbmcnLCB7XG4gICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfdGhpcy5zZXRWYWx1ZSgkdGV4dGFyZWEsIHJlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdHJpZ2dlciBhIGNoYW5nZSBldmVudCBvbiBibGFuayBlZGl0b3JzLFxuICAgICAgICAgIC8vIGZvciBlZGl0b3IgcGx1Z2lucyB0byBjYXRjaC5cbiAgICAgICAgICAvLyAoZWcuIHRoZSBjb2RlbWlycm9yIGFuZCBhY2UgcGx1Z2lucyBhdHRhY2ggdGhlIGNoYW5nZSBldmVudFxuICAgICAgICAgIC8vIG9ubHkgYWZ0ZXIgdGhlIGluaXRpYWwgY2hhbmdlL2xvYWQgZXZlbnQpXG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSgkdGV4dGFyZWEsICcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3NldFZhbHVlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRWYWx1ZSgkdGV4dGFyZWEsIHZhbCkge1xuICAgICAgICAkdGV4dGFyZWEudmFsdWUgPSB2YWw7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBjaGFuZ2UgZXZlbnQsIGZvciBpbml0aWFsIHJlbmRlclxuICAgICAgICB0aGlzLmNoYW5nZSh7XG4gICAgICAgICAgdGFyZ2V0OiAkdGV4dGFyZWFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2UoZSkge1xuICAgICAgICB2YXIgdHlwZSA9IGRhdGEoZS50YXJnZXQsICdqb3R0ZWQtdHlwZScpO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkb24ndCB0cmlnZ2VyIGNoYW5nZSBpZiB0aGUgY29udGVudCBoYXNuJ3QgY2hhbmdlZC5cbiAgICAgICAgLy8gZWcuIHdoZW4gYmx1cnJpbmcgdGhlIHRleHRhcmVhLlxuICAgICAgICB2YXIgY2FjaGVkQ29udGVudCA9IHRoaXMuX2dldCgnY2FjaGVkQ29udGVudCcpO1xuICAgICAgICBpZiAoY2FjaGVkQ29udGVudFt0eXBlXSA9PT0gZS50YXJnZXQudmFsdWUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYWNoZSBsYXRlc3QgY29udGVudFxuICAgICAgICBjYWNoZWRDb250ZW50W3R5cGVdID0gZS50YXJnZXQudmFsdWU7XG5cbiAgICAgICAgLy8gdHJpZ2dlciB0aGUgY2hhbmdlIGV2ZW50XG4gICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJywge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgZmlsZTogZGF0YShlLnRhcmdldCwgJ2pvdHRlZC1maWxlJyksXG4gICAgICAgICAgY29udGVudDogY2FjaGVkQ29udGVudFt0eXBlXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdlcnJvcnMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVycm9ycyhlcnJzLCBwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5zdGF0dXMoJ2Vycm9yJywgZXJycywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdwYW5lJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYW5lKGUpIHtcbiAgICAgICAgaWYgKCFkYXRhKGUudGFyZ2V0LCAnam90dGVkLXR5cGUnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkY29udGFpbmVyID0gdGhpcy5fZ2V0KCckY29udGFpbmVyJyk7XG4gICAgICAgIHZhciBwYW5lQWN0aXZlID0gdGhpcy5fZ2V0KCdwYW5lQWN0aXZlJyk7XG4gICAgICAgIHJlbW92ZUNsYXNzKCRjb250YWluZXIsIHBhbmVBY3RpdmVDbGFzcyhwYW5lQWN0aXZlKSk7XG5cbiAgICAgICAgcGFuZUFjdGl2ZSA9IHRoaXMuX3NldCgncGFuZUFjdGl2ZScsIGRhdGEoZS50YXJnZXQsICdqb3R0ZWQtdHlwZScpKTtcbiAgICAgICAgYWRkQ2xhc3MoJGNvbnRhaW5lciwgcGFuZUFjdGl2ZUNsYXNzKHBhbmVBY3RpdmUpKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnc3RhdHVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdGF0dXMoKSB7XG4gICAgICAgIHZhciBzdGF0dXNUeXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnZXJyb3InO1xuICAgICAgICB2YXIgbWVzc2FnZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IFtdO1xuICAgICAgICB2YXIgcGFyYW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICAgICAgICBpZiAoIW1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFyU3RhdHVzKHN0YXR1c1R5cGUsIHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJHN0YXR1cyA9IHRoaXMuX2dldCgnJHN0YXR1cycpO1xuXG4gICAgICAgIC8vIGFkZCBlcnJvci9sb2FkaW5nIGNsYXNzIHRvIHN0YXR1c1xuICAgICAgICBhZGRDbGFzcygkc3RhdHVzW3BhcmFtcy50eXBlXSwgc3RhdHVzQ2xhc3Moc3RhdHVzVHlwZSkpO1xuXG4gICAgICAgIGFkZENsYXNzKHRoaXMuX2dldCgnJGNvbnRhaW5lcicpLCBzdGF0dXNBY3RpdmVDbGFzcyhwYXJhbXMudHlwZSkpO1xuXG4gICAgICAgIHZhciBtYXJrdXAgPSAnJztcbiAgICAgICAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgbWFya3VwICs9IHN0YXR1c01lc3NhZ2UoZXJyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXR1c1twYXJhbXMudHlwZV0uaW5uZXJIVE1MID0gbWFya3VwO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NsZWFyU3RhdHVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhclN0YXR1cyhzdGF0dXNUeXBlLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyICRzdGF0dXMgPSB0aGlzLl9nZXQoJyRzdGF0dXMnKTtcblxuICAgICAgICByZW1vdmVDbGFzcygkc3RhdHVzW3BhcmFtcy50eXBlXSwgc3RhdHVzQ2xhc3Moc3RhdHVzVHlwZSkpO1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLl9nZXQoJyRjb250YWluZXInKSwgc3RhdHVzQWN0aXZlQ2xhc3MocGFyYW1zLnR5cGUpKTtcbiAgICAgICAgJHN0YXR1c1twYXJhbXMudHlwZV0uaW5uZXJIVE1MID0gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlYm91bmNlZCB0cmlnZ2VyIG1ldGhvZFxuICAgICAgLy8gY3VzdG9tIGRlYm91bmNlciB0byB1c2UgYSBkaWZmZXJlbnQgdGltZXIgcGVyIHR5cGVcblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3RyaWdnZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fZ2V0KCdvcHRpb25zJyk7XG4gICAgICAgIHZhciBwdWJzb3VwID0gdGhpcy5fZ2V0KCdwdWJzb3VwJyk7XG5cbiAgICAgICAgLy8gYWxsb3cgZGlzYWJsaW5nIHRoZSB0cmlnZ2VyIGRlYm91bmNlci5cbiAgICAgICAgLy8gbW9zdGx5IGZvciB0ZXN0aW5nOiB3aGVuIHRyaWdnZXIgZXZlbnRzIGhhcHBlbiByYXBpZGx5XG4gICAgICAgIC8vIG11bHRpcGxlIGV2ZW50cyBvZiB0aGUgc2FtZSB0eXBlIHdvdWxkIGJlIGNhdWdodCBvbmNlLlxuICAgICAgICBpZiAob3B0aW9ucy5kZWJvdW5jZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHVic291cC5wdWJsaXNoLmFwcGx5KHB1YnNvdXAsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvb2xkb3duIHRpbWVyXG4gICAgICAgIHZhciBjb29sZG93biA9IHt9O1xuICAgICAgICAvLyBtdWx0aXBsZSBjYWxsc1xuICAgICAgICB2YXIgbXVsdGlwbGUgPSB7fTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRvcGljKSB7XG4gICAgICAgICAgdmFyIF9hcmd1bWVudHMgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgICB2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICAgICAgICB2YXIgX3JlZiR0eXBlID0gX3JlZi50eXBlO1xuICAgICAgICAgIHZhciB0eXBlID0gX3JlZiR0eXBlID09PSB1bmRlZmluZWQgPyAnZGVmYXVsdCcgOiBfcmVmJHR5cGU7XG5cbiAgICAgICAgICBpZiAoY29vbGRvd25bdHlwZV0pIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhZCBtdWx0aXBsZSBjYWxscyBiZWZvcmUgdGhlIGNvb2xkb3duXG4gICAgICAgICAgICBtdWx0aXBsZVt0eXBlXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgaW1tZWRpYXRlbHkgb25jZSBjb29sZG93biBpcyBvdmVyXG4gICAgICAgICAgICBwdWJzb3VwLnB1Ymxpc2guYXBwbHkocHVic291cCwgYXJndW1lbnRzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29vbGRvd25bdHlwZV0pO1xuXG4gICAgICAgICAgLy8gc2V0IGNvb2xkb3duIHRpbWVyXG4gICAgICAgICAgY29vbGRvd25bdHlwZV0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhZCBtdWx0aXBsZSBjYWxscyBiZWZvcmUgdGhlIGNvb2xkb3duLFxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgZnVuY3Rpb24gYWdhaW4gYXQgdGhlIGVuZC5cbiAgICAgICAgICAgIGlmIChtdWx0aXBsZVt0eXBlXSkge1xuICAgICAgICAgICAgICBwdWJzb3VwLnB1Ymxpc2guYXBwbHkocHVic291cCwgX2FyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG11bHRpcGxlW3R5cGVdID0gbnVsbDtcbiAgICAgICAgICAgIGNvb2xkb3duW3R5cGVdID0gbnVsbDtcbiAgICAgICAgICB9LCBvcHRpb25zLmRlYm91bmNlKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIEpvdHRlZDtcbiAgfSgpO1xuXG4gIC8vIHJlZ2lzdGVyIHBsdWdpbnNcblxuXG4gIEpvdHRlZC5wbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gcmVnaXN0ZXIgYnVuZGxlZCBwbHVnaW5zXG4gIEJ1bmRsZVBsdWdpbnMoSm90dGVkKTtcblxuICByZXR1cm4gSm90dGVkO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1qb3R0ZWQuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFBpZXJveHkgPHBpZXJveHlAcGllcm94eS5uZXQ+XG4vLyBUaGlzIHdvcmsgaXMgZnJlZS4gWW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdFxuLy8gdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBXVEZQTCwgVmVyc2lvbiAyXG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWUgTElDRU5TRS50eHQgb3IgaHR0cDovL3d3dy53dGZwbC5uZXQvXG4vL1xuLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24sIHRoZSBob21lIHBhZ2U6XG4vLyBodHRwOi8vcGllcm94eS5uZXQvYmxvZy9wYWdlcy9sei1zdHJpbmcvdGVzdGluZy5odG1sXG4vL1xuLy8gTFotYmFzZWQgY29tcHJlc3Npb24gYWxnb3JpdGhtLCB2ZXJzaW9uIDEuNC40XG52YXIgTFpTdHJpbmcgPSAoZnVuY3Rpb24oKSB7XG5cbi8vIHByaXZhdGUgcHJvcGVydHlcbnZhciBmID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbnZhciBrZXlTdHJCYXNlNjQgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCI7XG52YXIga2V5U3RyVXJpU2FmZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLSRcIjtcbnZhciBiYXNlUmV2ZXJzZURpYyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRCYXNlVmFsdWUoYWxwaGFiZXQsIGNoYXJhY3Rlcikge1xuICBpZiAoIWJhc2VSZXZlcnNlRGljW2FscGhhYmV0XSkge1xuICAgIGJhc2VSZXZlcnNlRGljW2FscGhhYmV0XSA9IHt9O1xuICAgIGZvciAodmFyIGk9MCA7IGk8YWxwaGFiZXQubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBiYXNlUmV2ZXJzZURpY1thbHBoYWJldF1bYWxwaGFiZXQuY2hhckF0KGkpXSA9IGk7XG4gICAgfVxuICB9XG4gIHJldHVybiBiYXNlUmV2ZXJzZURpY1thbHBoYWJldF1bY2hhcmFjdGVyXTtcbn1cblxudmFyIExaU3RyaW5nID0ge1xuICBjb21wcmVzc1RvQmFzZTY0IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHZhciByZXMgPSBMWlN0cmluZy5fY29tcHJlc3MoaW5wdXQsIDYsIGZ1bmN0aW9uKGEpe3JldHVybiBrZXlTdHJCYXNlNjQuY2hhckF0KGEpO30pO1xuICAgIHN3aXRjaCAocmVzLmxlbmd0aCAlIDQpIHsgLy8gVG8gcHJvZHVjZSB2YWxpZCBCYXNlNjRcbiAgICBkZWZhdWx0OiAvLyBXaGVuIGNvdWxkIHRoaXMgaGFwcGVuID9cbiAgICBjYXNlIDAgOiByZXR1cm4gcmVzO1xuICAgIGNhc2UgMSA6IHJldHVybiByZXMrXCI9PT1cIjtcbiAgICBjYXNlIDIgOiByZXR1cm4gcmVzK1wiPT1cIjtcbiAgICBjYXNlIDMgOiByZXR1cm4gcmVzK1wiPVwiO1xuICAgIH1cbiAgfSxcblxuICBkZWNvbXByZXNzRnJvbUJhc2U2NCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoaW5wdXQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGlucHV0Lmxlbmd0aCwgMzIsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBnZXRCYXNlVmFsdWUoa2V5U3RyQmFzZTY0LCBpbnB1dC5jaGFyQXQoaW5kZXgpKTsgfSk7XG4gIH0sXG5cbiAgY29tcHJlc3NUb1VURjE2IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBMWlN0cmluZy5fY29tcHJlc3MoaW5wdXQsIDE1LCBmdW5jdGlvbihhKXtyZXR1cm4gZihhKzMyKTt9KSArIFwiIFwiO1xuICB9LFxuXG4gIGRlY29tcHJlc3NGcm9tVVRGMTY6IGZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGNvbXByZXNzZWQubGVuZ3RoLCAxNjM4NCwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGNvbXByZXNzZWQuY2hhckNvZGVBdChpbmRleCkgLSAzMjsgfSk7XG4gIH0sXG5cbiAgLy9jb21wcmVzcyBpbnRvIHVpbnQ4YXJyYXkgKFVDUy0yIGJpZyBlbmRpYW4gZm9ybWF0KVxuICBjb21wcmVzc1RvVWludDhBcnJheTogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCkge1xuICAgIHZhciBjb21wcmVzc2VkID0gTFpTdHJpbmcuY29tcHJlc3ModW5jb21wcmVzc2VkKTtcbiAgICB2YXIgYnVmPW5ldyBVaW50OEFycmF5KGNvbXByZXNzZWQubGVuZ3RoKjIpOyAvLyAyIGJ5dGVzIHBlciBjaGFyYWN0ZXJcblxuICAgIGZvciAodmFyIGk9MCwgVG90YWxMZW49Y29tcHJlc3NlZC5sZW5ndGg7IGk8VG90YWxMZW47IGkrKykge1xuICAgICAgdmFyIGN1cnJlbnRfdmFsdWUgPSBjb21wcmVzc2VkLmNoYXJDb2RlQXQoaSk7XG4gICAgICBidWZbaSoyXSA9IGN1cnJlbnRfdmFsdWUgPj4+IDg7XG4gICAgICBidWZbaSoyKzFdID0gY3VycmVudF92YWx1ZSAlIDI1NjtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcblxuICAvL2RlY29tcHJlc3MgZnJvbSB1aW50OGFycmF5IChVQ1MtMiBiaWcgZW5kaWFuIGZvcm1hdClcbiAgZGVjb21wcmVzc0Zyb21VaW50OEFycmF5OmZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgaWYgKGNvbXByZXNzZWQ9PT1udWxsIHx8IGNvbXByZXNzZWQ9PT11bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gTFpTdHJpbmcuZGVjb21wcmVzcyhjb21wcmVzc2VkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYnVmPW5ldyBBcnJheShjb21wcmVzc2VkLmxlbmd0aC8yKTsgLy8gMiBieXRlcyBwZXIgY2hhcmFjdGVyXG4gICAgICAgIGZvciAodmFyIGk9MCwgVG90YWxMZW49YnVmLmxlbmd0aDsgaTxUb3RhbExlbjsgaSsrKSB7XG4gICAgICAgICAgYnVmW2ldPWNvbXByZXNzZWRbaSoyXSoyNTYrY29tcHJlc3NlZFtpKjIrMV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGJ1Zi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goZihjKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gTFpTdHJpbmcuZGVjb21wcmVzcyhyZXN1bHQuam9pbignJykpO1xuXG4gICAgfVxuXG4gIH0sXG5cblxuICAvL2NvbXByZXNzIGludG8gYSBzdHJpbmcgdGhhdCBpcyBhbHJlYWR5IFVSSSBlbmNvZGVkXG4gIGNvbXByZXNzVG9FbmNvZGVkVVJJQ29tcG9uZW50OiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9jb21wcmVzcyhpbnB1dCwgNiwgZnVuY3Rpb24oYSl7cmV0dXJuIGtleVN0clVyaVNhZmUuY2hhckF0KGEpO30pO1xuICB9LFxuXG4gIC8vZGVjb21wcmVzcyBmcm9tIGFuIG91dHB1dCBvZiBjb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudFxuICBkZWNvbXByZXNzRnJvbUVuY29kZWRVUklDb21wb25lbnQ6ZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGlmIChpbnB1dCA9PSBcIlwiKSByZXR1cm4gbnVsbDtcbiAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoLyAvZywgXCIrXCIpO1xuICAgIHJldHVybiBMWlN0cmluZy5fZGVjb21wcmVzcyhpbnB1dC5sZW5ndGgsIDMyLCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gZ2V0QmFzZVZhbHVlKGtleVN0clVyaVNhZmUsIGlucHV0LmNoYXJBdChpbmRleCkpOyB9KTtcbiAgfSxcblxuICBjb21wcmVzczogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCkge1xuICAgIHJldHVybiBMWlN0cmluZy5fY29tcHJlc3ModW5jb21wcmVzc2VkLCAxNiwgZnVuY3Rpb24oYSl7cmV0dXJuIGYoYSk7fSk7XG4gIH0sXG4gIF9jb21wcmVzczogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCwgYml0c1BlckNoYXIsIGdldENoYXJGcm9tSW50KSB7XG4gICAgaWYgKHVuY29tcHJlc3NlZCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICB2YXIgaSwgdmFsdWUsXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeT0ge30sXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlPSB7fSxcbiAgICAgICAgY29udGV4dF9jPVwiXCIsXG4gICAgICAgIGNvbnRleHRfd2M9XCJcIixcbiAgICAgICAgY29udGV4dF93PVwiXCIsXG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluPSAyLCAvLyBDb21wZW5zYXRlIGZvciB0aGUgZmlyc3QgZW50cnkgd2hpY2ggc2hvdWxkIG5vdCBjb3VudFxuICAgICAgICBjb250ZXh0X2RpY3RTaXplPSAzLFxuICAgICAgICBjb250ZXh0X251bUJpdHM9IDIsXG4gICAgICAgIGNvbnRleHRfZGF0YT1bXSxcbiAgICAgICAgY29udGV4dF9kYXRhX3ZhbD0wLFxuICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb249MCxcbiAgICAgICAgaWk7XG5cbiAgICBmb3IgKGlpID0gMDsgaWkgPCB1bmNvbXByZXNzZWQubGVuZ3RoOyBpaSArPSAxKSB7XG4gICAgICBjb250ZXh0X2MgPSB1bmNvbXByZXNzZWQuY2hhckF0KGlpKTtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeSxjb250ZXh0X2MpKSB7XG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVtjb250ZXh0X2NdID0gY29udGV4dF9kaWN0U2l6ZSsrO1xuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZVtjb250ZXh0X2NdID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dF93YyA9IGNvbnRleHRfdyArIGNvbnRleHRfYztcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dF9kaWN0aW9uYXJ5LGNvbnRleHRfd2MpKSB7XG4gICAgICAgIGNvbnRleHRfdyA9IGNvbnRleHRfd2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlLGNvbnRleHRfdykpIHtcbiAgICAgICAgICBpZiAoY29udGV4dF93LmNoYXJDb2RlQXQoMCk8MjU2KSB7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8OCA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSAxO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCB2YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PWJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPDE2IDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlW2NvbnRleHRfd107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF93XTtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHdjIHRvIHRoZSBkaWN0aW9uYXJ5LlxuICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF93Y10gPSBjb250ZXh0X2RpY3RTaXplKys7XG4gICAgICAgIGNvbnRleHRfdyA9IFN0cmluZyhjb250ZXh0X2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE91dHB1dCB0aGUgY29kZSBmb3Igdy5cbiAgICBpZiAoY29udGV4dF93ICE9PSBcIlwiKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlLGNvbnRleHRfdykpIHtcbiAgICAgICAgaWYgKGNvbnRleHRfdy5jaGFyQ29kZUF0KDApPDI1Nikge1xuICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPDggOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gMTtcbiAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgZm9yIChpPTAgOyBpPDE2IDsgaSsrKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgIGNvbnRleHRfZW5sYXJnZUluID0gTWF0aC5wb3coMiwgY29udGV4dF9udW1CaXRzKTtcbiAgICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGVbY29udGV4dF93XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd107XG4gICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgIH1cblxuXG4gICAgICB9XG4gICAgICBjb250ZXh0X2VubGFyZ2VJbi0tO1xuICAgICAgaWYgKGNvbnRleHRfZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICBjb250ZXh0X251bUJpdHMrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXJrIHRoZSBlbmQgb2YgdGhlIHN0cmVhbVxuICAgIHZhbHVlID0gMjtcbiAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgIH1cblxuICAgIC8vIEZsdXNoIHRoZSBsYXN0IGNoYXJcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpO1xuICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBlbHNlIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dF9kYXRhLmpvaW4oJycpO1xuICB9LFxuXG4gIGRlY29tcHJlc3M6IGZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGNvbXByZXNzZWQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGNvbXByZXNzZWQubGVuZ3RoLCAzMjc2OCwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGNvbXByZXNzZWQuY2hhckNvZGVBdChpbmRleCk7IH0pO1xuICB9LFxuXG4gIF9kZWNvbXByZXNzOiBmdW5jdGlvbiAobGVuZ3RoLCByZXNldFZhbHVlLCBnZXROZXh0VmFsdWUpIHtcbiAgICB2YXIgZGljdGlvbmFyeSA9IFtdLFxuICAgICAgICBuZXh0LFxuICAgICAgICBlbmxhcmdlSW4gPSA0LFxuICAgICAgICBkaWN0U2l6ZSA9IDQsXG4gICAgICAgIG51bUJpdHMgPSAzLFxuICAgICAgICBlbnRyeSA9IFwiXCIsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBpLFxuICAgICAgICB3LFxuICAgICAgICBiaXRzLCByZXNiLCBtYXhwb3dlciwgcG93ZXIsXG4gICAgICAgIGMsXG4gICAgICAgIGRhdGEgPSB7dmFsOmdldE5leHRWYWx1ZSgwKSwgcG9zaXRpb246cmVzZXRWYWx1ZSwgaW5kZXg6MX07XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSArPSAxKSB7XG4gICAgICBkaWN0aW9uYXJ5W2ldID0gaTtcbiAgICB9XG5cbiAgICBiaXRzID0gMDtcbiAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMik7XG4gICAgcG93ZXI9MTtcbiAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICB9XG4gICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgIHBvd2VyIDw8PSAxO1xuICAgIH1cblxuICAgIHN3aXRjaCAobmV4dCA9IGJpdHMpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsOCk7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgYyA9IGYoYml0cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiwxNik7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgYyA9IGYoYml0cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgZGljdGlvbmFyeVszXSA9IGM7XG4gICAgdyA9IGM7XG4gICAgcmVzdWx0LnB1c2goYyk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmIChkYXRhLmluZGV4ID4gbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfVxuXG4gICAgICBiaXRzID0gMDtcbiAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMixudW1CaXRzKTtcbiAgICAgIHBvd2VyPTE7XG4gICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICB9XG4gICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgIH1cblxuICAgICAgc3dpdGNoIChjID0gYml0cykge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDgpO1xuICAgICAgICAgIHBvd2VyPTE7XG4gICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPj49IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICBkYXRhLnZhbCA9IGdldE5leHRWYWx1ZShkYXRhLmluZGV4KyspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICBwb3dlciA8PD0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gZihiaXRzKTtcbiAgICAgICAgICBjID0gZGljdFNpemUtMTtcbiAgICAgICAgICBlbmxhcmdlSW4tLTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiwxNik7XG4gICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICB3aGlsZSAocG93ZXIhPW1heHBvd2VyKSB7XG4gICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBvc2l0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gZihiaXRzKTtcbiAgICAgICAgICBjID0gZGljdFNpemUtMTtcbiAgICAgICAgICBlbmxhcmdlSW4tLTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHJldHVybiByZXN1bHQuam9pbignJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICBlbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBudW1CaXRzKTtcbiAgICAgICAgbnVtQml0cysrO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGljdGlvbmFyeVtjXSkge1xuICAgICAgICBlbnRyeSA9IGRpY3Rpb25hcnlbY107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoYyA9PT0gZGljdFNpemUpIHtcbiAgICAgICAgICBlbnRyeSA9IHcgKyB3LmNoYXJBdCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2goZW50cnkpO1xuXG4gICAgICAvLyBBZGQgdytlbnRyeVswXSB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgIGRpY3Rpb25hcnlbZGljdFNpemUrK10gPSB3ICsgZW50cnkuY2hhckF0KDApO1xuICAgICAgZW5sYXJnZUluLS07XG5cbiAgICAgIHcgPSBlbnRyeTtcblxuICAgICAgaWYgKGVubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgIGVubGFyZ2VJbiA9IE1hdGgucG93KDIsIG51bUJpdHMpO1xuICAgICAgICBudW1CaXRzKys7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cbn07XG4gIHJldHVybiBMWlN0cmluZztcbn0pKCk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuIExaU3RyaW5nOyB9KTtcbn0gZWxzZSBpZiggdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlICE9IG51bGwgKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gTFpTdHJpbmdcbn1cbiIsIi8qIHNpbG96LmlvXG4gKi9cblxudmFyIGR1cnJ1dGkgPSByZXF1aXJlKCdkdXJydXRpJylcbnZhciBNYWluID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL21haW4uanMnKVxuXG5kdXJydXRpLnJlbmRlcihNYWluLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXBwJykpXG4iLCIvKiBlZGl0b3IgYmFyXG4gKi9cblxuZnVuY3Rpb24gRWRpdG9yQmFyIChhY3Rpb25zKSB7XG4gIHZhciBwbHVnaW5zID0gYWN0aW9ucy5nZXRQbHVnaW5zKClcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgaHRtbDogW3tcbiAgICAgIHRpdGxlOiAnSFRNTCdcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ01hcmtkb3duJyxcbiAgICAgIHBsdWdpbjogJ21hcmtkb3duJ1xuICAgIH1dLFxuICAgIGNzczogW3tcbiAgICAgIHRpdGxlOiAnQ1NTJ1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnTGVzcycsXG4gICAgICBwbHVnaW46ICdsZXNzJ1xuICAgIH0sIHtcbiAgICAgIHRpdGxlOiAnU3R5bHVzJyxcbiAgICAgIHBsdWdpbjogJ3N0eWx1cydcbiAgICB9XSxcbiAgICBqczogW3tcbiAgICAgIHRpdGxlOiAnSmF2YVNjcmlwdCdcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ0VTMjAxNS9CYWJlbCcsXG4gICAgICBwbHVnaW46ICdiYWJlbCdcbiAgICB9LCB7XG4gICAgICB0aXRsZTogJ0NvZmZlZVNjcmlwdCcsXG4gICAgICBwbHVnaW46ICdjb2ZmZWVzY3JpcHQnXG4gICAgfV1cbiAgfVxuXG4gIHZhciBzZWxlY3RlZCA9IHtcbiAgICBodG1sOiAnJyxcbiAgICBjc3M6ICcnLFxuICAgIGpzOiAnJ1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGx1Z2luIChsaXN0LCBuYW1lKSB7XG4gICAgdmFyIGZvdW5kUGx1Z2luID0gbnVsbFxuICAgIGxpc3Quc29tZSgocGx1Z2luKSA9PiB7XG4gICAgICBpZiAocGx1Z2luLnBsdWdpbiA9PT0gbmFtZSkge1xuICAgICAgICBmb3VuZFBsdWdpbiA9IHBsdWdpblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZm91bmRQbHVnaW5cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZVByb2Nlc3NvciAodHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyByZW1vdmUgbGFzdCBzZWxlY3RlZCBwbHVnaW5cbiAgICAgIGFjdGlvbnMucmVtb3ZlUGx1Z2luKHNlbGVjdGVkW3R5cGVdKVxuXG4gICAgICAvLyB1cGRhdGUgcmVmZXJlbmNlXG4gICAgICBzZWxlY3RlZFt0eXBlXSA9IHRoaXMudmFsdWVcblxuICAgICAgdmFyIHBsdWdpbiA9IGdldFBsdWdpbihvcHRpb25zW3R5cGVdLCBzZWxlY3RlZFt0eXBlXSlcbiAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgYWN0aW9ucy5hZGRQbHVnaW4ocGx1Z2luLnBsdWdpbilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTZWxlY3QgKHR5cGUsIG9wdGlvbnMsIHNlbGVjdGVkKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxzZWxlY3QgY2xhc3M9XCJzZWxlY3QgZWRpdG9yLWJhci1zZWxlY3QtJHt0eXBlfVwiPlxuICAgICAgICAke29wdGlvbnMubWFwKChvcHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIiR7b3B0LnBsdWdpbiB8fCAnJ31cIiAke29wdC5wbHVnaW4gPT09IHNlbGVjdGVkID8gJ3NlbGVjdGVkJyA6ICcnfT5cbiAgICAgICAgICAgICAgJHtvcHQudGl0bGV9XG4gICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICBgXG4gICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgPC9zZWxlY3Q+XG4gICAgYFxuICB9XG5cbiAgZnVuY3Rpb24gc2V0SW5pdGlhbFZhbHVlcyAoKSB7XG4gICAgLy8gc2V0IHNlbGVjdGVkIHZhbHVlcyBiYXNlZCBvbiBzdG9yZVxuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIG9wdGlvbnNbdHlwZV0uZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgICAgIGlmIChwbHVnaW5zLmluZGV4T2Yob3B0aW9uLnBsdWdpbikgIT09IC0xKSB7XG4gICAgICAgICAgc2VsZWN0ZWRbdHlwZV0gPSBvcHRpb24ucGx1Z2luXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlUGFuZSAodHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcGFuZXMgPSB7fVxuICAgICAgcGFuZXNbdHlwZV0gPSB7XG4gICAgICAgIGhpZGRlbjogdHJ1ZVxuICAgICAgfVxuXG4gICAgICBhY3Rpb25zLnVwZGF0ZVBhbmVzKHBhbmVzKVxuICAgIH1cbiAgfVxuXG4gIHRoaXMubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICAgIGZvciAobGV0IHR5cGUgb2YgWyAnaHRtbCcsICdjc3MnLCAnanMnIF0pIHtcbiAgICAgICRjb250YWluZXIucXVlcnlTZWxlY3RvcihgLmVkaXRvci1iYXItc2VsZWN0LSR7dHlwZX1gKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VQcm9jZXNzb3IodHlwZSkpXG5cbiAgICAgICRjb250YWluZXIucXVlcnlTZWxlY3RvcihgLmVkaXRvci1iYXItcGFuZS1jbG9zZS0ke3R5cGV9YCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZVBhbmUodHlwZSkpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2V0SW5pdGlhbFZhbHVlcygpXG5cbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvci1iYXItcGFuZSBlZGl0b3ItYmFyLXBhbmUtaHRtbFwiPlxuICAgICAgICAgICR7Y3JlYXRlU2VsZWN0KCdodG1sJywgb3B0aW9ucy5odG1sLCBzZWxlY3RlZC5odG1sKX1cblxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lLWNsb3NlIGVkaXRvci1iYXItcGFuZS1jbG9zZS1odG1sIGJ0blwiIHRpdGxlPVwiSGlkZSBIVE1MXCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImljb24gaWNvbi1jbG9zZVwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3ItYmFyLXBhbmUgZWRpdG9yLWJhci1wYW5lLWNzc1wiPlxuICAgICAgICAgICR7Y3JlYXRlU2VsZWN0KCdjc3MnLCBvcHRpb25zLmNzcywgc2VsZWN0ZWQuY3NzKX1cblxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lLWNsb3NlIGVkaXRvci1iYXItcGFuZS1jbG9zZS1jc3MgYnRuXCIgdGl0bGU9XCJIaWRlIENTU1wiPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uIGljb24tY2xvc2VcIj48L2k+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lIGVkaXRvci1iYXItcGFuZS1qc1wiPlxuICAgICAgICAgICR7Y3JlYXRlU2VsZWN0KCdqcycsIG9wdGlvbnMuanMsIHNlbGVjdGVkLmpzKX1cblxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lLWNsb3NlIGVkaXRvci1iYXItcGFuZS1jbG9zZS1qcyBidG5cIiB0aXRsZT1cIkhpZGUgSmF2YVNjcmlwdFwiPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uIGljb24tY2xvc2VcIj48L2k+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yLWJhci1wYW5lXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JCYXJcbiIsIi8qIGVkaXRvciB3aWRnZXRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxudmFyIEpvdHRlZCA9IHJlcXVpcmUoJ2pvdHRlZCcpXG52YXIgZ2xvYmFsQWN0aW9uc1xuXG4vLyBqb3R0ZWQgcGx1Z2luXG5Kb3R0ZWQucGx1Z2luKCdzaWxveicsIGZ1bmN0aW9uIChqb3R0ZWQsIG9wdGlvbnMpIHtcbiAgam90dGVkLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAocGFyYW1zLCBjYWxsYmFjaykge1xuICAgIGdsb2JhbEFjdGlvbnMudXBkYXRlRmlsZSh7XG4gICAgICB0eXBlOiBwYXJhbXMudHlwZSxcbiAgICAgIGNvbnRlbnQ6IHBhcmFtcy5jb250ZW50XG4gICAgfSlcblxuICAgIGNhbGxiYWNrKG51bGwsIHBhcmFtcylcbiAgfSwgMilcbn0pXG5cbnZhciBwbHVnaW5MaWJzID0ge1xuICBtYXJrZG93bjogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9tYXJrZWQvMC4zLjYvbWFya2VkLm1pbi5qcyddLFxuICBsZXNzOiBbJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2xlc3MuanMvMi43LjEvbGVzcy5taW4uanMnXSxcbiAgc3R5bHVzOiBbJy9saWJzL3N0eWx1cy5taW4uanMnXSxcbiAgY29mZmVlc2NyaXB0OiBbJ2h0dHBzOi8vY2RuLnJhd2dpdC5jb20vamFzaGtlbmFzL2NvZmZlZXNjcmlwdC8xLjExLjEvZXh0cmFzL2NvZmZlZS1zY3JpcHQuanMnXSxcbiAgZXMyMDE1OiBbJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2JhYmVsLWNvcmUvNi4xLjE5L2Jyb3dzZXIubWluLmpzJ11cbn1cblxuZnVuY3Rpb24gRWRpdG9yV2lkZ2V0IChhY3Rpb25zKSB7XG4gIGdsb2JhbEFjdGlvbnMgPSBhY3Rpb25zXG5cbiAgdGhpcy5tb3VudCA9IGZ1bmN0aW9uICgkY29udGFpbmVyKSB7XG4gICAgdmFyIHBsdWdpbnMgPSBhY3Rpb25zLmdldFBsdWdpbnMoKVxuICAgIHZhciBsaWJzID0gW11cblxuICAgIC8vIGxvYWQgbGlic1xuICAgIE9iamVjdC5rZXlzKHBsdWdpbkxpYnMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIGlmIChwbHVnaW5zLmluZGV4T2YobmFtZSkgIT09IC0xKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGxpYnMsIHBsdWdpbkxpYnNbbmFtZV0ubWFwKCh1cmwpID0+IHtcbiAgICAgICAgICByZXR1cm4gKGRvbmUpID0+IHtcbiAgICAgICAgICAgIHV0aWwubG9hZFNjcmlwdCh1cmwsIGRvbmUpXG4gICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkocGx1Z2lucywgW1xuICAgICAgJ3NpbG96JyxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvZGVtaXJyb3InLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgdGhlbWU6IGFjdGlvbnMuZ2V0VGhlbWUoKSxcbiAgICAgICAgICBsaW5lV3JhcHBpbmc6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pXG5cbiAgICB1dGlsLmFzeW5jKGxpYnMsICgpID0+IHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLW5ldyAqL1xuICAgICAgbmV3IEpvdHRlZCgkY29udGFpbmVyLCB7XG4gICAgICAgIGZpbGVzOiBhY3Rpb25zLmdldEZpbGVzKCksXG4gICAgICAgIHBsdWdpbnM6IHBsdWdpbnNcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImVkaXRvci13aWRnZXQgam90dGVkLXRoZW1lLXNpbG96XCI+PC9kaXY+J1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yV2lkZ2V0XG4iLCIvKiBlZGl0b3JcbiAqL1xuXG52YXIgZHVycnV0aSA9IHJlcXVpcmUoJ2R1cnJ1dGknKVxudmFyIEVkaXRvckJhciA9IHJlcXVpcmUoJy4vZWRpdG9yLWJhcicpXG52YXIgRWRpdG9yV2lkZ2V0ID0gcmVxdWlyZSgnLi9lZGl0b3Itd2lkZ2V0JylcblxuZnVuY3Rpb24gRWRpdG9yIChhY3Rpb25zKSB7XG4gIHZhciBwYW5lcyA9IGFjdGlvbnMuZ2V0UGFuZXMoKVxuXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yXG4gICAgICAgICR7cGFuZXMuaHRtbC5oaWRkZW4gPyAnZWRpdG9yLWlzLWhpZGRlbi1odG1sJyA6ICcnfVxuICAgICAgICAke3BhbmVzLmNzcy5oaWRkZW4gPyAnZWRpdG9yLWlzLWhpZGRlbi1jc3MnIDogJyd9XG4gICAgICAgICR7cGFuZXMuanMuaGlkZGVuID8gJ2VkaXRvci1pcy1oaWRkZW4tanMnIDogJyd9XG4gICAgICBcIj5cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgRWRpdG9yQmFyKGFjdGlvbnMpKX1cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgRWRpdG9yV2lkZ2V0KGFjdGlvbnMpKX1cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclxuIiwiLyogYWJvdXRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxudmFyIFBvcHVwID0gcmVxdWlyZSgnLi4vcG9wdXAnKVxuXG5mdW5jdGlvbiBIZWxwIChhY3Rpb25zLCBhY3Rpb25zSW50ZXJuYWwpIHtcbiAgdmFyIHNlbGYgPSB1dGlsLmluaGVyaXRzKHRoaXMsIFBvcHVwKVxuICBQb3B1cC5jYWxsKHNlbGYsICdhYm91dCcsIGFjdGlvbnNJbnRlcm5hbClcblxuICBzZWxmLm1vdW50ID0gc2VsZi5zdXBlci5tb3VudC5iaW5kKHNlbGYpXG4gIHNlbGYudW5tb3VudCA9IHNlbGYuc3VwZXIudW5tb3VudC5iaW5kKHNlbGYpXG5cbiAgc2VsZi5yZW5kZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGYuc3VwZXIucmVuZGVyLmNhbGwoc2VsZiwgJ0Fib3V0JywgYFxuICAgICAgPHA+XG4gICAgICAgIDxhIGhyZWY9XCIvXCI+c2lsb3ouaW88L2E+IGlzIGEgcHJpdmF0ZSBjb2RlIHBsYXlncm91bmQgaW4gdGhlIGJyb3dzZXIuXG4gICAgICA8L3A+XG5cbiAgICAgIDxwPlxuICAgICAgICBZb3VyIHNvdXJjZSBjb2RlIGlzIHNhdmVkIGluIHRoZSBVUkwgYW5kIG5ldmVyIHJlYWNoZXMgb3VyIHNlcnZlcnMuXG4gICAgICA8L3A+XG5cbiAgICAgIDxwPlxuICAgICAgICBVc2UgSFRNTCwgQ1NTIGFuZCBKYXZhU2NyaXB0LCBhbG9uZyB3aXRoIHByb2Nlc3NvcnMgbGlrZSBDb2ZmZWVTY3JpcHQsIEJhYmVsL0VTMjAxNSwgTGVzcywgU3R5bHVzIG9yIE1hcmtkb3duLlxuICAgICAgPC9wPlxuXG4gICAgICA8aDI+XG4gICAgICAgIFNob3J0IFVSTHNcbiAgICAgIDwvaDI+XG5cbiAgICAgIDxwPlxuICAgICAgICBzaWxvei5pbyBjYW4gZ2VuZXJhdGUgc2hvcnRlciB1cmxzLCBhdCBhIHByaXZhY3kgY29zdC5cbiAgICAgIDwvcD5cblxuICAgICAgPHA+XG4gICAgICAgIFdoZW4gYSBzaG9ydCB1cmwgaXMgZ2VuZXJhdGVkLCB0aGUgdXJsICAtIHRoYXQgaW5jbHVkZXMgdGhlIHNvdXJjZSBjb2RlIC0gaXMgc2F2ZWQgb24gdGhlIHNlcnZlciwgYWxvbmcgd2l0aCBhIHVuaXF1ZSB0b2tlbi5cbiAgICAgIDwvcD5cblxuICAgICAgPHA+XG4gICAgICAgIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZ2hpbmRhL3NpbG96LmlvXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgU291cmNlIGNvZGUgYXZhaWxhYmxlIG9uIEdpdEh1Yi5cbiAgICAgICAgPC9hPlxuICAgICAgPC9wPlxuICAgIGApXG4gIH1cblxuICByZXR1cm4gc2VsZlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlbHBcbiIsIi8qIGhlYWRlclxuICovXG5cbnZhciBkdXJydXRpID0gcmVxdWlyZSgnZHVycnV0aScpXG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJylcbnZhciBTaGFyZSA9IHJlcXVpcmUoJy4vc2hhcmUnKVxudmFyIEFib3V0ID0gcmVxdWlyZSgnLi9hYm91dCcpXG5cbnZhciBJbnRlcm5hbFN0b3JlID0gcmVxdWlyZSgnLi4vLi4vc3RhdGUvc3RvcmUtaW50ZXJuYWwnKVxudmFyIHN0b3JlSW50ZXJuYWwgPSBuZXcgSW50ZXJuYWxTdG9yZSgpXG5cbmZ1bmN0aW9uIEhlYWRlciAoYWN0aW9ucykge1xuICB2YXIgJGNvbnRhaW5lclxuICB2YXIgZGF0YSA9IHN0b3JlSW50ZXJuYWwuZ2V0KClcbiAgdmFyIGFjdGlvbnNJbnRlcm5hbCA9IHN0b3JlSW50ZXJuYWwuYWN0aW9uc1xuICB2YXIgbG9hZGluZ0NvbGxhYm9yYXRlID0gYWN0aW9uc0ludGVybmFsLmdldExvYWRpbmcoJ2NvbGxhYm9yYXRlJylcblxuICB2YXIgY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBuZXdEYXRhID0gc3RvcmVJbnRlcm5hbC5nZXQoKVxuXG4gICAgLy8gaWYgc29tZXRoaW5nIGNoYW5nZWQuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRhdGEpICE9PSBKU09OLnN0cmluZ2lmeShuZXdEYXRhKSkge1xuICAgICAgZHVycnV0aS5yZW5kZXIobmV3IEhlYWRlcihhY3Rpb25zKSwgJGNvbnRhaW5lcilcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkb25lTG9hZGluZ0NvbGxhYm9yYXRlICgpIHtcbiAgICBhY3Rpb25zSW50ZXJuYWwudXBkYXRlTG9hZGluZygnY29sbGFib3JhdGUnLCBmYWxzZSlcbiAgfVxuXG4gIHRoaXMubW91bnQgPSBmdW5jdGlvbiAoJG5vZGUpIHtcbiAgICAkY29udGFpbmVyID0gJG5vZGVcblxuICAgICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLmNvbGxhYm9yYXRlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAvLyBsb2FkaW5nXG4gICAgICBhY3Rpb25zSW50ZXJuYWwudXBkYXRlTG9hZGluZygnY29sbGFib3JhdGUnLCB0cnVlKVxuXG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUygpXG5cbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTLm9uKCdyZWFkeScsIGRvbmVMb2FkaW5nQ29sbGFib3JhdGUpXG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUy5vbignY2xvc2UnLCBkb25lTG9hZGluZ0NvbGxhYm9yYXRlKVxuICAgIH0pXG5cbiAgICBzdG9yZUludGVybmFsLm9uKCdjaGFuZ2UnLCBjaGFuZ2UpXG4gIH1cblxuICB0aGlzLnVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHdpbmRvdy5Ub2dldGhlckpTKSB7XG4gICAgICB3aW5kb3cuVG9nZXRoZXJKUy5vZmYoJ3JlYWR5JywgZG9uZUxvYWRpbmdDb2xsYWJvcmF0ZSlcbiAgICAgIHdpbmRvdy5Ub2dldGhlckpTLm9mZignY2xvc2UnLCBkb25lTG9hZGluZ0NvbGxhYm9yYXRlKVxuICAgIH1cblxuICAgIHN0b3JlSW50ZXJuYWwub2ZmKCdjaGFuZ2UnLCBjaGFuZ2UpXG4gIH1cblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICA8YSBocmVmPVwiL1wiIGNsYXNzPVwiaGVhZGVyLWxvZ29cIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIi9pbWFnZXMvbG9nby5wbmdcIiBoZWlnaHQ9XCIxNlwiIGFsdD1cInNpbG96LmlvXCI+XG4gICAgICAgIDwvYT5cblxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBBYm91dChhY3Rpb25zLCBzdG9yZUludGVybmFsLmFjdGlvbnMpKX1cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgU2V0dGluZ3MoYWN0aW9ucywgc3RvcmVJbnRlcm5hbC5hY3Rpb25zKSl9XG5cbiAgICAgICAgJHtkdXJydXRpLnJlbmRlcihuZXcgU2hhcmUoYWN0aW9ucywgc3RvcmVJbnRlcm5hbC5hY3Rpb25zKSl9XG5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gY29sbGFib3JhdGUgJHtsb2FkaW5nQ29sbGFib3JhdGUgPyAnaXMtbG9hZGluZycgOiAnJ31cIj5cbiAgICAgICAgICBDb2xsYWJvcmF0ZVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvaGVhZGVyPlxuICAgIGBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlclxuIiwiLyogc2V0dGluZ3NcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxudmFyIFBvcHVwID0gcmVxdWlyZSgnLi4vcG9wdXAnKVxuXG5mdW5jdGlvbiBTZXR0aW5ncyAoYWN0aW9ucywgYWN0aW9uc0ludGVybmFsKSB7XG4gIHZhciBzZWxmID0gdXRpbC5pbmhlcml0cyh0aGlzLCBQb3B1cClcbiAgUG9wdXAuY2FsbChzZWxmLCAnc2V0dGluZ3MnLCBhY3Rpb25zSW50ZXJuYWwpXG5cbiAgdmFyIHBhbmVzID0gYWN0aW9ucy5nZXRQYW5lcygpXG4gIHZhciB0aGVtZSA9IGFjdGlvbnMuZ2V0VGhlbWUoKVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZVBhbmUgKHR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBwYW5lcyA9IHt9XG4gICAgICBwYW5lc1t0eXBlXSA9IHsgaGlkZGVuOiAhKGUudGFyZ2V0LmNoZWNrZWQpIH1cbiAgICAgIHJldHVybiBhY3Rpb25zLnVwZGF0ZVBhbmVzKHBhbmVzKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFRoZW1lICgpIHtcbiAgICBhY3Rpb25zLnVwZGF0ZVRoZW1lKHRoaXMudmFsdWUpXG4gIH1cblxuICBzZWxmLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICBzZWxmLnN1cGVyLm1vdW50LmNhbGwoc2VsZiwgJGNvbnRhaW5lcilcblxuICAgIHZhciAkc2hvd0h0bWwgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy1zaG93LWh0bWwnKVxuICAgIHZhciAkc2hvd0NzcyA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXNob3ctY3NzJylcbiAgICB2YXIgJHNob3dKcyA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXNob3ctanMnKVxuXG4gICAgJHNob3dIdG1sLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRvZ2dsZVBhbmUoJ2h0bWwnKSlcbiAgICAkc2hvd0Nzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0b2dnbGVQYW5lKCdjc3MnKSlcbiAgICAkc2hvd0pzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRvZ2dsZVBhbmUoJ2pzJykpXG5cbiAgICAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy10aGVtZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHNldFRoZW1lKVxuICB9XG5cbiAgc2VsZi51bm1vdW50ID0gc2VsZi5zdXBlci51bm1vdW50LmJpbmQoc2VsZilcblxuICBzZWxmLnJlbmRlciA9ICgpID0+IHtcbiAgICByZXR1cm4gc2VsZi5zdXBlci5yZW5kZXIuY2FsbChzZWxmLCAnU2V0dGluZ3MnLCBgXG4gICAgICA8ZmllbGRzZXQ+XG4gICAgICAgIDxsZWdlbmQ+XG4gICAgICAgICAgVGFic1xuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2V0dGluZ3Mtc2hvdy1odG1sXCIgJHshcGFuZXMuaHRtbC5oaWRkZW4gPyAnY2hlY2tlZCcgOiAnJ30+XG4gICAgICAgICAgSFRNTFxuICAgICAgICA8L2xhYmVsPlxuXG4gICAgICAgIDxsYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJzZXR0aW5ncy1zaG93LWNzc1wiICR7IXBhbmVzLmNzcy5oaWRkZW4gPyAnY2hlY2tlZCcgOiAnJ30+XG4gICAgICAgICAgQ1NTXG4gICAgICAgIDwvbGFiZWw+XG5cbiAgICAgICAgPGxhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cInNldHRpbmdzLXNob3ctanNcIiAkeyFwYW5lcy5qcy5oaWRkZW4gPyAnY2hlY2tlZCcgOiAnJ30+XG4gICAgICAgICAgSmF2YVNjcmlwdFxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9maWVsZHNldD5cblxuICAgICAgPGZpZWxkc2V0PlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFRoZW1lXG4gICAgICAgIDwvbGVnZW5kPlxuXG4gICAgICAgIDxzZWxlY3QgY2xhc3M9XCJzZXR0aW5ncy10aGVtZSBzZWxlY3RcIj5cbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwic29sYXJpemVkIGxpZ2h0XCIgJHt0aGVtZSA9PT0gJ3NvbGFyaXplZCBsaWdodCcgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgU29sYXJpemVkIExpZ2h0XG4gICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInNvbGFyaXplZCBkYXJrXCIgJHt0aGVtZSA9PT0gJ3NvbGFyaXplZCBkYXJrJyA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICBTb2xhcml6ZWQgRGFya1xuICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICA8L3NlbGVjdD5cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgYClcbiAgfVxuXG4gIHJldHVybiBzZWxmXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ3NcbiIsIi8qIHNoYXJlXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi8uLi91dGlsJylcbnZhciBQb3B1cCA9IHJlcXVpcmUoJy4uL3BvcHVwJylcblxuZnVuY3Rpb24gU2hhcmUgKGFjdGlvbnMsIGFjdGlvbnNJbnRlcm5hbCkge1xuICB2YXIgc2VsZiA9IHV0aWwuaW5oZXJpdHModGhpcywgUG9wdXApXG4gIFBvcHVwLmNhbGwoc2VsZiwgJ3NoYXJlJywgYWN0aW9uc0ludGVybmFsKVxuXG4gIHZhciBzaG9ydFVybCA9IGFjdGlvbnMuZ2V0U2hvcnRVcmwoKVxuICB2YXIgbG9uZ1VybCA9ICcnXG4gIHZhciB3YXRjaGVyXG5cbiAgdmFyIGdlbmVyYXRpbmcgPSBhY3Rpb25zSW50ZXJuYWwuZ2V0TG9hZGluZygnZ2VuZXJhdGUtdXJsJylcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb25nVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcHkgKCRpbnB1dCkge1xuICAgIHJldHVybiAoZSkgPT4ge1xuICAgICAgdmFyICRidG4gPSB1dGlsLmNsb3Nlc3QoZS50YXJnZXQsICcuYnRuJylcblxuICAgICAgJGlucHV0LnNlbGVjdCgpXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcblxuICAgICAgICAkYnRuLmlubmVySFRNTCA9ICdDb3BpZWQnXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICRidG4uaW5uZXJIVE1MID0gJ0NvcHknXG4gICAgICAgIH0sIDIwMDApXG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGUgKCkge1xuICAgIC8vIGxvYWRpbmdcbiAgICBhY3Rpb25zSW50ZXJuYWwudXBkYXRlTG9hZGluZygnZ2VuZXJhdGUtdXJsJywgdHJ1ZSlcblxuICAgIGFjdGlvbnMudXBkYXRlU2hvcnRVcmwoKCkgPT4ge1xuICAgICAgYWN0aW9uc0ludGVybmFsLnVwZGF0ZUxvYWRpbmcoJ2dlbmVyYXRlLXVybCcsIGZhbHNlKVxuICAgIH0pXG4gIH1cblxuICBzZWxmLm1vdW50ID0gZnVuY3Rpb24gKCRjb250YWluZXIpIHtcbiAgICBzZWxmLnN1cGVyLm1vdW50LmNhbGwoc2VsZiwgJGNvbnRhaW5lcilcblxuICAgIHZhciAkc2hvcnRVcmwgPSAkY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZS11cmwtaW5wdXQtc2hvcnQnKVxuICAgIHZhciAkc2hvcnRVcmxDb3B5ID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtdXJsLWNvcHktc2hvcnQnKVxuICAgIHZhciAkbG9uZ1VybCA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnNoYXJlLXVybC1pbnB1dC1sb25nJylcbiAgICB2YXIgJGxvbmdVcmxDb3B5ID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtdXJsLWNvcHktbG9uZycpXG5cbiAgICAkc2hvcnRVcmxDb3B5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY29weSgkc2hvcnRVcmwpKVxuICAgICRsb25nVXJsQ29weS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHkoJGxvbmdVcmwpKVxuXG4gICAgdmFyICRnZW5lcmF0ZVNob3J0ID0gJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuc2hhcmUtZ2VuZXJhdGUnKVxuICAgICRnZW5lcmF0ZVNob3J0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZ2VuZXJhdGUpXG5cbiAgICBpZiAoc2hvcnRVcmwpIHtcbiAgICAgIC8vIGdpdmUgaXQgYSBzZWMsXG4gICAgICAvLyB0byBub3QgdHJpZ2dlciB1cmwgdXBkYXRlIG9uIGxvYWQsXG4gICAgICAvLyBhbmQgZm9yY2UgdXJsIGdlbmVyYXRpb24gZXZlbiBpZiBub3RoaW5nIHdhcyBjaGFuZ2VkLFxuICAgICAgLy8gb24gZm9yZWlnbiBjbGllbnRzLlxuICAgICAgd2F0Y2hlciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBhY3Rpb25zLnN0YXJ0U2hvcnRVcmxVcGRhdGVyKClcbiAgICAgIH0sIDEwMDApXG4gICAgfVxuICB9XG5cbiAgc2VsZi51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuc3VwZXIudW5tb3VudC5jYWxsKHNlbGYpXG5cbiAgICBpZiAod2F0Y2hlcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHdhdGNoZXIpXG4gICAgfVxuXG4gICAgaWYgKHNob3J0VXJsKSB7XG4gICAgICBhY3Rpb25zLnN0b3BTaG9ydFVybFVwZGF0ZXIoKVxuICAgIH1cbiAgfVxuXG4gIHNlbGYucmVuZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiBzZWxmLnN1cGVyLnJlbmRlci5jYWxsKHNlbGYsICdTaGFyZScsIGBcbiAgICAgIDxmaWVsZHNldCBjbGFzcz1cIiR7c2hvcnRVcmwgPyAnc2hhcmUtaXMtZ2VuZXJhdGVkJyA6ICcnfVwiPlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFNob3J0IFVSTFxuICAgICAgICA8L2xlZ2VuZD5cblxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBzaGFyZS1nZW5lcmF0ZSAke2dlbmVyYXRpbmcgPyAnaXMtbG9hZGluZycgOiAnJ31cIj5cbiAgICAgICAgICBHZW5lcmF0ZSBTaG9ydCBVUkxcbiAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNoYXJlLXVybCBzaGFyZS11cmwtc2hvcnRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNoYXJlLXVybC1pbnB1dCBzaGFyZS11cmwtaW5wdXQtc2hvcnRcIiB2YWx1ZT1cIiR7c2hvcnRVcmx9XCIgcmVhZG9ubHk+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gc2hhcmUtdXJsLWNvcHkgc2hhcmUtdXJsLWNvcHktc2hvcnRcIj5cbiAgICAgICAgICAgIENvcHlcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgICAgPGZpZWxkc2V0PlxuICAgICAgICA8bGVnZW5kPlxuICAgICAgICAgIFBlcnNpc3RlbnQgVVJMXG4gICAgICAgIDwvbGVnZW5kPlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzaGFyZS11cmxcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNoYXJlLXVybC1pbnB1dCBzaGFyZS11cmwtaW5wdXQtbG9uZ1wiIHZhbHVlPVwiJHtsb25nVXJsfVwiIHJlYWRvbmx5PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIHNoYXJlLXVybC1jb3B5IHNoYXJlLXVybC1jb3B5LWxvbmdcIj5cbiAgICAgICAgICAgIENvcHlcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgIGApXG4gIH1cblxuICByZXR1cm4gc2VsZlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlXG4iLCIvKiBtYWluXG4gKi9cblxudmFyIGR1cnJ1dGkgPSByZXF1aXJlKCdkdXJydXRpJylcbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci9oZWFkZXInKVxudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yL2VkaXRvcicpXG5cbnZhciBHbG9iYWxTdG9yZSA9IHJlcXVpcmUoJy4uL3N0YXRlL3N0b3JlJylcbnZhciBzdG9yZSA9IG5ldyBHbG9iYWxTdG9yZSgpXG5cbmZ1bmN0aW9uIE1haW4gKCkge1xuICB2YXIgJGNvbnRhaW5lclxuICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gIHZhciB0aGVtZSA9IHN0b3JlLmFjdGlvbnMuZ2V0VGhlbWUoKVxuXG4gIHZhciBjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBzdG9yZS5nZXQoKVxuXG4gICAgLy8gZG9uJ3QgY29tcGFyZSBmaWxlc1xuICAgIGRlbGV0ZSBkYXRhLmZpbGVzXG4gICAgZGVsZXRlIG5ld0RhdGEuZmlsZXNcblxuICAgIC8vIGlmIHNvbWV0aGluZyBjaGFuZ2VkLFxuICAgIC8vIGV4Y2VwdCB0aGUgZmlsZXMuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRhdGEpICE9PSBKU09OLnN0cmluZ2lmeShuZXdEYXRhKSkge1xuICAgICAgZHVycnV0aS5yZW5kZXIoTWFpbiwgJGNvbnRhaW5lcilcbiAgICB9XG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24gKCRub2RlKSB7XG4gICAgJGNvbnRhaW5lciA9ICRub2RlXG5cbiAgICBzdG9yZS5vbignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHN0b3JlLm9mZignY2hhbmdlJywgY2hhbmdlKVxuICB9XG5cbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtYWluIHNpbG96LXRoZW1lLSR7dGhlbWUucmVwbGFjZSgvIC9nLCAnLScpfVwiPlxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBIZWFkZXIoc3RvcmUuYWN0aW9ucykpfVxuICAgICAgICAke2R1cnJ1dGkucmVuZGVyKG5ldyBFZGl0b3Ioc3RvcmUuYWN0aW9ucykpfVxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblxuIiwiLyogcG9wdXBcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG5mdW5jdGlvbiBQb3B1cCAobmFtZSwgYWN0aW9ucykge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMuc3RhdGUgPSBhY3Rpb25zLmdldFBvcHVwKG5hbWUpXG4gIHRoaXMuYWN0aW9ucyA9IGFjdGlvbnNcbiAgdGhpcy50b2dnbGVQb3B1cCA9IHRoaXMucHJvdG90eXBlLnRvZ2dsZVBvcHVwLmJpbmQodGhpcylcbiAgdGhpcy5oaWRlUG9wdXAgPSB0aGlzLnByb3RvdHlwZS5oaWRlUG9wdXAuYmluZCh0aGlzKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUudG9nZ2xlUG9wdXAgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RhdGUgPSAhdGhpcy5zdGF0ZVxuICB0aGlzLmFjdGlvbnMudXBkYXRlUG9wdXAodGhpcy5uYW1lLCB0aGlzLnN0YXRlKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUuaGlkZVBvcHVwID0gZnVuY3Rpb24gKGUpIHtcbiAgaWYgKHV0aWwuY2xvc2VzdChlLnRhcmdldCwgJy5wb3B1cCcpIHx8IGUudGFyZ2V0ID09PSB0aGlzLiRidXR0b24gfHwgIXRoaXMuc3RhdGUpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHRoaXMuYWN0aW9ucy51cGRhdGVQb3B1cCh0aGlzLm5hbWUsIGZhbHNlKVxufVxuXG5Qb3B1cC5wcm90b3R5cGUubW91bnQgPSBmdW5jdGlvbiAoJGNvbnRhaW5lcikge1xuICB0aGlzLiRjb250YWluZXIgPSAkY29udGFpbmVyXG4gIHRoaXMuJGJ1dHRvbiA9ICRjb250YWluZXIucXVlcnlTZWxlY3RvcignLnBvcHVwLWJ1dHRvbicpXG5cbiAgdGhpcy4kYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVQb3B1cClcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhpZGVQb3B1cClcbn1cblxuUG9wdXAucHJvdG90eXBlLnVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oaWRlUG9wdXApXG59XG5cblBvcHVwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAodGl0bGUsIGNvbnRlbnQpIHtcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwicG9wdXAtY29udGFpbmVyICR7dGhpcy5uYW1lfSAke3RoaXMuc3RhdGUgPyAncG9wdXAtY29udGFpbmVyLWlzLW9wZW4nIDogJyd9XCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIiR7dGhpcy5uYW1lfS1idXR0b24gcG9wdXAtYnV0dG9uIGJ0blwiPlxuICAgICAgICAke3RpdGxlfVxuICAgICAgPC9idXR0b24+XG5cbiAgICAgIDxmb3JtIGNsYXNzPVwiJHt0aGlzLm5hbWV9LXBvcHVwIHBvcHVwXCI+XG4gICAgICAgICR7Y29udGVudH1cbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cbiAgYFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwXG4iLCIvKiBzdG9yZSBhY3Rpb25zXG4gKi9cblxuZnVuY3Rpb24gYWN0aW9ucyAoc3RvcmUpIHtcbiAgZnVuY3Rpb24gZ2V0UG9wdXAgKG5hbWUpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkucG9wdXBbbmFtZV1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVBvcHVwIChuYW1lLCBzdGF0ZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLnBvcHVwW25hbWVdID0gc3RhdGVcblxuICAgIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TG9hZGluZyAobmFtZSkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5sb2FkaW5nW25hbWVdXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMb2FkaW5nIChuYW1lLCBzdGF0ZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLmxvYWRpbmdbbmFtZV0gPSBzdGF0ZVxuXG4gICAgc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldFBvcHVwOiBnZXRQb3B1cCxcbiAgICB1cGRhdGVQb3B1cDogdXBkYXRlUG9wdXAsXG5cbiAgICBnZXRMb2FkaW5nOiBnZXRMb2FkaW5nLFxuICAgIHVwZGF0ZUxvYWRpbmc6IHVwZGF0ZUxvYWRpbmdcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnNcbiIsIi8qIHN0b3JlIGFjdGlvbnNcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIHNob3J0VXJsU2VydmljZSA9IHJlcXVpcmUoJy4vc2hvcnQtdXJsJylcblxuZnVuY3Rpb24gYWN0aW9ucyAoc3RvcmUpIHtcbiAgZnVuY3Rpb24gZ2V0RmlsZXMgKCkge1xuICAgIHJldHVybiBzdG9yZS5nZXQoKS5maWxlc1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRmlsZSAobmV3RmlsZSkge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcblxuICAgIGRhdGEuZmlsZXMuc29tZSgoZmlsZSwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChmaWxlLnR5cGUgPT09IG5ld0ZpbGUudHlwZSkge1xuICAgICAgICBkYXRhLmZpbGVzW2luZGV4XSA9IHV0aWwuZXh0ZW5kKG5ld0ZpbGUsIGRhdGEuZmlsZXNbaW5kZXhdKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQbHVnaW5zICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkucGx1Z2luc1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUGx1Z2luIChuZXdQbHVnaW4pIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG5cbiAgICBkYXRhLnBsdWdpbnMucHVzaChuZXdQbHVnaW4pXG4gICAgcmV0dXJuIHN0b3JlLnNldChkYXRhKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlUGx1Z2luIChvbGRQbHVnaW4pIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgdmFyIHBsdWdpbk5hbWUgPSAnJ1xuXG4gICAgaWYgKHR5cGVvZiBvbGRQbHVnaW4gPT09ICdvYmplY3QnKSB7XG4gICAgICBwbHVnaW5OYW1lID0gb2xkUGx1Z2luLm5hbWVcbiAgICB9IGVsc2Uge1xuICAgICAgcGx1Z2luTmFtZSA9IG9sZFBsdWdpblxuICAgIH1cblxuICAgIGRhdGEucGx1Z2lucy5zb21lKChwbHVnaW4sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoKHR5cGVvZiBwbHVnaW4gPT09ICdvYmplY3QnICYmIHBsdWdpbi5uYW1lID09PSBwbHVnaW5OYW1lKSB8fFxuICAgICAgICAgICh0eXBlb2YgcGx1Z2luID09PSAnc3RyaW5nJyAmJiBwbHVnaW4gPT09IHBsdWdpbk5hbWUpKSB7XG4gICAgICAgIGRhdGEucGx1Z2lucy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBzdG9yZS5zZXQoZGF0YSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBhbmVzICgpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KCkucGFuZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVBhbmVzIChuZXdQYW5lcykge1xuICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICBkYXRhLnBhbmVzID0gdXRpbC5leHRlbmQobmV3UGFuZXMsIGRhdGEucGFuZXMpXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRUaGVtZSAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnRoZW1lXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVUaGVtZSAodGhlbWUpIHtcbiAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgZGF0YS50aGVtZSA9IHRoZW1lXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KGRhdGEpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRTaG9ydFVybCAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmdldCgpLnNob3J0X3VybFxuICB9XG5cbiAgdmFyIGxvbmdVcmwgPSAnJ1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVNob3J0VXJsIChmb3JjZSwgY2FsbGJhY2sgPSAoKSA9PiB7fSkge1xuICAgIC8vIGZvcmNlIG5vdCBkZWZpbmVkLCBidXQgY2FsbGJhY2sgaXNcbiAgICBpZiAodHlwZW9mIGZvcmNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGZvcmNlXG4gICAgICBmb3JjZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgLy8gZXhpc3Rpbmcgc2hvcnRfdXJsJ3MsXG4gICAgLy8gY2hlY2sgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYgaXMgbm90IGFscmVhZHkgc2F2ZWRcbiAgICAvLyBhbmQgdXBkYXRlIGxpbmsuXG4gICAgdmFyIHNob3J0VXJsID0gZ2V0U2hvcnRVcmwoKVxuICAgIGlmICghc2hvcnRVcmwgfHwgZm9yY2UpIHtcbiAgICAgIGxvbmdVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuXG4gICAgICBzaG9ydFVybFNlcnZpY2UuY3JlYXRlKHtcbiAgICAgICAgbG9uZ191cmw6IGxvbmdVcmxcbiAgICAgIH0sIChlcnIsIHJlcykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0KClcbiAgICAgICAgZGF0YS5zaG9ydF91cmwgPSByZXMuc2hvcnRfdXJsXG4gICAgICAgIHN0b3JlLnNldChkYXRhKVxuXG4gICAgICAgIC8vIGFmdGVyIHNob3J0X3VybCBpcyBhZGRlZCB0byBoYXNoLFxuICAgICAgICAvLyB1cGRhdGUgbG9uZ191cmwgdG8gcG9pbnQgdG8gdXJsIHdpdGggaGFzaC5cbiAgICAgICAgbG9uZ1VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG5cbiAgICAgICAgLy8gdXBkYXRlIGV4aXN0aW5nIHNob3J0IHVybFxuICAgICAgICBzaG9ydFVybFNlcnZpY2UudXBkYXRlKHtcbiAgICAgICAgICBsb25nX3VybDogbG9uZ1VybCxcbiAgICAgICAgICBzaG9ydF91cmw6IHJlcy5zaG9ydF91cmxcbiAgICAgICAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAobG9uZ1VybCAhPT0gd2luZG93LmxvY2F0aW9uLmhyZWYpIHtcbiAgICAgIGxvbmdVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuXG4gICAgICAvLyB1cGRhdGUgZXhpc3Rpbmcgc2hvcnQgdXJsXG4gICAgICBzaG9ydFVybFNlcnZpY2UudXBkYXRlKHtcbiAgICAgICAgbG9uZ191cmw6IGxvbmdVcmwsXG4gICAgICAgIHNob3J0X3VybDogc2hvcnRVcmxcbiAgICAgIH0sIChlcnIsIHJlcykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gc3RvcCB1cmwgdXBkYXRlci5cbiAgICAgICAgICBzdG9wU2hvcnRVcmxVcGRhdGVyKClcblxuICAgICAgICAgIC8vIGRlbGV0ZSBleGlzdGluZyBzaG9ydF91cmxcbiAgICAgICAgICB2YXIgZGF0YSA9IHN0b3JlLmdldCgpXG4gICAgICAgICAgZGF0YS5zaG9ydF91cmwgPSAnJ1xuICAgICAgICAgIHN0b3JlLnNldChkYXRhKVxuXG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKClcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgdmFyIGRlYm91bmNlZFVwZGF0ZVNob3J0VXJsID0gdXRpbC5kZWJvdW5jZSh1cGRhdGVTaG9ydFVybCwgNTAwKVxuXG4gIGZ1bmN0aW9uIHN0YXJ0U2hvcnRVcmxVcGRhdGVyICgpIHtcbiAgICAvLyB1cGRhdGUgc2hvcnQgdXJsIHdoZW4gZGF0YSBjaGFuZ2VzXG4gICAgc3RvcmUub24oJ2NoYW5nZScsIGRlYm91bmNlZFVwZGF0ZVNob3J0VXJsKVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFNob3J0VXJsVXBkYXRlciAoKSB7XG4gICAgLy8gc3RvcCBtb25pdG9yaW5nIGRhdGEgY2hhbmdlc1xuICAgIHN0b3JlLm9mZignY2hhbmdlJywgZGVib3VuY2VkVXBkYXRlU2hvcnRVcmwpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldEZpbGVzOiBnZXRGaWxlcyxcbiAgICB1cGRhdGVGaWxlOiB1cGRhdGVGaWxlLFxuXG4gICAgZ2V0UGx1Z2luczogZ2V0UGx1Z2lucyxcbiAgICBhZGRQbHVnaW46IGFkZFBsdWdpbixcbiAgICByZW1vdmVQbHVnaW46IHJlbW92ZVBsdWdpbixcblxuICAgIGdldFBhbmVzOiBnZXRQYW5lcyxcbiAgICB1cGRhdGVQYW5lczogdXBkYXRlUGFuZXMsXG5cbiAgICBnZXRUaGVtZTogZ2V0VGhlbWUsXG4gICAgdXBkYXRlVGhlbWU6IHVwZGF0ZVRoZW1lLFxuXG4gICAgZ2V0U2hvcnRVcmw6IGdldFNob3J0VXJsLFxuICAgIHVwZGF0ZVNob3J0VXJsOiB1cGRhdGVTaG9ydFVybCxcbiAgICBzdGFydFNob3J0VXJsVXBkYXRlcjogc3RhcnRTaG9ydFVybFVwZGF0ZXIsXG4gICAgc3RvcFNob3J0VXJsVXBkYXRlcjogc3RvcFNob3J0VXJsVXBkYXRlclxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWN0aW9uc1xuIiwiLyogc2hvcnQgdXJsIGFwaVxuICovXG5cbi8vIGVudiBkZXRlY3Rpb25cbnZhciBlbnYgPSAnbG9jYWwnXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICE9PSAnbG9jYWxob3N0Jykge1xuICBlbnYgPSAnbGl2ZSdcbn1cblxudmFyIGFwaVVybCA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXG52YXIgc2hvcnRVcmwgPSBhcGlVcmxcblxuaWYgKGVudiAhPT0gJ2xvY2FsJykge1xuICBhcGlVcmwgPSAnaHR0cHM6Ly9zLnNpbG96LmlvJ1xuICBzaG9ydFVybCA9IGFwaVVybFxufVxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG52YXIgc2Vzc2lvbktleSA9ICdzaWxvei1pbydcblxuZnVuY3Rpb24gZ2V0U2Vzc2lvbiAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGNhY2hlID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHNlc3Npb25LZXkpXG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjYWNoZSlcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIHJldHVybiB7fVxufVxuXG52YXIgc2Vzc2lvbiA9IGdldFNlc3Npb24oKVxuXG5mdW5jdGlvbiBzYXZlU2Vzc2lvbiAobmV3U2Vzc2lvbikge1xuICBzZXNzaW9uID0gdXRpbC5leHRlbmQobmV3U2Vzc2lvbiwgc2Vzc2lvbilcblxuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc2Vzc2lvbktleSwgSlNPTi5zdHJpbmdpZnkoc2Vzc2lvbikpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZSAoZGF0YSwgY2FsbGJhY2sgPSAoKSA9PiB7fSkge1xuICB1dGlsLmZldGNoKGAke2FwaVVybH0vYXBpL2AsIHtcbiAgICB0eXBlOiAnUE9TVCcsXG4gICAgZGF0YTogZGF0YVxuICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyKVxuICAgIH1cblxuICAgIC8vIHNldCBmdWxsIHVybCBmb3Igc2hvcnR1cmxcbiAgICByZXMuc2hvcnRfdXJsID0gYCR7c2hvcnRVcmx9LyR7cmVzLnNob3J0X3VybH1gXG5cbiAgICAvLyBzYXZlIHNlc3Npb25cbiAgICBzYXZlU2Vzc2lvbih7XG4gICAgICB0b2tlbjogcmVzLnRva2VuXG4gICAgfSlcblxuICAgIGNhbGxiYWNrKG51bGwsIHJlcylcbiAgfSlcbn1cblxuZnVuY3Rpb24gdXBkYXRlIChkYXRhLCBjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gIC8vIHJlbW92ZSBhcGkgdXJsIGZyb20gc2hvcnRfdXJsXG4gIGRhdGEuc2hvcnRfdXJsID0gZGF0YS5zaG9ydF91cmwucmVwbGFjZShgJHtzaG9ydFVybH0vYCwgJycpXG5cbiAgLy8gYWRkIHRva2VuXG4gIGRhdGEudG9rZW4gPSBzZXNzaW9uLnRva2VuXG5cbiAgdXRpbC5mZXRjaChgJHthcGlVcmx9L2FwaS9gLCB7XG4gICAgdHlwZTogJ1BVVCcsXG4gICAgZGF0YTogZGF0YVxuICB9LCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyKVxuICAgIH1cblxuICAgIGNhbGxiYWNrKG51bGwsIHJlcylcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY3JlYXRlLFxuICB1cGRhdGU6IHVwZGF0ZVxufVxuIiwiLyogaW50ZXJuYWwgc3RvcmUsXG4gKiBub3Qgc3RvcmVkIGluIHVybFxuICovXG5cbnZhciBTdG9yZSA9IHJlcXVpcmUoJ2R1cnJ1dGkvc3RvcmUnKVxudmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuL2FjdGlvbnMtaW50ZXJuYWwnKVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIHBvcHVwOiB7fSxcbiAgbG9hZGluZzoge31cbn1cblxudmFyIEludGVybmFsU3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gIFN0b3JlLmNhbGwodGhpcylcbiAgdGhpcy5hY3Rpb25zID0gYWN0aW9ucyh0aGlzKVxuXG4gIHRoaXMuc2V0KGRlZmF1bHRzKVxufVxuXG5JbnRlcm5hbFN0b3JlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUucHJvdG90eXBlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVybmFsU3RvcmVcblxuIiwiLyogc3RvcmVcbiAqL1xuXG52YXIgU3RvcmUgPSByZXF1aXJlKCdkdXJydXRpL3N0b3JlJylcbnZhciBMWlN0cmluZyA9IHJlcXVpcmUoJ2x6LXN0cmluZycpXG52YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIHZlcnNpb246IDEsXG4gIGZpbGVzOiBbe1xuICAgIHR5cGU6ICdodG1sJyxcbiAgICBjb250ZW50OiAnJ1xuICB9LCB7XG4gICAgdHlwZTogJ2NzcycsXG4gICAgY29udGVudDogJydcbiAgfSwge1xuICAgIHR5cGU6ICdqcycsXG4gICAgY29udGVudDogJydcbiAgfV0sXG4gIHBsdWdpbnM6IFtdLFxuICB0aGVtZTogJ3NvbGFyaXplZCBsaWdodCcsXG5cbiAgLy8gcGFuZSBwcm9wZXJ0aWVzIChoaWRkZW4sIGV0YylcbiAgcGFuZXM6IHtcbiAgICBodG1sOiB7fSxcbiAgICBjc3M6IHt9LFxuICAgIGpzOiB7fVxuICB9LFxuXG4gIHNob3J0X3VybDogJydcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUxvY2F0aW9uSGFzaCAoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiAoKSA9PiB7fVxuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIChoYXNoKSA9PiB7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgYCMke2hhc2h9YClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChoYXNoKSA9PiB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShgJHt3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdfSMke2hhc2h9YClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VIYXNoICgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoTFpTdHJpbmcuZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50KHV0aWwuaGFzaCgncycpKSlcbiAgfSBjYXRjaCAoZXJyKSB7fVxuXG4gIHJldHVybiBudWxsXG59XG5cbnZhciBHbG9iYWxTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgU3RvcmUuY2FsbCh0aGlzKVxuICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zKHRoaXMpXG5cbiAgdmFyIHJlcGxhY2VIYXNoID0gcmVwbGFjZUxvY2F0aW9uSGFzaCgpXG4gIHZhciBjb21wcmVzc2VkRGF0YSA9ICcnXG5cbiAgdmFyIGhhc2hEYXRhID0gcGFyc2VIYXNoKClcbiAgaWYgKGhhc2hEYXRhKSB7XG4gICAgdGhpcy5zZXQodXRpbC5leHRlbmQoaGFzaERhdGEsIGRlZmF1bHRzKSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnNldChkZWZhdWx0cylcbiAgfVxuXG4gIHRoaXMub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICAvLyBzYXZlIGluIGhhc2hcbiAgICB2YXIgZGF0YSA9IHRoaXMuZ2V0KClcblxuICAgIGNvbXByZXNzZWREYXRhID0gTFpTdHJpbmcuY29tcHJlc3NUb0VuY29kZWRVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgcmVwbGFjZUhhc2godXRpbC5oYXNoKCdzJywgY29tcHJlc3NlZERhdGEpKVxuICB9KVxuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4ge1xuICAgICAgLy8gZm9yY2UgcGFnZSByZWxvYWQgaWYgb25seSBoYXNoIGNoYW5nZWQsXG4gICAgICAvLyBhbmQgY29tcHJlc3NlZCBkYXRhIGlzIGRpZmZlcmVudC5cbiAgICAgIC8vIGVnLiBtYW51YWxseSBjaGFuZ2luZyB1cmwgaGFzaC5cbiAgICAgIGlmICh1dGlsLmhhc2goJ3MnKSAhPT0gY29tcHJlc3NlZERhdGEpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5HbG9iYWxTdG9yZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFN0b3JlLnByb3RvdHlwZSlcblxubW9kdWxlLmV4cG9ydHMgPSBHbG9iYWxTdG9yZVxuXG4iLCIvKiB1dGlsXG4gKi9cblxuZnVuY3Rpb24gY2xvc2VzdCAoJGVsZW0sIHNlbGVjdG9yKSB7XG4gIC8vIGZpbmQgdGhlIGNsb3Nlc3QgcGFyZW50IHRoYXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3JcbiAgdmFyICRtYXRjaGVzXG5cbiAgLy8gbG9vcCB0aHJvdWdoIHBhcmVudHNcbiAgd2hpbGUgKCRlbGVtICYmICRlbGVtICE9PSBkb2N1bWVudCkge1xuICAgIGlmICgkZWxlbS5wYXJlbnROb2RlKSB7XG4gICAgICAvLyBmaW5kIGFsbCBzaWJsaW5ncyB0aGF0IG1hdGNoIHRoZSBzZWxlY3RvclxuICAgICAgJG1hdGNoZXMgPSAkZWxlbS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAvLyBjaGVjayBpZiBvdXIgZWxlbWVudCBpcyBtYXRjaGVkIChwb29yLW1hbidzIEVsZW1lbnQubWF0Y2hlcygpKVxuICAgICAgaWYgKFtdLmluZGV4T2YuY2FsbCgkbWF0Y2hlcywgJGVsZW0pICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gJGVsZW1cbiAgICAgIH1cblxuICAgICAgLy8gZ28gdXAgdGhlIHRyZWVcbiAgICAgICRlbGVtID0gJGVsZW0ucGFyZW50Tm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGNsb25lIChvYmopIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSlcbn1cblxuZnVuY3Rpb24gZXh0ZW5kTGV2ZWwgKG9iaiwgZGVmYXVsdHMgPSB7fSkge1xuICAvLyBjb3B5IGRlZmF1bHQga2V5cyB3aGVyZSB1bmRlZmluZWRcbiAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBkZWZhdWx0XG4gICAgICBvYmpba2V5XSA9IGNsb25lKGRlZmF1bHRzW2tleV0pXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICBleHRlbmRMZXZlbChvYmpba2V5XSwgZGVmYXVsdHNba2V5XSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG9ialxufVxuXG4vLyBtdWx0aS1sZXZlbCBvYmplY3QgbWVyZ2VcbmZ1bmN0aW9uIGV4dGVuZCAob2JqLCBkZWZhdWx0cykge1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0ge31cbiAgfVxuXG4gIHJldHVybiBleHRlbmRMZXZlbChjbG9uZShvYmopLCBkZWZhdWx0cylcbn1cblxuZnVuY3Rpb24gZGVib3VuY2UgKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICB2YXIgdGltZW91dFxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ZXh0ID0gdGhpc1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzXG4gICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXRcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZFNjcmlwdCAodXJsLCBkb25lID0gKCkgPT4ge30pIHtcbiAgdmFyICRzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAkc2NyaXB0LnNyYyA9IHVybFxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCRzY3JpcHQpXG5cbiAgJHNjcmlwdC5vbmxvYWQgPSBkb25lXG59XG5cbmZ1bmN0aW9uIGFzeW5jIChhcnIsIGRvbmUsIGkgPSAwKSB7XG4gIGlmIChhcnIubGVuZ3RoID09PSBpKSB7XG4gICAgcmV0dXJuIGRvbmUoKVxuICB9XG5cbiAgYXJyW2ldKCgpID0+IHtcbiAgICBpKytcbiAgICBhc3luYyhhcnIsIGRvbmUsIGkpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGZldGNoIChwYXRoLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAvLyBvcHRpb25zIG5vdCBzcGVjaWZpZWRcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICB0eXBlOiAnR0VUJyxcbiAgICBkYXRhOiB7fVxuICB9KVxuXG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge31cblxuICB2YXIgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICByZXF1ZXN0Lm9wZW4ob3B0aW9ucy50eXBlLCBwYXRoKVxuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnKVxuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ1gtUmVxdWVzdGVkLVdpdGgnLCAnWE1MSHR0cFJlcXVlc3QnKVxuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCB8fCAne30nKVxuXG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlcnJvclxuICAgICAgY2FsbGJhY2socmVxdWVzdClcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXJyb3JcbiAgICBjYWxsYmFjayhyZXF1ZXN0KVxuICB9XG5cbiAgcmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuZGF0YSkpXG59XG5cbmZ1bmN0aW9uIGluaGVyaXRzIChiYXNlQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgYmFzZUNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpXG4gIGJhc2VDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBiYXNlQ2xhc3NcblxuICBiYXNlQ2xhc3Muc3VwZXIgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYmFzZUNsYXNzLnByb3RvdHlwZSlcblxuICByZXR1cm4gYmFzZUNsYXNzXG59XG5cbmZ1bmN0aW9uIGhhc2ggKGtleSwgdmFsdWUpIHtcbiAgdmFyIGhhc2hQYXJ0cyA9IFtdXG4gIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgIGhhc2hQYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKS5zcGxpdCgnJicpXG4gIH1cblxuICB2YXIgcGFyc2VkSGFzaCA9IHt9XG4gIHZhciBzdHJpbmdIYXNoID0gJydcblxuICBoYXNoUGFydHMuZm9yRWFjaCgocGFydCwgaSkgPT4ge1xuICAgIHZhciBzdWJQYXJ0cyA9IHBhcnQuc3BsaXQoJz0nKVxuICAgIHBhcnNlZEhhc2hbc3ViUGFydHNbMF1dID0gc3ViUGFydHNbMV0gfHwgJydcbiAgfSlcblxuICBpZiAoa2V5KSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBwYXJzZWRIYXNoW2tleV0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGFyc2VkSGFzaFtrZXldXG4gICAgfVxuICB9XG5cbiAgLy8gcmVidWlsZCB0byBzdHJpbmdcbiAgT2JqZWN0LmtleXMocGFyc2VkSGFzaCkuZm9yRWFjaCgoa2V5LCBpKSA9PiB7XG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICBzdHJpbmdIYXNoICs9ICcmJ1xuICAgIH1cblxuICAgIHN0cmluZ0hhc2ggKz0ga2V5XG5cbiAgICBpZiAocGFyc2VkSGFzaFtrZXldKSB7XG4gICAgICBzdHJpbmdIYXNoICs9IGA9JHtwYXJzZWRIYXNoW2tleV19YFxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gc3RyaW5nSGFzaFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2xvbmU6IGNsb25lLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgY2xvc2VzdDogY2xvc2VzdCxcbiAgZGVib3VuY2U6IGRlYm91bmNlLFxuICBsb2FkU2NyaXB0OiBsb2FkU2NyaXB0LFxuICBhc3luYzogYXN5bmMsXG4gIGZldGNoOiBmZXRjaCxcbiAgaGFzaDogaGFzaCxcblxuICBpbmhlcml0czogaW5oZXJpdHNcbn1cbiJdfQ==
