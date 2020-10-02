var _ = require('lodash');
var gulp = require('gulp');

/**
* Gulp process to loop though all records that has a search middleware installed and "touch" the record forcing the search indexer process to refire
*
* @param {string} [process.env.REINDEX_COLLECTION] CSV of specific collections to reindex, defaults to all collections with a search method attached
* @param {string} [process.env.REINDEX_ID] CSV of specific document IDs to reindex, defaults to all documents in the collection
*
* @example Reindex all search collections
* gulp search.reindex
*
* @example Reindex only the "widgets" + " users" collections
* REINDEX_COLLECTION=widgets,users gulp search.reindex
*/
gulp.task('search.reindex', 'load:app.db', ()=> {
	var reindexed = 0;
	var filterCollections = (process.env.REINDEX_COLLECTION || '').split(/\s*,\s*/).filter(Boolean);
	var filterIds = (process.env.REINDEX_ID || '').split(/\s*,\s*/).filter(Boolean);

	if (filterCollections.length) gulp.log('Only reindexing collections:', filterCollections.map(c => gulp.colors.cyan(c)).join(', '));
	if (filterIds.length) gulp.log('Only reindexing IDs:', filterIds.map(id => gulp.colors.cyan(id)).join(', '));

	return Promise.all(Object.keys(app.db)
		.filter(model => _.isFunction(app.db[model].search)) // Has search attached to the model
		.filter(model => !filterCollections.length || filterCollections.includes(model))
		.map(model => new Promise((resolve, reject) => {
			var docNumber = 0;
			var docQuery = filterIds.length ? {_id: {$in: filterIds}} : undefined;

			app.db[model].count(docQuery)
				.then(totalDocs => app.db[model].find(docQuery)
					.forEach((next, doc) => {
						gulp.log('Reindex', gulp.colors.cyan(model), '/', gulp.colors.cyan(`#${doc._id}`), gulp.colors.gray(`${docNumber} / ${totalDocs} ~ ${Math.round(++docNumber / totalDocs * 100)}%`));
						reindexed++;
						doc.save(next);
					})
					.exec(err => err ? reject(err) : resolve())
				)
		}))
	)
		.then(()=> gulp.log('Reindex complete. Processed', gulp.colors.cyan(reindexed), 'documents'));
});
