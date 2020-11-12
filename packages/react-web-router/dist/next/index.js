import React, { useEffect, useState } from 'react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { createHashHistory, createMemoryHistory, createBrowserHistory } from 'history';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];

  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }

  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _decorate(decorators, factory, superClass, mixins) {
  var api = _getDecoratorsApi();

  if (mixins) {
    for (var i = 0; i < mixins.length; i++) {
      api = mixins[i](api);
    }
  }

  var r = factory(function initialize(O) {
    api.initializeInstanceElements(O, decorated.elements);
  }, superClass);
  var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
  api.initializeClassElements(r.F, decorated.elements);
  return api.runClassFinishers(r.F, decorated.finishers);
}

function _getDecoratorsApi() {
  _getDecoratorsApi = function _getDecoratorsApi() {
    return api;
  };

  var api = {
    elementsDefinitionOrder: [["method"], ["field"]],
    initializeInstanceElements: function initializeInstanceElements(O, elements) {
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          if (element.kind === kind && element.placement === "own") {
            this.defineClassElement(O, element);
          }
        }, this);
      }, this);
    },
    initializeClassElements: function initializeClassElements(F, elements) {
      var proto = F.prototype;
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          var placement = element.placement;

          if (element.kind === kind && (placement === "static" || placement === "prototype")) {
            var receiver = placement === "static" ? F : proto;
            this.defineClassElement(receiver, element);
          }
        }, this);
      }, this);
    },
    defineClassElement: function defineClassElement(receiver, element) {
      var descriptor = element.descriptor;

      if (element.kind === "field") {
        var initializer = element.initializer;
        descriptor = {
          enumerable: descriptor.enumerable,
          writable: descriptor.writable,
          configurable: descriptor.configurable,
          value: initializer === void 0 ? void 0 : initializer.call(receiver)
        };
      }

      Object.defineProperty(receiver, element.key, descriptor);
    },
    decorateClass: function decorateClass(elements, decorators) {
      var newElements = [];
      var finishers = [];
      var placements = {
        "static": [],
        prototype: [],
        own: []
      };
      elements.forEach(function (element) {
        this.addElementPlacement(element, placements);
      }, this);
      elements.forEach(function (element) {
        if (!_hasDecorators(element)) return newElements.push(element);
        var elementFinishersExtras = this.decorateElement(element, placements);
        newElements.push(elementFinishersExtras.element);
        newElements.push.apply(newElements, elementFinishersExtras.extras);
        finishers.push.apply(finishers, elementFinishersExtras.finishers);
      }, this);

      if (!decorators) {
        return {
          elements: newElements,
          finishers: finishers
        };
      }

      var result = this.decorateConstructor(newElements, decorators);
      finishers.push.apply(finishers, result.finishers);
      result.finishers = finishers;
      return result;
    },
    addElementPlacement: function addElementPlacement(element, placements, silent) {
      var keys = placements[element.placement];

      if (!silent && keys.indexOf(element.key) !== -1) {
        throw new TypeError("Duplicated element (" + element.key + ")");
      }

      keys.push(element.key);
    },
    decorateElement: function decorateElement(element, placements) {
      var extras = [];
      var finishers = [];

      for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
        var keys = placements[element.placement];
        keys.splice(keys.indexOf(element.key), 1);
        var elementObject = this.fromElementDescriptor(element);
        var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
        element = elementFinisherExtras.element;
        this.addElementPlacement(element, placements);

        if (elementFinisherExtras.finisher) {
          finishers.push(elementFinisherExtras.finisher);
        }

        var newExtras = elementFinisherExtras.extras;

        if (newExtras) {
          for (var j = 0; j < newExtras.length; j++) {
            this.addElementPlacement(newExtras[j], placements);
          }

          extras.push.apply(extras, newExtras);
        }
      }

      return {
        element: element,
        finishers: finishers,
        extras: extras
      };
    },
    decorateConstructor: function decorateConstructor(elements, decorators) {
      var finishers = [];

      for (var i = decorators.length - 1; i >= 0; i--) {
        var obj = this.fromClassDescriptor(elements);
        var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);

        if (elementsAndFinisher.finisher !== undefined) {
          finishers.push(elementsAndFinisher.finisher);
        }

        if (elementsAndFinisher.elements !== undefined) {
          elements = elementsAndFinisher.elements;

          for (var j = 0; j < elements.length - 1; j++) {
            for (var k = j + 1; k < elements.length; k++) {
              if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                throw new TypeError("Duplicated element (" + elements[j].key + ")");
              }
            }
          }
        }
      }

      return {
        elements: elements,
        finishers: finishers
      };
    },
    fromElementDescriptor: function fromElementDescriptor(element) {
      var obj = {
        kind: element.kind,
        key: element.key,
        placement: element.placement,
        descriptor: element.descriptor
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      if (element.kind === "field") obj.initializer = element.initializer;
      return obj;
    },
    toElementDescriptors: function toElementDescriptors(elementObjects) {
      if (elementObjects === undefined) return;
      return _toArray(elementObjects).map(function (elementObject) {
        var element = this.toElementDescriptor(elementObject);
        this.disallowProperty(elementObject, "finisher", "An element descriptor");
        this.disallowProperty(elementObject, "extras", "An element descriptor");
        return element;
      }, this);
    },
    toElementDescriptor: function toElementDescriptor(elementObject) {
      var kind = String(elementObject.kind);

      if (kind !== "method" && kind !== "field") {
        throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
      }

      var key = _toPropertyKey(elementObject.key);
      var placement = String(elementObject.placement);

      if (placement !== "static" && placement !== "prototype" && placement !== "own") {
        throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
      }

      var descriptor = elementObject.descriptor;
      this.disallowProperty(elementObject, "elements", "An element descriptor");
      var element = {
        kind: kind,
        key: key,
        placement: placement,
        descriptor: Object.assign({}, descriptor)
      };

      if (kind !== "field") {
        this.disallowProperty(elementObject, "initializer", "A method descriptor");
      } else {
        this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
        element.initializer = elementObject.initializer;
      }

      return element;
    },
    toElementFinisherExtras: function toElementFinisherExtras(elementObject) {
      var element = this.toElementDescriptor(elementObject);

      var finisher = _optionalCallableProperty(elementObject, "finisher");

      var extras = this.toElementDescriptors(elementObject.extras);
      return {
        element: element,
        finisher: finisher,
        extras: extras
      };
    },
    fromClassDescriptor: function fromClassDescriptor(elements) {
      var obj = {
        kind: "class",
        elements: elements.map(this.fromElementDescriptor, this)
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      return obj;
    },
    toClassDescriptor: function toClassDescriptor(obj) {
      var kind = String(obj.kind);

      if (kind !== "class") {
        throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
      }

      this.disallowProperty(obj, "key", "A class descriptor");
      this.disallowProperty(obj, "placement", "A class descriptor");
      this.disallowProperty(obj, "descriptor", "A class descriptor");
      this.disallowProperty(obj, "initializer", "A class descriptor");
      this.disallowProperty(obj, "extras", "A class descriptor");

      var finisher = _optionalCallableProperty(obj, "finisher");

      var elements = this.toElementDescriptors(obj.elements);
      return {
        elements: elements,
        finisher: finisher
      };
    },
    runClassFinishers: function runClassFinishers(constructor, finishers) {
      for (var i = 0; i < finishers.length; i++) {
        var newConstructor = (0, finishers[i])(constructor);

        if (newConstructor !== undefined) {
          if (typeof newConstructor !== "function") {
            throw new TypeError("Finishers must return a constructor.");
          }

          constructor = newConstructor;
        }
      }

      return constructor;
    },
    disallowProperty: function disallowProperty(obj, name, objectType) {
      if (obj[name] !== undefined) {
        throw new TypeError(objectType + " can't have a ." + name + " property.");
      }
    }
  };
  return api;
}

