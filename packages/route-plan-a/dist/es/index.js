import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from 'deep-extend';
import { config as coreConfig } from '@medux/core';
const config = {
  escape: true,
  dateParse: true,
  splitKey: 'q',
  defaultRouteParams: {}
};
export function setRouteConfig(conf) {
  conf.escape !== undefined && (config.escape = conf.escape);
  conf.dateParse !== undefined && (config.dateParse = conf.dateParse);
  conf.splitKey && (config.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config.defaultRouteParams = conf.defaultRouteParams);
}

// 排除默认路由参数，路由中如果参数值与默认参数相同可省去
function excludeDefaultData(data, def, holde, views) {
  const result = {};
  Object.keys(data).forEach(moduleName => {
    let value = data[moduleName];
    const defaultValue = def[moduleName];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue, !!views && !views[moduleName]);
      }

      if (value !== undefined) {
        result[moduleName] = value;
      }
    }
  });

  if (Object.keys(result).length === 0 && !holde) {
    return undefined;
  }

  return result;
} // 合并默认路由参数，如果路由中某参数没传，将用默认值替代，与上面方法互逆
// function mergeDefaultData(data: {[moduleName: string]: any}, views: {[moduleName: string]: any}) {
//   Object.keys(views).forEach(moduleName => {
//     if (!data[moduleName]) {
//       data[moduleName] = {};
//     }
//   });
//   Object.keys(data).forEach(moduleName => {
//     data[moduleName] = assignDeep({}, defaultRouteParams[moduleName], data[moduleName]);
//   });
// }
// export const mergeDefaultParamsMiddleware: Middleware = () => (next: Function) => (action: any) => {
//   if (action.type === ActionTypes.F_ROUTE_CHANGE) {
//     const payload = getActionData<RouteState>(action);
//     const params = mergeDefaultData(payload.data.views, payload.data.params, defaultRouteParams);
//     action = {...action, payload: {...payload, data: {...payload.data, params}}};
//   }
//   return next(action);
// };


const ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

function dateParse(prop, value) {
  if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
    return new Date(value);
  }

  return value;
} // function getSearch(searchOrHash: string, key: string): string {
//   if (searchOrHash.length < 4) {
//     return '';
//   }
//   const reg = new RegExp(`[&?#]${key}=`);
//   const str = searchOrHash.split(reg)[1];
//   if (!str) {
//     return '';
//   }
//   return str.split('&')[0];
// }

/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/


