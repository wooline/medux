import React, { useEffect, useState } from 'react';
import { unmountComponentAtNode, hydrate, render } from 'react-dom';

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

const env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
const isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
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
function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];

    if (isPlainObject(val)) {
      if (isPlainObject(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

function deepMerge(target, ...args) {
  if (!isPlainObject(target)) {
    target = {};
  }

  args = args.filter(Boolean);

  if (args.length < 1) {
    return target;
  }

  args.forEach(function (inject, index) {
    if (isPlainObject(inject)) {
      let lastArg = false;
      let last2Arg = null;

      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }

      Object.keys(inject).forEach(function (key) {
        const src = target[key];
        const val = inject[key];

        if (isPlainObject(val)) {
          if (isPlainObject(src)) {
            target[key] = __deepMerge(lastArg, src, val);
          } else {
            target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepMerge(lastArg, {}, val);
          }
        } else {
          target[key] = val;
        }
      });
    }
  });
  return target;
}

const config = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DEVTOOLS: process.env.NODE_ENV === 'development'
};
function setConfig(_config) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DEVTOOLS !== undefined && (config.DEVTOOLS = _config.DEVTOOLS);
}
function warn(str) {
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}
function deepMergeState(target = {}, ...args) {
  if (config.MutableData) {
    return deepMerge(target, ...args);
  }

  return deepMerge({}, target, ...args);
}
function mergeState(target = {}, ...args) {
  if (config.MutableData) {
    return Object.assign(target, ...args);
  }

  return Object.assign({}, target, ...args);
}
function snapshotState(target) {
  if (config.MutableData) {
    return JSON.parse(JSON.stringify(target));
  }

  return target;
}
const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
  Error: `medux${config.NSP}Error`
};
const MetaData = {
  appViewName: null,
  facadeMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null,
  currentData: {
    actionName: '',
    prevState: null
  }
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
        const actions = MetaData.facadeMap[moduleName].actions[ActionTypes.MLoading];
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
function isServer() {
  return isServerEnv;
}
function serverSide(callback) {
  if (isServerEnv) {
    return callback();
  }

  return undefined;
}
function clientSide(callback) {
  if (!isServerEnv) {
    return callback();
  }

  return undefined;
}

function errorAction(reason) {
  return {
    type: ActionTypes.Error,
    payload: [reason]
  };
}
function moduleInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState]
  };
}
function moduleReInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MReInit}`,
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

function isPlainObject$1(obj) {
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
    if (!isPlainObject$1(action)) {
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
          }
        });
      }
    }
  }
}

function _loadModel(moduleName, store) {
  const hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    const moduleGetter = MetaData.moduleGetter;

    if (!moduleGetter[moduleName]) {
      return undefined;
    }

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
let CoreModuleHandlers = _decorate(null, function (_initialize) {
  class CoreModuleHandlers {
    constructor(initState) {
      this.initState = initState;

      _initialize(this);
    }

  }

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "actions",

      value() {
        return null;
      }

    }, {
      kind: "field",
      key: "store",

      value() {
        return null;
      }

    }, {
      kind: "field",
      key: "moduleName",

      value() {
        return '';
      }

    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store._medux_.realtimeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store._medux_.realtimeState;
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return MetaData.currentData.actionName;
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return MetaData.currentData.prevState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return MetaData.currentData.prevState[this.moduleName];
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
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
        return mergeState(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        const loading = mergeState(this.state.loading, payload);
        return mergeState(this.state, {
          loading
        });
      }
    }]
  };
});
const exportModule = (moduleName, ModuleHandles, views) => {
  const model = store => {
    const hasInjected = store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      const moduleHandles = new ModuleHandles();
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
      const initState = moduleHandles.initState;
      injectActions(store, moduleName, moduleHandles);
      const preModuleState = store.getState()[moduleName] || {};
      const moduleState = Object.assign({}, initState, preModuleState);

      if (moduleState.initialized) {
        return store.dispatch(moduleReInitAction(moduleName, moduleState));
      }

      moduleState.initialized = true;
      return store.dispatch(moduleInitAction(moduleName, moduleState));
    }

    return undefined;
  };

  return {
    moduleName,
    model,
    views,
    initState: undefined,
    actions: undefined
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
  return error && !!error.__meduxProcessed__;
}
function setProcessedError(error, meduxProcessed) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  Object.defineProperty(error, '__meduxProcessed__', {
    value: meduxProcessed,
    enumerable: false,
    writable: true
  });
  return error;
}
function buildStore(preloadedState = {}, storeReducers = {}, storeMiddlewares = [], storeEnhancers = []) {
  if (MetaData.clientStore) {
    MetaData.clientStore.destroy();
  }

  let store;

  const combineReducers = (state, action) => {
    if (!store) {
      return state;
    }

    const meta = store._medux_;
    const currentState = meta.currentState;
    const realtimeState = meta.realtimeState;
    Object.keys(storeReducers).forEach(moduleName => {
      const node = storeReducers[moduleName](state[moduleName], action);

      if (config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
        warn('Use rewrite instead of replace to update state in MutableData');
      }

      realtimeState[moduleName] = node;
    });
    const handlersCommon = meta.reducerMap[action.type] || {};
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, handlersEvery);
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = [];
      const priority = action.priority ? [...action.priority] : [];
      const actionData = getActionData(action);
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
          MetaData.currentData = {
            actionName: action.type,
            prevState: currentState
          };
          const node = fun(...actionData);

          if (config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
            warn('Use rewrite instead of replace to update state in MutableData');
          }

          realtimeState[moduleName] = node;
        }
      });
    }

    return realtimeState;
  };

  const middleware = ({
    dispatch
  }) => next => originalAction => {
    if (originalAction.type === ActionTypes.Error) {
      const actionData = getActionData(originalAction);

      if (isProcessedError(actionData[0])) {
        return originalAction;
      }

      actionData[0] = setProcessedError(actionData[0], true);
    }

    if (isServerEnv) {
      if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
        return originalAction;
      }
    }

    const meta = store._medux_;
    const rootState = store.getState();
    meta.realtimeState = mergeState(rootState);
    meta.currentState = snapshotState(rootState);
    const currentState = meta.currentState;
    const action = next(originalAction);
    const handlersCommon = meta.effectMap[action.type] || {};
    const handlersEvery = meta.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, handlersEvery);
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const actionData = getActionData(action);
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
          MetaData.currentData = {
            actionName: action.type,
            prevState: currentState
          };
          const effectResult = fun(...actionData);
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
          }, reason => {
            if (decorators) {
              const results = fun.__decoratorResults__ || [];
              decorators.forEach((decorator, index) => {
                if (decorator[1]) {
                  decorator[1]('Rejected', results[index], reason);
                }
              });
              fun.__decoratorResults__ = undefined;
            }

            if (isProcessedError(reason)) {
              throw reason;
            } else {
              reason = setProcessedError(reason, false);
              return dispatch(errorAction(reason));
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
      const hasInjected = store._medux_.injectedModules[moduleName];

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
      const moduleStore = newStore;
      moduleStore._medux_ = {
        realtimeState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {}
      };
      return newStore;
    };
  };

  const enhancers = [middlewareEnhancer, enhancer, ...storeEnhancers];

  if (config.DEVTOOLS && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = createStore(combineReducers, preloadedState, compose(...enhancers));

  store.destroy = () => undefined;

  if (!isServerEnv) {
    MetaData.clientStore = store;
  }

  return store;
}

function getRootModuleAPI(data) {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions = {};
        const actionNames = {};
        arr.forEach(actionName => {
          actions[actionName] = (...payload) => ({
            type: moduleName + config.NSP + actionName,
            payload
          });

          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        const moduleFacade = {
          name: moduleName,
          actions,
          actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      const cacheData = {};
      MetaData.facadeMap = new Proxy({}, {
        set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },

        get(target, moduleName, receiver) {
          const val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get(__, actionName) {
                  return moduleName + config.NSP + actionName;
                }

              }),
              actions: new Proxy({}, {
                get(__, actionName) {
                  return (...payload) => ({
                    type: moduleName + config.NSP + actionName,
                    payload
                  });
                }

              })
            };
          }

          return cacheData[moduleName];
        }

      });
    }
  }

  return MetaData.facadeMap;
}

function clearHandlers(key, actionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

function modelHotReplacement(moduleName, ActionHandles) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];

  if (prevInitState) {
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles();
    handlers.moduleName = moduleName;
    handlers.store = store;
    handlers.actions = MetaData.facadeMap[moduleName].actions;
    injectActions(store, moduleName, handlers);
    env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
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
async function renderApp(render, moduleGetter, appModuleOrName, appViewName, storeOptions = {}, startup) {
  if (reRenderTimer) {
    env.clearTimeout.call(null, reRenderTimer);
    reRenderTimer = 0;
  }

  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;

  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }

  const store = buildStore(storeOptions.initData || {}, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const appModule = await getModuleByName(appModuleName, moduleGetter);
  startup(store, appModule);
  await appModule.default.model(store);
  reRender = render(store, appModule.default.views[appViewName]);
  return {
    store
  };
}

const defFun = () => undefined;

async function renderSSR(render, moduleGetter, appModuleOrName, appViewName, storeOptions = {}, startup) {
  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;

  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }

  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const appModule = await getModuleByName(appModuleName, moduleGetter);
  startup(store, appModule);
  await appModule.default.model(store);
  store.dispatch = defFun;
  return render(store, appModule.default.views[appViewName]);
}

const routeConfig = {
  RSP: '|',
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {}
};
function setRouteConfig(conf) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.pagenames && (routeConfig.pagenames = conf.pagenames);
}

function locationToUri(location, key) {
  const {
    pagename,
    params
  } = location;
  const query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join(routeConfig.RSP),
    pagename,
    query,
    key
  };
}

function splitUri(...args) {
  const [uri = '', name] = args;
  const arr = uri.split(routeConfig.RSP, 3);
  const index = {
    key: 0,
    pagename: 1,
    query: 2
  };

  if (name) {
    return arr[index[name]];
  }

  return arr;
}

function uriToLocation(uri) {
  const [key, pagename, query] = splitUri(uri);
  const location = {
    pagename,
    params: JSON.parse(query)
  };
  return {
    key,
    location
  };
}
class History {
  constructor() {
    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);
  }

  getActionRecord(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.actions[keyOrIndex];
    }

    return this.actions.find(item => item.key === keyOrIndex);
  }

  getPageRecord(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.pages[keyOrIndex];
    }

    return this.pages.find(item => item.key === keyOrIndex);
  }

  getActionIndex(key) {
    return this.actions.findIndex(item => item.key === key);
  }

  getPageIndex(key) {
    return this.pages.findIndex(item => item.key === key);
  }

  getCurrentInternalHistory() {
    return this.actions[0].sub;
  }

  getUriStack() {
    return {
      actions: this.actions.map(item => item.uri),
      pages: this.pages.map(item => item.uri)
    };
  }

  push(location, key) {
    var _pages$;

    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      pagename,
      query,
      key,
      sub: new History()
    };
    const pages = [...this.pages];
    const actions = [...this.actions];
    const actionsMax = routeConfig.actionMaxHistory;
    const pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(newStack);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) === null || _pages$ === void 0 ? void 0 : _pages$.uri, 'pagename') !== pagename) {
      pages.unshift(newStack);

      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = newStack;
    }

    this.actions = actions;
    this.pages = pages;
  }

  replace(location, key) {
    var _pages$2;

    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      pagename,
      query,
      key,
      sub: new History()
    };
    const pages = [...this.pages];
    const actions = [...this.actions];
    const pagesMax = routeConfig.pagesMaxHistory;
    actions[0] = newStack;
    pages[0] = newStack;

    if (pagename === splitUri((_pages$2 = pages[1]) === null || _pages$2 === void 0 ? void 0 : _pages$2.uri, 'pagename')) {
      pages.splice(1, 1);
    }

    if (pages.length > pagesMax) {
      pages.length = pagesMax;
    }

    this.actions = actions;
    this.pages = pages;
  }

  relaunch(location, key) {
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      pagename,
      query,
      key,
      sub: new History()
    };
    const actions = [newStack];
    const pages = [newStack];
    this.actions = actions;
    this.pages = pages;
  }

  pop(n) {
    const historyRecord = this.getPageRecord(n);

    if (!historyRecord) {
      return false;
    }

    const pages = [...this.pages];
    const actions = [];
    pages.splice(0, n);
    this.actions = actions;
    this.pages = pages;
    return true;
  }

  back(n) {
    var _actions$, _pages$3;

    const historyRecord = this.getActionRecord(n);

    if (!historyRecord) {
      return false;
    }

    const uri = historyRecord.uri;
    const pagename = splitUri(uri, 'pagename');
    const pages = [...this.pages];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, n + 1, historyRecord);
    const arr = deleteActions.reduce((pre, curStack) => {
      const ctag = splitUri(curStack.uri, 'pagename');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[1]) === null || _actions$ === void 0 ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length, historyRecord);

    if (pagename === splitUri((_pages$3 = pages[1]) === null || _pages$3 === void 0 ? void 0 : _pages$3.uri, 'pagename')) {
      pages.splice(1, 1);
    }

    this.actions = actions;
    this.pages = pages;
    return true;
  }

}

function isPlainObject$2(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __extendDefault(target, def) {
  const clone = {};
  Object.keys(def).forEach(function (key) {
    if (!target.hasOwnProperty(key)) {
      clone[key] = def[key];
    } else {
      const tval = target[key];
      const dval = def[key];

      if (isPlainObject$2(tval) && isPlainObject$2(dval) && tval !== dval) {
        clone[key] = __extendDefault(tval, dval);
      } else {
        clone[key] = tval;
      }
    }
  });
  return clone;
}

function extendDefault(target, def) {
  if (!isPlainObject$2(target)) {
    target = {};
  }

  if (!isPlainObject$2(def)) {
    def = {};
  }

  return __extendDefault(target, def);
}

function __excludeDefault(data, def) {
  const result = {};
  let hasSub = false;
  Object.keys(data).forEach(key => {
    let value = data[key];
    const defaultValue = def[key];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && isPlainObject$2(value)) {
        value = __excludeDefault(value, defaultValue);
      }

      if (value !== undefined) {
        hasSub = true;
        result[key] = value;
      }
    }
  });

  if (hasSub) {
    return result;
  }

  return undefined;
}

function excludeDefault(data, def, keepTopLevel) {
  if (!isPlainObject$2(data)) {
    return {};
  }

  if (!isPlainObject$2(def)) {
    return data;
  }

  const filtered = __excludeDefault(data, def);

  if (keepTopLevel) {
    const result = {};
    Object.keys(data).forEach(function (key) {
      result[key] = filtered && filtered[key] !== undefined ? filtered[key] : {};
    });
    return result;
  }

  return filtered || {};
}

function __splitPrivate(data) {
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return [undefined, undefined];
  }

  let publicData;
  let privateData;
  keys.forEach(key => {
    const value = data[key];

    if (key.startsWith('_')) {
      if (!privateData) {
        privateData = {};
      }

      privateData[key] = value;
    } else if (isPlainObject$2(value)) {
      const [subPublicData, subPrivateData] = __splitPrivate(value);

      if (subPublicData) {
        if (!publicData) {
          publicData = {};
        }

        publicData[key] = subPublicData;
      }

      if (subPrivateData) {
        if (!privateData) {
          privateData = {};
        }

        privateData[key] = subPrivateData;
      }
    } else {
      if (!publicData) {
        publicData = {};
      }

      publicData[key] = value;
    }
  });
  return [publicData, privateData];
}

function splitPrivate(data, deleteTopLevel) {
  if (!isPlainObject$2(data)) {
    return [undefined, undefined];
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return [undefined, undefined];
  }

  const result = __splitPrivate(data);

  let publicData = result[0];
  const privateData = result[1];
  keys.forEach(function (key) {
    if (!deleteTopLevel[key]) {
      if (!publicData) {
        publicData = {};
      }

      if (!publicData[key]) {
        publicData[key] = {};
      }
    }
  });
  return [publicData, privateData];
}

function assignDefaultData(data, def) {
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function splitSearch(search, paramsKey) {
  const reg = new RegExp(`&${paramsKey}=([^&]+)`);
  const arr = `&${search}`.match(reg);
  return arr ? arr[1] : '';
}

function encodeBas64(str) {
  return typeof btoa === 'function' ? btoa(str) : typeof Buffer === 'object' ? Buffer.from(str).toString('base64') : str;
}

function decodeBas64(str) {
  return typeof atob === 'function' ? atob(str) : typeof Buffer === 'object' ? Buffer.from(str, 'base64').toString() : str;
}

function parseNativeLocation(nativeLocation, paramsKey, base64, parse) {
  let search = splitSearch(nativeLocation.search, paramsKey);
  let hash = splitSearch(nativeLocation.hash, paramsKey);

  if (base64) {
    search = search && decodeBas64(search);
    hash = hash && decodeBas64(hash);
  } else {
    search = search && decodeURIComponent(search);
    hash = hash && decodeURIComponent(hash);
  }

  let pathname = nativeLocation.pathname;

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  return {
    pathname: pathname.replace(/\/*$/, '') || '/',
    searchParams: search ? parse(search) : undefined,
    hashParams: hash ? parse(hash) : undefined
  };
}

function toNativeLocation(pathname, search, hash, paramsKey, base64, stringify) {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = searchStr && encodeBas64(searchStr);
    hashStr = hashStr && encodeBas64(hashStr);
  } else {
    searchStr = searchStr && encodeURIComponent(searchStr);
    hashStr = hashStr && encodeURIComponent(hashStr);
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  return {
    pathname: pathname.replace(/\/*$/, '') || '/',
    search: searchStr && `${paramsKey}=${searchStr}`,
    hash: hashStr && `${paramsKey}=${hashStr}`
  };
}

function createPathnameTransform(pathnameIn, pagenameMap, pathnameOut) {
  pagenameMap = Object.keys(pagenameMap).sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace('//', '/').replace('//', '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = Object.keys(pagenameMap).reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  routeConfig.pagenames['/'] = '/';
  return {
    in(pathname) {
      pathname = pathnameIn(pathname);

      if (!pathname.endsWith('/')) {
        pathname = `${pathname}/`;
      }

      let pagename = Object.keys(pagenameMap).find(name => pathname.startsWith(name));
      let pathParams;

      if (!pagename) {
        pagename = '/';
        pathParams = {};
      } else {
        const args = pathname.replace(pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
        pathParams = pagenameMap[pagename].in(args);
        pagename = pagename.replace(/\/$/, '') || '/';
      }

      return {
        pagename,
        pathParams
      };
    },

    out(pagename, params) {
      pagename = `/${pagename}/`.replace('//', '/').replace('//', '/');
      let pathname;

      if (!pagenameMap[pagename]) {
        pathname = '/';
      } else {
        const args = pagenameMap[pagename].out(params);
        pathname = pagename + args.map(item => item && encodeURIComponent(item)).join('/').replace(/\/*$/, '');
      }

      if (pathnameOut) {
        pathname = pathnameOut(pathname);
      }

      const data = this.in(pathname);
      const pathParams = data.pathParams;
      return {
        pathname,
        pathParams
      };
    }

  };
}
function createLocationTransform(pathnameTransform, defaultData, base64 = false, serialization = JSON, paramsKey = '_') {
  return {
    in(nativeLocation) {
      const {
        pathname,
        searchParams,
        hashParams
      } = parseNativeLocation(nativeLocation, paramsKey, base64, serialization.parse);
      const {
        pagename,
        pathParams
      } = pathnameTransform.in(pathname);
      let params = deepMerge(pathParams, searchParams, hashParams);
      params = assignDefaultData(params, defaultData);
      return {
        pagename,
        params
      };
    },

    out(meduxLocation) {
      let params = excludeDefault(meduxLocation.params, defaultData, true);
      const {
        pathname,
        pathParams
      } = pathnameTransform.out(meduxLocation.pagename, params);
      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams);
      return toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
    }

  };
}

let RouteModuleHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  class RouteModuleHandlers extends _CoreModuleHandlers {
    constructor(...args) {
      super(...args);

      _initialize(this);
    }

  }

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        const routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMergeState(initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return deepMergeState(this.state, payload);
      }
    }]
  };
}, CoreModuleHandlers);
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
function routeParamsAction(moduleName, params, action) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action]
  };
}
function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
const routeMiddleware = ({
  dispatch,
  getState
}) => next => action => {
  if (action.type === RouteActionTypes.RouteChange) {
    const routeState = action.payload[0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach(moduleName => {
      const routeParams = rootRouteParams[moduleName];

      if (routeParams) {
        var _rootState$moduleName;

        if ((_rootState$moduleName = rootState[moduleName]) !== null && _rootState$moduleName !== void 0 && _rootState$moduleName.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        }
      }
    });
  }

  return next(action);
};
const routeReducer = (state, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return mergeState(state, action.payload[0]);
  }

  return state;
};
class BaseRouter {
  constructor(initUrl, nativeRouter, locationTransform) {
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "nativeLocation", void 0);

    _defineProperty(this, "url", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    const location = this.urlToToLocation(initUrl);
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    const key = this._createKey();

    this.history = new History();
    const routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key
    });
    this.routeState = routeState;
    this.history.relaunch(location, key);
    this.nativeRouter.relaunch(this.url, key, false);
  }

  getRouteState() {
    return this.routeState;
  }

  getNativeLocation() {
    return this.nativeLocation;
  }

  getUrl() {
    return this.url;
  }

  setStore(_store) {
    this.store = _store;
  }

  getCurKey() {
    return this.routeState.key;
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  payloadToLocation(data) {
    const {
      pagename
    } = data;
    const extendParams = data.extendParams === true ? this.routeState.params : data.extendParams;
    const params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
    return {
      pagename: pagename || this.routeState.pagename || '/',
      params
    };
  }

  urlToToLocation(url) {
    const nativeLocation = this.urlToNativeLocation(url);
    return this.locationTransform.in(nativeLocation);
  }

  urlToNativeLocation(url) {
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

    const [path, search = '', hash = ''] = arr;
    let pathname = path;

    if (!pathname.startsWith('/')) {
      pathname = `/${pathname}`;
    }

    pathname = pathname.replace(/\/*$/, '') || '/';
    return {
      pathname,
      search,
      hash
    };
  }

  nativeLocationToUrl(nativeLocation) {
    const {
      pathname,
      search,
      hash
    } = nativeLocation;
    return [pathname && (pathname.replace(/\/*$/, '') || '/'), search && `?${search}`, hash && `#${hash}`].join('');
  }

  locationToUrl(location) {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToUrl(nativeLocation);
  }

  async relaunch(data, internal) {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }

    this.nativeRouter.relaunch(this.url, key, !!internal);
    return routeState;
  }

  async push(data, internal) {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'PUSH',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }

    this.nativeRouter.push(this.url, key, !!internal);
    return routeState;
  }

  async replace(data, internal) {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'REPLACE',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }

    this.nativeRouter.replace(this.url, key, !!internal);
    return routeState;
  }

  async back(n = 1, internal) {
    const stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);

    if (!stack) {
      return Promise.reject(1);
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = Object.assign({}, location, {
      action: 'BACK',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }

    this.nativeRouter.back(this.url, n, key, !!internal);
    return routeState;
  }

  async pop(n = 1, internal) {
    const stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);

    if (!stack) {
      return Promise.reject(1);
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = Object.assign({}, location, {
      action: 'POP',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
    }

    this.nativeRouter.pop(this.url, n, key, !!internal);
    return routeState;
  }

}

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

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
} // About 1.5x faster than the two-arg version of Array#splice()


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
} // This implementation is based heavily on node's url.parse


