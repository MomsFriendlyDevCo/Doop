<script lang="js" frontend>
import isEmail from 'validator/lib/isEmail';

app.component({
	route: '/signup',
	routeRequiresAuth: false,
	data: ()=> ({
		data: {
			email: '',
			name: '',
			password: '',
			username: '',
		},
		form: {
			hasValidationErrors: false,
			showPassword: false,
		},
	}),
	methods: {
		signup(notification = false, redirect = false) {
			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					if (!this.$config.session.signup?.passwordInitial) return;

					// Password has to be at least 7 characters, 1 uppercase and 1 numeral
					//const isValidPassword = /(?=.*\d)(?=.*[A-Z]).{7,}/.test(this.data.password);

					// Verifiers SHOULD offer guidance to the subscriber, such as a password-strength meter [Meters], to assist the user in choosing a strong memorized secret. This is particularly important following the rejection of a memorized secret on the above list as it discourages trivial modification of listed (and likely very weak) memorized secrets [Blacklists].
					// Verifiers SHOULD NOT impose other composition rules (e.g., requiring mixtures of different character types or prohibiting consecutively repeated characters) for memorized secrets. Verifiers SHOULD NOT require memorized secrets to be changed arbitrarily (e.g., periodically). However, verifiers SHALL force a change if there is evidence of compromise of the authenticator.
					// 5.1.1.2 Memorized Secret Verifiers
					// Verifiers SHALL require subscriber-chosen memorized secrets to be at least 8 characters in length.
					// https://pages.nist.gov/800-63-3/sp800-63b.html
					const isValidPassword = /.{8,}/.test(this.data.password);

					if (
						!this.data.name
						|| !isEmail(this.data.email)
						|| !isValidPassword
					) {
						this.form.hasValidationErrors = true;
						throw new Error('Validation errors');
					}
				})
				// }}}
				.then(()=> this.$loader.start())
				.then(()=> this.$session.signup(this.data))
				.then(()=> notification && this.$toast.success(
					(this.$config.session.signup.verifyEmail) ? 'Check your email' : 'Success')
				)
				.then(()=> this.$config.session.signup?.verifyEmail && this.$router.push({
					path: '/signup/pending',
					query: { email: this.data.email },
				}))
				.then(()=> !this.$config.session.signup?.verifyEmail && redirect && this.$router.push('/login'))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
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
				<div class="d-none d-lg-block col-lg-6 pr-lg-4">
					<h4>
						<strong>
							Chatstat — an valuable supplement to every analyst’s, investor’s or researcher’s&nbsp;toolbox.
						</strong>
					</h4>
					<p class="lead">
						Enhance your financial due diligance. Chatstat allows you to monitor and analyze social sentiment and trends of the average Joe to the&nbsp;influential.
					</p>
					<a class="btn btn-dark" v-href="'/faq'">Learn more <i class="fas fa-long-arrow-right ml-1"></i></a>
				</div>
				<div class="col-sm-10 col-md-8 col-lg-6">
					<h4 class="d-lg-none text-center mb-4">Create an account</h4>
					<form class="card bg-light shadow needs-validation" :class="{'was-validated': form.hasValidationErrors}" @submit.prevent="signup(true, true)" autocomplete="off" novalidate>
						<div class="card-body p-4">
							<div class="form-horizontal">
								<div class="form-group mb-3">
									<label class="form-label" for="">
										<small class="font-weight-bold">Name</small>
									</label>
									<div class="input-group input-group-lg has-validation">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fal fa-fw fa-user"/>
											</span>
										</div>
										<input type="text" placeholder="Name" name="name" v-model="data.name" class="form-control" required autofocus />
										<div class="invalid-feedback">
											Please provide your name.
										</div>
									</div>
								</div>
							</div>
							<div class="form-group mb-3"  v-if="$config.session.signup.emailAsUsername">
								<label class="form-label" for="">
									<small class="font-weight-bold">Email</small>
								</label>
								<div class="input-group input-group-lg has-validation">
									<div class="input-group-prepend">
										<span class="input-group-text">
											<i class="fal fa-fw fa-envelope"/>
										</span>
									</div>
									<input type="email" placeholder="email@example.com" name="email" v-model="data.email" class="form-control" required autofocus />
									<div class="invalid-feedback">
										Please provide a valid email.
									</div>
								</div>
							</div>

							<div class="form-group mb-3" v-if="!$config.session.signup.emailAsUsername">
								<label class="form-label" for="">
									<small class="font-weight-bold">Username</small>
								</label>
								<div class="input-group input-group-lg has-validation">
									<div class="input-group-prepend">
										<span class="input-group-text">
											<i class="fal fa-fw fa-user"/>
										</span>
									</div>
									<input type="text" placeholder="Username" name="username" v-model="data.username" class="form-control" required autofocus />
								</div>
							</div>

							<div class="form-group mb-3" v-if="$config.session.signup.passwordInitial">
								<label class="form-label" for="">
									<small class="font-weight-bold">Password</small>
								</label>
								<div class="input-group input-group-lg has-validation">
									<div class="input-group-prepend">
										<span class="input-group-text">
											<i class="fal fa-fw fa-key"/>
										</span>
									</div>
									<input :type="form.showPassword ? 'text' : 'password'" placeholder="Password" name="password" v-model="data.password" class="form-control" pattern=".{8,}" required />
									<div class="input-group-append">
										<button class="btn btn-outline-secondary" type="button" @click="form.showPassword = !form.showPassword" v-tooltip="form.showPassword ? 'Hide password' : 'Show password'">
											<i class="far fa-fw" :class="form.showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
										</button>
									</div>
									<div class="invalid-feedback">
										<span v-if="data.password.length === 0">Please enter a password for your account.</span>
										<span v-if="data.password.length < 8">Your password must be at least eight (8) characters long.</span>
									</div>
								</div>
							</div>

							<button type="submit" class="btn btn-primary btn-lg btn-block mt-4">Create account</button>
							<hr size="0">
							<small class="text-muted text-center">
								<p v-if="$config.session.login.enabled" class="mb-0">
									Already have a account — <a href="/login" class="btn btn-sm btn-link align-baseline p-0">Login</a>
								</p>
								<p v-if="$config.session.recover.enabled" class="mb-0">
									I forgot my password — <a
										:href="$config.session.signup.emailAsUsername ? `/recover/?email=${data.email}` : `/recover/?username=${data.username}`"
										class="btn btn-sm btn-link align-baseline p-0">Reset password</a>
								</p>
							</small>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>
