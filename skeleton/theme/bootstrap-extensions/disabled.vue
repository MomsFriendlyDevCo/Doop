<style>
/**
* Hierarchically disable all functionality below this element
* This can be overridden on a per-field basis by applying the 'never-disable' class
*
* @example
* <form class="disabled">
*   Everything below here should be uneditable
* </form>
*/
.disabled .card-actions {
	display: none;
}

.disabled input.form-control:not(.never-disable),
.disabled textarea.form-control:not(.never-disable),
input.form-control.disabled,
textarea.form-control.disabled {
	pointer-events: none;
	border: none;
	background: none;
}

.disabled .input-group:not(.never-disable) .input-group-text {
	background: none;
	border: none;
}
</style>
