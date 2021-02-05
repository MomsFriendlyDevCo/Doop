<script lang="js" frontend>
/**
* Generic universal app config
* This file gets its values injected from the app.config backend object
*/
app.service('$config', {
	url: 0/* @IMPORT: app.config.url */,
	apiUrl: 0/* @IMPORT: app.config.apiUrl */,
	isProduction: 0/* @IMPORT: app.config.isProduction */,
	title: 0/* @IMPORT: app.config.title */,
	tagline: 0/* @IMPORT: app.config.tagline */,
	chat: 0/* @IMPORT: app.config.chat */,
	git: {
		url: 0/* @IMPORT: app.config.git.url */,
		current: 0/* @IMPORT: app.git.current */,
	},
	orders: {
		country: 0/* @IMPORT: app.config.orders.country */,
		prototypeSelect: 0/* @IMPORT: app.config.orders.prototypeSelect */,
	},
	session: {
		preference: 0/* @IMPORT: app.config.session.auth.preference */,
		logoutUrl: 0/* @IMPORT: app.config.session.logoutUrl */,
		login: 0/* @IMPORT: app.config.session.login */,
		invite: 0/* @IMPORT: app.config.session.invite */,
		recover: 0/* @IMPORT: app.config.session.recover */,
		signup: 0/* @IMPORT: app.config.session.signup */,
	},
	woo: 0/* @IMPORT: app.config.woo */,
});
</script>
