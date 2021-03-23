<script lang="js" frontend>
/**
* Input based directive that cleans up contents based on certain rules
*
* @param {Object|string} options If this is a CSV it will simply set all keys as true. Options can also be set via Vue modifiers, if none are present 'simplified' is assumed
* @param {string} [options.events='change input'] Which events to trigger on as a space separated list
* @param {boolean} [options.toUpper=false] Convert input to uppercase
* @param {boolean} [options.toLower=false] Convert input to lowercase
* @param {boolean} [options.trim=false] Trim output from left + right
* @param {boolean} [options.trimStart=false] Trim output from left
* @param {boolean} [options.trimEnd=false] Trim output from right
* @param {boolean} [options.trimAlways=false] Disable skipping trim events if the event is 'input' - this allows the user to type spaces but they then get removed during a 'change' event if orphaned
*
* @param {boolean} [options.email=false] Implies 'alpha,at,dot,lines,numeric,trim'
* @param {boolean} [options.simplified=false] Implies 'alpha,lines,numeric,space,punctuation,trim', defaults to true if none of the methods below are true
* @param {boolean} [options.url=false] Implies 'alpha,colon,dot,numeric,slash,trim'
*
* @param {boolean} [options.alpha=false] Only accept alpha characters (any case)
* @param {boolean} [options.alphaLower=false] Only accept uppercase alpha characters
* @param {boolean} [options.alphaUpper=false] Only accept uppercase alpha characters
* @param {boolean} [options.at=false] Accept the '@' character
* @param {boolean} [options.colon=false] Accept the ':' character
* @param {boolean} [options.dot=false] Accept the full-stop character
* @param {boolean} [options.linefeed=false] Accept linefeeds
* @param {boolean} [options.lines=false] Accept the '-' and '_' characters
* @param {boolean} [options.numeric=false] Only accept numeric characters
* @param {boolean} [options.punctuation=false] Accept punctuation
* @param {boolean} [options.space=false] Accept space (only space, no other whitespace)
* @param {boolean} [options.spaces=false] Accept any whitespace
* @param {boolean} [options.tab=false] Accept tabs
* @param {boolean} [options.unicode=false] Accept Unicode
*
* @example Use basic settings (sanitize weird characters + trim)
* <input v-model="myInput" v-sanitize/>
*
* @example Only allow uppercase characters
* <input v-model="myInput" v-sanitize.alphaUpper/>
*
* @example Only allow uppercase characters, converting lower case automatically
* <input v-model="myInput" v-sanitize.toUpper.alphaUpper/>
*
* @example Simple string cleaning + trimming
* <input v-model="myInput" v-sanitize.alpha.numeric.trim/>
*
* @example More complex options
* <input v-model="myInput" v-sanitize="{alpha: true, numeric: true, trim: true}"/>
*/
app.directive('v-sanitize', {
	bind(el, binding, vnode) {
		// Settings {{{
		var settings = {
			events: 'change input',
			toUpper: false,
			toLower: false,
			trim: false,
			trimStart: false,
			trimEnd: false,
			trimAlways: false,
			simplified: false,

			alpha: false,
			alphaLower: false,
			alphaUpper: false,
			at: false,
			dot: false,
			linefeed: false,
			lines: false,
			numeric: false,
			punctuation: false,
			space: false,
			spaces: false,
			tab: false,
			unicode: false,

			...(
				_.isObject(binding.value) ? binding.value
				: _.isString(binding.value) ? binding.value
					.split(/\s*,\s*/)
					.reduce((t, v) => { t[v] = true; return t }, {}) //~ Flatten keys into object with each key as `true`
				: null
			),
			...binding.modifiers, // Read in modifiers
		};
		// }}}

		// Compound options {{{
		if (Object.values(settings)  // Assume 'simplified' if nothing is set
			.filter(v => typeof v == 'boolean')
			.every(v => v === false)
		)
			settings.simplified = true;

		if (settings.email) settings = {
			...settings,
			alpha: true,
			at: true,
			dot: true,
			lines: true,
			numeric: true,
			trim: true,
		};

		if (settings.url) settings = {
			...settings,
			alpha: true,
			colon: true,
			dot: true,
			lines: true,
			numeric: true,
			slash: true,
			trim: true,
		};

		if (settings.simplified) settings = {
			...settings,
			alpha: true,
			lines: true,
			numeric: true,
			space: true,
			punctuation: true,
			trim: true,
		};

		if (settings.punctuation) settings = {
			...settings,
			lines: true,
		};

		if (settings.trim) settings = {
			...settings,
			trimStart: true,
			trimEnd: true,
		};
		// }}}

		// Calculate whitelist {{{
		var whitelist = [
			settings.alpha && 'a-zA-Z',
			settings.alphaLower && 'a-z',
			settings.alphaUpper && 'A-Z',
			settings.at && '@',
			settings.colon && ':',
			settings.dot && '\.',
			settings.linefeed && '\n',
			settings.numeric && '0-9',
			settings.punctuation && RegExp.escape('!@#$%^&*()[]{}<>;:"\',.?/~`\\=+|'),
			settings.slash && '/',
			settings.space && ' ',
			settings.spaces && '\s',
			settings.tab && '\t',
			settings.unicode && '\uE000-\uF8FF',
			settings.lines && '_\-', // Must be last as '-' acts weird if its not the final character within a group
		].filter(Boolean) // Remove duds
		whitelist = whitelist.length ? new RegExp('[^' + whitelist.join('') + ']+', 'g') : false;
		// }}}

		var $el = $(el);
		$el
			.on(settings.events, (e) => {
				var originalVal;
				var val = originalVal = $el.val();

				if (settings.toUpper) {
					val = val.toUpperCase();
				} else if (settings.toLower) {
					val = val.toLowerCase();
				}

				if (whitelist) val = val.replace(whitelist, ''); // Apply whitelist if its valid

				if (settings.trimStart) val = val.replace(/^\s+/, '')
				if (
					settings.trimEnd
					&& (settings.trimAlways || e.type != 'input') // Ignore input event if trimEnd is lazy
				) val = val.replace(/\s+$/, '');

				if (val != originalVal) { // If we did anything...
					$el.val(val); // Set component new value

					vnode?.data?.on?.input(e); // Has a v-model binding - tell the binding that the value has changed
				}
				// console.log('DO', e.type, 'SANITIZE', `[${originalVal}] => [${val}]`);
			});
	},
});
</script>
