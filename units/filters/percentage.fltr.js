/**
* Simple filter to return a neater percentage formatted Integer
*
* @example
* // In your view
* {{someNumber | percentage}}
* // => "63%"
*/
angular
	.module('app')
	.filter('percentage', function() {
		return function(value) {
			if (!value) return;

			return Math.ceil(value * 100) + '%';
		};
	});
