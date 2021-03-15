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
