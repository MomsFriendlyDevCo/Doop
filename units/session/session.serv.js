angular
	.module('app')
	.service('$session', function($rootScope, $location, $q, $window, Users) {
		var $session = this;

		$session.data = {}; // User session data
		$session.isLoggedIn = false; // Whether the user is logged in according to the server
		$session.isUpdated = false; // Have we tried to fetch the user info yet?

		// Promise utilities {{{

		/**
		* Return a promise for when this user is logged in
		* NOTE - if the user is ALREADY logged in or DEFINIATELY NOT logged in this function will return an already resolved/rejected promise.
		*        If neither are true we return a defer / future and resolve that when we know for certain
		* @return {Promise} A promise which will resolve on login or reject on fail (or not logged in)
		*/
		$session.promise = function() {
			if ($session.isLoggedIn) { // Already logged in
				return $q.resolve($session.data);
			} else if (!$session.isLoggedIn && $session.isUpdated) { // NOT logged in and we have already spoken to the server
				return $q.reject();
			} else { // NOT logged in and we have NOT spoken to the server - return a future and resolve/reject when we can
				return $q(function(resolve, reject) {
					var loginUnwatcher = $rootScope.$on('session.updated', function() { // Ask to be updated when the server replies
						if ($session.isLoggedIn) {
							resolve($session.data);
						} else {
							reject();
						}
						loginUnwatcher(); // Release the $on watcher
					});
				});
			}
		};

		/**
		* Similar to $session.promise but only resolves if the user is logged in AND that $session.data.role is equal to role (or any of the items in role if its an array)
		* @param {string|array} role The role(s) to verify against
		* @return {Promise} A promise which will resolve if the user is logged in and role matches
		* @see promise()
		*/
		$session.promise.role = function(role) {
			return $q(function(resolve, reject) {
				$session.promise()
					.then(function(user) {
						if (_.includes(_.castArray(role), user.role)) {
							resolve(user);
						} else {
							reject(user);
						}
					})
					.catch(_=> reject());
			});
		};

		/**
		* Alias of $session.promise.role(['admin', 'root'])
		* @see promise.role()
		*/
		$session.promise.admin = _=> $session.promise.role(['admin', 'root']);

		// }}}

		/**
		* Save the current user details back to the server
		* @return {Promise} A promise object for the save request
		*/
		$session.save = function() {
			// Save session to db
			return Users.save().$promise
				.catch(err => console.error('Could not save user session', err.data));
		};

		/**
		* Refresh user information from the server
		* This function is automatically executed on bootstrap
		* @return {Promise} A promise object for the fetch request
		*/
		$session.update = function() {
			// Load session data from db
			return Users.profile().$promise
				.then(res => {
					$session.data = res;

					// Attempt to save new session data to local storage
					try {
						$window.localStorage.setItem('session', JSON.stringify($session.data));
					} catch(e) {
						console.warn('Could not cache session data');
					}
				})
				.catch(err => {
					console.error('Could not update user session', err.data);
				})
				.finally(() => {
					$session.isUpdated = true;
					$session.isLoggedIn = ($session.data && $session.data._id);
					$rootScope.$broadcast('session.updated', $session.data);
				});
		};

		/**
		* Attempts to fetch session data from local storage.
		* @return {boolean} indicating whether local session data was successfully retrieved from localStorage.
		*/
		$session.getLocal = function() {
			if ($window.localStorage.getItem('session')) {
				try {
					return !!($session.data = JSON.parse($window.localStorage.getItem('session')));
				} catch(e) {
					return false;
				}
			} else {
				return false;
			}
		};

		/**
		* Attempt to log in the user
		* @return {Promise} The promise object for the server request
		*/
		$session.login = function(user) {
			return Users.login(user).$promise
				.then(res => $session.update().then(res => $window.location = '/')); // Update local session then redirect to root
		};

		/**
		* Attempt to logout the user
		* @return {Promise} The promise object for the server request
		*/
		$session.logout = function() {
			return Users.logout().$promise
				.then(res => $session.update().then(res => $location.path('/login'))); // Update local session then redirect to login
		};

		/**
		* Attempt password recovery with a user
		* @param {string} email The users email address
		*/
		$session.recover = function(email) {
			return Users.recover({email: email}).$promise;
		};

		// Init local storage for session data
		$session.getLocal();

		// Fetch session data on service creation
		$rootScope.$evalAsync(_=> $session.update());
	});
