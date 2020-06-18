'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

global.global = {
  wx: wx,
  getCurrentPages: getCurrentPages,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console,
  Page: Page,
  Component: Component
};

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
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

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
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

var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
var isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
var isDevelopmentEnv = 'development' !== 'production';
var client = isServerEnv ? undefined : env;

var TaskCountEvent = 'TaskCountEvent';

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(exports.LoadingState || (exports.LoadingState = {}));

var PEvent = function () {
  function PEvent(name, data, bubbling) {
    if (bubbling === void 0) {
      bubbling = false;
    }

    this.name = name;
    this.data = data;
    this.bubbling = bubbling;

    _defineProperty(this, "target", null);

    _defineProperty(this, "currentTarget", null);
  }

  var _proto = PEvent.prototype;

  _proto.setTarget = function setTarget(target) {
    this.target = target;
  };

  _proto.setCurrentTarget = function setCurrentTarget(target) {
    this.currentTarget = target;
  };

  return PEvent;
}();
var PDispatcher = function () {
  function PDispatcher(parent) {
    this.parent = parent;

    _defineProperty(this, "storeHandlers", {});
  }

  var _proto2 = PDispatcher.prototype;

  _proto2.addListener = function addListener(ename, handler) {
    var dictionary = this.storeHandlers[ename];

    if (!dictionary) {
      this.storeHandlers[ename] = dictionary = [];
    }

    dictionary.push(handler);
    return this;
  };

  _proto2.removeListener = function removeListener(ename, handler) {
    var _this = this;

    if (!ename) {
      Object.keys(this.storeHandlers).forEach(function (key) {
        delete _this.storeHandlers[key];
      });
    } else {
      var handlers = this.storeHandlers;

      if (handlers.propertyIsEnumerable(ename)) {
        var dictionary = handlers[ename];

        if (!handler) {
          delete handlers[ename];
        } else {
          var n = dictionary.indexOf(handler);

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
  };

  _proto2.dispatch = function dispatch(evt) {
    if (!evt.target) {
      evt.setTarget(this);
    }

    evt.setCurrentTarget(this);
    var dictionary = this.storeHandlers[evt.name];

    if (dictionary) {
      for (var i = 0, k = dictionary.length; i < k; i++) {
        dictionary[i](evt);
      }
    }

    if (this.parent && evt.bubbling) {
      this.parent.dispatch(evt);
    }

    return this;
  };

  _proto2.setParent = function setParent(parent) {
    this.parent = parent;
    return this;
  };

  return PDispatcher;
}();
var TaskCounter = function (_PDispatcher) {
  _inheritsLoose(TaskCounter, _PDispatcher);

  var _super = _createSuper(TaskCounter);

  function TaskCounter(deferSecond) {
    var _this2;

    _this2 = _PDispatcher.call(this) || this;
    _this2.deferSecond = deferSecond;

    _defineProperty(_assertThisInitialized(_this2), "list", []);

    _defineProperty(_assertThisInitialized(_this2), "ctimer", null);

    return _this2;
  }

  var _proto3 = TaskCounter.prototype;

  _proto3.addItem = function addItem(promise, note) {
    var _this3 = this;

    if (note === void 0) {
      note = '';
    }

    if (!this.list.some(function (item) {
      return item.promise === promise;
    })) {
      this.list.push({
        promise: promise,
        note: note
      });
      promise.then(function () {
        return _this3.completeItem(promise);
      }, function () {
        return _this3.completeItem(promise);
      });

      if (this.list.length === 1) {
        this.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Start));
        this.ctimer = env.setTimeout(function () {
          _this3.ctimer = null;

          if (_this3.list.length > 0) {
            _this3.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Depth));
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto3.completeItem = function completeItem(promise) {
    var i = this.list.findIndex(function (item) {
      return item.promise === promise;
    });

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = null;
        }

        this.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Stop));
      }
    }

    return this;
  };

  return TaskCounter;
}(PDispatcher);

var loadings = {};
var depthTime = 2;
function setLoadingDepthTime(second) {
  depthTime = second;
}
function setLoading(item, moduleName, groupName) {
  if (moduleName === void 0) {
    moduleName = MetaData.appModuleName;
  }

  if (groupName === void 0) {
    groupName = 'global';
  }

  if (isServerEnv) {
    return item;
  }

  var key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, function (e) {
      var store = MetaData.clientStore;

      if (store) {
        var _actions;

        var actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];

        var _action = actions((_actions = {}, _actions[groupName] = e.data, _actions));

        store.dispatch(_action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
var config = {
  NSP: '.',
  VSP: '.',
  MSP: ','
};
function setConfig(_config) {
  _config.NSP && (config.NSP = _config.NSP);
  _config.VSP && (config.VSP = _config.VSP);
  _config.MSP && (config.MSP = _config.MSP);
}
var MetaData = {
  actionCreatorMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null
};
var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: "medux" + config.NSP + "Error",
  RouteChange: "medux" + config.NSP + "RouteChange"
};
function cacheModule(module) {
  var moduleName = module.default.moduleName;
  var moduleGetter = MetaData.moduleGetter;
  var fn = moduleGetter[moduleName];

  if (fn['__module__'] === module) {
    return fn;
  } else {
    fn = function fn() {
      return module;
    };

    fn['__module__'] = module;
    moduleGetter[moduleName] = fn;
    return fn;
  }
}
function isPromise(data) {
  return typeof data === 'object' && typeof data['then'] === 'function';
}
function getClientStore() {
  return MetaData.clientStore;
}
function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
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

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      var before = function before(curAction, moduleName, promiseResult) {
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
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
function delayPromise(second) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    descriptor.value = function () {
      var delay = new Promise(function (resolve) {
        env.setTimeout(function () {
          resolve(true);
        }, second * 1000);
      });

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
        return items[1];
      });
    };
  };
}
function isProcessedError(error) {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  } else {
    return !!error.meduxProcessed;
  }
}
function setProcessedError(error, meduxProcessed) {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  } else {
    return {
      meduxProcessed: meduxProcessed,
      error: error
    };
  }
}

function bindThis(fun, thisObj) {
  var newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(function (key) {
    newFun[key] = fun[key];
  });
  return newFun;
}

function transformAction(actionName, action, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error("Action duplicate or conflict : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(moduleName, actionName) {
  var actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = function () {
      for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        payload[_key2] = arguments[_key2];
      }

      return {
        type: moduleName + config.NSP + actionName,
        payload: payload
      };
    };
  }
}

function injectActions(store, moduleName, handlers) {
  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          handler = bindThis(handler, handlers);
          actionNames.split(config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
            var arr = actionName.split(config.NSP);

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
      })();
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: [route]
  };
}
function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MRouteParams,
    payload: [params, action]
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

if ( typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
}

function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}

