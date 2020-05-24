'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var pathGetter_1 = pathGetter;

function pathGetter(obj, path) {
  if (path !== '$') {
    var paths = getPaths(path);

    for (var i = 0; i < paths.length; i++) {
      path = paths[i].toString().replace(/\\"/g, '"');
      if (typeof obj[path] === 'undefined' && i !== paths.length - 1) continue;
      obj = obj[path];
    }
  }

  return obj;
}

function getPaths(pathString) {
  var regex = /(?:\.(\w+))|(?:\[(\d+)\])|(?:\["((?:[^\\"]|\\.)*)"\])/g;
  var matches = [];
  var match;

  while (match = regex.exec(pathString)) {
    matches.push(match[1] || match[2] || match[3]);
  }

  return matches;
}

var getRegexFlags = function getRegexFlags(regex) {
  var flags = '';
  if (regex.ignoreCase) flags += 'i';
  if (regex.global) flags += 'g';
  if (regex.multiline) flags += 'm';
  return flags;
};

var stringifyFunction = function stringifyFunction(fn, customToString) {
  if (typeof customToString === 'function') {
    return customToString(fn);
  }

  var str = fn.toString();
  var match = str.match(/^[^{]*{|^[^=]*=>/);
  var start = match ? match[0] : '<function> ';
  var end = str[str.length - 1] === '}' ? '}' : '';
  return start.replace(/\r\n|\n/g, ' ').replace(/\s+/g, ' ') + ' /* ... */ ' + end;
};

var restore = function restore(obj, root) {
  var type = obj[0];
  var rest = obj.slice(1);

  switch (type) {
    case '$':
      return pathGetter_1(root, obj);

    case 'r':
      var comma = rest.indexOf(',');
      var flags = rest.slice(0, comma);
      var source = rest.slice(comma + 1);
      return RegExp(source, flags);

    case 'd':
      return new Date(+rest);

    case 'f':
      var fn = function () {
        throw new Error("can't run jsan parsed function");
      };

      fn.toString = function () {
        return rest;
      };

      return fn;

    case 'u':
      return undefined;

    case 'e':
      var error = new Error(rest);
      error.stack = 'Stack is unavailable for jsan parsed errors';
      return error;

    case 's':
      return Symbol(rest);

    case 'g':
      return Symbol.for(rest);

    case 'm':
      return new Map(lib.parse(rest));

    case 'l':
      return new Set(lib.parse(rest));

    case 'n':
      return NaN;

    case 'i':
      return Infinity;

    case 'y':
      return -Infinity;

    default:
      console.warn('unknown type', obj);
      return obj;
  }
};

var utils = {
	getRegexFlags: getRegexFlags,
	stringifyFunction: stringifyFunction,
	restore: restore
};

var WMap = typeof WeakMap !== 'undefined' ? WeakMap : function () {
  var keys = [];
  var values = [];
  return {
    set: function (key, value) {
      keys.push(key);
      values.push(value);
    },
    get: function (key) {
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] === key) {
          return values[i];
        }
      }
    }
  };
}; // Based on https://github.com/douglascrockford/JSON-js/blob/master/cycle.js

var decycle = function decycle(object, options, replacer) {

  var map = new WMap();
  var noCircularOption = !Object.prototype.hasOwnProperty.call(options, 'circular');
  var withRefs = options.refs !== false;
  return function derez(_value, path, key) {
    // The derez recurses through the object, producing the deep copy.
    var i, // The loop counter
    name, // Property name
    nu; // The new object or array
    // typeof null === 'object', so go on if this value is really an object but not
    // one of the weird builtin objects.

    var value = typeof replacer === 'function' ? replacer(key || '', _value) : _value;

    if (options.date && value instanceof Date) {
      return {
        $jsan: 'd' + value.getTime()
      };
    }

    if (options.regex && value instanceof RegExp) {
      return {
        $jsan: 'r' + utils.getRegexFlags(value) + ',' + value.source
      };
    }

    if (options['function'] && typeof value === 'function') {
      return {
        $jsan: 'f' + utils.stringifyFunction(value, options['function'])
      };
    }

    if (options['nan'] && typeof value === 'number' && isNaN(value)) {
      return {
        $jsan: 'n'
      };
    }

    if (options['infinity']) {
      if (Number.POSITIVE_INFINITY === value) return {
        $jsan: 'i'
      };
      if (Number.NEGATIVE_INFINITY === value) return {
        $jsan: 'y'
      };
    }

    if (options['undefined'] && value === undefined) {
      return {
        $jsan: 'u'
      };
    }

    if (options['error'] && value instanceof Error) {
      return {
        $jsan: 'e' + value.message
      };
    }

    if (options['symbol'] && typeof value === 'symbol') {
      var symbolKey = Symbol.keyFor(value);

      if (symbolKey !== undefined) {
        return {
          $jsan: 'g' + symbolKey
        };
      } // 'Symbol(foo)'.slice(7, -1) === 'foo'


      return {
        $jsan: 's' + value.toString().slice(7, -1)
      };
    }

    if (options['map'] && typeof Map === 'function' && value instanceof Map && typeof Array.from === 'function') {
      return {
        $jsan: 'm' + JSON.stringify(decycle(Array.from(value), options, replacer))
      };
    }

    if (options['set'] && typeof Set === 'function' && value instanceof Set && typeof Array.from === 'function') {
      return {
        $jsan: 'l' + JSON.stringify(decycle(Array.from(value), options, replacer))
      };
    }

    if (value && typeof value.toJSON === 'function') {
      try {
        value = value.toJSON(key);
      } catch (error) {
        var keyString = key || '$';
        return "toJSON failed for '" + (map.get(value) || keyString) + "'";
      }
    }

    if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String) && !(typeof value === 'symbol') && !(value instanceof Error)) {
      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a $ref/path object.
      if (typeof value === 'object') {
        var foundPath = map.get(value);

        if (foundPath) {
          if (noCircularOption && withRefs) {
            return {
              $jsan: foundPath
            };
          }

          if (path.indexOf(foundPath) === 0) {
            if (!noCircularOption) {
              return typeof options.circular === 'function' ? options.circular(value, path, foundPath) : options.circular;
            }

            return {
              $jsan: foundPath
            };
          }

          if (withRefs) return {
            $jsan: foundPath
          };
        }

        map.set(value, path);
      } // If it is an array, replicate the array.


      if (Object.prototype.toString.apply(value) === '[object Array]') {
        nu = [];

        for (i = 0; i < value.length; i += 1) {
          nu[i] = derez(value[i], path + '[' + i + ']', i);
        }
      } else {
        // If it is an object, replicate the object.
        nu = {};

        for (name in value) {
          if (Object.prototype.hasOwnProperty.call(value, name)) {
            var nextPath = /^\w+$/.test(name) ? '.' + name : '[' + JSON.stringify(name) + ']';
            nu[name] = name === '$jsan' ? [derez(value[name], path + nextPath)] : derez(value[name], path + nextPath, name);
          }
        }
      }

      return nu;
    }

    return value;
  }(object, '$');
};

var retrocycle = function retrocycle($) {

  return function rez(value) {
    // The rez function walks recursively through the object looking for $jsan
    // properties. When it finds one that has a value that is a path, then it
    // replaces the $jsan object with a reference to the value that is found by
    // the path.
    var i, item, name;

    if (value && typeof value === 'object') {
      if (Object.prototype.toString.apply(value) === '[object Array]') {
        for (i = 0; i < value.length; i += 1) {
          item = value[i];

          if (item && typeof item === 'object') {
            if (item.$jsan) {
              value[i] = utils.restore(item.$jsan, $);
            } else {
              rez(item);
            }
          }
        }
      } else {
        for (name in value) {
          // base case passed raw object
          if (typeof value[name] === 'string' && name === '$jsan') {
            return utils.restore(value.$jsan, $);
          } else {
            if (name === '$jsan') {
              value[name] = value[name][0];
            }

            if (typeof value[name] === 'object') {
              item = value[name];

              if (item && typeof item === 'object') {
                if (item.$jsan) {
                  value[name] = utils.restore(item.$jsan, $);
                } else {
                  rez(item);
                }
              }
            }
          }
        }
      }
    }

    return value;
  }($);
};

var cycle = {
	decycle: decycle,
	retrocycle: retrocycle
};

var stringify = function stringify(value, replacer, space, _options) {
  if (arguments.length < 4) {
    try {
      if (arguments.length === 1) {
        return JSON.stringify(value);
      } else {
        return JSON.stringify.apply(JSON, arguments);
      }
    } catch (e) {}
  }

  var options = _options || false;

  if (typeof options === 'boolean') {
    options = {
      'date': options,
      'function': options,
      'regex': options,
      'undefined': options,
      'error': options,
      'symbol': options,
      'map': options,
      'set': options,
      'nan': options,
      'infinity': options
    };
  }

  var decycled = cycle.decycle(value, options, replacer);

  if (arguments.length === 1) {
    return JSON.stringify(decycled);
  } else {
    // decycle already handles when replacer is a function.
    return JSON.stringify(decycled, Array.isArray(replacer) ? replacer : null, space);
  }
};

var parse = function parse(text, reviver) {
  var needsRetrocycle = /"\$jsan"/.test(text);
  var parsed;

  if (arguments.length === 1) {
    parsed = JSON.parse(text);
  } else {
    parsed = JSON.parse(text, reviver);
  }

  if (needsRetrocycle) {
    parsed = cycle.retrocycle(parsed);
  }

  return parsed;
};

var lib = {
	stringify: stringify,
	parse: parse
};

var jsan = lib;

