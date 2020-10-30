<component name="historyView">
/**
* Display history in human readable format
*/
module.exports = {
	route: '/history/:id',
	data() { return {
		data: {}
	}},
	methods: {
		refresh() {
			if (!this.$route.params.id) return;

			return Promise.resolve()
				.then(()=> this.loading = true)
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/history/${this.$route.params.id}`))
				.then(res => this.$data.data = res.data)
				.then(()=> this.$sitemap.setTitle('Collection: ' + this.$data.data.col))
				.then(()=> this.loading = false)
				//.then(()=> this.$timeout(()=> this.$emit('ready'), 100)) // FIXME: Part of this project?
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
	},
	created() {
		this.$debugging = true;

		return this.refresh();
	}
};
</component>

<template name="historyView">
	<div>

		<div class="card">
			<div class="card-header">
				Meta
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col col-2">
						Collection:
					</div>
					<div class="col">
						{{$data.data.col}}
					</div>
				</div>

				<div class="row">
					<div class="col col-2">
						Document:
					</div>
					<div class="col">
						{{$data.data.doc}}
					</div>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				Body
			</div>
			<div class="card-body" :inner-html.prop="$data.data.body | formatDiff">
			</div>
		</div>

		<div v-if="this.$debugging && $session.hasPermission('debug')" class="card">
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
