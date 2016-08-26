angular
	.module('app')
	.service('SessionServ', function($rootScope, $state, $window, SessionModl) {
		var self = this;

		this.data = {}; // User session data
		this.isLoggedIn = false;

		this.save = function() {
			// Save session to db
			return SessionModl.save().$promise
				.catch(err => {
					console.error('Could not save user session', err.data);
				});
		};

		this.update = function() {
			// Load session data from db
			return SessionModl.profile().$promise
				.then(res => {
					self.data = res;

					// Attempt to save new session data to local storage
					try {
						$window.localStorage.setItem('session', JSON.stringify(self.data));
					} catch(e) {
						console.error('Could not cache session data');
					}

					// Broadcast to app that session data has changed
					$rootScope.$broadcast('session.updated', self.data);
				})
				.catch(err => {
					console.error('Could not update user session', err.data);
				})
				.finally(() => {
					self.checkLogin();
				});
		};

		/**
		* Attempts to fetch session data by first trying local storage, otherwise fallback to remote fetch
		*/
		this.get = function() {
			if (!self.getLocal()) $rootScope.$evalAsync(self.update());
		};

		/**
		* Attempts to fetch session data from local storage.
		* @return Boolean indicating whether local session data was successfully retrieved from localStorage.
		*/
		this.getLocal = function() {
			if ($window.localStorage.getItem('session')) {
				try {
					return !!(self.data = JSON.parse($window.localStorage.getItem('session')));
				} catch(e) {
					return false;
				}
			} else {
				return false;
			}
		};

		this.destroy = function() {
			self.data = {};
		};

		this.login = function(user) {
			return SessionModl.login(user).$promise
				.then(res => {
					// Update local session then redirect to dash
					self.update().then(res => $state.go('dashboard'));
				});
		};

		this.logout = function() {
			return SessionModl.logout().$promise
				.then(res => {
					// Update local session then redirect to login
					self.update().then(res => $state.go('login'));
				});
		};

		this.checkLogin = function() {
			// Add convenience flags
			if (self.data && self.data._id)
				self.isLoggedIn = true;
			else
				self.isLoggedIn = false;
		};

		// Init local storage for session data
		this.getLocal();

		$rootScope.$evalAsync(() => {
			// Fetch session data on service creation
			self.update();
		});
	});
