"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.TaskCounter = exports.PDispatcher = exports.PEvent = exports.LoadingState = exports.TaskCountEvent = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/createSuper"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _env = require("./env");

var TaskCountEvent = 'TaskCountEvent';
exports.TaskCountEvent = TaskCountEvent;
var LoadingState;
exports.LoadingState = LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (exports.LoadingState = LoadingState = {}));

var PEvent = function () {
  function PEvent(name, data, bubbling) {
    if (bubbling === void 0) {
      bubbling = false;
    }

    this.name = name;
    this.data = data;
    this.bubbling = bubbling;
    (0, _defineProperty2.default)(this, "target", null);
    (0, _defineProperty2.default)(this, "currentTarget", null);
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

exports.PEvent = PEvent;

var PDispatcher = function () {
  function PDispatcher(parent) {
    this.parent = parent;
    (0, _defineProperty2.default)(this, "storeHandlers", {});
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

exports.PDispatcher = PDispatcher;

var TaskCounter = function (_PDispatcher) {
  (0, _inheritsLoose2.default)(TaskCounter, _PDispatcher);

  var _super = (0, _createSuper2.default)(TaskCounter);

  function TaskCounter(deferSecond) {
    var _this2;

    _this2 = _PDispatcher.call(this) || this;
    _this2.deferSecond = deferSecond;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "list", []);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "ctimer", null);
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
        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
        this.ctimer = _env.env.setTimeout(function () {
          _this3.ctimer = null;

          if (_this3.list.length > 0) {
            _this3.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
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
          _env.env.clearTimeout(this.ctimer);

          this.ctimer = null;
        }

        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
      }
    }

    return this;
  };

  return TaskCounter;
}(PDispatcher);

exports.TaskCounter = TaskCounter;