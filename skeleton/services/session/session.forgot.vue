<component>
module.exports = {
	route: '/forgot',
	data() { return {
		data: {
			password: undefined,
			confirmation: undefined,
		},
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
		this.$debugging = true;
	},
};
</component>

<template>
	<form class="form-horizontal" @submit.prevent="submit(true, true)">
		<div class="btn-group-float">
			<button
				v-tooltip="'Update Password'"
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

