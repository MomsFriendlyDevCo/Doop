var _ = require('lodash');
var colors = require('chalk');
var cache = require('@momsfriendlydevco/express-middleware-cache');
var logger = require('express-log-url');

app.register('init', function(finish) {
	cache.defaults.cache = _.defaults(app.config.middleware.cache, {
		mongodb: {
			url: app.config.mongo.uri,
			collection: 'routeCache',
		},
	});

	app.middleware.cache = cache;
	app.middleware.cache.invalidate = cache.invalidate;

	cache.events.on('routeCacheHashError', (err, req) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cache Error + ${err.toString()}`}))
	cache.events.on('routeCacheEtag', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Validated against existing etag hash ${info.hash}`}))
	cache.events.on('routeCacheExisting', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cached using existing hash ${info.hash}`}))
	cache.events.on('routeCacheFresh', (req, info) => logger.log({method: req.method, code: 'CSH', path: req.path, info: `Cache generate new hash ${info.hash}`}))
	cache.events.on('routeCacheInvalidate', (tag, hash) => console.log(colors.grey(`Invalidate cache tag '${tag}' (hash ${hash})`)));

	finish();
});
