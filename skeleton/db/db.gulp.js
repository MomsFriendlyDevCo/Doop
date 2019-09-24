var _ = require('lodash');
var gulp = require('@momsfriendlydevco/gulpy');
var monoxide = require('monoxide');

var hasLoaded = false;

gulp.task.once('load:app.db', 'load:app', ()=>
	Promise.resolve()
		.then(()=> {
			if (hasLoaded) throw 'SKIP';
		})
		.then(()=> hasLoaded = true)
		.then(()=> app.emit('dbInit'))
		.then(()=> gulp.on('finish', ()=> // Clean up the database connection when we finish
			monoxide.disconnect()
				.then(()=> gulp.log('DB Disconnected'))
		))
		.then(()=> app.emit('dbMiddleware'))
		.then(()=> app.emit('preSchemas'))
		.then(()=> app.emit('schemas'))
		.then(()=> app.emit('postSchemas'))
		.catch(e => e === 'SKIP' ? Promise.resolve() : e)
);
