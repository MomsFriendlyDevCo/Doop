// Promise.timeout() {{{
/**
* Return a promise that pauses for the given number of milliseconds
* @param {number} time The amount of milliseconds to pause before resolving
* @returns {Promise}
*/
Promise.timeout = time => new Promise(resolve => setTimeout(resolve, time));
// }}}

// Promise.prototype.tap() {{{
/**
* Add a method into the promise prototype that does not effect the output of a waterfall result
* @example
* Promise.resolve(1)
*   .then(v => 2)
*   .tap(v => console.log('TAP', v)) //= TAP 2
*   .then(v => console.log('RESULT', v)) //= RESULT 2
*/
Promise.prototype.tap = function(fn) {
	return this.then(v =>
		Promise.resolve(fn(v))
			.then(()=> v)
	);
};
// }}}

// Promise.defer() {{{
/**
* Returns a defer object which represents a promise object which can resolve in the future - but without enclosing a function
* The defer object has the keys {promise, resolve(), reject(), notify()}
* @returns {Defer} A defered promise
*/
Promise.defer = function() {
	var deferred = {};

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
		deferred.notify = ()=> {}; // FIXME: Native promises don't yet support notify
	});

	return deferred;
};
// }}}

// Promise.allLimit() {{{
/**
* Resolve promises similar to Promise.all() but only allow a set number of promises to be running at once
* This works the same as Promise.all() but resolves its payload until all promises are resolved
* NOTE: Because of the immediately-executing 'feature' of Promises it is recommended that the input array provide
*       an array of functions which return Promises rather than promises directly - i.e. return promise factories
*
* @param {array <Function>} promises An array of promise FACTORIES which will be evaluated
* @returns {Promise} A promise which will resolve/reject based on the completion of the given promise factories being resolved
* @url https://github.com/MomsFriendlyDevCo/Nodash
*
* @example Evaluate a series of promises with a delay, one at a time, in order (note that the map returns a promise factory, otherwise the promise would execute immediately)
* Promise.allLimit(
*   3, // Allow only 3 promises to run at once
*   [500, 400, 300, 200, 100, 0, 100, 200, 300, 400, 500].map((delay, index) => ()=> new Promise(resolve => {
*     setTimeout(()=> { console.log('EVAL', index, delay); resolve(); }, delay);
*   }))
* )
*/
Promise.allLimit = (limit, promises) => new Promise((resolve, reject) => {
	if (!isFinite(limit)) throw new Error('First parameter must be the number of promise threads');

	var promiseChecker = function(queue) {
		if (!queue.promisesRemaining.length && queue.running == 0) return resolve(queue.output);

		while (queue.promisesRemaining.length > 0 && queue.running < queue.limit) {
			var promiseRunner = function(thisPromise, promiseIndex) {
				queue.running++;
				Promise.resolve(thisPromise())
					.then(res => {
						queue.output[promiseIndex] = res;
						queue.completed++;
						queue.running--;
						// Potential to do some progress notification here:
						// notify({completed: queue.completed, count: queue.promiseCount, limit: queue.limit});
						promiseChecker(queue);
					})
					.catch(reject);
			}(queue.promisesRemaining.shift(), queue.promiseIndex++);
		}
	};

	promiseChecker({
		limit,
		running: 0,
		promiseCount: promises.length,
		completed: 0,
		promisesRemaining: promises,
		output: [],
		promiseIndex: 0,
	});
});
// }}}

// Promise.allSeries() {{{
Promise.allSeries = promises => Promise.allLimit(1, promises);
// }}}
