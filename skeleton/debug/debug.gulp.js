/**
* Various debug helpers
*/
var gulp = require('gulp');

gulp.task('app.config', 'load:app', ()=> {
	console.dump(app.config);
});
