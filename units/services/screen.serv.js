/**
* Service which guesses the screen display area based on window.resize events
* This service returns a number of simple variables such as:
*
* 	$screen.is{XS,SM,MD,LG} - Booleans indicating if this screen size corresponds to the minimum Bootstrap definition of width (e.g. isXS =~ mobile, isMD = is at least a small screen)
*	$screen.size - String indicating the minimum Bootstrap definition of size (e.g. 'md', 'lg')
*
* @author Matt Carter <m@ttcarter.com>
* @date 2017-04-22
*/
angular
	.module('app')
	.service('$screen', function($rootScope) {
		var $screen = {};

		$screen.isXS;
		$screen.isSM;
		$screen.isMD;
		$screen.isLG;
		$screen.size;

		var recalculate = ()=> {
			var width = $(document).width();
			$screen.isXS = width < 768;
			$screen.isSM = width < 992;
			$screen.isMD = width < 1200;
			$screen.isLG = width >= 1200;

			$screen.size =
				$screen.isXS ? 'xs'
				: $screen.isSM ? 'sm'
				: $screen.isMD ? 'md'
				: 'lg';
		};

		angular.element(window).on('resize', ()=> $rootScope.$apply(recalculate));

		recalculate(); // Trigger initial calculation

		return $screen;
	});
