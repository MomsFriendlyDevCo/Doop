/**
* Agent to get a list of supported aggregation queries from the glob of ./queries/*.js
*
* @param {Object} [settings] Options to pass to the agent
* @param {string} [settings.content] Plain text JavaScript to interpret as the file contents - skips the file system and creates a fake stub for this file only
* @returns {array <Object>} An array representing each file
*/
var _ = require('lodash');
//var async = require('async-chainable');
var commentParser = require('comment-parser');
var cronTranslate = require('cronstrue').toString;
var fspath = require('path');
var fs = require('fs');
var fsAsync = require('fs').promises;
var globby = require('globby');

module.exports = {
	id: 'reportFileRead',
	//timing: '20 */3 * * *', // Every 3h
	hasReturn: true,
	show: true,
	methods: ['pm2', 'inline'],
	// FIXME: Does clearOnBuild function?
	clearOnBuild: true,
	// FIXME: "done" in signature while returning promise?
	worker: function(done, options) {
		var agent = this;

		var settings = _.defaults(options, {
			content: undefined,
		});

		// Utility functions {{{
		var toArray = v => (v || '').split(/\s*,\s*/).filter(i => !!i).map(_.trim);
		// }}}

		return Promise.resolve()
			// FIXME: What is this temp-report all about?
			/*
			.then(()=> settings.content
				? [`${app.config.reports.paths}/temp-report.js`]
				: Promise.all(
					app.config.reports.paths.map(cb => globby(cb(app.config))
						//globby(`${dir}/*.js`)
					)
				)
			)
			*/
			.then(()=> Promise.all(
				app.config.reports.paths.map(path => globby(path + '/*.js'))
			))
			//.then(()=> Promise.resolve(app.config.paths.reports))
			.then(globs => _.flatten(globs))
			//.tap(paths => agent.log(`Reading ${paths.length} query files`))
			//.then(() => app.config.reports.paths)
			.then(paths => settings.content
				? [{path: paths[0], content: settings.content}]
				: Promise.all(paths.map(path =>
					fsAsync.readFile(path, 'utf-8')
						.then(content => ({path, content}))
				))
			)
			//.tap(() => agent.log(`Processing file meta data`))
			.then(files => files.map(file => {
				try {
					return _(file.content)
						.thru(v => {
							var parsed = commentParser(v)[0];

							if (!parsed) throw new Error(`No meta information found in ${file.path}`);

							if (parsed.description && !parsed.tags.find(pt => pt.tag == 'description')) { // Found a multi-line description and we don't have a `@description` override
								parsed.tags.push({
									tag: 'description',
									source: '@description ' + parsed.description.split(/\n/)[0], // Take first line of comment as description
								});
							}
							return parsed.tags;
						})
						.mapKeys(i => i.tag)
						.mapValues(i => i.source.substr(i.tag.length + 2)) // Mangle the source into the title so we dont have the 'field' prefix
						.thru(meta => ({
							name: fspath.basename(file.path, '.js'),
							title: meta.title,
							environments: toArray(meta.environments),
							permissions: toArray(meta.permissions),
							description: meta.description,
							timing: meta.timing || false,
							email: meta.email ? toArray(meta.email) : undefined,
							emailSubject: meta.emailSubject,
							emailTemplate: meta.emailTemplate,
							type: meta.type || 'other',

							hasCSV: meta.type == 'array' || meta.type == 'collection',
							hasXLSX: meta.type == 'array' || meta.type == 'collection' || (()=> { // Check if an .XLSX file exists and set to true if so
								try {
									fs.accessSync(file.path.replace(/\.js$/, '.xlsx'));
									return true;
								} catch (e) {
									if (e && e.code !== 'ENOENT') agent.log('Unexpected error testing XLSX file: ' + e.code + ': ' + e.message);
									return false;
								}
								return true;
							})(),
						}))
						.thru(i => {
							if (i.timing && !i.timingReadable) i.timingReadable = cronTranslate(i.timing);
							if (i.email && !i.emailSubject) i.emailSubject = `Report completed: ${i.title}`;
							if (i.email && !i.emailTemplate) i.emailTemplate =
								+ 'Hi {{user.name}},\n',
								+
								+ 'The latest {{report.title}} for {{system.title}} can be downloaded via the link below:\n'
								+ '\n'
								+ '{{{generated.download.json}}}\n'
								+ '\n'
								+ 'Report history can be viewed here: {{{generated.url}}}\n'
								+ '\n'
								+ '\n{{system.signoff}}';
							return i;
						})
						.omitBy(v => !v) // Removed omitted fields
						.value()
				} catch (e) {
					agent.warn(e);
					return false;
				}
			}))
			.then(files => files.filter(f => f)) // Remove blanks
			.then(files => files.filter(file => { // Filter down file list to only those that match this code
				if (!file.environments || !file.environments.length) {
					agent.log('Filtering out report', agent.log.colors.cyan(file.name), '(no runnable environment found)');
					return false;
				} else if (!file.environments.some(i => i == process.env.NODE_ENV)) {
					agent.log('Filtering out report', agent.log.colors.cyan(file.name), `(this profile ${process.env.NODE_ENV} not in available allowed list of ${file.environments.join(', ')})`);
					return false;
				} else {
					return true;
				}
			}))
			.then(files => _.sortBy(files, 'title'))
	},
};
