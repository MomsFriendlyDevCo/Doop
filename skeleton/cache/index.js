/**
* Provide app.cache + app.caches{}
* These are really just initalized mappings to @momsfriendlydevco/cache instances
*/
var _ = require('lodash');
var cache = require('@momsfriendlydevco/cache');
var colors = require('chalk');

module.exports = ()=>
	Promise.resolve()
		.then(()=> app.caches = {})
		.then(()=> Promise.all(app.config.cache.modules.map(id => {
			app.caches[id] = new cache({
				...app.config.cache,
				modules: [id],
				init: false,
			});
			return app.caches[id].init();
		})))
		.then(()=> app.cache = app.caches[app.config.cache.modules[0]]) // Point to main cache object
		.then(()=> console.log(
			colors.blue('[cache]'),
			'Loaded primary cache driver',
			colors.cyan(app.cache.activeModule.id),
			_.size(app.caches) > 1
				?  colors.grey('(suplementory: ' + _.keys(app.caches).filter(c => c != app.cache.activeModule.id).join(', ') + ')')
				: '',
		))
