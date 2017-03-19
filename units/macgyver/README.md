MacGyver
========
Dynamic form widgets for Angular.

MacGyver is a form designer for Angular that works by being given a form definition and a data set.


Example
-------
```javascript
angular
	.module('app')
	.component('myComponent', {
		controller: function() {
			var $ctrl = this;

			$ctrl.data = {}; // This will be populated by MacGyver

			$ctrl.form = { // Our form specification
				type: "mgContainer",
				items: [
					{
						id: "textInput",
						type: "mgText",
						title: "Example Text",
					},
					{
						id: "toggleControl",
						type: "mgToggle",
						default: true,
					},
				],
			};
		},
		template: `
			<mg-form config="$ctrl.form" data="$ctrl.data"></mg-form>
		`,
	});
```

Editing a form
--------------
MacGyver also ships with a form editor. To use simply make a HTML page with the `mgFormEditor` component for an interactive UI.

```html
<mg-form-editor config="$ctrl.form" data="$ctrl.data"></mg-form-editor>
```



API Methods
===========
MagGyver works by using Angular's template system to nest widgets with two-way data binding.


Creating MacGyver widgets
-------------------------
Each MagGyver widget begins with `mg` and should be registered via `$macgyver.register()`.

```javascript
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgText', {
		title: 'Textbox',
		icon: 'fa fa-pencil-square-o',
		config: {
			placeholder: {type: 'mgText', help: 'Ghost text to display when the textbox has no value'},
		},
	}))
	.component('mgText', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($macgyver, $scope) {
			var $ctrl = this;
			$macgyver.inject($scope, $ctrl);

			// Adopt default if no data value is given
			$scope.$watch('$ctrl.data', ()=> { if (_.isUndefined($ctrl.data) && _.has($ctrl, 'config.default')) $ctrl.data = $ctrl.config.default });

			// Optionally respond to validation requests
			$ctrl.validate = ()=> {
				if ($ctrl.config.required && !$ctrl.data) return `${$ctrl.config.title} is required`;
			};
		},
		template: `
			<input ng-model="$ctrl.data" type="text" class="form-control" placeholder="{{$ctrl.config.placeholder}}"/>
		`,
	})
```


$macgyver
---------
The main service / provider within Angular.

**NOTE:** `$macgyverProvider` and `$macgyver` are the same. The provider is available as an alias to allow registration of components during the Angular Config phase.


$macgyver.register(id, [properties])
------------------------------------
Register a widget for use by name. Each id should begin with `id` and be in camelCase form.

Properties can contain an optional `title`, `icon` and a `config` object detailing the options available for that widget.


$macgyver.getForm($scope)
-------------------------
Finds and returns the component scope of the first available form under the given scope.


$macgyver.inject($scope, $ctrl)
-------------------------------
Function used by MacGyver components to register themselves against the standard event hooks during initialization.


$macgyver.getDataTree(root, [useDefaults=false])
------------------------------------------------
Generate an empty data entity from a given widget container. This function can be used to return the 'blank' form contents. If `useDefaults == true` the defaults for each widget will be set as the value.


API Events
==========
MacGyver components are also expected to optionally respond to the following events:

mg.get(event, register)
-----------------------
Used by MacGyver to 'ping' controls. Each control is expected to populate the register object with its ID and `$ctrl` instance.
This event is automatically responded to if the component calls `$macgyver.inject()` during its init cycle. If the component does not respond higher-level events such as validation will not be able to reach the component.


mg.getForm(event, form)
-----------------------
Used by MacGyver during `$macgyver.getForm()` calls to retrieve the forms under the scope.
The responding form is expected to populate the `form.form` object with its controller instance.