var socketclusterClient = createCommonjsModule(function (module, exports) {
(function (f) {
  {
    module.exports = f();
  }
})(function () {
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof commonjsRequire && commonjsRequire;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = "function" == typeof commonjsRequire && commonjsRequire, i = 0; i < t.length; i++) o(t[i]);

      return o;
    }

    return r;
  }()({
    1: [function (require, module, exports) {

      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;

      function getLens(b64) {
        var len = b64.length;

        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4');
        }

        var validLen = b64.indexOf('=');
        if (validLen === -1) validLen = len;
        var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }

      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }

      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }

      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i;

        for (i = 0; i < len; i += 4) {
          tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
          arr[curByte++] = tmp >> 16 & 0xFF;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }

        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
          arr[curByte++] = tmp & 0xFF;
        }

        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }

        return arr;
      }

      function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
      }

      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];

        for (var i = start; i < end; i += 3) {
          tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
          output.push(tripletToBase64(tmp));
        }

        return output.join('');
      }

      function fromByteArray(uint8) {
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3;
        var parts = [];
        var maxChunkLength = 16383;

        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
        }

        if (extraBytes === 1) {
          tmp = uint8[len - 1];
          parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1];
          parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
        }

        return parts.join('');
      }
    }, {}],
    2: [function (require, module, exports) {
      (function (Buffer) {

        var base64 = require('base64-js');

        var ieee754 = require('ieee754');

        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        var K_MAX_LENGTH = 0x7fffffff;
        exports.kMaxLength = K_MAX_LENGTH;
        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

        if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
          console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
        }

        function typedArraySupport() {
          try {
            var arr = new Uint8Array(1);
            arr.__proto__ = {
              __proto__: Uint8Array.prototype,
              foo: function () {
                return 42;
              }
            };
            return arr.foo() === 42;
          } catch (e) {
            return false;
          }
        }

        Object.defineProperty(Buffer.prototype, 'parent', {
          enumerable: true,
          get: function () {
            if (!Buffer.isBuffer(this)) return undefined;
            return this.buffer;
          }
        });
        Object.defineProperty(Buffer.prototype, 'offset', {
          enumerable: true,
          get: function () {
            if (!Buffer.isBuffer(this)) return undefined;
            return this.byteOffset;
          }
        });

        function createBuffer(length) {
          if (length > K_MAX_LENGTH) {
            throw new RangeError('The value "' + length + '" is invalid for option "size"');
          }

          var buf = new Uint8Array(length);
          buf.__proto__ = Buffer.prototype;
          return buf;
        }

        function Buffer(arg, encodingOrOffset, length) {
          if (typeof arg === 'number') {
            if (typeof encodingOrOffset === 'string') {
              throw new TypeError('The "string" argument must be of type string. Received type number');
            }

            return allocUnsafe(arg);
          }

          return from(arg, encodingOrOffset, length);
        }

        if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
          Object.defineProperty(Buffer, Symbol.species, {
            value: null,
            configurable: true,
            enumerable: false,
            writable: false
          });
        }

        Buffer.poolSize = 8192;

        function from(value, encodingOrOffset, length) {
          if (typeof value === 'string') {
            return fromString(value, encodingOrOffset);
          }

          if (ArrayBuffer.isView(value)) {
            return fromArrayLike(value);
          }

          if (value == null) {
            throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
          }

          if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
            return fromArrayBuffer(value, encodingOrOffset, length);
          }

          if (typeof value === 'number') {
            throw new TypeError('The "value" argument must not be of type number. Received type number');
          }

          var valueOf = value.valueOf && value.valueOf();

          if (valueOf != null && valueOf !== value) {
            return Buffer.from(valueOf, encodingOrOffset, length);
          }

          var b = fromObject(value);
          if (b) return b;

          if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
            return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
          }

          throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
        }

        Buffer.from = function (value, encodingOrOffset, length) {
          return from(value, encodingOrOffset, length);
        };

        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;

        function assertSize(size) {
          if (typeof size !== 'number') {
            throw new TypeError('"size" argument must be of type number');
          } else if (size < 0) {
            throw new RangeError('The value "' + size + '" is invalid for option "size"');
          }
        }

        function alloc(size, fill, encoding) {
          assertSize(size);

          if (size <= 0) {
            return createBuffer(size);
          }

          if (fill !== undefined) {
            return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
          }

          return createBuffer(size);
        }

        Buffer.alloc = function (size, fill, encoding) {
          return alloc(size, fill, encoding);
        };

        function allocUnsafe(size) {
          assertSize(size);
          return createBuffer(size < 0 ? 0 : checked(size) | 0);
        }

        Buffer.allocUnsafe = function (size) {
          return allocUnsafe(size);
        };

        Buffer.allocUnsafeSlow = function (size) {
          return allocUnsafe(size);
        };

        function fromString(string, encoding) {
          if (typeof encoding !== 'string' || encoding === '') {
            encoding = 'utf8';
          }

          if (!Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding);
          }

          var length = byteLength(string, encoding) | 0;
          var buf = createBuffer(length);
          var actual = buf.write(string, encoding);

          if (actual !== length) {
            buf = buf.slice(0, actual);
          }

          return buf;
        }

        function fromArrayLike(array) {
          var length = array.length < 0 ? 0 : checked(array.length) | 0;
          var buf = createBuffer(length);

          for (var i = 0; i < length; i += 1) {
            buf[i] = array[i] & 255;
          }

          return buf;
        }

        function fromArrayBuffer(array, byteOffset, length) {
          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError('"offset" is outside of buffer bounds');
          }

          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError('"length" is outside of buffer bounds');
          }

          var buf;

          if (byteOffset === undefined && length === undefined) {
            buf = new Uint8Array(array);
          } else if (length === undefined) {
            buf = new Uint8Array(array, byteOffset);
          } else {
            buf = new Uint8Array(array, byteOffset, length);
          }

          buf.__proto__ = Buffer.prototype;
          return buf;
        }

        function fromObject(obj) {
          if (Buffer.isBuffer(obj)) {
            var len = checked(obj.length) | 0;
            var buf = createBuffer(len);

            if (buf.length === 0) {
              return buf;
            }

            obj.copy(buf, 0, 0, len);
            return buf;
          }

          if (obj.length !== undefined) {
            if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
              return createBuffer(0);
            }

            return fromArrayLike(obj);
          }

          if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
            return fromArrayLike(obj.data);
          }
        }

        function checked(length) {
          if (length >= K_MAX_LENGTH) {
            throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
          }

          return length | 0;
        }

        function SlowBuffer(length) {
          if (+length != length) {
            length = 0;
          }

          return Buffer.alloc(+length);
        }

        Buffer.isBuffer = function isBuffer(b) {
          return b != null && b._isBuffer === true && b !== Buffer.prototype;
        };

        Buffer.compare = function compare(a, b) {
          if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
          if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);

          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
            throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
          }

          if (a === b) return 0;
          var x = a.length;
          var y = b.length;

          for (var i = 0, len = Math.min(x, y); i < len; ++i) {
            if (a[i] !== b[i]) {
              x = a[i];
              y = b[i];
              break;
            }
          }

          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };

        Buffer.isEncoding = function isEncoding(encoding) {
          switch (String(encoding).toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'latin1':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return true;

            default:
              return false;
          }
        };

        Buffer.concat = function concat(list, length) {
          if (!Array.isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }

          if (list.length === 0) {
            return Buffer.alloc(0);
          }

          var i;

          if (length === undefined) {
            length = 0;

            for (i = 0; i < list.length; ++i) {
              length += list[i].length;
            }
          }

          var buffer = Buffer.allocUnsafe(length);
          var pos = 0;

          for (i = 0; i < list.length; ++i) {
            var buf = list[i];

            if (isInstance(buf, Uint8Array)) {
              buf = Buffer.from(buf);
            }

            if (!Buffer.isBuffer(buf)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }

            buf.copy(buffer, pos);
            pos += buf.length;
          }

          return buffer;
        };

        function byteLength(string, encoding) {
          if (Buffer.isBuffer(string)) {
            return string.length;
          }

          if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
            return string.byteLength;
          }

          if (typeof string !== 'string') {
            throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
          }

          var len = string.length;
          var mustMatch = arguments.length > 2 && arguments[2] === true;
          if (!mustMatch && len === 0) return 0;
          var loweredCase = false;

          for (;;) {
            switch (encoding) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return len;

              case 'utf8':
              case 'utf-8':
                return utf8ToBytes(string).length;

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return len * 2;

              case 'hex':
                return len >>> 1;

              case 'base64':
                return base64ToBytes(string).length;

              default:
                if (loweredCase) {
                  return mustMatch ? -1 : utf8ToBytes(string).length;
                }

                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        }

        Buffer.byteLength = byteLength;

        function slowToString(encoding, start, end) {
          var loweredCase = false;

          if (start === undefined || start < 0) {
            start = 0;
          }

          if (start > this.length) {
            return '';
          }

          if (end === undefined || end > this.length) {
            end = this.length;
          }

          if (end <= 0) {
            return '';
          }

          end >>>= 0;
          start >>>= 0;

          if (end <= start) {
            return '';
          }

          if (!encoding) encoding = 'utf8';

          while (true) {
            switch (encoding) {
              case 'hex':
                return hexSlice(this, start, end);

              case 'utf8':
              case 'utf-8':
                return utf8Slice(this, start, end);

              case 'ascii':
                return asciiSlice(this, start, end);

              case 'latin1':
              case 'binary':
                return latin1Slice(this, start, end);

              case 'base64':
                return base64Slice(this, start, end);

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return utf16leSlice(this, start, end);

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                encoding = (encoding + '').toLowerCase();
                loweredCase = true;
            }
          }
        }

        Buffer.prototype._isBuffer = true;

        function swap(b, n, m) {
          var i = b[n];
          b[n] = b[m];
          b[m] = i;
        }

        Buffer.prototype.swap16 = function swap16() {
          var len = this.length;

          if (len % 2 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 16-bits');
          }

          for (var i = 0; i < len; i += 2) {
            swap(this, i, i + 1);
          }

          return this;
        };

        Buffer.prototype.swap32 = function swap32() {
          var len = this.length;

          if (len % 4 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 32-bits');
          }

          for (var i = 0; i < len; i += 4) {
            swap(this, i, i + 3);
            swap(this, i + 1, i + 2);
          }

          return this;
        };

        Buffer.prototype.swap64 = function swap64() {
          var len = this.length;

          if (len % 8 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 64-bits');
          }

          for (var i = 0; i < len; i += 8) {
            swap(this, i, i + 7);
            swap(this, i + 1, i + 6);
            swap(this, i + 2, i + 5);
            swap(this, i + 3, i + 4);
          }

          return this;
        };

        Buffer.prototype.toString = function toString() {
          var length = this.length;
          if (length === 0) return '';
          if (arguments.length === 0) return utf8Slice(this, 0, length);
          return slowToString.apply(this, arguments);
        };

        Buffer.prototype.toLocaleString = Buffer.prototype.toString;

        Buffer.prototype.equals = function equals(b) {
          if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
          if (this === b) return true;
          return Buffer.compare(this, b) === 0;
        };

        Buffer.prototype.inspect = function inspect() {
          var str = '';
          var max = exports.INSPECT_MAX_BYTES;
          str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
          if (this.length > max) str += ' ... ';
          return '<Buffer ' + str + '>';
        };

        Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
          if (isInstance(target, Uint8Array)) {
            target = Buffer.from(target, target.offset, target.byteLength);
          }

          if (!Buffer.isBuffer(target)) {
            throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
          }

          if (start === undefined) {
            start = 0;
          }

          if (end === undefined) {
            end = target ? target.length : 0;
          }

          if (thisStart === undefined) {
            thisStart = 0;
          }

          if (thisEnd === undefined) {
            thisEnd = this.length;
          }

          if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
            throw new RangeError('out of range index');
          }

          if (thisStart >= thisEnd && start >= end) {
            return 0;
          }

          if (thisStart >= thisEnd) {
            return -1;
          }

          if (start >= end) {
            return 1;
          }

          start >>>= 0;
          end >>>= 0;
          thisStart >>>= 0;
          thisEnd >>>= 0;
          if (this === target) return 0;
          var x = thisEnd - thisStart;
          var y = end - start;
          var len = Math.min(x, y);
          var thisCopy = this.slice(thisStart, thisEnd);
          var targetCopy = target.slice(start, end);

          for (var i = 0; i < len; ++i) {
            if (thisCopy[i] !== targetCopy[i]) {
              x = thisCopy[i];
              y = targetCopy[i];
              break;
            }
          }

          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };

        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
          if (buffer.length === 0) return -1;

          if (typeof byteOffset === 'string') {
            encoding = byteOffset;
            byteOffset = 0;
          } else if (byteOffset > 0x7fffffff) {
            byteOffset = 0x7fffffff;
          } else if (byteOffset < -0x80000000) {
            byteOffset = -0x80000000;
          }

          byteOffset = +byteOffset;

          if (numberIsNaN(byteOffset)) {
            byteOffset = dir ? 0 : buffer.length - 1;
          }

          if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

          if (byteOffset >= buffer.length) {
            if (dir) return -1;else byteOffset = buffer.length - 1;
          } else if (byteOffset < 0) {
            if (dir) byteOffset = 0;else return -1;
          }

          if (typeof val === 'string') {
            val = Buffer.from(val, encoding);
          }

          if (Buffer.isBuffer(val)) {
            if (val.length === 0) {
              return -1;
            }

            return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
          } else if (typeof val === 'number') {
            val = val & 0xFF;

            if (typeof Uint8Array.prototype.indexOf === 'function') {
              if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
              } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
              }
            }

            return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
          }

          throw new TypeError('val must be string, number or Buffer');
        }

        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
          var indexSize = 1;
          var arrLength = arr.length;
          var valLength = val.length;

          if (encoding !== undefined) {
            encoding = String(encoding).toLowerCase();

            if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
              if (arr.length < 2 || val.length < 2) {
                return -1;
              }

              indexSize = 2;
              arrLength /= 2;
              valLength /= 2;
              byteOffset /= 2;
            }
          }

          function read(buf, i) {
            if (indexSize === 1) {
              return buf[i];
            } else {
              return buf.readUInt16BE(i * indexSize);
            }
          }

          var i;

          if (dir) {
            var foundIndex = -1;

            for (i = byteOffset; i < arrLength; i++) {
              if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                if (foundIndex === -1) foundIndex = i;
                if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
              } else {
                if (foundIndex !== -1) i -= i - foundIndex;
                foundIndex = -1;
              }
            }
          } else {
            if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

            for (i = byteOffset; i >= 0; i--) {
              var found = true;

              for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                  found = false;
                  break;
                }
              }

              if (found) return i;
            }
          }

          return -1;
        }

        Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
          return this.indexOf(val, byteOffset, encoding) !== -1;
        };

        Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
        };

        Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
        };

        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;

          if (!length) {
            length = remaining;
          } else {
            length = Number(length);

            if (length > remaining) {
              length = remaining;
            }
          }

          var strLen = string.length;

          if (length > strLen / 2) {
            length = strLen / 2;
          }

          for (var i = 0; i < length; ++i) {
            var parsed = parseInt(string.substr(i * 2, 2), 16);
            if (numberIsNaN(parsed)) return i;
            buf[offset + i] = parsed;
          }

          return i;
        }

        function utf8Write(buf, string, offset, length) {
          return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
        }

        function asciiWrite(buf, string, offset, length) {
          return blitBuffer(asciiToBytes(string), buf, offset, length);
        }

        function latin1Write(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }

        function base64Write(buf, string, offset, length) {
          return blitBuffer(base64ToBytes(string), buf, offset, length);
        }

        function ucs2Write(buf, string, offset, length) {
          return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
        }

        Buffer.prototype.write = function write(string, offset, length, encoding) {
          if (offset === undefined) {
            encoding = 'utf8';
            length = this.length;
            offset = 0;
          } else if (length === undefined && typeof offset === 'string') {
            encoding = offset;
            length = this.length;
            offset = 0;
          } else if (isFinite(offset)) {
            offset = offset >>> 0;

            if (isFinite(length)) {
              length = length >>> 0;
              if (encoding === undefined) encoding = 'utf8';
            } else {
              encoding = length;
              length = undefined;
            }
          } else {
            throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
          }

          var remaining = this.length - offset;
          if (length === undefined || length > remaining) length = remaining;

          if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
            throw new RangeError('Attempt to write outside buffer bounds');
          }

          if (!encoding) encoding = 'utf8';
          var loweredCase = false;

          for (;;) {
            switch (encoding) {
              case 'hex':
                return hexWrite(this, string, offset, length);

              case 'utf8':
              case 'utf-8':
                return utf8Write(this, string, offset, length);

              case 'ascii':
                return asciiWrite(this, string, offset, length);

              case 'latin1':
              case 'binary':
                return latin1Write(this, string, offset, length);

              case 'base64':
                return base64Write(this, string, offset, length);

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return ucs2Write(this, string, offset, length);

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        };

        Buffer.prototype.toJSON = function toJSON() {
          return {
            type: 'Buffer',
            data: Array.prototype.slice.call(this._arr || this, 0)
          };
        };

        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf);
          } else {
            return base64.fromByteArray(buf.slice(start, end));
          }
        }

        function utf8Slice(buf, start, end) {
          end = Math.min(buf.length, end);
          var res = [];
          var i = start;

          while (i < end) {
            var firstByte = buf[i];
            var codePoint = null;
            var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;

              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 0x80) {
                    codePoint = firstByte;
                  }

                  break;

                case 2:
                  secondByte = buf[i + 1];

                  if ((secondByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

                    if (tempCodePoint > 0x7F) {
                      codePoint = tempCodePoint;
                    }
                  }

                  break;

                case 3:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];

                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

                    if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                      codePoint = tempCodePoint;
                    }
                  }

                  break;

                case 4:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  fourthByte = buf[i + 3];

                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

                    if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                      codePoint = tempCodePoint;
                    }
                  }

              }
            }

            if (codePoint === null) {
              codePoint = 0xFFFD;
              bytesPerSequence = 1;
            } else if (codePoint > 0xFFFF) {
              codePoint -= 0x10000;
              res.push(codePoint >>> 10 & 0x3FF | 0xD800);
              codePoint = 0xDC00 | codePoint & 0x3FF;
            }

            res.push(codePoint);
            i += bytesPerSequence;
          }

          return decodeCodePointsArray(res);
        }

        var MAX_ARGUMENTS_LENGTH = 0x1000;

        function decodeCodePointsArray(codePoints) {
          var len = codePoints.length;

          if (len <= MAX_ARGUMENTS_LENGTH) {
            return String.fromCharCode.apply(String, codePoints);
          }

          var res = '';
          var i = 0;

          while (i < len) {
            res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
          }

          return res;
        }

        function asciiSlice(buf, start, end) {
          var ret = '';
          end = Math.min(buf.length, end);

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i] & 0x7F);
          }

          return ret;
        }

        function latin1Slice(buf, start, end) {
          var ret = '';
          end = Math.min(buf.length, end);

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i]);
          }

          return ret;
        }

        function hexSlice(buf, start, end) {
          var len = buf.length;
          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;
          var out = '';

          for (var i = start; i < end; ++i) {
            out += toHex(buf[i]);
          }

          return out;
        }

        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = '';

          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }

          return res;
        }

        Buffer.prototype.slice = function slice(start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;

          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }

          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }

          if (end < start) end = start;
          var newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
          return newBuf;
        };

        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
          if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
        }

        Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;

          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul;
          }

          return val;
        };

        Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;

          if (!noAssert) {
            checkOffset(offset, byteLength, this.length);
          }

          var val = this[offset + --byteLength];
          var mul = 1;

          while (byteLength > 0 && (mul *= 0x100)) {
            val += this[offset + --byteLength] * mul;
          }

          return val;
        };

        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 1, this.length);
          return this[offset];
        };

        Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] | this[offset + 1] << 8;
        };

        Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] << 8 | this[offset + 1];
        };

        Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
        };

        Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
        };

        Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;

          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul;
          }

          mul *= 0x80;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };

        Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];

          while (i > 0 && (mul *= 0x100)) {
            val += this[offset + --i] * mul;
          }

          mul *= 0x80;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };

        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 1, this.length);
          if (!(this[offset] & 0x80)) return this[offset];
          return (0xff - this[offset] + 1) * -1;
        };

        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset] | this[offset + 1] << 8;
          return val & 0x8000 ? val | 0xFFFF0000 : val;
        };

        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | this[offset] << 8;
          return val & 0x8000 ? val | 0xFFFF0000 : val;
        };

        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
        };

        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
        };

        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, true, 23, 4);
        };

        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, false, 23, 4);
        };

        Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, true, 52, 8);
        };

        Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, false, 52, 8);
        };

        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
          if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
          if (offset + ext > buf.length) throw new RangeError('Index out of range');
        }

        Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;

          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt(this, value, offset, byteLength, maxBytes, 0);
          }

          var mul = 1;
          var i = 0;
          this[offset] = value & 0xFF;

          while (++i < byteLength && (mul *= 0x100)) {
            this[offset + i] = value / mul & 0xFF;
          }

          return offset + byteLength;
        };

        Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;

          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt(this, value, offset, byteLength, maxBytes, 0);
          }

          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 0xFF;

          while (--i >= 0 && (mul *= 0x100)) {
            this[offset + i] = value / mul & 0xFF;
          }

          return offset + byteLength;
        };

        Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
          this[offset] = value & 0xff;
          return offset + 1;
        };

        Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
          this[offset] = value & 0xff;
          this[offset + 1] = value >>> 8;
          return offset + 2;
        };

        Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
          this[offset] = value >>> 8;
          this[offset + 1] = value & 0xff;
          return offset + 2;
        };

        Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 0xff;
          return offset + 4;
        };

        Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 0xff;
          return offset + 4;
        };

        Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset >>> 0;

          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);
            checkInt(this, value, offset, byteLength, limit - 1, -limit);
          }

          var i = 0;
          var mul = 1;
          var sub = 0;
          this[offset] = value & 0xFF;

          while (++i < byteLength && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
              sub = 1;
            }

            this[offset + i] = (value / mul >> 0) - sub & 0xFF;
          }

          return offset + byteLength;
        };

        Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset >>> 0;

          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);
            checkInt(this, value, offset, byteLength, limit - 1, -limit);
          }

          var i = byteLength - 1;
          var mul = 1;
          var sub = 0;
          this[offset + i] = value & 0xFF;

          while (--i >= 0 && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
              sub = 1;
            }

            this[offset + i] = (value / mul >> 0) - sub & 0xFF;
          }

          return offset + byteLength;
        };

        Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
          if (value < 0) value = 0xff + value + 1;
          this[offset] = value & 0xff;
          return offset + 1;
        };

        Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
          this[offset] = value & 0xff;
          this[offset + 1] = value >>> 8;
          return offset + 2;
        };

        Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
          this[offset] = value >>> 8;
          this[offset + 1] = value & 0xff;
          return offset + 2;
        };

        Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
          this[offset] = value & 0xff;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
          return offset + 4;
        };

        Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
          if (value < 0) value = 0xffffffff + value + 1;
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 0xff;
          return offset + 4;
        };

        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length) throw new RangeError('Index out of range');
          if (offset < 0) throw new RangeError('Index out of range');
        }

        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          value = +value;
          offset = offset >>> 0;

          if (!noAssert) {
            checkIEEE754(buf, value, offset, 4);
          }

          ieee754.write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4;
        }

        Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert);
        };

        Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert);
        };

        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          value = +value;
          offset = offset >>> 0;

          if (!noAssert) {
            checkIEEE754(buf, value, offset, 8);
          }

          ieee754.write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8;
        }

        Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert);
        };

        Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert);
        };

        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
          if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (targetStart >= target.length) targetStart = target.length;
          if (!targetStart) targetStart = 0;
          if (end > 0 && end < start) end = start;
          if (end === start) return 0;
          if (target.length === 0 || this.length === 0) return 0;

          if (targetStart < 0) {
            throw new RangeError('targetStart out of bounds');
          }

          if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
          if (end < 0) throw new RangeError('sourceEnd out of bounds');
          if (end > this.length) end = this.length;

          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start;
          }

          var len = end - start;

          if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
            this.copyWithin(targetStart, start, end);
          } else if (this === target && start < targetStart && targetStart < end) {
            for (var i = len - 1; i >= 0; --i) {
              target[i + targetStart] = this[i + start];
            }
          } else {
            Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
          }

          return len;
        };

        Buffer.prototype.fill = function fill(val, start, end, encoding) {
          if (typeof val === 'string') {
            if (typeof start === 'string') {
              encoding = start;
              start = 0;
              end = this.length;
            } else if (typeof end === 'string') {
              encoding = end;
              end = this.length;
            }

            if (encoding !== undefined && typeof encoding !== 'string') {
              throw new TypeError('encoding must be a string');
            }

            if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding);
            }

            if (val.length === 1) {
              var code = val.charCodeAt(0);

              if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
                val = code;
              }
            }
          } else if (typeof val === 'number') {
            val = val & 255;
          }

          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError('Out of range index');
          }

          if (end <= start) {
            return this;
          }

          start = start >>> 0;
          end = end === undefined ? this.length : end >>> 0;
          if (!val) val = 0;
          var i;

          if (typeof val === 'number') {
            for (i = start; i < end; ++i) {
              this[i] = val;
            }
          } else {
            var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
            var len = bytes.length;

            if (len === 0) {
              throw new TypeError('The value "' + val + '" is invalid for argument "value"');
            }

            for (i = 0; i < end - start; ++i) {
              this[i + start] = bytes[i % len];
            }
          }

          return this;
        };

        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

        function base64clean(str) {
          str = str.split('=')[0];
          str = str.trim().replace(INVALID_BASE64_RE, '');
          if (str.length < 2) return '';

          while (str.length % 4 !== 0) {
            str = str + '=';
          }

          return str;
        }

        function toHex(n) {
          if (n < 16) return '0' + n.toString(16);
          return n.toString(16);
        }

        function utf8ToBytes(string, units) {
          units = units || Infinity;
          var codePoint;
          var length = string.length;
          var leadSurrogate = null;
          var bytes = [];

          for (var i = 0; i < length; ++i) {
            codePoint = string.charCodeAt(i);

            if (codePoint > 0xD7FF && codePoint < 0xE000) {
              if (!leadSurrogate) {
                if (codePoint > 0xDBFF) {
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  continue;
                } else if (i + 1 === length) {
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  continue;
                }

                leadSurrogate = codePoint;
                continue;
              }

              if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue;
              }

              codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
            } else if (leadSurrogate) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            }

            leadSurrogate = null;

            if (codePoint < 0x80) {
              if ((units -= 1) < 0) break;
              bytes.push(codePoint);
            } else if (codePoint < 0x800) {
              if ((units -= 2) < 0) break;
              bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
            } else if (codePoint < 0x10000) {
              if ((units -= 3) < 0) break;
              bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
            } else if (codePoint < 0x110000) {
              if ((units -= 4) < 0) break;
              bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
            } else {
              throw new Error('Invalid code point');
            }
          }

          return bytes;
        }

        function asciiToBytes(str) {
          var byteArray = [];

          for (var i = 0; i < str.length; ++i) {
            byteArray.push(str.charCodeAt(i) & 0xFF);
          }

          return byteArray;
        }

        function utf16leToBytes(str, units) {
          var c, hi, lo;
          var byteArray = [];

          for (var i = 0; i < str.length; ++i) {
            if ((units -= 2) < 0) break;
            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }

          return byteArray;
        }

        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }

        function blitBuffer(src, dst, offset, length) {
          for (var i = 0; i < length; ++i) {
            if (i + offset >= dst.length || i >= src.length) break;
            dst[i + offset] = src[i];
          }

          return i;
        }

        function isInstance(obj, type) {
          return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
        }

        function numberIsNaN(obj) {
          return obj !== obj;
        }
      }).call(this, require("buffer").Buffer);
    }, {
      "base64-js": 1,
      "buffer": 2,
      "ieee754": 3
    }],
    3: [function (require, module, exports) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;

        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;

        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }

        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };

      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);

          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }

          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }

          if (value * c >= 2) {
            e++;
            c /= 2;
          }

          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = e << mLen | m;
        eLen += mLen;

        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128;
      };
    }, {}],
    4: [function (require, module, exports) {

      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }

      module.exports = function (qs, sep, eq, options) {
        sep = sep || '&';
        eq = eq || '=';
        var obj = {};

        if (typeof qs !== 'string' || qs.length === 0) {
          return obj;
        }

        var regexp = /\+/g;
        qs = qs.split(sep);
        var maxKeys = 1000;

        if (options && typeof options.maxKeys === 'number') {
          maxKeys = options.maxKeys;
        }

        var len = qs.length;

        if (maxKeys > 0 && len > maxKeys) {
          len = maxKeys;
        }

        for (var i = 0; i < len; ++i) {
          var x = qs[i].replace(regexp, '%20'),
              idx = x.indexOf(eq),
              kstr,
              vstr,
              k,
              v;

          if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
          } else {
            kstr = x;
            vstr = '';
          }

          k = decodeURIComponent(kstr);
          v = decodeURIComponent(vstr);

          if (!hasOwnProperty(obj, k)) {
            obj[k] = v;
          } else if (isArray(obj[k])) {
            obj[k].push(v);
          } else {
            obj[k] = [obj[k], v];
          }
        }

        return obj;
      };

      var isArray = Array.isArray || function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };
    }, {}],
    5: [function (require, module, exports) {

      var stringifyPrimitive = function (v) {
        switch (typeof v) {
          case 'string':
            return v;

          case 'boolean':
            return v ? 'true' : 'false';

          case 'number':
            return isFinite(v) ? v : '';

          default:
            return '';
        }
      };

      module.exports = function (obj, sep, eq, name) {
        sep = sep || '&';
        eq = eq || '=';

        if (obj === null) {
          obj = undefined;
        }

        if (typeof obj === 'object') {
          return map(objectKeys(obj), function (k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;

            if (isArray(obj[k])) {
              return map(obj[k], function (v) {
                return ks + encodeURIComponent(stringifyPrimitive(v));
              }).join(sep);
            } else {
              return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
            }
          }).join(sep);
        }

        if (!name) return '';
        return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
      };

      var isArray = Array.isArray || function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };

      function map(xs, f) {
        if (xs.map) return xs.map(f);
        var res = [];

        for (var i = 0; i < xs.length; i++) {
          res.push(f(xs[i], i));
        }

        return res;
      }

      var objectKeys = Object.keys || function (obj) {
        var res = [];

        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
        }

        return res;
      };
    }, {}],
    6: [function (require, module, exports) {

      exports.decode = exports.parse = require('./decode');
      exports.encode = exports.stringify = require('./encode');
    }, {
      "./decode": 4,
      "./encode": 5
    }],
    7: [function (require, module, exports) {
      var SCClientSocket = require('./lib/scclientsocket');

      var factory = require('./lib/factory');

      module.exports.factory = factory;
      module.exports.SCClientSocket = SCClientSocket;
      module.exports.Emitter = require('component-emitter');

      module.exports.create = function (options) {
        return factory.create(options);
      };

      module.exports.connect = module.exports.create;

      module.exports.destroy = function (socket) {
        return factory.destroy(socket);
      };

      module.exports.clients = factory.clients;
      module.exports.version = '14.2.1';
    }, {
      "./lib/factory": 9,
      "./lib/scclientsocket": 11,
      "component-emitter": 15
    }],
    8: [function (require, module, exports) {
      (function (global) {
        var AuthEngine = function () {
          this._internalStorage = {};
          this.isLocalStorageEnabled = this._checkLocalStorageEnabled();
        };

        AuthEngine.prototype._checkLocalStorageEnabled = function () {
          var err;

          try {
            global.localStorage;
            global.localStorage.setItem('__scLocalStorageTest', 1);
            global.localStorage.removeItem('__scLocalStorageTest');
          } catch (e) {
            err = e;
          }

          return !err;
        };

        AuthEngine.prototype.saveToken = function (name, token, options, callback) {
          if (this.isLocalStorageEnabled && global.localStorage) {
            global.localStorage.setItem(name, token);
          } else {
            this._internalStorage[name] = token;
          }

          callback && callback(null, token);
        };

        AuthEngine.prototype.removeToken = function (name, callback) {
          var token;
          this.loadToken(name, function (err, authToken) {
            token = authToken;
          });

          if (this.isLocalStorageEnabled && global.localStorage) {
            global.localStorage.removeItem(name);
          } else {
            delete this._internalStorage[name];
          }

          callback && callback(null, token);
        };

        AuthEngine.prototype.loadToken = function (name, callback) {
          var token;

          if (this.isLocalStorageEnabled && global.localStorage) {
            token = global.localStorage.getItem(name);
          } else {
            token = this._internalStorage[name] || null;
          }

          callback(null, token);
        };

        module.exports.AuthEngine = AuthEngine;
      }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}],
    9: [function (require, module, exports) {
      (function (global) {
        var SCClientSocket = require('./scclientsocket');

        var scErrors = require('sc-errors');

        var uuid = require('uuid');

        var InvalidArgumentsError = scErrors.InvalidArgumentsError;
        var _clients = {};

        function getMultiplexId(options) {
          var protocolPrefix = options.secure ? 'https://' : 'http://';
          var queryString = '';

          if (options.query) {
            if (typeof options.query === 'string') {
              queryString = options.query;
            } else {
              var queryArray = [];
              var queryMap = options.query;

              for (var key in queryMap) {
                if (queryMap.hasOwnProperty(key)) {
                  queryArray.push(key + '=' + queryMap[key]);
                }
              }

              if (queryArray.length) {
                queryString = '?' + queryArray.join('&');
              }
            }
          }

          var host;

          if (options.host) {
            host = options.host;
          } else {
            host = options.hostname + ':' + options.port;
          }

          return protocolPrefix + host + options.path + queryString;
        }

        function isUrlSecure() {
          return global.location && location.protocol === 'https:';
        }

        function getPort(options, isSecureDefault) {
          var isSecure = options.secure == null ? isSecureDefault : options.secure;
          return options.port || (global.location && location.port ? location.port : isSecure ? 443 : 80);
        }

        function create(options) {
          options = options || {};

          if (options.host && !options.host.match(/[^:]+:\d{2,5}/)) {
            throw new InvalidArgumentsError('The host option should include both' + ' the hostname and the port number in the format "hostname:port"');
          }

          if (options.host && options.hostname) {
            throw new InvalidArgumentsError('The host option should already include' + ' the hostname and the port number in the format "hostname:port"' + ' - Because of this, you should never use host and hostname options together');
          }

          if (options.host && options.port) {
            throw new InvalidArgumentsError('The host option should already include' + ' the hostname and the port number in the format "hostname:port"' + ' - Because of this, you should never use host and port options together');
          }

          var isSecureDefault = isUrlSecure();
          var opts = {
            port: getPort(options, isSecureDefault),
            hostname: global.location && location.hostname || 'localhost',
            path: '/socketcluster/',
            secure: isSecureDefault,
            autoConnect: true,
            autoReconnect: true,
            autoSubscribeOnConnect: true,
            connectTimeout: 20000,
            ackTimeout: 10000,
            timestampRequests: false,
            timestampParam: 't',
            authEngine: null,
            authTokenName: 'socketCluster.authToken',
            binaryType: 'arraybuffer',
            multiplex: true,
            pubSubBatchDuration: null,
            cloneData: false
          };

          for (var i in options) {
            if (options.hasOwnProperty(i)) {
              opts[i] = options[i];
            }
          }

          opts.clientMap = _clients;

          if (opts.multiplex === false) {
            opts.clientId = uuid.v4();
            var socket = new SCClientSocket(opts);
            _clients[opts.clientId] = socket;
            return socket;
          }

          opts.clientId = getMultiplexId(opts);

          if (_clients[opts.clientId]) {
            if (opts.autoConnect) {
              _clients[opts.clientId].connect();
            }
          } else {
            _clients[opts.clientId] = new SCClientSocket(opts);
          }

          return _clients[opts.clientId];
        }

        function destroy(socket) {
          socket.destroy();
        }

        module.exports = {
          create: create,
          destroy: destroy,
          clients: _clients
        };
      }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "./scclientsocket": 11,
      "sc-errors": 20,
      "uuid": 22
    }],
    10: [function (require, module, exports) {
      var scErrors = require('sc-errors');

      var InvalidActionError = scErrors.InvalidActionError;

      var Response = function (socket, id) {
        this.socket = socket;
        this.id = id;
        this.sent = false;
      };

      Response.prototype._respond = function (responseData) {
        if (this.sent) {
          throw new InvalidActionError('Response ' + this.id + ' has already been sent');
        } else {
          this.sent = true;
          this.socket.send({
            data: this.socket.encode(responseData)
          });
        }
      };

      Response.prototype.end = function (data) {
        if (this.id) {
          var responseData = {
            rid: this.id
          };

          if (data !== undefined) {
            responseData.data = data;
          }

          this._respond(responseData);
        }
      };

      Response.prototype.error = function (error, data) {
        if (this.id) {
          var err = scErrors.dehydrateError(error);
          var responseData = {
            rid: this.id,
            error: err
          };

          if (data !== undefined) {
            responseData.data = data;
          }

          this._respond(responseData);
        }
      };

      Response.prototype.callback = function (error, data) {
        if (error) {
          this.error(error, data);
        } else {
          this.end(data);
        }
      };

      module.exports.Response = Response;
    }, {
      "sc-errors": 20
    }],
    11: [function (require, module, exports) {
      (function (global, Buffer) {
        var Emitter = require('component-emitter');

        var SCChannel = require('sc-channel').SCChannel;

        var Response = require('./response').Response;

        var AuthEngine = require('./auth').AuthEngine;

        var formatter = require('sc-formatter');

        var WCTransport = require('./wctransport').WCTransport;

        var querystring = require('querystring');

        var LinkedList = require('linked-list');

        var base64 = require('base-64');

        var clone = require('clone');

        var scErrors = require('sc-errors');

        var InvalidArgumentsError = scErrors.InvalidArgumentsError;
        var InvalidMessageError = scErrors.InvalidMessageError;
        var InvalidActionError = scErrors.InvalidActionError;
        var SocketProtocolError = scErrors.SocketProtocolError;
        var TimeoutError = scErrors.TimeoutError;
        var BadConnectionError = scErrors.BadConnectionError;
        var isBrowser = typeof window !== 'undefined';

        var SCClientSocket = function (opts) {
          var self = this;
          Emitter.call(this);
          this.id = null;
          this.state = this.CLOSED;
          this.authState = this.UNAUTHENTICATED;
          this.signedAuthToken = null;
          this.authToken = null;
          this.pendingReconnect = false;
          this.pendingReconnectTimeout = null;
          this.preparingPendingSubscriptions = false;
          this.clientId = opts.clientId;
          this.connectTimeout = opts.connectTimeout;
          this.ackTimeout = opts.ackTimeout;
          this.channelPrefix = opts.channelPrefix || null;
          this.disconnectOnUnload = opts.disconnectOnUnload == null ? true : opts.disconnectOnUnload;
          this.authTokenName = opts.authTokenName;
          this.pingTimeout = this.ackTimeout;
          this.pingTimeoutDisabled = !!opts.pingTimeoutDisabled;
          this.active = true;
          this._clientMap = opts.clientMap || {};
          var maxTimeout = Math.pow(2, 31) - 1;

          var verifyDuration = function (propertyName) {
            if (self[propertyName] > maxTimeout) {
              throw new InvalidArgumentsError('The ' + propertyName + ' value provided exceeded the maximum amount allowed');
            }
          };

          verifyDuration('connectTimeout');
          verifyDuration('ackTimeout');
          this._localEvents = {
            'connect': 1,
            'connectAbort': 1,
            'close': 1,
            'disconnect': 1,
            'message': 1,
            'error': 1,
            'raw': 1,
            'kickOut': 1,
            'subscribe': 1,
            'unsubscribe': 1,
            'subscribeStateChange': 1,
            'authStateChange': 1,
            'authenticate': 1,
            'deauthenticate': 1,
            'removeAuthToken': 1,
            'subscribeRequest': 1
          };
          this.connectAttempts = 0;
          this._emitBuffer = new LinkedList();
          this.channels = {};
          this.options = opts;
          this._cid = 1;

          this.options.callIdGenerator = function () {
            return self._cid++;
          };

          if (this.options.autoReconnect) {
            if (this.options.autoReconnectOptions == null) {
              this.options.autoReconnectOptions = {};
            }

            var reconnectOptions = this.options.autoReconnectOptions;

            if (reconnectOptions.initialDelay == null) {
              reconnectOptions.initialDelay = 10000;
            }

            if (reconnectOptions.randomness == null) {
              reconnectOptions.randomness = 10000;
            }

            if (reconnectOptions.multiplier == null) {
              reconnectOptions.multiplier = 1.5;
            }

            if (reconnectOptions.maxDelay == null) {
              reconnectOptions.maxDelay = 60000;
            }
          }

          if (this.options.subscriptionRetryOptions == null) {
            this.options.subscriptionRetryOptions = {};
          }

          if (this.options.authEngine) {
            this.auth = this.options.authEngine;
          } else {
            this.auth = new AuthEngine();
          }

          if (this.options.codecEngine) {
            this.codec = this.options.codecEngine;
          } else {
            this.codec = formatter;
          }

          if (this.options.protocol) {
            var protocolOptionError = new InvalidArgumentsError('The "protocol" option' + ' does not affect socketcluster-client. If you want to utilize SSL/TLS' + ' - use "secure" option instead');

            this._onSCError(protocolOptionError);
          }

          this.options.path = this.options.path.replace(/\/$/, '') + '/';
          this.options.query = opts.query || {};

          if (typeof this.options.query === 'string') {
            this.options.query = querystring.parse(this.options.query);
          }

          this._channelEmitter = new Emitter();

          this._unloadHandler = function () {
            self.disconnect();
          };

          if (isBrowser && this.disconnectOnUnload && global.addEventListener) {
            global.addEventListener('beforeunload', this._unloadHandler, false);
          }

          this._clientMap[this.clientId] = this;

          if (this.options.autoConnect) {
            this.connect();
          }
        };

        SCClientSocket.prototype = Object.create(Emitter.prototype);
        SCClientSocket.CONNECTING = SCClientSocket.prototype.CONNECTING = WCTransport.prototype.CONNECTING;
        SCClientSocket.OPEN = SCClientSocket.prototype.OPEN = WCTransport.prototype.OPEN;
        SCClientSocket.CLOSED = SCClientSocket.prototype.CLOSED = WCTransport.prototype.CLOSED;
        SCClientSocket.AUTHENTICATED = SCClientSocket.prototype.AUTHENTICATED = 'authenticated';
        SCClientSocket.UNAUTHENTICATED = SCClientSocket.prototype.UNAUTHENTICATED = 'unauthenticated';
        SCClientSocket.PENDING = SCClientSocket.prototype.PENDING = 'pending';
        SCClientSocket.ignoreStatuses = scErrors.socketProtocolIgnoreStatuses;
        SCClientSocket.errorStatuses = scErrors.socketProtocolErrorStatuses;
        SCClientSocket.prototype._privateEventHandlerMap = {
          '#publish': function (data) {
            var undecoratedChannelName = this._undecorateChannelName(data.channel);

            var isSubscribed = this.isSubscribed(undecoratedChannelName, true);

            if (isSubscribed) {
              this._channelEmitter.emit(undecoratedChannelName, data.data);
            }
          },
          '#kickOut': function (data) {
            var undecoratedChannelName = this._undecorateChannelName(data.channel);

            var channel = this.channels[undecoratedChannelName];

            if (channel) {
              Emitter.prototype.emit.call(this, 'kickOut', data.message, undecoratedChannelName);
              channel.emit('kickOut', data.message, undecoratedChannelName);

              this._triggerChannelUnsubscribe(channel);
            }
          },
          '#setAuthToken': function (data, response) {
            var self = this;

            if (data) {
              var triggerAuthenticate = function (err) {
                if (err) {
                  response.error(err);

                  self._onSCError(err);
                } else {
                  self._changeToAuthenticatedState(data.token);

                  response.end();
                }
              };

              this.auth.saveToken(this.authTokenName, data.token, {}, triggerAuthenticate);
            } else {
              response.error(new InvalidMessageError('No token data provided by #setAuthToken event'));
            }
          },
          '#removeAuthToken': function (data, response) {
            var self = this;
            this.auth.removeToken(this.authTokenName, function (err, oldToken) {
              if (err) {
                response.error(err);

                self._onSCError(err);
              } else {
                Emitter.prototype.emit.call(self, 'removeAuthToken', oldToken);

                self._changeToUnauthenticatedStateAndClearTokens();

                response.end();
              }
            });
          },
          '#disconnect': function (data) {
            this.transport.close(data.code, data.data);
          }
        };

        SCClientSocket.prototype.getState = function () {
          return this.state;
        };

        SCClientSocket.prototype.getBytesReceived = function () {
          return this.transport.getBytesReceived();
        };

        SCClientSocket.prototype.deauthenticate = function (callback) {
          var self = this;
          this.auth.removeToken(this.authTokenName, function (err, oldToken) {
            if (err) {
              self._onSCError(err);
            } else {
              Emitter.prototype.emit.call(self, 'removeAuthToken', oldToken);

              if (self.state !== self.CLOSED) {
                self.emit('#removeAuthToken');
              }

              self._changeToUnauthenticatedStateAndClearTokens();
            }

            callback && callback(err);
          });
        };

        SCClientSocket.prototype.connect = SCClientSocket.prototype.open = function () {
          var self = this;

          if (!this.active) {
            var error = new InvalidActionError('Cannot connect a destroyed client');

            this._onSCError(error);

            return;
          }

          if (this.state === this.CLOSED) {
            this.pendingReconnect = false;
            this.pendingReconnectTimeout = null;
            clearTimeout(this._reconnectTimeoutRef);
            this.state = this.CONNECTING;
            Emitter.prototype.emit.call(this, 'connecting');

            if (this.transport) {
              this.transport.off();
            }

            this.transport = new WCTransport(this.auth, this.codec, this.options);
            this.transport.on('open', function (status) {
              self.state = self.OPEN;

              self._onSCOpen(status);
            });
            this.transport.on('error', function (err) {
              self._onSCError(err);
            });
            this.transport.on('close', function (code, data) {
              self.state = self.CLOSED;

              self._onSCClose(code, data);
            });
            this.transport.on('openAbort', function (code, data) {
              self.state = self.CLOSED;

              self._onSCClose(code, data, true);
            });
            this.transport.on('event', function (event, data, res) {
              self._onSCEvent(event, data, res);
            });
          }
        };

        SCClientSocket.prototype.reconnect = function (code, data) {
          this.disconnect(code, data);
          this.connect();
        };

        SCClientSocket.prototype.disconnect = function (code, data) {
          code = code || 1000;

          if (typeof code !== 'number') {
            throw new InvalidArgumentsError('If specified, the code argument must be a number');
          }

          if (this.state === this.OPEN || this.state === this.CONNECTING) {
            this.transport.close(code, data);
          } else {
            this.pendingReconnect = false;
            this.pendingReconnectTimeout = null;
            clearTimeout(this._reconnectTimeoutRef);
          }
        };

        SCClientSocket.prototype.destroy = function (code, data) {
          if (isBrowser && global.removeEventListener) {
            global.removeEventListener('beforeunload', this._unloadHandler, false);
          }

          this.active = false;
          this.disconnect(code, data);
          delete this._clientMap[this.clientId];
        };

        SCClientSocket.prototype._changeToUnauthenticatedStateAndClearTokens = function () {
          if (this.authState !== this.UNAUTHENTICATED) {
            var oldState = this.authState;
            var oldSignedToken = this.signedAuthToken;
            this.authState = this.UNAUTHENTICATED;
            this.signedAuthToken = null;
            this.authToken = null;
            var stateChangeData = {
              oldState: oldState,
              newState: this.authState
            };
            Emitter.prototype.emit.call(this, 'authStateChange', stateChangeData);
            Emitter.prototype.emit.call(this, 'deauthenticate', oldSignedToken);
          }
        };

        SCClientSocket.prototype._changeToAuthenticatedState = function (signedAuthToken) {
          this.signedAuthToken = signedAuthToken;
          this.authToken = this._extractAuthTokenData(signedAuthToken);

          if (this.authState !== this.AUTHENTICATED) {
            var oldState = this.authState;
            this.authState = this.AUTHENTICATED;
            var stateChangeData = {
              oldState: oldState,
              newState: this.authState,
              signedAuthToken: signedAuthToken,
              authToken: this.authToken
            };

            if (!this.preparingPendingSubscriptions) {
              this.processPendingSubscriptions();
            }

            Emitter.prototype.emit.call(this, 'authStateChange', stateChangeData);
          }

          Emitter.prototype.emit.call(this, 'authenticate', signedAuthToken);
        };

        SCClientSocket.prototype.decodeBase64 = function (encodedString) {
          var decodedString;

          if (typeof Buffer === 'undefined') {
            if (global.atob) {
              decodedString = global.atob(encodedString);
            } else {
              decodedString = base64.decode(encodedString);
            }
          } else {
            var buffer = Buffer.from(encodedString, 'base64');
            decodedString = buffer.toString('utf8');
          }

          return decodedString;
        };

        SCClientSocket.prototype.encodeBase64 = function (decodedString) {
          var encodedString;

          if (typeof Buffer === 'undefined') {
            if (global.btoa) {
              encodedString = global.btoa(decodedString);
            } else {
              encodedString = base64.encode(decodedString);
            }
          } else {
            var buffer = Buffer.from(decodedString, 'utf8');
            encodedString = buffer.toString('base64');
          }

          return encodedString;
        };

        SCClientSocket.prototype._extractAuthTokenData = function (signedAuthToken) {
          var tokenParts = (signedAuthToken || '').split('.');
          var encodedTokenData = tokenParts[1];

          if (encodedTokenData != null) {
            var tokenData = encodedTokenData;

            try {
              tokenData = this.decodeBase64(tokenData);
              return JSON.parse(tokenData);
            } catch (e) {
              return tokenData;
            }
          }

          return null;
        };

        SCClientSocket.prototype.getAuthToken = function () {
          return this.authToken;
        };

        SCClientSocket.prototype.getSignedAuthToken = function () {
          return this.signedAuthToken;
        };

        SCClientSocket.prototype.authenticate = function (signedAuthToken, callback) {
          var self = this;
          this.emit('#authenticate', signedAuthToken, function (err, authStatus) {
            if (authStatus && authStatus.isAuthenticated != null) {
              if (authStatus.authError) {
                authStatus.authError = scErrors.hydrateError(authStatus.authError);
              }
            } else {
              authStatus = {
                isAuthenticated: self.authState,
                authError: null
              };
            }

            if (err) {
              if (err.name !== 'BadConnectionError' && err.name !== 'TimeoutError') {
                self._changeToUnauthenticatedStateAndClearTokens();
              }

              callback && callback(err, authStatus);
            } else {
              self.auth.saveToken(self.authTokenName, signedAuthToken, {}, function (err) {
                if (err) {
                  self._onSCError(err);
                }

                if (authStatus.isAuthenticated) {
                  self._changeToAuthenticatedState(signedAuthToken);
                } else {
                  self._changeToUnauthenticatedStateAndClearTokens();
                }

                callback && callback(err, authStatus);
              });
            }
          });
        };

        SCClientSocket.prototype._tryReconnect = function (initialDelay) {
          var self = this;
          var exponent = this.connectAttempts++;
          var reconnectOptions = this.options.autoReconnectOptions;
          var timeout;

          if (initialDelay == null || exponent > 0) {
            var initialTimeout = Math.round(reconnectOptions.initialDelay + (reconnectOptions.randomness || 0) * Math.random());
            timeout = Math.round(initialTimeout * Math.pow(reconnectOptions.multiplier, exponent));
          } else {
            timeout = initialDelay;
          }

          if (timeout > reconnectOptions.maxDelay) {
            timeout = reconnectOptions.maxDelay;
          }

          clearTimeout(this._reconnectTimeoutRef);
          this.pendingReconnect = true;
          this.pendingReconnectTimeout = timeout;
          this._reconnectTimeoutRef = setTimeout(function () {
            self.connect();
          }, timeout);
        };

        SCClientSocket.prototype._onSCOpen = function (status) {
          var self = this;
          this.preparingPendingSubscriptions = true;

          if (status) {
            this.id = status.id;
            this.pingTimeout = status.pingTimeout;
            this.transport.pingTimeout = this.pingTimeout;

            if (status.isAuthenticated) {
              this._changeToAuthenticatedState(status.authToken);
            } else {
              this._changeToUnauthenticatedStateAndClearTokens();
            }
          } else {
            this._changeToUnauthenticatedStateAndClearTokens();
          }

          this.connectAttempts = 0;

          if (this.options.autoSubscribeOnConnect) {
            this.processPendingSubscriptions();
          }

          Emitter.prototype.emit.call(this, 'connect', status, function () {
            self.processPendingSubscriptions();
          });

          if (this.state === this.OPEN) {
            this._flushEmitBuffer();
          }
        };

        SCClientSocket.prototype._onSCError = function (err) {
          var self = this;
          setTimeout(function () {
            if (self.listeners('error').length < 1) {
              throw err;
            } else {
              Emitter.prototype.emit.call(self, 'error', err);
            }
          }, 0);
        };

        SCClientSocket.prototype._suspendSubscriptions = function () {
          var channel, newState;

          for (var channelName in this.channels) {
            if (this.channels.hasOwnProperty(channelName)) {
              channel = this.channels[channelName];

              if (channel.state === channel.SUBSCRIBED || channel.state === channel.PENDING) {
                newState = channel.PENDING;
              } else {
                newState = channel.UNSUBSCRIBED;
              }

              this._triggerChannelUnsubscribe(channel, newState);
            }
          }
        };

        SCClientSocket.prototype._abortAllPendingEventsDueToBadConnection = function (failureType) {
          var currentNode = this._emitBuffer.head;
          var nextNode;

          while (currentNode) {
            nextNode = currentNode.next;
            var eventObject = currentNode.data;
            clearTimeout(eventObject.timeout);
            delete eventObject.timeout;
            currentNode.detach();
            currentNode = nextNode;
            var callback = eventObject.callback;

            if (callback) {
              delete eventObject.callback;
              var errorMessage = "Event '" + eventObject.event + "' was aborted due to a bad connection";
              var error = new BadConnectionError(errorMessage, failureType);
              callback.call(eventObject, error, eventObject);
            }

            if (eventObject.cid) {
              this.transport.cancelPendingResponse(eventObject.cid);
            }
          }
        };

        SCClientSocket.prototype._onSCClose = function (code, data, openAbort) {
          var self = this;
          this.id = null;

          if (this.transport) {
            this.transport.off();
          }

          this.pendingReconnect = false;
          this.pendingReconnectTimeout = null;
          clearTimeout(this._reconnectTimeoutRef);

          this._suspendSubscriptions();

          this._abortAllPendingEventsDueToBadConnection(openAbort ? 'connectAbort' : 'disconnect');

          if (this.options.autoReconnect) {
            if (code === 4000 || code === 4001 || code === 1005) {
              this._tryReconnect(0);
            } else if (code !== 1000 && code < 4500) {
              this._tryReconnect();
            }
          }

          if (openAbort) {
            Emitter.prototype.emit.call(self, 'connectAbort', code, data);
          } else {
            Emitter.prototype.emit.call(self, 'disconnect', code, data);
          }

          Emitter.prototype.emit.call(self, 'close', code, data);

          if (!SCClientSocket.ignoreStatuses[code]) {
            var closeMessage;

            if (data) {
              closeMessage = 'Socket connection closed with status code ' + code + ' and reason: ' + data;
            } else {
              closeMessage = 'Socket connection closed with status code ' + code;
            }

            var err = new SocketProtocolError(SCClientSocket.errorStatuses[code] || closeMessage, code);

            this._onSCError(err);
          }
        };

        SCClientSocket.prototype._onSCEvent = function (event, data, res) {
          var handler = this._privateEventHandlerMap[event];

          if (handler) {
            handler.call(this, data, res);
          } else {
            Emitter.prototype.emit.call(this, event, data, function () {
              res && res.callback.apply(res, arguments);
            });
          }
        };

        SCClientSocket.prototype.decode = function (message) {
          return this.transport.decode(message);
        };

        SCClientSocket.prototype.encode = function (object) {
          return this.transport.encode(object);
        };

        SCClientSocket.prototype._flushEmitBuffer = function () {
          var currentNode = this._emitBuffer.head;
          var nextNode;

          while (currentNode) {
            nextNode = currentNode.next;
            var eventObject = currentNode.data;
            currentNode.detach();
            this.transport.emitObject(eventObject);
            currentNode = nextNode;
          }
        };

        SCClientSocket.prototype._handleEventAckTimeout = function (eventObject, eventNode) {
          if (eventNode) {
            eventNode.detach();
          }

          delete eventObject.timeout;
          var callback = eventObject.callback;

          if (callback) {
            delete eventObject.callback;
            var error = new TimeoutError("Event response for '" + eventObject.event + "' timed out");
            callback.call(eventObject, error, eventObject);
          }

          if (eventObject.cid) {
            this.transport.cancelPendingResponse(eventObject.cid);
          }
        };

        SCClientSocket.prototype._emit = function (event, data, callback) {
          var self = this;

          if (this.state === this.CLOSED) {
            this.connect();
          }

          var eventObject = {
            event: event,
            callback: callback
          };
          var eventNode = new LinkedList.Item();

          if (this.options.cloneData) {
            eventObject.data = clone(data);
          } else {
            eventObject.data = data;
          }

          eventNode.data = eventObject;
          eventObject.timeout = setTimeout(function () {
            self._handleEventAckTimeout(eventObject, eventNode);
          }, this.ackTimeout);

          this._emitBuffer.append(eventNode);

          if (this.state === this.OPEN) {
            this._flushEmitBuffer();
          }
        };

        SCClientSocket.prototype.send = function (data) {
          this.transport.send(data);
        };

        SCClientSocket.prototype.emit = function (event, data, callback) {
          if (this._localEvents[event] == null) {
            this._emit(event, data, callback);
          } else if (event === 'error') {
            Emitter.prototype.emit.call(this, event, data);
          } else {
            var error = new InvalidActionError('The "' + event + '" event is reserved and cannot be emitted on a client socket');

            this._onSCError(error);
          }
        };

        SCClientSocket.prototype.publish = function (channelName, data, callback) {
          var pubData = {
            channel: this._decorateChannelName(channelName),
            data: data
          };
          this.emit('#publish', pubData, callback);
        };

        SCClientSocket.prototype._triggerChannelSubscribe = function (channel, subscriptionOptions) {
          var channelName = channel.name;

          if (channel.state !== channel.SUBSCRIBED) {
            var oldState = channel.state;
            channel.state = channel.SUBSCRIBED;
            var stateChangeData = {
              channel: channelName,
              oldState: oldState,
              newState: channel.state,
              subscriptionOptions: subscriptionOptions
            };
            channel.emit('subscribeStateChange', stateChangeData);
            channel.emit('subscribe', channelName, subscriptionOptions);
            Emitter.prototype.emit.call(this, 'subscribeStateChange', stateChangeData);
            Emitter.prototype.emit.call(this, 'subscribe', channelName, subscriptionOptions);
          }
        };

        SCClientSocket.prototype._triggerChannelSubscribeFail = function (err, channel, subscriptionOptions) {
          var channelName = channel.name;
          var meetsAuthRequirements = !channel.waitForAuth || this.authState === this.AUTHENTICATED;

          if (channel.state !== channel.UNSUBSCRIBED && meetsAuthRequirements) {
            channel.state = channel.UNSUBSCRIBED;
            channel.emit('subscribeFail', err, channelName, subscriptionOptions);
            Emitter.prototype.emit.call(this, 'subscribeFail', err, channelName, subscriptionOptions);
          }
        };

        SCClientSocket.prototype._cancelPendingSubscribeCallback = function (channel) {
          if (channel._pendingSubscriptionCid != null) {
            this.transport.cancelPendingResponse(channel._pendingSubscriptionCid);
            delete channel._pendingSubscriptionCid;
          }
        };

        SCClientSocket.prototype._decorateChannelName = function (channelName) {
          if (this.channelPrefix) {
            channelName = this.channelPrefix + channelName;
          }

          return channelName;
        };

        SCClientSocket.prototype._undecorateChannelName = function (decoratedChannelName) {
          if (this.channelPrefix && decoratedChannelName.indexOf(this.channelPrefix) === 0) {
            return decoratedChannelName.replace(this.channelPrefix, '');
          }

          return decoratedChannelName;
        };

        SCClientSocket.prototype._trySubscribe = function (channel) {
          var self = this;
          var meetsAuthRequirements = !channel.waitForAuth || this.authState === this.AUTHENTICATED;

          if (this.state === this.OPEN && !this.preparingPendingSubscriptions && channel._pendingSubscriptionCid == null && meetsAuthRequirements) {
            var options = {
              noTimeout: true
            };
            var subscriptionOptions = {
              channel: this._decorateChannelName(channel.name)
            };

            if (channel.waitForAuth) {
              options.waitForAuth = true;
              subscriptionOptions.waitForAuth = options.waitForAuth;
            }

            if (channel.data) {
              subscriptionOptions.data = channel.data;
            }

            if (channel.batch) {
              options.batch = true;
              subscriptionOptions.batch = true;
            }

            channel._pendingSubscriptionCid = this.transport.emit('#subscribe', subscriptionOptions, options, function (err) {
              delete channel._pendingSubscriptionCid;

              if (err) {
                self._triggerChannelSubscribeFail(err, channel, subscriptionOptions);
              } else {
                self._triggerChannelSubscribe(channel, subscriptionOptions);
              }
            });
            Emitter.prototype.emit.call(this, 'subscribeRequest', channel.name, subscriptionOptions);
          }
        };

        SCClientSocket.prototype.subscribe = function (channelName, options) {
          var channel = this.channels[channelName];

          if (!channel) {
            channel = new SCChannel(channelName, this, options);
            this.channels[channelName] = channel;
          } else if (options) {
            channel.setOptions(options);
          }

          if (channel.state === channel.UNSUBSCRIBED) {
            channel.state = channel.PENDING;

            this._trySubscribe(channel);
          }

          return channel;
        };

        SCClientSocket.prototype._triggerChannelUnsubscribe = function (channel, newState) {
          var channelName = channel.name;
          var oldState = channel.state;

          if (newState) {
            channel.state = newState;
          } else {
            channel.state = channel.UNSUBSCRIBED;
          }

          this._cancelPendingSubscribeCallback(channel);

          if (oldState === channel.SUBSCRIBED) {
            var stateChangeData = {
              channel: channelName,
              oldState: oldState,
              newState: channel.state
            };
            channel.emit('subscribeStateChange', stateChangeData);
            channel.emit('unsubscribe', channelName);
            Emitter.prototype.emit.call(this, 'subscribeStateChange', stateChangeData);
            Emitter.prototype.emit.call(this, 'unsubscribe', channelName);
          }
        };

        SCClientSocket.prototype._tryUnsubscribe = function (channel) {

          if (this.state === this.OPEN) {
            var options = {
              noTimeout: true
            };

            if (channel.batch) {
              options.batch = true;
            }

            this._cancelPendingSubscribeCallback(channel);

            var decoratedChannelName = this._decorateChannelName(channel.name);

            this.transport.emit('#unsubscribe', decoratedChannelName, options);
          }
        };

        SCClientSocket.prototype.unsubscribe = function (channelName) {
          var channel = this.channels[channelName];

          if (channel) {
            if (channel.state !== channel.UNSUBSCRIBED) {
              this._triggerChannelUnsubscribe(channel);

              this._tryUnsubscribe(channel);
            }
          }
        };

        SCClientSocket.prototype.channel = function (channelName, options) {
          var currentChannel = this.channels[channelName];

          if (!currentChannel) {
            currentChannel = new SCChannel(channelName, this, options);
            this.channels[channelName] = currentChannel;
          }

          return currentChannel;
        };

        SCClientSocket.prototype.destroyChannel = function (channelName) {
          var channel = this.channels[channelName];

          if (channel) {
            channel.unwatch();
            channel.unsubscribe();
            delete this.channels[channelName];
          }
        };

        SCClientSocket.prototype.subscriptions = function (includePending) {
          var subs = [];
          var channel, includeChannel;

          for (var channelName in this.channels) {
            if (this.channels.hasOwnProperty(channelName)) {
              channel = this.channels[channelName];

              if (includePending) {
                includeChannel = channel && (channel.state === channel.SUBSCRIBED || channel.state === channel.PENDING);
              } else {
                includeChannel = channel && channel.state === channel.SUBSCRIBED;
              }

              if (includeChannel) {
                subs.push(channelName);
              }
            }
          }

          return subs;
        };

        SCClientSocket.prototype.isSubscribed = function (channelName, includePending) {
          var channel = this.channels[channelName];

          if (includePending) {
            return !!channel && (channel.state === channel.SUBSCRIBED || channel.state === channel.PENDING);
          }

          return !!channel && channel.state === channel.SUBSCRIBED;
        };

        SCClientSocket.prototype.processPendingSubscriptions = function () {
          var self = this;
          this.preparingPendingSubscriptions = false;
          var pendingChannels = [];

          for (var i in this.channels) {
            if (this.channels.hasOwnProperty(i)) {
              var channel = this.channels[i];

              if (channel.state === channel.PENDING) {
                pendingChannels.push(channel);
              }
            }
          }

          pendingChannels.sort(function (a, b) {
            var ap = a.priority || 0;
            var bp = b.priority || 0;

            if (ap > bp) {
              return -1;
            }

            if (ap < bp) {
              return 1;
            }

            return 0;
          });
          pendingChannels.forEach(function (channel) {
            self._trySubscribe(channel);
          });
        };

        SCClientSocket.prototype.watch = function (channelName, handler) {
          if (typeof handler !== 'function') {
            throw new InvalidArgumentsError('No handler function was provided');
          }

          this._channelEmitter.on(channelName, handler);
        };

        SCClientSocket.prototype.unwatch = function (channelName, handler) {
          if (handler) {
            this._channelEmitter.removeListener(channelName, handler);
          } else {
            this._channelEmitter.removeAllListeners(channelName);
          }
        };

        SCClientSocket.prototype.watchers = function (channelName) {
          return this._channelEmitter.listeners(channelName);
        };

        module.exports = SCClientSocket;
      }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer);
    }, {
      "./auth": 8,
      "./response": 10,
      "./wctransport": 12,
      "base-64": 13,
      "buffer": 2,
      "clone": 14,
      "component-emitter": 15,
      "linked-list": 17,
      "querystring": 6,
      "sc-channel": 18,
      "sc-errors": 20,
      "sc-formatter": 21
    }],
    12: [function (require, module, exports) {
      var Emitter = require('component-emitter');

      var Response = require('./response').Response;

      var querystring = require('querystring');

      var scErrors = require('sc-errors');

      var TimeoutError = scErrors.TimeoutError;
      var BadConnectionError = scErrors.BadConnectionError;

      var WCTransport = function (authEngine, codecEngine, options) {
        var self = this;
        this.state = this.CLOSED;
        this.auth = authEngine;
        this.codec = codecEngine;
        this.options = options;
        this.connectTimeout = options.connectTimeout;
        this.pingTimeout = options.ackTimeout;
        this.pingTimeoutDisabled = !!options.pingTimeoutDisabled;
        this.callIdGenerator = options.callIdGenerator;
        this.authTokenName = options.authTokenName;
        this._pingTimeoutTicker = null;
        this._callbackMap = {};
        this._batchSendList = [];
        this.state = this.CONNECTING;
        var uri = this.uri();
        var wsSocket = wx.connectSocket({
          url: uri,
          data: this.options
        });
        wsSocket.binaryType = this.options.binaryType;
        this.socket = wsSocket;
        wsSocket.onOpen(function () {
          self._onOpen();
        });
        wsSocket.onClose(function (event) {
          var code;

          if (event.code == null) {
            code = 1005;
          } else {
            code = event.code;
          }

          self._onClose(code, event.reason);
        });
        wsSocket.onMessage(function (message, flags) {
          self._onMessage(message.data);
        });
        wsSocket.onError(function (error) {
          if (self.state === self.CONNECTING) {
            self._onClose(1006);
          }

          this._connectTimeoutRef = setTimeout(function () {
            self._onClose(4007);

            self.socket.close({
              code: 4007
            });
          }, this.connectTimeout);
        });
      };

      WCTransport.prototype = Object.create(Emitter.prototype);
      WCTransport.CONNECTING = WCTransport.prototype.CONNECTING = 'connecting';
      WCTransport.OPEN = WCTransport.prototype.OPEN = 'open';
      WCTransport.CLOSED = WCTransport.prototype.CLOSED = 'closed';

      WCTransport.prototype.uri = function () {
        var query = this.options.query || {};
        var schema = this.options.secure ? 'wss' : 'ws';

        if (this.options.timestampRequests) {
          query[this.options.timestampParam] = new Date().getTime();
        }

        query = querystring.encode(query);

        if (query.length) {
          query = '?' + query;
        }

        var host;

        if (this.options.host) {
          host = this.options.host;
        } else {
          var port = '';

          if (this.options.port && (schema === 'wss' && this.options.port !== 443 || schema === 'ws' && this.options.port !== 80)) {
            port = ':' + this.options.port;
          }

          host = this.options.hostname + port;
        }

        return schema + '://' + host + this.options.path + query;
      };

      WCTransport.prototype._onOpen = function () {
        var self = this;
        clearTimeout(this._connectTimeoutRef);

        this._resetPingTimeout();

        this._handshake(function (err, status) {
          if (err) {
            var statusCode;

            if (status && status.code) {
              statusCode = status.code;
            } else {
              statusCode = 4003;
            }

            self._onError(err);

            self._onClose(statusCode, err.toString());

            self.socket.close({
              code: statusCode
            });
          } else {
            self.state = self.OPEN;
            Emitter.prototype.emit.call(self, 'open', status);

            self._resetPingTimeout();
          }
        });
      };

      WCTransport.prototype._handshake = function (callback) {
        var self = this;
        this.auth.loadToken(this.authTokenName, function (err, token) {
          if (err) {
            callback(err);
          } else {
            var options = {
              force: true
            };
            self.emit('#handshake', {
              authToken: token
            }, options, function (err, status) {
              if (status) {
                status.authToken = token;

                if (status.authError) {
                  status.authError = scErrors.hydrateError(status.authError);
                }
              }

              callback(err, status);
            });
          }
        });
      };

      WCTransport.prototype._abortAllPendingEventsDueToBadConnection = function (failureType) {
        for (var i in this._callbackMap) {
          if (this._callbackMap.hasOwnProperty(i)) {
            var eventObject = this._callbackMap[i];
            delete this._callbackMap[i];
            clearTimeout(eventObject.timeout);
            delete eventObject.timeout;
            var errorMessage = "Event '" + eventObject.event + "' was aborted due to a bad connection";
            var badConnectionError = new BadConnectionError(errorMessage, failureType);
            var callback = eventObject.callback;
            delete eventObject.callback;
            callback.call(eventObject, badConnectionError, eventObject);
          }
        }
      };

      WCTransport.prototype._onClose = function (code, data) {
        clearTimeout(this._connectTimeoutRef);
        clearTimeout(this._pingTimeoutTicker);
        clearTimeout(this._batchTimeout);

        if (this.state === this.OPEN) {
          this.state = this.CLOSED;
          Emitter.prototype.emit.call(this, 'close', code, data);

          this._abortAllPendingEventsDueToBadConnection('disconnect');
        } else if (this.state === this.CONNECTING) {
          this.state = this.CLOSED;
          Emitter.prototype.emit.call(this, 'openAbort', code, data);

          this._abortAllPendingEventsDueToBadConnection('connectAbort');
        }
      };

      WCTransport.prototype._handleEventObject = function (obj, message) {
        if (obj && obj.event != null) {
          var response = new Response(this, obj.cid);
          Emitter.prototype.emit.call(this, 'event', obj.event, obj.data, response);
        } else if (obj && obj.rid != null) {
          var eventObject = this._callbackMap[obj.rid];

          if (eventObject) {
            clearTimeout(eventObject.timeout);
            delete eventObject.timeout;
            delete this._callbackMap[obj.rid];

            if (eventObject.callback) {
              var rehydratedError = scErrors.hydrateError(obj.error);
              eventObject.callback(rehydratedError, obj.data);
            }
          }
        } else {
          Emitter.prototype.emit.call(this, 'event', 'raw', message);
        }
      };

      WCTransport.prototype._onMessage = function (message) {
        Emitter.prototype.emit.call(this, 'event', 'message', message);
        var obj = this.decode(message);

        if (obj === '#1') {
          this._resetPingTimeout();

          if (this.socket.readyState === this.socket.OPEN) {
            this.sendObject('#2');
          }
        } else {
          if (Array.isArray(obj)) {
            var len = obj.length;

            for (var i = 0; i < len; i++) {
              this._handleEventObject(obj[i], message);
            }
          } else {
            this._handleEventObject(obj, message);
          }
        }
      };

      WCTransport.prototype._onError = function (err) {
        Emitter.prototype.emit.call(this, 'error', err);
      };

      WCTransport.prototype._resetPingTimeout = function () {
        if (this.pingTimeoutDisabled) {
          return;
        }

        var self = this;
        var now = new Date().getTime();
        clearTimeout(this._pingTimeoutTicker);
        this._pingTimeoutTicker = setTimeout(function () {
          self._onClose(4000);

          self.socket.close({
            code: 4000
          });
        }, this.pingTimeout);
      };

      WCTransport.prototype.getBytesReceived = function () {
        return this.socket.bytesReceived;
      };

      WCTransport.prototype.close = function (code, data) {
        code = code || 1000;

        if (this.state === this.OPEN) {
          var packet = {
            code: code,
            data: data
          };
          this.emit('#disconnect', packet);

          this._onClose(code, data);

          this.socket.close({
            code: code
          });
        } else if (this.state === this.CONNECTING) {
          this._onClose(code, data);

          this.socket.close({
            code: code
          });
        }
      };

      WCTransport.prototype.emitObject = function (eventObject, options) {
        var simpleEventObject = {
          event: eventObject.event,
          data: eventObject.data
        };

        if (eventObject.callback) {
          simpleEventObject.cid = eventObject.cid = this.callIdGenerator();
          this._callbackMap[eventObject.cid] = eventObject;
        }

        this.sendObject(simpleEventObject, options);
        return eventObject.cid || null;
      };

      WCTransport.prototype._handleEventAckTimeout = function (eventObject) {
        if (eventObject.cid) {
          delete this._callbackMap[eventObject.cid];
        }

        delete eventObject.timeout;
        var callback = eventObject.callback;

        if (callback) {
          delete eventObject.callback;
          var error = new TimeoutError("Event response for '" + eventObject.event + "' timed out");
          callback.call(eventObject, error, eventObject);
        }
      };

      WCTransport.prototype.emit = function (event, data, a, b) {
        var self = this;
        var callback, options;

        if (b) {
          options = a;
          callback = b;
        } else {
          if (a instanceof Function) {
            options = {};
            callback = a;
          } else {
            options = a;
          }
        }

        var eventObject = {
          event: event,
          data: data,
          callback: callback
        };

        if (callback && !options.noTimeout) {
          eventObject.timeout = setTimeout(function () {
            self._handleEventAckTimeout(eventObject);
          }, this.options.ackTimeout);
        }

        var cid = null;

        if (this.state === this.OPEN || options.force) {
          cid = this.emitObject(eventObject, options);
        }

        return cid;
      };

      WCTransport.prototype.cancelPendingResponse = function (cid) {
        delete this._callbackMap[cid];
      };

      WCTransport.prototype.decode = function (message) {
        return this.codec.decode(message);
      };

      WCTransport.prototype.encode = function (object) {
        return this.codec.encode(object);
      };

      WCTransport.prototype.send = function (data) {
        if (this.socket.readyState !== this.socket.OPEN) {
          this._onClose(1005);
        } else {
          this.socket.send({
            data: data
          });
        }
      };

      WCTransport.prototype.serializeObject = function (object) {
        var str, formatError;

        try {
          str = this.encode(object);
        } catch (err) {
          formatError = err;

          this._onError(formatError);
        }

        if (!formatError) {
          return str;
        }

        return null;
      };

      WCTransport.prototype.sendObjectBatch = function (object) {
        var self = this;

        this._batchSendList.push(object);

        if (this._batchTimeout) {
          return;
        }

        this._batchTimeout = setTimeout(function () {
          delete self._batchTimeout;

          if (self._batchSendList.length) {
            var str = self.serializeObject(self._batchSendList);

            if (str != null) {
              self.send(str);
            }

            self._batchSendList = [];
          }
        }, this.options.pubSubBatchDuration || 0);
      };

      WCTransport.prototype.sendObjectSingle = function (object) {
        var str = this.serializeObject(object);

        if (str != null) {
          this.send(str);
        }
      };

      WCTransport.prototype.sendObject = function (object, options) {
        if (options && options.batch) {
          this.sendObjectBatch(object);
        } else {
          this.sendObjectSingle(object);
        }
      };

      module.exports.WCTransport = WCTransport;
    }, {
      "./response": 10,
      "component-emitter": 15,
      "querystring": 6,
      "sc-errors": 20
    }],
    13: [function (require, module, exports) {
      (function (global) {

        (function (root) {
          var freeExports = typeof exports == 'object' && exports;
          var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
          var freeGlobal = typeof global == 'object' && global;

          if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
            root = freeGlobal;
          }

          var InvalidCharacterError = function (message) {
            this.message = message;
          };

          InvalidCharacterError.prototype = new Error();
          InvalidCharacterError.prototype.name = 'InvalidCharacterError';

          var error = function (message) {
            throw new InvalidCharacterError(message);
          };

          var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

          var decode = function (input) {
            input = String(input).replace(REGEX_SPACE_CHARACTERS, '');
            var length = input.length;

            if (length % 4 == 0) {
              input = input.replace(/==?$/, '');
              length = input.length;
            }

            if (length % 4 == 1 || /[^+a-zA-Z0-9/]/.test(input)) {
              error('Invalid character: the string to be decoded is not correctly encoded.');
            }

            var bitCounter = 0;
            var bitStorage;
            var buffer;
            var output = '';
            var position = -1;

            while (++position < length) {
              buffer = TABLE.indexOf(input.charAt(position));
              bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;

              if (bitCounter++ % 4) {
                output += String.fromCharCode(0xFF & bitStorage >> (-2 * bitCounter & 6));
              }
            }

            return output;
          };

          var encode = function (input) {
            input = String(input);

            if (/[^\0-\xFF]/.test(input)) {
              error('The string to be encoded contains characters outside of the ' + 'Latin1 range.');
            }

            var padding = input.length % 3;
            var output = '';
            var position = -1;
            var a;
            var b;
            var c;
            var buffer;
            var length = input.length - padding;

            while (++position < length) {
              a = input.charCodeAt(position) << 16;
              b = input.charCodeAt(++position) << 8;
              c = input.charCodeAt(++position);
              buffer = a + b + c;
              output += TABLE.charAt(buffer >> 18 & 0x3F) + TABLE.charAt(buffer >> 12 & 0x3F) + TABLE.charAt(buffer >> 6 & 0x3F) + TABLE.charAt(buffer & 0x3F);
            }

            if (padding == 2) {
              a = input.charCodeAt(position) << 8;
              b = input.charCodeAt(++position);
              buffer = a + b;
              output += TABLE.charAt(buffer >> 10) + TABLE.charAt(buffer >> 4 & 0x3F) + TABLE.charAt(buffer << 2 & 0x3F) + '=';
            } else if (padding == 1) {
              buffer = input.charCodeAt(position);
              output += TABLE.charAt(buffer >> 2) + TABLE.charAt(buffer << 4 & 0x3F) + '==';
            }

            return output;
          };

          var base64 = {
            'encode': encode,
            'decode': decode,
            'version': '0.1.0'
          };

          if (freeExports && !freeExports.nodeType) {
            if (freeModule) {
              freeModule.exports = base64;
            } else {
              for (var key in base64) {
                base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
              }
            }
          } else {
            root.base64 = base64;
          }
        })(this);
      }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}],
    14: [function (require, module, exports) {
      (function (Buffer) {
        var clone = function () {

          function _instanceof(obj, type) {
            return type != null && obj instanceof type;
          }

          var nativeMap;

          try {
            nativeMap = Map;
          } catch (_) {
            nativeMap = function () {};
          }

          var nativeSet;

          try {
            nativeSet = Set;
          } catch (_) {
            nativeSet = function () {};
          }

          var nativePromise;

          try {
            nativePromise = Promise;
          } catch (_) {
            nativePromise = function () {};
          }

          function clone(parent, circular, depth, prototype, includeNonEnumerable) {
            if (typeof circular === 'object') {
              depth = circular.depth;
              prototype = circular.prototype;
              includeNonEnumerable = circular.includeNonEnumerable;
              circular = circular.circular;
            }

            var allParents = [];
            var allChildren = [];
            var useBuffer = typeof Buffer != 'undefined';
            if (typeof circular == 'undefined') circular = true;
            if (typeof depth == 'undefined') depth = Infinity;

            function _clone(parent, depth) {
              if (parent === null) return null;
              if (depth === 0) return parent;
              var child;
              var proto;

              if (typeof parent != 'object') {
                return parent;
              }

              if (_instanceof(parent, nativeMap)) {
                child = new nativeMap();
              } else if (_instanceof(parent, nativeSet)) {
                child = new nativeSet();
              } else if (_instanceof(parent, nativePromise)) {
                child = new nativePromise(function (resolve, reject) {
                  parent.then(function (value) {
                    resolve(_clone(value, depth - 1));
                  }, function (err) {
                    reject(_clone(err, depth - 1));
                  });
                });
              } else if (clone.__isArray(parent)) {
                child = [];
              } else if (clone.__isRegExp(parent)) {
                child = new RegExp(parent.source, __getRegExpFlags(parent));
                if (parent.lastIndex) child.lastIndex = parent.lastIndex;
              } else if (clone.__isDate(parent)) {
                child = new Date(parent.getTime());
              } else if (useBuffer && Buffer.isBuffer(parent)) {
                child = new Buffer(parent.length);
                parent.copy(child);
                return child;
              } else if (_instanceof(parent, Error)) {
                child = Object.create(parent);
              } else {
                if (typeof prototype == 'undefined') {
                  proto = Object.getPrototypeOf(parent);
                  child = Object.create(proto);
                } else {
                  child = Object.create(prototype);
                  proto = prototype;
                }
              }

              if (circular) {
                var index = allParents.indexOf(parent);

                if (index != -1) {
                  return allChildren[index];
                }

                allParents.push(parent);
                allChildren.push(child);
              }

              if (_instanceof(parent, nativeMap)) {
                parent.forEach(function (value, key) {
                  var keyChild = _clone(key, depth - 1);

                  var valueChild = _clone(value, depth - 1);

                  child.set(keyChild, valueChild);
                });
              }

              if (_instanceof(parent, nativeSet)) {
                parent.forEach(function (value) {
                  var entryChild = _clone(value, depth - 1);

                  child.add(entryChild);
                });
              }

              for (var i in parent) {
                var attrs;

                if (proto) {
                  attrs = Object.getOwnPropertyDescriptor(proto, i);
                }

                if (attrs && attrs.set == null) {
                  continue;
                }

                child[i] = _clone(parent[i], depth - 1);
              }

              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(parent);

                for (var i = 0; i < symbols.length; i++) {
                  var symbol = symbols[i];
                  var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);

                  if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
                    continue;
                  }

                  child[symbol] = _clone(parent[symbol], depth - 1);

                  if (!descriptor.enumerable) {
                    Object.defineProperty(child, symbol, {
                      enumerable: false
                    });
                  }
                }
              }

              if (includeNonEnumerable) {
                var allPropertyNames = Object.getOwnPropertyNames(parent);

                for (var i = 0; i < allPropertyNames.length; i++) {
                  var propertyName = allPropertyNames[i];
                  var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);

                  if (descriptor && descriptor.enumerable) {
                    continue;
                  }

                  child[propertyName] = _clone(parent[propertyName], depth - 1);
                  Object.defineProperty(child, propertyName, {
                    enumerable: false
                  });
                }
              }

              return child;
            }

            return _clone(parent, depth);
          }

          clone.clonePrototype = function clonePrototype(parent) {
            if (parent === null) return null;

            var c = function () {};

            c.prototype = parent;
            return new c();
          };

          function __objToStr(o) {
            return Object.prototype.toString.call(o);
          }

          clone.__objToStr = __objToStr;

          function __isDate(o) {
            return typeof o === 'object' && __objToStr(o) === '[object Date]';
          }

          clone.__isDate = __isDate;

          function __isArray(o) {
            return typeof o === 'object' && __objToStr(o) === '[object Array]';
          }

          clone.__isArray = __isArray;

          function __isRegExp(o) {
            return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
          }

          clone.__isRegExp = __isRegExp;

          function __getRegExpFlags(re) {
            var flags = '';
            if (re.global) flags += 'g';
            if (re.ignoreCase) flags += 'i';
            if (re.multiline) flags += 'm';
            return flags;
          }

          clone.__getRegExpFlags = __getRegExpFlags;
          return clone;
        }();

        if (typeof module === 'object' && module.exports) {
          module.exports = clone;
        }
      }).call(this, require("buffer").Buffer);
    }, {
      "buffer": 2
    }],
    15: [function (require, module, exports) {
      if (typeof module !== 'undefined') {
        module.exports = Emitter;
      }

      function Emitter(obj) {
        if (obj) return mixin(obj);
      }

      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }

        return obj;
      }

      Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
        return this;
      };

      Emitter.prototype.once = function (event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
      };

      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};

        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }

        var callbacks = this._callbacks['$' + event];
        if (!callbacks) return this;

        if (1 == arguments.length) {
          delete this._callbacks['$' + event];
          return this;
        }

        var cb;

        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];

          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }

        return this;
      };

      Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this._callbacks['$' + event];

        if (callbacks) {
          callbacks = callbacks.slice(0);

          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }

        return this;
      };

      Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
      };

      Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
      };
    }, {}],
    16: [function (require, module, exports) {

      var errorMessage;
      errorMessage = 'An argument without append, prepend, ' + 'or detach methods was given to `List';

      function List() {
        if (arguments.length) {
          return List.from(arguments);
        }
      }

      var ListPrototype;
      ListPrototype = List.prototype;

      List.of = function () {
        return List.from.call(this, arguments);
      };

      List.from = function (items) {
        var list = new this(),
            length,
            iterator,
            item;

        if (items && (length = items.length)) {
          iterator = -1;

          while (++iterator < length) {
            item = items[iterator];

            if (item !== null && item !== undefined) {
              list.append(item);
            }
          }
        }

        return list;
      };

      ListPrototype.head = null;
      ListPrototype.tail = null;

      ListPrototype.toArray = function () {
        var item = this.head,
            result = [];

        while (item) {
          result.push(item);
          item = item.next;
        }

        return result;
      };

      ListPrototype.prepend = function (item) {
        if (!item) {
          return false;
        }

        if (!item.append || !item.prepend || !item.detach) {
          throw new Error(errorMessage + '#prepend`.');
        }

        var self, head;
        self = this;
        head = self.head;

        if (head) {
          return head.prepend(item);
        }

        item.detach();
        item.list = self;
        self.head = item;
        return item;
      };

      ListPrototype.append = function (item) {
        if (!item) {
          return false;
        }

        if (!item.append || !item.prepend || !item.detach) {
          throw new Error(errorMessage + '#append`.');
        }

        var self, head, tail;
        self = this;
        tail = self.tail;

        if (tail) {
          return tail.append(item);
        }

        head = self.head;

        if (head) {
          return head.append(item);
        }

        item.detach();
        item.list = self;
        self.head = item;
        return item;
      };

      function ListItem() {}

      List.Item = ListItem;
      var ListItemPrototype = ListItem.prototype;
      ListItemPrototype.next = null;
      ListItemPrototype.prev = null;
      ListItemPrototype.list = null;

      ListItemPrototype.detach = function () {
        var self = this,
            list = self.list,
            prev = self.prev,
            next = self.next;

        if (!list) {
          return self;
        }

        if (list.tail === self) {
          list.tail = prev;
        }

        if (list.head === self) {
          list.head = next;
        }

        if (list.tail === list.head) {
          list.tail = null;
        }

        if (prev) {
          prev.next = next;
        }

        if (next) {
          next.prev = prev;
        }

        self.prev = self.next = self.list = null;
        return self;
      };

      ListItemPrototype.prepend = function (item) {
        if (!item || !item.append || !item.prepend || !item.detach) {
          throw new Error(errorMessage + 'Item#prepend`.');
        }

        var self = this,
            list = self.list,
            prev = self.prev;

        if (!list) {
          return false;
        }

        item.detach();

        if (prev) {
          item.prev = prev;
          prev.next = item;
        }

        item.next = self;
        item.list = list;
        self.prev = item;

        if (self === list.head) {
          list.head = item;
        }

        if (!list.tail) {
          list.tail = self;
        }

        return item;
      };

      ListItemPrototype.append = function (item) {
        if (!item || !item.append || !item.prepend || !item.detach) {
          throw new Error(errorMessage + 'Item#append`.');
        }

        var self = this,
            list = self.list,
            next = self.next;

        if (!list) {
          return false;
        }

        item.detach();

        if (next) {
          item.next = next;
          next.prev = item;
        }

        item.prev = self;
        item.list = list;
        self.next = item;

        if (self === list.tail || !list.tail) {
          list.tail = item;
        }

        return item;
      };

      module.exports = List;
    }, {}],
    17: [function (require, module, exports) {

      module.exports = require('./_source/linked-list.js');
    }, {
      "./_source/linked-list.js": 16
    }],
    18: [function (require, module, exports) {
      var Emitter = require('component-emitter');

      var SCChannel = function (name, client, options) {
        Emitter.call(this);
        this.PENDING = 'pending';
        this.SUBSCRIBED = 'subscribed';
        this.UNSUBSCRIBED = 'unsubscribed';
        this.name = name;
        this.state = this.UNSUBSCRIBED;
        this.client = client;
        this.options = options || {};
        this.setOptions(this.options);
      };

      SCChannel.prototype = Object.create(Emitter.prototype);

      SCChannel.prototype.setOptions = function (options) {
        if (!options) {
          options = {};
        }

        this.waitForAuth = options.waitForAuth || false;
        this.batch = options.batch || false;

        if (options.data !== undefined) {
          this.data = options.data;
        }
      };

      SCChannel.prototype.getState = function () {
        return this.state;
      };

      SCChannel.prototype.subscribe = function (options) {
        this.client.subscribe(this.name, options);
      };

      SCChannel.prototype.unsubscribe = function () {
        this.client.unsubscribe(this.name);
      };

      SCChannel.prototype.isSubscribed = function (includePending) {
        return this.client.isSubscribed(this.name, includePending);
      };

      SCChannel.prototype.publish = function (data, callback) {
        this.client.publish(this.name, data, callback);
      };

      SCChannel.prototype.watch = function (handler) {
        this.client.watch(this.name, handler);
      };

      SCChannel.prototype.unwatch = function (handler) {
        this.client.unwatch(this.name, handler);
      };

      SCChannel.prototype.watchers = function () {
        return this.client.watchers(this.name);
      };

      SCChannel.prototype.destroy = function () {
        this.client.destroyChannel(this.name);
      };

      module.exports.SCChannel = SCChannel;
    }, {
      "component-emitter": 15
    }],
    19: [function (require, module, exports) {
      module.exports = function decycle(object) {
        var objects = [],
            paths = [];
        return function derez(value, path) {
          var i, name, nu;

          if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {
            for (i = 0; i < objects.length; i += 1) {
              if (objects[i] === value) {
                return {
                  $ref: paths[i]
                };
              }
            }

            objects.push(value);
            paths.push(path);

            if (Object.prototype.toString.apply(value) === '[object Array]') {
              nu = [];

              for (i = 0; i < value.length; i += 1) {
                nu[i] = derez(value[i], path + '[' + i + ']');
              }
            } else {
              nu = {};

              for (name in value) {
                if (Object.prototype.hasOwnProperty.call(value, name)) {
                  nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                }
              }
            }

            return nu;
          }

          return value;
        }(object, '$');
      };
    }, {}],
    20: [function (require, module, exports) {
      var decycle = require('./decycle');

      var isStrict = function () {
        return !this;
      }();

      function AuthTokenExpiredError(message, expiry) {
        this.name = 'AuthTokenExpiredError';
        this.message = message;
        this.expiry = expiry;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      AuthTokenExpiredError.prototype = Object.create(Error.prototype);

      function AuthTokenInvalidError(message) {
        this.name = 'AuthTokenInvalidError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      AuthTokenInvalidError.prototype = Object.create(Error.prototype);

      function AuthTokenNotBeforeError(message, date) {
        this.name = 'AuthTokenNotBeforeError';
        this.message = message;
        this.date = date;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      AuthTokenNotBeforeError.prototype = Object.create(Error.prototype);

      function AuthTokenError(message) {
        this.name = 'AuthTokenError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      AuthTokenError.prototype = Object.create(Error.prototype);

      function SilentMiddlewareBlockedError(message, type) {
        this.name = 'SilentMiddlewareBlockedError';
        this.message = message;
        this.type = type;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      SilentMiddlewareBlockedError.prototype = Object.create(Error.prototype);

      function InvalidActionError(message) {
        this.name = 'InvalidActionError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      InvalidActionError.prototype = Object.create(Error.prototype);

      function InvalidArgumentsError(message) {
        this.name = 'InvalidArgumentsError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      InvalidArgumentsError.prototype = Object.create(Error.prototype);

      function InvalidOptionsError(message) {
        this.name = 'InvalidOptionsError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      InvalidOptionsError.prototype = Object.create(Error.prototype);

      function InvalidMessageError(message) {
        this.name = 'InvalidMessageError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      InvalidMessageError.prototype = Object.create(Error.prototype);

      function SocketProtocolError(message, code) {
        this.name = 'SocketProtocolError';
        this.message = message;
        this.code = code;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      SocketProtocolError.prototype = Object.create(Error.prototype);

      function ServerProtocolError(message) {
        this.name = 'ServerProtocolError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      ServerProtocolError.prototype = Object.create(Error.prototype);

      function HTTPServerError(message) {
        this.name = 'HTTPServerError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      HTTPServerError.prototype = Object.create(Error.prototype);

      function ResourceLimitError(message) {
        this.name = 'ResourceLimitError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      ResourceLimitError.prototype = Object.create(Error.prototype);

      function TimeoutError(message) {
        this.name = 'TimeoutError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      TimeoutError.prototype = Object.create(Error.prototype);

      function BadConnectionError(message, type) {
        this.name = 'BadConnectionError';
        this.message = message;
        this.type = type;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      BadConnectionError.prototype = Object.create(Error.prototype);

      function BrokerError(message) {
        this.name = 'BrokerError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      BrokerError.prototype = Object.create(Error.prototype);

      function ProcessExitError(message, code) {
        this.name = 'ProcessExitError';
        this.message = message;
        this.code = code;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      ProcessExitError.prototype = Object.create(Error.prototype);

      function UnknownError(message) {
        this.name = 'UnknownError';
        this.message = message;

        if (Error.captureStackTrace && !isStrict) {
          Error.captureStackTrace(this, arguments.callee);
        } else {
          this.stack = new Error().stack;
        }
      }

      UnknownError.prototype = Object.create(Error.prototype);
      module.exports = {
        AuthTokenExpiredError: AuthTokenExpiredError,
        AuthTokenInvalidError: AuthTokenInvalidError,
        AuthTokenNotBeforeError: AuthTokenNotBeforeError,
        AuthTokenError: AuthTokenError,
        SilentMiddlewareBlockedError: SilentMiddlewareBlockedError,
        InvalidActionError: InvalidActionError,
        InvalidArgumentsError: InvalidArgumentsError,
        InvalidOptionsError: InvalidOptionsError,
        InvalidMessageError: InvalidMessageError,
        SocketProtocolError: SocketProtocolError,
        ServerProtocolError: ServerProtocolError,
        HTTPServerError: HTTPServerError,
        ResourceLimitError: ResourceLimitError,
        TimeoutError: TimeoutError,
        BadConnectionError: BadConnectionError,
        BrokerError: BrokerError,
        ProcessExitError: ProcessExitError,
        UnknownError: UnknownError
      };
      module.exports.socketProtocolErrorStatuses = {
        1001: 'Socket was disconnected',
        1002: 'A WebSocket protocol error was encountered',
        1003: 'Server terminated socket because it received invalid data',
        1005: 'Socket closed without status code',
        1006: 'Socket hung up',
        1007: 'Message format was incorrect',
        1008: 'Encountered a policy violation',
        1009: 'Message was too big to process',
        1010: 'Client ended the connection because the server did not comply with extension requirements',
        1011: 'Server encountered an unexpected fatal condition',
        4000: 'Server ping timed out',
        4001: 'Client pong timed out',
        4002: 'Server failed to sign auth token',
        4003: 'Failed to complete handshake',
        4004: 'Client failed to save auth token',
        4005: 'Did not receive #handshake from client before timeout',
        4006: 'Failed to bind socket to message broker',
        4007: 'Client connection establishment timed out',
        4008: 'Server rejected handshake from client'
      };
      module.exports.socketProtocolIgnoreStatuses = {
        1000: 'Socket closed normally',
        1001: 'Socket hung up'
      };
      var unserializableErrorProperties = {
        domain: 1,
        domainEmitter: 1,
        domainThrown: 1
      };

      module.exports.dehydrateError = function dehydrateError(error, includeStackTrace) {
        var dehydratedError;

        if (error && typeof error === 'object') {
          dehydratedError = {
            message: error.message
          };

          if (includeStackTrace) {
            dehydratedError.stack = error.stack;
          }

          for (var i in error) {
            if (!unserializableErrorProperties[i]) {
              dehydratedError[i] = error[i];
            }
          }
        } else if (typeof error === 'function') {
          dehydratedError = '[function ' + (error.name || 'anonymous') + ']';
        } else {
          dehydratedError = error;
        }

        return decycle(dehydratedError);
      };

      module.exports.hydrateError = function hydrateError(error) {
        var hydratedError = null;

        if (error != null) {
          if (typeof error === 'object') {
            hydratedError = new Error(error.message);

            for (var i in error) {
              if (error.hasOwnProperty(i)) {
                hydratedError[i] = error[i];
              }
            }
          } else {
            hydratedError = error;
          }
        }

        return hydratedError;
      };

      module.exports.decycle = decycle;
    }, {
      "./decycle": 19
    }],
    21: [function (require, module, exports) {
      (function (global) {
        var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var validJSONStartRegex = /^[ \n\r\t]*[{\[]/;

        var arrayBufferToBase64 = function (arraybuffer) {
          var bytes = new Uint8Array(arraybuffer);
          var len = bytes.length;
          var base64 = '';

          for (var i = 0; i < len; i += 3) {
            base64 += base64Chars[bytes[i] >> 2];
            base64 += base64Chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
            base64 += base64Chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
            base64 += base64Chars[bytes[i + 2] & 63];
          }

          if (len % 3 === 2) {
            base64 = base64.substring(0, base64.length - 1) + '=';
          } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + '==';
          }

          return base64;
        };

        var binaryToBase64Replacer = function (key, value) {
          if (global.ArrayBuffer && value instanceof global.ArrayBuffer) {
            return {
              base64: true,
              data: arrayBufferToBase64(value)
            };
          } else if (global.Buffer) {
            if (value instanceof global.Buffer) {
              return {
                base64: true,
                data: value.toString('base64')
              };
            }

            if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
              var rehydratedBuffer;

              if (global.Buffer.from) {
                rehydratedBuffer = global.Buffer.from(value.data);
              } else {
                rehydratedBuffer = new global.Buffer(value.data);
              }

              return {
                base64: true,
                data: rehydratedBuffer.toString('base64')
              };
            }
          }

          return value;
        };

        module.exports.decode = function (input) {
          if (input == null) {
            return null;
          }

          if (input === '#1' || input === '#2') {
            return input;
          }

          var message = input.toString();

          if (!validJSONStartRegex.test(message)) {
            return message;
          }

          try {
            return JSON.parse(message);
          } catch (err) {}

          return message;
        };

        module.exports.encode = function (object) {
          if (object === '#1' || object === '#2') {
            return object;
          }

          return JSON.stringify(object, binaryToBase64Replacer);
        };
      }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}],
    22: [function (require, module, exports) {
      var v1 = require('./v1');

      var v4 = require('./v4');

      var uuid = v4;
      uuid.v1 = v1;
      uuid.v4 = v4;
      module.exports = uuid;
    }, {
      "./v1": 25,
      "./v4": 26
    }],
    23: [function (require, module, exports) {
      var byteToHex = [];

      for (var i = 0; i < 256; ++i) {
        byteToHex[i] = (i + 0x100).toString(16).substr(1);
      }

      function bytesToUuid(buf, offset) {
        var i = offset || 0;
        var bth = byteToHex;
        return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
      }

      module.exports = bytesToUuid;
    }, {}],
    24: [function (require, module, exports) {
      var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && msCrypto.getRandomValues.bind(msCrypto);

      if (getRandomValues) {
        var rnds8 = new Uint8Array(16);

        module.exports = function whatwgRNG() {
          getRandomValues(rnds8);
          return rnds8;
        };
      } else {
        var rnds = new Array(16);

        module.exports = function mathRNG() {
          for (var i = 0, r; i < 16; i++) {
            if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
            rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
          }

          return rnds;
        };
      }
    }, {}],
    25: [function (require, module, exports) {
      var rng = require('./lib/rng');

      var bytesToUuid = require('./lib/bytesToUuid');

      var _nodeId;

      var _clockseq;

      var _lastMSecs = 0;
      var _lastNSecs = 0;

      function v1(options, buf, offset) {
        var i = buf && offset || 0;
        var b = buf || [];
        options = options || {};
        var node = options.node || _nodeId;
        var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

        if (node == null || clockseq == null) {
          var seedBytes = rng();

          if (node == null) {
            node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
          }

          if (clockseq == null) {
            clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
          }
        }

        var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();
        var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
        var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

        if (dt < 0 && options.clockseq === undefined) {
          clockseq = clockseq + 1 & 0x3fff;
        }

        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
          nsecs = 0;
        }

        if (nsecs >= 10000) {
          throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
        }

        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;
        msecs += 12219292800000;
        var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
        b[i++] = tl >>> 24 & 0xff;
        b[i++] = tl >>> 16 & 0xff;
        b[i++] = tl >>> 8 & 0xff;
        b[i++] = tl & 0xff;
        var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
        b[i++] = tmh >>> 8 & 0xff;
        b[i++] = tmh & 0xff;
        b[i++] = tmh >>> 24 & 0xf | 0x10;
        b[i++] = tmh >>> 16 & 0xff;
        b[i++] = clockseq >>> 8 | 0x80;
        b[i++] = clockseq & 0xff;

        for (var n = 0; n < 6; ++n) {
          b[i + n] = node[n];
        }

        return buf ? buf : bytesToUuid(b);
      }

      module.exports = v1;
    }, {
      "./lib/bytesToUuid": 23,
      "./lib/rng": 24
    }],
    26: [function (require, module, exports) {
      var rng = require('./lib/rng');

      var bytesToUuid = require('./lib/bytesToUuid');

      function v4(options, buf, offset) {
        var i = buf && offset || 0;

        if (typeof options == 'string') {
          buf = options === 'binary' ? new Array(16) : null;
          options = null;
        }

        options = options || {};
        var rnds = options.random || (options.rng || rng)();
        rnds[6] = rnds[6] & 0x0f | 0x40;
        rnds[8] = rnds[8] & 0x3f | 0x80;

        if (buf) {
          for (var ii = 0; ii < 16; ++ii) {
            buf[i + ii] = rnds[ii];
          }
        }

        return buf || bytesToUuid(rnds);
      }

      module.exports = v4;
    }, {
      "./lib/bytesToUuid": 23,
      "./lib/rng": 24
    }]
  }, {}, [7])(7);
});
});

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */


var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */

var root = _freeGlobal || freeSelf || Function('return this')();
var _root = root;

/** Built-in value references. */


var Symbol$1 = _root.Symbol;
var _Symbol = Symbol$1;

/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/** Built-in value references. */

var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);

  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString$1 = objectProto$1.toString;
/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */

function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */


var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';
/** Built-in value references. */

var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return symToStringTag$1 && symToStringTag$1 in Object(value) ? _getRawTag(value) : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */


var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */

function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  } // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.


  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/** Used to detect overreaching core-js shims. */


var coreJsData = _root['__core-js_shared__'];
var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */


var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */


function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto = Function.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */

function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}

    try {
      return func + '';
    } catch (e) {}
  }

  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */


var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
/** Used to detect host constructors (Safari). */

var reIsHostCtor = /^\[object .+?Constructor\]$/;
/** Used for built-in method references. */

var funcProto$1 = Function.prototype,
    objectProto$2 = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString$1 = funcProto$1.toString;
/** Used to check objects for own properties. */

var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
/** Used to detect if a method is native. */

var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */

function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }

  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */


function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

/* Built-in method references that are verified to be native. */


var nativeCreate = _getNative(Object, 'create');
var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */


function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */


var HASH_UNDEFINED = '__lodash_hash_undefined__';
/** Used for built-in method references. */

var objectProto$3 = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */

function hashGet(key) {
  var data = this.__data__;

  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }

  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */


var objectProto$4 = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */


var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */

function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `Hash`.


Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;
var _Hash = Hash;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

var eq_1 = eq;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function assocIndexOf(array, key) {
  var length = array.length;

  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }

  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */


var arrayProto = Array.prototype;
/** Built-in value references. */

var splice = arrayProto.splice;
/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }

  var lastIndex = data.length - 1;

  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }

  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */


function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }

  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `ListCache`.


ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;
var _ListCache = ListCache;

/* Built-in method references that are verified to be native. */


var Map$1 = _getNative(_root, 'Map');
var _Map = Map$1;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */


function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash(),
    'map': new (_Map || _ListCache)(),
    'string': new _Hash()
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */


function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */


function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `MapCache`.


MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;
var _MapCache = MapCache;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */

function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);

  return this;
}

var _setCacheAdd = setCacheAdd;

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

var _setCacheHas = setCacheHas;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */


function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;
  this.__data__ = new _MapCache();

  while (++index < length) {
    this.add(values[index]);
  }
} // Add methods to `SetCache`.


SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
SetCache.prototype.has = _setCacheHas;
var _SetCache = SetCache;

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }

  return -1;
}

var _baseFindIndex = baseFindIndex;

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

var _baseIsNaN = baseIsNaN;

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }

  return -1;
}

var _strictIndexOf = strictIndexOf;

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function baseIndexOf(array, value, fromIndex) {
  return value === value ? _strictIndexOf(array, value, fromIndex) : _baseFindIndex(array, _baseIsNaN, fromIndex);
}

var _baseIndexOf = baseIndexOf;

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */


function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && _baseIndexOf(array, value, 0) > -1;
}

var _arrayIncludes = arrayIncludes;

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }

  return false;
}

var _arrayIncludesWith = arrayIncludesWith;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }

  return result;
}

var _arrayMap = arrayMap;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

var _cacheHas = cacheHas;

/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE = 200;
/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */

function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = _arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }

  if (iteratee) {
    values = _arrayMap(values, _baseUnary(iteratee));
  }

  if (comparator) {
    includes = _arrayIncludesWith;
    isCommon = false;
  } else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = _cacheHas;
    isCommon = false;
    values = new _SetCache(values);
  }

  outer: while (++index < length) {
    var value = array[index],
        computed = iteratee == null ? value : iteratee(value);
    value = comparator || value !== 0 ? value : 0;

    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;

      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }

      result.push(value);
    } else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }

  return result;
}

