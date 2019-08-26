<service singleton>
module.exports = function() {
	var $sitemap = this;
	$sitemap.$debugging = false;

	// Raw sitemap (uncomputed) {{{
	$sitemap.map = [
		{
			title: 'Dashboard',
			href: '/',
			icon: 'fal fa-home',
		},
		{
			title: 'Companies',
			href: '/companies',
			icon: 'fal fa-building',
			show: ()=> Vue.services().$session.data.permissions.companiesEdit,
		},
		{
			title: 'Users',
			href: '/users',
			icon: 'fal fa-users',
			show: ()=> Vue.services().$session.data.permissions.usersEdit,
		},
		{
			title: 'Debugging',
			href: '/debug',
			icon: 'fal fa-cog',
			show: ()=> Vue.services().$session.data.permissions.debug,
			children: [
				{title: 'Config', href: '/debug/config'},
				{title: 'Drag / Drop', href: '/debug/dragDrop'},
				{title: 'Files', href: '/debug/files'},
				{title: 'Git', href: '/debug/git'},
				{title: 'HTTP', href: '/debug/http'},
				{title: 'Loader', href: '/debug/loader'},
				{title: 'Prompt', href: '/debug/prompt'},
				{title: 'Session', href: '/debug/session'},
				{title: 'Transitions', href: '/debug/transitions'},
				{title: 'Toasts', href: '/debug/toast'},
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

		$sitemap.$debug('Refresh');
		return $sitemap.refreshing = Promise.resolve()
			.then(()=> this.$session.promise()) // Ensure the user profile pull has completed first
			.then(()=> $sitemap.resolveTree($sitemap.map))
			.then(tree => $sitemap.computed = tree)
			.tap(()=> this.$emit.broadcast('$sitemap.update', $sitemap.computed))
			.catch(e => {
				if (e.errno && e.errno == 403) return; // Ignore 403's - user not logged in yet
				this.$toast.catch(e);
			})
			.finally(()=> $sitemap.$debug('Final sitemap', $sitemap.computed))
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

		$sitemap.updatePageTitle();
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
	* Each node must conform to `{title, href}`
	* @param {array <Object>} breadcrumbs Breadcrumbs to set
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
			document.title = [{title: Vue.services().$config.title}] // Append site title
				.concat($sitemap.selected.path) // Append rest of path
				.map(b => /^a-z/.test(b.title) ? _.startCase(b.title) : b.title)
				.reverse()
				.join(' | ');
		} else {
			document.title = Vue.services().$config.title;
		}
	}
	// }}}

	return $sitemap;
};
</service>

<component name="sitemap-breadcrumbs">
module.exports = {
	data() {
		return {
			$sitemap: this.$sitemap,
		};
	},
}
</component>

<template name="sitemap-breadcrumbs">
	<div class="row">
		<!-- Only show breadcrumb area if we have a valid node AND not mobile -->
		<div v-if="$sitemap.selected.node" class="col-sm-12 title-breadcrumbs">
			<div class="page-title-box">
				<h4 class="page-title">
					{{$sitemap.selected.node.titleLong || $sitemap.selected.node.title}}
				</h4>
				<ol class="breadcrumb float-right">
					<li class="breadcrumb-item">
						<a v-href="{url: '/', transition: 'slide-left'}">
							<i class="far fa-home"/>
						</a>
					</li>
					<li v-for="node in $sitemap.selected.path" class="breadcrumb-item" :class="node == $sitemap.selected.node && 'active'">
						<a v-href="{url: node.href, transition: 'slide-left'}">
							{{node.title}}
						</a>
					</li>
				</ol>
				<div class="clearfix"></div>
			</div>
		</div>
	</div>
</template>

<style name="sitemap-breadcrumbs">
.title-breadcrumbs {
	z-index: 100;
}

.page-title-box .breadcrumb-item {
	color: var(--main);
}

.page-title-box .breadcrumb-item.active {
	font-weight: 700;
}
</style>

<component name="sitemap-map">
module.exports = {
	data: ()=> ({
		sitemapTree: [],
	}),
	methods: {
		itemClick(node) {
			// NOTE: Navigation is handled by v-href anyway so we only need to toggle opening this node
			this.$set(node, 'opened', !node.opened);
			this.$set(node, 'selected', false);
			if (!node.children && this.$screen.size == 'xs') this.closeSidebar();
		},
		refresh() {
			Promise.resolve()
				.then(()=> this.$loader.start(this._uid))
				.then(()=> this.$sitemap.promise())
				.then(tree => {
					this.sitemapTree = tree;
					if (_.isEmpty(this.sitemapTree)) return; // Tree cannot be computed for some reason - user probably not logged in

					// De-select all tree nodes
					TreeTools.flatten(this.sitemapTree).forEach(node => this.$set(node, 'selected', false));

					// Select this node and all its parents
					var branches = TreeTools.parents(this.sitemapTree, {href: this.$route.path})
						.map(node => {
							this.$set(node, 'opened', true);
							this.$set(node, 'selected', true);
							return node;
						})
				})
				.finally(()=> this.$loader.stop(this._uid))
		},
		closeSidebar() {
			$('#wrapper').addClass('enlarged');
		},
		resize() {
			// When moving to small screen size - disable the sidebar on the first hit
			if (this.$screen.size == 'xs') this.closeSidebar();
		},
	},
	created() {
		this.$on('$sitemap.update', this.refresh);
		this.$watch('$route', this.refresh);
		this.$on('$screen.resize', this.resize);
	},
};
</component>

<template name="sitemap-map">
	<ul>
		<li v-for="node in sitemapTree" :class="[node.opened ? 'opened' : 'closed', node.selected && 'active']">
			<a @click="itemClick(node)" v-href="node.href" class="waves-effect waves-primary">
				<i :class="node.icon"></i>
				<span> {{node.title}} </span>
				<span v-if="node.children" class="menu-arrow"/>
			</a>
			<ul v-if="node.children" class="list-unstyled">
				<li v-for="node in node.children" :class="node.selected && 'active'">
					<a @click="itemClick(node)" v-href="node.href" class="waves-effect waves-primary">{{node.title}}</a>
				</li>
			</ul>
		</li>
	</ul>
</template>

<style name="sitemap-map">
#wrapper:not(.enlarged) .side-menu ul.list-unstyled {
	display: block !important;
	overflow: hidden;
	transition: max-height 0.3s ease-out;
}

#wrapper:not(.enlarged) .side-menu .closed ul.list-unstyled {
	max-height: 0px;
}

#wrapper:not(.enlarged) .side-menu .opened ul.list-unstyled {
	max-height: 100vh;
}

.side-menu .menu-arrow {
	transition: transform 0.3s ease-out;
}

.side-menu .opened .menu-arrow {
	transform: rotate(90deg);
}

.side-menu li > a {
	border: 0 !important;
}

.side-menu li.active > a {
	background: var(--main);
}

.side-menu li.active > a,
.side-menu li.active > a > span,
.side-menu li.active > a > i {
	color: var(--white) !important;
}
</style>
