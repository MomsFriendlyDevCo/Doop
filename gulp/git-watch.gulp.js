/**
* Poll GitHub repository for changes and pull them into the local repository
*/

var gulp = require('gulp');
var gitWatch = require('gulp-git-watch');

gulp.task('git-watch', function() {
	gitWatch({
		poll: 60 * 1000, // Poll for changes every minute
	});
	// No further options necessary as nodemon should pick up on file changes and restart automatically
});