function resolvePathname(to, from) {
  if (from === undefined) from = '';
  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];
  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';
  var hasTrailingSlash;

  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;

  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');
  if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
  var result = fromParts.join('/');
  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
  return result;
}

var isProduction = process.env.NODE_ENV === 'production';

function warning$1(condition, message) {
  if (!isProduction) {
    if (condition) {
      return;
    }

    var text = "Warning: " + message;

    if (typeof console !== 'undefined') {
      console.warn(text);
    }

    try {
      throw Error(text);
    } catch (x) {}
  }
}

var isProduction$1 = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';

function invariant(condition, message) {
  if (condition) {
    return;
  }

  if (isProduction$1) {
    throw new Error(prefix);
  }

  throw new Error(prefix + ": " + (message || ''));
}

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
}

function hasBasename(path, prefix) {
  return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && '/?#'.indexOf(path.charAt(prefix.length)) !== -1;
}

function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}

function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';
  var hashIndex = pathname.indexOf('#');

  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');

  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
}

function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;
  var path = pathname || '/';
  if (search && search !== '?') path += search.charAt(0) === '?' ? search : "?" + search;
  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : "#" + hash;
  return path;
}

function createLocation(path, state, key, currentLocation) {
  var location;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);
    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
}

function createTransitionManager() {
  var prompt = null;

  function setPrompt(nextPrompt) {
    process.env.NODE_ENV !== "production" ? warning$1(prompt == null, 'A history supports only one prompt at a time') : void 0;
    prompt = nextPrompt;
    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  }

  function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          process.env.NODE_ENV !== "production" ? warning$1(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  }

  var listeners = [];

  function appendListener(fn) {
    var isActive = true;

    function listener() {
      if (isActive) fn.apply(void 0, arguments);
    }

    listeners.push(listener);
    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function notifyListeners() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(void 0, args);
    });
  }

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
}

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

