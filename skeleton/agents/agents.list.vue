<component>
module.exports = {
	route: '/debug/agents',
	methods: {
		action(id, type) {
			this.$debug('action', id, type);
			if (!id) return Promise.resolve();
			if (!type) type = '';

			return Promise.resolve()
				.then(()=> this.loading = true)
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/agents/${id}/${type}`))
				.then(res => {
					console.log('Agent Response', res.data);
					this.data = res.data;
				})
				.then(()=> this.loading = false)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
	}
};
</component>

<template>
	<div>
		<v-table
			ref="agents"
			url="/api/agents"
			:columns="[
				{
					id: 'id',
					title: 'ID',
					type: 'text',
					sortable: false,
				},
				{
					id: 'timingString',
					title: 'Timing',
					type: 'text',
					sortable: false,
				},
				{
					id: 'created',
					title: 'Created',
					type: 'text',
					sortable: false,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD'})
					}
				},
				{
					id: 'expiry',
					title: 'Expiry',
					type: 'text',
					sortable: false,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD'})
					}
				},
				{
					id: 'actions',
					title: 'Actions',
					type: 'text',
					sortable: false,
				},
			]"
			sort="id"
			:sortAsc="true"
			entity="agents"
			:showSearch="false"
		>
			<template v-slot:actions="slotProps">
				<div class="btn-group dropleft">
					<button class="btn btn-secondary btn-sm dropdown-toggle" type="button" :id="'dropdownMenuButton_' + slotProps.row.id" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<i class="fa fa-ellipsis-v"/>
					</button>
					<div class="dropdown-menu" :aria-labelledby="'dropdownMenuButton_' + slotProps.row.id">
						<a class="dropdown-item" @click="action(slotProps.row.id, 'regenerate')"><i class="far fa-sync"/>&nbsp;Regenerate</a>
						<a class="dropdown-item" @click="action(slotProps.row.id, 'invalidate')"><i class="far fa-times"/>&nbsp;Invalidate cache</a>
						<a class="dropdown-item" @click="action(slotProps.row.id)"><i class="far fa-list"/>&nbsp;Show results (Console)</a>
						<a class="dropdown-item" target="_blank" :href="`/api/agents/${slotProps.row.id}`"><i class="far fa-list"/>&nbsp;Show results (Browser)</a>
					</div>
				</div>
			</template>
		</v-table>
	</div>
</template>
