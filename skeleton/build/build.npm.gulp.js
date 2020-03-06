var _ = require('lodash');
var fs = require('fs').promises;
var gulp = require('gulp');
var semver = require('semver');
var spawn = require('child_process').spawn;


gulp.task('npm', ['npm.update', 'npm.engineCheck']);

gulp.task('npm.update', ['load:app', 'load:app.git'], ()=> {
	if (app.config.isProduction) return done(); // Skip if production
	if (!_.get(app, 'config.gulp.npmUpdate')) {
		gulp.log('NPM auto-update is disabled');
		return;
	}

	Promise.resolve()
		// Lazily read a lookup table of file hashes {{{
		.then(()=> {
			try {
				return require(`${app.config.paths.root}/.git/fileHashes.json`)
			} catch(e) {
				return {};
			}
		})
		// }}}
		// Compare last hash to git version and decide on action {{{
		.then(hashes => {
			if (
				hashes['package.json']
				&& hashes['package.json'] == app.git.shortHash
			) {
				return {hashes, performUpdate: false};
			} else {
				return {hashes, performUpdate: true};
			}
		})
		// }}}
		// Perform action {{{
		.then(data => new Promise(resolve => {
			if (!data.performUpdate) return;
			gulp.log('Project requires NPM update', gulp.colors.grey(`(Package Hash: ${app.git.shortHash}, latest update: ${_.get(this.stamps, ['package.json', 'shortHash']) || 'NONE'})`));

			var ps = spawn('npm', ['install', '--no-progress', '--audit=false'], {
				cwd: app.config.paths.root,
				stdio: 'inherit',
			});

			ps.on('close', code => {
				if (code != 0) throw new Error('NPM exited with non-zero exit code!');
				resolve(data.hashes);
			});
		}))
		// }}}
		// Write updated hashes back {{{
		.then(hashes => {
			hashes['package.json'] = app.git.shortHash;
			return fs.writeFile(`${app.config.paths.root}/.git/fileHashes.json`, JSON.stringify(hashes));
		})
		// }}}
});


gulp.task('npm.engineCheck', ['load:app'], done => {
	var needVersion = require(`${app.config.paths.root}/package.json`).engines.node;

	if (!semver.satisfies(process.version, needVersion)) {
		gulp.log(gulp.colors.yellow('WARNING'), 'Recommended Node version is', gulp.colors.bold.blue(needVersion) + '.', 'Current Node version is', gulp.colors.bold.blue(process.version), '- while things may work its recommended you update');
	}
	done();
});
