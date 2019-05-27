/*global global:true process:true*/export var NSP="/";export var root="object"==typeof self&&self.self===self&&self||"object"==typeof global&&global.global===global&&global||this;export var MetaData={isServer:"undefined"!=typeof global&&"undefined"==typeof window,isDev:"production"!==process.env.NODE_ENV,actionCreatorMap:{},clientStore:null,appModuleName:null};export function getModuleActionCreatorList(a){// if (window["Proxy"]) {
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