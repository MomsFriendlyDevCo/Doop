// NOTE: If we import "gulp" then "finish" listener never fires
//const gulp = require('gulp');
// FIXME: Does gulpy need to extend eventer in some other manner?
const gulp = require('@momsfriendlydevco/gulpy');

require('./app.backend');

/**
* Loads main app configuration file into `global.app`
* This also populates `app.config`
* If you want `app.db` you must also call `load:app.db`
*/
gulp.task.once('load:app', ()=>
	Promise.resolve()
		.then(()=> {
			gulp.on('finish', ()=> {
				gulp.log('Gulp has finished exiting app');
				app.emit('exit');
			});
		})
		.then(() => app.setup({
			local: true,
			vendor: true, // We do require vendor loaded also as we're now loading gulp tasks from @doop packages
		}))
		.then(()=> app.emit('essential')) // Load any *.doop files required by all tasks
		.then(()=> app.emit('gulp')) // Load any *.doop files required by gulp tasks
		// NOTE: Loading 3rd party gulp tasks may fail when using local (file:../) packages
		// Throws "Task function must be specified"
		// This is due to NPM cache functioning differently in this case and gulp not being the mutated version
);
