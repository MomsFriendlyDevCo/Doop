Doop-Router
===========
A non-annoying, exceedingly simple router using a chainable syntax.


```javascript
angular
	.module('app')
	.run($router => $router.when('/widgets/:id?').component('widgetsListCtrl'))
	.component('widgetsListCtrl', {
		templateUrl: '/units/widgets/list.tmpl.html',
		controller: function($scope, $router) {
			var $ctrl = this;

			// Do something with the widget ID specified in $router.params.id
		},
	});
```

Features:

* **Chainable syntax** - Use a simple BDD / chainable layout to define routes e.g. `$router.when('/this/path').requires($session.checkLogin).component('something')`
* **Regular Angular event system** - none of that weird `$transition` system Angular-UI-Router uses. The router fires `$rootScope.$broadcast('$routerSuccess')` events like everything else
* **Sensible route prioritization** - tokens are prioritized _LAST_ so `/foo/:id` gets matched after `/foo/create`. Rather than creating weird hierarchical rules, you can just dump rules into the router and let it figure it out
* **Component support** - Components are the future
* **Routes can be updated in real time** - the router will automatically resort rules as things are added and removed
* **Promise based architecture** - fits in better with the way Angular does things and allows for async handling gracefully
* **"Provide" pattern proof** - Angular is hard enough to understand as it is without having to reference two different classes that do seemingly different things. $router exposes exactly ONE well defined and easy to use service
* **Exceptionally small** - Seriously look at the source - its one file of about 80 lines of actual code
* **Exceptionally fast** - Because there is no weird [cruft](http://catb.org/jargon/html/C/cruft.html) to handle there are no excess parts of the router that slows everything down
* **Undefined queries** - No need to define all acceptable query strings. Anything contained after the `?` character gets decoded and placed in `$router.query` which can be watched for changes


Why?
----
Because [angular-ui-router](https://github.com/angular-ui/ui-router) is too bloody complicated, difficult to grok and the documentation sucks.

This project is an attempt to simplify routing to its absolute bare essentials using a sane syntax with sensible examples.


Common usage
============

```javascript
// Use a given controller when matching a path (ID will be available in $router.params.id)
$router.when('/widgets/:id').component('widgetsListCtrl');

// Specify that some parameters are optional - just suffix each token with a question mark
$router.when('/foo/:id1?/:id2?/:id3?').component('fooCtrl');

// When visiting one URL redirect to another
$router.when('/foo').go('/bar');
// OR
$router.when('/foo').redirect('/bar');

// Set the priority of a routing rule
$router.when('/foo').priority('low').redirect('/somewhere/else');

// Require that a rule only matches if a promise resolves correctly (we assume $session.isLoggedIn works)
$router.when('/super-secure-area').requires($session.isLoggedIn).component('superSecureCtrl');

// ... or multiple promises
$router.when('/super-secure-area')
	.require(something)
	.require(somethingElse)
	.require([lots, o, promises])
	.component('superSecureCtrl');


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

$router.path
------------
The current path portion of the route.

$router.params
--------------
An object containing all parameters extracted from the URL in tokenized form.

For example if the rule has the path `/widgets/:id` and the current URL is `/widgets/123` the parameters object will be `{id: 123}`.

**NOTE**: This object will never break its reference meaning it can be watched and rebound.

$router.query
-------------
An object containing all query parameters extracted from the URL.

For example if the rule has the path `/widgets/:id` and the current URL is `/widgets/123?foo=bar&baz` the parameters object will be `{foo: 'bar', baz: true}`.

**NOTE**: This object will never break its reference meaning it can be watched and rebound.

$router.setQuery(key, [val])
----------------------------
Set the query portion of the URL and trigger a renaviate operation.

This parameter takes two parameters. If both are specified the key specified will be simply set in `$router.query`. If the second parameter is omitted the key is removed. If no parameters are passed the query is blanked.

```html
<a ng-click="$router.setQuery('foo', 'bar')">Go to #/?foo=bar</a>
<a ng-click="$router.setQuery('foo')">Go to #/</a>
<a ng-click="$router.setQuery()">Go to #/</a>
```

$router.current.main
--------------------
The currently matched rule.

$router.priorityAliases
-----------------------
A lookup object of different priority aliases - e.g. `lowest`, `normal` etc.

$router.sort
------------
Various configuration options to sort the `$router.routes` collection. This containes `$router.sort.enabled` which toggles whether to sort, `$router.sort.isSorted` which specifies the dirty flag of the routes being sorted, `$router.sort.keyOrder` which is a complex collection of how to sort the array (see the source code). The sorting function can be overrideen by subclassing / decorating `$router.sort.sorter`.

$router.warns
-------------
An object containing a list of keys corresponding to various functions the router will check before it runs. These should only ever be enabled at run time as they take extra processing cycles.

Use `$router.warnings(KEY, ENABLED)` to set by key or disable them all with `$router.warnings(false)` to disable all.


$router.pathToRegExp()
----------------------
Utility function to convert a path into a regular expression.

$router.rule(path)
------------------
Create a new router rule and append it onto the `$router.routes` stack.

See [RouterRule](#routerrule).

$router.warnings(key, value) / $router.warnings(false)
------------------------------------------------------
Disable a specific warning / debugging flag within the router or disable all flags with `$router.warnings(false)`.

$router.when(path)
------------------
Alias of `$router.rule(path)`.

$router.resolve(path)
---------------------
Return the first matching router rule that matches the given path.

$router.go(path) / $router.redirect(path)
-----------------------------------------
Navigate to the given path.


RouterRule (Object instance)
----------------------------
An instance of a router rule.
If a path is specified `RouterRule.path()` is automatically called.

RouterRule.component(name)
--------------------------
Configure the action of the rule to display the named component.

RouterRule.go(path) / RouterRule.redirect(path)
-----------------------------------------------
Configure the action of the rule to redirect to another path

RouterRule.matches(path)
------------------------
Tests a given path against the rule. This will return a boolean if the rule matches.

RouterRule.path(path)
---------------------
Set the path of the rule. This can be a tokenized Ruby style path or a regular expression.

RouterRule.priorty(priority)
----------------------------
Set the priority out of 100 that the rule should install itself at in the router rules stack.
The value can either be a number or a string corresponding to an entry in `$router.priorityAliases`.

RouterRule.requires(...tests) / RouterRule.require(...tests)
------------------------------------------------------------
A function, promise or an array therefof of conditions that must be satisfied for this rule to match.

```javascript
// Only match if `$session.promise()` returns correctly
$router.when('/foo')
	.requires($session.promise)
	.component('fooCtrl');
```

**NOTE**: Promises only ever resolve _once_ so its important to pass in a function which _creates a new promise_ (a Promise Factory pattern). This was the factory is instanciated whenever the rule is checked with a new state each time. The Router will warn if it is passed a Promise directly rather than a function which returns a promise.


RouterRule.extractParams(path)
------------------------------
Function to extract parameters from the URL into the parameters object.


routerView (directive)
----------------------
Used in the main page template to indicate where to place the page content.

```html
<router-view></router-view>
```
