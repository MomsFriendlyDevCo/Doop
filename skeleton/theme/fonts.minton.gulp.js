var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build.fonts.minton', ['build.fonts.minton.css', 'build.fonts.minton.font']);

gulp.task('build.fonts.minton.css', 'load:app', ()=>
	gulp.src(`${app.config.paths.root}/theme/minton/css/icons.css`, {
		allowEmpty: true
	})
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
		.pipe(concat('vendors.fonts.minton.css'))
		.pipe(replace('../webfonts/', '/dist/fonts/'))
		.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS()))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
		.pipe(gulp.dest(`${app.config.paths.root}/dist`))
)

gulp.task('build.fonts.minton.font', 'load:app', ()=>
	gulp.src([
		`${app.config.paths.root}/theme/minton/fonts/${app.config.gulp.fontGlob}`,
	])
		.pipe(replace(/\/(web)?fonts\//g, '/build/fonts'))
		.pipe(gulp.dest('./dist/fonts'))
)
