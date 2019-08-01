/**
* Simple asset getter / setter
* @name Vue.assets
* @var {Object}
*/
Vue.assets = {
	/**
	* Holder for all cached assets
	* Each key is the type of asset being stored with the subkey as the name
	* @var {Object <Object}}
	*/
	$assets: {
		macgyver: {},
		routes: [], // {path <string>, component <string>}
		services: {
			$emit: Vue.prototype.$emit,
			$on: Vue.prototype.$on,
		},
		serviceContexts: {}, // Contexts used by each service - so we can glue late-loading services to them later (only applies to singletons)
		templates: {},
	},


	/**
	* Thin wrapper around Vue.component() that adds `route` support
	* @alias Vue.component
	*/
	component: (id, config) => {
		if (config && config.route) Vue.assets.$assets.routes.push({path: config.route, component: id});
		Vue.component(id, config);
	},


	/**
	* Thin wrapper around Vue.directive() that may add some extra magic in the future
	* @alias Vue.directive
	*/
	directive: (id, config) => Vue.directive(id, config),


	/**
	* Thin wrapper around Vue.filter() that may add some extra magic in the future
	* @alias Vue.filter
	*/
	filter: (id, config) => Vue.filter(id, config),


	/**
	* Register an object as a global Vue service
	* A service is a shared object which can be accessed with Vue.assets.service(id) or as vm.$service
	* NOTE: Anything declared here is also available from Vue.services(){}
	* @param {string} id The name of the service to register. This should always include the '$' prefix
	* @param {Object} [config] The object to register as the service return. If omitted this function acts as a getter.
	* @param {Object} [options] Additional options to pass
	* @param {boolean} [options.defer=false] Only intitalize the service when Vue and all plugins have finished loading, rather than when called
	* @param {boolean} [options.singleton=false] If truthy the config payload will be evaluated before being set, use this to initalize object classes on set. Called as `(Vue)`
	*/
	service: (id, config, options) => {
		if (!id.startsWith('$')) throw new Error(`All service registration and queries should have a '$' prefix. Given '${id}'`);
		if (!config) return Vue.assets.$assets.services[id]; // Use as lookup

		var settings = {
			defer: false,
			singleton: false,
			...options,
		};

		var context = {...Vue.assets.$assets.services};

		// Register global holder
		if (settings.singleton && settings.defer) {
			Vue.assets.$assets.services[id] = {}; // Setup base image
			app.lifecycle.$on('services', ()=> {
				Object.assign(Vue.assets.$assets.services[id], config.call(context, context));
			});
		} else if (settings.singleton) {
			Vue.assets.$assets.serviceContexts[id] = context; // Store context so we can extend it later
			Vue.assets.$assets.services[id] = config.call(context, context);
		} else {
			Vue.assets.$assets.services[id] = config;
		}

		// Register within vm prototype
		Vue.use({
			install() {
				Vue.prototype[id] = Vue.assets.$assets.services[id];
			},
		});
	},


	/**
	* Register a globally available template
	* @param {string} id The name of the template to register
	* @param {string} [template] The template string to store. If omitted this function acts as a getter
	*/
	template: (id, template) => {
		if (!template) return Vue.assets.$assets.templates[id]; // Use as lookup

		Vue.assets.$assets.templates[id] = template;
	},


	/**
	* Register a MacGyver widget
	* @param {string} id The name of the MacGyver widget to register
	* @param {string} config The MacGyver widget to register
	*/
	macgyver: (id, config) => Vue.assets.$assets.macgyver[id] = config,
};

/**
* Function which returns all known services as a hash
* Each service is prefixed with '$' to match their VM counterparts
* This is useful to use services outside of Vue, within a service for example
*
* @returns {Object}
*
* @example
* var {$toast, $sesssion} = Vue.services();
*/
Vue.services = ()=> ({
	...Vue.assets.$assets.services,
	$router: app.router,
	$root: app.vue,
	$emit: Vue.prototype.$emit,
});