function searchParse(search) {
  if (!search) {
    return {};
  }

  if (config.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, config.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

function joinSearchString(arr) {
  const strs = [''];

  for (let i = 0, k = arr.length; i < k; i++) {
    strs.push(arr[i] || '');
  }

  return strs.join("&" + config.splitKey + "=");
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  const str = JSON.stringify(searchData);

  if (str === '{}') {
    return '';
  }

  if (config.escape) {
    return escape(str);
  } else {
    return str;
  }
}

function splitSearch(search) {
  const reg = new RegExp("[&?#]" + config.splitKey + "=[^&]*", 'g');
  const arr = search.match(reg);
  let stackParams = [];

  if (arr) {
    stackParams = arr.map(str => {
      return searchParse(str.split('=')[1]);
    });
  }

  return stackParams;
}

function pathnameParse(pathname, routeConfig, paths, args) {
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {
        path: rule,
        exact: !pathConfig
      }); // const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});

      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(coreConfig.VSP)[0];
        const {
          params
        } = match;

        if (params && Object.keys(params).length > 0) {
          args[moduleName] = _objectSpread({}, args[moduleName], params);
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

function compileConfig(routeConfig, parentAbsoluteViewName, viewToRule, ruleToKeys) {
  if (parentAbsoluteViewName === void 0) {
    parentAbsoluteViewName = '';
  }

  if (viewToRule === void 0) {
    viewToRule = {};
  }

  if (ruleToKeys === void 0) {
    ruleToKeys = {};
  }

  // ruleToKeys将每条rule中的params key解析出来
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      if (!ruleToKeys[rule]) {
        const {
          keys
        } = compilePath(rule, {
          end: true,
          strict: false,
          sensitive: false
        });
        ruleToKeys[rule] = keys.reduce((prev, cur) => {
          prev.push(cur.name);
          return prev;
        }, []);
      }

      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
      viewToRule[absoluteViewName] = rule;

      if (pathConfig) {
        compileConfig(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule,
    ruleToKeys
  };
}

function assignRouteData(paths, stackParams, args) {
  if (!stackParams[0]) {
    stackParams[0] = {};
  }

  const firstStackParams = stackParams[0];
  args && assignDeep(firstStackParams, args);
  const views = paths.reduce((prev, cur) => {
    const [moduleName, viewName] = cur.split(coreConfig.VSP);

    if (viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!firstStackParams[moduleName]) {
        firstStackParams[moduleName] = {};
      }
    }

    return prev;
  }, {});
  Object.keys(firstStackParams).forEach(moduleName => {
    firstStackParams[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], firstStackParams[moduleName]);
  });
  const params = assignDeep({}, ...stackParams);
  Object.keys(params).forEach(moduleName => {
    if (!firstStackParams[moduleName]) {
      params[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {
    views,
    paths,
    params,
    stackParams
  };
}

export function fillRouteData(routePayload) {
  const extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  const stackParams = [...extend.stackParams];

  if (routePayload.stackParams) {
    routePayload.stackParams.forEach((item, index) => {
      if (item) {
        stackParams[index] = assignDeep({}, stackParams[index], item);
      }
    });
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function extractHashData(params) {
  const searchParams = {};
  const hashParams = {};

  for (const moduleName in params) {
    if (params[moduleName] && params.hasOwnProperty(moduleName)) {
      const data = params[moduleName];
      const keys = Object.keys(data);

      if (keys.length > 0) {
        keys.forEach(key => {
          if (key.startsWith('_')) {
            if (!hashParams[moduleName]) {
              hashParams[moduleName] = {};
            }

            hashParams[moduleName][key] = data[key];
          } else {
            if (!searchParams[moduleName]) {
              searchParams[moduleName] = {};
            }

            searchParams[moduleName][key] = data[key];
          }
        });
      } else {
        searchParams[moduleName] = {};
      }
    }
  }

  return {
    search: searchStringify(searchParams),
    hash: searchStringify(hashParams)
  };
}

export function buildTransformRoute(routeConfig) {
  const {
    viewToRule,
    ruleToKeys
  } = compileConfig(routeConfig);

  const locationToRoute = location => {
    const paths = [];
    const pathsArgs = {};
    pathnameParse(location.pathname, routeConfig, paths, pathsArgs);
    const stackParams = splitSearch(location.search);
    const hashStackParams = splitSearch(location.hash);
    hashStackParams.forEach((item, index) => {
      item && assignDeep(stackParams[index], item);
    });
    return assignRouteData(paths, stackParams, pathsArgs);
  };

  const routeToLocation = routeData => {
    const {
      views,
      paths,
      params,
      stackParams
    } = routeData;
    const firstStackParams = stackParams[0];
    let pathname = '';
    let firstStackParamsFilter;

    if (paths.length > 0) {
      firstStackParamsFilter = {}; // 将args二层克隆params，因为后面可能会删除path中使用到的变量

      for (const moduleName in firstStackParams) {
        if (firstStackParams[moduleName] && firstStackParams.hasOwnProperty(moduleName)) {
          firstStackParamsFilter[moduleName] = _objectSpread({}, firstStackParams[moduleName]);
        }
      }

      paths.reduce((parentAbsoluteViewName, viewName, index) => {
        const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        const rule = viewToRule[absoluteViewName];
        const moduleName = viewName.split(coreConfig.VSP)[0]; //最深的一个view可以决定pathname

        if (index === paths.length - 1) {
          // const toPath = compileToPath(rule.replace(/\$$/, ''));
          const toPath = compileToPath(rule);
          pathname = toPath(params[moduleName]);
        } //pathname中传递的值可以不在params中重复传递


        const keys = ruleToKeys[rule] || [];
        keys.forEach(key => {
          if (firstStackParamsFilter[moduleName]) {
            delete firstStackParamsFilter[moduleName][key];
          }
        });
        return absoluteViewName;
      }, '');
    } else {
      firstStackParamsFilter = firstStackParams;
    } //将带_前缀的变量放到hashData中


    const arr = [...stackParams];
    arr[0] = excludeDefaultData(firstStackParamsFilter, config.defaultRouteParams, false, views);
    const searchStrings = [];
    const hashStrings = [];
    arr.forEach((params, index) => {
      const {
        search,
        hash
      } = extractHashData(params);
      search && (searchStrings[index] = search);
      hash && (hashStrings[index] = hash);
    });
    return {
      pathname,
      search: '?' + joinSearchString(searchStrings).substr(1),
      hash: '#' + joinSearchString(hashStrings).substr(1)
    };
  };

  return {
    locationToRoute,
    routeToLocation
  };
}
export function fillBrowserRouteData(routePayload) {
  const extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  const stackParams = [...extend.stackParams];

  if (routePayload.params) {
    stackParams[0] = assignDeep({}, stackParams[0], routePayload.params);
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function isBrowserRoutePayload(data) {
  return typeof data !== 'string' && !data['pathname'];
}

export function getBrowserRouteActions(getBrowserHistoryActions) {
  return {
    push(data) {
      let args = data;

      if (isBrowserRoutePayload(data)) {
        args = fillBrowserRouteData(data);
      }

      getBrowserHistoryActions().push(args);
    },

    replace(data) {
      let args = data;

      if (isBrowserRoutePayload(data)) {
        args = fillBrowserRouteData(data);
      }

      getBrowserHistoryActions().replace(args);
    },

    go(n) {
      getBrowserHistoryActions().go(n);
    },

    goBack() {
      getBrowserHistoryActions().goBack();
    },

    goForward() {
      getBrowserHistoryActions().goForward();
    }

  };
} // export function buildTransformRoute(routeConfig: RouteConfig): TransformRoute {
//   const {viewToRule, ruleToKeys} = compileConfig(routeConfig);
//   const locationToRoute: LocationToRoute = location => {
//     const paths: string[] = [];
//     const {stackParams, params} = splitSearch(location.search);
//     //算出paths，并将path参数提取出来并入searchParams中
//     pathnameParse(location.pathname, routeConfig, paths, params);
//     const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
//       const [moduleName, viewName] = cur.split(coreConfig.VSP);
//       if (viewName) {
//         if (!prev[moduleName]) {
//           prev[moduleName] = {};
//         }
//         prev[moduleName]![viewName] = true;
//       }
//       return prev;
//     }, {});
//     const {stackParams: hashStackParams, params: hashParams} = splitSearch(location.hash);
//     //将hash参数并入params中
//     assignDeep(params, hashParams);
//     hashStackParams.forEach((item, index) => {
//       item && assignDeep(stackParams[index], item);
//     });
//     mergeDefaultData(params, views);
//     return {paths, params, views, stackParams};
//   };
//   const routeToLocation: RouteToLocation = routeData => {
//     const {paths, params, stackParams} = routeData;
//     const mainStackParams = stackParams[0] || {};
//     let pathname = '';
//     let args: {[moduleName: string]: {[key: string]: any} | undefined};
//     if (paths.length > 0) {
//       args = {};
//       // 将args二层克隆params，因为后面可能会删除path中使用到的变量
//       for (const moduleName in mainStackParams) {
//         if (mainStackParams[moduleName] && mainStackParams.hasOwnProperty(moduleName)) {
//           args[moduleName] = {...mainStackParams[moduleName]};
//         }
//       }
//       paths.reduce((parentAbsoluteViewName, viewName, index) => {
//         const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
//         const rule = viewToRule[absoluteViewName];
//         const moduleName = viewName.split(coreConfig.VSP)[0];
//         //最深的一个view可以决定pathname
//         if (index === paths.length - 1) {
//           // const toPath = compileToPath(rule.replace(/\$$/, ''));
//           const toPath = compileToPath(rule);
//           pathname = toPath(params[moduleName]);
//         }
//         //pathname中传递的值可以不在params中重复传递
//         const keys = ruleToKeys[rule] || [];
//         keys.forEach(key => {
//           if (args[moduleName]) {
//             delete args[moduleName]![key];
//           }
//         });
//         return absoluteViewName;
//       }, '');
//     } else {
//       args = mainStackParams;
//     }
//     //将带_前缀的变量放到hashData中
//     const searchData = {};
//     const hashData = {};
//     for (const moduleName in args) {
//       if (args[moduleName] && args.hasOwnProperty(moduleName)) {
//         const data = args[moduleName]!;
//         const keys = Object.keys(data);
//         if (keys.length > 0) {
//           keys.forEach(key => {
//             if (key.startsWith('_')) {
//               if (!hashData[moduleName]) {
//                 hashData[moduleName] = {};
//               }
//               hashData[moduleName][key] = data[key];
//             } else {
//               if (!searchData[moduleName]) {
//                 searchData[moduleName] = {};
//               }
//               searchData[moduleName][key] = data[key];
//             }
//           });
//         }
//       }
//     }
//     return {
//       pathname,
//       search: searchStringify(excludeDefaultData(searchData, defaultRouteParams)),
//       hash: searchStringify(excludeDefaultData(hashData, defaultRouteParams)),
//     };
//   };
//   return {
//     locationToRoute,
//     routeToLocation,
//   };
// }

/**
 '/:articleType/:articleId/comments/:itemId'
 www.aa.com/photos/1/comments/23?p={}&p=

 paths:["app.Main", "photos.detail", "comments.detail"]
 params:{app:{},photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222},comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}
 stackParams:[{app:{}}, {photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222}}, {comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}]
 stackParams:[{app:{},photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222},comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}]

 web: www.aa.com/photos/1/comments/23?p={comments:{searchList:{page:2}}}#p={photos:{_listkey:222222}, comments:{_listkey:222222}}

 rn: www.aa.com/photos/1/comments/23?p={app:{}}&p={photos:{}}&p={comments:{searchList:{page:2}}}#p={}&p={photos:{_listkey:222222}}&p={comments:{_listkey:222222}}

 routeData -> location
1.根据paths得到匹配表达式：'/:articleType/:articleId/comments/:itemId'
2.根据params填充表达式得到：www.aa.com/photos/1/comments/23
3.将params中带_的提取为hash
不作缩减将得到：
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{itemid:1,searchList:{page:1,pageSize:10}}}&
p={comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
4.缩减默认值：
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{itemid:1}}&
p={comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
5.缩减路径传参
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{}}&
p={comments:{searchList:{page:2}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}



 location->routeData
1.解析出paths、views、pathArgs
2.

 */
//# sourceMappingURL=index.js.map