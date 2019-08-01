var sentry = require('raven');
var url = require('url');

/**
* Load Sentry and return a promise
* @returns {Promise} A promise which will resolve when Sentry is ready
*/
module.exports = ()=> {
	if (!app.config.sentry) return Promise.reject('Sentry config structure omitted - if you dont want to use sentry the `units/core.sentry` unit can probably be removed');
	if (!app.config.sentry.enabled) return Promise.resolve();
	if (!app.config.sentry.dsn) return Promise.reject('Sentry enabled but no DSN specified in app.config.sentry.dsn');

	sentry
		.config(app.config.sentry.dsn, {
			environment: app.config.env,
			name: url.parse(app.config.url).hostname,
		})
		.install();

	return Promise.resolve();
};