function _createElementDescriptor(def) {
  var key = _toPropertyKey(def.key);
  var descriptor;

  if (def.kind === "method") {
    descriptor = {
      value: def.value,
      writable: true,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "get") {
    descriptor = {
      get: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "set") {
    descriptor = {
      set: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "field") {
    descriptor = {
      configurable: true,
      writable: true,
      enumerable: true
    };
  }

  var element = {
    kind: def.kind === "field" ? "field" : "method",
    key: key,
    placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype",
    descriptor: descriptor
  };
  if (def.decorators) element.decorators = def.decorators;
  if (def.kind === "field") element.initializer = def.value;
  return element;
}

function _coalesceGetterSetter(element, other) {
  if (element.descriptor.get !== undefined) {
    other.descriptor.get = element.descriptor.get;
  } else {
    other.descriptor.set = element.descriptor.set;
  }
}

function _coalesceClassElements(elements) {
  var newElements = [];

  var isSameElement = function isSameElement(other) {
    return other.kind === "method" && other.key === element.key && other.placement === element.placement;
  };

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var other;

    if (element.kind === "method" && (other = newElements.find(isSameElement))) {
      if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
        if (_hasDecorators(element) || _hasDecorators(other)) {
          throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
        }

        other.descriptor = element.descriptor;
      } else {
        if (_hasDecorators(element)) {
          if (_hasDecorators(other)) {
            throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
          }

          other.decorators = element.decorators;
        }

        _coalesceGetterSetter(element, other);
      }
    } else {
      newElements.push(element);
    }
  }

  return newElements;
}

function _hasDecorators(element) {
  return element.decorators && element.decorators.length;
}

function _isDataDescriptor(desc) {
  return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
}

function _optionalCallableProperty(obj, name) {
  var value = obj[name];

  if (value !== undefined && typeof value !== "function") {
    throw new TypeError("Expected '" + name + "' to be a function");
  }

  return value;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
const isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
const isDevelopmentEnv = process.env.NODE_ENV !== 'production';
const client = isServerEnv ? undefined : env;

const TaskCountEvent = 'TaskCountEvent';
let LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));

class PEvent {
  constructor(name, data, bubbling = false) {
    this.name = name;
    this.data = data;
    this.bubbling = bubbling;

    _defineProperty(this, "target", null);

    _defineProperty(this, "currentTarget", null);
  }

  setTarget(target) {
    this.target = target;
  }

  setCurrentTarget(target) {
    this.currentTarget = target;
  }

}
class PDispatcher {
  constructor(parent) {
    this.parent = parent;

    _defineProperty(this, "storeHandlers", {});
  }

  addListener(ename, handler) {
    let dictionary = this.storeHandlers[ename];

    if (!dictionary) {
      this.storeHandlers[ename] = dictionary = [];
    }

    dictionary.push(handler);
    return this;
  }

  removeListener(ename, handler) {
    if (!ename) {
      Object.keys(this.storeHandlers).forEach(key => {
        delete this.storeHandlers[key];
      });
    } else {
      const handlers = this.storeHandlers;

      if (handlers.propertyIsEnumerable(ename)) {
        const dictionary = handlers[ename];

        if (!handler) {
          delete handlers[ename];
        } else {
          const n = dictionary.indexOf(handler);

          if (n > -1) {
            dictionary.splice(n, 1);
          }

          if (dictionary.length === 0) {
            delete handlers[ename];
          }
        }
      }
    }

    return this;
  }

  dispatch(evt) {
    if (!evt.target) {
      evt.setTarget(this);
    }

    evt.setCurrentTarget(this);
    const dictionary = this.storeHandlers[evt.name];

    if (dictionary) {
      for (let i = 0, k = dictionary.length; i < k; i++) {
        dictionary[i](evt);
      }
    }

    if (this.parent && evt.bubbling) {
      this.parent.dispatch(evt);
    }

    return this;
  }

  setParent(parent) {
    this.parent = parent;
    return this;
  }

}
class TaskCounter extends PDispatcher {
  constructor(deferSecond) {
    super();
    this.deferSecond = deferSecond;

    _defineProperty(this, "list", []);

    _defineProperty(this, "ctimer", null);
  }

  addItem(promise, note = '') {
    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({
        promise,
        note
      });
      promise.then(() => this.completeItem(promise), () => this.completeItem(promise));

      if (this.list.length === 1) {
        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
        this.ctimer = env.setTimeout(() => {
          this.ctimer = null;

          if (this.list.length > 0) {
            this.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  }

  completeItem(promise) {
    const i = this.list.findIndex(item => item.promise === promise);

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = null;
        }

        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
      }
    }

    return this;
  }

}

const config = {
  NSP: '.',
  VSP: '.',
  MSP: ','
};
function setConfig(_config) {
  _config.NSP && (config.NSP = _config.NSP);
  _config.VSP && (config.VSP = _config.VSP);
  _config.MSP && (config.MSP = _config.MSP);
}
const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  Error: `medux${config.NSP}Error`
};
const MetaData = {
  appViewName: null,
  actionCreatorMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null
};
const loadings = {};
let depthTime = 2;
function setLoadingDepthTime(second) {
  depthTime = second;
}
function setLoading(item, moduleName = MetaData.appModuleName, groupName = 'global') {
  if (isServerEnv) {
    return item;
  }

  const key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = MetaData.clientStore;

      if (store) {
        const actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];
        const action = actions({
          [groupName]: e.data
        });
        store.dispatch(action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  const fun = descriptor.value;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName || '';
  }

  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      const before = (curAction, moduleName, promiseResult) => {
        if (!isServerEnv) {
          if (loadingForModuleName === '') {
            loadingForModuleName = MetaData.appModuleName;
          } else if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }

          setLoading(promiseResult, loadingForModuleName, loadingForGroupName);
        }
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
function logger(before, after) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
function delayPromise(second) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

    descriptor.value = (...args) => {
      const delay = new Promise(resolve => {
        env.setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });
      return Promise.all([delay, fun.apply(target, args)]).then(items => {
        return items[1];
      });
    };
  };
}
function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
function moduleInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState]
  };
}

function symbolObservablePonyfill(root) {
  var result;
  var Symbol = root.Symbol;

  if (typeof Symbol === 'function') {
    if (Symbol.observable) {
      result = Symbol.observable;
    } else {
      result = Symbol('observable');
      Symbol.observable = result;
    }
  } else {
    result = '@@observable';
  }

  return result;
}

/* global window */
var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = symbolObservablePonyfill(root);

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */

var randomString = function randomString() {
  return Math.random().toString(36).substring(7).split('').join('.');
};

var ActionTypes$1 = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
};
/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */

function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = obj;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}
/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */


function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
    throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function.');
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  /**
   * This makes a shallow copy of currentListeners so we can use
   * nextListeners as a temporary list while dispatching.
   *
   * This prevents any bugs around consumers calling
   * subscribe/unsubscribe in the middle of a dispatch.
   */

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */


  function getState() {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
    }

    return currentState;
  }
  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */


  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
    }

    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */


  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }
  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */


  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.

    dispatch({
      type: ActionTypes$1.REPLACE
    });
  }
  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */


  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    }, _ref[result] = function () {
      return this;
    }, _ref;
  } // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.


  dispatch({
    type: ActionTypes$1.INIT
  });
  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[result] = observable, _ref2;
}
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */


function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */


  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
  } catch (e) {} // eslint-disable-line no-empty

}

