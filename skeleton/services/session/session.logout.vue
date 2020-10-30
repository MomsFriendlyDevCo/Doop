<component>
module.exports = {
	route: '/logout',
	render: h => h(),
	created() {
		return this.$session.logout();
	},
	beforeRouteEnter(to, from, next) {
		next(vm => vm.$session.settings.set('redirect', from.path, 'local'))
	},
};
</component>
