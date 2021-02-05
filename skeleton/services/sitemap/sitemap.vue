<script lang="js" frontend>
app.service('$sitemap', function() {
	var $sitemap = {};
	this.$debug = this.$debug.new('$sitemap').enable(false);

	// Raw sitemap (uncomputed) {{{
	$sitemap.map = [
		{
			title: 'Dashboard',
			href: '/',
			icon: 'fal fa-home',
		},
		{
			title: 'Orders',
			href: '/orders',
			icon: 'fal fa-clipboard-list',
			show: ()=> this.$session.hasPermission('ordersEdit'),
			children: [
				{
					title: 'All orders',
					href: '/orders',
					icon: 'fal fa-asterisk',
				},
				{
					title: 'My orders',
					href: ()=> `/orders?q=user:${this.$session?.data?._id}`,
					icon: 'fal fa-user',
				},
				{
					title: 'Outstanding accounts',
					href: ()=> `/orders?q=paymentMethod:account payment:outstanding`,
					icon: 'fal fa-user',
				},
				{
					title: 'Return Processing',
					href: ()=> '/orders?q=is:returnProcessing',
					icon: 'fal fa-pause',
				},
				{
					title: 'End of Day',
					href: ()=> `/orders?q=report:paymentMethods+date:${moment().format('DD/MM/YYYY')}-${moment().format('DD/MM/YYYY')}`,
					icon: 'fal fa-calendar-day',
				},
			],
		},
		{
			title: 'Customers',
			href: '/customers',
			icon: 'fal fa-user',
		},
		{
			title: 'Products',
			href: '/products',
			icon: 'fal fa-box-full',
		},
		{
			title: 'Admin',
			href: '/admin',
			icon: 'fal fa-wrench',
			show: ()=> this.$session.hasPermission.any('usersEdit', 'emailTemplatesEdit'),
			children: [
				{
					title: 'Email templates',
					href: '/emailTemplates',
					icon: 'fal fa-envelope',
					show: ()=> this.$session.hasPermission('emailTemplatesEdit'),
				},
				{
					title: 'Users',
					href: '/users',
					icon: 'fal fa-users',
					show: ()=> this.$session.hasPermission('usersEdit'),
				},
				{
					title: 'Discount groups',
					href: '/discountGroups',
					icon: 'fal fa-badge-dollar',
					// show: ()=> this.$session.hasPermission('discountGroupEdit'),
				},
			],
		},
		{
			title: 'Debugging',
			href: '/debug',
			icon: 'fal fa-cog',
			show: ()=> this.$session.hasPermission('debug'),
			children: [
				{title: 'Config', href: '/debug/config'},
				{title: 'DB', href: '/debug/db'},
				{title: 'DirtyChecker', href: '/debug/dirtyChecker'},
				{title: 'Drag / Drop', href: '/debug/dragDrop'},
				{title: 'Files', href: '/debug/files'},
				{title: 'Git', href: '/debug/git'},
				{title: 'HTTP', href: '/debug/http'},
				{title: 'Loader', href: '/debug/loader'},
				{title: 'Prompt', href: '/debug/prompt'},
				{title: 'Session', href: '/debug/session'},
				{title: 'Transitions', href: '/debug/transitions'},
				{title: 'Toasts', href: '/debug/toast'},
				{title: 'Users', href: '/debug/users'},
				{title: 'Validate', href: '/debug/v-validate'},
			],
		},
	];
	// }}}

	// Data refresher ($sitemap.computed generator) {{{
	/**
	* Create the $sitemap.computed object from $sitemap.raw
	* Also ensures that that each item has a link and functions are flattened
	* @returns {Promise} Resolves with the built sitemap
	* @emits {Object} $sitemap.update Emitted as ($sitemap.computed) when the sitemap changes
	*/
	$sitemap.computed;
	$sitemap.refreshing; // Promise if we are already inside a refresh
	$sitemap.refresh = (force = false) => {
		if (!force && $sitemap.refreshing) return $sitemap.refreshing;

		this.$debug('Refresh');
		return $sitemap.refreshing = Promise.resolve()
			.then(()=> this.$session.promise()) // Ensure the user profile pull has completed first
			.then(()=> $sitemap.resolveTree($sitemap.map))
			.then(tree => $sitemap.computed = tree)
			.tap(()=> app.broadcast('$sitemap.update', $sitemap.computed))
			.catch(e => {
				if (e.errno && e.errno == 403) return; // Ignore 403's - user not logged in yet
				this.$toast.catch(e);
			})
			.finally(()=> this.$debug('Final sitemap', $sitemap.computed))
	};

	app.ready.then(()=> { // Make sitemap refresh when the user profile changes
		app.vue.$on('$session.update', ()=> $sitemap.refresh(force = true));
		app.vue.$on('$session.permissions', ()=> $sitemap.refresh(force = true));
		app.vue.$on('$session.settled', ()=> {
			this.$debug('Notified that session has settled');
			this.$sitemap.refresh(force = true);
		});
	});

	/**
	* Calls refresh() if sitemap doesn't already exist, otherwise returns it
	* This can be used to force the sitemap to build before any downstream promise requires it
	* @returns {Promise} Resolves with the built sitemap
	*/
	$sitemap.promise = ()=> {
		if ($sitemap.computed) {
			return Promise.resolve($sitemap.computed);
		} else {
			return $sitemap.refresh();
		}
	};
	// }}}

	// Update currently selected node and its meta information {{{
	$sitemap.selected = {node: undefined, path: undefined}; // Parents is the path to the node down thr tree in ascending order (i.e. current node is last)
	app.ready.then(()=> window.app.router.afterEach((to, from) => {
		$sitemap.selected.path = TreeTools.parents($sitemap.map, {href: to.path});

		if (!$sitemap.selected.path.length) { // Didn't find a direct match - try looking again for the path minus the last (ID like) segment
			var pathSegments = _.dropRightWhile(to.path.split('/'), seg => !seg); // Split path droping empty elements from right (usually hashbang queries like `?key=val`)
			var parentPath = pathSegments.slice(0, -1).join('/');
			$sitemap.selected.path = TreeTools.parents($sitemap.map, {href: parentPath});
			if ($sitemap.selected.path) { // Found something
				$sitemap.selected.path.push({title: _.chain(pathSegments).last().startCase().value(), href: to.path});
			} else {
				console.warn('Cannot determine sitemap path of', to.path);
			}
		}

		$sitemap.selected.node = $sitemap.selected.path && $sitemap.selected.path.length ? _.last($sitemap.selected.path) : undefined;

		$sitemap.refresh();
	}));
	// }}}

	// Utility functions {{{
	/**
	* Recursively iterate down a tree, resolving all promises and calculating field values
	* @param {Object|array} tree The tree to resolve
	* @returns {Promise} Promise which will resolve with the resolved tree object
	*/
	$sitemap.resolveTree = inputTree =>
		Promise.resolve()
			// First pass - use TreeTools.resolve() to resolve promises {{{
			.then(()=> TreeTools.resolve(inputTree, {clone: true}))
			// }}}
			// Second pass - Calculate the show value downwards {{{
			.then(tree => {
				TreeTools
					.flatten(tree)
					.filter(node => node.title)
					.forEach(node => {
						// Calculate .show
						if (_.isUndefined(node.show)) node.show = true;

						// Add .id if missing
						if (!node.id) node.id = (node._id || node.href || node.title).replace(/[^a-z0-9]+/ig, '');
					});

				return tree;
			})
			// }}}
			// Third pass - Remove all hidden nodes {{{
			.then(tree =>
				TreeTools.filter(tree, node => node.show)
			)
			// }}}
			.catch(this.$toast.catch)
	// }}}

	// Allow downstream pages to set their own meta information {{{
	/**
	* Override the computed breadcrumb trail
	* Nodes should be root -> current (i.e. current node is last)
	* Each node must conform to `{title, href, options[]?}`
	* @param {array <Object>} breadcrumbs Breadcrumbs to set, each entity is compose of {title, href, options[]?, verb?}
	* @param {array <Object>} [breadcrumbs.options] Additional options to display as a dropdown on each breadcrumb segment. Composed of {title, href}
	* @param {array <Object>} [breadcrumbs.verbs] Addtional action verbs to display as buttons next to each breadcrumb segment. Composed of {title, href, class, classBreadcrumb?, classTitle?, tooltip?} - class has to also specify 'btn' classes and is used as default if title / breadcrumb is not used, tooltip overrides title if it is present
	*/
	$sitemap.setBreadcrumbs = breadcrumbs => {
		$sitemap.selected = {
			node: _.last(breadcrumbs),
			path: breadcrumbs,
		};
		$sitemap.updatePageTitle();
	};


	/**
	* Override the title of the current node
	* @param {string} title The alternate title to display
	*/
	$sitemap.setTitle = title => {
		if (!$sitemap.selected.node) throw new Error('Attempt to use $sitemap.setTitle on a page where no current node can be determined');
		$sitemap.selected.node.title = title;
		$sitemap.updatePageTitle();
	};


	/**
	* Reload the current breadcrumb title + window title
	*/
	$sitemap.updatePageTitle = ()=> {
		if ($sitemap.selected.path.length) {
			document.title = [{title: app.service.$config.title}] // Append site title
				.concat($sitemap.selected.path) // Append rest of path
				.map(b => /^a-z/.test(b.title) ? _.startCase(b.title) : b.title)
				.reverse()
				.join(' | ');
		} else {
			document.title = app.service.$config.title;
		}
	}
	// }}}

	return $sitemap;
});
</script>
