<script lang="js" frontend>
/**
* Quick and dirty directive to allow easy editing of inline values similar to how x-editable used to work
*
* @param {Object|function} options The options to process, if this is a function it is assumed to set the `options.handler` function
* @param {string|function} [options.value] The value to display when editing, if omitted the element inner text is used instead. If a function this is called as ($el, options)
* @param {function} [options.handler] Function to call when editing completes, called as (value, $el, options)
* @param {function} [options.preEdit] Function to call as `(value)` before editing, can return the actual value that the user can edit
* @param {function} [options.postEdit] Function to call as `(value)` before exiting edit mode, can be used to mangle user provided value back into stored value
* @param {string} [options.filter] Optional Vue filter to apply before rendering the edited value, filters can be applied to the view contents without issue but this is needed to re-render them
* @param {string} [options.classEditing="editing"] CSS class to apply when editing
*
* @example Edit a title
* <h1 v-editable="{handler: v => widget.title = v}"/>
*/
app.directive('v-editable', {
	bind(el, binding) {
		var $el = $(el);

		var settings = {
			value: ()=> $el.text(),
			handler: _.isFunction(binding.value) ? binding.value : v => {},
			preEdit: v => v,
			postEdit: v => v,
			classEditing: 'editing',
			filter: '',
			...(_.isObject(binding.value) ? binding.value : null),
		};

		$el
			.addClass('editable')
			.on('click', ()=> {
				// Set text value before we begin if .value is set {{{
				if (settings.value && _.isFunction(settings.value)) {
					$el.text(settings.value($el, settings) |> settings.preEdit);
				} else if (settings.value) {
					$el.text(settings.value |> settings.preEdit);
				}
				// }}}

				var events = {
					keypress: e => {
						if (e.which == 13) { //~ Return key - accept changes and exit
							e.preventDefault();
							e.stopPropagation();
							events.focusout();
						}
					},
					isEnding: false,
					focusout: ()=> {
						// Constrain this function to oonly work once (fix for some browsers that fires focusout zelously)
						if (events.isEnding) return;
						events.isEnding = true;

						$el
							.removeAttr('contenteditable')
							.removeClass(settings.classEditing)
							.off('keypress', events.keypress)
							.off('focusout', events.focusout)

						var newText = _.trim($el.text()) |> settings.postEdit;
						Promise.resolve(settings.handler(newText, $el, settings))
							.then(()=> settings.value = newText) // Update value to new text if we didn't throw
							.then(()=> { // Optionally apply filter to output
								if (!settings.filter) return;
								$el.text(newText |> app.filter(settings.filter));
							})
					},
				};

				// Binnd all our properties
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
});
</script>

<style>
.editable {
	border: 1px solid transparent;
	cursor: pointer;
}

.editable.editing {
	border: 1px solid var(--main);
}
</style>
