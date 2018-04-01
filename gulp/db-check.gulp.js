var _ = require('lodash');
var async = require('async-chainable');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('db:check:indexes', ['load:app.db'], function(done) {
	async()
		.limit(1)
		.set('missing', [])
		.forEach(_.keys(db), function(next, model) {
			db[model].checkIndexes((err, res) => {
				if (err) return next(err);
				res
					.filter(i => i.status == 'missing')
					.forEach(i => this.missing.push({model, ...i}));
				next();
			});
		})
		.then(function(next) {
			if (!this.missing.length) {
				gutil.log(gutil.colors.bold.green('No missing database indexes found'));
				return next();
			}

			gutil.log('Database indexes are missing');
			gutil.log('Run the following commands in a Mongo shell to recreate:');

			console.log(gutil.colors.bold.blue('--- Start of Mongo Console Commands ---'));
			this.missing.forEach(i => {
				console.log(`db.${i.model.toLowerCase()}.createIndex({${i.name}: 1})`);
			});
			console.log(gutil.colors.bold.blue('--- End of Mongo Console Commands ---'));

			next();
		})
		.end(done);
});
