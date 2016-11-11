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
* Normal Angular event system - none of the rather silly `$transition` system AUIR uses
* Exceptionally small
* Exceptionally fast


Why?
----
Because [angular-ui-router](https://github.com/angular-ui/ui-router) is too bloody complicated, difficult to grok and the documentation sucks.

This project is an attempt to simplify routing to its absolute bare essencials.


Common usage
============

```javascript
// Use a given controller when matching a path (ID will be available in $routerParams.id)
$router.when('/widgets/:id').component('widgetsListCtrl');

// Specify that some parameters are optional - suffix each token with a question mark
$router.when('/foo/:id1?/:id2?/:id3?').component('fooCtrl');

// Listen for routing events and perform an action when the page has changed

// Before we navigate...
$rootScope.$on('$routerStart', _=> /* Do something */)

// After we navigated
$rootScope.$on('$routerSuccess', _=> /* Do something */)

// After we navigated and something went wrong
$rootScope.$on('$routerError', _=> /* Do something */)
```


API
===

$router (service)
-----------------
A global Angular service. This can be required anywhere in your project and always exposes the same data.

$router.routes
--------------
An array in priority order of all currently configured rules.

$router.current.main
--------------------
The currently matched rule.

$router.current.params
----------------------
An object containing all parameters extracted from the URL in tokenized form.

For example if the rule has the path `/widgets/:id` and the current URL is `/widgets/123` the parameters object will be `{id: 123}`.

$router.pathToRegExp()
----------------------
Utility function to convert a path into a regular expression.

$router.rule(path)
------------------
Create a new router rule and append it onto the `$router.routes` stack.

See [RouterRule](#routerrule).

$router.when(path)
------------------
Alias of `$router.rule(path)`.

$router.resolve(path)
---------------------
Return the first matching router rule that matches the given path.

$router.go(path)
----------------
Navigate to the given path.


RouterRule (Object instance)
----------------------------
An instance of a router rule.
If a path is specified `RouterRule.path()` is automatically called.

RouterRule.component(name)
--------------------------
Configure the action of the rule to display the named component.

RouterRule.matches(path)
------------------------
Tests a given path against the rule. This will return a boolean if the rule matches.

RouterRule.path(path)
---------------------
Set the path of the rule. This can be a tokenized Ruby style path or a regular expression.

RouterRule.extractParams(path)
------------------------------
Function to extract parameters from the URL into the parameters object.


$routerParams (service)
-----------------------
A service which returns the current `$router.current.params` object.

routerView (directive)
----------------------
Used in the main page template to indicate where to place the page content.

```html
<router-view></router-view>
```
