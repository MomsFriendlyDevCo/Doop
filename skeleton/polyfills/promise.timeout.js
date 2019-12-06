/**
* Return a promise that pauses for the given number of milliseconds
* @param {number} time The amount of milliseconds to pause before resolving
* @returns {Promise}
* @url https://github.com/MomsFriendlyDevCo/Nodash
*/
Promise.timeout = time => new Promise(resolve => setTimeout(resolve, time));
