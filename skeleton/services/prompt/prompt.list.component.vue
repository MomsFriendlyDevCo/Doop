<script lang="js" frontend>
app.component('promptListComponent', {
	data() { return {
		isLoading: true,
		search: '',
		list: undefined,
		mainField: undefined,
	}},
	methods: {
		refresh() {
			this.mainField = this.$prompt.settings.field.split(/\s*,\s*/, 1)[0];

			if (!this.$prompt.settings.url) { // User specified a static list
				this.isLoading = false;

				var searcher = new RegExp(this.search.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), 'i');
				this.list = this.$prompt.settings.list
					.filter(i => searcher.test(i[this.$prompt.settings.field]));

				if (this.$prompt.settings.sort)
					this.list = _.sortBy(this.list, this.$prompt.settings.sort === true ? this.mainField : this.$prompt.settings.sort);
				return ;
			}

			return Promise.resolve()
				.then(()=> this.isLoading = true)
				.then(()=> this.$loader.startBackground())
				.then(()=> console.log('$prompt req fields', this.$prompt.settings.field))
				.then(()=> this.$http.get(this.$prompt.settings.url, {
					params: {
						select: this.$prompt.settings.field,
						...(
							this.$prompt.settings.limit
								? {limit: this.$prompt.settings.limit}
								: {}
						),
						...(
							this.search && this.$prompt.settings.searchMethod == 'regex' ? {[this.mainField]: {$regex: this.search, $options: 'i'}}
							: this.search && this.$prompt.settings.searchMethod == 'q' ? {q: this.search}
							: {}
						),
						...(
							this.$prompt.settings.sort === true ? {sort: this.mainField}
							: this.$prompt.settings.sort ? {sort: this.$prompt.settings.sort}
							: {}
						)
					},
				}))
				.then(res => this.list = res.data)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
				.finally(()=> this.isLoading = false)
		},
		select(item) {
			return this.$prompt.resolve(item);
		},
	},
	mounted() {
		return this.refresh();
	},
});
</script>

<template>
	<form class="form-horizontal" @submit.prevent="refresh()">
		<div class="form-group row">
			<div class="col-12">
				<div class="input-group">
					<input type="search" v-model="search" class="form-control" placeholder="Search..." autofocus/>
					<div class="input-group-append">
						<button action="submit" class="btn btn-outline-secondary">
							<i :class="isLoading ? 'far fa-spinner fa-spin' : 'far fa-search'"/>
						</button>
					</div>
				</div>
			</div>
		</div>
		<div v-if="!isLoading">
			<div v-if="!list.length" class="alert alert-warning">No matches found</div>
			<table v-else class="table table-hover">
				<tbody>
					<tr v-for="item in list" @click="select(item)" class="clickable">
						<td>{{item[mainField]}}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</form>
</template>
