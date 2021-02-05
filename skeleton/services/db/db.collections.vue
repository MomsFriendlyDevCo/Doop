<script lang="js" frontend>
app.component({
	route: '/debug/db',
	created() {
		 this.$sitemap.setBreadcrumbs([
			{title: 'Admin', href: '/admin'},
			{title: 'DB', href: '/admin/db'},
		]);
	},
});
</script>

<template>
	<div class="card">
		<div class="card-header">
			<h2>Database colections</h2>
		</div>
		<div class="card-body">
			<v-table
				url="/api/db"
				:show-search="false"
				sort="name"
				:columns="[
					{
						id: 'title',
						type: 'text',
					},
					{
						id: 'docCount',
						title: 'Documents',
						type: 'number',
					},
				]"
				:cell-href="row => `/debug/db/${row._id}`"
				entity="collections"
			>
				<template #docCount="{row}">
					<digest
						field="count"
						:url="`/api/db/${row._id}/count`"
						class-invalid="badge badge-danger"
						filter="number"
					/>
				</template>
			</v-table>
		</div>
	</div>
</template>
