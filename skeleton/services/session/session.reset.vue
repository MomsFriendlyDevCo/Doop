<script lang="js" frontend>
app.component({
	route: '/reset',
	data() { return {
		data: {
			password: undefined,
			confirmation: undefined,
		},
		/* MG2 implementation {{{
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgPassword',
					id: 'password',
					title: 'Password',
					required: true,
					autoComplete: 'new-password',
				},
				{
					type: 'mgPassword',
					id: 'confirmation',
					title: 'Confirmation',
					required: true,
					autoComplete: 'new-password',
				},
			]
		},
		}}} */
	}},
	methods: {
		submit(notification = false, redirect = false) {
			var doc = { password: this.data.password };

			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					if (!this.data.password) throw new Error('No password provided');
					// TODO: Configurable password rules, regex?
					//if (!this.data.password.length) throw new Error('Password below minimum length');
					if (this.data.password !== this.data.confirmation) throw new Error('Passwords do not match');
				})
				// }}}
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/users/${this.$session.data._id}`, doc))
				.then(()=> notification && this.$toast.success('Updated password saved'))
				.then(()=> redirect && this.$router.push('/'))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debug.enable(false);
	},
});
</script>

<template>
	<form class="form-horizontal" @submit.prevent="submit(true, true)">
		<div class="btn-group-float">
			<button
				v-tooltip="'Update Password'"
				type="submit"
				class="btn btn-icon btn-lg btn-circle btn-success"
				><i class="fa fa-check" /></button>
		</div>

		<!--mg-form
			:config="$data.spec"
			:data="$data.data"
			@changeItem="$setPath($data.data, $event.path, $event.value)"
		/-->

		<!-- Card: User information {{{ -->
		<div class="card">
			<div class="card-header">Password Reset</div>
			<div class="card-body">
				<div class="form-group row">
					<label class="col-4 col-form-label">Password</label>
					<div class="col-8 col-form-label">
						<input
							v-model="data.password"
							type="password"
							class="form-control"
							data-lpignore="true"
							autocomplete="off"
							required
							autofocus
						/>
					</div>
				</div>
				<div class="form-group row">
					<label class="col-4 col-form-label">Confirmation</label>
					<div class="col-8 col-form-label">
						<input
							v-model="data.confirmation"
							type="password"
							class="form-control"
							data-lpignore="true"
							autocomplete="off"
							required
						/>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->

		<div v-if="$debug.isEnabled" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</form>
</template>

