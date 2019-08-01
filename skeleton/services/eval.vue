<service singleton>
/**
* Executes arbitrary code as a string, passing a custom context and exposed services
* This is an attempt to remap eval() to something less insane
*
* @param {string} [subject] The code to execute, if omitted use options.action to specify the code to run
* @param {Object} [options] Additional options
* @param {string} [options.action] Optional additional way to pass the code for execution, use this if just passing a single object
* @param {array} [options.args] Arguments to pass the function
* @param {Object} [options.context=Vue.services] The context to run the code within, defaults to the exposed services of Vue.services
* @param {Object} [options.inject=Vue.services] Injectables (i.e. items to appear within the scope of the function
*/
module.exports = function() {
	var $eval = function(subject, options) {
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
			context: Object.assign({}, Vue.services),
			inject: Object.assign({}, Vue.services),
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
	};

	return $eval;
};
</service>