function getConfirmation(message, callback) {
  callback(window.confirm(message)); // eslint-disable-line no-alert
}
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */


function supportsHistory() {
  var ua = window.navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
  return window.history && 'pushState' in window.history;
}
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */


function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */


function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
}
/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */


function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
}

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
}
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */


function createBrowserHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Browser history needs a DOM') : invariant(false) : void 0;
  var globalHistory = window.history;
  var canUseHistory = supportsHistory();
  var needsHashChangeListener = !supportsPopStateOnHashChange();
  var _props = props,
      _props$forceRefresh = _props.forceRefresh,
      forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

  function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;
    var path = pathname + search + hash;
    process.env.NODE_ENV !== "production" ? warning$1(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path, state, key);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if (isExtraneousPopstateEvent(event)) return;
    handlePop(getDOMLocation(event.state));
  }

  function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  }

  var forceNextPop = false;

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allKeys.indexOf(fromLocation.key);
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  }

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key]; // Public interface

  function createHref(location) {
    return basename + createPath(location);
  }

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.pushState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex + 1);
          nextKeys.push(location.key);
          allKeys = nextKeys;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.replaceState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
        window.location.replace(href);
      }
    });
  }

  function go(n) {
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

var HashChangeEvent$1 = 'hashchange';
var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: stripLeadingSlash,
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
};

