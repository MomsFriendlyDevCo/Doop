<component>
module.exports = {
	route: '/users/invite',
	data() { return {
		user: {
			email: undefined,
			name: undefined,
			permissions: {},
		},
		spec: undefined,
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start('usersInvite'))
				.then(res => this.spec = res.data)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop('usersInvite'))
		},
		submit() {
			return Promise.resolve()
				.then(()=> this.$loader.start('usersInvite'))
				.then(()=> this.$http.post('/api/users/invite', {
					...this.user,
				}))
				.then(()=> this.$toast.success(`An invite has been sent to ${this.user.name || this.user.email}`))
				.then(res => this.$router.go(`/users`))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop('usersInvite'))
		},
	},
	created() {
		return this.refresh();
	},
};
</component>

<template>
	<form v-if="spec" class="form-horizontal" @submit.prevent="submit()">
		<div class="btn-group-float">
			<a @click="submit()" class="btn btn-icon btn-lg btn-circle btn-success fa fa-check" v-tooltip="'Send user invite'"></a>
		</div>

		<!-- Card: User information {{{ -->
		<div class="card">
			<div class="card-header">User information</div>
			<div class="card-body">
				<div class="form-group row">
					<label class="col-4 col-form-label">Email</label>
					<div class="col-8 col-form-label">
						<input type="email" v-model="user.email" class="form-control" data-lpignore="true" autocomplete="off" required autofocus/>
					</div>
				</div>
				<div class="form-group row">
					<label class="col-4 col-form-label">Name (optional)</label>
					<div class="col-8 col-form-label">
						<input type="text" v-model="user.name" class="form-control" data-lpignore="true" autocomplete="off"/>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->

	</form>
</template>

