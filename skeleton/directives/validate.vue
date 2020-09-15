<directive>
/**
* Directive to allow input validation in a Bootstrap compatible way
*
* @param {Object} settings Validation settings, must contain at least `rules` key
* @param {string} [settings.classInvalid="is-invalid"] Class to apply to the input element when invalid
* @param {string} [settings.classValid=""] Class to apply to the input element when valid
* @param {boolean} [settings.immediate=false] Run the validator immediately on mount instead of waiting for an event to fire
* @param {string} [settings.layout="title"] How to signal that the field is invalid. ENUM: "title" - set the title (the mouse tooltip) to the error, "tooltip" - attach a tooltip, "help" - attach a `<small/>` help block after the element
* @param {Object} [settings.tooltip] Additional tooltip options if layout==tooltip
* @param {string|array} [settings.events='blur'] Event(s) to trigger validation on
*
* @param {array} settings.rules rules to use (implied if settings is an array), rules are evaulated in order. Some rules are sync (`endpoint` + functions if a promise is returned) which may take time to evaluate
* @param {string} [settings.rules.err="Invalid"] The error message to display if the validation checks fail
*
* @param {RegExp} [settings.rules.regExp] Validate a regular expression
*
* @param {boolean} [settings.rules.required=false] Validate against whether a field has any value
*
* @param {function} [settings.satisifies] Validate against a (possibly async) function called as `(value, settings)`. Should return true for passing, all other values are treated as the basic error message, async responses are waited on (see `settings.rules`)
*
* @param {string|Object} [settings.rules.endpoint] Either a string URL to satisfy or a set of options, NOTE: This is an async rule (see `settings.rules`)
* @param {string} [settings.rules.endpoint.url] URL to query, use `:value` as the value of the input
* @param {Object} [settings.rules.endpoint.expect={count:0}] Object which satisifes the condition
*
*
* @example Input is required
* <input type="text" class="form-control" v-validate="{rules: {required: true}}"/>
*
* @example Input must match a RegExp
* <input type="text" class="form-control" v-validate="[{regExp: /[a-z]/, err: 'Must be only lower case a-z'}]"/>
*
* @example Input should return `{count: 0}` from an endpoint query
* <input type="email" class='form-control" v-validate="{rules: {endpoint: '/api/users?email=:value'}}"/>
*
* @example Input is required and should return `{validates: true}` from an endpoint query
* <input type="email" class='form-control" v-validate="{rules: {required: true, endpoint: {url: '/api/users?email=:value', expect: {validates: true}}}}"/>
*/
module.exports = {
	bind(el, binding) {
		var $el = $(el);

		var settings = {
			classInvalid: 'is-invalid',
			events: 'blur',
			immediate: false,
			layout: 'title',
			...binding.value,
			rules: Array.isArray(binding.value) ? binding.value // Given only an array
				: binding.value.rules && _.isPlainObject(binding.value.rules) ? [binding.value.rules] // Given {rules: Object}
				: binding.value.rules && Array.isArray(binding.value.rules) ? binding.value.rules // Given {rules: Array}
				: false, // Fail
		};
		if (!settings.rules) throw new Error('No rules passed, v-validate only accepts an array of rules or the `{rules: Array|Object}` structure');

		// checkValidate() {{{
		/**
		* Check all rules in precidence order failing at the first rule
		* This function automatically calls invalidate if anything fails
		*/
		var checkValidate = ()=> {
			var value = $(el).val();

			// Apply rules in order until one fails {{{
			var failedValidate = false;
			settings.rules.find(validator => { // Process rules until the first one is truthy
				if (validator.required && !value) { // Check against required field but no value
					return failedValidate = 'Required'; // Return basic default message
				} else if (validator.regExp && !validator.regExp.test(value)) { // Check against RegExp fail
					return failedValidate = 'Is not valid';
				} else if (validator.satisfies) {
					var res = validator.satisfies(value, settings);
					if (Promise.isPromiseLike(res)) { // Returned async - wait on it then call invalidate later
						res
							.then(result => { // Promise returned an answer
								if (result === true) return; // Is valid - do nothing as everything is all ready valid
								invalidate(result);
							})
							.catch(e => invalidate( // Promise threw, assume invalid
								_.isString(e) ? e // Is already a string
								: e.toString().length > 0 ? e.toString() // Stringifyable?
								: 'Invalid'
							))
					} else if (res === true) { // Simple scalar response that the function was satisifed
						return false;
					} else { // Use everything else as an error
						return failedValidate = res;
					}
				} else if (validator.endpoint) {
					Vue.services().$http(
						_.isString(validator.endpoint) ? {method: 'GET', url: validator.endpoint.replace(/:value/g, value)}
						: _.omit({...validator.endpoint, url: validator.endpoint.url.replace(/:value/g, value)}, 'expect')
					).then(res => {
						if (_.isEqual(res.data, validator.endpoint?.expect || {count: 0})) return; // Validation passed - do nothing
						invalidate( // Use the error message specified or the server basic text if any
							_.isString(validator.err) ? validator.err
							: _.isString(res.data) ? res.data
							: 'Invalid'
						);
					})
					.catch(e => { // Server threw error - assume invalid
						invalidate( // Use the error message specified or the server basic text if any
							_.isString(validator.err) ? validator.err
							: _.isString(e?.response?.data) ? e.response.data
							: e.toString().length > 0 ? e.toString() // Use generic error
							: 'Invalid'
						);
					})
				} else { // Everything ok
					return false;
				}
			});
			// }}}

			// Calculate error message or boolean FALSE
			var message = !failedValidate ? false // Everything passed
				: _.isString(failedValidate?.err) ? failedValidate?.err // Calculate error message from either a predefined message...
				: _.isString(failedValidate) ? failedValidate // A basic default message...
				: 'Is not valid'; // Or a fallback

			invalidate(message); // Call the invalidator
		};
		// }}}

		// invalidate(message = false) {{{
		/**
		* Signal that this component is invalid (or not)
		* @param {boolean|string} [status=false] Either boolean false if every validation passed OR a string error message if something failed
		*/
		var invalidate = (status = false) => {
			// Apply failed / valid classes {{{
			if (status) {
				$el.addClass(settings.classInvalid).removeClass(settings.classValid);
			} else {
				$el.addClass(settings.classValid).removeClass(settings.classInvalid);
			}
			// }}}

			// Handle invalid notification layouts {{{
			switch(settings.layout) {
				case 'title':
					if (status) {
						$el.attr('title', status);
					} else {
						$el.removeAttr('title');
					}
					break;
				case 'tooltip':
					$el.tooltip('dispose');
					if (status) {
						$el.tooltip({
							trigger: 'manual',
							title: status,
							...settings.tooltip,
						});
						// BUGFIX: Workaround for JQ + Vue not allowing the tooltip immediately
						Vue.nextTick(()=> $el.tooltip('show'));
					}
					break;
				case 'help':
					$el.siblings('small.form-text.text-danger').remove();
					if (status)
						Vue.nextTick(()=> $el.after(`<small class="form-text text-danger">${status}</small>`));
					break;
				default:
					throw new Error(`Unknown v-validate layout "${settings.layout}"`);
			}
			// }}}
		};
		// }}}

		// Bind to all events in settings.events
		$(el).on((Array.isArray(settings.events) ? settings.events : [settings.events]).join(' '), checkValidate);

		if (settings.immediate) checkValidate();
	},
	unbind(el) {
		$(el).tooltip('dispose'); // Remove any attached tooltips (or they get moved to the body element)
	},
};
</directive>

