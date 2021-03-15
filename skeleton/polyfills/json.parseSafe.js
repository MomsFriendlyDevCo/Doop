/**
* Wrapped version of JSON.parse() with more functionality:
*     - Failed parsing defaults to a fallback value rather than throwing
*     - Parses 'undefined' as fallback value
*
* @param {string} str String to parse
* @param {*} [fallback=null] Default value to use if JSON is invalid or undefined
*/
JSON.parseSafe = function(str, fallback = null) {
	try {
		if (!str || /^undefined$/i.test(str)) return fallback;
		return JSON.parse(str);
	} catch (e) {
		return fallback;
	}
};
