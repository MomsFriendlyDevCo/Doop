const gulp = require('gulp');

/**
* Loads main app configuration file into `global.app`
* This also populates `app.config`
* If you want `app.db` you must also call `load:app.db`
*/
gulp.task.once('load:app', ()=> {
	require('./app.backend');
	// We do require vendor loaded also as we're now loading gulp tasks from @doop packages
	return app.setup({
		local: true,
		vendor: true,
	})
		.then(()=> app.emit('essential')) // Load any *.doop files required by all tasks
		.then(()=> app.emit('gulp')); // Load any *.doop files required by gulp tasks
		// NOTE: Loading 3rd party gulp tasks may fail when using local (file:../) packages
		// Throws "Task function must be specified"
		// This is due to NPM cache functioning differently in this case and gulp not being the mutated version
});
