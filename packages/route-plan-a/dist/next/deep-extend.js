function deepCloneArray(optimize, arr) {
  const clone = [];
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

function __deepExtend(optimize, target, ...args) {
  if (typeof target !== 'object') {
    return false;
  }

  if (args.length < 1) {
    return target;
  }

  let val;
  let src;
  args.forEach(function (obj, index) {
    let lastArg = false;
    let last2Arg = null;

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

export const deepExtend = __deepExtend.bind(null, null);