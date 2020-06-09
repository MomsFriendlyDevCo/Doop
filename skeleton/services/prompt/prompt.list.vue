<script>
/**
* Extension for $prompt that adds list selection
* @param {Object} [options] Options to use when displaying the prompt
* @param {array} [options.list] The list contents to display (specify either `list` or `url`)
* @param {string} [options.url] The URL to pull the list contents from
* @param {string} [options.field="title"] The field to display in the list, this can also be a CSV of fields to pull, the first is always the display and the rest are included in the data feed
* @param {number} [options.limit=30] Number of records to retrieve on each page view
* @param {string|boolean} [options.sort=true] Whether to sort the fields, if Boolean true the same field as `field` is used as the sort criteria
* @param {string} [options.searchMethod='regex'] How to search on the API endpoint. ENUM: 'regex' (use Mongo $regex method), 'q' (allow fuzzy searching)
* @returns {Promise<Object>} The selected full item (i.e. you need to extract the specific field you want yourself)
*/
app.ready.then(()=> {
	Vue.services().$prompt.list = options => Vue.services().$prompt.dialog({
		list: [],
		url: undefined,
		field: 'title',
		limit: 30,
		sort: true,
		searchMethod: 'regex',

		title: 'Select an option',
		component: 'promptList',
		buttons: null,
		dialogClose: 'reject',
		...options,
	});
})
</script>

<component>
module.exports = {
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
};
</component>

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
