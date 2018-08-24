/**
* App configuration
*
* This is the primary app configuration file. App defaults should be set here
* which will be overridden by any other config files using the same config fields.
*
* NOTE: Any function values will be run as `(config)` and expected to return a sclar / array / object. This can be used to lookup final config values and inherit them from elsewhere in the tree
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
	layout: {
		headerNavbar: false, // No header navigation bar
		sidebar: false, // No side bar
		footer: false,
		isImportant: false
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
	git: {
		url: 'https://github.com/MomsFriendlyDevCo/Doop',
	},
	gulp: {
		targets: {browsers: 'last 2 versions'},
		notifications: false,
		notifySettings: {
			sound: false,
		},
		npmUpdate: true,
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},
	indexer: {
		enabled: true,
		allowImmediate: true,
		method: 'inline', // ENUM: inline, pm2
	},
	instances: {
		enabled: false, // FIXME: Set this to true if you want to use profiles (you will also need to update units/theme/config.serv.js)
		domain: 'localhost',
	},
	logging: {
		enabled: true,
		verbose: 1, // 0=off, 1=errors only, 2=all
		collections: [ // List all collection names to be tracked here
			'users',
		],
	},
	middleware: {
		cache: {
			enabled: true,
			keyMangle: config => key => `${config.name}-${config.env}-${key}`, // Configure cache to use the site name prefix (prevents cache collosions if multiple instances are running on the same box)
			modules: ['filesystem'], // Disabled ['memcached', 'mongodb', 'memory'] until we can find a way around the size limits (memcached = 1mb, mongodb = 16mb)
			memcached: {
				options: {
					maxValue: 1048576 * 10, // 10mb
				},
			},
			mongodb: {
				uri: config => config.mongo.uri,
				collection: 'caches',
			},
		},
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
		},
		plugins: ['iterators', 'rest'],
	},
	page: {
		headInject: [], // Aditional HTML compliant content to inject into the page header
	},
	papertrail: {
		enabled: false,
		host: 'logs6.papertrailapp.com',
		port: 36302,
	},
	paths: {
		data: path.normalize(__dirname + '/../data'),
		root: path.normalize(__dirname + '/..'),
	},
	sanity: {
		writability: true,
		ownership: false,
	},
	sentry: {
		enabled: false,
		dsn: '{{FIXME.sentry.dsn}}',
		slug: '{{FIXME.sentry.slug}}',
		token: '{{FIXME.sentry.token}}',

	},
	session: {
		signup: {
			loginImmediate: true, // Login the user immediately after signup
			requireUsername: false, // NOTE: If disabled the email is substitured. users.username still needs to exist as a field
			requireName: true,
			validateEmail: false, // NOTE: If enabled the user needs to support users.status='unverified-email' in its enum
			welcomeEmail: true, // Send units/emails/{signup-welcome.email.txt,signup-verify.email.html} depending on validateEmail
		},
	},
	ssl: {
		enabled: false,
		redirect: false,
		port: 443,
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

// Sanity checks + decoration {{{
// Adjust port and url if SSL is enabled {{{
if (config.ssl.enabled) {
	config.url = 'https://' + url.parse(config.url).hostname;
	config.port = config.ssl.port;
}
// }}}

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
// Flatten all functions into values (i.e. resolve them into what they should be to support recursion) {{{
config = _.cloneDeepWith(config, node => {
	if (_.isFunction(node)) {
		return node(config);
	}
	return undefined; // Let Lodash handle the rest
});
// }}}
// }}}

module.exports = config;
