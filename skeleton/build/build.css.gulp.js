/**
* Aggregate vendor and app CSS
*/

var blockHead = require('gulp-block-head');
var cleanCSS = require('gulp-clean-css');
var colors = require('chalk');
var concat = require('gulp-concat');
var fspath = require('path');
var glob = require('globby');
var gplumber = require('gulp-plumber');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');

/**
* Compile all CSS files into the build directory
* @return {Stream}
*/
gulp.task('build.css', ['load:app'], ()=>
	gulp.src(glob.sync([
		'**/*.css',
		'**/*.vue',
		...app.config.paths.ignore,
	]))
		.pipe(gplumber({
			errorHandler: function(err) {
				gutil.log(colors.red('ERROR DURING CSS BUILD'));

				process.stdout.write(err.stack);
				hasErr = err;
				this.emit('end');
			},
		}))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
		.pipe(blockHead({
			default: {
				include: path => path.endsWith('.css'),
			},
			blocks: {
				style: {
					name: path => `styles/${fspath.basename(path, '.vue')}.css`,
					transform: content => content,
				},
			},
		}))
		.pipe(concat('app.css'))
		.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS({
			processImport: false, // Prevents 'Broken @import declaration' error during build task
		})))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
		.pipe(gulp.dest('./dist'))
);
