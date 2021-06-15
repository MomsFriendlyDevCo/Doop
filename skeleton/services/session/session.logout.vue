<script lang="js" frontend>
app.component({
	route: '/logout',
	routeRequiresAuth: false,
	render: h => h(),
	created() {
		return this.$session.logout();
	},
});
</script>