function stripHash(url) {
  var hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
}

function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
}

function pushHashPath(path) {
  window.location.hash = path;
}

function replaceHashPath(path) {
  window.location.replace(stripHash(window.location.href) + '#' + path);
}

function createHashHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Hash history needs a DOM') : invariant(false) : void 0;
  var globalHistory = window.history;
  var canGoWithoutReload = supportsGoWithoutReloadUsingHash();
  var _props = props,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$hashType = _props.hashType,
      hashType = _props$hashType === void 0 ? 'slash' : _props$hashType;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
  var _HashPathCoders$hashT = HashPathCoders[hashType],
      encodePath = _HashPathCoders$hashT.encodePath,
      decodePath = _HashPathCoders$hashT.decodePath;

  function getDOMLocation() {
    var path = decodePath(getHashPath());
    process.env.NODE_ENV !== "production" ? warning$1(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  var forceNextPop = false;
  var ignorePath = null;

  function locationsAreEqual$$1(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }

  function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;
      if (!forceNextPop && locationsAreEqual$$1(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === createPath(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;
      handlePop(location);
    }
  }

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf(createPath(toLocation));
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  } // Ensure the hash is encoded properly before doing anything else.


  var path = getHashPath();
  var encodedPath = encodePath(path);
  if (path !== encodedPath) replaceHashPath(encodedPath);
  var initialLocation = getDOMLocation();
  var allPaths = [createPath(initialLocation)]; // Public interface

  function createHref(location) {
    var baseTag = document.querySelector('base');
    var href = '';

    if (baseTag && baseTag.getAttribute('href')) {
      href = stripHash(window.location.href);
    }

    return href + '#' + encodePath(basename + createPath(location));
  }

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Hash history cannot push state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);
        var prevIndex = allPaths.lastIndexOf(createPath(history.location));
        var nextPaths = allPaths.slice(0, prevIndex + 1);
        nextPaths.push(path);
        allPaths = nextPaths;
        setState({
          action: action,
          location: location
        });
      } else {
        process.env.NODE_ENV !== "production" ? warning$1(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : void 0;
        setState();
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Hash history cannot replace state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf(createPath(history.location));
      if (prevIndex !== -1) allPaths[prevIndex] = path;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    process.env.NODE_ENV !== "production" ? warning$1(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(HashChangeEvent$1, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(HashChangeEvent$1, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

function clamp(n, lowerBound, upperBound) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}
/**
 * Creates a history object that stores locations in memory.
 */


function createMemoryHistory(props) {
  if (props === void 0) {
    props = {};
  }

  var _props = props,
      getUserConfirmation = _props.getUserConfirmation,
      _props$initialEntries = _props.initialEntries,
      initialEntries = _props$initialEntries === void 0 ? ['/'] : _props$initialEntries,
      _props$initialIndex = _props.initialIndex,
      initialIndex = _props$initialIndex === void 0 ? 0 : _props$initialIndex,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = history.entries.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var index = clamp(initialIndex, 0, initialEntries.length - 1);
  var entries = initialEntries.map(function (entry) {
    return typeof entry === 'string' ? createLocation(entry, undefined, createKey()) : createLocation(entry, undefined, entry.key || createKey());
  }); // Public interface

  var createHref = createPath;

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var prevIndex = history.index;
      var nextIndex = prevIndex + 1;
      var nextEntries = history.entries.slice(0);

      if (nextEntries.length > nextIndex) {
        nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
      } else {
        nextEntries.push(location);
      }

      setState({
        action: action,
        location: location,
        index: nextIndex,
        entries: nextEntries
      });
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      history.entries[history.index] = location;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
    var action = 'POP';
    var location = history.entries[nextIndex];
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (ok) {
        setState({
          action: action,
          location: location,
          index: nextIndex
        });
      } else {
        // Mimic the behavior of DOM histories by
        // causing a render after a cancelled POP.
        setState();
      }
    });
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  function canGo(n) {
    var nextIndex = history.index + n;
    return nextIndex >= 0 && nextIndex < history.entries.length;
  }

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    return transitionManager.setPrompt(prompt);
  }

  function listen(listener) {
    return transitionManager.appendListener(listener);
  }

  var history = {
    length: entries.length,
    action: 'POP',
    location: entries[index],
    index: index,
    entries: entries,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    canGo: canGo,
    block: block,
    listen: listen
  };
  return history;
}

class BrowserNativeRouter {
  constructor(createHistory) {
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

  getUrl() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return [pathname, search, hash].join('');
  }

  block(blocker) {
    return this.history.block((location, action) => {
      const {
        pathname = '',
        search = '',
        hash = ''
      } = location;
      return blocker([pathname, search, hash].join(''), this.getKey(location), action);
    });
  }

  getKey(location) {
    return location.state || '';
  }

  push(url, key, internal) {
    !internal && this.history.push(url, key);
  }

  replace(url, key, internal) {
    !internal && this.history.replace(url, key);
  }

  relaunch(url, key, internal) {
    !internal && this.history.push(url, key);
  }

  back(url, n, key, internal) {
    !internal && this.history.go(-n);
  }

  pop(url, n, key, internal) {
    !internal && this.history.push(url, key);
  }

  refresh() {
    this.history.go(0);
  }

}
class Router extends BaseRouter {
  constructor(browserNativeRouter, locationTransform) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_timer", 0);

    _defineProperty(this, "nativeRouter", void 0);

    this.nativeRouter = browserNativeRouter;
    this._unlistenHistory = browserNativeRouter.block((url, key, action) => {
      if (key !== this.getCurKey()) {
        let callback;
        let index = 0;

        if (action === 'POP') {
          index = this.history.getActionIndex(key);
        }

        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.back(index);
          };
        } else if (action === 'REPLACE') {
          callback = () => {
            this._timer = 0;
            this.replace(url);
          };
        } else if (action === 'PUSH') {
          callback = () => {
            this._timer = 0;
            this.push(url);
          };
        } else {
          callback = () => {
            this._timer = 0;
            this.relaunch(url);
          };
        }

        if (callback && !this._timer) {
          this._timer = env.setTimeout(callback, 50);
        }

        return false;
      }

      return undefined;
    });
  }

  destroy() {
    this._unlistenHistory();
  }

}
function createRouter(createHistory, locationTransform) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router(browserNativeRouter, locationTransform);
  return router;
}

