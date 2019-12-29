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

<component name="sitemapBreadcrumbs">
module.exports = {
	data() {
		return {
			$sitemap: this.$sitemap,
		};
	},
}
</component>

<template name="sitemapBreadcrumbs">
	<!-- Only show breadcrumb area if we have a valid node AND not mobile -->
	<div v-if="$sitemap.selected.node" class="page-header">
		<h4 class="page-title">
			<span v-if="$sitemap.selected.node.options" class="dropdown">
				<a class="dropdown-toggle" data-toggle="dropdown">{{$sitemap.selected.node.title}}</a>
				<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
					<a v-for="option in $sitemap.selected.node.options" :key="option.title" class="dropdown-item" v-href="option.href">{{option.title}}</a>
				</div>
			</span>
			<a v-else v-href="{href: $sitemap.selected.node.href, transition: 'slide-left'}">
				{{$sitemap.selected.node.titleLong || $sitemap.selected.node.title}}
			</a>
			<span v-if="$sitemap.selected.node.verbs" class="btn-group">
				<a v-for="verb in $sitemap.selected.node.verbs" :key="verb.title" :class="verb.classTitle || verb.class" v-tooltip="verb.tooltip || verb.title" v-href="{href: verb.href}"/>
			</span>
		</h4>
		<ol class="breadcrumb">
			<li class="breadcrumb-item">
				<a v-href="{href: '/', transition: 'slide-left'}">
					<i class="far fa-home"/>
				</a>
			</li>
			<li v-for="node in $sitemap.selected.path" class="breadcrumb-item" :class="node == $sitemap.selected.node && 'active'">
				<span v-if="node.options" class="dropdown">
					<a class="dropdown-toggle link" data-toggle="dropdown">{{node.title}}</a>
					<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
						<a v-for="option in node.options" :key="option.title" class="dropdown-item" v-href="option.href">{{option.title}}</a>
					</div>
				</span>
				<a v-else v-href="{href: node.href, transition: 'slide-left'}">
					{{node.title}}
				</a>
				<span v-if="node.verbs" class="btn-group">
					<a v-for="verb in node.verbs" :key="verb.title" :class="verb.classBreadcrumb || verb.class" v-tooltip="verb.tooltip || verb.title" v-href="verb.href"/>
				</span>
			</li>
		</ol>
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

<component name="sitemapMap">
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
				.then(()=> this.$loader.start())
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
				.finally(()=> this.$loader.stop())
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

<template name="sitemapMap">
	<ul class="nav flex-column flex-nowrap flex-grow-1 flex-shrink-1 overflow-auto">
		<li class="nav-item" v-for="node in sitemapTree" :class="node.opened ? 'opened' : 'closed'">
			<a @click="itemClick(node)" v-href="node.href" class="nav-link d-flex align-items-center flex-nowrap">
				<i class="flex-grow-0 flex-shrink-0 mr-3" :class="node.icon"></i>
				<span class="flex-grow-0 flex-shrink-1 overflow-hidden text-truncate">{{node.title}}</span>
				<span v-if="node.children" class="menu-arrow flex-grow-0 flex-shrink-0 pl-2 ml-auto">
				</span>
			</a>
			<ul class="collapse" v-if="node.children">
				<li v-for="node in node.children">
					<a @click="itemClick(node)" v-href="node.href" class="nav-link">
						{{node.title}}
					</a>
				</li>
			</ul>
		</li>
	</ul>
</template>

<style>
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

.side-menu ul {
	overflow-x: hidden !important;
}

.side-menu .menu-arrow {
	transition: transform 0.3s ease-out;
}

.side-menu .opened .menu-arrow {
	transform: rotate(90deg);
}

.side-menu li > a {
	border: 0 !important;
	white-space: nowrap;
}

.side-menu li.active > a {
	background: var(--main);
}

.side-menu li.active > a,
.side-menu li.active > a > span,
.side-menu li.active > a > i {
	color: var(--white) !important;
}

.side-menu li.opened .collapse {
	display: block !important;
}
</style>
