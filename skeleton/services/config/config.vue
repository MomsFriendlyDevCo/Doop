<script lang="js" frontend>
/**
* Generic universal app config
* This file gets its values injected from the app.config backend object
*/
app.service('$config', {
	version: CONFIG.version,
	url: CONFIG.url,
	apiUrl: CONFIG.apiUrl,
	isProduction: CONFIG.isProduction,
	title: CONFIG.title,
	tagline: CONFIG.tagline,
	chat: CONFIG.chat,
	git: {
		url: CONFIG.git.url,
		current: CONFIG.git.current,
	},
	session: {
		preference: CONFIG.session.auth.preference,
		logoutUrl: CONFIG.session.logoutUrl,
		login: CONFIG.session.login,
		invite: CONFIG.session.invite,
		recover: CONFIG.session.recover,
		signup: CONFIG.session.signup,
	},
});
</script>
