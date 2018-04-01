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
		.requires($session.promise.login)
		.title('Error')
		.params('type', 404)
		.component('errorCtrl')
	)
	.component('errorCtrl', {
		templateUrl: '/units/core.errors/error.tmpl.html',
		controller: function($router) {
			var $ctrl = this;

			$ctrl.types = {
				'404': {title: '404', message: 'Page not found', allowBack: false},
			};

			$ctrl.error = _.defaults(_.get($ctrl.types, $router.params.type, {}), {
				message: 'An error has occured',
				title: 'Whoops!',
				allowBack: true,
				allowHome: true,
			});
		},
	});
