<script>
/**
* $config service
* This is a dumb controller which provides various imports from app.config exposed to the front end
*/
app.service('$config', {
	data() { return {
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
	}},
});
</script>

<script>
app.controller({
	route: '/debug/config',
});
</script>

<template>
	<div class="card">
		<div class="card-body">
			<pre>{{$config}}</pre>
		</div>
	</div>
</template>
