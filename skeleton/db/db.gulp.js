const gulp = require('@momsfriendlydevco/gulpy');
const mongoosy = require('@momsfriendlydevco/mongoosy');

let hasLoaded = false;

gulp.task.once('load:app.db', 'load:app', ()=>
	Promise.resolve()
		.then(()=> {
			if (hasLoaded) throw 'SKIP';
		})
		.then(()=> hasLoaded = true)
		.then(()=> {
			gulp.on('finish', ()=> // Clean up the database connection when we finish
				mongoosy.disconnect()
					.then(()=> gulp.log('DB Disconnected'))
			);
		})
		.then(()=> app.emit('dbInit'))
		.then(()=> app.emit('dbMiddleware'))
		.then(()=> app.emit('preSchemas'))
		.then(()=> app.emit('schemas'))
		.then(()=> app.emit('postSchemas'))
		.catch(e => e === 'SKIP' ? Promise.resolve() : e)
);
