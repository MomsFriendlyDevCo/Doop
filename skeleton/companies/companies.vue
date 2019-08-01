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
					},
				}))
				.then(res => this.companies = res.data.map(company => ({
					...company,
					url: `/companies/${company.companyId}`,
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
				<tr v-for="company in companies" v-href="{url: company.url, transition: 'slide-right'}">
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

<component name="companiesCreate">
module.exports = {
	route: '/companies/create',
	render: ()=> {},
	created() {
		return Promise.resolve()
			.then(()=> this.$loader.start('companiesCreate'))
			.then(()=> this.$http.post('/api/companies'))
			.then(res => this.$router.go(`/companies/${res.data.companyId}`))
			.catch(this.$toast.catch)
			.finally(()=> this.$loader.stop('companiesCreate'))
	},
};
</component>

<component name="companiesEdit">
module.exports = {
	route: '/companies/:id',
	data() { return {
		company: undefined,
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start('companiesEdit'))
				.then(()=> this.$http.get(`/api/companies/${this.$route.params.id}`))
				.then(res => this.company = res.data)
				.then(()=> this.$sitemap.setTitle(this.company.name))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop('companiesEdit'))
		},
		save(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground('companiesEditSave'))
				.then(()=> this.$http.post(`/api/companies/${this.$route.params.id}`, this.company))
				.then(()=> notification && this.$toast.success('Company edits saved'))
				.then(()=> redirect && this.$router.push('/companies'))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop('companiesEditSave'))
		},
	},
	created() {
		return this.refresh();
	},
};
</component>

<template name="companiesEdit">
	<form v-if="company" class="form-horizontal" @submit.prevent="save(true, false)">
		<div class="btn-group-float">
			<a @click="save(true, true)" class="btn btn-icon btn-lg btn-circle btn-success fa fa-check" v-tooltip="'Save company edits'"></a>
		</div>

		<!-- Card: company information {{{ -->
		<div class="card">
			<div class="card-header">Company information</div>
			<div class="card-body">
				<div class="form-group row">
					<label class="col-4 col-form-label">Name</label>
					<div class="col-8 col-form-label">
						<input type="text" v-model="company.name" class="form-control"/>
					</div>
				</div>
				<div class="form-group row">
					<label class="col-4 col-form-label">Contact emails</label>
					<div class="col-8 col-form-label">
						<emails
							:selected="company.emails"
							id-field="_id"
							@change="$set(company, 'emails', $event)"
						/>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->

	</form>
</template>
