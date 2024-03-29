const _ = require('lodash');
const fs = require('fs').promises;
const semver = require('semver');
const spawn = require('child_process').spawn;

const gulp = require('gulp');

gulp.task('npm', ['npm.update', 'npm.engineCheck']);

/**
* Perform a `npm cleaninstall` (but only if the package-lock.json file has changed)
*/
gulp.task('npm.cleanInstall', ['load:app.git'], ()=> Promise.resolve()
	.then(()=> app.git.pathChanged(`${app.config.paths.root}/package-lock.json`))
	.then(hasChanged => {
		if (hasChanged) {
			gulp.log('Detected change to', gulp.colors.cyan('package-lock.json'), 'performing NPM clean-install...');
			return;
			return exec([
				'npm',
				'clean-install',
			], {log: true});
		} else {
			gulp.log(gulp.colors.gray('Detected no changes to package-lock.json, skipping NPM clean-install'));
		}
	})
);


/**
* Update the NPM environment if the package.json file has changed
*/
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


gulp.task('npm.engineCheck', ['load:app'], ()=> {
	var package = require(`${app.config.paths.root}/package.json`);
	var hasVersion = process.version;
	var needVersion = package.engines.node;

	if (!semver.satisfies(hasVersion, needVersion)) {
		if (package.engineStrict) {
			gulp.log(gulp.colors.red.bold('DANGER'), 'Required Node engine spec is', gulp.colors.bold.blue(needVersion) + '.', 'Current Node version is', gulp.colors.bold.blue(hasVersion), '- things are likely to break!');
		} else {
			gulp.log(gulp.colors.yellow('WARNING'), 'Recommended Node engine spec is', gulp.colors.bold.blue(needVersion) + '.', 'Current Node version is', gulp.colors.bold.blue(hasVersion), '- while things may work, its recommended you update');
		}
	}
});
