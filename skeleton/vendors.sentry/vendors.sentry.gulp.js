const async = require('async-chainable');
const superagent = require('superagent');
const gulp = require('gulp');

gulp.task('deploy:sentry', ['load:app', 'load:app.git'], function(finish) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!app.config.sentry.enabled) return next('SKIP');
			if (!app.config.sentry.slug) return next('Cannot publish Sentry deployment - missing app.config.sentry.{slug}');
			next();
		})
		// }}}
		// Inform Sentry of the release version {{{
		.then(function(next) {
			gulp.log('Posting release version', gulp.colors.cyan(app.git.current.shortHash), 'to Sentry');

			superagent
				.post(`https://sentry.io/api/0/organizations/${app.config.sentry.slug}/releases/`)
				.set('Authorization', `Bearer ${app.config.sentry.token}`)
				.type('json')
				.send({
					version: app.git.current.shortHash,
					environment: app.config.env,
					projects: [ app.config.name ],
				})
				.end(function(err, res) {
					if (err) return next(err);
					next();
				});
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err && err == 'SKIP') { // Do nothing
				finish();
			} else if (err) {
				finish(err);
			} else {
				finish();
			}
		});
		// }}}
});
