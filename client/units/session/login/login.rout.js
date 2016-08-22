(function() {
	angular
		.module('app')
		.config($stateProvider => {
			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: '/app/units/session/login/login.tmpl.html',
					controller: 'LoginCtrl as vm',
					data: {
						// Put custom data to expose to controllers here
					},
				});
		});
})();
