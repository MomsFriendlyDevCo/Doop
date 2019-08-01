<service>
module.exports = {
	url: 0/* @IMPORT: app.config.url */,
	apiUrl: 0/* @IMPORT: app.config.apiUrl */,
	isProduction: 0/* @IMPORT: app.config.isProduction */,
	title: 0/* @IMPORT: app.config.title */,
	chat: 0/* @IMPORT: app.config.chat */,
	git: 0/* @IMPORT: app.config.git */,
	session: {
		preference: 0/* @IMPORT: app.config.session.auth.preference */,
		logoutUrl: 0/* @IMPORT: app.config.session.logoutUrl */,
		signup: 0/* @IMPORT: app.config.session.signup */,
		recover: 0/* @IMPORT: app.config.session.recover */,
	},
	theme: 0/* @IMPORT: app.config.theme */,
};
</service>

<component>
module.exports = {
	route: '/debug/config',
	data() {
		return {
			$config: this.$config,
		};
	},
};
</component>

<template>
	<div class="card">
		<div class="card-body">
			<pre>{{$config}}</pre>
		</div>
	</div>
</template>