function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    keys.push.apply(keys, Object.getOwnPropertySymbols(object));
  }

  if (enumerableOnly) keys = keys.filter(function (sym) {
    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
  });
  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty$1(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */


function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}
/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */


function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function () {
      var store = createStore.apply(void 0, arguments);

      var _dispatch = function dispatch() {
        throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
      };

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch() {
          return _dispatch.apply(void 0, arguments);
        }
      };
      var chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = compose.apply(void 0, chain)(store.dispatch);
      return _objectSpread2({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */


function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
}

function cacheModule(module) {
  const moduleName = module.default.moduleName;
  const moduleGetter = MetaData.moduleGetter;
  let fn = moduleGetter[moduleName];

  if (fn.__module__ === module) {
    return fn;
  }

  fn = () => module;

  fn.__module__ = module;
  moduleGetter[moduleName] = fn;
  return fn;
}

function bindThis(fun, thisObj) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(key => {
    newFun[key] = fun[key];
  });
  return newFun;
}

function transformAction(actionName, action, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(moduleName, actionName) {
  const actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = (...payload) => ({
      type: moduleName + config.NSP + actionName,
      payload
    });
  }
}

function injectActions(store, moduleName, handlers) {
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      let handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        actionNames.split(config.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp(`^this\[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);

          if (arr[1]) {
            handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          } else {
            handler.__isHandler__ = false;
            transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}

function _loadModel(moduleName, store) {
  const hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    const moduleGetter = MetaData.moduleGetter;
    const result = moduleGetter[moduleName]();

    if (isPromise(result)) {
      return result.then(module => {
        cacheModule(module);
        return module.default.model(store);
      });
    }

    cacheModule(result);
    return result.default.model(store);
  }

  return undefined;
}
let CoreModelHandlers = _decorate(null, function (_initialize) {
  class CoreModelHandlers {
    constructor(moduleName, store) {
      this.moduleName = moduleName;
      this.store = store;

      _initialize(this);

      this.actions = null;
    }

  }

  return {
    F: CoreModelHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: void 0
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.getState();
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store._medux_.prevState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.getRootState();
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store._medux_.prevState;
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.getCurrentState();
      }
    }, {
      kind: "method",
      key: "getCurrentState",
      value: function getCurrentState() {
        return this.store._medux_.currentState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.getCurrentRootState();
      }
    }, {
      kind: "method",
      key: "getCurrentRootState",
      value: function getCurrentRootState() {
        return this.store._medux_.currentState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return this.getPrevState();
      }
    }, {
      kind: "method",
      key: "getPrevState",
      value: function getPrevState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return this.getPrevRootState();
      }
    }, {
      kind: "method",
      key: "getPrevRootState",
      value: function getPrevRootState() {
        return this.store._medux_.beforeState;
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "callThisAction",
      value: function callThisAction(handler, ...rest) {
        const actions = MetaData.actionCreatorMap[this.moduleName];
        return actions[handler.__actionName__](...rest);
      }
    }, {
      kind: "method",
      key: "updateState",
      value: function updateState(payload, key) {
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.getState(), payload), key));
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload, key) {
        return payload;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        const state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, payload)
        });
      }
    }]
  };
});
const exportModule = (moduleName, initState, ActionHandles, views) => {
  const model = store => {
    const hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers);
      handlers.actions = actions;
      const preModuleState = store.getState()[moduleName] || {};
      const moduleState = Object.assign({}, initState, preModuleState);

      if (!moduleState.initialized) {
        moduleState.initialized = true;
        return store.dispatch(moduleInitAction(moduleName, moduleState));
      }
    }

    return undefined;
  };

  model.moduleName = moduleName;
  model.initState = initState;
  const actions = {};
  return {
    moduleName,
    model,
    views,
    actions
  };
};
function getView(moduleName, viewName) {
  const moduleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(module => {
      cacheModule(module);
      const view = module.default.views[viewName];

      if (isServerEnv) {
        return view;
      }

      const initModel = module.default.model(MetaData.clientStore);

      if (isPromise(initModel)) {
        return initModel.then(() => view);
      }

      return view;
    });
  }

  cacheModule(result);
  const view = result.default.views[viewName];

  if (isServerEnv) {
    return view;
  }

  const initModel = result.default.model(MetaData.clientStore);

  if (isPromise(initModel)) {
    return initModel.then(() => view);
  }

  return view;
}
function getModuleByName(moduleName, moduleGetter) {
  const result = moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(module => {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function isProcessedError(error) {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  }

  return !!error.meduxProcessed;
}

function setProcessedError(error, meduxProcessed) {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  }

  return {
    meduxProcessed,
    error
  };
}

function buildStore(preloadedState = {}, storeReducers = {}, storeMiddlewares = [], storeEnhancers = []) {
  if (MetaData.clientStore) {
    MetaData.clientStore.destroy();
  }

  const combineReducers = (rootState, action) => {
    if (!store) {
      return rootState;
    }

    const meta = store._medux_;
    meta.prevState = rootState;
    meta.currentState = rootState;
    Object.keys(storeReducers).forEach(moduleName => {
      const result = storeReducers[moduleName](rootState[moduleName], action);

      if (result !== rootState[moduleName]) {
        meta.currentState = Object.assign({}, meta.currentState, {
          [moduleName]: result
        });
      }
    });
    const handlersCommon = meta.reducerMap[action.type] || {};
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, handlersEvery);
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = [];
      const priority = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
        const fun = handlers[moduleName];

        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }

        if (!fun.__isHandler__) {
          priority.unshift(moduleName);
        }
      });
      orderList.unshift(...priority);
      const moduleNameMap = {};
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const result = fun(...getActionData(action));

          if (result !== rootState[moduleName]) {
            meta.currentState = Object.assign({}, meta.currentState, {
              [moduleName]: result
            });
          }
        }
      });
    }

    const changed = Object.keys(rootState).length !== Object.keys(meta.currentState).length || Object.keys(rootState).some(moduleName => rootState[moduleName] !== meta.currentState[moduleName]);
    meta.prevState = changed ? meta.currentState : rootState;
    return meta.prevState;
  };

  const middleware = ({
    dispatch
  }) => next => originalAction => {
    if (isServerEnv) {
      if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
        return originalAction;
      }
    }

    const meta = store._medux_;
    meta.beforeState = meta.prevState;
    const action = next(originalAction);
    const handlersCommon = meta.effectMap[action.type] || {};
    const handlersEvery = meta.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, handlersEvery);
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = [];
      const priority = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
        const fun = handlers[moduleName];

        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }

        if (!fun.__isHandler__) {
          priority.unshift(moduleName);
        }
      });
      orderList.unshift(...priority);
      const moduleNameMap = {};
      const promiseResults = [];
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const effectResult = fun(...getActionData(action));
          const decorators = fun.__decorators__;

          if (decorators) {
            const results = [];
            decorators.forEach((decorator, index) => {
              results[index] = decorator[0](action, moduleName, effectResult);
            });
            fun.__decoratorResults__ = results;
          }

          const errorHandler = effectResult.then(reslove => {
            if (decorators) {
              const results = fun.__decoratorResults__ || [];
              decorators.forEach((decorator, index) => {
                if (decorator[1]) {
                  decorator[1]('Resolved', results[index], reslove);
                }
              });
              fun.__decoratorResults__ = undefined;
            }

            return reslove;
          }, error => {
            if (decorators) {
              const results = fun.__decoratorResults__ || [];
              decorators.forEach((decorator, index) => {
                if (decorator[1]) {
                  decorator[1]('Rejected', results[index], error);
                }
              });
              fun.__decoratorResults__ = undefined;
            }

            if (action.type === ActionTypes.Error) {
              if (isProcessedError(error) === undefined) {
                error = setProcessedError(error, true);
              }

              throw error;
            } else if (isProcessedError(error)) {
              throw error;
            } else {
              return dispatch(errorAction(error));
            }
          });
          promiseResults.push(errorHandler);
        }
      });

      if (promiseResults.length) {
        return Promise.all(promiseResults);
      }
    }

    return action;
  };

  const preLoadMiddleware = () => next => action => {
    const [moduleName, actionName] = action.type.split(config.NSP);

    if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
      const hasInjected = !!store._medux_.injectedModules[moduleName];

      if (!hasInjected) {
        if (actionName === ActionTypes.MInit) {
          return _loadModel(moduleName, store);
        }

        const initModel = _loadModel(moduleName, store);

        if (isPromise(initModel)) {
          return initModel.then(() => next(action));
        }
      }
    }

    return next(action);
  };

  const middlewareEnhancer = applyMiddleware(preLoadMiddleware, ...storeMiddlewares, middleware);

  const enhancer = newCreateStore => {
    return (...args) => {
      const newStore = newCreateStore(...args);
      const modelStore = newStore;
      modelStore._medux_ = {
        beforeState: {},
        prevState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {}
      };
      return newStore;
    };
  };

  const enhancers = [middlewareEnhancer, enhancer, ...storeEnhancers];

  if (isDevelopmentEnv && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  const store = createStore(combineReducers, preloadedState, compose(...enhancers));

  store.destroy = () => undefined;

  if (!isServerEnv) {
    MetaData.clientStore = store;
  }

  return store;
}

function clearHandlers(key, actionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

function modelHotReplacement(moduleName, initState, ActionHandles) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];

  if (prevInitState) {
    if (JSON.stringify(prevInitState) !== JSON.stringify(initState)) {
      env.console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    }

    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles(moduleName, store);
    const actions = injectActions(store, moduleName, handlers);
    handlers.actions = actions;
    env.console.log(`[HMR] @medux Updated model actionHandles: ${moduleName}`);
  }
}

let reRender = () => undefined;

let reRenderTimer = 0;
let appView = null;
function viewHotReplacement(moduleName, views) {
  const module = MetaData.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;
    env.console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views[MetaData.appViewName];

    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(() => {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn(`[HMR] @medux view re rendering`);
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}
function exportActions(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce((maps, moduleName) => {
    maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
      get: (target, key) => {
        return (...payload) => ({
          type: moduleName + config.NSP + key,
          payload
        });
      },
      set: () => {
        return true;
      }
    });
    return maps;
  }, {});
  return MetaData.actionCreatorMap;
}
async function renderApp(render, moduleGetter, appModuleOrName, appViewName, storeOptions = {}, beforeRender) {
  if (reRenderTimer) {
    env.clearTimeout.call(null, reRenderTimer);
    reRenderTimer = 0;
  }

  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }

  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = storeOptions.initData || {};

  if (client[ssrInitStoreKey]) {
    initData = Object.assign({}, initData, client[ssrInitStoreKey]);
  }

  const store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const storeState = reduxStore.getState();
  const preModuleNames = Object.keys(storeState).filter(key => key !== appModuleName && moduleGetter[key]);
  preModuleNames.unshift(appModuleName);
  let appModule;

  for (let i = 0, k = preModuleNames.length; i < k; i++) {
    const moduleName = preModuleNames[i];
    const module = await getModuleByName(moduleName, moduleGetter);
    await module.default.model(reduxStore);

    if (i === 0) {
      appModule = module;
    }
  }

  reRender = render(reduxStore, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
}
async function renderSSR(render, moduleGetter, appModuleName, appViewName, storeOptions = {}, beforeRender) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const storeState = reduxStore.getState();
  const preModuleNames = Object.keys(storeState).filter(key => key !== appModuleName && moduleGetter[key]);
  preModuleNames.unshift(appModuleName);
  let appModule;

  for (let i = 0, k = preModuleNames.length; i < k; i++) {
    const moduleName = preModuleNames[i];
    const module = moduleGetter[moduleName]();
    await module.default.model(reduxStore);

    if (i === 0) {
      appModule = module;
    }
  }

  return render(reduxStore, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
}

function lexer(str) {
  const tokens = [];
  let i = 0;

  while (i < str.length) {
    const char = str[i];

    if (char === '*' || char === '+' || char === '?') {
      tokens.push({
        type: 'MODIFIER',
        index: i,
        value: str[i++]
      });
      continue;
    }

    if (char === '\\') {
      tokens.push({
        type: 'ESCAPED_CHAR',
        index: i++,
        value: str[i++]
      });
      continue;
    }

    if (char === '{') {
      tokens.push({
        type: 'OPEN',
        index: i,
        value: str[i++]
      });
      continue;
    }

    if (char === '}') {
      tokens.push({
        type: 'CLOSE',
        index: i,
        value: str[i++]
      });
      continue;
    }

    if (char === ':') {
      let name = '';
      let j = i + 1;

      while (j < str.length) {
        const code = str.charCodeAt(j);

        if (code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95 || code === 46) {
          name += str[j++];
          continue;
        }

        break;
      }

      if (!name) throw new TypeError(`Missing parameter name at ${i}`);
      tokens.push({
        type: 'NAME',
        index: i,
        value: name
      });
      i = j;
      continue;
    }

    if (char === '(') {
      let count = 1;
      let pattern = '';
      let j = i + 1;

      if (str[j] === '?') {
        throw new TypeError(`Pattern cannot start with "?" at ${j}`);
      }

      while (j < str.length) {
        if (str[j] === '\\') {
          pattern += str[j++] + str[j++];
          continue;
        }

        if (str[j] === ')') {
          count--;

          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === '(') {
          count++;

          if (str[j + 1] !== '?') {
            throw new TypeError(`Capturing groups are not allowed at ${j}`);
          }
        }

        pattern += str[j++];
      }

      if (count) throw new TypeError(`Unbalanced pattern at ${i}`);
      if (!pattern) throw new TypeError(`Missing pattern at ${i}`);
      tokens.push({
        type: 'PATTERN',
        index: i,
        value: pattern
      });
      i = j;
      continue;
    }

    tokens.push({
      type: 'CHAR',
      index: i,
      value: str[i++]
    });
  }

  tokens.push({
    type: 'END',
    index: i,
    value: ''
  });
  return tokens;
}

function parse(str, options = {}) {
  const tokens = lexer(str);
  const {
    prefixes = './'
  } = options;
  const defaultPattern = `[^${escapeString(options.delimiter || '/#?')}]+?`;
  const result = [];
  let key = 0;
  let i = 0;
  let path = '';

  const tryConsume = type => {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    return undefined;
  };

  const mustConsume = type => {
    const value = tryConsume(type);
    if (value !== undefined) return value;
    const {
      type: nextType,
      index
    } = tokens[i];
    throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
  };

  const consumeText = () => {
    let result = '';
    let value;

    while (value = tryConsume('CHAR') || tryConsume('ESCAPED_CHAR')) {
      result += value;
    }

    return result;
  };

  while (i < tokens.length) {
    const char = tryConsume('CHAR');
    const name = tryConsume('NAME');
    const pattern = tryConsume('PATTERN');

    if (name || pattern) {
      let prefix = char || '';

      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = '';
      }

      if (path) {
        result.push(path);
        path = '';
      }

      result.push({
        name: name || key++,
        prefix,
        suffix: '',
        pattern: pattern || defaultPattern,
        modifier: tryConsume('MODIFIER') || ''
      });
      continue;
    }

    const value = char || tryConsume('ESCAPED_CHAR');

    if (value) {
      path += value;
      continue;
    }

    if (path) {
      result.push(path);
      path = '';
    }

    const open = tryConsume('OPEN');

    if (open) {
      const prefix = consumeText();
      const name = tryConsume('NAME') || '';
      const pattern = tryConsume('PATTERN') || '';
      const suffix = consumeText();
      mustConsume('CLOSE');
      result.push({
        name: name || (pattern ? key++ : ''),
        pattern: name && !pattern ? defaultPattern : pattern,
        prefix,
        suffix,
        modifier: tryConsume('MODIFIER') || ''
      });
      continue;
    }

    mustConsume('END');
  }

  return result;
}
function compile(str, options) {
  return tokensToFunction(parse(str, options), options);
}
function tokensToFunction(tokens, options = {}) {
  const reFlags = flags(options);
  const {
    encode = x => x,
    validate = true
  } = options;
  const matches = tokens.map(token => {
    if (typeof token === 'object') {
      return new RegExp(`^(?:${token.pattern})$`, reFlags);
    }

    return undefined;
  });
  return data => {
    let path = '';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (typeof token === 'string') {
        path += token;
        continue;
      }

      const value = data ? data[token.name] : undefined;
      const optional = token.modifier === '?' || token.modifier === '*';
      const repeat = token.modifier === '*' || token.modifier === '+';

      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError(`Expected "${token.name}" to not repeat, but got an array`);
        }

        if (value.length === 0) {
          if (optional) continue;
          throw new TypeError(`Expected "${token.name}" to not be empty`);
        }

        for (let j = 0; j < value.length; j++) {
          const segment = encode(value[j], token);

          if (validate && !matches[i].test(segment)) {
            throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${segment}"`);
          }

          path += token.prefix + segment + token.suffix;
        }

        continue;
      }

      if (typeof value === 'string' || typeof value === 'number') {
        const segment = encode(String(value), token);

        if (validate && !matches[i].test(segment)) {
          throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${segment}"`);
        }

        path += token.prefix + segment + token.suffix;
        continue;
      }

      if (optional) continue;
      const typeOfMessage = repeat ? 'an array' : 'a string';
      throw new TypeError(`Expected "${token.name}" to be ${typeOfMessage}`);
    }

    return path;
  };
}

