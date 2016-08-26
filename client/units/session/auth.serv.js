angular
	.module('app')
	.service('AuthServ', function($rootScope, $state, SessionServ) {

		/**
		* Ensures user is authenticated
		*/
		this.ensureAuthenticated = function() {
			// FIXME: Need way to prevent non-user manually navigating to state
			// if (!_.get(SessionServ, 'isLoggedIn')) $state.go('login');

			$rootScope.$on('session.updated', (e, user) => {
				if (!_.get(user, '_id')) $state.go('login');
			});
		};

		/**
		* Ensures user is NOT authenticated
		*/
		this.ensureUnauthenticated = function() {
			// FIXME: Need way to prevent non-user manually navigating to state
			// if (_.get(SessionServ, 'isLoggedIn')) $state.go('dashboard');

			$rootScope.$on('session.updated', (e, user) => {
				if (_.get(user, '_id')) $state.go('dashboard');
			});
		};

	});
