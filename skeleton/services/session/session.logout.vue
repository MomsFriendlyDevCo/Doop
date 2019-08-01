<component>
module.exports = {
	route: '/logout',
	render: h => h(),
	created() {
		return this.$session.logout();
	},
};
</component>
