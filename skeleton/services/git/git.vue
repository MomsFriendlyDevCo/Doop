<script>
app.component({
	route: '/debug/git',
	data() {
		return {
			history: [],
			$loader: this.$loader,
		};
	},
	methods: {
		refresh() {
			Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get('/api/git/history'))
				.then(res => this.history = res.data.map(h => _.set(h, 'href', `${this.$config.git.url}/commit/${h.hash}`)))
				.finally(()=> this.$loader.stop())
				.catch(this.$toast.catch)
		},
	},
	created() {
		this.refresh();
	},
});
</component>

<template>
	<div class="card">
		<div class="btn-group-float">
			<a @click="refresh()" class="btn btn-icon btn-circle btn-success far fa-sync" v-tooltip="'Refresh'"></a>
		</div>
		<div class="table-responsive">
			<table class="table table-striped table-hover" sticky-header>
				<thead>
					<tr>
						<th class="text-center">Date</th>
						<th class="text-center">Release</th>
						<th class="text-center" width="100px">Hash</th>
						<th>Author</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(row, index) in history" :class="index == 0 && 'info'" v-href="row.href">
						<td class="text-center">
							<date :date="row.date"></date>
						</td>
						<td class="text-center">
							<span class="badge badge-success">{{row.release}}</span>
						</td>
						<td class="text-center">
							<code>{{row.shortHash}}</code>
						</td>
						<td>
							{{row.committer}}
						</td>
						<td>
							{{row.subject}}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
