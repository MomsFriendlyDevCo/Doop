<script>
/**
* Extended version of the built in `<component/>` dynamic component that supports events and props and sanity checks
*
* @param {string} component The string name of a component
* @param {string} [component.component] The component name if passed a string, the component name is always camelCased
* @param {Object} [component.events] Event bindings as an object lookup
* @param {Object} [component.props] Prop bindings as an object lookup
*/
app.component('dynamicComponent', {
	props: {
		component: {
			type: String,
			required: true,
			validator: val => {
				var isValid = Vue.component(val);
				if (!isValid) console.error('Dynamic component', val, 'is not available via Vue.component()');
				return isValid;
			},
		},
		props: {type: Object},
		events: {type: Object},
	},
	render: function(h) {
		return h(this.$props.component, {
			props: this.$props.props,
			on: this.$props.events,
		});
	},
});
</script>