var _baseDifference = baseDifference;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }

  return array;
}

var _arrayPush = arrayPush;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */


var argsTag = '[object Arguments]';
/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */

function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */


var objectProto$5 = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
/** Built-in value references. */

var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */

var isArguments = _baseIsArguments(function () {
  return arguments;
}()) ? _baseIsArguments : function (value) {
  return isObjectLike_1(value) && hasOwnProperty$4.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};
var isArguments_1 = isArguments;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;
var isArray_1 = isArray;

/** Built-in value references. */


var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;
/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */

function isFlattenable(value) {
  return isArray_1(value) || isArguments_1(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}

var _isFlattenable = isFlattenable;

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */


function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;
  predicate || (predicate = _isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];

    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        _arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }

  return result;
}

var _baseFlatten = baseFlatten;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

var identity_1 = identity;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);

    case 1:
      return func.call(thisArg, args[0]);

    case 2:
      return func.call(thisArg, args[0], args[1]);

    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }

  return func.apply(thisArg, args);
}

var _apply = apply;

/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeMax = Math.max;
/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */

function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }

    index = -1;
    var otherArgs = Array(start + 1);

    while (++index < start) {
      otherArgs[index] = args[index];
    }

    otherArgs[start] = transform(array);
    return _apply(func, this, otherArgs);
  };
}

