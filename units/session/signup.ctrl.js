angular
	.module('app')
	.run($router => $router.when('/signup')
		.title('Signup')
		.component('sessionSignupCtrl')
	)
	.component('sessionSignupCtrl', {
		templateUrl: '/units/session/signup.tmpl.html',
		controller: function($config, $location, $session) {
			var $ctrl = this;
			$ctrl.$config = $config;

			$ctrl.$config.layout = {
				headerNavbar: false,
				sidebar: false,
				isImportant: true
			}

			if ($session.data.isLoggedIn) return $location.path('/'); // Already logged in

			$ctrl.error;
			$ctrl.message; // If set the main email page is hidden and just this message is shown
			$ctrl.messageShowLogin = false; // Whether to show the login button in the message screen

			$ctrl.user = {
				username: '',
				email: '',
				password: '',
				name: '',
			};

			$ctrl.submit = function(isValid) {
				if ($config.session.signup.requireUsername && !$ctrl.user.username) {
					$ctrl.error = 'A username is required';
				} else if ($config.session.signup.requireName && !$ctrl.user.name) {
					$ctrl.error = 'Your name is required';
				} else if (!$ctrl.user.email) {
					$ctrl.error = 'Your email is required';
				} else if (!$ctrl.user.password) {
					$ctrl.password = 'A password is required';
				} else {
					$session.signup($ctrl.user)
						.then(()=> {
							if ($config.session.signup.loginImmediate) {
								debugger;
								return $session.login({
									username: $ctrl.user.username || $ctrl.user.email,
									password: $ctrl.user.password,
								});
							} else if ($config.session.signup.validateEmail) {
								$ctrl.message = 'Please check your email and click the link to verify your account';
								$ctrl.messageShowLogin = false;
							} else {
								$ctrl.message = 'Thanks for joining';
								$ctrl.messageShowLogin = true;
							}
						})
						.catch(err => $ctrl.error = _.get(err, 'data.error') || err.error || err || 'Could not login!')
				}
			};
		},
	});
