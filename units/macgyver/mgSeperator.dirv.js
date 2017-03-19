/**
* MacGyver horizontal seperator
* @param {Object} config The config specification
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgSeperator', {
		title: 'Seperator',
		icon: 'fa fa-minus',
	}))
	.component('mgSeperator', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($scope) {
			var $ctrl = this;
		},
		template: `
			<hr/>
		`,
	})
