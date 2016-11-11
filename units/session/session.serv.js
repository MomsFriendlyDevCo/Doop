angular
	.module('app')
	.service('$session', function($rootScope, $location, $window, SessionModl) {
		var $ctrl = this;

		$ctrl.data = {}; // User session data
		$ctrl.isLoggedIn = false;
		$ctrl.isUpdated = false; // Have we tried to fetch the user info yet?

		$ctrl.save = function() {
			// Save session to db
			return SessionModl.save().$promise
				.catch(err => {
					console.error('Could not save user session', err.data);
				});
		};

		$ctrl.update = function() {
			// Load session data from db
			return SessionModl.profile().$promise
				.then(res => {
					$ctrl.data = res;

					// Attempt to save new session data to local storage
					try {
						$window.localStorage.setItem('session', JSON.stringify($ctrl.data));
					} catch(e) {
						console.error('Could not cache session data');
					}
				})
				.catch(err => {
					console.error('Could not update user session', err.data);
				})
				.finally(() => {
					$ctrl.isUpdated = true;
					$ctrl.checkLogin();
					$rootScope.$broadcast('session.updated', $ctrl.data);
				});
		};

		/**
		* Attempts to fetch session data by first trying local storage, otherwise fallback to remote fetch
		*/
		$ctrl.get = function() {
			if (!$ctrl.getLocal()) $rootScope.$evalAsync($ctrl.update());
		};

		/**
		* Attempts to fetch session data from local storage.
		* @return Boolean indicating whether local session data was successfully retrieved from localStorage.
		*/
		$ctrl.getLocal = function() {
			if ($window.localStorage.getItem('session')) {
				try {
					return !!($ctrl.data = JSON.parse($window.localStorage.getItem('session')));
				} catch(e) {
					return false;
				}
			} else {
				return false;
			}
		};

		$ctrl.destroy = function() {
			$ctrl.data = {};
		};

		$ctrl.login = function(user) {
			return SessionModl.login(user).$promise
				.then(res => {
					// Update local session then redirect to dash
					$ctrl.update().then(res => $location.path('/'));
				});
		};

		$ctrl.logout = function() {
			return SessionModl.logout().$promise
				.then(res => {
					// Update local session then redirect to login
					$ctrl.update().then(res => $location.path('/login'));
				});
		};

		$ctrl.checkLogin = function() {
			// Add convenience flags
			if ($ctrl.data && $ctrl.data._id) {
				$ctrl.isLoggedIn = true;
			} else {
				$ctrl.isLoggedIn = false;
			}
		};

		// Init local storage for session data
		$ctrl.getLocal();

		// Fetch session data on service creation
		$rootScope.$evalAsync(_=> $ctrl.update());
	});
