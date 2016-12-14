angular
	.module('app')
	.run($router => $router.when('/showcase/:section?').title('Showcase').component('showcaseCtrl'))
	.component('showcaseCtrl', {
		templateUrl: '/units/showcase/showcase.tmpl.html',
		controller: function($animate, $config, $loader, $router, $scope, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
			$ctrl.$router = $router;

			// Jump to the right object ID if the $router.params.section changes
			$scope.$watch(_=> $router.params.section, function() {
				if ($router.params.section) $(document).scrollTop($('#' + $router.params.section.replace(/[^a-z0-9-]+/g, '_')).position().top - 100);
			});


			// Form content
			$ctrl.user = {
				enabled: true,
				name: 'Joe Random',
				role: 'admin',
				availability: {
					monday: true,
					tuesday: true,
					wednesday: false,
					thursday: true,
					friday: false,
					saturday: false,
					sunday: false,
				},
			};
			$ctrl.roles = [
				{id: 'user', title: 'User'},
				{id: 'admin', title: 'Admin'},
				{id: 'root', title: 'Root'},
			];


			// Animations
			$ctrl.animationEffects = [
				'bounce', 'flash', 'jello', 'pulse', 'rubberBand', 'shake', 'tada', 'swing', 'wobble',
				'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp',
				'bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp',
				'fadeIn', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig', 'fadeInUp', 'fadeInUpBig',
				'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig',
				'flip', 'flipInX', 'flipInY', 'flipOutX', 'flipOutY',
				'lightSpeedIn', 'lightSpeedOut',
				'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight',
				'rotateOut', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight',
				'zoomIn', 'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp',
				'zoomOut', 'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp',
				'hinge', 'rollIn', 'rollOut',
			];
			$ctrl.animate = effect => {
				var elem = angular.element('.animate-element');

				$animate.addClass(elem, effect)
					.then(_=> $animate.removeClass(elem, effect)) // Remove class again when we're done
			};
		},
	});
