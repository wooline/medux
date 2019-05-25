"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.getModuleActionCreatorList = getModuleActionCreatorList;
exports.MetaData = exports.root = exports.NSP = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

/*global global:true process:true*/
var NSP = '/';
exports.NSP = NSP;
var root = (typeof self === "undefined" ? "undefined" : (0, _typeof2.default)(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : (0, _typeof2.default)(global)) == 'object' && global.global === global && global || void 0;
exports.root = root;
var MetaData = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: {},
  clientStore: null,
  appModuleName: null
};
exports.MetaData = MetaData;

function getModuleActionCreatorList(namespace) {
  // if (window["Proxy"]) {
  //   actions = new window["Proxy"](
  //     {},
  //     {
  //       get: (target: {}, key: string) => {
  //         return (data: any) => ({ type: namespace + "/" + key, data });
  //       }
  //     }
  //   );
  // } else {
  //   actions = getModuleActions(namespace) as any;
  // }
  if (MetaData.actionCreatorMap[namespace]) {
    return MetaData.actionCreatorMap[namespace];
  } else {
    var obj = {};
    MetaData.actionCreatorMap[namespace] = obj;
    return obj;
  }
}
//# sourceMappingURL=global.js.map