function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}

function flags(options) {
  return options && options.sensitive ? '' : 'i';
}

function regexpToRegexp(path, keys) {
  if (!keys) return path;
  const groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (let i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: '',
        suffix: '',
        modifier: '',
        pattern: ''
      });
    }
  }

  return path;
}

function arrayToRegexp(paths, keys, options) {
  const parts = paths.map(path => pathToRegexp(path, keys, options).source);
  return new RegExp(`(?:${parts.join('|')})`, flags(options));
}

function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}

function tokensToRegexp(tokens, keys, options = {}) {
  const {
    strict = false,
    start = true,
    end = true,
    encode = x => x
  } = options;
  const endsWith = `[${escapeString(options.endsWith || '')}]|$`;
  const delimiter = `[${escapeString(options.delimiter || '/#?')}]`;
  let route = start ? '^' : '';

  for (const token of tokens) {
    if (typeof token === 'string') {
      route += escapeString(encode(token));
    } else {
      const prefix = escapeString(encode(token.prefix));
      const suffix = escapeString(encode(token.suffix));

      if (token.pattern) {
        if (keys) keys.push(token);

        if (prefix || suffix) {
          if (token.modifier === '+' || token.modifier === '*') {
            const mod = token.modifier === '*' ? '?' : '';
            route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
          } else {
            route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
          }
        } else {
          route += `(${token.pattern})${token.modifier}`;
        }
      } else {
        route += `(?:${prefix}${suffix})${token.modifier}`;
      }
    }
  }

  if (end) {
    if (!strict) route += `${delimiter}?`;
    route += !options.endsWith ? '$' : `(?=${endsWith})`;
  } else {
    const endToken = tokens[tokens.length - 1];
    const isEndDelimited = typeof endToken === 'string' ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : endToken === undefined;

    if (!strict) {
      route += `(?:${delimiter}(?=${endsWith}))?`;
    }

    if (!isEndDelimited) {
      route += `(?=${delimiter}|${endsWith})`;
    }
  }

  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;
function compileToPath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  const result = compile(rule);

  if (cacheCount < cacheLimit) {
    cache[rule] = result;
    cacheCount++;
  }

  return result;
}
function compilePath(path, options = {
  end: false,
  strict: false,
  sensitive: false
}) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = {
    regexp,
    keys
  };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}
