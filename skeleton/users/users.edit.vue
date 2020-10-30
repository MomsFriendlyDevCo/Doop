<component>
module.exports = {
	route: '/users/:id',
	data() { return {
		data: undefined,
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgText',
					id: 'name',
					title: 'Name',
					required: true,
				},
				{
					type: 'mgPermissionsList',
					id: 'permissions',
					title: 'Permissions',
					enum: [],
					showIf: () => this.$session.hasPermission('usersPromote')
				},
			]
		},
	}},
	methods: {
		refresh() {
			if (!this.$route.params.id) return Promise.resolve();

			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/users/${this.$route.params.id}`))
				.then(res => this.data = res.data)
				// Loading full schema for permissions regardless of what keys user has.
				.then(()=> this.$http.get('/api/users/meta'))
				.then(res => {
					var prefix = 'permissions.';
					for (var k in res.data) {
						if (k.indexOf(prefix) !== 0) continue;

						var key = k.substr(prefix.length);
						this.spec.items[1].enum.push({
							id: key,
							title: _.startCase(key)
								.split(' ')
								.map(word => `${word} >`)
								.join(' ')
								.replace(/ >$/, ''),
						});
					}
				})
				.then(()=> this.$sitemap.setTitle(this.data.name))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
		save(notification = false, redirect = false) {
			if (!this.$route.params.id) return Promise.resolve();

			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/users/${this.$route.params.id}`, this.data))
				.then(()=> notification && this.$toast.success('Saved'))
				.then(()=> redirect && this.$router.push('/users'))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debugging = true;

		this.$sitemap.setTitle('');
		return this.refresh();
	},
};
</component>

<template>
	<form class="form-horizontal" @submit.prevent="save(true, true)">
		<div class="btn-group-float">
			<button
				v-tooltip="'Save'"
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
