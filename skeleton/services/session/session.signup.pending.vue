<script lang="js" frontend>
app.component({
	route: '/signup/pending',
	routeRequiresAuth: false,
	methods: {
		recover(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$session.signup({ email: this.$route.query.email }))
				.then(()=> notification && this.$toast.success('Check your email'))
				.then(()=> redirect && this.$router.push('/login'))
				.catch(e => this.$toast.catch(e, {position: 'centerBottom'}))
				.finally(()=> this.$loader.stop())
		},
	},
});
</script>

<template>
	<div class="session-float d-flex flex-column vh-100">
		<div class="container flex-grow-1">
			<div class="row h-100 align-items-center justify-content-center py-5 py-lg-6">
				<div class="col-sm-10 col-md-8 col-lg-6 col-xl-5">
					<picture class="d-flex justify-content-center mb-4">
						<img src="/assets/logo/logo.svg" style="height: 9rem">
					</picture>

					<!-- TODO: Something different if email is blank? -->
					<form class="card shadow">
						<div class="card-body p-4">
							<div class="form-horizontal">
								<h3 class="text-center d-none d-lg-block mb-4">Pending email confirmation</h3>
								<p class="text-center">
									Thank you for registering for an account.
									A confirmation email has been sent to <u>{{this.$route.query.email}}</u>.
								</p>
								<p class="text-center">
									Please follow the instructions in the email to complete your account.
								</p>
								<hr class="my-4">
								<small class="text-muted text-center">
									<p class="mb-0">
										Still waiting for an email? — <button v-on:click.prevent="recover(true, false)" class="btn btn-sm btn-link align-baseline p-0">Resend email</button>
									</p>
									<p class="mb-0">
										I've confirmed my email — <a href="/login" class="btn btn-sm btn-link align-baseline p-0">Login</a>
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
