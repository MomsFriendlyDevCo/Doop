var cache = require('@momsfriendlydevco/express-middleware-cache');
var gulp = require('gulp');

/**
* Clear out anything held by app.middleware.cache()
* NOTE: We have to ask gulp to bring in the DB in case the cache is setup to use that as its storage
*/
gulp.task('load:cache', ['load:app.db'], function(done) {
	cache.setup(app.config.middleware.cache, done);
});

gulp.task('clean:cache', ['load:cache'], function(done) {
	cache.invalidate(['assetTree', 'area'], done);
});
