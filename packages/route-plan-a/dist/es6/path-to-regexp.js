// fork from path-to-regexp 6.1.0
// https://github.com/pillarjs/path-to-regexp

/**
 * Tokenizer results.
 */

/**
 * Tokenize input string.
 */
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

        if ( // `0-9`
        code >= 48 && code <= 57 || // `A-Z`
        code >= 65 && code <= 90 || // `a-z`
        code >= 97 && code <= 122 || // `_`
        code === 95 || // `.`
        code === 46) {
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

/**
 * Parse a string for the raw tokens.
 */
export function parse(str, options) {
  if (options === void 0) {
    options = {};
  }

  var tokens = lexer(str);
  var {
    prefixes = './'
  } = options;
  var defaultPattern = "[^" + escapeString(options.delimiter || '/#?') + "]+?";
  var result = [];
  var key = 0;
  var i = 0;
  var path = '';

  var tryConsume = type => {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    return undefined;
  };

  var mustConsume = type => {
    var value = tryConsume(type);
    if (value !== undefined) return value;
    var {
      type: nextType,
      index
    } = tokens[i];
    throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
  };

  var consumeText = () => {
    var result = '';
    var value; // tslint:disable-next-line

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
        prefix,
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
        suffix,
        modifier: tryConsume('MODIFIER') || ''
      });
      continue;
    }

    mustConsume('END');
  }

  return result;
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

    return undefined;
  });
  return data => {
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

      if (key.modifier === '*' || key.modifier === '+') {
        params[key.name] = m[i].split(key.prefix + key.suffix).map(value => {
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
        suffix: '',
        modifier: '',
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
    strict = false,
    start = true,
    end = true,
    encode = x => x
  } = options;
  var endsWith = "[" + escapeString(options.endsWith || '') + "]|$";
  var delimiter = "[" + escapeString(options.delimiter || '/#?') + "]";
  var route = start ? '^' : ''; // Iterate over the tokens and create our regexp string.

  for (var _token2 of tokens) {
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
    var isEndDelimited = typeof endToken === 'string' ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : // tslint:disable-next-line
    endToken === undefined;

    if (!strict) {
      route += "(?:" + delimiter + "(?=" + endsWith + "))?";
    }

    if (!isEndDelimited) {
      route += "(?=" + delimiter + "|" + endsWith + ")";
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
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
//# sourceMappingURL=path-to-regexp.js.map