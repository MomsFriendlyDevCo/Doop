/**
* Tasks to populate db with specific scenario data - either default or test scenarios
*/

var gulp = require('gulp');
var mongoosy = require('@momsfriendlydevco/mongoosy');

gulp.task('db', 'scenario');


/**
* Setup the local Mongo DB with all the files located in ./*.json
* NOTE: To prevent cached data screwing with state, this task will also clear the cache
*/
gulp.task('scenario', 'db:nuke', 'load:app.db', ()=> {
	if (app.config.env == 'production' && (!process.env.NUKE || process.env.NUKE != 'FORCE')) throw new Error('Refusing to reload database in production! If you REALLY want to do this set `export NUKE=FORCE`');

	return mongoosy.scenario([
		`${app.config.paths.root}/**/*.scenario.{js,json}`,
		'!dist/**/*',
		'!node_modules/**/*',
	], {
		circular: true,
		nuke: true,
		postStats(stats) {
			gulp.log(gulp.colors.blue.bold('Created collections:'));
			Object.entries(stats).forEach(([collection, count]) =>
				gulp.log('*', gulp.colors.cyan.bold(collection), '@', count)
			);
		},
	})
});
