import _decorate from "@babel/runtime/helpers/esm/decorate";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { CoreModuleHandlers, reducer, moduleInitAction } from '@medux/core';
import { compileToPath, matchPath } from './matchPath';
import { RouteActionTypes, routeConfig, checkLocation, compileRule, urlToLocation, routeChangeAction, beforeRouteChangeAction, routeParamsAction } from './basic';
import assignDeep from './deep-extend';
export const deepAssign = assignDeep;
export { setRouteConfig } from './basic';

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
}

const ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

function dateParse(prop, value) {
  if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
    return new Date(value);
  }

  return value;
}

function searchParse(search) {
  if (!search) {
    return {};
  }

  if (routeConfig.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, routeConfig.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  const str = JSON.stringify(searchData);

  if (str === '{}') {
    return '';
  }

  if (routeConfig.escape) {
    return escape(str);
  }

  return str;
}

function splitSearch(search) {
  const reg = new RegExp(`[?&#]${routeConfig.splitKey}=([^&]+)`);
  const arr = search.match(reg);

  if (arr) {
    return searchParse(arr[1]);
  }

  return {};
}

function checkPathArgs(params) {
  const obj = {};

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const val = params[key];
      const props = key.split('.');

      if (props.length > 1) {
        props.reduce((prev, cur, index, arr) => {
          if (index === arr.length - 1) {
            prev[cur] = val;
          } else {
            prev[cur] = {};
          }

          return prev[cur];
        }, obj);
      } else {
        obj[key] = val;
      }
    }
  }

  return obj;
}

