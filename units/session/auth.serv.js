angular
	.module('app')
	.service('$auth', function($rootScope, $session, $state) {
		var $ctrl = this;

		/**
		* Ensures user is authenticated
		*/
		$ctrl.ensureAuthenticated = function() {
			// FIXME: Need way to prevent non-user manually navigating to state
			// if (!_.get($session, 'isLoggedIn')) $state.go('login');

			$rootScope.$on('session.updated', (e, user) => {
				if (!_.get(user, '_id')) $state.go('login');
			});
		};

		/**
		* Ensures user is NOT authenticated
		*/
		$ctrl.ensureUnauthenticated = function() {
			// FIXME: Need way to prevent non-user manually navigating to state
			// if (_.get($session, 'isLoggedIn')) $state.go('dashboard');

			$rootScope.$on('session.updated', (e, user) => {
				if (_.get(user, '_id')) $state.go('dashboard');
			});
		};

	});
