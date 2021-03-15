<script lang="js" frontend>
/**
* Extended version of the built in `<script lang="js" frontend>` dynamic component that supports events and props and sanity checks
*
* @param {string} component The string name of a component
* @param {string} [component.component] The component name if passed a string, the component name is always camelCased
* @param {Object} [component.events] Event bindings as an object lookup
* @param {Object} [component.props] Prop bindings as an object lookup
*
* NOTE: This component exposes a single ref `component` which is the dynamically loaded component
*/
app.component('dynamicComponent', {
	props: {
		component: {
			type: String,
			required: true,
			validator: val => {
				var isValid = app.component(val);
				if (!isValid) console.error('Dynamic component', val, 'is not available via app.component()');
				return isValid;
			},
		},
		props: {type: Object},
		events: {type: Object},
	},
	render: function(h) {
		// TODO: Could this use functional pattern with passing through context?
		return h(this.$props.component, {
			ref: 'component',
			props: this.$props.props,
			on: this.$props.events,
		});
	},
});
</script>