var _overRest = overRest;

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function () {
    return value;
  };
}

var constant_1 = constant;

var defineProperty = function () {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

var _defineProperty = defineProperty;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var baseSetToString = !_defineProperty ? identity_1 : function (func, string) {
  return _defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant_1(string),
    'writable': true
  });
};
var _baseSetToString = baseSetToString;

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeNow = Date.now;
/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */

function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;

    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }

    return func.apply(undefined, arguments);
  };
}

var _shortOut = shortOut;

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var setToString = _shortOut(_baseSetToString);
var _setToString = setToString;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */


function baseRest(func, start) {
  return _setToString(_overRest(func, start, identity_1), func + '');
}

var _baseRest = baseRest;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;
/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */

function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */


function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */


function isArrayLikeObject(value) {
  return isObjectLike_1(value) && isArrayLike_1(value);
}

var isArrayLikeObject_1 = isArrayLikeObject;

/**
 * Creates an array of `array` values not included in the other given arrays
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons. The order and references of result values are
 * determined by the first array.
 *
 * **Note:** Unlike `_.pullAll`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @see _.without, _.xor
 * @example
 *
 * _.difference([2, 1], [2, 3]);
 * // => [1]
 */


var difference = _baseRest(function (array, values) {
  return isArrayLikeObject_1(array) ? _baseDifference(array, _baseFlatten(values, 1, isArrayLikeObject_1, true)) : [];
});
var difference_1 = difference;

