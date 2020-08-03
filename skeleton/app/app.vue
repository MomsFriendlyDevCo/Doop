<script>
/**
* Entry point file for Vue frontend
*/

// Global imports
import * as _ from 'lodash';


import './app.index.vue'; // Import all .vue files automatically from the index
// import '../**/*.vue'; // Import all .vue files automatically from the index


/**
* Global app object
* This is used as a wrapper for the active Vue instance and as a way of adding additional functionality to controllers etc. before they are passed to Vue
*/
globalThis.app = {
	/**
	* Main Vue instance
	* Calls to app.conteoller() and such are eventually routed here after checking for extra functionality such as 'route'
	* @type {VueApp}
	*/
	vue: Vue.createApp(),


	/**
	* Initialize or get a Vue controller
	* This is a thin wrapper around app.vue.controller() which glues on additional functionality
	* If the id is omitted it is computed from the vm.route parameter
	* @param {string} [id] The component ID
	* @param {Object} [spec] If specified declares the component specification, if omitted this function returns the existing component if any
	* @returns {VueComponent} The created / fetched VueComponent matching `id`
	*/
	controller: (id, spec) => {
		// Argument mangling {{{
		if (_.isObject(id)) {
			if (!spec.route) throw new Error('Calling app.controller(spec) without an ID must at least have vm.route');
			[id, spec] = [_.camelCase(spec.route), id];
		}
		// }}}
		console.log('DECLARE CONTROLLER', {id, spec});

		return app.vue.controller(id, spec);
	},


	/**
	* Initalize a Vue controller as a shared prototype
	* Services are glued onto the main app.vue.prototype{} and become available as `$serviceName` for all subsequent controllers
	* They act the same as controllers except they are always prefixed with `$` and available on all controllers
	* Calling with a function as a spec simply attaches the entire function as a service
	* @param {string} id The service ID, must begin with "$"
	* @param {*} [spec] If specified declares the service specification which can be of any time, if omitted this function returns the existing service definition if any
	* @returns {*} The created / fetched service matching `id`
	*/
	service: (id, spec) => {
		if (!id.startsWith('$')) throw new Error('All service IDs registered with app.service(id, spec) must begin with "$"');

		return app.vue.prototype[id] = spec;
	},


	ready: Promise.resolve(), // FIXME: Is this still needed?
};
</script>
