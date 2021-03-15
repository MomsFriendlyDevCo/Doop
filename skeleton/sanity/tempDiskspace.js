/**
* Sanity check to verify that the system temp directory is has at least 10% free disk space
* @param {number} [app.config.sanity.minDisk=10] Percentage minimum disk space to warn at
*/

var os = require('os');

module.exports = ()=> app.utils.sanity.diskSpace(os.tmpdir(), app.config.sanity.minDisk);
