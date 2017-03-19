/**
* MacGyver static HTML
* This is simple display of HTML content
* @param {Object} config The config specification
* @param {string} [config.text] The HTML content to display if the data feed does not provide it
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgHtml', {
		title: 'Read-only HTML',
		icon: 'fa fa-html5',
		config: {
			text: {type: 'mgHtml'},
		},
	}))
	.component('mgHtml', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function() {
			var $ctrl = this;
		},
		template: `
			<div class="form-control-static" ng-bind-html="$ctrl.data || $ctrl.config.text"></div>
		`,
	})
