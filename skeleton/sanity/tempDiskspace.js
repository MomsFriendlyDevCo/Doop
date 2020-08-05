/**
* Sanity check to verify that the system temp directory is has at least 10% free disk space
* @param {number} [app.config.sanity.minDisk=10] Percentage minimum disk space to warn at
*/
var exec = require('@momsfriendlydevco/exec');
var os = require('os');
var readable = require('@momsfriendlydevco/readable');

if (!['darwin', 'freebsd', 'linux', 'openbsd', 'sunos'].includes(os.platform())) {
	app.log.warn('Cannot check diskspace on non Unix compatible systems');
	module.exports = Promise.resolve();
} else {
	module.exports = ()=> Promise.resolve()
		.then(()=> exec(`df -T "${os.tmpdir()}"`, {buffer: true}))
		.then(res => res.split('\n').slice(1)[0]) // Remove first line (headers)
		.then(res => res.split(/\s+/)) // Split by whitespace
		.then(([device, fsType, size, used, avail, usePercent, mounted]) => {
			freePercent = 100 - parseFloat(usePercent);
			if (freePercent <= app.config.sanity.minDisk) {
				return Promise.reject(`Only ${freePercent}% disk remaining - ${readable.fileSize(used)} / ${readable.fileSize(size)} @ ${usePercent} usage for ${mounted}`);
			} else {
				return `${readable.fileSize(used)} / ${readable.fileSize(size)} @ ${usePercent} usage for ${mounted}`;
			}
		});
}

module.exports();
