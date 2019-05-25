"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.constructor");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/web.dom-collections.iterator");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.invalidview = invalidview;
exports.buildStore = buildStore;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/some"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/toConsumableArray"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _redux = require("redux");

var _global = require("./global");

var _sprite = require("sprite");

var _actions = require("actions");

var invalidViewTimer;

function checkInvalidview() {
  invalidViewTimer = 0;
  var currentViews = _global.MetaData.clientStore._meta_.currentViews;
  var views = {};

  for (var moduleName in currentViews) {
    if (currentViews.hasOwnProperty(moduleName)) {
      var element = currentViews[moduleName];

      for (var viewname in element) {
        if (element[viewname]) {
          if (!views[moduleName]) {
            views[moduleName] = {};
          }

          views[moduleName][viewname] = element[viewname];
        }
      }
    }
  }

  _global.MetaData.clientStore.dispatch((0, _actions.viewInvalidAction)(views));
}

function invalidview() {
  if (!invalidViewTimer) {
    invalidViewTimer = (0, _setTimeout2.default)(checkInvalidview, 4);
  }
}

function getActionData(action) {
  var _context;

  var arr = (0, _filter.default)(_context = (0, _keys.default)(action)).call(_context, function (key) {
    return key !== 'type' && key !== 'priority' && key !== 'time';
  });

  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    var data = (0, _objectSpread2.default)({}, action);
    delete data['type'];
    delete data['priority'];
    delete data['time'];
    return data;
  }
}

function simpleEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  } else if ((0, _typeof2.default)(obj1) !== (0, _typeof2.default)(obj2) || (0, _typeof2.default)(obj1) !== 'object') {
    return false;
  } else {
    var keys1 = (0, _keys.default)(obj1);
    var keys2 = (0, _keys.default)(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    } else {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator2.default)(keys1), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _key = _step.value;

          if (!simpleEqual(obj1[_key], obj2[_key])) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }
  }
}

