"use strict";var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault"),_Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:!0}),exports.getModuleActionCreatorList=getModuleActionCreatorList,exports.MetaData=exports.root=exports.NSP=void 0;var _typeof2=_interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof")),NSP="/";exports.NSP=NSP;var root="object"==("undefined"==typeof self?"undefined":(0,_typeof2.default)(self))&&self.self===self&&self||"object"==("undefined"==typeof global?"undefined":(0,_typeof2.default)(global))&&global.global===global&&global||void 0;exports.root=root;var MetaData={isServer:"undefined"!=typeof global&&"undefined"==typeof window,isDev:"production"!==process.env.NODE_ENV,actionCreatorMap:{},clientStore:null,appModuleName:null};exports.MetaData=MetaData;function getModuleActionCreatorList(a){// if (window["Proxy"]) {
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
if(MetaData.actionCreatorMap[a])return MetaData.actionCreatorMap[a];var b={};return MetaData.actionCreatorMap[a]=b,b}
//# sourceMappingURL=global.js.map