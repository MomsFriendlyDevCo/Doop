var colors = require('chalk');

if (!process.env.DOOP_QUIET) console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	url: 'https://swordfish.mfdc.dev',
	port: process.env.PORT || 80,
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
};
