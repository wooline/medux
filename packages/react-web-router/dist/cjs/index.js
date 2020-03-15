'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var history = require('history');
var _assertThisInitialized = _interopDefault(require('@babel/runtime/helpers/esm/assertThisInitialized'));
var _inheritsLoose = _interopDefault(require('@babel/runtime/helpers/esm/inheritsLoose'));
var _defineProperty = _interopDefault(require('@babel/runtime/helpers/esm/defineProperty'));
var redux = require('redux');
var _regeneratorRuntime = _interopDefault(require('@babel/runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('@babel/runtime/helpers/esm/asyncToGenerator'));
var _decorate = _interopDefault(require('@babel/runtime/helpers/esm/decorate'));
var React = require('react');
var React__default = _interopDefault(React);
var reactRouterDom = require('react-router-dom');
var _extends = _interopDefault(require('@babel/runtime/helpers/esm/extends'));
var _objectWithoutPropertiesLoose = _interopDefault(require('@babel/runtime/helpers/esm/objectWithoutPropertiesLoose'));
var reactRedux = require('react-redux');
var server = require('react-dom/server');
var ReactDOM = _interopDefault(require('react-dom'));

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

  for (var _iterator = tokens, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var _token2 = _ref;

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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var deepExtend_1 = createCommonjsModule(function (module) {

function isSpecificValue(val) {
  return val instanceof Buffer || val instanceof Date || val instanceof RegExp ? true : false;
}

function cloneSpecificValue(val) {
  if (val instanceof Buffer) {
    var x = Buffer.alloc ? Buffer.alloc(val.length) : new Buffer(val.length);
    val.copy(x);
    return x;
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
}
/**
 * Recursive cloning array.
 */


function deepCloneArray(arr) {
  var clone = [];
  arr.forEach(function (item, index) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else if (isSpecificValue(item)) {
        clone[index] = cloneSpecificValue(item);
      } else {
        clone[index] = deepExtend({}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function safeGetProperty(object, property) {
  return property === '__proto__' ? undefined : object[property];
}
/**
 * Extening object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect type.
 *
 * If you wish to clone source object (without modify it), just use empty new
 * object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */


var deepExtend = module.exports = function ()
/*obj_1, [obj_2], [obj_N]*/
{
  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) {
    return arguments[0];
  }

  var target = arguments[0]; // convert arguments to array and cut off target object

  var args = Array.prototype.slice.call(arguments, 1);
  var val, src;
  args.forEach(function (obj) {
    // skip argument if isn't an object, is null, or is an array
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = safeGetProperty(target, key); // source value

      val = safeGetProperty(obj, key); // new value
      // recursion prevention

      if (val === target) {
        return;
        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;
        return; // just clone arrays (and recursive clone objects inside)
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return; // custom cloning and overwrite for specific objects
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return; // overwrite by new value if source isn't object or array
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        return; // source value and new value is objects both, extending...
      } else {
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });
  return target;
};
});

var TaskCountEvent = 'TaskCountEvent';

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(exports.LoadingState || (exports.LoadingState = {}));

var PEvent = function () {
  function PEvent(name, data, bubbling) {
    if (bubbling === void 0) {
      bubbling = false;
    }

    this.name = name;
    this.data = data;
    this.bubbling = bubbling;

    _defineProperty(this, "target", null);

    _defineProperty(this, "currentTarget", null);
  }

  var _proto = PEvent.prototype;

  _proto.setTarget = function setTarget(target) {
    this.target = target;
  };

  _proto.setCurrentTarget = function setCurrentTarget(target) {
    this.currentTarget = target;
  };

  return PEvent;
}();
var PDispatcher = function () {
  function PDispatcher(parent) {
    this.parent = parent;

    _defineProperty(this, "storeHandlers", {});
  }

  var _proto2 = PDispatcher.prototype;

  _proto2.addListener = function addListener(ename, handler) {
    var dictionary = this.storeHandlers[ename];

    if (!dictionary) {
      this.storeHandlers[ename] = dictionary = [];
    }

    dictionary.push(handler);
    return this;
  };

  _proto2.removeListener = function removeListener(ename, handler) {
    var _this = this;

    if (!ename) {
      Object.keys(this.storeHandlers).forEach(function (key) {
        delete _this.storeHandlers[key];
      });
    } else {
      var handlers = this.storeHandlers;

      if (handlers.propertyIsEnumerable(ename)) {
        var dictionary = handlers[ename];

        if (!handler) {
          delete handlers[ename];
        } else {
          var n = dictionary.indexOf(handler);

          if (n > -1) {
            dictionary.splice(n, 1);
          }

          if (dictionary.length === 0) {
            delete handlers[ename];
          }
        }
      }
    }

    return this;
  };

  _proto2.dispatch = function dispatch(evt) {
    if (!evt.target) {
      evt.setTarget(this);
    }

    evt.setCurrentTarget(this);
    var dictionary = this.storeHandlers[evt.name];

    if (dictionary) {
      for (var i = 0, k = dictionary.length; i < k; i++) {
        dictionary[i](evt);
      }
    }

    if (this.parent && evt.bubbling) {
      this.parent.dispatch(evt);
    }

    return this;
  };

  _proto2.setParent = function setParent(parent) {
    this.parent = parent;
    return this;
  };

  return PDispatcher;
}();
var TaskCounter = function (_PDispatcher) {
  _inheritsLoose(TaskCounter, _PDispatcher);

  function TaskCounter(deferSecond) {
    var _this2;

    _this2 = _PDispatcher.call(this) || this;
    _this2.deferSecond = deferSecond;

    _defineProperty(_assertThisInitialized(_this2), "list", []);

    _defineProperty(_assertThisInitialized(_this2), "ctimer", null);

    return _this2;
  }

  var _proto3 = TaskCounter.prototype;

  _proto3.addItem = function addItem(promise, note) {
    var _this3 = this;

    if (note === void 0) {
      note = '';
    }

    if (!this.list.some(function (item) {
      return item.promise === promise;
    })) {
      this.list.push({
        promise: promise,
        note: note
      });
      promise.then(function () {
        return _this3.completeItem(promise);
      }, function () {
        return _this3.completeItem(promise);
      });

      if (this.list.length === 1) {
        this.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Start));
        this.ctimer = setTimeout(function () {
          _this3.ctimer = null;

          if (_this3.list.length > 0) {
            _this3.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Depth));
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto3.completeItem = function completeItem(promise) {
    var i = this.list.findIndex(function (item) {
      return item.promise === promise;
    });

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          clearTimeout(this.ctimer);
          this.ctimer = null;
        }

        this.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Stop));
      }
    }

    return this;
  };

  return TaskCounter;
}(PDispatcher);

var loadings = {};
var depthTime = 2;
function setLoading(item, moduleName, group) {
  if (moduleName === void 0) {
    moduleName = MetaData.appModuleName;
  }

  if (group === void 0) {
    group = 'global';
  }

  if (MetaData.isServer) {
    return item;
  }

  var key = moduleName + config.NSP + group;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, function (e) {
      var store = MetaData.clientStore;

      if (store) {
        var _actions;

        var actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];

        var _action = actions((_actions = {}, _actions[group] = e.data, _actions));

        store.dispatch(_action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
var config = {
  NSP: '/',
  VSP: '.',
  MSP: ','
};
var MetaData = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null
};
var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: "medux" + config.NSP + "Error",
  RouteChange: "medux" + config.NSP + "RouteChange"
};
var client = MetaData.isServer ? undefined : typeof window === 'undefined' ? global : window;
function isPromise(data) {
  return typeof data === 'object' && typeof data['then'] === 'function';
}
function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName;
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      var before = function before(curAction, moduleName, promiseResult) {
        if (!MetaData.isServer) {
          if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }

          setLoading(promiseResult, loadingForModuleName, loadingForGroupName);
        }
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
function delayPromise(second) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    descriptor.value = function () {
      var delay = new Promise(function (resolve) {
        setTimeout(function () {
          resolve(true);
        }, second * 1000);
      });

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
        return items[1];
      });
    };
  };
}
function isProcessedError(error) {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  } else {
    return !!error.meduxProcessed;
  }
}
function setProcessedError(error, meduxProcessed) {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  } else {
    return {
      meduxProcessed: meduxProcessed,
      error: error
    };
  }
}