function matchPath(pathname, options = {}) {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = {
      path: options
    };
  }

  const {
    path: pathStr,
    exact = false,
    strict = false,
    sensitive = false
  } = options;
  const paths = [].concat(pathStr);
  return paths.reduce((matched, path) => {
    if (!path) return null;
    if (matched) return matched;

    if (path === '*') {
      return {
        path,
        url: pathname,
        isExact: true,
        params: {}
      };
    }

    const {
      regexp,
      keys
    } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regexp.exec(pathname);
    if (!match) return null;
    const [url, ...values] = match;
    const isExact = pathname === url;
    if (exact && !isExact) return null;
    return {
      path,
      url: path === '/' && url === '' ? '/' : url,
      isExact,
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

const routeConfig = {
  RSP: '|',
  escape: true,
  dateParse: false,
  splitKey: 'q',
  historyMax: 10,
  homeUrl: '/'
};
function setRouteConfig(conf) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.escape !== undefined && (routeConfig.escape = conf.escape);
  conf.dateParse !== undefined && (routeConfig.dateParse = conf.dateParse);
  conf.splitKey && (routeConfig.splitKey = conf.splitKey);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUrl && (routeConfig.homeUrl = conf.homeUrl);
}
const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `medux${config.NSP}RouteChange`,
  BeforeRouteChange: `medux${config.NSP}BeforeRouteChange`
};
function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}
function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
function routeParamsAction(moduleName, params, action) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action]
  };
}
function dataIsLocation(data) {
  return !!data['pathname'];
}
function checkLocation(location) {
  const data = Object.assign({}, location);
  data.pathname = `/${data.pathname}`.replace(/\/+/g, '/');

  if (data.pathname !== '/') {
    data.pathname = data.pathname.replace(/\/$/, '');
  }

  data.search = `?${location.search || ''}`.replace('??', '?');
  data.hash = `#${location.hash || ''}`.replace('##', '#');

  if (data.search === '?') {
    data.search = '';
  }

  if (data.hash === '#') {
    data.hash = '';
  }

  return data;
}
function urlToLocation(url) {
  url = `/${url}`.replace(/\/+/g, '/');

  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  const arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  const [pathname, search = '', hash = ''] = arr;
  return {
    pathname,
    search: search && `?${search}`,
    hash: hash && `#${hash}`
  };
}
function locationToUrl(safeLocation) {
  return safeLocation.pathname + safeLocation.search + safeLocation.hash;
}
function compileRule(routeRule, parentAbsoluteViewName = '', viewToRule = {}, ruleToKeys = {}) {
  for (const rule in routeRule) {
    if (routeRule.hasOwnProperty(rule)) {
      const item = routeRule[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;

      if (!ruleToKeys[rule]) {
        const {
          keys
        } = compilePath(rule, {
          end: true,
          strict: false,
          sensitive: false
        });
        ruleToKeys[rule] = keys.reduce((prev, cur) => {
          prev.push(cur.name);
          return prev;
        }, []);
      }

      const absoluteViewName = `${parentAbsoluteViewName}/${viewName}`;
      viewToRule[absoluteViewName] = rule;

      if (pathConfig) {
        compileRule(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule,
    ruleToKeys
  };
}

function isSpecificValue(val) {
  return !!(val instanceof Date || val instanceof RegExp);
}

function cloneSpecificValue(val) {
  if (val instanceof Date) {
    return new Date(val.getTime());
  }

  if (val instanceof RegExp) {
    return new RegExp(val);
  }

  throw new Error('Unexpected situation');
}

function deepCloneArray(arr) {
  const clone = [];
  arr.forEach(function (item, index) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else if (isSpecificValue(item)) {
        clone[index] = cloneSpecificValue(item);
      } else {
        clone[index] = deepExtend({}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function safeGetProperty(object, property) {
  return property === '__proto__' ? undefined : object[property];
}

function deepExtend(...datas) {
  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) {
    return arguments[0];
  }

  const target = arguments[0];
  const args = Array.prototype.slice.call(arguments, 1);
  let val;
  let src;
  args.forEach(function (obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = safeGetProperty(target, key);
      val = safeGetProperty(obj, key);

      if (val === target) ; else if (typeof val !== 'object' || val === null) {
        target[key] = val;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
      } else {
        target[key] = deepExtend(src, val);
      }
    });
  });
  return target;
}

function excludeDefaultData(data, def, holde, views) {
  const result = {};
  Object.keys(data).forEach(moduleName => {
    let value = data[moduleName];
    const defaultValue = def[moduleName];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue, !!views && !views[moduleName]);
      }

      if (value !== undefined) {
        result[moduleName] = value;
      }
    }
  });

  if (Object.keys(result).length === 0 && !holde) {
    return undefined;
  }

  return result;
}

const ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

function dateParse(prop, value) {
  if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
    return new Date(value);
  }

  return value;
}

function searchParse(search) {
  if (!search) {
    return {};
  }

  if (routeConfig.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, routeConfig.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  const str = JSON.stringify(searchData);

  if (str === '{}') {
    return '';
  }

  if (routeConfig.escape) {
    return escape(str);
  }

  return str;
}

function splitSearch(search) {
  const reg = new RegExp(`[?&#]${routeConfig.splitKey}=([^&]+)`);
  const arr = search.match(reg);

  if (arr) {
    return searchParse(arr[1]);
  }

  return {};
}

function checkPathArgs(params) {
  const obj = {};

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const val = params[key];
      const props = key.split('.');

      if (props.length > 1) {
        props.reduce((prev, cur, index, arr) => {
          if (index === arr.length - 1) {
            prev[cur] = val;
          } else {
            prev[cur] = {};
          }

          return prev[cur];
        }, obj);
      } else {
        obj[key] = val;
      }
    }
  }

  return obj;
}

