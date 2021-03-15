/**
* Wrapped version of JSON.stringifySafe() with more functionality:
*     - Failed stringify defaults to a fallback value rather than throwing
*
* @param {*} input Input to stringify
* @param {*} [fallback=''] Default value to use if JSON is invalid or undefined
*/
JSON.stringifySafe = function(input, fallback = '') {
	try {
		return JSON.stringify(input);
	} catch (e) {
		return fallback;
	}
};
