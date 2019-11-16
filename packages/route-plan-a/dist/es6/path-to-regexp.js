// fork from path-to-regexp 5.0.0
// https://github.com/pillarjs/path-to-regexp

/**
 * Default configs.
 */
var DEFAULT_DELIMITER = '/';

/**
 * Balanced bracket helper function.
 */
function balanced(open, close, str, index) {
  var count = 0;
  var i = index;

  while (i < str.length) {
    if (str[i] === '\\') {
      i += 2;
      continue;
    }

    if (str[i] === close) {
      count--;
      if (count === 0) return i + 1;
    }

    if (str[i] === open) {
      count++;
    }

    i++;
  }

  return -1;
}
/**
 * Parse a string for the raw tokens.
 */


export function parse(str, options) {
  var _options$delimiter, _options$whitelist;

  if (options === void 0) {
    options = {};
  }

  var tokens = [];
  var defaultDelimiter = (_options$delimiter = options.delimiter) !== null && _options$delimiter !== void 0 ? _options$delimiter : DEFAULT_DELIMITER;
  var whitelist = (_options$whitelist = options.whitelist) !== null && _options$whitelist !== void 0 ? _options$whitelist : undefined;
  var i = 0;
  var key = 0;
  var path = '';
  var isEscaped = false; // tslint:disable-next-line

  while (i < str.length) {
    var prefix = '';
    var name = '';
    var pattern = ''; // Ignore escaped sequences.

    if (str[i] === '\\') {
      i++;
      path += str[i++];
      isEscaped = true;
      continue;
    }

    if (str[i] === ':') {
      while (++i < str.length) {
        var code = str.charCodeAt(i);

        if ( // `0-9`
        code >= 48 && code <= 57 || // `A-Z`
        code >= 65 && code <= 90 || // `a-z`
        code >= 97 && code <= 122 || // `_`
        code === 95 || // `.`
        code === 46) {
          name += str[i];
          continue;
        }

        break;
      } // False positive on param name.


      if (!name) i--;
    }

    if (str[i] === '(') {
      var end = balanced('(', ')', str, i); // False positive on matching brackets.

      if (end > -1) {
        pattern = str.slice(i + 1, end - 1);
        i = end;

        if (pattern[0] === '?') {
          throw new TypeError('Path pattern must be a capturing group');
        }

        if (/\((?=[^?])/.test(pattern)) {
          var validPattern = pattern.replace(/\((?=[^?])/, '(?:');
          throw new TypeError("Capturing groups are not allowed in pattern, use a non-capturing group: (" + validPattern + ")");
        }
      }
    } // Add regular characters to the path string.


    if (name === '' && pattern === '') {
      path += str[i++];
      isEscaped = false;
      continue;
    } // Extract the final character from `path` for the prefix.


    if (path.length && !isEscaped) {
      var char = path[path.length - 1];
      var matches = whitelist ? whitelist.indexOf(char) > -1 : true;

      if (matches) {
        prefix = char;
        path = path.slice(0, -1);
      }
    } // Push the current path onto the list of tokens.


    if (path.length) {
      tokens.push(path);
      path = '';
    }

    var repeat = str[i] === '+' || str[i] === '*';
    var optional = str[i] === '?' || str[i] === '*';
    var delimiter = prefix || defaultDelimiter; // Increment `i` past modifier token.

    if (repeat || optional) i++;
    tokens.push({
      name: name || key++,
      prefix,
      delimiter,
      optional,
      repeat,
      pattern: pattern || "[^" + escapeString(delimiter === defaultDelimiter ? delimiter : delimiter + defaultDelimiter) + "]+?"
    });
  }

  if (path.length) tokens.push(path);
  return tokens;
}

/**
 * Compile a string to a template function for the path.
 */
export function compile(str, options) {
  return tokensToFunction(parse(str, options), options);
}

/**
 * Expose a method for transforming tokens into the path function.
 */
export function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }

  var reFlags = flags(options);
  var {
    encode = x => x,
    validate = true
  } = options; // Compile all the tokens into regexps.

  var matches = tokens.map(token => {
    if (typeof token === 'object') {
      return new RegExp("^(?:" + token.pattern + ")$", reFlags);
    }

    return void 0;
  });
  return data => {
    var path = '';

    for (var i = 0; i < tokens.length; i++) {
      var _token = tokens[i];

      if (typeof _token === 'string') {
        path += _token;
        continue;
      }

      var _value = data ? data[_token.name] : undefined;

      if (Array.isArray(_value)) {
        if (!_token.repeat) {
          throw new TypeError("Expected \"" + _token.name + "\" to not repeat, but got an array");
        }

        if (_value.length === 0) {
          if (_token.optional) continue;
          throw new TypeError("Expected \"" + _token.name + "\" to not be empty");
        }

        for (var j = 0; j < _value.length; j++) {
          var segment = encode(_value[j], _token);

          if (validate && !matches[i].test(segment)) {
            throw new TypeError("Expected all \"" + _token.name + "\" to match \"" + _token.pattern + "\", but got \"" + segment + "\"");
          }

          path += (j === 0 ? _token.prefix : _token.delimiter) + segment;
        }

        continue;
      }

      if (typeof _value === 'string' || typeof _value === 'number') {
        var _segment = encode(String(_value), _token);

        if (validate && !matches[i].test(_segment)) {
          throw new TypeError("Expected \"" + _token.name + "\" to match \"" + _token.pattern + "\", but got \"" + _segment + "\"");
        }

        path += _token.prefix + _segment;
        continue;
      }

      if (_token.optional) continue;
      var typeOfMessage = _token.repeat ? 'an array' : 'a string';
      throw new TypeError("Expected \"" + _token.name + "\" to be " + typeOfMessage);
    }

    return path;
  };
}

