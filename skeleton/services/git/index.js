/**
* Returns various Git information
*/

var _ = require('lodash');
var hashedReleaseName = require('hashed-release-name');
var spawn = require('child_process').spawn;

/**
* Returns the latest Git snapshot
* @returns {Promise} A promise resolved with an object of keys including `hash`, `shortHash`, `date`, `committer` and `subject`
*/
module.exports.current = ()=> new Promise((resolve, reject) => {
	var ps = spawn('git', ['log', '-1', '--pretty=format:%H|%h|%cI|%cn|%s'], {
		cwd: app.config.paths.root,
	});

	var response = '';
	ps.stdout.on('data', data => response += data.toString());

	ps.on('close', code => {
		if (code != 0) return reject('Git exited with a non-zero exit code!');

		var gitInfo = response.split('|');
		resolve({
			release: hashedReleaseName({
				alliterative: true,
				hash: gitInfo[0],
				transformer: phrase => _.startCase(phrase),
			}),
			hash: gitInfo[0],
			shortHash: gitInfo[1],
			date: gitInfo[2],
			committer: gitInfo[3],
			subject: gitInfo[4],
		});
	});
});


/**
* Returns some historical Git data
* @param {Object} [options] Options to specify
* @param {number} [options.limit=30] The number of rows to return
* @returns {Promise} A promise which will resolve with the Git history collection
*/
module.exports.history = options => {
	var settings = {
		limit: 30,
		...options,
	};

	return Promise.resolve()
		.then(()=> new Promise((resolve, reject) => {
			var ps = spawn('git', [
				'log',
				'--pretty=format:%H|%h|%cI|%cn|%s',
				`--max-count=${settings.limit}`,
			], {cwd: app.config.paths.root});

			var response = '';
			ps.stdout.on('data', data => response += data.toString());

			ps.on('close', code => {
				if (code != 0) return reject('Git exited with a non-zero exit code!');
				resolve(response);
			});
		}))
		.then(data => data.split('\n').map(line => {
			var gitInfo = line.split('|');
			return {
				release: hashedReleaseName({
					alliterative: true,
					hash: gitInfo[0],
					transformer: phrase => _.startCase(phrase),
				}),
				hash: gitInfo[0],
				shortHash: gitInfo[1],
				date: gitInfo[2],
				committer: gitInfo[3],
				subject: gitInfo[4],
			};
		}))
};
