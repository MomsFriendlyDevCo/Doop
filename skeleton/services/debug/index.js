/**
* Core Debugging logger / prettyPrinter
*/


/**
* Global debug options
* @type {Object}
* @property {array<string>} colorTable Lookup colors to use, nominated in order of the component loading
* @property {Object<number>} seen Which components have been seen and what their nominated colorTable offset is
*/
var $debugGlobal = {
	colorTable: ['#009ACD', '#8b2323', '#2f4f4f', '#2e8b57', '#ee7600', '#ff1493', '#9932cc', '#b03060', '#0000FF'],
	seen: {}, // $debuggers we have seen this session and their allocated offset in the above color table
};


/**
* Generic chainable debugging utility to selectively output information from a component
* @param {*} msg... Messages to output
*
* Also listens to the following values on the calling service / component:
* @param {string} [vm._id] The human friendly prefix to use when logging
*
* @example Debug simple data
* vm.$debug('Some data', aProxyObject)
*
* @example Create a debugger instanciation and give it a prefix, enable it and output something
* var myDebugger = this.$debug.new('New-Debugger').enable()('hello');
*
* @example Debug something with an overriding prefix
* vm.$debug('[Custom Prefix]', 'Some data', aProxyObject)
*
* @example FORCE debugging to be enabled from this point on even if `vm.$debug.enable(false)` / `vm.$debug.disable()` is called beforehand
* vm.$debug.force('Some data', aProxyObject)
*/
var DebugFactory = function DebugFactory(context) {
	var $debug = function $debug(...msg) {
		if (!$debug.$enabled) return $debug;

		// Allocate color {{{
		if ($debugGlobal.seen[$debug.prefix] === undefined) { // Not seen this prefix before
			$debugGlobal.seen[$debug.prefix] = _.clamp(_.size($debugGlobal.seen), 0, $debugGlobal.colorTable.length - 1); // Nominate the color to use for this element based on the order it loaded
		}
		var color = $debugGlobal.colorTable[$debugGlobal.seen[$debug.prefix]] || '#FF00FF'; // Alloc color offset or use fallback purple
		// }}}

		console[$debug.as](`%c[${$debug.$prefix}]`, `color: ${color}; font-weight: bold`, ...msg.map(m => $debug.deconstruct(m)));

		return $debug;
	};

	$debug.$prefix = 'UNKNOWN';
	$debug.$enabled = true;
	$debug.as = 'log'; // Method to use to output


	/**
	* Set the $debug prefix based either on a simple string or try to extract it from a VueComponent automatically
	* @param {Object|VueComponent} context Either a string ID prefix or a VueComponent to extract one from
	*/
	$debug.prefix = function(context) {
		this.$prefix =
			_.isString(context) ? context
			: this._id ? this._id // If the component has a specified ID
			: this.$vnode && this.$vnode.tag ? this.$vnode.tag.replace(/^vue-component-\d+-/, '') // Use a (mangled) Vue tag
			: this._uid ? this._uid
			: (()=> { // Try to read stack trace
				var caller = Error().stack.split('\n').slice(3, 4);
				if (!caller) return;
				var callerBits = /^\s+at (.+) /.exec(caller);
				if (!callerBits) return;
				return callerBits[1];

			})() || 'UNKNOWN';

		return $debug;
	};


	/**
	* Force output the given message as a warning
	* @param {*} msg... The message contents to output
	* @returns {$debug} This chainable $debug instance
	*
	* @example Force debugging even if vm.$debugging is disabled
	* vm.$debug.force('Hello', this.world);
	*/
	$debug.warn = (...msg) => {
		var oldAs = $debug.as;
		$debug.as = 'warn';
		if (msg.length) $debug.force(...msg);
		$debug.as = oldAs;
		return $debug;
	};


	/**
	* Switch on debugging for this one message + output
	* @param {*} msg... The message contents to output
	* @returns {$debug} This chainable $debug instance
	*
	* @example Force debugging even if vm.$debugging is disabled
	* vm.$debug.force('Hello', this.world);
	*/
	$debug.force = (...msg) => {
		var oldEnabled = $debug.$enabled;
		$debug.$enabled = true;
		if (msg.length) $debug(...msg);
		$debug.$enabled = oldEnabled;
		return $debug;
	};


	/**
	* Enable or disable debugging
	* @param {boolean} [isEnabled=true] Whether the component is enabled
	* @returns {$debug} This chainable $debug instance
	*/
	$debug.enable = isEnabled => {
		$debug.$enabled = isEnabled ?? true;
		return $debug;
	};


	/**
	* Disable or enabled debugging
	* @param {boolean} [isDisabled=true] Whether the component is disabled
	* @returns {$debug} This chainable $debug instance
	*/
	$debug.disable = isDisabled => {
		$debug.$enabled = isDisabled == true;
		return $debug;
	};


	/**
	* Output this item and disable outputting for any other debug call that is not also marked as `only`
	* @param {*} msg... The message contents to output
	*
	* @example Output only this item and disable from hereon unless another call to a `only()` marked function is used
	* vm.$debug.only('Hello', this.world);
	*/
	$debug.only = (...msg) => $debug.enable()(...msg).disable();


	/**
	* Utilify function to flatten Vue proxies into a native object
	* Yes, doing a stringify |> parse is exceptionally stupid, you find a better way - MC 2020-10-13
	* This function is sub-classable
	* @param {*} v Value to deconstruct
	* @returns {*} Flattened, de-proxied version of the input object
	*/
	$debug.deconstruct = v => {
		try {
			return JSON.parse(JSON.stringify(v));
		} catch (e) { // Can't deconstruct - probably something stupid like circular references
			return v;
		}
	};


	/**
	* Quick method to return a new instance of a $debugger and also set a prefix
	* @param {string|VueComponent} context Optional prefix to set for the new instance
	* returns {$debug} New debugging instance
	*
	* @example Create a specific $debug utility from the generic Vue service
	* var myDebugger = this.$debug.new('New-Debugger');
	*/
	$debug.new = context => DebugFactory(context);


	/**
	* Wrapper to stop unnecessary garbage printout in the console when using the $debug functions inline
	*/
	$debug.toString = ()=> '[$debug]';


	// Return this instance
	if (context) $debug.prefix(context);
	return $debug;
};

export default DebugFactory;