/* Built-in method references that are verified to be native. */


var Set$1 = _getNative(_root, 'Set');
var _Set = Set$1;

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {// No operation performed.
}

var noop_1 = noop;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);
  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */

var createSet = !(_Set && 1 / _setToArray(new _Set([, -0]))[1] == INFINITY) ? noop_1 : function (values) {
  return new _Set(values);
};
var _createSet = createSet;

/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE$1 = 200;
/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */

function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = _arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = _arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE$1) {
    var set = iteratee ? null : _createSet(array);

    if (set) {
      return _setToArray(set);
    }

    isCommon = false;
    includes = _cacheHas;
    seen = new _SetCache();
  } else {
    seen = iteratee ? [] : result;
  }

  outer: while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;
    value = comparator || value !== 0 ? value : 0;

    if (isCommon && computed === computed) {
      var seenIndex = seen.length;

      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }

      if (iteratee) {
        seen.push(computed);
      }

      result.push(value);
    } else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }

      result.push(value);
    }
  }

  return result;
}

var _baseUniq = baseUniq;

/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([2], [1, 2]);
 * // => [2, 1]
 */


var union = _baseRest(function (arrays) {
  return _baseUniq(_baseFlatten(arrays, 1, isArrayLikeObject_1, true));
});
var union_1 = union;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/** Built-in value references. */


var getPrototype = _overArg(Object.getPrototypeOf, Object);
var _getPrototype = getPrototype;

/** `Object#toString` result references. */


var objectTag = '[object Object]';
/** Used for built-in method references. */

var funcProto$2 = Function.prototype,
    objectProto$6 = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString$2 = funcProto$2.toString;
/** Used to check objects for own properties. */

var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
/** Used to infer the `Object` constructor. */

var objectCtorString = funcToString$2.call(Object);
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */

function isPlainObject(value) {
  if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag) {
    return false;
  }

  var proto = _getPrototype(value);

  if (proto === null) {
    return true;
  }

  var Ctor = hasOwnProperty$5.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString;
}

var isPlainObject_1 = isPlainObject;

function symbolObservablePonyfill(root) {
  var result;
  var Symbol = root.Symbol;

  if (typeof Symbol === 'function') {
    if (Symbol.observable) {
      result = Symbol.observable;
    } else {
      result = Symbol('observable');
      Symbol.observable = result;
    }
  } else {
    result = '@@observable';
  }

  return result;
}

/* global window */
var root$1;

if (typeof self !== 'undefined') {
  root$1 = self;
} else if (typeof window !== 'undefined') {
  root$1 = window;
} else if (typeof global !== 'undefined') {
  root$1 = global;
} else if (typeof module !== 'undefined') {
  root$1 = module;
} else {
  root$1 = Function('return this')();
}

var result = symbolObservablePonyfill(root$1);

var instrument_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.INIT_ACTION = exports.ActionCreators = exports.ActionTypes = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

exports.liftAction = liftAction;
exports.liftReducerWith = liftReducerWith;
exports.unliftState = unliftState;
exports.unliftStore = unliftStore;
exports.default = instrument;



var _difference2 = _interopRequireDefault(difference_1);



var _union2 = _interopRequireDefault(union_1);



var _isPlainObject2 = _interopRequireDefault(isPlainObject_1);



var _symbolObservable2 = _interopRequireDefault(result);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

var ActionTypes = exports.ActionTypes = {
  PERFORM_ACTION: 'PERFORM_ACTION',
  RESET: 'RESET',
  ROLLBACK: 'ROLLBACK',
  COMMIT: 'COMMIT',
  SWEEP: 'SWEEP',
  TOGGLE_ACTION: 'TOGGLE_ACTION',
  SET_ACTIONS_ACTIVE: 'SET_ACTIONS_ACTIVE',
  JUMP_TO_STATE: 'JUMP_TO_STATE',
  JUMP_TO_ACTION: 'JUMP_TO_ACTION',
  REORDER_ACTION: 'REORDER_ACTION',
  IMPORT_STATE: 'IMPORT_STATE',
  LOCK_CHANGES: 'LOCK_CHANGES',
  PAUSE_RECORDING: 'PAUSE_RECORDING'
};
var isChrome = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && (typeof window.chrome !== 'undefined' || typeof window.process !== 'undefined' && window.process.type === 'renderer');
var isChromeOrNode = isChrome || typeof process !== 'undefined' && process.release && process.release.name === 'node';
/**
 * Action creators to change the History state.
 */

var ActionCreators = exports.ActionCreators = {
  performAction: function performAction(action, trace, traceLimit, toExcludeFromTrace) {
    if (!(0, _isPlainObject2.default)(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    var stack = void 0;

    if (trace) {
      var extraFrames = 0;

      if (typeof trace === 'function') {
        stack = trace(action);
      } else {
        var error = Error();
        var prevStackTraceLimit = void 0;

        if (Error.captureStackTrace && isChromeOrNode) {
          // avoid error-polyfill
          if (Error.stackTraceLimit < traceLimit) {
            prevStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = traceLimit;
          }

          Error.captureStackTrace(error, toExcludeFromTrace);
        } else {
          extraFrames = 3;
        }

        stack = error.stack;
        if (prevStackTraceLimit) Error.stackTraceLimit = prevStackTraceLimit;

        if (extraFrames || typeof Error.stackTraceLimit !== 'number' || Error.stackTraceLimit > traceLimit) {
          var frames = stack.split('\n');

          if (frames.length > traceLimit) {
            stack = frames.slice(0, traceLimit + extraFrames + (frames[0] === 'Error' ? 1 : 0)).join('\n');
          }
        }
      }
    }

    return {
      type: ActionTypes.PERFORM_ACTION,
      action: action,
      timestamp: Date.now(),
      stack: stack
    };
  },
  reset: function reset() {
    return {
      type: ActionTypes.RESET,
      timestamp: Date.now()
    };
  },
  rollback: function rollback() {
    return {
      type: ActionTypes.ROLLBACK,
      timestamp: Date.now()
    };
  },
  commit: function commit() {
    return {
      type: ActionTypes.COMMIT,
      timestamp: Date.now()
    };
  },
  sweep: function sweep() {
    return {
      type: ActionTypes.SWEEP
    };
  },
  toggleAction: function toggleAction(id) {
    return {
      type: ActionTypes.TOGGLE_ACTION,
      id: id
    };
  },
  setActionsActive: function setActionsActive(start, end) {
    var active = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    return {
      type: ActionTypes.SET_ACTIONS_ACTIVE,
      start: start,
      end: end,
      active: active
    };
  },
  reorderAction: function reorderAction(actionId, beforeActionId) {
    return {
      type: ActionTypes.REORDER_ACTION,
      actionId: actionId,
      beforeActionId: beforeActionId
    };
  },
  jumpToState: function jumpToState(index) {
    return {
      type: ActionTypes.JUMP_TO_STATE,
      index: index
    };
  },
  jumpToAction: function jumpToAction(actionId) {
    return {
      type: ActionTypes.JUMP_TO_ACTION,
      actionId: actionId
    };
  },
  importState: function importState(nextLiftedState, noRecompute) {
    return {
      type: ActionTypes.IMPORT_STATE,
      nextLiftedState: nextLiftedState,
      noRecompute: noRecompute
    };
  },
  lockChanges: function lockChanges(status) {
    return {
      type: ActionTypes.LOCK_CHANGES,
      status: status
    };
  },
  pauseRecording: function pauseRecording(status) {
    return {
      type: ActionTypes.PAUSE_RECORDING,
      status: status
    };
  }
};
var INIT_ACTION = exports.INIT_ACTION = {
  type: '@@INIT'
};
/**
 * Computes the next entry with exceptions catching.
 */

function computeWithTryCatch(reducer, action, state) {
  var nextState = state;
  var nextError = void 0;

  try {
    nextState = reducer(state, action);
  } catch (err) {
    nextError = err.toString();

    if (isChrome) {
      // In Chrome, rethrowing provides better source map support
      setTimeout(function () {
        throw err;
      });
    } else {
      console.error(err);
    }
  }

  return {
    state: nextState,
    error: nextError
  };
}
/**
 * Computes the next entry in the log by applying an action.
 */


function computeNextEntry(reducer, action, state, shouldCatchErrors) {
  if (!shouldCatchErrors) {
    return {
      state: reducer(state, action)
    };
  }

  return computeWithTryCatch(reducer, action, state);
}
/**
 * Runs the reducer on invalidated actions to get a fresh computation log.
 */


function recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, shouldCatchErrors) {
  // Optimization: exit early and return the same reference
  // if we know nothing could have changed.
  if (!computedStates || minInvalidatedStateIndex === -1 || minInvalidatedStateIndex >= computedStates.length && computedStates.length === stagedActionIds.length) {
    return computedStates;
  }

  var nextComputedStates = computedStates.slice(0, minInvalidatedStateIndex);

  for (var i = minInvalidatedStateIndex; i < stagedActionIds.length; i++) {
    var actionId = stagedActionIds[i];
    var action = actionsById[actionId].action;
    var previousEntry = nextComputedStates[i - 1];
    var previousState = previousEntry ? previousEntry.state : committedState;
    var shouldSkip = skippedActionIds.indexOf(actionId) > -1;
    var entry = void 0;

    if (shouldSkip) {
      entry = previousEntry;
    } else {
      if (shouldCatchErrors && previousEntry && previousEntry.error) {
        entry = {
          state: previousState,
          error: 'Interrupted by an error up the chain'
        };
      } else {
        entry = computeNextEntry(reducer, action, previousState, shouldCatchErrors);
      }
    }

    nextComputedStates.push(entry);
  }

  return nextComputedStates;
}
/**
 * Lifts an app's action into an action on the lifted store.
 */


function liftAction(action, trace, traceLimit, toExcludeFromTrace) {
  return ActionCreators.performAction(action, trace, traceLimit, toExcludeFromTrace);
}
/**
 * Creates a history state reducer from an app's reducer.
 */


function liftReducerWith(reducer, initialCommittedState, monitorReducer, options) {
  var initialLiftedState = {
    monitorState: monitorReducer(undefined, {}),
    nextActionId: 1,
    actionsById: {
      0: liftAction(INIT_ACTION)
    },
    stagedActionIds: [0],
    skippedActionIds: [],
    committedState: initialCommittedState,
    currentStateIndex: 0,
    computedStates: [],
    isLocked: options.shouldStartLocked === true,
    isPaused: options.shouldRecordChanges === false
  };
  /**
   * Manages how the history actions modify the history state.
   */

  return function (liftedState, liftedAction) {
    var _ref = liftedState || initialLiftedState,
        monitorState = _ref.monitorState,
        actionsById = _ref.actionsById,
        nextActionId = _ref.nextActionId,
        stagedActionIds = _ref.stagedActionIds,
        skippedActionIds = _ref.skippedActionIds,
        committedState = _ref.committedState,
        currentStateIndex = _ref.currentStateIndex,
        computedStates = _ref.computedStates,
        isLocked = _ref.isLocked,
        isPaused = _ref.isPaused;

    if (!liftedState) {
      // Prevent mutating initialLiftedState
      actionsById = _extends({}, actionsById);
    }

    function commitExcessActions(n) {
      // Auto-commits n-number of excess actions.
      var excess = n;
      var idsToDelete = stagedActionIds.slice(1, excess + 1);

      for (var i = 0; i < idsToDelete.length; i++) {
        if (computedStates[i + 1].error) {
          // Stop if error is found. Commit actions up to error.
          excess = i;
          idsToDelete = stagedActionIds.slice(1, excess + 1);
          break;
        } else {
          delete actionsById[idsToDelete[i]];
        }
      }

      skippedActionIds = skippedActionIds.filter(function (id) {
        return idsToDelete.indexOf(id) === -1;
      });
      stagedActionIds = [0].concat(stagedActionIds.slice(excess + 1));
      committedState = computedStates[excess].state;
      computedStates = computedStates.slice(excess);
      currentStateIndex = currentStateIndex > excess ? currentStateIndex - excess : 0;
    }

    function computePausedAction(shouldInit) {
      var _extends2;

      var computedState = void 0;

      if (shouldInit) {
        computedState = computedStates[currentStateIndex];
        monitorState = monitorReducer(monitorState, liftedAction);
      } else {
        computedState = computeNextEntry(reducer, liftedAction.action, computedStates[currentStateIndex].state, false);
      }

      if (!options.pauseActionType || nextActionId === 1) {
        return {
          monitorState: monitorState,
          actionsById: {
            0: liftAction(INIT_ACTION)
          },
          nextActionId: 1,
          stagedActionIds: [0],
          skippedActionIds: [],
          committedState: computedState.state,
          currentStateIndex: 0,
          computedStates: [computedState],
          isLocked: isLocked,
          isPaused: true
        };
      }

      if (shouldInit) {
        if (currentStateIndex === stagedActionIds.length - 1) {
          currentStateIndex++;
        }

        stagedActionIds = [].concat(stagedActionIds, [nextActionId]);
        nextActionId++;
      }

      return {
        monitorState: monitorState,
        actionsById: _extends({}, actionsById, (_extends2 = {}, _extends2[nextActionId - 1] = liftAction({
          type: options.pauseActionType
        }), _extends2)),
        nextActionId: nextActionId,
        stagedActionIds: stagedActionIds,
        skippedActionIds: skippedActionIds,
        committedState: committedState,
        currentStateIndex: currentStateIndex,
        computedStates: [].concat(computedStates.slice(0, stagedActionIds.length - 1), [computedState]),
        isLocked: isLocked,
        isPaused: true
      };
    } // By default, agressively recompute every state whatever happens.
    // This has O(n) performance, so we'll override this to a sensible
    // value whenever we feel like we don't have to recompute the states.


    var minInvalidatedStateIndex = 0; // maxAge number can be changed dynamically

    var maxAge = options.maxAge;
    if (typeof maxAge === 'function') maxAge = maxAge(liftedAction, liftedState);

    if (/^@@redux\/(INIT|REPLACE)/.test(liftedAction.type)) {
      if (options.shouldHotReload === false) {
        actionsById = {
          0: liftAction(INIT_ACTION)
        };
        nextActionId = 1;
        stagedActionIds = [0];
        skippedActionIds = [];
        committedState = computedStates.length === 0 ? initialCommittedState : computedStates[currentStateIndex].state;
        currentStateIndex = 0;
        computedStates = [];
      } // Recompute states on hot reload and init.


      minInvalidatedStateIndex = 0;

      if (maxAge && stagedActionIds.length > maxAge) {
        // States must be recomputed before committing excess.
        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, options.shouldCatchErrors);
        commitExcessActions(stagedActionIds.length - maxAge); // Avoid double computation.

        minInvalidatedStateIndex = Infinity;
      }
    } else {
      switch (liftedAction.type) {
        case ActionTypes.PERFORM_ACTION:
          {
            if (isLocked) return liftedState || initialLiftedState;
            if (isPaused) return computePausedAction(); // Auto-commit as new actions come in.

            if (maxAge && stagedActionIds.length >= maxAge) {
              commitExcessActions(stagedActionIds.length - maxAge + 1);
            }

            if (currentStateIndex === stagedActionIds.length - 1) {
              currentStateIndex++;
            }

            var actionId = nextActionId++; // Mutation! This is the hottest path, and we optimize on purpose.
            // It is safe because we set a new key in a cache dictionary.

            actionsById[actionId] = liftedAction;
            stagedActionIds = [].concat(stagedActionIds, [actionId]); // Optimization: we know that only the new action needs computing.

            minInvalidatedStateIndex = stagedActionIds.length - 1;
            break;
          }

        case ActionTypes.RESET:
          {
            // Get back to the state the store was created with.
            actionsById = {
              0: liftAction(INIT_ACTION)
            };
            nextActionId = 1;
            stagedActionIds = [0];
            skippedActionIds = [];
            committedState = initialCommittedState;
            currentStateIndex = 0;
            computedStates = [];
            break;
          }

        case ActionTypes.COMMIT:
          {
            // Consider the last committed state the new starting point.
            // Squash any staged actions into a single committed state.
            actionsById = {
              0: liftAction(INIT_ACTION)
            };
            nextActionId = 1;
            stagedActionIds = [0];
            skippedActionIds = [];
            committedState = computedStates[currentStateIndex].state;
            currentStateIndex = 0;
            computedStates = [];
            break;
          }

        case ActionTypes.ROLLBACK:
          {
            // Forget about any staged actions.
            // Start again from the last committed state.
            actionsById = {
              0: liftAction(INIT_ACTION)
            };
            nextActionId = 1;
            stagedActionIds = [0];
            skippedActionIds = [];
            currentStateIndex = 0;
            computedStates = [];
            break;
          }

        case ActionTypes.TOGGLE_ACTION:
          {
            // Toggle whether an action with given ID is skipped.
            // Being skipped means it is a no-op during the computation.
            var _actionId = liftedAction.id;
            var index = skippedActionIds.indexOf(_actionId);

            if (index === -1) {
              skippedActionIds = [_actionId].concat(skippedActionIds);
            } else {
              skippedActionIds = skippedActionIds.filter(function (id) {
                return id !== _actionId;
              });
            } // Optimization: we know history before this action hasn't changed


            minInvalidatedStateIndex = stagedActionIds.indexOf(_actionId);
            break;
          }

        case ActionTypes.SET_ACTIONS_ACTIVE:
          {
            // Toggle whether an action with given ID is skipped.
            // Being skipped means it is a no-op during the computation.
            var start = liftedAction.start,
                end = liftedAction.end,
                active = liftedAction.active;
            var actionIds = [];

            for (var i = start; i < end; i++) {
              actionIds.push(i);
            }

            if (active) {
              skippedActionIds = (0, _difference2.default)(skippedActionIds, actionIds);
            } else {
              skippedActionIds = (0, _union2.default)(skippedActionIds, actionIds);
            } // Optimization: we know history before this action hasn't changed


            minInvalidatedStateIndex = stagedActionIds.indexOf(start);
            break;
          }

        case ActionTypes.JUMP_TO_STATE:
          {
            // Without recomputing anything, move the pointer that tell us
            // which state is considered the current one. Useful for sliders.
            currentStateIndex = liftedAction.index; // Optimization: we know the history has not changed.

            minInvalidatedStateIndex = Infinity;
            break;
          }

        case ActionTypes.JUMP_TO_ACTION:
          {
            // Jumps to a corresponding state to a specific action.
            // Useful when filtering actions.
            var _index = stagedActionIds.indexOf(liftedAction.actionId);

            if (_index !== -1) currentStateIndex = _index;
            minInvalidatedStateIndex = Infinity;
            break;
          }

        case ActionTypes.SWEEP:
          {
            // Forget any actions that are currently being skipped.
            stagedActionIds = (0, _difference2.default)(stagedActionIds, skippedActionIds);
            skippedActionIds = [];
            currentStateIndex = Math.min(currentStateIndex, stagedActionIds.length - 1);
            break;
          }

        case ActionTypes.REORDER_ACTION:
          {
            // Recompute actions in a new order.
            var _actionId2 = liftedAction.actionId;
            var idx = stagedActionIds.indexOf(_actionId2); // do nothing in case the action is already removed or trying to move the first action

            if (idx < 1) break;
            var beforeActionId = liftedAction.beforeActionId;
            var newIdx = stagedActionIds.indexOf(beforeActionId);

            if (newIdx < 1) {
              // move to the beginning or to the end
              var count = stagedActionIds.length;
              newIdx = beforeActionId > stagedActionIds[count - 1] ? count : 1;
            }

            var diff = idx - newIdx;

            if (diff > 0) {
              // move left
              stagedActionIds = [].concat(stagedActionIds.slice(0, newIdx), [_actionId2], stagedActionIds.slice(newIdx, idx), stagedActionIds.slice(idx + 1));
              minInvalidatedStateIndex = newIdx;
            } else if (diff < 0) {
              // move right
              stagedActionIds = [].concat(stagedActionIds.slice(0, idx), stagedActionIds.slice(idx + 1, newIdx), [_actionId2], stagedActionIds.slice(newIdx));
              minInvalidatedStateIndex = idx;
            }

            break;
          }

        case ActionTypes.IMPORT_STATE:
          {
            if (Array.isArray(liftedAction.nextLiftedState)) {
              // recompute array of actions
              actionsById = {
                0: liftAction(INIT_ACTION)
              };
              nextActionId = 1;
              stagedActionIds = [0];
              skippedActionIds = [];
              currentStateIndex = liftedAction.nextLiftedState.length;
              computedStates = [];
              committedState = liftedAction.preloadedState;
              minInvalidatedStateIndex = 0; // iterate through actions

              liftedAction.nextLiftedState.forEach(function (action) {
                actionsById[nextActionId] = liftAction(action, options.trace || options.shouldIncludeCallstack);
                stagedActionIds.push(nextActionId);
                nextActionId++;
              });
            } else {
              var _liftedAction$nextLif = liftedAction.nextLiftedState; // Completely replace everything.

              monitorState = _liftedAction$nextLif.monitorState;
              actionsById = _liftedAction$nextLif.actionsById;
              nextActionId = _liftedAction$nextLif.nextActionId;
              stagedActionIds = _liftedAction$nextLif.stagedActionIds;
              skippedActionIds = _liftedAction$nextLif.skippedActionIds;
              committedState = _liftedAction$nextLif.committedState;
              currentStateIndex = _liftedAction$nextLif.currentStateIndex;
              computedStates = _liftedAction$nextLif.computedStates;

              if (liftedAction.noRecompute) {
                minInvalidatedStateIndex = Infinity;
              }
            }

            break;
          }

        case ActionTypes.LOCK_CHANGES:
          {
            isLocked = liftedAction.status;
            minInvalidatedStateIndex = Infinity;
            break;
          }

        case ActionTypes.PAUSE_RECORDING:
          {
            isPaused = liftedAction.status;

            if (isPaused) {
              return computePausedAction(true);
            } // Commit when unpausing


            actionsById = {
              0: liftAction(INIT_ACTION)
            };
            nextActionId = 1;
            stagedActionIds = [0];
            skippedActionIds = [];
            committedState = computedStates[currentStateIndex].state;
            currentStateIndex = 0;
            computedStates = [];
            break;
          }

        default:
          {
            // If the action is not recognized, it's a monitor action.
            // Optimization: a monitor action can't change history.
            minInvalidatedStateIndex = Infinity;
            break;
          }
      }
    }

    computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, options.shouldCatchErrors);
    monitorState = monitorReducer(monitorState, liftedAction);
    return {
      monitorState: monitorState,
      actionsById: actionsById,
      nextActionId: nextActionId,
      stagedActionIds: stagedActionIds,
      skippedActionIds: skippedActionIds,
      committedState: committedState,
      currentStateIndex: currentStateIndex,
      computedStates: computedStates,
      isLocked: isLocked,
      isPaused: isPaused
    };
  };
}
/**
 * Provides an app's view into the state of the lifted store.
 */


