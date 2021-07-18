<script lang="js" frontend>
app.service('$components', {

	/**
	* Return a flat array of all components in use
	* This can be iterated to access all components from the root element downwards
	* All components are listed from the top-down wards in iteration order of children
	* @returns {Array<VueComponent>} An array of all, active VueComponents
	*/
	forEach: ()=> {
		var components = []; // Initial array bucket

		var recurseDown = function(component) {
			components.push(component);
			component.$children.forEach(child => recurseDown(child)); // Recurse into children
		};

		recurseDown(app.vue);

		return components;
	},


	/**
	* Return a name -> VueComponent object of all active VueComponents
	* This can be iterated to access all components from the root element downwards
	* All components are listed from the top-down wards in iteration order of children
	* @param {Object} [options] Options to configure behaviour
	* @param {function} [options.keyVia=_.camelCase] How to tidy up the raw internal kebab-case VueComponent name before using it as a key
	* @returns {Object} An object with each key as the component name and each value as an array of matching components (1:M)
	*/
	entries: options => {
		var settings = {
			...options,
			keyVia: _.camelCase,
		};

		return app.service.$components
			.forEach() // Gather into array
			.reduce((t, c) => {
				var key = settings.keyVia(c.$options._componentTag);
				if (t[key]) { // Key -> Array already exists - append
					t[key].push(c);
				} else { // Key -> Array does not exist yet - init
					t[key] = [c];
				}
				return t;
			}, {})
	},


	/**
	* Run a function on a VueComponent matching a given name(s)
	* @param {string|array<string>} target The camelCase / snake_case / kebab-case name of the component(s) to run the method on (if it exists)
	* @param {string} method The method name to execute
	* @param {*} [payload...] Additional method arguments to pass when running the function
	* @returns {Promise} A Promise.all() wrapped version of all methods run
	*/
	tell: (componentName, method, ...args) => {
		var nameFilters = new Set( // Create lookup set of names to filter by (after kebab casing to match Vue's internal system)
			_.castArray(componentName).map(_.kebabCase)
		);

		var recurseDown = function(component) {
			if (
				nameFilters.has(component.$options._componentTag) // Name matches in kabab-case
				&& _.isFunction(component[method]) // VueComponent has matching method
			)
				component[method].apply(component, args); // Call the methods with the payload

			component.$children.forEach(child => recurseDown(child)); // Recurse into children
		};

		recurseDown(app.vue);
	},


	/**
	* Tiny property validator compatible with the Vue Props spec
	* @param {Object} spec The property spec to validate
	* @param {Object} target The target values to validate
	* @param {Object} [options] Additional options to use when validating
	* @param {boolean} [options.throw=true] Throw on errors, otherwise returns the string value of the first error
	* @param {boolean} [options.applyDefaults=false] Apply default values to `target` if there are any defined
	* @returns {boolean} Boolean true if the spec validates against the target, if `throw` is truthy this function will throw
	*/
	propsValidate(spec, target, options = {}) {
		try {
			return Object.entries(spec)
				.every((key, validator) => {
					if (!_.isPlainObject(validator)) validator = {type: validator}; // Map {key: Type} => {key: {type: Type}}

					// Validate type(s)
					if (validator.type && !_.castArray(validator.type).some(type =>
						! (target[key] instanceof type)
					)) throw new Error(`Expected key "${key}" to be of type "${(validator.type).toString().replace(/^.*function\s*(.+?)\(.+/, '$1')}"`) // Gah. Horrible kludge to translate String => 'String' but here we are

					// Validate required
					if (validator.required && !target.hasOwnProperty(key)) throw new Error(`Expected required key "${key}"`);

					// Validate validator
					if (validator.validate && !validator.validate(target[key])) throw new Error(`Validator failed on key "${key}"`);

					// Apply defaults (if options.applyDefaults)
					if (validator.default && (options?.applyDefaults ?? true)) target[key] = _.isFunction(validator.default) ? validator.default() : validator.default;
				})
		} catch (e) {
			if (options?.throw ?? true) throw e;
			return e;
		}
	},
});
</script>
