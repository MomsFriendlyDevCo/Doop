<script lang="js" frontend>
// TODO: This is dependancy of @doop/search but currently must be included at project level. it seems bigger than @doop/search and should exist in it's own package where both or either can require it.
/**
* Extended version of the built in `<script lang="js" frontend>` dynamic component that supports events and props and sanity checks
*
* @param {string} [component] The component name if passed a string (the component name is always camelCased so you can pass in dotted, kebab case of any other varient)
* @param {Object} [events] Event bindings as an object lookup
* @param {Object} [props] Prop bindings as an object lookup
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
		return h(this.$props.component, {
			ref: 'component',
			props: this.props,
			on: this.events,
		});
	},
});
</script>
