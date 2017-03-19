/**
* MacGyver Signature directive
* FIXME: Under construction - this widget currently just displays a fancy rectangle
* @param {Object} config The config specification
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgSignature', {
		title: 'Signature Input',
		icon: 'fa fa-picture-o',
		config: {
		},
	}))
	.component('mgSignature', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function() {
			var $ctrl = this;

			$ctrl.clicked = ()=> alert('This doesnt do anything yet');
		},
		template: `
			<div ng-click="$ctrl.clicked()" class="form-control-static"></div>
		`,
	})
