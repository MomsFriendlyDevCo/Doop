<component>
module.exports = {
	route: [
		'/login',
		Vue.services().$config.session.signup.enabled && '/signup',
		Vue.services().$config.session.recover.enabled && '/recover',
	].filter(i => i),
	data: ()=> ({
		mode: 'login', // ENUM: 'login', 'signup', 'recover'
		hasError: false,
		user: {
			email: '',
			password: '',
		},
	}),
	methods: {
		/**
		* Attempt to login using the current details
		* @returns {Promise} A promise which will resolve if successful
		*/
		login() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.login({
					email: this.user.email,
					password: this.user.password,
				}))
				.then(()=> $('body').removeClass('minimal'))
				.then(()=> this.$router.go('/'))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.catch(()=> this.hasError = true)
				.finally(()=> this.$loader.stop())
		},


		/**
		* Attempt to signup using the current details
		* @returns {Promise} A promise which will resolve if successful
		*/
		signup() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.signup({
					email: this.user.email,
					password: this.user.password,
				}))
				.then(()=> this.$toast.success('Please check your email for a confirmation link', {timeout: 0, position: 'centerBottom'}))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.catch(()=> this.hasError = true)
				.finally(()=> this.$loader.stop())
		},


		/**
		* Attempt to recover password details from an email address
		* @returns {Promise} A promise which will resolve if the request is successful
		*/
		recover() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				/*
				.then(()=> this.$session.recover({
					email: this.user.email,
				}))
				*/
				.then(()=> this.$toast.success('Please check your email for a password reset link', {timeout: 0, position: 'centerBottom'}))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.catch(()=> this.hasError = true)
				.finally(()=> this.$loader.stop())
		},


		/**
		* Switch to a new mode + reselect auto-focus items
		* @param {string} newMode The new mode to switch to, see `$data.mode` for an enum of available values
		*/
		setMode(newMode) {
			this.mode = newMode;
			this.$nextTick(()=> $('#wrapper input[autofocus]').focus());
		},
	},

	// Bind special Login styles
	beforeCreate: ()=> $('body').addClass('minimal').removeClass('bootstrapping'),
	destroyed: ()=> $('body').removeClass('minimal'),
};
</component>

<template>
	<div>
		<splash-popsquares
			:colors="['#e5d5ca', '#eadacf', '#f5e5da']"
			duration="5s"
			background="#faeadf"
		/>
		<div class="container-fluid session-login">
			<div class="row d-flex justify-content-center">
				<a v-href="'/'">
					<img class="logo" src="/assets/logo/logo.svg" />
				</a>
			</div>
			<div class="row row d-flex justify-content-center">
				<div class="container col-md-4 offset-md-4 col-xs-12 m-20">
					<!-- {mode: 'login'} {{{ -->
					<form v-if="mode == 'login'" class="form-horizontal" @submit.prevent="login()">
						<div class="form-group row">
							<div class="col-sm-12">
								<input type="text" name="email" v-model.trim="user.email" placeholder="Email address" class="form-control input-outline-primary" required autofocus/>
							</div>
						</div>

						<div class="form-group row">
							<div class="col-sm-12">
								<input type="password" name="password" v-model.trim="user.password" placeholder="Password" class="form-control input-outline-primary" required/>
							</div>
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block">Login</button>
						<div v-if="$config.session.signup.enabled || $config.session.recover.enabled" class="text-center text-muted mt-2 sesion-login-mode-bar">
							<a v-if="$config.session.signup.enabled" @click="setMode('signup')">sign up</a>
							<span v-if="$config.session.signup.enabled && $config.session.recover.enabled">or</span>
							<a v-if="$config.session.recover.enabled" @click="setMode('recover')">recover password</a>
						</div>
					</form>
					<!-- }}} -->
					<!-- {mode: 'signup'} {{{ -->
					<form v-else-if="mode == 'signup'" class="form-horizontal" @submit.prevent="signup()">
						<div class="row d-flex justify-content-center mb-1">
							<p>Please enter your email + password below to sign up</p>
						</div>
						<div class="form-group row">
							<div class="col-sm-12">
								<input type="text" name="email" v-model.trim="user.email" placeholder="Signup email" class="form-control input-outline-primary" required autofocus/>
							</div>
						</div>

						<div class="form-group row">
							<div class="col-sm-12">
								<input type="password" name="password" v-model.trim="user.password" placeholder="Create a password" class="form-control input-outline-primary" required/>
							</div>
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block">Signup</button>
						<div class="text-center text-muted mt-2 sesion-login-mode-bar">
							<a @click="setMode('login')">back to login</a>
							<span v-if="$config.session.recover.enabled">or</span>
							<a v-if="$config.session.recover.enabled" @click="setMode('recover')">recover password</a>
						</div>
					</form>
					<!-- }}} -->
					<!-- {mode: 'recover'} {{{ -->
					<form v-else-if="mode == 'recover'" class="form-horizontal" @submit.prevent="recover()">
						<div class="row d-flex justify-content-center mb-1">
							<p>Please enter your email address to be emailed password reset instructions</p>
						</div>
						<div class="form-group row">
							<div class="col-sm-12">
								<input type="text" name="email" v-model.trim="user.email" placeholder="Signup email" class="form-control input-outline-primary" required autofocus/>
							</div>
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block">Recover login</button>
						<div class="text-center text-muted mt-2 sesion-login-mode-bar">
							<a @click="setMode('login')">back to login</a>
						</div>
					</form>
					<!-- }}} -->
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
	max-height: 30vh;
}

.session-login .card {
	box-shadow: 0 1px 20px 0 rgba(69,90,100,.8);
}

.session-login .card {
	border-radius: 5px;
}

.session-login .logo {
	width: 50vh;
	margin-top: 15vh;
	margin-bottom: 15vh;
}

.session-login .footer {
	z-index: 1000;
}
</style>
