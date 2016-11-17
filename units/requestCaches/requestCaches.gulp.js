var gulp = require('gulp');

gulp.task('requestCaches:clean', ['load:app.db'], function(done) {
	db.requestCaches.clean(done);
});

gulp.task('requestCaches:nuke', ['load:app.db'], function(done) {
	db.requestCaches.nuke(done);
});
