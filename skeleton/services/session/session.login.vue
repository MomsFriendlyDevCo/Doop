<script lang="js" frontend>
app.component({
	route: '/login',
	routeRequiresAuth: false,
	data: ()=> ({
		data: {
			email: '',
			username: '',
			password: '',
		},
		form: {
			hasValidationErrors: false,
			showPassword: false,
			validationError: "",
		},
	}),
	methods: {
		login(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.form.hasValidationErrors = false)
				.then(()=> this.$session.login(this.data))
				.then(()=> $('body').removeClass('minimal'))
				.then(()=> notification && this.$toast.success('Successful Login'))
				.then(()=> this.$session.settings.get('redirect', '/'))
				.then(url=> this.$session.settings.unset('redirect', 'local').then(() => url))
				.then(url=> redirect && this.$router.push(url))
				.catch(e => {
					if (e.toString().startsWith('NavigationDuplicated')) return; // Ignore $router complaints
					if (e.err === 'User not active') return this.$router.push({
						path: '/signup/pending',
						query: { email: this.data.email },
					});
					this.form.hasValidationErrors = true
					this.form.validationError = e;
					// this.$toast.catch(e, {position: 'centerBottom'});
				})
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debug.enable(false);
		if (_.has(this.$route.query, 'failure'))
			this.$toast.catch('There was a issue with the confirmation link. Please try again, if issue persists contact support', {timeout:0});
	},

	// Bind special Login styles
	beforeCreate: ()=> $('body').addClass('minimal').removeClass('bootstrapping'),
	destroyed: ()=> $('body').removeClass('minimal'),
});
</script>

<template>
	<div class="session-float d-flex flex-column vh-100">
		<div class="container flex-grow-1 pt-6">
			<div class="row h-100 align-items-center justify-content-center py-5 py-lg-6">
				<!--
				TODO: Insertable header, whitelabel session template
				<div class="d-none d-lg-block col-lg-6 pr-lg-4">
				</div>
				-->
				<div class="col-sm-10 col-md-8 col-lg-6">
					<h4 class="d-lg-none text-center mb-4">Welcome back!</h4>
					<form class="card bg-light shadow" @submit.prevent="login(false, true)">
						<div class="card-body p-4">
							<div class="form-horizontal">
								<div class="form-group mb-3" v-if="$config.session.signup.emailAsUsername">
									<label class="form-label" for="">
										<small class="font-weight-bold">Email</small>
									</label>
									<div class="input-group input-group-lg">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fal fa-fw fa-user"/>
											</span>
										</div>
										<input type="email" name="email" v-model="data.email" class="form-control" required autofocus placeholder="you@example.com"/>
									</div>
								</div>
								<div class="form-group mb-3" v-if="!$config.session.signup.emailAsUsername">
									<label class="form-label" for="">
										<small class="font-weight-bold">Username</small>
									</label>
									<div class="input-group input-group-lg">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fal fa-fw fa-user"/>
											</span>
										</div>
										<input type="text" name="username" v-model="data.username" class="form-control" required autofocus placeholder="Username or email"/>
									</div>
								</div>

								<div class="form-group mb-3">
									<label class="form-label" for="">
										<small class="font-weight-bold">Password</small>
									</label>
									<div class="input-group input-group-lg">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fal fa-fw fa-key"/>
											</span>
										</div>
										<input type="password" name="password" v-model="data.password" class="form-control" required placeholder="Password"/>
									</div>
								</div>
								<div v-if="form.hasValidationErrors" class="alert alert-warning text-center" role="alert">
									<small class="font-weight-bold">Error:</small>
									<small class="form-label" >{{form.validationError}}</small>
								</div>


								<button type="submit" class="btn btn-primary btn-lg btn-block">Login</button>

								<hr size="0">
								<small class="text-muted text-center">
									<p class="mb-0">
										I forgot my password — <a
											:href="$config.session.signup.emailAsUsername ? `/recover/?email=${data.email}` : `/recover/?username=${data.username}`"
											class="btn btn-sm btn-link align-baseline p-0">Reset password</a>
									</p>
									<p class="mb-0">
										I don't have an account — <a href="/signup" class="btn btn-sm btn-link align-baseline p-0">Create an account</a>
									</p>
								</small>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
.session-float {
	z-index: 150; /* Appear on top of particles splash screen */
	position: absolute;
	top: 0px;
	left: 0px;
	right: 0px;
	bottom: 0px;
	overflow: auto;
	display: flex;
	background: var(--main);
}

.session-float .card {
	border-radius: 5px;
}

.session-float .footer {
	z-index: 1000;
}
</style>
