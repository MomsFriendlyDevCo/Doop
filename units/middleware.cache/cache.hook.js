var _ = require('lodash');
var colors = require('chalk');
var cache = require('@momsfriendlydevco/express-middleware-cache');
var logger = require('express-log-url');

app.register('init', function(finish) {
	// If caching is disabled {{{
	if (!app.config.middleware.cache.enabled) {
		app.middleware.cache = function(options) { // Factory function
			return function(req, res, next) {
				logger.log({method: req.method, code: 'CSH', path: req.path, info: 'Would be cached' + (_.isString(options) ?  ` for ${options}` : '')});
				next();
			};
		};

		app.middleware.invalidate = (...tags) => {
			console.log(colors.grey(`Invalidate cache tag '${tag}' (hash ${hash}) (but caching is disabled)`));
		};

		console.log('-', colors.grey('[middleware.cache]'), 'Cache is disabled');

		return finish();
	}
	// }}}

	cache.defaults.cache = _.defaults(app.config.middleware.cache, {
		mongodb: {
			url: app.config.mongo.uri,
			collection: 'routeCache',
		},
	});

	app.middleware.cache = cache;
	app.middleware.cache.invalidate = cache.invalidate;

	var shownMethod;
	cache.events.on('routeCacheCacher', mod => {
		if (shownMethod) return; // Already advertised what module we are using
		shownMethod = true;
		console.log('-', colors.grey('[middleware.cache]'), 'Using cache module', colors.cyan(mod));
	});

	cache.events.on('routeCacheHashError', (err, req) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cache Error + ${err.toString()}`}))
	cache.events.on('routeCacheEtag', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Validated against existing etag hash ${info.hash}`}))
	cache.events.on('routeCacheExisting', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cached using existing hash ${info.hash}`}))
	cache.events.on('routeCacheFresh', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cache generate new hash ${info.hash}`}))
	cache.events.on('routeCacheInvalidate', (tag, hash) => console.log(colors.grey(`Invalidate cache tag '${tag}' (hash ${hash})`)));

	finish();
});
