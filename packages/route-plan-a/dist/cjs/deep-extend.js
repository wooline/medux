"use strict";

exports.__esModule = true;
exports.isPlainObject = isPlainObject;
exports.deepExtend = deepExtend;
exports.extendDefault = extendDefault;
exports.excludeDefault = excludeDefault;
exports.splitPrivate = splitPrivate;

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepExtend(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    var src = target[key];
    var val = inject[key];

    if (isPlainObject(val)) {
      if (isPlainObject(src)) {
        target[key] = __deepExtend(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepExtend(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

function deepExtend(target) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!isPlainObject(target)) {
    target = {};
  }

  if (args.length < 1) {
    return target;
  }

  args.forEach(function (inject, index) {
    if (isPlainObject(inject)) {
      var lastArg = false;
      var last2Arg = null;

      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }

      Object.keys(inject).forEach(function (key) {
        var src = target[key];
        var val = inject[key];

        if (isPlainObject(val)) {
          if (isPlainObject(src)) {
            target[key] = __deepExtend(lastArg, src, val);
          } else {
            target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepExtend(lastArg, {}, val);
          }
        } else {
          target[key] = val;
        }
      });
    }
  });
  return target;
}

function __extendDefault(target, def) {
  var clone = {};
  Object.keys(def).forEach(function (key) {
    if (!target.hasOwnProperty(key)) {
      clone[key] = def[key];
    } else {
      var tval = target[key];
      var dval = def[key];

      if (isPlainObject(tval) && isPlainObject(dval) && tval !== dval) {
        clone[key] = __extendDefault(tval, dval);
      } else {
        clone[key] = tval;
      }
    }
  });
  return clone;
}

function extendDefault(target, def) {
  if (!isPlainObject(target)) {
    target = {};
  }

  if (!isPlainObject(def)) {
    def = {};
  }

  return __extendDefault(target, def);
}

function __excludeDefault(data, def) {
  var result = {};
  var hasSub = false;
  Object.keys(data).forEach(function (key) {
    var value = data[key];
    var defaultValue = def[key];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && isPlainObject(value)) {
        value = __excludeDefault(value, defaultValue);
      }

      if (value !== undefined) {
        hasSub = true;
        result[key] = value;
      }
    }
  });

  if (hasSub) {
    return result;
  }

  return undefined;
}

function excludeDefault(data, def, keepTopLevel) {
  if (!isPlainObject(data)) {
    return {};
  }

  if (!isPlainObject(def)) {
    return data;
  }

  var filtered = __excludeDefault(data, def);

  if (keepTopLevel) {
    var result = {};
    Object.keys(data).forEach(function (key) {
      result[key] = filtered && filtered[key] !== undefined ? filtered[key] : {};
    });
    return result;
  }

  return filtered || {};
}

function __splitPrivate(data) {
  var keys = Object.keys(data);

  if (keys.length === 0) {
    return [undefined, undefined];
  }

  var publicData;
  var privateData;
  keys.forEach(function (key) {
    var value = data[key];

    if (key.startsWith('_')) {
      if (!privateData) {
        privateData = {};
      }

      privateData[key] = value;
    } else if (isPlainObject(value)) {
      var _splitPrivate = __splitPrivate(value),
          subPublicData = _splitPrivate[0],
          subPrivateData = _splitPrivate[1];

      if (subPublicData) {
        if (!publicData) {
          publicData = {};
        }

        publicData[key] = subPublicData;
      }

      if (subPrivateData) {
        if (!privateData) {
          privateData = {};
        }

        privateData[key] = subPrivateData;
      }
    } else {
      if (!publicData) {
        publicData = {};
      }

      publicData[key] = value;
    }
  });
  return [publicData, privateData];
}

function splitPrivate(data, deleteTopLevel) {
  if (!isPlainObject(data)) {
    return [undefined, undefined];
  }

  var keys = Object.keys(data);

  if (keys.length === 0) {
    return [undefined, undefined];
  }

  var result = __splitPrivate(data);

  var publicData = result[0];
  var privateData = result[1];
  keys.forEach(function (key) {
    if (!deleteTopLevel[key]) {
      if (!publicData) {
        publicData = {};
      }

      if (!publicData[key]) {
        publicData[key] = {};
      }
    }
  });
  return [publicData, privateData];
}