function pathnameParse(pathname, routeRule, paths, args) {
  for (const rule in routeRule) {
    if (routeRule.hasOwnProperty(rule)) {
      const item = routeRule[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {
        path: rule.replace(/\$$/, ''),
        exact: !pathConfig
      });

      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(config.VSP)[0];
        const {
          params
        } = match;

        if (params && Object.keys(params).length > 0) {
          args[moduleName] = Object.assign(args[moduleName] || {}, checkPathArgs(params));
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

function assignRouteData(paths, params, defaultRouteParams) {
  const views = paths.reduce((prev, cur) => {
    const [moduleName, viewName] = cur.split(config.VSP);

    if (moduleName && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!params[moduleName]) {
        params[moduleName] = {};
      }
    }

    return prev;
  }, {});
  Object.keys(params).forEach(moduleName => {
    params[moduleName] = deepExtend({}, defaultRouteParams[moduleName], params[moduleName]);
  });
  return {
    views,
    paths,
    params
  };
}

function extractHashData(params) {
  const searchParams = {};
  const hashParams = {};

  for (const moduleName in params) {
    if (params[moduleName] && params.hasOwnProperty(moduleName)) {
      const data = params[moduleName];
      const keys = Object.keys(data);

      if (keys.length > 0) {
        keys.forEach(key => {
          if (key.startsWith('_')) {
            if (!hashParams[moduleName]) {
              hashParams[moduleName] = {};
            }

            hashParams[moduleName][key] = data[key];
          } else {
            if (!searchParams[moduleName]) {
              searchParams[moduleName] = {};
            }

            searchParams[moduleName][key] = data[key];
          }
        });
      } else {
        searchParams[moduleName] = {};
      }
    }
  }

  return {
    search: searchStringify(searchParams),
    hash: searchStringify(hashParams)
  };
}

const cacheData = [];

function getPathProps(pathprops, moduleParas = {}, deleteIt) {
  let val;

  if (typeof pathprops === 'string' && pathprops.indexOf('.') > -1) {
    const props = pathprops.split('.');
    const len = props.length - 1;
    props.reduce((p, c, i) => {
      if (i === len) {
        val = p[c];
        deleteIt && delete p[c];
      }

      return p[c] || {};
    }, moduleParas);
  } else {
    val = moduleParas[pathprops];
    deleteIt && delete moduleParas[pathprops];
  }

  return val;
}

function pathsToPathname(paths, params = {}, viewToRule, ruleToKeys) {
  const len = paths.length - 1;
  const paramsFilter = deepExtend({}, params);
  let pathname = '';
  const views = {};
  paths.reduce((parentAbsoluteViewName, viewName, index) => {
    const [moduleName, view] = viewName.split(config.VSP);
    const absoluteViewName = `${parentAbsoluteViewName}/${viewName}`;
    const rule = viewToRule[absoluteViewName];
    const keys = ruleToKeys[rule] || [];

    if (moduleName && view) {
      if (!views[moduleName]) {
        views[moduleName] = {};
      }

      views[moduleName][view] = true;
    }

    if (index === len) {
      const toPath = compileToPath(rule);
      const args = keys.reduce((prev, cur) => {
        prev[cur] = getPathProps(cur, params[moduleName]);
        return prev;
      }, {});
      pathname = toPath(args);
    }

    keys.forEach(key => {
      getPathProps(key, paramsFilter[moduleName], true);
    });
    return absoluteViewName;
  }, '');
  return {
    pathname,
    views,
    params: paramsFilter
  };
}

class BaseHistoryActions {
  constructor(nativeHistory, defaultRouteParams, initUrl, routeRule, locationMap) {
    this.nativeHistory = nativeHistory;
    this.defaultRouteParams = defaultRouteParams;
    this.initUrl = initUrl;
    this.routeRule = routeRule;
    this.locationMap = locationMap;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "_startupRouteState", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "_viewToRule", void 0);

    _defineProperty(this, "_ruleToKeys", void 0);

    const {
      viewToRule,
      ruleToKeys
    } = compileRule(routeRule);
    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
    const safeLocation = urlToLocation(initUrl);

    const routeState = this._createRouteState(safeLocation, 'RELAUNCH', '');

    this._routeState = routeState;
    this._startupRouteState = routeState;
  }

  setStore(_store) {
    this.store = _store;
  }

  mergeInitState(initState) {
    const routeState = this.getRouteState();
    const data = Object.assign({}, initState, {
      route: routeState
    });
    Object.keys(routeState.views).forEach(moduleName => {
      if (!data[moduleName]) {
        data[moduleName] = {};
      }

      data[moduleName] = Object.assign({}, data[moduleName], {
        routeParams: routeState.params[moduleName]
      });
    });
    return data;
  }

  getCurKey() {
    return this._routeState.key;
  }

  getRouteState() {
    return this._routeState;
  }

  locationToRoute(safeLocation) {
    const url = locationToUrl(safeLocation);
    const item = cacheData.find(val => {
      return val && val.url === url;
    });

    if (item) {
      return item.routeData;
    }

    const pathname = safeLocation.pathname;
    const paths = [];
    const pathsArgs = {};
    pathnameParse(pathname, this.routeRule, paths, pathsArgs);
    const params = splitSearch(safeLocation.search);
    const hashParams = splitSearch(safeLocation.hash);
    deepExtend(params, hashParams);
    const routeData = assignRouteData(paths, deepExtend(pathsArgs, params), this.defaultRouteParams);
    cacheData.unshift({
      url,
      routeData
    });
    cacheData.length = 100;
    return routeData;
  }

  routeToLocation(paths, params) {
    params = params || {};
    let pathname;
    let views = {};

    if (typeof paths === 'string') {
      pathname = paths;
    } else {
      const data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
      pathname = data.pathname;
      params = data.params;
      views = data.views;
    }

    const paramsFilter = excludeDefaultData(params, this.defaultRouteParams, false, views);
    const {
      search,
      hash
    } = extractHashData(paramsFilter);
    return {
      pathname,
      search: search ? `?${routeConfig.splitKey}=${search}` : '',
      hash: hash ? `#${routeConfig.splitKey}=${hash}` : ''
    };
  }

  payloadToRoute(data) {
    if (typeof data === 'string') {
      return this.locationToRoute(urlToLocation(data));
    }

    if (dataIsLocation(data)) {
      return this.locationToRoute(checkLocation(data));
    }

    const params = data.extendParams ? deepExtend({}, data.extendParams, data.params) : data.params;
    let paths = [];

    if (typeof data.paths === 'string') {
      const pathname = data.paths;
      pathnameParse(pathname, this.routeRule, paths, {});
    } else {
      paths = data.paths;
    }

    return assignRouteData(paths, params || {}, this.defaultRouteParams);
  }

  payloadToLocation(data) {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }

    if (dataIsLocation(data)) {
      return checkLocation(data);
    }

    const params = data.extendParams ? deepExtend({}, data.extendParams, data.params) : data.params;
    return this.routeToLocation(data.paths, params);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  _getEfficientLocation(safeLocation) {
    const routeData = this.locationToRoute(safeLocation);

    if (routeData.views['@']) {
      const url = Object.keys(routeData.views['@'])[0];
      const reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation);
    }

    return {
      location: safeLocation,
      routeData
    };
  }

  _buildHistory(location) {
    const maxLength = routeConfig.historyMax;
    const {
      action,
      url,
      pathname,
      key
    } = location;
    const {
      history,
      stack
    } = this._routeState || {
      history: [],
      stack: []
    };

    const uri = this._urlToUri(url, key);

    let historyList = [...history];
    let stackList = [...stack];

    if (action === 'RELAUNCH') {
      historyList = [uri];
      stackList = [pathname];
    } else if (action === 'PUSH') {
      historyList.unshift(uri);

      if (historyList.length > maxLength) {
        historyList.length = maxLength;
      }

      if (stackList[0] !== pathname) {
        stackList.unshift(pathname);
      }

      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else if (action === 'REPLACE') {
      historyList[0] = uri;

      if (stackList[0] !== pathname) {
        const cpathname = this._uriToPathname(historyList[1]);

        if (cpathname !== stackList[0]) {
          stackList.shift();
        }

        if (stackList[0] !== pathname) {
          stackList.unshift(pathname);
        }

        if (stackList.length > maxLength) {
          stackList.length = maxLength;
        }
      }
    } else if (action.startsWith('POP')) {
      const n = parseInt(action.replace('POP', ''), 10) || 1;
      const arr = historyList.splice(0, n + 1, uri).reduce((pre, curUri) => {
        const cpathname = this._uriToPathname(curUri);

        if (pre[pre.length - 1] !== cpathname) {
          pre.push(cpathname);
        }

        return pre;
      }, []);

      if (arr[arr.length - 1] === this._uriToPathname(historyList[1])) {
        arr.pop();
      }

      stackList.splice(0, arr.length, pathname);

      if (stackList[0] === stackList[1]) {
        stackList.shift();
      }
    }

    return {
      history: historyList,
      stack: stackList
    };
  }

  _urlToUri(url, key) {
    return `${key}${routeConfig.RSP}${url}`;
  }

  _uriToUrl(uri = '') {
    return uri.substr(uri.indexOf(routeConfig.RSP) + 1);
  }

  _uriToPathname(uri = '') {
    const url = this._uriToUrl(uri);

    return url.split(/[?#]/)[0];
  }

  _uriToKey(uri = '') {
    return uri.substr(0, uri.indexOf(routeConfig.RSP));
  }

  findHistoryByKey(key) {
    const {
      history
    } = this._routeState;
    const index = history.findIndex(uri => uri.startsWith(`${key}${routeConfig.RSP}`));
    return {
      index,
      url: index > -1 ? this._uriToUrl(history[index]) : ''
    };
  }

  _toNativeLocation(location) {
    if (this.locationMap) {
      const nLocation = checkLocation(this.locationMap.out(location));
      return Object.assign({}, nLocation, {
        action: location.action,
        url: locationToUrl(nLocation),
        key: location.key
      });
    }

    return location;
  }

  _createRouteState(safeLocation, action, key) {
    key = key || this._createKey();

    const data = this._getEfficientLocation(safeLocation);

    const location = Object.assign({}, data.location, {
      action,
      url: locationToUrl(data.location),
      key
    });

    const {
      history,
      stack
    } = this._buildHistory(location);

    const routeState = Object.assign({}, location, data.routeData, {
      history,
      stack
    });
    return routeState;
  }

  async dispatch(safeLocation, action, key = '', callNative) {
    const routeState = this._createRouteState(safeLocation, action, key);

    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    await this.store.dispatch(routeChangeAction(routeState));

    if (callNative) {
      const nativeLocation = this._toNativeLocation(routeState);

      if (typeof callNative === 'number') {
        this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative);
      } else {
        this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation);
      }
    }

    return routeState;
  }

  relaunch(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  }

  push(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  }

  replace(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  }

  pop(n = 1, root = 'FIRST', disableNative) {
    n = n || 1;
    const uri = this._routeState.history[n];

    if (uri) {
      const url = this._uriToUrl(uri);

      const key = this._uriToKey(uri);

      const paLocation = urlToLocation(url);
      return this.dispatch(paLocation, `POP${n}`, key, disableNative ? '' : n);
    }

    let url = root;

    if (root === 'HOME') {
      url = routeConfig.homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupRouteState.url;
    }

    if (!url) {
      return Promise.reject(1);
    }

    return this.relaunch(url, disableNative);
  }

  home(root = 'FIRST', disableNative) {
    return this.relaunch(root === 'HOME' ? routeConfig.homeUrl : this._startupRouteState.url, disableNative);
  }

}
const routeMiddleware = ({
  dispatch,
  getState
}) => next => action => {
  if (action.type === RouteActionTypes.RouteChange) {
    const result = next(action);
    const routeState = action.payload[0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach(moduleName => {
      const routeParams = rootRouteParams[moduleName];

      if (routeParams) {
        var _rootState$moduleName;

        if ((_rootState$moduleName = rootState[moduleName]) === null || _rootState$moduleName === void 0 ? void 0 : _rootState$moduleName.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        } else {
          dispatch(moduleInitAction(moduleName, undefined));
        }
      }
    });
    return result;
  }

  return next(action);
};
const routeReducer = (state, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return action.payload[0];
  }

  return state;
};
let RouteModelHandlers = _decorate(null, function (_initialize, _CoreModelHandlers) {
  class RouteModelHandlers extends _CoreModelHandlers {
    constructor(...args) {
      super(...args);

      _initialize(this);
    }

  }

  return {
    F: RouteModelHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        const rootState = this.getRootState();
        const routeParams = rootState.route.params[this.moduleName];
        return Object.assign({}, initState, {
          routeParams
        });
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        const state = this.getState();
        return Object.assign({}, state, {
          routeParams: payload
        });
      }
    }]
  };
}, CoreModelHandlers);

