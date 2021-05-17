var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	url: '{{FIXME:productionUrl}}', // NOTE: Protocol segment will get overridden if SSL is enabled
	port: process.env.PORT || 80, // NOTE: Will get overridden if SSL is enabled
	gulp: {
		notifications: false,
		debugJS: false,
		minifyJS: false, // FIXME: Untested
		debugCSS: false,
		minifyCSS: false, // FIXME: Untested
	},
	hmr: {
		enabled: false,
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
	ssl: {
		enabled: false,
		redirect: false,
		port: 443,
		cert: '/etc/letsencrypt/live/{{FIXME:hostname}}/fullchain.pem',
		key: '/etc/letsencrypt/live/{{FIXME:hostname}}/privkey.pem',
	},
};
