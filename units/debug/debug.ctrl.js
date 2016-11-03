angular
	.module('app')
	.controller('DebugCtrl', function($scope, $loader, $state, ToastsServ) {
		var $ctrl = this;

		$ctrl.loaderStart = (id,asBackground) => $loader.start(id, asBackground);
		$ctrl.loaderStartBackground = id => $loader.startBackground(id);
		$ctrl.loaderStop = id => $loader.stop(id);
		$ctrl.ToastsServ = ToastsServ;
	});
