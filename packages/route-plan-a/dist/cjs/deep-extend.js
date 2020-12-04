"use strict";

exports.__esModule = true;
exports.deepExtend = void 0;

function deepCloneArray(optimize, arr) {
  var clone = [];
  arr.forEach(function (item, index) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(optimize, item);
      } else {
        clone[index] = __deepExtend(optimize, {}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function __deepExtend(optimize, target) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  if (typeof target !== 'object') {
    return false;
  }

  if (args.length < 1) {
    return target;
  }

  var val;
  var src;
  args.forEach(function (obj, index) {
    var lastArg = false;
    var last2Arg = null;

    if (optimize === null) {
      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }
    }

    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = target[key];
      val = obj[key];

      if (val === target) {} else if (typeof val !== 'object' || val === null) {
        target[key] = val;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(lastArg, val);
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = optimize || lastArg || last2Arg && !last2Arg[key] ? val : __deepExtend(lastArg, {}, val);
      } else {
        target[key] = __deepExtend(lastArg, src, val);
      }
    });
  });
  return target;
}

var deepExtend = __deepExtend.bind(null, null);

exports.deepExtend = deepExtend;