<script lang="js" frontend>
import 'bootstrap';
// Doop's theme styles entry point.
// Note: this file handles Bootstrap 5 import + config.
import '/theme/main.scss';

/**
* Various Bootstrap 4 fixes
*/
app.ready.then(()=> {
	// When a modal gets shown check if there are any input[autofocus] elements we need to focus
	// If nothing is marked with [autofocus] the first (sane) input element is used instead
	// Additionally if we find the 'data-autofocus-method' attribute this indicates how we should handle focusing (values are 'focus' (default) and 'select')
	$(document).on('shown.bs.modal', ()=> {
		var autoFocusable = $('.modal.show input[autofocus]')

		if (autoFocusable.length) { // Found something to focus
			if (autoFocusable.data('autofocus-method') == 'select') {
				autoFocusable.first().select();
			} else {
				autoFocusable.first().focus();
			}
		} else { // No auto focus items - find first input (if any) and use that
			var cand = $('.modal.show input[type]')
				.filter((i, el) => ['text', 'email', 'number', 'url'].includes($(el).attr('type')))
				.first()
				cand.focus();
		}
	});

	// When clicking dropdowns close automatically unless it has class `.dropdown-item-no-dismiss`
	$(document).on('mousedown', '.dropdown-item:not(.dropdown-item-no-dismiss)', e =>
		app.vue.$nextTick(()=> // Wait for Vue to settle
			setTimeout(()=> // Add behind timeout so Bootstrap has time to react
				$(e.target).closest('.dropdown-menu').removeClass('show')
			, 100)
		)
	);
});
</script>
