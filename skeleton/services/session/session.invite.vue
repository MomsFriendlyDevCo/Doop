<component>
module.exports = {
	route: '/invite',
	data() { return {
		data: {
			_id: undefined,
			email: undefined,
			name: undefined,
			username: undefined,
		},
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
	}},
	methods: {
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
		this.$debugging = true;
	},
};
</component>

<template>
	<form class="form-horizontal" @submit.prevent="submit(true, true)">
		<div class="btn-group-float">
			<button
				v-tooltip="'Send invite'"
				type="submit"
				class="btn btn-icon btn-lg btn-circle btn-success"
				><i class="fa fa-check" /></button>
		</div>

		<mg-form
			:config="$data.spec"
			:data="$data.data"
			@changeItem="$setPath($data.data, $event.path, $event.value)"
		/>

		<div v-if="this.$debugging" v-permissions="'debug'" class="card">
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
