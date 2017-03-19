/**
* MacGyver text input
* @param {Object} config The config specification
* @param {boolean} [config.required=false] Whether this field is required
* @param {string} [config.placeholder] Placeholder text when the textbox is empty
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgEmail', {
		title: 'Textbox',
		icon: 'fa fa-envelope-o',
		config: {
			placeholder: {type: 'mgEmail', help: 'Ghost text to display when the text box has no value'},
			required: {type: 'mgToggle', default: false},
		},
	}))
	.component('mgEmail', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($macgyver, $scope) {
			var $ctrl = this;
			$macgyver.inject($scope, $ctrl);

			$ctrl.validate = ()=> [
				$ctrl.config.required && !$ctrl.data && `${$ctrl.config.title} is required`,
			];

			// Adopt default  if no data value is given {{{
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });
			// }}}
		},
		template: `
			<input ng-model="$ctrl.data" type="email" class="form-control" placeholder="{{$ctrl.config.placeholder}}"/>
		`,
	})
