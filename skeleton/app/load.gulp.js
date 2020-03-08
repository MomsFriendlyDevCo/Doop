var gulp = require('gulp');

/**
* Loads main app configuration file into `global.app`
* This also populates `app.config`
* If you want `app.db` you must also call `load:app.db`
*/
gulp.task.once('load:app', ()=> {
	require('../app');
	return app.setup()
		.then(()=> app.emit('essencial'))
});
