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
				.then(url => this.$session.settings.unset('redirect', 'local').then(() => url))
				.then(url => redirect && this.$router.go({url, force: true}))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.finally(()=> this.$loader.stop())
		},
		recover(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.recover(this.data))
				//.then(()=> $('body').removeClass('minimal'))
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
		<splash-popsquares
			:colors="['#e5d5ca', '#eadacf', '#f5e5da']"
			duration="5s"
			background="#faeadf"
		/>
		<div class="container-fluid session-float">
			<div class="row d-flex justify-content-center">
				<a v-href="'/'">
					<img class="logo" src="/assets/logo/logo.svg" style="height: 20vh"/>
				</a>
			</div>
			<div class="row row d-flex justify-content-center">
				<div class="container col-md-4 offset-md-4 col-xs-12 m-20">
					<form class="form-horizontal" @submit.prevent="login(false, true)">
						<div v-if="$config.session.signup.emailAsUsername">
							<div class="form-group row">
								<div class="col-sm-12">
									<input type="email" name="email" v-model="data.email" placeholder="email@example.com" class="form-control input-outline-primary" required autofocus/>
								</div>
							</div>
						</div>

						<div v-if="!$config.session.signup.emailAsUsername">
							<div class="form-group row">
								<div class="col-sm-12">
									<input type="text" name="username" v-model="data.username" placeholder="Username or email" class="form-control input-outline-primary" required autofocus/>
								</div>
							</div>
						</div>

						<div class="form-group row">
							<div class="col-sm-12">
								<input type="password" name="password" v-model="data.password" placeholder="Password" class="form-control input-outline-primary" required/>
							</div>
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block">Login</button>
						<button v-on:click.prevent="recover(true, false)" class="btn btn-secondary btn-lg btn-block">Forgot Password</button>
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
