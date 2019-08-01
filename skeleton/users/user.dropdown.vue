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
	<li v-if="$session.isLoggedIn" class="list-inline-item dropdown notification-list">
		<a class="nav-link dropdown-toggle nav-user" data-toggle="dropdown" role="button">
			<img :src="$session.data.avatarUrl" class="rounded-circle">
		</a>
		<div class="dropdown-menu dropdown-menu-right profile-dropdown">
			<h6 class="dropdown-header">
				{{$session.data.name}}
			</h6>
			<a @click="refresh()" v-if="$session.data.permissions.debug" class="dropdown-item notify-item">
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
