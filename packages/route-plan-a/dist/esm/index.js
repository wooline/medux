import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from 'deep-extend';
import { config as coreConfig } from '@medux/core';
var config = {
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
  var result = {};
  Object.keys(data).forEach(function (moduleName) {
    var value = data[moduleName];
    var defaultValue = def[moduleName];

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


var ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

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
  var strs = [''];

  for (var i = 0, k = arr.length; i < k; i++) {
    strs.push(arr[i] || '');
  }

  return strs.join("&" + config.splitKey + "=");
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  var str = JSON.stringify(searchData);

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
  var reg = new RegExp("[&?#]" + config.splitKey + "=[^&]*", 'g');
  var arr = search.match(reg);
  var stackParams = [];

  if (arr) {
    stackParams = arr.map(function (str) {
      return searchParse(str.split('=')[1]);
    });
  }

  return stackParams;
}

function checkPathArgs(params) {
  var obj = {};

  for (var _key in params) {
    if (params.hasOwnProperty(_key)) {
      (function () {
        var val = params[_key];

        var props = _key.split('.');

        if (props.length > 1) {
          props.reduce(function (prev, cur, index, arr) {
            if (index === arr.length - 1) {
              prev[cur] = val;
            } else {
              prev[cur] = {};
            }

            return prev[cur];
          }, obj);
        } else {
          obj[_key] = val;
        }
      })();
    }
  }

  return obj;
}

function pathnameParse(pathname, routeConfig, paths, args) {
  for (var _rule in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule)) {
      var item = routeConfig[_rule];

      var _ref = typeof item === 'string' ? [item, null] : item,
          _viewName = _ref[0],
          pathConfig = _ref[1];

      var match = matchPath(pathname, {
        path: _rule,
        exact: !pathConfig
      }); // const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});

      if (match) {
        paths.push(_viewName);

        var _moduleName = _viewName.split(coreConfig.VSP)[0];

        var params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName] = _objectSpread({}, args[_moduleName], {}, checkPathArgs(params));
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
  for (var _rule2 in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule2)) {
      if (!ruleToKeys[_rule2]) {
        var _compilePath = compilePath(_rule2, {
          end: true,
          strict: false,
          sensitive: false
        }),
            keys = _compilePath.keys;

        ruleToKeys[_rule2] = keys.reduce(function (prev, cur) {
          prev.push(cur.name);
          return prev;
        }, []);
      }

      var item = routeConfig[_rule2];

      var _ref2 = typeof item === 'string' ? [item, null] : item,
          _viewName2 = _ref2[0],
          pathConfig = _ref2[1];

      var absoluteViewName = parentAbsoluteViewName + '/' + _viewName2;
      viewToRule[absoluteViewName] = _rule2;

      if (pathConfig) {
        compileConfig(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule: viewToRule,
    ruleToKeys: ruleToKeys
  };
}

function assignRouteData(paths, stackParams, args) {
  if (!stackParams[0]) {
    stackParams[0] = {};
  }

  if (args) {
    stackParams[0] = assignDeep({}, args, stackParams[0]);
  }

  var firstStackParams = stackParams[0];
  var views = paths.reduce(function (prev, cur) {
    var _cur$split = cur.split(coreConfig.VSP),
        moduleName = _cur$split[0],
        viewName = _cur$split[1];

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
  Object.keys(firstStackParams).forEach(function (moduleName) {
    firstStackParams[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], firstStackParams[moduleName]);
  });
  var params = assignDeep.apply(void 0, [{}].concat(stackParams));
  Object.keys(params).forEach(function (moduleName) {
    if (!firstStackParams[moduleName]) {
      params[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {
    views: views,
    paths: paths,
    params: params,
    stackParams: stackParams
  };
}

export function fillRouteData(routePayload) {
  var extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  var stackParams = [].concat(extend.stackParams);

  if (routePayload.stackParams) {
    routePayload.stackParams.forEach(function (item, index) {
      if (item) {
        stackParams[index] = assignDeep({}, stackParams[index], item);
      }
    });
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function extractHashData(params) {
  var searchParams = {};
  var hashParams = {};

  var _loop = function _loop(_moduleName2) {
    if (params[_moduleName2] && params.hasOwnProperty(_moduleName2)) {
      var _data = params[_moduleName2];
      var keys = Object.keys(_data);

      if (keys.length > 0) {
        keys.forEach(function (key) {
          if (key.startsWith('_')) {
            if (!hashParams[_moduleName2]) {
              hashParams[_moduleName2] = {};
            }

            hashParams[_moduleName2][key] = _data[key];
          } else {
            if (!searchParams[_moduleName2]) {
              searchParams[_moduleName2] = {};
            }

            searchParams[_moduleName2][key] = _data[key];
          }
        });
      } else {
        searchParams[_moduleName2] = {};
      }
    }
  };

  for (var _moduleName2 in params) {
    _loop(_moduleName2);
  }

  return {
    search: searchStringify(searchParams),
    hash: searchStringify(hashParams)
  };
}

export function buildTransformRoute(routeConfig) {
  var _compileConfig = compileConfig(routeConfig),
      viewToRule = _compileConfig.viewToRule,
      ruleToKeys = _compileConfig.ruleToKeys;

  var locationToRoute = function locationToRoute(location) {
    var paths = [];
    var pathsArgs = {};
    pathnameParse(location.pathname, routeConfig, paths, pathsArgs);
    var stackParams = splitSearch(location.search);
    var hashStackParams = splitSearch(location.hash);
    hashStackParams.forEach(function (item, index) {
      if (item) {
        if (!stackParams[index]) {
          stackParams[index] = {};
        }

        assignDeep(stackParams[index], item);
      }
    });
    return assignRouteData(paths, stackParams, pathsArgs);
  };

  var routeToLocation = function routeToLocation(routeData) {
    var views = routeData.views,
        paths = routeData.paths,
        params = routeData.params,
        stackParams = routeData.stackParams;
    var firstStackParams = stackParams[0];
    var pathname = '';
    var firstStackParamsFilter;

    if (paths.length > 0) {
      // 将args深克隆，因为后面可能会删除path中使用到的变量
      firstStackParamsFilter = assignDeep({}, firstStackParams);
      paths.reduce(function (parentAbsoluteViewName, viewName, index) {
        var absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        var rule = viewToRule[absoluteViewName];
        var moduleName = viewName.split(coreConfig.VSP)[0]; //最深的一个view可以决定pathname

        if (index === paths.length - 1) {
          // const toPath = compileToPath(rule.replace(/\$$/, ''));
          var toPath = compileToPath(rule);

          var _keys = ruleToKeys[rule] || [];

          var args = _keys.reduce(function (prev, cur) {
            if (typeof cur === 'string') {
              var props = cur.split('.');

              if (props.length) {
                prev[cur] = props.reduce(function (p, c) {
                  return p[c];
                }, params[moduleName]);
                return prev;
              }
            }

            prev[cur] = params[moduleName][cur];
            return prev;
          }, {});

          pathname = toPath(args);
        } //pathname中传递的值可以不在params中重复传递


        var keys = ruleToKeys[rule] || [];
        keys.forEach(function (key) {
          if (typeof key === 'string') {
            var props = key.split('.');

            if (props.length) {
              props.reduce(function (p, c, i) {
                if (i === props.length - 1) {
                  delete p[c];
                }

                return p[c] || {};
              }, firstStackParamsFilter[moduleName] || {});
              return;
            }
          }

          if (firstStackParamsFilter[moduleName]) {
            delete firstStackParamsFilter[moduleName][key];
          }
        });
        return absoluteViewName;
      }, '');
    } else {
      firstStackParamsFilter = firstStackParams;
    } //将带_前缀的变量放到hashData中


    var arr = [].concat(stackParams);
    arr[0] = excludeDefaultData(firstStackParamsFilter, config.defaultRouteParams, false, views);
    var searchStrings = [];
    var hashStrings = [];
    arr.forEach(function (params, index) {
      var _extractHashData = extractHashData(params),
          search = _extractHashData.search,
          hash = _extractHashData.hash;

      search && (searchStrings[index] = search);
      hash && (hashStrings[index] = hash);
    });
    return {
      pathname: pathname,
      search: '?' + joinSearchString(searchStrings).substr(1),
      hash: '#' + joinSearchString(hashStrings).substr(1)
    };
  };

  return {
    locationToRoute: locationToRoute,
    routeToLocation: routeToLocation
  };
}
export function fillBrowserRouteData(routePayload) {
  var extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  var stackParams = [].concat(extend.stackParams);

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
    push: function push(data) {
      var args = data;

      if (isBrowserRoutePayload(data)) {
        args = fillBrowserRouteData(data);
      }

      getBrowserHistoryActions().push(args);
    },
    replace: function replace(data) {
      var args = data;

      if (isBrowserRoutePayload(data)) {
        args = fillBrowserRouteData(data);
      }

      getBrowserHistoryActions().replace(args);
    },
    go: function go(n) {
      getBrowserHistoryActions().go(n);
    },
    goBack: function goBack() {
      getBrowserHistoryActions().goBack();
    },
    goForward: function goForward() {
      getBrowserHistoryActions().goForward();
    }
  };
}
export function buildToBrowserUrl(getTransformRoute) {
  function toUrl() {
    for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length === 1) {
      var _location = getTransformRoute().routeToLocation(fillBrowserRouteData(args[0]));

      args = [_location.pathname, _location.search, _location.hash];
    }

    var _ref3 = args,
        pathname = _ref3[0],
        search = _ref3[1],
        hash = _ref3[2];
    var url = pathname;

    if (search) {
      url += search;
    }

    if (hash) {
      url += hash;
    }

    return url;
  }

  return toUrl;
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