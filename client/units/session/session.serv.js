angular
	.module('app')
	.service('SessionServ', function($rootScope, SessionModl) {
		var self = this;

		this.data = {}; // User session data

		this.save = function() {
			// Save session to db
			return SessionModl.save().$promise
				.catch(err => {
					console.error('Could not save user session', err.data);
				});
		};

		this.update = function() {
			// Load session data from db
			return SessionModl.get().$promise
				.then(res => {
					self.data = res.data;
					// TODO: NOW Assign to locate storage
					// Local forage -- wrapper library -- wrap in try catch block

				})
				.catch(err => {
					console.error('Could not update user session', err.data);
				});
		};

		this.getLocal = function() {
			// Fetch local storage else do nothing
		};

		this.login = function(user) {
			return SessionModl.login(user).$promise;
		};

		this.logout = function() {
			return SessionModl.logout().$promise;
		};

		// Init local storage for session data
		this.getLocal();

		$rootScope.$evalAsync(() => {
			// Fetch session data on service creation
			self.update();
		});
	});
