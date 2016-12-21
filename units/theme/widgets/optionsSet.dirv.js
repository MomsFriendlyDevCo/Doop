/**
* Simple widget to display a set of options from a collection as a btn-group list
* The given value button will be highlighted
* This assumes a collection with at least a 'id' + 'title' field and that the value is the ID
*
* @param {array} set The collection of items to iterate over. This MUST contain 'id' + 'title' and can optionally also contain 'tooltip'
* @param {mixed} value The value of the currently selected ID
*
* @example
* # In the controller
* $ctrl.myValue = 'bar';
* $ctrl.mySet = [ {id: 'foo', title: 'Foo'}, {id: 'bar', title: 'Bar'},{id: 'baz', title: 'Baz'} ]
*
* # In the view
* <options-set set="$ctrl.mySet" value="$ctrl.myValue"></options-set>
*/
angular
	.module('app')
	.component('optionsSet', {
		bindings: {
			set: '<',
			value: '=',
		},
		template: `
			<div class="btn-group">
				<a
					ng-repeat="i in ::$ctrl.set"
					ng-click="$ctrl.value=i.id"
					class="btn btn-sm"
					ng-class="$ctrl.value == i.id ? 'btn-primary' : 'btn-default'"
					tooltip="{{i.tooltip}}"
				>{{::i.title}}</a>
			</div>
		`,
		controller: function() {
			var $ctrl = this;
		},
	});