const loadViewDefaultOptions = {
  LoadViewOnError: React.createElement("div", null, "error"),
  LoadViewOnLoading: React.createElement("div", null)
};
function setLoadViewOptions({
  LoadViewOnError,
  LoadViewOnLoading
}) {
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}
const loadView = (moduleName, viewName, options) => {
  const {
    OnLoading,
    OnError
  } = options || {};
  let active = true;

  const Loader = function ViewLoader(props, ref) {
    const OnErrorComponent = OnError || loadViewDefaultOptions.LoadViewOnError;
    const OnLoadingComponent = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;
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
        }).catch(e => {
          active && setView({
            Component: () => OnErrorComponent
          });
          env.console.error(e);
        });
        return null;
      }

      return {
        Component: moduleViewResult
      };
    });
    return view ? React.createElement(view.Component, _extends({}, props, {
      ref: ref
    })) : OnLoadingComponent;
  };

  const Component = React.forwardRef(Loader);
  return Component;
};

const appExports = {
  loadView,
  getActions: undefined,
  state: undefined,
  store: undefined,
  router: undefined,
  request: undefined,
  response: undefined
};
function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
function exportApp() {
  const modules = getRootModuleAPI();

  appExports.getActions = (...args) => {
    return args.reduce((prev, moduleName) => {
      prev[moduleName] = modules[moduleName].actions;
      return prev;
    }, {});
  };

  return {
    App: appExports,
    Modules: modules,
    Actions: {},
    Pagenames: routeConfig.pagenames
  };
}

