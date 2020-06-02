var _ = require('lodash');
var gulp = require('gulp');

/**
* Gulp process to loop though all records that has a search middleware installed and "touch" the record forcing the search indexer process to refire
*/
gulp.task('search.reindex', 'load:app.db', ()=> {
	var reindexed = 0;

	return Promise.all(Object.keys(app.db)
		.filter(model => _.isFunction(app.db[model].search)) // Has search attached to the model
		.map(model => new Promise((resolve, reject) =>
			app.db[model].find()
				.forEach((next, doc) => {
					gulp.log('Reindex', gulp.colors.cyan(model), '/', gulp.colors.cyan(`#${doc._id}`));
					doc.save(next);
					reindexed++;
				})
				.exec(err => err ? reject(err) : resolve())
		))
	)
		.then(()=> gulp.log('Reindex complete. Processed', gulp.colors.cyan(reindexed), 'documents'));
});
