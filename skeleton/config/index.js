/**
* App configuration
*
* This is the primary app configuration file. App defaults should be set here...
* ...which will be overridden by any other config files using the same config fields.
* ...or any call to app.configLoad(profile)
*
* Order of config precidence (earlier files are read first and overridden via merge with files loaded further down the list):
*
* 1. `config/index.js` - The base config file
* 2. `config/private.js` - Config file intended for private data storage
* 3. `config/${process.env.NODE_ENV}` - Config file based on this machines NODE_ENV environment variable
* 4. Anything specified on the command line with `-o key[=val]` (val being assumed as true if unspecified)
*
* If you wish to see the resultant config use `NODE_ENV=whatever gulp app.config` to spew the final config object
*
* NOTE: Any function values will be run as `(config)` and expected to return a sclar / array / object. This can be used to lookup final config values and inherit them from elsewhere in the tree
*/

var _ = require('lodash');
var path = require('path');
var os = require('os');

// Determine 'ENV' {{{
var env = 'dev';
if (/-e\s*([a-z0-9\-\.]+)/i.test(process.argv.slice(1).join(' '))) { // exec with '-e env'
	var eargs = /-e\s*([a-z0-9\-\.]+)/i.exec(process.argv.slice(1).join(' '));
	env = eargs[1];
} else if (process.env.NODE_ENV) { // Inherit from NODE_ENV
	env = process.env.NODE_ENV;
}
// }}}

