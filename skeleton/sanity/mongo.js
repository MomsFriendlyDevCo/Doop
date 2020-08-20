/**
* Sanity check to verify that the MongoDB data store is accessible
* @param {string} [app.config.sanity.mongo.collection='users'] Model to query to verify that Mongo is reachable
*/
var _ = require('lodash');

module.exports = ()=> Promise.resolve()
	.then(()=> db[_.get(app, 'config.sanity.mongo.collection', 'users')].count())
	.then(count => count > 0 ? true : Promise.reject('user table is answering but no users found'))
	.then(()=> 'Mongo is accessible')
