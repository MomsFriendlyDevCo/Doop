<component>
module.exports = {
	route: '/search',
	created() {
		this.$sitemap.setTitle(`Search: ${this.$route.query.q}`);
	}
};
</component>

<template>
	<div>
		<!-- TODO: Multi-collection search results -->
		<!--
		<h4>Collection</h4>
		<v-table
			ref="collection"
			:url="`/api/collection?q=${this.$route.query.q}`"
			:columns="[
				{
					id: 'meta.title',
					title: 'Title',
					type: 'text',
					sortable: true,
				},
				{
					id: 'created',
					type: 'date',
					sortable: true,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD'})
					}
				},
				{
					id: 'edited',
					type: 'date',
					sortable: true,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD'})
					}
				},
			]"
			sort="created"
			:sortAsc="false"
			:showSearch="false"
			:cell-href="row => `/collection/${row._id}`"
			entity="collection"
		/>
		-->
	</div>
</template>
