<script lang="js" frontend>
import isEmail from 'validator/lib/isEmail';

app.component({
	route: '/recover',
	routeRequiresAuth: false,
	data: ()=> ({
		data: {
			email: undefined,
			username: undefined,
		},
		showConfirm: false,
		form: {
			hasValidationErrors: false,
		},
	}),
	methods: {
		recover(notification = false, redirect = false) {
			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					console.log(this.data);
					if (!isEmail(this.data.email)) {
						this.form.hasValidationErrors = true;
						throw new Error('Validation errors');
					}
				})
				// }}}
				.then(()=> this.$loader.start())
				.then(()=> this.$session.recover(this.data))
				.then(()=> notification && this.$toast.success('Check your email'))
				.then(()=> {this.showConfirm = true})
				.catch(e => {
					if (e.message === 'Validation errors') {
						this.$toast.catch(e, {position: 'centerBottom'});
					} else {
						this.showConfirm = true;
						this.$toast.success('Check your email');
					}
				})
				.finally(()=> this.$loader.stop())
		},

	},
	created() {
		this.$debug.enable(false);
		this.$data.data = _.pick(this.$route.query, ['email', 'username']);
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
				<div class="col-sm-10 col-md-8 col-lg-6 col-xl-5">
					<picture class="d-flex justify-content-center mb-4">
						<img src="/assets/logo/logo.svg" style="height: 9rem">
					</picture>
					<form class="card shadow needs-validation" :class="{'was-validated': form.hasValidationErrors}" @submit.prevent="recover(true, false)" novalidate>
						<div class="card-body p-4">
							<div class="form-horizontal">
								<div v-if="!showConfirm">
									<div class="form-group mb-3" v-if="$config.session.signup.emailAsUsername">
										<label class="form-label" for="">
											<small class="font-weight-bold">Email</small>
										</label>
										<div class="input-group input-group-lg">
											<span class="input-group-text">
												<i class="fal fa-fw fa-user"/>
											</span>
											<input type="email" name="email" v-model="data.email" class="form-control has-validation" required autofocus placeholder="name@example.com"/>
											<div class="invalid-feedback">
												Please provide a valid email.
											</div>
										</div>
									</div>
									<div class="form-group mb-3" v-if="!$config.session.signup.emailAsUsername">
										<label class="form-label" for="">
											<small class="font-weight-bold">Username</small>
										</label>
										<div class="input-group input-group-lg">
											<span class="input-group-text">
												<i class="fal fa-fw fa-user"/>
											</span>
											<input type="text" name="username" v-model="data.username" class="form-control" required autofocus/>
										</div>
									</div>
									<div class="d-grid mt-4">
										<button type="submit" class="btn btn-primary btn-lg btn-block">Reset password</button>
									</div>
								</div>
								<div v-else class="form-group text-center mb-3">
									<h3 class="d-none d-lg-block mb-4">Recover password</h3>
									<p v-if="$config.session.signup.emailAsUsername">An email will be sent to <u>{{data.email}}</u> if this email address is associated with a registered FIXME:title account.</p>
									<p v-if="!$config.session.signup.emailAsUsername">An email will be sent to your address if this username is associated with a registered FIXME:title account.</p>
									<br>
									<p class="mb-0">Please check your inbox and follow the instructions in this email to reset your password.</p>
								</div>
								<hr class="my-4">
								<small v-if="!showConfirm" class="text-muted text-center">
									<p class="mb-0">
										I already have an account — <a href="/login" class="btn btn-sm btn-link align-baseline p-0">Login</a>
									</p>
									<p class="mb-0">
										I don't have an account — <a href="/signup" class="btn btn-sm btn-link align-baseline p-0">Create an account</a>
									</p>
								</small>
								<small v-else class="text-muted text-center">
									<p class="mb-0">
										Still waiting for email? — <a class="btn btn-sm btn-link align-baseline p-0" v-on:click.prevent="recover(true, false)">Resend email</a>
									</p>
									<p class="mb-0">
										Whoops, I mistyped my email — <a v-on:click.prevent="showConfirm = false" class="btn btn-sm btn-link align-baseline p-0">Retype email</a>
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
