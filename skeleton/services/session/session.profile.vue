<script lang="js" frontend>
app.component({
	route: '/profile',
	data() { return {
		data: {
			username: undefined,
			email: undefined,
			name: undefined,
		},
		/* MG2 implementation {{{
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgText',
					id: 'username',
					title: 'Username',
					disabled: true,
					showIf: () => !this.$config.session.signup.emailAsUsername
				},
				{
					type: 'mgEmail',
					id: 'email',
					title: 'Email',
					disabled: true,
				},
				{
					type: 'mgText',
					id: 'name',
					title: 'Name',
				},
				{
					type: 'mgCode',
					id: 'settings',
					title: 'Settings',
				},
			]
		},
		}}} */
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/session`))
				.then(res => this.data = res.data)
				.then(()=> this.$sitemap.setTitle(this.data.name || this.data.username || this.data.email))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
		save(notification = false, redirect = false) {
			console.log('Save disabled.');
			return Promise.resolve();
			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					//if (!this.data.username) throw new Error('No username provided');
					if (!this.data.name) throw new Error('No name provided');
				})
				// }}}
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/session`, this.data))
				.then(()=> notification && this.$toast.success('Saved'))
				.then(()=> redirect && this.$router.push('/'))
				.then(()=> !redirect && this.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debugging = true;

		return this.refresh();
	},
});
</script>

<template>
	<form class="form-horizontal" @submit.prevent="save(true, false)">
		<!--div class="btn-group-float">
			<button
				v-tooltip="'Save'"
				type="submit"
				class="btn btn-icon btn-lg btn-circle btn-success"
				><i class="fa fa-check" /></button>
		</div-->

		<div class="row">
			<div class="col-lg-4 col-xl-4">
				<div class="card text-center">
					<div class="card-body">
						<img :src="$session.data.avatarUrl" class="rounded-circle avatar-xl img-thumbnail"
						alt="profile-image">

						<h4 class="mt-3 mb-0">{{data.name}}</h4>
						<p class="text-muted">{{data.email}}</p>

					</div>
				</div> <!-- end card-box -->
			</div> <!-- end col-->
		</div>
		<!-- end row-->

		<div v-if="this.$debugging && $session.hasPermission('debug')" class="card">
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

