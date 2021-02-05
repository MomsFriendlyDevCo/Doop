<script lang="js" frontend>
app.service('$eval', {
	/**
	* Executes arbitrary code as a string, passing a custom context and exposed services
	* This is an attempt to remap eval() to something less insane
	*
	* @param {string} [subject] The code to execute, if omitted use options.action to specify the code to run
	* @param {Object} [options] Additional options
	* @param {string} [options.action] Optional additional way to pass the code for execution, use this if just passing a single object
	* @param {array} [options.args] Arguments to pass the function
	* @param {Object} [options.context=app.service] The context to run the code within, defaults to the exposed services of app.service
	* @param {Object} [options.inject=app.service] Injectables (i.e. items to appear within the scope of the function
	*/
	run(subject, options) {
		// Argument mangling {{{
		if (_.isPlainObject(subject)) { // Form: options
			options = subject;
		} else if (subject && !options) { // Form: action
			options = {action: subject};
		} else if (subject && options) { // Form: action, options
			options.action = subject;
		}
		// }}}

		var settings = {
			action: '',
			args: [],
			context: Object.assign({}, app.service),
			inject: Object.assign({}, app.service),
			...options,
		};

		var injectables = _.toPairs(settings.inject);

		try {
			var func = new window.Function(...injectables.map(i => i[0]), settings.action);
		} catch (e) {
			console.log(`Failed to compile custom function "${settings.action}"`, e);
			return undefined;
		}

		return func.call(settings.context, ...injectables.map(i => i[1]), ...settings.args);
	},


	/**
	* Attempt to savely evaluate a subject as a JSON object
	* @param {string} subject Subject expression to evaluate
	* @param {boolean} [wantObject=true] Allow object returns
	* @param {boolean} [wantArray=true] Allow array returns
	* @param {boolean} [wantNumber=true] Allow numeric (finite) returns, if false drops through to strings
	* @param {boolean} [wantBoolean=true] Allow boolean returns, if false drops through to strings
	* @param {boolean} [wantNull=true] Allow null returns, if false drops through to strings
	* @param {boolean} [wantString=true] Allow string returns, if false drops through to fallback
	* @param {*} [fallback=null] Fallback value to use if nothing can be detected
	* @returns {*} Either the parsed expression in the desired format(s) or the fallback
	*/
	asObject(subject, options) {
		var settings = {
			wantObject: true,
			wantArray: true,
			wantNumber: true,
			wantBoolean: true,
			wantNull: true,
			wantString: true,
			fallback: null,
			...options,
		};

		if (/^\[.*\]$/.test(subject)) { // Looks like an array
			return settings.wantArray ? JSON.parse($eval.hansonParse(subject)) : settings.fallback;
		} else if (/^\{.*\}$/.test(subject)) { // Looks like an object
			return settings.wantObject ? JSON.parse($eval.hansonParse(subject)) : settings.fallback;
		} else if (settings.wantNumber && /^\d+$/.test(subject) && isFinite(subject)) { // Return numeric value
			return +subject;
		} else if (settings.wantBoolean && /^(true|false)$/.test(subject)) { // Looks like a boolean
			return subject == 'true';
		} else if (settings.wantNull && /^null$/.test(subject)) { // Looks like a null
			return null;
		} else if (settings.wantString) { // Return string value
			return ''+subject;
		} else {
			return settings.fallback;
		}
	},


	/**
	* Convert a HanSON object to a JSON string
	* Hanson is generally close enough to JS that it makes no difference
	* @param {string} input HanSON compatible string
	* @returns {string} A JSON string
	*/
	hansonParse(input) {
		var UNESCAPE_MAP = { '\\"': '"', "\\`": "`", "\\'": "'" };
		var ML_ESCAPE_MAP = {'\n': '\\n', "\r": '\\r', "\t": '\\t', '"': '\\"'};
		function unescapeQuotes(r) { return UNESCAPE_MAP[r] || r; }

		return input.replace(/`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\/\*[^]*?\*\/|\/\/.*\n?/g, // pass 1: remove comments
				     function(s) {
		    if (s.charAt(0) == '/')
			return '';
		    else
			return s;
		})
		.replace(/(?:true|false|null)(?=[^\w_$]|$)|([a-zA-Z_$][\w_$]*)|`((?:\\.|[^`])*)`|'((?:\\.|[^'])*)'|"(?:\\.|[^"])*"|(,)(?=\s*[}\]])/g, // pass 2: requote
				     function(s, identifier, multilineQuote, singleQuote, lonelyComma) {
		    if (lonelyComma)
			return '';
		    else if (identifier != null)
			    return '"' + identifier + '"';
		    else if (multilineQuote != null)
			return '"' + multilineQuote.replace(/\\./g, unescapeQuotes).replace(/[\n\r\t"]/g, function(r) { return ML_ESCAPE_MAP[r]; }) + '"';
		    else if (singleQuote != null)
			return '"' + singleQuote.replace(/\\./g, unescapeQuotes).replace(/"/g, '\\"') + '"';
		    else
			return s;
		});
	},
});
</script>
