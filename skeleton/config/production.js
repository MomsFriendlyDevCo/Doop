var colors = require('chalk');

if (!process.env.DOOP_QUIET) console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	url: '{{FIXME:productionUrl}}', // NOTE: Protocol segment will get overridden if SSL is enabled
	port: process.env.PORT || 80, // NOTE: Will get overridden if SSL is enabled
	build: {
		minimize: false, // Server has low memory and needs override
	},
	email: {
		enabled: true,
	},
	gulp: {
		notifications: false,
	},
	hmr: {
		enabled: false,
	},
	// FIXME: Is mimic not under the session key?
	mimic: {
		enabled: true, // FIXME: System is still in beta
	},
	mongo: {
		migration: false,
	},
	papertrail: {
		enabled: true,
	},
	sentry: {
		enabled: true,
	},
	session: {
		auth: {
			bypassEmptyPassword: false,
		},
	},
	// FIXME: No longer required?
	ssl: {
		enabled: false,
		redirect: false,
		port: 443,
		cert: '/etc/letsencrypt/live/{{FIXME:hostname}}/fullchain.pem',
		key: '/etc/letsencrypt/live/{{FIXME:hostname}}/privkey.pem',
	},
};
