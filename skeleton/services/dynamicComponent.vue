<component>
/**
* Extended version of the built in `<component/>` dynamic component that supports events and props as well as being backwards-compatible with the Vue version
*
* NOTE: Because of Vue reserved words `:is` -> `:component`
*
* @param {string|Object} component Either the string name of a component or the object definition below
* @param {string} [component.component] The component name if passed a string
* @param {Object} [component.on] Event bindings as an object lookup
* @param {Object} [component.props] Prop bindings as an object lookup
*/
module.exports = {
	props: {
		component: {type: [Object, String], required: true},
	},
	render: function(h) {
		var settings = {
			component: typeof this.$props.component == 'string' ? this.$props.component : this.$props.component.component,
			on: {},
			props: {},
			...(_.isPlainObject(this.$props.component) ? this.$props.component : null),
		};

		return h(settings.component, {
			props: settings.props,
			on: settings.on,
		});
	},
};
</component>
