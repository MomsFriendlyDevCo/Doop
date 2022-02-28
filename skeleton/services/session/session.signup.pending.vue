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
		<sitenav/>
		<div class="container flex-grow-1">
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
					<h4 class="d-lg-none text-center mb-4">Pending email confirmation</h4>

					<!-- TODO: Something different if email is blank? -->
					<form class="card bg-light shadow">
						<div class="card-body p-4">
							<div class="form-horizontal">
								<h3 class="text-center d-none d-lg-block mb-4">Pending email confirmation</h3>
								<p class="text-center">
									Thank you for registering for an account.
									A confirmation email has been sent to <strong>{{this.$route.query.email}}</strong>.
								</p>
								<p class="text-center">
									Please follow the instructions in the email to complete your account.
								</p>
								<hr size="0">
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
