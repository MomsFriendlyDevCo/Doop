(function() {
	angular
		.module('app')
		.config($stateProvider => {
			$stateProvider
				.state('profile', {
					url: '/profile',
					templateUrl: '/app/units/session/profile/profile.tmpl.html',
					controller: 'ProfileCtrl as profile',
					data: {
						// Put custom data to expose to controllers here
					},
				});
		});
})();
