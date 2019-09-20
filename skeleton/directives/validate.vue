<directive>
/**
* Quick and dirty directive to allow simple input validation
*
* @param {Object|array} settings Validation settings or an array of validators
* @param {string} [settings.classInvalid="is-invalid"] Class to apply to the input element when invalid
* @param {string} [settings.classValid=""] Class to apply to the input element when valid
* @param {boolean} [settings.immediate=true] Run the validator immediately as well as waiting for events
* @param {string} [settings.method="title"] How to signal that the field is invalid. ENUM: "title" - set the title (the mouse tooltip) to the error
*
* @param {array} settings.validators Validators to use (implied if settings is an array), validators are evaulated in orer
* @param {string} [settings.validators.err="Invalid"] The error message to display if the validation checks fail
* @param {RegExp} [settings.validators.regExp] Validate a regular expression
* @param {boolean} [settings.required] Validate against whether a field has any value
*
* @example Input must match a RegExp
* <input type="text" class="form-control" v-validate="[{regExp: /[a-z]/, err: 'Must be only lower case a-z'}]"/>
*/
module.exports = {
	bind(el, binding) {
		var $el = $(el);

		var settings = {
			classInvalid: 'is-invalid',
			events: 'blur',
			immediate: true,
			method: 'title',
			validators: Array.isArray(binding.value) ? binding.value // Given only an array
				: binding.value.validators || false,
			...(_.isPlainObject(binding.value) ? binding.value : null),
		};
		if (!settings.validators) throw new Error('No validators passed, v-validate only accepts an array of validators or the `{validators: Array}` structure');

		var doValidate = ()=> {
			var value = $(el).val();

			// Apply validators in order until one fails {{{
			var failedValidate = settings.validators.find(validator => {
				if (validator.regExp && !validator.regExp.test(value)) { // Check against RegExp fail
					return true;
				} else if (validator.required && !value) { // Check against required field but no value
					return true;
				} else { // Everything ok
					return false;
				}
			});
			// }}}

			// Apply failed / valid classes {{{
			if (failedValidate) {
				$el.addClass(settings.classInvalid).removeClass(settings.classValid);
			} else {
				$el.addClass(settings.classValid).removeClass(settings.classInvalid);
			}
			// }}}

			// Handle invalid notification methods {{{
			switch(settings.method) {
				case 'title':
					if (failedValidate) {
						$el.attr('title', failedValidate.err);
					} else {
						$el.removeAttr('title');
					}
					break;
			}
			// }}}
		};

		// Bind to all events in settings.events
		$(el).on((Array.isArray(settings.events) ? settings.events : [settings.events]).join(' '), doValidate);

		if (settings.immediate) doValidate();
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
