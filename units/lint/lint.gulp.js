var fs = require('fs');
var gulp = require('gulp');
var hanson = require('hanson');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');

gulp.task('lint', ['load:app'], function() {
	var config = hanson.parse(fs.readFileSync(app.config.paths.root + '/.jshintrc', 'utf-8'));
	config.lookup = false;

	return gulp.src(app.config.paths.root + '/units/**/*.js')
		.pipe(jshint(config)) // Read config from /.jshintrc
		.pipe(jshint.reporter(jshintStylish));
});
