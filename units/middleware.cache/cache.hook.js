/**
* Provides a middleware cache for routes
* @param {string} [time] @momsfriendlydevco/express-middleware-cache compatible time string
* @param {Object} [options] Additional options to pass to the caching middleware
* @param {string|array} [options.tag] Tag or tags to mark a middleware hook as - invalidate with cache.invalidate(tags
* @see https://github.com/MomsFriendlyDevCo/express-middleware-cache
*
* @example Cache an endpoint for 3 hours
* app.get('/endpoint', app.middleware.cache('3h'))
* @example Cache something with a tag for 2 minutes
* app.get('/endpoint', app.middleware.cache('2h', {tag: 'someTag'}))
* @example Invalidate a the above tag
* app.middleware.cache.invalidate('someTag')
* @example Store a value
* app.middleware.cache.set('someKey', cb)
* @example Retrieve a value
* app.middleware.cache.get('someKey', cb)
*/

app.register('preControllers', function(finish) {
	require('./loader')(finish);
});
