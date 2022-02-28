const cache = require('.');
const promisify = require('util').promisify;

const gulp = require('gulp');

/**
* Clear out anything held by app.cache / app.middleware.cache
* NOTE: We have to ask gulp to bring in the DB in case the cache is setup to use that as its storage
*/
gulp.task.once('load:app.cache', 'load:app.db', ()=> cache().then(()=> app.emit('cache')));

gulp.task('clean:cache', 'load:app.cache', ()=>
	Promise.all(
		Object.keys(app.caches).map(id => promisify(app.caches[id].clear)())
	)
);