function renderApp$1(moduleGetter, appModuleName, appViewName, storeOptions, container = 'root', beforeRender) {
  return renderApp((store, appModel, AppView, ssrInitStoreKey) => {
    const reRender = View => {
      const reduxProvider = React.createElement(Provider, {
        store: store
      }, React.createElement(View, null));

      if (typeof container === 'function') {
        container(reduxProvider);
      } else {
        const panel = typeof container === 'string' ? env.document.getElementById(container) : container;
        ReactDOM.unmountComponentAtNode(panel);
        const render = env[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
        render(reduxProvider, panel);
      }
    };

    reRender(AppView);
    return reRender;
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}
function renderSSR$1(moduleGetter, appModuleName, appViewName, storeOptions = {}, renderToStream = false, beforeRender) {
  return renderSSR((store, appModel, AppView, ssrInitStoreKey) => {
    const data = store.getState();
    const reduxProvider = React.createElement(Provider, {
      store: store
    }, React.createElement(AppView, null));
    const render = renderToStream ? renderToNodeStream : renderToString;
    return {
      store,
      ssrInitStoreKey,
      data,
      html: render(reduxProvider)
    };
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}

const LoadViewOnError = () => {
  return React.createElement("div", null, "error");
};

const loadView = (moduleName, viewName, options, Loading, Error) => {
  const {
    forwardRef
  } = options || {};
  let active = true;

  const Loader = function ViewLoader(props) {
    useEffect(() => {
      return () => {
        active = false;
      };
    }, []);
    const [view, setView] = useState(() => {
      const moduleViewResult = getView(moduleName, viewName);

      if (isPromise(moduleViewResult)) {
        moduleViewResult.then(Component => {
          active && setView({
            Component
          });
        }).catch(() => {
          active && setView({
            Component: Error || LoadViewOnError
          });
        });
        return null;
      }

      return {
        Component: moduleViewResult
      };
    });

    const {
      forwardRef2
    } = props,
          other = _objectWithoutPropertiesLoose(props, ["forwardRef2"]);

    const ref = forwardRef ? {
      ref: forwardRef2
    } : {};
    return view ? React.createElement(view.Component, _extends({}, other, ref)) : Loading ? React.createElement(Loading, props) : null;
  };

  const Component = forwardRef ? React.forwardRef((props, ref) => React.createElement(Loader, _extends({}, props, {
    forwardRef: ref
  }))) : Loader;
  return Component;
};
const exportModule$1 = exportModule;

function locationToUrl$1(loaction) {
  return loaction.pathname + loaction.search + loaction.hash;
}

class WebNativeHistory {
  constructor(createHistory, locationMap) {
    this.locationMap = locationMap;

    _defineProperty(this, "history", void 0);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      const [pathname, search = ''] = createHistory.split('?');
      this.history = {
        action: 'PUSH',
        length: 0,

        listen() {
          return () => undefined;
        },

        createHref() {
          return '';
        },

        push() {},

        replace() {},

        go() {},

        goBack() {},

        goForward() {},

        block() {
          return () => undefined;
        },

        location: {
          pathname,
          search: search && `?${search}`,
          hash: ''
        }
      };
    }
  }

  block(blocker) {
    return this.history.block((location, action) => {
      return blocker({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      }, this.getKey(location), action);
    });
  }

  getUrl() {
    const location = this.locationMap ? this.locationMap.in(this.history.location) : this.history.location;
    return locationToUrl$1(location);
  }

  getKey(location) {
    return location.state || '';
  }

  push(location) {
    this.history.push(locationToUrl$1(location), location.key);
  }

  replace(location) {
    this.history.replace(locationToUrl$1(location), location.key);
  }

  relaunch(location) {
    this.history.push(locationToUrl$1(location), location.key);
  }

  pop(location, n) {
    this.history.go(-n);
  }

}
class HistoryActions extends BaseHistoryActions {
  constructor(nativeHistory, defaultRouteParams, routeRule, locationMap) {
    super(nativeHistory, defaultRouteParams, nativeHistory.getUrl(), routeRule, locationMap);
    this.nativeHistory = nativeHistory;
    this.defaultRouteParams = defaultRouteParams;
    this.routeRule = routeRule;
    this.locationMap = locationMap;

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_timer", 0);

    this._unlistenHistory = this.nativeHistory.block((location, key, action) => {
      if (key !== this.getCurKey()) {
        let callback;
        let index = 0;

        if (action === 'POP') {
          index = this.findHistoryByKey(key).index;
        }

        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.pop(index);
          };
        } else {
          const paLocation = this.locationMap ? this.locationMap.in(location) : location;

          if (action === 'REPLACE') {
            callback = () => {
              this._timer = 0;
              this.replace(paLocation);
            };
          } else if (action === 'PUSH') {
            callback = () => {
              this._timer = 0;
              this.push(paLocation);
            };
          } else {
            callback = () => {
              this._timer = 0;
              this.relaunch(paLocation);
            };
          }
        }

        if (callback && !this._timer) {
          this._timer = env.setTimeout(callback, 50);
        }

        return false;
      }

      return undefined;
    });
  }

  getNativeHistory() {
    return this.nativeHistory.history;
  }

  destroy() {
    this._unlistenHistory();
  }

}
function createRouter(createHistory, defaultRouteParams, routeRule, locationMap) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, defaultRouteParams, routeRule, locationMap);
  return historyActions;
}

