angular
	.module('app')
	.provider('$macgyver', function() {
		this.widgets = {};

		/**
		* Add a known widget to the widgets lookup object
		* @param {string} id The unique ID of the widget to add
		* @param {Object} [properties] Optional properties of the widget to add
		* @param {boolean} [properties.isContainer] Indicates that the widget can contain other widgets (under the `items` array)
		* @param {boolean} [properties.isContainerArray] Addition to `isContainer` that indicates the widget will contain an array of rows (like a table)
		* @param {string} [properties.title=id] Optional human readable title of the widget
		* @param {string} [properties.template] Rendering template to be used to draw the element (`w` is the currently rendering widget within the template i.e. `w.id` is the widget ID)
		* @param {string} [properties.icon] Optional icon to display in the form editor
		* @param {Object} [properties.config] Optional list of configuration the widget takes, this is in the form of a MacGyver item collection
		*/
		this.register = function(id, properties) {
			this.widgets[id] = properties || {};
			this.widgets[id].id = id;

			var domName = _.kebabCase(id);
			_.defaults(this.widgets[id], {
				template: `<${domName} config="w" data="$ctrl.data[w.id]"></${domName}>`,
				title: _.startCase(id),
			});

			return this;
		};


		/**
		* Generate an empty prototype tree from a form layout
		* @params {array} layout The root node to generate from
		* @params {boolean} [useDefaults] Whether to adopt control defaults when generating the tree
		*/
		this.getDataTree = function(root, useDefaults) {
			if (!root) {
				console.warn('Empty MacGyver form tree');
			} else if (!this.widgets[root.type]) {
				console.warn('Unknown widget type "' + root.type + '" for item ID "' + root.id + '" - assuming is not a container');
				return (useDefaults ? root.default : null);
			} else if (this.widgets[root.type].isContainer && !this.widgets[root.type].isContainerArray) {
				return _(root.items)
					.mapKeys('id')
					.mapValues(i => this.getDataTree(i))
					.value();
			} else if (this.widgets[root.type].isContainer && this.widgets[root.type].isContainerArray) {
				return [
					_(root.items)
						.mapKeys('id')
						.mapValues(i => this.getDataTree(i))
						.value()
				];
			} else {
				return (useDefaults ? root.default : null);
			}
		};


		/**
		* Returns the first found form under a scope
		* @param {Object} $scope The scope of the calling component
		* @example
		* // In a controller / component
		* $macgyver.getForm($scope);
		* // => The scope instance of the form (i.e. the inside of the mg-form component)
		*/
		this.getForm = function($scope) {
			// Make an empty object, broadcast and expect the first reciever to populate the `form` key which we can then use to reference the form
			var form = {};
			$scope.$broadcast('mg.getForm', form);
			return form.form;
		};


		/**
		* Returns an object where each key is the ID of the MacGyver component with the value being the component controller
		* @param {Object} $scope The scope of the calling component
		* // In a controller / component
		* $macgyver.getAll($scope);
		* // => {foo: <fooController>, bar: <barController>, ...}
		*/
		this.getAll = function($scope) {
			var components = {};
			$scope.$broadcast('mg.get', components);
			return components;
		};


		/**
		* Inject various life-cycle hooks into a component that doesnt want to have to manage them itself
		* This really just takes care of the unit responding to the 'mg.get' event at present
		* @example
		* // In a controller / component
		* $macgyver.inject($scope, $ctrl);
		*/
		this.inject = function($scope, $ctrl) {
			$scope.$on('mg.get', (e, c) => c[$ctrl.config.id] = $ctrl);
		};


		/**
		* Angular nonsense function to get this instance
		*/
		this.$get = function() {
			return this;
		};
	});
