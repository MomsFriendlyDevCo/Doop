/**
* Gulp app font build tasks
*
* NOTE: Requires global.paths to be defined from gulp.conf.js
*/

var gulp = require('gulp');
var gutil = require('gulp-util');

var common = require('./common.gulp.lib');

/**
* Copy fonts
* @return {Stream}
*/
gulp.task('fonts', ['load:config'], function() {
	var dest = paths.build + '/fonts';
	gutil.log('Copying fonts');
	return gulp
		.src(paths.fonts)
		.pipe(gulp.dest(dest));
});