function pathnameParse(pathname, routeRule, paths, args) {
  for (const rule in routeRule) {
    if (routeRule.hasOwnProperty(rule)) {
      const item = routeRule[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {
        path: rule.replace(/\$$/, ''),
        exact: !pathConfig
      });

      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(routeConfig.VSP)[0];
        const {
          params
        } = match;

        if (params && Object.keys(params).length > 0) {
          args[moduleName] = Object.assign(args[moduleName] || {}, checkPathArgs(params));
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

export function assignRouteData(paths, params, defaultRouteParams) {
  const views = paths.reduce((prev, cur) => {
    const [moduleName, viewName] = cur.split(routeConfig.VSP);

    if (moduleName && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!params[moduleName]) {
        params[moduleName] = undefined;
      }
    }

    return prev;
  }, {});
  Object.keys(params).forEach(moduleName => {
    if (defaultRouteParams[moduleName]) {
      params[moduleName] = assignDeep({}, defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {
    views,
    paths,
    params
  };
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

const cacheData = [];

function getPathProps(pathprops, moduleParas = {}, deleteIt) {
  let val;

  if (typeof pathprops === 'string' && pathprops.indexOf('.') > -1) {
    const props = pathprops.split('.');
    const len = props.length - 1;
    props.reduce((p, c, i) => {
      if (i === len) {
        val = p[c];
        deleteIt && delete p[c];
      }

      return p[c] || {};
    }, moduleParas);
  } else {
    val = moduleParas[pathprops];
    deleteIt && delete moduleParas[pathprops];
  }

  return val;
}

function pathsToPathname(paths, params = {}, viewToRule, ruleToKeys) {
  const len = paths.length - 1;
  const paramsFilter = assignDeep({}, params);
  let pathname = '';
  const views = {};
  paths.reduce((parentAbsoluteViewName, viewName, index) => {
    const [moduleName, view] = viewName.split(routeConfig.VSP);
    const absoluteViewName = `${parentAbsoluteViewName}/${viewName}`;
    const rule = viewToRule[absoluteViewName];
    const keys = ruleToKeys[rule] || [];

    if (moduleName && view) {
      if (!views[moduleName]) {
        views[moduleName] = {};
      }

      views[moduleName][view] = true;
    }

    if (index === len) {
      const toPath = compileToPath(rule);
      const args = keys.reduce((prev, cur) => {
        prev[cur] = getPathProps(cur, params[moduleName]);
        return prev;
      }, {});
      pathname = toPath(args);
    }

    keys.forEach(key => {
      getPathProps(key, paramsFilter[moduleName], true);
    });
    return absoluteViewName;
  }, '');
  return {
    pathname,
    views,
    params: paramsFilter
  };
}

export class BaseHistoryActions {
  constructor(nativeHistory, defaultRouteParams, initUrl, routeRule, locationMap) {
    this.nativeHistory = nativeHistory;
    this.defaultRouteParams = defaultRouteParams;
    this.initUrl = initUrl;
    this.routeRule = routeRule;
    this.locationMap = locationMap;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "_startupRouteState", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "_viewToRule", void 0);

    _defineProperty(this, "_ruleToKeys", void 0);

    const {
      viewToRule,
      ruleToKeys
    } = compileRule(routeRule);
    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
    const safeLocation = urlToLocation(initUrl);

    const routeState = this._createRouteState(safeLocation, 'RELAUNCH', '');

    this._routeState = routeState;
    this._startupRouteState = routeState;
    nativeHistory.relaunch(routeState);
  }

  setStore(_store) {
    this.store = _store;
  }

  mergeInitState(initState) {
    const routeState = this.getRouteState();
    const data = Object.assign({}, initState, {
      route: routeState
    });
    Object.keys(routeState.views).forEach(moduleName => {
      if (!data[moduleName]) {
        data[moduleName] = {};
      }

      data[moduleName] = Object.assign({}, data[moduleName], {
        routeParams: routeState.params[moduleName]
      });
    });
    return data;
  }

  getModulePath() {
    return this.getRouteState().paths.map(viewName => viewName.split(routeConfig.VSP)[0]);
  }

  getCurKey() {
    return this._routeState.key;
  }

  getRouteState() {
    return this._routeState;
  }

  locationToUrl(safeLocation) {
    return safeLocation.pathname + safeLocation.search + safeLocation.hash;
  }

  locationToRoute(safeLocation) {
    const url = this.locationToUrl(safeLocation);
    const item = cacheData.find(val => {
      return val && val.url === url;
    });

    if (item) {
      return item.routeData;
    }

    const pathname = safeLocation.pathname;
    const paths = [];
    const pathsArgs = {};
    pathnameParse(pathname, this.routeRule, paths, pathsArgs);
    const params = splitSearch(safeLocation.search);
    const hashParams = splitSearch(safeLocation.hash);
    assignDeep(params, hashParams);
    const routeData = assignRouteData(paths, assignDeep(pathsArgs, params), this.defaultRouteParams);
    cacheData.unshift({
      url,
      routeData
    });
    cacheData.length = 100;
    return routeData;
  }

  routeToLocation(paths, params) {
    params = params || {};
    let views = {};
    const data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
    const pathname = data.pathname;
    params = data.params;
    views = data.views;
    const paramsFilter = excludeDefaultData(params, this.defaultRouteParams, false, views);
    const {
      search,
      hash
    } = extractHashData(paramsFilter);
    return {
      pathname,
      search: search ? `?${routeConfig.splitKey}=${search}` : '',
      hash: hash ? `#${routeConfig.splitKey}=${hash}` : ''
    };
  }

  payloadToRoute(data) {
    if (typeof data === 'string') {
      return this.locationToRoute(urlToLocation(data));
    }

    if (data.pathname && !data.extendParams && !data.params) {
      return this.locationToRoute(checkLocation(data));
    }

    const clone = Object.assign({}, data);

    if (clone.extendParams === true) {
      clone.extendParams = this.getRouteState().params;
    }

    if (clone.pathname) {
      clone.paths = [];
      clone.params = {};
      pathnameParse(clone.pathname, this.routeRule, clone.paths, clone.params);
      assignDeep(clone.params, data.params);
    }

    if (!clone.paths) {
      clone.paths = this.getRouteState().paths;
    }

    const params = clone.extendParams ? assignDeep({}, clone.extendParams, clone.params) : clone.params;
    return assignRouteData(clone.paths, params || {}, this.defaultRouteParams);
  }

  payloadToLocation(data) {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }

    if (data.pathname && !data.extendParams && !data.params) {
      return checkLocation(data);
    }

    const clone = Object.assign({}, data);

    if (clone.extendParams === true) {
      clone.extendParams = this.getRouteState().params;
    }

    if (clone.pathname) {
      clone.paths = [];
      clone.params = {};
      pathnameParse(clone.pathname, this.routeRule, clone.paths, clone.params);
      assignDeep(clone.params, data.params);
    }

    if (!clone.paths) {
      clone.paths = this.getRouteState().paths;
    }

    const params = clone.extendParams ? assignDeep({}, clone.extendParams, clone.params) : clone.params;
    return this.routeToLocation(clone.paths, params);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  _getEfficientLocation(safeLocation) {
    const routeData = this.locationToRoute(safeLocation);

    if (routeData.views['@']) {
      const url = Object.keys(routeData.views['@'])[0];
      const reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation);
    }

    return {
      location: safeLocation,
      routeData
    };
  }

  _buildHistory(location) {
    const maxLength = routeConfig.historyMax;
    const {
      action,
      url,
      pathname,
      key
    } = location;
    const {
      history,
      stack
    } = this._routeState || {
      history: [],
      stack: []
    };

    const uri = this._urlToUri(url, key);

    let historyList = [...history];
    let stackList = [...stack];

    if (action === 'RELAUNCH') {
      historyList = [uri];
      stackList = [pathname];
    } else if (action === 'PUSH') {
      historyList.unshift(uri);

      if (historyList.length > maxLength) {
        historyList.length = maxLength;
      }

      if (stackList[0] !== pathname) {
        stackList.unshift(pathname);
      }

      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else if (action === 'REPLACE') {
      historyList[0] = uri;

      if (stackList[0] !== pathname) {
        const cpathname = this._uriToPathname(historyList[1]);

        if (cpathname !== stackList[0]) {
          stackList.shift();
        }

        if (stackList[0] !== pathname) {
          stackList.unshift(pathname);
        }

        if (stackList.length > maxLength) {
          stackList.length = maxLength;
        }
      }
    } else if (action.startsWith('POP')) {
      const n = parseInt(action.replace('POP', ''), 10) || 1;
      const arr = historyList.splice(0, n + 1, uri).reduce((pre, curUri) => {
        const cpathname = this._uriToPathname(curUri);

        if (pre[pre.length - 1] !== cpathname) {
          pre.push(cpathname);
        }

        return pre;
      }, []);

      if (arr[arr.length - 1] === this._uriToPathname(historyList[1])) {
        arr.pop();
      }

      stackList.splice(0, arr.length, pathname);

      if (stackList[0] === stackList[1]) {
        stackList.shift();
      }
    }

    return {
      history: historyList,
      stack: stackList
    };
  }

  _urlToUri(url, key) {
    return `${key}${routeConfig.RSP}${url}`;
  }

  _uriToUrl(uri = '') {
    return uri.substr(uri.indexOf(routeConfig.RSP) + 1);
  }

  _uriToPathname(uri = '') {
    const url = this._uriToUrl(uri);

    return url.split(/[?#]/)[0];
  }

  _uriToKey(uri = '') {
    return uri.substr(0, uri.indexOf(routeConfig.RSP));
  }

  findHistoryByKey(key) {
    const {
      history
    } = this._routeState;
    const index = history.findIndex(uri => uri.startsWith(`${key}${routeConfig.RSP}`));
    return {
      index,
      url: index > -1 ? this._uriToUrl(history[index]) : ''
    };
  }

  _toNativeLocation(location) {
    if (this.locationMap) {
      const nLocation = checkLocation(this.locationMap.out(location));
      return Object.assign({}, nLocation, {
        action: location.action,
        url: this.locationToUrl(nLocation),
        key: location.key
      });
    }

    return location;
  }

  _createRouteState(safeLocation, action, key) {
    key = key || this._createKey();

    const data = this._getEfficientLocation(safeLocation);

    const location = Object.assign({}, data.location, {
      action,
      url: this.locationToUrl(data.location),
      key
    });

    const {
      history,
      stack
    } = this._buildHistory(location);

    const routeState = Object.assign({}, location, data.routeData, {
      history,
      stack
    });
    return routeState;
  }

  async dispatch(safeLocation, action, key = '', callNative) {
    const routeState = this._createRouteState(safeLocation, action, key);

    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    await this.store.dispatch(routeChangeAction(routeState));

    if (callNative) {
      const nativeLocation = this._toNativeLocation(routeState);

      if (typeof callNative === 'number') {
        this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative);
      } else {
        this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation);
      }
    }

    return routeState;
  }

  relaunch(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  }

  push(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  }

  replace(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  }

  pop(n = 1, root = 'FIRST', disableNative) {
    n = n || 1;
    const uri = this._routeState.history[n];

    if (uri) {
      const url = this._uriToUrl(uri);

      const key = this._uriToKey(uri);

      const paLocation = urlToLocation(url);
      return this.dispatch(paLocation, `POP${n}`, key, disableNative ? '' : n);
    }

    let url = root;

    if (root === 'HOME') {
      url = routeConfig.homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupRouteState.url;
    }

    if (!url) {
      return Promise.reject(1);
    }

    return this.relaunch(url, disableNative);
  }

  home(root = 'FIRST', disableNative) {
    return this.relaunch(root === 'HOME' ? routeConfig.homeUrl : this._startupRouteState.url, disableNative);
  }

}
export const routeMiddleware = ({
  dispatch,
  getState
}) => next => action => {
  if (action.type === RouteActionTypes.RouteChange) {
    const result = next(action);
    const routeState = action.payload[0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach(moduleName => {
      const routeParams = rootRouteParams[moduleName];

      if (routeParams) {
        var _rootState$moduleName;

        if ((_rootState$moduleName = rootState[moduleName]) === null || _rootState$moduleName === void 0 ? void 0 : _rootState$moduleName.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        } else {
          dispatch(moduleInitAction(moduleName, undefined));
        }
      }
    });
    return result;
  }

  return next(action);
};
export const routeReducer = (state, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return action.payload[0];
  }

  return state;
};
export let RouteModuleHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  class RouteModuleHandlers extends _CoreModuleHandlers {
    constructor(...args) {
      super(...args);

      _initialize(this);
    }

  }

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        const routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? Object.assign({}, initState, {
          routeParams
        }) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return Object.assign({}, this.state, {
          routeParams: payload
        });
      }
    }]
  };
}, CoreModuleHandlers);