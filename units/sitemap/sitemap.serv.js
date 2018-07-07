angular
	.module('app')
	.service('$sitemap', function($injector, $q, $rootScope, $router, $session, TreeTools) {
		var $sitemap = this;

		// Sidebar links & structure {{{
		/**
		* Each collection item is defined as:
		*
		* NOTE: This is the un-calculated raw data, for the flattened, evaluated data use $sitemap.map
		*
		* @var {Object}
		* @param {string} title The human readable title of each sidebar item
		* @param {string|function} href The link to redirect to (include '#/' if an Angular resource). If this is a function it is evaluated using the Angular $injector.invoke() service and is expected to return a string.
		* @param {string} icon The icon class to display next to each item
		* @param {array} children Any child items, the definition of each is the same as the main element. If this is a function it is evaluated using the Angular $injector.invoke() service and is expected to return a Promise.
		* @param {function} show Function evaluated as ($session) to determine if the items should be shown. Parent items will hide all child items if the parent is not shown
		* @see $sitemap.map
		*/
		$sitemap.links = [
			{
				title: 'Dashboard',
				href: '#/',
				icon: 'fa fa-fw fa-tachometer-alt',
			},
			{
				title: 'Notifications',
				href: '#/notifications',
				icon: 'fa fa-fw fa-envelope',
			},
			{
				title: 'Admin',
				href: '#/admin',
				icon: 'fa fa-fw fa-user',
				show: $session => $session.data.isAdmin,
				// Sub-items {{{
				children: [
					{
						title: 'Users',
						href: '#/admin/users',
					},
				],
				// }}}
			},
			{
				title: 'Debugging',
				href: '#/debug',
				icon: 'far fa-fw fa-heartbeat',
				show: $session => $session.data.isAdmin || $session.data.permissions.debugging,
				// Sub-items {{{
				children: [
					{
						title: 'Server',
						href: '#/debug/server',
						// Sub-items {{{
						children: [
							{
								title: 'Git state',
								href: '#/debug/server/git',
							},
							{
								title: 'Server info',
								href: '#/debug/server/info',
							},
						],
						// }}}
					},
					{
						title: 'Services',
						href: '#/debug/services',
						// Sub-items {{{
						children: [
							{
								title: '$config',
								href: '#/debug/services/config',
							},
							{
								title: '$http',
								href: '#/debug/services/http',
							},
							{
								title: '$loader',
								href: '#/debug/services/loader',
							},
							{
								title: '$prompt',
								href: '#/debug/services/prompt',
							},
							{
								title: '$screen',
								href: '#/debug/services/screen',
							},
							{
								title: '$session',
								href: '#/debug/services/session',
							},
							{
								title: '$toast',
								href: '#/debug/services/toast',
							},
							{
								title: '$tts',
								href: '#/debug/services/tts',
							},
						],
						// }}}
					},
					{
						title: 'Rockjaw Specific',
						href: '#/debug/rockjaw',
						// Sub-items {{{
						children: [
							{
								title: 'Pending',
								href: '#/debug/rockjaw/pending',
							},
							{
								title: 'Pickers',
								href: '#/debug/rockjaw/pickers',
							},
						],
						// }}}
					},
				],
				// }}}
			},
		];
		// }}}

		// Data refresher (main map) {{{
		/**
		* Create the $sitemap.map object from $sitemap.links
		* Also ensures that that each item has a link and functions are flattened
		* @returns {Promise} Resolves with the built sitemap
		*/
		$sitemap.map;
		$sitemap.refresh = ()=>
			$q.resolve()
				.then(()=> $session.promise()) // Ensure the user profile pull has completed first
				.then(() => {
					$sitemap.map = angular.copy($sitemap.links);
					$sitemap.decorateNodes($sitemap.map);
					return $sitemap.map;
				})

		/**
		* Calls refresh() if sitemap doesn't already exist, otherwise returns it
		* This can be used to force the sitemap to build before any downstream promise requires it
		* @returns {Promise} Resolves with the built sitemap
		*/
		$sitemap.get = ()=> $q(resolve => {
			if ($sitemap.map) {
				resolve($sitemap.map);
			} else {
				return $sitemap.refresh().then(map => resolve(map));
			}
		});
		// }}}

		// Data refresher (active items) {{{
		$rootScope.$on('$routerSuccess', ()=> {
			if (!$sitemap.map) return; // Not yet ready

			// Set all nodes to inactive
			TreeTools.flatten($sitemap.map)
				.forEach(node => node.active = false);

			// Bottom-up search through the tree, marking each node as active
			var selectedCount = 0;
			TreeTools.parents($sitemap.map, item => item.href && $router.path == item.href.replace(/^#/, '').replace(/\?.*$/, ''))
				.forEach(node => {
					node.active = true;
					selectedCount++;
				});

			// Nothing was seleted? Try the best guess
			if (!selectedCount) {
				var bestGuess = _(TreeTools.flatten($sitemap.map))
					.filter(item => item.href && item.href + '/' == '#' + $router.path.substr(0, item.href.length))
					.map(item => _.set(item, 'length', item.href.length))
					.sortBy('length')
					.reverse()
					.first();

				if (bestGuess) {
					TreeTools.parents($sitemap.map, {id: bestGuess.id})
						.forEach(node => node.active = true);
				} else {
					console.warn('Sitemap - Cannot find location within tree', 'Router path:', $router.path);
				}
			}
		});
		// }}}

		// Utility functions {{{
		/**
		* Iterate over a tree of items and decorate each item
		* NOTE: This mutates nodes
		* @param {Object|array} nodes The nodes to decorate
		*/
		$sitemap.decorateNodes = nodes => {
			TreeTools.flatten(nodes).forEach(node => {
				// Calculate .show
				node.show = node.show ? node.show($session) : true;

				// Flatten href
				if (angular.isFunction(node.href)) node.href = $injector.invoke(node.href);

				// Flatten children
				if (angular.isFunction(node.children)) $injector.invoke(node.children).then(data => {
					$sitemap.decorateNodes(data);
					node.children = data;
				});

				// Add .id if missing
				if (!node.id) node.id = (node.href || node.title).replace(/[^a-z0-9]+/ig, '');
			});
		};
		// }}}

		// React to user permission changes
		$rootScope.$on('session.updated', ()=> $sitemap.refresh());

		$sitemap.refresh();
	})
