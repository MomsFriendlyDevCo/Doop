(function() {
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

			this.$onInit = function() {
				this.user = { username: '', password: '' };
			};
		});
})();
