// FIXME: This should be the absolute init level
app.register('preControllers', function(finish) {
	// NOTE: Late bound require - only if `!! app.config.newrelic.enabled`
	if (!app.config.newrelic.enabled) return finish();

	process.env.NEW_RELIC_LICENSE_KEY = app.config.newrelic.license;
	process.env.NEW_RELIC_APP_NAME = app.config.name;
	process.env.NEW_RELIC_NO_CONFIG_FILE = true;
	process.env.NEW_RELIC_LOG_LEVEL = 'info';
	process.env.NEW_RELIC_HOME = app.config.paths.server;
	require('newrelic');

	finish();
});
