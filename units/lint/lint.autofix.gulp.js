var eol = require('gulp-eol');
var gulp = require('gulp');
var replace = require('gulp-replace');

gulp.task('lint:autofix', ['lint:autofix:css', 'lint:autofix:js', 'lint:autofix:html']);

gulp.task('lint:autofix:js', ['load:app'], function() {
	return gulp.src(`${paths.root}/units/**/*.js`)
		.pipe(replace(/\s+$/g, '')) // Right-Trim whitespace at end of lines
		.pipe(replace(/\(\)\s*=>\s*{/g, '()=> {')) // e.g. `()=> {...` -> `()=> {...`
		.pipe(replace(/([a-z0-9]+)\s*=>\s*/g, '$1 => ')) // e.g. `var => ` -> `var => `
		.pipe(replace(/if\(/g, 'if ('))
		.pipe(replace(/if\s*\((.+?)\)\s*{/g, 'if ($1) {'))
		.pipe(eol())
		.pipe(gulp.dest(`${paths.root}/units`))
});

gulp.task('lint:autofix:css', ['load:app'], function() {
	return gulp.src(`${paths.root}/units/**/*.css`)
		.pipe(replace(/\s+$/g, ''))
		.pipe(eol())
		.pipe(gulp.dest(`${paths.root}/units`))
});

gulp.task('lint:autofix:html', ['load:app'], function() {
	return gulp.src(`${paths.root}/units/**/*.html`)
		.pipe(replace(/\s+$/g, ''))
		.pipe(eol())
		.pipe(gulp.dest(`${paths.root}/units`))
});