function buildStore() {
  var _context4, _context5;

  var preloadedState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var storeReducers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var storeMiddlewares = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var storeEnhancers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  if (!(0, _sprite.isPlainObject)(preloadedState)) {
    throw new Error('preloadedState must be plain objects!');
  }

  if (!(0, _sprite.isPlainObject)(storeReducers)) {
    throw new Error('storeReducers must be plain objects!');
  }

  var store;

  var combineReducers = function combineReducers(rootState, action) {
    var _context2, _context3;

    if (!store) {
      return rootState;
    }

    var meta = store._meta_;
    meta.prevState = rootState;
    var currentState = (0, _objectSpread2.default)({}, rootState);
    meta.currentState = currentState;

    if (!currentState.views) {
      currentState.views = {};
    }

    (0, _forEach.default)(_context2 = (0, _keys.default)(storeReducers)).call(_context2, function (namespace) {
      currentState[namespace] = storeReducers[namespace](currentState[namespace], action);
    });

    if (action.type === _actions.ActionTypes.F_VIEW_INVALID) {
      var views = getActionData(action);

      if (!simpleEqual(currentState.views, views)) {
        currentState.views = views;
      }
    }

    var handlersCommon = meta.reducerMap[action.type] || {}; // 支持泛监听，形如 */loading

    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^".concat(_global.NSP, "]+")), '*')] || {};
    var handlers = (0, _objectSpread2.default)({}, handlersCommon, handlersEvery);
    var handlerModules = (0, _keys.default)(handlers);

    if (handlerModules.length > 0) {
      var orderList = action.priority ? (0, _toConsumableArray2.default)(action.priority) : [];
      (0, _forEach.default)(handlerModules).call(handlerModules, function (namespace) {
        var fun = handlers[namespace];

        if (fun.__isHandler__) {
          orderList.push(namespace);
        } else {
          orderList.unshift(namespace);
        }
      });
      var moduleNameMap = {};
      (0, _forEach.default)(orderList).call(orderList, function (namespace) {
        if (!moduleNameMap[namespace]) {
          moduleNameMap[namespace] = true;
          var fun = handlers[namespace];
          currentState[namespace] = fun(getActionData(action));
        }
      });
    }

    var changed = (0, _keys.default)(rootState).length !== (0, _keys.default)(currentState).length || (0, _some.default)(_context3 = (0, _keys.default)(rootState)).call(_context3, function (namespace) {
      return rootState[namespace] !== currentState[namespace];
    });
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  var middleware = function middleware() {
    return function (next) {
      return function (originalAction) {
        if (_global.MetaData.isServer) {
          if (originalAction.type.split(_global.NSP)[1] === _actions.ActionTypes.M_LOADING) {
            return originalAction;
          }
        }

        var action = next(originalAction);
        var handlersCommon = store._meta_.effectMap[action.type] || {}; // 支持泛监听，形如 */loading

        var handlersEvery = store._meta_.effectMap[action.type.replace(new RegExp("[^".concat(_global.NSP, "]+")), '*')] || {};
        var handlers = (0, _objectSpread2.default)({}, handlersCommon, handlersEvery);
        var handlerModules = (0, _keys.default)(handlers);

        if (handlerModules.length > 0) {
          var orderList = action.priority ? (0, _toConsumableArray2.default)(action.priority) : [];
          (0, _forEach.default)(handlerModules).call(handlerModules, function (namespace) {
            var fun = handlers[namespace];

            if (fun.__isHandler__) {
              orderList.push(namespace);
            } else {
              orderList.unshift(namespace);
            }
          });
          var moduleNameMap = {};
          var promiseResults = [];
          (0, _forEach.default)(orderList).call(orderList, function (namespace) {
            if (!moduleNameMap[namespace]) {
              moduleNameMap[namespace] = true;
              var fun = handlers[namespace];
              var effectResult = fun(getActionData(action));
              var decorators = fun.__decorators__;

              if (decorators) {
                var results = [];
                (0, _forEach.default)(decorators).call(decorators, function (decorator, index) {
                  results[index] = decorator[0](action, namespace, effectResult);
                });
                fun.__decoratorResults__ = results;
              }

              effectResult.then(function (reslove) {
                if (decorators) {
                  var _results = fun.__decoratorResults__ || [];

                  (0, _forEach.default)(decorators).call(decorators, function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Resolved', _results[index], reslove);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                return reslove;
              }, function (reject) {
                if (decorators) {
                  var _results2 = fun.__decoratorResults__ || [];

                  (0, _forEach.default)(decorators).call(decorators, function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Rejected', _results2[index], reject);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }
              });
              promiseResults.push(effectResult);
            }
          });

          if (promiseResults.length) {
            return _promise.default.all(promiseResults);
          }
        }

        return action;
      };
    };
  }; // const enhancers = [applyMiddleware(...[effectMiddleware, routerMiddleware(storeHistory), ...storeMiddlewares]), ...storeEnhancers];
  // if (MetaData.isBrowser && MetaData.isDev && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
  //
  // __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  // enhancers.push(window["__REDUX_DEVTOOLS_EXTENSION__"](window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"]));
  // }
  // store = createStore(combineReducers as any, initData, compose(...enhancers));


  var middlewareEnhancer = _redux.applyMiddleware.apply(void 0, (0, _concat.default)(_context4 = (0, _toConsumableArray2.default)(storeMiddlewares)).call(_context4, [middleware]));

  var enhancer = function enhancer(newCreateStore) {
    return function () {
      var newStore = newCreateStore.apply(void 0, arguments);
      var modelStore = newStore;
      modelStore._meta_ = {
        prevState: {
          router: null
        },
        currentState: {
          router: null
        },
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        currentViews: {}
      };
      return newStore;
    };
  };

  var enhancers = (0, _concat.default)(_context5 = []).call(_context5, (0, _toConsumableArray2.default)(storeEnhancers), [middlewareEnhancer, enhancer]);

  if (_global.MetaData.isDev && _global.root.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(_global.root.__REDUX_DEVTOOLS_EXTENSION__(_global.root.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = (0, _redux.createStore)(combineReducers, preloadedState, _redux.compose.apply(void 0, (0, _toConsumableArray2.default)(enhancers)));
  _global.MetaData.clientStore = store;

  if (!_global.MetaData.isServer) {
    _global.root.onerror = function (evt, source, fileno, columnNumber, error) {
      store.dispatch((0, _actions.errorAction)(error || evt));
    };

    if ('onunhandledrejection' in _global.root) {
      _global.root.onunhandledrejection = function (error) {
        store.dispatch((0, _actions.errorAction)(error.reason));
      };
    }
  }

  return store;
}
//# sourceMappingURL=store.js.map