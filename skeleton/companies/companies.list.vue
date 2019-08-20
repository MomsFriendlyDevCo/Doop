<component name="companysList">
module.exports = {
	route: '/companies',
	data() { return {
		companies: undefined,
		query: {
			sort: '-created',
		},
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start('companies', !this.companies))
				.then(()=> this.$http.get('/api/companies', {
					params: {
						...this.query,
						sort: 'name',
					},
				}))
				.then(res => this.companies = res.data.map(company => ({
					...company,
					url: `/companies/${company._id}`,
				})))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop('companies'))
		},
	},
	created() {
		return this.refresh();
	},
};
</component>

<template name="companysList">
	<div v-if="companies" class="card">
		<div class="btn-group-float">
			<a v-href="'/companies/create'" class="btn btn-icon btn-circle btn-success fa fa-plus" v-tooltip="'Create a new company'"></a>
		</div>
		<div v-if="!companies.length" class="alert alert-warning">No companies found</div>
		<table v-else class="table table-hover">
			<thead>
				<tr>
					<th class="col-status"/>
					<th>Name</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="company in companies" v-href="{url: `/companies/${company._id}`, transition: 'slide-right'}">
					<td class="col-status">
						<i v-if="company.status == 'active'" class="fas fa-circle text-success" v-tooltip="'Company is active'"/>
						<i v-else-if="company.status == 'deleted'" class="fas fa-circle text-warning" v-tooltip="'Company has been deleted'"/>
						<i v-else class="fas fa-question-circle text-warning" v-tooltip="'Company status is unknown'"/>
					</td>
					<td>
						{{company.name}}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
