<script lang="js" frontend>
app.component({
	route: '/welcome',
	routeRequiresAuth: false,
});
</script>

<template>
	<div class="session-float position-fixed d-flex flex-column vh-100">
		<div class="container flex-grow-1">
			<div class="row h-100 align-items-center justify-content-center py-5 py-lg-6">
				<div class="col-sm-10 col-md-8 col-lg-6">
					<h4 class="d-lg-none text-center mb-4">Email verified</h4>
					<div class="card bg-light shadow">
						<div class="card-body p-4">
							<h3 class="text-center d-none d-lg-block mb-4">Email verified</h3>
							<p class="text-center">
								Thank you for registering for an account.
								Your email address has been successfully verified!
							</p>
							<a href="/" class="btn btn-lg btn-primary d-block mt-4">Start using ChatStat</a>
						</div>
					</div>

				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
</style>