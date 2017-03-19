/**
* MacGyver selector of an item from a small list of enums
* @param {Object} config The config specification
* @param {array} config.enum A collection of items to choose from, each must be an object with at least an 'id'. If this is an array of strings it will be traslated into a collection automaitcally
* @param {string} [config.enum[].class] Optional class to display per item, if omitted the item ID is used
* @param {string} [config.enum[].icon] Optional icon to display for each item
* @param {string} [config.enum[].iconSelected] Icon to display for each item when item is selected
* @param {string} [config.enum[].title] Optional title to display within each element
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgChoiceRadio', {
		title: 'Multiple-choice (Radio)',
		icon: 'fa fa-check-circle',
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
		},
	}))
	.component('mgChoiceRadio', {
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
			<div class="radio" ng-repeat="item in $ctrl.enumIter track by item.id">
				<label>
					<input ng-model="$ctrl.data" type="radio" name="{{$ctrl.config.id}}" value="{{item.id}}"/>
					{{item.title}}
				</label>
			</div>
		`,
	})
