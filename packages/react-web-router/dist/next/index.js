import React, { Component as Component$3, useEffect } from 'react';
import { unmountComponentAtNode, hydrate, render } from 'react-dom';

let root;

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

const env = root;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

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

let LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));

class SingleDispatcher {
  constructor() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
  }

  addListener(callback) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(id => {
      listenerMap[id](data);
    });
  }

}
class TaskCounter extends SingleDispatcher {
  constructor(deferSecond) {
    super();

    _defineProperty(this, "list", []);

    _defineProperty(this, "ctimer", 0);

    this.deferSecond = deferSecond;
  }

  addItem(promise, note = '') {
    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({
        promise,
        note
      });
      promise.finally(() => this.completeItem(promise));

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(LoadingState.Start);
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;

          if (this.list.length > 0) {
            this.dispatch(LoadingState.Depth);
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
          this.ctimer = 0;
        }

        this.dispatch(LoadingState.Stop);
      }
    }

    return this;
  }

}
function isPlainObject$1(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];

    if (isPlainObject$1(val)) {
      if (isPlainObject$1(src)) {
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
  if (!isPlainObject$1(target)) {
    target = {};
  }

  args = args.filter(item => isPlainObject$1(item) && Object.keys(item).length);

  if (args.length < 1) {
    return target;
  }

  args.forEach(function (inject, index) {
    if (isPlainObject$1(inject)) {
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

        if (isPlainObject$1(val)) {
          if (isPlainObject$1(src)) {
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
function warn(str) {
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}
function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
function isServer() {
  return env.isServer;
}
function serverSide(callback) {
  if (env.isServer) {
    return callback();
  }

  return undefined;
}
function clientSide(callback) {
  if (!env.isServer) {
    return callback();
  }

  return undefined;
}

const config = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2
};
function setConfig$1(_config) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DepthTimeOnLoading !== undefined && (config.DepthTimeOnLoading = _config.DepthTimeOnLoading);
}
const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
  Error: `medux${config.NSP}Error`
};
const MetaData$1 = {
  injectedModules: {},
  reducersMap: {},
  effectsMap: {}
};

function transformAction(actionName, handler, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    warn(`Action duplicate or conflict : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function injectActions(moduleName, handlers) {
  const injectedModules = MetaData$1.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(config.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp(`^this[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);

          if (arr[1]) {
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData$1.effectsMap : MetaData$1.reducersMap);
          } else {
            transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData$1.effectsMap : MetaData$1.reducersMap);
          }
        });
      }
    }
  }
}
const loadings = {};
function setLoading(item, moduleName = MetaData$1.appModuleName, groupName = 'global') {
  if (env.isServer) {
    return item;
  }

  const key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(config.DepthTimeOnLoading);
    loadings[key].addListener(loadingState => {
      const store = MetaData$1.clientStore;

      if (store) {
        const actions = MetaData$1.facadeMap[moduleName].actions[ActionTypes.MLoading];
        const action = actions({
          [groupName]: loadingState
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
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData$1.appModuleName || '';
  }

  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      const before = (curAction, moduleName, promiseResult) => {
        if (!env.isServer) {
          if (loadingForModuleName === '') {
            loadingForModuleName = MetaData$1.appModuleName;
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
function moduleReInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MReInit}`,
    payload: [initState]
  };
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
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

const exportModule$1 = (moduleName, ModuleHandles, views) => {
  const model = store => {
    if (!store.injectedModules[moduleName]) {
      const moduleHandles = new ModuleHandles();
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      moduleHandles.actions = MetaData$1.facadeMap[moduleName].actions;
      injectActions(moduleName, moduleHandles);
      const initState = moduleHandles.initState;
      const preModuleState = store.getState(moduleName);

      if (preModuleState) {
        return store.dispatch(moduleReInitAction(moduleName, initState));
      }

      return store.dispatch(moduleInitAction(moduleName, initState));
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
function cacheModule(module) {
  const moduleName = module.default.moduleName;
  const moduleGetter = MetaData$1.moduleGetter;
  let fn = moduleGetter[moduleName];

  if (fn.__module__ === module) {
    return fn;
  }

  fn = () => module;

  fn.__module__ = module;
  moduleGetter[moduleName] = fn;
  return fn;
}
function getModuleByName(moduleName) {
  const result = MetaData$1.moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(module => {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}
function getView(moduleName, viewName) {
  const callback = module => {
    const view = module.default.views[viewName];

    if (env.isServer) {
      return view;
    }

    module.default.model(MetaData$1.clientStore);
    return view;
  };

  const moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }

  return callback(moduleOrPromise);
}

function _loadModel(moduleName, controller) {
  const moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => module.default.model(controller));
  }

  return moduleOrPromise.default.model(controller);
}
let CoreModuleHandlers = _decorate(null, function (_initialize) {
  class CoreModuleHandlers {
    constructor(initState) {
      _initialize(this);

      this.initState = initState;
    }

  }

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: void 0
    }, {
      kind: "field",
      key: "store",
      value: void 0
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
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.store.getCurrentState();
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.store.getCurrentState(this.moduleName);
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

function clearHandlers(moduleName, actionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[moduleName];
    }
  }
}

function modelHotReplacement(moduleName, ModuleHandles) {
  const store = MetaData$1.clientStore;

  if (store.injectedModules[moduleName]) {
    clearHandlers(moduleName, MetaData$1.reducersMap);
    clearHandlers(moduleName, MetaData$1.effectsMap);
    const moduleHandles = new ModuleHandles();
    store.injectedModules[moduleName] = moduleHandles;
    moduleHandles.moduleName = moduleName;
    moduleHandles.store = store;
    moduleHandles.actions = MetaData$1.facadeMap[moduleName].actions;
    injectActions(moduleName, moduleHandles);
    env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
  }
}
function getRootModuleAPI(data) {
  if (!MetaData$1.facadeMap) {
    if (data) {
      MetaData$1.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
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
      MetaData$1.facadeMap = new Proxy({}, {
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

  return MetaData$1.facadeMap;
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
function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function enhanceStore(baseStore, middlewares) {
  const store = baseStore;
  const _getState = baseStore.getState;

  const getState = moduleName => {
    const state = _getState();

    return moduleName ? state[moduleName] : state;
  };

  store.getState = getState;
  const injectedModules = {};
  store.injectedModules = injectedModules;
  const currentData = {
    actionName: '',
    prevState: {}
  };
  const update = baseStore.update;

  store.getCurrentActionName = () => currentData.actionName;

  store.getCurrentState = moduleName => {
    const state = currentData.prevState;
    return moduleName ? state[moduleName] : state;
  };

  let dispatch = action => {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  const middlewareAPI = {
    getState,
    dispatch: action => dispatch(action)
  };

  const preMiddleware = () => next => action => {
    if (action.type === ActionTypes.Error) {
      const error = getActionData(action)[0];
      setProcessedError(error, true);
    }

    const [moduleName, actionName] = action.type.split(config.NSP);

    if (env.isServer && actionName === ActionTypes.MLoading) {
      return undefined;
    }

    if (moduleName && actionName && MetaData$1.moduleGetter[moduleName]) {
      if (!injectedModules[moduleName]) {
        const result = _loadModel(moduleName, store);

        if (isPromise(result)) {
          return result.then(() => next(action));
        }
      }
    }

    return next(action);
  };

  function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    const effectResult = handler.apply(modelInstance, actionData);
    const decorators = handler.__decorators__;

    if (decorators) {
      const results = [];
      decorators.forEach((decorator, index) => {
        results[index] = decorator[0](action, moduleName, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(reslove => {
      if (decorators) {
        const results = handler.__decoratorResults__ || [];
        decorators.forEach((decorator, index) => {
          if (decorator[1]) {
            decorator[1]('Resolved', results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, error => {
      if (decorators) {
        const results = handler.__decoratorResults__ || [];
        decorators.forEach((decorator, index) => {
          if (decorator[1]) {
            decorator[1]('Rejected', results[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return dispatch(errorAction(setProcessedError(error, false)));
      }
    });
  }

  function respondHandler(action, isReducer, prevData) {
    const handlersMap = isReducer ? MetaData$1.reducersMap : MetaData$1.effectsMap;
    const actionName = action.type;
    const [actionModuleName] = actionName.split(config.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionName.replace(new RegExp(`[^${config.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = { ...commonHandlers,
      ...universalHandlers
    };
    const handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      const orderList = [];
      handlerModuleNames.forEach(moduleName => {
        if (moduleName === MetaData$1.appModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      if (action.priority) {
        orderList.unshift(...action.priority);
      }

      const implemented = {};
      const actionData = getActionData(action);

      if (isReducer) {
        Object.assign(currentData, prevData);
        const newState = {};
        orderList.forEach(moduleName => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            newState[moduleName] = handler.apply(modelInstance, actionData);
          }
        });
        update(actionName, newState, actionData);
      } else {
        const result = [];
        orderList.forEach(moduleName => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            Object.assign(currentData, prevData);
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }

    return undefined;
  }

  function _dispatch(action) {
    const prevData = {
      actionName: action.type,
      prevState: getState()
    };
    respondHandler(action, true, prevData);
    return respondHandler(action, false, prevData);
  }

  const arr = middlewares ? [preMiddleware, ...middlewares] : [preMiddleware];
  const chain = arr.map(middleware => middleware(middlewareAPI));
  dispatch = compose(...chain)(_dispatch);
  store.dispatch = dispatch;
  return store;
}

let reRender = () => undefined;

let reRenderTimer = 0;
let appView = null;
function viewHotReplacement(moduleName, views) {
  const module = MetaData$1.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;
    env.console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = MetaData$1.moduleGetter[MetaData$1.appModuleName]().default.views[MetaData$1.appViewName];

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

const defFun = () => undefined;

function renderApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName = 'app', appViewName = 'main') {
  MetaData$1.appModuleName = appModuleName;
  MetaData$1.appViewName = appViewName;

  if (!MetaData$1.moduleGetter) {
    MetaData$1.moduleGetter = moduleGetter;
  }

  const store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return {
    store,

    async beforeRender() {
      if (reRenderTimer) {
        env.clearTimeout(reRenderTimer);
        reRenderTimer = 0;
      }

      MetaData$1.clientStore = store;
      await _loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map(moduleName => _loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName);
      return {
        appView: appModule.default.views[appViewName],

        setReRender(hotRender) {
          reRender = hotRender;
        }

      };
    }

  };
}
function ssrApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName = 'app', appViewName = 'main') {
  MetaData$1.appModuleName = appModuleName;
  MetaData$1.appViewName = appViewName;

  if (!MetaData$1.moduleGetter) {
    MetaData$1.moduleGetter = moduleGetter;
  }

  const store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return {
    store,

    async beforeRender() {
      await _loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map(moduleName => _loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName);
      store.dispatch = defFun;
      return {
        appView: appModule.default.views[appViewName]
      };
    }

  };
}

env.encodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};

env.decodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};

const routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  defaultParams: {},
  disableNativeRoute: false,
  indexUrl: ''
};
function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.pagenames && (routeConfig.pagenames = conf.pagenames);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
}

function splitQuery(query) {
  return (query || '').split('&').reduce((params, str) => {
    const sections = str.split('=');

    if (sections.length > 1) {
      const [key, ...arr] = sections;

      if (!params) {
        params = {};
      }

      params[key] = decodeURIComponent(arr.join('='));
    }

    return params;
  }, undefined);
}

function joinQuery(params) {
  return Object.keys(params || {}).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
}

function nativeUrlToNativeLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      searchData: undefined,
      hashData: undefined
    };
  }

  const arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  const [path, search, hash] = arr;
  return {
    pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
    searchData: splitQuery(search),
    hashData: splitQuery(hash)
  };
}
function nativeLocationToNativeUrl({
  pathname,
  searchData,
  hashData
}) {
  const search = joinQuery(searchData);
  const hash = joinQuery(hashData);
  return [`/${pathname.replace(/^\/+|\/+$/g, '')}`, search && `?${search}`, hash && `#${hash}`].join('');
}
function locationToUri(location, key) {
  const {
    pagename,
    params
  } = location;
  const query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join('|'),
    pagename,
    query,
    key
  };
}

