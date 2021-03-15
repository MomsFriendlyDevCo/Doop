/**
* Sanity check to verify that the data directory is writable
* @param {string} app.config.paths.data Data directory path to check
*/
var fs = require('fs');

module.exports = ()=> Promise.resolve()
	.then(()=> fs.promises.access(app.config.paths.data, fs.constants.W_OK))
	.then(()=> `${app.config.paths.data} is writable`)
