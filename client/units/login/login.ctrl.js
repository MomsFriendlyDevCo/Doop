angular
	.module('app')
	.controller('LoginCtrl', function($scope) {
		this.login = function(isValid) {
			if (!isValid) return;

			// Perform login
			console.info('Performing login...', this.user); // FIXME: Debug log
			$scope.session.login(this.user)
				.then(res => {
					// success
				})
				.catch(err => {
					console.error('Error could not login!');
				});
		};

		// Init scope variables
		this.user = { username: '', password: '' };
	});
