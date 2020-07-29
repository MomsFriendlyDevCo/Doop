<component>
module.exports = {
	route: '/users/invite',
	data() { return {
		user: {
			email: undefined,
			name: undefined,
		},
	}},
	methods: {
		submit() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.post('/api/users/invite', this.user))
				.then(()=> this.$toast.success(`Invite sent to ${this.user.name || this.user.email}`))
				.then(res => this.$router.go(`/users/${res.data._id}`))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
};
</component>

<template>
	<form class="form-horizontal" @submit.prevent="submit()">
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
						<input
							v-model="user.email"
							type="email"
							class="form-control"
							data-lpignore="true"
							autocomplete="off"
							required
							autofocus
						/>
					</div>
				</div>
				<div class="form-group row">
					<label class="col-4 col-form-label">Name (optional)</label>
					<div class="col-8 col-form-label">
						<input
							v-model="user.name"
							type="text"
							class="form-control"
							data-lpignore="true"
							autocomplete="off"
							@keyup.enter="submit()"
						/>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->

	</form>
</template>

