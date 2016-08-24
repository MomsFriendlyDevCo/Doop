angular
	.module('app')
	.service('SessionServ', function($rootScope, $state, SessionModl) {
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

					// TODO: NOW Assign to locate storage
					// Local forage -- wrapper library -- wrap in try catch block

				})
				.catch(err => {
					console.error('Could not update user session', err.data);
				})
				.finally(() => {
					// Add convenience flags
					if (self.data && self.data._id)
						self.isLoggedIn = true;
					else
						self.isLoggedIn = false;
				});
		};

		this.getLocal = function() {
			// Fetch local storage else do nothing
			// TODO: Implement localStorage fetch
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

		// Init local storage for session data
		this.getLocal();

		$rootScope.$evalAsync(() => {
			// Fetch session data on service creation
			self.update();
		});
	});
