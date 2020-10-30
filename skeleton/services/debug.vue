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
* @example Debug something with an overriding prefix
* vm.$debug('[Custom Prefix]', 'Some data', aProxyObject)
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

		var prefix = this._id ? this._id // If the component has a specified ID
			: this.$vnode && this.$vnode.tag ? this.$vnode.tag.replace(/^vue-component-\d+-/, '') // Use a (mangled) Vue tag
			: this._uid ? this._uid
			: msg.length && /^\[.*\]$/.test(msg[0]) ? msg.shift().slice(1, -1) // First message item is of the format `[PREFIX]`
			: (()=> { // Try to read stack trace
				var caller = Error().stack.split('\n').slice(3, 4);
				if (!caller) return;
				var callerBits = /^\s+at (.+) /.exec(caller);
				if (!callerBits) return;
				return callerBits[1];

			})() || 'UNKNOWN SOURCE'

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

	/**
	* Switch on debugging and also output
	* @param {*} msg... The message contents to output
	*
	* @example Force debugging even if vm.$debugging is disabled
	* vm.$debug.force('Hello', this.world);
	*/
	$debug.force = (...msg) => {
		this.$debugging = true;
		return $debug(...msg);
	};


	/**
	* Output this item and disable outputting for any other debug call that is not also marked as `only`
	* @param {*} msg... The message contents to output
	*
	* @example Output only this item and disable from hereon unless another call to a `only()` marked function is used
	* vm.$debug.only('Hello', this.world);
	*/
	$debug.only = function(...msg) {
		this.$debugging = true;
		return $debug(...msg);
		this.$debugging = false;
	};


	console.$debugging = true;
	console.debug = $debug; // Convenience mapping to console.debug


	return $debug;
};
</service>
