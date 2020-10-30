<component name="reportsView">
/**
* Display report
* @param {Object} foo ???
*
*/
module.exports = {
	route: '/reports/:id',
	data() { return {
		data: undefined,
	}},
	methods: {
		save() {
			this.$debug('save', this.$route.params.id);
			if (!this.$route.params.id) return Promise.resolve();

			return Promise.resolve()
				.then(()=> this.loading = true)
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/reports/${this.$route.params.id}`))
				//.then(res => this.data = res.data)
				.then(() => this.refresh())
				.then(()=> this.loading = false)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
		refresh() {
			this.$debug('refresh', this.$route.params.id);
			if (!this.$route.params.id) return Promise.resolve();

			// TODO: Seems mostly reusable, encapsulate a loading helper?
			return Promise.resolve()
				.then(()=> this.loading = true)
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/reports`))
				.then(res => {
					this.data = res.data.find(r => r.name === this.$route.params.id);
					this.$sitemap.setTitle(this.data.title);
				})
				.then(()=> this.loading = false)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
	},
	created() {
		this.$debugging = true;

		this.$sitemap.setTitle(this.$route.params.id);
		return this.refresh();
	}
};
</component>

<template name="reportsView">
	<div class="reports-view">
		<div class="btn-group-float">
			<button
				v-tooltip="'Run report'"
				class="btn btn-icon btn-lg btn-circle btn-success"
				@click="save()"
				><i class="fa fa-check" /></button>
		</div>

		<v-table
			ref="reports"
			:limit="10"
			:url="`/api/reports/${$route.params.id}/history`"
			:columns="[
				{
					id: 'date',
					title: 'Scheduled',
					type: 'date',
					sortable: true,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD HH:mm:ss'})
					}
				},
				{
					id: 'ctime',
					title: 'Ran',
					type: 'date',
					sortable: true,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD HH:mm:ss'})
					}
				},
				{
					id: 'sizeReadable',
					title: 'Size',
					type: 'text',
					sortable: false,
				},
				{
					id: 'output',
					title: 'Output',
					type: 'text',
					sortable: false,
				},
			]"
			sort="date"
			:sortAsc="false"
			entity="reports"
			:showSearch="false"
		>
			<template v-slot:sizeReadable="slotProps">
				<span class="badge badge-info">{{slotProps.row.sizeReadable}}</span>
			</template>
			<template v-slot:output="slotProps">
				<div class="btn-group">
					<a :href="`/api/reports/${$route.params.id}/history/${slotProps.row.date}?format=json`" v-tooltip="'Export to JSON'" class="btn btn-default" target="_blank">
						<i class="far fa-file-alt"></i>
					</a>
					<a v-if="data && data.hasXLSX" :href="`/api/reports/${$route.params.id}/history/${slotProps.row.date}?format=xlsx`" v-tooltip="'Export to Excel'" class="btn btn-default" target="_blank">
						<i class="far fa-file-excel"></i>
					</a>
					<a v-if="data && data.hasCSV" :href="`/api/reports/${$route.params.id}/history/${slotProps.row.date}?format=csv`" v-tooltip="'Export to CSV'" class="btn btn-default" target="_blank">
						<i class="far fa-file-csv"></i>
					</a>
				</div>
			</template>
		</v-table>
		<!--:cell-href="row => `/api/reports/${$route.params.id}/history/${row.date}?format=json`"-->

		<div v-if="this.$debugging" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</div>
</template>
