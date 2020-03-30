'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@medux/core');
var assignDeep = _interopDefault(require('deep-extend'));

function _createForOfIteratorHelperLoose(o) { var i = 0; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } i = o[Symbol.iterator](); return i.next.bind(i); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function lexer(str) {
  var tokens = [];
  var i = 0;

  while (i < str.length) {
    var char = str[i];

    if (char === '*' || char === '+' || char === '?') {
      tokens.push({
        type: 'MODIFIER',
        index: i,
        value: str[i++]
      });
      continue;
    }

    if (char === '\\') {
      tokens.push({
        type: 'ESCAPED_CHAR',
        index: i++,
        value: str[i++]
      });
      continue;
    }

    if (char === '{') {
      tokens.push({
        type: 'OPEN',
        index: i,
        value: str[i++]
      });
      continue;
    }

    if (char === '}') {
      tokens.push({
        type: 'CLOSE',
        index: i,
        value: str[i++]
      });
      continue;
    }

    if (char === ':') {
      var name = '';
      var j = i + 1;

      while (j < str.length) {
        var code = str.charCodeAt(j);

        if (code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95 || code === 46) {
          name += str[j++];
          continue;
        }

        break;
      }

      if (!name) throw new TypeError("Missing parameter name at " + i);
      tokens.push({
        type: 'NAME',
        index: i,
        value: name
      });
      i = j;
      continue;
    }

    if (char === '(') {
      var count = 1;
      var pattern = '';

      var _j = i + 1;

      if (str[_j] === '?') {
        throw new TypeError("Pattern cannot start with \"?\" at " + _j);
      }

      while (_j < str.length) {
        if (str[_j] === '\\') {
          pattern += str[_j++] + str[_j++];
          continue;
        }

        if (str[_j] === ')') {
          count--;

          if (count === 0) {
            _j++;
            break;
          }
        } else if (str[_j] === '(') {
          count++;

          if (str[_j + 1] !== '?') {
            throw new TypeError("Capturing groups are not allowed at " + _j);
          }
        }

        pattern += str[_j++];
      }

      if (count) throw new TypeError("Unbalanced pattern at " + i);
      if (!pattern) throw new TypeError("Missing pattern at " + i);
      tokens.push({
        type: 'PATTERN',
        index: i,
        value: pattern
      });
      i = _j;
      continue;
    }

    tokens.push({
      type: 'CHAR',
      index: i,
      value: str[i++]
    });
  }

  tokens.push({
    type: 'END',
    index: i,
    value: ''
  });
  return tokens;
}

