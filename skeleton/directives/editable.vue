<directive>
/**
* Quick and dirty directive to allow easy editing of inline values similar to how x-editable used to work
*
* @param {Object|function} options The options to process, if this is a function it is assumed to set the `options.handler` function
* @param {string|function} [options.value] The value to display when editing, if omitted the element inner text is used instead. If a function this is called as ($el, options)
* @param {function} [options.handler] Function to call when editing completes, called as (value, $el, options)
* @param {string} [options.classEditing="editing"] CSS class to apply when editing
*
* @example Edit a title
* <h1 v-editable="{handler: v => widget.title = v}"/>
*/
module.exports = {
	bind(el, binding) {
		var $el = $(el);

		var settings = {
			value: ()=> $el.text(),
			handler: _.isFunction(binding.value) ? binding.value : v => {},
			classEditing: 'editing',
			...(_.isObject(binding.value) ? binding.value : null),
		};

		$el
			.addClass('editable')
			.on('click', ()=> {
				// Set text value before we begin if .value is set {{{
				if (settings.value && _.isFunction(settings.value)) {
					$el.text(settings.value($el, settings));
				} else if (settings.value) {
					$el.text(settings.value);
				}
				// }}}

				var events = {
					keypress: e => {
						if (e.which == 13) {
							e.preventDefault();
							e.stopPropagation();
							events.focusout();
						}
					},
					focusout: ()=> {
						$el
							.attr('contenteditable', false)
							.removeClass(settings.classEditing)
							.off('keypress', events.keypress)
							.off('focusout', events.focusout)

						settings.handler($el.text(), $el, settings);
					},
				};

				$el
					.attr('contenteditable', true)
					.addClass(settings.classEditing)
					.focus()
					.on('keypress', events.keypress)
					.on('focusout', events.focusout)

					// Silly hack to select the contenteditable range {{{
					var range = document.createRange();
					range.selectNodeContents($el[0]);
					range.setStart($el[0].firstChild, $el.text().length);
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
					// }}}
			});
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
