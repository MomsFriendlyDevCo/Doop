/**
* Repreatedly calls a promise factory to pull in all data from a Promise (e.g. $http, ngResource) until it is exhausted (i.e. returns an empty array)
*
* The promise factory is called with (pageOffset) which is a number from zero that increments until the promiseFactory promise returns an empty array
*
* The notification function for the promise is called with an object with the keys: data (the entire data recieved), segment (the data recieved in this progress update), page (the page offset)
*
* @requires angular
* @requires lodash
* @author Matt Carter <m@ttcarter.com>
* @date 2017-03-31
* @param {function} promiseFactory A factory function expected to return a function which should resolve with an array of data. If the array is empty the function will not be called again
* @param {Object} [options] Optional options to specify
* @param {number} [options.delay=0] The delay in miliseconds to apply between each fetch call (useful for debugging)
* @return {Promise} A promise which will resolve when all factory calls have been exhausted. This can be cancelled with $batchify.cancel()
* @example
* @batchify(page => $http.get(`/api/widgets?page=${page}`).$promise)
* 	.then(
*		// Completion - data will be the total concatted data
*		data => // ... do something with data ... //), //
*
*		// Rejection
*		err => // .. do something with the error state //)
*
*		// Progress - data will be the concatted data SO FAR. Page is the current page offset
*		update => // ... do something with partial data .. //)
*/
angular
	.module('app')
	.service('$batchify', function($q, $timeout) {
		var $batchify = function(promiseFactory, options) {
			var deferred = $q.defer();
			var page = 0;
			var concatData = [];
			var settings = _.defaults(options, {
				delay: 0,
			});

			var nextPage = ()=> promiseFactory(page)
				.then(data => {
					if (!_.isArray(data)) throw new Error('Promise in $batchify must return an array. Got "' + (typeof data) + '"');
					if (data.length) { // This block contains some data
						concatData = concatData.concat(data);
						deferred.notify({
							page: page,
							segment: data,
							data: concatData,
						});
						page++;
						deferred.$$timeoutID = $timeout(nextPage, settings.delay);
					} else { // This block is empty - return the final version of the data
						deferred.resolve(concatData);
					}
				}, deferred.reject)

			deferred.$$timeoutID = $timeout(nextPage); // Install into next tick so we can return a promise immediately

			return deferred.promise;
		};

		/**
		* Stop a $batchify operation in progress
		* @param {Promise} batch The active $batchify operation in progress
		*/
		$batchify.cancel = batch => {
			if (batch && batch.$$timeoutID) $timeout.cancel(batch.$$timeoutID);
		};

		return $batchify;
	});
