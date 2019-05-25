"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

require("regenerator-runtime/runtime");

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _react = _interopRequireDefault(require("react"));

var _context;

function aaa() {
  return _aaa.apply(this, arguments);
}

function _aaa() {
  _aaa = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    return _regenerator.default.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", _promise.default.reject(''));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee);
  }));
  return _aaa.apply(this, arguments);
}

var A =
/*#__PURE__*/
function () {
  function A() {
    (0, _classCallCheck2.default)(this, A);
  }

  (0, _createClass2.default)(A, [{
    key: "aaa",
    value: function aaa() {
      alert(_react.default);
    }
  }]);
  return A;
}();

exports.default = A;
(0, _includes.default)(_context = 'foobar').call(_context, 'foo');
aaa();
//# sourceMappingURL=index.js.map