/**
* Version porting hacks
* Installed at boot to patch various features between database versions
*/

var _ = require('lodash');
var async = require('async-chainable');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('fix', ['fix:adminPermissions']);


/**
* Patch all admins to have all permissions
* Effectively switches all booleans in users.permissions{} on
*/
gulp.task('fix:adminPermissions', ['load:app.db'], function(done) {
	async()
		.set('fixCount', 0)
		.then('users', function(next) {
			db.users.find({role: {$in: ['admin', 'root']}}, next);
		})
		.forEach('users', function(next, user) {
			_.forEach(user.permissions, (v, k) => {
				if (v) return; // Already on
				this.fixCount++;
				user.permissions[k] = true;
			});
			user.save(next);
		})
		.end(function(err) {
			if (err) done('Cant fix:adminPermissions - ' + err.toString());
			gutil.log('fix:adminPermissions - patched', gutil.colors.cyan(this.fixCount), 'permissions in', gutil.colors.cyan(this.users.length), 'admin + root users');
			done();
		});
});
