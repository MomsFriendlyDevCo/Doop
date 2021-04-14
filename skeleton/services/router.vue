<script lang="js" frontend>
app.ready.then(()=> {
	app.router.routeVersion = 0; // Used to invalidate routes where the route is identical
	app.router._go = app.router.go; // Store real router.go() function
	app.router.$debug = app.service.$debug.new('$router').enable(true);


	/**
	* Slightly smarter version of $router.push() which understands absolute URLs
	* @param {string|number|Object|function} location The URL to navigate to or the number of steps forward / backward to navigate, if this is a function it is executed inline
	* @param {string|number} [location.url] Alternate method of passing the URL to navigate to
	* @param {string} [location.transition="none"] Transition to apply when navigating
	* @param {boolean} [force=false] Force redirection even if the destination is the same (useful for inner page transitions)
	* @param {string} [target] What pane to target, use '_blank' to force a new tab / window, use '_self' to redirect the entire document location
	* @param {function} [before] Async function called as `(settings)` to wait for before performing the action
	* @param {function} [after] Function called as `(settings)` after performing the action (since actions are pretty much instant async is ignored)
	* @returns {Promise} A promise which will resolve when the navigation completes
	*/
	app.router.go = location => {
		var settings = {
			force: false,
			transition: 'none',
			target: undefined,
			...(_.isPlainObject(location) ? location : {url: location}), // Either merge location options or add in as simple URL
		};

		app.service.$transitions.set(settings.transition);

		return Promise.resolve()
			.then(()=> settings.before ? settings.before(settings) : undefined)
			// Open the link {{{
			.then(()=> {
				if (settings.target == '_blank') {
					if (_.isNumber(location.url)) throw new Error('History navigation with targets is not allowed');
					app.router.$debug(`New tab/window naviation to ${settings.url}`);
					window.open(settings.url);
				} else if (settings.target == '_self') {
					app.router.$debug(`Navigate self to ${settings.url}`);
					window.location = settings.url;
				} else if (_.isFunction(settings.url)) {
					app.router.$debug('Navigate to function', settings.url);
					settings.url();
				} else if (_.isNumber(location.url)) {
					app.router.$debug(`$route.goHistory(${settings.url})`);
					app.router.routeVersion++;
					app.router._go(settings.url);
				} else if (/^https?:\/\//.test(settings.url) || /\/go\//.test(settings.url)) {
					app.router.$debug(`Absolute redirection to ${settings.url}`);
					window.location = settings.url;
				} else if (app.router.currentRoute && app.router.currentRoute.fullPath == settings.url) {
					if (settings.force) {
						app.router.$debug(`$route.go('${settings.url}') (FORCED, same URL)`);
						app.router.routeVersion++;
						return app.router.push('/redir')
							.then(()=> app.router.push(settings.url));
					} else {
						app.router.$debug(`$route.go('${settings.url}') (skipped, same URL)`);
					}
				} else {
					app.router.$debug(`$route.go('${settings.url}')`);
					return app.router.push(settings.url);
				}
			})
			// }}}
			.then(()=> settings.after ? settings.after(settings) : undefined)
	};
});
</script>
