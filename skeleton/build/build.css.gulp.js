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
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');

sass.compiler = require('sass');

/**
* Compile all CSS files into the build directory
* @return {Stream}
*/
gulp.task('build.css', ['load:app', 'build.scss', 'build.fonts'], ()=>
	gulp.src(glob.sync([
		'**/*.css',
		'**/*.vue',
		'!fonts',
		'!fonts.fa5',
		...app.config.paths.ignore,
	]))
		.pipe(gplumber({
			errorHandler: function(err) {
				gulp.log(colors.red('ERROR DURING CSS BUILD'));

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

/**
* Compile all SCSS files into the build directory
* @return {Stream}
*/
gulp.task('build.scss', ['load:app'], ()=>
	gulp.src(glob.sync([
		'**/*.scss',
		'**/*.vue',
		'!fonts',
		'!fonts.fa5',
		...app.config.paths.ignore,
	]))
		.pipe(gplumber({
			errorHandler: function(err) {
				gulp.log(colors.red('ERROR DURING SCSS BUILD'));

				process.stdout.write(err.stack);
				hasErr = err;
				this.emit('end');
			},
		}))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
		.pipe(blockHead({
			default: {
				include: path => path.endsWith('.scss'),
			},
			blocks: {
				// TODO: <style lang="sass">
				sass: {
					name: path => `styles/${fspath.basename(path, '.vue')}.scss`,
					transform: content => content,
				},
			},
		}))
		.pipe(sass({
			includePaths: [
				'./node_modules/jquery-ui',
				'./node_modules/modularscale-sass/stylesheets',
				'./node_modules/@fortawesome',
				'./node_modules/bourbon-neat/core'
			]
		}).on('error', sass.logError))
		.pipe(concat('app.sass.css'))
		.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS({
			processImport: false, // Prevents 'Broken @import declaration' error during build task
		})))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
		.pipe(gulp.dest('./dist'))
);