function bindThis(fun, thisObj) {
  var newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(function (key) {
    newFun[key] = fun[key];
  });
  return newFun;
}

function transformAction(actionName, action, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error("Action duplicate or conflict : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(moduleName, actionName) {
  var actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = function () {
      for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        payload[_key2] = arguments[_key2];
      }

      return {
        type: moduleName + config.NSP + actionName,
        payload: payload
      };
    };
  }
}

function injectActions(store, moduleName, handlers) {
  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          handler = bindThis(handler, handlers);
          actionNames.split(config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
            var arr = actionName.split(config.NSP);

            if (arr[1]) {
              handler.__isHandler__ = true;
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            } else {
              handler.__isHandler__ = false;
              transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
              addModuleActionCreatorList(moduleName, actionName);
            }
          });
        }
      })();
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: [route]
  };
}
function routeParamsAction(moduleName, params) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MRouteParams,
    payload: [params]
  };
}

function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}

function loadModel(moduleName, store, options) {
  var hasInjected = store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    var moduleGetter = MetaData.moduleGetter;
    var result = moduleGetter[moduleName]();

    if (isPromiseModule(result)) {
      return result.then(function (module) {
        moduleGetter[moduleName] = function () {
          return module;
        };

        return module.default.model(store, options);
      });
    } else {
      return result.default.model(store, options);
    }
  }
}
function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function bindHistory(store, history) {
  var inTimeTravelling = false;

  var handleLocationChange = function handleLocationChange(location) {
    if (!inTimeTravelling) {
      var _ref = store.getState(),
          route = _ref.route;

      if (route) {
        if (history.equal(route.location, location)) {
          return;
        }
      }

      var data = history.locationToRouteData(location);
      store.dispatch(routeChangeAction({
        location: location,
        data: data
      }));
    } else {
      inTimeTravelling = false;
    }
  };

  history.subscribe(handleLocationChange);
  store.subscribe(function () {
    if (history.initialized) {
      var storeRouteState = store.getState().route;

      if (!history.equal(storeRouteState.location, history.getLocation())) {
        inTimeTravelling = true;
        history.patch(storeRouteState.location, storeRouteState.data);
      }
    }
  });
  history.initialized && handleLocationChange(history.getLocation());
}

