<script lang="js" frontend>
import _ from 'lodash';
global._ = _;

import Debug from '/services/debug';

import Vue from 'vue';
Vue.config.devtools = false;
Vue.config.productionTip = false;

import VueRouter from 'vue-router';
Vue.use(VueRouter);

/**
* Wrapper around Vue which provides global level access to front-end functionality
*/
global.app = {
	debug: Debug('Doop-Core').enable(false),


	/**
	* Whether the running app is inside a Cordova wrapper
	* @type {boolean}
	*/
	isCordova: false,


	/**
	* Whether this app is running in production
	* Enabling this removes various safety and sanity checks
	* @type {boolean}
	*/
	isProduction: false,


	/**
	* Set to true after init() has been called
	*/
	isReady: false,


	/**
	* VueRouter instance
	* @type {VueRouter}
	*/
	router: undefined,


	/**
	* Vue instance, setup during init()
	*/
	vue: undefined,


	/**
	* A Promise.defer() which will fire when init has completed
	* NOTE: Because this is needed way before Promise.defer is actually invoked, it actually has its own mini-implementation
	* @type {Promise.Defer}
	*/
	ready: new Promise(resolve => setTimeout(()=> {
		app.ready.resolve = resolve;
	})),


	/**
	* Register a global level component
	* This holds all component registrations inside app.component.register{} then dumps them into app.vue.component() during app.init()
	* @param {string} [id] The ID of the component to set/get, if omitted and only a spec object is provided the id is computed via _.camelCase(spec.route)
	* @param {Object} [spec] The spec to set, if omitted the existing component is fetched
	* @returns {Object} The component spec
	*/
	component(id, spec) {
		// Argument mangling {{{
		if (_.isObject(id)) { // Passed only spec
			[id, spec] = [_.camelCase(id.route), id];
			if (!id) throw new Error(`Register anonymous component with app.component(SPEC) but spec has no route specified, specify a component name or {route: String}`);
		}
		// }}}

		if (spec && app.isReady) { // Already live
			console.warn(`Registered component "${id}" after app.init() was called`);
			if (!isProduction && spec.template) console.warn('Component', id, 'has a template property - use <template/> tags or a raw renderer!');
			return Vue.component(id, spec);
		} else if (spec) { // Temporarily hold a component in memory while we slurp all component registrations
			if (!app.component.register) app.component.register = {}; // Create the register if it doesn't already exist
			if (!app.isProduction && app.component.register[id]) app.debug.force('Component', id, 'already declared as', app.component.register[id], 'clobbering with new component spec', spec);
			return app.component.register[id] = spec;
		} else { // Fetch an existing component
			return Vue.component(id);
		}
	},

	mgComponent(id, spec) {
		// Argument mangling {{{
		if (_.isObject(id)) { // Passed only spec
			[id, spec] = [_.camelCase(id.route), id];
			if (!id) throw new Error(`Register anonymous mgComponent with app.mgComponent(SPEC) but spec has no route specified, specify a mgComponent name or {route: String}`);
		}
		// }}}

		if (spec && app.isReady) { // Already live
			console.warn(`Registered mgComponent "${id}" after app.init() was called`);
			if (!isProduction && spec.template) console.warn('Component', id, 'has a template property - use <template/> tags or a raw renderer!');
			return Vue.mgComponent(id, spec);
		} else if (spec) { // Temporarily hold a mgComponent in memory while we slurp all mgComponent registrations
			if (!app.mgComponent.register) app.mgComponent.register = {}; // Create the register if it doesn't already exist
			return app.mgComponent.register[id] = spec;
		} else { // Fetch an existing mgComponent
			return Vue.mgComponent(id);
		}
	},

	/**
	* Register an object as a global Vue service
	* A service is a shared object which can be accessed with vm.$service, app.service(id) or app.service.ID
	* @param {string} id The name of the service to register. This should always include the '$' prefix
	* @param {Object|function} [spec] The object to register as the service return. If omitted this function acts as a getter. If a function is provided it is evaulated when everything else has loaded the result used with the context of `app.vue` so it can access services
	* @returns {Object} The service spec
	*/
	service(id, spec) {
		if (spec && app.isReady) { // Already live
			console.warn(`Registered service "${id}" after app.init() was called`);
			return Vue.prototype[id] = app.service[id] = spec;
		} else if (spec) { // Temporarily hold a component in memory while we slurp all component registrations
			if (!app.isProduction && !/^[\$_]/.test(id)) throw new Error(`All service registration and queries should have a '$' or '_' prefix. Given "${id}"`);
			if (!app.service.register) app.service.register = {}; // Create the register if it doesn't already exist
			if (!app.isProduction && app.service.register[id]) app.debug.force('Service', id, 'already declared as', app.service.register[id], 'clobbering with new service spec', spec);
			return app.service.register[id] = spec;
		} else { // Fetch an existing component
			return Vue.prototype[id];
		}
	},


	/**
	* Register a generic filter
	* These are all available via vm.filter[id], app.filter(ID) or app.filter.ID
	* @param {string} id The name of the filter to register
	* @param {function} [func] The function to register as the filter. If omitted this function acts as a getter.
	* @returns {function} The filter function
	*/
	filter(id, func) {
		if (func && app.isReady) { // Already live
			console.warn(`Registered filter "${id}" after app.init() was called`);
			return Vue.prototype.$filter[id] = func;
		} else if (func) { // Temporarily hold a component in memory while we slurp all component registrations
			if (!app.filter.register) app.filter.register = {}; // Create the register if it doesn't already exist
			if (!app.isProduction && app.filter.register[id]) app.debug.force('filter', id, 'already declared as', app.filter.register[id], 'clobbering with new filter func', func);
			return app.filter.register[id] = app.filter[id] = func;
		} else if (Vue.prototype.$filter) { // Fetch an existing component (app loaded)
			return Vue.prototype.$filter[id];
		} else { // Fetch an existing component (app not loaded yet)
			return app.filter.register[id];
		}
	},


	/**
	* Register a directive
	* @param {string} id The name of the directive to register
	* @param {Object} [spec] The spec to set, if omitted the existing directive is fetched
	* @returns {Object} The directive spec
	*/
	directive(id, spec) {
		if (spec && app.isReady) { // Already live
			console.warn(`Registered directive "${id}" after app.init() was called`);
			return Vue.directive(id.replace(/^v-/, ''), spec);
		} else if (spec) { // Temporarily hold a component in memory while we slurp all component registrations
			if (!app.isProduction && !id.startsWith('v-')) throw new Error(`All directive IDs must begin with "v-", given "${id}"`);
			if (!app.directive.register) app.directive.register = {}; // Create the register if it doesn't already exist
			if (!app.isProduction && app.directive.register[id]) app.debug.force('directive', id, 'already declared as', app.directive.register[id], 'clobbering with new directive spec', spec);
			return app.directive.register[id.replace(/^v-/, '')] = spec;
		} else { // Fetch an existing component
			return Vue.directive(id);
		}
	},


	/**
	* Register generic Vue plugin
	* @param {Object} plugin The plugin to register
	*/
	use(plugin) {
		if (!app.use.register) app.use.register = []; // Create the register if it doesn't already exist
		if (!plugin || !_.isObject(plugin)) throw new Error('All app.use(plugin) plugins must be objects');

		if (app.isReady) { // Already live
			console.warn(`Registered app.use() plugin after app.init() was called`);
			return Vue.use(plugin);
		} else { // Temporarily hold a component in memory while we slurp all component registrations
			return app.use.register.push(plugin);
		}
	},


	/**
	* Register a mixin
	* @param {object} spec The mixin spec to set
	* @returns {Object} The mixin spec
	*/
	mixin: function(spec) {
		if (app.isReady) console.warn(`Registered mixin after app.init() was called`, spec);
		return Vue.mixin(spec);
	},


	/**
	* Init all components, registering their routes to the router and resetting app.component etc. as pointers to app.vue.component
	*/
	init() {
		var $debug = Debug('Doop-Core-Init').enable(false);

		app.isReady = true; // Set this early so trying to register other components / services / filters etc. will warn

		$debug('app.init()', {
			components: app.component.register,
			filters: app.filter.register,
			services: app.service.register,
		});

		// INIT: app.router (+ sort registered component routes) {{{
		app.router = new VueRouter({
			mode: app.isCordova ? 'hash' : 'history', // Switch to absolute URL mode when not in app, requires connect-history-api-fallback NPM on server
		});
		// }}}

		// INIT: Generic plugins {{{
		_.forEach(app.use.register, plugin => {
			Vue.use(plugin);
		});
		delete app.use.register;
		// }}}

		// INIT: app.vue {{{
		app.vue = new Vue({ // Start Vue in a headless state (we actually mount it at the end of `app.init()` when all the components are loaded)
			render: h => h('layout-root'),
			router: app.router,
		});
		// }}}

		// INIT: Services {{{
		_.forEach(app.service.register, (spec, id) => {
			$debug(`app.service('${id}')`);
			app.service[id] = Vue.prototype[id] = (_.isFunction(spec) ? spec.call(app.vue) : spec);
		});
		delete app.service.register;
		// }}}

		// INIT: Filters {{{
		Vue.prototype.$filter = {};
		_.forEach(app.filter.register, (func, id) => {
			$debug(`app.filter('${id}')`);
			Vue.filter(id, func);
			Vue.prototype.$filter[id] = func;
		});
		delete app.filter.register;
		// }}}

		// INIT: Directives {{{
		_.forEach(app.directive.register, (spec, id) => {
			$debug(`app.directive('${id}')`);
			Vue.directive(id, spec);
		});
		delete app.filter.directive;
		// }}}

		// INIT: Components (loaded late so we have services + filters in the Vue prototype) {{{
		_.forEach(app.component.register, (spec, id) => {
			$debug(`app.component('${id}')`);
			Vue.component(id, spec)
		});
		// FIXME: delete app.component.register?
		// }}}

		// INIT: mgComponents (loaded late so we have MacGyver in the Vue prototype) {{{
		_.forEach(app.mgComponent.register, (spec, id) => {
			$debug(`app.mgComponent('${id}')`);
			Vue.mgComponent(id, spec)
		});
		// FIXME: delete app.mgComponent.register?
		// }}}

		// INIT: Various Vue mixins (set, nextTick etc.) {{{
		['delete', 'nextTick', 'set'].forEach(fn => app[fn] = Vue[fn].bind(app.vue));
		// }}}

		// INIT: Determine which routes require authentication {{{
		app.router.options.routeRequiresAuth = new Set( // Create lookup set for all components that need auth
			Object.values(app.component.register)
				.filter(component => component.route && (component.routeRequiresAuth ?? true))
				.map(component => component.route)
		);
		// }}}

		// INIT: Route guards must be attached before routes or first hit will not trigger middleware {{{
		app.router.beforeEach((to, from, next) => {
			app.service.$session.promise()
				.then(()=> $('body').toggleClass('has-session', app.service.$session.isLoggedIn))
				.then(()=> app.vue.$emit('$beforeRoute', {to, from}))
				.then(() => next())
				.catch(()=> { // Forbid nav if not logged in an the path is in a whitelist
					app.router.$debug('Route', from.path, to.path, to, app.router.options.routeRequiresAuth.has(to.matched[0].path));

					// Docs: When the URL is /foo/bar, $route.matched will be an Array containing both objects (cloned), in parent to child order.
					// Note: We register only individual components as routes below. The first matched index should always be a Doop component.
					if (_.isArray(to.matched) && to.matched.length > 0 && app.router.options.routeRequiresAuth.has(to.matched[0].path)) { // Target component requires auth
						app.router.$debug('No session auth present and', {routeRequiresAuth: true}, 'on routes', {to, from}, '- redirect to /login');
						if (to.path !== '/logout') app.service.$session.settings.set('redirect', to.path, 'local'); // Save eventual destination if the to route is not the logout (prevents loops)
						next({path: '/login'}); // Redirect everything else
					} else { // Controller endpoint does not require auth - serve page normally
						next();
					}
				})
				.finally(()=> {
					if (to.path != '/login' && to.path != '/signup')
						$('body').removeClass('bootstrapping'); // Let the login page handle its own bootstrapping overrides (so we dont get screen flash-in)
				});

			if (app.vue && app.vue.$emit) app.broadcast('$router.change');
		});
		// }}}

		// INIT: Router routes {{{
		_(app.component.register)
			.pickBy(component => component.route) // Only include components with routes
			.map((component, id) => ({
				path: component.route,
				component: Vue.component(id),
			}))
			.sortBy(route => route.path
				.replace(/\//g, String.fromCharCode(824))
				.replace(/:/g, String.fromCharCode(818))
			)
			.forEach(route => app.router.addRoute(route))

		delete app.component.register; // Free up memory of loaded components
		// }}}

		app.vue.$mount('#app'); // Mount the headless Vue instance and kick off the chain of component loading

		var tryResolve = ()=> { // Let app.ready set itself up then resolve (keep trying if its not there)
			console.count('Try app.ready.resolve()');
			if (!app.ready.resolve) {
				if (++tryResolve.tryCount >= 8) throw new Error('Given up after 8 attempts trying to call app.ready.resolve() - app payload corrupt?');
				setTimeout(tryResolve, Math.pow(2, tryResolve.tryCount) * 5);
			} else {
				app.ready.resolve();
			}
		}
		tryResolve.tryCount = 0;
		tryResolve(); // Kick off resolve trier

		$debug('app.init() - complete!');
	},
};

window.addEventListener('load', app.init); // Kick everything off when the window is ready
</script>
