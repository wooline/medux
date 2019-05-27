import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.string.includes";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import "regenerator-runtime/runtime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import React from 'react';

function aaa() {
  return _aaa.apply(this, arguments);
}

function _aaa() {
  _aaa = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", Promise.reject(''));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _aaa.apply(this, arguments);
}

var A =
/*#__PURE__*/
function () {
  function A() {}

  var _proto = A.prototype;

  _proto.aaa = function aaa() {
    alert(React);
  };

  return A;
}();

export { A as default };
'foobar'.includes('foo');
aaa();
//# sourceMappingURL=index.js.map