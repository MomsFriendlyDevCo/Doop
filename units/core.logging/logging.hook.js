var colors = require('chalk');
var winston = require('winston');
var url = require('url');

app.register('init', function(finish) {
	app.logger = new winston.Logger({
		level: 'info',
	});

	// Add default console logger
	app.logger.add(winston.transports.Console, {
		level: 'info',
		colorize: true,
		prettyPrint: true,
		depth: 5,
		showLevel: false, // Omit the level prefix on the console
	});

	// Add Papertrail if its enabled
	if (app.config.papertrail.enabled) {
		var winstonPT = require('winston-papertrail').Papertrail;

		if (!app.config.papertrail.host || !app.config.papertrail.port) return finish('Papertrail enabled but no host or port specified in app.config.papertrail');

		app.logger.add(winston.transports.Papertrail, {
			host: app.config.papertrail.host,
			port: app.config.papertrail.port,
			hostname: url.parse(app.config.url).hostname,
		});

		console.log(colors.blue('[core.logging]'), 'Registered with Papertail as', url.parse(app.config.url).host);
	}

	// Remap console.* -> app.logger.*
	console.info = app.logger.info;
	console.log = app.logger.info;
	console.warn = app.logger.warn;
	console.error = app.logger.error;

	finish();
});
