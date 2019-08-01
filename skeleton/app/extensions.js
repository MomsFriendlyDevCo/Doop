/**
* Language extensions and other nasty prototype glue
*/

// console.dump() + console.die() {{{
var dumper = require('dumper.js');
console.dump = (...args) => args.forEach(a => dumper.dump(a));
console.die = (...args) => { args.forEach(a => dumper.dump(a)) ; process.exit(1); };
// }}}

// Polyfill fs.exists{,sync}() {{{
var fs = require('fs')
if (!fs.existsSync)
	fs.existsSync = path => {
		try {
			return fs.accessSync(path, fs.constants.R_OK) === undefined; // NOTE: accessSync returns undefined (WTF!?) if everything is ok
		} catch (e) {
			return false;
		}
	};

if (!fs.exists) fs.exists = path => fs.access(path).then(()=> true).catch(()=> false);
// }}}

// RegExp.escape() {{{
/**
* Extend the RegExp prototype with a simple string escape function
* @param {string} str The string to escape
* @returns {RegExp} the escaped RegEx string
*/
RegExp.escape = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
// }}}
