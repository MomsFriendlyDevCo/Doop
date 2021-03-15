/**
* Extend the RegExp prototype with a simple string escape function
* @param {string} str The string to escape
* @returns {RegExp} the escaped RegEx string
*/
RegExp.escape = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
// }}}