function buildStore(history, preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
  if (preloadedState === void 0) {
    preloadedState = {};
  }

  if (storeReducers === void 0) {
    storeReducers = {};
  }

  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  if (storeEnhancers === void 0) {
    storeEnhancers = [];
  }

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  storeReducers.route = function (state, action) {
    if (action.type === ActionTypes.RouteChange) {
      var payload = getActionData(action)[0];

      if (!state) {
        return payload;
      }

      return Object.assign({}, state, {}, payload);
    }

    return state;
  };

  var combineReducers = function combineReducers(rootState, action) {
    if (!store) {
      return rootState;
    }

    var meta = store._medux_;
    meta.prevState = rootState;
    var currentState = Object.assign({}, rootState);
    meta.currentState = currentState;
    Object.keys(storeReducers).forEach(function (moduleName) {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    var handlersCommon = meta.reducerMap[action.type] || {};
    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
    var handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
    var handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      var orderList = [];
      var priority = action.priority ? [].concat(action.priority) : [];
      handlerModules.forEach(function (moduleName) {
        var fun = handlers[moduleName];

        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }

        if (!fun.__isHandler__) {
          priority.unshift(moduleName);
        }
      });
      orderList.unshift.apply(orderList, priority);
      var moduleNameMap = {};
      orderList.forEach(function (moduleName) {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          var fun = handlers[moduleName];
          currentState[moduleName] = fun.apply(void 0, getActionData(action));
        }
      });
    }

    var changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(function (moduleName) {
      return rootState[moduleName] !== currentState[moduleName];
    });
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  var middleware = function middleware(_ref2) {
    var dispatch = _ref2.dispatch;
    return function (next) {
      return function (originalAction) {
        if (MetaData.isServer) {
          if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
            return originalAction;
          }
        }

        var meta = store._medux_;
        meta.beforeState = meta.prevState;
        var action = next(originalAction);

        if (action.type === ActionTypes.RouteChange) {
          var rootRouteParams = meta.prevState.route.data.params;
          Object.keys(rootRouteParams).forEach(function (moduleName) {
            var routeParams = rootRouteParams[moduleName];

            if (routeParams && Object.keys(routeParams).length > 0 && meta.injectedModules[moduleName]) {
              dispatch(routeParamsAction(moduleName, routeParams));
            }
          });
        }

        var handlersCommon = meta.effectMap[action.type] || {};
        var handlersEvery = meta.effectMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
        var handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
        var handlerModules = Object.keys(handlers);

        if (handlerModules.length > 0) {
          var orderList = [];
          var priority = action.priority ? [].concat(action.priority) : [];
          handlerModules.forEach(function (moduleName) {
            var fun = handlers[moduleName];

            if (moduleName === MetaData.appModuleName) {
              orderList.unshift(moduleName);
            } else {
              orderList.push(moduleName);
            }

            if (!fun.__isHandler__) {
              priority.unshift(moduleName);
            }
          });
          orderList.unshift.apply(orderList, priority);
          var moduleNameMap = {};
          var promiseResults = [];
          orderList.forEach(function (moduleName) {
            if (!moduleNameMap[moduleName]) {
              moduleNameMap[moduleName] = true;
              var fun = handlers[moduleName];
              var effectResult = fun.apply(void 0, getActionData(action));
              var decorators = fun.__decorators__;

              if (decorators) {
                var results = [];
                decorators.forEach(function (decorator, index) {
                  results[index] = decorator[0](action, moduleName, effectResult);
                });
                fun.__decoratorResults__ = results;
              }

              var errorHandler = effectResult.then(function (reslove) {
                if (decorators) {
                  var _results = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Resolved', _results[index], reslove);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                return reslove;
              }, function (error) {
                if (decorators) {
                  var _results2 = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Rejected', _results2[index], error);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                if (action.type === ActionTypes.Error) {
                  if (isProcessedError(error) === undefined) {
                    error = setProcessedError(error, true);
                  }

                  throw error;
                } else if (isProcessedError(error)) {
                  throw error;
                } else {
                  return dispatch(errorAction(error));
                }
              });
              promiseResults.push(errorHandler);
            }
          });

          if (promiseResults.length) {
            return Promise.all(promiseResults);
          }
        }

        return action;
      };
    };
  };

  var preLoadMiddleware = function preLoadMiddleware() {
    return function (next) {
      return function (action) {
        var _action$type$split = action.type.split(config.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
          var initModel = loadModel(moduleName, store, undefined);

          if (isPromise(initModel)) {
            return initModel.then(function () {
              return next(action);
            });
          }
        }

        return next(action);
      };
    };
  };

  var middlewareEnhancer = redux.applyMiddleware.apply(void 0, [preLoadMiddleware].concat(storeMiddlewares, [middleware]));

  var enhancer = function enhancer(newCreateStore) {
    return function () {
      var newStore = newCreateStore.apply(void 0, arguments);
      var modelStore = newStore;
      modelStore._medux_ = {
        beforeState: {},
        prevState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        currentViews: {}
      };
      return newStore;
    };
  };

  var enhancers = [].concat(storeEnhancers, [middlewareEnhancer, enhancer]);

  if (MetaData.isDev && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = redux.createStore(combineReducers, preloadedState, redux.compose.apply(void 0, enhancers));
  bindHistory(store, history);
  MetaData.clientStore = store;
  return store;
}

var exportModule = function exportModule(moduleName, initState, ActionHandles, views) {
  var model = function model(store, options) {
    var hasInjected = store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      var moduleState = store.getState()[moduleName];
      var handlers = new ActionHandles(moduleName, store);

      var _actions = injectActions(store, moduleName, handlers);

      handlers.actions = _actions;

      if (!moduleState) {
        var params = store._medux_.prevState.route.data.params;
        initState.isModule = true;

        var initAction = _actions.Init(initState, params[moduleName], options);

        return store.dispatch(initAction);
      }
    }

    return void 0;
  };

  model.moduleName = moduleName;
  model.initState = initState;
  var actions = {};
  return {
    moduleName: moduleName,
    model: model,
    views: views,
    actions: actions
  };
};
var BaseModelHandlers = _decorate(null, function (_initialize) {
  var BaseModelHandlers = function BaseModelHandlers(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;

    _initialize(this);
  };

  return {
    F: BaseModelHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: function value() {
        return null;
      }
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.getState();
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store._medux_.prevState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.getRootState();
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store._medux_.prevState;
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.getCurrentState();
      }
    }, {
      kind: "method",
      key: "getCurrentState",
      value: function getCurrentState() {
        return this.store._medux_.currentState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.getCurrentRootState();
      }
    }, {
      kind: "method",
      key: "getCurrentRootState",
      value: function getCurrentRootState() {
        return this.store._medux_.currentState;
      }
    }, {
      kind: "get",
      key: "beforeState",
      value: function beforeState() {
        return this.getBeforeState();
      }
    }, {
      kind: "method",
      key: "getBeforeState",
      value: function getBeforeState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "beforeRootState",
      value: function beforeRootState() {
        return this.getBeforeRootState();
      }
    }, {
      kind: "method",
      key: "getBeforeRootState",
      value: function getBeforeRootState() {
        return this.store._medux_.beforeState;
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "callThisAction",
      value: function callThisAction(handler) {
        var actions = MetaData.actionCreatorMap[this.moduleName];

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return actions[handler.__actionName__].apply(actions, rest);
      }
    }, {
      kind: "method",
      key: "updateState",
      value: function updateState(payload) {
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.getState(), {}, payload)));
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel$1(moduleName, options) {
        return loadModel(moduleName, this.store, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState, routeParams, options) {
        return Object.assign({}, initState, {
          routeParams: routeParams || initState.routeParams
        }, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload) {
        return payload;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        var state = this.getState();
        return Object.assign({}, state, {
          routeParams: payload
        });
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        var state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, {}, payload)
        });
      }
    }]
  };
});
function isPromiseModule$1(module) {
  return typeof module['then'] === 'function';
}
function isPromiseView(moduleView) {
  return typeof moduleView['then'] === 'function';
}
function exportActions(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce(function (maps, moduleName) {
    maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
      get: function get(target, key) {
        return function () {
          for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            payload[_key2] = arguments[_key2];
          }

          return {
            type: moduleName + config.NSP + key,
            payload: payload
          };
        };
      },
      set: function set() {
        return true;
      }
    });
    return maps;
  }, {});
  return MetaData.actionCreatorMap;
}
function getView(moduleName, viewName, modelOptions) {
  var moduleGetter = MetaData.moduleGetter;
  var result = moduleGetter[moduleName]();

  if (isPromiseModule$1(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = function () {
        return module;
      };

      var view = module.default.views[viewName];

      if (MetaData.isServer) {
        return view;
      }

      var initModel = module.default.model(MetaData.clientStore, modelOptions);

      if (isPromise(initModel)) {
        return initModel.then(function () {
          return view;
        });
      } else {
        return view;
      }
    });
  } else {
    var view = result.default.views[viewName];

    if (MetaData.isServer) {
      return view;
    }

    var initModel = result.default.model(MetaData.clientStore, modelOptions);

    if (isPromise(initModel)) {
      return initModel.then(function () {
        return view;
      });
    } else {
      return view;
    }
  }
}

