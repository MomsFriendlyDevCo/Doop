/**
* Loads the app.git data structure for Gulp processing
*/

var git = require('./git');
var gulp = require('gulp');
var util = require('util');

gulp.task('load:app.git', ['load:app'], function(finish) {
	git.current((err, gitInfo) => {
		if (err) return finish(err);
		app.git = gitInfo;
		finish();
	});
});

gulp.task('app.git', ['load:app.git'], ()=> {
	console.log(util.inspect(app.git, {depth: null, colors: true}))
});
