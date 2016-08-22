(function() {
	angular
		.module('app')
		.factory('SessionServ', function(SessionModl) {
			var Session = {
				data: {}, // User session data
				saveSession: function() {
					// Save session to db
					return SessionModl.save().$promise
						.catch(err => {
							console.error('Could not save user session', err.data);
						});
				},
				updateSession: function() {
					// Load session data from db
					return SessionModl.get().$promise
						.then(res => {
							Session.data = res.data;
						})
						.catch(err => {
							console.error('Could not update user session', err.data);
						});
				},
				login: function(user) {
					return SessionModl.login(user).$promise;
				},
				logout: function() {
					return SessionModl.logout().$promise;
				}
			};

			// Fetch session data on service creation
			Session.updateSession();
			return Session;
		});
})();
