<script>
/**
* Various Bootstrap 4 fixes
*/
app.ready.then(()=> {
	// When a modal gets shown check if there are any input[autofocus] elements we need to focus
	$(document).on('shown.bs.modal', ()=> {
		$('.modal.shown input[autofocus]').focus();
	});
});
</script>
