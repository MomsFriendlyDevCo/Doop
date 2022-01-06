var gulp = require('gulp');

/**
* Loads main app configuration file into `global.app`
* This also populates `app.config`
* If you want `app.db` you must also call `load:app.db`
*/
gulp.task.once('load:app', ()=> {
	require('./app.backend');
	// Tell backend bootstrap that we're only interested in "local" *.doop files in Gulp context
	return app.setup({
		local: true,
		vendor: false,
	})
		.then(()=> app.emit('essencial')) // FIXME: essencial? essential
});
