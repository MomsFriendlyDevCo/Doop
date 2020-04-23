<script>
/**
* Various Bootstrap 4 fixes
*/
app.ready.then(()=> {
	// When a modal gets shown check if there are any input[autofocus] elements we need to focus
	// If nothing is marked with [autofocus] the first (sane) input element is used instead
	$(document).on('shown.bs.modal', ()=> {
		var autoFocusable = $('.modal.show input[autofocus]')

		if (autoFocusable.length) { // Found something to focus
			autoFocusable.first().focus();
		} else { // No auto focus items - find first input (if any) and use that
			var cand = $('.modal.show input[type]')
				.filter((i, el) => ['text', 'email', 'number', 'url'].includes($(el).attr('type')))
				.first()
				cand.focus();
		}
	});
});
</script>
