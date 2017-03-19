/**
* MacGyver selector of an item from a small list of enums
* @param {Object} config The config specification
* @param {array} config.enum A collection of items to choose from, each must be an object with at least an 'id'. If this is an array of strings it will be traslated into a collection automaitcally
* @param {string} [config.enum[].class] Optional class to display per item, if omitted the item ID is used
* @param {string} [config.enum[].icon] Optional icon to display for each item
* @param {string} [config.enum[].iconSelected] Icon to display for each item when item is selected
* @param {string} [config.enum[].title] Optional title to display within each element
* @param {string} [config.itemIconDefault='fa fa-fw'] Default item to use per item (unless an override is present in the item object)
* @param {string} [config.itemIconSelected='fa fa-check fa-lg'] Icon to use when item is selected
* @param {string} [config.itemClassDefault='btn-default'] Default item class to use per item (unless an override is present in the item object)
* @param {string} [config.itemClassSelected='btn-primary'] Item class to use when item is selected
* @param {string} [config.classWrapper='btn-group'] The class definition of the outer widget element
* @param {string} [config.classItem='btn'] The class definition of each item (as well as each items id
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgChoiceButtons', {
		title: 'Multiple-choice (Buttons)',
		icon: 'fa fa-check-square',
		config: {
			enum: {
				type: 'array',
				title: 'The list of items to display',
				default: [
					{id: 'foo', title: 'Foo'},
					{id: 'bar', title: 'Bar'},
					{id: 'baz', title: 'Baz'},
				],
			},
			classWrapper: {type: 'mgText', default: 'btn-group', title: 'Group CSS class'},
			classItem: {type: 'mgText', default: 'btn', title: 'Item CSS class'},
			itemIconDefault: {type: 'mgText'},
			itemIconSelected: {type: 'mgText'},
			itemClassDefault: {type: 'mgText', default: 'btn-default'},
			itemClassSelected: {type: 'mgText', default: 'btn-primary'},
		},
	}))
	.component('mgChoiceButtons', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($scope) {
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
			// Adopt default if no data value is given {{{
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });
			// }}}
		},
		template: `
			<div ng-class="$ctrl.config.classWrapper || 'btn-group'">
				<div ng-repeat="item in $ctrl.enumIter track by item.id" ng-class="[$ctrl.config.classItem || 'btn', item.class || ($ctrl.data == item.id ? $ctrl.config.itemClassSelected  || 'btn-primary': $ctrl.config.itemClassDefault)]" ng-click="$ctrl.data = item.id">
					<i ng-class="$ctrl.data == item.id ? (item.iconSelected || $ctrl.config.iconSelected) : (item.icon || $ctrl.config.iconDefault)"></i>
					{{item.title}}
				</div>
			</div>
		`,
	})
