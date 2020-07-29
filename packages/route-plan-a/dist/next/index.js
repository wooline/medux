import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { config as coreConfig } from '@medux/core';
import { checkLocation, checkPathname, checkUrl, safelocationToUrl, safeurlToLocation } from './utils';
import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from './deep-extend';
export { checkUrl, checkLocation, safeurlToLocation, safelocationToUrl } from './utils';

function dataIsLocation(data) {
  return !!data['pathname'];
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
  } else {
    return str;
  }
}

function splitSearch(search) {
  const reg = new RegExp(`[?&#]${config.splitKey}=([^&]+)`);
  const arr = search.match(reg);

  if (arr) {
    return searchParse(arr[1]);
  } else {
    return {};
  }
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

export function assignRouteData(paths, params, action) {
  const views = paths.reduce((prev, cur) => {
    const [moduleName, viewName] = cur.split(coreConfig.VSP);

    if (moduleName !== '@' && viewName) {
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
    params,
    action
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
export function buildTransformRoute(routeConfig, getCurPathname) {
  const {
    viewToRule,
    ruleToKeys
  } = compileConfig(routeConfig);
  const transformRoute = {
    locationToRoute(location) {
      const safeLocation = checkLocation(location, getCurPathname());
      const url = safelocationToUrl(safeLocation);
      const item = cacheData.find(val => {
        return val && val.url === url;
      });

      if (item) {
        item.routeData.action = safeLocation.action;
        return item.routeData;
      }

      const pathname = safeLocation.pathname;
      const paths = [];
      const pathsArgs = {};
      pathnameParse(pathname, routeConfig, paths, pathsArgs);
      const params = splitSearch(safeLocation.search);
      const hashParams = splitSearch(safeLocation.hash);
      assignDeep(params, hashParams);
      const routeData = assignRouteData(paths, assignDeep(pathsArgs, params), safeLocation.action);
      cacheData.unshift({
        url,
        routeData
      });
      cacheData.length = 100;
      return routeData;
    },

    routeToLocation(paths, params, action) {
      params = params || {};
      let pathname;
      let views = {};

      if (typeof paths === 'string') {
        pathname = checkPathname(paths, getCurPathname());
      } else {
        const data = pathsToPathname(paths, params);
        pathname = data.pathname;
        params = data.params;
        views = data.views;
      }

      const paramsFilter = excludeDefaultData(params, config.defaultRouteParams, false, views);
      const {
        search,
        hash
      } = extractHashData(paramsFilter);
      const location = {
        pathname,
        search: search ? `?${config.splitKey}=${search}` : '',
        hash: hash ? `#${config.splitKey}=${hash}` : '',
        action
      };
      return location;
    },

    payloadToLocation(payload) {
      if (dataIsLocation(payload)) {
        return checkLocation(payload, getCurPathname());
      } else {
        const params = payload.extend ? assignDeep({}, payload.extend.params, payload.params) : payload.params;
        const location = transformRoute.routeToLocation(payload.paths, params);
        return checkLocation(location, getCurPathname());
      }
    },

    urlToLocation(url) {
      url = checkUrl(url, getCurPathname());
      return safeurlToLocation(url);
    }

  };

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

  function pathsToPathname(paths, params = {}) {
    const len = paths.length - 1;
    const paramsFilter = assignDeep({}, params);
    let pathname = '';
    const views = {};
    paths.reduce((parentAbsoluteViewName, viewName, index) => {
      const [moduleName, view] = viewName.split(coreConfig.VSP);
      const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
      const rule = viewToRule[absoluteViewName];
      const keys = ruleToKeys[rule] || [];

      if (moduleName !== '@' && view) {
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

  return transformRoute;
}
export class BaseHistoryActions {
  constructor(location, initialized, _transformRoute) {
    this.initialized = initialized;
    this._transformRoute = _transformRoute;

    _defineProperty(this, "_uid", 0);

    _defineProperty(this, "_listenList", {});

    _defineProperty(this, "_blockerList", {});

    _defineProperty(this, "_location", void 0);

    _defineProperty(this, "_startupLocation", void 0);

    this._location = location;
    this._startupLocation = this._location;
  }

  equal(a, b) {
    return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
  }

  getLocation() {
    return this._location;
  }

  getRouteData() {
    return this._transformRoute.locationToRoute(this.getLocation());
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

  locationToRouteData(location) {
    return this._transformRoute.locationToRoute(location);
  }

  dispatch(location) {
    if (this.equal(location, this._location)) {
      return Promise.reject();
    }

    return Promise.all(Object.values(this._blockerList).map(fn => fn(location, this._location))).then(() => {
      this._location = location;
      Object.values(this._listenList).forEach(listener => listener(location));
    });
  }

}