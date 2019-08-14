"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;
exports.exportModule = exports.loadView = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _core = require("@medux/core");

var _reactRedux = require("react-redux");

function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return (0, _core.renderApp)(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return _react.default.createElement(_reactRedux.Provider, {
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

  return (0, _core.renderSSR)(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();

    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return _react.default.createElement(_reactRedux.Provider, {
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

var loadView = function loadView(moduleGetter, moduleName, viewName, Loading) {
  var _temp;

  return _temp =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inheritsLoose2.default)(Loader, _React$Component);

    function Loader() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
        Component: null
      });
      return _this;
    }

    var _proto = Loader.prototype;

    _proto.componentDidMount = function componentDidMount() {
      var _this2 = this;

      var moduleViewResult = (0, _core.getView)(moduleGetter, moduleName, viewName);

      if ((0, _core.isPromiseView)(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          Object.keys(Loader).forEach(function (key) {
            return Component[key] = Loader[key];
          });
          Object.keys(Component).forEach(function (key) {
            return Loader[key] = Component[key];
          });

          _this2.setState({
            Component: Component
          });
        });
      } else {
        Object.keys(Loader).forEach(function (key) {
          return moduleViewResult[key] = Loader[key];
        });
        Object.keys(moduleViewResult).forEach(function (key) {
          return Loader[key] = moduleViewResult[key];
        });
        this.setState({
          Component: moduleViewResult
        });
      }
    };

    _proto.render = function render() {
      var Component = this.state.Component;
      return Component ? _react.default.createElement(Component, this.props) : Loading ? _react.default.createElement(Loading, this.props) : null;
    };

    return Loader;
  }(_react.default.Component), _temp;
};

exports.loadView = loadView;
var exportModule = _core.exportModule;
exports.exportModule = exportModule;
//# sourceMappingURL=index.js.map