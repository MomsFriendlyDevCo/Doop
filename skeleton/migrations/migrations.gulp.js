var _ = require('lodash');
var async = require('async-chainable');
var gulp = require('gulp');


/**
* Clear all migrations from the database
*/
gulp.task('migrations.clear', ['load:app.db'], ()=> Promise.resolve()
	.then(()=> app.db.doopMigrations.$mongooseModel.deleteMany())
	.then(()=> gulp.log('All migrations marked as unapplied'))
);


/**
* Apply one or more migrations
* @param {string} process.env.MIGRATION CSV of migrations to apply
*/
gulp.task('migrations.apply', ['load:app.db'], ()=> {
	if (!process.env.MIGRATION) return gulp.log(gulp.colors.red('ERROR'), 'Env MIGRATION must be a CSV of migration IDs to apply');

	var migrations = process.env.MIGRATION.split(/\s*,\s*/);

	return Promise.resolve()
		.then(()=> app.migration.init())
		.then(()=> migrations.forEach(id => app.migration.migrationsApplied.delete(id))) // Clear out migrations so we load them correctly
		.then(()=> app.migration.applyManual = true) // Mark manual migrations as applyable
		.then(()=> app.emit('migrations'))
		.then(()=> {
			if (!app.config.mongo.migration || !app.migration.migrations.length) return gulp.log(gulp.colors.yellow('WARN'), 'No migrations to apply or none matching'); // Nothing to do

			var scheduler = async()
				.then(()=> app.log('Manually applying', app.log.colors.cyan(app.migration.migrations.length), 'migrations'))
				.limit(1);

			// Add already-completed migrations as stubs so the resolver marks them as complete
			Array.from(app.migration.migrationsApplied).forEach(id => scheduler.defer([], id, ()=> true));

			// Queue up all migrations + their prequisites
			app.migration.migrations.forEach(migration =>
				scheduler.defer(migration.options.after ? _.castArray(migration.options.after) : [], migration.id, next => {
					app.log('Applying', app.log.colors.cyan(migration.id), 'migration', app.log.colors.gray(`(${migration.title})`));
					Promise.resolve(migration.handler())
						.then(()=> app.migration.markMigration(migration.id))
						.then(()=> next())
				})
			);

			return scheduler
				.await() // Run all defers
				.then(()=> app.log('Applied', app.log.colors.cyan(app.migration.migrations.length), 'migrations successfully'))
				.end()
				.promise()
		})
})