function loadModel(moduleName, storeInstance, options) {
  var store = storeInstance || MetaData.clientStore;
  var hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    var moduleGetter = MetaData.moduleGetter;
    var result = moduleGetter[moduleName]();

    if (isPromiseModule(result)) {
      return result.then(function (module) {
        cacheModule(module);
        return module.default.model(store, options);
      });
    } else {
      cacheModule(result);
      return result.default.model(store, options);
    }
  }
}
function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function bindHistory(store, history) {
  var inTimeTravelling = false;

  var handleLocationChange = function handleLocationChange(location) {
    if (!inTimeTravelling) {
      var _ref = store.getState(),
          route = _ref.route;

      if (route) {
        if (history.equal(route.location, location)) {
          return;
        }
      }

      var data = history.locationToRouteData(location);
      store.dispatch(routeChangeAction({
        location: location,
        data: data
      }));
    } else {
      inTimeTravelling = false;
    }
  };

  store._medux_.destroy = history.subscribe(handleLocationChange);
  store.subscribe(function () {
    if (history.initialized) {
      var storeRouteState = store.getState().route;

      if (!history.equal(storeRouteState.location, history.getLocation())) {
        inTimeTravelling = true;
        history.patch(storeRouteState.location, storeRouteState.data);
      }
    }
  });
  history.initialized && handleLocationChange(history.getLocation());
}

