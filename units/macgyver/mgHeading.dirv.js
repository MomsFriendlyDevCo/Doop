/**
* MacGyver static header
* This is simple display of heading level text. The text content is loaded either from the data feed or the `config.text` property in that order
* @param {Object} config The config specification
* @param {string} [config.text] The text to display if the data feed does not provide it
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgHeading', {
		title: 'Heading',
		icon: 'fa fa-header',
		config: {
			text: {type: 'mgText'},
		},
	}))
	.component('mgHeading', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function() {
			var $ctrl = this;
		},
		template: `
			<legend class="form-control-static">{{$ctrl.data || $ctrl.config.text}}</legend>
		`,
	})
