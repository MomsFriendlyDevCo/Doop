/**
* MC's utterly braindead router
* Because there is an upper limit to the insanity we can cope with in angular-ui-router
* @author Matt Carter <m@ttcareter.com>
* @date 2016-11-10
*/

angular
	.module('app')
	.service('$router', function($q, $rootScope) {
		var $ctrl = this;
		$ctrl.routes = [];
		$ctrl.current = {
			params: {}, // Extracted parameters based on the rule tokens
			main: null, // The main view - this will be the matched rule object
		};
		$ctrl.priorityAliases = {first: 100, highest: 100, normal: 50, default: 50, low: 25, lowest: 0, last: 0};

		// Rule instance {{{
		/**
		* A router rule instance
		* @param {string|RegExp} path An initial path value to set (internally calls .path())
		*/
		var RouterRule = function(path) {
			this._path;
			this._action = 'component'; // Action to take when the rule matches. ENUM: 'component', 'redirect'
			this._component;
			this._redirect;
			this._segments = [];
			this._priority = 50;

			/**
			* Set the component to use when the rule is satisfied
			* @param {string} component The component to use
			* @return {RouterRule} This chainable object
			*/
			this.component = component => {
				this._action = 'component';
				this._component = component;
				return this;
			};

			/**
			* Set the a path to redirect to if this rule is satisfied
			* @param {string} component The component to use
			* @return {RouterRule} This chainable object
			*/
			this.go = path => {
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
			this.priority = priority => {
				if (isFinite(priority)) {
					this._priority = priority;
				} else if ($ctrl.priorityAliases.hasOwnProperty(priority)) {
					this._priority = $ctrl.priorityAliases[priority];
				} else {
					throw new Error('Unknown priority number or alias: ' + priority);
				}
				return this;
			};

			/**
			* Return if the given path satisfies this rule
			* @param {string} path The path to test against
			* @return {boolean} Whether this rule is satisifed by the given path
			*/
			this.matches = p => this._path && this._path.test(p);

			/**
			* Set the path matcher in the rule
			* This can be a string in Ruby style e.g. `/foo/bar/:id?` or a RegExp
			* @param {string|regexp} path The path to set
			* @return {RouterRule} This chainable object
			*/
			this.path = function(path) {
				if (typeof path == 'object' && Object.prototype.toString.call(path) == '[object RegExp]') { // Is a RegExp
					this._path = path;
					this._segments = [];
				} else if (typeof path == 'string' && path) { // Is a string
					this._path = $ctrl.pathToRegExp(path);
					this._segments = (path.match(/:[a-z0-9_-]+\??/gi) || []).map(function(seg) {
							var segExamined = /^:(.+?)(\?)?$/.exec(seg);
							return {
								id: segExamined[1],
								required: !segExamined[2],
							};
						});
				}
			};

			/**
			* Extract the parameters from a given path
			* This is used to populate $router.current.params when we navigate
			* @param {string} path The path component to match against
			* @return {Object} A populated object with all the tokens extracted
			*/
			this.extractParams = function(path) {
				var extracted = this._path.exec(path);
				var params = {};
				this._segments.forEach((seg,i) => params[seg.id] = extracted[i+1] ? extracted[i+1].replace(/^\//, '') : null);
				return params;
			};

			this.path(path); // Set initial path if there is one
			$ctrl.routes.push(this);
			return this;
		};
		// }}}

		/**
		* Convert a token path into a regular expression
		* @param {string} path The path to convert
		* @return {RegExp} A valid regular expression
		*/
		$ctrl.pathToRegExp = function(path) {
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
		$ctrl.rule = path => new RouterRule(path);

		/**
		* Shortcut to create a new rule
		* @see rule()
		*/
		$ctrl.when = $ctrl.rule; // Shortcut function


		/**
		* Return what rule would match if given a path to examine
		* @param {string} path The path to examine
		* @return {boolean|RouterRule} Either the found rule or boolean false
		*/
		$ctrl.resolve = function(path) {
			return $ctrl.routes.find(rule => rule.matches(path));
		};

		/**
		* Navigate to the given path if it exists
		* @param {string} path The path to navigate to
		* @return {Promise} A promise object for the navigation
		*/
		$ctrl.go = function(path) {
			$rootScope.$broadcast('$routerStart', $ctrl.current.main);
			return $q(function(resolve, reject) {
				var rule = $ctrl.resolve(path);
				if (rule) {
					$ctrl.current.main = rule;
					// We cant just set $ctrl.current.params as that would break the references to it - so we have to empty it, then refill
					Object.keys($ctrl.current.params).forEach(k => delete $ctrl.current.params[k]);
					angular.extend($ctrl.current.params, rule.extractParams(path));
					resolve(rule);
				} else {
					$rootScope.$broadcast('$routerError');
					reject(rule);
				}
			});
		};

		// Setup a watcher on the main window location hash
		$rootScope.$watch(_=> location.hash, function() {
			var newHash = location.hash.replace(/^#!?/, '');
			$ctrl.go(newHash);
		});
	})
	.service('$routerParams', $router => $router.current.params)
	.component('routerView', {
		controller: function($compile, $element, $rootScope, $router, $scope) {
			$scope.$watch(_=> $router.current.main, function() {
				var componentName = $router.current.main._component.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert to kebab-case
				$element.html($compile('<' + componentName + '></' + componentName + '>')($scope));
				$rootScope.$broadcast('$routerSuccess', $router.current.main);
			});
		},
	})
	.run(function($rootScope, $router, $location) {
		// Trigger initial routing (use $applyAsync so this gets pushed to the bottom of the run() call stack)
		$rootScope.$applyAsync(_=> $router.go($location.path()));
	})
