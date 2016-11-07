angular
	.module('app')
	.controller('DebugCtrl', function($scope, $loader, $state, $toast) {
		var $ctrl = this;

		$ctrl.loaderStart = (id,asBackground) => $loader.start(id, asBackground);
		$ctrl.loaderStartBackground = id => $loader.startBackground(id);
		$ctrl.loaderStop = id => $loader.stop(id);
		$ctrl.$toast = $toast;
	});
