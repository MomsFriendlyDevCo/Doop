/**
* Aggregate vendor and app CSS
*
* NOTE: Requires global.paths to be defined from gulp.conf.js
*/

var cleanCSS = require('gulp-clean-css');
var colors = require('chalk');
var concat = require('gulp-concat');
var gplumber = require('gulp-plumber');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');

/**
* Compile all CSS files into the build directory
* @return {Stream}
*/
var cssBootCount = 0;
gulp.task('css', ['load:app'], function() {
	var hasErr = false;
	return gulp.src(paths.css)
		.pipe(gplumber({
			errorHandler: function(err) {
				gutil.log(colors.red('ERROR DURING CSS BUILD'));
				notify(Object.assign(app.config.gulp.notifySettings, {
					message: err.name + '\n' + err.message,
					title: app.config.title + ' - CSS Error',
				})).write(err);
				process.stdout.write(err.stack);
				hasErr = err;
				this.emit('end');
			},
		}))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
		.pipe(concat('app.min.css'))
		.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS({
			processImport: false, // Prevents 'Broken @import declaration' error during build task
		})))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write()))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			if (!hasErr && app.config.gulp.notifications)
				notify(Object.assign(app.config.gulp.notifySettings, {
					title: app.config.title + ' - CSS',
					message: 'Rebuilt frontend CSS' + (++cssBootCount > 1 ? ' #' + cssBootCount : ''),
					icon: __dirname + '/icons/css.png',
				})).write(0);
		});
});
