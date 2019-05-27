/*global global:true process:true*/
export var NSP = '/';
export var root = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || this;
export var MetaData = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: {},
  clientStore: null,
  appModuleName: null
};
export function getModuleActionCreatorList(namespace) {
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