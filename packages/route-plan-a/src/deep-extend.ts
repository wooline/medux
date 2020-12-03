/**
 * Recursive cloning array.
 */
function deepCloneArray(arr: any[]) {
  const clone: any[] = [];
  arr.forEach(function (item, index) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        clone[index] = deepExtend({}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function deepExtend(...rest: any[]) {
  if (rest.length < 1 || typeof rest[0] !== 'object') {
    return false;
  }

  if (rest.length < 2) {
    return rest[0];
  }

  const target = rest[0];

  // convert arguments to array and cut off target object
  const args = rest.slice(1);

  let val;
  let src;

  args.forEach(function (obj) {
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
        target[key] = deepCloneArray(val);

        // custom cloning and overwrite for specific objects
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);

        // source value and new value is objects both, extending...
      } else {
        target[key] = deepExtend(src, val);
      }
    });
  });

  return target;
}

export default deepExtend;
