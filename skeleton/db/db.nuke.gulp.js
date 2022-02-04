const _ = require('lodash');
const mongoose = require('mongoose');

const gulp = require('gulp');

gulp.task('db:nuke', 'load:app', ()=> {
	if (app.config.env == 'production' && (!process.env.NUKE || process.env.NUKE != 'FORCE')) throw new Error('Refusing to nuke database in production! If you REALLY want to do this set `export NUKE=FORCE`');

	return Promise.resolve()
		.then(()=> _.last(app.config.mongo.uri.split('/')))
		.then(dbName => dbName || Promise.reject('Cannot determine DB name from app.config.mongo.uri'))
		.then(()=> mongoose.connect(app.config.mongo.uri, {useUnifiedTopology: true, useNewUrlParser: true}))
		.then(connection => mongoose.connection.db.dropDatabase())
		.then(()=> mongoose.disconnect())
});
