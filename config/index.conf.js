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
	name: "{{FIXME.project.name}}",
	title: "{{FIXME.project.title}}",
	env: env,
	host: null, // Listen to all host requests
	port: process.env.PORT || 8080,
	url: 'http://localhost',
	secret: "{{FIXME.random}}", // A quick way to populate this is with `cat /dev/urandom | base64 | head -n10`
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
	},
	mailgun: {
		apiKey: '{{FIXME.mailgun.apiKey}}',
		domain: '{{FIXME.mailgun.domain}}',
	},
	gulp: {
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
		minifyImages: false,
	},
	mongo: {
		uri: 'mongodb://localhost/{{FIXME.project.db}}',
		options: {
			db: {
				safe: true
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
};

var config = _.merge(
	// Adopt defaults...
	defaults,

	// Which are overriden by private.conf.js if its present
	fs.existsSync(__dirname + '/private.conf.js') ? require(__dirname + '/private.conf.js') : {},

	// Which are overriden by the NODE_ENV.conf.js file if its present
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
