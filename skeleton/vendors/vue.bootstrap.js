/**
* Frontend bootstrapper
* This is the initial starting point when compiling the Rollup assisted Vue path
*/

Vue.config.productionTip = false; // Disable console.log production chatter

window.app = {
	isCordova: 0/* @IMPORT: app.config.cordova.frontend */,
	lifecycle: new Vue(),
	ready: new Promise(resolve => setTimeout(()=> {
		window.app.readyResolve = resolve;
	})),
	crash: (msg = 'An unknown error has occured', showReload = true) => {
		console.log('%capp.crash()', 'color: red; font-weight: bold', {msg, showReload});
		$('.splash .splash-crash-reload').toggle(showReload);
		$('.splash .splash-crash-text').text(msg);
		$('.splash-crash').css('display', 'flex');
	},
};

if (app.isCordova) console.log('[core]', 'Running in Cordova mode');

window.onload = ()=> {
	// Router {{{

	// Sort routes {{{
	// Code taken in-part from https://github.com/hash-bang/string-sort (author of this module is the author of string-sort)
	// See that module for a test kit and documentation
	// TL;DR - this is a [Schwartzian Transform](https://en.wikipedia.org/wiki/Schwartzian_transform)
	var keyOrder = [
		{key: '_priority', reverse: true},
		{key: '_pathHuman', charOrder: 'abcdefghijklmnopqrstuvwxyz0123456789:/-_', fallback: ()=> String.fromCharCode(65000)},
		{key: '_path', charOrder: 'abcdefghijklmnopqrstuvwxyz0123456789:/-_', fallback: ()=> String.fromCharCode(65000)},
	];


	// Cache the lookup table for each key rule
	keyOrder.forEach(keyRule => {
		if (keyRule.charOrder) {
			keyRule.charOrderTable = {};
			keyRule.charOrder.split('').forEach((c,i) => keyRule.charOrderTable[c] = String.fromCharCode(i + 65));
		}
	});

	Vue.assets.$assets.routes = Vue.assets.$assets.routes
		.map(r => [r].concat(keyOrder.map(keyRule => { // Pack the rules into an array of the form [RouterRule, fields...]
			// Construct each key value
			if (!_.hasIn(r, keyRule.key)) { // Lookup key missing
				return undefined;
			} else if (keyRule.charOrderTable) { // Translate string into something we can use
				return r[keyRule.key]
					.toString()
					.split('')
					.map(c => keyRule.charOrderTable[c] || keyRule.fallback(c))
					.join('');
			} else { // Just return the value
				return r[keyRule.key];
			}
		})))
		.sort(function(a, b) { // Sort everything...
			for (var k = 0; k < keyOrder.length; k++) { // Compare each field until we hit something that differs
				if (_.isUndefined(a[k+1]) || _.isUndefined(b[k+1])) continue; // Skip non-existant comparitors
				if (a[k+1] == b[k+1]) continue; // Fall though as both values are the same
				// If we got here the fields differ
				return a[k+1] > b[k+1] ? (keyOrder[k].reverse ? -1 : 1) : (keyOrder[k].reverse ? 1 : -1);
			}
		})
		.map(i => i[0]); // Unpack and return the rule again
	// }}}

	// Setup router {{{
	window.app.router = new VueRouter({
		mode: app.isCordova ? 'hash' : 'history', // Switch to absolute URL mode when not in app, requires connect-history-api-fallback NPM on server
		scrollBehaviour: (to, from, lastPosition) => {
			console.log('SCROLL LAST POS', {lastPosition, to, from});
			return lastPosition;
		},
		routes: []
			.concat(Vue.assets.$assets.routes.map(route => ({
				path: route.path,
				component: Vue.component(route.component),
			})))
			.concat([
				{path: '*', component: Vue.component('error')}
			]),
	});
	// }}}

	// app.router.go() {{{
	window.app.router.routeVersion = 0; // Used to invalidate routes where the route is identical
	window.app.router._go = window.app.router.go;
	/**
	* Slightly smarter version of $router.push() which understands absolute URLs
	* @param {string|number|Object} location The URL to navigate to or the number of steps forward / backward to navigate
	* @param {string|number} [location.url] Alternate method of passing the URL to navigate to
	* @param {string} [location.transition="none"] Transition to apply when navigating
	* @param {boolean} [force=false] Force redirection even if the destination is the same (useful for inner page transitions)
	* @param {string} [target] What pane to target, use '_blank' to force a new tab / window
	*/
	window.app.router.go = location => {
		var settings = {
			force: false,
			transition: 'none',
			target: undefined,
			...(_.isObject(location) ? location : {url: location}), // Either merge location options or add in as simple URL
		};

		Vue.services().$transitions.set(settings.transition);

		if (settings.target == '_blank') {
			if (_.isNumber(location.url)) throw new Error('History navigation with targets is not allowed');
			console.log(`%cNew tab/window naviation to ${settings.url}`);
			window.open(settings.url);
		} else if (_.isNumber(location.url)) {
			console.log(`%c$route.goHistory(${settings.url})`, 'color: #00F');
			window.app.router.routeVersion++;
			app.router._go(settings.url);
		} else if (/^https?:\/\//.test(settings.url) || /\/go\//.test(settings.url)) {
			console.log(`%cAbsolute redirection to ${settings.url}`);
			window.location = settings.url;
		} else if (app.router.currentRoute && app.router.currentRoute.fullPath == settings.url) {
			if (settings.force) {
				console.log(`%c$route.go('${settings.url}') (FORCED, same URL)`, 'color: #00F');
				window.app.router.routeVersion++;
				return app.router.push(settings.url);
			} else {
				console.log(`%c$route.go('${settings.url}') (skipped, same URL)`, 'color: #00F');
			}
		} else {
			console.log(`%c$route.go('${settings.url}')`, 'color: #00F');
			return app.router.push(settings.url);
		}
	};
	// }}}

	// app.router.inject() {{{
	/**
	* Accept query parameters from hashbang based on an optional filter
	* @param {array <String>} [fields] Restrict fields to a specific array of field names
	* @returns {Object} An object which can be merged as as query
	*
	* @example Make a query and also accept query parameters from the hashbang
	* this.$http.get('/api/widgets', {...this.$router.inject('status'), sort: 'name'})
	*   .then(...)
	*/
	window.app.router.inject = fields => {
		if (!fields) {
			return app.router.currentRoute.query;
		} else {
			return _.pick(app.router.currentRoute.query, fields);
		}
	};
	// }}}

	/// }}}

	// Router > Guards > Check session {{{
	window.app.router.beforeEach((to, from, next) => {
		Vue.assets.service('$session').promise()
			.then(user => next())
			.catch(()=> { // Forbid nav if not logged in an the path is in a whitelist
				if (['/login'].includes(to.path)) return next(); // Let whitelisted paths continue
				console.log('No profile present, redirect to /login', Vue.services().$session);
				next({path: '/login'}); // Redirect everything else
			})
			.finally(()=> {
				if (to.path != '/login') $('body').removeClass('bootstrapping'); // Let the login page handle its own bootstrapping overrides (so we dont get screen flash-in)
			})

		if (app.vue && app.vue.$emit) app.vue.$emit.broadcast('$router.change');
	});
	// }}}

	// Vue Init {{{
	window.app.vue = new Vue({
		el: '#wrapper',
		components: {
			datetime: window.VueDatetime,
			sidebar: Vue.component('sidebar'),
		},
		router: window.app.router,
		data() { return {
			sidebarExpanded: true,
		}},
		methods: {
			toggleSidebar() {
				$('#wrapper').toggleClass('enlarged');
				this.sidebarExpanded = ! $('#wrapper').hasClass('enlarged');
				Vue.services().$session.settings.set('theme.sidebarExpanded', this.sidebarExpanded, 'session');
			},
		},
		created() {
			// Glue all late loading services into their early-loading counterparts
			var services = Vue.services();
			_.forEach(Vue.assets.$assets.serviceContexts, (context, id) => {
				Object.assign(context, services);
			});
		},
		mounted() {
			Vue.services().$session.settings.get('theme.sidebarExpanded', true)
				.then(res => !res && this.$screen.size != 'xs' && this.toggleSidebar()) // Do initial toggle if the user left it that way
		},
	});
	// }}}

	// Livecycle emitters {{{
	window.app.lifecycle
		.$emit('services') // Let services populate
		.$emit('ready') // Everything should now be resolvable

	setTimeout(()=> window.app.readyResolve()); // Wait for promises to catch up then fire the global ready handler
	// }}}
};
