/**
* Doops merge service
* This service takes an existing object or array and an incomming new version
* It will attempt to merge them together as lazily as possible to prevent any reference breaking
* The idea is that by changing as little data as possible, Angular doesn't have to do major UI updates
* @author Matt Carter <m@ttcarter.com>
* @date 2016-12-19
*/

angular
	.module('app')
	.service('$merge', function() {
		var mergeWorker = function(oldVal, newVal) {
			if (_.isArray(oldVal) && _.isArray(newVal)) { // Arrays should be lazy-merged then truncated
				_.mergeWith(oldVal, newVal, mergeWorker);
				if (oldVal.length != newVal.length) oldVal.length = newVal.length;
				return oldVal;
			}
		};

		return function(dst, src) {
			_.mergeWith(dst, src, mergeWorker);
		};
	});