module.exports = {
	isProduction: false, // Master `is this production mode` switch - disables debugging and various other speed tweaks when enabled
	name: '{{FIXME:name}}', // Short project name, must be unique on the system
	title: '{{FIXME:title}}',
	env: env,
	host: null, // Listen to all host requests
	port: process.env.PORT || 8080,
	url: 'http://localhost',
	apiUrl: config => config.url,
	secret: '{{FIXME}}', // Used as Cookie spice, a quick way to populate this is with `cat /dev/urandom | base64 | head -n1`
	access: {
		lockdown: false, // Set to true to lock the site with the below users
		users: [
			{user: 'user',pass: 'password'},
		],
	},
	agents: {
		autoInstall: false, // Need to enable in each profile separately
		allowImmediate: true,
		keyRewrite: config => key => `agent-${config.env}-${key}`, // Configure cache to use the site name prefix (prevents cache collosions if multiple instances are running on the same box)
		cache: {
			modules: ['filesystem'], // Disabled ['memcached', 'mongodb', 'memory'] until we can find a way around the size limits (memcached = 1mb, mongodb = 16mb)
			calculate: config => ()=> 'filesystem',
		},
		runner: {
			modules: ['pm2', 'inline'],
			calculate: config => ()=> 'pm2',
			pm2: {
				cwd: config => config.paths.root,
				env: config => session => ({
					NODE_ENV: config.env,
					AGENT: session.agent,
					AGENT_SETTINGS: JSON.stringify(session.agentSettings),
					AGENT_CACHE: session.cache,
					AGENT_LAMBDA: 1,
					AGENT_PRELOAD: `${config.paths.root}/agents/agentLoader.js`,
				}),
			},
		},
		paths: [
			config => `${config.paths.root}/**/*.agent.js`,
			//config => `${config.paths.root}/node_modules/@momsfriendlydevco/agents/examples/*.agent.js`,
		],
	},
	cache: {
		enabled: true,
		keyMangle: config => key => `${config.name}-${config.env}-${key}`, // Configure cache to use the site name prefix (prevents cache collosions if multiple instances are running on the same box)
		cleanAuto: false,
		cleanAutoInterval: '3h',
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
	dates: {
		parseFormats: ['YYYY-MM-DD', 'D/M/YYYY', 'D/M/YYYY', 'D/M/YY', 'D/M'], // Array of formats to pass to moment(value, FORMATS) to parse dates
	},
	deploy: {
		historyBookmark: 'deploy:mfdc:FIXME', // Reference to feed to app.git.historySinceBookmark() to get history since last deploy
		actions: [ // Actions to run on `gulp preDeploy` + `gulp postDeploy`
			/*
			{ // Example Slack post
				event: 'postDeploy',
				type: 'slack',
				token: 'FIXME:TOKEN',
				channel: '#FIXME:CHANNEL',
				username: 'FIXME:USERNAME',
				body: ()=> (app, history) =>
					`:zap: Deployed ${app.config.publicUrl} to \`${app.git.current.shortHash}\``
					+ (history.length
						? '\n' + history
							.map(h =>
								`:black_small_square: \`${h.shortHash}\` (${h.committer}) - ${h.subject}`
							)
							.join('\n')
						: ''
					)
			},
			*/
			/* // Example Freedcamp post
			{
				event: 'postDeploy',
				type: 'freedcamp',
				secret: 'FIXME:FC-SECRET',
				apiKey: 'FIXME:FC-APIKEY',
				projectId: 'FIXME:PROJECTID',
				subject: ()=> (app, history) => `DEPLOY: ${app.config.publicUrl} to "${app.git.current.release}" (${app.git.current.shortHash})`,
				body: ()=> (app, history) =>
					`<p>The server <a href="${app.config.publicUrl}" target="_blank">${app.config.publicUrl}</a> has been deployed to "${app.git.current.release}" (hash <code>${app.git.current.shortHash}</code>)</p>`
					+ '<ul>'
						+ history.map(h => `<li><code>${h.shortHash}</code> - ${h.subject}</li>`).join('\n')
					+ '</ul>',
				notify: [], // RegExp matches of users who should be notified
			},
			*/
		],
	},
	email: {
		enabled: true,
		method: 'mailgun',
		from: 'noreply@{{FIXME:hostname}}',
		to: '',
		cc: [],
		signoff: 'The {{FIXME:title}} Team',
	},
	git: {
		url: 'https://github.com/MomsFriendlyDevCo/{{FIXME:repoBasename}}',
	},
	gulp: {
		npmUpdate: true,
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
		watchRestart: [], // Additional files to watch and trigger a server restart when modified
		watchModules: false,
		watchModulesInclude: [], // Additional globs to count as modules when `watchModules` is enabled
		watchVendors: false,
		fontGlob: '*.{css,eot,svg,ttf,woff,woff2}', // Fonts to cache internally, can be tweaked by Cordova or other build process
	},
	hmr: { // Hot module reloading when in dev mode
		enabled: true,
		backend: true, // Allow backend to detect file changes + recompile /dist files
		frontend: true, // Allow frontend to poll + respond to module changes
	},
	layout: {
		headInject: [ // Aditional HTML compliant content to inject into the page header (line feeds added automatically)
			// '<meta name="description" content="FIXME: SEO description"/>',
		],
		csp: { // Content security policy spec
			// NOTE: 1. Do not remove empty arrays, they are here for reference and may get mutated by other middleware
			//       2. All sources are automatically Uniq'd
			'default-src': [
				`'self'`, // Allow access to this server
			],
			'connect-src': [
				`'self'`, // Allow access to this server
			],
			'frame-src': [
				`'self'`, // Allow access to this server
			],
			'font-src': [],
			'frame-src': [],
			'img-src': [
				`'self'`, // Allow access to this server
				`data:`, // Allow inline image data
				`blob:`, // Allow JS dynamic image data like webcams
			],
			'media-src': [],
			'object-src': [],
			'prefetch-src': [],
			'script-src': [
				`'self'`, // Allow access to this server
				`'unsafe-eval'`, // Used by WebPack for inline JS
			],
			'style-src': [
				`'self'`, // Allow access to this server
				`'unsafe-eval'`, // Used by WebPack for inline CSS
				`'unsafe-inline'`, // Used by Vue components
			],
			'worker-src': [],
		},
		assets: [ // Assets that the front-end requires (used when creating the Cordova sandbox and HTTP2 inject headers)
			'/dist/app.main.js',
		],
		http2Inject: config => config.layout.assets, // Links to files that should be HTTP2 injected on initial page hit
		excludeBase: [ // Array of all URL globs (if endining in '*') / RegExps to NOT serve the default layout page for, everything else gets the base layout
			'/api/*',
			'/dist/*',
			'/go/*',
		],
	},
	lock: {
		expiry: 1000 * 60 * 60, // 1 hour
		mongodb: {
			uri: config => config.mongo.uri,
			options: {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
			collection: 'locks',
		},
	},
	logging: {
		enabled: true,
		verbose: 1, // 0=off, 1=errors only, 2=all
		collections: [ // List all collection names to be tracked here
			'users',
		],
	},
	logRocket: {
		enabled: false,
		global: false, // Set to true to always enable, if false the permission below is used
		permission: 'trackingLogrocket', // If {global:false} check this user permission before enabling
		profile: '{{FIXME:logRocketProfile}}',
	},
	mailgun: {
		apiKey: '{{FIXME:mailgunApiKey}}',
		domain: 'mfdc.dev'
	},
	middleware: {
		uploads: {
			path: os.tmpdir(),
		},
	},
	mongo: {
		version: undefined, // Database version, stored locally in .git/.doop-db-version, if this mongo version is older than any migration steps it will be migrated
		migration: true, // Whether migration is enabled for this thread, enabled for dev disabled for all but one production thread
		hooks: false, // Overridden during Doop bootstrap (otherwise ignore all hook calls)
		uri: 'mongodb://localhost/FIXME-name',
		options: {},
	},
	papertrail: {
		enabled: false,
		level: 'info',
		host: '{{FIXME:papertailHost}}',
		port: 666,
		hostname: '{{FIXME:papertrailUrl}}',
		program: '',
	},
	paths: {
		ignore: [`!data`, `!dist`, `!node_modules`], // NOTE: Because the gulpfile.js loads early in the boot order it must be updated when this list changes also
		data: path.normalize(`${__dirname}/../data`),
		dist: path.normalize(`${__dirname}/../dist`),
		root: path.normalize(`${__dirname}/..`),
	},
	reports: {
		paths: [
			config => `${config.paths.root}/reports/queries`,
		],
	},
	sanity: {
		user: 'sanity',
		pass: '{{FIXME}}', // Used as as basic-auth on /sanity checks, a quick way to populate this is with `cat /dev/urandom | base64 | head -n1`
	},
	search: {
		exposeEngine: false, // Whether to expose the search engine in Searchbox compatible browsers like Chrome - https://developers.google.com/search/docs/data-types/sitelinks-searchbox
		exposeSearchUrl: 'https://query.example.com/search?q={search_term_string}',
	},
	sentry: {
		enabled: false,
		dsn: '{{FIXME:sentryDSN}}',
	},
	session: {
		auth: {
			preference: 'cookie', // Which method should the front end prefer when logging in, ENUM: 'cookie', 'authHeader'
			bypassEmptyPassword: true, // Allow login the user has a blank password in the DB (disabled in prod obviously)
			allowPost: true, // Allow POST login credentials to /login
			expiry: '6w', // Timestring compatible value to retain user login (cache)
		},
		authHeader: {
			enabled: true, // Support 'auth' header token method in backend
		},
		authApiKey: {
			enabled: true, // Support 'apikey' header token method in backend (case insensitive)
		},
		cache: {
			prefix: 'session-',
		},
		cookie: {
			enabled: true, // Support cookie logins in backend
			name: '{{FIXME:name}}-session',
			maxAge: (3600000 * 48), // 48 hours
		},
		logoutUrl: '/login', // Where to redirect to post-logout
		profile: {
			forcePermissions: { // Force permission setter (only applies to non production boxes)
				// debug: true,
			},
		},
		login: {
			enabled: true,
		},
		invite: {
			enabled: true,
		},
		recover: {
			enabled: true,
		},
		signup: {
			enabled: false,
			// FIXME: Does this belong under "signup"? Considering it may be enabled when signup is disabled.
			emailAsUsername: true,
			// TODO: allowedDomains
		},
	},
	ssl: {
		enabled: false,
		redirect: false,
		port: 443,
		cert: undefined, // Path to fullchain.pem
		key: undefined, // Path to privkey.pem
	},
	time: {
		timeZone: 'Australia/Brisbane',
	},
	theme: {
		faviconRoot: '/assets/favicons',
	},
};
