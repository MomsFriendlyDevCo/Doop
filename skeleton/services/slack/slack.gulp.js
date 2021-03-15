var gulp = require('gulp');

gulp.task.once('load:app.slack', 'load:app', ()=>
	app.emit('load:slack')
);