function splitUri(...args) {
  const [uri = '', name] = args;
  const [key, pagename, ...others] = uri.split('|');
  const arr = [key, pagename, others.join('|')];
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

function isHistoryRecord(data) {
  return data['uri'];
}

class History {
  constructor(data, parent) {
    _defineProperty(this, "curRecord", void 0);

    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);

    this.parent = parent;

    if (isHistoryRecord(data)) {
      this.curRecord = data;
    } else {
      const {
        uri,
        pagename,
        query
      } = locationToUri(data.location, data.key);
      this.curRecord = {
        uri,
        pagename,
        query,
        key: data.key,
        sub: new History({
          uri,
          pagename,
          query,
          key: data.key
        }, this)
      };
    }
  }

  getLength() {
    return this.actions.length;
  }

  getRecord(keyOrIndex) {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.actions.length - 1;
      }

      return this.actions[keyOrIndex];
    }

    return this.actions.find(item => item.key === keyOrIndex);
  }

  findIndex(key) {
    return this.actions.findIndex(item => item.key === key);
  }

  getCurrentInternalHistory() {
    return this.curRecord.sub;
  }

  getStack() {
    return this.actions;
  }

  getUriStack() {
    return this.actions.map(item => item.uri);
  }

  getPageStack() {
    return this.pages;
  }

  push(location, key) {
    var _pages$;

    const historyRecord = this.curRecord;
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    this.curRecord = {
      uri,
      pagename,
      query,
      key,
      sub: new History({
        uri,
        pagename,
        query,
        key
      }, this)
    };
    const pages = [...this.pages];
    const actions = [...this.actions];
    const actionsMax = routeConfig.actionMaxHistory;
    const pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(historyRecord);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) == null ? void 0 : _pages$.uri, 'pagename') !== pagename) {
      pages.unshift(historyRecord);

      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = historyRecord;
    }

    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }
  }

  replace(location, key) {
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    this.curRecord = {
      uri,
      pagename,
      query,
      key,
      sub: new History({
        uri,
        pagename,
        query,
        key
      }, this)
    };

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }
  }

  relaunch(location, key) {
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    this.curRecord = {
      uri,
      pagename,
      query,
      key,
      sub: new History({
        uri,
        pagename,
        query,
        key
      }, this)
    };
    this.actions = [];
    this.pages = [];

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }
  }

  back(delta) {
    var _actions$;

    const historyRecord = this.getRecord(delta - 1);

    if (!historyRecord) {
      return false;
    }

    this.curRecord = historyRecord;
    const {
      uri,
      pagename,
      query
    } = historyRecord;
    const pages = [...this.pages];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, delta);
    const arr = deleteActions.reduce((pre, curStack) => {
      const ctag = splitUri(curStack.uri, 'pagename');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[0]) == null ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length);
    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }

    return true;
  }

}

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __extendDefault(target, def) {
  const clone = {};
  Object.keys(def).forEach(function (key) {
    if (target[key] === undefined) {
      clone[key] = def[key];
    } else {
      const tval = target[key];
      const dval = def[key];

      if (isPlainObject(tval) && isPlainObject(dval) && tval !== dval) {
        clone[key] = __extendDefault(tval, dval);
      } else {
        clone[key] = tval;
      }
    }
  });
  return clone;
}

