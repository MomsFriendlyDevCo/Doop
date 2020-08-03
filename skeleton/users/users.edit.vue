<script>
app.component({
	route: '/users/:id',
	data() { return {
		user: undefined,
		spec: undefined,
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> Promise.all([
					this.$http.get(`/api/users/${this.$route.params.id}`)
						.then(res => this.user = res.data),

					this.$http.get('/api/users/meta')
						.then(res => this.spec = res.data),
				]))
				.then(()=> this.$sitemap.setTitle(this.user.name))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
		save(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/users/${this.$route.params.id}`, this.user))
				.then(()=> notification && this.$toast.success('User edits saved'))
				.then(()=> redirect && this.$router.push('/users'))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		return this.refresh();
	},
});
</script>

<template>
	<form v-if="user" class="form-horizontal" @submit.prevent="save(true, false)">
		<div class="btn-group-float">
			<a @click="save(true, true)" class="btn btn-icon btn-lg btn-circle btn-success fa fa-check" v-tooltip="'Save user edits'"></a>
		</div>

		<!-- Card: User information {{{ -->
		<div class="card">
			<div class="card-header">User information</div>
			<div class="card-body">
				<div class="form-group row">
					<label class="col-4 col-form-label">Name</label>
					<div class="col-8 col-form-label">
						<input type="text" v-model="user.name" class="form-control"/>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->

		<!-- Card: Permissions {{{ -->
		<div class="card" fixme="Should only be visible if user has project.members[].usersPromote">
			<div class="card-header">Permissions</div>
			<div class="card-body">
				<permissions
					:selected="user.permissions"
					:spec="spec"
					spec-prefix="permissions."
				/>
			</div>
		</div>
		<!-- }}} -->

	</form>
</template>