function buildStore(history, preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
  if (preloadedState === void 0) {
    preloadedState = {};
  }

  if (storeReducers === void 0) {
    storeReducers = {};
  }

  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  if (storeEnhancers === void 0) {
    storeEnhancers = [];
  }

  if (MetaData.clientStore) {
    MetaData.clientStore._medux_.destroy();
  }

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  storeReducers.route = function (state, action) {
    if (action.type === ActionTypes.RouteChange) {
      var payload = getActionData(action)[0];

      if (!state) {
        return payload;
      }

      return Object.assign({}, state, {}, payload);
    }

    return state;
  };

  var combineReducers = function combineReducers(rootState, action) {
    if (!store) {
      return rootState;
    }

    var meta = store._medux_;
    meta.prevState = rootState;
    meta.currentState = rootState;
    Object.keys(storeReducers).forEach(function (moduleName) {
      var result = storeReducers[moduleName](rootState[moduleName], action);

      if (result !== rootState[moduleName]) {
        var _Object$assign;

        meta.currentState = Object.assign({}, meta.currentState, (_Object$assign = {}, _Object$assign[moduleName] = result, _Object$assign));
      }
    });
    var handlersCommon = meta.reducerMap[action.type] || {};
    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
    var handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
    var handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      var orderList = [];
      var priority = action.priority ? [].concat(action.priority) : [];
      handlerModules.forEach(function (moduleName) {
        var fun = handlers[moduleName];

        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }

        if (!fun.__isHandler__) {
          priority.unshift(moduleName);
        }
      });
      orderList.unshift.apply(orderList, priority);
      var moduleNameMap = {};
      orderList.forEach(function (moduleName) {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          var fun = handlers[moduleName];
          var result = fun.apply(void 0, getActionData(action));

          if (result !== rootState[moduleName]) {
            var _Object$assign2;

            meta.currentState = Object.assign({}, meta.currentState, (_Object$assign2 = {}, _Object$assign2[moduleName] = result, _Object$assign2));
          }
        }
      });
    }

    var changed = Object.keys(rootState).length !== Object.keys(meta.currentState).length || Object.keys(rootState).some(function (moduleName) {
      return rootState[moduleName] !== meta.currentState[moduleName];
    });
    meta.prevState = changed ? meta.currentState : rootState;
    return meta.prevState;
  };

  var middleware = function middleware(_ref2) {
    var dispatch = _ref2.dispatch;
    return function (next) {
      return function (originalAction) {
        if (isServerEnv) {
          if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
            return originalAction;
          }
        }

        var meta = store._medux_;
        meta.beforeState = meta.prevState;
        var action = next(originalAction);

        if (action.type === ActionTypes.RouteChange) {
          var _routeData = meta.prevState.route.data;
          var rootRouteParams = _routeData.params;
          Object.keys(rootRouteParams).forEach(function (moduleName) {
            var routeParams = rootRouteParams[moduleName];

            if (routeParams && Object.keys(routeParams).length > 0 && meta.injectedModules[moduleName]) {
              dispatch(routeParamsAction(moduleName, routeParams, _routeData.action));
            }
          });
        }

        var handlersCommon = meta.effectMap[action.type] || {};
        var handlersEvery = meta.effectMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
        var handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
        var handlerModules = Object.keys(handlers);

        if (handlerModules.length > 0) {
          var orderList = [];
          var priority = action.priority ? [].concat(action.priority) : [];
          handlerModules.forEach(function (moduleName) {
            var fun = handlers[moduleName];

            if (moduleName === MetaData.appModuleName) {
              orderList.unshift(moduleName);
            } else {
              orderList.push(moduleName);
            }

            if (!fun.__isHandler__) {
              priority.unshift(moduleName);
            }
          });
          orderList.unshift.apply(orderList, priority);
          var moduleNameMap = {};
          var promiseResults = [];
          orderList.forEach(function (moduleName) {
            if (!moduleNameMap[moduleName]) {
              moduleNameMap[moduleName] = true;
              var fun = handlers[moduleName];
              var effectResult = fun.apply(void 0, getActionData(action));
              var decorators = fun.__decorators__;

              if (decorators) {
                var results = [];
                decorators.forEach(function (decorator, index) {
                  results[index] = decorator[0](action, moduleName, effectResult);
                });
                fun.__decoratorResults__ = results;
              }

              var errorHandler = effectResult.then(function (reslove) {
                if (decorators) {
                  var _results = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Resolved', _results[index], reslove);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                return reslove;
              }, function (error) {
                if (decorators) {
                  var _results2 = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Rejected', _results2[index], error);
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
    };
  };

  var preLoadMiddleware = function preLoadMiddleware() {
    return function (next) {
      return function (action) {
        var _action$type$split = action.type.split(config.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
          var initModel = loadModel(moduleName, store, undefined);

          if (isPromise(initModel)) {
            return initModel.then(function () {
              return next(action);
            });
          }
        }

        return next(action);
      };
    };
  };

  var middlewareEnhancer = applyMiddleware.apply(void 0, [preLoadMiddleware].concat(storeMiddlewares, [middleware]));

  var enhancer = function enhancer(newCreateStore) {
    return function () {
      var newStore = newCreateStore.apply(void 0, arguments);
      var modelStore = newStore;
      modelStore._medux_ = {
        beforeState: {},
        prevState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        destroy: function destroy() {
          return void 0;
        }
      };
      return newStore;
    };
  };

  var enhancers = [middlewareEnhancer, enhancer].concat(storeEnhancers);

  if ( client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = createStore(combineReducers, preloadedState, compose.apply(void 0, enhancers));
  bindHistory(store, history);

  if (!isServerEnv) {
    MetaData.clientStore = store;
  }

  return store;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;

      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined$1,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined$1;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
 module.exports );

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
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

function clearHandlers(key, actionHandlerMap) {
  for (var actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      var maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

function modelHotReplacement(moduleName, initState, ActionHandles) {
  var store = MetaData.clientStore;
  var prevInitState = store._medux_.injectedModules[moduleName];
  initState.isModule = true;

  if (prevInitState) {
    if (JSON.stringify(prevInitState) !== JSON.stringify(initState)) {
      env.console.warn("[HMR] @medux Updated model initState: " + moduleName);
    }

    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    var handlers = new ActionHandles(moduleName, store);
    var actions = injectActions(store, moduleName, handlers);
    handlers.actions = actions;
    env.console.log("[HMR] @medux Updated model actionHandles: " + moduleName);
  }
}

var reRender = function reRender() {
  return void 0;
};

var reRenderTimer = 0;
var appView = null;
function viewHotReplacement(moduleName, views) {
  var module = MetaData.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;
    env.console.warn("[HMR] @medux Updated views: " + moduleName);
    appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views.Main;

    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(function () {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn("[HMR] @medux view re rendering");
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}
var exportModule = function exportModule(moduleName, initState, ActionHandles, views) {
  var model = function model(store, options) {
    var hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      var _store$_medux_$prevSt;

      store._medux_.injectedModules[moduleName] = initState;
      var moduleState = store.getState()[moduleName];
      var handlers = new ActionHandles(moduleName, store);

      var _actions = injectActions(store, moduleName, handlers);

      handlers.actions = _actions;
      var params = ((_store$_medux_$prevSt = store._medux_.prevState.route) === null || _store$_medux_$prevSt === void 0 ? void 0 : _store$_medux_$prevSt.data.params) || {};

      if (!moduleState) {
        moduleState = initState;
        moduleState.isModule = true;
      } else {
        moduleState = Object.assign({}, moduleState, {
          isHydrate: true
        });
      }

      var initAction = _actions.Init(moduleState, params[moduleName], options);

      return store.dispatch(initAction);
    }

    return void 0;
  };

  model.moduleName = moduleName;
  model.initState = initState;
  var actions = {};
  return {
    moduleName: moduleName,
    model: model,
    views: views,
    actions: actions
  };
};
var BaseModelHandlers = _decorate(null, function (_initialize) {
  var BaseModelHandlers = function BaseModelHandlers(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;

    _initialize(this);

    this.actions = null;
  };

  return {
    F: BaseModelHandlers,
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
      value: function callThisAction(handler) {
        var actions = MetaData.actionCreatorMap[this.moduleName];

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return actions[handler.__actionName__].apply(actions, rest);
      }
    }, {
      kind: "method",
      key: "updateState",
      value: function updateState(payload) {
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.getState(), {}, payload)));
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel$1(moduleName, options) {
        return loadModel(moduleName, this.store, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState, routeParams, options) {
        if (initState.isHydrate) {
          return initState;
        }

        return Object.assign({}, initState, {
          routeParams: routeParams || initState.routeParams
        }, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload) {
        return payload;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload, action) {
        var state = this.getState();
        return Object.assign({}, state, {
          routeParams: payload
        });
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        var state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, {}, payload)
        });
      }
    }]
  };
});
function isPromiseModule$1(module) {
  return typeof module['then'] === 'function';
}
function exportActions(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce(function (maps, moduleName) {
    maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
      get: function get(target, key) {
        return function () {
          for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            payload[_key2] = arguments[_key2];
          }

          return {
            type: moduleName + config.NSP + key,
            payload: payload
          };
        };
      },
      set: function set() {
        return true;
      }
    });
    return maps;
  }, {});
  return MetaData.actionCreatorMap;
}

function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if (isPromiseModule$1(result)) {
    return result.then(function (module) {
      cacheModule(module);
      return module;
    });
  } else {
    cacheModule(result);
    return result;
  }
}

function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = _asyncToGenerator(regenerator.mark(function _callee(render, moduleGetter, appModuleOrName, history, storeOptions, beforeRender) {
    var appModuleName, ssrInitStoreKey, initData, store, reduxStore, preModuleNames, appModule, i, k, _moduleName, module;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            if (reRenderTimer) {
              env.clearTimeout.call(null, reRenderTimer);
              reRenderTimer = 0;
            }

            appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
            MetaData.appModuleName = appModuleName;

            if (typeof appModuleOrName !== 'string') {
              cacheModule(appModuleOrName);
            }

            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            initData = {};

            if (storeOptions.initData || client[ssrInitStoreKey]) {
              initData = Object.assign({}, client[ssrInitStoreKey], {}, storeOptions.initData);
            }

            store = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            reduxStore = beforeRender ? beforeRender(store) : store;
            preModuleNames = [appModuleName];

            if (initData) {
              preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) {
                return key !== appModuleName && initData[key].isModule;
              }));
            }

            appModule = undefined;
            i = 0, k = preModuleNames.length;

          case 14:
            if (!(i < k)) {
              _context.next = 25;
              break;
            }

            _moduleName = preModuleNames[i];
            _context.next = 18;
            return getModuleByName(_moduleName, moduleGetter);

          case 18:
            module = _context.sent;
            _context.next = 21;
            return module.default.model(reduxStore, undefined);

          case 21:
            if (i === 0) {
              appModule = module;
            }

          case 22:
            i++;
            _context.next = 14;
            break;

          case 25:
            reRender = render(reduxStore, appModule.default.model, appModule.default.views.Main, ssrInitStoreKey);

          case 26:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

function _createForOfIteratorHelperLoose(o) {
  var i = 0;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  i = o[Symbol.iterator]();
  return i.next.bind(i);
}

function lexer(str) {
  var tokens = [];
  var i = 0;

  while (i < str.length) {
    var char = str[i];

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
      var name = '';
      var j = i + 1;

      while (j < str.length) {
        var code = str.charCodeAt(j);

        if (code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95 || code === 46) {
          name += str[j++];
          continue;
        }

        break;
      }

      if (!name) throw new TypeError("Missing parameter name at " + i);
      tokens.push({
        type: 'NAME',
        index: i,
        value: name
      });
      i = j;
      continue;
    }

    if (char === '(') {
      var count = 1;
      var pattern = '';

      var _j = i + 1;

      if (str[_j] === '?') {
        throw new TypeError("Pattern cannot start with \"?\" at " + _j);
      }

      while (_j < str.length) {
        if (str[_j] === '\\') {
          pattern += str[_j++] + str[_j++];
          continue;
        }

        if (str[_j] === ')') {
          count--;

          if (count === 0) {
            _j++;
            break;
          }
        } else if (str[_j] === '(') {
          count++;

          if (str[_j + 1] !== '?') {
            throw new TypeError("Capturing groups are not allowed at " + _j);
          }
        }

        pattern += str[_j++];
      }

      if (count) throw new TypeError("Unbalanced pattern at " + i);
      if (!pattern) throw new TypeError("Missing pattern at " + i);
      tokens.push({
        type: 'PATTERN',
        index: i,
        value: pattern
      });
      i = _j;
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

function parse(str, options) {
  if (options === void 0) {
    options = {};
  }

  var tokens = lexer(str);
  var _options = options,
      _options$prefixes = _options.prefixes,
      prefixes = _options$prefixes === void 0 ? './' : _options$prefixes;
  var defaultPattern = "[^" + escapeString(options.delimiter || '/#?') + "]+?";
  var result = [];
  var key = 0;
  var i = 0;
  var path = '';

  var tryConsume = function tryConsume(type) {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    return undefined;
  };

  var mustConsume = function mustConsume(type) {
    var value = tryConsume(type);
    if (value !== undefined) return value;
    var _tokens$i = tokens[i],
        nextType = _tokens$i.type,
        index = _tokens$i.index;
    throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
  };

  var consumeText = function consumeText() {
    var result = '';
    var value;

    while (value = tryConsume('CHAR') || tryConsume('ESCAPED_CHAR')) {
      result += value;
    }

    return result;
  };

  while (i < tokens.length) {
    var char = tryConsume('CHAR');
    var name = tryConsume('NAME');
    var pattern = tryConsume('PATTERN');

    if (name || pattern) {
      var prefix = char || '';

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
        prefix: prefix,
        suffix: '',
        pattern: pattern || defaultPattern,
        modifier: tryConsume('MODIFIER') || ''
      });
      continue;
    }

    var _value = char || tryConsume('ESCAPED_CHAR');

    if (_value) {
      path += _value;
      continue;
    }

    if (path) {
      result.push(path);
      path = '';
    }

    var open = tryConsume('OPEN');

    if (open) {
      var _prefix = consumeText();

      var _name = tryConsume('NAME') || '';

      var _pattern = tryConsume('PATTERN') || '';

      var suffix = consumeText();
      mustConsume('CLOSE');
      result.push({
        name: _name || (_pattern ? key++ : ''),
        pattern: _name && !_pattern ? defaultPattern : _pattern,
        prefix: _prefix,
        suffix: suffix,
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
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }

  var reFlags = flags(options);
  var _options2 = options,
      _options2$encode = _options2.encode,
      encode = _options2$encode === void 0 ? function (x) {
    return x;
  } : _options2$encode,
      _options2$validate = _options2.validate,
      validate = _options2$validate === void 0 ? true : _options2$validate;
  var matches = tokens.map(function (token) {
    if (typeof token === 'object') {
      return new RegExp("^(?:" + token.pattern + ")$", reFlags);
    }

    return undefined;
  });
  return function (data) {
    var path = '';

    for (var i = 0; i < tokens.length; i++) {
      var _token = tokens[i];

      if (typeof _token === 'string') {
        path += _token;
        continue;
      }

      var _value2 = data ? data[_token.name] : undefined;

      var optional = _token.modifier === '?' || _token.modifier === '*';
      var repeat = _token.modifier === '*' || _token.modifier === '+';

      if (Array.isArray(_value2)) {
        if (!repeat) {
          throw new TypeError("Expected \"" + _token.name + "\" to not repeat, but got an array");
        }

        if (_value2.length === 0) {
          if (optional) continue;
          throw new TypeError("Expected \"" + _token.name + "\" to not be empty");
        }

        for (var j = 0; j < _value2.length; j++) {
          var segment = encode(_value2[j], _token);

          if (validate && !matches[i].test(segment)) {
            throw new TypeError("Expected all \"" + _token.name + "\" to match \"" + _token.pattern + "\", but got \"" + segment + "\"");
          }

          path += _token.prefix + segment + _token.suffix;
        }

        continue;
      }

      if (typeof _value2 === 'string' || typeof _value2 === 'number') {
        var _segment = encode(String(_value2), _token);

        if (validate && !matches[i].test(_segment)) {
          throw new TypeError("Expected \"" + _token.name + "\" to match \"" + _token.pattern + "\", but got \"" + _segment + "\"");
        }

        path += _token.prefix + _segment + _token.suffix;
        continue;
      }

      if (optional) continue;
      var typeOfMessage = repeat ? 'an array' : 'a string';
      throw new TypeError("Expected \"" + _token.name + "\" to be " + typeOfMessage);
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
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
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
  var parts = paths.map(function (path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:" + parts.join('|') + ")", flags(options));
}

function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}

function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }

  var _options4 = options,
      _options4$strict = _options4.strict,
      strict = _options4$strict === void 0 ? false : _options4$strict,
      _options4$start = _options4.start,
      start = _options4$start === void 0 ? true : _options4$start,
      _options4$end = _options4.end,
      end = _options4$end === void 0 ? true : _options4$end,
      _options4$encode = _options4.encode,
      encode = _options4$encode === void 0 ? function (x) {
    return x;
  } : _options4$encode;
  var endsWith = "[" + escapeString(options.endsWith || '') + "]|$";
  var delimiter = "[" + escapeString(options.delimiter || '/#?') + "]";
  var route = start ? '^' : '';

  for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
    var _token2 = _step.value;

    if (typeof _token2 === 'string') {
      route += escapeString(encode(_token2));
    } else {
      var prefix = escapeString(encode(_token2.prefix));
      var suffix = escapeString(encode(_token2.suffix));

      if (_token2.pattern) {
        if (keys) keys.push(_token2);

        if (prefix || suffix) {
          if (_token2.modifier === '+' || _token2.modifier === '*') {
            var mod = _token2.modifier === '*' ? '?' : '';
            route += "(?:" + prefix + "((?:" + _token2.pattern + ")(?:" + suffix + prefix + "(?:" + _token2.pattern + "))*)" + suffix + ")" + mod;
          } else {
            route += "(?:" + prefix + "(" + _token2.pattern + ")" + suffix + ")" + _token2.modifier;
          }
        } else {
          route += "(" + _token2.pattern + ")" + _token2.modifier;
        }
      } else {
        route += "(?:" + prefix + suffix + ")" + _token2.modifier;
      }
    }
  }

  if (end) {
    if (!strict) route += delimiter + "?";
    route += !options.endsWith ? '$' : "(?=" + endsWith + ")";
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === 'string' ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : endToken === undefined;

    if (!strict) {
      route += "(?:" + delimiter + "(?=" + endsWith + "))?";
    }

    if (!isEndDelimited) {
      route += "(?=" + delimiter + "|" + endsWith + ")";
    }
  }

  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

var cache = {};
var cacheLimit = 10000;
var cacheCount = 0;
function compileToPath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  var result = compile(rule);

  if (cacheCount < cacheLimit) {
    cache[rule] = result;
    cacheCount++;
  }

  return result;
}
function compilePath(path, options) {
  if (options === void 0) {
    options = {
      end: false,
      strict: false,
      sensitive: false
    };
  }

  var cacheKey = "" + options.end + options.strict + options.sensitive;
  var pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  var keys = [];
  var regexp = pathToRegexp(path, keys, options);
  var result = {
    regexp: regexp,
    keys: keys
  };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}
function matchPath(pathname, options) {
  if (options === void 0) {
    options = {};
  }

  if (typeof options === 'string' || Array.isArray(options)) {
    options = {
      path: options
    };
  }

  var _options = options,
      path = _options.path,
      _options$exact = _options.exact,
      exact = _options$exact === void 0 ? false : _options$exact,
      _options$strict = _options.strict,
      strict = _options$strict === void 0 ? false : _options$strict,
      _options$sensitive = _options.sensitive,
      sensitive = _options$sensitive === void 0 ? false : _options$sensitive;
  var paths = [].concat(path);
  return paths.reduce(function (matched, path) {
    if (!path) return null;
    if (matched) return matched;

    if (path === '*') {
      return {
        path: path,
        url: pathname,
        isExact: true,
        params: {}
      };
    }

    var _compilePath = compilePath(path, {
      end: exact,
      strict: strict,
      sensitive: sensitive
    }),
        regexp = _compilePath.regexp,
        keys = _compilePath.keys;

    var match = regexp.exec(pathname);
    if (!match) return null;
    var url = match[0],
        values = match.slice(1);
    var isExact = pathname === url;
    if (exact && !isExact) return null;
    return {
      path: path,
      url: path === '/' && url === '' ? '/' : url,
      isExact: isExact,
      params: keys.reduce(function (memo, key, index) {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

function isSpecificValue(val) {
  return val instanceof Date || val instanceof RegExp ? true : false;
}

function cloneSpecificValue(val) {
  if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
}

function deepCloneArray(arr) {
  var clone = [];
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

function deepExtend() {
  for (var _len = arguments.length, datas = new Array(_len), _key = 0; _key < _len; _key++) {
    datas[_key] = arguments[_key];
  }

  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) {
    return arguments[0];
  }

  var target = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  var val, src;
  args.forEach(function (obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = safeGetProperty(target, key);
      val = safeGetProperty(obj, key);

      if (val === target) {
        return;
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;
        return;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return;
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return;
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        return;
      } else {
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });
  return target;
}

function checkUrl(url, curPathname) {
  if (curPathname === void 0) {
    curPathname = '';
  }

  if (url !== url.replace(/^\w+:\/\/[^/]+/, '')) {
    return '';
  }

  curPathname = ('/' + curPathname).replace('//', '/').replace(/\/$/, '');

  if (url.startsWith('./')) {
    url = curPathname + url.replace('./', '/');
  } else if (url.startsWith('../')) {
    var _url$match;

    var n = ((_url$match = url.match(/\.\.\//g)) === null || _url$match === void 0 ? void 0 : _url$match.length) || 0;
    var arr = curPathname.split('/');
    arr.length = arr.length - n;
    url = arr.join('/') + '/' + url.replace(/\.\.\//g, '');
  } else {
    url = ('/' + url).replace('//', '/');
  }

  return url.replace(/\/(?=[?#]|$)/, '');
}
function urlToLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var pathname = arr[0],
      _arr$ = arr[1],
      search = _arr$ === void 0 ? '' : _arr$,
      _arr$2 = arr[2],
      hash = _arr$2 === void 0 ? '' : _arr$2;
  return {
    pathname: pathname,
    search: search && '?' + search,
    hash: hash && '#' + hash
  };
}
function locationToUrl(location) {
  return location.pathname + location.search + location.hash;
}

var deepAssign = deepExtend;
var config$1 = {
  escape: true,
  dateParse: false,
  splitKey: 'q',
  defaultRouteParams: {}
};
function setRouteConfig(conf) {
  conf.escape !== undefined && (config$1.escape = conf.escape);
  conf.dateParse !== undefined && (config$1.dateParse = conf.dateParse);
  conf.splitKey && (config$1.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config$1.defaultRouteParams = conf.defaultRouteParams);
}

function excludeDefaultData(data, def, holde, views) {
  var result = {};
  Object.keys(data).forEach(function (moduleName) {
    var value = data[moduleName];
    var defaultValue = def[moduleName];

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

var ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

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

  if (config$1.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, config$1.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

function joinSearchString(arr) {
  var strs = [''];

  for (var i = 0, k = arr.length; i < k; i++) {
    strs.push(arr[i] || '');
  }

  return strs.join("&" + config$1.splitKey + "=");
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  var str = JSON.stringify(searchData);

  if (str === '{}') {
    return '';
  }

  if (config$1.escape) {
    return escape(str);
  } else {
    return str;
  }
}

function splitSearch(search) {
  var reg = new RegExp("[&?#]" + config$1.splitKey + "=[^&]*", 'g');
  var arr = search.match(reg);
  var stackParams = [];

  if (arr) {
    stackParams = arr.map(function (str) {
      return searchParse(str.split('=')[1]);
    });
  }

  return stackParams;
}

function checkPathArgs(params) {
  var obj = {};

  for (var _key in params) {
    if (params.hasOwnProperty(_key)) {
      (function () {
        var val = params[_key];

        var props = _key.split('.');

        if (props.length > 1) {
          props.reduce(function (prev, cur, index, arr) {
            if (index === arr.length - 1) {
              prev[cur] = val;
            } else {
              prev[cur] = {};
            }

            return prev[cur];
          }, obj);
        } else {
          obj[_key] = val;
        }
      })();
    }
  }

  return obj;
}

function pathnameParse(pathname, routeConfig, paths, args) {
  for (var _rule in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule)) {
      var item = routeConfig[_rule];

      var _ref = typeof item === 'string' ? [item, null] : item,
          _viewName = _ref[0],
          pathConfig = _ref[1];

      var match = matchPath(pathname, {
        path: _rule.replace(/\$$/, ''),
        exact: !pathConfig
      });

      if (match) {
        paths.push(_viewName);

        var _moduleName = _viewName.split(config.VSP)[0];

        var params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName] = Object.assign({}, args[_moduleName], {}, checkPathArgs(params));
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

function compileConfig(routeConfig, parentAbsoluteViewName, viewToRule, ruleToKeys) {
  if (parentAbsoluteViewName === void 0) {
    parentAbsoluteViewName = '';
  }

  if (viewToRule === void 0) {
    viewToRule = {};
  }

  if (ruleToKeys === void 0) {
    ruleToKeys = {};
  }

  for (var _rule2 in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule2)) {
      if (!ruleToKeys[_rule2]) {
        var _compilePath = compilePath(_rule2, {
          end: true,
          strict: false,
          sensitive: false
        }),
            keys = _compilePath.keys;

        ruleToKeys[_rule2] = keys.reduce(function (prev, cur) {
          prev.push(cur.name);
          return prev;
        }, []);
      }

      var item = routeConfig[_rule2];

      var _ref2 = typeof item === 'string' ? [item, null] : item,
          _viewName2 = _ref2[0],
          pathConfig = _ref2[1];

      var absoluteViewName = parentAbsoluteViewName + '/' + _viewName2;
      viewToRule[absoluteViewName] = _rule2;

      if (pathConfig) {
        compileConfig(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule: viewToRule,
    ruleToKeys: ruleToKeys
  };
}

function assignRouteData(paths, stackParams, args, action) {
  if (!stackParams[0]) {
    stackParams[0] = {};
  }

  if (args) {
    stackParams[0] = deepExtend({}, args, stackParams[0]);
  }

  var firstStackParams = stackParams[0];
  var views = paths.reduce(function (prev, cur) {
    var _cur$split = cur.split(config.VSP),
        moduleName = _cur$split[0],
        viewName = _cur$split[1];

    if (viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!firstStackParams[moduleName]) {
        firstStackParams[moduleName] = {};
      }
    }

    return prev;
  }, {});
  Object.keys(firstStackParams).forEach(function (moduleName) {
    firstStackParams[moduleName] = deepExtend({}, config$1.defaultRouteParams[moduleName], firstStackParams[moduleName]);
  });
  var params = deepExtend.apply(void 0, [{}].concat(stackParams));
  Object.keys(params).forEach(function (moduleName) {
    if (!firstStackParams[moduleName]) {
      params[moduleName] = deepExtend({}, config$1.defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {
    views: views,
    paths: paths,
    params: params,
    stackParams: stackParams,
    action: action
  };
}

function extractHashData(params) {
  var searchParams = {};
  var hashParams = {};

  var _loop = function _loop(_moduleName2) {
    if (params[_moduleName2] && params.hasOwnProperty(_moduleName2)) {
      var data = params[_moduleName2];
      var keys = Object.keys(data);

      if (keys.length > 0) {
        keys.forEach(function (key) {
          if (key.startsWith('_')) {
            if (!hashParams[_moduleName2]) {
              hashParams[_moduleName2] = {};
            }

            hashParams[_moduleName2][key] = data[key];
          } else {
            if (!searchParams[_moduleName2]) {
              searchParams[_moduleName2] = {};
            }

            searchParams[_moduleName2][key] = data[key];
          }
        });
      } else {
        searchParams[_moduleName2] = {};
      }
    }
  };

  for (var _moduleName2 in params) {
    _loop(_moduleName2);
  }

  return {
    search: searchStringify(searchParams),
    hash: searchStringify(hashParams)
  };
}

function locationToUrl$1(location) {
  return location.pathname + (location.search ? "?" + location.search : '') + (location.hash ? "#" + location.hash : '');
}

var cacheData = [];
function buildTransformRoute(routeConfig) {
  var _compileConfig = compileConfig(routeConfig),
      viewToRule = _compileConfig.viewToRule,
      ruleToKeys = _compileConfig.ruleToKeys;

  var locationToRoute = function locationToRoute(location) {
    var url = locationToUrl$1(location);
    var item = cacheData.find(function (val) {
      return val && val.url === url;
    });

    if (item) {
      return item.routeData;
    }

    var pathname = location.pathname;
    var paths = [];
    var pathsArgs = {};
    pathnameParse(pathname, routeConfig, paths, pathsArgs);
    var stackParams = splitSearch(location.search);
    var hashStackParams = splitSearch(location.hash);
    hashStackParams.forEach(function (item, index) {
      if (item) {
        if (!stackParams[index]) {
          stackParams[index] = {};
        }

        deepExtend(stackParams[index], item);
      }
    });
    var routeData = assignRouteData(paths, stackParams, pathsArgs, location.action);
    cacheData.unshift({
      url: url,
      routeData: routeData
    });
    cacheData.length = 10;
    return routeData;
  };

  var routeToLocation = function routeToLocation(routeData) {
    var views = routeData.views,
        paths = routeData.paths,
        params = routeData.params,
        stackParams = routeData.stackParams;
    var firstStackParams = stackParams[0];
    var pathname = '';
    var firstStackParamsFilter;

    if (paths.length > 0) {
      firstStackParamsFilter = deepExtend({}, firstStackParams);
      paths.reduce(function (parentAbsoluteViewName, viewName, index) {
        var absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        var rule = viewToRule[absoluteViewName];
        var moduleName = viewName.split(config.VSP)[0];

        if (index === paths.length - 1) {
          var toPath = compileToPath(rule);

          var _keys = ruleToKeys[rule] || [];

          var args = _keys.reduce(function (prev, cur) {
            if (typeof cur === 'string') {
              var props = cur.split('.');

              if (props.length) {
                prev[cur] = props.reduce(function (p, c) {
                  return p[c];
                }, params[moduleName]);
                return prev;
              }
            }

            prev[cur] = params[moduleName][cur];
            return prev;
          }, {});

          pathname = toPath(args);
        }

        var keys = ruleToKeys[rule] || [];
        keys.forEach(function (key) {
          if (typeof key === 'string') {
            var props = key.split('.');

            if (props.length) {
              props.reduce(function (p, c, i) {
                if (i === props.length - 1) {
                  delete p[c];
                }

                return p[c] || {};
              }, firstStackParamsFilter[moduleName] || {});
              return;
            }
          }

          if (firstStackParamsFilter[moduleName]) {
            delete firstStackParamsFilter[moduleName][key];
          }
        });
        return absoluteViewName;
      }, '');
    } else {
      firstStackParamsFilter = firstStackParams;
    }

    var arr = [].concat(stackParams);
    arr[0] = excludeDefaultData(firstStackParamsFilter, config$1.defaultRouteParams, false, views);
    var searchStrings = [];
    var hashStrings = [];
    arr.forEach(function (params, index) {
      var _extractHashData = extractHashData(params),
          search = _extractHashData.search,
          hash = _extractHashData.hash;

      search && (searchStrings[index] = search);
      hash && (hashStrings[index] = hash);
    });
    var search = joinSearchString(searchStrings).substr(1);
    var hash = joinSearchString(hashStrings).substr(1);
    return {
      pathname: pathname,
      search: search ? '?' + search : '',
      hash: hash ? '#' + hash : '',
      action: routeData.action
    };
  };

  return {
    locationToRoute: locationToRoute,
    routeToLocation: routeToLocation
  };
}

function isBrowserRoutePayload(data) {
  return !data['url'];
}

function isBrowserRoutePayload2(data) {
  return !data['pathname'];
}

function fillLocation(location) {
  return {
    pathname: location.pathname || '',
    search: location.search || '',
    hash: location.hash || '',
    action: location.action
  };
}

function fillBrowserRouteData(routePayload) {
  var extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  var stackParams = [].concat(extend.stackParams);

  if (routePayload.params) {
    stackParams[0] = deepAssign({}, stackParams[0], routePayload.params);
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams, undefined, extend.action);
}
function createRouter(routeConfig, locationMap) {
  var transformRoute = buildTransformRoute(routeConfig);

  var History = function () {
    function History() {
      _defineProperty(this, "_uid", 0);

      _defineProperty(this, "_listenList", {});

      _defineProperty(this, "_blockerList", {});

      _defineProperty(this, "location", void 0);

      _defineProperty(this, "indexLocation", void 0);

      var _env$wx$getLaunchOpti = env.wx.getLaunchOptionsSync(),
          path = _env$wx$getLaunchOpti.path,
          query = _env$wx$getLaunchOpti.query;

      var search = Object.keys(query).map(function (key) {
        return key + '=' + query[key];
      }).join('&');
      var url = checkUrl(path + '?' + search);
      this.location = urlToLocation(url);
      this.indexLocation = this.location;
    }

    var _proto = History.prototype;

    _proto.getLocation = function getLocation() {
      return this.location;
    };

    _proto.getRouteData = function getRouteData() {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(this.location) : this.location);
    };

    _proto.urlToLocation = function urlToLocation$1(str) {
      var url = checkUrl(str, this.location.pathname);

      var location = urlToLocation(url);

      if (locationMap) {
        location = locationMap.out(location);
        url = checkUrl(locationToUrl(location));
      }

      return {
        url: url,
        location: location
      };
    };

    _proto.createWechatRouteOption = function createWechatRouteOption(data) {
      if (typeof data === 'string') {
        var _this$urlToLocation = this.urlToLocation(data),
            url = _this$urlToLocation.url,
            _location = _this$urlToLocation.location;

        return {
          option: {
            url: url
          },
          location: _location
        };
      } else if (isBrowserRoutePayload(data)) {
        var routeData = fillBrowserRouteData(data);

        var _location2 = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          _location2 = locationMap.out(_location2);
        }

        var _option = {
          url: checkUrl(locationToUrl(_location2))
        };
        return {
          option: _option,
          location: _location2
        };
      } else {
        var _this$urlToLocation2 = this.urlToLocation(data.url),
            _url = _this$urlToLocation2.url,
            _location3 = _this$urlToLocation2.location;

        return {
          option: Object.assign({}, data, {
            url: _url
          }),
          location: _location3
        };
      }
    };

    _proto.switchTab = function switchTab(args) {
      var _this$createWechatRou = this.createWechatRouteOption(args),
          location = _this$createWechatRou.location,
          option = _this$createWechatRou.option;

      this._dispatch(location, 'PUSH').then(function (success) {
        success && env.wx.switchTab(option);
      });
    };

    _proto.reLaunch = function reLaunch(args) {
      var _this$createWechatRou2 = this.createWechatRouteOption(args),
          location = _this$createWechatRou2.location,
          option = _this$createWechatRou2.option;

      this._dispatch(location, 'PUSH').then(function (success) {
        success && env.wx.reLaunch(option);
      });
    };

    _proto.redirectTo = function redirectTo(args) {
      var _this$createWechatRou3 = this.createWechatRouteOption(args),
          location = _this$createWechatRou3.location,
          option = _this$createWechatRou3.option;

      this._dispatch(location, 'PUSH').then(function (success) {
        success && env.wx.redirectTo(option);
      });
    };

    _proto.navigateTo = function navigateTo(args) {
      var _this$createWechatRou4 = this.createWechatRouteOption(args),
          location = _this$createWechatRou4.location,
          option = _this$createWechatRou4.option;

      this._dispatch(location, 'PUSH').then(function (success) {
        success && env.wx.navigateTo(option);
      });
    };

    _proto.navigateBack = function navigateBack(option) {
      var routeOption = typeof option === 'number' ? {
        delta: option
      } : option;
      var pages = env.getCurrentPages();

      if (pages.length < 2) {
        throw {
          code: '1',
          message: 'navigateBack:fail cannot navigate back at first page.'
        };
      }

      var currentPage = pages[pages.length - 1 - (routeOption.delta || 1)];
      var location;

      if (currentPage) {
        var route = currentPage.route,
            options = currentPage.options;
        var search = Object.keys(options).map(function (key) {
          return key + '=' + options[key];
        }).join('&');
        var url = checkUrl(route + '?' + search);
        location = urlToLocation(url);
      } else {
        location = this.indexLocation;
      }

      this._dispatch(location, 'POP').then(function (success) {
        success && env.wx.navigateBack(routeOption);
      });
    };

    _proto._dispatch = function () {
      var _dispatch2 = _asyncToGenerator(regenerator.mark(function _callee(location, action) {
        var _key, _blocker, result, _key2, _listener;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.location = Object.assign({}, location, {
                  action: action
                });
                _context.t0 = regenerator.keys(this._blockerList);

              case 2:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 13;
                  break;
                }

                _key = _context.t1.value;

                if (!this._blockerList.hasOwnProperty(_key)) {
                  _context.next = 11;
                  break;
                }

                _blocker = this._blockerList[_key];
                _context.next = 8;
                return _blocker(this.location);

              case 8:
                result = _context.sent;

                if (result) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return", false);

              case 11:
                _context.next = 2;
                break;

              case 13:
                for (_key2 in this._listenList) {
                  if (this._listenList.hasOwnProperty(_key2)) {
                    _listener = this._listenList[_key2];

                    _listener(this.location);
                  }
                }

                return _context.abrupt("return", true);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _dispatch(_x, _x2) {
        return _dispatch2.apply(this, arguments);
      }

      return _dispatch;
    }();

    _proto.listen = function listen(listener) {
      var _this = this;

      this._uid++;
      var uid = this._uid;
      this._listenList[uid] = listener;
      return function () {
        delete _this._listenList[uid];
      };
    };

    _proto.block = function block(listener) {
      var _this2 = this;

      this._uid++;
      var uid = this._uid;
      this._blockerList[uid] = listener;
      return function () {
        delete _this2._blockerList[uid];
      };
    };

    return History;
  }();

  var historyActions = new History();
  var historyProxy = {
    initialized: true,
    getLocation: function getLocation() {
      return historyActions.getLocation();
    },
    subscribe: function subscribe(listener) {
      return historyActions.listen(listener);
    },
    locationToRouteData: function locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    equal: function equal(a, b) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    },
    patch: function patch(location) {
      var url = locationToUrl(location);
      historyActions.reLaunch({
        url: url
      });
    }
  };

  function toBrowserUrl(data) {
    var location;

    if (isBrowserRoutePayload2(data)) {
      location = transformRoute.routeToLocation(fillBrowserRouteData(data));
    } else {
      location = fillLocation(data);
    }

    if (locationMap) {
      location = locationMap.out(location);
    }

    return checkUrl(locationToUrl(location));
  }

  env.wx.onAppRoute(function (res) {
    if (res.openType === 'navigateBack') {
      var curLocation = getClientStore().getState().route.location;
      var path = ('/' + res.path).replace('//', '/');
      var search = Object.keys(res.query).map(function (key) {
        return key + '=' + res.query[key];
      }).join('&');

      if (path !== curLocation.pathname || search !== curLocation.search) {
        var url = checkUrl(path + '?' + search);

        var _location4 = urlToLocation(url);

        historyActions._dispatch(_location4, 'POP');
      }
    }
  });
  return {
    transformRoute: transformRoute,
    historyProxy: historyProxy,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl
  };
}

function getPrevData(next, prev) {
  return Object.keys(next).reduce(function (result, key) {
    result[key] = prev[key];
    return result;
  }, {});
}
function diffData(prev, next) {
  var empty = true;
  var data = Object.keys(prev).reduce(function (result, key) {
    if (prev[key] === next[key]) {
      return result;
    }

    empty = false;
    result[key] = next[key];
    return result;
  }, {});

  if (empty) {
    return;
  }

  return data;
}

var connectComponent = function connectComponent(module, mapStateToProps, mapDispatchToProps) {
  cacheModule(module);
  return function (config) {
    var unsubscribe;
    var ready = false;

    function onStateChange() {
      if (!unsubscribe) {
        return;
      }

      if (mapStateToProps) {
        var nextState = mapStateToProps(getClientStore().getState(), this.data);
        var prevState = getPrevData(nextState, this.data || {});
        var updateData = diffData(prevState, nextState);
        updateData && this.setData(updateData);
      }
    }

    function created() {
      var _config$lifetimes, _config$lifetimes$cre;

      loadModel(module.default.moduleName);
      (_config$lifetimes = config.lifetimes) === null || _config$lifetimes === void 0 ? void 0 : (_config$lifetimes$cre = _config$lifetimes.created) === null || _config$lifetimes$cre === void 0 ? void 0 : _config$lifetimes$cre.call(this);
    }

    function attached() {
      var _config$lifetimes2, _config$lifetimes2$at;

      if (mapStateToProps) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }

      (_config$lifetimes2 = config.lifetimes) === null || _config$lifetimes2 === void 0 ? void 0 : (_config$lifetimes2$at = _config$lifetimes2.attached) === null || _config$lifetimes2$at === void 0 ? void 0 : _config$lifetimes2$at.call(this);
      ready = true;
    }

    function detached() {
      var _config$lifetimes3, _config$lifetimes3$de;

      (_config$lifetimes3 = config.lifetimes) === null || _config$lifetimes3 === void 0 ? void 0 : (_config$lifetimes3$de = _config$lifetimes3.detached) === null || _config$lifetimes3$de === void 0 ? void 0 : _config$lifetimes3$de.call(this);

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }

    function show() {
      var _config$pageLifetimes, _config$pageLifetimes2;

      if (ready && mapStateToProps && !unsubscribe) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }

      (_config$pageLifetimes = config.pageLifetimes) === null || _config$pageLifetimes === void 0 ? void 0 : (_config$pageLifetimes2 = _config$pageLifetimes.show) === null || _config$pageLifetimes2 === void 0 ? void 0 : _config$pageLifetimes2.call(this);
    }

    function hide() {
      var _config$pageLifetimes3, _config$pageLifetimes4;

      (_config$pageLifetimes3 = config.pageLifetimes) === null || _config$pageLifetimes3 === void 0 ? void 0 : (_config$pageLifetimes4 = _config$pageLifetimes3.hide) === null || _config$pageLifetimes4 === void 0 ? void 0 : _config$pageLifetimes4.call(this);

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }

    var mergeConfig = Object.assign({}, config, {
      methods: Object.assign({}, config.methods, {}, mapDispatchToProps && mapDispatchToProps(getClientStore().dispatch, config.data), {
        dispatch: getClientStore().dispatch
      }),
      lifetimes: Object.assign({}, config.lifetimes, {
        created: created,
        attached: attached,
        detached: detached
      }),
      pageLifetimes: Object.assign({}, config.pageLifetimes, {
        show: show,
        hide: hide
      })
    });
    return env.Component(mergeConfig);
  };
};

var connectPage = function connectPage(module, mapStateToProps, mapDispatchToProps) {
  cacheModule(module);
  return function (config) {
    var unsubscribe;
    var ready = false;

    function onStateChange() {
      if (!unsubscribe) {
        return;
      }

      if (mapStateToProps) {
        var nextState = mapStateToProps(getClientStore().getState(), this.data);
        var prevState = getPrevData(nextState, this.data || {});
        var updateData = diffData(prevState, nextState);
        updateData && this.setData(updateData);
      }
    }

    function onLoad(option) {
      var _config$onLoad;

      loadModel(module.default.moduleName);

      if (mapStateToProps) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }

      (_config$onLoad = config.onLoad) === null || _config$onLoad === void 0 ? void 0 : _config$onLoad.call(this, option);
      ready = true;
    }

    function onUnload() {
      var _config$onUnload;

      (_config$onUnload = config.onUnload) === null || _config$onUnload === void 0 ? void 0 : _config$onUnload.call(this);

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }

    function onShow() {
      var _config$onShow;

      if (ready && mapStateToProps && !unsubscribe) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }

      (_config$onShow = config.onShow) === null || _config$onShow === void 0 ? void 0 : _config$onShow.call(this);
    }

    function onHide() {
      var _config$onHide;

      (_config$onHide = config.onHide) === null || _config$onHide === void 0 ? void 0 : _config$onHide.call(this);

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }

    var mergeConfig = Object.assign({}, config, {}, mapDispatchToProps ? mapDispatchToProps(getClientStore().dispatch, config.data) : {}, {
      dispatch: getClientStore().dispatch,
      onLoad: onLoad,
      onUnload: onUnload,
      onShow: onShow,
      onHide: onHide
    });
    return env.Page(mergeConfig);
  };
};

var historyActions = undefined;
var transformRoute = undefined;
var toBrowserUrl = undefined;

function checkRedirect(views) {
  if (views['@']) {
    var url = Object.keys(views['@'])[0];
    historyActions.navigateTo(url);
    return true;
  }

  return false;
}

var redirectMiddleware = function redirectMiddleware() {
  return function (next) {
    return function (action) {
      if (action.type === ActionTypes.RouteChange) {
        var routeState = action.payload[0];
        var views = routeState.data.views;

        if (checkRedirect(views)) {
          return;
        }
      }

      return next(action);
    };
  };
};

function buildApp(_ref) {
  var moduleGetter = _ref.moduleGetter,
      appModule = _ref.appModule,
      _ref$routeConfig = _ref.routeConfig,
      routeConfig = _ref$routeConfig === void 0 ? {} : _ref$routeConfig,
      locationMap = _ref.locationMap,
      defaultRouteParams = _ref.defaultRouteParams,
      _ref$storeOptions = _ref.storeOptions,
      storeOptions = _ref$storeOptions === void 0 ? {} : _ref$storeOptions,
      beforeRender = _ref.beforeRender;
  setRouteConfig({
    defaultRouteParams: defaultRouteParams
  });
  var router = createRouter(routeConfig, locationMap);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(function () {
    return function () {
      return void 0;
    };
  }, moduleGetter, appModule, router.historyProxy, storeOptions, function (store) {
    var storeState = store.getState();
    var views = storeState.route.data.views;
    checkRedirect(views);
    return beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions,
      toBrowserUrl: toBrowserUrl,
      transformRoute: transformRoute
    }) : store;
  });
}
var exportModule$1 = exportModule;

exports.ActionTypes = ActionTypes;
exports.BaseModelHandlers = BaseModelHandlers;
exports.buildApp = buildApp;
exports.client = client;
exports.connectComponent = connectComponent;
exports.connectPage = connectPage;
exports.delayPromise = delayPromise;
exports.effect = effect;
exports.env = env;
exports.errorAction = errorAction;
exports.exportActions = exportActions;
exports.exportModule = exportModule$1;
exports.isDevelopmentEnv = isDevelopmentEnv;
exports.logger = logger;
exports.modelHotReplacement = modelHotReplacement;
exports.reducer = reducer;
exports.setConfig = setConfig;
exports.setLoading = setLoading;
exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setRouteConfig = setRouteConfig;
exports.viewHotReplacement = viewHotReplacement;
