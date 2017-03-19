/**
* MacGyver alert box
* @param {Object} config The config specification
* @param {string} [config.text] The text to display in the alert if data is falsy
* @param {string} [config.style='alert-info'] The style of alert box to display. Enum of 'info', 'success', 'warning', 'danger'
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgAlert', {
		title: 'Alert Box',
		icon: 'fa fa-exclamation-triangle',
		config: {
			text: {type: 'mgText', default: 'This is an alert!'},
			style: {
				type: 'mgChoiceButtons',
				default: 'alert-info',
				iconSelected: 'fa fa-fw fa-check',
				iconDefault: 'fa fa-fw',
				enum: [
					{id: 'alert-success', class: 'btn-success'},
					{id: 'alert-info', class: 'btn-info'},
					{id: 'alert-warning', class: 'btn-warning'},
					{id: 'alert-danger', class: 'btn-danger'},
				],
			},
		},
	}))
	.component('mgAlert', {
		bindings: {
			config: '<',
		},
		controller: function($scope) {
			var $ctrl = this;
		},
		template: `
			<div class="alert" ng-class="$ctrl.config.style">{{$ctrl.config.text || $scope.data}}</div>
		`,
	})
