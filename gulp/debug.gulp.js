/**
* Provides tasks that output debugging information or perform debugging tests
*/

var gulp = require('gulp');
var gutil = require('gulp-util');

/**
* Dump the current config files to the console
*/
gulp.task('config', ['load:config'], function() {
	gutil.log(config);
});


/**
* Dump the full app structure to the console
* This is similar to `gulp config` but dumps the stub `app` structure also
*/
gulp.task('app', ['load:config'], function() {
	gutil.log(app);
});


/**
* Connect to the local DB (using the current config) and output all user rows
*/
gulp.task('db:test', ['load:db'], function(next) {
	gutil.log('Testing User query...');
	db.users.find({}, function(err, data) {
		if (err) {
			gutil('Got error', err.red);
		} else {
			gutil.log('Got data', data);
		}
		next(err);
	});
});