/**
 * Create path match function from `path-to-regexp` spec.
 */
export function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
/**
 * Create a path match function from `path-to-regexp` output.
 */

export function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }

  var {
    decode = x => x
  } = options;
  return function (pathname) {
    var m = re.exec(pathname);
    if (!m) return false;
    var {
      0: path,
      index
    } = m;
    var params = Object.create(null);

    var _loop = function _loop(i) {
      // tslint:disable-next-line
      if (m[i] === undefined) return "continue";
      var key = keys[i - 1];

      if (key.repeat) {
        params[key.name] = m[i].split(key.delimiter).map(value => {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i], key);
      }
    };

    for (var i = 1; i < m.length; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    }

    return {
      path,
      index,
      params
    };
  };
}
/**
 * Escape a regular expression string.
 */

function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}
/**
 * Get the flags for a regexp from the options.
 */


function flags(options) {
  return options && options.sensitive ? '' : 'i';
}
/**
 * Metadata about a key.
 */


/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
  if (!keys) return path; // Use a negative lookahead to match only capturing groups.

  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: '',
        delimiter: '',
        optional: false,
        repeat: false,
        pattern: ''
      });
    }
  }

  return path;
}
/**
 * Transform an array into a regexp.
 */


function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(path => pathToRegexp(path, keys, options).source);
  return new RegExp("(?:" + parts.join('|') + ")", flags(options));
}
/**
 * Create a path regexp from string input.
 */


function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 */
export function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }

  var {
    strict,
    start = true,
    end = true,
    delimiter = DEFAULT_DELIMITER,
    encode = x => x
  } = options;
  var endsWith = (typeof options.endsWith === 'string' ? options.endsWith.split('') : options.endsWith || []).map(escapeString).concat('$').join('|');
  var route = start ? '^' : ''; // Iterate over the tokens and create our regexp string.

  for (var _token2 of tokens) {
    if (typeof _token2 === 'string') {
      route += escapeString(encode(_token2));
    } else {
      var capture = _token2.repeat ? "(?:" + _token2.pattern + ")(?:" + escapeString(_token2.delimiter) + "(?:" + _token2.pattern + "))*" : _token2.pattern;
      if (keys) keys.push(_token2);

      if (_token2.optional) {
        if (!_token2.prefix) {
          route += "(" + capture + ")?";
        } else {
          route += "(?:" + escapeString(_token2.prefix) + "(" + capture + "))?";
        }
      } else {
        route += escapeString(_token2.prefix) + "(" + capture + ")";
      }
    }
  }

  if (end) {
    if (!strict) route += "(?:" + escapeString(delimiter) + ")?";
    route += endsWith === '$' ? '$' : "(?=" + endsWith + ")";
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === 'string' ? endToken[endToken.length - 1] === delimiter : // tslint:disable-next-line
    endToken === undefined;

    if (!strict) {
      route += "(?:" + escapeString(delimiter) + "(?=" + endsWith + "))?";
    }

    if (!isEndDelimited) {
      route += "(?=" + escapeString(delimiter) + "|" + endsWith + ")";
    }
  }

  return new RegExp(route, flags(options));
}
/**
 * Supported `path-to-regexp` input types.
 */

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
export function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys);
  }

  if (Array.isArray(path)) {
    return arrayToRegexp(path, keys, options);
  }

  return stringToRegexp(path, keys, options);
}
//# sourceMappingURL=path-to-regexp.js.map