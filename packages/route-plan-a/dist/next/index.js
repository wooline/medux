import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { config as coreConfig } from '@medux/core';
import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from './deep-extend';

function dataIsLocation(data) {
  return !!data['pathname'];
}

export function checkLocation(location) {
  const data = Object.assign({}, location);
  data.pathname = `/${data.pathname}`.replace(/\/+/g, '/');

  if (data.pathname !== '/') {
    data.pathname = data.pathname.replace(/\/$/, '');
  }

  data.search = `?${location.search || ''}`.replace('??', '?');
  data.hash = `#${location.hash || ''}`.replace('##', '#');

  if (data.search === '?') {
    data.search = '';
  }

  if (data.hash === '#') {
    data.hash = '';
  }

  return data;
}
export function urlToLocation(url) {
  url = `/${url}`.replace(/\/+/g, '/');

  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  const arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  const [pathname, search = '', hash = ''] = arr;
  return {
    pathname,
    search: search && `?${search}`,
    hash: hash && `#${hash}`
  };
}
export function locationToUrl(safeLocation) {
  return safeLocation.pathname + safeLocation.search + safeLocation.hash;
}
export const deepAssign = assignDeep;
const config = {
  escape: true,
  dateParse: false,
  splitKey: 'q',
  defaultRouteParams: {}
};
export function setRouteConfig(conf) {
  conf.escape !== undefined && (config.escape = conf.escape);
  conf.dateParse !== undefined && (config.dateParse = conf.dateParse);
  conf.splitKey && (config.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config.defaultRouteParams = conf.defaultRouteParams);
}

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

  if (config.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, config.dateParse ? dateParse : undefined);
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

  if (config.escape) {
    return escape(str);
  }

  return str;
}

