var fs = require('fs')
fs.exists = path => fs.access(path).then(()=> true).catch(()=> false);

fs.existsSync = path => {
	try {
		return fs.accessSync(path, fs.constants.R_OK) === undefined; // NOTE: accessSync returns undefined (WTF!?) if everything is ok
	} catch (e) {
		return false;
	}
};
