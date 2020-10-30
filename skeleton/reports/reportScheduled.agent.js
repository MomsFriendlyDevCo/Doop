/**
* Agent to retrieve a list of custom reports and run any that are scheduled based on their Cron timing
* @param {Object} [settings] Additional settings to pass to the agent
* @param {string} [settings.content] Overriding plain-text to execute as a report - skips the file system
* @param {string} [settings.reports] A CSV of reports to run (ignores all usual cron parsing, existing timing files etc.)
* @param {string} [settings.forceEmail] CSV of email address to send the report to - even if timing is disabled or the email shouldn't really be sent. Used only for testing
* @returns {array <String>} An array representing each report that was executed
*/
var _ = require('lodash');
var cronParser = require('cron-parser').parseExpression;
var email = require('@momsfriendlydevco/email');
var fs = require('fs').promises;
//var fspath = require('path');
var readable = require('@momsfriendlydevco/readable');

module.exports = {
	id: 'reportScheduled',
	timing: '*/15 * * * *', // Every 15m
	hasReturn: true,
	show: true,
	methods: ['pm2', 'inline'],
	worker: function(done, options) {
		var agent = this;

		// Settings {{{
		var settings = _.defaults(options, {
			reports: '',
			forceEmail: undefined,
		});
		if (settings.reports) settings.reports = options.reports.split(/\s*,\s*/);
		// }}}

		return Promise.resolve()
			.tap(()=> agent.progress('Fetching list of reports to run'))
			.then(()=> app.agents.get('reportFileRead', settings.content ? {content: settings.content} : undefined))
			.tap(()=> {
				// If using content also force the filter to just this file
				if (settings.content) {
					settings.reports = ['temp-report'];
				}
			})
			.then(reports => reports.filter(report => report.timing))
			// Filter reports down to those we need to actually run {{{
			.tap(reports => agent.progress(`Analysing ${reports.length} reports`))
			.then(reports => Promise.all(reports.map(report => {
				if (settings.reports.includes(report.name)) { // User specifically requesting this report
					report.needsSync = true;
					report.timingPrev = (new Date).toISOString();
					return report;
				} else { // Filter reports by existing timing file
					return Promise.resolve()
						.then(()=> {
							var interval = cronParser(report.timing);
							report.timingPrev = interval.prev().toISOString();
						})
						.then(()=> fs.access(`${app.config.paths.data}/customReports/${report.name}/${report.timingPrev}.json`))
						.then(()=> {
							report.needsSync = false;
							return report;
						})
						.catch(()=> {
							report.needsSync = true;
							return report;
						})
				}
			})))
			.then(reports => reports.filter(report => report.needsSync))
			// }}}
			.tap(reports => agent.progress(`Generating ${reports.length} report snapshots`))
			.tap(reports => reports.length && agent.log('Generating snapshots for: ' + reports.map(report => report.name).join(', ')))
			.then(reports =>
				Promise.all(
					reports.map(report =>
						Promise.resolve()
							.then(()=> app.agents.run('report', settings.content ? {content: settings.content} : {file: report.name}))
							//.tap(()=> fs.mkdir(`${app.config.paths.data}/customReports/${report.name}`, {recursive: true}))
							//.then(result => fs.writeFile(`${app.config.paths.data}/customReports/${report.name}/${report.timingPrev}.json`, JSON.stringify(result, null, '\t')))
							// Send email template to everyone in the listed groups / individual emails {{{
							.then(()=> {
								// FIXME: Move email sending into report agent itself? Simply trigger, it saves and emails.
								return;
								if (!settings.forceEmail && !report.email) return; // Nothing to do
								if (!report.emailTemplate) return agent.log(`Email template for report "${report.nanme}" missing - skipping email`);

								return Promise.resolve()
									.tap(()=> {
										if (settings.forceEmail) {
											agent.log('Forcing email send to', agent.log.colors.cyan(settings.forceEmail));
										} else {
											agent.log('Determinining notification email addresses');
										}
									})
									.then(()=> settings.forceEmail ? settings.forceEmail.split(/\s*,\s*/) : report.email)
									.then(emails => Promise.all(emails.map(segment => {
										if (/@/.test(segment)) { // Individual email address - Look up user object and put it in a single person group
											return db.users.findOne({email: segment, $errNotFound: false})
												.then(user => [user])
												.catch(()=> Promise.resolve({email: user})) // Can't find? Default to a stub
										} else { // Assume its a emailGroup
											return db.emailGroups.findOne({name: segment})
												.populate('users')
												.then(group => [].concat(
													group.users,
													group.guestEmails.map(guest => ({
														name: guest,
														email: guest,
													}))
												));
										}
									})))
									.then(users => _.flatten(users)) // Splat users + userGroups into a flat array
									.then(users => _.uniqBy(users, 'email')) // Make sure we don't send to the same user twice
									.tap(users => agent.log(`Sending email for report "${report.name}" to ${users.length} users`))
									.then(users => Promise.all(users.map(user =>
										email()
											.to(user.email)
											.from(app.config.email.from)
											.subject(report.emailSubject)
											.set(/^\s*</.test(report.emailTemplate) ? 'html' : 'text', report.emailTemplate) // Switch to HTML mode if the first line starts with '<'
											.params({
												report,
												user,
												generated: {
													// TODO: Include time it took report agent to run.
													date: {
														iso: report.timingPrev,
														relative: readable.relativeTime(report.timingPrev),
													},
													download: {
														json: `${app.config.publicUrl}/api/reports/custom/${report.name}/history/${report.timingPrev}`,
														csv: `${app.config.publicUrl}/api/reports/custom/${report.name}/history/${report.timingPrev}?format=csv`,
														xlsx: `${app.config.publicUrl}/api/reports/custom/${report.name}/history/${report.timingPrev}?format=xlsx`,
													},
													url: `${app.config.publicUrl}/#/reports/custom/${report.name}`,
												},
												system: {
													url: app.config.publicUrl,
													code: app.config.theme.code,
													title: app.config.theme.title,
													signoff: app.config.email.signoff,
												},
											})
											.send()
									)))
							})
							// }}}
							.catch(err => {
								agent.warn('Error sending report with data from', agent.log.colors.cyan(`${app.config.paths.data}/customReports/${report.name}/${report.timingPrev}.json`), 'Error:', err.toString());
							})
					)
				)
				.then(()=> reports)
			)
			.then(reports => reports.map(result => result.name)); // Return a list of all the reports that ran
	},
};
