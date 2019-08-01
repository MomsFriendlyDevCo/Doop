<component>
module.exports = {
	route: '/login',
	data: ()=> ({
		hasError: false,
		user: {
			email: '',
			password: '',
		},
	}),
	methods: {
		login() {
			return Promise.resolve()
				.then(()=> this.$loader.start('login'))
				.then(()=> this.$session.login({
					email: this.user.email,
					password: this.user.password,
				}))
				.then(()=> $('body').removeClass('minimal'))
				.then(()=> this.$router.go('/'))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.catch(()=> this.hasError = true)
				.finally(()=> this.$loader.stop('login'))
		},
	},

	// Bind special Login styles
	beforeCreate: ()=> $('body').addClass('minimal').removeClass('bootstrapping'),
	destroyed: ()=> $('body').removeClass('minimal'),
};
</component>

<template>
	<div>
		<splash-solid background="white"/>
		<div class="container-fluid session-login">
			<div class="row d-flex justify-content-center">
				<a v-href="'/'">
					<img class="logo" src="/assets/logo/logo.svg" />
				</a>
			</div>
			<div class="row row d-flex justify-content-center">
				<div class="container col-md-4 offset-md-4 col-xs-12 m-20">
					<form class="form-horizontal" @submit.prevent="login()">
						<div class="form-group row">
							<div class="col-sm-12">
								<input type="text" name="email" v-model="user.email" placeholder="Username or email" class="form-control input-outline-primary" required autofocus/>
							</div>
						</div>

						<div class="form-group row">
							<div class="col-sm-12">
								<input type="password" name="password" v-model="user.password" placeholder="Password" class="form-control input-outline-primary" required/>
							</div>
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block">Login</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
.session-login {
	z-index: 150; /* Appear on top of particles splash screen */
	position: absolute;
	top: 0px;
	left: 0px;
	right: 0px;
	bottom: 0px;
	overflow: auto;
}

.session-login img.logo {
	max-height: 40vh;
}

.session-login .card {
	box-shadow: 0 1px 20px 0 rgba(69,90,100,.8);
}

.session-login .card {
	border-radius: 5px;
}

.session-login .logo {
	width: 50vh;
	margin-top: 10vh;
	margin-bottom: 5vh;
}

.session-login .footer {
	z-index: 1000;
}
</style>
