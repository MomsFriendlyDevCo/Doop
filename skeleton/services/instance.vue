<script lang="js" frontend>
/**
* Utility function to instantiate a Vue sub-component within the current component
*
* This fixes a few issues with Vue while attempting this:
*
* 	- The horrible constructor syntax
*	- Correction of props -> propsData when creating
*       - Support for shared singleton instances (set `vm.{singleton: true}`) which are setup once and only once
*
* @param {string} as What to add the component as within the vm
* @param {string} [name] The real name of the component, if omitted the 'as' value is used
* @param {Object} [props] Properties to populate when creating the instance
* @param {Object} [options] Additional options when building
* @param {boolean} [options.singleton=false] Force the object to be treated as a singleton
* @param {boolean} [options.rebuild=false] Force the object to rebuild even if it is a singleton, this is useful if the singleton has inherited proprieties that need renewing
*
* @param {boolean} [vm.singleton=false] If present on the instantiated component (or as options.singleton) this indicates that only the first version of the instance should be used, all other $instance calls will reuse this single pointer
*/
app.mixin({
	beforeCreate() {
		this.$instance = function $instance(as, name, props, options) {
			// Argument mangling {{{
			if (typeof as == 'string' && typeof name == 'string') { // Called with all args
				// Pass
			} else if (typeof as == 'string' && typeof name != 'string') { // Omitted 'name'
				[as, name, props, options] = [as, as, name, props];
			} else {
				throw new Error('Unknown call method');
			}
			// }}}

			var settings = {
				singleton: false,
				rebuild: false,
				...options,
			};

			if (!settings.rebuild && app.singletons && app.singletons[name]) { // Do we already have a singleton registered with this name - if so use that?
				return this[as] = app.singletons[name];
			}


			var component = app.component(name);
			if (!component) throw new Error(`Unknown component "${name}" when initalizing via $instance`);

			// Create the component instance using the bloody awful instantiation syntax
			this[as] = new component({
				propsData: props,
			});

			// Register this component as a singleton?
			if (settings.singleton || this[as].$options.singleton) {
				if (!app.singletons) app.singletons = {};
				app.singletons[name] = this[as];
			}

			return this[as];
		};


		/**
		* Remove a singleton instance
		* Since singletons are not cleaned up with the component destruction this needs to be called somewhere in the component lifecycle to clean up garbage
		* @param {string} name The name of the singleton to remove
		*/
		this.$instance.destroy = function $instanceRemove(name) {
			if (app.singletons && app.singletons[name])
				delete app.singletons[name];
		};
	},
});
</script>
