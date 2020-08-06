/**
* Sanity check to verify that the data directory is has at least 10% free disk space
* @param {string} app.config.paths.data Data directory path to check
* @param {number} [app.config.sanity.minDisk=10] Percentage minimum disk space to warn at
*/

module.exports = ()=> app.utils.sanity.diskSpace(app.config.paths.data, app.config.sanity.minDisk);
