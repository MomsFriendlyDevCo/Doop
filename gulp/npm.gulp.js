var _ = require('lodash');
var async = require('async-chainable');
var asyncExec = require('async-chainable-exec');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('npm:update', ['load:app'], function(finish) {
	if (app.config.isProduction) return finish(); // Skip if production
	if (!_.get(app, 'config.gulp.npmUpdate')) {
		gutil.log('NPM auto-update is disabled');
		return finish();
	}

	async()
		.use(asyncExec)
		.set('stampPath', './.git/stamps.json')
		.parallel({
			// Fetch last git patch to package.json {{{
			git: function(next) {
				async()
					.use(asyncExec)
					.exec('git', ['git', 'log', '-1', `--pretty=format:%H|%h|%cI|%cn|%s`, '--', 'package.json'])
					.then('git', function(next) {
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
						next(null, this.git);
					});
			},
			// }}}
			// Fetch last package version we were tracking {{{
			stamps: function(next) {
				try {
					var contents = fs.readFileSync(this.stampPath, 'utf-8');
					contents = JSON.parse(contents);
					next(null, contents);
				} catch(e) {
					next(null, {});
				}
			},
			// }}}
		})
		// Compare last stamp to git version and decide on action {{{
		.then('action', function(next) {
			if (
				this.stamps['package.json']
				&& this.stamps['package.json'].shortHash
				&& this.stamps['package.json'].shortHash == this.git.shortHash
			) {
				next(null, 'NO-ACTION');
			} else {
				next(null, 'UPDATE');
			}
		})
		// }}}
		// Perform action {{{
		.then(function(next) {
			if (this.action != 'UPDATE') return next();
			gutil.log('Project requires NPM update', gutil.colors.grey(`(Package Hash: ${this.git.shortHash}, latest update: ${_.get(this.stamps, ['package.json', 'shortHash']) || 'NONE'})`));
			async()
				.use(asyncExec)
				.exec(['npm', 'install', '--no-progress'], {passthru: true})
				.end(next);
		})
		// }}}
		// Write stamps back {{{
		.then(function(next) {
			_.set(this.stamps, ['package.json', 'shortHash'], this.git.shortHash);
			fs.writeFile(this.stampPath, JSON.stringify(this.stamps), next);
		})
		// }}}
		// End {{{
		.end(finish);
		// }}}
});
