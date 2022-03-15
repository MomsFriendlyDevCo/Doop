<script lang="js" frontend>
app.component({
	route: '/users/:id',
	data() { return {
		data: undefined,
		meta: undefined,
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgChoiceDropdown',
					id: 'status',
					title: 'Status',
					required: true,
					enum: ['Inactive', 'Active', 'Deleted'],
				},
				{
					type: 'mgChoiceDropdown',
					id: 'role',
					title: 'Role',
					required: true,
					enum: ['User', 'Admin', 'Root'],
				},
				{
					type: 'mgEmail',
					id: 'email',
					title: 'Email',
					readonly: true,
					// TODO: Support functions?
					//readonly: () => this.$config.session.signup.emailAsUsername,
				},
				/*
				{
					type: 'mgText',
					id: 'username',
					title: 'Username',
					showIf: () => !this.$config.session.signup.emailAsUsername,
					readonly: true,
				},
				*/
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
		refresh() {
			if (!this.$route.params.id) return Promise.resolve();

			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/users/${this.$route.params.id}`))
				.then(({data}) => this.data = data)
				// Loading full schema for permissions regardless of what keys user has.
				.then(()=> this.$http.get('/api/users/meta'))
				.then(({data}) => this.meta = data)
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
				.then(()=> redirect && this.$router.push('/admin/users'))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debugging = true;

		this.$sitemap.setTitle('');
		return this.refresh();
	},
});
</script>

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

		<div v-if="$session.hasPermission('usersPromote')">
			<div class="col-12">
				<!-- Card: Permissions {{{ -->
				<div class="card">
					<div class="card-header">Permissions</div>
					<div class="card-body">
						<permissions-list
							v-if="$data.meta"
							:selected="$data.data.permissions"
							:spec="$data.meta"
							spec-prefix="permissions."
							@change="data.permissions = $event"
						/>
					</div>
				</div>
				<!-- }}} -->
			</div>
		</div>

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
