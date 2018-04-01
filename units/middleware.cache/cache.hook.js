var _ = require('lodash');
var colors = require('chalk');
var cache = require('@momsfriendlydevco/express-middleware-cache');
var logger = require('express-log-url');

app.register('preControllers', function(finish) {
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

	app.middleware.cache = cache;

	cache.events.on('routeCacheHashError', (err, req) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cache Error + ${err.toString()}`}))
	cache.events.on('routeCacheEtag', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Validated against existing etag hash ${info.hash}`}))
	cache.events.on('routeCacheExisting', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cached using existing hash ${info.hash}`}))
	cache.events.on('routeCacheFresh', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cache generate new hash ${info.hash}`}))
	cache.events.on('routeCacheInvalidate', (tag, hash) => console.log(colors.grey(`Invalidate cache tag '${tag}' (hash ${hash})`)));

	cache.setup(app.config.middleware.cache, err => {
		if (err) return finish(err);
		console.log('-', colors.grey('[middleware.cache]'), 'Using', colors.cyan(cache.cache.activeModule.id), 'caching driver');
		finish();
	});
});
