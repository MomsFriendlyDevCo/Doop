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

// Promise.defer {{{
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
