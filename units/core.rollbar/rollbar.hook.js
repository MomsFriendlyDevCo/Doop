var Rollbar = require('rollbar');

app.register('init', function(finish) {
	// NOTE: Late bound require - only if `!! app.config.rollbar.enabled`
	if (!app.config.rollbar) return finish('Rollbar config structure omitted - if you dont want to use Rollbar the `units/core.rollbar` unit can probably be removed');
	if (!app.config.rollbar.enabled) return finish();
	if (!app.config.rollbar.apiKey) return finish('Rollbar enabled but no API specified in app.config.rollbar.apiKey');

	app.logger = new Rollbar(app.config.rollbar.apiKey);

	finish();
});

app.register('postServer', function(finish) {
	if (!app.config.rollbar || !app.config.rollbar.enabled) return finish();

	app.use(app.logger.errorHandler());

	finish();
});
