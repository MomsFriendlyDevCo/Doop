/**
* MacGyver time input
* @param {Object} config The config specification
* @param {boolean} [config.required=false] Whether this field is required
* @param {Date} [config.lengthMin] The minimum allowable time
* @param {Date} [config.lengthMax] The maximum allowable time
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgTime', {
		title: 'Time Selection',
		icon: 'fa fa-clock-o',
		config: {
			min: {type: 'mgTime', title: 'Earliest time'},
			max: {type: 'mgNumber', title: 'Latest time'},
			required: {type: 'mgToggle', default: false},
		},
	}))
	.component('mgTime', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($macgyver, $scope) {
			var $ctrl = this;
			$macgyver.inject($scope, $ctrl);

			$ctrl.validate = ()=> [
				$ctrl.config.required && !$ctrl.data && `${$ctrl.config.title} is required`,
				$ctrl.config.min && _.isString($ctrl.data) && $ctrl.data < $ctrl.config.min && `${$ctrl.config.title} is too early (earliest time is ${$ctrl.config.min})`,
				$ctrl.config.max && _.isString($ctrl.data) && $ctrl.data > $ctrl.config.max && `${$ctrl.config.title} is too late (latest time is ${$ctrl.config.max})`,
			];

			// Adopt default  if no data value is given {{{
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });
			// }}}
		},
		template: `
			<input ng-model="$ctrl.data" type="time" class="form-control"/>
		`,
	})
