/**
* Sanity check to verify that the cache system directory is writable
* @param {string} app.config.paths.data Data directory path to check
*/
var fs = require('fs');

module.exports = ()=> Promise.resolve()
	.then(()=> Promise.all([
		app.utils.uuid.generate({prefix: 'sanity-cache-test-'}),
		app.utils.uuid.generate({prefix: 'sanity-cache-value-'}),
	]))
	.then(([cacheName, cacheValue]) => app.cache.set(cacheName, cacheValue, '1h')
		.then(()=> [cacheName, cacheValue])
	)
	.then(([cacheName, cacheValue]) => app.cache.get(cacheName).then(val => {
		if (val != cacheValue) throw new Error(`Expected cache entry "${cacheName}" to equal "${cacheValue}" instead got "${val}"`);
		app.cache.unset(cacheName); // Release cache entry in background
	}))
	.then(()=> 'Cache is writable')
