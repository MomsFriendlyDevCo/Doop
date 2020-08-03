<script>
app.component({
	route: '/logout',
	render: h => h(),
	created() {
		return this.$session.logout();
	},
});
</script>
