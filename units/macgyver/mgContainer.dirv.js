/**
* MacGyver component loader
* This is a meta component that loads other dynamic components as an array
* @param {Object} config The config specification
* @param {array} config.items A collection of sub-item objects to display
* @param {boolean} [config.ignoreScope=false] If true any child item storage paths will not be prefixed by this items ID (e.g. a child item with the ID 'foo' will normally be set to '(whatever this ID is).foo' unless this option is true)
* @param {boolean} [config.items[].help] Optional help text to show under the element
* @param {boolean} [config.items[].ignoreScope=false] Whether this container effects the lexical path of the item being set - i.e. if enabled (the default) the saved item will use this containers ID in the path of the item to set, if disabled this container is effectively invisible
* @param {boolean} [config.items[].showTitle=true] Whether to show the left-hand-side form title for the item
* @param {string} [config.items[].title] Optional title to display for the widget
* @param {string} config.items[].type The type of the object to render. This corresponds to a `mg*` component
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgContainer', {
		title: 'Container',
		icon: 'fa fa-dropbox',
		isContainer: true,
		template: '<mg-container config="w" data="w.ignoreScope ? $ctrl.data : $ctrl.data[w.id]"></mg-container>', // Special template for containers to bypass scoping if ignoreScope is true
		config: {
			items: {type: 'array', default: []},
			ignoreScope: {type: 'mgToggle', default: false, title: 'Ignore Scope', help: 'Flatten the data scope with the parent level - i.e. dont nest any child element inside an object when saving data'},
		},
		configChildren: {
			help: {type: 'mgText', title: 'Help text', help: 'Optional help text for the item - just like what you are reading now'},
			showTitle: {type: 'mgToggle', default: true, title: 'Show Title', help: 'Whether to show the side title for this element'},
			title: {type: 'mgText', title: 'Title'},
		},
	}))
	.component('mgContainer', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function() {
			var $ctrl = this;
		},
		template: $macgyver =>
			'<div ng-repeat="w in $ctrl.config.items track by w.id" ng-switch="w.type" data-path="{{w.id}}" class="form-group" ng-class="w.mgValidation == \'error\' && \'has-error\'">' +
				'<label ng-if="w.showTitle || w.showTitle===undefined" class="col-sm-3 control-label">{{w.title}}</label>' +
				'<div ng-class="w.showTitle  || w.showTitle===undefined ? \'col-sm-9\' : \'col-sm-12\'">' +
					_.map($macgyver.widgets, w => `<div ng-switch-when="${w.id}">${w.template}</div>`).join('\n') +
					'<div ng-switch-default class="alert alert-danger">Unknown MacGyver widget type : "{{w.type}}"</div>' +
					'<div ng-if="w.help" class="help-block">{{w.help}}</div>' +
				'</div>' +
			'</div>'
		,
	})
