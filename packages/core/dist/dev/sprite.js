"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

require("core-js/modules/es.function.name");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.isPlainObject = isPlainObject;
exports.TaskCounter = exports.PDispatcher = exports.PEvent = exports.LoadingState = exports.TaskCountEvent = void 0;

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/find-index"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/some"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/inherits"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/get-prototype-of"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

function isPlainObject(obj) {
  if ((0, _typeof2.default)(obj) !== 'object' || obj === null) return false;
  var proto = obj;

  while ((0, _getPrototypeOf3.default)(proto) !== null) {
    proto = (0, _getPrototypeOf3.default)(proto);
  }

  return (0, _getPrototypeOf3.default)(obj) === proto;
}

var TaskCountEvent = 'TaskCountEvent';
exports.TaskCountEvent = TaskCountEvent;
var LoadingState;
exports.LoadingState = LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (exports.LoadingState = LoadingState = {}));

var PEvent =
/*#__PURE__*/
function () {
  function PEvent(name, data) {
    var bubbling = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    (0, _classCallCheck2.default)(this, PEvent);
    this.name = name;
    this.data = data;
    this.bubbling = bubbling;
    (0, _defineProperty2.default)(this, "target", null);
    (0, _defineProperty2.default)(this, "currentTarget", null);
  }

  (0, _createClass2.default)(PEvent, [{
    key: "setTarget",
    value: function setTarget(target) {
      this.target = target;
    }
  }, {
    key: "setCurrentTarget",
    value: function setCurrentTarget(target) {
      this.currentTarget = target;
    }
  }]);
  return PEvent;
}();

exports.PEvent = PEvent;

var PDispatcher =
/*#__PURE__*/
function () {
  function PDispatcher(parent) {
    (0, _classCallCheck2.default)(this, PDispatcher);
    this.parent = parent;
    (0, _defineProperty2.default)(this, "storeHandlers", {});
  }

  (0, _createClass2.default)(PDispatcher, [{
    key: "addListener",
    value: function addListener(ename, handler) {
      var dictionary = this.storeHandlers[ename];

      if (!dictionary) {
        this.storeHandlers[ename] = dictionary = [];
      }

      dictionary.push(handler);
      return this;
    }
  }, {
    key: "removeListener",
    value: function removeListener(ename, handler) {
      var _this = this;

      if (!ename) {
        var _context;

        (0, _forEach.default)(_context = (0, _keys.default)(this.storeHandlers)).call(_context, function (key) {
          delete _this.storeHandlers[key];
        });
      } else {
        var handlers = this.storeHandlers;

        if (handlers.propertyIsEnumerable(ename)) {
          var dictionary = handlers[ename];

          if (!handler) {
            delete handlers[ename];
          } else {
            var n = (0, _indexOf.default)(dictionary).call(dictionary, handler);

            if (n > -1) {
              (0, _splice.default)(dictionary).call(dictionary, n, 1);
            }

            if (dictionary.length === 0) {
              delete handlers[ename];
            }
          }
        }
      }

      return this;
    }
  }, {
    key: "dispatch",
    value: function dispatch(evt) {
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
    }
  }, {
    key: "setParent",
    value: function setParent(parent) {
      this.parent = parent;
      return this;
    }
  }]);
  return PDispatcher;
}();

exports.PDispatcher = PDispatcher;

var TaskCounter =
/*#__PURE__*/
function (_PDispatcher) {
  (0, _inherits2.default)(TaskCounter, _PDispatcher);

  function TaskCounter(deferSecond) {
    var _this2;

    (0, _classCallCheck2.default)(this, TaskCounter);
    _this2 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TaskCounter).call(this));
    _this2.deferSecond = deferSecond;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "list", []);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "ctimer", 0);
    return _this2;
  }

  (0, _createClass2.default)(TaskCounter, [{
    key: "addItem",
    value: function addItem(promise) {
      var _context2,
          _this3 = this;

      var note = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (!(0, _some.default)(_context2 = this.list).call(_context2, function (item) {
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
          this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
          this.ctimer = (0, _setTimeout2.default)(function () {
            _this3.ctimer = 0;

            if (_this3.list.length > 0) {
              _this3.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
            }
          }, this.deferSecond * 1000);
        }
      }

      return promise;
    }
  }, {
    key: "completeItem",
    value: function completeItem(promise) {
      var _context3;

      var i = (0, _findIndex.default)(_context3 = this.list).call(_context3, function (item) {
        return item.promise === promise;
      });

      if (i > -1) {
        var _context4;

        (0, _splice.default)(_context4 = this.list).call(_context4, i, 1);

        if (this.list.length === 0) {
          if (this.ctimer) {
            clearTimeout(this.ctimer);
            this.ctimer = 0;
          }

          this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
        }
      }

      return this;
    }
  }]);
  return TaskCounter;
}(PDispatcher);

exports.TaskCounter = TaskCounter;
//# sourceMappingURL=sprite.js.map