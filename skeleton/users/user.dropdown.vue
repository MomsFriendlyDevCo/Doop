<script lang="js" frontend>
/**
* User dropdown menu component
* @listens changeLocation Trigger the "Choose a location" modal
*/
app.component('userDropdown', {
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start('$session.refresh'))
				.then(()=> app.vue.$emit.promise('$session.refresh'))
				.then(()=> this.$http.post('/api/session/refresh'))
				.then(()=> window.location.reload())
				.finally(()=> this.$loader.stop('$session.refresh'));
		},
	},
});
</script>

<template>
	<li v-if="$session.isLoggedIn" class="dropdown">
		<a class="nav-link nav-user dropdown-toggle d-flex flex-row-reverse align-items-center mr-0 waves-effect waves-light"
			:id="_uid"
			data-toggle="dropdown"
			href="#" role="button"
			aria-haspopup="false"
			aria-expanded="false">
			<avatar size="32" :user="$session.data"/>
			<span class="pro-user-name d-none d-md-inline mr-1">
				{{$session.data.name || $session.data.username || $session.data.email}} <i class="mdi mdi-chevron-down"></i> 
			</span>
		</a>
		<div class="dropdown-menu dropdown-menu-right profile-dropdown" :aria-labelledby="_uid" role="menu">
			<!--div class="dropdown-header noti-title">
				<h6 class="text-overflow m-0">Welcome !</h6>
			</div-->

			<a v-href="'/profile'" class="dropdown-item notify-item">
				<i class="far fa-user"></i>
				<span>My Account</span>
			</a>

			<a @click="refresh()" v-permissions="'debug'" class="dropdown-item notify-item">
				<i class="far fa-redo"></i>
				<span>Force refresh</span>
			</a>

			<a v-href="'/logout'" class="dropdown-item notify-item">
				<i class="far fa-sign-out"></i>
				<span>Logout</span>
			</a>
		</div>
	</li>
</template>
