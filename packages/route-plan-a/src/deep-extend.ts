/**
 * Recursive cloning array.
 */
function deepCloneArray(optimize: boolean, arr: any[]) {
  const clone: any[] = [];
  arr.forEach(function (item, index) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(optimize, item);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        clone[index] = __deepExtend(optimize, {}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function __deepExtend(optimize: boolean, target: any, ...args: any[]) {
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
    let last2Arg: any = null;
    if (optimize === null) {
      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }
    }
    // skip argument if isn't an object, is null, or is an array
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = target[key]; // source value
      val = obj[key]; // new value

      // recursion prevention
      if (val === target) {
        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;

        // just clone arrays (and recursive clone objects inside)
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(lastArg, val);

        // custom cloning and overwrite for specific objects
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = optimize || lastArg || (last2Arg && !last2Arg[key]) ? val : __deepExtend(lastArg, {}, val);
        // target[key] = __deepExtend({}, val);

        // source value and new value is objects both, extending...
      } else {
        target[key] = __deepExtend(lastArg, src, val);
      }
    });
  });

  return target;
}

export const deepExtend = __deepExtend.bind(null, null as any);
