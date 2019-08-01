/**
* Loads the app.git data structure for Gulp processing
*/

var git = require('.');
var gulp = require('gulp');

gulp.task.once('load:app.git', ['load:app'], ()=>
	git.current()
		.then(gitInfo => app.git = gitInfo)
);

gulp.task('app.git', ['load:app.git'], ()=> console.dump(app.git));
