/**
* Database level Middleware which notifies all subscribers when an entity changes its status code
* NOTE: This returns a factory compatible with monoxide.hook('save', ...)
*
* @param {Object} options Options about the factory to generate
* @param {string} options.entity The internal model name to use. Usually a plural this should match the Monoxide model name (e.g. 'widgets')
* @param {string} [options.title] The human readable singlar version of `entity`. Defaults to the startCased version of options.entity
* @param {string|function} [options.url] The location to find the entity within the website. Defaults to `${app.config.publicUrl}/#/${entity}/${entity-id}`. If this is a function it will be run as (document, settings). If the string or function return begins with a `/` it will be transformed into an absolute URL
* @param {string|function} [options.emailSubject] The email subject line to use when notifiying. Defaults to a return of `${settings.title} ${doc.code} status change to "${doc.status}"`. Called as (document, settings)
* @param {string} [options.emailTemplate="units/email/status-change.email.txt"] The email template to use when notifying
*
* @example Install as a middleware hook into the widgets collection and email everyone when status changes to active
* db.widgets
*   .set('statusRules', {
*     draft: {changeTo: 'active'},
*     active: {notify: true},
*   })
*   .hook('save', app.middleware.db.statusChange.notifySubscribers({
*     entity: 'widgets',
*     title: 'Widget',
*     url: doc => '/widgets/${doc._id}`,
*   }))
*/
var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var email = require('mfdc-email');

app.register('preModels', function(finish) {
	_.set(app, 'middleware.db.statusChange.notifySubscribers', function(options) {
		// Settings {{{
		var settings = _.defaults(options, {
			entity: undefined,
			title: undefined,
			emailTemplate: `${app.config.paths.root}/units/email/status-change.email.txt`,
			emailSubject: (doc, settings) => `${settings.title} ${doc.code} status change to "${doc.status}"`,
			url: undefined,
		});

		if (!settings.entity) throw new Error('Entity option must be specified when using app.middleware.db.statusChange.notifySubscribers() factory');
		if (!settings.title) settings.title = _.startCase(settings.entity);
		// }}}

		return function(done, q) {
			if (!q.status) return done(); // Not changing status
			// if (!db.ncrs.get('statusRules')[q.status].notifiy) return done(); // No need to do anything

			async()
				// Determine template variables {{{
				.then('url', function(next) {
					var url;
					if (!settings.url) {
						url = `${app.config.publicUrl}/#/${settings.entity}/${q._id}`;
					} else if (_.isFunction(settings.url)) {
						url = settings.url(q, settings);
					} else {
						url = settings.url;
					}

					if (url.startsWith('/')) url = app.config.publicUrl + url; // Add fully qualified domain name if missing
					next(null, url);
				})
				.then('emailSubject', function(next) {
					if (_.isFunction(settings.subject)) {
						next(null, settings.subject(doc));
					} else {
						next(null, settings.subject);
					}
				})
				// }}}
				// Fetch users subscribed to this model {{{
				.then('subscribers', function(next) {
					db.subscribers.findOne({
						$errNotFound: false,
						model: settings.entity,
						docId: q._id,
					})
						.populate('subscribers.user')
						.exec(next)
				})
				// }}}
				// Send email {{{
				.then(function(next) {
					if (!this.subscribers || !this.subscribers.subscribers.length) return next(); // Nobody to notify

					var users = this.subscribers.subscribers.map(s => `${s.user.name} <${s.user.email}>`);
					console.log(colors.blue(`[statusChange ${settings.entity}/${q._id}]`), 'Emailing', users.join(', '));

					email()
						.to('matt@mfdc.biz') // FIXME: TEMP
						// .to(users)
						.subject(this.emailSubject)
						.template(settings.emailTemplate)
						.templateParams({
							entity: settings.title,
							code: q.code,
							status: q.status,
							url: this.url,
						})
						.send(next)
				})
				// }}}
				.end(done)
		};
	});

	finish();
});
