<script lang="js" frontend>
app.component({
	route: '/invite',
	data() { return {
		data: {
			_id: undefined,
			email: undefined,
			name: undefined,
			username: undefined,
			type: undefined,
		},
		userTypes: [],
		/* MG2 implementation {{{
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgText',
					id: 'username',
					title: 'Username',
					required: true,
					showIf: () => !this.$config.session.signup.emailAsUsername
				},
				{
					type: 'mgEmail',
					id: 'email',
					title: 'Email',
					required: true,
				},
				{
					type: 'mgText',
					id: 'name',
					title: 'Name',
					required: true,
				},
			]
		},
		}}} */
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get('/api/users/types'))
				.then(res => this.userTypes = res.data)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
		submit(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.post('/api/session/invite', this.data))
				.then(res=> this.data._id = res.data._id)
				.then(()=> notification && this.$toast.success(`Invite sent to ${this.data.name || this.data.email}`))
				.then(()=> redirect && this.$router.push(`/users/${this.data._id}`))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debug.enable(false);
		// TODO: Throw a 404 when user does not have permission
		return this.refresh();
	},
});
</script>

<template>
	<form class="form-horizontal" @submit.prevent="submit(true, true)">
		<div class="btn-group-float">
			<button
				v-if="$session.hasPermission('usersInvite')"
				v-tooltip="'Send invite'"
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
			<div class="card-header">User information</div>
			<div class="card-body">
				<div class="form-group row">
					<label class="col-4 col-form-label">Email</label>
					<div class="col-8 col-form-label">
						<input
							v-model="data.email"
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
							v-model="data.name"
							type="text"
							class="form-control"
							data-lpignore="true"
							autocomplete="off"
							@keyup.enter="submit(true, false)"
						/>
					</div>
				</div>
				<div class="form-group row">
					<label class="col-4 col-form-label">Type</label>
					<div class="col-8 col-form-label">
						<select
							v-model="data.type"
							class="form-control"
							required
							>
							<option v-for="(type, idx) in userTypes" :value="type" :key="idx">{{ type }}</option>
						</select>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->

		<div v-if="$debug.$enable" v-permissions="'debug'" class="card">
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
