<script lang="js" frontend>
app.component('sitemapSidebar', {
	data: ()=> ({
		sitemapTree: [],
		lastPath: undefined, // Last route path the sitemap was refreshed for
	}),
	methods: {
		itemClick(node) {
			// NOTE: Navigation is handled by v-href anyway so we only need to toggle opening this node
			this.$set(node, 'opened', !node.opened);
			this.$set(node, 'selected', false);
			if (!node.children && this.$screen.size == 'xs') this.closeSidebar();
		},
		refresh() {
			if (this.lastPath == this.$route.path) return; // Don't regenerate if we're refreshing the same path
			this.lastPath = this.$route.path;

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
});
</script>

<template>
	<ul class="nav flex-column flex-nowrap flex-grow-1 flex-shrink-1 overflow-auto h-100">
		<!-- Level 1 - Main sidebar items -->
		<li class="nav-item" v-for="node in sitemapTree" :class="[node.opened ? 'opened' : 'closed', node.selected && 'active']">
			<a @click="itemClick(node)" v-href="node.href" class="nav-link d-flex align-items-center flex-nowrap">
				<i class="flex-grow-0 flex-shrink-0 mr-3" :class="node.icon"></i>
				<span class="flex-grow-0 flex-shrink-1 overflow-hidden text-truncate">{{node.title}}</span>
				<span v-if="node.children" class="menu-arrow flex-grow-0 flex-shrink-0 pl-2 ml-auto"/>
			</a>

			<ul class="collapse" v-if="node.children">
				<li v-for="node in node.children" :class="node.mapVerbs && node.mapVerbs.length > 0 && 'has-verbs'">
					<div v-if="node.mapVerbs && node.mapVerbs.length > 0" class="float-right">
						<a v-for="verb in node.mapVerbs" :key="verb.title" :class="verb.class" v-href="verb.href"/>
					</div>

					<a @click="itemClick(node)" v-href="node.href">
						{{node.title}}
					</a>

					<!-- Level 2 - Sub items -->
					<ul class="collapse" v-if="node.children">
						<li v-for="node in node.children">
							<a @click="itemClick(node)" v-href="node.href" class="nav-link" :class="node.selected && 'active'">
								{{node.title}}
							</a>
						</li>
					</ul>
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
	max-height: none;
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

.side-menu .collapse a.active {
	background: var(--main-highlight);
}

/* Bias width of sidebar entry in a bit so verbs don't overlap with click area */
.side-menu li.has-verbs > a {
	margin-right: 50px !important;
}
</style>
