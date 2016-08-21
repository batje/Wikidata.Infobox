(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Wikidata = global.Wikidata || {})));
}(this, function (exports) { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

	function interopDefault(ex) {
		return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var q = createCommonjsModule(function (module, exports) {
	// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2016 Kris Kowal under the terms of the MIT
	 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */

	(function (definition) {
	    "use strict";

	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.

	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);

	    // CommonJS
	    } else if (typeof exports === "object" && typeof module === "object") {
	        module.exports = definition();

	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);

	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }

	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;

	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();

	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };

	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }

	})(function () {
	"use strict";

	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}

	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;

	// shims

	// used for fallback in "allResolved"
	var noop = function () {};

	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];

	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;

	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;

	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);

	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();

	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!

	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }

	                throw e;

	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }

	        if (domain) {
	            domain.exit();
	        }
	    }

	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };

	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };

	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.nextTick()` yields "[object process]".
	        isNodeJS = true;

	        requestTick = function () {
	            process.nextTick(flush);
	        };

	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }

	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };

	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();

	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis

	var array_slice = uncurryThis(Array.prototype.slice);

	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);

	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);

	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);

	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};

	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};

	var object_toString = uncurryThis(Object.prototype.toString);

	function isObject(value) {
	    return value === Object(value);
	}

	// generator related shims

	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}

	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}

	// long stack traces

	var STACK_JUMP_SEPARATOR = "From previous event:";

	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack &&
	        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack) {
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);

	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        error.stack = filterStackString(concatedStacks);
	    }
	}

	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];

	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}

	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}

	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }

	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }

	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}

	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

	    if (!fileNameAndLineNumber) {
	        return false;
	    }

	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];

	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}

	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }

	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }

	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}

	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}

	// end of shims
	// beginning of real work

	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }

	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;

	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;

	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;

	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}

	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;

	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };

	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };

	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };

	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	        }
	    }

	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

	    function become(newPromise) {
	        resolvedPromise = newPromise;

	        if (Q.longStackSupport && hasStacks) {
	            // Only hold a reference to the new promise if long stacks
	            // are enabled to reduce memory usage
	            promise.source = newPromise;
	        }

	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);

	        messages = void 0;
	        progressListeners = void 0;
	    }

	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(Q(value));
	    };

	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }

	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };

	    return deferred;
	}

	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};

	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}

	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6

	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};

	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};

	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};

	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Q can't join: not the same: " + x + " " + y);
	        }
	    });
	};

	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}

	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};

	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }

	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };

	    promise.inspect = inspect;

	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }

	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }

	    return promise;
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks

	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }

	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }

	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }

	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_rejected(exception));
	        }]);
	    });

	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }

	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);

	    return deferred.promise;
	};

	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};

	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);

	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};

	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}

	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};

	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};

	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};

	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};

	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */

	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}

	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}

	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}

	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}

	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};

	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}

	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};

	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}

	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};

	//// BEGIN UNHANDLED REJECTION TRACKING

	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;

	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;

	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}

	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }

	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}

	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }

	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}

	Q.resetUnhandledRejections = resetUnhandledRejections;

	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};

	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};

	resetUnhandledRejections();

	//// END UNHANDLED REJECTION TRACKING

	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });

	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);

	    return rejection;
	}

	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}

	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}

	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}

	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}

	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};

	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;

	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.

	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}

	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}

	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}

	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}

	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}

	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};

	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};

	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};

	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};

	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};

	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};

	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};

	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};

	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};

	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};

	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};

	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};

	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};

	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};

	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};

	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};

	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}

	Promise.prototype.all = function () {
	    return all(this);
	};

	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;

	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }

	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];

	        pendingCount++;

	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected(err) {
	            pendingCount--;
	            if (pendingCount === 0) {
	                err.message = ("Q can't get fulfillment value from any promise, all " +
	                    "promises were rejected. Last error message: " + err.message);
	                deferred.reject(err);
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);

	    return deferred.promise;
	}

	Promise.prototype.any = function () {
	    return any(this);
	};

	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}

	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};

	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}

	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};

	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};

	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};

	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}

	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};

	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};

	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    if (!callback || typeof callback.apply !== "function") {
	        throw new Error("Q can't apply finally callback");
	    }
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};

	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};

	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };

	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;

	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }

	    promise.then(void 0, onUnhandledError);
	};

	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};

	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);

	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);

	    return deferred.promise;
	};

	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};

	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    if (callback === undefined) {
	        throw new Error("Q can't wrap an undefined function");
	    }
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};

	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};

	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}

	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};

	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};

	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();

	return Q;

	});
	});

	var q$1 = interopDefault(q);


	var require$$1 = Object.freeze({
	    default: q$1
	});

	var index$2 = createCommonjsModule(function (module) {
	/*!
	 * deep-aplus <https://github.com/nknapp/deep-aplus>
	 *
	 * Copyright (c) 2016 Nils Knappmeier.
	 * Released under the MIT license.
	 */

	'use strict'

	module.exports = deepAPlus

	/**
	 * Creates a `deep(value)`-function using the provided constructor to
	 * create the resulting promise and promises for intermediate steps.
	 * The `deep` function returns a promise for the resolution of an arbitrary
	 * structure passed as parameter
	 * @param {function} Promise class in which promises are created
	 * @returns {function(*):Promise} a function that returns a promise (of the provided class)
	 *   for a whole object structure
	 * @public
	 * @module
	 */

	function deepAPlus (Promise) {
	  function handleArray (arr) {
	    return new Promise(function (fulfill, reject) {
	      var counter = arr.length
	      if (arr.length === 0) {
	        return fulfill([])
	      }
	      var result = []
	      arr.forEach(function (element, index) {
	        handleAny(element).then(function (value) {
	          result[index] = value
	          counter--
	          if (counter === 0) {
	            fulfill(result)
	          }
	        }, function (err) {
	          reject(err)
	        })
	      })
	    })
	  }

	  function handleObject (obj) {
	    var keys = Object.keys(obj)
	    var values = keys.map(function (key) {
	      return obj[key]
	    })
	    return handleArray(values).then(function (valueResults) {
	      var result = {}
	      for (var i = 0; i < keys.length; i++) {
	        result[keys[i]] = valueResults[i]
	      }
	      return result
	    })
	  }

	  /**
	   * Check if this is something like a promise (taken from the Q-module)
	   * @param {*} obj the object to check for being a promise
	   * @returns {boolean} true, if the object is a promise
	   * @private
	   */
	  function isPromiseAlike (obj) {
	    return obj === Object(obj) && typeof obj.then === 'function'
	  }

	  /**
	   * Return a promise for an object, array, or other value, with all internal promises resolved.
	   * @param obj
	   * @returns {Promise}
	   * @private
	   */
	  function handleAny (obj) {
	    if (isPromiseAlike(obj)) {
	      return obj.then(handleAny)
	    } else if (Object.prototype.toString.call(obj) === '[object Object]') {
	      return handleObject(obj)
	    } else if (Object.prototype.toString.call(obj) === '[object Array]') {
	      return handleArray(obj)
	    } else {
	      return new Promise(function (fulfill) {
	        return fulfill(obj)
	      })
	    }
	  }

	  return handleAny
	}
	});

	var index$3 = interopDefault(index$2);


	var require$$0 = Object.freeze({
	  default: index$3
	});

	var index = createCommonjsModule(function (module) {
	/*!
	 * promised-handlebars <https://github.com/nknapp/promised-handlebars>
	 *
	 * Copyright (c) 2015 Nils Knappmeier.
	 * Released under the MIT license.
	 */

	'use strict'

	var Q = interopDefault(require$$1)
	var deep = interopDefault(require$$0)(Q.Promise)

	module.exports = promisedHandlebars
	  /**
	   * Returns a new Handlebars instance that
	   * * allows helpers to return promises
	   * * creates `compiled` templates that always
	   *   return a promise for the resulting string.
	   *   The promise is fulfilled after all helper-promsises
	   *   are resolved.
	   *
	   * @param {Handlebars} Handlebars the Handlebars engine to wrap
	   * @param {object} options optional parameters
	   * @param {string=} options.placeholder the placeholder to be used in the template-output before inserting
	   *   the promised results. This placeholder may not occur in the template or any partial. Neither
	   *   my any helper generate the placeholder in to the result. Errors or wrong replacement will
	   *   happen otherwise.
	   * @returns {Handlebars} a modified Handlebars object
	   */
	function promisedHandlebars(Handlebars, options) {
	  options = options || {}
	  options.placeholder = options.placeholder || '\u0001'

	  var engine = Handlebars.create()
	  var markers = null

	  // Wrap `registerHelper` with a custom function
	  engine.registerHelper = wrap(engine.registerHelper, function registerHelperWrapper(oldRegisterHelper, args) {
	      if (typeof args[0] === 'string' && typeof args[1] === 'function') {
	        var name = args[0]
	        var helper = args[1]
	          // Called like "registerHelper(name, helper)"
	        oldRegisterHelper.call(engine, name, wrap(helper, helperWrapper))
	      } else if (args.length === 1 && typeof args[0] === 'object') {
	        // Called like "registerHelper({ name: helper })
	        oldRegisterHelper.call(engine, mapValues(args[0], function(helper) {
	          return wrap(helper, helperWrapper)
	        }))
	      }
	    })
	    // Re-register all built-in-helpers to ensure that their methods are wrapped
	  engine.registerHelper(engine.helpers)

	  // Wrap the `compile` function, so that it wraps the compiled-template
	  // with `prepareAndResolveMarkers`
	  engine.compile = wrap(engine.compile, function compileWrapper(oldCompile, args) {
	    var fn = oldCompile.apply(engine, args)
	    return wrap(fn, prepareAndResolveMarkers)
	      // Wrap the compiled function
	  })

	  /**
	   * Wrapper for templates, partials and block-helper callbacks
	   *
	   * 1) the `markers` variable is initialized with a new instance of Markers
	   * 2) a promise is returned instead of a string
	   * 3) promise placeholder-values are replaced with the promise-results
	   *    in the returned promise
	   */
	  function prepareAndResolveMarkers(fn, args) {
	    if (markers) {
	      // The Markers-object has already been created for this cycle of the event loop:
	      // Just run the wraped function
	      return fn.apply(this, args)
	    }
	    try {
	      // No Markers yet. This is the initial call or some call that occured during a promise resolution
	      // Create markers, apply the function and resolve placeholders (i.e. promises) created during the
	      // function execution
	      markers = new Markers(engine, options.placeholder)
	      var resultWithPlaceholders = fn.apply(this, args)
	      return markers.resolve(resultWithPlaceholders)
	    } finally {
	      // Reset promises for the next execution run
	      markers = null
	    }
	  }

	  /**
	   * Wrapper for helper methods:
	   * * Call the helper after resolving parameters (if any promises are passed)
	   * * Wrap `options.fn` and `options.inverse` to return promises (if needed)
	   * * Convert helper results markers if they are promises.
	   */
	  function helperWrapper(fn, args) {
	    var _this = this
	    var options = args[args.length - 1]
	    var hash = options.hash

	    // "fn" and "inverse" return strings. They must be able to handle promises
	    // just as the compiled template and partials
	    options.fn = options.fn && wrap(options.fn, prepareAndResolveMarkers)
	    options.inverse = options.inverse && wrap(options.inverse, prepareAndResolveMarkers)

	    // If there are any promises in the helper args or in the hash,
	    // the evaluation of the helper cannot start before these promises are resolved.
	    var promisesInArgs = anyApplies(args, Q.isPromiseAlike)
	    var promisesInHash = anyApplies(values(hash), Q.isPromiseAlike)

	    if (!promisesInArgs && !promisesInHash) {
	      // No promises in hash or args. Act a normal as possible.
	      var result = fn.apply(_this, args)
	      return Q.isPromiseAlike(result) ? markers.asMarker(result) : result
	    }

	    var promise = deep(args).then(function(resolvedArgs) {
	      // We need "markers", because we are in a new event-loop-cycle now.
	      return prepareAndResolveMarkers(function() {
	        return fn.apply(_this, resolvedArgs)
	      })
	    })
	    return markers.asMarker(promise)
	  }

	  return engine
	}

	/**
	 * Wrap a function with a wrapper function
	 * @param {function} fn the original function
	 * @param {function(function,array)} wrapperFunction the wrapper-function
	 *   receiving `fn` as first parameter and the arguments as second
	 * @returns {function} a function that calls the wrapper with
	 *   the original function and the arguments
	 */
	function wrap(fn, wrapperFunction) {
	  return function() {
	    return wrapperFunction.call(this, fn, toArray(arguments))
	  }
	}

	/**
	 * A class the handles the creation and resolution of markers in the Handlebars output.
	 * Markes are used as placeholders in the output string for promises returned by helpers.
	 * They are replaced as soon as the promises are resolved.
	 * @param {Handlebars} engine a Handlebars instance (needed for the `escapeExpression` function)
	 * @param {string} prefix the prefix to identify placeholders (this prefix should never occur in the template).
	 * @constructor
	 */
	function Markers(engine, prefix) {
	  /**
	   * This array stores the promises created in the current event-loop cycle
	   * @type {Promise[]}
	   */
	  this.promiseStore = []
	  this.engine = engine
	  this.prefix = prefix
	    // one line from substack's quotemeta-package
	  var placeHolderRegexEscaped = String(this.prefix).replace(/(\W)/g, '\\$1')
	  this.regex = new RegExp(placeHolderRegexEscaped + '(\\d+)(>|&gt;)', 'g')
	}

	/**
	 * Add a promise the the store and return a placeholder.
	 * A placeholder consists of
	 * * The configured prefix (or \u0001), followed by
	 * * the index in the array
	 * * ">"

	 * @param {Promise} promise the promise
	 * @return {Promise} a new promise with a toString-method returning the placeholder
	 */
	Markers.prototype.asMarker = function asMarker(promise) {
	  // The placeholder: "prefix" for identification, index of promise in the store for retrieval, '>' for escaping
	  var placeholder = this.prefix + this.promiseStore.length + '>'
	    // Create a new promise, don't modify the input
	  var result = new Q.Promise(function(resolve, reject) {
	    promise.done(resolve, reject)
	  })
	  result.toString = function() {
	    return placeholder
	  }
	  this.promiseStore.push(promise)
	  return result
	}

	/**
	 * Replace the placeholder found in a string by the resolved promise values.
	 * The input may be Promise, in which case it will be resolved first.
	 * Non-string values are returned directly since they cannot contain placeholders.
	 * String values are search for placeholders, which are then replaced by their resolved values.
	 * If the '>' part of the placeholder has been escaped (i.e. as '&gt;') the resolved value
	 * will be escaped as well.
	 *
	 * @param {Promise<any>} input the string with placeholders
	 * @return {Promise<string>} a promise for the string with resolved placeholders
	 */
	Markers.prototype.resolve = function resolve(input) {
	  var self = this
	  return Q(input).then(function(output) {
	    if (typeof output !== 'string') {
	      // Make sure that non-string values (e.g. numbers) are not converted to a string.
	      return output
	    }
	    return Q.all(self.promiseStore)
	      .then(function(promiseResults) {
	        /**
	         * Replace placeholders in a string. Looks for placeholders
	         * in the replacement string recursively.
	         * @param {string} string
	         * @returns {string}
	         */
	        function replacePlaceholdersRecursivelyIn(string) {
	          return string.replace(self.regex, function(match, index, gt) {
	            // Check whether promise result must be escaped
	            var resolvedValue = promiseResults[index]
	            var result = gt === '>' ? resolvedValue : self.engine.escapeExpression(resolvedValue)
	            return replacePlaceholdersRecursivelyIn(result)
	          })
	        }

	        // Promises are fulfilled. Insert real values into the result.
	        return replacePlaceholdersRecursivelyIn(String(output))
	      })
	  })
	}

	/**
	 * Apply the mapFn to all values of the object and return a new object with the applied values
	 * @param obj the input object
	 * @param {function(any, string, object): any} mapFn the map function (receives the value, the key and the whole object as parameter)
	 * @returns {object} an object with the same keys as the input object
	 */
	function mapValues(obj, mapFn) {
	  return Object.keys(obj).reduce(function(result, key) {
	    result[key] = mapFn(obj[key], key, obj)
	    return result
	  }, {})
	}

	/**
	 * Return the values of the object
	 * @param {object} obj an object
	 * @returns {Array} the values of the object
	 */
	function values(obj) {
	  return Object.keys(obj).map(function(key) {
	    return obj[key]
	  })
	}

	/**
	 * Check if the predicate is true for any element of the array
	 * @param {Array} array
	 * @param {function(any):boolean} predicate
	 * @returns {boolean}
	 */
	function anyApplies(array, predicate) {
	  for (var i = 0; i < array.length; i++) {
	    if (predicate(array[i])) {
	      return true
	    }
	  }
	  return false
	}

	/**
	 * Convert arrayLike-objects (like 'arguments') to an array
	 * @param arrayLike
	 * @returns {Array.<T>}
	 */
	function toArray(arrayLike) {
	  return Array.prototype.slice.call(arrayLike)
	}
	});

	var index$1 = interopDefault(index);

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var instance$1;

	var JavaScriptFetcherClass = function () {
	  function JavaScriptFetcherClass() {
	    classCallCheck(this, JavaScriptFetcherClass);

	    this.modules = [];
	    console.log("Fetcher Created");
	  }

	  createClass(JavaScriptFetcherClass, [{
	    key: "fetchJavaScript",
	    value: function fetchJavaScript(key, handlebars) {
	      var me = this;
	      return new Promise(function (resolve, reject) {
	        if (me.modules[key] !== false && typeof me.modules[key] == 'undefined') {
	          try {
	            console.log("Going to load Javascript for " + key);
	            me.modules[key] = System.import('../src/templates/' + key + '.js' + '?bust=' + new Date().getTime()).then(function (the_module) {
	              console.log("Loaded Javascript for  " + key, handlebars);
	              var property = the_module.default[key]();
	              property.load(handlebars).then(function () {
	                console.log("Loaded Object " + key);
	                me.modules[key] = property;
	                // Return the Object for postpocessing
	                resolve(property);
	              });
	            }).catch(function (err) {
	              // If not 404, log the error
	              if (!(err.message.indexOf("404 Not Found") > 0)) {
	                console.error("Error loading javascript for " + key, err);
	              }
	              me.modules[key] = false;
	              // We are in catch, but we really dont care if there was an error.
	              reject();
	            });
	          } catch (e) {
	            console.error("Error loading Javascript for " + key, e);
	            reject();
	          }
	        } else {
	          if (typeof me.modules[key] !== 'undefined' && me.modules[key] !== false) {
	            //        console.error("Returning Promise on Javascript that is still loading ", me.modules[key]);
	            Promise.resolve(me.modules[key]).then(function (property) {
	              resolve(property);
	            });
	          } else {
	            reject();
	          }
	        }
	      });
	    }
	  }]);
	  return JavaScriptFetcherClass;
	}();

	function JavaScriptFetcher() {
	  if (typeof instance$1 === 'undefined') {
	    instance$1 = new JavaScriptFetcherClass();
	  }
	  return instance$1;
	}

	var JavaScriptFetcher$1 = {
	  JavaScriptFetcher: JavaScriptFetcher
	};

	var instance$2;

	var TemplateFetcherClass = function () {
	  function TemplateFetcherClass() {
	    // empty

	    classCallCheck(this, TemplateFetcherClass);
	  }

	  createClass(TemplateFetcherClass, [{
	    key: 'getTemplate',
	    value: function getTemplate(name, handlebar, loadcss) {
	      var me = this;
	      if (typeof handlebar.templates[name] === 'undefined') {
	        var result = new Promise(function (resolve, reject) {
	          $.ajax('templates/' + name + '.hbs').done(function (data) {
	            handlebar.templates[name] = handlebar.compile(data);
	            console.log("Compiled template " + name);
	            resolve(handlebar.templates[name]);
	          }).catch(function (e) {
	            resolve(handlebar.templates['defaultText']);
	          });
	        });
	        console.log("Return Promise to fetch template " + name);
	        if (loadcss) {
	          console.log("Loading css for ", name);
	          $('<link>').appendTo('head').attr({
	            type: 'text/css',
	            rel: 'stylesheet'
	          }).attr('href', 'templates/' + name + '.css');
	        }

	        handlebar.templates[name] = result;
	        return result;
	      } else {
	        return Promise.resolve(handlebar.templates[name]);
	      }
	      //};
	    }
	  }]);
	  return TemplateFetcherClass;
	}();

	function TemplateFetcher(HandleBar) {
	  if (typeof instance$2 === 'undefined') {
	    instance$2 = new TemplateFetcherClass(HandleBar);
	  }
	  return instance$2;
	}

	var TemplateFetcher$1 = {
	  TemplateFetcher: TemplateFetcher
	};

	function baseTypeTemplate(template, context, opts) {

	  if (template != 'time') {}
	  //    return Promise.resolve("niks");


	  //console.log("Want to render a basetype: " + template);
	  var myHandlebars = HandleBarsWrapper$1.HandleBarsWrapper();
	  var me = this;
	  var key = template;
	  //import static stuff into the helpers
	  return new Promise(function (resolve, fail) {
	    //  console.log("going to promise... " + key);
	    Promise.resolve(myHandlebars.getTemplate(key, true)).then(function (hbtemplate) {
	      //      console.log("Going to render " + key, hbtemplate);
	      Promise.resolve(hbtemplate(context)).then(function (result) {
	        //          console.log("Rendered " + key);
	        resolve(new Handlebars.SafeString(result));
	      }).catch(function (err) {
	        console.error("There was an error processing template " + key, err);
	        resolve("There was an error processing this template");
	      });
	    }).catch(function (fail) {
	      console.error("did not find template " + key, fail);
	      if (typeof template === 'undefined') {
	        template = "defaultText";
	      }
	      myHandlebars.getTemplate(template).then(function (hbtemplate2) {
	        console.error("If you see this one of the sub-modules or code is probably misbehaving:" + template, hbtemplate2);
	        // resolve(me.PromisedHandlebars.SafeString(hbtemplate2(context)));
	        try {
	          hbtemplate2(context).then(function (result) {
	            resolve(new Handlebars.SafeString(result));
	          });
	        } catch (e) {
	          resolve("There was an error processing this template");
	        }
	        resolve(new Handlebars.SafeString("<td>default text</td>"));
	      });
	    });
	  });
	  console.error("what am i doing here?");
	  return;
	}

	var baseTypeTemplate$1 = {
	  baseTypeTemplate: baseTypeTemplate
	};

	var myJavaScriptFetcher = JavaScriptFetcher$1.JavaScriptFetcher();
	var myTemplateFetcher = TemplateFetcher$1.TemplateFetcher();

	function dynamicPropertyTemplate(key, template, context, opts) {

	  if (key == 'P18') {
	    //  return Promise.resolve("later");
	  }

	  var myHandlebars = HandleBarsWrapper$1.HandleBarsWrapper();
	  var me = this;
	  //import static stuff into the helpers
	  return new Promise(function (resolve, fail) {
	    //    console.log("going to promise... " + key);
	    myHandlebars.getTemplate(key, true).then(function (hbtemplate) {
	      //      console.log("Going to render " + key);
	      try {
	        hbtemplate(context).then(function (result) {
	          //          console.log("Rendered " + key);
	          resolve(new Handlebars.SafeString(result));
	        }).catch(function (err) {
	          resolve("There was an error processing this template", err);
	        });
	      } catch (e) {
	        console.error("Error rendering template " + key, e);
	      }
	    }).catch(function (fail) {
	      console.error("did not find template" + key, fail);
	      if (typeof template === 'undefined') {
	        template = "defaultText";
	      }
	      myHandlebars.getTemplate(template).then(function (hbtemplate2) {
	        //            console.error("If you see this one of the sub-modules or code is probably misbehaving:" + template,
	        //                hbtemplate2);
	        // resolve(me.PromisedHandlebars.SafeString(hbtemplate2(context)));
	        try {
	          hbtemplate2(context).then(function (result) {
	            resolve(new Handlebars.SafeString(result));
	          });
	        } catch (e) {
	          resolve("There was an error processing this template");
	        }
	        resolve(new Handlebars.SafeString("<td>default text</td>"));
	      });
	    });
	  });
	  console.error("what am i doing here?");
	  return;
	}

	var dynamicPropertyTemplate$1 = {
	  dynamicPropertyTemplate: dynamicPropertyTemplate
	};

	var instance;

	/** @class Static Class used to load additional HandleBars templates and Javascript and
	 * allows Handlebar templates to be used as Promises.
	 * @todo This class is only available as Static, which is good for loading things. I need to split off an async rendering Handlebars object so multiple popups can be activated at the same time.
	 */

	var HandleBarsWrapperClass = function () {
	  function HandleBarsWrapperClass() {
	    classCallCheck(this, HandleBarsWrapperClass);

	    this.postProcessFunctions = [];
	    this.modules = [];
	    this.PromisedHandlebars = index$1(Handlebars);
	    if (typeof this.PromisedHandlebars.partials === 'undefined') {
	      this.PromisedHandlebars.partials = [];
	    }
	    if (typeof this.PromisedHandlebars.templates === 'undefined') {
	      this.PromisedHandlebars.templates = [];
	    }

	    this.TemplateFetcher = TemplateFetcher$1.TemplateFetcher(this.PromisedHandlebars);
	    this.JavaScriptFetcher = JavaScriptFetcher$1.JavaScriptFetcher();
	    // The fallback template;
	    this.getTemplate('defaultText');
	    //      var promisedHandlebars = require('promised-handlebars')
	    //      var Q = require('q')
	    //      var a = new Promise();
	    var me = this;

	    this.PromisedHandlebars.registerHelper('debug', this.debug);
	    this.PromisedHandlebars.registerHelper('dynamicPropertyTemplate', dynamicPropertyTemplate$1.dynamicPropertyTemplate);
	    this.PromisedHandlebars.registerHelper('baseTypeTemplate', baseTypeTemplate$1.baseTypeTemplate);

	    this.PromisedHandlebars.registerHelper('wikibasetemplate', this.wikibasetemplate);

	    // This is so we can compile all partials + templates into 1 file
	    if (typeof me.PromisedHandlebars.templates !== "undefined") {
	      me.PromisedHandlebars.partials = me.PromisedHandlebars.templates;
	    } else {
	      // Or maybe not
	      me.PromisedHandlebars.templates = {};
	    }
	  }
	  //  get postProcessFunctions {
	  //    return this.postProcessFunctions
	  //  }


	  createClass(HandleBarsWrapperClass, [{
	    key: 'debug',
	    value: function debug(context, options) {
	      console.log('This : ', this);
	      console.log('Context : ', context
	      //      'Variables referenced in this template: ',                     context.vars,
	      //      'Partials/templates that this file directly depends on: ',     context.deps,
	      //      'Helpers that this template directly depends on: ',            context.helpers,
	      //      'The metadata object at the top of the file (if it exists): ', context.meta
	      );
	    }
	  }, {
	    key: 'wikibasetemplate',
	    value: function wikibasetemplate(key, template, context, opts) {
	      //  console.log("looking for " + key);

	      function isNumber(n) {
	        return !isNaN(parseFloat(n)) && isFinite(n);
	      }
	      if (isNumber(key)) {
	        key = "Q" + key;
	        //me.modules[key] = false; // Dont use a template per statement we probably want to find the datatype here
	        //  key = "wikibase-item";
	      }
	    }
	  }, {
	    key: 'registerHelper',
	    value: function registerHelper(name, helperfunction) {
	      this.PromisedHandlebars.registerHelper(name, helperfunction);
	    }
	  }, {
	    key: 'compile',
	    value: function compile(template) {
	      return this.PromisedHandlebars.compile(template);
	    }
	  }, {
	    key: 'postProcess',
	    value: function postProcess(element) {
	      console.log("postprocessing");
	      var element = $(element);
	      this.postProcessFunctions.forEach(function (functionname) {
	        try {
	          functionname();
	        } catch (e) {
	          console.error("Error in Postprocessing function ", functionname.toString());
	        }
	      });
	    }
	    /** Load a handlebars template and options javascript. Makes sure
	     * to only load each template once.
	     *
	     * @param name The name of the template (without extention)
	     * @param loadjs Should the function try to load a Javascript file too. defaults to false
	     *
	     * @returns A Promise that returns a compiled Handlebars template
	     */

	  }, {
	    key: 'getTemplate',
	    value: function getTemplate(name, loadjs, loadcss) {
	      var me = this;
	      if (loadjs) {
	        return new Promise(function (resolve, fail) {
	          me.JavaScriptFetcher.fetchJavaScript(name, me).then(function (jsObject) {
	            console.log("Loaded Javascript for " + name, jsObject);
	            // we only run these events the first time (when jsObject is set)
	            // the second run of this promise the object is undefined
	            if (typeof jsObject !== 'undefined') {
	              if (typeof jsObject.postProcess === 'function') {
	                console.log("Registring PostProcess Function for " + name);
	                me.postProcessFunctions.push(jsObject.postProcess);
	              }
	              if (typeof jsObject.registerHelpers === 'function') {
	                console.log("Registring Helpers for " + name);
	                jsObject.registerHelpers(me.PromisedHandlebars);
	              }
	            }
	            //          console.log('Returning promise for ' + name);
	            var myPromise = me.TemplateFetcher.getTemplate(name, me.PromisedHandlebars, loadcss);
	            resolve(myPromise);
	          }).catch(function (err) {
	            //          console.log('Returning promise (failed javascript) for ' + name, err);
	            var myPromise = me.TemplateFetcher.getTemplate(name, me.PromisedHandlebars, loadcss);
	            resolve(myPromise);
	          });
	        });
	      } else {
	        var result = me.TemplateFetcher.getTemplate(name, me.PromisedHandlebars, loadcss);
	        //      console.log('returning only promise for ' + name, result);
	        return result;
	      }
	    }
	  }]);
	  return HandleBarsWrapperClass;
	}();

	function HandleBarsWrapper() {
	  if (typeof instance === 'undefined') {
	    instance = new HandleBarsWrapperClass();
	  }
	  return instance;
	}

	var HandleBarsWrapper$1 = {
	  HandleBarsWrapper: HandleBarsWrapper
	};

	//import P373 from './templates/helpers/P373.js';
	/** InfoBox Class */

	var InfoBox = function () {
	  function InfoBox() {
	    classCallCheck(this, InfoBox);

	    var me = this;
	    this.handlebars = HandleBarsWrapper$1.HandleBarsWrapper();;
	  }

	  createClass(InfoBox, [{
	    key: "Populate",
	    value: function Populate(Id, Q, languages) {
	      var simplifiedClaims, labels, entity;

	      //  var url = wdk.getEntities(ids, languages, properties, format)
	      var url = wdk.getEntities(Q, languages);
	      var me = this;
	      var result = new Promise(function (resolve, fail) {
	        $.ajax({
	          dataType: "jsonp",
	          url: url
	        }).done(function (data) {
	          var entity = data.entities[Q];
	          var entities = wdk.parse.wd.entities;
	          //  var entities = wdk.parse.wd.entities(data);
	          var simplifiedClaims = wdk.simplifyClaims(entity.claims);
	          //  alert(entities);

	          //  We also want the attributes / wikidata items Q codes here!
	          //    The Q values are in the simplifiedClaims as values
	          var properties = Object.keys(simplifiedClaims);
	          var url2 = wdk.getEntities(properties, languages);

	          $.ajax({
	            dataType: "jsonp",
	            url: url2
	          }).done(function (labels) {

	            //            _.each(labels.entities, function(label, key, labels) {
	            //              entity.claims[key].label = label;
	            //            });

	            //        $('#infobox').append("<h2>" + entity.labels[Object.keys(entity.labels)[0]].value + "</h2>")
	            //        $('#infobox').append("<i>" + entity.descriptions[Object.keys(entity.descriptions)[0]].value +
	            //          "</i>")
	            document.title = entity.labels[Object.keys(entity.labels)[0]].value;
	            var object = {
	              entity: entity,
	              labels: labels,
	              languages: languages
	            };
	            me.handlebars.getTemplate('infobox').then(function (infobox) {
	              console.log("fetched infoboxhbs", infobox);
	              infobox(object).then(function (html) {
	                console.log("fetched html");
	                $('#' + Id).append(html);
	                me.handlebars.postProcess('#' + Id);
	                resolve();
	              });
	            });
	          });
	        }).catch(function (err) {
	          fail(err);
	        });
	      });
	      return result;
	    }
	  }]);
	  return InfoBox;
	}();

	/** InfoBox Class */

	var InfoBoxSPARQL = function () {
	  function InfoBoxSPARQL() {
	    classCallCheck(this, InfoBoxSPARQL);

	    var me = this;
	    this.handlebars = HandleBarsWrapper$1.HandleBarsWrapper();;
	  }

	  createClass(InfoBoxSPARQL, [{
	    key: "getentities",
	    value: function getentities(Q, languages) {
	      var simplifiedClaims, labels, entity;

	      //  var url = wdk.getEntities(ids, languages, properties, format)
	      var url = wdk.getEntities(Q, languages);
	      // This is an official example from the examples on query.wikidata.org
	      // The problem with this one and the next is that only attributes that refer to another
	      // wikidata item are included, but no hard values like date of birth and official website
	      //
	      url = wdk.sparqlQuery("#Data of Douglas Adams\nPREFIX entity: <http://www.wikidata.org/entity/>\n#partial results\n\nSELECT ?propUrl ?propLabel ?valUrl ?valLabel ?picture\nWHERE\n{\n\thint:Query hint:optimizer 'None' .\n\t{\tBIND(entity:Q42 AS ?valUrl) .\n\t\tBIND(\"N/A\" AS ?propUrl ) .\n\t\tBIND(\"identity\"@en AS ?propLabel ) .\n\t}\n\tUNION\n\t{\tentity:Q42 ?propUrl ?valUrl .\n\t\t?property ?ref ?propUrl .\n\t\t?property a wikibase:Property .\n\t\t?property rdfs:label ?propLabel\n\t}\n\n  \t?valUrl rdfs:label ?valLabel\n\tFILTER (LANG(?valLabel) = 'en') .\n\tOPTIONAL{ ?valUrl wdt:P18 ?picture .}\n\tFILTER (lang(?propLabel) = 'en' )\n}\nORDER BY ?propUrl ?valUrl\nLIMIT 200");

	      url = wdk.sparqlQuery("PREFIX entity: <http://www.wikidata.org/entity/>\n      SELECT ?predicate ?predicateLabel ?object ?objectLabel ?relationship\n      WHERE {\n        entity:" + Q + " ?predicate ?object.\n        ?property wikibase:directClaim ?predicate.\n        ?property rdfs:label ?relationship.\n        SERVICE wikibase:label {\n          bd:serviceParam wikibase:language \"nl,en\".\n        }\n        ?object rdfs:label ?objectLabel.\n        FILTER((LANG( ?objectLabel)) = \"en\")\n        FILTER((LANG( ?relationship)) = \"en\")\n      }\n    LIMIT 100");

	      var me = this;
	      $.ajax({
	        //  dataType: "jsonp",
	        url: url
	      }).done(function (data) {
	        var results = data.results.bindings;
	        var entity = data.entities[Q];
	        var entities = wdk.parse.wd.entities;
	        //  var entities = wdk.parse.wd.entities(data);
	        var simplifiedClaims = wdk.simplifyClaims(entity.claims);
	        //  alert(entities);

	        //    We also want the attributes / wikidata items Q codes here!
	        //        The Q values are in the simplifiedClaims as values
	        var properties = Object.keys(simplifiedClaims);
	        var url2 = wdk.getEntities(properties, languages);
	        //alert("done");
	        //request(url2 ....
	        $.ajax({
	          dataType: "jsonp",
	          url: url2
	        }).done(function (labels) {

	          //            _.each(labels.entities, function(label, key, labels) {
	          //              entity.claims[key].label = label;
	          //            });

	          $('#infobox').append("<h2>" + entity.labels[Object.keys(entity.labels)[0]].value + "</h2>");
	          $('#infobox').append("<i>" + entity.descriptions[Object.keys(entity.descriptions)[0]].value + "</i>");

	          var object = {
	            entity: entity,
	            labels: labels,
	            languages: languages
	          };
	          me.handlebars.getTemplate('infobox').then(function (infobox) {
	            console.log("fetched infoboxhbs", infobox);
	            infobox(object).then(function (html) {
	              console.log("fetched html");
	              $('#infobox').html(html);
	              me.handlebars.postProcess('#infobox');
	            });
	          });
	        });
	      }).fail(function (err) {
	        alert("error");
	      });
	    }
	  }]);
	  return InfoBoxSPARQL;
	}();

	var isObject = createCommonjsModule(function (module) {
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
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
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;
	});

	var isObject$1 = interopDefault(isObject);


	var require$$1$3 = Object.freeze({
	  default: isObject$1
	});

	var isFunction = createCommonjsModule(function (module) {
	var isObject = interopDefault(require$$1$3);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	module.exports = isFunction;
	});

	var isFunction$1 = interopDefault(isFunction);


	var require$$2$2 = Object.freeze({
	  default: isFunction$1
	});

	var _isHostObject = createCommonjsModule(function (module) {
	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	module.exports = isHostObject;
	});

	var _isHostObject$1 = interopDefault(_isHostObject);


	var require$$3$1 = Object.freeze({
	  default: _isHostObject$1
	});

	var _checkGlobal = createCommonjsModule(function (module) {
	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	module.exports = checkGlobal;
	});

	var _checkGlobal$1 = interopDefault(_checkGlobal);


	var require$$0$4 = Object.freeze({
	  default: _checkGlobal$1
	});

	var _root = createCommonjsModule(function (module) {
	var checkGlobal = interopDefault(require$$0$4);

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(typeof commonjsGlobal == 'object' && commonjsGlobal);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(typeof self == 'object' && self);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(typeof commonjsGlobal == 'object' && commonjsGlobal);

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

	module.exports = root;
	});

	var _root$1 = interopDefault(_root);


	var require$$0$3 = Object.freeze({
		default: _root$1
	});

	var _coreJsData = createCommonjsModule(function (module) {
	var root = interopDefault(require$$0$3);

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	module.exports = coreJsData;
	});

	var _coreJsData$1 = interopDefault(_coreJsData);


	var require$$0$2 = Object.freeze({
		default: _coreJsData$1
	});

	var _isMasked = createCommonjsModule(function (module) {
	var coreJsData = interopDefault(require$$0$2);

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	module.exports = isMasked;
	});

	var _isMasked$1 = interopDefault(_isMasked);


	var require$$2$3 = Object.freeze({
	  default: _isMasked$1
	});

	var _toSource = createCommonjsModule(function (module) {
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	module.exports = toSource;
	});

	var _toSource$1 = interopDefault(_toSource);


	var require$$0$5 = Object.freeze({
	  default: _toSource$1
	});

	var _baseIsNative = createCommonjsModule(function (module) {
	var isFunction = interopDefault(require$$2$2),
	    isHostObject = interopDefault(require$$3$1),
	    isMasked = interopDefault(require$$2$3),
	    isObject = interopDefault(require$$1$3),
	    toSource = interopDefault(require$$0$5);

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	module.exports = baseIsNative;
	});

	var _baseIsNative$1 = interopDefault(_baseIsNative);


	var require$$1$2 = Object.freeze({
	  default: _baseIsNative$1
	});

	var _getValue = createCommonjsModule(function (module) {
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

	module.exports = getValue;
	});

	var _getValue$1 = interopDefault(_getValue);


	var require$$0$6 = Object.freeze({
	  default: _getValue$1
	});

	var _getNative = createCommonjsModule(function (module) {
	var baseIsNative = interopDefault(require$$1$2),
	    getValue = interopDefault(require$$0$6);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	module.exports = getNative;
	});

	var _getNative$1 = interopDefault(_getNative);


	var require$$1$1 = Object.freeze({
	  default: _getNative$1
	});

	var _nativeCreate = createCommonjsModule(function (module) {
	var getNative = interopDefault(require$$1$1);

	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');

	module.exports = nativeCreate;
	});

	var _nativeCreate$1 = interopDefault(_nativeCreate);


	var require$$0$1 = Object.freeze({
		default: _nativeCreate$1
	});

	var _hashClear = createCommonjsModule(function (module) {
	var nativeCreate = interopDefault(require$$0$1);

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}

	module.exports = hashClear;
	});

	var _hashClear$1 = interopDefault(_hashClear);


	var require$$4$1 = Object.freeze({
	  default: _hashClear$1
	});

	var _hashDelete = createCommonjsModule(function (module) {
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
	  return this.has(key) && delete this.__data__[key];
	}

	module.exports = hashDelete;
	});

	var _hashDelete$1 = interopDefault(_hashDelete);


	var require$$3$2 = Object.freeze({
	  default: _hashDelete$1
	});

	var _hashGet = createCommonjsModule(function (module) {
	var nativeCreate = interopDefault(require$$0$1);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	module.exports = hashGet;
	});

	var _hashGet$1 = interopDefault(_hashGet);


	var require$$2$4 = Object.freeze({
	  default: _hashGet$1
	});

	var _hashHas = createCommonjsModule(function (module) {
	var nativeCreate = interopDefault(require$$0$1);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}

	module.exports = hashHas;
	});

	var _hashHas$1 = interopDefault(_hashHas);


	var require$$1$4 = Object.freeze({
	  default: _hashHas$1
	});

	var _hashSet = createCommonjsModule(function (module) {
	var nativeCreate = interopDefault(require$$0$1);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

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
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	module.exports = hashSet;
	});

	var _hashSet$1 = interopDefault(_hashSet);


	var require$$0$7 = Object.freeze({
	  default: _hashSet$1
	});

	var _Hash = createCommonjsModule(function (module) {
	var hashClear = interopDefault(require$$4$1),
	    hashDelete = interopDefault(require$$3$2),
	    hashGet = interopDefault(require$$2$4),
	    hashHas = interopDefault(require$$1$4),
	    hashSet = interopDefault(require$$0$7);

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	module.exports = Hash;
	});

	var _Hash$1 = interopDefault(_Hash);


	var require$$2$1 = Object.freeze({
	  default: _Hash$1
	});

	var _listCacheClear = createCommonjsModule(function (module) {
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}

	module.exports = listCacheClear;
	});

	var _listCacheClear$1 = interopDefault(_listCacheClear);


	var require$$4$2 = Object.freeze({
	  default: _listCacheClear$1
	});

	var eq = createCommonjsModule(function (module) {
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
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
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
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
	  return value === other || (value !== value && other !== other);
	}

	module.exports = eq;
	});

	var eq$1 = interopDefault(eq);


	var require$$0$9 = Object.freeze({
	  default: eq$1
	});

	var _assocIndexOf = createCommonjsModule(function (module) {
	var eq = interopDefault(require$$0$9);

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	module.exports = assocIndexOf;
	});

	var _assocIndexOf$1 = interopDefault(_assocIndexOf);


	var require$$0$8 = Object.freeze({
	  default: _assocIndexOf$1
	});

	var _listCacheDelete = createCommonjsModule(function (module) {
	var assocIndexOf = interopDefault(require$$0$8);

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
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}

	module.exports = listCacheDelete;
	});

	var _listCacheDelete$1 = interopDefault(_listCacheDelete);


	var require$$3$3 = Object.freeze({
	  default: _listCacheDelete$1
	});

	var _listCacheGet = createCommonjsModule(function (module) {
	var assocIndexOf = interopDefault(require$$0$8);

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
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	module.exports = listCacheGet;
	});

	var _listCacheGet$1 = interopDefault(_listCacheGet);


	var require$$2$5 = Object.freeze({
	  default: _listCacheGet$1
	});

	var _listCacheHas = createCommonjsModule(function (module) {
	var assocIndexOf = interopDefault(require$$0$8);

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
	  return assocIndexOf(this.__data__, key) > -1;
	}

	module.exports = listCacheHas;
	});

	var _listCacheHas$1 = interopDefault(_listCacheHas);


	var require$$1$6 = Object.freeze({
	  default: _listCacheHas$1
	});

	var _listCacheSet = createCommonjsModule(function (module) {
	var assocIndexOf = interopDefault(require$$0$8);

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
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	module.exports = listCacheSet;
	});

	var _listCacheSet$1 = interopDefault(_listCacheSet);


	var require$$0$10 = Object.freeze({
	  default: _listCacheSet$1
	});

	var _ListCache = createCommonjsModule(function (module) {
	var listCacheClear = interopDefault(require$$4$2),
	    listCacheDelete = interopDefault(require$$3$3),
	    listCacheGet = interopDefault(require$$2$5),
	    listCacheHas = interopDefault(require$$1$6),
	    listCacheSet = interopDefault(require$$0$10);

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	module.exports = ListCache;
	});

	var _ListCache$1 = interopDefault(_ListCache);


	var require$$1$5 = Object.freeze({
	  default: _ListCache$1
	});

	var _Map = createCommonjsModule(function (module) {
	var getNative = interopDefault(require$$1$1),
	    root = interopDefault(require$$0$3);

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');

	module.exports = Map;
	});

	var _Map$1 = interopDefault(_Map);


	var require$$0$11 = Object.freeze({
	    default: _Map$1
	});

	var _mapCacheClear = createCommonjsModule(function (module) {
	var Hash = interopDefault(require$$2$1),
	    ListCache = interopDefault(require$$1$5),
	    Map = interopDefault(require$$0$11);

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	module.exports = mapCacheClear;
	});

	var _mapCacheClear$1 = interopDefault(_mapCacheClear);


	var require$$4 = Object.freeze({
	  default: _mapCacheClear$1
	});

	var _isKeyable = createCommonjsModule(function (module) {
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	module.exports = isKeyable;
	});

	var _isKeyable$1 = interopDefault(_isKeyable);


	var require$$0$13 = Object.freeze({
	  default: _isKeyable$1
	});

	var _getMapData = createCommonjsModule(function (module) {
	var isKeyable = interopDefault(require$$0$13);

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
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	module.exports = getMapData;
	});

	var _getMapData$1 = interopDefault(_getMapData);


	var require$$0$12 = Object.freeze({
	  default: _getMapData$1
	});

	var _mapCacheDelete = createCommonjsModule(function (module) {
	var getMapData = interopDefault(require$$0$12);

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
	  return getMapData(this, key)['delete'](key);
	}

	module.exports = mapCacheDelete;
	});

	var _mapCacheDelete$1 = interopDefault(_mapCacheDelete);


	var require$$3$4 = Object.freeze({
	  default: _mapCacheDelete$1
	});

	var _mapCacheGet = createCommonjsModule(function (module) {
	var getMapData = interopDefault(require$$0$12);

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
	  return getMapData(this, key).get(key);
	}

	module.exports = mapCacheGet;
	});

	var _mapCacheGet$1 = interopDefault(_mapCacheGet);


	var require$$2$6 = Object.freeze({
	  default: _mapCacheGet$1
	});

	var _mapCacheHas = createCommonjsModule(function (module) {
	var getMapData = interopDefault(require$$0$12);

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
	  return getMapData(this, key).has(key);
	}

	module.exports = mapCacheHas;
	});

	var _mapCacheHas$1 = interopDefault(_mapCacheHas);


	var require$$1$7 = Object.freeze({
	  default: _mapCacheHas$1
	});

	var _mapCacheSet = createCommonjsModule(function (module) {
	var getMapData = interopDefault(require$$0$12);

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
	  getMapData(this, key).set(key, value);
	  return this;
	}

	module.exports = mapCacheSet;
	});

	var _mapCacheSet$1 = interopDefault(_mapCacheSet);


	var require$$0$14 = Object.freeze({
	  default: _mapCacheSet$1
	});

	var _MapCache = createCommonjsModule(function (module) {
	var mapCacheClear = interopDefault(require$$4),
	    mapCacheDelete = interopDefault(require$$3$4),
	    mapCacheGet = interopDefault(require$$2$6),
	    mapCacheHas = interopDefault(require$$1$7),
	    mapCacheSet = interopDefault(require$$0$14);

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	module.exports = MapCache;
	});

	var _MapCache$1 = interopDefault(_MapCache);


	var require$$2 = Object.freeze({
	  default: _MapCache$1
	});

	var _setCacheAdd = createCommonjsModule(function (module) {
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

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
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	module.exports = setCacheAdd;
	});

	var _setCacheAdd$1 = interopDefault(_setCacheAdd);


	var require$$1$8 = Object.freeze({
	  default: _setCacheAdd$1
	});

	var _setCacheHas = createCommonjsModule(function (module) {
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

	module.exports = setCacheHas;
	});

	var _setCacheHas$1 = interopDefault(_setCacheHas);


	var require$$0$15 = Object.freeze({
	  default: _setCacheHas$1
	});

	var _SetCache = createCommonjsModule(function (module) {
	var MapCache = interopDefault(require$$2),
	    setCacheAdd = interopDefault(require$$1$8),
	    setCacheHas = interopDefault(require$$0$15);

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
	      length = values ? values.length : 0;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	module.exports = SetCache;
	});

	var _SetCache$1 = interopDefault(_SetCache);


	var require$$5 = Object.freeze({
	  default: _SetCache$1
	});

	var _indexOfNaN = createCommonjsModule(function (module) {
	/**
	 * Gets the index at which the first occurrence of `NaN` is found in `array`.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	 */
	function indexOfNaN(array, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);

	  while ((fromRight ? index-- : ++index < length)) {
	    var other = array[index];
	    if (other !== other) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = indexOfNaN;
	});

	var _indexOfNaN$1 = interopDefault(_indexOfNaN);


	var require$$0$17 = Object.freeze({
	  default: _indexOfNaN$1
	});

	var _baseIndexOf = createCommonjsModule(function (module) {
	var indexOfNaN = interopDefault(require$$0$17);

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return indexOfNaN(array, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;

	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = baseIndexOf;
	});

	var _baseIndexOf$1 = interopDefault(_baseIndexOf);


	var require$$0$16 = Object.freeze({
	  default: _baseIndexOf$1
	});

	var _arrayIncludes = createCommonjsModule(function (module) {
	var baseIndexOf = interopDefault(require$$0$16);

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to search.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array ? array.length : 0;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}

	module.exports = arrayIncludes;
	});

	var _arrayIncludes$1 = interopDefault(_arrayIncludes);


	var require$$4$3 = Object.freeze({
	  default: _arrayIncludes$1
	});

	var _arrayIncludesWith = createCommonjsModule(function (module) {
	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to search.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array ? array.length : 0;

	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arrayIncludesWith;
	});

	var _arrayIncludesWith$1 = interopDefault(_arrayIncludesWith);


	var require$$3$5 = Object.freeze({
	  default: _arrayIncludesWith$1
	});

	var _arrayMap = createCommonjsModule(function (module) {
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
	      length = array ? array.length : 0,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	module.exports = arrayMap;
	});

	var _arrayMap$1 = interopDefault(_arrayMap);


	var require$$2$7 = Object.freeze({
	  default: _arrayMap$1
	});

	var _baseUnary = createCommonjsModule(function (module) {
	/**
	 * The base implementation of `_.unary` without support for storing wrapper metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	module.exports = baseUnary;
	});

	var _baseUnary$1 = interopDefault(_baseUnary);


	var require$$1$9 = Object.freeze({
	  default: _baseUnary$1
	});

	var _cacheHas = createCommonjsModule(function (module) {
	/**
	 * Checks if a cache value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}

	module.exports = cacheHas;
	});

	var _cacheHas$1 = interopDefault(_cacheHas);


	var require$$0$18 = Object.freeze({
	  default: _cacheHas$1
	});

	var _baseDifference = createCommonjsModule(function (module) {
	var SetCache = interopDefault(require$$5),
	    arrayIncludes = interopDefault(require$$4$3),
	    arrayIncludesWith = interopDefault(require$$3$5),
	    arrayMap = interopDefault(require$$2$7),
	    baseUnary = interopDefault(require$$1$9),
	    cacheHas = interopDefault(require$$0$18);

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
	      includes = arrayIncludes,
	      isCommon = true,
	      length = array.length,
	      result = [],
	      valuesLength = values.length;

	  if (!length) {
	    return result;
	  }
	  if (iteratee) {
	    values = arrayMap(values, baseUnary(iteratee));
	  }
	  if (comparator) {
	    includes = arrayIncludesWith;
	    isCommon = false;
	  }
	  else if (values.length >= LARGE_ARRAY_SIZE) {
	    includes = cacheHas;
	    isCommon = false;
	    values = new SetCache(values);
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;

	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var valuesIndex = valuesLength;
	      while (valuesIndex--) {
	        if (values[valuesIndex] === computed) {
	          continue outer;
	        }
	      }
	      result.push(value);
	    }
	    else if (!includes(values, computed, comparator)) {
	      result.push(value);
	    }
	  }
	  return result;
	}

	module.exports = baseDifference;
	});

	var _baseDifference$1 = interopDefault(_baseDifference);


	var require$$3 = Object.freeze({
	  default: _baseDifference$1
	});

	var _arrayPush = createCommonjsModule(function (module) {
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

	module.exports = arrayPush;
	});

	var _arrayPush$1 = interopDefault(_arrayPush);


	var require$$1$10 = Object.freeze({
	  default: _arrayPush$1
	});

	var _baseProperty = createCommonjsModule(function (module) {
	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;
	});

	var _baseProperty$1 = interopDefault(_baseProperty);


	var require$$0$21 = Object.freeze({
	  default: _baseProperty$1
	});

	var _getLength = createCommonjsModule(function (module) {
	var baseProperty = interopDefault(require$$0$21);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a
	 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
	 * Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;
	});

	var _getLength$1 = interopDefault(_getLength);


	var require$$2$9 = Object.freeze({
		default: _getLength$1
	});

	var isLength = createCommonjsModule(function (module) {
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length,
	 *  else `false`.
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
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;
	});

	var isLength$1 = interopDefault(isLength);


	var require$$0$22 = Object.freeze({
	  default: isLength$1
	});

	var isArrayLike = createCommonjsModule(function (module) {
	var getLength = interopDefault(require$$2$9),
	    isFunction = interopDefault(require$$2$2),
	    isLength = interopDefault(require$$0$22);

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
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}

	module.exports = isArrayLike;
	});

	var isArrayLike$1 = interopDefault(isArrayLike);


	var require$$1$12 = Object.freeze({
	  default: isArrayLike$1
	});

	var isObjectLike = createCommonjsModule(function (module) {
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
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;
	});

	var isObjectLike$1 = interopDefault(isObjectLike);


	var require$$0$23 = Object.freeze({
	  default: isObjectLike$1
	});

	var isArrayLikeObject = createCommonjsModule(function (module) {
	var isArrayLike = interopDefault(require$$1$12),
	    isObjectLike = interopDefault(require$$0$23);

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
	  return isObjectLike(value) && isArrayLike(value);
	}

	module.exports = isArrayLikeObject;
	});

	var isArrayLikeObject$1 = interopDefault(isArrayLikeObject);


	var require$$0$20 = Object.freeze({
	  default: isArrayLikeObject$1
	});

	var isArguments = createCommonjsModule(function (module) {
	var isArrayLikeObject = interopDefault(require$$0$20);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	module.exports = isArguments;
	});

	var isArguments$1 = interopDefault(isArguments);


	var require$$1$11 = Object.freeze({
	  default: isArguments$1
	});

	var isArray = createCommonjsModule(function (module) {
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
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

	module.exports = isArray;
	});

	var isArray$1 = interopDefault(isArray);


	var require$$0$24 = Object.freeze({
		default: isArray$1
	});

	var _isFlattenable = createCommonjsModule(function (module) {
	var isArguments = interopDefault(require$$1$11),
	    isArray = interopDefault(require$$0$24);

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray(value) || isArguments(value);
	}

	module.exports = isFlattenable;
	});

	var _isFlattenable$1 = interopDefault(_isFlattenable);


	var require$$0$19 = Object.freeze({
	  default: _isFlattenable$1
	});

	var _baseFlatten = createCommonjsModule(function (module) {
	var arrayPush = interopDefault(require$$1$10),
	    isFlattenable = interopDefault(require$$0$19);

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

	  predicate || (predicate = isFlattenable);
	  result || (result = []);

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	module.exports = baseFlatten;
	});

	var _baseFlatten$1 = interopDefault(_baseFlatten);


	var require$$2$8 = Object.freeze({
	  default: _baseFlatten$1
	});

	var _apply = createCommonjsModule(function (module) {
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
	  var length = args.length;
	  switch (length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	module.exports = apply;
	});

	var _apply$1 = interopDefault(_apply);


	var require$$1$13 = Object.freeze({
	  default: _apply$1
	});

	var isSymbol = createCommonjsModule(function (module) {
	var isObjectLike = interopDefault(require$$0$23);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	module.exports = isSymbol;
	});

	var isSymbol$1 = interopDefault(isSymbol);


	var require$$0$29 = Object.freeze({
	  default: isSymbol$1
	});

	var toNumber = createCommonjsModule(function (module) {
	var isFunction = interopDefault(require$$2$2),
	    isObject = interopDefault(require$$1$3),
	    isSymbol = interopDefault(require$$0$29);

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = isFunction(value.valueOf) ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = toNumber;
	});

	var toNumber$1 = interopDefault(toNumber);


	var require$$0$28 = Object.freeze({
	  default: toNumber$1
	});

	var toFinite = createCommonjsModule(function (module) {
	var toNumber = interopDefault(require$$0$28);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	module.exports = toFinite;
	});

	var toFinite$1 = interopDefault(toFinite);


	var require$$0$27 = Object.freeze({
	  default: toFinite$1
	});

	var toInteger = createCommonjsModule(function (module) {
	var toFinite = interopDefault(require$$0$27);

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	module.exports = toInteger;
	});

	var toInteger$1 = interopDefault(toInteger);


	var require$$0$26 = Object.freeze({
	  default: toInteger$1
	});

	var rest = createCommonjsModule(function (module) {
	var apply = interopDefault(require$$1$13),
	    toInteger = interopDefault(require$$0$26);

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as
	 * an array.
	 *
	 * **Note:** This method is based on the
	 * [rest parameter](https://mdn.io/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.rest(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function rest(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, array);
	      case 1: return func.call(this, args[0], array);
	      case 2: return func.call(this, args[0], args[1], array);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = array;
	    return apply(func, this, otherArgs);
	  };
	}

	module.exports = rest;
	});

	var rest$1 = interopDefault(rest);


	var require$$0$25 = Object.freeze({
	  default: rest$1
	});

	var difference = createCommonjsModule(function (module) {
	var baseDifference = interopDefault(require$$3),
	    baseFlatten = interopDefault(require$$2$8),
	    isArrayLikeObject = interopDefault(require$$0$20),
	    rest = interopDefault(require$$0$25);

	/**
	 * Creates an array of unique `array` values not included in the other given
	 * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons. The order of result values is determined by the
	 * order they occur in the first array.
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
	var difference = rest(function(array, values) {
	  return isArrayLikeObject(array)
	    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
	    : [];
	});

	module.exports = difference;
	});

	var difference$1 = interopDefault(difference);

	var instance$3;
	/** LabelFetcher Class
	 * Static class
	 */

	var LabelFetcherClass = function () {
	  function LabelFetcherClass(languages) {
	    classCallCheck(this, LabelFetcherClass);

	    this.languages = typeof languages === 'undefined' ? ['en'] : languages;
	    this.labels = [];
	    var me = this;
	  }

	  createClass(LabelFetcherClass, [{
	    key: 'Monitor',
	    value: function Monitor(Id) {
	      var me = this;
	      // configuration of the observer:
	      var observerconfig = {
	        attributes: false,
	        childList: true,
	        characterData: false
	      };

	      var labeltarget = document.getElementById(Id);

	      // create an observer instance
	      var labelobserver = new MutationObserver(function (mutations) {
	        mutations.forEach(function (mutation) {
	          console.log(mutation.type, mutation);
	          if (mutation.addedNodes.length > 0) {
	            //  var items = mutation.target.children.getElementsByClassName("wikidata-fetchlabel");
	            me.Populate(mutation.target.id);
	            //map.sidebarcontrols['rightsidebar'].enable('legendpane');
	          } else {
	              //          map.sidebarcontrols['rightsidebar'].disable('legendpane');
	            }
	        });
	      });
	      labelobserver.observe(labeltarget, observerconfig);
	    }
	  }, {
	    key: 'Populate',
	    value: function Populate(Id) {
	      var labels = [];
	      var labelelements = $('#' + Id + ' .wikidata-fetchlabel').get();
	      console.log("Find all items to translate in " + Id, labelelements);
	      if (labelelements.length == 0) {
	        return Promise.resolve([]);
	      }
	      $('#' + Id + ' .wikidata-fetchlabel').addClass("wikidata-fetchlabel-processing").removeClass("wikidata-fetchlabel");
	      for (var i = 0; i < labelelements.length; i++) {
	        console.log(labelelements[i].dataset.wikidata);
	        labels.push(labelelements[i].dataset.wikidata);
	      }
	      // Deduplicate entries:
	      var labels = labels.filter(function (elem, index, self) {
	        return index == self.indexOf(elem);
	      });
	      console.log("Labels", labels);
	      return this.getLabels(labels).then(function (labeltext) {
	        for (var Q in labeltext) {
	          $('[data-wikidata="' + Q + '"]').text(labeltext[Q].label);
	          $('[data-wikidata="' + Q + '"]').prop('title', labeltext[Q].description);
	          $('[data-wikidata="' + Q + '"]').removeClass("wikidata-fetchlabel-processing").addClass("wikidata-fetchlabel-processed");
	        }
	      });
	    }
	  }, {
	    key: 'getLabels',
	    value: function getLabels(Qs) {
	      var me = this;
	      var simplifiedClaims, labels, entity, url;
	      var langs = this.languages.join(',');

	      var QsDelta = difference$1(Qs, Object.keys(this.labels));
	      if (QsDelta.length == 0) {
	        var returnlabels = this.findLabels(Qs);
	        // figurethemout
	        return Promise.resolve(returnlabels);
	      }
	      var SELECT = "SELECT ";
	      var WHERE = " WHERE {";
	      QsDelta.forEach(function (Q) {
	        SELECT += '?' + Q + 'Label ?' + Q + 'Description ';
	        WHERE += 'BIND(entity:' + Q + ' AS ?' + Q + ') . ';
	      });

	      WHERE += 'SERVICE wikibase:label {\n              bd:serviceParam wikibase:language "' + langs + '".\n              } }';
	      var url = wdk.sparqlQuery("PREFIX entity: <http://www.wikidata.org/entity/> " + SELECT + WHERE);

	      return new Promise(function (resolve, reject) {
	        $.ajax({
	          //  dataType: "jsonp",
	          url: url
	        }).done(function (data) {
	          var values = data.results.bindings[0];
	          //var returnlabels = [];
	          var keys = Object.keys(values);
	          keys.forEach(function (fullkey) {

	            var key = fullkey.indexOf('Description') > 0 ? fullkey.substr(0, fullkey.indexOf('Description')) : fullkey.substr(0, fullkey.indexOf('Label'));
	            if (typeof me.labels[key] === 'undefined') {
	              me.labels[key] = [];
	            }
	            if (fullkey.indexOf('Label') > 0) {
	              me.labels[key].label = values[fullkey].value;
	            } else {
	              me.labels[key].description = values[fullkey].value;
	            }
	          });

	          var returnlabels = me.findLabels(Qs);
	          resolve(returnlabels);
	        }).fail(function (err) {
	          alert("error");
	        });
	      });
	    }
	  }, {
	    key: 'findLabels',
	    value: function findLabels(Qs) {
	      var me = this;
	      // There is probably a lodash function for this. No clue which one.
	      var result = [];
	      Qs.forEach(function (Q) {
	        result[Q] = me.labels[Q];
	      });
	      return result;
	    }
	  }]);
	  return LabelFetcherClass;
	}();

	function LabelFetcher(languages) {
	  if (typeof instance$3 === 'undefined') {
	    instance$3 = new LabelFetcherClass(languages);
	  }
	  return instance$3;
	}

	exports.InfoBox = InfoBox;
	exports.InfoBoxSPARQL = InfoBoxSPARQL;
	exports.LabelFetcher = LabelFetcher;

	Object.defineProperty(exports, '__esModule', { value: true });

}));