var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build.fonts.fa5', ['build.fonts.fa5.css', 'build.fonts.fa5.font']);

gulp.task('build.fonts.fa5.css', 'load:app', ()=>
	gulp.src(`${app.config.paths.root}/fonts.fa5/fa-pro/css/all.css`, {
		allowEmpty: true
	})
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
		.pipe(concat('vendors.fonts.fa5.css'))
		.pipe(replace('../webfonts/', '/dist/fonts/'))
		.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS()))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
		.pipe(gulp.dest(`${app.config.paths.root}/dist`))
)

gulp.task('build.fonts.fa5.font', 'load:app', ()=>
	gulp.src([
		`${app.config.paths.root}/fonts.fa5/fa-pro/webfonts/${app.config.gulp.fontGlob}`,
	])
		.pipe(replace(/\/(web)?fonts\//g, '/build/fonts'))
		.pipe(gulp.dest('./dist/fonts'))
)
