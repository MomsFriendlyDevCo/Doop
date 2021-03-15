<script lang="js" frontend>
app.component({
	route: '/logout',
	render: h => h(),
	created() {
		return this.$session.logout();
	},
	beforeRouteEnter(to, from, next) {
		if (from.path === '/logout') return next();
		next(vm => vm.$session.settings.set('redirect', from.path, 'local'))
	},
});
</script>