function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if (isPromiseModule$1(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = function () {
        return module;
      };

      return module;
    });
  } else {
    return result;
  }
}

function getModuleListByNames(moduleNames, moduleGetter) {
  var preModules = moduleNames.map(function (moduleName) {
    var module = getModuleByName(moduleName, moduleGetter);

    if (isPromiseModule$1(module)) {
      return module;
    } else {
      return Promise.resolve(module);
    }
  });
  return Promise.all(preModules);
}

function renderApp(render, moduleGetter, appModuleName, history, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appModuleName;
  var ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  var initData = {};

  if (storeOptions.initData || client[ssrInitStoreKey]) {
    initData = Object.assign({}, client[ssrInitStoreKey], {}, storeOptions.initData);
  }

  var store = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  var reduxStore = store;
  var preModuleNames = [appModuleName];

  if (initData) {
    preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) {
      return key !== appModuleName && initData[key].isModule;
    }));
  }

  return getModuleListByNames(preModuleNames, moduleGetter).then(function (_ref) {
    var appModule = _ref[0];
    var initModel = appModule.default.model(store, undefined);
    render(reduxStore, appModule.default.model, appModule.default.views, ssrInitStoreKey);

    if (isPromise(initModel)) {
      return initModel.then(function () {
        return reduxStore;
      });
    } else {
      return reduxStore;
    }
  });
}
function renderSSR(_x, _x2, _x3, _x4, _x5) {
  return _renderSSR.apply(this, arguments);
}

