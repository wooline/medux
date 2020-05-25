function isSpecificValue(val) {
  return val instanceof Date || val instanceof RegExp ? true : false;
}

function cloneSpecificValue(val) {
  if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
}

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

function deepExtend() {
  for (var _len = arguments.length, datas = new Array(_len), _key = 0; _key < _len; _key++) {
    datas[_key] = arguments[_key];
  }

  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) {
    return arguments[0];
  }

  var target = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  var val, src;
  args.forEach(function (obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = safeGetProperty(target, key);
      val = safeGetProperty(obj, key);

      if (val === target) {
        return;
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;
        return;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return;
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return;
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        return;
      } else {
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });
  return target;
}

export default deepExtend;