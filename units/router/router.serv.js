/**
* Doops exceedingly splendid front-end router
* Because there is an upper limit to the insanity we can cope with in angular-ui-router. We crossed that line some time ago.
* @author Matt Carter <m@ttcarter.com>
* @date 2016-11-10
*/

angular
	.module('app')
	.service('$router', function($location, $q, $rootScope) {
		var $router = this;
		$router.routes = [];
		$router.path = null; // The current path portion of the route
		$router.params = {}; // Extracted parameters based on the rule tokens
		$router.query = {}; // Query portion of the URI
		$router.current = null; // The current matching rule
		$router.priorityAliases = {first: 100, highest: 100, normal: 50, default: 50, low: 25, lowest: 0, last: 0};
		$router.nextRuleId = 0;
		$router.sort = {
			enabled: true,
			isSorted: false,
			keyOrder: [
				{key: '_priority', reverse: true},
				{key: '_pathHuman', charOrder: 'abcdefghijklmnopqrstuvwxyz0123456789:/-_', fallback: _=> String.fromCharCode(65000)},
				{key: '_path', charOrder: 'abcdefghijklmnopqrstuvwxyz0123456789:/-_', fallback: _=> String.fromCharCode(65000)},
			],
			// Sorter function {{{
			// Code taken in-part from https://github.com/hash-bang/string-sort (author of this module is the author of string-sort)
			// See that module for a test kit and documentation
			// TL;DR - this is a [Schwartzian Transform](https://en.wikipedia.org/wiki/Schwartzian_transform)
			sorter: function() {
				// Cache the lookup table for each key rule
				$router.sort.keyOrder.forEach(keyRule => {
					if (keyRule.charOrder) {
						keyRule.charOrderTable = {};
						keyRule.charOrder.split('').forEach((c,i) => keyRule.charOrderTable[c] = String.fromCharCode(i + 65));
					}
				});

				$router.routes = $router.routes
					.map(r => [r].concat($router.sort.keyOrder.map(keyRule => { // Pack the rules into an array of the form [RouterRule, fields...]
						// Construct each key value
						if (!_.hasIn(r, keyRule.key)) { // Lookup key missing
							return undefined;
						} else if (keyRule.charOrderTable) { // Translate string into something we can use
							return r[keyRule.key]
								.toString()
								.split('')
								.map(c => keyRule.charOrderTable[c] || keyRule.fallback(c))
								.join('');
						} else { // Just return the value
							return r[keyRule.key];
						}
					})))
					.sort(function(a, b) { // Sort everything...
						for (var k = 0; k < $router.sort.keyOrder.length; k++) { // Compare each field until we hit something that differs
							if (_.isUndefined(a[k+1]) || _.isUndefined(b[k+1])) continue; // Skip non-existant comparitors
							if (a[k+1] == b[k+1]) continue; // Fall though as both values are the same
							// If we got here the fields differ
							return a[k+1] > b[k+1] ? ($router.sort.keyOrder[k].reverse ? -1 : 1) : ($router.sort.keyOrder[k].reverse ? 1 : -1);
						}
					})
					.map(i => i[0]); // Unpack and return the rule again
			},
			// }}}
		};
		$router.warns = {
			requiresChecking: true, // Warn when passing an object / promise to rule.requires() rather than a promise factory
		};
		$router.tokenRules = {};  // Token validators (see $router.tokenRule)

		// Rule instance {{{
		/**
		* A router rule instance
		* @param {string|RegExp} path An initial path value to set (internally calls .path())
		*/
		var RouterRule = function(path) {
			this._id = 'route-' + $router.nextRuleId++;
			this._path;
			this._action = 'views'; // Action to take when the rule matches. ENUM: 'views' (let each view handle the action), 'redirect' ($router will redirect entire page)
			this._component = {main: null};
			this._redirect;
			this._segments = []; // The extracted capture groups for the rule in order. Each item has 'id', 'required' and an optional 'validator'
			this._priority = 50;
			this._requires = [];
			this._data = {};
			this._params = {};

			/**
			* The current view state
			* Each element key should correspond to a <router-view route-id="ID"></router-view> ID
			* @var {Object}
			*/
			this.views = {
				/*
				example: { // ID should the router-view ID to react to
					method: String, // ENUM: 'component', 'template',
					content: String, // The component to render if method==component, template if method==template or the templateUrl if method==templateUrl
				},
				*/
			};


			/**
			* Set the ID of this rule
			* Normally an ID is automatically generated - this allows an easier method to identify routes
			* @param {string|number} A unique identifier for this rule
			* @return {RouterRule} This chainable object
			*/
			this.id = function(newId) {
				this._id = newId;
				return this;
			};


			/**
			* Set the component to use when the rule is satisfied
			* @param {string|Object} [id='main'] The ID of the component to set, if omitted 'main' is assumed
			* @param {string} component The component to use
			* @return {RouterRule} This chainable object
			* @example
			* // Set the main router-view to 'fooCtrl'
			* Rule.component('fooCtrl');
			* // OR
			* Rule.component('main', 'fooCtrl');
			*
			* @example
			* // Set the main router-view to 'fooCtrl' and the 'aside' router-view to 'barCtrl'
			* Rule.component('fooCtrl');
			* Rule.component('aside', 'barCtrl');
			* // OR
			* Rule.component({main: 'fooCtrl', aside: 'barCtrl'});
			*/
			this.component = function(id, component) {
				this._action = 'views';

				// Yes I know this string is pretty much unreadbable it translates to the code below
				// Its like this so that this funciton doesn't blow out in size when we copy it three times (template() + templateUrl())
				return this.view(_.isObject(id) ? id : 'main', 'component', _.isString(id) ? id : undefined);

				/*
				// Actual logic is as follows:
				if (_.isObject(id)) { // Form: (object)
					this.view(id, 'component');
				} else if (!template) { // Form: ([id='main'], template)
					this.view('main', 'component', id);
				} else if (id && component) { // Form: (id, component)
					this.view(id, 'component', component);
				}
				*/
			};


			/**
			* Set the template to use when the rule is satisfied
			* A template can either be a HTML string or (if it begins with '/' a path)
			* NOTE: This function obeys much the same functionality as RouterRule.component() so see its definition for examples to set single, multiple or all view contents
			* @param {string} [id='main'] The ID of the component to set, if omitted 'main' is assumed
			* @param {string} template The template or absolute template path to use
			* @return {RouterRule} This chainable object
			*/
			this.template = function(id, template) {
				this._action = 'views';

				// See component() for why this expression is written like this
				return this.view(_.isObject(id) ? id : 'main', 'template', _.isString(id) ? id : undefined);
			};

			/**
			* Set the templateUrl to use when the rule is satisfied
			* A template can either be a HTML string or (if it begins with '/' a path)
			* NOTE: This function obeys much the same functionality as RouterRule.component() so see its definition for examples to set single, multiple or all view contents
			* @param {string} [id='main'] The ID of the component to set, if omitted 'main' is assumed
			* @param {string} url The template or absolute template path to use
			* @return {RouterRule} This chainable object
			*/
			this.templateUrl = function(id, url) {
				this._action = 'views';

				// See component() for why this expression is written like this
				return this.view(_.isObject(id) ? id : 'main', 'templateUrl', _.isString(id) ? id : undefined);
			};

			/**
			* Alias of templateUrl
			* @alias templateUrl
			*/
			this.templateURL = this.templateUrl;


			/**
			* Set all or a specific views actions
			* This function can be called in a variety of ways
			* @param {string|Object} id The ID of the view to set OR an object to set all
			* @param {string} [method] Optional method to set if ID is an object, required if all parameters are strings
			* @param {string} [content] Optional content to set if the ID is an object, required if all parameters are strings
			* @return {RouterRule} This chainable object
			* @example
			* // Set all views - same as just setting RouterRule.views manually (Object)
			* RouterRule.view({main: {method: 'component', content: 'fooCtrl'}})
			* // Set all views, and define the method to set (Object, String)
			* RouterRule.view({main: {content: 'fooCtrl'}, aside: {content: 'barCtrl'}}, 'component') // Sets action=component in each case
			* // Set a specific view to a method with content (can be called multiple times; String, String, String)
			* RouterRule.view('main', 'component', 'fooCtrl')
			*/
			this.view = function(id, method, content) {
				this._action = 'views';
				if (_.isObject(id)) { // Form: (object) - set everything all at once, trust that the user knows what its doing
					this.views = _.mapValues(id, (v, k) => ({content: v}));
					if (method) _.forEach(this.views, (v, k) => v.method = method); // Method also specified - set this in each object value
				} else if (_.isString(id) && _.isObject(method)) { // Form: (string, object) - Set a specific view's object
					this.views[id] = method;
				} else if (_.isString(id) && _.isString(method) && _.isString(content)) { // Form: (string, string, string) - Set a specific ID's view, method and contents as strings
					this.views[id] = {method: method, content: content};
				} else {
					throw new Error('Unknown call pattern. See docs for RouterRule.view() for permitted patterns');
				}

				return this;
			};


			/**
			* Set the a path to redirect to if this rule is satisfied
			* @param {string} component The component to use
			* @return {RouterRule} This chainable object
			*/
			this.go = function(path) {
				this._action = 'redirect';
				this._redirect = path;
				return this;
			};

			/**
			* Alias of go
			* @see go()
			*/
			this.redirect = this.go;

			/**
			* Set the priority of this rule
			* @param {number|string} The priority number or alias (see $router.priorityAliases)
			* @return {RouterRule} This chainable object
			*/
			this.priority = function(priority) {
				if (isFinite(priority)) {
					this._priority = priority;
				} else if ($router.priorityAliases.hasOwnProperty(priority)) {
					this._priority = $router.priorityAliases[priority];
				} else {
					throw new Error('Unknown priority number or alias: ' + priority);
				}
				return this;
			};

			/**
			* Set the data element of a rule
			* This is really just a setter for _data
			* @param {*} key The data element to set. If this is a single elemnt the entire data object is overwritten, this can also be a key along with the next value
			* @param {*} value If this is specified this function acts as a setter of the form `data(key, value)`
			* @return {RouterRule} This chainable object
			*/
			this.data = function(key, value) {
				if (value === undefined) {
					this._data = data;
				} else {
					this._data[key] = value;
				}
				return this;
			};

			/**
			* Inject additional parameters into the $router.params structure if this route matches
			* @param {*} key The data element to set. If this is a single elemnt the entire data object is overwritten, this can also be a key along with the next value
			* @param {*} value If this is specified this function acts as a setter of the form `params(key, value)`
			* @return {RouterRule} This chainable object
			*/
			this.params = function(key, value) {
				if (value === undefined) {
					this._params = data;
				} else {
					this._params[key] = value;
				}
				return this;
			};

			/**
			* Shortcut function to call RouterRule.data('title', DATA)
			* @param {string} title A suitable title string to set
			* @see data()
			*/
			this.title = title => this.data('title', title);

			/**
			* Sets a requirement for the rule to be satisfied
			* This is a promise or array of promises which must resolve for the rule to be satisfied
			* NOTE: All regular functions will be transformed into promises (so we can process them faster later)
			* @param {array|Promise} ...test Either a single promise or an array of promises to be satisfied for the rule to match
			* @return {RouterRule} This chainable object
			*/
			this.requires = function() {
				if ($router.warns.requiresChecking) {
					_.flatten(arguments).forEach(p => {
						if (!_.isFunction(p)) {
							console.warn(
								'RouterRule.requires() must be passed a PROMISE FACTORY - ' +
								(_.hasIn(p, 'then')
									? 'promises only ever run once!'
									: 'was given unexpected type: ' + (typeof p)
								) +
								' Pass in a factory or disable this message with $router.warnings("requiresChecking", false)'
							);
						}
					});
				}

				Array.prototype.push.apply(this._requires, _.flatten(arguments));

				return this;
			};

			/**
			* Alias of requires()
			* @see requires
			*/
			this.require = this.requires;

			/**
			* Return if the given path satisfies this rule
			* @param {string} path The path to test against
			* @param {boolean} [requires=true] Obey requires attached to the rule
			* @return {Promise} A promise which will resolve if this rule is satisfied by the given path
			*/
			this.matches = (path, requires) => $q((resolve, reject) => {
				var segValues;

				if ( // Matches basic pathing rules (if no path pass though)
					!this._path || // Either this rule doesnt have a path OR
					(
						this._path.test(path) && // The patch matches AND
						(segValues = this.extractParams(path)) && // Parameters can be extracted from the path
						this._segments.every(seg => _.isFunction(seg.validator) ? seg.validator(segValues[seg.id]) : seg.validator) // If this segment has a validator use its return
					)
				) {
					if (!this._requires.length || requires === false) return resolve();

					$q.all(this._requires.map(r => r())) // Run each factory function to crack open the promise inside then resolve it
						.then(_=>resolve())
						.catch(_=>reject())
				} else {
					reject();
				}
			});

			/**
			* Set the path matcher in the rule
			* This can be a string in Ruby style e.g. `/foo/bar/:id?` or a RegExp
			* @param {string|regexp} path The path to set
			* @return {RouterRule} This chainable object
			*/
			this.path = function(path) {
				if (_.isRegExp(path)) { // Is a RegExp
					this._path = path;
					this._segments = [];
				} else if (_.isString(path) && path) { // Is a string
					this._pathHuman = path; // Store the human version of the path for sorting later
					this._path = $router.pathToRegExp(path);
					this._segments = (path.match(/:[a-z0-9_-]+\??/gi) || [])
						.map(function(seg) {
							var segExamined = /^:(.+?)(\?)?$/.exec(seg);
							return {
								id: segExamined[1],
								required: !segExamined[2],
								validator: $router.tokenRules[segExamined[1]] || true,
							};
						});
				}
			};

			/**
			* Extract the parameters from a given path
			* This is used to populate $router.params when we navigate
			* @param {string} path The path component to match against
			* @return {Object} A populated object with all the tokens extracted
			*/
			this.extractParams = function(path) {
				if (!this._path) return {};
				var extracted = this._path.exec(path);
				var params = {};
				this._segments.forEach((seg,i) => params[seg.id] = extracted[i+1] ? extracted[i+1].replace(/^\//, '') : null);
				return params;
			};

			/**
			* Turn a raw query string into an object
			* The query string can optionally begin with a '?'
			* @params {string} query The raw query string to process
			* @return {Object} A populated object from the query string
			*/
			this.extractQuery = function(query) {
				if (!query) return {};

				return _(_(query).trimStart('?').split('&'))
					.map(pair => {
						var keyVal = pair.split('=', 2);
						return (keyVal.length < 2) ? [keyVal[0], true] : keyVal;
					})
					.fromPairs()
					.mapKeys((v, k) => decodeURIComponent(k))
					.mapValues((v, k) => decodeURIComponent(v))
					.value();
			};


			this.path(path); // Set initial path if there is one
			$router.routes.push(this);
			$router.sort.isSorted = false;
			return this;
		};
		// }}}

		/**
		* Convert a token path into a regular expression
		* @param {string} path The path to convert
		* @return {RegExp} A valid regular expression
		*/
		$router.pathToRegExp = function(path) {
			var safePath = path
				.replace(/\/:[a-z0-9_-]+(\?)?/gi, (all, optional) => '!!!CAPTURE ' + (optional ? 'OPTIONAL' : 'REQUIRED') + '!!!') // Change all :something? markers into tokens
				.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // Convert all remaining content into a 'safe' string (regexp encoding)
				.replace(/!!!CAPTURE OPTIONAL!!!/g, '(\\/.+)?') // Drop the capture groups back into the expression
				.replace(/!!!CAPTURE REQUIRED!!!/g, '(\\/.+)') // Drop the capture groups back into the expression

			return new RegExp('^' + safePath + '$');
		};

		/**
		* Create a new router rule
		* @param {string} [path] Optional path to set
		*/
		$router.rule = path => new RouterRule(path);

		/**
		* Shortcut to create a new rule
		* @see rule()
		*/
		$router.when = $router.rule; // Shortcut function


		/**
		* Return what rule would match if given a path to examine
		* This function also resorts the router stack if $router.sort.isSorted is false
		* @param {string} path The path to examine
		* @return {Promise} A promise with the resolved rule
		*/
		$router.resolve = function(path) {
			if ($router.sort.enabled && !$router.sort.isSorted) {
				$router.sort.sorter();
				$router.sort.isSorted = true;
			}

			return $q(function(mainResolve, mainReject) { // Compose a resolver by creating a series chain of rules (each rule is the parent of the previous using .then())
				var resolver = $router.routes.reduce((chain, rule) => {
					return chain.then(_=> $q((ruleResolve, ruleReject) => {
						// For each rule return a promise that is upside down - if it resolves, the rule matches and it should call the mainResolve, if it DOESN'T it should resolve anyway so the next one can run
						rule.matches(path)
							.then(_=> mainResolve(rule)) // If the rule matches fire the mainResolver which also stops this chain being processed
							.catch(err => { if (err) { mainReject(err) } else { ruleResolve() } }) // If it errored see if its a valid complaint (if so reject it via mainReject) else continue on
					}));
				}, $q.resolve())
					.then(_=> mainReject())
			})
		};

		/**
		* Navigate to the given path if it exists
		* NOTE: This is the internal router command to act 'as if' a route was triggered.
		*       If you want to BOTH trigger a route AND update the URL use $location.path('/somewhere')
		*
		* @param {string} [rawPath] The path to navigate to. If path is falsy, '/' is assumed
		* @return {Promise} A promise object for the navigation
		*/
		$router.go = function(rawPath) {
			if (!rawPath) rawPath = '/';
			$rootScope.$broadcast('$routerStart', $router.current);
			return $q(function(resolve, reject) {
				// Break the path into the path portion + query string
				var urlInfo = /^(.*?)(\?.*)?$/.exec(rawPath);
				var path = urlInfo[1];
				var query = urlInfo[2];

				$router.resolve(path)
					.then(rule => {
						var previousRule = $router.current;
						$router.path = path;
						$router.current = rule;
						// We cant just set $router.params as that would break the references to it - so we have to empty it, then refill
						Object.keys($router.params).forEach(k => delete $router.params[k]);
						angular.extend($router.params, rule.extractParams(path));
						angular.extend($router.params, rule._params); // Also glue any custom params from the rule

						// Clear out + rebuild $router.query also
						Object.keys($router.query).forEach(k => delete $router.query[k]);
						angular.extend($router.query, rule.extractQuery(query));

						resolve(rule);
						if (previousRule && _.isEqual(previousRule.views, rule.views)) $rootScope.$broadcast('$routerSuccess', $router.current); // If we're not changing the component but we ARE changing the params we need to fire $routerSuccess anyway

						switch ($router.current._action) {
							case 'views':
								// Do nothing - $router.views[id] should be detected as changed by the downstream router-view components which should then reconfigure themselves
								break;
							case 'redirect':
								$location.path($router.current._redirect);
								break;
							default:
								throw new Error('Unknown router action: ' + $router.current._action);
						}
					})
					.catch(err => {
						$rootScope.$broadcast('$routerError', err);
						reject(err);
					})
			});
		};

		/**
		* Alias of go()
		* @see go()
		*/
		$router.redirect = $router.go;

		/**
		* Disable a specific warning flag or all flags by just passing `false`
		* @param {string|boolean} key Either the key of the warning to set the value of OR a boolean to set all
		* @param {boolean} [value] The new value of the key if one was specified
		* @return {$router} This chainable object
		*/
		$router.warnings = (key, val) => {
			if (_.isBoolean(key)) {
				_.forEach($router.warns, (v,k) => $router.warns[k] = val)
			} else if ($router.warns[key]) {
				$router.warns[key] = val;
			} else {
				throw new Error('Unknown warning key to disable: ' + key + '. Valid warning keys are: ' + _.keys($router.warns));
			}

			return $router;
		};

		/**
		* Define a rule to be used with a given token.
		* This should be a function that will return whether the given value can be accepted to satisfy that rule segment
		* Token rules are defined centrally in $router.tokenRules
		* @param {string} token The token to validate against. Leading ':' will be automatically removed
		* @param {function} function(value) Validation function that is expected to return a truthy value if the segment validates
		* @return {$router} This chainable router object
		*/
		$router.tokenRule = (token, validator) => {
			$router.tokenRules[_.trimStart(token, ':')] = validator;
			return $router;
		};

		/**
		* Set the query portion of the URL and trigger a renaviate operation
		* @param {string} key The key portion of the query to set. If this is falsy all query items are removed
		* @param {mixed} [val] The value of the router query to set, if this is undefined it is removed
		* @return {$router} This chainable router object
		*/
		$router.setQuery = (key, val) => {
			var newQuery = key ? _.clone($router.query) : {};

			if (val === undefined) {
				delete newQuery[key];
			} else {
				newQuery[key] = val;
			}

			location.hash = '#' + $router.path + (_.isEmpty(newQuery) ? '' : '?' + _.map(newQuery, (v, k) => k + '=' + v).join('='));
			return $router;
		};

		// Setup a watcher on the main window location hash
		$rootScope.$watch(_=> location.hash, function() {
			var newHash = location.hash.replace(/^#!?/, '');
			$router.go(newHash);
		});
	})
	.component('routerView', {
		bindings: {
			routeId: '@',
		},
		controller: function($compile, $element, $http, $q, $rootScope, $router, $scope, $templateCache, $timeout) {
			var $ctrl = this;
			$ctrl.$router = $router;

			$scope.$watch(()=> $router.current._id, function(newVer, oldVer) {
				if (!$router.current) return; // Main route not loaded yet
				var id = $ctrl.routeId || 'main';

				if (!$router.current.views[id])  return;

				var createView = function() {
					switch($router.current.views[id].method) {
						case 'component':
							var componentName = $router.current.views[id].content.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert to kebab-case
							$element.html($compile('<' + componentName + '></' + componentName + '>')($rootScope.$new()));
							$timeout(()=> $rootScope.$broadcast('$routerSuccess', $router.current));
							break;
						case 'template':
							$element.html($compile($router.current.views[id].content)($rootScope.$new()));
							$timeout(()=> $rootScope.$broadcast('$routerSuccess', $router.current));
							break;
						case 'templateUrl':
							// Try to fetch from $templateCache then $http
							$q((resolve, reject) => {
								var template = $templateCache.get($router.current.views[id].content);
								if (template) return resolve(template);

								// No cache entry - use HTTP
								$http.get($router.current.views[id].content, {cache: true})
									.then(resolve)
									.catch(reject)
							})
								.then(data => $element.html($compile(data)($rootScope.$new())))
								.then(() => $timeout(()=> $rootScope.$broadcast('$routerSuccess', $router.current)))
							break;
						default:
							// if ($router.current.views[id].method) { // Throw an error if !undefined (if undefined, just clear up and do nothing)
								throw new Error('View "' + id + '" has unknown router view method: "' + $router.current.views[id].method + '"');
							// }
					}
				};

				// Destroy the previous component (if any) and call createView() when done {{{
				var elementChild = $element.children();
				if (elementChild.length > 0) {
					elementChild = angular.element(elementChild[0]);
					if (elementChild.scope) { // Destroy the previous component
						$timeout(()=> {
							var scope = elementChild.scope();
							scope.$apply(_=> {
								scope.$destroy();
								createView();
							});
						});
					} else {
						createView();
					}
				} else {
					createView();
				}
				// }}}
			});
		},
	})
	.run(function($rootScope, $router, $location) {
		// Trigger initial routing (use $applyAsync so this gets pushed to the bottom of the run() call stack)
		$rootScope.$applyAsync(_=> $router.go($location.path()));
	})
