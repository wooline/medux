(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-dom/server'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-dom/server', 'react-dom'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MeduxWeb = {}, global.React, global.ReactDOMServer, global.ReactDOM));
}(this, (function (exports, React, server, ReactDOM) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  function _extends() {
    _extends = Object.assign || function (target) {
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

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  		path: basedir,
  		exports: {},
  		require: function (path, base) {
  			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
  		}
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var runtime = function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.

    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }

    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function (obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.

      generator._invoke = makeInvokeMethod(innerFn, self, context);
      return generator;
    }

    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.

    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg)
        };
      } catch (err) {
        return {
          type: "throw",
          arg: err
        };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.

    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.

    function Generator() {}

    function GeneratorFunction() {}

    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.


    var IteratorPrototype = {};

    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.

    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    exports.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }

      genFun.prototype = Object.create(Gp);
      return genFun;
    }; // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.


    exports.awrap = function (arg) {
      return {
        __await: arg
      };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);

        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;

          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function (unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function (error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
        // invocations of the iterator.
        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      } // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).


      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);

    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };

    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.

    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;
      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          } // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;

          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);

            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;
          var record = tryCatch(innerFn, self, context);

          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };
          } else if (record.type === "throw") {
            state = GenStateCompleted; // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.

            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    } // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.


    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];

      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.

        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      } // The delegate iterator is finished, so forget it and continue with
      // the outer generator.


      context.delegate = null;
      return ContinueSentinel;
    } // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.


    defineIteratorMethods(Gp);
    define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.

    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0]
      };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{
        tryLoc: "root"
      }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function (object) {
      var keys = [];

      for (var key in object) {
        keys.push(key);
      }

      keys.reverse(); // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.

      return function next() {
        while (keys.length) {
          var key = keys.pop();

          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        } // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.


        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];

        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
              next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;
            return next;
          };

          return next.next = next;
        }
      } // Return an iterator with no values.


      return {
        next: doneResult
      };
    }

    exports.values = values;

    function doneResult() {
      return {
        value: undefined$1,
        done: true
      };
    }

    Context.prototype = {
      constructor: Context,
      reset: function (skipTempReset) {
        this.prev = 0;
        this.next = 0; // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.

        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = undefined$1;
        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },
      stop: function () {
        this.done = true;
        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;

        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },
      dispatchException: function (exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;

        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },
      abrupt: function (type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },
      complete: function (record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },
      finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },
      "catch": function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;

            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }

            return thrown;
          }
        } // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.


        throw new Error("illegal catch attempt");
      },
      delegateYield: function (iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    }; // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.

    return exports;
  }( // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports );

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toArray(arr) {
    return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _toPrimitive(input, hint) {
    if (_typeof(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];

    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (_typeof(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }

    return (hint === "string" ? String : Number)(input);
  }

  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return _typeof(key) === "symbol" ? key : String(key);
  }

  function _decorate(decorators, factory, superClass, mixins) {
    var api = _getDecoratorsApi();

    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        api = mixins[i](api);
      }
    }

    var r = factory(function initialize(O) {
      api.initializeInstanceElements(O, decorated.elements);
    }, superClass);
    var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
    api.initializeClassElements(r.F, decorated.elements);
    return api.runClassFinishers(r.F, decorated.finishers);
  }

  function _getDecoratorsApi() {
    _getDecoratorsApi = function _getDecoratorsApi() {
      return api;
    };

    var api = {
      elementsDefinitionOrder: [["method"], ["field"]],
      initializeInstanceElements: function initializeInstanceElements(O, elements) {
        ["method", "field"].forEach(function (kind) {
          elements.forEach(function (element) {
            if (element.kind === kind && element.placement === "own") {
              this.defineClassElement(O, element);
            }
          }, this);
        }, this);
      },
      initializeClassElements: function initializeClassElements(F, elements) {
        var proto = F.prototype;
        ["method", "field"].forEach(function (kind) {
          elements.forEach(function (element) {
            var placement = element.placement;

            if (element.kind === kind && (placement === "static" || placement === "prototype")) {
              var receiver = placement === "static" ? F : proto;
              this.defineClassElement(receiver, element);
            }
          }, this);
        }, this);
      },
      defineClassElement: function defineClassElement(receiver, element) {
        var descriptor = element.descriptor;

        if (element.kind === "field") {
          var initializer = element.initializer;
          descriptor = {
            enumerable: descriptor.enumerable,
            writable: descriptor.writable,
            configurable: descriptor.configurable,
            value: initializer === void 0 ? void 0 : initializer.call(receiver)
          };
        }

        Object.defineProperty(receiver, element.key, descriptor);
      },
      decorateClass: function decorateClass(elements, decorators) {
        var newElements = [];
        var finishers = [];
        var placements = {
          "static": [],
          prototype: [],
          own: []
        };
        elements.forEach(function (element) {
          this.addElementPlacement(element, placements);
        }, this);
        elements.forEach(function (element) {
          if (!_hasDecorators(element)) return newElements.push(element);
          var elementFinishersExtras = this.decorateElement(element, placements);
          newElements.push(elementFinishersExtras.element);
          newElements.push.apply(newElements, elementFinishersExtras.extras);
          finishers.push.apply(finishers, elementFinishersExtras.finishers);
        }, this);

        if (!decorators) {
          return {
            elements: newElements,
            finishers: finishers
          };
        }

        var result = this.decorateConstructor(newElements, decorators);
        finishers.push.apply(finishers, result.finishers);
        result.finishers = finishers;
        return result;
      },
      addElementPlacement: function addElementPlacement(element, placements, silent) {
        var keys = placements[element.placement];

        if (!silent && keys.indexOf(element.key) !== -1) {
          throw new TypeError("Duplicated element (" + element.key + ")");
        }

        keys.push(element.key);
      },
      decorateElement: function decorateElement(element, placements) {
        var extras = [];
        var finishers = [];

        for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
          var keys = placements[element.placement];
          keys.splice(keys.indexOf(element.key), 1);
          var elementObject = this.fromElementDescriptor(element);
          var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
          element = elementFinisherExtras.element;
          this.addElementPlacement(element, placements);

          if (elementFinisherExtras.finisher) {
            finishers.push(elementFinisherExtras.finisher);
          }

          var newExtras = elementFinisherExtras.extras;

          if (newExtras) {
            for (var j = 0; j < newExtras.length; j++) {
              this.addElementPlacement(newExtras[j], placements);
            }

            extras.push.apply(extras, newExtras);
          }
        }

        return {
          element: element,
          finishers: finishers,
          extras: extras
        };
      },
      decorateConstructor: function decorateConstructor(elements, decorators) {
        var finishers = [];

        for (var i = decorators.length - 1; i >= 0; i--) {
          var obj = this.fromClassDescriptor(elements);
          var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);

          if (elementsAndFinisher.finisher !== undefined) {
            finishers.push(elementsAndFinisher.finisher);
          }

          if (elementsAndFinisher.elements !== undefined) {
            elements = elementsAndFinisher.elements;

            for (var j = 0; j < elements.length - 1; j++) {
              for (var k = j + 1; k < elements.length; k++) {
                if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                  throw new TypeError("Duplicated element (" + elements[j].key + ")");
                }
              }
            }
          }
        }

        return {
          elements: elements,
          finishers: finishers
        };
      },
      fromElementDescriptor: function fromElementDescriptor(element) {
        var obj = {
          kind: element.kind,
          key: element.key,
          placement: element.placement,
          descriptor: element.descriptor
        };
        var desc = {
          value: "Descriptor",
          configurable: true
        };
        Object.defineProperty(obj, Symbol.toStringTag, desc);
        if (element.kind === "field") obj.initializer = element.initializer;
        return obj;
      },
      toElementDescriptors: function toElementDescriptors(elementObjects) {
        if (elementObjects === undefined) return;
        return _toArray(elementObjects).map(function (elementObject) {
          var element = this.toElementDescriptor(elementObject);
          this.disallowProperty(elementObject, "finisher", "An element descriptor");
          this.disallowProperty(elementObject, "extras", "An element descriptor");
          return element;
        }, this);
      },
      toElementDescriptor: function toElementDescriptor(elementObject) {
        var kind = String(elementObject.kind);

        if (kind !== "method" && kind !== "field") {
          throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
        }

        var key = _toPropertyKey(elementObject.key);
        var placement = String(elementObject.placement);

        if (placement !== "static" && placement !== "prototype" && placement !== "own") {
          throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
        }

        var descriptor = elementObject.descriptor;
        this.disallowProperty(elementObject, "elements", "An element descriptor");
        var element = {
          kind: kind,
          key: key,
          placement: placement,
          descriptor: Object.assign({}, descriptor)
        };

        if (kind !== "field") {
          this.disallowProperty(elementObject, "initializer", "A method descriptor");
        } else {
          this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
          this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
          this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
          element.initializer = elementObject.initializer;
        }

        return element;
      },
      toElementFinisherExtras: function toElementFinisherExtras(elementObject) {
        var element = this.toElementDescriptor(elementObject);

        var finisher = _optionalCallableProperty(elementObject, "finisher");

        var extras = this.toElementDescriptors(elementObject.extras);
        return {
          element: element,
          finisher: finisher,
          extras: extras
        };
      },
      fromClassDescriptor: function fromClassDescriptor(elements) {
        var obj = {
          kind: "class",
          elements: elements.map(this.fromElementDescriptor, this)
        };
        var desc = {
          value: "Descriptor",
          configurable: true
        };
        Object.defineProperty(obj, Symbol.toStringTag, desc);
        return obj;
      },
      toClassDescriptor: function toClassDescriptor(obj) {
        var kind = String(obj.kind);

        if (kind !== "class") {
          throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
        }

        this.disallowProperty(obj, "key", "A class descriptor");
        this.disallowProperty(obj, "placement", "A class descriptor");
        this.disallowProperty(obj, "descriptor", "A class descriptor");
        this.disallowProperty(obj, "initializer", "A class descriptor");
        this.disallowProperty(obj, "extras", "A class descriptor");

        var finisher = _optionalCallableProperty(obj, "finisher");

        var elements = this.toElementDescriptors(obj.elements);
        return {
          elements: elements,
          finisher: finisher
        };
      },
      runClassFinishers: function runClassFinishers(constructor, finishers) {
        for (var i = 0; i < finishers.length; i++) {
          var newConstructor = (0, finishers[i])(constructor);

          if (newConstructor !== undefined) {
            if (typeof newConstructor !== "function") {
              throw new TypeError("Finishers must return a constructor.");
            }

            constructor = newConstructor;
          }
        }

        return constructor;
      },
      disallowProperty: function disallowProperty(obj, name, objectType) {
        if (obj[name] !== undefined) {
          throw new TypeError(objectType + " can't have a ." + name + " property.");
        }
      }
    };
    return api;
  }

  function _createElementDescriptor(def) {
    var key = _toPropertyKey(def.key);
    var descriptor;

    if (def.kind === "method") {
      descriptor = {
        value: def.value,
        writable: true,
        configurable: true,
        enumerable: false
      };
    } else if (def.kind === "get") {
      descriptor = {
        get: def.value,
        configurable: true,
        enumerable: false
      };
    } else if (def.kind === "set") {
      descriptor = {
        set: def.value,
        configurable: true,
        enumerable: false
      };
    } else if (def.kind === "field") {
      descriptor = {
        configurable: true,
        writable: true,
        enumerable: true
      };
    }

    var element = {
      kind: def.kind === "field" ? "field" : "method",
      key: key,
      placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype",
      descriptor: descriptor
    };
    if (def.decorators) element.decorators = def.decorators;
    if (def.kind === "field") element.initializer = def.value;
    return element;
  }

  function _coalesceGetterSetter(element, other) {
    if (element.descriptor.get !== undefined) {
      other.descriptor.get = element.descriptor.get;
    } else {
      other.descriptor.set = element.descriptor.set;
    }
  }

  function _coalesceClassElements(elements) {
    var newElements = [];

    var isSameElement = function isSameElement(other) {
      return other.kind === "method" && other.key === element.key && other.placement === element.placement;
    };

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var other;

      if (element.kind === "method" && (other = newElements.find(isSameElement))) {
        if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
          if (_hasDecorators(element) || _hasDecorators(other)) {
            throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
          }

          other.descriptor = element.descriptor;
        } else {
          if (_hasDecorators(element)) {
            if (_hasDecorators(other)) {
              throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
            }

            other.decorators = element.decorators;
          }

          _coalesceGetterSetter(element, other);
        }
      } else {
        newElements.push(element);
      }
    }

    return newElements;
  }

  function _hasDecorators(element) {
    return element.decorators && element.decorators.length;
  }

  function _isDataDescriptor(desc) {
    return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
  }

  function _optionalCallableProperty(obj, name) {
    var value = obj[name];

    if (value !== undefined && typeof value !== "function") {
      throw new TypeError("Expected '" + name + "' to be a function");
    }

    return value;
  }

  var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
  var isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
  var isDevelopmentEnv = process.env.NODE_ENV !== 'production';
  var client = isServerEnv ? undefined : env;

  var TaskCountEvent = 'TaskCountEvent';

  (function (LoadingState) {
    LoadingState["Start"] = "Start";
    LoadingState["Stop"] = "Stop";
    LoadingState["Depth"] = "Depth";
  })(exports.LoadingState || (exports.LoadingState = {}));

  var PEvent = function () {
    function PEvent(name, data, bubbling) {
      if (bubbling === void 0) {
        bubbling = false;
      }

      this.name = name;
      this.data = data;
      this.bubbling = bubbling;

      _defineProperty(this, "target", null);

      _defineProperty(this, "currentTarget", null);
    }

    var _proto = PEvent.prototype;

    _proto.setTarget = function setTarget(target) {
      this.target = target;
    };

    _proto.setCurrentTarget = function setCurrentTarget(target) {
      this.currentTarget = target;
    };

    return PEvent;
  }();
  var PDispatcher = function () {
    function PDispatcher(parent) {
      this.parent = parent;

      _defineProperty(this, "storeHandlers", {});
    }

    var _proto2 = PDispatcher.prototype;

    _proto2.addListener = function addListener(ename, handler) {
      var dictionary = this.storeHandlers[ename];

      if (!dictionary) {
        this.storeHandlers[ename] = dictionary = [];
      }

      dictionary.push(handler);
      return this;
    };

    _proto2.removeListener = function removeListener(ename, handler) {
      var _this = this;

      if (!ename) {
        Object.keys(this.storeHandlers).forEach(function (key) {
          delete _this.storeHandlers[key];
        });
      } else {
        var handlers = this.storeHandlers;

        if (handlers.propertyIsEnumerable(ename)) {
          var dictionary = handlers[ename];

          if (!handler) {
            delete handlers[ename];
          } else {
            var n = dictionary.indexOf(handler);

            if (n > -1) {
              dictionary.splice(n, 1);
            }

            if (dictionary.length === 0) {
              delete handlers[ename];
            }
          }
        }
      }

      return this;
    };

    _proto2.dispatch = function dispatch(evt) {
      if (!evt.target) {
        evt.setTarget(this);
      }

      evt.setCurrentTarget(this);
      var dictionary = this.storeHandlers[evt.name];

      if (dictionary) {
        for (var i = 0, k = dictionary.length; i < k; i++) {
          dictionary[i](evt);
        }
      }

      if (this.parent && evt.bubbling) {
        this.parent.dispatch(evt);
      }

      return this;
    };

    _proto2.setParent = function setParent(parent) {
      this.parent = parent;
      return this;
    };

    return PDispatcher;
  }();
  var TaskCounter = function (_PDispatcher) {
    _inheritsLoose(TaskCounter, _PDispatcher);

    function TaskCounter(deferSecond) {
      var _this2;

      _this2 = _PDispatcher.call(this) || this;
      _this2.deferSecond = deferSecond;

      _defineProperty(_assertThisInitialized(_this2), "list", []);

      _defineProperty(_assertThisInitialized(_this2), "ctimer", null);

      return _this2;
    }

    var _proto3 = TaskCounter.prototype;

    _proto3.addItem = function addItem(promise, note) {
      var _this3 = this;

      if (note === void 0) {
        note = '';
      }

      if (!this.list.some(function (item) {
        return item.promise === promise;
      })) {
        this.list.push({
          promise: promise,
          note: note
        });
        promise.then(function () {
          return _this3.completeItem(promise);
        }, function () {
          return _this3.completeItem(promise);
        });

        if (this.list.length === 1) {
          this.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Start));
          this.ctimer = env.setTimeout(function () {
            _this3.ctimer = null;

            if (_this3.list.length > 0) {
              _this3.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Depth));
            }
          }, this.deferSecond * 1000);
        }
      }

      return promise;
    };

    _proto3.completeItem = function completeItem(promise) {
      var i = this.list.findIndex(function (item) {
        return item.promise === promise;
      });

      if (i > -1) {
        this.list.splice(i, 1);

        if (this.list.length === 0) {
          if (this.ctimer) {
            env.clearTimeout.call(null, this.ctimer);
            this.ctimer = null;
          }

          this.dispatch(new PEvent(TaskCountEvent, exports.LoadingState.Stop));
        }
      }

      return this;
    };

    return TaskCounter;
  }(PDispatcher);

  var config = {
    NSP: '.',
    MSP: ',',
    SSRKey: 'meduxInitStore'
  };
  function setConfig(_config) {
    _config.NSP && (config.NSP = _config.NSP);
    _config.MSP && (config.MSP = _config.MSP);
    _config.SSRKey && (config.SSRKey = _config.SSRKey);
  }
  var ActionTypes = {
    MLoading: 'Loading',
    MInit: 'Init',
    Error: "medux" + config.NSP + "Error"
  };
  var MetaData = {
    appViewName: null,
    facadeMap: null,
    clientStore: null,
    appModuleName: null,
    moduleGetter: null
  };
  var loadings = {};
  var depthTime = 2;
  function setLoadingDepthTime(second) {
    depthTime = second;
  }
  function setLoading(item, moduleName, groupName) {
    if (moduleName === void 0) {
      moduleName = MetaData.appModuleName;
    }

    if (groupName === void 0) {
      groupName = 'global';
    }

    if (isServerEnv) {
      return item;
    }

    var key = moduleName + config.NSP + groupName;

    if (!loadings[key]) {
      loadings[key] = new TaskCounter(depthTime);
      loadings[key].addListener(TaskCountEvent, function (e) {
        var store = MetaData.clientStore;

        if (store) {
          var _actions;

          var actions = MetaData.facadeMap[moduleName].actions[ActionTypes.MLoading];

          var _action = actions((_actions = {}, _actions[groupName] = e.data, _actions));

          store.dispatch(_action);
        }
      });
    }

    loadings[key].addItem(item);
    return item;
  }
  function reducer(target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isReducer__ = true;
    descriptor.enumerable = true;
    return target.descriptor === descriptor ? target : descriptor;
  }
  function effect(loadingForGroupName, loadingForModuleName) {
    if (loadingForGroupName === undefined) {
      loadingForGroupName = 'global';
      loadingForModuleName = MetaData.appModuleName || '';
    }

    return function (target, key, descriptor) {
      if (!key && !descriptor) {
        key = target.key;
        descriptor = target.descriptor;
      }

      var fun = descriptor.value;
      fun.__actionName__ = key;
      fun.__isEffect__ = true;
      descriptor.enumerable = true;

      if (loadingForGroupName) {
        var before = function before(curAction, moduleName, promiseResult) {
          if (!isServerEnv) {
            if (loadingForModuleName === '') {
              loadingForModuleName = MetaData.appModuleName;
            } else if (!loadingForModuleName) {
              loadingForModuleName = moduleName;
            }

            setLoading(promiseResult, loadingForModuleName, loadingForGroupName);
          }
        };

        if (!fun.__decorators__) {
          fun.__decorators__ = [];
        }

        fun.__decorators__.push([before, null]);
      }

      return target.descriptor === descriptor ? target : descriptor;
    };
  }
  function logger(before, after) {
    return function (target, key, descriptor) {
      if (!key && !descriptor) {
        key = target.key;
        descriptor = target.descriptor;
      }

      var fun = descriptor.value;

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, after]);
    };
  }
  function delayPromise(second) {
    return function (target, key, descriptor) {
      if (!key && !descriptor) {
        key = target.key;
        descriptor = target.descriptor;
      }

      var fun = descriptor.value;

      descriptor.value = function () {
        var delay = new Promise(function (resolve) {
          env.setTimeout(function () {
            resolve(true);
          }, second * 1000);
        });

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
          return items[1];
        });
      };
    };
  }
  function isPromise(data) {
    return typeof data === 'object' && typeof data.then === 'function';
  }
  function isServer() {
    return isServerEnv;
  }
  function serverSide(callback) {
    if (isServerEnv) {
      return callback();
    }

    return undefined;
  }

  function errorAction(error) {
    return {
      type: ActionTypes.Error,
      payload: [error]
    };
  }
  function moduleInitAction(moduleName, initState) {
    return {
      type: "" + moduleName + config.NSP + ActionTypes.MInit,
      payload: [initState]
    };
  }

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
  var root;

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof module !== 'undefined') {
    root = module;
  } else {
    root = Function('return this')();
  }

  var result = symbolObservablePonyfill(root);

  /**
   * These are private action types reserved by Redux.
   * For any unknown actions, you must return the current state.
   * If the current state is undefined, you must return the initial state.
   * Do not reference these action types directly in your code.
   */

  var randomString = function randomString() {
    return Math.random().toString(36).substring(7).split('').join('.');
  };

  var ActionTypes$1 = {
    INIT: "@@redux/INIT" + randomString(),
    REPLACE: "@@redux/REPLACE" + randomString(),
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
    }
  };
  /**
   * @param {any} obj The object to inspect.
   * @returns {boolean} True if the argument appears to be a plain object.
   */

  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }
  /**
   * Creates a Redux store that holds the state tree.
   * The only way to change the data in the store is to call `dispatch()` on it.
   *
   * There should only be a single store in your app. To specify how different
   * parts of the state tree respond to actions, you may combine several reducers
   * into a single reducer function by using `combineReducers`.
   *
   * @param {Function} reducer A function that returns the next state tree, given
   * the current state tree and the action to handle.
   *
   * @param {any} [preloadedState] The initial state. You may optionally specify it
   * to hydrate the state from the server in universal apps, or to restore a
   * previously serialized user session.
   * If you use `combineReducers` to produce the root reducer function, this must be
   * an object with the same shape as `combineReducers` keys.
   *
   * @param {Function} [enhancer] The store enhancer. You may optionally specify it
   * to enhance the store with third-party capabilities such as middleware,
   * time travel, persistence, etc. The only store enhancer that ships with Redux
   * is `applyMiddleware()`.
   *
   * @returns {Store} A Redux store that lets you read the state, dispatch actions
   * and subscribe to changes.
   */


  function createStore(reducer, preloadedState, enhancer) {
    var _ref2;

    if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
      throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function.');
    }

    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(createStore)(reducer, preloadedState);
    }

    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }

    var currentReducer = reducer;
    var currentState = preloadedState;
    var currentListeners = [];
    var nextListeners = currentListeners;
    var isDispatching = false;
    /**
     * This makes a shallow copy of currentListeners so we can use
     * nextListeners as a temporary list while dispatching.
     *
     * This prevents any bugs around consumers calling
     * subscribe/unsubscribe in the middle of a dispatch.
     */

    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
    }
    /**
     * Reads the state tree managed by the store.
     *
     * @returns {any} The current state tree of your application.
     */


    function getState() {
      if (isDispatching) {
        throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
      }

      return currentState;
    }
    /**
     * Adds a change listener. It will be called any time an action is dispatched,
     * and some part of the state tree may potentially have changed. You may then
     * call `getState()` to read the current state tree inside the callback.
     *
     * You may call `dispatch()` from a change listener, with the following
     * caveats:
     *
     * 1. The subscriptions are snapshotted just before every `dispatch()` call.
     * If you subscribe or unsubscribe while the listeners are being invoked, this
     * will not have any effect on the `dispatch()` that is currently in progress.
     * However, the next `dispatch()` call, whether nested or not, will use a more
     * recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all state changes, as the state
     * might have been updated multiple times during a nested `dispatch()` before
     * the listener is called. It is, however, guaranteed that all subscribers
     * registered before the `dispatch()` started will be called with the latest
     * state by the time it exits.
     *
     * @param {Function} listener A callback to be invoked on every dispatch.
     * @returns {Function} A function to remove this change listener.
     */


    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error('Expected the listener to be a function.');
      }

      if (isDispatching) {
        throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
      }

      var isSubscribed = true;
      ensureCanMutateNextListeners();
      nextListeners.push(listener);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
        }

        isSubscribed = false;
        ensureCanMutateNextListeners();
        var index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
        currentListeners = null;
      };
    }
    /**
     * Dispatches an action. It is the only way to trigger a state change.
     *
     * The `reducer` function, used to create the store, will be called with the
     * current state tree and the given `action`. Its return value will
     * be considered the **next** state of the tree, and the change listeners
     * will be notified.
     *
     * The base implementation only supports plain object actions. If you want to
     * dispatch a Promise, an Observable, a thunk, or something else, you need to
     * wrap your store creating function into the corresponding middleware. For
     * example, see the documentation for the `redux-thunk` package. Even the
     * middleware will eventually dispatch plain object actions using this method.
     *
     * @param {Object} action A plain object representing “what changed”. It is
     * a good idea to keep actions serializable so you can record and replay user
     * sessions, or use the time travelling `redux-devtools`. An action must have
     * a `type` property which may not be `undefined`. It is a good idea to use
     * string constants for action types.
     *
     * @returns {Object} For convenience, the same action object you dispatched.
     *
     * Note that, if you use a custom middleware, it may wrap `dispatch()` to
     * return something else (for example, a Promise you can await).
     */


    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
      }

      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
      }

      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      var listeners = currentListeners = nextListeners;

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }

      return action;
    }
    /**
     * Replaces the reducer currently used by the store to calculate the state.
     *
     * You might need this if your app implements code splitting and you want to
     * load some of the reducers dynamically. You might also need this if you
     * implement a hot reloading mechanism for Redux.
     *
     * @param {Function} nextReducer The reducer for the store to use instead.
     * @returns {void}
     */


    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== 'function') {
        throw new Error('Expected the nextReducer to be a function.');
      }

      currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
      // Any reducers that existed in both the new and old rootReducer
      // will receive the previous state. This effectively populates
      // the new state tree with any relevant data from the old one.

      dispatch({
        type: ActionTypes$1.REPLACE
      });
    }
    /**
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */


    function observable() {
      var _ref;

      var outerSubscribe = subscribe;
      return _ref = {
        /**
         * The minimal observable subscription method.
         * @param {Object} observer Any object that can be used as an observer.
         * The observer object should have a `next` method.
         * @returns {subscription} An object with an `unsubscribe` method that can
         * be used to unsubscribe the observable from the store, and prevent further
         * emission of values from the observable.
         */
        subscribe: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            throw new TypeError('Expected the observer to be an object.');
          }

          function observeState() {
            if (observer.next) {
              observer.next(getState());
            }
          }

          observeState();
          var unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe: unsubscribe
          };
        }
      }, _ref[result] = function () {
        return this;
      }, _ref;
    } // When a store is created, an "INIT" action is dispatched so that every
    // reducer returns their initial state. This effectively populates
    // the initial state tree.


    dispatch({
      type: ActionTypes$1.INIT
    });
    return _ref2 = {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    }, _ref2[result] = observable, _ref2;
  }
  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */


  function warning(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */


    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
    } catch (e) {} // eslint-disable-line no-empty

  }

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      return dispatch(actionCreator.apply(this, arguments));
    };
  }
  /**
   * Turns an object whose values are action creators, into an object with the
   * same keys, but with every function wrapped into a `dispatch` call so they
   * may be invoked directly. This is just a convenience method, as you can call
   * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
   *
   * For convenience, you can also pass an action creator as the first argument,
   * and get a dispatch wrapped function in return.
   *
   * @param {Function|Object} actionCreators An object whose values are action
   * creator functions. One handy way to obtain it is to use ES6 `import * as`
   * syntax. You may also pass a single function.
   *
   * @param {Function} dispatch The `dispatch` function available on your Redux
   * store.
   *
   * @returns {Function|Object} The object mimicking the original object, but with
   * every action creator wrapped into the `dispatch` call. If you passed a
   * function as `actionCreators`, the return value will also be a single
   * function.
   */


  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
      throw new Error("bindActionCreators expected an object or a function, instead received " + (actionCreators === null ? 'null' : typeof actionCreators) + ". " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
    }

    var boundActionCreators = {};

    for (var key in actionCreators) {
      var actionCreator = actionCreators[key];

      if (typeof actionCreator === 'function') {
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
      }
    }

    return boundActionCreators;
  }

  function _defineProperty$1(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      keys.push.apply(keys, Object.getOwnPropertySymbols(object));
    }

    if (enumerableOnly) keys = keys.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty$1(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }
  /**
   * Composes single-argument functions from right to left. The rightmost
   * function can take multiple arguments as it provides the signature for
   * the resulting composite function.
   *
   * @param {...Function} funcs The functions to compose.
   * @returns {Function} A function obtained by composing the argument functions
   * from right to left. For example, compose(f, g, h) is identical to doing
   * (...args) => f(g(h(...args))).
   */


  function compose() {
    for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    if (funcs.length === 0) {
      return function (arg) {
        return arg;
      };
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce(function (a, b) {
      return function () {
        return a(b.apply(void 0, arguments));
      };
    });
  }
  /**
   * Creates a store enhancer that applies middleware to the dispatch method
   * of the Redux store. This is handy for a variety of tasks, such as expressing
   * asynchronous actions in a concise manner, or logging every action payload.
   *
   * See `redux-thunk` package as an example of the Redux middleware.
   *
   * Because middleware is potentially asynchronous, this should be the first
   * store enhancer in the composition chain.
   *
   * Note that each middleware will be given the `dispatch` and `getState` functions
   * as named arguments.
   *
   * @param {...Function} middlewares The middleware chain to be applied.
   * @returns {Function} A store enhancer applying the middleware.
   */


  function applyMiddleware() {
    for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }

    return function (createStore) {
      return function () {
        var store = createStore.apply(void 0, arguments);

        var _dispatch = function dispatch() {
          throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
        };

        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch() {
            return _dispatch.apply(void 0, arguments);
          }
        };
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        _dispatch = compose.apply(void 0, chain)(store.dispatch);
        return _objectSpread2({}, store, {
          dispatch: _dispatch
        });
      };
    };
  }
  /*
   * This is a dummy function to check if the function name has been altered by minification.
   * If the function has been minified and NODE_ENV !== 'production', warn the user.
   */


  function isCrushed() {}

  if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
    warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
  }

  function cacheModule(module) {
    var moduleName = module.default.moduleName;
    var moduleGetter = MetaData.moduleGetter;
    var fn = moduleGetter[moduleName];

    if (fn.__module__ === module) {
      return fn;
    }

    fn = function fn() {
      return module;
    };

    fn.__module__ = module;
    moduleGetter[moduleName] = fn;
    return fn;
  }

  function bindThis(fun, thisObj) {
    var newFun = fun.bind(thisObj);
    Object.keys(fun).forEach(function (key) {
      newFun[key] = fun[key];
    });
    return newFun;
  }

  function transformAction(actionName, action, listenerModule, actionHandlerMap) {
    if (!actionHandlerMap[actionName]) {
      actionHandlerMap[actionName] = {};
    }

    if (actionHandlerMap[actionName][listenerModule]) {
      throw new Error("Action duplicate or conflict : " + actionName + ".");
    }

    actionHandlerMap[actionName][listenerModule] = action;
  }

  function injectActions(store, moduleName, handlers) {
    for (var actionNames in handlers) {
      if (typeof handlers[actionNames] === 'function') {
        (function () {
          var handler = handlers[actionNames];

          if (handler.__isReducer__ || handler.__isEffect__) {
            handler = bindThis(handler, handlers);
            actionNames.split(config.MSP).forEach(function (actionName) {
              actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
              var arr = actionName.split(config.NSP);

              if (arr[1]) {
                handler.__isHandler__ = true;
                transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
              } else {
                handler.__isHandler__ = false;
                transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
              }
            });
          }
        })();
      }
    }
  }

  function _loadModel(moduleName, store) {
    var hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      var moduleGetter = MetaData.moduleGetter;
      var result = moduleGetter[moduleName]();

      if (isPromise(result)) {
        return result.then(function (module) {
          cacheModule(module);
          return module.default.model(store);
        });
      }

      cacheModule(result);
      return result.default.model(store);
    }

    return undefined;
  }
  var CoreModuleHandlers = _decorate(null, function (_initialize) {
    var CoreModuleHandlers = function CoreModuleHandlers(initState) {
      this.initState = initState;

      _initialize(this);
    };

    return {
      F: CoreModuleHandlers,
      d: [{
        kind: "field",
        key: "actions",
        value: function value() {
          return null;
        }
      }, {
        kind: "field",
        key: "store",
        value: function value() {
          return null;
        }
      }, {
        kind: "field",
        key: "moduleName",
        value: function value() {
          return '';
        }
      }, {
        kind: "get",
        key: "state",
        value: function state() {
          return this.store._medux_.prevState[this.moduleName];
        }
      }, {
        kind: "get",
        key: "rootState",
        value: function rootState() {
          return this.store._medux_.prevState;
        }
      }, {
        kind: "get",
        key: "currentState",
        value: function currentState() {
          return this.store._medux_.currentState[this.moduleName];
        }
      }, {
        kind: "get",
        key: "currentRootState",
        value: function currentRootState() {
          return this.store._medux_.currentState;
        }
      }, {
        kind: "get",
        key: "prevState",
        value: function prevState() {
          return this.store._medux_.beforeState[this.moduleName];
        }
      }, {
        kind: "get",
        key: "prevRootState",
        value: function prevRootState() {
          return this.store._medux_.beforeState;
        }
      }, {
        kind: "method",
        key: "dispatch",
        value: function dispatch(action) {
          return this.store.dispatch(action);
        }
      }, {
        kind: "method",
        key: "loadModel",
        value: function loadModel(moduleName) {
          return _loadModel(moduleName, this.store);
        }
      }, {
        kind: "method",
        decorators: [reducer],
        key: "Init",
        value: function Init(initState) {
          return initState;
        }
      }, {
        kind: "method",
        decorators: [reducer],
        key: "Update",
        value: function Update(payload, key) {
          return Object.assign({}, this.state, payload);
        }
      }, {
        kind: "method",
        decorators: [reducer],
        key: "Loading",
        value: function Loading(payload) {
          var state = this.state;
          return Object.assign({}, state, {
            loading: Object.assign({}, state.loading, payload)
          });
        }
      }]
    };
  });
  var exportModule = function exportModule(moduleName, ModuleHandles, views) {
    var model = function model(store) {
      var hasInjected = store._medux_.injectedModules[moduleName];

      if (!hasInjected) {
        store._medux_.injectedModules[moduleName] = true;
        var moduleHandles = new ModuleHandles();
        moduleHandles.moduleName = moduleName;
        moduleHandles.store = store;
        moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
        var _initState = moduleHandles.initState;
        injectActions(store, moduleName, moduleHandles);
        var preModuleState = store.getState()[moduleName] || {};
        var moduleState = Object.assign({}, _initState, preModuleState);

        if (!moduleState.initialized) {
          moduleState.initialized = true;
          return store.dispatch(moduleInitAction(moduleName, moduleState));
        }
      }

      return undefined;
    };

    return {
      moduleName: moduleName,
      model: model,
      views: views,
      initState: undefined,
      actions: undefined
    };
  };
  function getView(moduleName, viewName) {
    var moduleGetter = MetaData.moduleGetter;
    var result = moduleGetter[moduleName]();

    if (isPromise(result)) {
      return result.then(function (module) {
        cacheModule(module);
        var view = module.default.views[viewName];

        if (isServerEnv) {
          return view;
        }

        var initModel = module.default.model(MetaData.clientStore);

        if (isPromise(initModel)) {
          return initModel.then(function () {
            return view;
          });
        }

        return view;
      });
    }

    cacheModule(result);
    var view = result.default.views[viewName];

    if (isServerEnv) {
      return view;
    }

    var initModel = result.default.model(MetaData.clientStore);

    if (isPromise(initModel)) {
      return initModel.then(function () {
        return view;
      });
    }

    return view;
  }
  function getModuleByName(moduleName, moduleGetter) {
    var result = moduleGetter[moduleName]();

    if (isPromise(result)) {
      return result.then(function (module) {
        cacheModule(module);
        return module;
      });
    }

    cacheModule(result);
    return result;
  }

  function getActionData(action) {
    return Array.isArray(action.payload) ? action.payload : [];
  }

  function isProcessedError(error) {
    if (typeof error !== 'object' || error.meduxProcessed === undefined) {
      return undefined;
    }

    return !!error.meduxProcessed;
  }

  function setProcessedError(error, meduxProcessed) {
    if (typeof error === 'object') {
      error.meduxProcessed = meduxProcessed;
      return error;
    }

    return {
      meduxProcessed: meduxProcessed,
      error: error
    };
  }

  function buildStore(preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
    if (preloadedState === void 0) {
      preloadedState = {};
    }

    if (storeReducers === void 0) {
      storeReducers = {};
    }

    if (storeMiddlewares === void 0) {
      storeMiddlewares = [];
    }

    if (storeEnhancers === void 0) {
      storeEnhancers = [];
    }

    if (MetaData.clientStore) {
      MetaData.clientStore.destroy();
    }

    var store;

    var combineReducers = function combineReducers(rootState, action) {
      if (!store) {
        return rootState;
      }

      var meta = store._medux_;
      meta.prevState = rootState;
      meta.currentState = rootState;
      Object.keys(storeReducers).forEach(function (moduleName) {
        var result = storeReducers[moduleName](rootState[moduleName], action);

        if (result !== rootState[moduleName]) {
          var _Object$assign;

          meta.currentState = Object.assign({}, meta.currentState, (_Object$assign = {}, _Object$assign[moduleName] = result, _Object$assign));
        }
      });
      var handlersCommon = meta.reducerMap[action.type] || {};
      var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
      var handlers = Object.assign({}, handlersCommon, handlersEvery);
      var handlerModules = Object.keys(handlers);

      if (handlerModules.length > 0) {
        var orderList = [];
        var priority = action.priority ? [].concat(action.priority) : [];
        handlerModules.forEach(function (moduleName) {
          var fun = handlers[moduleName];

          if (moduleName === MetaData.appModuleName) {
            orderList.unshift(moduleName);
          } else {
            orderList.push(moduleName);
          }

          if (!fun.__isHandler__) {
            priority.unshift(moduleName);
          }
        });
        orderList.unshift.apply(orderList, priority);
        var moduleNameMap = {};
        orderList.forEach(function (moduleName) {
          if (!moduleNameMap[moduleName]) {
            moduleNameMap[moduleName] = true;
            var fun = handlers[moduleName];
            var result = fun.apply(void 0, getActionData(action));

            if (result !== rootState[moduleName]) {
              var _Object$assign2;

              meta.currentState = Object.assign({}, meta.currentState, (_Object$assign2 = {}, _Object$assign2[moduleName] = result, _Object$assign2));
            }
          }
        });
      }

      var changed = Object.keys(rootState).length !== Object.keys(meta.currentState).length || Object.keys(rootState).some(function (moduleName) {
        return rootState[moduleName] !== meta.currentState[moduleName];
      });
      meta.prevState = changed ? meta.currentState : rootState;
      return meta.prevState;
    };

    var middleware = function middleware(_ref) {
      var dispatch = _ref.dispatch;
      return function (next) {
        return function (originalAction) {
          if (isServerEnv) {
            if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
              return originalAction;
            }
          }

          var meta = store._medux_;
          meta.beforeState = meta.prevState;
          var action = next(originalAction);
          var handlersCommon = meta.effectMap[action.type] || {};
          var handlersEvery = meta.effectMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
          var handlers = Object.assign({}, handlersCommon, handlersEvery);
          var handlerModules = Object.keys(handlers);

          if (handlerModules.length > 0) {
            var orderList = [];
            var priority = action.priority ? [].concat(action.priority) : [];
            handlerModules.forEach(function (moduleName) {
              var fun = handlers[moduleName];

              if (moduleName === MetaData.appModuleName) {
                orderList.unshift(moduleName);
              } else {
                orderList.push(moduleName);
              }

              if (!fun.__isHandler__) {
                priority.unshift(moduleName);
              }
            });
            orderList.unshift.apply(orderList, priority);
            var moduleNameMap = {};
            var promiseResults = [];
            orderList.forEach(function (moduleName) {
              if (!moduleNameMap[moduleName]) {
                moduleNameMap[moduleName] = true;
                var fun = handlers[moduleName];
                var effectResult = fun.apply(void 0, getActionData(action));
                var decorators = fun.__decorators__;

                if (decorators) {
                  var results = [];
                  decorators.forEach(function (decorator, index) {
                    results[index] = decorator[0](action, moduleName, effectResult);
                  });
                  fun.__decoratorResults__ = results;
                }

                var errorHandler = effectResult.then(function (reslove) {
                  if (decorators) {
                    var _results = fun.__decoratorResults__ || [];

                    decorators.forEach(function (decorator, index) {
                      if (decorator[1]) {
                        decorator[1]('Resolved', _results[index], reslove);
                      }
                    });
                    fun.__decoratorResults__ = undefined;
                  }

                  return reslove;
                }, function (error) {
                  if (decorators) {
                    var _results2 = fun.__decoratorResults__ || [];

                    decorators.forEach(function (decorator, index) {
                      if (decorator[1]) {
                        decorator[1]('Rejected', _results2[index], error);
                      }
                    });
                    fun.__decoratorResults__ = undefined;
                  }

                  if (action.type === ActionTypes.Error) {
                    if (isProcessedError(error) === undefined) {
                      error = setProcessedError(error, true);
                    }

                    throw error;
                  } else if (isProcessedError(error)) {
                    throw error;
                  } else {
                    return dispatch(errorAction(error));
                  }
                });
                promiseResults.push(errorHandler);
              }
            });

            if (promiseResults.length) {
              return Promise.all(promiseResults);
            }
          }

          return action;
        };
      };
    };

    var preLoadMiddleware = function preLoadMiddleware() {
      return function (next) {
        return function (action) {
          var _action$type$split = action.type.split(config.NSP),
              moduleName = _action$type$split[0],
              actionName = _action$type$split[1];

          if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
            var hasInjected = !!store._medux_.injectedModules[moduleName];

            if (!hasInjected) {
              if (actionName === ActionTypes.MInit) {
                return _loadModel(moduleName, store);
              }

              var initModel = _loadModel(moduleName, store);

              if (isPromise(initModel)) {
                return initModel.then(function () {
                  return next(action);
                });
              }
            }
          }

          return next(action);
        };
      };
    };

    var middlewareEnhancer = applyMiddleware.apply(void 0, [preLoadMiddleware].concat(storeMiddlewares, [middleware]));

    var enhancer = function enhancer(newCreateStore) {
      return function () {
        var newStore = newCreateStore.apply(void 0, arguments);
        var moduleStore = newStore;
        moduleStore._medux_ = {
          beforeState: {},
          prevState: {},
          currentState: {},
          reducerMap: {},
          effectMap: {},
          injectedModules: {}
        };
        return newStore;
      };
    };

    var enhancers = [middlewareEnhancer, enhancer].concat(storeEnhancers);

    if (isDevelopmentEnv && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
      enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
    }

    store = createStore(combineReducers, preloadedState, compose.apply(void 0, enhancers));

    store.destroy = function () {
      return undefined;
    };

    if (!isServerEnv) {
      MetaData.clientStore = store;
    }

    return store;
  }

  function getRootModuleAPI(data) {
    if (!MetaData.facadeMap) {
      if (data) {
        MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
          var arr = data[moduleName];
          var actions = {};
          var actionNames = {};
          arr.forEach(function (actionName) {
            actions[actionName] = function () {
              for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
                payload[_key] = arguments[_key];
              }

              return {
                type: moduleName + config.NSP + actionName,
                payload: payload
              };
            };

            actionNames[actionName] = moduleName + config.NSP + actionName;
          });
          var moduleFacade = {
            name: moduleName,
            actions: actions,
            actionNames: actionNames
          };
          prev[moduleName] = moduleFacade;
          return prev;
        }, {});
      } else {
        var cacheData = {};
        MetaData.facadeMap = new Proxy({}, {
          set: function set(target, moduleName, val, receiver) {
            return Reflect.set(target, moduleName, val, receiver);
          },
          get: function get(target, moduleName, receiver) {
            var val = Reflect.get(target, moduleName, receiver);

            if (val !== undefined) {
              return val;
            }

            if (!cacheData[moduleName]) {
              cacheData[moduleName] = {
                name: moduleName,
                actionNames: new Proxy({}, {
                  get: function get(__, actionName) {
                    return moduleName + config.NSP + actionName;
                  }
                }),
                actions: new Proxy({}, {
                  get: function get(__, actionName) {
                    return function () {
                      for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        payload[_key2] = arguments[_key2];
                      }

                      return {
                        type: moduleName + config.NSP + actionName,
                        payload: payload
                      };
                    };
                  }
                })
              };
            }

            return cacheData[moduleName];
          }
        });
      }
    }

    return MetaData.facadeMap;
  }

  function clearHandlers(key, actionHandlerMap) {
    for (var _actionName in actionHandlerMap) {
      if (actionHandlerMap.hasOwnProperty(_actionName)) {
        var maps = actionHandlerMap[_actionName];
        delete maps[key];
      }
    }
  }

  function modelHotReplacement(moduleName, ActionHandles) {
    var store = MetaData.clientStore;
    var prevInitState = store._medux_.injectedModules[moduleName];

    if (prevInitState) {
      clearHandlers(moduleName, store._medux_.reducerMap);
      clearHandlers(moduleName, store._medux_.effectMap);
      var handlers = new ActionHandles();
      handlers.moduleName = moduleName;
      handlers.store = store;
      handlers.actions = MetaData.facadeMap[moduleName].actions;
      injectActions(store, moduleName, handlers);
      env.console.log("[HMR] @medux Updated model: " + moduleName);
    }
  }

  var reRender = function reRender() {
    return undefined;
  };

  var reRenderTimer = 0;
  var appView = null;
  function viewHotReplacement(moduleName, views) {
    var module = MetaData.moduleGetter[moduleName]();

    if (module) {
      module.default.views = views;
      env.console.warn("[HMR] @medux Updated views: " + moduleName);
      appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views[MetaData.appViewName];

      if (!reRenderTimer) {
        reRenderTimer = env.setTimeout(function () {
          reRenderTimer = 0;
          reRender(appView);
          env.console.warn("[HMR] @medux view re rendering");
        }, 0);
      }
    } else {
      throw 'views cannot apply update for HMR.';
    }
  }
  function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
    return _renderApp.apply(this, arguments);
  }

  function _renderApp() {
    _renderApp = _asyncToGenerator(regenerator.mark(function _callee(render, moduleGetter, appModuleOrName, appViewName, storeOptions, beforeRender) {
      var appModuleName, ssrInitStoreKey, initData, store, preModuleNames, modules, appModule;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (storeOptions === void 0) {
                storeOptions = {};
              }

              if (reRenderTimer) {
                env.clearTimeout.call(null, reRenderTimer);
                reRenderTimer = 0;
              }

              appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
              MetaData.appModuleName = appModuleName;
              MetaData.appViewName = appViewName;
              MetaData.moduleGetter = moduleGetter;

              if (typeof appModuleOrName !== 'string') {
                cacheModule(appModuleOrName);
              }

              ssrInitStoreKey = config.SSRKey;
              initData = storeOptions.initData || {};

              if (client[ssrInitStoreKey]) {
                initData = Object.assign({}, initData, client[ssrInitStoreKey]);
              }

              store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
              preModuleNames = beforeRender(store).filter(function (name) {
                return name !== appModuleName;
              });
              preModuleNames.unshift(appModuleName);
              _context.next = 15;
              return Promise.all(preModuleNames.map(function (moduleName) {
                if (moduleGetter[moduleName]) {
                  return getModuleByName(moduleName, moduleGetter);
                }

                return undefined;
              }));

            case 15:
              modules = _context.sent;
              appModule = modules[0];
              _context.next = 19;
              return appModule.default.model(store);

            case 19:
              reRender = render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
              return _context.abrupt("return", {
                store: store
              });

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _renderApp.apply(this, arguments);
  }

  var defFun = function defFun() {
    return undefined;
  };

  function renderSSR(_x7, _x8, _x9, _x10, _x11, _x12) {
    return _renderSSR.apply(this, arguments);
  }

  function _renderSSR() {
    _renderSSR = _asyncToGenerator(regenerator.mark(function _callee2(render, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender) {
      var ssrInitStoreKey, store, preModuleNames, modules, appModule;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (storeOptions === void 0) {
                storeOptions = {};
              }

              MetaData.appModuleName = appModuleName;
              MetaData.appViewName = appViewName;
              MetaData.moduleGetter = moduleGetter;
              ssrInitStoreKey = config.SSRKey;
              store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
              preModuleNames = beforeRender(store).filter(function (name) {
                return name !== appModuleName;
              });
              preModuleNames.unshift(appModuleName);
              _context2.next = 10;
              return Promise.all(preModuleNames.map(function (moduleName) {
                if (moduleGetter[moduleName]) {
                  return getModuleByName(moduleName, moduleGetter);
                }

                return null;
              }));

            case 10:
              modules = _context2.sent;
              appModule = modules[0];
              _context2.next = 14;
              return Promise.all(modules.map(function (module) {
                return module && module.default.model(store);
              }));

            case 14:
              store.dispatch = defFun;
              return _context2.abrupt("return", render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey));

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _renderSSR.apply(this, arguments);
  }

  function isPlainObject$1(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  }

  function __deepExtend(optimize, target, inject) {
    Object.keys(inject).forEach(function (key) {
      var src = target[key];
      var val = inject[key];

      if (isPlainObject$1(val)) {
        if (isPlainObject$1(src)) {
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

    if (!isPlainObject$1(target)) {
      target = {};
    }

    if (args.length < 1) {
      return target;
    }

    args.forEach(function (inject, index) {
      if (isPlainObject$1(inject)) {
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

          if (isPlainObject$1(val)) {
            if (isPlainObject$1(src)) {
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

        if (isPlainObject$1(tval) && isPlainObject$1(dval) && tval !== dval) {
          clone[key] = __extendDefault(tval, dval);
        } else {
          clone[key] = tval;
        }
      }
    });
    return clone;
  }

  function extendDefault(target, def) {
    if (!isPlainObject$1(target)) {
      target = {};
    }

    if (!isPlainObject$1(def)) {
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
        if (typeof value === typeof defaultValue && isPlainObject$1(value)) {
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
    if (!isPlainObject$1(data)) {
      return {};
    }

    if (!isPlainObject$1(def)) {
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
      } else if (isPlainObject$1(value)) {
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
    if (!isPlainObject$1(data)) {
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

  var routeConfig = {
    RSP: '|',
    historyMax: 10,
    homeUri: '|home|{app:{}}'
  };
  function setRouteConfig(conf) {
    conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
    conf.historyMax && (routeConfig.historyMax = conf.historyMax);
    conf.homeUri && (routeConfig.homeUri = conf.homeUri);
  }
  function extractNativeLocation(routeState) {
    var data = Object.assign({}, routeState);
    ['tag', 'params', 'action', 'key', 'history', 'stack'].forEach(function (key) {
      delete data[key];
    });
    return data;
  }
  function locationToUri(location, key) {
    return [key, location.tag, JSON.stringify(location.params)].join(routeConfig.RSP);
  }

  function splitUri() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var uri = args[0],
        name = args[1];
    var arr = uri.split(routeConfig.RSP, 3);
    var index = {
      key: 0,
      tag: 1,
      query: 2
    };

    if (name) {
      return arr[index[name]];
    }

    return arr;
  }

  function uriToLocation(uri) {
    var _splitUri = splitUri(uri),
        key = _splitUri[0],
        tag = _splitUri[1],
        query = _splitUri[2];

    var location = {
      tag: tag,
      params: JSON.parse(query)
    };
    return {
      key: key,
      location: location
    };
  }
  function buildHistoryStack(location, action, key, curData) {
    var maxLength = routeConfig.historyMax;
    var tag = location.tag;
    var uri = locationToUri(location, key);
    var history = curData.history,
        stack = curData.stack;
    var historyList = [].concat(history);
    var stackList = [].concat(stack);

    if (action === 'RELAUNCH') {
      historyList = [uri];
      stackList = [uri];
    } else if (action === 'PUSH') {
      historyList.unshift(uri);

      if (historyList.length > maxLength) {
        historyList.length = maxLength;
      }

      if (splitUri(stackList[0], 'tag') !== tag) {
        stackList.unshift(uri);

        if (stackList.length > maxLength) {
          stackList.length = maxLength;
        }
      } else {
        stackList[0] = uri;
      }
    } else if (action === 'REPLACE') {
      historyList[0] = uri;
      stackList[0] = uri;

      if (tag === splitUri(stackList[1], 'tag')) {
        stackList.splice(1, 1);
      }

      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else if (action.startsWith('POP')) {
      var n = parseInt(action.replace('POP', ''), 10) || 1;
      var useStack = n > 1000;

      if (useStack) {
        historyList = [];
        stackList.splice(0, n - 1000);
      } else {
        var arr = historyList.splice(0, n + 1, uri).reduce(function (pre, curUri) {
          var ctag = splitUri(curUri, 'tag');

          if (pre[pre.length - 1] !== ctag) {
            pre.push(ctag);
          }

          return pre;
        }, []);

        if (arr[arr.length - 1] === splitUri(historyList[1], 'tag')) {
          arr.pop();
        }

        stackList.splice(0, arr.length, uri);

        if (tag === splitUri(stackList[1], 'tag')) {
          stackList.splice(1, 1);
        }
      }
    }

    return {
      history: historyList,
      stack: stackList
    };
  }

  /**
   * Tokenize input string.
   */
  function lexer(str) {
    var tokens = [];
    var i = 0;

    while (i < str.length) {
      var char = str[i];

      if (char === "*" || char === "+" || char === "?") {
        tokens.push({
          type: "MODIFIER",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === "\\") {
        tokens.push({
          type: "ESCAPED_CHAR",
          index: i++,
          value: str[i++]
        });
        continue;
      }

      if (char === "{") {
        tokens.push({
          type: "OPEN",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === "}") {
        tokens.push({
          type: "CLOSE",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === ":") {
        var name = "";
        var j = i + 1;

        while (j < str.length) {
          var code = str.charCodeAt(j);

          if ( // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95) {
            name += str[j++];
            continue;
          }

          break;
        }

        if (!name) throw new TypeError("Missing parameter name at " + i);
        tokens.push({
          type: "NAME",
          index: i,
          value: name
        });
        i = j;
        continue;
      }

      if (char === "(") {
        var count = 1;
        var pattern = "";
        var j = i + 1;

        if (str[j] === "?") {
          throw new TypeError("Pattern cannot start with \"?\" at " + j);
        }

        while (j < str.length) {
          if (str[j] === "\\") {
            pattern += str[j++] + str[j++];
            continue;
          }

          if (str[j] === ")") {
            count--;

            if (count === 0) {
              j++;
              break;
            }
          } else if (str[j] === "(") {
            count++;

            if (str[j + 1] !== "?") {
              throw new TypeError("Capturing groups are not allowed at " + j);
            }
          }

          pattern += str[j++];
        }

        if (count) throw new TypeError("Unbalanced pattern at " + i);
        if (!pattern) throw new TypeError("Missing pattern at " + i);
        tokens.push({
          type: "PATTERN",
          index: i,
          value: pattern
        });
        i = j;
        continue;
      }

      tokens.push({
        type: "CHAR",
        index: i,
        value: str[i++]
      });
    }

    tokens.push({
      type: "END",
      index: i,
      value: ""
    });
    return tokens;
  }
  /**
   * Parse a string for the raw tokens.
   */


  function parse(str, options) {
    if (options === void 0) {
      options = {};
    }

    var tokens = lexer(str);
    var _a = options.prefixes,
        prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";

    var tryConsume = function (type) {
      if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    };

    var mustConsume = function (type) {
      var value = tryConsume(type);
      if (value !== undefined) return value;
      var _a = tokens[i],
          nextType = _a.type,
          index = _a.index;
      throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
    };

    var consumeText = function () {
      var result = "";
      var value; // tslint:disable-next-line

      while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
        result += value;
      }

      return result;
    };

    while (i < tokens.length) {
      var char = tryConsume("CHAR");
      var name = tryConsume("NAME");
      var pattern = tryConsume("PATTERN");

      if (name || pattern) {
        var prefix = char || "";

        if (prefixes.indexOf(prefix) === -1) {
          path += prefix;
          prefix = "";
        }

        if (path) {
          result.push(path);
          path = "";
        }

        result.push({
          name: name || key++,
          prefix: prefix,
          suffix: "",
          pattern: pattern || defaultPattern,
          modifier: tryConsume("MODIFIER") || ""
        });
        continue;
      }

      var value = char || tryConsume("ESCAPED_CHAR");

      if (value) {
        path += value;
        continue;
      }

      if (path) {
        result.push(path);
        path = "";
      }

      var open = tryConsume("OPEN");

      if (open) {
        var prefix = consumeText();
        var name_1 = tryConsume("NAME") || "";
        var pattern_1 = tryConsume("PATTERN") || "";
        var suffix = consumeText();
        mustConsume("CLOSE");
        result.push({
          name: name_1 || (pattern_1 ? key++ : ""),
          pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
          prefix: prefix,
          suffix: suffix,
          modifier: tryConsume("MODIFIER") || ""
        });
        continue;
      }

      mustConsume("END");
    }

    return result;
  }
  /**
   * Escape a regular expression string.
   */

  function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */


  function flags(options) {
    return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */


  function regexpToRegexp(path, keys) {
    if (!keys) return path;
    var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    var index = 0;
    var execResult = groupsRegex.exec(path.source);

    while (execResult) {
      keys.push({
        // Use parenthesized substring match if available, index otherwise
        name: execResult[1] || index++,
        prefix: "",
        suffix: "",
        modifier: "",
        pattern: ""
      });
      execResult = groupsRegex.exec(path.source);
    }

    return path;
  }
  /**
   * Transform an array into a regexp.
   */


  function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) {
      return pathToRegexp(path, keys, options).source;
    });
    return new RegExp("(?:" + parts.join("|") + ")", flags(options));
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


  function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) {
      options = {};
    }

    var _a = options.strict,
        strict = _a === void 0 ? false : _a,
        _b = options.start,
        start = _b === void 0 ? true : _b,
        _c = options.end,
        end = _c === void 0 ? true : _c,
        _d = options.encode,
        encode = _d === void 0 ? function (x) {
      return x;
    } : _d;
    var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
    var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
    var route = start ? "^" : ""; // Iterate over the tokens and create our regexp string.

    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
      var token = tokens_1[_i];

      if (typeof token === "string") {
        route += escapeString(encode(token));
      } else {
        var prefix = escapeString(encode(token.prefix));
        var suffix = escapeString(encode(token.suffix));

        if (token.pattern) {
          if (keys) keys.push(token);

          if (prefix || suffix) {
            if (token.modifier === "+" || token.modifier === "*") {
              var mod = token.modifier === "*" ? "?" : "";
              route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
            } else {
              route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
            }
          } else {
            route += "(" + token.pattern + ")" + token.modifier;
          }
        } else {
          route += "(?:" + prefix + suffix + ")" + token.modifier;
        }
      }
    }

    if (end) {
      if (!strict) route += delimiter + "?";
      route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
    } else {
      var endToken = tokens[tokens.length - 1];
      var isEndDelimited = typeof endToken === "string" ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : // tslint:disable-next-line
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
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */

  function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp) return regexpToRegexp(path, keys);
    if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
  }

  var cache = {};
  function compilePath(rule) {
    if (cache[rule]) {
      return cache[rule];
    }

    var keys = [];
    var regexp = pathToRegexp(rule.replace(/\$$/, ''), keys, {
      end: rule.endsWith('$'),
      strict: false,
      sensitive: false
    });
    var result = {
      regexp: regexp,
      keys: keys
    };
    var cachedRules = Object.keys(cache);

    if (cachedRules.length > 1000) {
      delete cache[cachedRules[0]];
    }

    cache[rule] = result;
    return result;
  }
  function parseRule(rule, pathname) {
    var _compilePath = compilePath(rule),
        regexp = _compilePath.regexp,
        keys = _compilePath.keys;

    var match = regexp.exec(pathname);
    if (!match) return null;
    var matchedPathname = match[0],
        values = match.slice(1);
    var args = keys.reduce(function (memo, key, index) {
      memo[key.name] = values[index];
      return memo;
    }, {});
    return {
      args: args,
      matchPathame: matchedPathname,
      subPathname: pathname.replace(matchedPathname, '')
    };
  }
  function extractPathParams(rules, pathname, pathParams) {
    for (var _rule in rules) {
      if (rules.hasOwnProperty(_rule)) {
        var data = parseRule(_rule, pathname);

        if (data) {
          var _args = data.args,
              matchPathame = data.matchPathame,
              subPathname = data.subPathname;

          var result = rules[_rule](_args, pathParams);

          if (typeof result === 'string') {
            pathname = result;
          } else if (result && subPathname) {
            return matchPathame + extractPathParams(result, subPathname, pathParams);
          } else {
            return pathname;
          }
        }
      }
    }

    return pathname;
  }

  function splitSearch(search, key) {
    var reg = new RegExp("[?&#]" + key + "=([^&]+)");
    var arr = search.match(reg);
    return arr ? arr[1] : '';
  }

  function assignDefaultData(data, def) {
    return Object.keys(data).reduce(function (params, moduleName) {
      if (def.hasOwnProperty(moduleName)) {
        params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
      }

      return params;
    }, {});
  }

  function encodeBas64(str) {
    return btoa ? btoa(str) : Buffer ? Buffer.from(str).toString('base64') : str;
  }

  function decodeBas64(str) {
    return atob ? atob(str) : Buffer ? Buffer.from(str, 'base64').toString() : str;
  }

  function parseWebNativeLocation(nativeLocation, key, base64, parse) {
    var search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
    var hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;

    if (base64) {
      search = search && decodeBas64(search);
      hash = hash && decodeBas64(hash);
    }

    var pathname = ("/" + nativeLocation.pathname).replace(/\/+/g, '/');
    return {
      pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
      search: search ? parse(search) : undefined,
      hash: hash ? parse(hash) : undefined
    };
  }

  function toNativeLocation(tag, search, hash, key, base64, stringify) {
    var searchStr = search ? stringify(search) : '';
    var hashStr = hash ? stringify(hash) : '';

    if (base64) {
      searchStr = searchStr && encodeBas64(searchStr);
      hashStr = hashStr && encodeBas64(hashStr);
    }

    var pathname = ("/" + tag).replace(/\/+/g, '/');
    return {
      pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
      search: key ? key + "=" + searchStr : searchStr,
      hash: key ? key + "=" + hashStr : hashStr
    };
  }
  function createWebLocationTransform(defaultData, pathnameRules, base64, serialization, key) {
    if (base64 === void 0) {
      base64 = false;
    }

    if (serialization === void 0) {
      serialization = JSON;
    }

    if (key === void 0) {
      key = '';
    }

    var matchCache = {
      _cache: {},
      get: function get(pathname) {
        if (this._cache[pathname]) {
          var _this$_cache$pathname = this._cache[pathname],
              tag = _this$_cache$pathname.tag,
              pathParams = _this$_cache$pathname.pathParams;
          return {
            tag: tag,
            pathParams: JSON.parse(pathParams)
          };
        }

        return undefined;
      },
      set: function set(pathname, tag, pathParams) {
        var keys = Object.keys(this._cache);

        if (keys.length > 100) {
          delete this._cache[keys[0]];
        }

        this._cache[pathname] = {
          tag: tag,
          pathParams: JSON.stringify(pathParams)
        };
      }
    };
    return {
      in: function _in(nativeLocation) {
        var _parseWebNativeLocati = parseWebNativeLocation(nativeLocation, key, base64, serialization.parse),
            pathname = _parseWebNativeLocati.pathname,
            search = _parseWebNativeLocati.search,
            hash = _parseWebNativeLocati.hash;

        var data = {
          tag: pathname,
          params: {}
        };

        if (pathnameRules) {
          var _ref = matchCache.get(pathname) || {},
              pathParams = _ref.pathParams,
              tag = _ref.tag;

          if (!tag || !pathParams) {
            pathParams = {};
            tag = extractPathParams(pathnameRules, pathname, pathParams);
            matchCache.set(pathname, tag, pathParams);
          }

          data.tag = tag;
          data.params = deepExtend(pathParams, search, hash);
        } else {
          data.params = deepExtend(search, hash);
        }

        data.params = assignDefaultData(data.params, defaultData);
        return data;
      },
      out: function out(meduxLocation) {
        var params = excludeDefault(meduxLocation.params, defaultData, true);
        var result;

        if (pathnameRules) {
          var _ref2 = matchCache.get(meduxLocation.tag) || {},
              pathParams = _ref2.pathParams,
              tag = _ref2.tag;

          if (!tag || !pathParams) {
            pathParams = {};
            tag = extractPathParams(pathnameRules, meduxLocation.tag, pathParams);
            matchCache.set(meduxLocation.tag, tag, pathParams);
          }

          params = excludeDefault(params, pathParams, false);
          result = splitPrivate(params, pathParams);
        } else {
          result = splitPrivate(params, {});
        }

        return toNativeLocation(meduxLocation.tag, result[0], result[1], key, base64, serialization.stringify);
      }
    };
  }

  var RouteModuleHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
    var RouteModuleHandlers = function (_CoreModuleHandlers2) {
      _inheritsLoose(RouteModuleHandlers, _CoreModuleHandlers2);

      function RouteModuleHandlers() {
        var _this;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

        _initialize(_assertThisInitialized(_this));

        return _this;
      }

      return RouteModuleHandlers;
    }(_CoreModuleHandlers);

    return {
      F: RouteModuleHandlers,
      d: [{
        kind: "method",
        decorators: [reducer],
        key: "Init",
        value: function Init(initState) {
          var routeParams = this.rootState.route.params[this.moduleName];
          return routeParams ? deepExtend({}, initState, routeParams) : initState;
        }
      }, {
        kind: "method",
        decorators: [reducer],
        key: "RouteParams",
        value: function RouteParams(payload) {
          return deepExtend({}, this.state, payload);
        }
      }]
    };
  }, CoreModuleHandlers);
  var RouteActionTypes = {
    MRouteParams: 'RouteParams',
    RouteChange: "medux" + config.NSP + "RouteChange",
    BeforeRouteChange: "medux" + config.NSP + "BeforeRouteChange"
  };
  function beforeRouteChangeAction(routeState) {
    return {
      type: RouteActionTypes.BeforeRouteChange,
      payload: [routeState]
    };
  }
  function routeParamsAction(moduleName, params, action) {
    return {
      type: "" + moduleName + config.NSP + RouteActionTypes.MRouteParams,
      payload: [params, action]
    };
  }
  function routeChangeAction(routeState) {
    return {
      type: RouteActionTypes.RouteChange,
      payload: [routeState]
    };
  }
  var routeMiddleware = function routeMiddleware(_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
      return function (action) {
        if (action.type === RouteActionTypes.RouteChange) {
          var routeState = action.payload[0];
          var rootRouteParams = routeState.params;
          var rootState = getState();
          Object.keys(rootRouteParams).forEach(function (moduleName) {
            var routeParams = rootRouteParams[moduleName];

            if (routeParams) {
              var _rootState$moduleName;

              if ((_rootState$moduleName = rootState[moduleName]) === null || _rootState$moduleName === void 0 ? void 0 : _rootState$moduleName.initialized) {
                dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
              }
            }
          });
        }

        return next(action);
      };
    };
  };
  var routeReducer = function routeReducer(state, action) {
    if (action.type === RouteActionTypes.RouteChange) {
      return action.payload[0];
    }

    return state;
  };
  var BaseHistoryActions = function () {
    function BaseHistoryActions(nativeHistory, locationTransform) {
      this.nativeHistory = nativeHistory;
      this.locationTransform = locationTransform;

      _defineProperty(this, "_tid", 0);

      _defineProperty(this, "_routeState", void 0);

      _defineProperty(this, "_startupUri", void 0);

      _defineProperty(this, "store", void 0);

      var location = this.locationTransform.in(nativeHistory.getLocation());

      var key = this._createKey();

      var routeState = this.locationToRouteState(location, 'RELAUNCH', key);
      this._routeState = routeState;
      this._startupUri = locationToUri(location, key);
      var nativeLocation = extractNativeLocation(routeState);
      nativeHistory.relaunch(nativeLocation, key);
    }

    var _proto = BaseHistoryActions.prototype;

    _proto.getRouteState = function getRouteState() {
      return this._routeState;
    };

    _proto.setStore = function setStore(_store) {
      this.store = _store;
    };

    _proto.getCurKey = function getCurKey() {
      return this._routeState.key;
    };

    _proto._createKey = function _createKey() {
      this._tid++;
      return "" + this._tid;
    };

    _proto.findHistoryByKey = function findHistoryByKey(key) {
      var history = this._routeState.history;
      return history.findIndex(function (uri) {
        return uri.startsWith("" + key + routeConfig.RSP);
      });
    };

    _proto.payloadToLocation = function payloadToLocation(data) {
      if (typeof data === 'string') {
        var nativeLocation = this.nativeHistory.parseUrl(data);
        return this.locationTransform.in(nativeLocation);
      }

      var tag = data.tag;
      var extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
      var params = extendParams && data.params ? deepExtend({}, extendParams, data.params) : data.params;
      return {
        tag: tag || this._routeState.tag || '/',
        params: params
      };
    };

    _proto.locationToUrl = function locationToUrl(data) {
      var tag = data.tag;
      var extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
      var params = extendParams && data.params ? deepExtend({}, extendParams, data.params) : data.params;
      var nativeLocation = this.locationTransform.out({
        tag: tag || this._routeState.tag || '/',
        params: params
      });
      return this.nativeHistory.toUrl(nativeLocation);
    };

    _proto.locationToRouteState = function locationToRouteState(location, action, key) {
      var _buildHistoryStack = buildHistoryStack(location, action, key, this._routeState || {
        history: [],
        stack: []
      }),
          history = _buildHistoryStack.history,
          stack = _buildHistoryStack.stack;

      var natvieLocation = this.locationTransform.out(location);
      return Object.assign({}, location, {
        action: action,
        key: key,
        history: history,
        stack: stack
      }, natvieLocation);
    };

    _proto.dispatch = function () {
      var _dispatch = _asyncToGenerator(regenerator.mark(function _callee(location, action, key, callNative) {
        var routeState, nativeLocation;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (key === void 0) {
                  key = '';
                }

                key = key || this._createKey();
                routeState = this.locationToRouteState(location, action, key);
                _context.next = 5;
                return this.store.dispatch(beforeRouteChangeAction(routeState));

              case 5:
                this._routeState = routeState;
                _context.next = 8;
                return this.store.dispatch(routeChangeAction(routeState));

              case 8:
                if (callNative) {
                  nativeLocation = extractNativeLocation(routeState);

                  if (typeof callNative === 'number') {
                    this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative, key);
                  } else {
                    this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation, key);
                  }
                }

                return _context.abrupt("return", routeState);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function dispatch(_x, _x2, _x3, _x4) {
        return _dispatch.apply(this, arguments);
      }

      return dispatch;
    }();

    _proto.relaunch = function relaunch(data, disableNative) {
      var paLocation = this.payloadToLocation(data);
      return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
    };

    _proto.push = function push(data, disableNative) {
      var paLocation = this.payloadToLocation(data);
      return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
    };

    _proto.replace = function replace(data, disableNative) {
      var paLocation = this.payloadToLocation(data);
      return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
    };

    _proto.pop = function pop(n, root, disableNative, useStack) {
      if (n === void 0) {
        n = 1;
      }

      if (root === void 0) {
        root = 'FIRST';
      }

      n = n || 1;
      var uri = useStack ? this._routeState.stack[n] : this._routeState.history[n];
      var k = useStack ? 1000 + n : n;

      if (!uri) {
        k = 1000000;

        if (root === 'HOME') {
          uri = routeConfig.homeUri;
        } else if (root === 'FIRST') {
          uri = this._startupUri;
        } else {
          return Promise.reject(1);
        }
      }

      var _uriToLocation = uriToLocation(uri),
          key = _uriToLocation.key,
          location = _uriToLocation.location;

      return this.dispatch(location, "POP" + k, key, disableNative ? '' : k);
    };

    _proto.back = function back(n, root, disableNative) {
      if (n === void 0) {
        n = 1;
      }

      if (root === void 0) {
        root = 'FIRST';
      }

      return this.pop(n, root, disableNative, true);
    };

    _proto.home = function home(root, disableNative) {
      if (root === void 0) {
        root = 'FIRST';
      }

      return this.relaunch(root === 'HOME' ? routeConfig.homeUri : this._startupUri, disableNative);
    };

    return BaseHistoryActions;
  }();

  /** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var b = "function" === typeof Symbol && Symbol.for,
      c = b ? Symbol.for("react.element") : 60103,
      d = b ? Symbol.for("react.portal") : 60106,
      e = b ? Symbol.for("react.fragment") : 60107,
      f = b ? Symbol.for("react.strict_mode") : 60108,
      g = b ? Symbol.for("react.profiler") : 60114,
      h = b ? Symbol.for("react.provider") : 60109,
      k = b ? Symbol.for("react.context") : 60110,
      l = b ? Symbol.for("react.async_mode") : 60111,
      m = b ? Symbol.for("react.concurrent_mode") : 60111,
      n = b ? Symbol.for("react.forward_ref") : 60112,
      p = b ? Symbol.for("react.suspense") : 60113,
      q = b ? Symbol.for("react.suspense_list") : 60120,
      r = b ? Symbol.for("react.memo") : 60115,
      t = b ? Symbol.for("react.lazy") : 60116,
      v = b ? Symbol.for("react.block") : 60121,
      w = b ? Symbol.for("react.fundamental") : 60117,
      x = b ? Symbol.for("react.responder") : 60118,
      y = b ? Symbol.for("react.scope") : 60119;

  function z(a) {
    if ("object" === typeof a && null !== a) {
      var u = a.$$typeof;

      switch (u) {
        case c:
          switch (a = a.type, a) {
            case l:
            case m:
            case e:
            case g:
            case f:
            case p:
              return a;

            default:
              switch (a = a && a.$$typeof, a) {
                case k:
                case n:
                case t:
                case r:
                case h:
                  return a;

                default:
                  return u;
              }

          }

        case d:
          return u;
      }
    }
  }

  function A(a) {
    return z(a) === m;
  }

  var AsyncMode = l;
  var ConcurrentMode = m;
  var ContextConsumer = k;
  var ContextProvider = h;
  var Element = c;
  var ForwardRef = n;
  var Fragment = e;
  var Lazy = t;
  var Memo = r;
  var Portal = d;
  var Profiler = g;
  var StrictMode = f;
  var Suspense = p;

  var isAsyncMode = function (a) {
    return A(a) || z(a) === l;
  };

  var isConcurrentMode = A;

  var isContextConsumer = function (a) {
    return z(a) === k;
  };

  var isContextProvider = function (a) {
    return z(a) === h;
  };

  var isElement = function (a) {
    return "object" === typeof a && null !== a && a.$$typeof === c;
  };

  var isForwardRef = function (a) {
    return z(a) === n;
  };

  var isFragment = function (a) {
    return z(a) === e;
  };

  var isLazy = function (a) {
    return z(a) === t;
  };

  var isMemo = function (a) {
    return z(a) === r;
  };

  var isPortal = function (a) {
    return z(a) === d;
  };

  var isProfiler = function (a) {
    return z(a) === g;
  };

  var isStrictMode = function (a) {
    return z(a) === f;
  };

  var isSuspense = function (a) {
    return z(a) === p;
  };

  var isValidElementType = function (a) {
    return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || a === q || "object" === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n || a.$$typeof === w || a.$$typeof === x || a.$$typeof === y || a.$$typeof === v);
  };

  var typeOf = z;

  var reactIs_production_min = {
  	AsyncMode: AsyncMode,
  	ConcurrentMode: ConcurrentMode,
  	ContextConsumer: ContextConsumer,
  	ContextProvider: ContextProvider,
  	Element: Element,
  	ForwardRef: ForwardRef,
  	Fragment: Fragment,
  	Lazy: Lazy,
  	Memo: Memo,
  	Portal: Portal,
  	Profiler: Profiler,
  	StrictMode: StrictMode,
  	Suspense: Suspense,
  	isAsyncMode: isAsyncMode,
  	isConcurrentMode: isConcurrentMode,
  	isContextConsumer: isContextConsumer,
  	isContextProvider: isContextProvider,
  	isElement: isElement,
  	isForwardRef: isForwardRef,
  	isFragment: isFragment,
  	isLazy: isLazy,
  	isMemo: isMemo,
  	isPortal: isPortal,
  	isProfiler: isProfiler,
  	isStrictMode: isStrictMode,
  	isSuspense: isSuspense,
  	isValidElementType: isValidElementType,
  	typeOf: typeOf
  };

  var reactIs_development = createCommonjsModule(function (module, exports) {

  if (process.env.NODE_ENV !== "production") {
    (function () {
      // nor polyfill, then a plain number is used for performance.

      var hasSymbol = typeof Symbol === 'function' && Symbol.for;
      var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
      var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
      var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
      var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
      var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
      var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
      var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
      // (unstable) APIs that have been removed. Can we remove the symbols?

      var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
      var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
      var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
      var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
      var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
      var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
      var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
      var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
      var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
      var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
      var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

      function isValidElementType(type) {
        return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
        type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
      }

      function typeOf(object) {
        if (typeof object === 'object' && object !== null) {
          var $$typeof = object.$$typeof;

          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;

              switch (type) {
                case REACT_ASYNC_MODE_TYPE:
                case REACT_CONCURRENT_MODE_TYPE:
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                  return type;

                default:
                  var $$typeofType = type && type.$$typeof;

                  switch ($$typeofType) {
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_LAZY_TYPE:
                    case REACT_MEMO_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;

                    default:
                      return $$typeof;
                  }

              }

            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }

        return undefined;
      } // AsyncMode is deprecated along with isAsyncMode


      var AsyncMode = REACT_ASYNC_MODE_TYPE;
      var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

            console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
          }
        }
        return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
      }

      function isConcurrentMode(object) {
        return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
      }

      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }

      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }

      function isElement(object) {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }

      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }

      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }

      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }

      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }

      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }

      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }

      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }

      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }

      exports.AsyncMode = AsyncMode;
      exports.ConcurrentMode = ConcurrentMode;
      exports.ContextConsumer = ContextConsumer;
      exports.ContextProvider = ContextProvider;
      exports.Element = Element;
      exports.ForwardRef = ForwardRef;
      exports.Fragment = Fragment;
      exports.Lazy = Lazy;
      exports.Memo = Memo;
      exports.Portal = Portal;
      exports.Profiler = Profiler;
      exports.StrictMode = StrictMode;
      exports.Suspense = Suspense;
      exports.isAsyncMode = isAsyncMode;
      exports.isConcurrentMode = isConcurrentMode;
      exports.isContextConsumer = isContextConsumer;
      exports.isContextProvider = isContextProvider;
      exports.isElement = isElement;
      exports.isForwardRef = isForwardRef;
      exports.isFragment = isFragment;
      exports.isLazy = isLazy;
      exports.isMemo = isMemo;
      exports.isPortal = isPortal;
      exports.isProfiler = isProfiler;
      exports.isStrictMode = isStrictMode;
      exports.isSuspense = isSuspense;
      exports.isValidElementType = isValidElementType;
      exports.typeOf = typeOf;
    })();
  }
  });

  var reactIs = createCommonjsModule(function (module) {

  if (process.env.NODE_ENV === 'production') {
    module.exports = reactIs_production_min;
  } else {
    module.exports = reactIs_development;
  }
  });

  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  /* eslint-disable no-unused-vars */

  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;

  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }

    return Object(val);
  }

  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      } // Detect buggy property enumeration order in older V8 versions.
      // https://bugs.chromium.org/p/v8/issues/detail?id=4118


      var test1 = new String('abc'); // eslint-disable-line no-new-wrappers

      test1[5] = 'de';

      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


      var test2 = {};

      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i;
      }

      var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        return test2[n];
      });

      if (order2.join('') !== '0123456789') {
        return false;
      } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


      var test3 = {};
      'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        test3[letter] = letter;
      });

      if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
        return false;
      }

      return true;
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false;
    }
  }

  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;

    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);

      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }

      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);

        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }

    return to;
  };

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
  var ReactPropTypesSecret_1 = ReactPropTypesSecret;

  var printWarning = function () {};

  if (process.env.NODE_ENV !== 'production') {
    var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;

    var loggedTypeFailures = {};
    var has = Function.call.bind(Object.prototype.hasOwnProperty);

    printWarning = function (text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };
  }
  /**
   * Assert that the values match with the type specs.
   * Error messages are memorized and will only be shown once.
   *
   * @param {object} typeSpecs Map of name to a ReactPropType
   * @param {object} values Runtime values that need to be type-checked
   * @param {string} location e.g. "prop", "context", "child context"
   * @param {string} componentName Name of the component for error messages.
   * @param {?Function} getStack Returns the component stack.
   * @private
   */


  function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    if (process.env.NODE_ENV !== 'production') {
      for (var typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error; // Prop type validation may throw. In case they do, we don't want to
          // fail the render phase where it didn't fail before. So we log it.
          // After these have been cleaned up, we'll let them throw.

          try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.');
              err.name = 'Invariant Violation';
              throw err;
            }

            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
          } catch (ex) {
            error = ex;
          }

          if (error && !(error instanceof Error)) {
            printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
          }

          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error.message] = true;
            var stack = getStack ? getStack() : '';
            printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
          }
        }
      }
    }
  }
  /**
   * Resets warning cache when testing.
   *
   * @private
   */


  checkPropTypes.resetWarningCache = function () {
    if (process.env.NODE_ENV !== 'production') {
      loggedTypeFailures = {};
    }
  };

  var checkPropTypes_1 = checkPropTypes;

  var has$1 = Function.call.bind(Object.prototype.hasOwnProperty);

  var printWarning$1 = function () {};

  if (process.env.NODE_ENV !== 'production') {
    printWarning$1 = function (text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };
  }

  function emptyFunctionThatReturnsNull() {
    return null;
  }

  var factoryWithTypeCheckers = function (isValidElement, throwOnDirectAccess) {
    /* global Symbol */
    var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

    /**
     * Returns the iterator method function contained on the iterable object.
     *
     * Be sure to invoke the function with the iterable as context:
     *
     *     var iteratorFn = getIteratorFn(myIterable);
     *     if (iteratorFn) {
     *       var iterator = iteratorFn.call(myIterable);
     *       ...
     *     }
     *
     * @param {?object} maybeIterable
     * @return {?function}
     */

    function getIteratorFn(maybeIterable) {
      var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);

      if (typeof iteratorFn === 'function') {
        return iteratorFn;
      }
    }
    /**
     * Collection of methods that allow declaration and validation of props that are
     * supplied to React components. Example usage:
     *
     *   var Props = require('ReactPropTypes');
     *   var MyArticle = React.createClass({
     *     propTypes: {
     *       // An optional string prop named "description".
     *       description: Props.string,
     *
     *       // A required enum prop named "category".
     *       category: Props.oneOf(['News','Photos']).isRequired,
     *
     *       // A prop named "dialog" that requires an instance of Dialog.
     *       dialog: Props.instanceOf(Dialog).isRequired
     *     },
     *     render: function() { ... }
     *   });
     *
     * A more formal specification of how these methods are used:
     *
     *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
     *   decl := ReactPropTypes.{type}(.isRequired)?
     *
     * Each and every declaration produces a function with the same signature. This
     * allows the creation of custom validation functions. For example:
     *
     *  var MyLink = React.createClass({
     *    propTypes: {
     *      // An optional string or URI prop named "href".
     *      href: function(props, propName, componentName) {
     *        var propValue = props[propName];
     *        if (propValue != null && typeof propValue !== 'string' &&
     *            !(propValue instanceof URI)) {
     *          return new Error(
     *            'Expected a string or an URI for ' + propName + ' in ' +
     *            componentName
     *          );
     *        }
     *      }
     *    },
     *    render: function() {...}
     *  });
     *
     * @internal
     */


    var ANONYMOUS = '<<anonymous>>'; // Important!
    // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.

    var ReactPropTypes = {
      array: createPrimitiveTypeChecker('array'),
      bool: createPrimitiveTypeChecker('boolean'),
      func: createPrimitiveTypeChecker('function'),
      number: createPrimitiveTypeChecker('number'),
      object: createPrimitiveTypeChecker('object'),
      string: createPrimitiveTypeChecker('string'),
      symbol: createPrimitiveTypeChecker('symbol'),
      any: createAnyTypeChecker(),
      arrayOf: createArrayOfTypeChecker,
      element: createElementTypeChecker(),
      elementType: createElementTypeTypeChecker(),
      instanceOf: createInstanceTypeChecker,
      node: createNodeChecker(),
      objectOf: createObjectOfTypeChecker,
      oneOf: createEnumTypeChecker,
      oneOfType: createUnionTypeChecker,
      shape: createShapeTypeChecker,
      exact: createStrictShapeTypeChecker
    };
    /**
     * inlined Object.is polyfill to avoid requiring consumers ship their own
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
     */

    /*eslint-disable no-self-compare*/

    function is(x, y) {
      // SameValue algorithm
      if (x === y) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
      } else {
        // Step 6.a: NaN == NaN
        return x !== x && y !== y;
      }
    }
    /*eslint-enable no-self-compare*/

    /**
     * We use an Error-like object for backward compatibility as people may call
     * PropTypes directly and inspect their output. However, we don't use real
     * Errors anymore. We don't inspect their stack anyway, and creating them
     * is prohibitively expensive if they are created too often, such as what
     * happens in oneOfType() for any type before the one that matched.
     */


    function PropTypeError(message) {
      this.message = message;
      this.stack = '';
    } // Make `instanceof Error` still work for returned errors.


    PropTypeError.prototype = Error.prototype;

    function createChainableTypeChecker(validate) {
      if (process.env.NODE_ENV !== 'production') {
        var manualPropTypeCallCache = {};
        var manualPropTypeWarningCount = 0;
      }

      function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
        componentName = componentName || ANONYMOUS;
        propFullName = propFullName || propName;

        if (secret !== ReactPropTypesSecret_1) {
          if (throwOnDirectAccess) {
            // New behavior only for users of `prop-types` package
            var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
            err.name = 'Invariant Violation';
            throw err;
          } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            // Old behavior for people using React.PropTypes
            var cacheKey = componentName + ':' + propName;

            if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3) {
              printWarning$1('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
              manualPropTypeCallCache[cacheKey] = true;
              manualPropTypeWarningCount++;
            }
          }
        }

        if (props[propName] == null) {
          if (isRequired) {
            if (props[propName] === null) {
              return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
            }

            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
          }

          return null;
        } else {
          return validate(props, propName, componentName, location, propFullName);
        }
      }

      var chainedCheckType = checkType.bind(null, false);
      chainedCheckType.isRequired = checkType.bind(null, true);
      return chainedCheckType;
    }

    function createPrimitiveTypeChecker(expectedType) {
      function validate(props, propName, componentName, location, propFullName, secret) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== expectedType) {
          // `propValue` being instance of, say, date/regexp, pass the 'object'
          // check, but we can offer a more precise error message here rather than
          // 'of type `object`'.
          var preciseType = getPreciseType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createAnyTypeChecker() {
      return createChainableTypeChecker(emptyFunctionThatReturnsNull);
    }

    function createArrayOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
        }

        var propValue = props[propName];

        if (!Array.isArray(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
        }

        for (var i = 0; i < propValue.length; i++) {
          var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);

          if (error instanceof Error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createElementTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        if (!isValidElement(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createElementTypeTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        if (!reactIs.isValidElementType(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createInstanceTypeChecker(expectedClass) {
      function validate(props, propName, componentName, location, propFullName) {
        if (!(props[propName] instanceof expectedClass)) {
          var expectedClassName = expectedClass.name || ANONYMOUS;
          var actualClassName = getClassName(props[propName]);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createEnumTypeChecker(expectedValues) {
      if (!Array.isArray(expectedValues)) {
        if (process.env.NODE_ENV !== 'production') {
          if (arguments.length > 1) {
            printWarning$1('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
          } else {
            printWarning$1('Invalid argument supplied to oneOf, expected an array.');
          }
        }

        return emptyFunctionThatReturnsNull;
      }

      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        for (var i = 0; i < expectedValues.length; i++) {
          if (is(propValue, expectedValues[i])) {
            return null;
          }
        }

        var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
          var type = getPreciseType(value);

          if (type === 'symbol') {
            return String(value);
          }

          return value;
        });
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
      }

      return createChainableTypeChecker(validate);
    }

    function createObjectOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
        }

        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
        }

        for (var key in propValue) {
          if (has$1(propValue, key)) {
            var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

            if (error instanceof Error) {
              return error;
            }
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createUnionTypeChecker(arrayOfTypeCheckers) {
      if (!Array.isArray(arrayOfTypeCheckers)) {
        process.env.NODE_ENV !== 'production' ? printWarning$1('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
        return emptyFunctionThatReturnsNull;
      }

      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];

        if (typeof checker !== 'function') {
          printWarning$1('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
          return emptyFunctionThatReturnsNull;
        }
      }

      function validate(props, propName, componentName, location, propFullName) {
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];

          if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
            return null;
          }
        }

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
      }

      return createChainableTypeChecker(validate);
    }

    function createNodeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        if (!isNode(props[propName])) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }

        for (var key in shapeTypes) {
          var checker = shapeTypes[key];

          if (!checker) {
            continue;
          }

          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

          if (error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createStrictShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        } // We need to check all keys in case some are required but missing from
        // props.


        var allKeys = objectAssign({}, props[propName], shapeTypes);

        for (var key in allKeys) {
          var checker = shapeTypes[key];

          if (!checker) {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
          }

          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

          if (error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function isNode(propValue) {
      switch (typeof propValue) {
        case 'number':
        case 'string':
        case 'undefined':
          return true;

        case 'boolean':
          return !propValue;

        case 'object':
          if (Array.isArray(propValue)) {
            return propValue.every(isNode);
          }

          if (propValue === null || isValidElement(propValue)) {
            return true;
          }

          var iteratorFn = getIteratorFn(propValue);

          if (iteratorFn) {
            var iterator = iteratorFn.call(propValue);
            var step;

            if (iteratorFn !== propValue.entries) {
              while (!(step = iterator.next()).done) {
                if (!isNode(step.value)) {
                  return false;
                }
              }
            } else {
              // Iterator will provide entry [k,v] tuples rather than values.
              while (!(step = iterator.next()).done) {
                var entry = step.value;

                if (entry) {
                  if (!isNode(entry[1])) {
                    return false;
                  }
                }
              }
            }
          } else {
            return false;
          }

          return true;

        default:
          return false;
      }
    }

    function isSymbol(propType, propValue) {
      // Native Symbol.
      if (propType === 'symbol') {
        return true;
      } // falsy value can't be a Symbol


      if (!propValue) {
        return false;
      } // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'


      if (propValue['@@toStringTag'] === 'Symbol') {
        return true;
      } // Fallback for non-spec compliant Symbols which are polyfilled.


      if (typeof Symbol === 'function' && propValue instanceof Symbol) {
        return true;
      }

      return false;
    } // Equivalent of `typeof` but with special handling for array and regexp.


    function getPropType(propValue) {
      var propType = typeof propValue;

      if (Array.isArray(propValue)) {
        return 'array';
      }

      if (propValue instanceof RegExp) {
        // Old webkits (at least until Android 4.0) return 'function' rather than
        // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
        // passes PropTypes.object.
        return 'object';
      }

      if (isSymbol(propType, propValue)) {
        return 'symbol';
      }

      return propType;
    } // This handles more types than `getPropType`. Only used for error messages.
    // See `createPrimitiveTypeChecker`.


    function getPreciseType(propValue) {
      if (typeof propValue === 'undefined' || propValue === null) {
        return '' + propValue;
      }

      var propType = getPropType(propValue);

      if (propType === 'object') {
        if (propValue instanceof Date) {
          return 'date';
        } else if (propValue instanceof RegExp) {
          return 'regexp';
        }
      }

      return propType;
    } // Returns a string that is postfixed to a warning about an invalid type.
    // For example, "undefined" or "of type array"


    function getPostfixForTypeWarning(value) {
      var type = getPreciseType(value);

      switch (type) {
        case 'array':
        case 'object':
          return 'an ' + type;

        case 'boolean':
        case 'date':
        case 'regexp':
          return 'a ' + type;

        default:
          return type;
      }
    } // Returns class name of the object, if any.


    function getClassName(propValue) {
      if (!propValue.constructor || !propValue.constructor.name) {
        return ANONYMOUS;
      }

      return propValue.constructor.name;
    }

    ReactPropTypes.checkPropTypes = checkPropTypes_1;
    ReactPropTypes.resetWarningCache = checkPropTypes_1.resetWarningCache;
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };

  function emptyFunction() {}

  function emptyFunctionWithReset() {}

  emptyFunctionWithReset.resetWarningCache = emptyFunction;

  var factoryWithThrowingShims = function () {
    function shim(props, propName, componentName, location, propFullName, secret) {
      if (secret === ReactPropTypesSecret_1) {
        // It is still safe when called from React.
        return;
      }

      var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
      err.name = 'Invariant Violation';
      throw err;
    }
    shim.isRequired = shim;

    function getShim() {
      return shim;
    }
    // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.

    var ReactPropTypes = {
      array: shim,
      bool: shim,
      func: shim,
      number: shim,
      object: shim,
      string: shim,
      symbol: shim,
      any: shim,
      arrayOf: getShim,
      element: shim,
      elementType: shim,
      instanceOf: getShim,
      node: shim,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };

  var propTypes = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  if (process.env.NODE_ENV !== 'production') {
    var ReactIs = reactIs; // By explicitly using `prop-types` you are opting into new development behavior.
    // http://fb.me/prop-types-in-prod


    var throwOnDirectAccess = true;
    module.exports = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
  } else {
    // By explicitly using `prop-types` you are opting into new production behavior.
    // http://fb.me/prop-types-in-prod
    module.exports = factoryWithThrowingShims();
  }
  });

  var ReactReduxContext = /*#__PURE__*/React__default['default'].createContext(null);

  if (process.env.NODE_ENV !== 'production') {
    ReactReduxContext.displayName = 'ReactRedux';
  }

  // Default to a dummy "batch" implementation that just runs the callback
  function defaultNoopBatch(callback) {
    callback();
  }

  var batch = defaultNoopBatch; // Allow injecting another batching function later

  var setBatch = function setBatch(newBatch) {
    return batch = newBatch;
  }; // Supply a getter just to skip dealing with ESM bindings

  var getBatch = function getBatch() {
    return batch;
  };

  // well as nesting subscriptions of descendant components, so that we can ensure the
  // ancestor components re-render before descendants

  var nullListeners = {
    notify: function notify() {}
  };

  function createListenerCollection() {
    var batch = getBatch();
    var first = null;
    var last = null;
    return {
      clear: function clear() {
        first = null;
        last = null;
      },
      notify: function notify() {
        batch(function () {
          var listener = first;

          while (listener) {
            listener.callback();
            listener = listener.next;
          }
        });
      },
      get: function get() {
        var listeners = [];
        var listener = first;

        while (listener) {
          listeners.push(listener);
          listener = listener.next;
        }

        return listeners;
      },
      subscribe: function subscribe(callback) {
        var isSubscribed = true;
        var listener = last = {
          callback: callback,
          next: null,
          prev: last
        };

        if (listener.prev) {
          listener.prev.next = listener;
        } else {
          first = listener;
        }

        return function unsubscribe() {
          if (!isSubscribed || first === null) return;
          isSubscribed = false;

          if (listener.next) {
            listener.next.prev = listener.prev;
          } else {
            last = listener.prev;
          }

          if (listener.prev) {
            listener.prev.next = listener.next;
          } else {
            first = listener.next;
          }
        };
      }
    };
  }

  var Subscription = /*#__PURE__*/function () {
    function Subscription(store, parentSub) {
      this.store = store;
      this.parentSub = parentSub;
      this.unsubscribe = null;
      this.listeners = nullListeners;
      this.handleChangeWrapper = this.handleChangeWrapper.bind(this);
    }

    var _proto = Subscription.prototype;

    _proto.addNestedSub = function addNestedSub(listener) {
      this.trySubscribe();
      return this.listeners.subscribe(listener);
    };

    _proto.notifyNestedSubs = function notifyNestedSubs() {
      this.listeners.notify();
    };

    _proto.handleChangeWrapper = function handleChangeWrapper() {
      if (this.onStateChange) {
        this.onStateChange();
      }
    };

    _proto.isSubscribed = function isSubscribed() {
      return Boolean(this.unsubscribe);
    };

    _proto.trySubscribe = function trySubscribe() {
      if (!this.unsubscribe) {
        this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.handleChangeWrapper) : this.store.subscribe(this.handleChangeWrapper);
        this.listeners = createListenerCollection();
      }
    };

    _proto.tryUnsubscribe = function tryUnsubscribe() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
        this.listeners.clear();
        this.listeners = nullListeners;
      }
    };

    return Subscription;
  }();

  function Provider(_ref) {
    var store = _ref.store,
        context = _ref.context,
        children = _ref.children;
    var contextValue = React.useMemo(function () {
      var subscription = new Subscription(store);
      subscription.onStateChange = subscription.notifyNestedSubs;
      return {
        store: store,
        subscription: subscription
      };
    }, [store]);
    var previousState = React.useMemo(function () {
      return store.getState();
    }, [store]);
    React.useEffect(function () {
      var subscription = contextValue.subscription;
      subscription.trySubscribe();

      if (previousState !== store.getState()) {
        subscription.notifyNestedSubs();
      }

      return function () {
        subscription.tryUnsubscribe();
        subscription.onStateChange = null;
      };
    }, [contextValue, previousState]);
    var Context = context || ReactReduxContext;
    return /*#__PURE__*/React__default['default'].createElement(Context.Provider, {
      value: contextValue
    }, children);
  }

  if (process.env.NODE_ENV !== 'production') {
    Provider.propTypes = {
      store: propTypes.shape({
        subscribe: propTypes.func.isRequired,
        dispatch: propTypes.func.isRequired,
        getState: propTypes.func.isRequired
      }),
      context: propTypes.object,
      children: propTypes.any
    };
  }

  /**
   * Copyright 2015, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */


  var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };
  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };
  var FORWARD_REF_STATICS = {
    '$$typeof': true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    '$$typeof': true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
  TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

  function getStatics(component) {
    // React v16.11 and below
    if (reactIs.isMemo(component)) {
      return MEMO_STATICS;
    } // React v16.12 and above


    return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
  }

  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getPrototypeOf = Object.getPrototypeOf;
  var objectPrototype = Object.prototype;

  function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') {
      // don't hoist over string (html) components
      if (objectPrototype) {
        var inheritedComponent = getPrototypeOf(sourceComponent);

        if (inheritedComponent && inheritedComponent !== objectPrototype) {
          hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
      }

      var keys = getOwnPropertyNames(sourceComponent);

      if (getOwnPropertySymbols$1) {
        keys = keys.concat(getOwnPropertySymbols$1(sourceComponent));
      }

      var targetStatics = getStatics(targetComponent);
      var sourceStatics = getStatics(sourceComponent);

      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];

        if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
          var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

          try {
            // Avoid failures from read-only properties
            defineProperty(targetComponent, key, descriptor);
          } catch (e) {}
        }
      }
    }

    return targetComponent;
  }

  var hoistNonReactStatics_cjs = hoistNonReactStatics;

  // To get around it, we can conditionally useEffect on the server (no-op) and
  // useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
  // subscription callback always has the selector from the latest render commit
  // available, otherwise a store update may happen between render and the effect,
  // which may cause missed updates; we also must ensure the store subscription
  // is created synchronously, otherwise a store update may occur before the
  // subscription is created and an inconsistent state may be observed

  var useIsomorphicLayoutEffect = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  var EMPTY_ARRAY = [];
  var NO_SUBSCRIPTION_ARRAY = [null, null];

  var stringifyComponent = function stringifyComponent(Comp) {
    try {
      return JSON.stringify(Comp);
    } catch (err) {
      return String(Comp);
    }
  };

  function storeStateUpdatesReducer(state, action) {
    var updateCount = state[1];
    return [action.payload, updateCount + 1];
  }

  function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
    useIsomorphicLayoutEffect(function () {
      return effectFunc.apply(void 0, effectArgs);
    }, dependencies);
  }

  function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs) {
    // We want to capture the wrapper props and child props we used for later comparisons
    lastWrapperProps.current = wrapperProps;
    lastChildProps.current = actualChildProps;
    renderIsScheduled.current = false; // If the render was from a store update, clear out that reference and cascade the subscriber update

    if (childPropsFromStoreUpdate.current) {
      childPropsFromStoreUpdate.current = null;
      notifyNestedSubs();
    }
  }

  function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch) {
    // If we're not subscribed to the store, nothing to do here
    if (!shouldHandleStateChanges) return; // Capture values for checking if and when this component unmounts

    var didUnsubscribe = false;
    var lastThrownError = null; // We'll run this callback every time a store subscription update propagates to this component

    var checkForUpdates = function checkForUpdates() {
      if (didUnsubscribe) {
        // Don't run stale listeners.
        // Redux doesn't guarantee unsubscriptions happen until next dispatch.
        return;
      }

      var latestStoreState = store.getState();
      var newChildProps, error;

      try {
        // Actually run the selector with the most recent store state and wrapper props
        // to determine what the child props should be
        newChildProps = childPropsSelector(latestStoreState, lastWrapperProps.current);
      } catch (e) {
        error = e;
        lastThrownError = e;
      }

      if (!error) {
        lastThrownError = null;
      } // If the child props haven't changed, nothing to do here - cascade the subscription update


      if (newChildProps === lastChildProps.current) {
        if (!renderIsScheduled.current) {
          notifyNestedSubs();
        }
      } else {
        // Save references to the new child props.  Note that we track the "child props from store update"
        // as a ref instead of a useState/useReducer because we need a way to determine if that value has
        // been processed.  If this went into useState/useReducer, we couldn't clear out the value without
        // forcing another re-render, which we don't want.
        lastChildProps.current = newChildProps;
        childPropsFromStoreUpdate.current = newChildProps;
        renderIsScheduled.current = true; // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render

        forceComponentUpdateDispatch({
          type: 'STORE_UPDATED',
          payload: {
            error: error
          }
        });
      }
    }; // Actually subscribe to the nearest connected ancestor (or store)


    subscription.onStateChange = checkForUpdates;
    subscription.trySubscribe(); // Pull data from the store after first render in case the store has
    // changed since we began.

    checkForUpdates();

    var unsubscribeWrapper = function unsubscribeWrapper() {
      didUnsubscribe = true;
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;

      if (lastThrownError) {
        // It's possible that we caught an error due to a bad mapState function, but the
        // parent re-rendered without this component and we're about to unmount.
        // This shouldn't happen as long as we do top-down subscriptions correctly, but
        // if we ever do those wrong, this throw will surface the error in our tests.
        // In that case, throw the error from here so it doesn't get lost.
        throw lastThrownError;
      }
    };

    return unsubscribeWrapper;
  }

  var initStateUpdates = function initStateUpdates() {
    return [null, 0];
  };

  function connectAdvanced(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:
       export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)
     Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.
     Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */
  selectorFactory, // options object:
  _ref) {
    if (_ref === void 0) {
      _ref = {};
    }

    var _ref2 = _ref,
        _ref2$getDisplayName = _ref2.getDisplayName,
        getDisplayName = _ref2$getDisplayName === void 0 ? function (name) {
      return "ConnectAdvanced(" + name + ")";
    } : _ref2$getDisplayName,
        _ref2$methodName = _ref2.methodName,
        methodName = _ref2$methodName === void 0 ? 'connectAdvanced' : _ref2$methodName,
        _ref2$renderCountProp = _ref2.renderCountProp,
        renderCountProp = _ref2$renderCountProp === void 0 ? undefined : _ref2$renderCountProp,
        _ref2$shouldHandleSta = _ref2.shouldHandleStateChanges,
        shouldHandleStateChanges = _ref2$shouldHandleSta === void 0 ? true : _ref2$shouldHandleSta,
        _ref2$storeKey = _ref2.storeKey,
        storeKey = _ref2$storeKey === void 0 ? 'store' : _ref2$storeKey,
        _ref2$withRef = _ref2.withRef,
        withRef = _ref2$withRef === void 0 ? false : _ref2$withRef,
        _ref2$forwardRef = _ref2.forwardRef,
        forwardRef = _ref2$forwardRef === void 0 ? false : _ref2$forwardRef,
        _ref2$context = _ref2.context,
        context = _ref2$context === void 0 ? ReactReduxContext : _ref2$context,
        connectOptions = _objectWithoutPropertiesLoose(_ref2, ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"]);

    if (process.env.NODE_ENV !== 'production') {
      if (renderCountProp !== undefined) {
        throw new Error("renderCountProp is removed. render counting is built into the latest React Dev Tools profiling extension");
      }

      if (withRef) {
        throw new Error('withRef is removed. To access the wrapped instance, use a ref on the connected component');
      }

      var customStoreWarningMessage = 'To use a custom Redux store for specific components, create a custom React context with ' + "React.createContext(), and pass the context object to React Redux's Provider and specific components" + ' like: <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' + 'You may also pass a {context : MyContext} option to connect';

      if (storeKey !== 'store') {
        throw new Error('storeKey has been removed and does not do anything. ' + customStoreWarningMessage);
      }
    }

    var Context = context;
    return function wrapWithConnect(WrappedComponent) {
      if (process.env.NODE_ENV !== 'production' && !reactIs.isValidElementType(WrappedComponent)) {
        throw new Error("You must pass a component to the function returned by " + (methodName + ". Instead received " + stringifyComponent(WrappedComponent)));
      }

      var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
      var displayName = getDisplayName(wrappedComponentName);

      var selectorFactoryOptions = _extends({}, connectOptions, {
        getDisplayName: getDisplayName,
        methodName: methodName,
        renderCountProp: renderCountProp,
        shouldHandleStateChanges: shouldHandleStateChanges,
        storeKey: storeKey,
        displayName: displayName,
        wrappedComponentName: wrappedComponentName,
        WrappedComponent: WrappedComponent
      });

      var pure = connectOptions.pure;

      function createChildSelector(store) {
        return selectorFactory(store.dispatch, selectorFactoryOptions);
      } // If we aren't running in "pure" mode, we don't want to memoize values.
      // To avoid conditionally calling hooks, we fall back to a tiny wrapper
      // that just executes the given callback immediately.


      var usePureOnlyMemo = pure ? React.useMemo : function (callback) {
        return callback();
      };

      function ConnectFunction(props) {
        var _useMemo = React.useMemo(function () {
          // Distinguish between actual "data" props that were passed to the wrapper component,
          // and values needed to control behavior (forwarded refs, alternate context instances).
          // To maintain the wrapperProps object reference, memoize this destructuring.
          var reactReduxForwardedRef = props.reactReduxForwardedRef,
              wrapperProps = _objectWithoutPropertiesLoose(props, ["reactReduxForwardedRef"]);

          return [props.context, reactReduxForwardedRef, wrapperProps];
        }, [props]),
            propsContext = _useMemo[0],
            reactReduxForwardedRef = _useMemo[1],
            wrapperProps = _useMemo[2];

        var ContextToUse = React.useMemo(function () {
          // Users may optionally pass in a custom context instance to use instead of our ReactReduxContext.
          // Memoize the check that determines which context instance we should use.
          return propsContext && propsContext.Consumer && reactIs.isContextConsumer( /*#__PURE__*/React__default['default'].createElement(propsContext.Consumer, null)) ? propsContext : Context;
        }, [propsContext, Context]); // Retrieve the store and ancestor subscription via context, if available

        var contextValue = React.useContext(ContextToUse); // The store _must_ exist as either a prop or in context.
        // We'll check to see if it _looks_ like a Redux store first.
        // This allows us to pass through a `store` prop that is just a plain value.

        var didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
        var didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);

        if (process.env.NODE_ENV !== 'production' && !didStoreComeFromProps && !didStoreComeFromContext) {
          throw new Error("Could not find \"store\" in the context of " + ("\"" + displayName + "\". Either wrap the root component in a <Provider>, ") + "or pass a custom React context provider to <Provider> and the corresponding " + ("React context consumer to " + displayName + " in connect options."));
        } // Based on the previous check, one of these must be true


        var store = didStoreComeFromProps ? props.store : contextValue.store;
        var childPropsSelector = React.useMemo(function () {
          // The child props selector needs the store reference as an input.
          // Re-create this selector whenever the store changes.
          return createChildSelector(store);
        }, [store]);

        var _useMemo2 = React.useMemo(function () {
          if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY; // This Subscription's source should match where store came from: props vs. context. A component
          // connected to the store via props shouldn't use subscription from context, or vice versa.

          var subscription = new Subscription(store, didStoreComeFromProps ? null : contextValue.subscription); // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
          // the middle of the notification loop, where `subscription` will then be null. This can
          // probably be avoided if Subscription's listeners logic is changed to not call listeners
          // that have been unsubscribed in the  middle of the notification loop.

          var notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);
          return [subscription, notifyNestedSubs];
        }, [store, didStoreComeFromProps, contextValue]),
            subscription = _useMemo2[0],
            notifyNestedSubs = _useMemo2[1]; // Determine what {store, subscription} value should be put into nested context, if necessary,
        // and memoize that value to avoid unnecessary context updates.


        var overriddenContextValue = React.useMemo(function () {
          if (didStoreComeFromProps) {
            // This component is directly subscribed to a store from props.
            // We don't want descendants reading from this store - pass down whatever
            // the existing context value is from the nearest connected ancestor.
            return contextValue;
          } // Otherwise, put this component's subscription instance into context, so that
          // connected descendants won't update until after this component is done


          return _extends({}, contextValue, {
            subscription: subscription
          });
        }, [didStoreComeFromProps, contextValue, subscription]); // We need to force this wrapper component to re-render whenever a Redux store update
        // causes a change to the calculated child component props (or we caught an error in mapState)

        var _useReducer = React.useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates),
            _useReducer$ = _useReducer[0],
            previousStateUpdateResult = _useReducer$[0],
            forceComponentUpdateDispatch = _useReducer[1]; // Propagate any mapState/mapDispatch errors upwards


        if (previousStateUpdateResult && previousStateUpdateResult.error) {
          throw previousStateUpdateResult.error;
        } // Set up refs to coordinate values between the subscription effect and the render logic


        var lastChildProps = React.useRef();
        var lastWrapperProps = React.useRef(wrapperProps);
        var childPropsFromStoreUpdate = React.useRef();
        var renderIsScheduled = React.useRef(false);
        var actualChildProps = usePureOnlyMemo(function () {
          // Tricky logic here:
          // - This render may have been triggered by a Redux store update that produced new child props
          // - However, we may have gotten new wrapper props after that
          // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
          // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
          // So, we'll use the child props from store update only if the wrapper props are the same as last time.
          if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
            return childPropsFromStoreUpdate.current;
          } // TODO We're reading the store directly in render() here. Bad idea?
          // This will likely cause Bad Things (TM) to happen in Concurrent Mode.
          // Note that we do this because on renders _not_ caused by store updates, we need the latest store state
          // to determine what the child props should be.


          return childPropsSelector(store.getState(), wrapperProps);
        }, [store, previousStateUpdateResult, wrapperProps]); // We need this to execute synchronously every time we re-render. However, React warns
        // about useLayoutEffect in SSR, so we try to detect environment and fall back to
        // just useEffect instead to avoid the warning, since neither will run anyway.

        useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs]); // Our re-subscribe logic only runs when the store/subscription setup changes

        useIsomorphicLayoutEffectWithArgs(subscribeUpdates, [shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch], [store, subscription, childPropsSelector]); // Now that all that's done, we can finally try to actually render the child component.
        // We memoize the elements for the rendered child component as an optimization.

        var renderedWrappedComponent = React.useMemo(function () {
          return /*#__PURE__*/React__default['default'].createElement(WrappedComponent, _extends({}, actualChildProps, {
            ref: reactReduxForwardedRef
          }));
        }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]); // If React sees the exact same element reference as last time, it bails out of re-rendering
        // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.

        var renderedChild = React.useMemo(function () {
          if (shouldHandleStateChanges) {
            // If this component is subscribed to store updates, we need to pass its own
            // subscription instance down to our descendants. That means rendering the same
            // Context instance, and putting a different value into the context.
            return /*#__PURE__*/React__default['default'].createElement(ContextToUse.Provider, {
              value: overriddenContextValue
            }, renderedWrappedComponent);
          }

          return renderedWrappedComponent;
        }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);
        return renderedChild;
      } // If we're in "pure" mode, ensure our wrapper component only re-renders when incoming props have changed.


      var Connect = pure ? React__default['default'].memo(ConnectFunction) : ConnectFunction;
      Connect.WrappedComponent = WrappedComponent;
      Connect.displayName = displayName;

      if (forwardRef) {
        var forwarded = React__default['default'].forwardRef(function forwardConnectRef(props, ref) {
          return /*#__PURE__*/React__default['default'].createElement(Connect, _extends({}, props, {
            reactReduxForwardedRef: ref
          }));
        });
        forwarded.displayName = displayName;
        forwarded.WrappedComponent = WrappedComponent;
        return hoistNonReactStatics_cjs(forwarded, WrappedComponent);
      }

      return hoistNonReactStatics_cjs(Connect, WrappedComponent);
    };
  }

  function is(x, y) {
    if (x === y) {
      return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true;

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;

    for (var i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param {any} obj The object to inspect.
   * @returns {boolean} True if the argument appears to be a plain object.
   */
  function isPlainObject$2(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = Object.getPrototypeOf(obj);
    if (proto === null) return true;
    var baseProto = proto;

    while (Object.getPrototypeOf(baseProto) !== null) {
      baseProto = Object.getPrototypeOf(baseProto);
    }

    return proto === baseProto;
  }

  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */
  function warning$1(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */


    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
      /* eslint-disable no-empty */
    } catch (e) {}
    /* eslint-enable no-empty */

  }

  function verifyPlainObject(value, displayName, methodName) {
    if (!isPlainObject$2(value)) {
      warning$1(methodName + "() in " + displayName + " must return a plain object. Instead received " + value + ".");
    }
  }

  function wrapMapToPropsConstant(getConstant) {
    return function initConstantSelector(dispatch, options) {
      var constant = getConstant(dispatch, options);

      function constantSelector() {
        return constant;
      }

      constantSelector.dependsOnOwnProps = false;
      return constantSelector;
    };
  } // dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
  // to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
  // whether mapToProps needs to be invoked when props have changed.
  //
  // A length of one signals that mapToProps does not depend on props from the parent component.
  // A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
  // therefore not reporting its length accurately..

  function getDependsOnOwnProps(mapToProps) {
    return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
  } // Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
  // this function wraps mapToProps in a proxy function which does several things:
  //
  //  * Detects whether the mapToProps function being called depends on props, which
  //    is used by selectorFactory to decide if it should reinvoke on props changes.
  //
  //  * On first call, handles mapToProps if returns another function, and treats that
  //    new function as the true mapToProps for subsequent calls.
  //
  //  * On first call, verifies the first result is a plain object, in order to warn
  //    the developer that their mapToProps function is not returning a valid result.
  //

  function wrapMapToPropsFunc(mapToProps, methodName) {
    return function initProxySelector(dispatch, _ref) {
      var displayName = _ref.displayName;

      var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
        return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
      }; // allow detectFactoryAndVerify to get ownProps


      proxy.dependsOnOwnProps = true;

      proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
        proxy.mapToProps = mapToProps;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
        var props = proxy(stateOrDispatch, ownProps);

        if (typeof props === 'function') {
          proxy.mapToProps = props;
          proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
          props = proxy(stateOrDispatch, ownProps);
        }

        if (process.env.NODE_ENV !== 'production') verifyPlainObject(props, displayName, methodName);
        return props;
      };

      return proxy;
    };
  }

  function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    return typeof mapDispatchToProps === 'function' ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps') : undefined;
  }
  function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    return !mapDispatchToProps ? wrapMapToPropsConstant(function (dispatch) {
      return {
        dispatch: dispatch
      };
    }) : undefined;
  }
  function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? wrapMapToPropsConstant(function (dispatch) {
      return bindActionCreators(mapDispatchToProps, dispatch);
    }) : undefined;
  }
  var defaultMapDispatchToPropsFactories = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];

  function whenMapStateToPropsIsFunction(mapStateToProps) {
    return typeof mapStateToProps === 'function' ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps') : undefined;
  }
  function whenMapStateToPropsIsMissing(mapStateToProps) {
    return !mapStateToProps ? wrapMapToPropsConstant(function () {
      return {};
    }) : undefined;
  }
  var defaultMapStateToPropsFactories = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];

  function defaultMergeProps(stateProps, dispatchProps, ownProps) {
    return _extends({}, ownProps, stateProps, dispatchProps);
  }
  function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, _ref) {
      var displayName = _ref.displayName,
          pure = _ref.pure,
          areMergedPropsEqual = _ref.areMergedPropsEqual;
      var hasRunOnce = false;
      var mergedProps;
      return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
        var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        if (hasRunOnce) {
          if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
        } else {
          hasRunOnce = true;
          mergedProps = nextMergedProps;
          if (process.env.NODE_ENV !== 'production') verifyPlainObject(mergedProps, displayName, 'mergeProps');
        }

        return mergedProps;
      };
    };
  }
  function whenMergePropsIsFunction(mergeProps) {
    return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
  }
  function whenMergePropsIsOmitted(mergeProps) {
    return !mergeProps ? function () {
      return defaultMergeProps;
    } : undefined;
  }
  var defaultMergePropsFactories = [whenMergePropsIsFunction, whenMergePropsIsOmitted];

  function verify(selector, methodName, displayName) {
    if (!selector) {
      throw new Error("Unexpected value for " + methodName + " in " + displayName + ".");
    } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
      if (!Object.prototype.hasOwnProperty.call(selector, 'dependsOnOwnProps')) {
        warning$1("The selector for " + methodName + " of " + displayName + " did not specify a value for dependsOnOwnProps.");
      }
    }
  }

  function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
    verify(mapStateToProps, 'mapStateToProps', displayName);
    verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
    verify(mergeProps, 'mergeProps', displayName);
  }

  function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
    return function impureFinalPropsSelector(state, ownProps) {
      return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
    };
  }
  function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
    var areStatesEqual = _ref.areStatesEqual,
        areOwnPropsEqual = _ref.areOwnPropsEqual,
        areStatePropsEqual = _ref.areStatePropsEqual;
    var hasRunAtLeastOnce = false;
    var state;
    var ownProps;
    var stateProps;
    var dispatchProps;
    var mergedProps;

    function handleFirstCall(firstState, firstOwnProps) {
      state = firstState;
      ownProps = firstOwnProps;
      stateProps = mapStateToProps(state, ownProps);
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      hasRunAtLeastOnce = true;
      return mergedProps;
    }

    function handleNewPropsAndNewState() {
      stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewProps() {
      if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewState() {
      var nextStateProps = mapStateToProps(state, ownProps);
      var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
      stateProps = nextStateProps;
      if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
      var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
      var stateChanged = !areStatesEqual(nextState, state);
      state = nextState;
      ownProps = nextOwnProps;
      if (propsChanged && stateChanged) return handleNewPropsAndNewState();
      if (propsChanged) return handleNewProps();
      if (stateChanged) return handleNewState();
      return mergedProps;
    }

    return function pureFinalPropsSelector(nextState, nextOwnProps) {
      return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
    };
  } // TODO: Add more comments
  // If pure is true, the selector returned by selectorFactory will memoize its results,
  // allowing connectAdvanced's shouldComponentUpdate to return false if final
  // props have not changed. If false, the selector will always return a new
  // object and shouldComponentUpdate will always return true.

  function finalPropsSelectorFactory(dispatch, _ref2) {
    var initMapStateToProps = _ref2.initMapStateToProps,
        initMapDispatchToProps = _ref2.initMapDispatchToProps,
        initMergeProps = _ref2.initMergeProps,
        options = _objectWithoutPropertiesLoose(_ref2, ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"]);

    var mapStateToProps = initMapStateToProps(dispatch, options);
    var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    var mergeProps = initMergeProps(dispatch, options);

    if (process.env.NODE_ENV !== 'production') {
      verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
    return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
  }

  /*
    connect is a facade over connectAdvanced. It turns its args into a compatible
    selectorFactory, which has the signature:

      (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
    
    connect passes its args to connectAdvanced as options, which will in turn pass them to
    selectorFactory each time a Connect component instance is instantiated or hot reloaded.

    selectorFactory returns a final props selector from its mapStateToProps,
    mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
    mergePropsFactories, and pure args.

    The resulting final props selector is called by the Connect component instance whenever
    it receives new props or store state.
   */

  function match(arg, factories, name) {
    for (var i = factories.length - 1; i >= 0; i--) {
      var result = factories[i](arg);
      if (result) return result;
    }

    return function (dispatch, options) {
      throw new Error("Invalid value of type " + typeof arg + " for " + name + " argument when connecting component " + options.wrappedComponentName + ".");
    };
  }

  function strictEqual(a, b) {
    return a === b;
  } // createConnect with default args builds the 'official' connect behavior. Calling it with
  // different options opens up some testing and extensibility scenarios


  function createConnect(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$connectHOC = _ref.connectHOC,
        connectHOC = _ref$connectHOC === void 0 ? connectAdvanced : _ref$connectHOC,
        _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
        mapStateToPropsFactories = _ref$mapStateToPropsF === void 0 ? defaultMapStateToPropsFactories : _ref$mapStateToPropsF,
        _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
        mapDispatchToPropsFactories = _ref$mapDispatchToPro === void 0 ? defaultMapDispatchToPropsFactories : _ref$mapDispatchToPro,
        _ref$mergePropsFactor = _ref.mergePropsFactories,
        mergePropsFactories = _ref$mergePropsFactor === void 0 ? defaultMergePropsFactories : _ref$mergePropsFactor,
        _ref$selectorFactory = _ref.selectorFactory,
        selectorFactory = _ref$selectorFactory === void 0 ? finalPropsSelectorFactory : _ref$selectorFactory;

    return function connect(mapStateToProps, mapDispatchToProps, mergeProps, _ref2) {
      if (_ref2 === void 0) {
        _ref2 = {};
      }

      var _ref3 = _ref2,
          _ref3$pure = _ref3.pure,
          pure = _ref3$pure === void 0 ? true : _ref3$pure,
          _ref3$areStatesEqual = _ref3.areStatesEqual,
          areStatesEqual = _ref3$areStatesEqual === void 0 ? strictEqual : _ref3$areStatesEqual,
          _ref3$areOwnPropsEqua = _ref3.areOwnPropsEqual,
          areOwnPropsEqual = _ref3$areOwnPropsEqua === void 0 ? shallowEqual : _ref3$areOwnPropsEqua,
          _ref3$areStatePropsEq = _ref3.areStatePropsEqual,
          areStatePropsEqual = _ref3$areStatePropsEq === void 0 ? shallowEqual : _ref3$areStatePropsEq,
          _ref3$areMergedPropsE = _ref3.areMergedPropsEqual,
          areMergedPropsEqual = _ref3$areMergedPropsE === void 0 ? shallowEqual : _ref3$areMergedPropsE,
          extraOptions = _objectWithoutPropertiesLoose(_ref3, ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"]);

      var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
      var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
      var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
      return connectHOC(selectorFactory, _extends({
        // used in error messages
        methodName: 'connect',
        // used to compute Connect's displayName from the wrapped component's displayName.
        getDisplayName: function getDisplayName(name) {
          return "Connect(" + name + ")";
        },
        // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
        shouldHandleStateChanges: Boolean(mapStateToProps),
        // passed through to selectorFactory
        initMapStateToProps: initMapStateToProps,
        initMapDispatchToProps: initMapDispatchToProps,
        initMergeProps: initMergeProps,
        pure: pure,
        areStatesEqual: areStatesEqual,
        areOwnPropsEqual: areOwnPropsEqual,
        areStatePropsEqual: areStatePropsEqual,
        areMergedPropsEqual: areMergedPropsEqual
      }, extraOptions));
    };
  }
  var baseConnect = /*#__PURE__*/createConnect();

  setBatch(ReactDOM.unstable_batchedUpdates);

  function renderApp$1(moduleGetter, appModuleName, appViewName, storeOptions, container, beforeRender) {
    if (container === void 0) {
      container = 'root';
    }

    return renderApp(function (store, appModel, AppView, ssrInitStoreKey) {
      var reRender = function reRender(View) {
        var reduxProvider = React__default['default'].createElement(Provider, {
          store: store
        }, React__default['default'].createElement(View, null));

        if (typeof container === 'function') {
          container(reduxProvider);
        } else {
          var panel = typeof container === 'string' ? env.document.getElementById(container) : container;
          ReactDOM__default['default'].unmountComponentAtNode(panel);
          var render = env[ssrInitStoreKey] ? ReactDOM__default['default'].hydrate : ReactDOM__default['default'].render;
          render(reduxProvider, panel);
        }
      };

      reRender(AppView);
      return reRender;
    }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
  }
  function renderSSR$1(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, beforeRender) {
    if (storeOptions === void 0) {
      storeOptions = {};
    }

    if (renderToStream === void 0) {
      renderToStream = false;
    }

    return renderSSR(function (store, appModel, AppView, ssrInitStoreKey) {
      var data = store.getState();
      var reduxProvider = React__default['default'].createElement(Provider, {
        store: store
      }, React__default['default'].createElement(AppView, null));
      var render = renderToStream ? server.renderToNodeStream : server.renderToString;
      return {
        store: store,
        ssrInitStoreKey: ssrInitStoreKey,
        data: data,
        html: render(reduxProvider)
      };
    }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
  }

  var LoadViewOnError = function LoadViewOnError() {
    return React__default['default'].createElement("div", null, "error");
  };

  var loadView = function loadView(moduleName, viewName, options, Loading, Error) {
    var _ref = options || {},
        forwardRef = _ref.forwardRef;

    var active = true;

    var Loader = function ViewLoader(props) {
      React.useEffect(function () {
        return function () {
          active = false;
        };
      }, []);

      var _useState = React.useState(function () {
        var moduleViewResult = getView(moduleName, viewName);

        if (isPromise(moduleViewResult)) {
          moduleViewResult.then(function (Component) {
            active && setView({
              Component: Component
            });
          }).catch(function () {
            active && setView({
              Component: Error || LoadViewOnError
            });
          });
          return null;
        }

        return {
          Component: moduleViewResult
        };
      }),
          view = _useState[0],
          setView = _useState[1];

      var forwardRef2 = props.forwardRef2,
          other = _objectWithoutPropertiesLoose(props, ["forwardRef2"]);

      var ref = forwardRef ? {
        ref: forwardRef2
      } : {};
      return view ? React__default['default'].createElement(view.Component, _extends({}, other, ref)) : Loading ? React__default['default'].createElement(Loading, props) : null;
    };

    var Component = forwardRef ? React__default['default'].forwardRef(function (props, ref) {
      return React__default['default'].createElement(Loader, _extends({}, props, {
        forwardRef: ref
      }));
    }) : Loader;
    return Component;
  };
  var exportModule$1 = exportModule;

  function isAbsolute(pathname) {
    return pathname.charAt(0) === '/';
  } // About 1.5x faster than the two-arg version of Array#splice()


  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
      list[i] = list[k];
    }

    list.pop();
  } // This implementation is based heavily on node's url.parse


  function resolvePathname(to, from) {
    if (from === undefined) from = '';
    var toParts = to && to.split('/') || [];
    var fromParts = from && from.split('/') || [];
    var isToAbs = to && isAbsolute(to);
    var isFromAbs = from && isAbsolute(from);
    var mustEndAbs = isToAbs || isFromAbs;

    if (to && isAbsolute(to)) {
      // to is absolute
      fromParts = toParts;
    } else if (toParts.length) {
      // to is relative, drop the filename
      fromParts.pop();
      fromParts = fromParts.concat(toParts);
    }

    if (!fromParts.length) return '/';
    var hasTrailingSlash;

    if (fromParts.length) {
      var last = fromParts[fromParts.length - 1];
      hasTrailingSlash = last === '.' || last === '..' || last === '';
    } else {
      hasTrailingSlash = false;
    }

    var up = 0;

    for (var i = fromParts.length; i >= 0; i--) {
      var part = fromParts[i];

      if (part === '.') {
        spliceOne(fromParts, i);
      } else if (part === '..') {
        spliceOne(fromParts, i);
        up++;
      } else if (up) {
        spliceOne(fromParts, i);
        up--;
      }
    }

    if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');
    if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
    var result = fromParts.join('/');
    if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
    return result;
  }

  var isProduction = process.env.NODE_ENV === 'production';

  function warning$2(condition, message) {
    if (!isProduction) {
      if (condition) {
        return;
      }

      var text = "Warning: " + message;

      if (typeof console !== 'undefined') {
        console.warn(text);
      }

      try {
        throw Error(text);
      } catch (x) {}
    }
  }

  var isProduction$1 = process.env.NODE_ENV === 'production';
  var prefix = 'Invariant failed';

  function invariant(condition, message) {
    if (condition) {
      return;
    }

    if (isProduction$1) {
      throw new Error(prefix);
    }

    throw new Error(prefix + ": " + (message || ''));
  }

  function addLeadingSlash(path) {
    return path.charAt(0) === '/' ? path : '/' + path;
  }

  function stripLeadingSlash(path) {
    return path.charAt(0) === '/' ? path.substr(1) : path;
  }

  function hasBasename(path, prefix) {
    return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && '/?#'.indexOf(path.charAt(prefix.length)) !== -1;
  }

  function stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
  }

  function stripTrailingSlash(path) {
    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
  }

  function parsePath(path) {
    var pathname = path || '/';
    var search = '';
    var hash = '';
    var hashIndex = pathname.indexOf('#');

    if (hashIndex !== -1) {
      hash = pathname.substr(hashIndex);
      pathname = pathname.substr(0, hashIndex);
    }

    var searchIndex = pathname.indexOf('?');

    if (searchIndex !== -1) {
      search = pathname.substr(searchIndex);
      pathname = pathname.substr(0, searchIndex);
    }

    return {
      pathname: pathname,
      search: search === '?' ? '' : search,
      hash: hash === '#' ? '' : hash
    };
  }

  function createPath(location) {
    var pathname = location.pathname,
        search = location.search,
        hash = location.hash;
    var path = pathname || '/';
    if (search && search !== '?') path += search.charAt(0) === '?' ? search : "?" + search;
    if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : "#" + hash;
    return path;
  }

  function createLocation(path, state, key, currentLocation) {
    var location;

    if (typeof path === 'string') {
      // Two-arg form: push(path, state)
      location = parsePath(path);
      location.state = state;
    } else {
      // One-arg form: push(location)
      location = _extends({}, path);
      if (location.pathname === undefined) location.pathname = '';

      if (location.search) {
        if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
      } else {
        location.search = '';
      }

      if (location.hash) {
        if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
      } else {
        location.hash = '';
      }

      if (state !== undefined && location.state === undefined) location.state = state;
    }

    try {
      location.pathname = decodeURI(location.pathname);
    } catch (e) {
      if (e instanceof URIError) {
        throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
      } else {
        throw e;
      }
    }

    if (key) location.key = key;

    if (currentLocation) {
      // Resolve incomplete/relative pathname relative to current location.
      if (!location.pathname) {
        location.pathname = currentLocation.pathname;
      } else if (location.pathname.charAt(0) !== '/') {
        location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
      }
    } else {
      // When there is no prior location and pathname is empty, set it to /
      if (!location.pathname) {
        location.pathname = '/';
      }
    }

    return location;
  }

  function createTransitionManager() {
    var prompt = null;

    function setPrompt(nextPrompt) {
      process.env.NODE_ENV !== "production" ? warning$2(prompt == null, 'A history supports only one prompt at a time') : void 0;
      prompt = nextPrompt;
      return function () {
        if (prompt === nextPrompt) prompt = null;
      };
    }

    function confirmTransitionTo(location, action, getUserConfirmation, callback) {
      // TODO: If another transition starts while we're still confirming
      // the previous one, we may end up in a weird state. Figure out the
      // best way to handle this.
      if (prompt != null) {
        var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

        if (typeof result === 'string') {
          if (typeof getUserConfirmation === 'function') {
            getUserConfirmation(result, callback);
          } else {
            process.env.NODE_ENV !== "production" ? warning$2(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
            callback(true);
          }
        } else {
          // Return false from a transition hook to cancel the transition.
          callback(result !== false);
        }
      } else {
        callback(true);
      }
    }

    var listeners = [];

    function appendListener(fn) {
      var isActive = true;

      function listener() {
        if (isActive) fn.apply(void 0, arguments);
      }

      listeners.push(listener);
      return function () {
        isActive = false;
        listeners = listeners.filter(function (item) {
          return item !== listener;
        });
      };
    }

    function notifyListeners() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      listeners.forEach(function (listener) {
        return listener.apply(void 0, args);
      });
    }

    return {
      setPrompt: setPrompt,
      confirmTransitionTo: confirmTransitionTo,
      appendListener: appendListener,
      notifyListeners: notifyListeners
    };
  }

  var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

  function getConfirmation(message, callback) {
    callback(window.confirm(message)); // eslint-disable-line no-alert
  }
  /**
   * Returns true if the HTML5 history API is supported. Taken from Modernizr.
   *
   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
   * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
   */


  function supportsHistory() {
    var ua = window.navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
    return window.history && 'pushState' in window.history;
  }
  /**
   * Returns true if browser fires popstate on hash change.
   * IE10 and IE11 do not.
   */


  function supportsPopStateOnHashChange() {
    return window.navigator.userAgent.indexOf('Trident') === -1;
  }
  /**
   * Returns false if using go(n) with hash history causes a full page reload.
   */


  function supportsGoWithoutReloadUsingHash() {
    return window.navigator.userAgent.indexOf('Firefox') === -1;
  }
  /**
   * Returns true if a given popstate event is an extraneous WebKit event.
   * Accounts for the fact that Chrome on iOS fires real popstate events
   * containing undefined state when pressing the back button.
   */


  function isExtraneousPopstateEvent(event) {
    return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
  }

  var PopStateEvent = 'popstate';
  var HashChangeEvent = 'hashchange';

  function getHistoryState() {
    try {
      return window.history.state || {};
    } catch (e) {
      // IE 11 sometimes throws when accessing window.history.state
      // See https://github.com/ReactTraining/history/pull/289
      return {};
    }
  }
  /**
   * Creates a history object that uses the HTML5 history API including
   * pushState, replaceState, and the popstate event.
   */


  function createBrowserHistory(props) {
    if (props === void 0) {
      props = {};
    }

    !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Browser history needs a DOM') : invariant(false) : void 0;
    var globalHistory = window.history;
    var canUseHistory = supportsHistory();
    var needsHashChangeListener = !supportsPopStateOnHashChange();
    var _props = props,
        _props$forceRefresh = _props.forceRefresh,
        forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh,
        _props$getUserConfirm = _props.getUserConfirmation,
        getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
        _props$keyLength = _props.keyLength,
        keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
    var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

    function getDOMLocation(historyState) {
      var _ref = historyState || {},
          key = _ref.key,
          state = _ref.state;

      var _window$location = window.location,
          pathname = _window$location.pathname,
          search = _window$location.search,
          hash = _window$location.hash;
      var path = pathname + search + hash;
      process.env.NODE_ENV !== "production" ? warning$2(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
      if (basename) path = stripBasename(path, basename);
      return createLocation(path, state, key);
    }

    function createKey() {
      return Math.random().toString(36).substr(2, keyLength);
    }

    var transitionManager = createTransitionManager();

    function setState(nextState) {
      _extends(history, nextState);

      history.length = globalHistory.length;
      transitionManager.notifyListeners(history.location, history.action);
    }

    function handlePopState(event) {
      // Ignore extraneous popstate events in WebKit.
      if (isExtraneousPopstateEvent(event)) return;
      handlePop(getDOMLocation(event.state));
    }

    function handleHashChange() {
      handlePop(getDOMLocation(getHistoryState()));
    }

    var forceNextPop = false;

    function handlePop(location) {
      if (forceNextPop) {
        forceNextPop = false;
        setState();
      } else {
        var action = 'POP';
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
          if (ok) {
            setState({
              action: action,
              location: location
            });
          } else {
            revertPop(location);
          }
        });
      }
    }

    function revertPop(fromLocation) {
      var toLocation = history.location; // TODO: We could probably make this more reliable by
      // keeping a list of keys we've seen in sessionStorage.
      // Instead, we just default to 0 for keys we don't know.

      var toIndex = allKeys.indexOf(toLocation.key);
      if (toIndex === -1) toIndex = 0;
      var fromIndex = allKeys.indexOf(fromLocation.key);
      if (fromIndex === -1) fromIndex = 0;
      var delta = toIndex - fromIndex;

      if (delta) {
        forceNextPop = true;
        go(delta);
      }
    }

    var initialLocation = getDOMLocation(getHistoryState());
    var allKeys = [initialLocation.key]; // Public interface

    function createHref(location) {
      return basename + createPath(location);
    }

    function push(path, state) {
      process.env.NODE_ENV !== "production" ? warning$2(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
      var action = 'PUSH';
      var location = createLocation(path, state, createKey(), history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var href = createHref(location);
        var key = location.key,
            state = location.state;

        if (canUseHistory) {
          globalHistory.pushState({
            key: key,
            state: state
          }, null, href);

          if (forceRefresh) {
            window.location.href = href;
          } else {
            var prevIndex = allKeys.indexOf(history.location.key);
            var nextKeys = allKeys.slice(0, prevIndex + 1);
            nextKeys.push(location.key);
            allKeys = nextKeys;
            setState({
              action: action,
              location: location
            });
          }
        } else {
          process.env.NODE_ENV !== "production" ? warning$2(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
          window.location.href = href;
        }
      });
    }

    function replace(path, state) {
      process.env.NODE_ENV !== "production" ? warning$2(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
      var action = 'REPLACE';
      var location = createLocation(path, state, createKey(), history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var href = createHref(location);
        var key = location.key,
            state = location.state;

        if (canUseHistory) {
          globalHistory.replaceState({
            key: key,
            state: state
          }, null, href);

          if (forceRefresh) {
            window.location.replace(href);
          } else {
            var prevIndex = allKeys.indexOf(history.location.key);
            if (prevIndex !== -1) allKeys[prevIndex] = location.key;
            setState({
              action: action,
              location: location
            });
          }
        } else {
          process.env.NODE_ENV !== "production" ? warning$2(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
          window.location.replace(href);
        }
      });
    }

    function go(n) {
      globalHistory.go(n);
    }

    function goBack() {
      go(-1);
    }

    function goForward() {
      go(1);
    }

    var listenerCount = 0;

    function checkDOMListeners(delta) {
      listenerCount += delta;

      if (listenerCount === 1 && delta === 1) {
        window.addEventListener(PopStateEvent, handlePopState);
        if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
      } else if (listenerCount === 0) {
        window.removeEventListener(PopStateEvent, handlePopState);
        if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
      }
    }

    var isBlocked = false;

    function block(prompt) {
      if (prompt === void 0) {
        prompt = false;
      }

      var unblock = transitionManager.setPrompt(prompt);

      if (!isBlocked) {
        checkDOMListeners(1);
        isBlocked = true;
      }

      return function () {
        if (isBlocked) {
          isBlocked = false;
          checkDOMListeners(-1);
        }

        return unblock();
      };
    }

    function listen(listener) {
      var unlisten = transitionManager.appendListener(listener);
      checkDOMListeners(1);
      return function () {
        checkDOMListeners(-1);
        unlisten();
      };
    }

    var history = {
      length: globalHistory.length,
      action: 'POP',
      location: initialLocation,
      createHref: createHref,
      push: push,
      replace: replace,
      go: go,
      goBack: goBack,
      goForward: goForward,
      block: block,
      listen: listen
    };
    return history;
  }

  var HashChangeEvent$1 = 'hashchange';
  var HashPathCoders = {
    hashbang: {
      encodePath: function encodePath(path) {
        return path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path);
      },
      decodePath: function decodePath(path) {
        return path.charAt(0) === '!' ? path.substr(1) : path;
      }
    },
    noslash: {
      encodePath: stripLeadingSlash,
      decodePath: addLeadingSlash
    },
    slash: {
      encodePath: addLeadingSlash,
      decodePath: addLeadingSlash
    }
  };

  function stripHash(url) {
    var hashIndex = url.indexOf('#');
    return hashIndex === -1 ? url : url.slice(0, hashIndex);
  }

  function getHashPath() {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    var href = window.location.href;
    var hashIndex = href.indexOf('#');
    return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
  }

  function pushHashPath(path) {
    window.location.hash = path;
  }

  function replaceHashPath(path) {
    window.location.replace(stripHash(window.location.href) + '#' + path);
  }

  function createHashHistory(props) {
    if (props === void 0) {
      props = {};
    }

    !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Hash history needs a DOM') : invariant(false) : void 0;
    var globalHistory = window.history;
    var canGoWithoutReload = supportsGoWithoutReloadUsingHash();
    var _props = props,
        _props$getUserConfirm = _props.getUserConfirmation,
        getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
        _props$hashType = _props.hashType,
        hashType = _props$hashType === void 0 ? 'slash' : _props$hashType;
    var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
    var _HashPathCoders$hashT = HashPathCoders[hashType],
        encodePath = _HashPathCoders$hashT.encodePath,
        decodePath = _HashPathCoders$hashT.decodePath;

    function getDOMLocation() {
      var path = decodePath(getHashPath());
      process.env.NODE_ENV !== "production" ? warning$2(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
      if (basename) path = stripBasename(path, basename);
      return createLocation(path);
    }

    var transitionManager = createTransitionManager();

    function setState(nextState) {
      _extends(history, nextState);

      history.length = globalHistory.length;
      transitionManager.notifyListeners(history.location, history.action);
    }

    var forceNextPop = false;
    var ignorePath = null;

    function locationsAreEqual$$1(a, b) {
      return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
    }

    function handleHashChange() {
      var path = getHashPath();
      var encodedPath = encodePath(path);

      if (path !== encodedPath) {
        // Ensure we always have a properly-encoded hash.
        replaceHashPath(encodedPath);
      } else {
        var location = getDOMLocation();
        var prevLocation = history.location;
        if (!forceNextPop && locationsAreEqual$$1(prevLocation, location)) return; // A hashchange doesn't always == location change.

        if (ignorePath === createPath(location)) return; // Ignore this change; we already setState in push/replace.

        ignorePath = null;
        handlePop(location);
      }
    }

    function handlePop(location) {
      if (forceNextPop) {
        forceNextPop = false;
        setState();
      } else {
        var action = 'POP';
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
          if (ok) {
            setState({
              action: action,
              location: location
            });
          } else {
            revertPop(location);
          }
        });
      }
    }

    function revertPop(fromLocation) {
      var toLocation = history.location; // TODO: We could probably make this more reliable by
      // keeping a list of paths we've seen in sessionStorage.
      // Instead, we just default to 0 for paths we don't know.

      var toIndex = allPaths.lastIndexOf(createPath(toLocation));
      if (toIndex === -1) toIndex = 0;
      var fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
      if (fromIndex === -1) fromIndex = 0;
      var delta = toIndex - fromIndex;

      if (delta) {
        forceNextPop = true;
        go(delta);
      }
    } // Ensure the hash is encoded properly before doing anything else.


    var path = getHashPath();
    var encodedPath = encodePath(path);
    if (path !== encodedPath) replaceHashPath(encodedPath);
    var initialLocation = getDOMLocation();
    var allPaths = [createPath(initialLocation)]; // Public interface

    function createHref(location) {
      var baseTag = document.querySelector('base');
      var href = '';

      if (baseTag && baseTag.getAttribute('href')) {
        href = stripHash(window.location.href);
      }

      return href + '#' + encodePath(basename + createPath(location));
    }

    function push(path, state) {
      process.env.NODE_ENV !== "production" ? warning$2(state === undefined, 'Hash history cannot push state; it is ignored') : void 0;
      var action = 'PUSH';
      var location = createLocation(path, undefined, undefined, history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var path = createPath(location);
        var encodedPath = encodePath(basename + path);
        var hashChanged = getHashPath() !== encodedPath;

        if (hashChanged) {
          // We cannot tell if a hashchange was caused by a PUSH, so we'd
          // rather setState here and ignore the hashchange. The caveat here
          // is that other hash histories in the page will consider it a POP.
          ignorePath = path;
          pushHashPath(encodedPath);
          var prevIndex = allPaths.lastIndexOf(createPath(history.location));
          var nextPaths = allPaths.slice(0, prevIndex + 1);
          nextPaths.push(path);
          allPaths = nextPaths;
          setState({
            action: action,
            location: location
          });
        } else {
          process.env.NODE_ENV !== "production" ? warning$2(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : void 0;
          setState();
        }
      });
    }

    function replace(path, state) {
      process.env.NODE_ENV !== "production" ? warning$2(state === undefined, 'Hash history cannot replace state; it is ignored') : void 0;
      var action = 'REPLACE';
      var location = createLocation(path, undefined, undefined, history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var path = createPath(location);
        var encodedPath = encodePath(basename + path);
        var hashChanged = getHashPath() !== encodedPath;

        if (hashChanged) {
          // We cannot tell if a hashchange was caused by a REPLACE, so we'd
          // rather setState here and ignore the hashchange. The caveat here
          // is that other hash histories in the page will consider it a POP.
          ignorePath = path;
          replaceHashPath(encodedPath);
        }

        var prevIndex = allPaths.indexOf(createPath(history.location));
        if (prevIndex !== -1) allPaths[prevIndex] = path;
        setState({
          action: action,
          location: location
        });
      });
    }

    function go(n) {
      process.env.NODE_ENV !== "production" ? warning$2(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;
      globalHistory.go(n);
    }

    function goBack() {
      go(-1);
    }

    function goForward() {
      go(1);
    }

    var listenerCount = 0;

    function checkDOMListeners(delta) {
      listenerCount += delta;

      if (listenerCount === 1 && delta === 1) {
        window.addEventListener(HashChangeEvent$1, handleHashChange);
      } else if (listenerCount === 0) {
        window.removeEventListener(HashChangeEvent$1, handleHashChange);
      }
    }

    var isBlocked = false;

    function block(prompt) {
      if (prompt === void 0) {
        prompt = false;
      }

      var unblock = transitionManager.setPrompt(prompt);

      if (!isBlocked) {
        checkDOMListeners(1);
        isBlocked = true;
      }

      return function () {
        if (isBlocked) {
          isBlocked = false;
          checkDOMListeners(-1);
        }

        return unblock();
      };
    }

    function listen(listener) {
      var unlisten = transitionManager.appendListener(listener);
      checkDOMListeners(1);
      return function () {
        checkDOMListeners(-1);
        unlisten();
      };
    }

    var history = {
      length: globalHistory.length,
      action: 'POP',
      location: initialLocation,
      createHref: createHref,
      push: push,
      replace: replace,
      go: go,
      goBack: goBack,
      goForward: goForward,
      block: block,
      listen: listen
    };
    return history;
  }

  function clamp(n, lowerBound, upperBound) {
    return Math.min(Math.max(n, lowerBound), upperBound);
  }
  /**
   * Creates a history object that stores locations in memory.
   */


  function createMemoryHistory(props) {
    if (props === void 0) {
      props = {};
    }

    var _props = props,
        getUserConfirmation = _props.getUserConfirmation,
        _props$initialEntries = _props.initialEntries,
        initialEntries = _props$initialEntries === void 0 ? ['/'] : _props$initialEntries,
        _props$initialIndex = _props.initialIndex,
        initialIndex = _props$initialIndex === void 0 ? 0 : _props$initialIndex,
        _props$keyLength = _props.keyLength,
        keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
    var transitionManager = createTransitionManager();

    function setState(nextState) {
      _extends(history, nextState);

      history.length = history.entries.length;
      transitionManager.notifyListeners(history.location, history.action);
    }

    function createKey() {
      return Math.random().toString(36).substr(2, keyLength);
    }

    var index = clamp(initialIndex, 0, initialEntries.length - 1);
    var entries = initialEntries.map(function (entry) {
      return typeof entry === 'string' ? createLocation(entry, undefined, createKey()) : createLocation(entry, undefined, entry.key || createKey());
    }); // Public interface

    var createHref = createPath;

    function push(path, state) {
      process.env.NODE_ENV !== "production" ? warning$2(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
      var action = 'PUSH';
      var location = createLocation(path, state, createKey(), history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var prevIndex = history.index;
        var nextIndex = prevIndex + 1;
        var nextEntries = history.entries.slice(0);

        if (nextEntries.length > nextIndex) {
          nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
        } else {
          nextEntries.push(location);
        }

        setState({
          action: action,
          location: location,
          index: nextIndex,
          entries: nextEntries
        });
      });
    }

    function replace(path, state) {
      process.env.NODE_ENV !== "production" ? warning$2(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
      var action = 'REPLACE';
      var location = createLocation(path, state, createKey(), history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        history.entries[history.index] = location;
        setState({
          action: action,
          location: location
        });
      });
    }

    function go(n) {
      var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
      var action = 'POP';
      var location = history.entries[nextIndex];
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location,
            index: nextIndex
          });
        } else {
          // Mimic the behavior of DOM histories by
          // causing a render after a cancelled POP.
          setState();
        }
      });
    }

    function goBack() {
      go(-1);
    }

    function goForward() {
      go(1);
    }

    function canGo(n) {
      var nextIndex = history.index + n;
      return nextIndex >= 0 && nextIndex < history.entries.length;
    }

    function block(prompt) {
      if (prompt === void 0) {
        prompt = false;
      }

      return transitionManager.setPrompt(prompt);
    }

    function listen(listener) {
      return transitionManager.appendListener(listener);
    }

    var history = {
      length: entries.length,
      action: 'POP',
      location: entries[index],
      index: index,
      entries: entries,
      createHref: createHref,
      push: push,
      replace: replace,
      go: go,
      goBack: goBack,
      goForward: goForward,
      canGo: canGo,
      block: block,
      listen: listen
    };
    return history;
  }

  var WebNativeHistory = function () {
    function WebNativeHistory(createHistory) {
      _defineProperty(this, "history", void 0);

      if (createHistory === 'Hash') {
        this.history = createHashHistory();
      } else if (createHistory === 'Memory') {
        this.history = createMemoryHistory();
      } else if (createHistory === 'Browser') {
        this.history = createBrowserHistory();
      } else {
        var _createHistory$split = createHistory.split('?'),
            pathname = _createHistory$split[0],
            _createHistory$split$ = _createHistory$split[1],
            search = _createHistory$split$ === void 0 ? '' : _createHistory$split$;

        this.history = {
          action: 'PUSH',
          length: 0,
          listen: function listen() {
            return function () {
              return undefined;
            };
          },
          createHref: function createHref() {
            return '';
          },
          push: function push() {},
          replace: function replace() {},
          go: function go() {},
          goBack: function goBack() {},
          goForward: function goForward() {},
          block: function block() {
            return function () {
              return undefined;
            };
          },
          location: {
            pathname: pathname,
            search: search && "?" + search,
            hash: ''
          }
        };
      }
    }

    var _proto = WebNativeHistory.prototype;

    _proto.getLocation = function getLocation() {
      var _this$history$locatio = this.history.location,
          _this$history$locatio2 = _this$history$locatio.pathname,
          pathname = _this$history$locatio2 === void 0 ? '' : _this$history$locatio2,
          _this$history$locatio3 = _this$history$locatio.search,
          search = _this$history$locatio3 === void 0 ? '' : _this$history$locatio3,
          _this$history$locatio4 = _this$history$locatio.hash,
          hash = _this$history$locatio4 === void 0 ? '' : _this$history$locatio4;
      return {
        pathname: pathname,
        search: decodeURIComponent(search).replace('?', ''),
        hash: decodeURIComponent(hash).replace('#', '')
      };
    };

    _proto.getUrl = function getUrl() {
      var _this$history$locatio5 = this.history.location,
          _this$history$locatio6 = _this$history$locatio5.pathname,
          pathname = _this$history$locatio6 === void 0 ? '' : _this$history$locatio6,
          _this$history$locatio7 = _this$history$locatio5.search,
          search = _this$history$locatio7 === void 0 ? '' : _this$history$locatio7,
          _this$history$locatio8 = _this$history$locatio5.hash,
          hash = _this$history$locatio8 === void 0 ? '' : _this$history$locatio8;
      return [pathname, search, hash].join('');
    };

    _proto.parseUrl = function parseUrl(url) {
      if (!url) {
        return {
          pathname: '/',
          search: '',
          hash: ''
        };
      }

      var arr = url.split(/[?#]/);

      if (arr.length === 2 && url.indexOf('?') < 0) {
        arr.splice(1, 0, '');
      }

      var pathname = arr[0],
          _arr$ = arr[1],
          search = _arr$ === void 0 ? '' : _arr$,
          _arr$2 = arr[2],
          hash = _arr$2 === void 0 ? '' : _arr$2;
      return {
        pathname: pathname,
        search: search,
        hash: hash
      };
    };

    _proto.toUrl = function toUrl(location) {
      return [location.pathname, location.search && "?" + location.search, location.hash && "#" + location.hash].join('');
    };

    _proto.block = function block(blocker) {
      var _this = this;

      return this.history.block(function (location, action) {
        var _location$pathname = location.pathname,
            pathname = _location$pathname === void 0 ? '' : _location$pathname,
            _location$search = location.search,
            search = _location$search === void 0 ? '' : _location$search,
            _location$hash = location.hash,
            hash = _location$hash === void 0 ? '' : _location$hash;
        return blocker([pathname, search, hash].join(''), _this.getKey(location), action);
      });
    };

    _proto.getKey = function getKey(location) {
      return location.state || '';
    };

    _proto.push = function push(location, key) {
      this.history.push(this.toUrl(location), key);
    };

    _proto.replace = function replace(location, key) {
      this.history.replace(this.toUrl(location), key);
    };

    _proto.relaunch = function relaunch(location, key) {
      this.history.push(this.toUrl(location), key);
    };

    _proto.pop = function pop(location, n, key) {
      if (n < 500) {
        this.history.go(-n);
      } else {
        this.history.push(this.toUrl(location), key);
      }
    };

    return WebNativeHistory;
  }();
  var HistoryActions = function (_BaseHistoryActions) {
    _inheritsLoose(HistoryActions, _BaseHistoryActions);

    function HistoryActions(nativeHistory, locationTransform) {
      var _this2;

      _this2 = _BaseHistoryActions.call(this, nativeHistory, locationTransform) || this;
      _this2.nativeHistory = nativeHistory;

      _defineProperty(_assertThisInitialized(_this2), "_unlistenHistory", void 0);

      _defineProperty(_assertThisInitialized(_this2), "_timer", 0);

      _this2._unlistenHistory = _this2.nativeHistory.block(function (url, key, action) {
        if (key !== _this2.getCurKey()) {
          var callback;
          var index = 0;

          if (action === 'POP') {
            index = _this2.findHistoryByKey(key);
          }

          if (index > 0) {
            callback = function callback() {
              _this2._timer = 0;

              _this2.pop(index);
            };
          } else if (action === 'REPLACE') {
            callback = function callback() {
              _this2._timer = 0;

              _this2.replace(url);
            };
          } else if (action === 'PUSH') {
            callback = function callback() {
              _this2._timer = 0;

              _this2.push(url);
            };
          } else {
            callback = function callback() {
              _this2._timer = 0;

              _this2.relaunch(url);
            };
          }

          if (callback && !_this2._timer) {
            _this2._timer = env.setTimeout(callback, 50);
          }

          return false;
        }

        return undefined;
      });
      return _this2;
    }

    var _proto2 = HistoryActions.prototype;

    _proto2.getNativeHistory = function getNativeHistory() {
      return this.nativeHistory.history;
    };

    _proto2.destroy = function destroy() {
      this._unlistenHistory();
    };

    _proto2.refresh = function refresh() {
      this.nativeHistory.history.go(0);
    };

    return HistoryActions;
  }(BaseHistoryActions);
  function createRouter(createHistory, locationTransform) {
    var nativeHistory = new WebNativeHistory(createHistory);
    var historyActions = new HistoryActions(nativeHistory, locationTransform);
    return historyActions;
  }

  var appExports = {
    loadView: loadView,
    getActions: undefined,
    state: undefined,
    store: undefined,
    history: undefined,
    request: undefined,
    response: undefined
  };
  function patchActions(typeName, json) {
    if (json) {
      getRootModuleAPI(JSON.parse(json));
    }
  }
  function exportApp() {
    var modules = getRootModuleAPI();

    appExports.getActions = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.reduce(function (prev, moduleName) {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    };

    return {
      App: appExports,
      Modules: modules,
      Actions: {}
    };
  }
  function buildApp(moduleGetter, _ref) {
    var _ref$appModuleName = _ref.appModuleName,
        appModuleName = _ref$appModuleName === void 0 ? 'app' : _ref$appModuleName,
        _ref$appViewName = _ref.appViewName,
        appViewName = _ref$appViewName === void 0 ? 'main' : _ref$appViewName,
        _ref$historyType = _ref.historyType,
        historyType = _ref$historyType === void 0 ? 'Browser' : _ref$historyType,
        locationTransform = _ref.locationTransform,
        _ref$storeOptions = _ref.storeOptions,
        storeOptions = _ref$storeOptions === void 0 ? {} : _ref$storeOptions,
        _ref$container = _ref.container,
        container = _ref$container === void 0 ? 'root' : _ref$container;
    appExports.history = createRouter(historyType, locationTransform);

    if (!storeOptions.middlewares) {
      storeOptions.middlewares = [];
    }

    storeOptions.middlewares.unshift(routeMiddleware);

    if (!storeOptions.reducers) {
      storeOptions.reducers = {};
    }

    storeOptions.reducers.route = routeReducer;

    if (!storeOptions.initData) {
      storeOptions.initData = {};
    }

    storeOptions.initData = Object.assign({}, storeOptions.initData, {
      route: appExports.history.getRouteState()
    });
    return renderApp$1(moduleGetter, appModuleName, appViewName, storeOptions, container, function (store) {
      appExports.store = store;
      appExports.history.setStore(store);
      var routeState = appExports.history.getRouteState();
      return Object.keys(routeState.params);
    });
  }
  var SSRTPL;
  function setSsrHtmlTpl(tpl) {
    SSRTPL = tpl;
  }
  function buildSSR(moduleGetter, _ref2) {
    var request = _ref2.request,
        response = _ref2.response,
        _ref2$appModuleName = _ref2.appModuleName,
        appModuleName = _ref2$appModuleName === void 0 ? 'app' : _ref2$appModuleName,
        _ref2$appViewName = _ref2.appViewName,
        appViewName = _ref2$appViewName === void 0 ? 'main' : _ref2$appViewName,
        locationTransform = _ref2.locationTransform,
        _ref2$storeOptions = _ref2.storeOptions,
        storeOptions = _ref2$storeOptions === void 0 ? {} : _ref2$storeOptions,
        _ref2$container = _ref2.container,
        container = _ref2$container === void 0 ? 'root' : _ref2$container;

    if (!SSRTPL) {
      SSRTPL = Buffer.from('process.env.MEDUX_ENV_SSRTPL', 'base64').toString();
    }

    appExports.request = request;
    appExports.response = response;
    appExports.history = createRouter(request.url, locationTransform);

    if (!storeOptions.initData) {
      storeOptions.initData = {};
    }

    storeOptions.initData = Object.assign({}, storeOptions.initData, {
      route: appExports.history.getRouteState()
    });
    return renderSSR$1(moduleGetter, appModuleName, appViewName, storeOptions, false, function (store) {
      appExports.store = store;
      Object.defineProperty(appExports, 'state', {
        get: function get() {
          return store.getState();
        }
      });
      appExports.history.setStore(store);
      var routeState = appExports.history.getRouteState();
      return Object.keys(routeState.params);
    }).then(function (_ref3) {
      var html = _ref3.html,
          data = _ref3.data,
          ssrInitStoreKey = _ref3.ssrInitStoreKey;
      var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + container + "['\"][^<>]*>", 'm'));

      if (match) {
        var pageHead = html.split(/<head>|<\/head>/, 3);
        html = pageHead[0] + pageHead[2];
        return SSRTPL.replace('</head>', pageHead[1] + "\r\n<script>window." + ssrInitStoreKey + " = " + JSON.stringify(data) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
      }

      return html;
    });
  }
  var connect = baseConnect;

  var ElseComponent = function ElseComponent(_ref4) {
    var children = _ref4.children,
        elseView = _ref4.elseView;
    var arr = [];
    React__default['default'].Children.forEach(children, function (item) {
      item && arr.push(item);
    });

    if (arr.length > 0) {
      return React__default['default'].createElement(React__default['default'].Fragment, null, arr);
    }

    return React__default['default'].createElement(React__default['default'].Fragment, null, elseView);
  };

  var Else = React__default['default'].memo(ElseComponent);

  var SwitchComponent = function SwitchComponent(_ref5) {
    var children = _ref5.children,
        elseView = _ref5.elseView;
    var arr = [];
    React__default['default'].Children.forEach(children, function (item) {
      item && arr.push(item);
    });

    if (arr.length > 0) {
      return React__default['default'].createElement(React__default['default'].Fragment, null, arr[0]);
    }

    return React__default['default'].createElement(React__default['default'].Fragment, null, elseView);
  };

  var Switch = React__default['default'].memo(SwitchComponent);

  function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }

  var Link = React__default['default'].forwardRef(function (_ref6, ref) {
    var _onClick = _ref6.onClick,
        replace = _ref6.replace,
        rest = _objectWithoutPropertiesLoose(_ref6, ["onClick", "replace"]);

    var target = rest.target;
    var props = Object.assign({}, rest, {
      onClick: function onClick(event) {
        try {
          _onClick && _onClick(event);
        } catch (ex) {
          event.preventDefault();
          throw ex;
        }

        if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
            event.preventDefault();
            replace ? appExports.history.replace(rest.href) : appExports.history.push(rest.href);
          }
      }
    });
    return React__default['default'].createElement("a", _extends({}, props, {
      ref: ref
    }));
  });

  var DocumentHeadComponent = function DocumentHeadComponent(_ref7) {
    var children = _ref7.children;
    var title = '';
    React__default['default'].Children.forEach(children, function (child) {
      if (child && child.type === 'title') {
        title = child.props.children;
      }
    });

    if (!isServer()) {
      React.useEffect(function () {
        if (title) {
          document.title = title;
        }
      }, [title]);
      return null;
    }

    return React__default['default'].createElement("head", null, children);
  };

  var DocumentHead = React__default['default'].memo(DocumentHeadComponent);

  exports.ActionTypes = ActionTypes;
  exports.BaseModuleHandlers = RouteModuleHandlers;
  exports.DocumentHead = DocumentHead;
  exports.Else = Else;
  exports.Link = Link;
  exports.Switch = Switch;
  exports.buildApp = buildApp;
  exports.buildSSR = buildSSR;
  exports.connect = connect;
  exports.createWebLocationTransform = createWebLocationTransform;
  exports.deepExtend = deepExtend;
  exports.delayPromise = delayPromise;
  exports.effect = effect;
  exports.errorAction = errorAction;
  exports.exportApp = exportApp;
  exports.exportModule = exportModule$1;
  exports.isServer = isServer;
  exports.logger = logger;
  exports.modelHotReplacement = modelHotReplacement;
  exports.patchActions = patchActions;
  exports.reducer = reducer;
  exports.serverSide = serverSide;
  exports.setConfig = setConfig;
  exports.setLoading = setLoading;
  exports.setLoadingDepthTime = setLoadingDepthTime;
  exports.setRouteConfig = setRouteConfig;
  exports.setSsrHtmlTpl = setSsrHtmlTpl;
  exports.viewHotReplacement = viewHotReplacement;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