function splitSearch(search) {
  const reg = new RegExp(`[?&#]${config.splitKey}=([^&]+)`);
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

function pathnameParse(pathname, routeConfig, paths, args) {
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {
        path: rule.replace(/\$$/, ''),
        exact: !pathConfig
      });

      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(coreConfig.VSP)[0];
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

function compileConfig(routeConfig, parentAbsoluteViewName = '', viewToRule = {}, ruleToKeys = {}) {
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;

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

      const absoluteViewName = `${parentAbsoluteViewName}/${viewName}`;
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

export function assignRouteData(paths, params) {
  const views = paths.reduce((prev, cur) => {
    const [moduleName, viewName] = cur.split(coreConfig.VSP);

    if (moduleName && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!params[moduleName]) {
        params[moduleName] = {};
      }
    }

    return prev;
  }, {});
  Object.keys(params).forEach(moduleName => {
    params[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], params[moduleName]);
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
    const [moduleName, view] = viewName.split(coreConfig.VSP);
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
  constructor(nativeHistory, homeUrl, routeConfig, maxLength, locationMap) {
    this.nativeHistory = nativeHistory;
    this.homeUrl = homeUrl;
    this.routeConfig = routeConfig;
    this.maxLength = maxLength;
    this.locationMap = locationMap;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_uid", 0);

    _defineProperty(this, "_RSP", '|');

    _defineProperty(this, "_listenList", {});

    _defineProperty(this, "_blockerList", {});

    _defineProperty(this, "_location", void 0);

    _defineProperty(this, "_routeData", void 0);

    _defineProperty(this, "_startupLocation", void 0);

    _defineProperty(this, "_startupRouteData", void 0);

    _defineProperty(this, "_history", []);

    _defineProperty(this, "_stack", []);

    _defineProperty(this, "_viewToRule", void 0);

    _defineProperty(this, "_ruleToKeys", void 0);

    const {
      viewToRule,
      ruleToKeys
    } = compileConfig(routeConfig);
    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
  }

  getCurKey() {
    var _this$getLocation;

    return ((_this$getLocation = this.getLocation()) === null || _this$getLocation === void 0 ? void 0 : _this$getLocation.key) || '';
  }

  _getCurPathname() {
    var _this$getLocation2;

    return ((_this$getLocation2 = this.getLocation()) === null || _this$getLocation2 === void 0 ? void 0 : _this$getLocation2.pathname) || '';
  }

  getLocation(startup) {
    return startup ? this._startupLocation : this._location;
  }

  getRouteData(startup) {
    return startup ? this._startupRouteData : this._routeData;
  }

  getRouteState() {
    if (this._location) {
      return {
        history: this._history,
        stack: this._stack,
        location: this._location,
        data: this._routeData
      };
    }

    return undefined;
  }

  locationToRoute(safeLocation) {
    const url = locationToUrl(safeLocation);
    const item = cacheData.find(val => {
      return val && val.url === url;
    });

    if (item) {
      return item.routeData;
    }

    const pathname = safeLocation.pathname;
    const paths = [];
    const pathsArgs = {};
    pathnameParse(pathname, this.routeConfig, paths, pathsArgs);
    const params = splitSearch(safeLocation.search);
    const hashParams = splitSearch(safeLocation.hash);
    assignDeep(params, hashParams);
    const routeData = assignRouteData(paths, assignDeep(pathsArgs, params));
    cacheData.unshift({
      url,
      routeData
    });
    cacheData.length = 100;
    return routeData;
  }

  routeToLocation(paths, params) {
    params = params || {};
    let pathname;
    let views = {};

    if (typeof paths === 'string') {
      pathname = paths;
    } else {
      const data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
      pathname = data.pathname;
      params = data.params;
      views = data.views;
    }

    const paramsFilter = excludeDefaultData(params, config.defaultRouteParams, false, views);
    const {
      search,
      hash
    } = extractHashData(paramsFilter);
    return {
      pathname,
      search: search ? `?${config.splitKey}=${search}` : '',
      hash: hash ? `#${config.splitKey}=${hash}` : ''
    };
  }

  payloadToRoute(data) {
    const params = data.extend ? assignDeep({}, data.extend.params, data.params) : data.params;
    let paths = [];

    if (typeof data.paths === 'string') {
      const pathname = data.paths;
      pathnameParse(pathname, this.routeConfig, paths, {});
    } else {
      paths = data.paths;
    }

    return assignRouteData(paths, params || {});
  }

  payloadToLocation(data) {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }

    if (dataIsLocation(data)) {
      return checkLocation(data);
    }

    const params = data.extend ? assignDeep({}, data.extend.params, data.params) : data.params;
    return this.routeToLocation(data.paths, params);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  _getEfficientLocation(safeLocation, curPathname) {
    const routeData = this.locationToRoute(safeLocation);

    if (routeData.views['@']) {
      const url = Object.keys(routeData.views['@'])[0];
      const reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation, safeLocation.pathname);
    }

    return {
      location: safeLocation,
      routeData
    };
  }

  _buildHistory(location) {
    const maxLength = this.maxLength;
    const {
      action,
      url,
      pathname,
      key
    } = location;

    const uri = this._urlToUri(url, key);

    let historyList = [...this._history];
    let stackList = [...this._stack];

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

  subscribe(listener) {
    this._uid++;
    const uid = this._uid;
    this._listenList[uid] = listener;
    return () => {
      delete this._listenList[uid];
    };
  }

  block(listener) {
    this._uid++;
    const uid = this._uid;
    this._blockerList[uid] = listener;
    return () => {
      delete this._blockerList[uid];
    };
  }

  _urlToUri(url, key) {
    return `${key}${this._RSP}${url}`;
  }

  _uriToUrl(uri = '') {
    return uri.substr(uri.indexOf(this._RSP) + 1);
  }

  _uriToPathname(uri = '') {
    const url = this._uriToUrl(uri);

    return url.split(/[?#]/)[0];
  }

  _uriToKey(uri = '') {
    return uri.substr(0, uri.indexOf(this._RSP));
  }

  findHistoryByKey(key) {
    const index = this._history.findIndex(uri => uri.startsWith(`${key}${this._RSP}`));

    return {
      index,
      url: index > -1 ? this._uriToUrl(this._history[index]) : ''
    };
  }

  _toNativeLocation(location) {
    if (this.locationMap) {
      const nLocation = checkLocation(this.locationMap.out(location));
      return Object.assign(Object.assign({}, nLocation), {}, {
        action: location.action,
        url: locationToUrl(nLocation),
        key: location.key
      });
    }

    return location;
  }

  dispatch(paLocation, action, key = '', callNative) {
    key = key || this._createKey();

    const data = this._getEfficientLocation(paLocation, this._getCurPathname());

    const location = Object.assign(Object.assign({}, data.location), {}, {
      action,
      url: locationToUrl(data.location),
      key
    });
    const routeData = Object.assign(Object.assign({}, data.routeData), {}, {
      action,
      key
    });
    return Promise.all(Object.values(this._blockerList).map(fn => fn(location, this.getLocation(), routeData, this.getRouteData()))).then(() => {
      this._location = location;
      this._routeData = routeData;

      if (!this._startupLocation) {
        this._startupLocation = location;
        this._startupRouteData = routeData;
      }

      const {
        history,
        stack
      } = this._buildHistory(location);

      this._history = history;
      this._stack = stack;
      Object.values(this._listenList).forEach(listener => listener({
        location,
        data: routeData,
        history: this._history,
        stack: this._stack
      }));

      if (callNative) {
        const nativeLocation = this._toNativeLocation(location);

        if (typeof callNative === 'number') {
          this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative);
        } else {
          this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation);
        }
      }

      return location;
    });
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
    const uri = this._history[n];

    if (uri) {
      const url = this._uriToUrl(uri);

      const key = this._uriToKey(uri);

      const paLocation = urlToLocation(url);
      return this.dispatch(paLocation, `POP${n}`, key, disableNative ? '' : n);
    }

    let url = root;

    if (root === 'HOME') {
      url = this.homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupLocation.url;
    }

    if (!url) {
      return Promise.reject(1);
    }

    return this.relaunch(url, disableNative);
  }

  home(root = 'FIRST', disableNative) {
    return this.relaunch(root === 'HOME' ? this.homeUrl : this._startupLocation.url, disableNative);
  }

}