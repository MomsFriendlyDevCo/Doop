/**
* Aggregate app HTML partials (e.g: Angular template files) into /build/partials.min.js
*/

var ngTemplateCache = require('gulp-angular-templatecache');
var gulp = require('gulp');
var minifyHtml = require('gulp-minify-html');
var notifier = require('node-notifier');

var templateBootCount = 0;
gulp.task('partials', ['load:app'], function() {
	return gulp.src(paths.ngPartials)
		.pipe(minifyHtml())
		.pipe(ngTemplateCache({
			filename: 'partials.min.js',
			module: 'app',
			standalone: false,
			root: '/units/',
		}))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			if (app.config.gulp.notifications) notifier.notify({
				title: app.config.title + ' - Partials',
				message: 'Rebuilt angular template cache ' + (++templateBootCount > 1 ? ' #' + templateBootCount : ''),
				icon: app.config.paths.root + '/gulp/icons/angular.png',
				...app.config.gulp.notifySettings,
			});
		});
});
