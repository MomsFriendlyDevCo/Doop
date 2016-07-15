/**
* Gulp app images build tasks
*/

var cache = require('gulp-cache');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');

var common = require('./common.gulp.lib');

/**
* Compress images
* @return {Stream}
*/
gulp.task('images', ['load:config'], function() {
	var dest = paths.build + '/content/images';
	gutil.log('Compressing, caching, and copying images');
	return gulp
		.src(paths.images)
		// NOTE: Image optimization can SIGNIFICANTLY slow down the gulp build process and for compressions that are that great either
		.pipe(gulpIf(config.gulp.minifyImages, cache(imagemin({
			optimizationLevel: 3
		}))))
		.pipe(gulp.dest(dest));
});