function extendDefault(target, def) {
  if (!isPlainObject(target)) {
    target = {};
  }

  if (!isPlainObject(def)) {
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
      if (typeof value === typeof defaultValue && isPlainObject(value)) {
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
  if (!isPlainObject(data)) {
    return {};
  }

  if (!isPlainObject(def)) {
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
    } else if (isPlainObject(value)) {
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
  if (!isPlainObject(data)) {
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

function assignDefaultData(data) {
  const def = routeConfig.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function dataIsNativeLocation$1(data) {
  return data['pathname'];
}

function createLocationTransform(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename = '/404', paramsKey = '_') {
  routeConfig.defaultParams = defaultParams;
  let pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = pagenames.reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr) {
    return arr.map(item => {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  return {
    in(data) {
      let path;

      if (dataIsNativeLocation$1(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }

      path = `/${path}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find(name => path.startsWith(name));
      let params;

      if (pagename) {
        if (dataIsNativeLocation$1(data)) {
          const searchParams = data.searchData && data.searchData[paramsKey] ? JSON.parse(data.searchData[paramsKey]) : undefined;
          const hashParams = data.hashData && data.hashData[paramsKey] ? JSON.parse(data.hashData[paramsKey]) : undefined;
          const pathArgs = path.replace(pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
          const pathParams = pagenameMap[pagename].argsToParams(pathArgs);
          params = deepMerge(pathParams, searchParams, hashParams);
        } else {
          const pathParams = pagenameMap[pagename].argsToParams([]);
          params = deepMerge(pathParams, data.params);
        }
      } else {
        pagename = `${notfoundPagename}/`;
        params = pagenameMap[pagename] ? pagenameMap[pagename].argsToParams([path.replace(/\/$/, '')]) : {};
      }

      return {
        pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`,
        params: assignDefaultData(params)
      };
    },

    out(meduxLocation) {
      let params = excludeDefault(meduxLocation.params, defaultParams, true);
      const pagename = `/${meduxLocation.pagename}/`.replace(/^\/+|\/+$/g, '/');
      let pathParams;
      let pathname;

      if (pagenameMap[pagename]) {
        const pathArgs = toStringArgs(pagenameMap[pagename].paramsToArgs(params));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
        pathname = pagename + pathArgs.map(item => item && encodeURIComponent(item)).join('/').replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }

      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams);
      const nativeLocation = {
        pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`,
        searchData: result[0] ? {
          [paramsKey]: JSON.stringify(result[0])
        } : undefined,
        hashData: result[1] ? {
          [paramsKey]: JSON.stringify(result[1])
        } : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }

  };
}

let ModuleWithRouteHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  class ModuleWithRouteHandlers extends _CoreModuleHandlers {
    constructor(...args) {
      super(...args);

      _initialize(this);
    }

  }

  return {
    F: ModuleWithRouteHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        const routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMerge({}, initState, routeParams) : initState;
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
  RouteChange: `route${config.NSP}RouteChange`,
  TestRouteChange: `route${config.NSP}TestRouteChange`
};
function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
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
    const result = next(action);
    const routeState = action.payload[0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach(moduleName => {
      const routeParams = rootRouteParams[moduleName];

      if (routeParams) {
        var _rootState$moduleName;

        if ((_rootState$moduleName = rootState[moduleName]) != null && _rootState$moduleName.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        }
      }
    });
    return result;
  }

  return next(action);
};

class RouteModuleHandlers {
  constructor() {
    _defineProperty(this, "initState", void 0);

    _defineProperty(this, "moduleName", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "actions", void 0);
  }

  get state() {
    return this.store.getState(this.moduleName);
  }

  RouteChange(routeState) {
    return mergeState(this.state, routeState);
  }

}

function createRouteModule(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename = '/404', paramsKey = '_') {
  const handlers = RouteModuleHandlers;
  const locationTransform = createLocationTransform(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  const result = exportModule$1('route', handlers, {});
  return {
    default: result,
    locationTransform
  };
}

function dataIsNativeLocation(data) {
  return data['pathname'];
}

class BaseNativeRouter {
  constructor() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "router", null);
  }

  onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  }

  setRouter(router) {
    this.router = router;
  }

  execute(method, getNativeData, ...args) {
    return new Promise((resolve, reject) => {
      const task = {
        resolve,
        reject,
        nativeData: undefined
      };
      this.curTask = task;
      const result = this[method](() => {
        const nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }, ...args);

      if (!result) {
        resolve(undefined);
        this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(e => {
          reject(e);
          this.curTask = undefined;
        });
      }
    });
  }

}
class BaseRouter {
  constructor(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "meduxUrl", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "_lid", 0);

    _defineProperty(this, "listenerMap", {});

    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    const location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);

    const key = this._createKey();

    const routeState = { ...location,
      action: 'RELAUNCH',
      key
    };
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);

    if (!routeConfig.indexUrl) {
      setRouteConfig({
        indexUrl: this.meduxUrl
      });
    }

    this._nativeData = undefined;
    this.history = new History({
      location,
      key
    });
  }

  addListener(callback) {
    this._lid++;
    const id = `${this._lid}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    const arr = Object.keys(listenerMap).map(id => listenerMap[id](data));
    return Promise.all(arr);
  }

  getRouteState() {
    return this.routeState;
  }

  getPagename() {
    return this.routeState.pagename;
  }

  getParams() {
    return this.routeState.params;
  }

  getMeduxUrl() {
    return this.meduxUrl;
  }

  getNativeLocation() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation,
        nativeUrl
      };
    }

    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation,
        nativeUrl
      };
    }

    return this._nativeData.nativeUrl;
  }

  setStore(_store) {
    this.store = _store;
  }

  getCurKey() {
    return this.routeState.key;
  }

  findHistoryIndexByKey(key) {
    return this.history.findIndex(key);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  nativeUrlToNativeLocation(url) {
    return nativeUrlToNativeLocation(url);
  }

  nativeLocationToLocation(nativeLocation) {
    let location;

    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  }

  nativeUrlToLocation(nativeUrl) {
    return this.nativeLocationToLocation(this.nativeUrlToNativeLocation(nativeUrl));
  }

  urlToLocation(url) {
    const [pathname, ...others] = url.split('?');
    const query = others.join('?');
    let location;

    try {
      if (query.startsWith('{')) {
        const data = JSON.parse(query);
        location = this.locationTransform.in({
          pagename: pathname,
          params: data
        });
      } else {
        const nativeLocation = this.nativeUrlToNativeLocation(url);
        location = this.locationTransform.in(nativeLocation);
      }
    } catch (error) {
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  }

  nativeLocationToNativeUrl(nativeLocation) {
    return nativeLocationToNativeUrl(nativeLocation);
  }

  locationToNativeUrl(location) {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  }

  locationToMeduxUrl(location) {
    return [location.pagename, JSON.stringify(location.params || {})].join('?');
  }

  payloadToPartial(payload) {
    let params = payload.params;
    const extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = deepMerge({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pagename: payload.pagename || this.routeState.pagename,
      params: params || {}
    };
  }

  relaunch(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  }

  async _relaunch(data, internal, disableNative) {
    let location;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }

      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = { ...location,
      action: 'RELAUNCH',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('relaunch', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
  }

  push(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._push.bind(this, data, internal, disableNative));
  }

  async _push(data, internal, disableNative) {
    let location;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }

      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = { ...location,
      action: 'PUSH',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('push', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);

    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }

    this.store.dispatch(routeChangeAction(routeState));
  }

  replace(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._replace.bind(this, data, internal, disableNative));
  }

  async _replace(data, internal, disableNative) {
    let location;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }

      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = { ...location,
      action: 'REPLACE',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('replace', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);

    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }

    this.store.dispatch(routeChangeAction(routeState));
  }

  back(n = 1, indexUrl = 'index', internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? routeConfig.indexUrl : indexUrl, internal, disableNative));
  }

  async _back(n = 1, indexUrl, internal, disableNative) {
    const stack = internal ? this.history.getCurrentInternalHistory().getRecord(n - 1) : this.history.getRecord(n - 1);

    if (!stack) {
      if (indexUrl) {
        return this._relaunch(indexUrl || routeConfig.indexUrl, internal, disableNative);
      }

      throw {
        code: '1',
        message: 'history not found'
      };
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = { ...location,
      action: 'BACK',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('back', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, n, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }

    this.store.dispatch(routeChangeAction(routeState));
    return undefined;
  }

  taskComplete() {
    const task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  }

  executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  }

  addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  }

  destroy() {
    this.nativeRouter.destroy();
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

var isProduction$1 = process.env.NODE_ENV === 'production';

function warning(condition, message) {
  if (!isProduction$1) {
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

var isProduction = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';

function invariant(condition, message) {
  if (condition) {
    return;
  }

  if (isProduction) {
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
    process.env.NODE_ENV !== "production" ? warning(prompt == null, 'A history supports only one prompt at a time') : void 0;
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
          process.env.NODE_ENV !== "production" ? warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Hash history cannot push state; it is ignored') : void 0;
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
        process.env.NODE_ENV !== "production" ? warning(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : void 0;
        setState();
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Hash history cannot replace state; it is ignored') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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

class BrowserNativeRouter extends BaseNativeRouter {
  constructor(createHistory) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "serverSide", false);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      this.serverSide = true;
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

    this._unlistenHistory = this.history.block((location, action) => {
      const {
        pathname = '',
        search = '',
        hash = ''
      } = location;
      const url = [pathname, search, hash].join('');
      const key = this.getKey(location);
      const changed = this.onChange(key);

      if (changed) {
        let index = -1;
        let callback;

        if (action === 'POP') {
          index = this.router.findHistoryIndexByKey(key);
        }

        if (index > -1) {
          callback = () => this.router.back(index + 1, '', false, false);
        } else if (action === 'REPLACE') {
          callback = () => this.router.replace(url, false, false);
        } else if (action === 'PUSH') {
          callback = () => this.router.push(url, false, false);
        } else {
          callback = () => this.router.relaunch(url, false, false);
        }

        callback && env.setTimeout(callback, 50);
        return false;
      }

      return undefined;
    });
  }

  getUrl() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return [pathname, search, hash].join('');
  }

  getKey(location) {
    return location.state || '';
  }

  passive(url, key, action) {
    return true;
  }

  refresh() {
    this.history.go(0);
  }

  push(getNativeData, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  replace(getNativeData, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  relaunch(getNativeData, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  back(getNativeData, n, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.go(-n);
      return nativeData;
    }

    return undefined;
  }

  toOutside(url) {
    this.history.push(url);
  }

  destroy() {
    this._unlistenHistory();
  }

}
class Router extends BaseRouter {
  constructor(browserNativeRouter, locationTransform) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);
  }

}
function createRouter(createHistory, locationTransform) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router(browserNativeRouter, locationTransform);
  return router;
}

const loadViewDefaultOptions = {
  LoadViewOnError: ({
    message
  }) => React.createElement("div", {
    className: "g-view-error"
  }, message),
  LoadViewOnLoading: () => React.createElement("div", {
    className: "g-view-loading"
  }, "loading...")
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

  class Loader extends Component$3 {
    constructor(props) {
      super(props);

      _defineProperty(this, "active", true);

      _defineProperty(this, "loading", false);

      _defineProperty(this, "error", '');

      _defineProperty(this, "view", void 0);

      _defineProperty(this, "state", {
        ver: 0
      });

      this.execute();
    }

    componentWillUnmount() {
      this.active = false;
    }

    shouldComponentUpdate() {
      this.execute();
      return true;
    }

    componentDidMount() {
      this.error = '';
    }

    execute() {
      if (!this.view && !this.loading && !this.error) {
        this.loading = true;
        let result;

        try {
          result = getView(moduleName, viewName);
        } catch (e) {
          this.loading = false;
          this.error = e.message || `${e}`;
        }

        if (result) {
          if (isPromise(result)) {
            result.then(view => {
              this.loading = false;
              this.view = view;
              this.active && this.setState({
                ver: this.state.ver + 1
              });
            }, e => {
              env.console.error(e);
              this.loading = false;
              this.error = e.message || `${e}` || 'error';
              this.active && this.setState({
                ver: this.state.ver + 1
              });
            });
          } else {
            this.loading = false;
            this.view = result;
          }
        }
      }
    }

    render() {
      const {
        forwardedRef,
        ...rest
      } = this.props;

      if (this.view) {
        return React.createElement(this.view, _extends({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        const Comp = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;
        return React.createElement(Comp, null);
      }

      const Comp = OnError || loadViewDefaultOptions.LoadViewOnError;
      return React.createElement(Comp, {
        message: this.error
      });
    }

  }

  return React.forwardRef((props, ref) => {
    return React.createElement(Loader, _extends({}, props, {
      forwardedRef: ref
    }));
  });
};

const MetaData = {
  router: undefined
};

const Component$2 = ({
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
        env.document.title = title;
      }
    }, [title]);
    return null;
  }

  return React.createElement("head", null, children);
};

const DocumentHead = React.memo(Component$2);

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

const Component = ({
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

const Switch = React.memo(Component);

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

const Link = React.forwardRef(({
  onClick,
  replace,
  ...rest
}, ref) => {
  const {
    target
  } = rest;
  const props = { ...rest,
    onClick: event => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? MetaData.router.replace(rest.href) : MetaData.router.push(rest.href);
        }
    }
  };
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});

let SSRTPL;
function setSsrHtmlTpl(tpl) {
  SSRTPL = tpl;
}
function setConfig(conf) {
  setConfig$1(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
}
const exportModule = exportModule$1;
function createApp(moduleGetter, middlewares = [], appModuleName = 'app', appViewName = 'main') {
  const controllerMiddleware = [routeMiddleware, ...middlewares];
  const {
    locationTransform
  } = moduleGetter['route']();
  return {
    useStore({
      storeOptions,
      storeCreator
    }) {
      return {
        render({
          id = 'root',
          ssrKey = 'meduxInitStore'
        } = {}) {
          const router = createRouter('Browser', locationTransform);
          const routeState = router.getRouteState();
          const ssrData = env[ssrKey];
          const renderFun = ssrData ? hydrate : render;
          const panel = env.document.getElementById(id);
          const initState = { ...storeOptions.initState,
            route: routeState,
            ...ssrData
          };
          const baseStore = storeCreator({ ...storeOptions,
            initState
          });
          const {
            store,
            beforeRender
          } = renderApp(baseStore, Object.keys(initState), moduleGetter, controllerMiddleware, appModuleName, appViewName);
          router.setStore(store);
          MetaData.router = router;
          return {
            store,

            run() {
              return beforeRender().then(({
                appView,
                setReRender
              }) => {
                const reRender = View => {
                  unmountComponentAtNode(panel);
                  renderFun(React.createElement(View, {
                    store: store
                  }), panel);
                };

                reRender(appView);
                setReRender(reRender);
              });
            }

          };
        },

        ssr({
          id = 'root',
          ssrKey = 'meduxInitStore',
          url
        }) {
          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.MEDUX_ENV_SSRTPL');
          }

          const router = createRouter(url, locationTransform);
          const routeState = router.getRouteState();
          const initState = { ...storeOptions.initState,
            route: routeState
          };
          const baseStore = storeCreator({ ...storeOptions,
            initState
          });
          const {
            store,
            beforeRender
          } = ssrApp(baseStore, Object.keys(routeState.params), moduleGetter, controllerMiddleware, appModuleName, appViewName);
          router.setStore(store);
          MetaData.router = router;
          return {
            store,

            run() {
              return beforeRender().then(({
                appView: AppView
              }) => {
                const data = store.getState();

                let html = require('react-dom/server').renderToString(React.createElement(AppView, {
                  store: store
                }));

                const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

                if (match) {
                  const pageHead = html.split(/<head>|<\/head>/, 3);
                  html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                  return SSRTPL.replace('</head>', `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify(data)};</script>\r\n</head>`).replace(match[0], match[0] + html);
                }

                return html;
              });
            }

          };
        }

      };
    }

  };
}
function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
function getApp() {
  const modules = getRootModuleAPI();
  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetRouter: () => MetaData.router,
    LoadView: loadView,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}

export { ActionTypes, ModuleWithRouteHandlers as BaseModuleHandlers, DocumentHead, Else, Link, LoadingState, RouteActionTypes, Switch, clientSide, createApp, createRouteModule, deepMerge, deepMergeState, effect, env, errorAction, exportModule, getApp, isProcessedError, isServer, logger, modelHotReplacement, patchActions, reducer, serverSide, setConfig, setLoading, setProcessedError, setSsrHtmlTpl, viewHotReplacement };