function unliftState(liftedState) {
  var computedStates = liftedState.computedStates,
      currentStateIndex = liftedState.currentStateIndex;
  var state = computedStates[currentStateIndex].state;
  return state;
}
/**
 * Provides an app's view into the lifted store.
 */


function unliftStore(liftedStore, liftReducer, options) {
  var _extends3;

  var lastDefinedState = void 0;
  var trace = options.trace || options.shouldIncludeCallstack;
  var traceLimit = options.traceLimit || 10;

  function getState() {
    var state = unliftState(liftedStore.getState());

    if (state !== undefined) {
      lastDefinedState = state;
    }

    return lastDefinedState;
  }

  function dispatch(action) {
    liftedStore.dispatch(liftAction(action, trace, traceLimit, dispatch));
    return action;
  }

  return _extends({}, liftedStore, (_extends3 = {
    liftedStore: liftedStore,
    dispatch: dispatch,
    getState: getState,
    replaceReducer: function replaceReducer(nextReducer) {
      liftedStore.replaceReducer(liftReducer(nextReducer));
    }
  }, _extends3[_symbolObservable2.default] = function () {
    return _extends({}, liftedStore[_symbolObservable2.default](), {
      subscribe: function subscribe(observer) {
        if ((typeof observer === 'undefined' ? 'undefined' : _typeof(observer)) !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = liftedStore.subscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    });
  }, _extends3));
}
/**
 * Redux instrumentation store enhancer.
 */


function instrument() {
  var monitorReducer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
    return null;
  };
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof options.maxAge === 'number' && options.maxAge < 2) {
    throw new Error('DevTools.instrument({ maxAge }) option, if specified, ' + 'may not be less than 2.');
  }

  return function (createStore) {
    return function (reducer, initialState, enhancer) {
      function liftReducer(r) {
        if (typeof r !== 'function') {
          if (r && typeof r.default === 'function') {
            throw new Error('Expected the reducer to be a function. ' + 'Instead got an object with a "default" field. ' + 'Did you pass a module instead of the default export? ' + 'Try passing require(...).default instead.');
          }

          throw new Error('Expected the reducer to be a function.');
        }

        return liftReducerWith(r, initialState, monitorReducer, options);
      }

      var liftedStore = createStore(liftReducer(reducer), enhancer);

      if (liftedStore.liftedStore) {
        throw new Error('DevTools instrumentation should not be applied more than once. ' + 'Check your store configuration.');
      }

      return unliftStore(liftedStore, liftReducer, options);
    };
  };
}
});

unwrapExports(instrument_1);
var instrument_2 = instrument_1.INIT_ACTION;
var instrument_3 = instrument_1.ActionCreators;
var instrument_4 = instrument_1.ActionTypes;
var instrument_5 = instrument_1.liftAction;
var instrument_6 = instrument_1.liftReducerWith;
var instrument_7 = instrument_1.unliftState;
var instrument_8 = instrument_1.unliftStore;

var configureStore_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.default = configureStore;



var _reduxDevtoolsInstrument2 = _interopRequireDefault(instrument_1);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function configureStore(next, subscriber, options) {
  return (0, _reduxDevtoolsInstrument2.default)(subscriber, options)(next);
}
});

unwrapExports(configureStore_1);

var constants = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
var defaultSocketOptions = exports.defaultSocketOptions = {
  secure: true,
  hostname: 'remotedev.io',
  port: 443,
  autoReconnect: true,
  autoReconnectOptions: {
    randomness: 30000
  }
};
});

unwrapExports(constants);
var constants_1 = constants.defaultSocketOptions;

var _rnHostDetect = (() => 'localhost');

var getParams = createCommonjsModule(function (module) {
/* global window */
var GetParams = function (func) {

  if (typeof func !== 'function') {
    return [];
  }

  var patternComments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var patternArguments = /([^\s,]+)/g;
  var funcString = func.toString().replace(patternComments, '');
  var result = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).match(patternArguments);

  if (result === null) {
    return [];
  }

  return result;
};

{
  module.exports = GetParams;
}

if (typeof window !== 'undefined') {
  window.GetParams = GetParams;
}
});

// This alphabet uses a-z A-Z 0-9 _- symbols.
// Symbols are generated for smaller size.
// -_zyxwvutsrqponmlkjihgfedcba9876543210ZYXWVUTSRQPONMLKJIHGFEDCBA
var url = '-_'; // Loop from 36 to 0 (from z to a and 9 to 0 in Base36).

var i = 36;

while (i--) {
  // 36 is radix. Number.prototype.toString(36) returns number
  // in Base36 representation. Base36 is like hex, but it uses 0–9 and a-z.
  url += i.toString(36);
} // Loop from 36 to 10 (from Z to A in Base36).


i = 36;

while (i-- - 10) {
  url += i.toString(36).toUpperCase();
}
/**
 * Generate URL-friendly unique ID. This method use non-secure predictable
 * random generator with bigger collision probability.
 *
 * @param {number} [size=21] The number of symbols in ID.
 *
 * @return {string} Random string.
 *
 * @example
 * const nanoid = require('nanoid/non-secure')
 * model.id = nanoid() //=> "Uakgb_J5m9g-0JDMbcJqL"
 *
 * @name nonSecure
 * @function
 */


var nonSecure = function (size) {
  var id = '';
  i = size || 21; // Compact alternative for `for (var i = 0; i < size; i++)`

  while (i--) {
    // `| 0` is compact and faster alternative for `Math.floor()`
    id += url[Math.random() * 64 | 0];
  }

  return id;
};

function mark(data, type, transformMethod) {
  return {
    data: transformMethod ? data[transformMethod]() : data,
    __serializedType__: type
  };
}

function extract(data, type) {
  return {
    data: Object.assign({}, data),
    __serializedType__: type
  };
}

function refer(data, type, isArray, refs) {
  var r = mark(data, type, isArray);
  if (!refs) return r;

  for (var i = 0; i < refs.length; i++) {
    var ref = refs[i];

    if (typeof ref === 'function' && data instanceof ref) {
      r.__serializedRef__ = i;
      return r;
    }
  }

  return r;
}

var helpers = {
  mark: mark,
  extract: extract,
  refer: refer
};

// jsan stringify options
var options = {
  'refs': false,
  // references can't be resolved on the original Immutable structure
  'date': true,
  'function': true,
  'regex': true,
  'undefined': true,
  'error': true,
  'symbol': true,
  'map': true,
  'set': true,
  'nan': true,
  'infinity': true
};

var mark$1 = helpers.mark;
var extract$1 = helpers.extract;
var refer$1 = helpers.refer;



var serialize = function serialize(Immutable, refs, customReplacer, customReviver) {
  function replacer(key, value) {
    if (value instanceof Immutable.Record) return refer$1(value, 'ImmutableRecord', 'toObject', refs);
    if (value instanceof Immutable.Range) return extract$1(value, 'ImmutableRange');
    if (value instanceof Immutable.Repeat) return extract$1(value, 'ImmutableRepeat');
    if (Immutable.OrderedMap.isOrderedMap(value)) return mark$1(value, 'ImmutableOrderedMap', 'toObject');
    if (Immutable.Map.isMap(value)) return mark$1(value, 'ImmutableMap', 'toObject');
    if (Immutable.List.isList(value)) return mark$1(value, 'ImmutableList', 'toArray');
    if (Immutable.OrderedSet.isOrderedSet(value)) return mark$1(value, 'ImmutableOrderedSet', 'toArray');
    if (Immutable.Set.isSet(value)) return mark$1(value, 'ImmutableSet', 'toArray');
    if (Immutable.Seq.isSeq(value)) return mark$1(value, 'ImmutableSeq', 'toArray');
    if (Immutable.Stack.isStack(value)) return mark$1(value, 'ImmutableStack', 'toArray');
    return value;
  }

  function reviver(key, value) {
    if (typeof value === 'object' && value !== null && '__serializedType__' in value) {
      var data = value.data;

      switch (value.__serializedType__) {
        case 'ImmutableMap':
          return Immutable.Map(data);

        case 'ImmutableOrderedMap':
          return Immutable.OrderedMap(data);

        case 'ImmutableList':
          return Immutable.List(data);

        case 'ImmutableRange':
          return Immutable.Range(data._start, data._end, data._step);

        case 'ImmutableRepeat':
          return Immutable.Repeat(data._value, data.size);

        case 'ImmutableSet':
          return Immutable.Set(data);

        case 'ImmutableOrderedSet':
          return Immutable.OrderedSet(data);

        case 'ImmutableSeq':
          return Immutable.Seq(data);

        case 'ImmutableStack':
          return Immutable.Stack(data);

        case 'ImmutableRecord':
          return refs && refs[value.__serializedRef__] ? new refs[value.__serializedRef__](data) : Immutable.Map(data);

        default:
          return data;
      }
    }

    return value;
  }

  return {
    replacer: customReplacer ? function (key, value) {
      return customReplacer(key, value, replacer);
    } : replacer,
    reviver: customReviver ? function (key, value) {
      return customReviver(key, value, reviver);
    } : reviver,
    options: options
  };
};

var utils$1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

exports.generateId = generateId;
exports.getMethods = getMethods;
exports.getActionsArray = getActionsArray;
exports.evalAction = evalAction;
exports.evalMethod = evalMethod;
exports.stringify = stringify;
exports.getSeralizeParameter = getSeralizeParameter;
exports.getStackTrace = getStackTrace;



var _getParams2 = _interopRequireDefault(getParams);



var _jsan2 = _interopRequireDefault(jsan);



var _nonSecure2 = _interopRequireDefault(nonSecure);



var _serialize2 = _interopRequireDefault(serialize);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function generateId(id) {
  return id || (0, _nonSecure2.default)(7);
}

function flatTree(obj) {
  var namespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var functions = [];
  Object.keys(obj).forEach(function (key) {
    var prop = obj[key];

    if (typeof prop === 'function') {
      functions.push({
        name: namespace + (key || prop.name || 'anonymous'),
        func: prop,
        args: (0, _getParams2.default)(prop)
      });
    } else if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object') {
      functions = functions.concat(flatTree(prop, namespace + key + '.'));
    }
  });
  return functions;
}

function getMethods(obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return undefined;
  var functions = void 0;
  var m = void 0;
  if (obj.__proto__) m = obj.__proto__.__proto__;
  if (!m) m = obj;
  Object.getOwnPropertyNames(m).forEach(function (key) {
    var propDescriptor = Object.getOwnPropertyDescriptor(m, key);
    if (!propDescriptor || 'get' in propDescriptor || 'set' in propDescriptor) return;
    var prop = m[key];

    if (typeof prop === 'function' && key !== 'constructor') {
      if (!functions) functions = [];
      functions.push({
        name: key || prop.name || 'anonymous',
        args: (0, _getParams2.default)(prop)
      });
    }
  });
  return functions;
}

function getActionsArray(actionCreators) {
  if (Array.isArray(actionCreators)) return actionCreators;
  return flatTree(actionCreators);
}
/* eslint-disable no-new-func */


var interpretArg = function interpretArg(arg) {
  return new Function('return ' + arg)();
};

function evalArgs(inArgs, restArgs) {
  var args = inArgs.map(interpretArg);
  if (!restArgs) return args;
  var rest = interpretArg(restArgs);
  if (Array.isArray(rest)) return args.concat.apply(args, rest);
  throw new Error('rest must be an array');
}

function evalAction(action, actionCreators) {
  if (typeof action === 'string') {
    return new Function('return ' + action)();
  }

  var actionCreator = actionCreators[action.selected].func;
  var args = evalArgs(action.args, action.rest);
  return actionCreator.apply(undefined, args);
}

function evalMethod(action, obj) {
  if (typeof action === 'string') {
    return new Function('return ' + action).call(obj);
  }

  var args = evalArgs(action.args, action.rest);
  return new Function('args', 'return this.' + action.name + '(args)').apply(obj, args);
}
/* eslint-enable */


function tryCatchStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    /* eslint-disable no-console */
    console.log('Failed to stringify', err);
    /* eslint-enable no-console */

    return _jsan2.default.stringify(obj, null, null, {
      circular: '[CIRCULAR]'
    });
  }
}

function stringify(obj, serialize) {
  if (typeof serialize === 'undefined') {
    return tryCatchStringify(obj);
  }

  if (serialize === true) {
    return _jsan2.default.stringify(obj, function (key, value) {
      if (value && typeof value.toJS === 'function') return value.toJS();
      return value;
    }, null, true);
  }

  return _jsan2.default.stringify(obj, serialize.replacer, null, serialize.options);
}

function getSeralizeParameter(config, param) {
  var serialize = config.serialize;

  if (serialize) {
    if (serialize === true) return {
      options: true
    };

    if (serialize.immutable) {
      return {
        replacer: (0, _serialize2.default)(serialize.immutable, serialize.refs).replacer,
        options: serialize.options || true
      };
    }

    if (!serialize.replacer) return {
      options: serialize.options
    };
    return {
      replacer: serialize.replacer,
      options: serialize.options || true
    };
  }

  var value = config[param];
  if (typeof value === 'undefined') return undefined;
  console.warn('`' + param + '` parameter for Redux DevTools Extension is deprecated. Use `serialize` parameter instead: https://github.com/zalmoxisus/redux-devtools-extension/releases/tag/v2.12.1'); // eslint-disable-line

  if (typeof serializeState === 'boolean') return {
    options: value
  };
  if (typeof serializeState === 'function') return {
    replacer: value
  };
  return value;
}

function getStackTrace(config, toExcludeFromTrace) {
  if (!config.trace) return undefined;
  if (typeof config.trace === 'function') return config.trace();
  var stack = void 0;
  var extraFrames = 0;
  var prevStackTraceLimit = void 0;
  var traceLimit = config.traceLimit;
  var error = Error();

  if (Error.captureStackTrace) {
    if (Error.stackTraceLimit < traceLimit) {
      prevStackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = traceLimit;
    }

    Error.captureStackTrace(error, toExcludeFromTrace);
  } else {
    extraFrames = 3;
  }

  stack = error.stack;
  if (prevStackTraceLimit) Error.stackTraceLimit = prevStackTraceLimit;

  if (extraFrames || typeof Error.stackTraceLimit !== 'number' || Error.stackTraceLimit > traceLimit) {
    var frames = stack.split('\n');

    if (frames.length > traceLimit) {
      stack = frames.slice(0, traceLimit + extraFrames + (frames[0] === 'Error' ? 1 : 0)).join('\n');
    }
  }

  return stack;
}
});

unwrapExports(utils$1);
var utils_1 = utils$1.generateId;
var utils_2 = utils$1.getMethods;
var utils_3 = utils$1.getActionsArray;
var utils_4 = utils$1.evalAction;
var utils_5 = utils$1.evalMethod;
var utils_6 = utils$1.stringify;
var utils_7 = utils$1.getSeralizeParameter;
var utils_8 = utils$1.getStackTrace;

var catchErrors_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

exports.default = catchErrors;
var ERROR = '@@remotedev/ERROR';

function catchErrors(sendError) {
  if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && _typeof(window.onerror) === 'object') {
    window.onerror = function (message, url, lineNo, columnNo, error) {
      var errorAction = {
        type: ERROR,
        message: message,
        url: url,
        lineNo: lineNo,
        columnNo: columnNo
      };
      if (error && error.stack) errorAction.stack = error.stack;
      sendError(errorAction);
      return false;
    };
  } else if (typeof commonjsGlobal !== 'undefined' && commonjsGlobal.ErrorUtils) {
    commonjsGlobal.ErrorUtils.setGlobalHandler(function (error, isFatal) {
      sendError({
        type: ERROR,
        error: error,
        isFatal: isFatal
      });
    });
  }

  if ((typeof console === 'undefined' ? 'undefined' : _typeof(console)) === 'object' && typeof console.error === 'function' && !console.beforeRemotedev) {
    console.beforeRemotedev = console.error.bind(console);

    console.error = function () {
      var errorAction = {
        type: ERROR
      };
      var error = arguments[0];
      errorAction.message = error.message ? error.message : error;

      if (error.sourceURL) {
        errorAction = _extends({}, errorAction, {
          sourceURL: error.sourceURL,
          line: error.line,
          column: error.column
        });
      }

      if (error.stack) errorAction.stack = error.stack;
      sendError(errorAction);
      console.beforeRemotedev.apply(null, arguments);
    };
  }
}
});

unwrapExports(catchErrors_1);

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty) {
    _defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];

      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }

    return object;
  };
}

var _createBaseFor = createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */


var baseFor = _createBaseFor();
var _baseFor = baseFor;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}

var _baseTimes = baseTimes;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */


var freeExports =  exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Built-in value references. */

var Buffer = moduleExports ? _root.Buffer : undefined;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */

var isBuffer = nativeIsBuffer || stubFalse_1;
module.exports = isBuffer;
});

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;
/** Used to detect unsigned integer values. */

var reIsUint = /^(?:0|[1-9]\d*)$/;
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */

function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

var _isIndex = isIndex;

/** `Object#toString` result references. */


var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag$1 = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/** Used to identify `toStringTag` values of typed arrays. */

var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */

function baseIsTypedArray(value) {
  return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */


var freeExports =  exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Detect free variable `process` from Node.js. */

var freeProcess = moduleExports && _freeGlobal.process;
/** Used to access faster Node.js helpers. */

var nodeUtil = function () {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    } // Legacy `process.binding('util')` for Node.js < 10.


    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

module.exports = nodeUtil;
});

/* Node.js helper references. */


var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;
/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */

var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
var isTypedArray_1 = isTypedArray;

/** Used for built-in method references. */


var objectProto$7 = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */

function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$6.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
    key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
    _isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;
/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */

function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$8;
  return value === proto;
}

var _isPrototype = isPrototype;

/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeKeys = _overArg(Object.keys, Object);
var _nativeKeys = nativeKeys;

/** Used for built-in method references. */


var objectProto$9 = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }

  var result = [];

  for (var key in Object(object)) {
    if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }

  return result;
}

var _baseKeys = baseKeys;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */


function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */


function baseForOwn(object, iteratee) {
  return object && _baseFor(object, iteratee, keys_1);
}

var _baseForOwn = baseForOwn;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */


function stackClear() {
  this.__data__ = new _ListCache();
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE$2 = 200;
/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */

function stackSet(key, value) {
  var data = this.__data__;

  if (data instanceof _ListCache) {
    var pairs = data.__data__;

    if (!_Map || pairs.length < LARGE_ARRAY_SIZE$2 - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }

    data = this.__data__ = new _MapCache(pairs);
  }

  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
} // Add methods to `Stack`.


Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;
var _Stack = Stack;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }

  return false;
}

var _arraySome = arraySome;

/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */

function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  } // Assume cyclic values are equal.


  var stacked = stack.get(array);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache() : undefined;
  stack.set(array, other);
  stack.set(other, array); // Ignore non-index properties.

  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }

    if (compared !== undefined) {
      if (compared) {
        continue;
      }

      result = false;
      break;
    } // Recursively compare arrays (susceptible to call stack limits).


    if (seen) {
      if (!_arraySome(other, function (othValue, othIndex) {
        if (!_cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }

  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var _equalArrays = equalArrays;

/** Built-in value references. */


var Uint8Array$1 = _root.Uint8Array;
var _Uint8Array = Uint8Array$1;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);
  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;
/** `Object#toString` result references. */

var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    mapTag$1 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]';
var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]';
/** Used to convert symbols to primitives and strings. */

var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$1:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }

      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag$1:
      if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
        return false;
      }

      return true;

    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq_1(+object, +other);

    case errorTag$1:
      return object.name == other.name && object.message == other.message;

    case regexpTag$1:
    case stringTag$1:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case mapTag$1:
      var convert = _mapToArray;

    case setTag$1:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
      convert || (convert = _setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      } // Assume cyclic values are equal.


      var stacked = stack.get(object);

      if (stacked) {
        return stacked == other;
      }

      bitmask |= COMPARE_UNORDERED_FLAG$1; // Recursively compare objects (susceptible to call stack limits).

      stack.set(object, other);
      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }

  }

  return false;
}

var _equalByTag = equalByTag;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */


function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }

  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */


var objectProto$a = Object.prototype;
/** Built-in value references. */

var propertyIsEnumerable$1 = objectProto$a.propertyIsEnumerable;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeGetSymbols = Object.getOwnPropertySymbols;
/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */

var getSymbols = !nativeGetSymbols ? stubArray_1 : function (object) {
  if (object == null) {
    return [];
  }

  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function (symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};
var _getSymbols = getSymbols;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */


function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG$2 = 1;
/** Used for built-in method references. */

var objectProto$b = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      objProps = _getAllKeys(object),
      objLength = objProps.length,
      othProps = _getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }

  var index = objLength;

  while (index--) {
    var key = objProps[index];

    if (!(isPartial ? key in other : hasOwnProperty$8.call(other, key))) {
      return false;
    }
  } // Assume cyclic values are equal.


  var stacked = stack.get(object);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;

  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    } // Recursively compare objects (susceptible to call stack limits).


    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }

    skipCtor || (skipCtor = key == 'constructor');
  }

  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }

  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var _equalObjects = equalObjects;

