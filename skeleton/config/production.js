var colors = require('chalk');

if (!process.env.DOOP_QUIET) console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	url: 'https://{{FIXME}}', // NOTE: Protocol segment will get overridden if SSL is enabled
	port: process.env.PORT || 80, // NOTE: Will get overridden if SSL is enabled
	tagline: false,
	build: {
		minimize: false, // Server has low memory and needs override
	},
	email: {
		enabled: true,
	},
	gulp: {
		notifications: false,
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: true,
	},
	hmr: {
		enabled: false,
	},
	mongo: {
		migration: false, // Enabled on primary only
	},
	papertrail: {
		enabled: true,
	},
	search: {
		exposeEngine: true,
	},
	sentry: {
		enabled: true,
	},
	session: {
		auth: {
			bypassEmptyPassword: false,
		},
	},
};
