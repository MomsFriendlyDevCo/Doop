/**
* Tasks to populate db with specific scenario data - either default or test scenarios
*/

var eval = require('gulp-eval');
var gulp = require('gulp');
var mongoosy = require('@momsfriendlydevco/mongoosy');
var scenario = require('gulp-mongoose-scenario');
var runSequence = require('run-sequence');

gulp.task('db', 'scenario');


/**
* Setup the local Mongo DB with all the files located in ./*.json
* NOTE: To prevent cached data screwing with state, this task will also clear the cache
*/
gulp.task('scenario', 'db:nuke', 'load:app.db', ()=> {
	if (app.config.env == 'production' && (!process.env.NUKE || process.env.NUKE != 'FORCE')) throw new Error('Refusing to reload database in production! If you REALLY want to do this set `export NUKE=FORCE`');

	return gulp.src([
		`${app.config.paths.root}/**/*.scenario.{js,json}`,
		'!dist/**/*',
		'!node_modules/**/*',
	])
		.pipe(eval())
		.pipe(scenario({
			nuke: true,
			connection: mongoosy.connection,
			getModels: ()=> Object.keys(app.db),
			getCollection: collection => app.db[collection],
			/*
			// FIXME: Not needed with mongoosy?
			getCollectionSchema: collection => {
				if (!app.db[collection]) throw new Error('Scenario failed attempting to populate unknown database collection: ' + collection);
				return app.db[collection].$mongooseModel.schema;
			},
			*/
		}))
		.on('error', err => finish('Error loading scenario:' + err.toString()));
});
