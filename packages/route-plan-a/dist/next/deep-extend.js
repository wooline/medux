function deepCloneArray(arr) {
  const clone = [];
  arr.forEach(function (item, index) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else {
        clone[index] = deepExtend({}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function deepExtend(...rest) {
  if (rest.length < 1 || typeof rest[0] !== 'object') {
    return false;
  }

  if (rest.length < 2) {
    return rest[0];
  }

  const target = rest[0];
  const args = rest.slice(1);
  let val;
  let src;
  args.forEach(function (obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = target[key];
      val = obj[key];

      if (val === target) {} else if (typeof val !== 'object' || val === null) {
        target[key] = val;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
      } else {
        target[key] = deepExtend(src, val);
      }
    });
  });
  return target;
}

export default deepExtend;