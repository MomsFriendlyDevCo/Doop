var _ = require('lodash');
var async = require('async-chainable');
var cache = require('@momsfriendlydevco/express-middleware-cache');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('load:cache', ['load:app'], ()=> {
	cache.defaults.cache = _.defaults(app.config.middleware.cache, {
		mongodb: {
			url: app.config.mongo.uri,
			collection: 'routeCache',
		},
	});
});

gulp.task('clean:cache', ['load:cache'], finish => {
	async()
		.forEach([ // Place all known cache tags here to be cleaned
			'docTree',
		], function(next, tag) {
			cache.invalidate(tag);
			gutil.log('cleaned cache tag:', tag);
			next();
		})
		.end(finish);
});
