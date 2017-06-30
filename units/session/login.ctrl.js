angular
	.module('app')
	// If no route matches go to '/' {{{
	.run(function($router, $session) {
		$router.rule()
			.priority('lowest')
			.requires($session.promise.notLogin)
			.requires(()=> {
				// Tell $session to redirect to the originally requested hash code if we have one
				if (location.hash) $session.postLoginUrlOnce = '/' + location.hash;
				return true;
			})
		.redirect('/');
	})
	// }}}
	// Redirect any page navigation (that is not in an array of approved ones) to /login if the user is not logged in {{{
	.run(function($rootScope, $session, $window) {
		/**
		* Array of applicable $window.location.pathnames to allow without redirecting to /login
		* This is an array of strings or RegExps to match against
		* @var {array}
		*/
		var compareSegment = 'pathname'; // Which part of $window.location to examine for the below paths. ENUM: hash, pathname
		var allowedPaths = [
			'/login', '/logout',
			'/signup', /^\/validate/i,
			'/recover-password', /^\/reset/i, '/login/recover',
			/^\/debug/,
			/^\/docs/,
			/^\/error\//,
		];

		$rootScope.$on('$routerStart', function(e, rule) {
			if (!rule) return; // No route figured out yet

			var segmentValue = '/' + _.trim($window.location[compareSegment], '/#'); // Crop rubbish from beginning + end of segment string

			if (allowedPaths.find(i => // Allowed path - skip redirect
				(_.isString(i) && segmentValue == i) // Match against strings
				|| (_.isRegExp(i) && i.test(segmentValue)) // Match against RegExps
			)) return;

			$session.promise() // Ask session if we are logged in
				.catch(()=> { // Not logged in - redirect to /login
					console.log('Hard redirect as the user is not logged in');
					$window.location = '/login';
				})
		});
	})
	// }}}
	.component('sessionLoginCtrl', {
		templateUrl: '/units/session/login.tmpl.html',
		controller: function($animate, $config, $rootScope, $session) {
			var $ctrl = this;
			$ctrl.$config = $config;

			$ctrl.user = {
				username: '',
				password: '',
			};

			$ctrl.error;

			$ctrl.login = function(isValid) {
				if (!isValid) return;

				// Perform login
				$session.login(this.user)
					.catch(err => {
						$ctrl.error = _.get(err, 'data.error') || err.error || err || 'Could not login!';

						$animate.addClass(angular.element('.lcb-form'), 'shake')
							.then(()=> $animate.removeClass(angular.element('.lcb-form'), 'shake'))
					});
			};

			// Silly work around to stop the loader animation firing even though the page has loaded (login is a weird edge case in the load order)
			$scope.$on('$routerStart', ()=> $loader.stop('routerNav'));

			if (location.hash) $session.postLoginUrlOnce = '/' + location.hash;
		},
	});
