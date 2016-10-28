/**
* Tasks to populate db with specific scenario data - either default or test scenarios
*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var monoxide = require('monoxide');
var notify = require('gulp-notify');
var scenario = require('gulp-mongoose-scenario');

/**
* Setup the local Mongo DB with all the files located in paths.scenarios.defaults
*/
gulp.task('scenario', ['load:app.db'], function(finish) {
	if (config.env == 'production') return finish('Refusing to reload database in production! If you REALLY want to do this use `NODE_ENV=something gulp db`');

	gulp.src(__dirname + '/*.json')
		.pipe(scenario({
			nuke: true,
			connection: monoxide.connection,
			getModels: () => Object.keys(app.db),
			getCollection: collection => app.db[collection],
			getCollectionSchema: collection => app.db[collection].$mongooseModel.schema,
		}))
		.on('error', function(err) {
			gutil.log('Error loading scenario'.red, err);
		})
		.on('end', function(err) {
			notify({
				title: config.title + ' - Scenario',
				message: 'Build database',
				icon: __dirname + '/icons/mongodb.png',
			}).write(0);
			finish(err);
		});
});
