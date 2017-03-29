var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	//url: 'http://localhost', // FIXME: Replace with your production URL // NOTE: Protocol segment will get overridden if SSL is enabled
	port: process.env.PORT || 80, // NOTE: Will get overridden if SSL is enabled
	gulp: {
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: true,
	},
	newrelic: {
		enabled: true,
	},
	ssl: {
		enabled: true,
		port: 443
	}
};