const Component = ({
  children
}) => {
  let title = '';
  React.Children.forEach(children, child => {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });

  if (!isServer()) {
    useEffect(() => {
      if (title) {
        document.title = title;
      }
    }, [title]);
    return null;
  }

  return React.createElement("head", null, children);
};

const DocumentHead = React.memo(Component);

const Component$1 = ({
  children,
  elseView
}) => {
  const arr = [];
  React.Children.forEach(children, item => {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return React.createElement(React.Fragment, null, arr);
  }

  return React.createElement(React.Fragment, null, elseView);
};

const Else = React.memo(Component$1);

const Component$2 = ({
  children,
  elseView
}) => {
  const arr = [];
  React.Children.forEach(children, item => {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return React.createElement(React.Fragment, null, arr[0]);
  }

  return React.createElement(React.Fragment, null, elseView);
};

const Switch = React.memo(Component$2);

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
          replace ? appExports.router.replace(rest.href) : appExports.router.push(rest.href);
        }
    }
  });
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});

let SSRKey = 'meduxInitStore';
function setConfig$1(conf) {
  setConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
  conf.SSRKey && (SSRKey = conf.SSRKey);
}
const exportModule$1 = exportModule;
function buildApp(moduleGetter, {
  appModuleName = 'app',
  appViewName = 'main',
  historyType = 'Browser',
  locationTransform,
  storeOptions = {},
  container = 'root'
}) {
  const router = createRouter(historyType, locationTransform);
  appExports.router = router;
  const {
    middlewares = [],
    reducers = {},
    initData = {}
  } = storeOptions;
  middlewares.unshift(routeMiddleware);
  reducers.route = routeReducer;
  const ssrData = env[SSRKey];
  initData.route = router.getRouteState();
  return renderApp((store, AppView) => {
    const reRender = View => {
      const panel = typeof container === 'string' ? env.document.getElementById(container) : container;
      unmountComponentAtNode(panel);
      const renderFun = ssrData ? hydrate : render;
      renderFun(React.createElement(View, {
        store: store
      }), panel);
    };

    reRender(AppView);
    return reRender;
  }, moduleGetter, appModuleName, appViewName, Object.assign({}, storeOptions, {
    middlewares,
    reducers,
    initData: mergeState(initData, ssrData)
  }), store => {
    router.setStore(store);
    appExports.store = store;
    Object.defineProperty(appExports, 'state', {
      get: () => {
        return store.getState();
      }
    });
  });
}
let SSRTPL;
function setSsrHtmlTpl(tpl) {
  SSRTPL = tpl;
}
function buildSSR(moduleGetter, {
  request,
  response,
  appModuleName = 'app',
  appViewName = 'main',
  locationTransform,
  storeOptions = {},
  container = 'root'
}) {
  if (!SSRTPL) {
    SSRTPL = Buffer.from('process.env.MEDUX_ENV_SSRTPL', 'base64').toString();
  }

  appExports.request = request;
  appExports.response = response;
  const router = createRouter(request.url, locationTransform);
  appExports.router = router;
  const {
    initData = {}
  } = storeOptions;
  initData.route = router.getRouteState();
  return renderSSR((store, AppView) => {
    const data = store.getState();
    return {
      store,
      data,
      html: require('react-dom/server').renderToString(React.createElement(AppView, {
        store: store
      }))
    };
  }, moduleGetter, appModuleName, appViewName, Object.assign({}, storeOptions, {
    initData
  }), store => {
    router.setStore(store);
    appExports.store = store;
    Object.defineProperty(appExports, 'state', {
      get: () => {
        return store.getState();
      }
    });
  }).then(({
    html,
    data
  }) => {
    const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${container}['"][^<>]*>`, 'm'));

    if (match) {
      const pageHead = html.split(/<head>|<\/head>/, 3);
      html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
      return SSRTPL.replace('</head>', `${pageHead[1] || ''}\r\n<script>window.${SSRKey} = ${JSON.stringify(data)};</script>\r\n</head>`).replace(match[0], match[0] + html);
    }

    return html;
  });
}

export { ActionTypes, RouteModuleHandlers as BaseModuleHandlers, DocumentHead, Else, Link, LoadingState, Switch, buildApp, buildSSR, clientSide, createLocationTransform, createPathnameTransform, deepMerge, deepMergeState, delayPromise, effect, errorAction, exportApp, exportModule$1 as exportModule, isProcessedError, isServer, logger, modelHotReplacement, patchActions, reducer, serverSide, setConfig$1 as setConfig, setLoading, setLoadingDepthTime, setProcessedError, setSsrHtmlTpl, viewHotReplacement };