function _renderSSR() {
  _renderSSR = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(render, moduleGetter, appModuleName, history, storeOptions) {
    var ssrInitStoreKey, store, storeState, paths, appModule, inited, i, k, _paths$i$split, _moduleName, module;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            MetaData.appModuleName = appModuleName;
            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            store = buildStore(history, storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            storeState = store.getState();
            paths = storeState.route.data.paths;
            paths.length === 0 && paths.push(appModuleName);
            appModule = undefined;
            inited = {};
            i = 0, k = paths.length;

          case 10:
            if (!(i < k)) {
              _context.next = 21;
              break;
            }

            _paths$i$split = paths[i].split(config.VSP), _moduleName = _paths$i$split[0];

            if (inited[_moduleName]) {
              _context.next = 18;
              break;
            }

            inited[_moduleName] = true;
            module = moduleGetter[_moduleName]();
            _context.next = 17;
            return module.default.model(store, undefined);

          case 17:
            if (i === 0) {
              appModule = module;
            }

          case 18:
            i++;
            _context.next = 10;
            break;

          case 21:
            return _context.abrupt("return", render(store, appModule.default.model, appModule.default.views, ssrInitStoreKey));

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderSSR.apply(this, arguments);
}

var config$1 = {
  escape: true,
  dateParse: true,
  splitKey: 'q',
  defaultRouteParams: {}
};
function setRouteConfig(conf) {
  conf.escape !== undefined && (config$1.escape = conf.escape);
  conf.dateParse !== undefined && (config$1.dateParse = conf.dateParse);
  conf.splitKey && (config$1.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config$1.defaultRouteParams = conf.defaultRouteParams);
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

  if (config$1.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, config$1.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

function joinSearchString(arr) {
  var strs = [''];

  for (var i = 0, k = arr.length; i < k; i++) {
    strs.push(arr[i] || '');
  }

  return strs.join("&" + config$1.splitKey + "=");
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  var str = JSON.stringify(searchData);

  if (str === '{}') {
    return '';
  }

  if (config$1.escape) {
    return escape(str);
  } else {
    return str;
  }
}

function splitSearch(search) {
  var reg = new RegExp("[&?#]" + config$1.splitKey + "=[^&]*", 'g');
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

        var _moduleName = _viewName.split(config.VSP)[0];

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
    stackParams[0] = deepExtend_1({}, args, stackParams[0]);
  }

  var firstStackParams = stackParams[0];
  var views = paths.reduce(function (prev, cur) {
    var _cur$split = cur.split(config.VSP),
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
    firstStackParams[moduleName] = deepExtend_1({}, config$1.defaultRouteParams[moduleName], firstStackParams[moduleName]);
  });
  var params = deepExtend_1.apply(void 0, [{}].concat(stackParams));
  Object.keys(params).forEach(function (moduleName) {
    if (!firstStackParams[moduleName]) {
      params[moduleName] = deepExtend_1({}, config$1.defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {
    views: views,
    paths: paths,
    params: params,
    stackParams: stackParams
  };
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

        deepExtend_1(stackParams[index], item);
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
      firstStackParamsFilter = deepExtend_1({}, firstStackParams);
      paths.reduce(function (parentAbsoluteViewName, viewName, index) {
        var absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        var rule = viewToRule[absoluteViewName];
        var moduleName = viewName.split(config.VSP)[0];

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
    arr[0] = excludeDefaultData(firstStackParamsFilter, config$1.defaultRouteParams, false, views);
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
    stackParams[0] = deepExtend_1({}, stackParams[0], routePayload.params);
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function isBrowserRoutePayload(data) {
  return typeof data !== 'string' && !data['pathname'];
}

function getBrowserRouteActions(getBrowserHistoryActions) {
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
function buildToBrowserUrl(getTransformRoute) {
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
}

function renderApp$1(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      return React__default.createElement(reactRedux.Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
function renderSSR$1(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return renderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();

    var ReduxProvider = function ReduxProvider(props) {
      return React__default.createElement(reactRedux.Provider, {
        store: store
      }, props.children);
    };

    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
var loadView = function loadView(moduleName, viewName, options, Loading) {
  var _ref = options || {},
      forwardRef = _ref.forwardRef,
      modelOptions = _objectWithoutPropertiesLoose(_ref, ["forwardRef"]);

  var Loader = function ViewLoader(props) {
    var _useState = React.useState(function () {
      var moduleViewResult = getView(moduleName, viewName, modelOptions);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          setView({
            Component: Component
          });
        });
        return null;
      } else {
        return {
          Component: moduleViewResult
        };
      }
    }),
        view = _useState[0],
        setView = _useState[1];

    var forwardRef = props.forwardRef,
        other = _objectWithoutPropertiesLoose(props, ["forwardRef"]);

    var ref = forwardRef ? {
      ref: forwardRef
    } : {};
    return view ? React__default.createElement(view.Component, _extends({}, other, ref)) : Loading ? React__default.createElement(Loading, props) : null;
  };

  var Component = forwardRef ? React__default.forwardRef(function (props, ref) {
    return React__default.createElement(Loader, _extends({}, props, {
      forwardRef: ref
    }));
  }) : Loader;
  return Component;
};
var exportModule$1 = exportModule;

function isLocation(data) {
  return !!data['pathname'];
}

var BrowserHistoryProxy = function () {
  function BrowserHistoryProxy(history, locationToRoute) {
    this.history = history;
    this.locationToRoute = locationToRoute;

    _defineProperty(this, "initialized", true);
  }

  var _proto = BrowserHistoryProxy.prototype;

  _proto.getLocation = function getLocation() {
    return this.history.location;
  };

  _proto.subscribe = function subscribe(listener) {
    this.history.listen(listener);
  };

  _proto.locationToRouteData = function locationToRouteData(location) {
    return location.state || this.locationToRoute(location);
  };

  _proto.equal = function equal(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  };

  _proto.patch = function patch(location, routeData) {
    this.history.push(Object.assign({}, location, {
      state: routeData
    }));
  };

  return BrowserHistoryProxy;
}();

var BrowserHistoryActions = function () {
  function BrowserHistoryActions(history, routeToLocation) {
    this.history = history;
    this.routeToLocation = routeToLocation;
  }

  var _proto2 = BrowserHistoryActions.prototype;

  _proto2.push = function push(data) {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isLocation(data)) {
      this.history.push(Object.assign({}, data, {
        state: undefined
      }));
    } else {
      var _location = this.routeToLocation(data);

      this.history.push(Object.assign({}, _location, {
        state: data
      }));
    }
  };

  _proto2.replace = function replace(data) {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isLocation(data)) {
      this.history.replace(Object.assign({}, data, {
        state: undefined
      }));
    } else {
      var _location2 = this.routeToLocation(data);

      this.history.replace(Object.assign({}, _location2, {
        state: data
      }));
    }
  };

  _proto2.go = function go(n) {
    this.history.go(n);
  };

  _proto2.goBack = function goBack() {
    this.history.goBack();
  };

  _proto2.goForward = function goForward() {
    this.history.goForward();
  };

  return BrowserHistoryActions;
}();

function createHistory(history, transformRoute) {
  var historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  var historyActions = new BrowserHistoryActions(history, transformRoute.routeToLocation);
  return {
    historyProxy: historyProxy,
    historyActions: historyActions
  };
}

var historyActions = undefined;
var transformRoute = undefined;
function getBrowserHistory() {
  return {
    historyActions: getBrowserRouteActions(function () {
      return historyActions;
    }),
    toUrl: buildToBrowserUrl(function () {
      return transformRoute;
    })
  };
}
function buildApp(moduleGetter, appModuleName, history, routeConfig, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  var historyData = createHistory(history, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  return renderApp$1(function (Provider, AppMainView, ssrInitStoreKey) {
    var WithRouter = reactRouterDom.withRouter(AppMainView);
    var app = React__default.createElement(Provider, null, React__default.createElement(reactRouterDom.Router, {
      history: history
    }, React__default.createElement(WithRouter, null)));

    if (typeof container === 'function') {
      container(app);
    } else {
      var render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(app, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
function buildSSR(moduleGetter, appModuleName, location, routeConfig, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  var historyData = createHistory({
    listen: function listen() {
      return void 0;
    },
    location: history.createLocation(location)
  }, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  var render = renderToStream ? server.renderToNodeStream : server.renderToString;
  return renderSSR$1(function (Provider, AppMainView) {
    return render(React__default.createElement(Provider, null, React__default.createElement(reactRouterDom.StaticRouter, {
      location: location
    }, React__default.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}

exports.ActionTypes = ActionTypes;
exports.BaseModelHandlers = BaseModelHandlers;
exports.buildApp = buildApp;
exports.buildSSR = buildSSR;
exports.delayPromise = delayPromise;
exports.effect = effect;
exports.errorAction = errorAction;
exports.exportActions = exportActions;
exports.exportModule = exportModule$1;
exports.getBrowserHistory = getBrowserHistory;
exports.loadView = loadView;
exports.reducer = reducer;
exports.setRouteConfig = setRouteConfig;
