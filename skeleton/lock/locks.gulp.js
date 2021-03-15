var gulp = require('gulp');

gulp.task('load:app.lock', ['load:app.db'], ()=>
	app.emit('locks')
);

gulp.task('locks.clear', ['load:app.lock'], ()=>
	app.lock.clear()
);
