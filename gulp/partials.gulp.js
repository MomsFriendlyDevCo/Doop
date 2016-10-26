/**
* Aggregate app HTML partials (e.g: Angular template files)
*/

var ngTemplateCache = require('gulp-angular-templatecache');
var gulp = require('gulp');
var minifyHtml = require('gulp-minify-html');
var notify = require('gulp-notify');

var templateBootCount = 0;
gulp.task('partials', ['load:app'], function() {
	return gulp.src(paths.ngPartials)
		.pipe(minifyHtml())
		.pipe(ngTemplateCache({
			filename: 'partials.min.js',
			module: 'app',
			standalone: false,
			root: '/app/units/',
		}))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			notify({
				title: app.config.title + ' - Partials',
				message: 'Rebuilt angular template cache ' + (++templateBootCount > 1 ? ' #' + templateBootCount : ''),
				icon: __dirname + '/icons/angular.png',
			}).write(0);
		});
});