/* Built-in method references that are verified to be native. */


var DataView = _getNative(_root, 'DataView');
var _DataView = DataView;

/* Built-in method references that are verified to be native. */


var Promise$1 = _getNative(_root, 'Promise');
var _Promise = Promise$1;

/* Built-in method references that are verified to be native. */


var WeakMap$1 = _getNative(_root, 'WeakMap');
var _WeakMap = WeakMap$1;

/** `Object#toString` result references. */


var mapTag$2 = '[object Map]',
    objectTag$2 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$2 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';
var dataViewTag$2 = '[object DataView]';
/** Used to detect maps, sets, and weakmaps. */

var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);
/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

var getTag = _baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

if (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2 || _Map && getTag(new _Map()) != mapTag$2 || _Promise && getTag(_Promise.resolve()) != promiseTag || _Set && getTag(new _Set()) != setTag$2 || _WeakMap && getTag(new _WeakMap()) != weakMapTag$1) {
  getTag = function (value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag$2 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$2;

        case mapCtorString:
          return mapTag$2;

        case promiseCtorString:
          return promiseTag;

        case setCtorString:
          return setTag$2;

        case weakMapCtorString:
          return weakMapTag$1;
      }
    }

    return result;
  };
}

var _getTag = getTag;

/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG$3 = 1;
/** `Object#toString` result references. */

var argsTag$2 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    objectTag$3 = '[object Object]';
/** Used for built-in method references. */

var objectProto$c = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty$9 = objectProto$c.hasOwnProperty;
/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_1(object),
      othIsArr = isArray_1(other),
      objTag = objIsArr ? arrayTag$1 : _getTag(object),
      othTag = othIsArr ? arrayTag$1 : _getTag(other);
  objTag = objTag == argsTag$2 ? objectTag$3 : objTag;
  othTag = othTag == argsTag$2 ? objectTag$3 : othTag;
  var objIsObj = objTag == objectTag$3,
      othIsObj = othTag == objectTag$3,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer_1(object)) {
    if (!isBuffer_1(other)) {
      return false;
    }

    objIsArr = true;
    objIsObj = false;
  }

  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack());
    return objIsArr || isTypedArray_1(object) ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }

  if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
    var objIsWrapped = objIsObj && hasOwnProperty$9.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$9.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new _Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }

  if (!isSameTag) {
    return false;
  }

  stack || (stack = new _Stack());
  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep;

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */


function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }

  if (value == null || other == null || !isObjectLike_1(value) && !isObjectLike_1(other)) {
    return value !== value && other !== other;
  }

  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

var _baseIsEqual = baseIsEqual;

/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;
/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */

function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }

  object = Object(object);

  while (index--) {
    var data = matchData[index];

    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }

  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack();

      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }

      if (!(result === undefined ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack) : result)) {
        return false;
      }
    }
  }

  return true;
}

var _baseIsMatch = baseIsMatch;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */


function isStrictComparable(value) {
  return value === value && !isObject_1(value);
}

var _isStrictComparable = isStrictComparable;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */


function getMatchData(object) {
  var result = keys_1(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];
    result[length] = [key, value, _isStrictComparable(value)];
  }

  return result;
}

var _getMatchData = getMatchData;

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }

    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
  };
}

var _matchesStrictComparable = matchesStrictComparable;

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */


function baseMatches(source) {
  var matchData = _getMatchData(source);

  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }

  return function (object) {
    return object === source || _baseIsMatch(object, source, matchData);
  };
}

var _baseMatches = baseMatches;

/** `Object#toString` result references. */


var symbolTag$1 = '[object Symbol]';
/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */

function isSymbol(value) {
  return typeof value == 'symbol' || isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1;
}

var isSymbol_1 = isSymbol;

/** Used to match property names within property paths. */


var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;
/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */

function isKey(value, object) {
  if (isArray_1(value)) {
    return false;
  }

  var type = typeof value;

  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol_1(value)) {
    return true;
  }

  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}

var _isKey = isKey;

/** Error message constants. */


var FUNC_ERROR_TEXT = 'Expected a function';
/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */

function memoize(func, resolver) {
  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  var memoized = function () {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };

  memoized.cache = new (memoize.Cache || _MapCache)();
  return memoized;
} // Expose `MapCache`.


memoize.Cache = _MapCache;
var memoize_1 = memoize;

/** Used as the maximum memoize cache size. */


var MAX_MEMOIZE_SIZE = 500;
/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */

function memoizeCapped(func) {
  var result = memoize_1(func, function (key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }

    return key;
  });
  var cache = result.cache;
  return result;
}

var _memoizeCapped = memoizeCapped;

/** Used to match property names within property paths. */


var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
/** Used to match backslashes in property paths. */

var reEscapeChar = /\\(\\)?/g;
/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */

var stringToPath = _memoizeCapped(function (string) {
  var result = [];

  if (string.charCodeAt(0) === 46
  /* . */
  ) {
      result.push('');
    }

  string.replace(rePropName, function (match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
  });
  return result;
});
var _stringToPath = stringToPath;

/** Used as references for various `Number` constants. */


var INFINITY$1 = 1 / 0;
/** Used to convert symbols to primitives and strings. */

var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */

function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }

  if (isArray_1(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return _arrayMap(value, baseToString) + '';
  }

  if (isSymbol_1(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
}

var _baseToString = baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */


function toString(value) {
  return value == null ? '' : _baseToString(value);
}

var toString_1 = toString;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */


function castPath(value, object) {
  if (isArray_1(value)) {
    return value;
  }

  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
}

var _castPath = castPath;

/** Used as references for various `Number` constants. */


var INFINITY$2 = 1 / 0;
/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */

function toKey(value) {
  if (typeof value == 'string' || isSymbol_1(value)) {
    return value;
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY$2 ? '-0' : result;
}

var _toKey = toKey;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */


function baseGet(object, path) {
  path = _castPath(path, object);
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[_toKey(path[index++])];
  }

  return index && index == length ? object : undefined;
}

var _baseGet = baseGet;

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */


function get(object, path, defaultValue) {
  var result = object == null ? undefined : _baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

var get_1 = get;

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

var _baseHasIn = baseHasIn;

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */


function hasPath(object, path, hasFunc) {
  path = _castPath(path, object);
  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = _toKey(path[index]);

    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }

    object = object[key];
  }

  if (result || ++index != length) {
    return result;
  }

  length = object == null ? 0 : object.length;
  return !!length && isLength_1(length) && _isIndex(key, length) && (isArray_1(object) || isArguments_1(object));
}

var _hasPath = hasPath;

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */


function hasIn(object, path) {
  return object != null && _hasPath(object, path, _baseHasIn);
}

var hasIn_1 = hasIn;

/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2;
/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */

function baseMatchesProperty(path, srcValue) {
  if (_isKey(path) && _isStrictComparable(srcValue)) {
    return _matchesStrictComparable(_toKey(path), srcValue);
  }

  return function (object) {
    var objValue = get_1(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn_1(object, path) : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
  };
}

var _baseMatchesProperty = baseMatchesProperty;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}

var _baseProperty = baseProperty;

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */


function basePropertyDeep(path) {
  return function (object) {
    return _baseGet(object, path);
  };
}

var _basePropertyDeep = basePropertyDeep;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */


function property(path) {
  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
}

var property_1 = property;

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */


function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }

  if (value == null) {
    return identity_1;
  }

  if (typeof value == 'object') {
    return isArray_1(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value);
  }

  return property_1(value);
}

var _baseIteratee = baseIteratee;

/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see _.mapKeys
 * @example
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * _.mapValues(users, function(o) { return o.age; });
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 *
 * // The `_.property` iteratee shorthand.
 * _.mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */


function mapValues(object, iteratee) {
  var result = {};
  iteratee = _baseIteratee(iteratee);
  _baseForOwn(object, function (value, key, object) {
    _baseAssignValue(result, key, iteratee(value, key, object));
  });
  return result;
}

var mapValues_1 = mapValues;

var filters = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.FilterState = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

exports.arrToRegex = arrToRegex;
exports.getLocalFilter = getLocalFilter;
exports.isFiltered = isFiltered;
exports.filterStagedActions = filterStagedActions;
exports.filterState = filterState;



var _mapValues2 = _interopRequireDefault(mapValues_1);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

var FilterState = exports.FilterState = {
  DO_NOT_FILTER: 'DO_NOT_FILTER',
  BLACKLIST_SPECIFIC: 'BLACKLIST_SPECIFIC',
  WHITELIST_SPECIFIC: 'WHITELIST_SPECIFIC'
};

function arrToRegex(v) {
  return typeof v === 'string' ? v : v.join('|');
}

function filterActions(actionsById, actionsFilter) {
  if (!actionsFilter) return actionsById;
  return (0, _mapValues2.default)(actionsById, function (action, id) {
    return _extends({}, action, {
      action: actionsFilter(action.action, id)
    });
  });
}

function filterStates(computedStates, statesFilter) {
  if (!statesFilter) return computedStates;
  return computedStates.map(function (state, idx) {
    return _extends({}, state, {
      state: statesFilter(state.state, idx)
    });
  });
}

function getLocalFilter(config) {
  if (config.actionsBlacklist || config.actionsWhitelist) {
    return {
      whitelist: config.actionsWhitelist && config.actionsWhitelist.join('|'),
      blacklist: config.actionsBlacklist && config.actionsBlacklist.join('|')
    };
  }

  return undefined;
}

function getDevToolsOptions() {
  return typeof window !== 'undefined' && window.devToolsOptions || {};
}

function isFiltered(action, localFilter) {
  var _ref = action.action || action,
      type = _ref.type;

  var opts = getDevToolsOptions();
  if (!localFilter && opts.filter && opts.filter === FilterState.DO_NOT_FILTER || type && typeof type.match !== 'function') return false;

  var _ref2 = localFilter || opts,
      whitelist = _ref2.whitelist,
      blacklist = _ref2.blacklist;

  return whitelist && !type.match(whitelist) || blacklist && type.match(blacklist);
}

function filterStagedActions(state, filters) {
  if (!filters) return state;
  var filteredStagedActionIds = [];
  var filteredComputedStates = [];
  state.stagedActionIds.forEach(function (id, idx) {
    if (!isFiltered(state.actionsById[id], filters)) {
      filteredStagedActionIds.push(id);
      filteredComputedStates.push(state.computedStates[idx]);
    }
  });
  return _extends({}, state, {
    stagedActionIds: filteredStagedActionIds,
    computedStates: filteredComputedStates
  });
}

function filterState(state, type, localFilter, stateSanitizer, actionSanitizer, nextActionId, predicate) {
  if (type === 'ACTION') return !stateSanitizer ? state : stateSanitizer(state, nextActionId - 1);else if (type !== 'STATE') return state;

  var _getDevToolsOptions = getDevToolsOptions(),
      filter = _getDevToolsOptions.filter;

  if (predicate || localFilter || filter && filter !== FilterState.DO_NOT_FILTER) {
    var filteredStagedActionIds = [];
    var filteredComputedStates = [];
    var sanitizedActionsById = actionSanitizer && {};
    var actionsById = state.actionsById;
    var computedStates = state.computedStates;
    state.stagedActionIds.forEach(function (id, idx) {
      var liftedAction = actionsById[id];
      var currAction = liftedAction.action;
      var liftedState = computedStates[idx];
      var currState = liftedState.state;

      if (idx) {
        if (predicate && !predicate(currState, currAction)) return;
        if (isFiltered(currAction, localFilter)) return;
      }

      filteredStagedActionIds.push(id);
      filteredComputedStates.push(stateSanitizer ? _extends({}, liftedState, {
        state: stateSanitizer(currState, idx)
      }) : liftedState);

      if (actionSanitizer) {
        sanitizedActionsById[id] = _extends({}, liftedAction, {
          action: actionSanitizer(currAction, id)
        });
      }
    });
    return _extends({}, state, {
      actionsById: sanitizedActionsById || actionsById,
      stagedActionIds: filteredStagedActionIds,
      computedStates: filteredComputedStates
    });
  }

  if (!stateSanitizer && !actionSanitizer) return state;
  return _extends({}, state, {
    actionsById: filterActions(state.actionsById, actionSanitizer),
    computedStates: filterStates(state.computedStates, stateSanitizer)
  });
}
});

unwrapExports(filters);
var filters_1 = filters.FilterState;
var filters_2 = filters.arrToRegex;
var filters_3 = filters.getLocalFilter;
var filters_4 = filters.isFiltered;
var filters_5 = filters.filterStagedActions;
var filters_6 = filters.filterState;

var devTools = createCommonjsModule(function (module, exports) {

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

exports.default = devToolsEnhancer;
exports.preEnhancer = preEnhancer;
exports.composeWithDevTools = composeWithDevTools;





var _socketclusterClient2 = _interopRequireDefault(socketclusterClient);



var _configureStore2 = _interopRequireDefault(configureStore_1);





var _rnHostDetect2 = _interopRequireDefault(_rnHostDetect);





var _catchErrors2 = _interopRequireDefault(catchErrors_1);



function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

var instanceId = void 0;
var instanceName = void 0;
var suppressConnectErrors = void 0;
var errorCounts = {};
var socketOptions = void 0;
var socket = void 0;
var channel = void 0;
var store = {};
var lastAction = void 0;
var filters$1 = void 0;
var isExcess = void 0;
var isMonitored = void 0;
var started = void 0;
var startOn = void 0;
var stopOn = void 0;
var sendOn = void 0;
var sendOnError = void 0;
var sendTo = void 0;
var lastErrorMsg = void 0;
var locked = void 0;
var paused = void 0;
var actionCreators = void 0;
var stateSanitizer = void 0;
var actionSanitizer = void 0;

function getLiftedState() {
  return (0, filters.filterStagedActions)(store.liftedStore.getState(), filters$1);
}

function send() {
  if (!instanceId) instanceId = socket && socket.id || Math.random().toString(36).substr(2);

  try {
    fetch(sendTo, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'STATE',
        id: instanceId,
        name: instanceName,
        payload: (0, jsan.stringify)(getLiftedState())
      })
    }).catch(function (err) {
      console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
}

function relay(type, state, action, nextActionId) {
  var message = {
    type: type,
    id: socket.id,
    name: instanceName
  };

  if (state) {
    message.payload = type === 'ERROR' ? state : (0, jsan.stringify)((0, filters.filterState)(state, type, filters$1, stateSanitizer, actionSanitizer, nextActionId));
  }

  if (type === 'ACTION') {
    message.action = (0, jsan.stringify)(!actionSanitizer ? action : actionSanitizer(action.action, nextActionId - 1));
    message.isExcess = isExcess;
    message.nextActionId = nextActionId;
  } else if (action) {
    message.action = action;
  }

  socket.emit(socket.id ? 'log' : 'log-noid', message);
}

function dispatchRemotely(action) {
  try {
    var result = (0, utils$1.evalAction)(action, actionCreators);
    store.dispatch(result);
  } catch (e) {
    relay('ERROR', e.message);
  }
}

function handleMessages(message) {
  if (message.type === 'IMPORT' || message.type === 'SYNC' && socket.id && message.id !== socket.id) {
    store.liftedStore.dispatch({
      type: 'IMPORT_STATE',
      nextLiftedState: (0, jsan.parse)(message.state)
    });
  } else if (message.type === 'UPDATE') {
    relay('STATE', getLiftedState());
  } else if (message.type === 'START') {
    isMonitored = true;
    if (typeof actionCreators === 'function') actionCreators = actionCreators();
    relay('STATE', getLiftedState(), actionCreators);
  } else if (message.type === 'STOP' || message.type === 'DISCONNECTED') {
    isMonitored = false;
    relay('STOP');
  } else if (message.type === 'ACTION') {
    dispatchRemotely(message.action);
  } else if (message.type === 'DISPATCH') {
    store.liftedStore.dispatch(message.action);
  }
}

function async(fn) {
  setTimeout(fn, 0);
}

function sendError(errorAction) {
  // Prevent flooding
  if (errorAction.message && errorAction.message === lastErrorMsg) return;
  lastErrorMsg = errorAction.message;
  async(function () {
    store.dispatch(errorAction);
    if (!started) send();
  });
}

function str2array(str) {
  return typeof str === 'string' ? [str] : str && str.length;
}

function init(options) {
  instanceName = options.name;

  var _ref = options.filters || {},
      blacklist = _ref.blacklist,
      whitelist = _ref.whitelist;

  filters$1 = (0, filters.getLocalFilter)({
    actionsBlacklist: blacklist || options.actionsBlacklist,
    actionsWhitelist: whitelist || options.actionsWhitelist
  });

  if (options.port) {
    socketOptions = {
      port: options.port,
      hostname: options.hostname || 'localhost',
      secure: options.secure
    };
  } else socketOptions = constants.defaultSocketOptions;

  suppressConnectErrors = options.suppressConnectErrors !== undefined ? options.suppressConnectErrors : true;
  startOn = str2array(options.startOn);
  stopOn = str2array(options.stopOn);
  sendOn = str2array(options.sendOn);
  sendOnError = options.sendOnError;

  if (sendOn || sendOnError) {
    sendTo = options.sendTo || (socketOptions.secure ? 'https' : 'http') + '://' + socketOptions.hostname + ':' + socketOptions.port;
    instanceId = options.id;
  }

  if (sendOnError === 1) (0, _catchErrors2.default)(sendError);
  if (options.actionCreators) actionCreators = function actionCreators() {
    return (0, utils$1.getActionsArray)(options.actionCreators);
  };
  stateSanitizer = options.stateSanitizer;
  actionSanitizer = options.actionSanitizer;
}

function login() {
  socket.emit('login', 'master', function (err, channelName) {
    if (err) {
      console.log(err);
      return;
    }

    channel = channelName;
    socket.subscribe(channelName).watch(handleMessages);
    socket.on(channelName, handleMessages);
  });
  started = true;
  relay('START');
}

function stop(keepConnected) {
  started = false;
  isMonitored = false;
  if (!socket) return;
  socket.destroyChannel(channel);

  if (keepConnected) {
    socket.off(channel, handleMessages);
  } else {
    socket.off();
    socket.disconnect();
  }
}

function start() {
  if (started || socket && socket.getState() === socket.CONNECTING) return;
  socket = _socketclusterClient2.default.connect(socketOptions);
  socket.on('error', function (err) {
    // if we've already had this error before, increment it's counter, otherwise assign it '1' since we've had the error once.
    errorCounts[err.name] = errorCounts.hasOwnProperty(err.name) ? errorCounts[err.name] + 1 : 1;

    if (suppressConnectErrors) {
      if (errorCounts[err.name] === 1) {
        console.log('remote-redux-devtools: Socket connection errors are being suppressed. ' + '\n' + 'This can be disabled by setting suppressConnectErrors to \'false\'.');
        console.log(err);
      }
    } else {
      console.log(err);
    }
  });
  socket.on('connect', function () {
    console.log('connected to remotedev-server');
    errorCounts = {}; // clear the errorCounts object, so that we'll log any new errors in the event of a disconnect

    login();
  });
  socket.on('disconnect', function () {
    stop(true);
  });
}

function checkForReducerErrors() {
  var liftedState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : store.liftedStore.getState();

  if (liftedState.computedStates[liftedState.currentStateIndex].error) {
    if (started) relay('STATE', (0, filters.filterStagedActions)(liftedState, filters$1));else send();
    return true;
  }

  return false;
}

function monitorReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  lastAction = action.type;
  if (!started && sendOnError === 2 && store.liftedStore) async(checkForReducerErrors);else if (action.action) {
    if (startOn && !started && startOn.indexOf(action.action.type) !== -1) async(start);else if (stopOn && started && stopOn.indexOf(action.action.type) !== -1) async(stop);else if (sendOn && !started && sendOn.indexOf(action.action.type) !== -1) async(send);
  }
  return state;
}

function handleChange(state, liftedState, maxAge) {
  if (checkForReducerErrors(liftedState)) return;

  if (lastAction === 'PERFORM_ACTION') {
    var nextActionId = liftedState.nextActionId;
    var liftedAction = liftedState.actionsById[nextActionId - 1];
    if ((0, filters.isFiltered)(liftedAction.action, filters$1)) return;
    relay('ACTION', state, liftedAction, nextActionId);
    if (!isExcess && maxAge) isExcess = liftedState.stagedActionIds.length >= maxAge;
  } else {
    if (lastAction === 'JUMP_TO_STATE') return;

    if (lastAction === 'PAUSE_RECORDING') {
      paused = liftedState.isPaused;
    } else if (lastAction === 'LOCK_CHANGES') {
      locked = liftedState.isLocked;
    }

    if (paused || locked) {
      if (lastAction) lastAction = undefined;else return;
    }

    relay('STATE', (0, filters.filterStagedActions)(liftedState, filters$1));
  }
}

function devToolsEnhancer() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  init(_extends({}, options, {
    hostname: (0, _rnHostDetect2.default)(options.hostname || 'localhost')
  }));
  var realtime = typeof options.realtime === 'undefined' ? 'development' === 'development' : options.realtime;
  if (!realtime && !(startOn || sendOn || sendOnError)) return function (f) {
    return f;
  };
  var maxAge = options.maxAge || 30;
  return function (next) {
    return function (reducer, initialState) {
      store = (0, _configureStore2.default)(next, monitorReducer, {
        maxAge: maxAge,
        trace: options.trace,
        traceLimit: options.traceLimit,
        shouldCatchErrors: !!sendOnError,
        shouldHotReload: options.shouldHotReload,
        shouldRecordChanges: options.shouldRecordChanges,
        shouldStartLocked: options.shouldStartLocked,
        pauseActionType: options.pauseActionType || '@@PAUSED'
      })(reducer, initialState);
      if (realtime) start();
      store.subscribe(function () {
        if (isMonitored) handleChange(store.getState(), store.liftedStore.getState(), maxAge);
      });
      return store;
    };
  };
}

function preEnhancer(createStore) {
  return function (reducer, preloadedState, enhancer) {
    store = createStore(reducer, preloadedState, enhancer);
    return _extends({}, store, {
      dispatch: function dispatch(action) {
        return locked ? action : store.dispatch(action);
      }
    });
  };
}

devToolsEnhancer.updateStore = function (newStore) {
  console.warn('devTools.updateStore is deprecated use composeWithDevTools instead: ' + 'https://github.com/zalmoxisus/remote-redux-devtools#use-devtools-compose-helper');
  store = newStore;
};

var compose = function compose(options) {
  return function () {
    for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    return function () {
      return [preEnhancer].concat(funcs).reduceRight(function (composed, f) {
        return f(composed);
      }, devToolsEnhancer(options).apply(undefined, arguments));
    };
  };
};

function composeWithDevTools() {
  if (arguments.length === 0) {
    return devToolsEnhancer();
  }

  if (arguments.length === 1 && _typeof(arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
    return compose(arguments.length <= 0 ? undefined : arguments[0]);
  }

  return compose({}).apply(undefined, arguments);
}
});

unwrapExports(devTools);
var devTools_1 = devTools.preEnhancer;
var devTools_2 = devTools.composeWithDevTools;

var lib$1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.composeWithDevTools = exports.default = undefined;



Object.defineProperty(exports, 'composeWithDevTools', {
  enumerable: true,
  get: function get() {
    return devTools.composeWithDevTools;
  }
});

var _devTools2 = _interopRequireDefault(devTools);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

exports.default = _devTools2.default;
});

var devToolsEnhancer = unwrapExports(lib$1);
var lib_1 = lib$1.composeWithDevTools;

module.exports = devToolsEnhancer;
