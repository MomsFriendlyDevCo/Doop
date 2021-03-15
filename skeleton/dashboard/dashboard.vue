<script lang="js" frontend>
app.component('dashboard', {
	route: '/',
	data() { return {
		companies: undefined,
		users: undefined,
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> Promise.all([
					this.$session.data.permissions.companiesEdit
						? this.$http.get('/api/companies/count?status=active')
							.then(res => this.companies = res.data.count)
						: null,
					this.$session.data.permissions.usersEdit
						? this.$http.get('/api/users/count?status=active')
							.then(res => this.users = res.data.count)
						: null,
				]))
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
	<div>
		<div class="row">
			<a v-if="$session.data.permissions.usersEdit" v-href="{href: '/users', transition: 'slide-right'}" class="col-sm-6 col-md-3">
				<div class="card-box">
					<div class="float-left">
						<i class="fas fa-user fa-4x m-2 text-primary"/>
					</div>
					<div class="text-right">
						<h2>
							<span v-if="users !== undefined" class="text-dark">{{users | number}}</span>
							<i v-else class="fa fa-spinner fa-spin"/>
						</h2>
						<span class="text-muted">Users</span>
					</div>
				</div>
			</a>
			<a v-if="$session.data.permissions.companiesEdit" v-href="{href: '/companies', transition: 'slide-right'}" class="col-sm-6 col-md-3">
				<div class="card-box">
					<div class="float-left">
						<i class="fas fa-building fa-4x m-2 text-info"/>
					</div>
					<div class="text-right">
						<h2>
							<span v-if="companies !== undefined" class="text-dark">{{companies | number}}</span>
							<i v-else class="fa fa-spinner fa-spin"/>
						</h2>
						<span class="text-muted">Companies</span>
					</div>
				</div>
			</a>
		</div>
	</div>
</template>
