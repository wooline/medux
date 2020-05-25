import { config as coreConfig } from '@medux/core';
import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from './deep-extend';
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

function joinSearchString(arr) {
  const strs = [''];

  for (let i = 0, k = arr.length; i < k; i++) {
    strs.push(arr[i] || '');
  }

  return strs.join(`&${config.splitKey}=`);
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
  const reg = new RegExp(`[&?#]${config.splitKey}=[^&]*`, 'g');
  const arr = search.match(reg);
  let stackParams = [];

  if (arr) {
    stackParams = arr.map(str => {
      return searchParse(str.split('=')[1]);
    });
  }

  return stackParams;
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
          args[moduleName] = Object.assign({}, args[moduleName], {}, checkPathArgs(params));
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

export function assignRouteData(paths, stackParams, args) {
  if (!stackParams[0]) {
    stackParams[0] = {};
  }

  if (args) {
    stackParams[0] = assignDeep({}, args, stackParams[0]);
  }

  const firstStackParams = stackParams[0];
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

export function buildTransformRoute(routeConfig, pathnameMap) {
  const {
    viewToRule,
    ruleToKeys
  } = compileConfig(routeConfig);

  const locationToRoute = location => {
    const pathname = pathnameMap ? pathnameMap.in(location.pathname) : location.pathname;
    const paths = [];
    const pathsArgs = {};
    pathnameParse(pathname, routeConfig, paths, pathsArgs);
    const stackParams = splitSearch(location.search);
    const hashStackParams = splitSearch(location.hash);
    hashStackParams.forEach((item, index) => {
      if (item) {
        if (!stackParams[index]) {
          stackParams[index] = {};
        }

        assignDeep(stackParams[index], item);
      }
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
      firstStackParamsFilter = assignDeep({}, firstStackParams);
      paths.reduce((parentAbsoluteViewName, viewName, index) => {
        const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        const rule = viewToRule[absoluteViewName];
        const moduleName = viewName.split(coreConfig.VSP)[0];

        if (index === paths.length - 1) {
          const toPath = compileToPath(rule);
          const keys = ruleToKeys[rule] || [];
          const args = keys.reduce((prev, cur) => {
            if (typeof cur === 'string') {
              const props = cur.split('.');

              if (props.length) {
                prev[cur] = props.reduce((p, c) => {
                  return p[c];
                }, params[moduleName]);
                return prev;
              }
            }

            prev[cur] = params[moduleName][cur];
            return prev;
          }, {});
          pathname = toPath(args);
        }

        const keys = ruleToKeys[rule] || [];
        keys.forEach(key => {
          if (typeof key === 'string') {
            const props = key.split('.');

            if (props.length) {
              props.reduce((p, c, i) => {
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
    }

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
      pathname: pathnameMap ? pathnameMap.out(pathname) : pathname,
      search: '?' + joinSearchString(searchStrings).substr(1),
      hash: '#' + joinSearchString(hashStrings).substr(1)
    };
  };

  return {
    locationToRoute,
    routeToLocation
  };
}