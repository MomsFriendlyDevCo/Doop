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
	}),
	methods: {
		login(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.login(this.data))
				.then(()=> $('body').removeClass('minimal'))
				.then(()=> notification && this.$toast.success('Successful Login'))
				.then(()=> this.$session.settings.get('redirect', '/'))
				.then(url=> this.$session.settings.unset('redirect', 'local').then(() => url))
				.then(url=> redirect && this.$router.push(url))
				.catch(e => {
					if (e.toString().startsWith('NavigationDuplicated')) return; // Ignore $router complaints
					this.$toast.catch(e, {position: 'centerBottom'});
				})
				.finally(()=> this.$loader.stop())
		},
		recover(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.recover(this.data))
				.then(()=> notification && this.$toast.success('Check your email'))
				.then(()=> redirect && this.$router.push('/login'))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.finally(()=> this.$loader.stop())
		},
	},

	// Bind special Login styles
	beforeCreate: ()=> $('body').addClass('minimal').removeClass('bootstrapping'),
	destroyed: ()=> $('body').removeClass('minimal'),
});
</script>

<template>
	<div>
		<div class="container-fluid session-float">
			<div>
				<div class="row d-flex justify-content-center">
					<a v-href="'/'">
						<img class="logo" src="/assets/logo/logo.svg" style="height: 20vh"/>
					</a>
				</div>
				<form class="form-horizontal row row d-flex justify-content-center card p-3" @submit.prevent="login(false, true)">
					<div class="form-group row" v-if="$config.session.signup.emailAsUsername">
						<div class="col-sm-12">
							<div class="input-group mb-3">
								<div class="input-group-prepend">
									<span class="input-group-text">
										<i class="fal fa-user"/>
									</span>
								</div>
								<input type="email" name="email" v-model="data.email" class="form-control input-outline-primary" required autofocus placeholder="you@example.com"/>
							</div>
						</div>
					</div>

					<div class="form-group row" v-if="!$config.session.signup.emailAsUsername">
						<div class="col-sm-12">

							<div class="input-group mb-3">
								<div class="input-group-prepend">
									<span class="input-group-text">
										<i class="fal fa-user"/>
									</span>
								</div>
								<input type="text" name="username" v-model="data.username" class="form-control input-outline-primary" required autofocus placeholder="Username or email"/>
							</div>
						</div>
					</div>

					<div class="form-group row">
						<div class="col-sm-12">
							<div class="input-group mb-3">
								<div class="input-group-prepend">
									<span class="input-group-text">
										<i class="fal fa-key"/>
									</span>
								</div>
								<input type="password" name="password" v-model="data.password" class="form-control input-outline-primary" required placeholder="**********"/>
							</div>
						</div>
					</div>

					<button type="submit" class="btn btn-primary btn-lg btn-block">Login</button>
					<button v-on:click.prevent="recover(true, false)" class="btn btn-link btn-block text-muted font-sm p-0">Forgot Password</button>
				</form>
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
	justify-content: center;
	align-items: center;
}

.session-float .card {
	box-shadow: 0 1px 20px 0 rgba(69,90,100,.8);
}

.session-float .card {
	border-radius: 5px;
}

.session-float .logo {
	width: 50vh;
	margin-top: 5vh;
	margin-bottom: 5vh;
}

.session-float .footer {
	z-index: 1000;
}
</style>
