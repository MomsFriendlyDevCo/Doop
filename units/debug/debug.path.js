var email = require('mfdc-email');

/**
* Test email sending
* This dispatches the '/units/emails/debug.tmpl.txt' email to the email address stored in app.config.email.from
*/
app.get('/api/debug/test/email', app.middleware.ensure.root, function(req, res) {
	email()
		.to(app.config.email.from)
		.subject('Debug Email')
		.template(app.config.paths.root + '/units/email/debug.email.txt')
		.templateParams({
			config: app.config,
		})
		.send(function(err, emailRes) {
			res.send({
				error: err,
				response: emailRes,
			});
		})
});
