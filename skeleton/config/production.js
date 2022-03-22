var colors = require('chalk');

if (!process.env.DOOP_QUIET) console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	// FIXME: project specific
	url: 'https://swordfish.mfdc.dev',
	port: process.env.PORT || 80,
	tagline: false,
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
