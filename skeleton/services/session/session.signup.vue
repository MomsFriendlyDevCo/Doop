<component>
module.exports = {
	route: '/signup',
	data: ()=> ({
		data: {
			email: '',
			username: '',
		},
	}),
	methods: {
		signup(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.signup(this.data))
				.then(()=> notification && this.$toast.success('Check your email'))
				.then(()=> redirect && this.$router.push('/login'))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debugging = true;
	},

	// Bind special Login styles
	beforeCreate: ()=> $('body').addClass('minimal').removeClass('bootstrapping'),
	destroyed: ()=> $('body').removeClass('minimal'),
};
</component>

<template>
	<div>
		<splash-solid background="white"/>
		<splash-substrate
			stroke-color="#83d3f5"
		/>
		<div class="container-fluid session-float">
			<div class="row d-flex justify-content-center">
				<a v-href="'/'">
					<img class="logo" src="/assets/logo/logo.svg" style="height: 20vh"/>
				</a>
			</div>
			<div class="row row d-flex justify-content-center">
				<div class="container col-md-4 offset-md-4 col-xs-12 m-20">
					<form class="form-horizontal" @submit.prevent="signup(true, false)">

						<div v-if="$config.session.signup.emailAsUsername">
							<div class="form-group row">
								<div class="col-sm-12">
									<input type="email" placeholder="email@example.com" name="email" v-model="data.email" class="form-control input-outline-primary" required autofocus />
								</div>
							</div>
						</div>

						<div v-if="!$config.session.signup.emailAsUsername">
							<div class="form-group row">
								<div class="col-sm-12">
									<input type="text" placeholder="Username" name="username" v-model="data.username" class="form-control input-outline-primary" required autofocus />
								</div>
							</div>
							<div class="form-group row">
								<div class="col-sm-12">
									<input type="email" placeholder="email@example.com" name="email" v-model="data.email" class="form-control input-outline-primary" required />
								</div>
							</div>
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block">Signup</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>
