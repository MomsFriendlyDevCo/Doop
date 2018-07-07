var sentry = require('raven');
var url = require('url');

app.register('init', function(finish) {
	if (!app.config.sentry) return finish('Sentry config structure omitted - if you dont want to use sentry the `units/core.sentry` unit can probably be removed');
	if (!app.config.sentry.enabled) return finish();
	if (!app.config.sentry.dsn) return finish('Sentry enabled but no DSN specified in app.config.sentry.dsn');

	sentry
		.config(app.config.sentry.dsn, {
			environment: app.config.env,
			name: url.parse(app.config.url).hostname,
		})
		.install();

	finish();
});

app.register('preErrorHandler', function(finish) {
	if (!app.config.sentry || !app.config.sentry.enabled) return finish();

	app.use(sentry.errorHandler());

	finish();
});