function parse(str, options) {
  if (options === void 0) {
    options = {};
  }

  var tokens = lexer(str);
  var _options = options,
      _options$prefixes = _options.prefixes,
      prefixes = _options$prefixes === void 0 ? './' : _options$prefixes;
  var defaultPattern = "[^" + escapeString(options.delimiter || '/#?') + "]+?";
  var result = [];
  var key = 0;
  var i = 0;
  var path = '';

  var tryConsume = function tryConsume(type) {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    return undefined;
  };

  var mustConsume = function mustConsume(type) {
    var value = tryConsume(type);
    if (value !== undefined) return value;
    var _tokens$i = tokens[i],
        nextType = _tokens$i.type,
        index = _tokens$i.index;
    throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
  };

  var consumeText = function consumeText() {
    var result = '';
    var value;

    while (value = tryConsume('CHAR') || tryConsume('ESCAPED_CHAR')) {
      result += value;
    }

    return result;
  };

  while (i < tokens.length) {
    var char = tryConsume('CHAR');
    var name = tryConsume('NAME');
    var pattern = tryConsume('PATTERN');

    if (name || pattern) {
      var prefix = char || '';

      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = '';
      }

      if (path) {
        result.push(path);
        path = '';
      }

      result.push({
        name: name || key++,
        prefix: prefix,
        suffix: '',
        pattern: pattern || defaultPattern,
        modifier: tryConsume('MODIFIER') || ''
      });
      continue;
    }

    var _value = char || tryConsume('ESCAPED_CHAR');

    if (_value) {
      path += _value;
      continue;
    }

    if (path) {
      result.push(path);
      path = '';
    }

    var open = tryConsume('OPEN');

    if (open) {
      var _prefix = consumeText();

      var _name = tryConsume('NAME') || '';

      var _pattern = tryConsume('PATTERN') || '';

      var suffix = consumeText();
      mustConsume('CLOSE');
      result.push({
        name: _name || (_pattern ? key++ : ''),
        pattern: _name && !_pattern ? defaultPattern : _pattern,
        prefix: _prefix,
        suffix: suffix,
        modifier: tryConsume('MODIFIER') || ''
      });
      continue;
    }

    mustConsume('END');
  }

  return result;
}
function compile(str, options) {
  return tokensToFunction(parse(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }

  var reFlags = flags(options);
  var _options2 = options,
      _options2$encode = _options2.encode,
      encode = _options2$encode === void 0 ? function (x) {
    return x;
  } : _options2$encode,
      _options2$validate = _options2.validate,
      validate = _options2$validate === void 0 ? true : _options2$validate;
  var matches = tokens.map(function (token) {
    if (typeof token === 'object') {
      return new RegExp("^(?:" + token.pattern + ")$", reFlags);
    }

    return undefined;
  });
  return function (data) {
    var path = '';

    for (var i = 0; i < tokens.length; i++) {
      var _token = tokens[i];

      if (typeof _token === 'string') {
        path += _token;
        continue;
      }

      var _value2 = data ? data[_token.name] : undefined;

      var optional = _token.modifier === '?' || _token.modifier === '*';
      var repeat = _token.modifier === '*' || _token.modifier === '+';

      if (Array.isArray(_value2)) {
        if (!repeat) {
          throw new TypeError("Expected \"" + _token.name + "\" to not repeat, but got an array");
        }

        if (_value2.length === 0) {
          if (optional) continue;
          throw new TypeError("Expected \"" + _token.name + "\" to not be empty");
        }

        for (var j = 0; j < _value2.length; j++) {
          var segment = encode(_value2[j], _token);

          if (validate && !matches[i].test(segment)) {
            throw new TypeError("Expected all \"" + _token.name + "\" to match \"" + _token.pattern + "\", but got \"" + segment + "\"");
          }

          path += _token.prefix + segment + _token.suffix;
        }

        continue;
      }

      if (typeof _value2 === 'string' || typeof _value2 === 'number') {
        var _segment = encode(String(_value2), _token);

        if (validate && !matches[i].test(_segment)) {
          throw new TypeError("Expected \"" + _token.name + "\" to match \"" + _token.pattern + "\", but got \"" + _segment + "\"");
        }

        path += _token.prefix + _segment + _token.suffix;
        continue;
      }

      if (optional) continue;
      var typeOfMessage = repeat ? 'an array' : 'a string';
      throw new TypeError("Expected \"" + _token.name + "\" to be " + typeOfMessage);
    }

    return path;
  };
}

function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}

function flags(options) {
  return options && options.sensitive ? '' : 'i';
}

function regexpToRegexp(path, keys) {
  if (!keys) return path;
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: '',
        suffix: '',
        modifier: '',
        pattern: ''
      });
    }
  }

  return path;
}

function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function (path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:" + parts.join('|') + ")", flags(options));
}

function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}

function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }

  var _options4 = options,
      _options4$strict = _options4.strict,
      strict = _options4$strict === void 0 ? false : _options4$strict,
      _options4$start = _options4.start,
      start = _options4$start === void 0 ? true : _options4$start,
      _options4$end = _options4.end,
      end = _options4$end === void 0 ? true : _options4$end,
      _options4$encode = _options4.encode,
      encode = _options4$encode === void 0 ? function (x) {
    return x;
  } : _options4$encode;
  var endsWith = "[" + escapeString(options.endsWith || '') + "]|$";
  var delimiter = "[" + escapeString(options.delimiter || '/#?') + "]";
  var route = start ? '^' : '';

  for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
    var _token2 = _step.value;

    if (typeof _token2 === 'string') {
      route += escapeString(encode(_token2));
    } else {
      var prefix = escapeString(encode(_token2.prefix));
      var suffix = escapeString(encode(_token2.suffix));

      if (_token2.pattern) {
        if (keys) keys.push(_token2);

        if (prefix || suffix) {
          if (_token2.modifier === '+' || _token2.modifier === '*') {
            var mod = _token2.modifier === '*' ? '?' : '';
            route += "(?:" + prefix + "((?:" + _token2.pattern + ")(?:" + suffix + prefix + "(?:" + _token2.pattern + "))*)" + suffix + ")" + mod;
          } else {
            route += "(?:" + prefix + "(" + _token2.pattern + ")" + suffix + ")" + _token2.modifier;
          }
        } else {
          route += "(" + _token2.pattern + ")" + _token2.modifier;
        }
      } else {
        route += "(?:" + prefix + suffix + ")" + _token2.modifier;
      }
    }
  }

  if (end) {
    if (!strict) route += delimiter + "?";
    route += !options.endsWith ? '$' : "(?=" + endsWith + ")";
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === 'string' ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : endToken === undefined;

    if (!strict) {
      route += "(?:" + delimiter + "(?=" + endsWith + "))?";
    }

    if (!isEndDelimited) {
      route += "(?=" + delimiter + "|" + endsWith + ")";
    }
  }

  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

