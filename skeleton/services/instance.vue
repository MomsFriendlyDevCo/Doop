<service singleton>
/**
* Utility function to instantiate a Vue sub-component within the current component
*
* This fixes a few issues with Vue while attempting this:
*
* 	- The horrible constructor syntax
*	- Even though passing {props: ...} when constructing a component it don't seem to get populated into vm.$props
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
module.exports = function() {
	var $instance = function $instance(as, name, props, options) {
		var settings = {
			singleton: false,
			rebuild: false,
			...options,
		};

		// Argument mangling {{{
		if (typeof as == 'string' && typeof name == 'string') { // Called with all args
			// Pass
		} else if (typeof as == 'string' && typeof name != 'string') { // Omitted 'name'
			[as, name, props, options] = [as, as, name, props];
		} else {
			throw new Error('Unknown call method');
		}
		// }}}


		if (!settings.rebuild && Vue.singletons && Vue.singletons[name]) { // Do we already have a singleton registered with this name - if so use that?
			return this[as] = Vue.singletons[name];
		}


		// Create the component instance using the bloody awful instantiation syntax
		this[as] = new (Vue.component(name))({
			props, // This doesn't get populated anyway but it at least keeps Vue happy that required props validate
		});

		if (settings.singleton || this[as].$options.singleton) {
			if (!Vue.singletons) Vue.singletons = {};
			Vue.singletons[name] = this[as];
		}

		// Copy all props over into the incorrectly setup component instance
		Object.keys(props || {}).forEach(key => this[as].$props[key] = props[key]);

		return this[as];
	};


	/**
	* Remove a singleton instance
	* Since singletons are not cleaned up with the component destruction this needs to be called somewhere in the component lifecycle to clean up garbage
	* @param {string} name The name of the singleton to remove
	*/
	$instance.destroy = function $instanceRemove(name) {
		if (Vue.singletons && Vue.singletons[name])
			delete Vue.singletons[name];
	};


	return $instance;
};
</service>
