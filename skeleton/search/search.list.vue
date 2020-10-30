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
		<h4>Forms</h4>
		<v-table
			ref="forms"
			:url="`/api/forms?q=${this.$route.query.q}`"
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
			:cell-href="row => `/forms/${row._id}`"
			entity="forms"
		/>

		<h4>Templates</h4>
		<v-table
			ref="templates"
			:url="`/api/templates?q=${this.$route.query.q}`"
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
			:cell-href="row => `/templates/${row._id}`"
			entity="templates"
		/>
	</div>
</template>
