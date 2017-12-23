/**
* Provides a simple filter to transform text so that all first letters in words is in upper case
*
* @example
* //In your controller:
* $scope.foo = 'hello world'
*
* // In your template:
* {{foo | ucwords}}
* // => "Hello World"
*/
angular
	.module('app')
	.filter('ucwords', function() {
		return function(value) {
			if (!value)
				return;
			return _.startCase(value);
		};
	});