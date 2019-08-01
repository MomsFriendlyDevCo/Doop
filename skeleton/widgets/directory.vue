<component>
/**
* Display a directory layout
* This can also optionally take a path within the sitemap to auto-populate children
* @param {boolean} [sitemap=true] Indicates that the child contents should be pulled from the sitemap
* @param {array <Object>} [root] Root node to display, if `sitemap` is true this defaults to what the sitemap provides, otherwise specify it in here
*
* @example Display a simple directory view based on the sitemap
* <component>
* module.exports = {
*   route: '/debug',
*   template: '<directory/>',
* };
*/
module.exports = {
	data() { return {
		node: undefined,
	}},
	props: {
		sitemap: {type: Boolean, default: true},
		root: {type: Object, default() { return {} }},
	},
	created() {
		Promise.resolve()
			.then(()=> this.$loader.start('directory'))
			.then(()=> {
				if (this.$props.sitemap) {
					return this.$sitemap.promise()
						.then(()=> this.$set(this, 'node', _.merge(this.$props.root, this.$sitemap.selected.node)))
				} else {
					this.$set(this, 'node', this.$props.root);
				}
			})
			.finally(()=> this.$loader.stop('directory'))
			.catch(this.$toast.catch)
	},
};
</component>

<template>
	<div v-if="node" class="directory row">
		<a v-for="node in node.children" :key="node.id" class="col-sm-6 col-md-3" v-href="{url: node.href, transition: 'slide-right'}">
			<div class="card-box clearfix directory-item">
				<div class="directory-icon float-left">
					<i :class="(node.icon || 'fas fa-folder') + ' fa-3x m-2'"/>
				</div>
				<div class="directory-text float-left">
					<h2>{{node.title}}</h2>
				</div>
			</div>
		</a>
	</div>
</template>

<style>
.directory .directory-item {
	display: flex;
	align-items: center;
}

.directory .directory-icon {
	margin-right: 10px;
}
</style>
