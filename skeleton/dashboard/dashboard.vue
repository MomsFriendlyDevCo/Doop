<script lang="js" frontend>
app.component('dashboard', {
	route: '/',
	data() { return {
		companies: undefined,
		companyCount: undefined,
		users: undefined,
		userCount: undefined,
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> Promise.all([
					// Company count
					this.$session.hasPermission('companiesEdit')
						? this.$http.get('/api/companies/count')
							.then(res => this.companyCount = res.data.count)
						: null,

					// User count
					this.$session.hasPermission('usersEdit')
						? this.$http.get('/api/users/count')
							.then(res => this.userCount = res.data.count)
						: null,

					// Last 5 edited
					//this.$http.get('/api/companies?sort=edited&limit=5&select=_id,name')
					//	.then(res => this.companies = res.data),

					// Last 5 edited
					//this.$http.get('/api/users?sort=edited&limit=5&select=_id,name')
					//	.then(res => this.users = res.data),
				]))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	beforeRouteEnter(to, from, next) { // Ensure we know who the user is before we can load
		app.service.$session.promise(next);
	},
	created() {
		return this.refresh();
	},
});
</script>

<template>
	<div class="dashboard">
		<div class="row">
			<a v-permissions="'usersEdit'" v-href="{href: '/users', transition: 'slide-right'}" class="col-sm-6 col-md-3">
				<div class="card-box">
					<div class="float-left">
						<i class="fas fa-user fa-4x m-2 text-primary"/>
					</div>
					<div class="text-right">
						<h2>
							<span v-if="userCount !== undefined" class="text-dark">{{userCount | number}}</span>
							<i v-else class="fa fa-spinner fa-spin"/>
						</h2>
						<span class="text-muted">Users</span>
					</div>
				</div>
			</a>
			<a v-permissions="'companiesEdit'" v-href="{href: '/companies', transition: 'slide-right'}" class="col-sm-6 col-md-3">
				<div class="card-box">
					<div class="float-left">
						<i class="fas fa-building fa-4x m-2 text-info"/>
					</div>
					<div class="text-right">
						<h2>
							<span v-if="companyCount !== undefined" class="text-dark">{{companyCount | number}}</span>
							<i v-else class="fa fa-spinner fa-spin"/>
						</h2>
						<span class="text-muted">Companies</span>
					</div>
				</div>
			</a>
		</div>

		<!--
		<div class="row">
			<a v-for="user in users" :key="user._id" v-href="{href: `/users/${user._id}`, transition: 'slide-right'}" class="col-sm-6 col-md-3">
				<div class="card text-center">
					<div class="card-header">
						Users
					</div>
					<div class="card-body">
						<h5 class="card-title">Special title treatment</h5>
						<p class="card-text">{{user.name}}</p>
					</div>
					<div class="card-footer text-muted">
						{{user.created | date}}
					</div>
				</div>
			</a>
		</div>

		<div class="row">
			<a v-for="company in companies" :key="company._id" v-href="{href: `/companys/${company._id}`, transition: 'slide-right'}" class="col-sm-6 col-md-3">
				<div class="card text-center">
					<div class="card-header">
						Company
					</div>
					<div class="card-body">
						<h5 class="card-title">Special title treatment</h5>
						<p class="card-text">{{company.name}}</p>
					</div>
					<div class="card-footer text-muted">
						{{company.created | date}}
					</div>
				</div>
			</a>
		</div>
		-->
	</div>
</template>
