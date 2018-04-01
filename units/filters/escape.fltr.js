/**
* Extremely simple filter to escape any string so its URL safe
*
* @example
* <a href="/some/long/path/{{document.code | escape}}">A link</a>
*/
angular.module('app')
.filter('escape', function() {
	return window.escape;
})
