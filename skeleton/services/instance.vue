<service singleton>
/**
* Utility function to instanciate a Vue sub-component within the current component
*
* This fixes a few issues with Vue while attmpting this:
*
* 	- The horrible constructor syntax
*	- Even though passing {props: ...} when constructing a component it don't seem to get populated into vm.$props
*
* @param {string} as What to add the component as within the vm
* @param {string} [name] The real name of the component, if omitted the 'as' value is used
* @param {Object} [props] Properties to populate when creating the instance
*/
module.exports = function() {
	return function(as, name, props) {
		// Argument mangling {{{
		if (typeof as == 'string' && typeof name == 'string') { // Called with all args
			// Pass
		} else if (typeof as == 'string' && typeof name != 'string') { // Omitted 'name'
			[as, name, props] = [as, as, name];
		} else {
			throw new Error('Unknown call method');
		}
		// }}}

		// Create the component instance using the bloody awful syntax
		this[as] = new (Vue.component(name))({
			props, // This doesn't get populated anyway but it at least keeps Vue happy that required props validate
		});

		// Copy all props over into the incorrectly setup component instance
		Object.keys(props || {}).forEach(key => this[as].$props[key] = props[key]);

		return this[as];
	};
};
</service>
