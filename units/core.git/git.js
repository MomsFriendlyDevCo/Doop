/**
* Returns various Git information
*/

var async = require('async-chainable');
var asyncExec = require('async-chainable-exec');

module.exports = {};

/**
* Returns only the latest git information
* @param {function} finish The callback to call as (err, gitInfo)
*/
module.exports.current = function(finish) {
	async()
		.use(asyncExec)
		.exec('git', ['git', 'log', '-1', `--pretty=format:%H|%h|%cI|%cn|%s`, '--', 'package.json'])
		.then('gitInfo', function(next) {
			var gitInfo = this.git[0].split('|');
			next(null, {
				hash: gitInfo[0],
				shortHash: gitInfo[1],
				date: gitInfo[2],
				committer: gitInfo[3],
				subject: gitInfo[4],
			});
		})
		.end(function(err) {
			if (err) return next(err);
			finish(null, this.gitInfo);
		});
};
