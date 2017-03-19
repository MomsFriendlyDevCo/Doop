/**
* MacGyver toggle
* @param {Object} config The config specification
* @param {string} [config.onText='On'] The text to display when the widget has a true value
* @param {string} [config.offText='Off'] The text to display when the widget has a false value
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgToggle', {
		title: 'Switch',
		icon: 'fa fa-toggle-on',
		config: {
			onText: {type: 'mgText', default: 'On'},
			offText: {type: 'mgText', default: 'Off'},
		},
	}))
	.component('mgToggle', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($scope) {
			var $ctrl = this;
			// Adopt default if no data value is given {{{
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });
			// }}}
		},
		template: `
			<div class="btn-group">
				<a ng-click="$ctrl.data = !$ctrl.data" class="btn" ng-class="!$ctrl.data ? 'btn-danger' : 'btn-default'">{{$ctrl.config.offText || 'Off'}}</a>
				<a ng-click="$ctrl.data = !$ctrl.data" class="btn" ng-class="$ctrl.data ? 'btn-success' : 'btn-default'">{{$ctrl.config.onText || 'On'}}</a>
			</div>
		`,
	})
