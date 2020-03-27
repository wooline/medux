'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'));
var _objectWithoutPropertiesLoose = _interopDefault(require('@babel/runtime/helpers/objectWithoutPropertiesLoose'));
var core = require('@medux/core');
var React = require('react');
var React__default = _interopDefault(React);
var reactRedux = require('react-redux');

function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return core.renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      return React__default.createElement(reactRedux.Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
function renderSSR(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return core.renderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();

    var ReduxProvider = function ReduxProvider(props) {
      return React__default.createElement(reactRedux.Provider, {
        store: store
      }, props.children);
    };

    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
var loadView = function loadView(moduleName, viewName, options, Loading) {
  var _ref = options || {},
      forwardRef = _ref.forwardRef,
      modelOptions = _objectWithoutPropertiesLoose(_ref, ["forwardRef"]);

  var Loader = function ViewLoader(props) {
    var _useState = React.useState(function () {
      var moduleViewResult = core.getView(moduleName, viewName, modelOptions);

      if (core.isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          setView({
            Component: Component
          });
        });
        return null;
      } else {
        return {
          Component: moduleViewResult
        };
      }
    }),
        view = _useState[0],
        setView = _useState[1];

    var forwardRef = props.forwardRef,
        other = _objectWithoutPropertiesLoose(props, ["forwardRef"]);

    var ref = forwardRef ? {
      ref: forwardRef
    } : {};
    return view ? React__default.createElement(view.Component, _extends({}, other, ref)) : Loading ? React__default.createElement(Loading, props) : null;
  };

  var Component = forwardRef ? React__default.forwardRef(function (props, ref) {
    return React__default.createElement(Loader, _extends({}, props, {
      forwardRef: ref
    }));
  }) : Loader;
  return Component;
};
var exportModule = core.exportModule;

exports.exportModule = exportModule;
exports.loadView = loadView;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;
