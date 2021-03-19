/**
* Refresh link information for all documents / entire collection / list of IDs
* This agent is really just a wrapper around a data puller + doc.$relink() call on each doc
*
* @param {Object} [settings] Settings to use when calculating
* @param {string} [settings.collection] CSV of collections to examine
* @param {string} [settings.id] CSV of document ID's to examine
*/
var _ = require('lodash');

module.exports = {
	id: 'links',
	hasReturn: false,
	methods: ['pm2', 'inline'],
	worker: function(finish, settings) {
		var agent = this;
		_.defaults(settings, {
			collection: '',
			id: '',
		});

		return Promise.allSeries(
			Object.keys(db)
				.filter(model => !settings.collection || settings.collection.split(/\s*,\s*/).includes(model)) // Optionally filter models by collection CSV
				.map(model => ()=> new Promise((resolve, reject) => {
					var docCount = 0;
					agent.log('Examine links for collection', model);
					db[model]
						.find(settings.id ? {_id: settings.id.split(',')} : undefined) // Fetch documents either by specified ID's or all
						.forEach((next, doc, docIndex) => {
							agent.logThrottled('Examined', agent.log.colors.cyan(++docCount), 'docs in', agent.log.colors.cyan(model));
							return doc.$relink()
								.then(()=> next())
								.catch(next)
						})
						.exec(err => err ? reject(err) : resolve())
				}))
		)
			.then(()=> finish())
			.catch(finish)
	},
};
