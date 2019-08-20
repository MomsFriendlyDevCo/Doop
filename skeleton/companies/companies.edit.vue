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
						<input type="text" v-model="company.name" class="form-control" autofocus/>
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
