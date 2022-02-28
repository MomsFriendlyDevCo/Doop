/**
* Gulpfile stub
* This file should only parse all `*.gulp.js` within the project tree
*/
const debug = require('debug')('doop:gulp');
const glob = require('globby');

const gulp = require('@momsfriendlydevco/gulpy').mutate();

process.chdir(__dirname); // Always chdir to root of project so all paths are relative

const parseFiles = function parseFiles(files) {
	if (!files || !files.length === 0) return;

	debug(files);
	files.forEach(path => {
		debug(`./${path}`);
		require(`./${path}`);
	});
};


// Include local .gulp.js files into gulp task list {{{
const localFiles = glob.sync([
	'**/*.gulp.js',
	'!data',
	'!dist',
	'!test',
	'!node_modules',
]);
parseFiles(localFiles);
app.log.as('gulp', 'Importing', localFiles.length, 'local .gulp.js files');
// }}}


// Include 3rd party .gulp.js files into gulp task list {{{
const vendorFiles = glob.sync([
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
);
parseFiles(vendorFiles);
app.log.as('gulp', 'Importing', vendorFiles.length, '3rd party .gulp.js files');
// }}}

// Check for 3rd party .gulp.js via symlinks which are not included above {{{
const symlinks = glob.sync([
		'./node_modules/@doop/**/*.gulp.js',
	],
	{
		followSymbolicLinks: true,
		ignore: [
			'./node_modules/@doop/**/node_modules',
		],
	}
);

if (symlinks && symlinks.length > vendorFiles.length) {
	debug(symlinks.filter(s => !vendorFiles.includes(s)));
	app.log.warn.as('gulp', 'Found', symlinks.length - vendorFiles.length, '3rd party .gulp.js files via symlinks, these files were not imported!');
}
// }}}

gulp.task('default', 'serve');
debug(gulp.tree({ deep: false }));
