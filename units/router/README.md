Doop-Router
===========
A non-annoying, exceedingly simple router using a chainable syntax.


```javascript
angular
	.module('app')
	.run($router => $router.when('/widgets/:id?').component('widgetsListCtrl'))
	.component('widgetsListCtrl', {
		templateUrl: '/units/widgets/list.tmpl.html',
		controller: function($scope, $routerParams) {
			var $ctrl = this;

			// Do something with the widget ID specified in $routerParams.id
		},
	});
```

Features:

* Chainable syntax (`$router.when('/this/path').component('something')`)
* Exceptionally small
* Exceptionally fast


Why?
----
Because [angular-ui-router](https://github.com/angular-ui/ui-router) is too bloody complicated, difficult to grok and the documentation sucks.

This project is an attempt to simplify routing to its absolute bare essencials.
