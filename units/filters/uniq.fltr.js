/**
* Provides a simple filter to return a collection based on a unique field
* This is really just a wrapper for lodash's _.uniq() function
*
* For example:
*
* In your controller:
*   $scope.stuff = [{g: 'users', n: 'Fred'}, {g: 'users', n: 'Marge'}]
*
* In your templating system:
*   {{stuff | uniq:'g'}}
*
* Will output only 'Fred'
*/
angular
	.module('app')
	.filter('uniq', function() {
		return function(collection, prop) {
			if (!prop) return collection;

			return _.uniqBy(collection, prop);
		};
	});
