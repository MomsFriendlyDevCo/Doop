var _ = require('lodash');

// FIXME: app.middleware.ensure.login,
app.get('/api/indexers', (req, res) => {
	app.indexer.list((err, indexers) => {
		if (err) return res.sendError(err);
		res.send(
			_(indexers)
				.sortBy('id')
				.filter(i => i.timing)
				.value()
		);
	});
});


/**
* Get the valid of a given indexer
* @param {string} req.param.id The ID of the indexer to fetch the value of
* @returns {Object} The JSON object return of the indexer
*/
app.get('/api/indexers/:id', (req, res) => {
	app.indexer.get(req.params.id, (err, contents) => {
		if (err) return res.sendError(err);
		res.send(contents);
	});
});



/**
* Force regenerate a given indexer
* @param {string} req.param.id The ID of the indexer to fetch the size of
* @returns {Object} An empty object representing success
*/
app.get('/api/indexers/:id/regenerate', (req, res) => {
	app.indexer.run(req.params.id, (err, contents) => {
		if (err) return res.sendError(err);
		res.sendStatus(200);
	});
});


/**
* Lazy fetcher to return the size of a indexer
* @param {string} req.param.id The ID of the indexer to fetch the size of
* @returns {Object} An object with a single key 'size' which is a number
*/
app.get('/api/indexers/:id/size', (req, res) => {
	app.indexer.get(req.params.id, (err, contents) => {
		if (err) return res.sendError(err);
		res.send({size: JSON.stringify(contents).length});
	});
});
