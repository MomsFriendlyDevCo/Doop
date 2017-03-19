/**
* MacGyver static label
* This is simple display of read-only text. The text content is loaded either from the data feed or the `config.text` property in that order
* @param {Object} config The config specification
* @param {string} [config.text] The text to display if the data feed does not provide it
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgLabel', {
		title: 'Read-only Label',
		icon: 'fa fa-font',
		config: {
			text: {type: 'mgText'},
		},
	}))
	.component('mgLabel', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function() {
			var $ctrl = this;
		},
		template: `
			<div class="form-control-static">{{$ctrl.data || $ctrl.config.text}}</div>
		`,
	})