let historyActions;
function buildApp({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  historyType = 'Browser',
  routeRule = {},
  locationMap,
  defaultRouteParams = {},
  storeOptions = {},
  container = 'root',
  beforeRender
}) {
  historyActions = createRouter(historyType, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(routeMiddleware);

  if (!storeOptions.reducers) {
    storeOptions.reducers = {};
  }

  storeOptions.reducers.route = routeReducer;

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderApp$1(moduleGetter, appModuleName, appViewName, storeOptions, container, store => {
    var _historyActions;

    const newStore = beforeRender ? beforeRender({
      store,
      historyActions: historyActions
    }) : store;
    (_historyActions = historyActions) === null || _historyActions === void 0 ? void 0 : _historyActions.setStore(newStore);
    return newStore;
  });
}
function buildSSR({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  location,
  routeRule = {},
  locationMap,
  defaultRouteParams = {},
  storeOptions = {},
  renderToStream = false,
  beforeRender
}) {
  historyActions = createRouter(location, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderSSR$1(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, store => {
    var _historyActions2;

    const newStore = beforeRender ? beforeRender({
      store,
      historyActions: historyActions
    }) : store;
    (_historyActions2 = historyActions) === null || _historyActions2 === void 0 ? void 0 : _historyActions2.setStore(newStore);
    return newStore;
  });
}
const Switch = ({
  children,
  elseView
}) => {
  if (!children || Array.isArray(children) && children.every(item => !item)) {
    return React.createElement(React.Fragment, null, elseView);
  }

  return React.createElement(React.Fragment, null, children);
};

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

const Link = React.forwardRef((_ref, ref) => {
  let {
    onClick,
    replace
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "replace"]);

  const {
    target
  } = rest;
  const props = Object.assign({}, rest, {
    onClick: event => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? historyActions.replace(rest.href) : historyActions.push(rest.href);
        }
    }
  });
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});

export { ActionTypes, RouteModelHandlers as BaseModelHandlers, Link, LoadingState, Switch, buildApp, buildSSR, delayPromise, effect, errorAction, exportActions, exportModule$1 as exportModule, loadView, logger, modelHotReplacement, reducer, setConfig, setLoading, setLoadingDepthTime, setRouteConfig, viewHotReplacement };
