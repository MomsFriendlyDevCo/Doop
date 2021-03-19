<script lang="js" frontend>
app.component('sitemapHorizontal', {
	data: ()=> ({
		sitemapTree: [],
		lastPath: undefined, // Last route path the sitemap was refreshed for
	}),
	methods: {
		itemClick(node) {
			// NOTE: Navigation is handled by v-href anyway so we only need to toggle opening this node
			this.$set(node, 'opened', !node.opened);
			this.$set(node, 'selected', false);
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
	},
	created() {
		this.$on('$sitemap.update', this.refresh);
		this.$watch('$route', this.refresh);
	},
});
</script>

<template>
	<nav v-bind="{...$props, ...$attrs}" aria-role="navigation">
		<slot name="left"></slot>
		<a role="menuitem" 
			v-for="node in sitemapTree"
			:key="node.id"
			:class="[node.opened ? 'opened' : 'closed', node.selected && 'active']"
			@click="itemClick(node)"
			v-href="node.href"
			data-bind="click: $root.closeHamburger, attr: { href: hash }, html: title, css: { active: isActive }">{{node.title}}</a>
		<slot name="right"></slot>
	</nav>
</template>
