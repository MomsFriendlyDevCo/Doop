/**
* MacGyver text input
* @param {Object} config The config specification
* @param {boolean} [config.required=false] Whether this field is required
* @param {string} [config.placeholder] Placeholder text to display when the widget is empty
* @param {Date} [config.lengthMin] The minimum allowable length
* @param {Date} [config.lengthMax] The maximum allowable length
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgText', {
		title: 'Textbox',
		icon: 'fa fa-pencil-square-o',
		config: {
			lengthMin: {type: 'mgNumber', title: 'Minimum Length'},
			lengthMax: {type: 'mgNumber', title: 'Maximum Length'},
			placeholder: {type: 'mgText', help: 'Ghost text to display when the textbox has no value'},
			required: {type: 'mgToggle', default: false},
		},
	}))
	.component('mgText', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($macgyver, $scope) {
			var $ctrl = this;
			$macgyver.inject($scope, $ctrl);

			$ctrl.validate = ()=> [
				$ctrl.config.required && !$ctrl.data && `${$ctrl.config.title} is required`,
				$ctrl.config.lengthMin && _.isString($ctrl.data) && $ctrl.data.length < $ctrl.config.lengthMin && `${$ctrl.config.title} is too small (minimum length is ${$ctrl.config.lengthMin})`,
				$ctrl.config.lengthMax && _.isString($ctrl.data) && $ctrl.data.length > $ctrl.config.lengthMax && `${$ctrl.config.title} is too long (maximum length is ${$ctrl.config.lengthMax})`,
			];

			// Adopt default  if no data value is given {{{
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });
			// }}}
		},
		template: `
			<input ng-model="$ctrl.data" type="text" class="form-control" placeholder="{{$ctrl.config.placeholder}}"/>
		`,
	})
