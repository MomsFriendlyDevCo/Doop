/**
* Generic error display screen
* This component displays a large error message with a title, message and some buttons
* You can either redirect here via:
*
* 	$location.path('/error/SOME-ERROR-CODE')
*
* Or using the router if you wish to preserve the URL (better for 404's)
*
*	$router.go('/error/SOME-ERROR-CODE')
*
* NOTE: Change the $ctrl.types collection to specify more errors
*/
angular
	.module('app')
	.run($router => $router.when('/error/:type?')
		.title('Error')
		.component('errorCtrl')
	)
	.run(($router, $session) => $router.rule()
		.priority('lowest')
		.require($session.promise.login)
		.title('Error')
		.params('type', 404)
		.component('errorCtrl')
	)
	.component('errorCtrl', {
		templateUrl: '/units/errors/error.tmpl.html',
		controller: function($router, $config) {
			var $ctrl = this;
			$ctrl.$config = $config;

			$ctrl.$config.layout = {
				headerNavbar: false,
				sidebar: false,
				isImportant: true
			}

			$ctrl.types = {
				'404': {
					code: '404',
					title: 'PAGE NOT FOUND',
					message: 'The page you are looking for does not exist. You may have mistyped the address or the page may have moved.',
					allowBack: false
				},
				'500': {
					code: '500', title: 'SOMETHING WENT WRONG',
					message: 'Something went wrong in your process and we are working on fixing it.',
					allowBack: false
				}
			};

			$ctrl.error = _.defaults(_.get($ctrl.types, $router.params.type, {}), {
				message: 'An error has occured',
				title: 'Whoops!',
				allowBack: true,
				allowHome: true,
			});
		},
	});
