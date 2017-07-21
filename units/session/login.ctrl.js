angular
	.module('app')
	// Match /login {{{
	.run(($router, $session) => $router.when('/login') // User not logged in - allow /login route
		.title('Login')
		.requires($session.promise.notLogin)
		.component('sessionLoginCtrl')
	)
	.run(($router, $session) => $router.when('/login') // User IS logged in - redirect to /
		.title('Login')
		.requires($session.promise.login)
		.redirect('/')
	)
	// }}}
	// If no route matches + user is not logged in go to '/login' {{{
	.run(($router, $session, $window) => $router.rule()
		.priority('lowest')
		.requires($session.promise.notLogin)
		.requires(()=> {
			// Tell $session to redirect to the originally requested hash code if we have one
			if ($window.location.hash && $window.location.hash != '/#/login') $session.postLoginUrlOnce = '/' + $window.location.hash;
			return true;
		})
		.redirect('/login')
	)
	// }}}
	// Redirect any page navigation (that is not in an array of approved ones) to /login if the user is not logged in {{{
	.run(function($location, $rootScope, $session, $window) {
		/**
		* Array of applicable $window.location.pathnames to allow without redirecting to /login
		* This is an array of strings or RegExps to match against
		* @var {array}
		*/
		var compareSegment = 'hash'; // Which part of $window.location to examine for the below paths. ENUM: hash, pathname
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
					if (compareSegment == 'hash') {
						$location.path('/login');
					} else {
						$window.location = '/login';
					}
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

			$ctrl.login = ()=> {
				$session.login(this.user); // NOTE: Redirection is handled by $session post login (it needs to redirect to the originally requested URL)

				$rootScope.$on('loginFailure', (e, err) => {
					$ctrl.error = err || 'Could not login!';

					$animate.addClass(angular.element('#login-panel'), 'animate-shake')
						.then(()=> $animate.removeClass(angular.element('#login-panel'), 'animate-shake'))
				});
			};

			// Silly work around to stop the loader animation firing even though the page has loaded (login is a weird edge case in the load order)
			$rootScope.$on('$routerStart', ()=> $loader.stop('routerNav'));
		},
	});
