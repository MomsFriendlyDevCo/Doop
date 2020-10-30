var gulp = require('gulp');
var replace = require('gulp-replace');

gulp.task('build.fonts', ['build.fonts.standard', 'build.fonts.fa5', 'build.fonts.minton']);

gulp.task('build.fonts.standard', 'load:app', ()=> {
	return; // This task is reserved for future use and currently does nothing

	return gulp.src([
		/*
		`${app.config.paths.root}/fonts/open-sans/${app.config.gulp.fontGlob}`,
		*/
	])
		.pipe(replace(/\/(web)?fonts\//g, '/build/fonts'))
		.pipe(gulp.dest('./dist'))
})
