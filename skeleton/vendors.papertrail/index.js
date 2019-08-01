/**
* Loader for Winston + PaperTrail logging
*
* FIXME: Formatting for PaperTrail is largely b0rked until https://github.com/kenperkins/winston-papertrail/issues/74 is resolved
*
* @returns {Promise} A promise when Winston + Papertrail is ready
*/

var _ = require('lodash');
var colors = require('chalk');
var winston = require('winston');
var winstonPapertrail = require('winston-papertrail');

module.exports = ()=> {
	if (app.config.papertrail.enabled && (!app.config.papertrail.host || !app.config.papertrail.port)) return Promise.reject('Papertrail enabled but no host or port specified in app.config.papertrail');

	if (app.config.papertrail.enabled) {
		var papertrailConnection = new winstonPapertrail.PapertrailConnection({
			level: 'info',
			host: app.config.papertrail.host,
			port: app.config.papertrail.port,
			hostname: app.config.papertrail.hostname,
			inlineMeta: true,
			//flushOnClose: true,
			//logFormatter: (level, info) => (info || []).meta.join(' '),
		});
	}

	var logger = winston.createLogger({
		level: 'info',
		format: winston.format.combine(
			winston.format.splat(),
			winston.format.printf(info => [info.message].concat(info.meta || []).join(' ')),
		),
		transports: [
			new winston.transports.Console({ // Add default console logger
				level: 'info',
				colorize: true,
				prettyPrint: true,
				depth: 5,
				showLevel: false, // Omit the level prefix on the console
			}),

			app.config.papertrail.enabled
				? new winstonPapertrail.PapertrailTransport(papertrailConnection)
				: null,
		].filter(i => i), // Remove defunct loggers
	});

	// Remap console.* -> logger.*
	console.logRaw = console.log;
	console.log = (...msg) => logger.log('info', msg.join(' '));
	console.info = console.log;
	console.warn = (...msg) => logger.log('warn', msg.join(' '));
	console.error = (...msg) => logger.log('error', msg.join(' '));

	app.refresh.log();

	// Add Papertrail if its enabled
	if (app.config.papertrail.enabled) {
		// Force colors to be enabled when logging (unless we're running inside a Lambda)
		colors.enabled = _.isUndefined(process.env.AGENT_LAMBDA);

		app.log(app.log.colors.blue('[vendors.papertrail]'), 'Registered with Papertail as', app.config.papertrail.hostname);
	}
};
