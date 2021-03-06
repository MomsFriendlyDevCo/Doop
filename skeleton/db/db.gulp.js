var gulp = require('@momsfriendlydevco/gulpy');
var mongoosy = require('@momsfriendlydevco/mongoosy');

var hasLoaded = false;

gulp.task.once('load:app.db', 'load:app', ()=>
	Promise.resolve()
		.then(()=> {
			if (hasLoaded) throw 'SKIP';
		})
		.then(()=> hasLoaded = true)
		.then(()=> {
			gulp.on('finish', ()=> Promise.all([// Clean up the database connection when we finish
					mongoosy.disconnect()
						.then(()=> gulp.log('DB Disconnected')),

					app.dbwp && app.dbwp.destroy
						? app.dbwp.destroy().then(()=> gulp.log('DBWP Disconnected'))
						: null,
				])
			);
		})
		.then(()=> app.emit('dbInit'))
		.then(()=> app.emit('dbMiddleware'))
		.then(()=> app.emit('preSchemas'))
		.then(()=> app.emit('schemas'))
		.then(()=> app.emit('postSchemas'))
		.catch(e => e === 'SKIP' ? Promise.resolve() : e)
);
