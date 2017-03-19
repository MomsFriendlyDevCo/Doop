var _ = require('lodash');
var async = require('async-chainable');
var braceExpansion = require('brace-expansion');
var cache = require('gulp-cache');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var fs = require('fs');
var fspath = require('path');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var vendorBootCount = 0; // Tracker for how many times we've run this task internally
gulp.task('vendors-docs', ['load:app'], function(finish) {
	async()
		.set('includes', []) // Array of all JS / CSS files we need to include in the project
		.forEach(paths.vendors.docs, function(next, dep, depIndex) { // Process all strings into paths
			// At the moment this doesn't surve a purpose but we could add extra properties here that do things like transpose individual files based on options
			this.includes[depIndex] = paths.root + '/' + dep;
			next();
		})
		.then('includes', function(next) {
			// Flatten include array (so we keep the order)
			next(null, _(this.includes)
				.map(path => braceExpansion(path))
				.flatten()
				.map(path => fspath.normalize(path))
				.value()
			);
		})
		.forEach('includes', function(next, path) {
			fs.stat(path, function(err, stats) {
				if (err) return next('Error loading dependency path "' + path + '". Maybe you should specify the file directly with file://PATH - ' + err.toString());
				if (stats.isDirectory()) return next('Dependency path "' + path + '" is a directory. This should be a file');
				next();
			});
		})
		.parallel({
			js: function(next) {
				var sources = this.includes.filter(i => /\.js$/.test(i));
				return gulp.src(sources)
					.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.init()))
					.pipe(concat('vendors-docs.min.js'))
					.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
					.pipe(gulpIf(app.config.gulp.minifyJS, uglify({mangle: false})))
					.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.write()))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
			css: function(next) {
				var sources = this.includes.filter(i => /\.css$/.test(i));
				return gulp.src(sources)
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
					.pipe(concat('vendors-docs.min.css'))
					.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS()))
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write()))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
		})
		.end(function(err) {
			if (err) return finish(err);
			gutil.log('Compiled', gutil.colors.cyan(this.js.length), 'main vendor JS scripts');
			gutil.log('Compiled', gutil.colors.cyan(this.css.length), 'main vendor CSS files');

			notify({
				title: app.config.title + ' - Docs vendors',
				message: 'Rebuilt ' + (this.js.length + this.css.length) + ' docs files' + (++vendorBootCount > 1 ? ' #' + vendorBootCount : ''),
				icon: __dirname + '/icons/doop.png',
			}).write(0);

			finish();
		});
});
