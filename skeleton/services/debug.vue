<service singleton>
/**
* Simple binding to selectively output information from a component should its debugging setting be enabled
* @param {*} msg... Messages to output
*/
module.exports = function() {
	var $debug = function(...msg) {
		if (!this.$debugging) return;

		var prefix = this._id || this._uid;

		// Allocate color {{{
		if ($debug.seen[prefix] === undefined) { // Not seen this prefix before
			$debug.seen[prefix] = _.size($debug.seen);
		}
		var color = $debug.colorTable[$debug.seen[prefix]] || '#FF00FF'; // Alloc color offset or use fallback purple
		// }}}

		return console.log(`%c[${prefix}]`, `color: ${color}; font-weight: bold`, ...msg);
	};

	$debug.colorTable = ['#0000FF', '#009ACD', '#8b2323', '#2f4f4f', '#2e8b57', '#ee7600', '#ff1493', '#9932cc', '#b03060'];
	$debug.seen = {}; // $debuggers we have seen this session and their allocated offset in the above color table


	return $debug;
};
</service>
