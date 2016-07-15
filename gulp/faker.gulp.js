/**
* Generate and populate the app database with test data
*/

var _ = require('lodash');
var colors = require('chalk');
var gulp = require('gulp');
var gutil = require('gulp-util');
var faker = require('faker');
var notify = require('gulp-notify');

gulp.task('fake-users', ['load:db'], function(finish) {
	// Number of records to create
	var count = 50;

	db.users.create(Array.apply(null, Array(count)).map(function() {
		return {
			username: faker.internet.userName(),
			password: faker.internet.password(),
			email: faker.internet.email(),
			name: faker.name.firstName() + ' ' + faker.name.lastName(),
		};
	}), function(err) {
		if (err) return finish(err);
		gutil.log(' * Created', colors.cyan(count), colors.bold('fake'), colors.magenta('users'));
		notify({
			title: config.title,
			message: 'Created ' + count + ' fake users',
			icon: __dirname + '/icons/ghost.png',
		}).write(0);
		finish();
	});
});