<style>
.editable {
	border: 1px solid transparent;
}

.editable.editing {
	border: 1px solid var(--main);
}
</style>


<component name="debugValidate">
module.exports = {
	route: '/debug/v-validate',
	methods: {
		hasAVowel(val) { // Silly validation function which returns a promise response should the value contain a vowel
			return new Promise(resolve =>
				setTimeout(()=> // Think about this for a while
					resolve(
						/[aeiou]/.test(val) ? true
							: 'Value must contain a vowel'
					)
				, 100)
			);
		},
	},
};
</component>

<template name="debugValidate">
	<div>
		<div class="card">
			<div class="card-header">Validation rule types</div>
			<div class="card-body">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="required: true" v-validate="{rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="regExp: /[a-z]/" v-validate="[{regExp: /[a-z]/, err: 'Must be only lower case a-z'}]"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="[{regExp: /[a-z]/, err: 'Must be only lower case a-z'}]"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="satisfies: hasAVowel" v-validate="{rules: {satisfies: hasAVowel}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{rules: {satisfies: hasAVowel}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="email" class="form-control" placeholder="endpoint /api/users/count?email=:value" v-validate="{rules: {endpoint: '/api/users/count?email=:value'}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="email" class="form-control" v-validate="{rules: {endpoint: '/api/users/count?email=:value'}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="email" class="form-control" placeholder="endpoint /api/users?email=:value with custom payload" v-validate="{rules: {required: true, endpoint: {url: '/api/users?email=:value', expect: []}, err: 'User already exists'}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="email" class="form-control" v-validate="{rules: {required: true, endpoint: {url: '/api/users?email=:value', expect: []}, err: 'User already exists'}}"/&gt;</pre>
					</div>
				</div>
			</div>
		</div>
		<div class="card">
			<div class="card-header">Validation layouts</div>
			<div class="card-body">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="layout: title" v-validate="{immediate: true, layout: 'title', rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{immediate: true, layout: 'title', rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="layout: tooltip" v-validate="{immediate: true, layout: 'tooltip', tooltip: {placement: 'right'}, rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{immediate: true, layout: 'tooltip', tooltip: {placement: 'right'}, rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="layout: help" v-validate="{immediate: true, layout: 'help', rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{immediate: true, layout: 'help', rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
