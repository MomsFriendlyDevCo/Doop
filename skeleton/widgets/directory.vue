<script>
/**
* Display a directory layout
* This can also optionally take a path within the sitemap to auto-populate children
*
* If manually specifying the `root` each item should conform to `{id, href, title, [icon="fas fa-folder"], [transition="slide-right"]}`
*
* @param {boolean} [sitemap=false] Indicates that the child contents should be pulled from the sitemap
* @param {array <Object>} [root] Root node to display, if `sitemap` is true this defaults to what the sitemap provides, otherwise specify it in here
*
* Each entry within a directory has the following properties:
* @param {string} [node.id] The unique ID of the item, if omitted `node.title` is used to uniquely identify each node
* @param {string} node.title The text title to display
* @param {string} node.href The href to link to when clicked, this can be a string, function or full v-href spec
* @param {string} [node.subTitle] A smaller title under the main title
* @param {string} [node.icon="fas fa-folder"] The icon to display
*
* @example Display a simple directory view based on the sitemap (component only)
* module.exports = {
*   route: '/debug',
*   template: '<directory :sitemap="true"/>',
* };

* @example Display a simple directory view based on the sitemap (template only)
* <directory :root="{children: widgets}"/>
*/
app.component('directory', {
	data() { return {
		node: undefined,
	}},
	props: {
		sitemap: {type: Boolean, default: false},
		root: {type: Object, default() { return {} }},
	},
	created() {
		Promise.resolve()
			.then(()=> this.$loader.start())
			.then(()=> {
				if (this.$props.sitemap) {
					return this.$sitemap.promise()
						.then(()=> this.$set(this, 'node', _.merge(this.$props.root, this.$sitemap.selected.node)))
				} else if (this.$props.root) {
					this.$watch('root', {
						immediate: true,
						deep: true,
						handler() {
							this.$set(this, 'node', this.$props.root);
						},
					});
				}
			})
			.finally(()=> this.$loader.stop())
			.catch(this.$toast.catch)
	},
});
</script>

<template>
	<div v-if="node" class="directory row">
		<a v-for="node in node.children" :key="node.id || node.title" class="directory-item col-md-6 col-lg-4 col-xl-3 mt-4" v-href="node.href">
			<div class="card h-100">
				<div class="card-body p-2">
					<div class="media align-items-center">
						<i class="directory-icon" :class="(node.icon || 'fas fa-folder') + ' fa-3x m-2'"/>
						<div class="media-body ml-1">
							<h3 class="mb-0 directory-text">{{node.title}}</h3>
							<div v-if="node.subTitle">{{node.subTitle}}</div>
						</div>
					</div>
				</div>
			</div>
		</a>
	</div>
</template>

<style>
.directory .directory-item {
}

.directory .directory-item {
	color: var(--dark);
}

.directory .directory-item:hover {
	text-decoration: none;
}

.directory .directory-item .media-body {
	overflow: hidden;
}

.directory .directory-item .directory-text {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.directory .directory-item:hover {
	color: var(--main);
}

.directory .directory-icon {
	margin-right: 10px;
}
</style>