var cache = {};
var cacheLimit = 10000;
var cacheCount = 0;
function compileToPath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  var result = compile(rule);

  if (cacheCount < cacheLimit) {
    cache[rule] = result;
    cacheCount++;
  }

  return result;
}
function compilePath(path, options) {
  if (options === void 0) {
    options = {
      end: false,
      strict: false,
      sensitive: false
    };
  }

  var cacheKey = "" + options.end + options.strict + options.sensitive;
  var pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  var keys = [];
  var regexp = pathToRegexp(path, keys, options);
  var result = {
    regexp: regexp,
    keys: keys
  };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}
function matchPath(pathname, options) {
  if (options === void 0) {
    options = {};
  }

  if (typeof options === 'string' || Array.isArray(options)) {
    options = {
      path: options
    };
  }

  var _options = options,
      path = _options.path,
      _options$exact = _options.exact,
      exact = _options$exact === void 0 ? false : _options$exact,
      _options$strict = _options.strict,
      strict = _options$strict === void 0 ? false : _options$strict,
      _options$sensitive = _options.sensitive,
      sensitive = _options$sensitive === void 0 ? false : _options$sensitive;
  var paths = [].concat(path);
  return paths.reduce(function (matched, path) {
    if (!path) return null;
    if (matched) return matched;

    if (path === '*') {
      return {
        path: path,
        url: pathname,
        isExact: true,
        params: {}
      };
    }

    var _compilePath = compilePath(path, {
      end: exact,
      strict: strict,
      sensitive: sensitive
    }),
        regexp = _compilePath.regexp,
        keys = _compilePath.keys;

    var match = regexp.exec(pathname);
    if (!match) return null;
    var url = match[0],
        values = match.slice(1);
    var isExact = pathname === url;
    if (exact && !isExact) return null;
    return {
      path: path,
      url: path === '/' && url === '' ? '/' : url,
      isExact: isExact,
      params: keys.reduce(function (memo, key, index) {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

var config = {
  escape: true,
  dateParse: true,
  splitKey: 'q',
  defaultRouteParams: {}
};
function setRouteConfig(conf) {
  conf.escape !== undefined && (config.escape = conf.escape);
  conf.dateParse !== undefined && (config.dateParse = conf.dateParse);
  conf.splitKey && (config.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config.defaultRouteParams = conf.defaultRouteParams);
}

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
}

var ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

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
      });

      if (match) {
        paths.push(_viewName);

        var _moduleName = _viewName.split(core.config.VSP)[0];

        var params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName] = Object.assign({}, args[_moduleName], {}, checkPathArgs(params));
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
    var _cur$split = cur.split(core.config.VSP),
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

function fillRouteData(routePayload) {
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
      var data = params[_moduleName2];
      var keys = Object.keys(data);

      if (keys.length > 0) {
        keys.forEach(function (key) {
          if (key.startsWith('_')) {
            if (!hashParams[_moduleName2]) {
              hashParams[_moduleName2] = {};
            }

            hashParams[_moduleName2][key] = data[key];
          } else {
            if (!searchParams[_moduleName2]) {
              searchParams[_moduleName2] = {};
            }

            searchParams[_moduleName2][key] = data[key];
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

function buildTransformRoute(routeConfig) {
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
      firstStackParamsFilter = assignDeep({}, firstStackParams);
      paths.reduce(function (parentAbsoluteViewName, viewName, index) {
        var absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        var rule = viewToRule[absoluteViewName];
        var moduleName = viewName.split(core.config.VSP)[0];

        if (index === paths.length - 1) {
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
        }

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
    }

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
function fillBrowserRouteData(routePayload) {
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

function getBrowserRouteActions(getBrowserHistoryActions) {
  return {
    push: function push(data) {
      if (isBrowserRoutePayload(data)) {
        var args = fillBrowserRouteData(data);
        getBrowserHistoryActions().push(args);
      } else {
        getBrowserHistoryActions().push(data);
      }
    },
    replace: function replace(data) {
      if (isBrowserRoutePayload(data)) {
        var args = fillBrowserRouteData(data);
        getBrowserHistoryActions().replace(args);
      } else {
        getBrowserHistoryActions().replace(data);
      }
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
function buildToBrowserUrl(getTransformRoute) {
  function toUrl() {
    for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length === 1) {
      var location = getTransformRoute().routeToLocation(fillBrowserRouteData(args[0]));
      args = [location.pathname, location.search, location.hash];
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
}

exports.buildToBrowserUrl = buildToBrowserUrl;
exports.buildTransformRoute = buildTransformRoute;
exports.fillBrowserRouteData = fillBrowserRouteData;
exports.fillRouteData = fillRouteData;
exports.getBrowserRouteActions = getBrowserRouteActions;
exports.setRouteConfig = setRouteConfig;
