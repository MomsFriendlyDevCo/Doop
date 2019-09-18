<service singleton>
/**
* Simple binding to selectively output information from a componet should its debugging setting be enabled
* @param {*} msg... Messages to output
*
* Also listens to the following values on the calling service / component:
* @param {string} [vm._id] The human friendly prefix to use when logging
* @param {boolean} [vm._debugDeconstruct=true] Whether to run all variable entries though a (rather silly) `JSON.stringify |> JSON.stringify` path before outputting, this outputs Proxy objects to the console slighly nicer than Chromes weird method
*
* @example Debug simple data (assuming `vm.$debugging = true`)
* vm.$debug('Some data', aProxyObject)
*
* @example FORCE debugging to be enabled from this point on even if `vm.$debugging` is falsy
* vm.$debug.force('Some data', aProxyObject)
*/
module.exports = function() {
	var safeDeconstruct = v => {
		try {
			return JSON.parse(JSON.stringify(v));
		} catch (e) { // Can't deconstruct - probably something stupid like circular references
			return v;
		}
	};

	var $debug = function(...msg) {
		if (!this.$debugging) return;

		var prefix = this._id // If the component has a specified ID
			|| this.$vnode?.tag ? this.$vnode.tag.replace(/^vue-component-\d+-/, '') // Use a (mangled) Vue tag
			: this._uid;

		// Allocate color {{{
		if ($debug.seen[prefix] === undefined) { // Not seen this prefix before
			$debug.seen[prefix] = _.size($debug.seen);
		}
		var color = $debug.colorTable[$debug.seen[prefix]] || '#FF00FF'; // Alloc color offset or use fallback purple
		// }}}

		var msgPayload = this._debugDeconstruct === undefined || this._debugDeconstruct
			? msg.map(m => safeDeconstruct(m))
			: msg;

		return console.log(`%c[${prefix}]`, `color: ${color}; font-weight: bold`, ...msgPayload);
	};

	$debug.colorTable = ['#009ACD', '#8b2323', '#2f4f4f', '#2e8b57', '#ee7600', '#ff1493', '#9932cc', '#b03060', '#0000FF'];
	$debug.seen = {}; // $debuggers we have seen this session and their allocated offset in the above color table

	// Switch on debugging and also output
	$debug.force = (...msg) => {
		this.$debugging = true;
		return $debug(...msg);
	};


	return $debug;
};
</service>
