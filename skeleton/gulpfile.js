/**
* Gulpfile stub
* This file should only parse all `*.gulp.js` within the project tree
*/
const debug = require('debug')('doop:gulp');
const glob = require('globby');

const gulp = require('@momsfriendlydevco/gulpy').mutate();

process.chdir(__dirname); // Always chdir to root of project so all paths are relative

const parseFiles = function parseFiles(files) {
	files.forEach(path => {
		debug(`./${path}`);
		require(`./${path}`);
	});
	return Promise.resolve();
};

Promise.resolve()
	// Include local .gulp.js files into gulp mix {{{
	.then(()=> glob([
		'**/*.gulp.js',
		'!data',
		'!dist',
		'!test',
		'!node_modules',
	]))
	.then(files => files && files.length > 0 && parseFiles(files)
		.then(() => debug(files))
		.then(() => app.log.as('gulp', 'Imported', files.length, 'local .gulp.js files'))
	)
	// }}}

	// Include 3rd party .gulp.js files into gulp mix {{{
	.then(()=> glob([
			'./node_modules/@doop/**/*.gulp.js',
		],
		{
			// NOTE: If we follow symlinks gulp CLI can then no longer find ANY of our tasks.
			// When a @doop package is loaded as a local dependancy it's gulp tasks may not be available.
			followSymbolicLinks: false,
			ignore: [
				'./node_modules/@doop/**/node_modules',
			],
		}
	))
	.then(files => files && files.length > 0 && parseFiles(files)
		.then(() => debug(files))
		.then(() => app.log.as('gulp', 'Imported', files.length, '3rd party .gulp.js files'))

		// Check for 3rd party .gulp.js via symlinks which are not included above {{{
		.then(()=> glob([
				'./node_modules/@doop/**/*.gulp.js',
			],
			{
				followSymbolicLinks: true,
				ignore: [
					'./node_modules/@doop/**/node_modules',
				],
			}
		))
		.then(symlinks => symlinks && symlinks.length > files.length && Promise.resolve()
		.then(() => debug(symlinks.filter(s => !files.includes(s))))
			.then(() => app.log.warn.as('gulp', 'Found', symlinks.length - files.length, '3rd party .gulp.js files via symlinks, these files were not imported!'))
		)
		// }}}
	)
	// }}}

gulp.task('default', 'serve');

debug(gulp.tree({ deep: false }));
