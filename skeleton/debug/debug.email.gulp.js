var email = require('@momsfriendlydevco/email');
var gulp = require('gulp');

/**
* Debug email dispatch settings
* @param {string} process.env.EMAIL_TO Email address to send to
* @param {string} [process.env.EMAIL_FROM=app.config.session.from] Email to send from (system default if unspecified)
*/
gulp.task('debug.email.send', ['load:app'], ()=> {
	if (!process.env.EMAIL_TO) throw new Error('ENV EMAIL_TO must be set to test email');

	return email().send({
		from: process.env.EMAIL_FROM || app.config.email.from,
		to: process.env.EMAIL_TO,
		subject: `Test email sent ${(new Date).toString()}`,
		html: ''
			+ `<p>Test email sent <strong>${(new Date).toString()}</strong> via <code>gulp debug.email.send</code>`
			+ `<p>${app.config.email.signoff}</p>`
	})

});
