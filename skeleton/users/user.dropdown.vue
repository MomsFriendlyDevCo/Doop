<component>
module.exports = {
	data() { return {
		$session: this.$session,
	}},
	methods: {
		refresh() {
			window.location.refresh();
		},
	},
};
</component>

<template>
	<li v-if="$session.isLoggedIn" class="dropdown notification-list topbar-dropdown">
		<a class="nav-link dropdown-toggle nav-user mr-0 waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
			<img :src="$session.data.avatarUrl" alt="user-image" class="rounded-circle">
			<span class="pro-user-name ml-1">
				{{$session.data.name || $session.data.username || $session.data.email}} <i class="mdi mdi-chevron-down"></i> 
			</span>
		</a>
		<div class="dropdown-menu dropdown-menu-right profile-dropdown ">
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
