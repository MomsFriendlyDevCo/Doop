/**
* MacGyver selector of an item from a list of enums
* @param {Object} config The config specification
* @param {array} [config.enum] A collection of items to choose from, each must be an object with at least an 'id'. If this is an array of strings it will be traslated into a collection automatically
* @param {string} [config.url] A URL to a collection. This replaces config.enum if specified.
* @param {string} [config.textPrompt] The prompt to display in the select box
* @param {string} [config.textInnerPrompt] The prompt to display when searching
* @param {string} [config.displayPrimaryField] The main field data to display, mapped from the collection provided in config.enum
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgChoiceDropdown', {
		title: 'Multiple-choice (Dropdown)',
		icon: 'fa fa-chevron-circle-down',
		config: {
			url: {type: 'mgUrl', help: 'Data feed URL'},
			enum: {
				type: 'array',
				title: 'The list of items to display',
				default: [
					{id: 'foo', title: 'Foo'},
					{id: 'bar', title: 'Bar'},
					{id: 'baz', title: 'Baz'},
				],
			},
			textPrompt: {type: 'mgText', default: 'Choose an item...'},
			textInnerPrompt: {type: 'mgText', default: 'Select an item...'},
			displayPrimaryField: {type: 'mgText', default: 'title', help: 'The field of each enum item to display as the primary selection text'},
			displaySecondaryField: {type: 'mgText', help: 'The field of each enum to display as a secondary item'},
		},
	}))
	.component('mgChoiceDropdown', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($http, $scope) {
			var $ctrl = this;

			// Translate $ctrl.enum -> $ctrl.enumIter (convert arrays of strings for example) {{{
			$ctrl.enumIter = []; // Cleaned up version of enum
			$scope.$watch('$ctrl.config.enum', ()=> {
				if (!$ctrl.config.enum) return; // No data yet
				if (_.isArray($ctrl.config.enum) && _.isString($ctrl.config.enum[0])) { // Array of strings
					$ctrl.enumIter = $ctrl.config.enum.map(i => ({id: i}));
				} else if (_.isArray($ctrl.config.enum) && _.isObject($ctrl.config.enum[0])) { // Collection
					$ctrl.enumIter = $ctrl.config.enum;
				}
			});
			// }}}
			// Go fetch the URL contents if $ctrl.config.url is set {{{
			$scope.$watch('$ctrl.url', ()=> {
				if (!$ctrl.config.url) return; // No URL to pull
				$http.get($ctrl.config.url)
					.then(res => $ctrl.enumIter = res.data.map(i => {
						if (i._id) { // Remap _id => id
							i.id = i._id;
							delete i._id;
						}
						return i;
					}))
			});
			// }}}
			// Adopt default if no data value is given {{{
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });
			// }}}
		},
		template: `
			<ui-select ng-model="$ctrl.data" title="{{$ctrl.config.textPrompt || 'Choose an item...'}}">
				<ui-select-match placeholder="{{$ctrl.config.textInnerPrompt || 'Select an item...'}}">{{$select.selected[$ctrl.config.displayPrimaryField || 'title']}}</ui-select-match>
				<ui-select-choices repeat="item.id as item in $ctrl.enumIter | filter:$select.search track by item.id" group-by="$ctrl.config.groupBy">
					<div ng-bind-html="item[$ctrl.config.displayPrimaryField || 'title'] | highlight:$select.search"></div>
					<small ng-if="$ctrl.config.displaySecondaryField" ng-bind-html="item[$ctrl.config.displaySecondaryField] | highlight:$select.search"></small>
				</ui-select-choices>
			</ui-select>
		`,
	})
