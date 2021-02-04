(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-dom')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-dom'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MeduxWeb = {}, global.React, global.ReactDOM));
}(this, (function (exports, React, reactDom) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

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
	function isPlainObject(obj) {
	  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
	}

	function __deepMerge(optimize, target, inject) {
	  Object.keys(inject).forEach(function (key) {
	    var src = target[key];
	    var val = inject[key];

	    if (isPlainObject(val)) {
	      if (isPlainObject(src)) {
	        target[key] = __deepMerge(optimize, src, val);
	      } else {
	        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
	      }
	    } else {
	      target[key] = val;
	    }
	  });
	  return target;
	}

	function deepMerge(target) {
	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  if (!isPlainObject(target)) {
	    target = {};
	  }

	  args = args.filter(Boolean);

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
	            target[key] = __deepMerge(lastArg, src, val);
	          } else {
	            target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepMerge(lastArg, {}, val);
	          }
	        } else {
	          target[key] = val;
	        }
	      });
	    }
	  });
	  return target;
	}

	var config = {
	  NSP: '.',
	  MSP: ',',
	  MutableData: false,
	  DEVTOOLS: process.env.NODE_ENV === 'development'
	};
	function setConfig(_config) {
	  _config.NSP !== undefined && (config.NSP = _config.NSP);
	  _config.MSP !== undefined && (config.MSP = _config.MSP);
	  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
	  _config.DEVTOOLS !== undefined && (config.DEVTOOLS = _config.DEVTOOLS);
	}
	function warn(str) {
	  if (process.env.NODE_ENV === 'development') {
	    env.console.warn(str);
	  }
	}
	function deepMergeState(target) {
	  if (target === void 0) {
	    target = {};
	  }

	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  if (config.MutableData) {
	    return deepMerge.apply(void 0, [target].concat(args));
	  }

	  return deepMerge.apply(void 0, [{}, target].concat(args));
	}
	function mergeState(target) {
	  if (target === void 0) {
	    target = {};
	  }

	  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	    args[_key2 - 1] = arguments[_key2];
	  }

	  if (config.MutableData) {
	    return Object.assign.apply(Object, [target].concat(args));
	  }

	  return Object.assign.apply(Object, [{}, target].concat(args));
	}
	function snapshotState(target) {
	  if (config.MutableData) {
	    return JSON.parse(JSON.stringify(target));
	  }

	  return target;
	}
	var ActionTypes = {
	  MLoading: 'Loading',
	  MInit: 'Init',
	  MReInit: 'ReInit',
	  Error: "medux" + config.NSP + "Error"
	};
	var MetaData = {
	  appViewName: null,
	  facadeMap: null,
	  clientStore: null,
	  appModuleName: null,
	  moduleGetter: null,
	  currentData: {
	    actionName: '',
	    prevState: null
	  }
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

	      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        args[_key3] = arguments[_key3];
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
	function clientSide(callback) {
	  if (!isServerEnv) {
	    return callback();
	  }

	  return undefined;
	}

	function errorAction(reason) {
	  return {
	    type: ActionTypes.Error,
	    payload: [reason]
	  };
	}
	function moduleInitAction(moduleName, initState) {
	  return {
	    type: "" + moduleName + config.NSP + ActionTypes.MInit,
	    payload: [initState]
	  };
	}
	function moduleReInitAction(moduleName, initState) {
	  return {
	    type: "" + moduleName + config.NSP + ActionTypes.MReInit,
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

	function isPlainObject$1(obj) {
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
	    if (!isPlainObject$1(action)) {
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

	    if (!moduleGetter[moduleName]) {
	      return undefined;
	    }

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
	        return this.store._medux_.realtimeState[this.moduleName];
	      }
	    }, {
	      kind: "get",
	      key: "rootState",
	      value: function rootState() {
	        return this.store._medux_.realtimeState;
	      }
	    }, {
	      kind: "method",
	      key: "getCurrentActionName",
	      value: function getCurrentActionName() {
	        return MetaData.currentData.actionName;
	      }
	    }, {
	      kind: "get",
	      key: "prevRootState",
	      value: function prevRootState() {
	        return MetaData.currentData.prevState;
	      }
	    }, {
	      kind: "get",
	      key: "prevState",
	      value: function prevState() {
	        return MetaData.currentData.prevState[this.moduleName];
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
	        return mergeState(this.state, payload);
	      }
	    }, {
	      kind: "method",
	      decorators: [reducer],
	      key: "Loading",
	      value: function Loading(payload) {
	        var loading = mergeState(this.state.loading, payload);
	        return mergeState(this.state, {
	          loading: loading
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

	      if (moduleState.initialized) {
	        return store.dispatch(moduleReInitAction(moduleName, moduleState));
	      }

	      moduleState.initialized = true;
	      return store.dispatch(moduleInitAction(moduleName, moduleState));
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
	  return error && !!error.__meduxProcessed__;
	}
	function setProcessedError(error, meduxProcessed) {
	  if (typeof error !== 'object') {
	    error = {
	      message: error
	    };
	  }

	  Object.defineProperty(error, '__meduxProcessed__', {
	    value: meduxProcessed,
	    enumerable: false,
	    writable: true
	  });
	  return error;
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

	  var combineReducers = function combineReducers(state, action) {
	    if (!store) {
	      return state;
	    }

	    var meta = store._medux_;
	    var currentState = meta.currentState;
	    var realtimeState = meta.realtimeState;
	    Object.keys(storeReducers).forEach(function (moduleName) {
	      var node = storeReducers[moduleName](state[moduleName], action);

	      if (config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
	        warn('Use rewrite instead of replace to update state in MutableData');
	      }

	      realtimeState[moduleName] = node;
	    });
	    var handlersCommon = meta.reducerMap[action.type] || {};
	    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
	    var handlers = Object.assign({}, handlersCommon, handlersEvery);
	    var handlerModules = Object.keys(handlers);

	    if (handlerModules.length > 0) {
	      var orderList = [];
	      var priority = action.priority ? [].concat(action.priority) : [];
	      var actionData = getActionData(action);
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
	          MetaData.currentData = {
	            actionName: action.type,
	            prevState: currentState
	          };
	          var node = fun.apply(void 0, actionData);

	          if (config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
	            warn('Use rewrite instead of replace to update state in MutableData');
	          }

	          realtimeState[moduleName] = node;
	        }
	      });
	    }

	    return realtimeState;
	  };

	  var middleware = function middleware(_ref) {
	    var dispatch = _ref.dispatch;
	    return function (next) {
	      return function (originalAction) {
	        if (originalAction.type === ActionTypes.Error) {
	          var actionData = getActionData(originalAction);

	          if (isProcessedError(actionData[0])) {
	            return originalAction;
	          }

	          actionData[0] = setProcessedError(actionData[0], true);
	        }

	        if (isServerEnv) {
	          if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
	            return originalAction;
	          }
	        }

	        var meta = store._medux_;
	        var rootState = store.getState();
	        meta.realtimeState = mergeState(rootState);
	        meta.currentState = snapshotState(rootState);
	        var currentState = meta.currentState;
	        var action = next(originalAction);
	        var handlersCommon = meta.effectMap[action.type] || {};
	        var handlersEvery = meta.effectMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
	        var handlers = Object.assign({}, handlersCommon, handlersEvery);
	        var handlerModules = Object.keys(handlers);

	        if (handlerModules.length > 0) {
	          var _actionData = getActionData(action);

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
	              MetaData.currentData = {
	                actionName: action.type,
	                prevState: currentState
	              };
	              var effectResult = fun.apply(void 0, _actionData);
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
	              }, function (reason) {
	                if (decorators) {
	                  var _results2 = fun.__decoratorResults__ || [];

	                  decorators.forEach(function (decorator, index) {
	                    if (decorator[1]) {
	                      decorator[1]('Rejected', _results2[index], reason);
	                    }
	                  });
	                  fun.__decoratorResults__ = undefined;
	                }

	                if (isProcessedError(reason)) {
	                  throw reason;
	                } else {
	                  reason = setProcessedError(reason, false);
	                  return dispatch(errorAction(reason));
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
	          var hasInjected = store._medux_.injectedModules[moduleName];

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
	        realtimeState: {},
	        currentState: {},
	        reducerMap: {},
	        effectMap: {},
	        injectedModules: {}
	      };
	      return newStore;
	    };
	  };

	  var enhancers = [middlewareEnhancer, enhancer].concat(storeEnhancers);

	  if (config.DEVTOOLS && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
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
	  _renderApp = _asyncToGenerator(regenerator.mark(function _callee(render, moduleGetter, appModuleOrName, appViewName, storeOptions, startup) {
	    var appModuleName, store, appModule;
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

	            store = buildStore(storeOptions.initData || {}, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
	            _context.next = 10;
	            return getModuleByName(appModuleName, moduleGetter);

	          case 10:
	            appModule = _context.sent;
	            startup(store, appModule);
	            _context.next = 14;
	            return appModule.default.model(store);

	          case 14:
	            reRender = render(store, appModule.default.views[appViewName]);
	            return _context.abrupt("return", {
	              store: store
	            });

	          case 16:
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
	  _renderSSR = _asyncToGenerator(regenerator.mark(function _callee2(render, moduleGetter, appModuleOrName, appViewName, storeOptions, startup) {
	    var appModuleName, store, appModule;
	    return regenerator.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            if (storeOptions === void 0) {
	              storeOptions = {};
	            }

	            appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
	            MetaData.appModuleName = appModuleName;
	            MetaData.appViewName = appViewName;
	            MetaData.moduleGetter = moduleGetter;

	            if (typeof appModuleOrName !== 'string') {
	              cacheModule(appModuleOrName);
	            }

	            store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
	            _context2.next = 9;
	            return getModuleByName(appModuleName, moduleGetter);

	          case 9:
	            appModule = _context2.sent;
	            startup(store, appModule);
	            _context2.next = 13;
	            return appModule.default.model(store);

	          case 13:
	            store.dispatch = defFun;
	            return _context2.abrupt("return", render(store, appModule.default.views[appViewName]));

	          case 15:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2);
	  }));
	  return _renderSSR.apply(this, arguments);
	}

	var routeConfig = {
	  RSP: '|',
	  actionMaxHistory: 10,
	  pagesMaxHistory: 10,
	  pagenames: {}
	};
	function setRouteConfig(conf) {
	  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
	  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
	  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
	  conf.pagenames && (routeConfig.pagenames = conf.pagenames);
	}

	function locationToUri(location, key) {
	  var pagename = location.pagename,
	      params = location.params;
	  var query = params ? JSON.stringify(params) : '';
	  return {
	    uri: [key, pagename, query].join(routeConfig.RSP),
	    pagename: pagename,
	    query: query,
	    key: key
	  };
	}

	function splitUri() {
	  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  var _args$ = args[0],
	      uri = _args$ === void 0 ? '' : _args$,
	      name = args[1];
	  var arr = uri.split(routeConfig.RSP, 3);
	  var index = {
	    key: 0,
	    pagename: 1,
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
	      pagename = _splitUri[1],
	      query = _splitUri[2];

	  var location = {
	    pagename: pagename,
	    params: JSON.parse(query)
	  };
	  return {
	    key: key,
	    location: location
	  };
	}
	var History = function () {
	  function History() {
	    _defineProperty(this, "pages", []);

	    _defineProperty(this, "actions", []);
	  }

	  var _proto = History.prototype;

	  _proto.getActionRecord = function getActionRecord(keyOrIndex) {
	    if (keyOrIndex === undefined) {
	      keyOrIndex = 0;
	    }

	    if (typeof keyOrIndex === 'number') {
	      return this.actions[keyOrIndex];
	    }

	    return this.actions.find(function (item) {
	      return item.key === keyOrIndex;
	    });
	  };

	  _proto.getPageRecord = function getPageRecord(keyOrIndex) {
	    if (keyOrIndex === undefined) {
	      keyOrIndex = 0;
	    }

	    if (typeof keyOrIndex === 'number') {
	      return this.pages[keyOrIndex];
	    }

	    return this.pages.find(function (item) {
	      return item.key === keyOrIndex;
	    });
	  };

	  _proto.getActionIndex = function getActionIndex(key) {
	    return this.actions.findIndex(function (item) {
	      return item.key === key;
	    });
	  };

	  _proto.getPageIndex = function getPageIndex(key) {
	    return this.pages.findIndex(function (item) {
	      return item.key === key;
	    });
	  };

	  _proto.getCurrentInternalHistory = function getCurrentInternalHistory() {
	    return this.actions[0].sub;
	  };

	  _proto.getUriStack = function getUriStack() {
	    return {
	      actions: this.actions.map(function (item) {
	        return item.uri;
	      }),
	      pages: this.pages.map(function (item) {
	        return item.uri;
	      })
	    };
	  };

	  _proto.push = function push(location, key) {
	    var _pages$;

	    var _locationToUri = locationToUri(location, key),
	        uri = _locationToUri.uri,
	        pagename = _locationToUri.pagename,
	        query = _locationToUri.query;

	    var newStack = {
	      uri: uri,
	      pagename: pagename,
	      query: query,
	      key: key,
	      sub: new History()
	    };
	    var pages = [].concat(this.pages);
	    var actions = [].concat(this.actions);
	    var actionsMax = routeConfig.actionMaxHistory;
	    var pagesMax = routeConfig.pagesMaxHistory;
	    actions.unshift(newStack);

	    if (actions.length > actionsMax) {
	      actions.length = actionsMax;
	    }

	    if (splitUri((_pages$ = pages[0]) === null || _pages$ === void 0 ? void 0 : _pages$.uri, 'pagename') !== pagename) {
	      pages.unshift(newStack);

	      if (pages.length > pagesMax) {
	        pages.length = pagesMax;
	      }
	    } else {
	      pages[0] = newStack;
	    }

	    this.actions = actions;
	    this.pages = pages;
	  };

	  _proto.replace = function replace(location, key) {
	    var _pages$2;

	    var _locationToUri2 = locationToUri(location, key),
	        uri = _locationToUri2.uri,
	        pagename = _locationToUri2.pagename,
	        query = _locationToUri2.query;

	    var newStack = {
	      uri: uri,
	      pagename: pagename,
	      query: query,
	      key: key,
	      sub: new History()
	    };
	    var pages = [].concat(this.pages);
	    var actions = [].concat(this.actions);
	    var pagesMax = routeConfig.pagesMaxHistory;
	    actions[0] = newStack;
	    pages[0] = newStack;

	    if (pagename === splitUri((_pages$2 = pages[1]) === null || _pages$2 === void 0 ? void 0 : _pages$2.uri, 'pagename')) {
	      pages.splice(1, 1);
	    }

	    if (pages.length > pagesMax) {
	      pages.length = pagesMax;
	    }

	    this.actions = actions;
	    this.pages = pages;
	  };

	  _proto.relaunch = function relaunch(location, key) {
	    var _locationToUri3 = locationToUri(location, key),
	        uri = _locationToUri3.uri,
	        pagename = _locationToUri3.pagename,
	        query = _locationToUri3.query;

	    var newStack = {
	      uri: uri,
	      pagename: pagename,
	      query: query,
	      key: key,
	      sub: new History()
	    };
	    var actions = [newStack];
	    var pages = [newStack];
	    this.actions = actions;
	    this.pages = pages;
	  };

	  _proto.pop = function pop(n) {
	    var historyRecord = this.getPageRecord(n);

	    if (!historyRecord) {
	      return false;
	    }

	    var pages = [].concat(this.pages);
	    var actions = [];
	    pages.splice(0, n);
	    this.actions = actions;
	    this.pages = pages;
	    return true;
	  };

	  _proto.back = function back(n) {
	    var _actions$, _pages$3;

	    var historyRecord = this.getActionRecord(n);

	    if (!historyRecord) {
	      return false;
	    }

	    var uri = historyRecord.uri;
	    var pagename = splitUri(uri, 'pagename');
	    var pages = [].concat(this.pages);
	    var actions = [].concat(this.actions);
	    var deleteActions = actions.splice(0, n + 1, historyRecord);
	    var arr = deleteActions.reduce(function (pre, curStack) {
	      var ctag = splitUri(curStack.uri, 'pagename');

	      if (pre[pre.length - 1] !== ctag) {
	        pre.push(ctag);
	      }

	      return pre;
	    }, []);

	    if (arr[arr.length - 1] === splitUri((_actions$ = actions[1]) === null || _actions$ === void 0 ? void 0 : _actions$.uri, 'pagename')) {
	      arr.pop();
	    }

	    pages.splice(0, arr.length, historyRecord);

	    if (pagename === splitUri((_pages$3 = pages[1]) === null || _pages$3 === void 0 ? void 0 : _pages$3.uri, 'pagename')) {
	      pages.splice(1, 1);
	    }

	    this.actions = actions;
	    this.pages = pages;
	    return true;
	  };

	  return History;
	}();

	function isPlainObject$2(obj) {
	  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
	}

	function __extendDefault(target, def) {
	  var clone = {};
	  Object.keys(def).forEach(function (key) {
	    if (!target.hasOwnProperty(key)) {
	      clone[key] = def[key];
	    } else {
	      var tval = target[key];
	      var dval = def[key];

	      if (isPlainObject$2(tval) && isPlainObject$2(dval) && tval !== dval) {
	        clone[key] = __extendDefault(tval, dval);
	      } else {
	        clone[key] = tval;
	      }
	    }
	  });
	  return clone;
	}

	function extendDefault(target, def) {
	  if (!isPlainObject$2(target)) {
	    target = {};
	  }

	  if (!isPlainObject$2(def)) {
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
	      if (typeof value === typeof defaultValue && isPlainObject$2(value)) {
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
	  if (!isPlainObject$2(data)) {
	    return {};
	  }

	  if (!isPlainObject$2(def)) {
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
	    } else if (isPlainObject$2(value)) {
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
	  if (!isPlainObject$2(data)) {
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

	function assignDefaultData(data, def) {
	  return Object.keys(data).reduce(function (params, moduleName) {
	    if (def.hasOwnProperty(moduleName)) {
	      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
	    }

	    return params;
	  }, {});
	}

	function splitSearch(search, paramsKey) {
	  var reg = new RegExp("&" + paramsKey + "=([^&]+)");
	  var arr = ("&" + search).match(reg);
	  return arr ? arr[1] : '';
	}

	function encodeBas64(str) {
	  return typeof btoa === 'function' ? btoa(str) : typeof Buffer === 'object' ? Buffer.from(str).toString('base64') : str;
	}

	function decodeBas64(str) {
	  return typeof atob === 'function' ? atob(str) : typeof Buffer === 'object' ? Buffer.from(str, 'base64').toString() : str;
	}

	function parseNativeLocation(nativeLocation, paramsKey, base64, parse) {
	  var search = splitSearch(nativeLocation.search, paramsKey);
	  var hash = splitSearch(nativeLocation.hash, paramsKey);

	  if (base64) {
	    search = search && decodeBas64(search);
	    hash = hash && decodeBas64(hash);
	  } else {
	    search = search && decodeURIComponent(search);
	    hash = hash && decodeURIComponent(hash);
	  }

	  var pathname = nativeLocation.pathname;

	  if (!pathname.startsWith('/')) {
	    pathname = "/" + pathname;
	  }

	  return {
	    pathname: pathname.replace(/\/*$/, '') || '/',
	    searchParams: search ? parse(search) : undefined,
	    hashParams: hash ? parse(hash) : undefined
	  };
	}

	function toNativeLocation(pathname, search, hash, paramsKey, base64, stringify) {
	  var searchStr = search ? stringify(search) : '';
	  var hashStr = hash ? stringify(hash) : '';

	  if (base64) {
	    searchStr = searchStr && encodeBas64(searchStr);
	    hashStr = hashStr && encodeBas64(hashStr);
	  } else {
	    searchStr = searchStr && encodeURIComponent(searchStr);
	    hashStr = hashStr && encodeURIComponent(hashStr);
	  }

	  if (!pathname.startsWith('/')) {
	    pathname = "/" + pathname;
	  }

	  return {
	    pathname: pathname.replace(/\/*$/, '') || '/',
	    search: searchStr && paramsKey + "=" + searchStr,
	    hash: hashStr && paramsKey + "=" + hashStr
	  };
	}

	function createPathnameTransform(pathnameIn, pagenameMap, pathnameOut) {
	  pagenameMap = Object.keys(pagenameMap).sort(function (a, b) {
	    return b.length - a.length;
	  }).reduce(function (map, pagename) {
	    var fullPagename = ("/" + pagename + "/").replace('//', '/').replace('//', '/');
	    map[fullPagename] = pagenameMap[pagename];
	    return map;
	  }, {});
	  routeConfig.pagenames = Object.keys(pagenameMap).reduce(function (obj, key) {
	    obj[key] = key;
	    return obj;
	  }, {});
	  routeConfig.pagenames['/'] = '/';
	  return {
	    in: function _in(pathname) {
	      pathname = pathnameIn(pathname);

	      if (!pathname.endsWith('/')) {
	        pathname = pathname + "/";
	      }

	      var pagename = Object.keys(pagenameMap).find(function (name) {
	        return pathname.startsWith(name);
	      });
	      var pathParams;

	      if (!pagename) {
	        pagename = '/';
	        pathParams = {};
	      } else {
	        var args = pathname.replace(pagename, '').split('/').map(function (item) {
	          return item ? decodeURIComponent(item) : undefined;
	        });
	        pathParams = pagenameMap[pagename].in(args);
	        pagename = pagename.replace(/\/$/, '') || '/';
	      }

	      return {
	        pagename: pagename,
	        pathParams: pathParams
	      };
	    },
	    out: function out(pagename, params) {
	      pagename = ("/" + pagename + "/").replace('//', '/').replace('//', '/');
	      var pathname;

	      if (!pagenameMap[pagename]) {
	        pathname = '/';
	      } else {
	        var args = pagenameMap[pagename].out(params);
	        pathname = pagename + args.map(function (item) {
	          return item && encodeURIComponent(item);
	        }).join('/').replace(/\/*$/, '');
	      }

	      if (pathnameOut) {
	        pathname = pathnameOut(pathname);
	      }

	      var data = this.in(pathname);
	      var pathParams = data.pathParams;
	      return {
	        pathname: pathname,
	        pathParams: pathParams
	      };
	    }
	  };
	}
	function createLocationTransform(pathnameTransform, defaultData, base64, serialization, paramsKey) {
	  if (base64 === void 0) {
	    base64 = false;
	  }

	  if (serialization === void 0) {
	    serialization = JSON;
	  }

	  if (paramsKey === void 0) {
	    paramsKey = '_';
	  }

	  return {
	    in: function _in(nativeLocation) {
	      var _parseNativeLocation = parseNativeLocation(nativeLocation, paramsKey, base64, serialization.parse),
	          pathname = _parseNativeLocation.pathname,
	          searchParams = _parseNativeLocation.searchParams,
	          hashParams = _parseNativeLocation.hashParams;

	      var _pathnameTransform$in = pathnameTransform.in(pathname),
	          pagename = _pathnameTransform$in.pagename,
	          pathParams = _pathnameTransform$in.pathParams;

	      var params = deepMerge(pathParams, searchParams, hashParams);
	      params = assignDefaultData(params, defaultData);
	      return {
	        pagename: pagename,
	        params: params
	      };
	    },
	    out: function out(meduxLocation) {
	      var params = excludeDefault(meduxLocation.params, defaultData, true);

	      var _pathnameTransform$ou = pathnameTransform.out(meduxLocation.pagename, params),
	          pathname = _pathnameTransform$ou.pathname,
	          pathParams = _pathnameTransform$ou.pathParams;

	      params = excludeDefault(params, pathParams, false);
	      var result = splitPrivate(params, pathParams);
	      return toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
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
	        return routeParams ? deepMergeState(initState, routeParams) : initState;
	      }
	    }, {
	      kind: "method",
	      decorators: [reducer],
	      key: "RouteParams",
	      value: function RouteParams(payload) {
	        return deepMergeState(this.state, payload);
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

	            if ((_rootState$moduleName = rootState[moduleName]) !== null && _rootState$moduleName !== void 0 && _rootState$moduleName.initialized) {
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
	    return mergeState(state, action.payload[0]);
	  }

	  return state;
	};
	var BaseRouter = function () {
	  function BaseRouter(initUrl, nativeRouter, locationTransform) {
	    this.nativeRouter = nativeRouter;
	    this.locationTransform = locationTransform;

	    _defineProperty(this, "_tid", 0);

	    _defineProperty(this, "routeState", void 0);

	    _defineProperty(this, "nativeLocation", void 0);

	    _defineProperty(this, "url", void 0);

	    _defineProperty(this, "store", void 0);

	    _defineProperty(this, "history", void 0);

	    var location = this.urlToToLocation(initUrl);
	    this.nativeLocation = this.locationTransform.out(location);
	    this.url = this.nativeLocationToUrl(this.nativeLocation);

	    var key = this._createKey();

	    this.history = new History();
	    var routeState = Object.assign({}, location, {
	      action: 'RELAUNCH',
	      key: key
	    });
	    this.routeState = routeState;
	    this.history.relaunch(location, key);
	    this.nativeRouter.relaunch(this.url, key, false);
	  }

	  var _proto = BaseRouter.prototype;

	  _proto.getRouteState = function getRouteState() {
	    return this.routeState;
	  };

	  _proto.getNativeLocation = function getNativeLocation() {
	    return this.nativeLocation;
	  };

	  _proto.getUrl = function getUrl() {
	    return this.url;
	  };

	  _proto.setStore = function setStore(_store) {
	    this.store = _store;
	  };

	  _proto.getCurKey = function getCurKey() {
	    return this.routeState.key;
	  };

	  _proto._createKey = function _createKey() {
	    this._tid++;
	    return "" + this._tid;
	  };

	  _proto.payloadToLocation = function payloadToLocation(data) {
	    var pagename = data.pagename;
	    var extendParams = data.extendParams === true ? this.routeState.params : data.extendParams;
	    var params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
	    return {
	      pagename: pagename || this.routeState.pagename || '/',
	      params: params
	    };
	  };

	  _proto.urlToToLocation = function urlToToLocation(url) {
	    var nativeLocation = this.urlToNativeLocation(url);
	    return this.locationTransform.in(nativeLocation);
	  };

	  _proto.urlToNativeLocation = function urlToNativeLocation(url) {
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

	    var path = arr[0],
	        _arr$ = arr[1],
	        search = _arr$ === void 0 ? '' : _arr$,
	        _arr$2 = arr[2],
	        hash = _arr$2 === void 0 ? '' : _arr$2;
	    var pathname = path;

	    if (!pathname.startsWith('/')) {
	      pathname = "/" + pathname;
	    }

	    pathname = pathname.replace(/\/*$/, '') || '/';
	    return {
	      pathname: pathname,
	      search: search,
	      hash: hash
	    };
	  };

	  _proto.nativeLocationToUrl = function nativeLocationToUrl(nativeLocation) {
	    var pathname = nativeLocation.pathname,
	        search = nativeLocation.search,
	        hash = nativeLocation.hash;
	    return [pathname && (pathname.replace(/\/*$/, '') || '/'), search && "?" + search, hash && "#" + hash].join('');
	  };

	  _proto.locationToUrl = function locationToUrl(location) {
	    var nativeLocation = this.locationTransform.out(location);
	    return this.nativeLocationToUrl(nativeLocation);
	  };

	  _proto.relaunch = function () {
	    var _relaunch = _asyncToGenerator(regenerator.mark(function _callee(data, internal) {
	      var location, key, routeState;
	      return regenerator.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
	              key = this._createKey();
	              routeState = Object.assign({}, location, {
	                action: 'RELAUNCH',
	                key: key
	              });
	              _context.next = 5;
	              return this.store.dispatch(beforeRouteChangeAction(routeState));

	            case 5:
	              this.routeState = routeState;
	              this.store.dispatch(routeChangeAction(routeState));
	              this.nativeLocation = this.locationTransform.out(location);
	              this.url = this.nativeLocationToUrl(this.nativeLocation);

	              if (internal) {
	                this.history.getCurrentInternalHistory().relaunch(location, key);
	              } else {
	                this.history.relaunch(location, key);
	              }

	              this.nativeRouter.relaunch(this.url, key, !!internal);
	              return _context.abrupt("return", routeState);

	            case 12:
	            case "end":
	              return _context.stop();
	          }
	        }
	      }, _callee, this);
	    }));

	    function relaunch(_x, _x2) {
	      return _relaunch.apply(this, arguments);
	    }

	    return relaunch;
	  }();

	  _proto.push = function () {
	    var _push = _asyncToGenerator(regenerator.mark(function _callee2(data, internal) {
	      var location, key, routeState;
	      return regenerator.wrap(function _callee2$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
	              key = this._createKey();
	              routeState = Object.assign({}, location, {
	                action: 'PUSH',
	                key: key
	              });
	              _context2.next = 5;
	              return this.store.dispatch(beforeRouteChangeAction(routeState));

	            case 5:
	              this.routeState = routeState;
	              this.store.dispatch(routeChangeAction(routeState));
	              this.nativeLocation = this.locationTransform.out(location);
	              this.url = this.nativeLocationToUrl(this.nativeLocation);

	              if (internal) {
	                this.history.getCurrentInternalHistory().push(location, key);
	              } else {
	                this.history.push(location, key);
	              }

	              this.nativeRouter.push(this.url, key, !!internal);
	              return _context2.abrupt("return", routeState);

	            case 12:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, _callee2, this);
	    }));

	    function push(_x3, _x4) {
	      return _push.apply(this, arguments);
	    }

	    return push;
	  }();

	  _proto.replace = function () {
	    var _replace = _asyncToGenerator(regenerator.mark(function _callee3(data, internal) {
	      var location, key, routeState;
	      return regenerator.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
	              key = this._createKey();
	              routeState = Object.assign({}, location, {
	                action: 'REPLACE',
	                key: key
	              });
	              _context3.next = 5;
	              return this.store.dispatch(beforeRouteChangeAction(routeState));

	            case 5:
	              this.routeState = routeState;
	              this.store.dispatch(routeChangeAction(routeState));
	              this.nativeLocation = this.locationTransform.out(location);
	              this.url = this.nativeLocationToUrl(this.nativeLocation);

	              if (internal) {
	                this.history.getCurrentInternalHistory().replace(location, key);
	              } else {
	                this.history.replace(location, key);
	              }

	              this.nativeRouter.replace(this.url, key, !!internal);
	              return _context3.abrupt("return", routeState);

	            case 12:
	            case "end":
	              return _context3.stop();
	          }
	        }
	      }, _callee3, this);
	    }));

	    function replace(_x5, _x6) {
	      return _replace.apply(this, arguments);
	    }

	    return replace;
	  }();

	  _proto.back = function () {
	    var _back = _asyncToGenerator(regenerator.mark(function _callee4(n, internal) {
	      var stack, uri, _uriToLocation, key, location, routeState;

	      return regenerator.wrap(function _callee4$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              if (n === void 0) {
	                n = 1;
	              }

	              stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);

	              if (stack) {
	                _context4.next = 4;
	                break;
	              }

	              return _context4.abrupt("return", Promise.reject(1));

	            case 4:
	              uri = stack.uri;
	              _uriToLocation = uriToLocation(uri), key = _uriToLocation.key, location = _uriToLocation.location;
	              routeState = Object.assign({}, location, {
	                action: 'BACK',
	                key: key
	              });
	              _context4.next = 9;
	              return this.store.dispatch(beforeRouteChangeAction(routeState));

	            case 9:
	              this.routeState = routeState;
	              this.store.dispatch(routeChangeAction(routeState));
	              this.nativeLocation = this.locationTransform.out(location);
	              this.url = this.nativeLocationToUrl(this.nativeLocation);

	              if (internal) {
	                this.history.getCurrentInternalHistory().back(n);
	              } else {
	                this.history.back(n);
	              }

	              this.nativeRouter.back(this.url, n, key, !!internal);
	              return _context4.abrupt("return", routeState);

	            case 16:
	            case "end":
	              return _context4.stop();
	          }
	        }
	      }, _callee4, this);
	    }));

	    function back(_x7, _x8) {
	      return _back.apply(this, arguments);
	    }

	    return back;
	  }();

	  _proto.pop = function () {
	    var _pop = _asyncToGenerator(regenerator.mark(function _callee5(n, internal) {
	      var stack, uri, _uriToLocation2, key, location, routeState;

	      return regenerator.wrap(function _callee5$(_context5) {
	        while (1) {
	          switch (_context5.prev = _context5.next) {
	            case 0:
	              if (n === void 0) {
	                n = 1;
	              }

	              stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);

	              if (stack) {
	                _context5.next = 4;
	                break;
	              }

	              return _context5.abrupt("return", Promise.reject(1));

	            case 4:
	              uri = stack.uri;
	              _uriToLocation2 = uriToLocation(uri), key = _uriToLocation2.key, location = _uriToLocation2.location;
	              routeState = Object.assign({}, location, {
	                action: 'POP',
	                key: key
	              });
	              _context5.next = 9;
	              return this.store.dispatch(beforeRouteChangeAction(routeState));

	            case 9:
	              this.routeState = routeState;
	              this.store.dispatch(routeChangeAction(routeState));
	              this.nativeLocation = this.locationTransform.out(location);
	              this.url = this.nativeLocationToUrl(this.nativeLocation);

	              if (internal) {
	                this.history.getCurrentInternalHistory().pop(n);
	              } else {
	                this.history.pop(n);
	              }

	              this.nativeRouter.pop(this.url, n, key, !!internal);
	              return _context5.abrupt("return", routeState);

	            case 16:
	            case "end":
	              return _context5.stop();
	          }
	        }
	      }, _callee5, this);
	    }));

	    function pop(_x9, _x10) {
	      return _pop.apply(this, arguments);
	    }

	    return pop;
	  }();

	  return BaseRouter;
	}();

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

	function warning$1(condition, message) {
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
	    process.env.NODE_ENV !== "production" ? warning$1(prompt == null, 'A history supports only one prompt at a time') : void 0;
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
	          process.env.NODE_ENV !== "production" ? warning$1(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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
	        process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
	        window.location.href = href;
	      }
	    });
	  }

	  function replace(path, state) {
	    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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
	        process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Hash history cannot push state; it is ignored') : void 0;
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
	        process.env.NODE_ENV !== "production" ? warning$1(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : void 0;
	        setState();
	      }
	    });
	  }

	  function replace(path, state) {
	    process.env.NODE_ENV !== "production" ? warning$1(state === undefined, 'Hash history cannot replace state; it is ignored') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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
	    process.env.NODE_ENV !== "production" ? warning$1(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
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

	var BrowserNativeRouter = function () {
	  function BrowserNativeRouter(createHistory) {
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

	  var _proto = BrowserNativeRouter.prototype;

	  _proto.getUrl = function getUrl() {
	    var _this$history$locatio = this.history.location,
	        _this$history$locatio2 = _this$history$locatio.pathname,
	        pathname = _this$history$locatio2 === void 0 ? '' : _this$history$locatio2,
	        _this$history$locatio3 = _this$history$locatio.search,
	        search = _this$history$locatio3 === void 0 ? '' : _this$history$locatio3,
	        _this$history$locatio4 = _this$history$locatio.hash,
	        hash = _this$history$locatio4 === void 0 ? '' : _this$history$locatio4;
	    return [pathname, search, hash].join('');
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

	  _proto.push = function push(url, key, internal) {
	    !internal && this.history.push(url, key);
	  };

	  _proto.replace = function replace(url, key, internal) {
	    !internal && this.history.replace(url, key);
	  };

	  _proto.relaunch = function relaunch(url, key, internal) {
	    !internal && this.history.push(url, key);
	  };

	  _proto.back = function back(url, n, key, internal) {
	    !internal && this.history.go(-n);
	  };

	  _proto.pop = function pop(url, n, key, internal) {
	    !internal && this.history.push(url, key);
	  };

	  _proto.refresh = function refresh() {
	    this.history.go(0);
	  };

	  return BrowserNativeRouter;
	}();
	var Router = function (_BaseRouter) {
	  _inheritsLoose(Router, _BaseRouter);

	  function Router(browserNativeRouter, locationTransform) {
	    var _this2;

	    _this2 = _BaseRouter.call(this, browserNativeRouter.getUrl(), browserNativeRouter, locationTransform) || this;

	    _defineProperty(_assertThisInitialized(_this2), "_unlistenHistory", void 0);

	    _defineProperty(_assertThisInitialized(_this2), "_timer", 0);

	    _defineProperty(_assertThisInitialized(_this2), "nativeRouter", void 0);

	    _this2.nativeRouter = browserNativeRouter;
	    _this2._unlistenHistory = browserNativeRouter.block(function (url, key, action) {
	      if (key !== _this2.getCurKey()) {
	        var callback;
	        var index = 0;

	        if (action === 'POP') {
	          index = _this2.history.getActionIndex(key);
	        }

	        if (index > 0) {
	          callback = function callback() {
	            _this2._timer = 0;

	            _this2.back(index);
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

	  var _proto2 = Router.prototype;

	  _proto2.destroy = function destroy() {
	    this._unlistenHistory();
	  };

	  return Router;
	}(BaseRouter);
	function createRouter(createHistory, locationTransform) {
	  var browserNativeRouter = new BrowserNativeRouter(createHistory);
	  var router = new Router(browserNativeRouter, locationTransform);
	  return router;
	}

	var loadViewDefaultOptions = {
	  LoadViewOnError: React__default['default'].createElement("div", null, "error"),
	  LoadViewOnLoading: React__default['default'].createElement("div", null)
	};
	function setLoadViewOptions(_ref) {
	  var LoadViewOnError = _ref.LoadViewOnError,
	      LoadViewOnLoading = _ref.LoadViewOnLoading;
	  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
	  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
	}
	var loadView = function loadView(moduleName, viewName, options) {
	  var _ref2 = options || {},
	      OnLoading = _ref2.OnLoading,
	      OnError = _ref2.OnError;

	  var active = true;

	  var Loader = function ViewLoader(props, ref) {
	    var OnErrorComponent = OnError || loadViewDefaultOptions.LoadViewOnError;
	    var OnLoadingComponent = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;
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
	        }).catch(function (e) {
	          active && setView({
	            Component: function Component() {
	              return OnErrorComponent;
	            }
	          });
	          env.console.error(e);
	        });
	        return null;
	      }

	      return {
	        Component: moduleViewResult
	      };
	    }),
	        view = _useState[0],
	        setView = _useState[1];

	    return view ? React__default['default'].createElement(view.Component, _extends({}, props, {
	      ref: ref
	    })) : OnLoadingComponent;
	  };

	  var Component = React__default['default'].forwardRef(Loader);
	  return Component;
	};

	var appExports = {
	  loadView: loadView,
	  getActions: undefined,
	  state: undefined,
	  store: undefined,
	  router: undefined,
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
	    Actions: {},
	    Pagenames: routeConfig.pagenames
	  };
	}

	var Component = function Component(_ref) {
	  var children = _ref.children;
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

	var DocumentHead = React__default['default'].memo(Component);

	var Component$1 = function Component(_ref) {
	  var children = _ref.children,
	      elseView = _ref.elseView;
	  var arr = [];
	  React__default['default'].Children.forEach(children, function (item) {
	    item && arr.push(item);
	  });

	  if (arr.length > 0) {
	    return React__default['default'].createElement(React__default['default'].Fragment, null, arr);
	  }

	  return React__default['default'].createElement(React__default['default'].Fragment, null, elseView);
	};

	var Else = React__default['default'].memo(Component$1);

	var Component$2 = function Component(_ref) {
	  var children = _ref.children,
	      elseView = _ref.elseView;
	  var arr = [];
	  React__default['default'].Children.forEach(children, function (item) {
	    item && arr.push(item);
	  });

	  if (arr.length > 0) {
	    return React__default['default'].createElement(React__default['default'].Fragment, null, arr[0]);
	  }

	  return React__default['default'].createElement(React__default['default'].Fragment, null, elseView);
	};

	var Switch = React__default['default'].memo(Component$2);

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

	function isModifiedEvent(event) {
	  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
	}

	var Link = React__default['default'].forwardRef(function (_ref, ref) {
	  var _onClick = _ref.onClick,
	      replace = _ref.replace,
	      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "replace"]);

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
	          replace ? appExports.router.replace(rest.href) : appExports.router.push(rest.href);
	        }
	    }
	  });
	  return React__default['default'].createElement("a", _extends({}, props, {
	    ref: ref
	  }));
	});

	var SSRKey = 'meduxInitStore';
	function setConfig$1(conf) {
	  setConfig(conf);
	  setRouteConfig(conf);
	  setLoadViewOptions(conf);
	  conf.SSRKey && (SSRKey = conf.SSRKey);
	}
	var exportModule$1 = exportModule;
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
	  var router = createRouter(historyType, locationTransform);
	  appExports.router = router;
	  var _storeOptions$middlew = storeOptions.middlewares,
	      middlewares = _storeOptions$middlew === void 0 ? [] : _storeOptions$middlew,
	      _storeOptions$reducer = storeOptions.reducers,
	      reducers = _storeOptions$reducer === void 0 ? {} : _storeOptions$reducer,
	      _storeOptions$initDat = storeOptions.initData,
	      initData = _storeOptions$initDat === void 0 ? {} : _storeOptions$initDat;
	  middlewares.unshift(routeMiddleware);
	  reducers.route = routeReducer;
	  var ssrData = env[SSRKey];
	  initData.route = router.getRouteState();
	  return renderApp(function (store, AppView) {
	    var reRender = function reRender(View) {
	      var panel = typeof container === 'string' ? env.document.getElementById(container) : container;
	      reactDom.unmountComponentAtNode(panel);
	      var renderFun = ssrData ? reactDom.hydrate : reactDom.render;
	      renderFun(React__default['default'].createElement(View, {
	        store: store
	      }), panel);
	    };

	    reRender(AppView);
	    return reRender;
	  }, moduleGetter, appModuleName, appViewName, Object.assign({}, storeOptions, {
	    middlewares: middlewares,
	    reducers: reducers,
	    initData: mergeState(initData, ssrData)
	  }), function (store) {
	    router.setStore(store);
	    appExports.store = store;
	    Object.defineProperty(appExports, 'state', {
	      get: function get() {
	        return store.getState();
	      }
	    });
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
	  var router = createRouter(request.url, locationTransform);
	  appExports.router = router;
	  var _storeOptions$initDat2 = storeOptions.initData,
	      initData = _storeOptions$initDat2 === void 0 ? {} : _storeOptions$initDat2;
	  initData.route = router.getRouteState();
	  return renderSSR(function (store, AppView) {
	    var data = store.getState();
	    return {
	      store: store,
	      data: data,
	      html: require('react-dom/server').renderToString(React__default['default'].createElement(AppView, {
	        store: store
	      }))
	    };
	  }, moduleGetter, appModuleName, appViewName, Object.assign({}, storeOptions, {
	    initData: initData
	  }), function (store) {
	    router.setStore(store);
	    appExports.store = store;
	    Object.defineProperty(appExports, 'state', {
	      get: function get() {
	        return store.getState();
	      }
	    });
	  }).then(function (_ref3) {
	    var html = _ref3.html,
	        data = _ref3.data;
	    var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + container + "['\"][^<>]*>", 'm'));

	    if (match) {
	      var pageHead = html.split(/<head>|<\/head>/, 3);
	      html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
	      return SSRTPL.replace('</head>', (pageHead[1] || '') + "\r\n<script>window." + SSRKey + " = " + JSON.stringify(data) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
	    }

	    return html;
	  });
	}

	exports.ActionTypes = ActionTypes;
	exports.BaseModuleHandlers = RouteModuleHandlers;
	exports.DocumentHead = DocumentHead;
	exports.Else = Else;
	exports.Link = Link;
	exports.Switch = Switch;
	exports.buildApp = buildApp;
	exports.buildSSR = buildSSR;
	exports.clientSide = clientSide;
	exports.createLocationTransform = createLocationTransform;
	exports.createPathnameTransform = createPathnameTransform;
	exports.deepMerge = deepMerge;
	exports.deepMergeState = deepMergeState;
	exports.delayPromise = delayPromise;
	exports.effect = effect;
	exports.errorAction = errorAction;
	exports.exportApp = exportApp;
	exports.exportModule = exportModule$1;
	exports.isProcessedError = isProcessedError;
	exports.isServer = isServer;
	exports.logger = logger;
	exports.modelHotReplacement = modelHotReplacement;
	exports.patchActions = patchActions;
	exports.reducer = reducer;
	exports.serverSide = serverSide;
	exports.setConfig = setConfig$1;
	exports.setLoading = setLoading;
	exports.setLoadingDepthTime = setLoadingDepthTime;
	exports.setProcessedError = setProcessedError;
	exports.setSsrHtmlTpl = setSsrHtmlTpl;
	exports.viewHotReplacement = viewHotReplacement;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
