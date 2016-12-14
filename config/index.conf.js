/**
* App configuration
*
* This is the primary app configuration file. App defaults should be set here
* which will be overridden by any other config files using the same config fields.
*/

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var url = require('url');

// Determine 'ENV' {{{
var env = 'dev';
if (process.env.VCAP_SERVICES) {
	env = 'appfog';
} else if (process.env.OPENSHIFT_NODEJS_IP) {
	env = 'openshift';
} else if (process.env.MONGOLAB_URI) {
	env = 'heroku';
} else if (/-e\s*([a-z0-9\-\.]+)/i.test(process.argv.slice(1).join(' '))) { // exec with '-e env'
	var eargs = /-e\s*([a-z0-9\-\.]+)/i.exec(process.argv.slice(1).join(' '));
	env = eargs[1];
} else if (process.env.NODE_ENV) { // Inherit from NODE_ENV
	env = process.env.NODE_ENV;
}
// }}}

var defaults = {
	isProduction: false, // Master `is this production mode` switch - disables debugging and various other speed tweaks when enabled
	name: "doop", // FIXME: Lower case, URL compatible name, no spaces or other weirdness
	title: "Doop", // FIXME: Human friendly name
	env: env,
	host: null, // Listen to all host requests
	port: process.env.PORT || 8080,
	url: 'http://localhost',
	secret: "{{FIXME.random}}", // A quick way to populate this is with `cat /dev/urandom | base64 | head -n10`
	theme: { // Variables passed to the HTML page renderer - do not put anything private in here
		title: 'Doop',
	},
	access: {
		lockdown: false, // Set to true to lock the site with the below users
		users: [{
			user: 'user',
			pass: 'qwaszx'
		}],
	},
	email: {
		enabled: true,
		method: 'mailgun',
		from: 'noreply@{{FIXME.project.domain}}',
		to: '',
		cc: [],
		signoff: 'Doop',
	},
	gulp: {
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},
	mailgun: {
		apiKey: '{{FIXME.mailgun.apiKey}}',
		domain: '{{FIXME.mailgun.domain}}',
	},
	mongo: {
		uri: 'mongodb://localhost/doop', // FIXME: Repoint this at your database
		options: {
			db: {
				safe: true,
			}
		}
	},
	newrelic: {
		enabled: false,
		license: '{{FIXME.newrelic.license}}',
	},
	paths: {
		root: path.normalize(__dirname + '/..'),
	},
	instances: {
		enabled: false,// FIXME: Set this to true if you want to use profiles (you will also need to update units/theme/config.serv.js)
		domain: 'localhost',
		default: 'default',
	},
};


var config = _.merge(
	// Adopt defaults...
	defaults,

	// Which are overridden by gulp.conf.js if its present
	fs.existsSync(__dirname + '/gulp.conf.js') ? require(__dirname + '/gulp.conf.js') : {},

	// Which are overridden by private.conf.js if its present
	fs.existsSync(__dirname + '/private.conf.js') ? require(__dirname + '/private.conf.js') : {},

	// Which are overridden by the NODE_ENV.conf.js file if its present
	fs.existsSync(__dirname + '/' + defaults.env + '.conf.js') ? require(__dirname + '/' + defaults.env + '.conf.js') : {}
);

// Sanity checks {{{

// If config.url doesn't contain a port append it {{{
if (config.port != 80 && url.parse(config.url).port != config.port) {
	var parsedURL = url.parse(config.url);
	parsedURL.host = undefined; // Have to set this to undef to force a hostname rebuild
	parsedURL.port = config.port;
	config.url = url.format(parsedURL);
}
// }}}

// Trim remaining '/' from url {{{
config.url = _.trimEnd(config.url, '/');
// }}}
// Calculate config.publicUrl - same as config.url with port forced to 80 {{{
var parsedURL = url.parse(config.url);
parsedURL.host = undefined; // Have to set this to undef to force a hostname rebuild
parsedURL.port = undefined; // Have to set this to reset the port to default (80 doesn't work for some reason)
config.publicUrl = _.trimEnd(url.format(parsedURL), '/');
// }}}
// }}}

module.exports = config;
